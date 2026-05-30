// ==========================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN COMÚN (Para los 4 mapas)
// ==========================================================================
const esquinaSuroeste = L.latLng([10.614291045886088, -66.74899288309359]); // Un poco antes de la costa oeste
const esquinaNoreste = L.latLng([10.626853913590706, -66.73838965971663]); // Un poco pasado el este del club

// Enlazamos ambas esquinas en un objeto de límites
const limitesPermitidos = L.latLngBounds(esquinaSuroeste, esquinaNoreste);

// 2. Inicializamos el mapa aplicando todas las restricciones juntas
const map = L.map('map', {
    center: [10.6205, -66.6115], // Punto de inicio (Lat, Lng)
    zoom: 17,                     // Zoom inicial
    minZoom: 17,                  // Máximo alejamiento permitido (No verá el mundo)
    maxZoom: 19,                  // Máximo acercamiento permitido
    maxBounds: limitesPermitidos, // Restricción física de movimiento
    maxBoundsViscosity: 1.0,       // 1.0 significa "muro duro" (no deja pasar la pantalla)
    zoomControl: false,
    attributionControl: false
});

map.on('click', function () {
    const sidebar = document.getElementById('leftSidebar');
    // Si el sidebar tiene la clase 'open', significa que está desplegado; procedemos a removerla
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// 2. Añadimos el control de zoom manualmente en el lado derecho (topright)
L.control.zoom({
    position: 'topright' // Mueve los botones [+] y [-] a la derecha
}).addTo(map);

// 3. Agregar la capa base de mapa (OpenStreetMap) como ya lo tenías
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Variables de Estado en Memoria
let currentAvailableSeats = 9;
let activeStationId = null;
let nextStationId = 7;
let isCreatingStation = false;
let stationToDeleteId = null;
let tempStationData = 0;
// Gestión de Horarios
let serviceStartTime = "07:00";
let serviceEndTime = "22:00";
// para validar los mensajes de cola
let estadoColaUsuario = null;
let userWaitingStationId = null;
// Variable global para el marcador del trencito
let trencitoMarker = null;

// Definición del icono personalizado con un SVG de un tren/vagón
const trenIconoPersonalizado = L.divIcon({
    className: 'custom-train-marker', // Clase limpia para Leaflet
    html: `
        <div class="train-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="3" width="16" height="14" rx="2"></rect>
                <path d="M4 11h16"></path>
                <path d="M12 3v8"></path>
                <path d="M8 17l-2 4"></path>
                <path d="M16 17l2 4"></path>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20] // Centrado exacto sobre la coordenada
});

// Diccionario de almacenamiento para las referencias de marcadores físicos de Leaflet
let leafletMarkers = {};

// Base de Datos en Memoria con coordenadas geográficas reales del club
let stationData = {};

async function fetchInitialData() {
    try {
        const usuarioStr = sessionStorage.getItem('usuarioLogueado');
        if (usuarioStr) {
            const usuario = JSON.parse(usuarioStr);
            const checkRes = await fetch(`http://localhost:8080/api/v1/socio-estacion/socio/${usuario.id}/`);
            if (checkRes.ok) {
                const data = await checkRes.json();
                if (data && data.estacion) {
                    userWaitingStationId = data.estacion.id;
                }
            }
        }

        const estRes = await fetch('http://localhost:8080/api/v1/estaciones/');
        if (estRes.ok) {
            const estaciones = await estRes.json();
            estaciones.forEach(est => {
                stationData[est.id] = {
                    name: est.nombre,
                    wait: est.contador,
                    coords: [est.latitude, est.longitude]
                };
                createStationMarker(est.id, stationData[est.id]);
            });
            nextStationId = Math.max(...estaciones.map(e => e.id), 0) + 1;
        }

        const trenRes = await fetch('http://localhost:8080/api/v1/tren/');
        if (trenRes.ok) {
            const data = await trenRes.json();
            currentAvailableSeats = data;
            const sc = document.getElementById('seatsCounter');
            if (sc) sc.innerText = currentAvailableSeats;
        }


    } catch (err) {
        console.error('Error al inicializar datos:', err);
    }
}

// 3. Función para renderizar un Pin interactivo usando los estilos nativos de tu CSS
const tieneSidebar = document.getElementById('leftSidebar') !== null;

function createStationMarker(id, data) {
    const customDiv = document.createElement('div');
    customDiv.className = 'station-marker-leaflet';

    // REGLA DE NEGOCIO: La burbuja solo se muestra si tieneSidebar es verdadero (Admin/Operador) y hay gente en cola
    const mostrarNumeroCola = tieneSidebar && data.wait > 0;

    customDiv.innerHTML = `
        <div class="marker-container">
            <div class="gps-pin pin-blue"></div>
            <div class="user-waiting-indicator" id="user-indicator-${id}" style="display: ${userWaitingStationId === id ? 'block' : 'none'};"></div>
            <div class="badge" id="badge-${id}" style="display: ${mostrarNumeroCola ? 'flex' : 'none'};">
                <span id="badge-text-${id}">${data.wait}</span>
            </div>
            <div class="tooltip">${data.name}</div>
        </div>
    `;

    // Disparador del Modal al hacer click en el marcador (Mantiene intacta tu lógica original)
    customDiv.onclick = (e) => {
        e.stopPropagation();
        if (isCreatingStation) return;
        openStation(id, data.name, data.wait);
    };

    // Creación del DivIcon personalizado de Leaflet
    const customIcon = L.divIcon({
        html: customDiv,
        className: '',
        iconSize: [30, 40]
    });

    const marker = L.marker(data.coords, { icon: customIcon }).addTo(map);

    // Almacenamos la referencia del marcador
    leafletMarkers[id] = marker;
}

// ====== WEBSOCKET CONNECTION ====== //
let stompClient = null;

function connectWebSocket() {
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.warn("Librerías WebSocket no cargadas, reintentando...");
        setTimeout(connectWebSocket, 1000);
        return;
    }

    const socket = new SockJS('http://localhost:8080/ws-tpa');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        console.log('✅ Conectado a WebSockets (Estaciones, Tren y GPS)');

        stompClient.subscribe('/topic/estaciones', function (message) {
            const data = JSON.parse(message.body);
            const id = data.estacionId;
            const nuevoContador = data.contador;

            if (stationData[id]) {
                stationData[id].wait = nuevoContador;
                sincronizarBadgeMapa(id);

                if (activeStationId === id) {
                    updateStationModalDisplay();
                }
            }
        });

        stompClient.subscribe('/topic/tren', function (message) {
            const data = JSON.parse(message.body);
            console.log("puestos: ", data.puestos);
            currentAvailableSeats = data.puestos;

            const sc = document.getElementById('seatsCounter');
            if (sc) sc.innerText = currentAvailableSeats;
        });

        stompClient.subscribe('/topic/trencito/posicion', function (message) {
            const data = JSON.parse(message.body);
            console.log("gps: ", data);
            actualizarPosicionTren(data);
        });

    }, function (error) {
        console.error('Error WebSocket, reconectando...', error);
        setTimeout(connectWebSocket, 5000);
    });
}

connectWebSocket();

// 4. Animación del Trencito simulando un recorrido en tiempo real
const trainIcon = L.divIcon({
    html: '<div style="font-size: 26px; transform: translate(-13px, -13px); cursor: pointer;">🚂</div>',
    className: ''
});

let trainMarker = L.marker([10.6205, -66.6115], { icon: trainIcon }).addTo(map);
let angle = 0;

setInterval(() => {
    angle += 0.02;
    // Genera un recorrido orbital simulado alrededor de las inmediaciones
    const newLat = 10.6205 + Math.sin(angle) * 0.001;
    const newLng = -66.6115 + Math.cos(angle) * 0.0018;
    trainMarker.setLatLng([newLat, newLng]);
}, 100);

// ====== GESTIÓN DE EVENTOS DE MAPA (Captura de Coordenadas de Nuevas Estaciones) ====== //
map.on('click', async function (event) {
    if (!isCreatingStation) return;

    const latlng = event.latlng;
    const name = document.getElementById('newStationNameInput').value.trim();

    try {
        const payload = { nombre: name, latitude: latlng.lat, longitude: latlng.lng };
        const res = await fetch('http://localhost:8080/api/v1/estaciones/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al crear estación');

        const newEst = await res.json();
        const newId = String(newEst.id);

        stationData[newId] = { name: newEst.nombre, wait: 0, coords: [newEst.latitude, newEst.longitude] };
        createStationMarker(newId, stationData[newId]);
    } catch (err) {
        console.error(err);
        alert("No se pudo crear la estación en el servidor");
    }

    // Restaurar estado del puntero
    isCreatingStation = false;
    document.getElementById('map').style.cursor = '';
});

// ====== CONTROLADORES DE MODALES Y LOGICA GENERAL ====== //
function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'flex' : 'none';
}

function toggleSidebar() {
    document.getElementById('leftSidebar').classList.toggle('open');
}

function openServiceModal() {
    document.getElementById('serviceStartInput').value = serviceStartTime;
    document.getElementById('serviceEndInput').value = serviceEndTime;

    document.getElementById('serviceErrorMsg').style.display = 'none';

    const sidebar = document.getElementById('leftSidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }

    toggleModal('serviceModal', true);
}

function validateTimeInput(input) {
    const prevLen = input._prevLen || 0;
    let val = input.value.replace(/[^0-9:]/g, '');
    // Only auto-insert colon when typing forward (not deleting)
    if (val.length === 2 && !val.includes(':') && val.length > prevLen) {
        val = val + ':';
    }
    if (val.length > 5) val = val.substring(0, 5);
    input.value = val;
    input._prevLen = val.length;
}

async function confirmServiceHours() {
    let startVal = document.getElementById('serviceStartInput').value.trim();
    let endVal = document.getElementById('serviceEndInput').value.trim();
    const errorMsg = document.getElementById('serviceErrorMsg');

    // Zero-pad single-digit hours (e.g. "7:00" -> "07:00")
    const shortTimeRegex = /^(\d):([0-5]\d)$/;
    if (shortTimeRegex.test(startVal)) startVal = '0' + startVal;
    if (shortTimeRegex.test(endVal)) endVal = '0' + endVal;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startVal) || !timeRegex.test(endVal)) {
        errorMsg.style.display = "block";
        return;
    }

    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);
    if ((startH * 60 + startM) > (endH * 60 + endM)) {
        errorMsg.style.display = "block";
        return;
    }

    try {
        const payload = { horaDesde: startVal, horaHasta: endVal };
        const res = await fetch('http://localhost:8080/api/v1/disponibilidad/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Error al actualizar disponibilidad');

        errorMsg.style.display = "none";
        serviceStartTime = startVal;
        serviceEndTime = endVal;
        toggleModal('serviceModal', false);
    } catch (err) {
        console.error(err);
        alert("No se pudo actualizar la disponibilidad en el servidor");
    }
}

// ====== GESTIÓN DE ASIENTOS LIBRES DEL TREN (ACTUALIZADO CON MODAL DE INTERFAZ) ====== //
let tempSeatsCount = 9;
const MAX_TRAIN_SEATS = 20;

function openPuestosModal() {
    tempSeatsCount = currentAvailableSeats;

    const inputElement = document.getElementById('puestosTempInput');
    if (inputElement) {
        inputElement.value = tempSeatsCount;
    }

    checkSeatsChanges();

    const sidebar = document.getElementById('leftSidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }

    toggleModal('puestosModal', true);
}

function validateSeatsInput(input) {
    let valStr = input.value.replace(/[^0-9]/g, '');

    if (valStr === '') {
        tempSeatsCount = 0;
        input.value = '';
    } else {
        let valNum = parseInt(valStr, 10);
        if (valNum > MAX_TRAIN_SEATS) {
            valNum = MAX_TRAIN_SEATS;
        }
        tempSeatsCount = valNum;
        input.value = tempSeatsCount;
    }
    checkSeatsChanges();
}

function alterTempSeats(amount) {
    const inputElement = document.getElementById('puestosTempInput');
    if (!inputElement) return;

    let currentVal = parseInt(inputElement.value, 10) || 0;
    let newVal = currentVal + amount;

    if (newVal < 0) newVal = 0;
    if (newVal > MAX_TRAIN_SEATS) newVal = MAX_TRAIN_SEATS;

    tempSeatsCount = newVal;
    inputElement.value = tempSeatsCount;

    checkSeatsChanges();
}

function checkSeatsChanges() {
    const btnConfirm = document.getElementById('btnConfirmSeats');
    if (!btnConfirm) return;

    // Si el número temporal es igual al que está guardado en el mapa base, se congela el botón
    if (tempSeatsCount === currentAvailableSeats) {
        btnConfirm.disabled = true;
    } else {
        btnConfirm.disabled = false;
    }
}

async function confirmSeatsChanges() {
    const inputElement = document.getElementById('puestosTempInput');
    if (inputElement && inputElement.value === '') {
        tempSeatsCount = 0;
        inputElement.value = 0;
    }

    try {
        const res = await fetch('http://localhost:8080/api/v1/tren/', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ puestos: tempSeatsCount })
        });
        if (!res.ok) throw new Error('Error al actualizar puestos');

        currentAvailableSeats = tempSeatsCount;
        document.getElementById('seatsCounter').innerText = currentAvailableSeats;
        toggleModal('puestosModal', false);
    } catch (err) {
        console.error(err);
        alert("No se pudieron actualizar los puestos en el servidor");
    }
}

// Manejo del botón cancelar abriendo el modal integrado en la interfaz
function handleCancelSeats() {
    if (tempSeatsCount !== currentAvailableSeats) {
        // En lugar de confirm() de JavaScript, abrimos el modal diseñado
        toggleModal('puestosConfirmExitModal', true);
    } else {
        // Si no se tocó nada, cerramos la ventana directamente sin advertencias
        toggleModal('puestosModal', false);
    }
}

// Ejecutada solo si el usuario decide "Salir" del modal de advertencia
function forceExitSeats() {
    toggleModal('puestosConfirmExitModal', false); // Ocultamos la advertencia
    toggleModal('puestosModal', false);            // Ocultamos la edición de puestos
}

// Gestión de Colas Internas por Estación
function openStation(id, name, count) {
    if (isCreatingStation) return;
    activeStationId = id;
    tempStationData = stationData[id].wait;
    document.getElementById('modalStationName').innerText = name;
    const elementoContador = document.getElementById('modalWaitingCount');
    if (elementoContador) {
        elementoContador.innerText = tempStationData;
    }
    toggleModal('stationModal', true);
}

function alterTempQueue(amount) {
    if (!activeStationId) return;
    tempStationData = Math.max(0, tempStationData + amount);
    document.getElementById('modalWaitingCount').innerText = tempStationData;
}

function confirmQueueChanges() {
    if (!activeStationId) return;
    stationData[activeStationId].wait = tempStationData;

    // Actualizar dinámicamente el badge en el mapa de Leaflet
    const badge = document.getElementById(`badge-${activeStationId}`);
    if (badge) {
        badge.innerText = tempStationData;
        badge.style.display = tempStationData > 0 ? 'flex' : 'none';
    }

    toggleModal('stationModal', false);
}

// Flujo para habilitar la creación de estaciones
function openCreateStationModal() {
    document.getElementById('newStationNameInput').value = '';
    document.getElementById('createStationErrorMsg').style.display = 'none';
    toggleModal('createStationModal', true);
}

function startCreateStation() {
    const name = document.getElementById('newStationNameInput').value.trim();

    if (!name) {
        alert("Por favor ingrese un nombre para la estación.");
        return;
    }

    const nameExists = Object.values(stationData).some(s => s.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
        alert("Ya existe una estación con el mismo nombre");
        return;
    }

    toggleModal('createStationModal', false);
    isCreatingStation = true;
    document.getElementById('map').style.cursor = 'crosshair';
}

// Flujo para eliminación de estaciones
function openDeleteStationModal() {
    const listContainer = document.getElementById('deleteStationList');
    listContainer.innerHTML = '';
    stationToDeleteId = null;

    for (const [id, data] of Object.entries(stationData)) {
        const btn = document.createElement('button');
        btn.className = 'btn-station-item';
        btn.innerText = data.name;
        btn.onclick = () => selectStationToDelete(id, btn);
        listContainer.appendChild(btn);
    }
    toggleModal('deleteStationModal', true);
}

function selectStationToDelete(id, btnElement) {
    stationToDeleteId = id;
    const buttons = document.getElementById('deleteStationList').querySelectorAll('.btn-station-item');
    buttons.forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
}

async function confirmDeleteStation() {
    if (!stationToDeleteId) {
        alert("Seleccione una estación para borrar.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/v1/estaciones/${stationToDeleteId}/`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Error al eliminar estación');

        // 1. Desvincular y remover el marcador gráfico de Leaflet
        if (leafletMarkers[stationToDeleteId]) {
            map.removeLayer(leafletMarkers[stationToDeleteId]);
            delete leafletMarkers[stationToDeleteId];
        }

        // 2. Limpiar base de datos interna
        delete stationData[stationToDeleteId];

        toggleModal('deleteStationModal', false);
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar la estación del servidor");
    }
}

// ====== GESTIÓN DE CONSULTA DE DISPONIBILIDAD (NUEVO) ====== //
async function openStatusModal() {
    // 1. Capturamos el contenedor del mensaje en el modal
    const messageElement = document.getElementById('statusModalMessage');

    try {

        const response = await fetch('http://localhost:8080/api/v1/disponibilidad/');
        if (response.ok) {
            const data = await response.json();
            // Actualizamos las variables globales, asegurando el formato HH:mm
            console.log(data);
            if (data.desde) serviceStartTime = data.desde.substring(0, 5);
            if (data.hasta) serviceEndTime = data.hasta.substring(0, 5);
        } else {
            console.warn('No se pudo cargar la disponibilidad, usando valores locales');
        }
    } catch (error) {
        console.error('Error buscando disponibilidad:', error);
    }

    console.log("servicio desde:", serviceStartTime);
    console.log("servicio hasta:", serviceEndTime);

    // 2. Inyectamos las variables dinámicas de hora de inicio y fin
    messageElement.innerHTML = `El trencito estará prestando su servicio desde las <strong>${serviceStartTime}</strong> hasta las <strong>${serviceEndTime}</strong>.`;

    // 3. Abrimos el modal usando la función reutilizable toggleModal
    toggleModal('statusModal', true);
}

// ====== GESTIÓN DE COLAS INTERNAS POR ESTACIÓN (ACTUALIZADO) ====== //
function openStation(id, name, count) {
    if (isCreatingStation) return;
    activeStationId = id;

    document.getElementById('modalStationName').innerText = name;
    updateStationModalDisplay();

    toggleModal('stationModal', true);
}

// Actualiza los textos informativos dentro del modal reflejando el estado real
function updateStationModalDisplay() {
    if (!activeStationId) return;
    const currentWait = stationData[activeStationId].wait;

    // Capturamos el elemento de forma segura
    const waitingCountEl = document.getElementById('modalWaitingCount');

    // Muro protector: Solo inyectamos el texto si el elemento existe en el HTML actual
    if (waitingCountEl) {
        waitingCountEl.innerText = `${currentWait} ${currentWait === 1 ? 'persona' : 'personas'}`;
    }
}

// Modifica la cola (Normal o Prioridad) e impacta directo al mapa físico de Leaflet
function alterStationQueue(amount, isPriority = false) {
    if (!activeStationId) return;

    // 1. Obtener y calcular el nuevo estado de la cola
    let currentWait = stationData[activeStationId].wait;
    let newWait = Math.max(0, currentWait + amount);

    stationData[activeStationId].wait = newWait;

    // 2. Controlar la notificación estética especial de prioridad
    if (isPriority && amount > 0) {
        console.log(`Pasajero prioritario añadido a la estación: ${stationData[activeStationId].name}`);
    }

    // 3. Sincronización inmediata con el badge del mapa aplicando el filtro de rol
    const badge = document.getElementById(`badge-${activeStationId}`);
    if (badge) {
        badge.innerText = newWait;
        // REGLA: Solo se muestra si el usuario tiene barra lateral (Admin/Operador) y hay gente en cola
        badge.style.display = (tieneSidebar && newWait > 0) ? 'flex' : 'none';
    }

    // 4. Actualizar los textos informativos del modal abierto
    updateStationModalDisplay();
}

// 1. Añadirse a la cola NORMAL
async function unirseAColaVirtual() {
    if (!activeStationId) return;

    const usuarioStr = sessionStorage.getItem('usuarioLogueado');
    if (!usuarioStr) {
        alert("Debe iniciar sesión primero");
        window.location.href = 'index.html';
        return;
    }
    const usuario = JSON.parse(usuarioStr);

    if (estadoColaUsuario !== null) {
        abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
        return;
    }

    try {
        const payload = { socioId: usuario.id, estacionId: parseInt(activeStationId) };
        const res = await fetch('http://localhost:8080/api/v1/socio-estacion/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status === 409) {
            abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
            return;
        }
        if (!res.ok) throw new Error('Error al unirse a la cola');

        stationData[activeStationId].wait += 1;
        estadoColaUsuario = 'normal';
        userWaitingStationId = activeStationId;

        sincronizarBadgeMapa(activeStationId);
        updateStationModalDisplay();

        abrirMensajeCola("Agregado a la cola, el trencito pasará por ti en un momento");
    } catch (err) {
        console.error(err);
        alert("No se pudo unir a la cola en el servidor");
    }
}

// 2. NUEVO: Añadirse a la cola con PRIORIDAD (VIP)
async function unirseAColaPrioridad() {
    if (!activeStationId) return;

    const usuarioStr = sessionStorage.getItem('usuarioLogueado');
    if (!usuarioStr) {
        alert("Debe iniciar sesión primero");
        window.location.href = 'index.html';
        return;
    }
    const usuario = JSON.parse(usuarioStr);

    if (estadoColaUsuario !== null) {
        abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
        return;
    }

    try {
        const payload = { socioId: usuario.id, estacionId: parseInt(activeStationId) };
        const res = await fetch('http://localhost:8080/api/v1/socio-estacion/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status === 405) {
            abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
            return;
        }
        if (!res.ok) throw new Error('Error al unirse a la cola VIP');

        stationData[activeStationId].wait += 1;
        estadoColaUsuario = 'prioridad';
        userWaitingStationId = activeStationId;

        console.log(`Pasajero prioritario añadido a la estación: ${stationData[activeStationId].name}`);

        sincronizarBadgeMapa(activeStationId);
        updateStationModalDisplay();

        abrirMensajeCola("Agregado a la cola con prioridad, el trencito pasará por ti en un momento");
    } catch (err) {
        console.error(err);
        alert("No se pudo unir a la cola VIP en el servidor");
    }
}

// 3. Eliminarse de la cola (Soporta ambos tipos)
async function eliminarseDeColaVirtual() {
    // if (!activeStationId) return;

    const usuarioStr = sessionStorage.getItem('usuarioLogueado');
    if (!usuarioStr) {
        alert("Debe iniciar sesión primero");
        window.location.href = 'index.html';
        return;
    }
    const usuario = JSON.parse(usuarioStr);

    try {
        const checkRes = await fetch(`http://localhost:8080/api/v1/socio-estacion/socio/${usuario.id}/`);
        if (checkRes.status === 404) {
            abrirMensajeCola("No estás actualmente en ninguna cola.");
            return;
        }
        if (!checkRes.ok) throw new Error('Error al verificar la cola actual');

        const data = await checkRes.json();
        if (!data || !data.estacion) {
            abrirMensajeCola("No estás actualmente en ninguna cola.");
            return;
        }

        if (data.estacion.id != activeStationId) {
            abrirMensajeCola("No puedes salirte de esta cola, porque estás esperando en otra estación.");
            return;
        }

        const res = await fetch(`http://localhost:8080/api/v1/socio-estacion/socio/${usuario.id}/desasignar/`, {
            method: 'PUT'
        });

        if (res.status === 404) {
            abrirMensajeCola("No estás actualmente en ninguna cola.");
            return;
        }

        if (!res.ok) throw new Error('Error al salir de la cola.');

        let currentWait = stationData[activeStationId].wait;
        stationData[activeStationId].wait = Math.max(0, currentWait - 1);

        estadoColaUsuario = null;
        userWaitingStationId = null;

        sincronizarBadgeMapa(activeStationId);
        updateStationModalDisplay();

        abrirMensajeCola("Te has eliminado de la cola exitosamente. Ya no estás en la fila virtual.");
    } catch (err) {
        console.error(err);
        alert("No se pudo salir de la cola en el servidor.");
    }
}

// Función auxiliar para no repetir código de actualización del mapa
function sincronizarBadgeMapa(id) {
    // Sincroniza número en el badge redondo
    const badgeText = document.getElementById(`badge-text-${id}`);
    if (badgeText) {
        badgeText.innerText = stationData[id].wait;
    }
    const badge = document.getElementById(`badge-${id}`);
    if (badge) {
        badge.style.display = (tieneSidebar && stationData[id].wait > 0) ? 'flex' : 'none';
    }
    const userIndicator = document.getElementById(`user-indicator-${id}`);
    if (userIndicator) {
        userIndicator.style.display = (userWaitingStationId === id) ? 'block' : 'none';
    }

    // BUSCA EL CONTENEDOR DEL PIN DE LEAFLET E INYECTA LA ANIMACIÓN
    // Buscamos el elemento HTML del marcador a través del ID generado dinámicamente en tu bucle de inicialización
    const markerElement = document.querySelector(`.station-node[data-id="${id}"] .marker-container, #marker-container-${id}`);

    // Si no tiene id directo, podemos buscarlo por el envoltorio interno de tu marcador personalizado:
    const fallbackElement = badge ? badge.closest('.marker-container') : null;
    const targetContainer = markerElement || fallbackElement;

    if (targetContainer) {
        if (stationData[id].isVIPActive) {
            targetContainer.classList.add('vip-active'); // Enciende el pulso dorado
        } else {
            targetContainer.classList.remove('vip-active'); // Apaga el pulso dorado
        }
    }
}

// Funciones de soporte para controlar el nuevo Modal de Mensajes/Alertas
function abrirMensajeCola(mensaje) {
    // Cerramos el modal de la estación actual para limpiar la vista
    toggleModal('stationModal', false);

    // Inyectamos el texto dinámico en el nuevo modal de respuestas
    document.getElementById('mensajeColaTexto').innerText = mensaje;

    // Desplegamos el modal de respuesta
    toggleModal('mensajeColaModal', true);
}

function presionarOKCola() {
    // Cierra el modal de respuesta (Diagrama: Presiona OK -> Regresa a la vista del mapa)
    toggleModal('mensajeColaModal', false);
}

// Vacía la cola por completo de forma directa
function resetStationQueue() {
    if (!activeStationId) return;

    stationData[activeStationId].wait = 0;

    const badge = document.getElementById(`badge-${activeStationId}`);
    if (badge) {
        badge.innerText = 0;
        badge.style.display = 'none';
    }

    updateStationModalDisplay();
}

// Calcula el tiempo estimado: Asumimos una métrica lógica de 5 minutos base por cada persona en cola
function showEstimatedTime() {
    if (!activeStationId) return;

    const people = stationData[activeStationId].wait;
    const minutesPerPerson = 5; // Métrica base configurable de espera por parada
    const totalEstimatedMinutes = people * minutesPerPerson;

    if (totalEstimatedMinutes === 0) {
        alert(`⏱️ Tiempo estimado: No hay demora. La plataforma de la estación "${stationData[activeStationId].name}" está despejada.`);
    } else {
        alert(`⏱️ Tiempo estimado para la estación "${stationData[activeStationId].name}": Aproximadamente ${totalEstimatedMinutes} minutos de espera (${people} personas en fila).`);
    }
}

// ==========================================================================
// VALIDACIÓN DE HORARIO DE SERVICIO Y REDIRECCIÓN (Cierre de Servicio)
// ==========================================================================

// Función para convertir un string "HH:MM" a minutos totales desde la medianoche
function tiempoEnMinutos(horaString) {
    const [horas, minutos] = horaString.split(':').map(Number);
    return (horas * 60) + minutos;
}

// Función principal que valida si el servicio está activo en el momento actual
async function verificarHorarioServicio() {
    try {
        const dispRes = await fetch('http://localhost:8080/api/v1/disponibilidad/');
        if (dispRes.ok) {
            const data = await dispRes.json();
            if (data && data.desde && data.hasta) {
                serviceStartTime = data.desde.substring(0, 5);
                serviceEndTime = data.hasta.substring(0, 5);
            }
        }
    } catch (error) {
        console.error('Error al obtener la disponibilidad:', error);
        serviceStartTime = "07:00";
        serviceEndTime = "22:00";
    }

    const ahora = new Date();
    // Formateamos la hora actual en formato HH:MM (usando formato de 24 horas)
    const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    const minutosActual = tiempoEnMinutos(horaActualStr);
    const minutosInicio = tiempoEnMinutos(serviceStartTime);
    const minutosFin = tiempoEnMinutos(serviceEndTime);

    // CONDICIONAL: Si la hora actual está fuera del rango permitido
    if (minutosActual < minutosInicio || minutosActual > minutosFin) {
        // Inyectamos el texto de advertencia dinámico con el horario del club
        const mensajeTexto = `El servicio de trencito se encuentra cerrado en este momento. El horario de atención es de ${serviceStartTime} a ${serviceEndTime}.`;
        document.getElementById('mensajeCierreTexto').innerText = mensajeTexto;

        // Desplegamos el modal de bloqueo del servicio
        toggleModal('cierreServicioModal', true);
        return false;
    }
    return true;
}

// Función que ejecuta el botón "Confirmar" del modal para sacar al usuario
function redirigirAInicioSesion() {
    window.location.href = 'index.html';
}

// EJECUCIÓN AUTOMÁTICA: Valida el horario inmediatamente al cargar la pantalla
window.addEventListener('DOMContentLoaded', async () => {
    await fetchInitialData();

    await verificarHorarioServicio();

    // Opcional: Si quieres re-verificar el horario cada 1 minuto de forma reactiva
    //setInterval(verificarHorarioServicio, 60000);

    // Simulación de prueba a los 3 segundos de cargar la página
    // setTimeout(() => {
    //     actualizarPosicionTren({
    //         "id": 1,
    //         "latitude": 10.6205,  // Usa una coordenada dentro de los límites permitidos de Puerto Azul
    //         "longitude": -66.7415,
    //         "speed": 13.0,
    //         "timestamp": "2026-05-25T23:58:00.206789"
    //     });
    // }, 3000);
});

// ==========================================================================
// CONTROL DE GESTIÓN DE LOGOUT (Solo manejo de Ventana/Modal)
// ==========================================================================
/**
 * Muestra u oculta el modal de confirmación de cierre de sesión
 * @param {boolean} show - true para mostrar, false para ocultar
 */
function toggleLogoutModal(show) {
    const modalOverlay = document.querySelector('.logout-modal');
    const appScreen = document.querySelector('.app-screen'); // Contenedor principal
    const mapArea = document.getElementById('map');          // El área del mapa

    if (modalOverlay) {
        if (show) {
            modalOverlay.style.display = 'flex';
            // Opcional: Si deseas desenfoque SOLO al abrir, se añadiría aquí
        } else {
            modalOverlay.style.display = 'none';

            // Forzamos la remoción de cualquier clase de desenfoque residual en los contenedores
            if (appScreen) appScreen.classList.remove('blur-effect');
            if (mapArea) mapArea.classList.remove('blur-effect');

            console.log('🔄 Regreso al mapa limpio y sin desenfoque.');
        }
    }
}

// Escuchador de eventos para inicializar el botón "Salir" del HTML
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            toggleLogoutModal(true);
        };
    }
});

// ==========================================================================
// GESTOR COORDENADAS DEL GPS PARA EL TRENCITO
// ==========================================================================
/**
/**
 * Actualiza la posición del trencito en el mapa basándose en el JSON del backend.
 * @param {Object} data - El objeto JSON recibido del servidor.
 */
function actualizarPosicionTren(data) {
    // 1. Forzar conversión a flotante y asegurar que los nombres de los campos coincidan
    const lat = parseFloat(data.latitude || data.lat);
    const lng = parseFloat(data.longitude || data.lng);

    // CORRECCIÓN: Validación limpia de números reales
    if (isNaN(lat) || isNaN(lng)) {
        console.warn("⚠️ Las coordenadas recibidas no son números válidos:", data);
        return;
    }

    const nuevaCoordenada = [lat, lng];

    // 2. Condicional de renderizado en Leaflet
    if (!trencitoMarker) {
        // Si no existe, se crea con el icono SVG personalizado
        trencitoMarker = L.marker(nuevaCoordenada, { icon: trenIconoPersonalizado }).addTo(map);
        console.log("🚂 Marcador del trencito creado por primera vez en:", nuevaCoordenada);
    } else {
        // Si ya existe, se mueve suavemente con la transición CSS
        trencitoMarker.setLatLng(nuevaCoordenada);
        console.log(`🚂 Posición del trencito actualizada: Lat ${lat}, Lng ${lng}`);
    }

    // OPCIONAL: Descomenta la línea de abajo si quieres que la cámara del mapa 
    // siga automáticamente al tren cada vez que se mueva:
    // map.panTo(nuevaCoordenada);
}


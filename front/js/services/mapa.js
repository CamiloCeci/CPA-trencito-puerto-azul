// ==========================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN COMÚN (Para los 4 mapas)
// ==========================================================================
const esquinaSuroeste = L.latLng([10.614291045886088, -66.74899288309359]); // Un poco antes de la costa oeste
const esquinaNoreste  = L.latLng([10.626853913590706, -66.73838965971663]); // Un poco pasado el este del club

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

map.on('click', function() {
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

// Diccionario de almacenamiento para las referencias de marcadores físicos de Leaflet
let leafletMarkers = {};

// Base de Datos en Memoria con coordenadas geográficas reales del club
let stationData = {
    '1': { name: 'Zona naútica', wait: 5, status: "active", isVIPActive: false, coords: [10.62267341141378, -66.7461568582826] },
    '2': { name: 'Santa Maria',  wait: 5, status: "active", isVIPActive: false, coords: [10.618411034818578, -66.74366701948608] },
    '3': { name: 'La niña',      wait: 5, status: "active", isVIPActive: false, coords: [10.6188056787502, -66.74505364628651] },
    '4': { name: 'La Pinta',     wait: 5, status: "active", isVIPActive: false, coords: [10.618622100943933, -66.74448152746639] },
    '5': { name: 'Playa',        wait: 5, status: "active", isVIPActive: false, coords: [10.622011443491711, -66.74376989883172] },
    '6': { name: 'Canchas',  wait: 5, status: "active", isVIPActive: false, coords: [10.618194832327799, -66.74028161600408] },
    '7': { name: 'Recepción',  wait: 5, status: "active", isVIPActive: false, coords: [10.619498603810012, -66.7429570041427] }
};

// 3. Función para renderizar un Pin interactivo usando los estilos nativos de tu CSS
// Variable de control para saber si la interfaz tiene la barra lateral (Admin y Operador)
const tieneSidebar = document.getElementById('leftSidebar') !== null;

function createStationMarker(id, data) {
    const customDiv = document.createElement('div');
    customDiv.className = 'station-marker-leaflet'; 
    
    // REGLA DE NEGOCIO: La burbuja solo se muestra si tieneSidebar es verdadero (Admin/Operador) y hay gente en cola
    const mostrarNumeroCola = tieneSidebar && data.wait > 0;

    customDiv.innerHTML = `
        <div class="marker-container">
            <div class="gps-pin pin-blue"></div>
            <div class="badge" id="badge-${id}" style="display: ${mostrarNumeroCola ? 'flex' : 'none'};">
                ${data.wait}
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

// Dibujar los marcadores iniciales en el lienzo geográfico
for (const [id, data] of Object.entries(stationData)) {
    createStationMarker(id, data);
}

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
map.on('click', function(event) {
    if (!isCreatingStation) return;

    const latlng = event.latlng;
    const name = document.getElementById('newStationNameInput').value.trim();
    const newId = String(nextStationId++);

    // Guardar los datos incluyendo el LatLng geográfico real devuelto por Leaflet
    stationData[newId] = { name: name, wait: 0, coords: [latlng.lat, latlng.lng] };
    
    // Desplegar el nuevo marcador interactivo
    createStationMarker(newId, stationData[newId]);

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
    let val = input.value.replace(/[^0-9:]/g, '');
    if (val.length === 2 && !val.includes(':') && input.value.length > val.length - 1) {
        val = val + ':';
    }
    if (val.length > 5) val = val.substring(0, 5);
    input.value = val;
}

function confirmServiceHours() {
    const startVal = document.getElementById('serviceStartInput').value.trim();
    const endVal = document.getElementById('serviceEndInput').value.trim();
    const errorMsg = document.getElementById('serviceErrorMsg');
    
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
    
    errorMsg.style.display = "none";
    serviceStartTime = startVal;
    serviceEndTime = endVal;
    toggleModal('serviceModal', false);
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

function confirmSeatsChanges() {
    const inputElement = document.getElementById('puestosTempInput');
    if (inputElement && inputElement.value === '') {
        tempSeatsCount = 0;
        inputElement.value = 0;
    }

    currentAvailableSeats = tempSeatsCount;
    document.getElementById('seatsCounter').innerText = currentAvailableSeats;
    toggleModal('puestosModal', false);
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

function confirmDeleteStation() {
    if (!stationToDeleteId) {
        alert("Seleccione una estación para borrar.");
        return;
    }
    
    // 1. Desvincular y remover el marcador gráfico de Leaflet
    if (leafletMarkers[stationToDeleteId]) {
        map.removeLayer(leafletMarkers[stationToDeleteId]);
        delete leafletMarkers[stationToDeleteId];
    }
    
    // 2. Limpiar base de datos interna
    delete stationData[stationToDeleteId];
    
    toggleModal('deleteStationModal', false);
}

// ====== GESTIÓN DE CONSULTA DE DISPONIBILIDAD (NUEVO) ====== //
function openStatusModal() {
    // 1. Capturamos el contenedor del mensaje en el modal
    const messageElement = document.getElementById('statusModalMessage');
    
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
function unirseAColaVirtual() {
    if (!activeStationId) return;

    // CONDICIONAL: Verifica si ya está en alguna cola
    if (estadoColaUsuario !== null) {
        abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
        return;
    }

    // Procesa flujo de agregar
    stationData[activeStationId].wait += 1;
    estadoColaUsuario = 'normal'; // Cambia el estado

    sincronizarBadgeMapa(activeStationId);
    updateStationModalDisplay();

    abrirMensajeCola("Agregado a la cola, el trencito pasará por ti en un momento");
}

function unirseAColaPrioridad() {
    if (!activeStationId) return;

    if (estadoColaUsuario !== null) {
        abrirMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
        return;
    }

    stationData[activeStationId].wait += 1;
    stationData[activeStationId].isVIPActive = true; // 🔥 Activa el estado visual VIP en la estación
    estadoColaUsuario = 'prioridad'; 

    sincronizarBadgeMapa(activeStationId);
    updateStationModalDisplay();

    abrirMensajeCola("Agregado a la cola con prioridad, el trencito pasará por ti en un momento");
}

// 3. Eliminarse de la cola (Soporta ambos tipos)
function eliminarseDeColaVirtual() {
    if (!activeStationId) return;

    if (estadoColaUsuario === null) {
        abrirMensajeCola("No te encuentras registrado en la cola virtual de ninguna estación.");
        return;
    }

    let currentWait = stationData[activeStationId].wait;
    stationData[activeStationId].wait = Math.max(0, currentWait - 1);
    
    // Si la cola baja a 0, por seguridad apagamos el estado VIP de la estación
    if (stationData[activeStationId].wait === 0) {
        stationData[activeStationId].isVIPActive = false;
    } else if (estadoColaUsuario === 'prioridad') {
        // Si el usuario que se está saliendo es el que metió prioridad, la apagamos
        stationData[activeStationId].isVIPActive = false;
    }
    
    estadoColaUsuario = null; 

    sincronizarBadgeMapa(activeStationId);
    updateStationModalDisplay();

    abrirMensajeCola("Te has eliminado de la cola exitosamente. Ya no estás en la fila virtual.");
}

// Función auxiliar para no repetir código de actualización del mapa
function sincronizarBadgeMapa(id) {
    // Sincroniza número en el badge redondo
    const badge = document.getElementById(`badge-${id}`);
    if (badge) {
        badge.innerText = stationData[id].wait;
        badge.style.display = (tieneSidebar && stationData[id].wait > 0) ? 'flex' : 'none';
    }

    // 🔥 BUSCA EL CONTENEDOR DEL PIN DE LEAFLET E INYECTA LA ANIMACIÓN
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
    
    // 1. Reseteamos los datos de la estación a cero y apagamos el estado VIP
    stationData[activeStationId].wait = 0;
    stationData[activeStationId].isVIPActive = false; // 🔥 Apaga el flag visual VIP
    
    // 2. Si el usuario que reseteó la cola estaba en ella, limpiamos su estado local
    estadoColaUsuario = null; 
    
    // 3. Sincronizamos el badge numérico y removemos la clase de animación del marcador
    sincronizarBadgeMapa(activeStationId);
    
    // 4. Refrescamos los textos informativos del modal abierto
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
function verificarHorarioServicio() {
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
    window.location.href = 'inicsesion.html';
}

// EJECUCIÓN AUTOMÁTICA: Valida el horario inmediatamente al cargar la pantalla
window.addEventListener('DOMContentLoaded', () => {
    verificarHorarioServicio();
    
    // Opcional: Si quieres re-verificar el horario cada 1 minuto de forma reactiva
    setInterval(verificarHorarioServicio, 60000);
});
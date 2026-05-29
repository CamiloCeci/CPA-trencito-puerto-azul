// 1. Definimos las esquinas de la "caja" que encerrará al usuario.
// Esquina Suroeste (Abajo-Izquierda) y Esquina Noreste (Arriba-Derecha)
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
    zoomControl: false
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
    position: 'topright' // 👈 Mueve los botones [+] y [-] a la derecha
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

// Diccionario de almacenamiento para las referencias de marcadores físicos de Leaflet
let leafletMarkers = {};

// Base de Datos en Memoria con coordenadas geográficas reales del club
let stationData = {
    '1': { name: 'Zona naútica', wait: 5, coords: [10.622595758743602, -66.7461572479436] },
    '2': { name: 'Santa Maria',  wait: 5, coords: [10.618486077231152, -66.74385736567685] },
    '3': { name: 'La niña',      wait: 5, coords: [10.618837206141515, -66.74515238462081] },
    '4': { name: 'La Pinta',     wait: 5, coords: [10.618674182054734, -66.74445065021767] },
    '5': { name: 'Playa',        wait: 5, coords: [10.622046128162003, -66.74377994390169] },
    '6': { name: 'Canchas',  wait: 5, coords: [10.61782810491524, -66.74015360220449] },
    '7': { name: 'Recepción',  wait: 5, coords: [10.61957317266227, -66.74293121616634] }
};

// 3. Función para renderizar un Pin interactivo usando los estilos nativos de tu CSS
function createStationMarker(id, data) {
    const customDiv = document.createElement('div');
    customDiv.className = 'station-marker-leaflet'; 
    customDiv.innerHTML = `
        <div class="marker-container">
            <div class="gps-pin pin-blue"></div>
            <div class="badge" id="badge-${id}" style="display: ${data.wait > 0 ? 'flex' : 'none'};">${data.wait}</div>
            <div class="tooltip">${data.name}</div>
        </div>
    `;

    // Disparador del Modal al hacer click en el marcador
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
    document.getElementById('serviceErrorMsg').style.display = "none";
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

// 🌟 CAMBIADO: Manejo del botón cancelar abriendo el modal integrado en la interfaz
function handleCancelSeats() {
    if (tempSeatsCount !== currentAvailableSeats) {
        // En lugar de confirm() de JavaScript, abrimos el modal diseñado
        toggleModal('puestosConfirmExitModal', true);
    } else {
        // Si no se tocó nada, cerramos la ventana directamente sin advertencias
        toggleModal('puestosModal', false);
    }
}

// 🌟 NUEVA FUNCIÓN: Ejecutada solo si el usuario decide "Salir" del modal de advertencia
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
    document.getElementById('modalWaitingCount').innerText = tempStationData;
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
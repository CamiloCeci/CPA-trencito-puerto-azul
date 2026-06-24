import { MapaService } from '../services/MapaService.js';
import { WebSocketService } from '../services/WebSocketService.js';
import { ColaService } from '../services/ColaService.js';
import { ColaController } from './ColaController.js';

export const MapaController = {
    map: null,
    stationData: {},
    leafletMarkers: {},
    trencitoMarker: null,
    isCreatingStation: false,
    isEditingLocation: false,
    userWaitingStationId: null,

    trenIconoPersonalizado: L.divIcon({
        className: 'custom-train-marker',
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
        iconAnchor: [20, 20]
    }),

    async iniciar() {
        this.iniciarMapa();
        await this.cargarDatosIniciales();
        this.configurarWebSockets();
        this.configurarEventos();
    },

    iniciarMapa() {
        const esquinaSuroeste = L.latLng([10.614291045886088, -66.74899288309359]);
        const esquinaNoreste = L.latLng([10.626853913590706, -66.73838965971663]);
        const limitesPermitidos = L.latLngBounds(esquinaSuroeste, esquinaNoreste);

        this.map = L.map('map', {
            center: [10.6205, -66.6115],
            zoom: 17,
            minZoom: 17,
            maxZoom: 19,
            maxBounds: limitesPermitidos,
            maxBoundsViscosity: 1.0,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        L.control.zoom({ position: 'topright' }).addTo(this.map);

        this.map.on('click', this.alHacerClicEnMapa.bind(this));
    },

    async cargarDatosIniciales() {
        try {
            const userStr = sessionStorage.getItem('usuarioLogueado');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.rol === 'SOCIO' || user.rol === 'VIP') {
                    try {
                        const status = await ColaService.obtenerEstadoSocio(user.id);
                        if (status && status.estacion) {
                            this.userWaitingStationId = status.estacion.id;
                        }
                    } catch (e) {
                        console.warn("No se pudo obtener el estado del socio");
                    }
                }
            }

            const estaciones = await MapaService.obtenerEstaciones();
            estaciones.forEach(est => {
                this.stationData[est.id] = {
                    name: est.nombre,
                    wait: est.contador,
                    coords: [est.latitude, est.longitude]
                };
                this.crearMarcadorEstacion(est.id, this.stationData[est.id]);
            });
            ColaController.iniciar(this.stationData);

            const trenPos = await MapaService.obtenerPosicionTren();
            if (trenPos) this.actualizarPosicionTren(trenPos);

            const initialSeats = await MapaService.obtenerPuestosTren();
            this.alActualizarTren(initialSeats);
            
        } catch (err) {
            console.error('Error al cargar datos:', err);
        }
    },

    crearMarcadorEstacion(id, data) {
        const customDiv = document.createElement('div');
        customDiv.className = 'station-marker-leaflet';
        
        const userStr = sessionStorage.getItem('usuarioLogueado');
        const user = userStr ? JSON.parse(userStr) : null;
        const isStaff = user && (user.rol === 'ADMINISTRADOR' || user.rol === 'OPERADOR');
        const isSocioVip = user && (user.rol === 'SOCIO' || user.rol === 'VIP');
        
        // El badge rojo con números solo para Administrador u Operador
        const showBadge = isStaff && data.wait > 0;
        // El indicador azul solo para el Socio/VIP en su estación actual
        const isUserStation = isSocioVip && (id == this.userWaitingStationId);

        customDiv.innerHTML = `
            <div class="marker-container">
                <div class="gps-pin pin-blue"></div>
                <div class="badge" id="badge-${id}" style="display: ${showBadge ? 'flex' : 'none'};">
                    ${data.wait}
                </div>
                <div class="user-indicator" id="user-indicator-${id}" style="display: ${isUserStation ? 'block' : 'none'};">
                    <div class="small-blue-dot" style="width: 12px; height: 12px; background-color: #0044cc; border: 2px solid white; border-radius: 50%; position: absolute; top: -5px; right: -5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
                <div class="tooltip">${data.name}</div>
            </div>
        `;

        customDiv.onclick = (e) => {
            e.stopPropagation();
            if (this.isCreatingStation) return;
            ColaController.abrirEstacion(id, data.name);
        };

        const customIcon = L.divIcon({
            html: customDiv,
            className: '',
            iconSize: [30, 40]
        });

        const marker = L.marker(data.coords, { icon: customIcon }).addTo(this.map);
        this.leafletMarkers[id] = marker;
    },

    alHacerClicEnMapa(e) {
        if (this.isCreatingStation) {
            this.manejarCrearEstacion(e.latlng);
        } else if (this.isEditingLocation) {
            this.manejarEditarUbicacion(e.latlng);
        } else {
            const sidebar = document.getElementById('leftSidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
    },

    async iniciarEditarUbicacion(id) {
        this.editarEstacionId = id;
        this.isEditingLocation = true;
        const mapEl = document.getElementById('map');
        if (mapEl) mapEl.style.cursor = 'crosshair';
        const message = document.getElementById('locationEditMessage');
        if (message) message.style.display = 'block';
        window.alternarModal('selectEditStationModal', false);
        window.alternarModal('chooseFieldModal', false);
    },

    async manejarEditarUbicacion(latlng) {
        const id = this.editarEstacionId;
        if (!id) return;
        this.isEditingLocation = false;

        const message = document.getElementById('locationEditMessage');
        if (message) message.style.display = 'none';
        const mapEl = document.getElementById('map');
        if (mapEl) mapEl.style.cursor = '';

        try {
            const updated = await MapaService.actualizarEstacion(id, {
                latitude: latlng.lat,
                longitude: latlng.lng
            });
            this.stationData[id].coords = [updated.latitude, updated.longitude];
            if (this.leafletMarkers[id]) {
                this.leafletMarkers[id].setLatLng([updated.latitude, updated.longitude]);
                const el = this.leafletMarkers[id].getElement();
                if (el) {
                    const tooltip = el.querySelector('.tooltip');
                    if (tooltip) tooltip.innerText = updated.nombre;
                }
            }
        } catch (err) {
            console.error(err);
            alert('No se pudo actualizar la ubicación de la estación');
        }
    },

    async manejarCrearEstacion(latlng) {
        const nameInput = document.getElementById('newStationNameInput');
        const name = nameInput ? nameInput.value.trim() : 'Nueva Estación';
        
        try {
            const newEst = await MapaService.crearEstacion(name, latlng.lat, latlng.lng);
            this.stationData[newEst.id] = { name: newEst.nombre, wait: 0, coords: [newEst.latitude, newEst.longitude] };
            this.crearMarcadorEstacion(newEst.id, this.stationData[newEst.id]);
            this.isCreatingStation = false;
            document.getElementById('map').style.cursor = '';
        } catch (err) {
            console.error(err);
        }
    },

    configurarWebSockets() {
        WebSocketService.connect(
            (data) => this.alActualizarEstacion(data),
            (data) => this.alActualizarTren(data)
        );
    },

    alActualizarEstacion(data) {
        const id = data.estacionId;
        if (this.stationData[id]) {
            this.stationData[id].wait = data.contador;

            const userStr = sessionStorage.getItem('usuarioLogueado');
            const user = userStr ? JSON.parse(userStr) : null;
            const isStaff = user && (user.rol === 'ADMINISTRADOR' || user.rol === 'OPERADOR');

            const badge = document.getElementById(`badge-${id}`);
            if (badge) {
                badge.innerText = data.contador;
                // Ocultar siempre para Socio/VIP
                badge.style.display = (isStaff && data.contador > 0) ? 'flex' : 'none';
            }
            if (ColaController.activeStationId === id) {
                ColaController.actualizarVisualizacionModalEstacion();
            }
        }
    },

    alActualizarTren(data) {
        let puestos;
        if (typeof data === 'object') {
            // Check if it's the GPS object or the seats object
            if (data.puestos !== undefined) {
                puestos = data.puestos;
            } else if (data.puestosLibres !== undefined) { // Check for alternative field name if needed
                puestos = data.puestosLibres;
            }
        } else {
            puestos = data; // Direct integer
        }

        if (puestos !== undefined) {
            const sc = document.getElementById('seatsCounter');
            if (sc) sc.innerText = puestos;
        }
        
        if (data.latitude || data.lat) {
            this.actualizarPosicionTren(data);
        }
    },

    actualizarPosicionTren(data) {
        const lat = parseFloat(data.latitude || data.lat);
        const lng = parseFloat(data.longitude || data.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const coords = [lat, lng];
        if (!this.trencitoMarker) {
            this.trencitoMarker = L.marker(coords, { icon: this.trenIconoPersonalizado }).addTo(this.map);
        } else {
            this.trencitoMarker.setLatLng(coords);
        }
    },

    configurarEventos() {
        // ... (more event listeners could go here)
    }
};

// Initialize if on a map page
if (document.getElementById('map')) {
    MapaController.iniciar();
}

window.MapaController = MapaController;
window.toggleSidebar = () => {
    const sidebar = document.getElementById('leftSidebar');
    if (sidebar) sidebar.classList.toggle('open');
};
window.alternarModal = (id, show) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = show ? 'flex' : 'none';
};

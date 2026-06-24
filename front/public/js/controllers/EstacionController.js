import { MapaService } from '../services/MapaService.js';
import { MapaController } from './MapaController.js';

export const EstacionController = {
    stationToDeleteId: null,

    abrirModalCrearEstacion() {
        const input = document.getElementById('newStationNameInput');
        if (input) input.value = '';
        window.alternarModal('createStationModal', true);
    },

    iniciarCrearEstacion() {
        const name = document.getElementById('newStationNameInput').value.trim();
        if (!name) return;
        
        MapaController.isCreatingStation = true;
        document.getElementById('map').style.cursor = 'crosshair';
        window.alternarModal('createStationModal', false);
    },

    async abrirModalEliminarEstacion() {
        const listContainer = document.getElementById('deleteStationList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        const estaciones = await MapaService.obtenerEstaciones();
        
        estaciones.forEach(est => {
            const div = document.createElement('div');
            div.className = 'station-delete-item';
            div.innerHTML = `
                <span>${est.nombre}</span>
                <input type="radio" name="stationToDelete" value="${est.id}">
            `;
            div.onclick = () => {
                div.querySelector('input').checked = true;
                this.stationToDeleteId = est.id;
            };
            listContainer.appendChild(div);
        });
        
        window.alternarModal('deleteStationModal', true);
    },

    async abrirModalSeleccionarEstacionParaEditar() {
        const listContainer = document.getElementById('editStationList');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        const estaciones = await MapaService.obtenerEstaciones();
        estaciones.forEach(est => {
            const div = document.createElement('div');
            div.className = 'station-delete-item';
            div.innerHTML = `
                <span>${est.nombre}</span>
                <input type="radio" name="stationToEdit" value="${est.id}">
            `;
            div.onclick = () => {
                div.querySelector('input').checked = true;
                this.abrirModalSeleccionCampo(est.id);
            };
            listContainer.appendChild(div);
        });

        window.alternarModal('selectEditStationModal', true);
    },

    abrirModalSeleccionCampo(id) {
        const selectedIdInput = document.getElementById('selectedEditStationId');
        if (selectedIdInput) selectedIdInput.value = id;
        window.alternarModal('chooseFieldModal', true);
        window.alternarModal('selectEditStationModal', false);
    },

    seleccionarCampoYEditar(campo) {
        const selectedIdInput = document.getElementById('selectedEditStationId');
        if (!selectedIdInput) return;
        const id = selectedIdInput.value;
        window.alternarModal('chooseFieldModal', false);
        if (campo === 'ubicacion') {
            MapaController.iniciarEditarUbicacion(id);
        } else {
            this.abrirModalEditarEstacion(id);
        }
    },



    async confirmarEliminarEstacion() {
        const selected = document.querySelector('input[name="stationToDelete"]:checked');
        if (!selected) return;
        
        const id = selected.value;
        try {
            await MapaService.eliminarEstacion(id);
            if (MapaController.leafletMarkers[id]) {
                MapaController.map.removeLayer(MapaController.leafletMarkers[id]);
                delete MapaController.leafletMarkers[id];
                delete MapaController.stationData[id];
            }
            window.alternarModal('deleteStationModal', false);
        } catch (err) {
            console.error(err);
        }
    },

    abrirModalEditarEstacion(id) {
        const est = MapaController.stationData[id];
        if (!est) return;

        const nameInput = document.getElementById('editStationNameInput');
        const editIdInput = document.getElementById('editStationIdInput');
        if (nameInput) nameInput.value = est.name || '';
        if (editIdInput) editIdInput.value = id;

        window.alternarModal('editStationModal', true);
    },


    async guardarEdicionEstacion() {
        const nameInput = document.getElementById('editStationNameInput');
        const editIdInput = document.getElementById('editStationIdInput');
        if (!editIdInput) return;

        const id = editIdInput.value;
        const nombre = nameInput ? nameInput.value.trim() : '';

        if (!nombre) {
            alert('Ingrese un nombre válido para la estación.');
            return;
        }

        const payload = { nombre };

        try {
            const updated = await MapaService.actualizarEstacion(id, payload);
            MapaController.stationData[id].name = updated.nombre;
            MapaController.stationData[id].coords = [updated.latitude, updated.longitude];
            if (MapaController.leafletMarkers[id]) {
                MapaController.leafletMarkers[id].setLatLng([updated.latitude, updated.longitude]);
                const el = MapaController.leafletMarkers[id].getElement();
                if (el) {
                    const tooltip = el.querySelector('.tooltip');
                    if (tooltip) tooltip.innerText = updated.nombre;
                    const badge = el.querySelector('.badge');
                    if (badge) badge.id = `badge-${id}`;
                }
            }
            window.alternarModal('editStationModal', false);
        } catch (err) {
            console.error(err);
            alert('No se pudo actualizar la estación');
        } finally {
            MapaController.isEditingLocation = false;
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.style.cursor = '';
            const message = document.getElementById('selectLocationMessage');
            if (message) message.style.display = 'none';
        }
    }
};

window.EstacionController = EstacionController;
window.abrirModalCrearEstacion = EstacionController.abrirModalCrearEstacion.bind(EstacionController);
window.iniciarCrearEstacion = EstacionController.iniciarCrearEstacion.bind(EstacionController);
window.abrirModalEliminarEstacion = EstacionController.abrirModalEliminarEstacion.bind(EstacionController);
window.confirmarEliminarEstacion = EstacionController.confirmarEliminarEstacion.bind(EstacionController);
window.abrirModalEditarEstacion = EstacionController.abrirModalEditarEstacion.bind(EstacionController);
window.iniciarSeleccionUbicacion = EstacionController.iniciarSeleccionUbicacion.bind(EstacionController);
window.guardarEdicionEstacion = EstacionController.guardarEdicionEstacion.bind(EstacionController);
window.abrirModalSeleccionarEstacionParaEditar = EstacionController.abrirModalSeleccionarEstacionParaEditar.bind(EstacionController);
window.abrirModalSeleccionCampo = EstacionController.abrirModalSeleccionCampo.bind(EstacionController);
window.seleccionarCampoYEditar = EstacionController.seleccionarCampoYEditar.bind(EstacionController);

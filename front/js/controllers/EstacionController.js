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
    }
};

window.EstacionController = EstacionController;
window.abrirModalCrearEstacion = EstacionController.abrirModalCrearEstacion.bind(EstacionController);
window.iniciarCrearEstacion = EstacionController.iniciarCrearEstacion.bind(EstacionController);
window.abrirModalEliminarEstacion = EstacionController.abrirModalEliminarEstacion.bind(EstacionController);
window.confirmarEliminarEstacion = EstacionController.confirmarEliminarEstacion.bind(EstacionController);

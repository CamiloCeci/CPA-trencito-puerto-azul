import { MapService } from '../services/MapService.js';
import { MapController } from './MapController.js';

export const StationController = {
    stationToDeleteId: null,

    openCreateStationModal() {
        const input = document.getElementById('newStationNameInput');
        if (input) input.value = '';
        window.toggleModal('createStationModal', true);
    },

    startCreateStation() {
        const name = document.getElementById('newStationNameInput').value.trim();
        if (!name) return;
        
        MapController.isCreatingStation = true;
        document.getElementById('map').style.cursor = 'crosshair';
        window.toggleModal('createStationModal', false);
    },

    async openDeleteStationModal() {
        const listContainer = document.getElementById('deleteStationList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        const estaciones = await MapService.fetchEstaciones();
        
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
        
        window.toggleModal('deleteStationModal', true);
    },

    async confirmDeleteStation() {
        const selected = document.querySelector('input[name="stationToDelete"]:checked');
        if (!selected) return;
        
        const id = selected.value;
        try {
            await MapService.deleteEstacion(id);
            if (MapController.leafletMarkers[id]) {
                MapController.map.removeLayer(MapController.leafletMarkers[id]);
                delete MapController.leafletMarkers[id];
                delete MapController.stationData[id];
            }
            window.toggleModal('deleteStationModal', false);
        } catch (err) {
            console.error(err);
        }
    }
};

window.StationController = StationController;
window.openCreateStationModal = StationController.openCreateStationModal.bind(StationController);
window.startCreateStation = StationController.startCreateStation.bind(StationController);
window.openDeleteStationModal = StationController.openDeleteStationModal.bind(StationController);
window.confirmDeleteStation = StationController.confirmDeleteStation.bind(StationController);

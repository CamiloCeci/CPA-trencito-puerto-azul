import { QueueService } from '../services/QueueService.js';

export const QueueController = {
    activeStationId: null,
    stationData: {},

    init(stationData) {
        this.stationData = stationData;
    },

    openStation(id, name) {
        this.activeStationId = id;
        const modalName = document.getElementById('modalStationName');
        if (modalName) modalName.innerText = name;
        this.updateStationModalDisplay();
        this.toggleModal('stationModal', true);
    },

    updateStationModalDisplay() {
        if (!this.activeStationId) return;
        const currentWait = this.stationData[this.activeStationId].wait;
        const waitingCountEl = document.getElementById('modalWaitingCount');
        if (waitingCountEl) {
            waitingCountEl.innerText = `${currentWait} ${currentWait === 1 ? 'persona' : 'personas'}`;
        }
    },

    toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = show ? 'flex' : 'none';
    },

    async unirseAColaVirtual() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            await QueueService.joinQueue(user.id, this.activeStationId);
            this.showMessageCola("¡Te has unido a la cola con éxito!");
            this.toggleModal('stationModal', false);
            
            // Refresh map indicators
            if (window.MapController) {
                window.MapController.userWaitingStationId = this.activeStationId;
                this.refreshMapIndicators();
            }
        } catch (err) {
            this.showMessageCola("Error: " + err.message);
        }
    },

    async eliminarseDeColaVirtual() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            const status = await QueueService.getSocioStatus(user.id);
            if (!status || !status.estacion || status.estacion.id != this.activeStationId) {
                this.showMessageCola("No puedes salir de esta cola porque no estás anotado en esta estación.");
                return;
            }

            await QueueService.leaveQueue(user.id);
            this.showMessageCola("Has salido de la cola.");
            this.toggleModal('stationModal', false);

            // Refresh map indicators
            if (window.MapController) {
                window.MapController.userWaitingStationId = null;
                this.refreshMapIndicators();
            }
        } catch (err) {
            this.showMessageCola("Error: " + err.message);
        }
    },

    async unirseAColaPrioridad() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            await QueueService.joinQueue(user.id, this.activeStationId);
            this.showMessageCola("¡Te has unido a la cola de PRIORIDAD con éxito!");
            this.toggleModal('stationModal', false);

            // Refresh map indicators
            if (window.MapController) {
                window.MapController.userWaitingStationId = this.activeStationId;
                this.refreshMapIndicators();
            }
        } catch (err) {
            this.showMessageCola("Error: " + err.message);
        }
    },

    refreshMapIndicators() {
        if (!window.MapController) return;
        Object.keys(window.MapController.leafletMarkers).forEach(id => {
            const indicator = document.getElementById(`user-indicator-${id}`);
            if (indicator) {
                indicator.style.display = (id == window.MapController.userWaitingStationId) ? 'block' : 'none';
            }
        });
    },

    showMessageCola(msg) {
        const el = document.getElementById('mensajeColaTexto');
        if (el) el.innerText = msg;
        this.toggleModal('mensajeColaModal', true);
    },

    presionarOKCola() {
        this.toggleModal('mensajeColaModal', false);
    },

    resetStationQueue() {
        console.log("Reiniciando cola en:", this.activeStationId);
    },

    showEstimatedTime() {
        console.log("Mostrando tiempo en:", this.activeStationId);
    }
};

window.QueueController = QueueController;
window.toggleModal = QueueController.toggleModal;
window.openStation = QueueController.openStation.bind(QueueController);
window.unirseAColaVirtual = QueueController.unirseAColaVirtual.bind(QueueController);
window.unirseAColaPrioridad = QueueController.unirseAColaPrioridad.bind(QueueController);
window.eliminarseDeColaVirtual = QueueController.eliminarseDeColaVirtual.bind(QueueController);
window.presionarOKCola = QueueController.presionarOKCola.bind(QueueController);
window.resetStationQueue = QueueController.resetStationQueue.bind(QueueController);
window.showEstimatedTime = QueueController.showEstimatedTime.bind(QueueController);

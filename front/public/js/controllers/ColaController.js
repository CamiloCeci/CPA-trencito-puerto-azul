import { ColaService } from '../services/ColaService.js';

export const ColaController = {
    activeStationId: null,
    stationData: {},

    iniciar(stationData) {
        this.stationData = stationData;
    },

    abrirEstacion(id, name) {
        this.activeStationId = id;
        const modalName = document.getElementById('modalStationName');
        if (modalName) modalName.innerText = name;
        this.actualizarVisualizacionModalEstacion();
        this.alternarModal('stationModal', true);
    },

    actualizarVisualizacionModalEstacion() {
        if (!this.activeStationId) return;
        const currentWait = this.stationData[this.activeStationId].wait;
        const waitingCountEl = document.getElementById('modalWaitingCount');
        if (waitingCountEl) {
            waitingCountEl.innerText = `${currentWait} ${currentWait === 1 ? 'persona' : 'personas'}`;
        }
    },

    alternarModal(id, show) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = show ? 'flex' : 'none';
    },

    async unirseAColaVirtual() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            await ColaService.unirseACola(user.id, this.activeStationId);
            this.mostrarMensajeCola("¡Te has unido a la cola con éxito!");
            this.alternarModal('stationModal', false);
            
            // Refresh map indicators
            if (window.MapaController) {
                window.MapaController.userWaitingStationId = this.activeStationId;
                this.actualizarIndicadoresMapa();
            }
        } catch (err) {
            this.mostrarMensajeCola("Error: " + err.message);
        }
    },

    async eliminarseDeColaVirtual() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            const status = await ColaService.obtenerEstadoSocio(user.id);
            if (!status || !status.estacion || status.estacion.id != this.activeStationId) {
                this.mostrarMensajeCola("No puedes salir de esta cola porque no estás anotado en esta estación.");
                return;
            }

            await ColaService.salirDeCola(user.id);
            this.mostrarMensajeCola("Has salido de la cola.");
            this.alternarModal('stationModal', false);

            // Refresh map indicators
            if (window.MapaController) {
                window.MapaController.userWaitingStationId = null;
                this.actualizarIndicadoresMapa();
            }
        } catch (err) {
            this.mostrarMensajeCola("Error: " + err.message);
        }
    },

    async unirseAColaPrioridad() {
        const userStr = sessionStorage.getItem('usuarioLogueado');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        try {
            await ColaService.unirseACola(user.id, this.activeStationId);
            this.mostrarMensajeCola("¡Te has unido a la cola de PRIORIDAD con éxito!");
            this.alternarModal('stationModal', false);

            // Refresh map indicators
            if (window.MapaController) {
                window.MapaController.userWaitingStationId = this.activeStationId;
                this.actualizarIndicadoresMapa();
            }
        } catch (err) {
            this.mostrarMensajeCola("Error: " + err.message);
        }
    },

    actualizarIndicadoresMapa() {
        if (!window.MapaController) return;
        Object.keys(window.MapaController.leafletMarkers).forEach(id => {
            const indicator = document.getElementById(`user-indicator-${id}`);
            if (indicator) {
                indicator.style.display = (id == window.MapaController.userWaitingStationId) ? 'block' : 'none';
            }
        });
    },

    mostrarMensajeCola(msg) {
        const el = document.getElementById('mensajeColaTexto');
        if (el) el.innerText = msg;
        this.alternarModal('mensajeColaModal', true);
    },

    alPresionarOKCola() {
        this.alternarModal('mensajeColaModal', false);
    },

    reiniciarColaEstacion() {
        console.log("Reiniciando cola en:", this.activeStationId);
    },

    mostrarTiempoEstimado() {
        console.log("Mostrando tiempo en:", this.activeStationId);
    }
};

window.ColaController = ColaController;
window.alternarModal = ColaController.alternarModal;
window.abrirEstacion = ColaController.abrirEstacion.bind(ColaController);
window.unirseAColaVirtual = ColaController.unirseAColaVirtual.bind(ColaController);
window.unirseAColaPrioridad = ColaController.unirseAColaPrioridad.bind(ColaController);
window.eliminarseDeColaVirtual = ColaController.eliminarseDeColaVirtual.bind(ColaController);
window.alPresionarOKCola = ColaController.alPresionarOKCola.bind(ColaController);
window.reiniciarColaEstacion = ColaController.reiniciarColaEstacion.bind(ColaController);
window.mostrarTiempoEstimado = ColaController.mostrarTiempoEstimado.bind(ColaController);

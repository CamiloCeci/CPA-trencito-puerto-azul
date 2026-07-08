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

        if (window.MapaController && window.MapaController.userWaitingStationId !== null) {
            this.mostrarMensajeCola("Ya estás en la cola, espera unos momentos a que el tren pase por ti");
            return;
        }
        
        try {
            console.log(`[DEBUG VIP] Intentando unirse a cola prioridad. Estación Activa: ${this.activeStationId}`);
            await ColaService.unirseACola(user.id, this.activeStationId);
            
            if (this.stationData[this.activeStationId]) {
                this.stationData[this.activeStationId].wait += 1;
                // !!! CLAVE: Encendemos la bandera VIP localmente para pruebas instantáneas
                this.stationData[this.activeStationId].isVIPActive = true; 
                console.log(`[DEBUG VIP] Datos locales actualizados:`, this.stationData[this.activeStationId]);
            }

            if (window.MapaController) {
                window.MapaController.userWaitingStationId = this.activeStationId;
            }

            this.actualizarVisualizacionModalEstacion();
            this.actualizarIndicadoresMapa();
            this.sincronizarBadgeMapa(this.activeStationId);

            this.mostrarMensajeCola("Agregado a la cola con prioridad, el trencito pasará por ti en un momento");
            this.alternarModal('stationModal', false);

        } catch (err) {
            console.error("[DEBUG VIP] Error en petición de prioridad:", err);
            this.mostrarMensajeCola("No se pudo unir a la cola VIP: " + err.message);
        }
    },

    sincronizarBadgeMapa(id) {
        if (!this.stationData[id]) {
            console.warn(`[DEBUG VIP] No se encontraron datos para la estación ID: ${id}`);
            return;
        }

        console.log(`[DEBUG VIP] Sincronizando Estación ${id} (${this.stationData[id].name}). Personas: ${this.stationData[id].wait}, ¿VIP Activo?: ${this.stationData[id].isVIPActive}`);

        // Recalcular el rol actual en tiempo de renderizado
        const userStr = sessionStorage.getItem('usuarioLogueado');
        const user = userStr ? JSON.parse(userStr) : null;
        const isStaff = user && (user.rol === 'ADMINISTRADOR' || user.rol === 'OPERADOR');

        // 1. Sincronizar el texto numérico del badge
        const badgeText = document.getElementById(`badge-text-${id}`);
        if (badgeText) {
            badgeText.innerText = this.stationData[id].wait;
        }

        // 2. Controlar la visibilidad del badge según el rol del usuario logueado
        const badge = document.getElementById(`badge-${id}`);
        if (badge) {
            const tieneSidebar = document.getElementById('leftSidebar') !== null;
            
            // CORRECCIÓN: El badge con número solo se muestra si es Staff. El socio común jamás lo ve.
            if (isStaff && this.stationData[id].isVIPActive) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = (isStaff && this.stationData[id].wait > 0) ? 'flex' : 'none';
            }
        }

        // 3. Sincronizar el indicador de posición del usuario actual
        const userIndicator = document.getElementById(`user-indicator-${id}`);
        if (userIndicator && window.MapaController) {
            userIndicator.style.display = (window.MapaController.userWaitingStationId == id) ? 'block' : 'none';
        }

        // 4. ANIMACIÓN ESTÉTICA DEL PULSO DORADO
        const fallbackElement = badge ? badge.closest('.marker-container') : null;
        const targetContainer = document.getElementById(`marker-container-${id}`) || fallbackElement;

        if (targetContainer) {
            // CORRECCIÓN: Añadir filtro de seguridad visual estricto local
            if (isStaff && this.stationData[id].isVIPActive) {
                targetContainer.classList.add('vip-active'); // Enciende el pulso dorado CSS solo para Staff
                console.log(`[DEBUG VIP] Clase 'vip-active' AÑADIDA al contenedor de la estación ${id}`);
            } else {
                targetContainer.classList.remove('vip-active'); // Apaga o mantiene oculto para Socios
                console.log(`[DEBUG VIP] Clase 'vip-active' REMOVIDA/IGNORADA del contenedor de la estación ${id}`);
            }
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
window.sincronizarBadgeMapa = ColaController.sincronizarBadgeMapa.bind(ColaController);
window.eliminarseDeColaVirtual = ColaController.eliminarseDeColaVirtual.bind(ColaController);
window.alPresionarOKCola = ColaController.alPresionarOKCola.bind(ColaController);
window.reiniciarColaEstacion = ColaController.reiniciarColaEstacion.bind(ColaController);
window.mostrarTiempoEstimado = ColaController.mostrarTiempoEstimado.bind(ColaController);

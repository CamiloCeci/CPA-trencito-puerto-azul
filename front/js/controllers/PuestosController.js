import { MapaService } from '../services/MapaService.js';

export const PuestosController = {
    currentAvailableSeats: 9,
    tempSeats: 0,

    async iniciar() {
        await this.cargarPuestos();
    },

    async cargarPuestos() {
        try {
            this.currentAvailableSeats = await MapaService.obtenerPuestosTren();
            this.actualizarVisualizacionPuestos();
        } catch (err) {
            console.error(err);
        }
    },

    actualizarVisualizacionPuestos() {
        const el = document.getElementById('seatsCounter');
        if (el) el.innerText = this.currentAvailableSeats;
    },

    abrirModalPuestos() {
        this.tempSeats = this.currentAvailableSeats;
        const input = document.getElementById('puestosTempInput');
        if (input) input.value = this.tempSeats;
        this.actualizarBotonConfirmar();
        window.alternarModal('puestosModal', true);
    },

    alterarPuestosTemporales(amount) {
        this.tempSeats = Math.max(0, Math.min(20, this.tempSeats + amount));
        const input = document.getElementById('puestosTempInput');
        if (input) input.value = this.tempSeats;
        this.actualizarBotonConfirmar();
    },

    actualizarBotonConfirmar() {
        const btn = document.getElementById('btnConfirmSeats');
        if (btn) btn.disabled = (this.tempSeats === this.currentAvailableSeats);
    },

    async confirmarCambiosPuestos() {
        try {
            const res = await fetch('http://localhost:8080/api/v1/tren/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puestos: this.tempSeats })
            });
            if (!res.ok) throw new Error('Error al actualizar puestos');
            
            this.currentAvailableSeats = this.tempSeats;
            this.actualizarVisualizacionPuestos();
            window.alternarModal('puestosModal', false);
        } catch (err) {
            console.error(err);
        }
    },

    manejarCancelarPuestos() {
        if (this.tempSeats !== this.currentAvailableSeats) {
            window.alternarModal('puestosConfirmExitModal', true);
        } else {
            window.alternarModal('puestosModal', false);
        }
    },

    forzarSalidaPuestos() {
        window.alternarModal('puestosConfirmExitModal', false);
        window.alternarModal('puestosModal', false);
    },

    validarEntradaPuestos(input) {
        let valStr = input.value.replace(/[^0-9]/g, '');
        if (valStr === '') {
            this.tempSeats = 0;
            input.value = '';
        } else {
            let valNum = parseInt(valStr, 10);
            if (valNum > 20) valNum = 20;
            this.tempSeats = valNum;
            input.value = this.tempSeats;
        }
        this.actualizarBotonConfirmar();
    }
};

window.PuestosController = PuestosController;
window.abrirModalPuestos = PuestosController.abrirModalPuestos.bind(PuestosController);
window.alterarPuestosTemporales = PuestosController.alterarPuestosTemporales.bind(PuestosController);
window.confirmarCambiosPuestos = PuestosController.confirmarCambiosPuestos.bind(PuestosController);
window.manejarCancelarPuestos = PuestosController.manejarCancelarPuestos.bind(PuestosController);
window.forzarSalidaPuestos = PuestosController.forzarSalidaPuestos.bind(PuestosController);
window.validarEntradaPuestos = PuestosController.validarEntradaPuestos.bind(PuestosController);

PuestosController.iniciar();

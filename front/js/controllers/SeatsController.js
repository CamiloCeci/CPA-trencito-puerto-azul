import { MapService } from '../services/MapService.js';

export const SeatsController = {
    currentAvailableSeats: 9,
    tempSeats: 0,

    async init() {
        await this.loadSeats();
    },

    async loadSeats() {
        try {
            this.currentAvailableSeats = await MapService.fetchTrenSeats();
            this.updateSeatsDisplay();
        } catch (err) {
            console.error(err);
        }
    },

    updateSeatsDisplay() {
        const el = document.getElementById('seatsCounter');
        if (el) el.innerText = this.currentAvailableSeats;
    },

    openPuestosModal() {
        this.tempSeats = this.currentAvailableSeats;
        const input = document.getElementById('puestosTempInput');
        if (input) input.value = this.tempSeats;
        this.updateConfirmButton();
        window.toggleModal('puestosModal', true);
    },

    alterTempSeats(amount) {
        this.tempSeats = Math.max(0, Math.min(20, this.tempSeats + amount));
        const input = document.getElementById('puestosTempInput');
        if (input) input.value = this.tempSeats;
        this.updateConfirmButton();
    },

    updateConfirmButton() {
        const btn = document.getElementById('btnConfirmSeats');
        if (btn) btn.disabled = (this.tempSeats === this.currentAvailableSeats);
    },

    async confirmSeatsChanges() {
        try {
            const res = await fetch('http://localhost:8080/api/v1/tren/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puestos: this.tempSeats })
            });
            if (!res.ok) throw new Error('Error al actualizar puestos');
            
            this.currentAvailableSeats = this.tempSeats;
            this.updateSeatsDisplay();
            window.toggleModal('puestosModal', false);
        } catch (err) {
            console.error(err);
        }
    },

    handleCancelSeats() {
        if (this.tempSeats !== this.currentAvailableSeats) {
            window.toggleModal('puestosConfirmExitModal', true);
        } else {
            window.toggleModal('puestosModal', false);
        }
    },

    forceExitSeats() {
        window.toggleModal('puestosConfirmExitModal', false);
        window.toggleModal('puestosModal', false);
    },

    validateSeatsInput(input) {
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
        this.updateConfirmButton();
    }
};

window.SeatsController = SeatsController;
window.openPuestosModal = SeatsController.openPuestosModal.bind(SeatsController);
window.alterTempSeats = SeatsController.alterTempSeats.bind(SeatsController);
window.confirmSeatsChanges = SeatsController.confirmSeatsChanges.bind(SeatsController);
window.handleCancelSeats = SeatsController.handleCancelSeats.bind(SeatsController);
window.forceExitSeats = SeatsController.forceExitSeats.bind(SeatsController);
window.validateSeatsInput = SeatsController.validateSeatsInput.bind(SeatsController);

SeatsController.init();

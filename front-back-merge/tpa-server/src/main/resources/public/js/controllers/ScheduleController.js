const BASE_URL = 'http://localhost:8080/api/v1/disponibilidad';

export const ScheduleController = {
    serviceStartTime: "07:00",
    serviceEndTime: "22:00",

    async init() {
        await this.loadDisponibilidad();
        this.verificarHorarioServicio();
    },

    async loadDisponibilidad() {
        try {
            const response = await fetch(`${BASE_URL}/`);
            if (response.ok) {
                const data = await response.json();
                if (data.desde) this.serviceStartTime = data.desde.substring(0, 5);
                if (data.hasta) this.serviceEndTime = data.hasta.substring(0, 5);
            }
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
        }
    },

    openServiceModal() {
        document.getElementById('serviceStartInput').value = this.serviceStartTime;
        document.getElementById('serviceEndInput').value = this.serviceEndTime;
        document.getElementById('serviceErrorMsg').style.display = 'none';

        const sidebar = document.getElementById('leftSidebar');
        if (sidebar) sidebar.classList.remove('open');

        window.toggleModal('serviceModal', true);
    },

    validateTimeInput(input) {
        let val = input.value.replace(/[^0-9:]/g, '');
        if (val.length === 2 && !val.includes(':') && input.value.length > val.length - 1) {
            val = val + ':';
        }
        if (val.length > 5) val = val.substring(0, 5);
        input.value = val;
    },

    async confirmServiceHours() {
        const startVal = document.getElementById('serviceStartInput').value.trim();
        const endVal = document.getElementById('serviceEndInput').value.trim();
        const errorMsg = document.getElementById('serviceErrorMsg');

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(startVal) || !timeRegex.test(endVal)) {
            errorMsg.style.display = "block";
            return;
        }

        try {
            const payload = { horaDesde: startVal, horaHasta: endVal };
            const res = await fetch(BASE_URL + '/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Error al actualizar disponibilidad');

            this.serviceStartTime = startVal;
            this.serviceEndTime = endVal;
            window.toggleModal('serviceModal', false);
        } catch (err) {
            console.error(err);
        }
    },

    async openStatusModal() {
        await this.loadDisponibilidad();
        const messageElement = document.getElementById('statusModalMessage');
        if (messageElement) {
            messageElement.innerHTML = `El trencito estará prestando su servicio desde las <strong>${this.serviceStartTime}</strong> hasta las <strong>${this.serviceEndTime}</strong>.`;
        }
        window.toggleModal('statusModal', true);
    },

    verificarHorarioServicio() {
        const ahora = new Date();
        const horaActualStr = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        const minutosActual = this.tiempoEnMinutos(horaActualStr);
        const minutosInicio = this.tiempoEnMinutos(this.serviceStartTime);
        const minutosFin = this.tiempoEnMinutos(this.serviceEndTime);

        if (minutosActual < minutosInicio || minutosActual > minutosFin) {
            const mensajeTexto = `El servicio de trencito se encuentra cerrado en este momento. El horario de atención es de ${this.serviceStartTime} a ${this.serviceEndTime}.`;
            const el = document.getElementById('mensajeCierreTexto');
            if (el) el.innerText = mensajeTexto;
            window.toggleModal('cierreServicioModal', true);
            return false;
        }
        return true;
    },

    tiempoEnMinutos(horaString) {
        const [horas, minutos] = horaString.split(':').map(Number);
        return (horas * 60) + minutos;
    }
};

window.ScheduleController = ScheduleController;
window.openServiceModal = ScheduleController.openServiceModal.bind(ScheduleController);
window.confirmServiceHours = ScheduleController.confirmServiceHours.bind(ScheduleController);
window.openStatusModal = ScheduleController.openStatusModal.bind(ScheduleController);
window.validateTimeInput = ScheduleController.validateTimeInput.bind(ScheduleController);

ScheduleController.init();
it();

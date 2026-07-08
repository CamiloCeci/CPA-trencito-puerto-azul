export const WebSocketService = {
    stompClient: null,

    connect(onEstacionUpdate, onTrenUpdate) {
        const socket = new SockJS('/ws-tpa');
        this.stompClient = Stomp.over(socket);
        
            // 🔥 MODIFICACIÓN: Activamos el debug para ver la transmisión exacta en F12
            this.stompClient.debug = function(str) {
                console.log('📣 [STOMP NET LOG]: ' + str);
            };

            this.stompClient.connect({}, (frame) => {
            console.log('✅ Conectado a WebSockets');

            // Aquí se recibe el JSON enviado desde el ColaVirtualController de Java
            this.stompClient.subscribe('/topic/estaciones', (message) => {
                const data = JSON.parse(message.body);
                if (onEstacionUpdate) onEstacionUpdate(data);
            });

            this.stompClient.subscribe('/topic/trencito/posicion', (message) => {
                const data = JSON.parse(message.body);
                if (onTrenUpdate) onTrenUpdate(data);
            });

            this.stompClient.subscribe('/topic/tren', (message) => {
                const data = JSON.parse(message.body);
                if (onTrenUpdate) onTrenUpdate(data);
            });

        }, (error) => {
            console.error('Error WebSocket, reconectando...', error);
            setTimeout(() => this.connect(onEstacionUpdate, onTrenUpdate), 5000);
        });
    }
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private currentUrl: string = '';

  connect(url: string) {
    if (this.ws) {
      this.ws.close();
    }

    this.currentUrl = url;
    console.log('[WEBSOCKET] Connecting to:', url);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[WEBSOCKET] Connected to server');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      console.log('[WEBSOCKET] Message received:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('[WEBSOCKET] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WEBSOCKET] Error:', error);
    };

    this.ws.onclose = () => {
      console.log('[WEBSOCKET] Connection closed');
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WEBSOCKET] Reconnecting... (attempt ${this.reconnectAttempts})`);
      setTimeout(() => {
        this.connect(this.currentUrl);
      }, this.reconnectDelay);
    } else {
      console.log('[WEBSOCKET] Max reconnection attempts reached');
    }
  }

  private handleMessage(data: any) {
    // Emit events based on message type
    if (data.type === 'new_order') {
      console.log('[WEBSOCKET] New order received');
      // You can add event emitter here if needed
    } else if (data.type === 'order_update') {
      console.log('[WEBSOCKET] Order updated');
      // You can add event emitter here if needed
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;

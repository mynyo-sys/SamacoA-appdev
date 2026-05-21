import { EventSource } from 'eventsource';
import { MERCURE_URL } from '../app/api/config';

// Mercure Event Types
export type MercureEventType = 'order.update' | 'product.update' | 'activity';

export interface MercureEvent {
  '@id': string;
  data: any;
  topic: string;
}

// Mercure connection manager
class MercureManager {
  private eventSource: EventSource | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  // Subscribe to a specific topic
  subscribe(topic: string, callback: (data: any) => void): () => void {
    console.log('[MERCURE] Subscribing to topic:', topic);

    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }

    this.subscribers.get(topic)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  // Connect to Mercure hub
  connect(topics: string[]): void {
    if (this.eventSource) {
      console.log('[MERCURE] Already connected');
      return;
    }

    console.log('[MERCURE] Connecting to:', MERCURE_URL);
    console.log('[MERCURE] Topics:', topics);

    const topicParams = topics.map((topic) => `topic=${encodeURIComponent(topic)}`).join('&');
    const url = `${MERCURE_URL}?${topicParams}`;

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[MERCURE] Connected successfully');
      };

      this.eventSource.onerror = (error: any) => {
        console.error('[MERCURE] Connection error:', error);
      };

      this.eventSource.onmessage = (event: any) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[MERCURE] Received event:', data);

          // Notify all subscribers for this topic
          const topic = data.topic || data['@id'];
          const callbacks = this.subscribers.get(topic);
          if (callbacks) {
            callbacks.forEach((callback) => callback(data));
          }
        } catch (err) {
          console.error('[MERCURE] Error parsing event:', err);
        }
      };
    } catch (error) {
      console.error('[MERCURE] Failed to connect:', error);
    }
  }

  // Disconnect from Mercure hub
  disconnect(): void {
    if (this.eventSource) {
      console.log('[MERCURE] Disconnecting...');
      this.eventSource.close();
      this.eventSource = null;
    }
    this.subscribers.clear();
  }
}

// Export singleton instance
export const mercureManager = new MercureManager();

// Helper function to subscribe to order updates
export const subscribeToOrderUpdates = (callback: (order: any) => void): (() => void) => {
  return mercureManager.subscribe('order.update', callback);
};

// Helper function to subscribe to product updates
export const subscribeToProductUpdates = (callback: (product: any) => void): (() => void) => {
  return mercureManager.subscribe('product.update', callback);
};

// Helper function to connect to all brewery topics
export const connectToBreweryTopics = (): void => {
  mercureManager.connect([
    'order.update',
    'product.update',
    'activity',
  ]);
};

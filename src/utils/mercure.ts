import { ordersApi, productsApi } from '../app/api/brewery';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Polling-based sync manager for React Native (EventSource not supported)
class SyncManager {
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private intervals: Map<string, number> = new Map();
  private lastData: Map<string, any> = new Map();
  private readonly POLL_INTERVAL = 10000; // 10 seconds

  // Check if user has a valid token
  private async hasValidToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token !== null && token !== '';
    } catch {
      return false;
    }
  }

  // Subscribe to a specific topic
  subscribe(topic: string, callback: (data: any) => void): () => void {
    console.log('[SYNC] Subscribing to topic:', topic);

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
          this.stopPolling(topic);
        }
      }
    };
  }

  // Start polling for a specific topic
  startPolling(topic: string): void {
    if (this.intervals.has(topic)) {
      console.log('[SYNC] Already polling for:', topic);
      return;
    }

    console.log('[SYNC] Starting polling for:', topic);

    const interval = setInterval(async () => {
      try {
        // Check for valid token before polling authenticated endpoints
        const hasToken = await this.hasValidToken();
        if (!hasToken) {
          console.log('[SYNC] No valid token, skipping poll for:', topic);
          return;
        }

        let newData: any;

        switch (topic) {
          case 'orders':
            newData = await ordersApi.getAll();
            break;
          case 'products':
            // Products might be public, try without auth first
            try {
              newData = await productsApi.getAll();
            } catch (productsError) {
              // If products fails with auth error, skip this poll
              console.log('[SYNC] Products fetch failed, skipping:', productsError);
              return;
            }
            break;
          default:
            return;
        }

        // Check if data has changed
        const lastData = this.lastData.get(topic);
        if (JSON.stringify(newData) !== JSON.stringify(lastData)) {
          console.log('[SYNC] Data changed for:', topic);
          this.lastData.set(topic, newData);

          // Notify all subscribers
          const callbacks = this.subscribers.get(topic);
          if (callbacks) {
            callbacks.forEach((callback) => callback(newData));
          }
        }
      } catch (error: any) {
        console.error('[SYNC] Polling error for', topic, ':', error);

        // If error is invalid JWT token, stop polling and clear token
        if (error.message && error.message.includes('Invalid JWT Token')) {
          console.log('[SYNC] Invalid token detected, stopping polling for:', topic);
          this.stopPolling(topic);
          await AsyncStorage.removeItem('userToken');
        }
      }
    }, this.POLL_INTERVAL);

    this.intervals.set(topic, interval);
  }

  // Stop polling for a specific topic
  stopPolling(topic: string): void {
    const interval = this.intervals.get(topic);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(topic);
      console.log('[SYNC] Stopped polling for:', topic);
    }
  }

  // Stop all polling
  disconnect(): void {
    console.log('[SYNC] Disconnecting all polling...');
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
    this.lastData.clear();
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Helper function to subscribe to order updates
export const subscribeToOrderUpdates = (callback: (orders: any) => void): (() => void) => {
  const unsubscribe = syncManager.subscribe('orders', callback);
  syncManager.startPolling('orders');
  return unsubscribe;
};

// Helper function to subscribe to product updates
export const subscribeToProductUpdates = (callback: (products: any) => void): (() => void) => {
  const unsubscribe = syncManager.subscribe('products', callback);
  syncManager.startPolling('products');
  return unsubscribe;
};

// Helper function to connect to all brewery topics
export const connectToBreweryTopics = (): void => {
  console.log('[SYNC] Starting polling for all topics');
  syncManager.startPolling('orders');
  syncManager.startPolling('products');
};

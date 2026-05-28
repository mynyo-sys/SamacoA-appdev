import { EventEmitter } from 'eventemitter3';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export interface FCMEvent {
  type: 'order_status' | 'order_update' | 'test' | string;
  data: Record<string, any>;
  notification?: {
    title?: string;
    body?: string;
  };
}

class FCMEventEmitter extends EventEmitter {}

export const fcmEventEmitter = new FCMEventEmitter();

export const handleFCMMessage = (remoteMessage: FirebaseMessagingTypes.RemoteMessage): FCMEvent => {
  const fcmEvent: FCMEvent = {
    type: (remoteMessage.data?.type as string) || 'unknown',
    data: remoteMessage.data || {},
    notification: {
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
    },
  };

  console.log('[FCM EVENT EMITTER] Emitting notification event:', fcmEvent);
  fcmEventEmitter.emit('notification', fcmEvent);

  if (fcmEvent.type === 'order_status' || fcmEvent.type === 'order_update') {
    fcmEventEmitter.emit('order_update', fcmEvent);
  }

  return fcmEvent;
};

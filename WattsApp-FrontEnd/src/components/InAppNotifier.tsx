import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppToast from './InAppToast';
import { fetchNotifications } from '../services/notifications';
import { getDispositivoById } from '../services/api';

type Props = {
  onUnreadCountChange?: (n: number) => void;
  pollIntervalMs?: number;
};

const InAppNotifier: React.FC<Props> = ({ onUnreadCountChange, pollIntervalMs = 5000 }) => {
  const [toast, setToast] = useState<{ title: string; body?: string; device?: any; summary?: string } | null>(null);
  const seenIds = useRef<Set<number>>(new Set());
  const polling = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const raw = await AsyncStorage.getItem('user');
      if (!raw) return;
      let user = null;
      try { user = JSON.parse(raw); } catch (e) { return; }
      const userId = user?.id_usuario || user?.id || null;
      if (!userId) return;

      const poll = async () => {
        const items = await fetchNotifications(Number(userId), true);
        if (!mounted) return;
        if (items.length) {
          // notificar sólo los que no se han mostrado antes
          const newItems = items.filter(it => !seenIds.current.has(it.id_notification));
          if (newItems.length) {
            // tomar el más reciente
            const recent = newItems[0];
            let deviceData = null;
            if (recent.id_dispositivo) {
              try {
                const d = await getDispositivoById(recent.id_dispositivo);
                deviceData = d;
              } catch (e) {
                console.log('Error fetching device for toast', e);
              }
            }
            const summary = recent.type === 'connect' ? 'Dispositivo conectado' : recent.type === 'disconnect' ? 'Dispositivo desconectado' : (recent.type === 'over_threshold' ? 'Consumo por encima del umbral' : recent.title);
            setToast({ title: recent.title, body: recent.body || undefined, device: deviceData, summary });
            newItems.forEach(it => seenIds.current.add(it.id_notification));
            // Emitir evento para que NotificationCenter se actualice inmediatamente
            try { DeviceEventEmitter.emit('notificationsUpdated'); } catch (e) { /* ignorar errores */ }
            // limpiar automáticamente el toast después de unos segundos para permitir mostrar notificaciones posteriores
            setTimeout(() => setToast(null), 4500);
          }
        }
        if (onUnreadCountChange) onUnreadCountChange(items.length);
      };

      await poll();
      polling.current = setInterval(poll, pollIntervalMs);
    };

    start();

    return () => { mounted = false; if (polling.current) clearInterval(polling.current); };
  }, []);

  return (
    <View pointerEvents="box-none">
      <InAppToast visible={!!toast} title={toast?.title || ''} body={toast?.body} device={toast?.device} summary={toast?.summary} />
    </View>
  );
};

export default InAppNotifier;

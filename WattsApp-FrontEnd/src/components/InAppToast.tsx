import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  body?: string;
  device?: {
    nombre_dispositivo?: string;
    numero_serie?: string;
    ubicacion?: string;
  } | null;
  summary?: string;
};

const InAppToast: React.FC<Props> = ({ visible, title, body, device, summary }) => {
  const translateX = React.useRef(new Animated.Value(200)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(translateX, { toValue: 200, duration: 300, useNativeDriver: true }).start();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }], top: (insets.top || 0) + 12 }]} pointerEvents="box-none">
      <View style={styles.card}>
        {device ? (
          <View>
            <Text style={styles.nombre}>{device.nombre_dispositivo || title}</Text>
            <Text style={styles.text}>N° Serie: {device.numero_serie || '-'}</Text>
            <Text style={styles.text}>Ubicación: {device.ubicacion || 'Sin especificar'}</Text>
            <Text style={styles.summary}>{summary || body || title}</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>{title}</Text>
            {body ? <Text style={styles.body}>{body}</Text> : null}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#22c55e33',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    maxWidth: 320,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
    color: '#e5e7eb',
  },
  summary: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 13,
  },
  title: {
    color: '#e6ffed',
    fontWeight: '700',
  },
  body: {
    color: '#cbd5e1',
    marginTop: 4,
  },
});

export default InAppToast;

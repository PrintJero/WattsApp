import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getUsuarioById, fetchDispositivos } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [devicesCount, setDevicesCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (!raw) {
          navigation.replace('Login');
          return;
        }
        const stored = JSON.parse(raw);
        // stored should include id_usuario
        const id = stored.id_usuario || stored.id || null;
        if (!id) {
          setUser(stored);
          setLoading(false);
          return;
        }

        const res = await getUsuarioById(Number(id));
        if (res.success && mounted) {
          setUser(res.data);
        } else if (mounted) {
          setUser(stored);
        }

        // count devices for this user
        const all = await fetchDispositivos();
        if (mounted) {
          const count = all.filter((d) => d.id_usuario === Number(id)).length;
          setDevicesCount(count);
        }
      } catch (err) {
        console.warn('Error cargando perfil:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, [navigation]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return iso;
    }
  };

  const displayName = user?.nombre || 'Perfil';

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'W'}</Text>
        </View>
        <Text style={styles.title}>{displayName}</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <Text style={styles.email}>{user.correo}</Text>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Registrado</Text>
              <Text style={styles.chipValue}>{formatDate(user.fecha_registro) || '—'}</Text>
            </View>

            <View style={styles.chip}>
              <Text style={styles.chipLabel}>Dispositivos</Text>
              <Text style={styles.chipValue}>{devicesCount}</Text>
            </View>
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.smallButtonText}>Mis dispositivos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.smallButton, styles.logoutButton]} onPress={logout}>
              <Text style={styles.smallButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.info}>No hay datos de usuario disponibles.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#22c55e",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 18,
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 10,
  },
  value: {
    color: "#e6eef4",
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#081018',
    borderWidth: 2,
    borderColor: '#12332a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#22c55e',
    fontSize: 36,
    fontWeight: '800',
  },
  card: {
    width: '100%',
    backgroundColor: '#071021',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22c55e22',
  },
  email: {
    color: '#cfe8d6',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    backgroundColor: '#0b1220',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  chipLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  chipValue: {
    color: '#e6eef4',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  smallButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e11d48',
  },
  smallButtonText: {
    color: '#020817',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ProfileScreen;

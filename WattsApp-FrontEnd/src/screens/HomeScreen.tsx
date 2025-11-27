import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TextInput,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchDispositivosByUsuario, Dispositivo, fetchMedicionesByDispositivo, Medicion } from "../services/api";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [latestMap, setLatestMap] = useState<Record<number, Medicion | null>>({});
  const [latestLoading, setLatestLoading] = useState<Record<number, boolean>>({});
  const [updatedAt, setUpdatedAt] = useState<Record<number, number>>({});

  const cargarDispositivos = useCallback(async () => {
    try {
      setLoading(true);
      // Obtener id del usuario de AsyncStorage
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        console.log("Usuario no autenticado");
        return;
      }

      const user = JSON.parse(userStr);
      setIdUsuario(user.id_usuario);

      // Cargar dispositivos del usuario
      const data = await fetchDispositivosByUsuario(user.id_usuario);
      setDispositivos(data);
      // Cargar última medición para cada dispositivo (por lotes)
      try {
        // fetch only the first visible window (first 5) to populate UI faster
        await fetchLatestBatch(data.slice(0, 5));
      } catch (err) {
        console.log('Error al cargar últimas mediciones:', err);
      }
    } catch (error) {
      console.log("Error al cargar dispositivos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Track previous power values to avoid unnecessary updates
  const prevValuesRef = React.useRef<Record<number, number | null>>({});

  // Helper: fetch latest measurements in batches to avoid too many concurrent requests
  const fetchLatestBatch = React.useCallback(async (devices: Dispositivo[], batchSize = 5) => {
    for (let i = 0; i < devices.length; i += batchSize) {
      const slice = devices.slice(i, i + batchSize);
      // mark loading
      setLatestLoading((prev) => {
        const next = { ...prev };
        slice.forEach((d) => (next[d.id_dispositivo] = true));
        return next;
      });

      const results = await Promise.all(
        slice.map(async (d) => {
          try {
            const ms = await fetchMedicionesByDispositivo(d.id_dispositivo);
            return { id: d.id_dispositivo, latest: ms && ms.length > 0 ? ms[0] : null };
          } catch (err) {
            return { id: d.id_dispositivo, latest: null };
          }
        })
      );

      // update map only if potencia value actually changed
      const updatesToApply: Record<number, Medicion | null> = {};
      const now = Date.now();

      results.forEach((r) => {
        const newVal = r.latest?.potencia ?? null;
        const prevVal = prevValuesRef.current[r.id] ?? null;

        // Only update if value changed
        if (Number(newVal) !== Number(prevVal)) {
          updatesToApply[r.id] = r.latest;
          prevValuesRef.current[r.id] = newVal ? Number(newVal) : null;
          if (newVal !== null) {
            setUpdatedAt((u) => ({ ...u, [r.id]: now }));
          }
        }
      });

      // Only update state if there are actual changes
      if (Object.keys(updatesToApply).length > 0) {
        setLatestMap((prev) => ({ ...prev, ...updatesToApply }));
      }

      // clear loading for slice
      setLatestLoading((prev) => {
        const next = { ...prev };
        slice.forEach((d) => delete next[d.id_dispositivo]);
        return next;
      });
    }
  }, []);



  useEffect(() => {
    cargarDispositivos();
  }, [cargarDispositivos]);

  const handleDispositivoPress = (dispositivo: Dispositivo) => {
    navigation.navigate("Mediciones", { 
      id_dispositivo: dispositivo.id_dispositivo,
      nombre_dispositivo: dispositivo.nombre_dispositivo,
    });
  };

  const renderItem = ({ item }: { item: Dispositivo }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleDispositivoPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="power" size={20} color="#22c55e" />
          <Text style={styles.nombre}>{item.nombre_dispositivo}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {latestLoading[item.id_dispositivo] ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : latestMap[item.id_dispositivo] ? (
            (() => {
              const lm = latestMap[item.id_dispositivo]!;
              const t = lm.fecha_hora || null;
              const isConn = t ? (Date.now() - new Date(t).getTime()) <= 15000 : true;
              const wasUpdated = updatedAt[item.id_dispositivo] ? (Date.now() - (updatedAt[item.id_dispositivo] || 0)) <= 2000 : false;
              return (
                <>
                  <Text style={[styles.smallText, isConn ? { color: '#22c55e' } : { color: '#ef4444' }]}>{isConn ? 'Conectado' : 'Desconectado'}</Text>
                  <Text style={[styles.smallText, wasUpdated ? { color: '#a7f3d0', fontWeight: '700' } : {}]}>{Number(lm.potencia || 0).toFixed(1)} W</Text>
                </>
              );
            })()
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#22c55e" />
          )}
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>N° Serie:</Text>
        <Text style={styles.metaValue}>{item.numero_serie}</Text>
      </View>

      {item.ubicacion ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Ubicación:</Text>
          <Text style={styles.metaValue}>{item.ubicacion}</Text>
        </View>
      ) : null}

      {item.descripcion ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Info:</Text>
          <Text style={styles.metaValue}>{item.descripcion}</Text>
        </View>
      ) : null}

      <Text style={styles.textTap}>Toca para ver mediciones →</Text>
    </TouchableOpacity>
  );

  const filtered = dispositivos.filter((d) => {
    const q = debouncedSearch;
    if (!q) return true;
    return (
      d.nombre_dispositivo.toLowerCase().includes(q) ||
      d.numero_serie.toLowerCase().includes(q) ||
      (d.ubicacion || '').toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
      <View style={styles.header}>
        <Text style={[styles.title, { paddingTop: (insets.top || 0) + 4 }]}>WattsApp</Text>
        <Text style={styles.subtitle}>Tus dispositivos</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar dispositivo, serie o ubicación"
          placeholderTextColor="#6b7280"
          style={styles.search}
        />
      </View>

      {loading && dispositivos.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando dispositivos...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id_dispositivo.toString()}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom || 0, 16) }]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={cargarDispositivos}
              tintColor="#22c55e"
            />
          }

          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bug-outline" size={48} color="#6b7280" />
                <Text style={styles.empty}>
                  No tienes dispositivos registrados
                </Text>
                <Text style={styles.emptySubtitle}>
                  Agrega tu primer dispositivo desde la pestaña "Agregar"
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#22c55e",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "600",
    color: "#22c55e",
  },
  text: {
    fontSize: 13,
    color: "#e5e7eb",
    marginVertical: 4,
  },
  textTap: {
    fontSize: 12,
    color: "#22c55e",
    marginTop: 10,
    fontWeight: "500",
  },
  empty: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#6b7280",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  search: {
    marginTop: 12,
    backgroundColor: '#0b1220',
    color: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  smallText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginRight: 8,
    width: 78,
    fontWeight: '600',
  },
  metaValue: {
    color: '#e5e7eb',
    fontSize: 13,
    backgroundColor: '#0b122022',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 8,
  },
});
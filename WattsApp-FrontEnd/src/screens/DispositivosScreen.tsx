import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchDispositivos, Dispositivo } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Dispositivos">;

const DispositivosScreen: React.FC<Props> = () => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const cargarDispositivos = useCallback(async () => {
    setLoading(true);
    const data = await fetchDispositivos();
    setDispositivos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDispositivos();
  }, [cargarDispositivos]);

  const renderItem = ({ item }: { item: Dispositivo }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre_dispositivo}</Text>
      <Text style={styles.text}>N° Serie: {item.numero_serie}</Text>
      <Text style={styles.text}>
        Ubicación: {item.ubicacion || "Sin especificar"}
      </Text>
      {item.descripcion ? (
        <Text style={styles.text}>Detalle: {item.descripcion}</Text>
      ) : null}
      <Text style={styles.textUsuario}>Usuario ID: {item.id_usuario}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis dispositivos</Text>

      {loading && dispositivos.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Cargando dispositivos...</Text>
        </View>
      ) : (
        <FlatList
          data={dispositivos}
          keyExtractor={(item) => item.id_dispositivo.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={cargarDispositivos}
              tintColor="#22c55e"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>
                No hay dispositivos registrados todavía.
              </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  nombre: {
    fontSize: 17,
    fontWeight: "600",
    color: "#22c55e",
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  textUsuario: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  empty: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
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

export default DispositivosScreen;

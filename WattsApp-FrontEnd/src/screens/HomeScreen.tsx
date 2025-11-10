import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WattsApp</Text>
      <Text style={styles.subtitle}>Selecciona una opción para comenzar</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Dispositivos")} // 👈 AHORA SÍ
      >
        <Text style={styles.cardTitle}>Mis dispositivos</Text>
        <Text style={styles.cardText}>
          Consulta y gestiona los dispositivos conectados.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // después: navigation.navigate("OtraPantalla");
        }}
      >
        <Text style={styles.cardTitle}>Mediciones</Text>
        <Text style={styles.cardText}>
          Revisa el consumo registrado por tus dispositivos. (Próximamente)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#22c55e",
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#22c55e33",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#22c55e",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
});
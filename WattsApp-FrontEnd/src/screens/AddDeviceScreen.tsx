import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AddDeviceScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar dispositivo</Text>
      <Text style={styles.info}>Aquí podrás agregar un nuevo dispositivo (pantalla en construcción).</Text>
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
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  info: {
    color: "#cbd5e1",
    textAlign: "center",
  },
});

export default AddDeviceScreen;

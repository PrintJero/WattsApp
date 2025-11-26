import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CalculatorScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora</Text>
      <Text style={styles.info}>Pantalla de calculadora — aquí implementaremos las herramientas de cálculo.</Text>
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

export default CalculatorScreen;

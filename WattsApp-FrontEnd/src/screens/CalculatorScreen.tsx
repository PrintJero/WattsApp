import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CalculatorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
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

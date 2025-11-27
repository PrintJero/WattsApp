import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDispositivo } from "../services/api";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddDeviceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    setError(null);
    if (!nombre.trim()) return "El nombre del dispositivo es requerido";
    if (!numeroSerie.trim()) return "El número de serie es requerido";
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Obtener id_usuario de AsyncStorage
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        setError("Usuario no autenticado. Por favor, inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const id_usuario = user.id_usuario;

      // Hacer petición al backend usando la función centralizada
      const json = await addDispositivo(
        nombre.trim(),
        numeroSerie.trim(),
        id_usuario,
        ubicacion.trim() || undefined,
        descripcion.trim() || undefined
      );

      if (json.success) {
        setSuccess(true);
        // Mostrar alerta de éxito
        Alert.alert("Éxito", "Dispositivo agregado correctamente", [
          {
            text: "OK",
            onPress: () => {
              // Limpiar formulario
              setNombre("");
              setNumeroSerie("");
              setUbicacion("");
              setDescripcion("");
              setSuccess(false);
            },
          },
        ]);
      } else {
        setError(json.message || "Error al agregar dispositivo");
      }
    } catch (err) {
      console.log("Error en agregar dispositivo:", err);
      setError("Error de red al agregar dispositivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: (insets.top || 0) + 12 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#020817" translucent />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Agregar Dispositivo</Text>
          <Text style={styles.subtitle}>
            Completa los datos del nuevo dispositivo
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? (
            <Text style={styles.successMessage}>¡Dispositivo agregado exitosamente!</Text>
          ) : null}

          {/* Campo: Nombre del Dispositivo */}
          <Text style={styles.label}>Nombre del Dispositivo *</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Panel Solar 01"
            placeholderTextColor="#6b7280"
            style={styles.input}
            editable={!loading}
          />

          {/* Campo: Número de Serie */}
          <Text style={styles.label}>Número de Serie *</Text>
          <TextInput
            value={numeroSerie}
            onChangeText={setNumeroSerie}
            placeholder="Ej: SN-123456789"
            placeholderTextColor="#6b7280"
            style={styles.input}
            editable={!loading}
          />

          {/* Campo: Ubicación (Opcional) */}
          <Text style={styles.label}>Ubicación (Opcional)</Text>
          <TextInput
            value={ubicacion}
            onChangeText={setUbicacion}
            placeholder="Ej: Techo, Garaje, etc."
            placeholderTextColor="#6b7280"
            style={styles.input}
            editable={!loading}
          />

          {/* Campo: Descripción (Opcional) */}
          <Text style={styles.label}>Descripción (Opcional)</Text>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Detalles adicionales del dispositivo"
            placeholderTextColor="#6b7280"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            editable={!loading}
          />

          {/* Botón Agregar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#020817" />
            ) : (
              <Text style={styles.buttonText}>Agregar Dispositivo</Text>
            )}
          </TouchableOpacity>

          {/* Nota sobre campos requeridos */}
          <Text style={styles.note}>
            * Los campos marcados con asterisco son obligatorios
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#071021",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e22",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 6,
  },
  subtitle: {
    color: "#9ca3af",
    marginBottom: 16,
    fontSize: 14,
  },
  label: {
    color: "#e5e7eb",
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#020817",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ff6b6b20",
    borderRadius: 6,
    overflow: "hidden",
  },
  successMessage: {
    color: "#22c55e",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#22c55e20",
    borderRadius: 6,
  },
  note: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default AddDeviceScreen;

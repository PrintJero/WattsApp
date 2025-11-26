import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { register as apiRegister } from "../services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    setError(null);
    if (!name.trim()) return "Ingresa tu nombre";
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return "Ingresa un correo válido";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      const res = await apiRegister(name, email, password);
      if (res.success) {
        // guardar usuario en AsyncStorage y navegar
        try {
          await AsyncStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('No se pudo guardar el usuario en AsyncStorage', err);
        }
        navigation.replace("Home");
      } else {
        setError(res.message || "Error en registro");
      }
    } catch (e) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>WattsApp</Text>
        <Text style={styles.subtitle}>Crea una cuenta nueva</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Correo"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#020817" />
          ) : (
            <Text style={styles.buttonText}>Registrarme</Text>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.small}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("navegar a Login: iniciando");
              try {
                InteractionManager.runAfterInteractions(() => {
                  navigation.navigate("Login");
                  console.log("navegar a Login: llamado navigation.navigate");
                });
              } catch (err) {
                console.warn("Error al navegar a Login:", err);
              }
            }}
          >
            <Text style={styles.link}> Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#071021",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e22",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 6,
  },
  subtitle: {
    color: "#9ca3af",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#020817",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  small: {
    color: "#9ca3af",
  },
  link: {
    color: "#22c55e",
    fontWeight: "600",
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 8,
  },
});

export default RegisterScreen;

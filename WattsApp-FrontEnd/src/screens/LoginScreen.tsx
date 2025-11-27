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
  StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { login as apiLogin } from "../services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    setError(null);
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
      const res = await apiLogin(email, password);
      if (res.success) {
        // guardar usuario mínimo en AsyncStorage
        try {
          await AsyncStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('No se pudo guardar el usuario en AsyncStorage', err);
        }
        navigation.replace("Home");
      } else {
        setError(res.message || "Error en login");
      }
    } catch (e) {
      setError("Error de red");
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
      <View style={styles.card}>
        <Text style={styles.title}>WattsApp</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.small}>¿No tienes cuenta?</Text>
          <TouchableOpacity
            onPress={() => {
              console.log("navegar a Register: iniciando");
              try {
                InteractionManager.runAfterInteractions(() => {
                  navigation.navigate("Register");
                  console.log("navegar a Register: llamado navigation.navigate");
                });
              } catch (err) {
                console.warn("Error al navegar a Register:", err);
              }
            }}
          >
            <Text style={styles.link}> Regístrate</Text>
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

export default LoginScreen;

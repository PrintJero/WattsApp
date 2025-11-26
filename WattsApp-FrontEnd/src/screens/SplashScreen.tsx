import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    let mounted = true;
    const decide = async () => {
      try {
        const raw = await AsyncStorage.getItem('user');
        if (!mounted) return;
        if (raw) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch (err) {
        navigation.replace('Login');
      }
    };
    const timer = setTimeout(decide, 1200);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WattsApp</Text>
      <Text style={styles.subtitle}>Monitorea tu consumo de energía</Text>
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020817",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 18,
  },
});

export default SplashScreen;
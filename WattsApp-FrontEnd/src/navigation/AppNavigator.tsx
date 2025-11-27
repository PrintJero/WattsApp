import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import { HomeScreen } from "../screens/HomeScreen";
import MainTabs from "./MainTabs";
import DispositivosScreen from "../screens/DispositivosScreen";
import MedicionesScreen from "../screens/MedicionesScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Dispositivos: undefined;
  Mediciones: { id_dispositivo: number; nombre_dispositivo: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={MainTabs} />
      <Stack.Screen
        name="Dispositivos"
        component={DispositivosScreen}
        options={{ headerShown: true, title: "Mis dispositivos" }}
      />
      <Stack.Screen
        name="Mediciones"
        component={MedicionesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
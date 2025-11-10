import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import { HomeScreen } from "../screens/HomeScreen";
import DispositivosScreen from "../screens/DispositivosScreen"; 

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Dispositivos: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Dispositivos"
        component={DispositivosScreen}
        options={{ headerShown: true, title: "Mis dispositivos" }} // 👈 con header
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

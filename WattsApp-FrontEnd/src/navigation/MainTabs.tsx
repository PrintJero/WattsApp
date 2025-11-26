import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import CalculatorScreen from "../screens/CalculatorScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#020817",
          borderTopColor: "transparent",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any = "home";
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Add") {
            iconName = "add-circle";
          } else if (route.name === "Calculator") {
            iconName = "calculator";
          } else if (route.name === "Profile") {
            iconName = "person-circle";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Add" component={AddDeviceScreen} options={{ title: "Agregar" }} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} options={{ title: "Calculadora" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
};

export default MainTabs;

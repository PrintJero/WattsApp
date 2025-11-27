import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import NotificationCenter from "../screens/NotificationCenter";
import InAppNotifier from "../components/InAppNotifier";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

type RootTabParamList = {
  Home: undefined;
  Add: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const MainTabs: React.FC = () => {
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  return (
    <>
      <InAppNotifier onUnreadCountChange={setUnreadCount} />
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#020817",
          borderTopColor: "transparent",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: any = "home";
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Add") {
            iconName = "add-circle";
          } else if (route.name === "Notifications") {
            iconName = "notifications";
          } else if (route.name === "Profile") {
            iconName = "person-circle";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
      <Tab.Screen name="Add" component={AddDeviceScreen} options={{ title: "Agregar" }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationCenter}
        options={{
          title: "Notificaciones",
          // mostrar un punto en lugar de un número cuando hay notificaciones sin leer
          tabBarBadge: unreadCount ? '' : undefined,
          tabBarBadgeStyle: {
            minWidth: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: '#ff3b30',
            marginTop: 4,
          },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
    </>
  );
};

export default MainTabs;

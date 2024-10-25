import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "¿Un Volado?",
            headerStyle: {
              backgroundColor: "#2196F3",
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: "Historial",
            headerStyle: {
              backgroundColor: "#2196F3",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

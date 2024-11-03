import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";
import { useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import { Audio } from "expo-av";
const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Configurar audio
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
        console.log("Audio configurado correctamente");
      } catch (error) {
        console.error("Error configurando audio:", error);
      }
    };

    setupAudio();
  }, []);
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

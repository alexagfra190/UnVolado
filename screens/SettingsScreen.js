import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [flipSound, setFlipSound] = useState(true);
  const [resultSound, setResultSound] = useState(true);

  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem("soundSettings");
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          console.log(
            "Settings - Configuración actual cargada:",
            parsedSettings
          );
          setFlipSound(parsedSettings.flip);
          setResultSound(parsedSettings.result);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadCurrentSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("soundSettings");
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        console.log("Configuración cargada:", parsedSettings);
        setFlipSound(parsedSettings.flip);
        setResultSound(parsedSettings.result);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSoundSettings = async (flip, result) => {
    try {
      const newSettings = { flip, result };
      console.log("Settings - Guardando nueva configuración:", newSettings);
      await AsyncStorage.setItem("soundSettings", JSON.stringify(newSettings));
      console.log("Settings - Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleFlipSound = async (value) => {
    console.log("Settings - Cambiando sonido de flip a:", value);
    setFlipSound(value);
    await saveSoundSettings(value, resultSound);
  };

  const toggleResultSound = async (value) => {
    console.log("Settings - Cambiando sonido de resultado a:", value);
    setResultSound(value);
    await saveSoundSettings(flipSound, value);
  };

  const toggleAllSounds = async (value) => {
    setFlipSound(value);
    setResultSound(value);
    await saveSoundSettings(value, value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sonidos</Text>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Sonido de Lanzamiento</Text>
          <Switch
            value={flipSound}
            onValueChange={toggleFlipSound}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={flipSound ? "#2196F3" : "#f4f3f4"}
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Sonido de Resultado</Text>
          <Switch
            value={resultSound}
            onValueChange={toggleResultSound}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={resultSound ? "#2196F3" : "#f4f3f4"}
          />
        </View>

        <View style={[styles.optionContainer, styles.separator]}>
          <Text style={styles.optionText}>Todos los Sonidos</Text>
          <Switch
            value={flipSound && resultSound}
            onValueChange={toggleAllSounds}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={flipSound && resultSound ? "#2196F3" : "#f4f3f4"}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  section: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  separator: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});

export default SettingsScreen;

import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [soundSettings, setSoundSettings] = useState({
    flip: true,
    result: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("soundSettings");
      if (settings) {
        setSoundSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem("soundSettings", JSON.stringify(newSettings));
      setSoundSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleFlipSound = () => {
    const newSettings = {
      ...soundSettings,
      flip: !soundSettings.flip,
    };
    saveSettings(newSettings);
  };

  const toggleResultSound = () => {
    const newSettings = {
      ...soundSettings,
      result: !soundSettings.result,
    };
    saveSettings(newSettings);
  };

  const toggleAllSounds = () => {
    const newValue = !(soundSettings.flip && soundSettings.result);
    const newSettings = {
      flip: newValue,
      result: newValue,
    };
    saveSettings(newSettings);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sonidos</Text>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Sonido de Lanzamiento</Text>
          <Switch
            value={soundSettings.flip}
            onValueChange={toggleFlipSound}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={soundSettings.flip ? "#2196F3" : "#f4f3f4"}
          />
        </View>

        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Sonido de Resultado</Text>
          <Switch
            value={soundSettings.result}
            onValueChange={toggleResultSound}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={soundSettings.result ? "#2196F3" : "#f4f3f4"}
          />
        </View>

        <View style={[styles.optionContainer, styles.separator]}>
          <Text style={styles.optionText}>Todos los Sonidos</Text>
          <Switch
            value={soundSettings.flip && soundSettings.result}
            onValueChange={toggleAllSounds}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={
              soundSettings.flip && soundSettings.result ? "#2196F3" : "#f4f3f4"
            }
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

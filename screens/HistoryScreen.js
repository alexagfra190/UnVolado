import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get("window").width;

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("flipHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Agregar log para ver qué datos están llegando
        console.log("Datos cargados:", JSON.stringify(parsedHistory, null, 2));

        // Limpiar los datos antes de guardarlos en el estado
        const cleanHistory = parsedHistory.map((item) => ({
          ...item,
          coinType:
            typeof item.coinType === "object"
              ? item.coinType.value
              : item.coinType,
        }));

        setHistory(cleanHistory.reverse());
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    };
    return new Date(dateString).toLocaleString("es-MX", options);
  };

  const stats = history.reduce(
    (acc, flip) => {
      acc.total += 1;
      acc[flip.result === "Águila" ? "aguila" : "sol"] += 1;
      return acc;
    },
    { total: 0, aguila: 0, sol: 0 }
  );

  // Calcular porcentajes
  const percentages = {
    aguila:
      stats.total > 0 ? ((stats.aguila / stats.total) * 100).toFixed(1) : 0,
    sol: stats.total > 0 ? ((stats.sol / stats.total) * 100).toFixed(1) : 0,
  };

  return (
    <View style={styles.container}>
      {/* Sección de Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statPercentage}>{percentages.aguila}%</Text>
            <Text style={styles.statNumber}>{stats.aguila}</Text>
            <Text style={styles.statLabel}>Águila</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statPercentage}>{percentages.sol}%</Text>
            <Text style={styles.statNumber}>{stats.sol}</Text>
            <Text style={styles.statLabel}>Sol</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.historyList}>
        {history.length > 0 ? (
          history.map((flip, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyResult}>{flip.result || "N/A"}</Text>
                <Text style={styles.historyCoin}>
                  {typeof flip.coinType === "string" ? flip.coinType : "N/A"}
                </Text>
              </View>
              <Text style={styles.historyDate}>{formatDate(flip.date)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyHistory}>
            No hay lanzamientos registrados
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  statsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemLeft: {
    flexDirection: "column",
  },
  historyResult: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  historyCoin: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  historyDate: {
    fontSize: 14,
    color: "#666",
  },
  emptyHistory: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
});

export default HistoryScreen;

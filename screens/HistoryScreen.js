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

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // En HistoryScreen.js
  useEffect(() => {
    loadHistory(); // Carga inicial

    const unsubscribe = navigation.addListener("focus", () => {
      console.log("HistoryScreen recibió foco, recargando historial...");
      loadHistory();
    });

    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("flipHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        console.log("Historial cargado - datos brutos:", parsedHistory);

        if (!Array.isArray(parsedHistory)) {
          console.log("El historial no es un array, inicializando vacío");
          setHistory([]);
          return;
        }

        // Asegurarnos de que cada item tenga la estructura correcta
        const cleanHistory = parsedHistory.map((item) => {
          console.log("Procesando item:", item);
          return {
            result: item.result || "N/A",
            date: item.date || new Date().toISOString(),
            coinType: item.coinType || "N/A",
          };
        });

        console.log("Historial procesado:", cleanHistory);
        setHistory(cleanHistory.reverse());
      } else {
        console.log("No hay historial guardado");
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    }
  };

  const handleClearPress = () => {
    if (history.length > 0) {
      // Solo mostrar confirmación si hay historial
      setShowConfirm(true);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.setItem("flipHistory", JSON.stringify([]));
      setHistory([]);
      setShowConfirm(false); // Asegurarnos de cerrar el diálogo
    } catch (error) {
      console.error("Error clearing history:", error);
      setShowConfirm(false); // Cerrar el diálogo incluso si hay error
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

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Historial de lanzamientos</Text>
        <TouchableOpacity
          style={[
            styles.clearButton,
            history.length === 0 && styles.clearButtonDisabled, // Añadir estilo desactivado
          ]}
          onPress={handleClearPress}
          disabled={history.length === 0} // Deshabilitar botón si no hay historial
        >
          <Text
            style={[
              styles.clearButtonText,
              history.length === 0 && styles.clearButtonTextDisabled, // Texto más claro cuando está deshabilitado
            ]}
          >
            Limpiar
          </Text>
        </TouchableOpacity>
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

      {showConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>¿Estás seguro?</Text>
            <Text style={styles.confirmMessage}>
              Esta acción eliminará todo el historial de lanzamientos
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.confirmButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={clearHistory}
              >
                <Text
                  style={[styles.confirmButtonText, styles.deleteButtonText]}
                >
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  confirmOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmDialog: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  confirmMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#ff6b6b",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: "white",
  },
  clearButtonDisabled: {
    backgroundColor: "#ffb3b3", // Un rojo más claro
    opacity: 0.5,
  },
  clearButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.7)", // Texto más transparente
  },
});

export default HistoryScreen;

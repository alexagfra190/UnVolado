import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get("window").height;

// Definición de las monedas disponibles con ambas caras
const COINS = [
  {
    id: "50c",
    value: "50¢",
    solImage: require("../assets/50centavos.png"),
    aguilaImage: require("../assets/50centavosReverse.png"),
  },
  {
    id: "1p",
    value: "$1",
    solImage: require("../assets/1peso.png"),
    aguilaImage: require("../assets/1pesoReverse.png"),
  },
  {
    id: "2p",
    value: "$2",
    solImage: require("../assets/2pesos.png"),
    aguilaImage: require("../assets/2pesosReverse.png"),
  },
  {
    id: "5p",
    value: "$5",
    solImage: require("../assets/5pesos.png"),
    aguilaImage: require("../assets/5pesosReverse.png"),
  },
  {
    id: "10p",
    value: "$10",
    solImage: require("../assets/10pesos.png"),
    aguilaImage: require("../assets/10pesosReverse.png"),
  },
];

const HomeScreen = ({ navigation }) => {
  const [selectedCoin, setSelectedCoin] = useState(COINS[1]); // $1 peso por defecto
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showingAguilaFace, setShowingAguilaFace] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const positionY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (!isFlipping) {
          positionY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50 && !isFlipping) {
          flipCoin();
        } else {
          Animated.spring(positionY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const flipCoin = () => {
    setIsFlipping(true);
    const newResult = Math.random() < 0.5 ? "Águila" : "Sol";

    // Secuencia de animación mejorada para mostrar ambas caras
    Animated.sequence([
      // Lanzamiento hacia arriba
      Animated.timing(positionY, {
        toValue: -windowHeight / 4,
        duration: 500,
        useNativeDriver: true,
      }),
      // Giros con cambios de cara
      Animated.parallel([
        Animated.timing(flipAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(positionY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setResult(newResult);
      setIsFlipping(false);
      flipAnimation.setValue(0);
      setShowingAguilaFace(newResult === "Águila");
      saveResult(newResult);
    });
  };

  const saveResult = async (newResult) => {
    try {
      const history = await AsyncStorage.getItem("flipHistory");
      const parsedHistory = history ? JSON.parse(history) : [];

      // Asegurarnos de solo guardar los datos necesarios
      const historyItem = {
        result: newResult,
        date: new Date().toISOString(),
        coinType: selectedCoin.value,
      };

      console.log("Guardando:", historyItem); // Para depuración

      const updatedHistory = [...parsedHistory, historyItem];
      await AsyncStorage.setItem("flipHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const spin = flipAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "180deg", "360deg", "540deg", "720deg"],
  });

  // Interpolación para la opacidad de cada cara
  const solOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  const aguilaOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Selecciona una moneda y deslízala hacia arriba
      </Text>

      <ScrollView
        horizontal
        style={styles.coinSelector}
        showsHorizontalScrollIndicator={false}
      >
        {COINS.map((coin) => (
          <TouchableOpacity
            key={coin.id}
            style={[
              styles.coinOption,
              selectedCoin.id === coin.id && styles.selectedCoinOption,
            ]}
            onPress={() => setSelectedCoin(coin)}
          >
            <Image
              source={coin.solImage}
              style={styles.coinThumbnail}
              resizeMode="contain"
            />
            <Text style={styles.coinValue}>{coin.value}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.coinArea}>
        <Animated.View
          style={[
            styles.coin,
            {
              transform: [{ translateY: positionY }, { rotateX: spin }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Cara Sol */}
          <Animated.View
            style={[
              styles.coinFace,
              { opacity: isFlipping ? solOpacity : !showingAguilaFace ? 1 : 0 },
            ]}
          >
            <Image
              source={selectedCoin.solImage}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Cara Águila */}
          <Animated.View
            style={[
              styles.coinFace,
              styles.coinFaceBack,
              {
                opacity: isFlipping ? aguilaOpacity : showingAguilaFace ? 1 : 0,
              },
            ]}
          >
            <Image
              source={selectedCoin.aguilaImage}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate("History")}
      >
        <Text style={styles.historyButtonText}>Ver Historial</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  instructions: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  coinSelector: {
    maxHeight: 100,
    marginBottom: 20,
  },
  coinOption: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    width: 80,
  },
  selectedCoinOption: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  coinThumbnail: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  coinValue: {
    fontSize: 12,
    color: "#333",
  },
  coinArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  coin: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  coinFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 75,
    backgroundColor: "#FFD700",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  coinFaceBack: {
    transform: [{ rotateX: "180deg" }],
  },
  coinImage: {
    width: "100%",
    height: "100%",
  },
  resultContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  historyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  historyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;

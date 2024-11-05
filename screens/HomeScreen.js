import React, { useState, useRef, useEffect } from "react";
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
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get("window").height;

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
  const selectedCoinRef = useRef(COINS[1]); // Usamos useRef para la moneda seleccionada
  const [selectedCoin, setSelectedCoin] = useState(COINS[1]);
  const [result, setResult] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showingAguilaFace, setShowingAguilaFace] = useState(false);
  const [soundSettings, setSoundSettings] = useState({
    flip: true,
    result: true,
  });

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const positionY = useRef(new Animated.Value(0)).current;
  const flipSoundRef = useRef(null);
  const resultSoundRef = useRef(null);

  useEffect(() => {
    loadSounds();
    loadSoundSettings();

    const initializeScreen = async () => {
      await loadSounds();
      await loadSoundSettings();
    };

    initializeScreen();

    // Suscribirse al evento focus
    const unsubscribe = navigation.addListener("focus", async () => {
      // Recargar configuración cuando la pantalla recibe foco
      await loadSoundSettings();
    });
    return () => {
      unloadSounds();
      unsubscribe();
    };
  }, [navigation]);

  useEffect(() => {
    console.log("showingAguilaFace cambió a:", showingAguilaFace);
    console.log("Resultado actual:", result);
  }, [showingAguilaFace, result]);

  const loadSoundSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("soundSettings");
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        // console.log("Cargando configuración:", parsedSettings);
        setSoundSettings(parsedSettings);
        return parsedSettings; // Retornamos la configuración
      }
      return soundSettings; // Retornamos el estado actual si no hay configuración guardada
    } catch (error) {
      console.error("Error loading sound settings:", error);
      return soundSettings; // Retornamos el estado actual en caso de error
    }
  };

  const loadSounds = async () => {
    try {
      const { sound: flip } = await Audio.Sound.createAsync(
        require("../assets/sounds/flip.mp3")
      );
      flipSoundRef.current = flip;

      const { sound: result } = await Audio.Sound.createAsync(
        require("../assets/sounds/result.mp3")
      );
      resultSoundRef.current = result;

      // console.log("Sonidos cargados exitosamente");
    } catch (error) {
      console.error("Error cargando sonidos:", error);
    }
  };

  const unloadSounds = async () => {
    try {
      if (flipSoundRef.current) await flipSoundRef.current.unloadAsync();
      if (resultSoundRef.current) await resultSoundRef.current.unloadAsync();
    } catch (error) {
      console.error("Error descargando sonidos:", error);
    }
  };

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

  const playFlipSound = async () => {
    try {
      // Leer directamente de AsyncStorage
      const settings = await AsyncStorage.getItem("soundSettings");
      const soundConfig = settings
        ? JSON.parse(settings)
        : { flip: true, result: true };

      // console.log("Config actual flip:", soundConfig);

      if (!soundConfig.flip) {
        // console.log("Sonido flip desactivado");
        return;
      }

      if (flipSoundRef.current) {
        await flipSoundRef.current.replayAsync();
      }
    } catch (error) {
      console.error("Error en playFlipSound:", error);
    }
  };

  const playResultSound = async () => {
    try {
      // Leer directamente de AsyncStorage
      const settings = await AsyncStorage.getItem("soundSettings");
      const soundConfig = settings
        ? JSON.parse(settings)
        : { flip: true, result: true };

      // console.log("Config actual result:", soundConfig);

      if (!soundConfig.result) {
        // console.log("Sonido resultado desactivado");
        return;
      }

      if (resultSoundRef.current) {
        await resultSoundRef.current.replayAsync();
      }
    } catch (error) {
      console.error("Error en playResultSound:", error);
    }
  };

  const flipCoin = () => {
    const newResult = Math.random() < 0.5 ? "Águila" : "Sol";
    console.log("------------------------");
    console.log("INICIO DE LANZAMIENTO");
    console.log("Resultado generado:", newResult);

    setIsFlipping(true);
    // Asegurar que la cara inicial sea la correcta
    setShowingAguilaFace(false);
    // Primera animación y sonido
    playFlipSound();

    const finishFlip = () => {
      // Usamos una función para asegurar que los estados se actualicen juntos
      const updates = () => {
        setIsFlipping(false);
        setShowingAguilaFace(newResult === "Águila");
        setResult(newResult);
      };

      // if (soundSettings.result) {
      playResultSound();
      // }

      flipAnimation.setValue(0);
      updates();
      saveResult(newResult);
    };

    Animated.sequence([
      Animated.timing(positionY, {
        toValue: -windowHeight / 4,
        duration: 500,
        useNativeDriver: true,
      }),
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
    ]).start(finishFlip);
  };

  const handleCoinSelection = (coin) => {
    console.log("Seleccionando moneda:", coin);
    selectedCoinRef.current = coin; // Actualizamos la referencia
    setSelectedCoin(coin);
  };

  const saveResult = async (newResult) => {
    try {
      const currentCoin = selectedCoinRef.current;
      // console.log("Moneda actual al guardar:", currentCoin);

      // Primero leemos el historial existente
      let currentHistory = [];
      const savedHistory = await AsyncStorage.getItem("flipHistory");
      if (savedHistory) {
        currentHistory = JSON.parse(savedHistory);
        // console.log("Historial existente:", currentHistory);
      }

      // Creamos el nuevo item
      const historyItem = {
        result: newResult,
        date: new Date().toISOString(),
        coinType: currentCoin.value,
      };

      // console.log("Nuevo item para historial:", historyItem);

      // Agregamos el nuevo item al historial
      const updatedHistory = [...currentHistory, historyItem];
      // console.log("Historial actualizado:", updatedHistory);

      // Guardamos el historial actualizado
      await AsyncStorage.setItem("flipHistory", JSON.stringify(updatedHistory));
      // console.log("Historial guardado exitosamente");
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const spin = flipAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "180deg", "360deg", "540deg", "720deg"],
  });

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
            onPress={() => handleCoinSelection(coin)}
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
          <Animated.View
            style={[
              styles.coinFace,
              {
                opacity: isFlipping ? solOpacity : !showingAguilaFace ? 1 : 0,
                display: isFlipping || !showingAguilaFace ? "flex" : "none",
              },
            ]}
          >
            <Image
              source={selectedCoin.solImage}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.coinFace,
              styles.coinFaceBack,
              {
                opacity: isFlipping ? aguilaOpacity : showingAguilaFace ? 1 : 0,
                display: isFlipping || showingAguilaFace ? "flex" : "none",
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
});

export default HomeScreen;

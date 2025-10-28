import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
} from "react-native";
import { Button, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const buttonScale1 = useRef(new Animated.Value(1)).current;
  const buttonScale2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function fetchData() {
      await fetch("https://suhasmkanter-brain-tumor.hf.space/");
    }
    fetchData();
  }, []);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const handleButtonPressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <LinearGradient colors={["#1C2526", "#2E2E2E"]} style={styles.gradient}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <SafeAreaView style={{ width: "100%" }}>
          {/* Header with title and profile photo */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Predictive Health</Text>
            <Text style={styles.subtitle}>AI-powered medical insights</Text>

            <Divider style={styles.divider} />

            <View style={styles.buttonContainer}>
              <Pressable
                onPressIn={() => handleButtonPressIn(buttonScale1)}
                onPressOut={() => handleButtonPressOut(buttonScale1)}
                onPress={() => router.push("./UploadArea")}
              >
                <Animated.View
                  style={[
                    styles.primaryButton,
                    { transform: [{ scale: buttonScale1 }] },
                  ]}
                >
                  <Button
                    mode="contained"
                    style={styles.buttonInner}
                    contentStyle={styles.buttonContent}
                    icon="brain"
                    labelStyle={styles.buttonText}
                    accessibilityLabel="Brain tumor prediction"
                    buttonColor="#1E3A8A"
                  >
                    Brain Tumor Prediction
                  </Button>
                </Animated.View>
              </Pressable>

              <Pressable
                onPressIn={() => handleButtonPressIn(buttonScale2)}
                onPressOut={() => handleButtonPressOut(buttonScale2)}
                onPress={() => router.push("./HeartDiseaseScreen")}
              >
                <Animated.View
                  style={[
                    styles.secondaryButton,
                    { transform: [{ scale: buttonScale2 }] },
                  ]}
                >
                  <Button
                    mode="contained"
                    style={styles.buttonInner}
                    contentStyle={styles.buttonContent}
                    icon="heart-pulse"
                    labelStyle={styles.buttonText}
                    accessibilityLabel="Heart disease prediction"
                    buttonColor="#2B2D42"
                  >
                    Heart Disease Prediction
                  </Button>
                </Animated.View>
              </Pressable>
            </View>

            <Text style={styles.footer}>
              © 2025 NeuroCardioAI. All rights reserved.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, width: "100%", paddingHorizontal: 24, top: 70 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  profilePhoto: { width: 40, height: 40, borderRadius: 20 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#F5F6FA",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  divider: {
    width: "85%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginVertical: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 20,
    paddingHorizontal: 10,
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: "#1E3A8A",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderRadius: 16,
    backgroundColor: "#2B2D42",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonInner: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonContent: {
    height: 56,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  infoContainer: {
    marginTop: 36,
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#F5F6FA",
    textAlign: "center",
    fontWeight: "400",
  },
  footer: {
    color: "#F5F6FA",
    fontSize: 13,
    marginTop: 40,
    textAlign: "center",
    opacity: 0.7,
  },
});

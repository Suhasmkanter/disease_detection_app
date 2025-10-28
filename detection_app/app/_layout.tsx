// app/_layout.tsx
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { View, Text, Image, StyleSheet, SafeAreaView } from "react-native";

export default function Layout() {
  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1C2526" }}>
        {/* Custom persistent header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NeuroCardioAI</Text>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=3" }}
            style={styles.profilePhoto}
          />
        </View>

        {/* Stack navigator */}
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="HomeScreen"
            options={{
              title: "NeoCardio Health App",
            }}
          />
          <Stack.Screen
            name="BrainTumorScreen"
            options={{
              title: "Brain Tumor Prediction",
            }}
          />
          <Stack.Screen
            name="HeartDiseaseScreen"
            options={{
              title: "Heart Disease Prediction",
            }}
          />
        </Stack>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 12,
    top: 20,
    height: 100,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

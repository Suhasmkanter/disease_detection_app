import React from "react";
import {
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";

type ProbabilityEntry = [string, number];

export default function PredictionDetailModal() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const probabilities: Record<string, number> = params.probabilities
    ? JSON.parse(params.probabilities as string)
    : {};

  const data = {
    uri: params.uri as string,
    fileName: params.fileName as string,
    disease: params.disease as string,
    confidence: Number(params.confidence),
    probabilities,
  };

  return (
    <Modal visible={true} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header with X button */}
          <View style={styles.header}>
            <Text style={styles.title}>{data.fileName || "Untitled"}</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <X color="#fff" size={22} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Image
              source={{ uri: data.uri }}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.label}>Disease</Text>
            <Text style={styles.value}>{data.disease}</Text>

            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.value}>
              {(data.confidence * 100).toFixed(2)}%
            </Text>

            <Text style={styles.sectionTitle}>Confidence Breakdown</Text>
            {Object.entries(data.probabilities).map(
              ([label, prob]: ProbabilityEntry, idx) => (
                <View key={idx} style={styles.probRow}>
                  <View style={styles.probHeader}>
                    <Text style={styles.probLabel}>{label}</Text>
                    <Text style={styles.probValue}>
                      {(prob * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.barContainer}>
                    <View
                      style={[styles.barFill, { width: `${prob * 100}%` }]}
                    />
                  </View>
                </View>
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 15,
  },
  card: {
    backgroundColor: "#181818",
    borderRadius: 14,
    overflow: "hidden",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  content: { padding: 16 },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  label: { color: "#aaa", marginTop: 10 },
  value: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 15,
  },
  probRow: { marginTop: 6 },
  probHeader: { flexDirection: "row", justifyContent: "space-between" },
  probLabel: { color: "#aaa", fontSize: 13 },
  probValue: { color: "#fff", fontSize: 13, fontWeight: "600" },
  barContainer: {
    backgroundColor: "#333",
    height: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  barFill: { backgroundColor: "#4CAF50", height: 6, borderRadius: 4 },
});

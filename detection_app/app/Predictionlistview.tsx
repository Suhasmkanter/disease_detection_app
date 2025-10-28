import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

export default function PredictionListView({ images, onSelectImage }: any) {
  const predictedImages = images?.filter((img: any) => img.prediction);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => onSelectImage(item)}>
      <Image
        source={{ uri: item.preview || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.filename} numberOfLines={1}>
          {item.file?.name}
        </Text>
        <Text style={styles.text}>
          Tumor Type: <Text style={styles.bold}>{item.prediction?.type}</Text>
        </Text>
        <Text style={styles.text}>
          Confidence:{" "}
          <Text style={styles.primary}>
            {(item.prediction?.confidence * 100).toFixed(1)}%
          </Text>
        </Text>
      </View>
      <ChevronRight color="#888" size={20} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={predictedImages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id?.toString()}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  details: { flex: 1, marginLeft: 12 },
  filename: { fontWeight: "bold", color: "#fff", marginBottom: 4 },
  text: { color: "#aaa", fontSize: 13 },
  bold: { color: "#fff", fontWeight: "600" },
  primary: { color: "#4CAF50", fontWeight: "600" },
});

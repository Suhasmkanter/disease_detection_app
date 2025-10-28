import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
} from "react-native";
import * as mime from "react-native-mime-types";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Button, Card, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function UploadArea() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [uploadDisplay, setUploadDisplay] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [predictingAll, setPredictingAll] = useState(false);

  // 🧠 Pick images
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: (ImagePicker.MediaTypeOptions as any).Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => ({
        id: Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        fileName: asset.fileName || "image.jpg",
        loading: false,
        prediction: null,
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const exportResults = async () => {
    const predicted = images.filter((img) => img.prediction);
    if (predicted.length === 0) return Alert.alert("No predictions to export.");

    let csv = "Filename,Disease,Confidence,Probabilities\n";
    predicted.forEach((img) => {
      const { type, confidence, probabilities } = img.prediction;
      const probs = Object.entries(probabilities || {})
        .map(([label, val]) => `${label}:${(Number(val) * 100).toFixed(2)}%`)
        .join(" | ");
      csv += `${img.fileName},${type},${(confidence * 100).toFixed(
        2
      )}%,"${probs}"\n`;
    });

    const dir = (FileSystem as any).documentDirectory;
    const fileUri = dir + "brain_tumor_predictions.csv";
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: (FileSystem as any).EncodingType.UTF8,
    });
    await Sharing.shareAsync(fileUri);
  };

  async function predictAll() {
    try {
      setPredictingAll(true);
      setImages((prev) => prev.map((i) => ({ ...i, loading: true })));

      const formData = new FormData();
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const fileType = mime.lookup(img.uri) || "image/jpeg";
        formData.append("images", {
          uri: img.uri.startsWith("file://") ? img.uri : `file://${img.uri}`,
          type: fileType,
          name: img.fileName || `image_${i}.${fileType.split("/")[1]}`,
        } as any);
      }

      const response = await fetch("http://10.241.33.53:3000/predict", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = JSON.parse(text);

      setImages((prev) =>
        prev.map((img, idx) => ({
          ...img,
          loading: false,
          prediction: result?.predictions?.[idx]
            ? {
                disease: result.predictions[idx].disease,
                confidence: result.predictions[idx].confidence,
                probabilities: result.predictions[idx].probabilities,
              }
            : { disease: "Unknown", confidence: 0 },
        }))
      );

      Alert.alert("✅ Predictions updated!");
      setViewMode("list");
    } catch (err) {
      console.error("❌ Prediction failed:", err);
      Alert.alert("Error", "Prediction failed.");
    } finally {
      setPredictingAll(false);
    }
  }

  // 🧩 Grid View Item
  const renderGridItem = ({ item }: { item: any }) => (
    <Pressable
      style={styles.gridPressable}
      onPress={() =>
        router.push({
          pathname: "/PredictionDetailModal",
          params: {
            uri: item.uri,
            fileName: item.fileName,
            disease: item.prediction?.disease,
            confidence: item.prediction?.confidence,
            probabilities: JSON.stringify(item.prediction?.probabilities || {}),
          },
        })
      }
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.uri }} style={styles.image} />
          <Pressable
            onPress={() => removeImage(item.id)}
            style={styles.removeButton}
          >
            <MaterialCommunityIcons name="close-circle" size={24} color="red" />
          </Pressable>
          {item.loading && <ActivityIndicator style={styles.loader} />}
        </View>
        {item.prediction && (
          <View style={styles.predictionBox}>
            <Text style={styles.predLabel}>{item.prediction.disease}</Text>
            <Text style={styles.predValue}>
              {(item.prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );

  // 🧩 List View Item
  const renderListItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/PredictionDetailModal",
          params: {
            uri: item.uri,
            fileName: item.fileName,
            disease: item.prediction?.disease,
            confidence: item.prediction?.confidence,
            probabilities: JSON.stringify(item.prediction?.probabilities || {}),
          },
        })
      }
    >
      <View style={styles.listItem}>
        <Image source={{ uri: item.uri }} style={styles.listImage} />
        <View style={styles.listContent}>
          <Text style={styles.listFile}>{item.fileName}</Text>
          {item.prediction ? (
            <>
              <Text style={styles.predLabel}>
                Disease: {item.prediction.disease}
              </Text>
              <Text style={styles.predValue}>
                Confidence: {(item.prediction.confidence * 100).toFixed(1)}%
              </Text>
            </>
          ) : (
            <Text>No prediction yet</Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {uploadDisplay && (
        <Card style={styles.uploadCard}>
          <Text style={styles.title}>Upload MRI Images</Text>
          <Text style={styles.subtitle}>
            Pick from gallery to start analysis
          </Text>
          <Button
            textColor="white"
            style={{ backgroundColor: "black" }}
            mode="contained"
            onPress={pickImages}
          >
            Select Files
          </Button>
        </Card>
      )}

      {images.length > 0 && (
        <View style={styles.controls}>
          <Button
            mode="contained"
            onPress={predictAll}
            disabled={predictingAll}
            style={styles.predictAllBtn}
          >
            {predictingAll ? "Predicting..." : "Predict All"}
          </Button>

          <View style={styles.secondaryControls}>
            <Button
              mode="outlined"
              onPress={() => setViewMode("grid")}
              style={styles.smallBtn}
            >
              Grid
            </Button>
            <Button
              mode="outlined"
              onPress={() => setViewMode("list")}
              style={styles.smallBtn}
            >
              List
            </Button>
            <Button
              mode="outlined"
              onPress={exportResults}
              style={styles.smallBtn}
            >
              Export CSV
            </Button>
          </View>
        </View>
      )}

      {images.length > 0 ? (
        <FlatList
          data={images}
          key={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={viewMode === "list" ? renderListItem : renderGridItem}
          numColumns={viewMode === "grid" ? 2 : 1}
          columnWrapperStyle={
            viewMode === "grid"
              ? { justifyContent: "space-between" }
              : undefined
          }
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text>No images uploaded yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  uploadCard: {
    display: "flex",
    flexDirection: "column",
    padding: 20,
    alignContent: "center",
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    alignSelf: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: { alignSelf: "center", color: "gray", marginBottom: 16 },
  controls: {
    width: "100%",
    padding: 10,
  },

  predictAllBtn: {
    width: "100%",
    marginBottom: 10,
    backgroundColor: "black",
  },

  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallBtn: {
    flex: 1,
    marginHorizontal: 4,
  },

  gridContainer: {
    paddingBottom: 120,
  },
  gridPressable: { flex: 1, margin: 6 },
  card: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 150, objectFit: "cover" },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },
  loader: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  predictionBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  predLabel: { fontWeight: "600", color: "#222" },
  predValue: { color: "#007AFF", fontWeight: "600" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 4,
    elevation: 1,
  },
  listImage: { width: 80, height: 80, borderRadius: 8 },
  listContent: { flex: 1, marginLeft: 12 },
  listFile: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
});

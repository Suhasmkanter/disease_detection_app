import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button, Card } from "react-native-paper";
import axios from "axios";
interface Prediction {
  has_tumor?: boolean;
  confidence?: number;
  message?: string;
}
const BrainTumorScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied!");
      return;
    }
    const permissionResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!permissionResult.canceled) {
      setImage(permissionResult.assets[0].uri);
      setPrediction(null);
      setError(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!permissionResult.canceled) {
      setImage(permissionResult.assets[0].uri);
      setPrediction(null);
      setError(null);
    }
  };

  const predictBrainTumor = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "brain_scan.jpg",
      } as any);

      const response = await axios.post(
        "https://example.com/brain-tumor/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPrediction(response.data);
    } catch (err) {
      console.error("Error predicting brain tumor:", err);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Brain Tumor Prediction</Text>
          <Text style={styles.description}>
            Upload a brain scan image to predict the presence of a tumor.
          </Text>
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.imageButtons}>
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.button}
          icon="image"
        >
          Choose from Gallery
        </Button>
        <Button
          mode="contained"
          onPress={takePhoto}
          style={styles.button}
          icon="camera"
        >
          Take Photo
        </Button>
      </View>

      {image && (
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text style={styles.previewTitle}>Image Preview</Text>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </Card.Content>
        </Card>
      )}

      {image && !loading && !error && (
        <TouchableOpacity
          style={styles.predictButton}
          onPress={predictBrainTumor}
        >
          <Button
            mode="contained"
            style={styles.predictButtonContent}
            icon="brain"
            disabled={loading}
          >
            Predict Brain Tumor
          </Button>
        </TouchableOpacity>
      )}

      {prediction && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultTitle}>Prediction Result</Text>
            {prediction.has_tumor !== undefined ? (
              <View>
                <Text style={styles.resultText}>
                  Has Tumor: {prediction.has_tumor ? "Yes" : "No"}
                </Text>
                {prediction.confidence && (
                  <Text style={styles.resultText}>
                    Confidence: {(prediction.confidence * 100).toFixed(2)}%
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.resultText}>
                {prediction.message || "Unknown result"}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0066cc",
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorCard: {
    margin: 20,
    backgroundColor: "#ffebee",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
  },
  imageButtons: {
    margin: 20,
    gap: 10,
  },
  button: {
    marginBottom: 10,
  },
  previewCard: {
    margin: 20,
    backgroundColor: "#fff",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0066cc",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  predictButton: {
    margin: 20,
  },
  predictButtonContent: {
    backgroundColor: "#0066cc",
  },
  resultCard: {
    margin: 20,
    backgroundColor: "#fff",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0066cc",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
});

export default BrainTumorScreen;

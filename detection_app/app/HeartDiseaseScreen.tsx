import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import axios from "axios";
interface Prediction {
  riskLevel?: string;
  probability?: number;
  message?: string;
}
const HeartDiseaseScreen = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    bloodPressure: "",
    cholesterol: "",
    otherFeatures: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const validateInputs = () => {
    const { age, gender, bloodPressure, cholesterol } = formData;
    if (!age || !gender || !bloodPressure || !cholesterol) {
      Alert.alert("Validation Error", "All fields are required");
      return false;
    }
    if (age && bloodPressure && cholesterol) {
      Alert.alert("Validation Error", "Please enter valid numbers");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await axios.post(
        "https://example.com/heart-disease/predict",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setPrediction(response.data);
    } catch (err) {
      console.error("Heart disease prediction error:", err);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Heart Disease Prediction</Text>
          <Text style={styles.description}>
            Enter patient data to predict heart disease risk.
          </Text>
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Analyzing data...</Text>
        </View>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Age"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Gender (M/F)"
            value={formData.gender}
            onChangeText={(text) =>
              setFormData({ ...formData, gender: text.toUpperCase() })
            }
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Blood Pressure (mm Hg)"
            value={formData.bloodPressure}
            onChangeText={(text) =>
              setFormData({ ...formData, bloodPressure: text })
            }
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Cholesterol (mg/dL)"
            value={formData.cholesterol}
            onChangeText={(text) =>
              setFormData({ ...formData, cholesterol: text })
            }
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Other Features"
            value={formData.otherFeatures}
            onChangeText={(text) =>
              setFormData({ ...formData, otherFeatures: text })
            }
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
          />
        </Card.Content>
      </Card>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Button
          mode="contained"
          style={styles.submitButtonContent}
          icon="heart"
          disabled={loading}
        >
          Predict Heart Disease
        </Button>
      </TouchableOpacity>

      {prediction && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultTitle}>Prediction Result</Text>
            {prediction.riskLevel ? (
              <Text style={styles.resultText}>
                Risk Level: {prediction.riskLevel}
              </Text>
            ) : (
              <Text style={styles.resultText}>
                {prediction.message || "Unknown result"}
              </Text>
            )}
            {prediction.probability && (
              <Text style={styles.resultText}>
                Probability: {(prediction.probability * 100).toFixed(1)}%
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
  formCard: {
    margin: 20,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    margin: 30,
    alignSelf: "center",
  },
  submitButtonContent: {
    backgroundColor: "#ff4d4d",
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

export default HeartDiseaseScreen;

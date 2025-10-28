import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@gradio/client";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // increase limit for image payloads
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Prediction Route
app.post("/predict", upload.array("images"), async (req, res) => {
    try {
        console.log("🧩 Incoming Request");
        console.log("Files:", req.files);
        console.log("Body:", req.body);

        // Validate uploads
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No images received" });
        }

        // Convert multer buffers to File objects
        const images = req.files.map((file) => {
            return new File([file.buffer], file.originalname, { type: file.mimetype });
        });

        console.log("📸 Received Images:", images.map((img) => img.name));

        // Connect to your Gradio Space
        const client = await Client.connect("suhasmkanter/brain_tumor");

        // Call the /predict function of the model
        const result = await client.predict("/predict", { images });

        // Validate model response
        let predictions = [];
        if (
            result &&
            result.data &&
            result.data[0] &&
            result.data[0].predictions &&
            Array.isArray(result.data[0].predictions)
        ) {
            predictions = result.data[0].predictions.map((element) => ({
                filename: element.filename,
                result: element.result,
                disease: element.disease,
                confidence: element.confidence,
                probabilities: element.probabilities,
            }));
        }

        console.log("✅ Predictions Ready:", predictions.length, "items");
        console.log("First Prediction Sample:", predictions[0]);
        res.json({ predictions });
    } catch (error) {
        console.error("❌ Prediction Error:", error);
        res.status(500).json({
            error: "Prediction failed",
            details: error.message,
        });
    }
});

// Run the server
app.listen(3000, () => console.log("🚀 Backend running on port 3000"));
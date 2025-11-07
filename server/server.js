import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@gradio/client";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const app = express();
app.use(cors());
const allowedOrigins = 'https://final-year-project-five-kappa.vercel.app'
app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// -------------------- Helper: Convert ECG to NPY --------------------

function convertToNpyMultiple(filePaths, outputFolder) {
    return new Promise((resolve, reject) => {
        const python = spawn("python", [
            path.join(process.cwd(), "newpython.py"),
            ...filePaths,
            outputFolder
        ]);

        let stdout = "";
        let stderr = "";

        python.stdout.on("data", (data) => {
            stdout += data.toString();
            console.log("Python:", data.toString());
        });

        python.stderr.on("data", (data) => {
            stderr += data.toString();
            console.error("Python error:", data.toString());
        });

        python.on("close", (code) => {
            if (code === 0) {
                // stdout is a comma-separated list of .npy paths
                const npyFiles = stdout.trim().split(",");
                resolve(npyFiles);
            } else {
                reject(new Error(`Python conversion failed: ${stderr}`));
            }
        });
    });
}

function downsample(channelData, factor) {
    const newLength = Math.floor(channelData.length / factor);
    const downsampled = new Array(newLength);
    for (let i = 0; i < newLength; i++) {
        downsampled[i] = channelData[i * factor];
    }
    return downsampled;
}
// -------------------- Brain Tumor API --------------------
app.post("/predict/braintumor", upload.array("images"), async (req, res) => {
    try {
        console.log('hello bro ')
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ error: "No images uploaded" });
        console.log('hello bro', files)
        const images = files.map(f => {
            const buffer = new File([f.buffer], f.originalname, { type: f.mimetype });
            return buffer;
        });

        const client = await Client.connect("suhasmkanter/brain_tumor");
        const result = await client.predict("/predict", { model_choice: 'Brain Tumor', files: images });

        let predictions = [];

        // Ensure predictions exist and are an array
        if (result?.data?.[0]?.predictions && Array.isArray(result.data[0].predictions)) {
            predictions = result.data[0].predictions.map(e => ({
                filename: e.filename,
                result: e.result || null,       // null if prediction not available
                disease: e.disease || null,     // null if prediction not available
                confidence: e.confidence || null,
                probabilities: e.probabilities || null,
                error: e.error || null           // will have validator error if image rejected
            }));
        } else {
            // fallback if predictions array is missing entirely
            predictions = [{
                filename: "unknown",
                result: null,
                disease: null,
                confidence: null,
                probabilities: null,
                error: "No predictions returned from server"
            }];
        }

        console.log(predictions);

        console.log(result.data)
        res.json({ predictions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// -------------------- Heart Disease API --------------------
app.post("/predict/heartdisease", upload.array("ecg_files"), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0)
            return res.status(400).json({ error: "No ECG files uploaded" });

        const uploadDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        const tmpFilePaths = files.map(file => {
            const tmpPath = path.join(uploadDir, file.originalname);
            fs.writeFileSync(tmpPath, file.buffer);
            return tmpPath;
        });

        // Convert all files in one Python call
        const npyFiles = await convertToNpyMultiple(tmpFilePaths, uploadDir);

        const gradioFiles = npyFiles.map(f => {
            const fileBuffer = fs.readFileSync(f); // read file content as bytes
            return new File([fileBuffer], path.basename(f)); // use Buffer in array
        });

        // Connect to Gradio & predict
        console.log(gradioFiles);
        const client = await Client.connect("suhasmkanter/brain_tumor");
        const result = await client.predict("/predict", {
            model_choice: "Heart Disease",
            files: gradioFiles
        });

        res.json(result);

        // Cleanup temp files
        [...tmpFilePaths, ...npyFiles].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// -------------------- Start Server --------------------
app.listen(3000, () => console.log("Server running on port 3000"));

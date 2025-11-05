import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@gradio/client";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// -------------------- Helper: Convert ECG to NPY --------------------
function convertToNpy(filePath, npyPath) {
    return new Promise((resolve, reject) => {
        const python = spawn("python", [
            path.join(process.cwd(), "newpython.py"),
            filePath,
            npyPath,
        ]);

        python.stdout.on("data", (data) => console.log(`Python: ${data}`));
        python.stderr.on("data", (data) => console.error(`Python error: ${data}`));

        python.on("close", (code) => {
            if (code === 0) resolve(npyPath);
            else reject(new Error("Python conversion failed"));
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
        const files = req.files;
        if (!files || files.length === 0) return res.status(400).json({ error: "No images uploaded" });
        console.log('hello bro', files)
        const images = files.map(f => {
            const buffer = new File([f.buffer], f.originalname, { type: f.mimetype });
            return buffer;
        });

        const client = await Client.connect("suhasmkanter/brain_tumor");
        const result = await client.predict("/predict", { model_choice: 'Brain Tumor', files: images });
        console.log(result)
        let predictions = [];
        if (result?.data?.[0]?.predictions && Array.isArray(result.data[0].predictions)) {
            predictions = result.data[0].predictions.map(e => ({
                filename: e.filename,
                result: e.result,
                disease: e.disease,
                confidence: e.confidence,
                probabilities: e.probabilities
            }));
        }

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

        const gradioFiles = [];

        for (const file of files) {
            const tmpFilePath = path.join(uploadDir, file.originalname);
            fs.writeFileSync(tmpFilePath, file.buffer);

            // 1️⃣ Read the ECG signal (assume JSON array per channel)
            let signal = JSON.parse(fs.readFileSync(tmpFilePath, "utf8"));
            // signal shape: [12][5000] for example

            // 2️⃣ Downsample each channel (500Hz -> 100Hz)
            const downsampledSignal = signal.map(channel => downsample(channel, 5));

            // 3️⃣ Save the downsampled signal to temp JSON for Python conversion
            fs.writeFileSync(tmpFilePath, JSON.stringify(downsampledSignal));

            // 4️⃣ Convert to .npy
            const npyPath = tmpFilePath + ".npy";
            await convertToNpy(tmpFilePath, npyPath); // your existing Python function
            console.log("Python finished, npyPath exists?", fs.existsSync(npyPath));

            // 5️⃣ Add to Gradio files
            gradioFiles.push(new File(npyPath, "ecg.npy"));

            // 6️⃣ Cleanup temp JSON
            fs.unlinkSync(tmpFilePath);
        }

        // 7️⃣ Connect to Gradio client & predict
        const client = await Client.connect("suhasmkanter/brain_tumor");
        const result = await client.predict("/predict", {
            model_choice: "Heart Disease",
            files: gradioFiles
        });

        res.json(result);

        // 8️⃣ Cleanup .npy files
        gradioFiles.forEach(f => fs.unlinkSync(f.filepath));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// -------------------- Start Server --------------------
app.listen(3000, () => console.log("Server running on port 3000"));

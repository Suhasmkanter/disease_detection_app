import { Client } from "@gradio/client";

async function run() {
    const client = await Client.connect("suhasmkanter/brain_tumor");

    const imageUrls = [{
        url: "https://upload.wikimedia.org/wikipedia/commons/7/77/Delete_key1.jpg",
        name: "test.jpg",
        type: "image/jpeg",
    },
    {
        url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.png",
        name: "test.png",
        type: "image/png",
    },
    {
        url: "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg",
        name: "test.jpeg",
        type: "image/jpeg",
    },
    ];

    for (const { url, name, type }
        of imageUrls) {
        try {
            console.log(`\n🔍 Trying ${name} (${type})`);

            const res = await fetch(url);
            const buf = await res.arrayBuffer();

            // Wrap it in File
            const file = new File([buf], name, { type });

            // Send it as an array because the backend expects list[filepath]
            const result = await client.predict("/predict", {
                images: [file],
            });

            console.log("✅ Prediction success:", result.data);
        } catch (err) {
            console.error("❌ Prediction failed:", err);
        }
    }
}

run();
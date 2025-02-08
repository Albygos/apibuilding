const express = require("express");
const admin = require("firebase-admin");
const Tesseract = require("tesseract.js");
const fetch = require("node-fetch");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://blind-image-default-rtdb.firebaseio.com"
});

const db = admin.database();
const imageRef = db.ref("latestImage");
const textRef = db.ref("correctedText");

const app = express();
app.use(express.json());

console.log("OCR Automation Server Running...");

// Function to Process New Image
async function processImage(base64Image) {
    console.log("New image detected, starting OCR...");

    try {
        // Perform OCR
        const { data: { text } } = await Tesseract.recognize(Buffer.from(base64Image, "base64"), "eng");
        console.log("OCR Result:", text);

        // Correct Grammar using Groq API
        const correctedText = await correctGrammar(text);
        console.log("Corrected Text:", correctedText);

        // Update Firebase with Corrected Text
        await textRef.set({ correctedText });
        console.log("Updated Firebase with Corrected Text.");
    } catch (error) {
        console.error("Error processing image:", error);
    }
}

// Function to Correct Grammar
async function correctGrammar(text) {
    const apiKey = "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";  // Replace with your actual Groq API Key
    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: `Correct the grammar in this text without any explanation:\n\n"${text}"`
                }]
            })
        });

        const result = await response.json();
        return result.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error correcting grammar:", error);
        return text; // Return original text in case of failure
    }
}

// Listen for New Images in Firebase
imageRef.on("value", (snapshot) => {
    if (snapshot.exists()) {
        const base64String = snapshot.val().data;
        processImage(base64String);
    } else {
        console.log("No new image found.");
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

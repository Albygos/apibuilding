# OCR Automation with Grammar Correction

This project listens for new images uploaded to Firebase, extracts text using OCR, corrects grammar using Groq API, and updates Firebase with the corrected text.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node server.js
   ```
3. To keep it running 24×7:
   ```sh
   npm install -g pm2
   pm2 start server.js --name "ocr-automation"
   pm2 save
   pm2 startup
   ```

## Deployment

- Deploy on **Render.com**, **Railway.app**, or a VPS for 24×7 processing.


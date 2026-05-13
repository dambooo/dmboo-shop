# Veo 3 Video Generator App

This is a Flask web application that takes an image and a short text idea, uses Gemini 3.1 Pro (simulated via `gemini-1.5-pro` SDK) to write a detailed, visually descriptive video parameter script in Mongolian, and passes that script to the Vertex AI Veo 3 API (`veo-3.0-generate-preview`) to render an AI video.

## Setup

1. **Install dependencies**:
```bash
cd ai
pip install -r requirements.txt
```

2. **Authentication**:
You need a Google Cloud account with Vertex AI enabled. By default, it will use your application-default credentials.
Make sure you login using `gcloud` pointing to the correct project:
```bash
gcloud auth application-default login
```

3. **Configure Environment Variables** (Optional, falls back to defaults if not set):
You can set your project id and location for Vertex AI API Calls. By default, they will use standard GCP properties if logged in properly. You can override using variables:
```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## Running the App

Start the Flask server:
```bash
python app.py
```
Then navigate to `http://127.0.0.1:5000` in your browser.

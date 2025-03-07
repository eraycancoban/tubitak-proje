from flask import Flask, jsonify, request
from deepface import DeepFace
from transformers import pipeline
from deep_translator import GoogleTranslator  # Changed this line
from flask_cors import CORS  
import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)

# Son analiz edilen dominant duygu (kamera üzerinden)
dominant_emotion_global = {"emotion": None, "timestamp": None}

# Çeviri için Translator oluştur
# Replace the translator initialization
translator = GoogleTranslator(source='auto', target='en')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')

    # Modified translation call
    translated = translator.translate(text)

    outputs = classifier([translated])
    return jsonify({
        "original_text": text,
        "translated_text": translated,
        "analysis": outputs[0]
    })

@app.route('/suicidality', methods=['POST'])
def suicidality_analysis():
    data = request.json
    text = data.get('text', '')
    
    # Modified translation call
    translated = translator.translate(text)

    outputs = suicidality_classifier([translated])
    return jsonify({
        "original_text": text,
        "translated_text": translated,
        "suicidality_analysis": outputs[0]
    })  
@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    data = request.json
    image_data = data.get('image')

    # Base64 görüntüsünü çöz
    image_data = image_data.split(",")[1]  # Base64 verisini temizle
    image_bytes = base64.b64decode(image_data)

    # Görüntüyü PIL ile aç
    image = Image.open(BytesIO(image_bytes))
    image = np.array(image)

    # Görüntüyü DeepFace ile analiz et
    try:
        result = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
        dominant_emotion = result[0]['dominant_emotion']
        return jsonify({'dominant_emotion': dominant_emotion})
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    # Analiz işlemini ayrı bir iş parçacığında çalıştır
    # Flask API'yi başlat
    app.run(port=5000)

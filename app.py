import os
import pickle
import numpy as np
from flask import Flask, request, jsonify, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

# Get absolute path to the directory containing this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models and scalers
crop_model_path = os.path.join(BASE_DIR, 'crop_model.sav')
crop_scaler_path = os.path.join(BASE_DIR, 'crop_scaler.sav')
fertilizer_model_path = os.path.join(BASE_DIR, 'fertilizer_model.sav')
fertilizer_scaler_path = os.path.join(BASE_DIR, 'fertilizer_scaler.sav')

try:
    with open(crop_model_path, 'rb') as f:
        crop_model = pickle.load(f)
    with open(crop_scaler_path, 'rb') as f:
        crop_scaler = pickle.load(f)
    print("Crop models loaded successfully.")
except Exception as e:
    print(f"Error loading Crop models: {e}")
    crop_model, crop_scaler = None, None

try:
    with open(fertilizer_model_path, 'rb') as f:
        fertilizer_model = pickle.load(f)
    with open(fertilizer_scaler_path, 'rb') as f:
        fertilizer_scaler = pickle.load(f)
    print("Fertilizer models loaded successfully.")
except Exception as e:
    print(f"Error loading Fertilizer models: {e}")
    fertilizer_model, fertilizer_scaler = None, None

# Mappings
CROP_DICT = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut",
    6: "Papaya", 7: "Orange", 8: "Apple", 9: "Muskmelon", 10: "Watermelon",
    11: "Grapes", 12: "Mango", 13: "Banana", 14: "Pomegranate", 15: "Lentil",
    16: "Blackgram", 17: "Mungbean", 18: "Mothbeans", 19: "Pigeonpeas",
    20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"
}

FERT_DICT = {
    1: 'Urea', 2: 'DAP', 3: '14-35-14', 4: '28-28', 5: '17-17-17', 
    6: '20-20', 7: '10-26-26'
}

SOIL_MAPPING = {
    'Black': 0,
    'Clayey': 1,
    'Loamy': 2,
    'Red': 3,
    'Sandy': 4
}

CROP_TYPE_MAPPING = {
    'Barley': 0,
    'Cotton': 1,
    'Ground Nuts': 2,
    'Maize': 3,
    'Millets': 4,
    'Oil seeds': 5,
    'Paddy': 6,
    'Pulses': 7,
    'Sugarcane': 8,
    'Tobacco': 9,
    'Wheat': 10
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict-crop', methods=['POST'])
def predict_crop():
    if not crop_model or not crop_scaler:
        return jsonify({'error': 'Crop Prediction Model is not loaded on server.'}), 500
    
    try:
        data = request.json
        # Extract features
        N = float(data.get('N'))
        P = float(data.get('P'))
        K = float(data.get('K'))
        temperature = float(data.get('temperature'))
        humidity = float(data.get('humidity'))
        ph = float(data.get('ph'))
        rainfall = float(data.get('rainfall'))
        
        # Order: N, P, K, temperature, humidity, ph, rainfall
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        transformed_features = crop_scaler.transform(features)
        prediction = crop_model.predict(transformed_features).reshape(1, -1)
        pred_idx = int(prediction[0][0])
        
        crop_name = CROP_DICT.get(pred_idx, "Unknown Crop")
        
        return jsonify({
            'success': True,
            'prediction_idx': pred_idx,
            'result': crop_name,
            'message': f"{crop_name} is the best crop to be cultivated under these conditions."
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict-fertilizer', methods=['POST'])
def predict_fertilizer():
    if not fertilizer_model or not fertilizer_scaler:
        return jsonify({'error': 'Fertilizer Recommendation Model is not loaded on server.'}), 500
    
    try:
        data = request.json
        # Extract features
        temp = float(data.get('temperature'))
        humidity = float(data.get('humidity'))
        moisture = float(data.get('moisture'))
        soil_type_str = data.get('soil_type')
        crop_type_str = data.get('crop_type')
        nitrogen = float(data.get('nitrogen'))
        potassium = float(data.get('potassium'))
        phosphorous = float(data.get('phosphorous'))
        
        # Convert strings to labels
        soil_type = SOIL_MAPPING.get(soil_type_str)
        crop_type = CROP_TYPE_MAPPING.get(crop_type_str)
        
        if soil_type is None:
            return jsonify({'error': f"Invalid soil type: {soil_type_str}"}), 400
        if crop_type is None:
            return jsonify({'error': f"Invalid crop type: {crop_type_str}"}), 400
            
        # Order: Temperature, Humidity, Moisture, Soil_Type, Crop_Type, Nitrogen, Potassium, Phosphorous
        features = np.array([[temp, humidity, moisture, soil_type, crop_type, nitrogen, potassium, phosphorous]])
        transformed_features = fertilizer_scaler.transform(features)
        prediction = fertilizer_model.predict(transformed_features).reshape(1, -1)
        pred_idx = int(prediction[0][0])
        
        fert_name = FERT_DICT.get(pred_idx, "Unknown Fertilizer")
        
        return jsonify({
            'success': True,
            'prediction_idx': pred_idx,
            'result': fert_name,
            'message': f"{fert_name} is the best fertilizer for the given soil and crop conditions."
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Running locally
    app.run(host='127.0.0.1', port=5000, debug=True)

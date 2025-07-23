
from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pandas as pd

app = Flask(__name__)

# Sample dataset
data = pd.DataFrame({
    'District': ['Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Ampara'],
    'Major_Schemes_Sown': [3500, 3000, 2800, 2200],
    'Minor_Schemes_Sown': [2100, 1800, 1600, 1500],
    'Rainfed_Sown': [8500, 9000, 7600, 8000],
    'All_Schemes_Sown': [14100, 13800, 12000, 11700],
    'Nett_Extent_Harvested': [13000, 12700, 11000, 10500],
    'Total_Production': [120000, 113000, 101000, 98000]
})

# Features and target
X = data.drop(columns=['Total_Production'])
y = data['Total_Production']

# Pipeline
model = Pipeline([
    ('encoder', ColumnTransformer(
        [('district', OneHotEncoder(handle_unknown='ignore'), ['District'])],
        remainder='passthrough'
    )),
    ('regressor', RandomForestRegressor())
])

model.fit(X, y)

@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    data = request.json
    input_df = pd.DataFrame([data])
    prediction = model.predict(input_df)
    return jsonify({'predicted_yield': round(float(prediction[0]), 2)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

#!/bin/bash

echo "🧪 Testing ML Prediction API Integration..."
echo "========================================"

# Test the endpoint
echo "Testing endpoint: POST http://localhost:8080/api/yield/predict"
echo ""

curl -X POST http://localhost:8080/api/yield/predict \
  -H "Content-Type: application/json" \
  -d '{
    "District": "Anuradhapura",
    "Major_Schemes_Sown": 3500,
    "Minor_Schemes_Sown": 2100,
    "Rainfed_Sown": 8500,
    "All_Schemes_Sown": 14100,
    "Nett_Extent_Harvested": 13000
  }' \
  | python -m json.tool

echo ""
echo "========================================"
echo "✅ Test completed!"

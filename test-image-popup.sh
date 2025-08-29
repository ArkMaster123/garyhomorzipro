#!/bin/bash

# Test script to generate an image and display it as a popup
# Usage: ./test-image-popup.sh

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY environment variable is not set"
    echo "Please set it with: export GEMINI_API_KEY=your_api_key_here"
    exit 1
fi

echo "🚀 Generating image with Gemini API..."

# Generate image and save response to temp file
response=$(curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Create a vibrant cyberpunk cityscape at night with neon lights, flying cars, and futuristic skyscrapers"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }')

echo "📦 Extracting image data..."

# Extract base64 image data from response
image_data=$(echo "$response" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data')

if [ "$image_data" == "null" ] || [ -z "$image_data" ]; then
    echo "❌ No image data found in response"
    echo "Response: $response"
    exit 1
fi

echo "💾 Saving image to file..."

# Decode base64 and save as PNG
echo "$image_data" | base64 -d > generated_image.png

echo "✅ Image saved as 'generated_image.png'"

# Open the image on macOS
if command -v open >/dev/null 2>&1; then
    echo "🖼️ Opening image popup..."
    open generated_image.png
else
    echo "📁 Image saved, open 'generated_image.png' to view"
fi

echo "🎉 Done!"

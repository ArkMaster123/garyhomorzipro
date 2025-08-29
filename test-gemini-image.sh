#!/bin/bash

# Test script for Gemini image generation
# Usage: ./test-gemini-image.sh

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY environment variable is not set"
    echo "Please set it with: export GEMINI_API_KEY=your_api_key_here"
    exit 1
fi

echo "🚀 Testing Gemini image generation API..."
echo "Using API key: ${GEMINI_API_KEY:0:10}..."

curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }' | jq '.'

echo ""
echo "✅ Test completed!"

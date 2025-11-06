#!/bin/bash

# Test script for Cerebras models in the API
# Based on the real code structure

set -e

echo "🧪 Testing Cerebras Models API"
echo "================================"
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_ENDPOINT="${BASE_URL}/api/models"

# Expected Cerebras models
EXPECTED_CEREBRAS_MODELS=(
  "openai/gpt-oss-120b"
  "alibaba/qwen3-coder"
  "meta/llama-4-scout"
  "alibaba/qwen-3-32b"
  "meta/llama-3.1-8b"
  "meta/llama-3.3-70b"
)

echo "📡 Fetching models from: ${API_ENDPOINT}"
echo ""

# Fetch models
RESPONSE=$(curl -s "${API_ENDPOINT}")

# Check if response is valid JSON
if ! echo "$RESPONSE" | jq empty 2>/dev/null; then
  echo "❌ ERROR: Invalid JSON response"
  echo "Response:"
  echo "$RESPONSE" | head -20
  exit 1
fi

echo "✅ Valid JSON response received"
echo ""

# Check total models count
TOTAL_MODELS=$(echo "$RESPONSE" | jq '.models | length')
echo "📊 Total models: ${TOTAL_MODELS}"
echo ""

# Check for Cerebras provider
CEREBRAS_COUNT=$(echo "$RESPONSE" | jq '[.models[] | select(.provider == "cerebras")] | length')
echo "🚀 Cerebras models found: ${CEREBRAS_COUNT}"
echo ""

# Verify each expected Cerebras model
echo "🔍 Verifying Cerebras models:"
echo ""

ALL_FOUND=true
for model_id in "${EXPECTED_CEREBRAS_MODELS[@]}"; do
  MODEL_EXISTS=$(echo "$RESPONSE" | jq -r --arg id "$model_id" '[.models[] | select(.id == $id)] | length')
  
  if [ "$MODEL_EXISTS" -eq 1 ]; then
    MODEL_PROVIDER=$(echo "$RESPONSE" | jq -r --arg id "$model_id" '.models[] | select(.id == $id) | .provider')
    MODEL_NAME=$(echo "$RESPONSE" | jq -r --arg id "$model_id" '.models[] | select(.id == $id) | .name')
    
    if [ "$MODEL_PROVIDER" == "cerebras" ]; then
      echo "  ✅ ${model_id}"
      echo "     Name: ${MODEL_NAME}"
      echo "     Provider: ${MODEL_PROVIDER}"
    else
      echo "  ⚠️  ${model_id} - Found but provider is '${MODEL_PROVIDER}' (expected 'cerebras')"
      ALL_FOUND=false
    fi
  else
    echo "  ❌ ${model_id} - NOT FOUND"
    ALL_FOUND=false
  fi
  echo ""
done

# List all Cerebras models
echo "📋 All Cerebras models in response:"
echo "$RESPONSE" | jq -r '.models[] | select(.provider == "cerebras") | "  - \(.id) | \(.name)"'
echo ""

# Check provider grouping
echo "📦 Provider distribution:"
echo "$RESPONSE" | jq -r '.models | group_by(.provider) | map({provider: .[0].provider, count: length}) | .[] | "  \(.provider): \(.count) models"'
echo ""

# Final result
if [ "$ALL_FOUND" = true ] && [ "$CEREBRAS_COUNT" -eq 6 ]; then
  echo "✅ SUCCESS: All 6 Cerebras models found with correct provider!"
  echo ""
  echo "🎯 Test Summary:"
  echo "   - Total models: ${TOTAL_MODELS}"
  echo "   - Cerebras models: ${CEREBRAS_COUNT}"
  echo "   - All expected models: ✅"
  echo "   - Provider grouping: ✅"
  exit 0
else
  echo "❌ FAILURE: Some Cerebras models are missing or incorrectly configured"
  echo ""
  echo "Expected: 6 Cerebras models"
  echo "Found: ${CEREBRAS_COUNT} Cerebras models"
  exit 1
fi


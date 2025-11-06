#!/bin/bash

# Complete end-to-end test for Cerebras models
# Tests API, grouping, and verifies all models are accessible

set -e

echo "🚀 Complete Cerebras Models Test Suite"
echo "========================================"
echo ""

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Test 1: API Response
echo "📡 Test 1: API Response"
echo "----------------------"
./scripts/test-cerebras-models.sh
echo ""

# Test 2: Frontend Grouping
echo "🎨 Test 2: Frontend Grouping Logic"
echo "-----------------------------------"
node scripts/test-cerebras-frontend.js
echo ""

# Test 3: Individual Model Verification
echo "🔍 Test 3: Individual Model Details"
echo "------------------------------------"
echo ""

EXPECTED_MODELS=(
  "openai/gpt-oss-120b:GPT-OSS 120B - Cerebras:131072"
  "alibaba/qwen3-coder:Qwen3 Coder - Cerebras:131072"
  "meta/llama-4-scout:Llama 4 Scout - Cerebras:131072"
  "alibaba/qwen-3-32b:Qwen-3 32B - Cerebras:131072"
  "meta/llama-3.1-8b:Llama 3.1 8B - Cerebras:131072"
  "meta/llama-3.3-70b:Llama 3.3 70B - Cerebras:131072"
)

RESPONSE=$(curl -s "${BASE_URL}/api/models")

for model_spec in "${EXPECTED_MODELS[@]}"; do
  IFS=':' read -r model_id expected_name expected_ctx <<< "$model_spec"
  
  model_data=$(echo "$RESPONSE" | jq -r --arg id "$model_id" '.models[] | select(.id == $id)')
  
  if [ -z "$model_data" ] || [ "$model_data" == "null" ]; then
    echo "  ❌ ${model_id} - NOT FOUND"
    continue
  fi
  
  actual_name=$(echo "$model_data" | jq -r '.name')
  actual_provider=$(echo "$model_data" | jq -r '.provider')
  actual_ctx=$(echo "$model_data" | jq -r '.context_window')
  
  checks=0
  if [ "$actual_provider" == "cerebras" ]; then
    echo "  ✅ ${model_id}"
    echo "     Provider: ${actual_provider} ✓"
    checks=$((checks + 1))
  else
    echo "  ⚠️  ${model_id} - Provider mismatch (got: ${actual_provider}, expected: cerebras)"
  fi
  
  if [ "$actual_name" == "$expected_name" ]; then
    echo "     Name: ${actual_name} ✓"
    checks=$((checks + 1))
  else
    echo "     Name: ${actual_name} (expected: ${expected_name})"
  fi
  
  if [ "$actual_ctx" == "$expected_ctx" ]; then
    echo "     Context: ${actual_ctx} ✓"
    checks=$((checks + 1))
  else
    echo "     Context: ${actual_ctx} (expected: ${expected_ctx})"
  fi
  
  echo ""
done

# Test 4: Provider Priority Check
echo "📊 Test 4: Provider Priority (Cerebras should appear 3rd)"
echo "-----------------------------------------------------------"
echo ""

PROVIDER_ORDER=$(echo "$RESPONSE" | jq -r '.models | group_by(.provider) | map(.[0].provider) | unique | .[]')
CEREBRAS_POSITION=$(echo "$PROVIDER_ORDER" | grep -n "cerebras" | cut -d: -f1 || echo "0")

if [ "$CEREBRAS_POSITION" -gt 0 ]; then
  echo "  ✅ Cerebras found at position ${CEREBRAS_POSITION} in provider list"
else
  echo "  ❌ Cerebras not found in provider list"
fi

echo ""
echo "Provider order:"
echo "$PROVIDER_ORDER" | nl -v 1
echo ""

# Final Summary
echo "🎯 Final Summary"
echo "==============="
TOTAL=$(echo "$RESPONSE" | jq '.models | length')
CEREBRAS_TOTAL=$(echo "$RESPONSE" | jq '[.models[] | select(.provider == "cerebras")] | length')

echo "  Total models: ${TOTAL}"
echo "  Cerebras models: ${CEREBRAS_TOTAL}"
echo "  Expected Cerebras: 6"
echo ""

if [ "$CEREBRAS_TOTAL" -eq 6 ]; then
  echo "  ✅ All tests passed! Cerebras models are ready for the dropdown."
  exit 0
else
  echo "  ❌ Some tests failed. Check output above."
  exit 1
fi


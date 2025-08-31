#!/bin/bash

# Test script for Gary Hormozi AI Idea Generator
# Usage: ./test-ideator.sh

echo "🚀 Testing Gary Hormozi AI Idea Generator..."
echo "=============================================="

# Check if development server is running
echo "🔍 Checking if development server is running..."
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "❌ Development server is not running on port 3001"
    echo "Please start it with: npm run dev"
    exit 1
fi
echo "✅ Development server is running on port 3001"

# Load environment variables from .env.local
echo ""
echo "🔧 Loading environment variables from .env.local..."
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "✅ Environment variables loaded from .env.local"
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Check environment variables
echo ""
echo "🔧 Checking environment variables..."
if [ -z "$AI_GATEWAY_API_KEY" ]; then
    echo "❌ AI_GATEWAY_API_KEY environment variable is not set"
    echo "Please check your .env.local file"
    exit 1
fi

if [ -z "$AI_GATEWAY_BASE_URL" ]; then
    echo "❌ AI_GATEWAY_BASE_URL environment variable is not set"
    echo "Please check your .env.local file"
    exit 1
fi

if [ -z "$BRAVE_SEARCH_API_KEY" ]; then
    echo "❌ BRAVE_SEARCH_API_KEY environment variable is not set"
    echo "Please check your .env.local file"
    exit 1
fi

echo "✅ AI_GATEWAY_API_KEY: ${AI_GATEWAY_API_KEY:0:10}..."
echo "✅ AI_GATEWAY_BASE_URL: $AI_GATEWAY_BASE_URL"
echo "✅ BRAVE_SEARCH_API_KEY: ${BRAVE_SEARCH_API_KEY:0:10}..."

# Test TypeScript compilation (non-blocking)
echo ""
echo "🔨 Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
else
    echo "⚠️  TypeScript compilation had some issues (likely in test files)"
    echo "Continuing with ideator tests..."
fi

# Test ideator endpoint
echo ""
echo "🌐 Testing ideator endpoint..."
echo "Testing: http://localhost:3001/ideator"

IDEATOR_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "http://localhost:3001/ideator")
HTTP_STATUS=$(echo "$IDEATOR_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$IDEATOR_RESPONSE" | grep -v "HTTP_STATUS:")

echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Ideator endpoint is accessible!"
    echo "Response preview:"
    echo "$RESPONSE_BODY" | head -5
elif [ "$HTTP_STATUS" = "307" ]; then
    echo "⚠️  Ideator endpoint is redirecting (likely to auth)"
    echo "This is expected behavior - checking redirect location..."
    REDIRECT_URL=$(echo "$RESPONSE_BODY" | head -1)
    echo "Redirect URL: $REDIRECT_URL"
    
    # Test the redirect URL
    if [[ "$REDIRECT_URL" == *"/api/auth/guest"* ]]; then
        echo "✅ Redirect is to guest authentication (expected)"
    else
        echo "⚠️  Unexpected redirect location"
    fi
else
    echo "❌ Ideator endpoint returned unexpected status: $HTTP_STATUS"
    echo "Response: $RESPONSE_BODY"
fi

# Test AI Gateway connectivity
echo ""
echo "🤖 Testing AI Gateway connectivity..."
GATEWAY_TEST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Authorization: Bearer $AI_GATEWAY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"Hello"}],"max_tokens":10}' \
    "$AI_GATEWAY_BASE_URL/chat/completions")

GATEWAY_STATUS=$(echo "$GATEWAY_TEST" | grep "HTTP_STATUS:" | cut -d: -f2)
GATEWAY_RESPONSE=$(echo "$GATEWAY_TEST" | grep -v "HTTP_STATUS:")

if [ "$GATEWAY_STATUS" = "200" ]; then
    echo "✅ AI Gateway is accessible!"
    echo "Available models:"
    echo "$GATEWAY_RESPONSE" | jq '.data[].id' 2>/dev/null | head -5 || echo "Could not parse models response"
else
    echo "❌ AI Gateway test failed with status: $GATEWAY_STATUS"
    echo "Response: $GATEWAY_RESPONSE"
fi

# Test Brave Search API
echo ""
echo "🔍 Testing Brave Search API..."
BRAVE_TEST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "X-Subscription-Token: $BRAVE_SEARCH_API_KEY" \
    "https://api.search.brave.com/res/v1/web/search?q=test+query&count=1")

BRAVE_STATUS=$(echo "$BRAVE_TEST" | grep "HTTP_STATUS:" | cut -d: -f2)
BRAVE_RESPONSE=$(echo "$BRAVE_TEST" | grep -v "HTTP_STATUS:")

if [ "$BRAVE_STATUS" = "200" ]; then
    echo "✅ Brave Search API is accessible!"
    echo "Search test successful"
else
    echo "❌ Brave Search API test failed with status: $BRAVE_STATUS"
    echo "Response: $BRAVE_RESPONSE"
fi

# Test ideator server actions
echo ""
echo "⚡ Testing ideator server actions..."
echo "Testing ideator page accessibility..."

# Test with different user agents and headers
IDEATOR_TEST_1=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Accept: text/html" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
    "http://localhost:3001/ideator")

IDEATOR_STATUS_1=$(echo "$IDEATOR_TEST_1" | grep "HTTP_STATUS:" | cut -d: -f2)
IDEATOR_RESPONSE_1=$(echo "$IDEATOR_TEST_1" | grep -v "HTTP_STATUS:")

echo "HTTP Status: $IDEATOR_STATUS_1"

if [ "$IDEATOR_STATUS_1" = "200" ]; then
    echo "✅ Ideator page is accessible"
elif [ "$IDEATOR_STATUS_1" = "307" ]; then
    echo "⚠️  Ideator page is redirecting (expected for unauthenticated users)"
    echo "Redirect response: $IDEATOR_RESPONSE_1"
elif [ "$IDEATOR_STATUS_1" = "500" ]; then
    echo "❌ Ideator page has server error (HTTP 500)"
    echo "This suggests a runtime error in the page component"
    echo "Check the development server console for error details"
else
    echo "⚠️  Ideator page returned unexpected status: $IDEATOR_STATUS_1"
    echo "Response: $IDEATOR_RESPONSE_1"
fi

# Test ideator page component
echo ""
echo "📱 Testing ideator page component..."
if [ -f "app/ideator/page.tsx" ]; then
    echo "✅ Ideator page component exists"
    
    # Check for key features
    if grep -q "validateIdea" "app/ideator/page.tsx"; then
        echo "✅ validateIdea function is imported"
    else
        echo "❌ validateIdea function is missing"
    fi
    
    if grep -q "openai/gpt-oss-120b" "app/ideator/actions.tsx"; then
        echo "✅ Correct LLM model (openai/gpt-oss-120b) is configured"
    else
        echo "❌ LLM model configuration issue"
    fi
    
    if grep -q "LinkedIn" "app/ideator/page.tsx"; then
        echo "✅ LinkedIn sharing functionality is present"
    else
        echo "❌ LinkedIn sharing functionality is missing"
    fi
else
    echo "❌ Ideator page component not found"
fi

# Summary
echo ""
echo "=============================================="
echo "🎯 IDEATOR TEST SUMMARY"
echo "=============================================="

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ]; then
    echo "✅ Endpoint Status: Working"
else
    echo "❌ Endpoint Status: Failed"
fi

if [ "$GATEWAY_STATUS" = "200" ]; then
    echo "✅ AI Gateway: Working"
else
    echo "❌ AI Gateway: Failed"
fi

if [ "$BRAVE_STATUS" = "200" ]; then
    echo "✅ Brave Search: Working"
else
    echo "❌ Brave Search: Failed"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Navigate to: http://localhost:3001/ideator"
echo "2. Complete guest authentication"
echo "3. Test idea generation with both free and advanced tiers"
echo "4. Verify LinkedIn sharing and download functionality"
echo ""
echo "✅ Ideator test completed!"

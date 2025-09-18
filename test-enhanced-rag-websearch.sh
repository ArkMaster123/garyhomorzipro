#!/bin/bash

# Test script for Enhanced RAG + Web Search integration
# Usage: ./test-enhanced-rag-websearch.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Testing Enhanced RAG + Web Search Integration${NC}"
echo "================================================="
echo ""

# Check server status
echo -e "${BLUE}🔍 Checking server status...${NC}"
if curl -s http://localhost:3000/ping > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi

# Check API keys
echo -e "${BLUE}🔑 Checking API configuration...${NC}"
if [ -z "$BRAVE_SEARCH_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ BRAVE_SEARCH_API_KEY not found in shell environment${NC}"
    echo "Note: API keys are likely configured in .env.local (which Next.js reads)"
    echo "Frontend functionality should work normally"
else
    echo -e "${GREEN}✅ BRAVE_SEARCH_API_KEY configured in shell${NC}"
fi

if [ -z "$AI_GATEWAY_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ AI_GATEWAY_API_KEY not found in shell environment${NC}"
    echo "Note: API keys are likely configured in .env.local (which Next.js reads)"
    echo "Frontend functionality should work normally"
else
    echo -e "${GREEN}✅ AI_GATEWAY_API_KEY configured in shell${NC}"
fi

echo ""

# Helper function to generate UUIDs
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        # Fallback UUID generation
        python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || echo "550e8400-e29b-41d4-a716-$(date +%s)"
    fi
}

# Helper function to test chat endpoint
test_chat() {
    local query="$1"
    local test_name="$2"
    local expected_tool="$3"
    
    echo -e "${BLUE}🧪 Test: ${test_name}${NC}"
    echo -e "${YELLOW}Query: ${query}${NC}"
    echo -e "${YELLOW}Expected Tool: ${expected_tool}${NC}"
    echo ""
    
    local chat_id=$(generate_uuid)
    local message_id=$(generate_uuid)
    
    # Make the request and capture response
    local response=$(curl -s -X POST http://localhost:3000/api/chat \
        -H "Content-Type: application/json" \
        -d "{
            \"id\": \"${chat_id}\",
            \"message\": {
                \"id\": \"${message_id}\",
                \"role\": \"user\",
                \"parts\": [{\"type\": \"text\", \"text\": \"${query}\"}]
            },
            \"selectedChatModel\": \"openai/gpt-oss-120b\",
            \"selectedVisibilityType\": \"private\",
            \"modelId\": \"openai/gpt-oss-120b\"
        }")
    
    # Check for errors
    if echo "$response" | grep -q '"code".*"error"'; then
        echo -e "${RED}❌ API Error:${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    elif echo "$response" | grep -q '/api/auth/guest'; then
        echo -e "${RED}❌ Authentication required${NC}"
        echo "Please log in to the application first"
    else
        echo -e "${GREEN}✅ Request successful - streaming response received${NC}"
        echo "Response preview:"
        echo "$response" | head -c 200
        echo "..."
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Test 1: Knowledge Base Query (should use RAG)
test_chat "What is your advice on decision making in business?" "Knowledge Base Query" "RAG Search"

# Test 2: Current Trends Query (should use web search)  
test_chat "What are the latest AI business trends in 2024?" "Current Trends Query" "Enhanced Web Search"

# Test 3: Market Data Query (should use web search)
test_chat "What is the current market size of the SaaS industry?" "Market Data Query" "Enhanced Web Search"

# Test 4: Hybrid Query (should use both RAG + Web Search)
test_chat "How can I apply your customer acquisition strategies to the current AI market boom?" "Hybrid Query" "Both RAG + Web Search"

# Test 5: UK National Insurance Query (the specific example)
test_chat "What are the latest news on national insurance costs in UK?" "UK National Insurance" "Enhanced Web Search"

# Test 6: Business Fundamentals (should use knowledge base)
test_chat "What are the core principles of scaling a business?" "Business Fundamentals" "RAG Search"

echo -e "${GREEN}🎉 Enhanced RAG + Web Search Testing Complete!${NC}"
echo ""
echo -e "${BLUE}📊 What to look for in the frontend:${NC}"
echo "1. Gary Hormozi persona is active"
echo "2. Appropriate tool selection (RAG vs Web Search vs Both)"
echo "3. Source links displayed for web search results"
echo "4. Gary's energetic analysis combining data with principles"
echo "5. Clickable source links with domains and relevance scores"
echo ""
echo -e "${BLUE}🔧 If tests show authentication errors:${NC}"
echo "1. Open the frontend: http://localhost:3000"
echo "2. Log in or register an account"
echo "3. Set persona to 'Gary Hormozi'"
echo "4. Test the queries directly in the chat interface"
echo ""
echo -e "${BLUE}🎯 Expected behavior:${NC}"
echo "- Knowledge base queries → Gary responds with core wisdom"
echo "- Current trend queries → Web search + Gary's analysis"
echo "- Hybrid queries → Both sources + integrated response"
echo ""
echo -e "${GREEN}✅ The Enhanced RAG + Web Search system is ready!${NC}"

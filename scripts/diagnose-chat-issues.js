#!/usr/bin/env node

/**
 * Diagnostic script to check why chat isn't working
 * Checks: Gateway config, API endpoints, model availability
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function checkGatewayConfig() {
  console.log('🔍 Checking Gateway Configuration...');
  console.log('=====================================\n');
  
  // Check if we can access the models endpoint
  try {
    const response = await fetch(`${BASE_URL}/api/models`);
    if (!response.ok) {
      console.log(`❌ Models API failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Models API working: ${data.models?.length || 0} models available\n`);
    
    // Check for Cerebras models
    const cerebrasModels = data.models?.filter(m => m.provider === 'cerebras') || [];
    console.log(`🚀 Cerebras models: ${cerebrasModels.length}`);
    if (cerebrasModels.length > 0) {
      console.log('   Models:', cerebrasModels.map(m => m.id).join(', '));
    }
    console.log('');
    
    return true;
  } catch (error) {
    console.log(`❌ Error checking models: ${error.message}\n`);
    return false;
  }
}

async function checkChatAPI() {
  console.log('💬 Checking Chat API...');
  console.log('======================\n');
  
  const testRequest = {
    id: 'test-' + Date.now(),
    message: {
      id: 'msg-' + Date.now(),
      role: 'user',
      parts: [{ type: 'text', text: 'test' }],
    },
    selectedChatModel: 'groq/llama-3.1-8b',
    selectedVisibilityType: 'private',
    modelId: 'groq/llama-3.1-8b',
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest),
      redirect: 'manual',
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 307) {
      console.log('⚠️  Redirected to /sign-in (authentication required)');
      console.log('   This is expected if you\'re not logged in.\n');
    } else if (response.status === 503) {
      const data = await response.json();
      console.log('❌ Service Unavailable:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n💡 This suggests the AI Gateway is not configured.');
      console.log('   Check your environment variables:\n');
      console.log('   - AI_GATEWAY_BASE_URL');
      console.log('   - AI_GATEWAY_API_KEY\n');
    } else if (response.status === 200) {
      console.log('✅ Chat API is working!\n');
    } else {
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}...\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

async function checkHistoryAPI() {
  console.log('📜 Checking Chat History API...');
  console.log('================================\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/history`, {
      redirect: 'manual',
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 307) {
      console.log('⚠️  Redirected to /sign-in (authentication required)\n');
    } else if (response.ok) {
      const data = await response.json();
      console.log(`✅ History API working: ${data.chats?.length || 0} chats found\n`);
    } else {
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}...\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }
}

async function runDiagnostics() {
  console.log('🔧 Chat App Diagnostics');
  console.log('========================\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  await checkGatewayConfig();
  await checkChatAPI();
  await checkHistoryAPI();
  
  console.log('📋 Summary:');
  console.log('===========');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Verify you are logged in (check for session cookie)');
  console.log('3. Check environment variables are set:');
  console.log('   - AI_GATEWAY_BASE_URL');
  console.log('   - AI_GATEWAY_API_KEY');
  console.log('4. Try sending a message and check Network tab for errors');
  console.log('5. Check server logs for any errors\n');
}

runDiagnostics();


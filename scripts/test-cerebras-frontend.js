#!/usr/bin/env node

/**
 * Test script to verify Cerebras models appear correctly in the frontend
 * Simulates the provider-selector grouping logic
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/models`;

// Expected Cerebras models
const EXPECTED_CEREBRAS_MODELS = [
  'openai/gpt-oss-120b',
  'alibaba/qwen3-coder',
  'meta/llama-4-scout',
  'alibaba/qwen-3-32b',
  'meta/llama-3.1-8b',
  'meta/llama-3.3-70b',
];

// Simulate the provider-selector grouping logic
function groupModelsByProvider(models) {
  const CEREBRAS_MODELS = [
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'openai/gpt-oss-safeguard-20b',
    'alibaba/qwen3-coder',
    'meta/llama-4-scout',
    'alibaba/qwen-3-32b',
    'meta/llama-3.1-8b',
    'meta/llama-3.3-70b',
  ];

  const groupMap = new Map();

  models.forEach((model) => {
    let provider = (model.provider || model.id.split('/')[0] || 'other').toLowerCase();

    // Special case: Models served by Cerebras
    if (CEREBRAS_MODELS.includes(model.id)) {
      provider = 'cerebras';
    }

    // Capitalize provider name properly
    const providerName =
      provider === 'xai'
        ? 'xAI'
        : provider === 'meta'
          ? 'Meta'
          : provider.charAt(0).toUpperCase() + provider.slice(1);

    if (!groupMap.has(providerName)) {
      groupMap.set(providerName, []);
    }
    groupMap.get(providerName).push(model);
  });

  return groupMap;
}

async function testCerebrasModels() {
  console.log('🧪 Testing Cerebras Models - Frontend Grouping');
  console.log('================================================\n');

  try {
    // Fetch models
    console.log(`📡 Fetching models from: ${API_ENDPOINT}`);
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.models || !Array.isArray(data.models)) {
      throw new Error('Invalid response format: missing models array');
    }

    console.log(`✅ Valid JSON response received\n`);
    console.log(`📊 Total models: ${data.models.length}\n`);

    // Group models by provider (simulating frontend logic)
    const providerGroups = groupModelsByProvider(data.models);

    // Check Cerebras group
    const cerebrasGroup = providerGroups.get('Cerebras');
    const cerebrasCount = cerebrasGroup ? cerebrasGroup.length : 0;

    console.log(`🚀 Cerebras models in group: ${cerebrasCount}\n`);

    if (!cerebrasGroup || cerebrasGroup.length === 0) {
      console.log('❌ ERROR: No Cerebras group found!');
      console.log('\nAvailable provider groups:');
      Array.from(providerGroups.keys()).forEach((name) => {
        console.log(`  - ${name}: ${providerGroups.get(name).length} models`);
      });
      process.exit(1);
    }

    // Verify each expected model
    console.log('🔍 Verifying Cerebras models in group:\n');

    let allFound = true;
    for (const modelId of EXPECTED_CEREBRAS_MODELS) {
      const model = cerebrasGroup.find((m) => m.id === modelId);

      if (model) {
        const provider = model.provider || 'unknown';
        if (provider === 'cerebras') {
          console.log(`  ✅ ${modelId}`);
          console.log(`     Name: ${model.name}`);
          console.log(`     Provider: ${provider}`);
        } else {
          console.log(
            `  ⚠️  ${modelId} - Provider is '${provider}' (expected 'cerebras')`,
          );
          allFound = false;
        }
      } else {
        console.log(`  ❌ ${modelId} - NOT FOUND in Cerebras group`);
        allFound = false;
      }
      console.log('');
    }

    // List all models in Cerebras group
    console.log('📋 All models in Cerebras group:');
    cerebrasGroup.forEach((model) => {
      console.log(`  - ${model.id} | ${model.name}`);
    });
    console.log('');

    // Show provider distribution
    console.log('📦 Provider distribution:');
    const sortedGroups = Array.from(providerGroups.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    sortedGroups.forEach(([name, models]) => {
      console.log(`  ${name}: ${models.length} models`);
    });
    console.log('');

    // Final result
    if (allFound && cerebrasCount === 6) {
      console.log('✅ SUCCESS: All 6 Cerebras models found in Cerebras group!');
      console.log('');
      console.log('🎯 Test Summary:');
      console.log(`   - Total models: ${data.models.length}`);
      console.log(`   - Cerebras group: ${cerebrasCount} models`);
      console.log(`   - All expected models: ✅`);
      console.log(`   - Provider grouping: ✅`);
      console.log(`   - Frontend logic: ✅`);
      process.exit(0);
    } else {
      console.log('❌ FAILURE: Some Cerebras models are missing or incorrectly grouped');
      console.log('');
      console.log(`Expected: 6 Cerebras models in group`);
      console.log(`Found: ${cerebrasCount} Cerebras models in group`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testCerebrasModels();


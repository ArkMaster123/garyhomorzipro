#!/usr/bin/env node

const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Verify API connection
    console.log('1️⃣ Testing API connection...');
    const products = await stripe.products.list({ limit: 1 });
    console.log('✅ API connection successful');
    console.log(`   Found ${products.data.length} products\n`);

    // Test 2: List available prices
    console.log('2️⃣ Checking available subscription prices...');
    const prices = await stripe.prices.list({ 
      limit: 5,
      expand: ['data.product']
    });
    
    const subscriptionPrices = prices.data.filter(price => price.recurring);
    console.log(`✅ Found ${subscriptionPrices.length} subscription prices:`);
    
    subscriptionPrices.forEach(price => {
      const amount = price.unit_amount / 100;
      const interval = price.recurring.interval;
      console.log(`   - ${price.id}: $${amount}/${interval} (${price.product.name})`);
    });
    console.log('');

    // Test 3: Create a test checkout session
    console.log('3️⃣ Testing checkout session creation...');
    const session = await stripe.checkout.sessions.create({
      customer_email: 'test@example.com',
      line_items: [
        {
          price: 'price_1QKoyIJ7vSMIQ4RhP3NKw1vg', // Using your existing price
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });
    
    console.log('✅ Checkout session created successfully');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   URL: ${session.url}\n`);

    // Test 4: Test webhook signature validation
    console.log('4️⃣ Testing webhook signature validation...');
    const testPayload = JSON.stringify({ type: 'test.event', data: { object: {} } });
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: testPayload,
      secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test',
    });
    
    try {
      const event = stripe.webhooks.constructEvent(
        testPayload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
      );
      console.log('✅ Webhook signature validation works');
    } catch (error) {
      console.log('⚠️  Webhook signature validation failed (expected if webhook secret is placeholder)');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 5: Check environment variables
    console.log('5️⃣ Checking environment variables...');
    const requiredVars = [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value && value !== 'whsec_your-stripe-webhook-secret-here') {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: Not set or using placeholder`);
      }
    });
    console.log('');

    console.log('🎉 Stripe integration test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update STRIPE_WEBHOOK_SECRET with real webhook secret from Stripe Dashboard');
    console.log('2. Set up webhook endpoint in Stripe Dashboard');
    console.log('3. Test the full subscription flow in your app');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testStripeIntegration();

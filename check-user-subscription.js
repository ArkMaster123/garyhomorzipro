const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');
require('dotenv').config({ path: '.env.local' });

// Database connection
const client = postgres(process.env.POSTGRES_URL);
const db = drizzle(client);

// User schema
const users = {
  email: 'email',
  clerkId: 'clerkId', 
  isSubscriber: 'isSubscriber',
  subscriptionStatus: 'subscriptionStatus',
  stripeCustomerId: 'stripeCustomerId',
  subscriptionId: 'subscriptionId',
  dailyMessageCount: 'dailyMessageCount'
};

async function checkUserSubscription() {
  try {
    console.log('🔍 Checking user subscription data...\n');
    
    // Find user by email
    const result = await client`
      SELECT 
        email,
        "clerkId",
        "isSubscriber",
        "subscriptionStatus", 
        "stripeCustomerId",
        "subscriptionId",
        "dailyMessageCount",
        "lastMessageResetDate"
      FROM "User" 
      WHERE email = 'noah.santoni@gmail.com'
      LIMIT 1
    `;
    
    if (result.length > 0) {
      const user = result[0];
      console.log('👤 User found:');
      console.log('   Email:', user.email);
      console.log('   Clerk ID:', user.clerkId || 'Not set');
      console.log('   Is Subscriber:', user.isSubscriber);
      console.log('   Subscription Status:', user.subscriptionStatus || 'Not set');
      console.log('   Stripe Customer ID:', user.stripeCustomerId || 'Not set');
      console.log('   Subscription ID:', user.subscriptionId || 'Not set');
      console.log('   Daily Message Count:', user.dailyMessageCount);
      console.log('   Last Reset Date:', user.lastMessageResetDate);
      
      console.log('\n🎯 Subscription Analysis:');
      if (user.isSubscriber) {
        console.log('✅ User is marked as subscriber');
      } else {
        console.log('❌ User is NOT marked as subscriber');
      }
      
      if (user.subscriptionStatus === 'active') {
        console.log('✅ Subscription status is active');
      } else {
        console.log(`❌ Subscription status: ${user.subscriptionStatus || 'Not set'}`);
      }
      
      if (user.stripeCustomerId) {
        console.log('✅ Has Stripe customer ID');
      } else {
        console.log('❌ No Stripe customer ID');
      }
      
    } else {
      console.log('❌ No user found with email noah.santoni@gmail.com');
      
      // Let's see what users exist
      console.log('\n📋 All users in database:');
      const allUsers = await client`SELECT email, "clerkId", "isSubscriber" FROM "User" LIMIT 10`;
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (Clerk: ${u.clerkId || 'None'}, Subscriber: ${u.isSubscriber})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserSubscription();

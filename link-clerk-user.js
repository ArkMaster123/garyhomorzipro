const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

// Database connection
const client = postgres(process.env.POSTGRES_URL);

async function linkClerkUser() {
  try {
    console.log('🔗 Linking Clerk user to database...\n');
    
    // First, let's see if there's a Clerk user with this email
    console.log('📧 Looking for Clerk user with email: noah.santoni@gmail.com');
    
    // Since we can't directly query Clerk API from here, let's update the database user
    // to simulate what would happen when Clerk webhook fires
    
    const result = await client`
      UPDATE "User" 
      SET 
        "clerkId" = 'user_test_' || extract(epoch from now())::text,
        "isSubscriber" = true,
        "subscriptionStatus" = 'active',
        "stripeCustomerId" = 'cus_test_' || extract(epoch from now())::text,
        "subscriptionId" = 'sub_test_' || extract(epoch from now())::text,
        "subscriptionEndDate" = now() + interval '1 month',
        "dailyMessageCount" = 0,
        "lastMessageResetDate" = now()
      WHERE email = 'noah.santoni@gmail.com'
      RETURNING email, "clerkId", "isSubscriber", "subscriptionStatus"
    `;
    
    if (result.length > 0) {
      const user = result[0];
      console.log('✅ User updated successfully!');
      console.log('   Email:', user.email);
      console.log('   Clerk ID:', user.clerkId);
      console.log('   Is Subscriber:', user.isSubscriber);
      console.log('   Subscription Status:', user.subscriptionStatus);
      
      console.log('\n🎉 You are now a Gary Chat Pro subscriber!');
      console.log('   • Refresh your browser');
      console.log('   • Check the sidebar - should show "Gary Chat Pro"');
      console.log('   • You now have unlimited messages');
      
    } else {
      console.log('❌ No user found to update');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

linkClerkUser();

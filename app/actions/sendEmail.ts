'use server';

import { sendWelcomeEmail, sendFollowUpEmail } from '@/lib/email/transporter';

// Send welcome email when user generates an idea
export async function sendWelcomeEmailAction(userEmail: string, userName: string, ideaTitle: string) {
  try {
    console.log('📧 Sending welcome email to:', userEmail, 'for idea:', ideaTitle);
    
    const result = await sendWelcomeEmail(userEmail, userName, ideaTitle);
    
    if (result.success) {
      console.log('✅ Welcome email sent successfully');
      return { success: true, message: 'Welcome email sent successfully!' };
    } else {
      console.error('❌ Welcome email failed:', result.error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  } catch (error) {
    console.error('❌ Error in welcome email action:', error);
    return { success: false, message: 'An error occurred while sending welcome email' };
  }
}

// Send follow-up email (for scheduled emails)
export async function sendFollowUpEmailAction(userEmail: string, userName: string, ideaTitle: string, dayNumber: number) {
  try {
    console.log(`📧 Sending day ${dayNumber} follow-up email to:`, userEmail, 'for idea:', ideaTitle);
    
    const result = await sendFollowUpEmail(userEmail, userName, ideaTitle, dayNumber);
    
    if (result.success) {
      console.log(`✅ Day ${dayNumber} follow-up email sent successfully`);
      return { success: true, message: `Day ${dayNumber} follow-up email sent successfully!` };
    } else {
      console.error(`❌ Day ${dayNumber} follow-up email failed:`, result.error);
      return { success: false, message: `Failed to send day ${dayNumber} follow-up email` };
    }
  } catch (error) {
    console.error(`❌ Error in day ${dayNumber} follow-up email action:`, error);
    return { success: false, message: `An error occurred while sending day ${dayNumber} follow-up email` };
  }
}

// Schedule follow-up emails (placeholder for future cron job integration)
export async function scheduleFollowUpEmails(userEmail: string, userName: string, ideaTitle: string) {
  try {
    console.log('📅 Scheduling follow-up emails for:', userEmail, 'idea:', ideaTitle);
    
    // TODO: In a real implementation, this would:
    // 1. Store the user data in a database
    // 2. Set up cron jobs or use a service like Vercel Cron
    // 3. Send emails at day 3, 7, and 14
    
    // For now, we'll just log the intent
    console.log('📅 Would schedule emails for:');
    console.log('  - Day 3: Check-in email');
    console.log('  - Day 7: Progress email');
    console.log('  - Day 14: Final push email');
    
    return { 
      success: true, 
      message: 'Follow-up emails scheduled (placeholder - cron job integration needed)',
      scheduledEmails: [
        { day: 3, type: 'check-in' },
        { day: 7, type: 'progress' },
        { day: 14, type: 'final-push' }
      ]
    };
  } catch (error) {
    console.error('❌ Error scheduling follow-up emails:', error);
    return { success: false, message: 'Failed to schedule follow-up emails' };
  }
}

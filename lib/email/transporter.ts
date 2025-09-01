import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Verify connection
export async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return { success: true, message: 'Email connection verified' };
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return { success: false, message: 'Email connection failed', error };
  }
}

// Send welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string, ideaTitle: string) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: userEmail,
      subject: `🎯 Welcome to Gary Hormozi AI - Your "${ideaTitle}" Analysis is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🚀 Welcome to Gary Hormozi AI!</h2>
          <p>Hi ${userName},</p>
          <p>Your business idea "<strong>${ideaTitle}</strong>" has been analyzed by our AI system using Gary Hormozi's proven methodology.</p>
          <p>Here's what you'll find in your feasibility analysis:</p>
          <ul>
            <li>📊 Market size and growth potential</li>
            <li>🏆 Competitive landscape analysis</li>
            <li>💡 Your unfair advantages</li>
            <li>⚔️ Boss battles to overcome</li>
            <li>🎯 Victory blueprint for success</li>
          </ul>
          <p>Ready to turn your idea into a 7-figure empire? Let's get started!</p>
          <p>Best regards,<br>The Gary Hormozi AI Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', userEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// Send follow-up email
export async function sendFollowUpEmail(userEmail: string, userName: string, ideaTitle: string, dayNumber: number) {
  const subjects = {
    3: `📈 Day 3 Check-in: How's "${ideaTitle}" progressing?`,
    7: `🎯 Day 7: Ready to take action on "${ideaTitle}"?`,
    14: `🚀 Day 14: Final push to launch "${ideaTitle}"!`
  };

  const messages = {
    3: `Hi ${userName},<br><br>It's been 3 days since we analyzed your idea "${ideaTitle}". How's it going?<br><br>Have you started working on any of the action steps from your victory blueprint?<br><br>Remember: The best time to start was yesterday. The second best time is now!`,
    7: `Hi ${userName},<br><br>Week 1 check-in for "${ideaTitle}"!<br><br>By now, you should have:<br>• Identified your first boss battle<br>• Started building your unfair advantage<br>• Made progress on your victory blueprint<br><br>What's your biggest win so far?`,
    14: `Hi ${userName},<br><br>Two weeks since your "${ideaTitle}" analysis!<br><br>This is your final push reminder. The market doesn't wait for perfect - it rewards action.<br><br>What's stopping you from launching today?<br><br>Gary says: "The best business plan is the one you execute."`
  };

  try {
    const mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: userEmail,
      subject: subjects[dayNumber as keyof typeof subjects],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${subjects[dayNumber as keyof typeof subjects]}</h2>
          <p>${messages[dayNumber as keyof typeof messages]}</p>
          <p>Keep pushing forward!<br>The Gary Hormozi AI Team</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Day ${dayNumber} follow-up email sent successfully to:`, userEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send day ${dayNumber} follow-up email:`, error);
    return { success: false, error };
  }
}

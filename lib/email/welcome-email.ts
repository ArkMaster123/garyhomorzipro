import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER || process.env.GMAIL_USERNAME,
    pass: process.env.EMAIL_SERVER_PASSWORD || process.env.GMAIL_PASSWORD,
  },
});

// Generate welcome email HTML
function generateWelcomeEmailHTML(userName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Gary Hormozi AI</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Welcome to Gary Hormozi AI!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-top: 0;">Hi ${userName}! 👋</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
          Welcome to the most powerful AI business coaching platform! You've just joined thousands of entrepreneurs who are using AI to accelerate their success.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">🚀 What you can do now:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>AI-Powered Sales Support</strong> - Get expert advice on negotiation and marketing</li>
            <li><strong>Smart Conversation Analysis</strong> - Analyze your sales conversations for insights</li>
            <li><strong>Personalized Strategy</strong> - Receive customized strategies for your industry</li>
            <li><strong>Performance Tracking</strong> - Monitor your progress in real-time</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold; 
                    display: inline-block;
                    font-size: 16px;">
            Start Your AI Journey →
          </a>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">💡 Pro Tip:</h3>
          <p style="margin: 0; font-style: italic;">
            "The best time to plant a tree was 20 years ago. The second best time is now." - Gary Hormozi
          </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Questions? Just reply to this email - we're here to help you succeed!
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent to you because you created an account with Gary Hormozi AI.<br>
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Send welcome email for new user registration
export async function sendRegistrationWelcomeEmail(userEmail: string, userName: string) {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_SERVER_USER && !process.env.GMAIL_USERNAME) {
      console.log('⚠️ Email not configured - skipping welcome email');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER || process.env.GMAIL_USERNAME,
      to: userEmail,
      subject: '🎯 Welcome to Gary Hormozi AI - Your Success Journey Starts Now!',
      html: generateWelcomeEmailHTML(userName),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Registration welcome email sent successfully to:', userEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send registration welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Verify email connection
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return { success: true, message: 'Email connection verified' };
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return { success: false, message: 'Email connection failed', error };
  }
}

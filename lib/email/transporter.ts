import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
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

// Send welcome email with full idea analysis
export async function sendWelcomeEmail(userEmail: string, userName: string, ideaTitle: string, feasibilityCard?: any) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: userEmail,
      subject: `🎯 Your "${ideaTitle}" Analysis is Ready! - Gary Hormozi AI`,
      html: generateWelcomeEmailHTML(userName, ideaTitle, feasibilityCard),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', userEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// Generate beautiful HTML email with full idea analysis
function generateWelcomeEmailHTML(userName: string, ideaTitle: string, feasibilityCard?: any) {
  const baseHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Business Idea Analysis</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🚀 Gary Hormozi AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Business Idea Analysis is Ready!</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hi ${userName}! 👋</h2>
          
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Your business idea <strong style="color: #2563eb;">"${ideaTitle}"</strong> has been analyzed using Gary Hormozi's proven methodology. 
            Here's your complete feasibility assessment:
          </p>
  `;

  // Add feasibility card content if available
  let cardHTML = '';
  if (feasibilityCard) {
    cardHTML = `
      <!-- Feasibility Card -->
      <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #2563eb;">
        
        <!-- Idea Title -->
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">${feasibilityCard.title}</h3>
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">${feasibilityCard.description}</p>

        <!-- Market Analysis -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Market Size</h4>
            <p style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 700;">${feasibilityCard.marketSize?.value || 'N/A'}</p>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">${feasibilityCard.marketSize?.category || ''}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h4 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Growth Rate</h4>
            <p style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 700;">${feasibilityCard.growth?.value || 'N/A'}</p>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">${feasibilityCard.growth?.detail || ''}</p>
          </div>
        </div>

        <!-- Validation -->
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">🎯 Gary's Assessment</h4>
          <p style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;"><strong>Revenue Potential:</strong> ${feasibilityCard.validation?.revenue || 'N/A'}</p>
          <p style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;"><strong>Market Vibe:</strong> ${feasibilityCard.validation?.vibe || 'N/A'}</p>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">${feasibilityCard.validation?.feedback || ''}</p>
        </div>

        <!-- Unfair Advantages -->
        ${feasibilityCard.unfairAdvantages && feasibilityCard.unfairAdvantages.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">💡 Your Unfair Advantages</h4>
          <ul style="color: #1e293b; margin: 0; padding-left: 20px;">
            ${feasibilityCard.unfairAdvantages.map((advantage: string) => `<li style="margin: 8px 0; line-height: 1.5;">${advantage}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Boss Battles -->
        ${feasibilityCard.bossBattles && feasibilityCard.bossBattles.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">⚔️ Boss Battles to Overcome</h4>
          ${feasibilityCard.bossBattles.map((battle: any) => `
            <div style="margin: 15px 0; padding: 15px; background: #fef2f2; border-radius: 6px; border-left: 3px solid #dc2626;">
              <h5 style="color: #dc2626; margin: 0 0 8px 0; font-size: 16px;">${battle.number}. ${battle.title}</h5>
              <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">${battle.description}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Victory Blueprint -->
        ${feasibilityCard.victoryBlueprint && feasibilityCard.victoryBlueprint.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">🎯 Victory Blueprint</h4>
          <ol style="color: #1e293b; margin: 0; padding-left: 20px;">
            ${feasibilityCard.victoryBlueprint.map((step: string) => `<li style="margin: 8px 0; line-height: 1.5;">${step}</li>`).join('')}
          </ol>
        </div>
        ` : ''}

        <!-- Sources (if available) -->
        ${feasibilityCard.sources && feasibilityCard.sources.length > 0 ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">📊 Market Research Sources</h4>
          ${feasibilityCard.sources.map((source: any) => `
            <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
              <a href="${source.url}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${source.title}</a>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">${source.description}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}

      </div>
    `;
  }

  const footerHTML = `
          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://garyhormozi.ai/ideator" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Generate Another Idea
            </a>
          </div>

          <!-- Follow-up Info -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #0369a1; margin: 0 0 10px 0; font-size: 16px;">📧 What's Next?</h4>
            <p style="color: #0369a1; margin: 0; font-size: 14px; line-height: 1.5;">
              You'll receive follow-up emails on day 3, 7, and 14 with additional insights and motivation to keep you on track!
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
            Ready to turn your idea into a 7-figure empire? The analysis above gives you the roadmap. 
            Now it's time to take action!
          </p>

          <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
            Best regards,<br>
            <strong style="color: #1e293b;">The Gary Hormozi AI Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
            This email was generated by Gary Hormozi AI. If you have any questions, reply to this email.
          </p>
          <p style="color: #9ca3af; font-size: 10px; margin: 0;">
            If you want to be removed from this list, please reply with "unsubscribe"
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseHTML + cardHTML + footerHTML;
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

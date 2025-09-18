// TODO: Email Integration - Placeholder Templates
// This file will be implemented when we add Gmail + Nodemailer integration

export const emailTemplates = {
  welcome: (userName: string, ideaTitle: string) => ({
    subject: `Your ${ideaTitle} Analysis is Ready! 🚀`,
    html: `
      <h2>Welcome to Gary Hormozi's AI Ideator!</h2>
      <p>Hi ${userName},</p>
      <p>Your business idea "<strong>${ideaTitle}</strong>" has been analyzed with our advanced AI system.</p>
      <p>Here's what you'll get:</p>
      <ul>
        <li>📊 Real market research data from Statista</li>
        <li>🎯 Competitive landscape analysis</li>
        <li>💡 Strategic insights from Gary's methodology</li>
        <li>🚀 Actionable next steps</li>
      </ul>
      <p>Ready to see your full analysis?</p>
      <a href="[YOUR_APP_URL]/ideator" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Your Analysis</a>
    `
  }),
  
  followUp: (userName: string, ideaTitle: string) => ({
    subject: `3 Days Later: How's ${ideaTitle} Coming Along? 🤔`,
    html: `
      <h2>Time to Check In!</h2>
      <p>Hi ${userName},</p>
      <p>It's been 3 days since we analyzed your "<strong>${ideaTitle}</strong>" idea.</p>
      <p>Have you started working on it? Here are some quick wins:</p>
      <ul>
        <li>🎯 Pick ONE challenge from your Boss Battles</li>
        <li>📱 Create a simple landing page</li>
        <li>👥 Talk to 3 potential customers</li>
      </ul>
      <p>Need help? Reply to this email - I'm here to support you!</p>
    `
  })
};

// Placeholder function to get template
export const getEmailTemplate = (type: 'welcome' | 'followUp', userName: string, ideaTitle: string) => {
  console.log('📧 Placeholder: Would get email template for:', type, 'user:', userName, 'idea:', ideaTitle);
  return emailTemplates[type](userName, ideaTitle);
};

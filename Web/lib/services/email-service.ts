import { getUser } from '@/lib/db/queries';

// Email service configuration
export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'welcome' | 'reminder' | 'report_ready' | 'progress_update' | 'achievement' | 'motivation';
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export interface EmailNotification {
  id: string;
  userId: string;
  templateId: string;
  subject: string;
  content: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduledAt?: Date;
  sentAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
}

export interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  targetAudience: 'all' | 'new_users' | 'inactive_users' | 'completed_questionnaires' | 'low_income' | 'custom';
  scheduledAt?: Date;
  completedAt?: Date;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  metadata: Record<string, any>;
}

// Default email templates
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Verisona AI - Your College Journey Starts Here!',
    type: 'welcome',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Verisona AI</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Verisona AI!</h1>
      <p>Your authentic persona awaits discovery</p>
    </div>
    <div class="content">
      <h2>Hi {{firstName}},</h2>
      <p>Welcome to Verisona AI, where truth meets opportunity! We're excited to help you discover and present your authentic self for college applications.</p>
      
      <h3>What's Next?</h3>
      <ul>
        <li><strong>Complete Your Profile:</strong> Tell us about yourself and your goals</li>
        <li><strong>Take Our Questionnaires:</strong> Discover your unique strengths and persona</li>
        <li><strong>Get AI Insights:</strong> Receive personalized recommendations for your college journey</li>
        <li><strong>Build Your Story:</strong> Learn how to authentically present yourself to colleges</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardUrl}}" class="button">Start Your Journey</a>
      </div>
      
      <p><strong>Need Help?</strong><br>
      Our support team is here to guide you every step of the way. We're especially committed to supporting underrepresented and low-income students achieve their college dreams.</p>
      
      <p>Questions? Reply to this email or visit our <a href="{{helpUrl}}">Help Center</a>.</p>
      
      <p>Best of luck,<br>
      The Verisona AI Team</p>
    </div>
    <div class="footer">
      <p>© 2024 Verisona AI. All rights reserved.</p>
      <p>Helping students discover their authentic persona for college success.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Welcome to Verisona AI!

Hi {{firstName}},

Welcome to Verisona AI, where truth meets opportunity! We're excited to help you discover and present your authentic self for college applications.

What's Next?
- Complete Your Profile: Tell us about yourself and your goals
- Take Our Questionnaires: Discover your unique strengths and persona  
- Get AI Insights: Receive personalized recommendations for your college journey
- Build Your Story: Learn how to authentically present yourself to colleges

Start your journey: {{dashboardUrl}}

Need Help?
Our support team is here to guide you every step of the way. We're especially committed to supporting underrepresented and low-income students achieve their college dreams.

Questions? Reply to this email or visit our Help Center: {{helpUrl}}

Best of luck,
The Verisona AI Team

© 2024 Verisona AI. All rights reserved.
Helping students discover their authentic persona for college success.`,
    variables: ['firstName', 'dashboardUrl', 'helpUrl']
  },
  {
    id: 'questionnaire_reminder',
    name: 'Questionnaire Reminder',
    subject: 'Your College Journey Awaits - Complete Your Questionnaire',
    type: 'reminder',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Complete Your Questionnaire</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .progress-bar { background: #f0f0f0; height: 8px; border-radius: 4px; margin: 20px 0; }
    .progress-fill { background: #f5576c; height: 100%; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Don't Stop Now!</h1>
      <p>Your college application is waiting for your authentic voice</p>
    </div>
    <div class="content">
      <h2>Hi {{firstName}},</h2>
      <p>You're {{progressPercentage}}% through discovering your authentic persona! Your college journey is so close to the next breakthrough.</p>
      
      <div class="progress-bar">
        <div class="progress-fill" style="width: {{progressPercentage}}%;"></div>
      </div>
      
      <h3>Why Complete Your Questionnaire?</h3>
      <ul>
        <li><strong>Discover Hidden Strengths:</strong> Our AI reveals qualities you might not have recognized</li>
        <li><strong>Stand Out Authentically:</strong> Learn how to present your true self to admissions officers</li>
        <li><strong>Personalized Guidance:</strong> Get recommendations tailored to your background and goals</li>
        <li><strong>Success Stories:</strong> Join thousands of students who've found their path to college</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{questionnaireUrl}}" class="button">Continue My Journey</a>
      </div>
      
      <p><strong>Just {{remainingMinutes}} minutes to go!</strong><br>
      That's all it takes to unlock insights that could change your college application story.</p>
      
      <p>Remember: Every great college application starts with knowing yourself. We're here to help you get there.</p>
      
      <p>Keep going,<br>
      The Verisona AI Team</p>
    </div>
    <div class="footer">
      <p>© 2024 Verisona AI. All rights reserved.</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Email Preferences</a></p>
    </div>
  </div>
</body>
</html>`,
    textContent: `Don't Stop Now!

Hi {{firstName}},

You're {{progressPercentage}}% through discovering your authentic persona! Your college journey is so close to the next breakthrough.

Why Complete Your Questionnaire?
- Discover Hidden Strengths: Our AI reveals qualities you might not have recognized
- Stand Out Authentically: Learn how to present your true self to admissions officers
- Personalized Guidance: Get recommendations tailored to your background and goals
- Success Stories: Join thousands of students who've found their path to college

Continue your journey: {{questionnaireUrl}}

Just {{remainingMinutes}} minutes to go!
That's all it takes to unlock insights that could change your college application story.

Remember: Every great college application starts with knowing yourself. We're here to help you get there.

Keep going,
The Verisona AI Team

© 2024 Verisona AI. All rights reserved.
Unsubscribe: {{unsubscribeUrl}} | Email Preferences: {{preferencesUrl}}`,
    variables: ['firstName', 'progressPercentage', 'remainingMinutes', 'questionnaireUrl', 'unsubscribeUrl', 'preferencesUrl']
  },
  {
    id: 'report_ready',
    name: 'AI Report Ready',
    subject: '🎉 Your Personalized College Application Insights Are Ready!',
    type: 'report_ready',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your AI Report Is Ready</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .highlight-box { background: #f8f9ff; border-left: 4px solid #4facfe; padding: 15px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Report Is Ready!</h1>
      <p>Discover your unique persona and college application strategy</p>
    </div>
    <div class="content">
      <h2>Congratulations, {{firstName}}!</h2>
      <p>Your personalized AI report is now available! Our advanced algorithms have analyzed your responses to create insights that will transform your college application approach.</p>
      
      <div class="highlight-box">
        <h3>📊 What's In Your Report:</h3>
        <ul>
          <li><strong>Personality Profile:</strong> Your authentic strengths and characteristics</li>
          <li><strong>College Fit Analysis:</strong> Institutions that align with your values and goals</li>
          <li><strong>Application Strategy:</strong> How to present your unique story</li>
          <li><strong>Essay Guidance:</strong> Themes and stories that showcase your persona</li>
          <li><strong>Interview Preparation:</strong> Key talking points about yourself</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{reportUrl}}" class="button">View My Detailed Report</a>
      </div>
      
      <h3>🌟 Your Top Insights:</h3>
      <ul>
        <li>{{insight1}}</li>
        <li>{{insight2}}</li>
        <li>{{insight3}}</li>
      </ul>
      
      <p><strong>What's Next?</strong></p>
      <p>Take time to review your report thoroughly. Use the insights to craft compelling essays, prepare for interviews, and choose colleges that truly fit your authentic self.</p>
      
      <p>Need help interpreting your results? Our support team is here to guide you through every insight.</p>
      
      <p>Authentically yours,<br>
      The Verisona AI Team</p>
    </div>
    <div class="footer">
      <p>© 2024 Verisona AI. All rights reserved.</p>
      <p><a href="{{shareUrl}}">Share Your Success</a> | <a href="{{supportUrl}}">Get Support</a></p>
    </div>
  </div>
</body>
</html>`,
    textContent: `🎉 Your Report Is Ready!

Congratulations, {{firstName}}!

Your personalized AI report is now available! Our advanced algorithms have analyzed your responses to create insights that will transform your college application approach.

📊 What's In Your Report:
- Personality Profile: Your authentic strengths and characteristics
- College Fit Analysis: Institutions that align with your values and goals
- Application Strategy: How to present your unique story
- Essay Guidance: Themes and stories that showcase your persona
- Interview Preparation: Key talking points about yourself

View your detailed report: {{reportUrl}}

🌟 Your Top Insights:
- {{insight1}}
- {{insight2}}
- {{insight3}}

What's Next?
Take time to review your report thoroughly. Use the insights to craft compelling essays, prepare for interviews, and choose colleges that truly fit your authentic self.

Need help interpreting your results? Our support team is here to guide you through every insight.

Authentically yours,
The Verisona AI Team

© 2024 Verisona AI. All rights reserved.
Share Your Success: {{shareUrl}} | Get Support: {{supportUrl}}`,
    variables: ['firstName', 'reportUrl', 'insight1', 'insight2', 'insight3', 'shareUrl', 'supportUrl']
  },
  {
    id: 'weekly_progress',
    name: 'Weekly Progress Update',
    subject: 'Your Weekly Progress - You\'re Making Great Strides!',
    type: 'progress_update',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Weekly Progress Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #42a5f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #42a5f5; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 Weekly Progress Report</h1>
      <p>See how far you've come this week, {{firstName}}!</p>
    </div>
    <div class="content">
      <h2>Great work this week!</h2>
      <p>You're making consistent progress on your college application journey. Here's what you've accomplished:</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{questionsAnswered}}</div>
          <div>Questions Answered</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{timeSpent}}</div>
          <div>Minutes Invested</div>
        </div>
      </div>
      
      <h3>🎯 This Week's Achievements:</h3>
      <ul>
        {{#each achievements}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      
      <h3>📚 Recommended Next Steps:</h3>
      <ul>
        <li>{{nextStep1}}</li>
        <li>{{nextStep2}}</li>
        <li>{{nextStep3}}</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardUrl}}" class="button">Continue Your Journey</a>
      </div>
      
      <p><strong>💡 Tip of the Week:</strong><br>
      {{weeklyTip}}</p>
      
      <p><strong>Stay Connected:</strong><br>
      Join our community of students supporting each other through the college application process. Share your wins and get encouragement!</p>
      
      <p>Keep up the momentum,<br>
      The Verisona AI Team</p>
    </div>
    <div class="footer">
      <p>© 2024 Verisona AI. All rights reserved.</p>
      <p><a href="{{communityUrl}}">Join Our Community</a> | <a href="{{resourcesUrl}}">Free Resources</a></p>
    </div>
  </div>
</body>
</html>`,
    textContent: `📈 Weekly Progress Report

Great work this week!

Hi {{firstName}},

You're making consistent progress on your college application journey. Here's what you've accomplished:

This Week's Stats:
- Questions Answered: {{questionsAnswered}}
- Minutes Invested: {{timeSpent}}

🎯 This Week's Achievements:
{{#each achievements}}
- {{this}}
{{/each}}

📚 Recommended Next Steps:
- {{nextStep1}}
- {{nextStep2}}
- {{nextStep3}}

Continue your journey: {{dashboardUrl}}

💡 Tip of the Week:
{{weeklyTip}}

Stay Connected:
Join our community of students supporting each other through the college application process. Share your wins and get encouragement!

Keep up the momentum,
The Verisona AI Team

© 2024 Verisona AI. All rights reserved.
Join Our Community: {{communityUrl}} | Free Resources: {{resourcesUrl}}`,
    variables: ['firstName', 'questionsAnswered', 'timeSpent', 'achievements', 'nextStep1', 'nextStep2', 'nextStep3', 'weeklyTip', 'dashboardUrl', 'communityUrl', 'resourcesUrl']
  },
  {
    id: 'motivation_boost',
    name: 'Motivational Message',
    subject: 'You\'ve Got This! Your Dream College is Within Reach 🌟',
    type: 'motivation',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Motivation Boost</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #333; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #e17055; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .quote-box { background: #fff3e0; border-left: 4px solid #e17055; padding: 20px; margin: 20px 0; font-style: italic; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌟 You've Got This!</h1>
      <p>A reminder of how amazing you are, {{firstName}}</p>
    </div>
    <div class="content">
      <h2>Dear {{firstName}},</h2>
      <p>Sometimes the college application process can feel overwhelming. That's completely normal! Today, we want to remind you of something important: <strong>You belong here.</strong></p>
      
      <div class="quote-box">
        "The future belongs to those who believe in the beauty of their dreams." 
        <br><em>- Eleanor Roosevelt</em>
      </div>
      
      <h3>🎓 Remember Why You Started:</h3>
      <ul>
        <li>You have unique experiences that matter</li>
        <li>Your background is a strength, not a limitation</li>
        <li>Every challenge you've overcome has prepared you for this moment</li>
        <li>Colleges need students like you</li>
      </ul>
      
      <h3>💪 You're Not Alone:</h3>
      <p>Thousands of students like you have walked this path and succeeded. Many came from similar backgrounds, faced similar challenges, and went on to thrive in college and beyond.</p>
      
      <p><strong>{{successStory}}</strong></p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{inspirationUrl}}" class="button">Read More Success Stories</a>
      </div>
      
      <h3>✨ Today's Action:</h3>
      <p>Take one small step forward. Whether it's answering one more question, reviewing your profile, or simply taking a moment to appreciate how far you've come - every step counts.</p>
      
      <p>We believe in you. Your dreams are valid, your story matters, and your future is bright.</p>
      
      <p>Cheering you on,<br>
      The Verisona AI Team 📣</p>
    </div>
    <div class="footer">
      <p>© 2024 Verisona AI. All rights reserved.</p>
      <p>You are capable of amazing things. Never forget that.</p>
    </div>
  </div>
</body>
</html>`,
    textContent: `🌟 You've Got This!

Dear {{firstName}},

Sometimes the college application process can feel overwhelming. That's completely normal! Today, we want to remind you of something important: You belong here.

"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt

🎓 Remember Why You Started:
- You have unique experiences that matter
- Your background is a strength, not a limitation
- Every challenge you've overcome has prepared you for this moment
- Colleges need students like you

💪 You're Not Alone:
Thousands of students like you have walked this path and succeeded. Many came from similar backgrounds, faced similar challenges, and went on to thrive in college and beyond.

{{successStory}}

Read more success stories: {{inspirationUrl}}

✨ Today's Action:
Take one small step forward. Whether it's answering one more question, reviewing your profile, or simply taking a moment to appreciate how far you've come - every step counts.

We believe in you. Your dreams are valid, your story matters, and your future is bright.

Cheering you on,
The Verisona AI Team 📣

© 2024 Verisona AI. All rights reserved.
You are capable of amazing things. Never forget that.`,
    variables: ['firstName', 'successStory', 'inspirationUrl']
  }
];

// Email service class
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Send individual email
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In a real application, you would integrate with an email service like:
      // - SendGrid, Mailgun, Amazon SES, Resend, etc.
      // For now, we'll simulate the email sending
      
      console.log('📧 Sending email:', {
        to,
        subject,
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        metadata
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { success: true, messageId };
      } else {
        return { success: false, error: 'SMTP connection failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Send templated email
  async sendTemplatedEmail(
    to: string,
    templateId: string,
    variables: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = defaultEmailTemplates.find(t => t.id === templateId);
    if (!template) {
      return { success: false, error: `Template ${templateId} not found` };
    }

    // Replace variables in template
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;
    let subject = template.subject;

    // Simple variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return this.sendEmail(to, subject, htmlContent, textContent, {
      templateId,
      variables,
      ...metadata
    });
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: Array<{
      email: string;
      variables?: Record<string, any>;
    }>,
    templateId: string,
    defaultVariables?: Record<string, any>
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const variables = { ...defaultVariables, ...recipient.variables };
      const result = await this.sendTemplatedEmail(
        recipient.email,
        templateId,
        variables,
        { bulkSend: true }
      );

      results.push({
        email: recipient.email,
        ...result
      });

      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed, results };
  }
}

// Default email service instance (would be configured with real SMTP settings)
export const emailService = new EmailService({
  smtpHost: process.env.SMTP_HOST || 'localhost',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || 'user',
  smtpPass: process.env.SMTP_PASS || 'pass',
  fromEmail: process.env.FROM_EMAIL || 'noreply@verisona.ai',
  fromName: process.env.FROM_NAME || 'Verisona AI'
});

// Notification triggers and automation
export class NotificationService {
  constructor(private emailService: EmailService) {}

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail: string, firstName: string) {
    return this.emailService.sendTemplatedEmail(userEmail, 'welcome', {
      firstName,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      helpUrl: `${process.env.NEXT_PUBLIC_APP_URL}/help`
    });
  }

  // Send questionnaire reminder
  async sendQuestionnaireReminder(
    userEmail: string,
    firstName: string,
    progressPercentage: number,
    remainingMinutes: number
  ) {
    return this.emailService.sendTemplatedEmail(userEmail, 'questionnaire_reminder', {
      firstName,
      progressPercentage,
      remainingMinutes,
      questionnaireUrl: `${process.env.NEXT_PUBLIC_APP_URL}/questionnaires`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`,
      preferencesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/preferences`
    });
  }

  // Send report ready notification
  async sendReportReadyEmail(
    userEmail: string,
    firstName: string,
    reportId: string,
    insights: string[]
  ) {
    return this.emailService.sendTemplatedEmail(userEmail, 'report_ready', {
      firstName,
      reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reports/${reportId}`,
      insight1: insights[0] || 'You have strong analytical thinking skills',
      insight2: insights[1] || 'You show great potential for leadership',
      insight3: insights[2] || 'Your authentic voice will resonate with admissions committees',
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${reportId}`,
      supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`
    });
  }

  // Send weekly progress update
  async sendWeeklyProgress(
    userEmail: string,
    firstName: string,
    stats: {
      questionsAnswered: number;
      timeSpent: number;
      achievements: string[];
      nextSteps: string[];
      weeklyTip: string;
    }
  ) {
    return this.emailService.sendTemplatedEmail(userEmail, 'weekly_progress', {
      firstName,
      questionsAnswered: stats.questionsAnswered,
      timeSpent: stats.timeSpent,
      achievements: stats.achievements,
      nextStep1: stats.nextSteps[0],
      nextStep2: stats.nextSteps[1],
      nextStep3: stats.nextSteps[2],
      weeklyTip: stats.weeklyTip,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      communityUrl: `${process.env.NEXT_PUBLIC_APP_URL}/community`,
      resourcesUrl: `${process.env.NEXT_PUBLIC_APP_URL}/resources`
    });
  }

  // Send motivational message
  async sendMotivationBoost(
    userEmail: string,
    firstName: string,
    successStory: string
  ) {
    return this.emailService.sendTemplatedEmail(userEmail, 'motivation_boost', {
      firstName,
      successStory,
      inspirationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success-stories`
    });
  }
}

// Default notification service instance
export const notificationService = new NotificationService(emailService);
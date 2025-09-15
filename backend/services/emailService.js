const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    // Configure for Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS  // Gmail App Password (not regular password)
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send job match notification email
  async sendJobMatchNotification(studentEmail, matchData) {
    try {
      const { job, matchScore, matchLevel, recruiterCompany } = matchData;

      const subject = `🎯 New Job Match Found - ${matchScore}% Match!`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .match-score { background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
            .job-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .cta-button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .university-logo { text-align: center; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="university-logo">
              <h2>🎓 Centurion University</h2>
              <p>Shaping Lives... Empowering Communities!</p>
            </div>
            <h1>New Job Match Found!</h1>
          </div>
          
          <div class="content">
            <div class="match-score">
              <h3>🎯 Match Score: ${matchScore}% - ${matchLevel} Match</h3>
              <p>Our AI system has found a great job opportunity that matches your profile!</p>
            </div>
            
            <div class="job-details">
              <h3>📋 Job Details:</h3>
              <p><strong>Position:</strong> ${job.title}</p>
              <p><strong>Company:</strong> ${recruiterCompany}</p>
              <p><strong>Location:</strong> ${job.location || 'Not specified'}</p>
              <p><strong>Type:</strong> ${job.type || 'Full-time'}</p>
              ${job.requiredSkills && job.requiredSkills.length > 0 ? 
                `<p><strong>Required Skills:</strong> ${job.requiredSkills.join(', ')}</p>` : ''}
            </div>
            
            <p>Based on your resume, skills, and experience, this position appears to be an excellent fit for your profile.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}" class="cta-button">
              View Job Details & Apply
            </a>
            
            <p><strong>Why this matches you:</strong></p>
            <ul>
              <li>Your skills align well with the job requirements</li>
              <li>Your experience matches the position level</li>
              <li>The role fits your career interests</li>
            </ul>
            
            <p>Don't miss this opportunity! Log in to your College Talent Hub account to apply.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from College Talent Hub</p>
            <p>Centurion University of Technology and Management</p>
            <p>If you no longer wish to receive these notifications, please update your preferences in your profile.</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        New Job Match Found!
        
        Match Score: ${matchScore}% - ${matchLevel} Match
        
        Job Details:
        Position: ${job.title}
        Company: ${recruiterCompany}
        Location: ${job.location || 'Not specified'}
        Type: ${job.type || 'Full-time'}
        ${job.requiredSkills && job.requiredSkills.length > 0 ? 
          `Required Skills: ${job.requiredSkills.join(', ')}` : ''}
        
        Based on your profile, this position appears to be an excellent fit.
        
        Visit ${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id} to view details and apply.
        
        Best regards,
        College Talent Hub Team
        Centurion University of Technology and Management
      `;

      const mailOptions = {
        from: `"College Talent Hub" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Job match notification sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending job match notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bulk notifications to multiple students
  async sendBulkJobMatchNotifications(matches) {
    const results = [];
    
    for (const match of matches) {
      try {
        const result = await this.sendJobMatchNotification(
          match.student.email,
          match
        );
        results.push({
          studentId: match.student.id,
          email: match.student.email,
          ...result
        });
        
        // Add delay to avoid overwhelming email server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending email to ${match.student.email}:`, error);
        results.push({
          studentId: match.student.id,
          email: match.student.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail, userName, userRole) {
    try {
      const subject = `Welcome to College Talent Hub - ${userName}!`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .welcome-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🎓 Centurion University</h2>
            <p>Shaping Lives... Empowering Communities!</p>
            <h1>Welcome to College Talent Hub!</h1>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h3>Hello ${userName}!</h3>
              <p>Welcome to College Talent Hub as a <strong>${userRole}</strong>. We're excited to have you on board!</p>
              
              ${userRole === 'student' ? `
                <p>As a student, you can:</p>
                <ul>
                  <li>Upload your resume and build your profile</li>
                  <li>Get AI-powered job recommendations</li>
                  <li>Apply to jobs from top recruiters</li>
                  <li>Track your applications and career progress</li>
                </ul>
              ` : userRole === 'recruiter' ? `
                <p>As a recruiter, you can:</p>
                <ul>
                  <li>Post job openings with detailed requirements</li>
                  <li>Use AI to find the best-fit students</li>
                  <li>Review applications and shortlist candidates</li>
                  <li>Connect with top talent from Centurion University</li>
                </ul>
              ` : `
                <p>As faculty, you can:</p>
                <ul>
                  <li>Manage your academic profile</li>
                  <li>Guide and mentor students</li>
                  <li>Oversee departmental activities</li>
                  <li>Support student career development</li>
                </ul>
              `}
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="cta-button">
              Complete Your Profile
            </a>
            
            <p>Get started by completing your profile and exploring the platform!</p>
          </div>
          
          <div class="footer">
            <p>College Talent Hub - Connecting Talent with Opportunity</p>
            <p>Centurion University of Technology and Management</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"College Talent Hub" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send job posting notification to all students
  async sendJobPostingNotification(jobData, recruiterData) {
    try {
      const User = require('../models/User');
      const students = await User.find({ role: 'student' }).select('email name');
      
      const subject = `🚀 New Job Opportunity: ${jobData.title}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .job-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .cta-button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🎓 Centurion University</h2>
            <p>College Talent Hub</p>
            <h1>New Job Opportunity Posted!</h1>
          </div>
          
          <div class="content">
            <div class="job-details">
              <h3>📋 Job Details:</h3>
              <p><strong>Position:</strong> ${jobData.title}</p>
              <p><strong>Company:</strong> ${recruiterData.company || recruiterData.name}</p>
              <p><strong>Location:</strong> ${jobData.location || 'Not specified'}</p>
              <p><strong>Type:</strong> ${jobData.type || 'Full-time'}</p>
              <p><strong>Salary:</strong> ${jobData.salary || 'Not disclosed'}</p>
              ${jobData.requiredSkills && jobData.requiredSkills.length > 0 ? 
                `<p><strong>Required Skills:</strong> ${jobData.requiredSkills.join(', ')}</p>` : ''}
              <p><strong>Description:</strong> ${jobData.description.substring(0, 200)}...</p>
            </div>
            
            <p>A new job opportunity has been posted on College Talent Hub. Don't miss out on this chance to advance your career!</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs" class="cta-button">
              View Job & Apply Now
            </a>
          </div>
          
          <div class="footer">
            <p>College Talent Hub - Connecting Talent with Opportunity</p>
            <p>Centurion University of Technology and Management</p>
          </div>
        </body>
        </html>
      `;

      const results = [];
      for (const student of students) {
        try {
          const mailOptions = {
            from: `"College Talent Hub" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: subject,
            html: htmlContent
          };

          const result = await this.transporter.sendMail(mailOptions);
          results.push({ email: student.email, success: true, messageId: result.messageId });
          
          // Add delay to avoid overwhelming email server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending job notification to ${student.email}:`, error);
          results.push({ email: student.email, success: false, error: error.message });
        }
      }
      
      console.log(`Job posting notification sent to ${results.filter(r => r.success).length}/${students.length} students`);
      return { success: true, results };

    } catch (error) {
      console.error('Error sending job posting notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Send competition posting notification to all students
  async sendCompetitionNotification(competitionData, facultyData) {
    try {
      const User = require('../models/User');
      const students = await User.find({ role: 'student' }).select('email name');
      
      const subject = `🏆 New Competition: ${competitionData.title}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .competition-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .cta-button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🎓 Centurion University</h2>
            <p>College Talent Hub</p>
            <h1>New Competition Announced!</h1>
          </div>
          
          <div class="content">
            <div class="competition-details">
              <h3>🏆 Competition Details:</h3>
              <p><strong>Title:</strong> ${competitionData.title}</p>
              <p><strong>Organized by:</strong> ${facultyData.name}</p>
              <p><strong>Department:</strong> ${facultyData.department || 'Not specified'}</p>
              <p><strong>Registration Deadline:</strong> ${new Date(competitionData.registrationDeadline).toLocaleDateString()}</p>
              <p><strong>Competition Date:</strong> ${new Date(competitionData.competitionDate).toLocaleDateString()}</p>
              <p><strong>Prize Pool:</strong> ${competitionData.prizePool || 'To be announced'}</p>
              <p><strong>Description:</strong> ${competitionData.description.substring(0, 200)}...</p>
            </div>
            
            <p>A new competition has been announced! This is a great opportunity to showcase your skills and compete with your peers.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/competitions" class="cta-button">
              View Competition & Register
            </a>
          </div>
          
          <div class="footer">
            <p>College Talent Hub - Empowering Student Excellence</p>
            <p>Centurion University of Technology and Management</p>
          </div>
        </body>
        </html>
      `;

      const results = [];
      for (const student of students) {
        try {
          const mailOptions = {
            from: `"College Talent Hub" <${process.env.EMAIL_USER}>`,
            to: student.email,
            subject: subject,
            html: htmlContent
          };

          const result = await this.transporter.sendMail(mailOptions);
          results.push({ email: student.email, success: true, messageId: result.messageId });
          
          // Add delay to avoid overwhelming email server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending competition notification to ${student.email}:`, error);
          results.push({ email: student.email, success: false, error: error.message });
        }
      }
      
      console.log(`Competition notification sent to ${results.filter(r => r.success).length}/${students.length} students`);
      return { success: true, results };

    } catch (error) {
      console.error('Error sending competition notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Send general post notification to all users
  async sendPostNotification(postData, authorData) {
    try {
      const User = require('../models/User');
      const users = await User.find({ 
        _id: { $ne: authorData._id }, // Exclude the post author
        role: { $in: ['student', 'faculty', 'recruiter'] }
      }).select('email name role');
      
      const subject = `📢 New Post: ${postData.title || 'New Update'}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .post-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .cta-button { background: #6f42c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🎓 Centurion University</h2>
            <p>College Talent Hub</p>
            <h1>New Post Shared!</h1>
          </div>
          
          <div class="content">
            <div class="post-details">
              <h3>📢 Post Details:</h3>
              <p><strong>Posted by:</strong> ${authorData.name} (${authorData.role})</p>
              ${postData.title ? `<p><strong>Title:</strong> ${postData.title}</p>` : ''}
              <p><strong>Content:</strong> ${(postData.content || postData.description || 'No content available').substring(0, 300)}${(postData.content || postData.description || '').length > 300 ? '...' : ''}</p>
              <p><strong>Posted on:</strong> ${new Date(postData.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            
            <p>A new post has been shared on College Talent Hub. Stay connected with the latest updates from your college community!</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/posts" class="cta-button">
              View Post & Engage
            </a>
          </div>
          
          <div class="footer">
            <p>College Talent Hub - Building Community Connections</p>
            <p>Centurion University of Technology and Management</p>
          </div>
        </body>
        </html>
      `;

      const results = [];
      for (const user of users) {
        try {
          const mailOptions = {
            from: `"College Talent Hub" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: subject,
            html: htmlContent
          };

          const result = await this.transporter.sendMail(mailOptions);
          results.push({ email: user.email, success: true, messageId: result.messageId });
          
          // Add delay to avoid overwhelming email server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error sending post notification to ${user.email}:`, error);
          results.push({ email: user.email, success: false, error: error.message });
        }
      }
      
      console.log(`Post notification sent to ${results.filter(r => r.success).length}/${users.length} users`);
      return { success: true, results };

    } catch (error) {
      console.error('Error sending post notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('Email configuration error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

const Notification = require('../models/Notification');
const User = require('../models/User');

// Create notification for all students when faculty/recruiter posts
const createPostNotification = async (post, sender) => {
  try {
    // Only create notifications if sender is faculty or recruiter
    if (sender.role !== 'faculty' && sender.role !== 'recruiter') {
      return;
    }

    // Get all students
    const students = await User.find({ role: 'student' }).select('_id');
    
    if (students.length === 0) {
      console.log('No students found to notify');
      return;
    }

    // Create notification data
    const notificationData = {
      sender: sender._id,
      type: 'post',
      title: `New post from ${sender.name}`,
      message: `${sender.name} (${sender.role}) has shared a new post: ${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}`,
      relatedId: post._id
    };

    // Create notifications for all students
    const notifications = students.map(student => ({
      ...notificationData,
      recipient: student._id
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for new post by ${sender.name}`);
    
  } catch (error) {
    console.error('Error creating post notifications:', error);
  }
};

// Create notification for job postings
const createJobNotification = async (job, sender) => {
  try {
    if (sender.role !== 'faculty' && sender.role !== 'recruiter') {
      return;
    }

    const students = await User.find({ role: 'student' }).select('_id');
    
    if (students.length === 0) {
      return;
    }

    const notificationData = {
      sender: sender._id,
      type: 'job',
      title: `New job opportunity: ${job.title}`,
      message: `${sender.name} has posted a new job: ${job.title} at ${job.company}`,
      relatedId: job._id
    };

    const notifications = students.map(student => ({
      ...notificationData,
      recipient: student._id
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for new job by ${sender.name}`);
    
  } catch (error) {
    console.error('Error creating job notifications:', error);
  }
};

// Create notification for competitions
const createCompetitionNotification = async (competition, sender) => {
  try {
    if (sender.role !== 'faculty' && sender.role !== 'recruiter') {
      return;
    }

    const students = await User.find({ role: 'student' }).select('_id');
    
    if (students.length === 0) {
      return;
    }

    const notificationData = {
      sender: sender._id,
      type: 'competition',
      title: `New competition: ${competition.title}`,
      message: `${sender.name} has announced a new competition: ${competition.title}`,
      relatedId: competition._id
    };

    const notifications = students.map(student => ({
      ...notificationData,
      recipient: student._id
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications for new competition by ${sender.name}`);
    
  } catch (error) {
    console.error('Error creating competition notifications:', error);
  }
};

module.exports = {
  createPostNotification,
  createJobNotification,
  createCompetitionNotification
};

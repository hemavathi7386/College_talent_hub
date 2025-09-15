const cron = require('node-cron');
const axios = require('axios');

// Run daily at 9:00 AM
const scheduleDailyRecommendations = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily job recommendations generation...');
    
    try {
      // Call the recommendations endpoint to generate daily recommendations
      const response = await axios.post('http://localhost:5000/api/recommendations/generate-daily');
      console.log('Daily recommendations generated:', response.data);
    } catch (error) {
      console.error('Error generating daily recommendations:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  console.log('Daily recommendations cron job scheduled for 9:00 AM IST');
};

module.exports = { scheduleDailyRecommendations };

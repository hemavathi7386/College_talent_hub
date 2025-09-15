const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB using the same connection string as backend
mongoose.connect('mongodb://127.0.0.1:27017/college_talent_hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const clearDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Wait for connection
    await mongoose.connection.once('open', () => {
      console.log('Connected to MongoDB');
    });
    
    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Entire database cleared successfully');
    
    console.log('🎉 Database cleared completely! You can now register fresh users.');
    
  } catch (error) {
    console.error('Error clearing database:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

clearDatabase();

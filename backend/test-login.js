const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import User model
const User = require('./models/User');

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...\n');

    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('⚠️  No users found. Creating a test user...');
      
      // Create a test user
      const testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      });

      await testUser.save();
      console.log('✅ Test user created successfully');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
    } else {
      // Get first user
      const user = await User.findOne();
      console.log('👤 Found user:', {
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName
      });
    }

    // Test password comparison
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      const isMatch = await user.comparePassword('password123');
      console.log('🔐 Password comparison test:', isMatch ? '✅ PASS' : '❌ FAIL');
    }

    console.log('\n🎯 Login test completed!');
    console.log('💡 Try logging in with:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testLogin(); 
@echo off
echo Creating admin user...
node -e "const mongoose = require('mongoose'); const bcrypt = require('bcryptjs'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash('admin123', salt); const db = mongoose.connection.db; try { await db.collection('users').insertOne({ name: 'System Administrator', email: 'admin@cutmap.ac.in', password: hashedPassword, role: 'admin', isVerified: true, createdAt: new Date(), updatedAt: new Date() }); console.log('Admin created successfully!'); } catch(e) { if(e.code === 11000) console.log('Admin already exists'); else console.log('Error:', e.message); } process.exit(0); }).catch(console.error);"
echo.
echo Admin credentials:
echo Email: admin@cutmap.ac.in
echo Password: admin123
pause

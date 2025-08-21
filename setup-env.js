#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random string for JWT_SECRET
const generateSecret = () => crypto.randomBytes(32).toString('hex');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Generated environment variables
JWT_SECRET=${generateSecret()}
`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with secure JWT_SECRET');
    console.log('You can now start the application with:');
    console.log('npm run dev');
} catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log(
        'Please manually create a .env.local file with the following content:'
    );
    console.log(envContent);
}

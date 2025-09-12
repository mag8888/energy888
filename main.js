#!/usr/bin/env node

console.log('🚀 Starting Energy of Money Game Server...');
console.log('📁 Working directory:', process.cwd());
console.log('📁 Files in directory:', require('fs').readdirSync(process.cwd()));

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log(`📡 Server will run on port: ${process.env.PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

// Check if out directory exists (built Next.js app)
const outPath = require('path').join(process.cwd(), 'out');
if (!require('fs').existsSync(outPath)) {
  console.error('❌ out directory not found! Build the app first.');
  console.log('📁 Available directories:', require('fs').readdirSync(process.cwd()));
  process.exit(1);
}

console.log('📁 Working in root directory:', process.cwd());

// Start the serve process
const { spawn } = require('child_process');
const serveProcess = spawn('npx', ['serve@latest', 'out', '-p', process.env.PORT], {
  stdio: 'inherit',
  cwd: process.cwd()
});

serveProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serveProcess.on('exit', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  serveProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  serveProcess.kill('SIGINT');
});
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Energy of Money Game Server...');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log(`📡 Server will run on port: ${process.env.PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

// Start the serve process
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

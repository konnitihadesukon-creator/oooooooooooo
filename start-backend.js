const { spawn } = require('child_process');
const path = require('path');

// バックエンドディレクトリに移動してサーバーを開始
const backendDir = path.join(__dirname, 'backend');
const child = spawn('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3001',
    NODE_ENV: 'development'
  }
});

child.on('error', (error) => {
  console.error('Backend startup error:', error);
});

child.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  child.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});

console.log('Starting backend server...');
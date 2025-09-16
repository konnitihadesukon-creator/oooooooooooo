module.exports = {
  apps: [
    {
      name: 'shift-match-backend',
      script: 'npm',
      args: 'run dev',
      cwd: './backend',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'shift-match-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        VITE_API_URL: 'http://localhost:3001'
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
}
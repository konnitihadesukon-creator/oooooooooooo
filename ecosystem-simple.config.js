module.exports = {
  apps: [
    {
      name: 'backend',
      script: './src/index.ts',
      cwd: './backend',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      max_memory_restart: '1G',
      time: true
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      max_memory_restart: '1G',
      time: true
    }
  ]
}
// PM2 process definition for the app's node-server build.
// Deployed by .github/workflows/deploy-app.yml into /opt/yashfaa/app/current,
// alongside this file — paths below are relative to that directory.
module.exports = {
  apps: [
    {
      name: "yashfaa-app",
      script: "server/index.mjs",
      cwd: __dirname,
      env_file: ".env",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};

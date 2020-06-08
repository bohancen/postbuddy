module.exports = {
  apps: [{
    name: "postBuddy",
    script: "./src/server/index.js",
    log_date_format: "YYYY-MM-DD HH:mm:ss.SS",
    // merge_logs:true,
    // instances: 4,  // 集群实例，可以只有一个，这样表现上与fork无异，但可以用scale
    // exec_mode:"cluster",
    // watch       : true,
    env_prod: {
      // "NODE_PATH":"./node_modules_build:./self_modules",
      "NODE_ENV": "production",
      // "BIGFUN_API": "production",
      // "BIGFUN_RENDER": "production",
    }
  }]
}
// use
// pm2 start pm2.config.js --env prod

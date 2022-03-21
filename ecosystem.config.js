const envConfiguration = require('dotenv').config();

module.exports = {
    apps: [
        {
        name: "offchain",
        script : "./index.js",
        exec_mode: "cluster",
        instances: -1,
        env: {
            ...process.env,
            },
        }
    ],
}
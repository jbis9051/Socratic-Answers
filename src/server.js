const app = require('./app');
const config = require('../config');

app.listen(config.server.port,() => console.log("Server started on port " + config.server.port));

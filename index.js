var Client = require('./src/client');
exports.Client = Client;
if(global) {
  global.bootic = {
    Client: Client
  }
}

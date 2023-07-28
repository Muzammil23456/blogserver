// const port = process.env.PORT || 3000;
const http = require('http');
const app = require('./app');


const server = http.createServer(app);
server.listen(3001, () => console.log(`port ${3001}`));

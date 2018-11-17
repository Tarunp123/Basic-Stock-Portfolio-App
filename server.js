const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 4321;

const server = http.createServer(app);

server.listen(PORT, function(){
    console.log(`listening on localhost port ${PORT}`);
});



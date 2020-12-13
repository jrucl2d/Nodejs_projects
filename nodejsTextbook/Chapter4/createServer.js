const http = require('http');
const server = http.createServer((req, res)=>{
    res.write(`<h1>Hello Node!</h1>`);
    res.end(`<p>Hello Server!</p>`);
});

server.listen(8080); // listen(8080, 콜백)으로 해도 됨
server.on('listening', () =>{
    console.log('8080번 포트에서 서버 대기중');
});
server.on('error', (error)=>{
    console.error(error);
});
// http://localhost:8080하거나 http://127.0.0.1:8080에 들어가면 위의 문장이 나옴
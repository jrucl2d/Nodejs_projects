const http = require('http');
const fs = require('fs');

http.createServer((req, res) =>{
    fs.readFile('./server2.html', (err, data) =>{ // 버퍼 그대로 읽어와서 전송
        if(err){
            throw err;
        }
        res.end(data);
    });
}).listen(8080, () =>{
    console.log('8080 port is running!');
});
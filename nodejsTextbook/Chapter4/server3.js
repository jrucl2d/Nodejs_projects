const http = require('http');

const parseCookies = (cookie = '') => cookie.split(';') // name=abc;year=1997의 문자열-> [ 'name=123', 'year=1996' ]
    .map(v => v.split('=')) // -> [ [ 'name', '123' ], [ 'year', '1996' ] ]
    .map(([k, ...vs])=> [k, vs.join('=')] ) // value에 여러개가 오면 =로 묶는다.
    .reduce((acc, [k,v]) => { // 초기값 빈 객체 {}에 계속해서 k.trim으로 (양 끝 공백 없앤) k = (한글은 디코딩한) v로 넣는다. 즉, 객체를 추가
        acc[k.trim()] = decodeURIComponent(v);
        return acc;
    }, {}); 

http.createServer((req, res) =>{
    const cookies = parseCookies(req.headers.cookie);
    console.log(req.url, cookies);
    res.writeHead(200, {'Set-Cookie' : 'mycookie=test'});
    res.end('Hello Cookie');
})
.listen(8080, () =>{
    console.log('running!');
});
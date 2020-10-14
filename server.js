const http = require('http');
const server = http.createServer((req, res) => {
    console.log(req.headers);
    res.end('Server responдится')
});

const port = 4242;

server.listen(port, (err) => {
    if (err) {
        return console.log(`Oops! Here is ${err}`)
    }
    console.log(`Говорит и показывает ${port}!`)
})
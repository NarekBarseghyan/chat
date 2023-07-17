
const express = require('express')
const app = express()
const fs = require('fs')
const format = require("node.date-time")
const server = require('http').createServer(app)
const io = require('socket.io')(server)


// ------------------------------------------------------------------------------

server.listen(3000)

let nicName                                                       // ник пользователя


const urlEncodedParser = express.urlencoded({extended: false})    // расшифровщик POST запроса

// ------------------------------------------------------------------------------





// app

// GET запрос на главную страницу
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
    console.log(req);
    fs.appendFile('readme.log', `${new Date().format("[Y-MM-DD H:m:SS]")} ${req.url} ${req.method} ${req.headersDistinct.host[0]}\n`, function(err, data){})

})
// POST запрос с главную страницу
app.post('/', urlEncodedParser, function(req, res){
    nicName = req.body.nic_name
    res.redirect(301, '/chat')
    fs.appendFile('readme.log', `${new Date().format("[Y-MM-DD H:m:SS]")} ${req.url} ${req.method} ${req.headersDistinct.host[0]}\n`, function(err, data){})
})
// GET запрос на страницу чата
app.get('/chat', function(req, res){
    res.sendFile(__dirname + '/chat.html')
    fs.appendFile('readme.log', `${new Date().format("[Y-MM-DD H:m:SS]")} ${req.url} ${req.method} ${req.headersDistinct.host[0]}\n`, function(err, data){})
})

// ------------------------------------------------------------------------------

// работа с socket.io

// подключение к 
io.sockets.on('connection', function (socket){

    // записать в лог-файл
    function readLogFun(queryType){
        let content
    
        let logDate = new Date().format("[Y-MM-DD H:m:SS]")
        let ip = socket.handshake.address
        let url = socket.handshake.url
    
        content = `${logDate} ${ip} ${queryType} ${url} \n`
    
        fs.appendFile('readme.log', content, function(err, data){})
    }

    // Установление имени пользователя
    socket.name = nicName

    readLogFun('WEBSOCKET')

    // отправить сообщение "${пользователь} вошел в чат" в чат
    io.sockets.emit('mess_up', {author: socket.name, message: "вошел в чат", status: 'in'})

    // 
    socket.on('disconnect', function(){
        setTimeout(() => {
            // отправить сообщение "${пользователь} покинул чат" в чат
            io.sockets.emit('mess_up', {author: socket.name, message: "покинул чат", status: 'out'})
        }, 60000)

        readLogFun('WEBSOCKET')
    })

    // событие "пользователь отправил сообщение"
    socket.on('mess_send', function(data) {
        readLogFun('WEBSOCKET')
        // отправить соответствующее сообщение в чат
        io.sockets.emit('mess_up', {author: socket.name, message: data.message, status: 'mess'})
    })
})



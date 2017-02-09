var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    //os = require('os'),
    sp = require("serialport");

//All clients have a common status
var commonStatus = 'OPEN';
var commonColor = 0xffffff;
var commonSldValue = -1;

// init for SerialPort connected to Arduino
// var SerialPort = sp
// var serialPort = new SerialPort('/dev/cu.usbmodem1411', {
//     baudrate: 9600,
//     dataBits: 8,
//     parity: 'none',
//     stopBits: 1,
//     flowControl: false
// });
//
// var receivedData = "";
//
// serialPort.on("open", function() {
//     console.log('serialPort open');
//     serialPort.write("OPEN\n");
//
//     //handle data received from the Arduino
//     serialPort.on('data', function(data) {
//         receivedData += data.toString();
//         if (receivedData.indexOf("SLD#") >= 0 && receivedData.indexOf("\n") >= 0) {
//             sldValue = receivedData.substring(receivedData.indexOf("SLD#") + 4, receivedData.indexOf("\n"));
//             receivedData = "";
//             if ((sldValue.length == 1) || (sldValue.length == 2)) {
//                 commonSldValue = parseInt("0x" + sldValue);
//                 io.sockets.emit('update slider', {
//                     value: commonSldValue
//                 });
//                 console.log('update slider: ' + commonSldValue);
//             }
//         }
//     });
// });

app.listen(3000);

function handler(req, res) {
    fs.readFile('public/index.html', function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}

io.sockets.on('connection', function(socket) {
    //Send client with his socket id
    socket.emit('your id', {
        id: socket.id
    });
    //Info all clients a new client caaonnected
    io.sockets.emit('on connection', {
        client: socket.id,
        clientCount: io.sockets.clients().length
    });
    //Set the current common status to the new client
    socket.emit('ack button status', {
        status: commonStatus
    });
    socket.emit('update slider', {
        value: commonSldValue
    });
    socket.on('button update event', function(data) {
        console.log(data.status);
        //acknowledge with inverted status,
        //to toggle button text in client
        if (data.status == 'OPEN') {
            console.log("OPEN");
            commonStatus = 'OPEN';
            serialPort.write("OPEN\n");
        }
        io.sockets.emit('ack button status', {
            status: commonStatus,
            by: socket.id
        });
    });
    //Info all clients if this client disconnect
    socket.on('disconnect', function() {
        io.sockets.emit('on disconnect', {
            client: socket.id,
            clientCount: io.sockets.clients().length - 1
        });
    });
});

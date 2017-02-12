'use strict';

const SerialPort = require('serialport');
const express = require('express');
const app = express();
const socket = require('socket.io');
const server = app.listen(process.env.PORT || 3000);
const io = socket.listen(server);

app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// //serialport
// var port = new SerialPort('/dev/cu.usbmodem1411');
// var commonSldValue = -1;
//
// port.on('open', function() {
//     port.write('serialport open\n', function(err) {
//         if (err) {
//             return console.log('Error: ', err.message);
//         }
//         console.log('serialport open');
//     });
//
//     //handle data received from the Arduino
//     port.on('data', function(data) {
//         var receivedData = data.toString();
//         if (receivedData.indexOf("SLD#") >= 0 && receivedData.indexOf("\n") >= 0) {
//             sldValue = receivedData.substring(receivedData.indexOf("SLD#") + 4,
//                 receivedData.indexOf("\n"));
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


//socket.io
io.on('connection', (socket) => {
    socket.emit('app connected');
    socket.on('client connected', function(data) {
        console.log('web socket open');
    });

    socket.on('click', function(data) {
      console.log('click');
    });

    // socket.emit('update slider', {
    //     value: commonSldValue
    // });

    socket.on('disconnect', function() {
        console.log('web socket closed');
    });
});

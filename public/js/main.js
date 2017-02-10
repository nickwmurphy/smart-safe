// open the web socket
var socket = io.connect(document.location.href);
var myId;

const terminal = document.getElementById("terminal");

// the input from the sensors on the arduino will send a unique id to node
// through serialport
// a switch statement determines the output to the text area
// real date and time are used
socket.on('update slider', function(data) {
    console.log("update slider: " + data.value);
    var date = new Date();
    var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    switch (data.value) {
        case 0:
            terminal.append("Nick entered the safe at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
        case 1:
            terminal.append("Tom entered the safe at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
        case 2:
            terminal.append("Successful keypad entry to the safe at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
        case 3:
            terminal.append("Failed keypad entry to the safe at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
        case 4:
            terminal.append("Failed fingerprint entry to the safe at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
        case 5:
            terminal.append("Safe locked at " + time + "\r");
            terminal.animate({
                scrollTop: terminal[0].scrollHeight - terminal.height()
            }, 200);
            break;
    }
});

// web sockets allow two way communication from node to the client
socket.on('on connection', function(data) {
    console.log("on connection: " + data.client);
    console.log("Number of client connected: " + data.clientCount);
});

socket.on('on disconnect', function(data) {
    console.log("on disconnect: " + data.client);
    console.log("Number of client connected: " + data.clientCount);
});

socket.on('your id', function(data) {
    console.log("your id: " + data.id);
    myId = data.id;
});

socket.on('ack button status', function(data) {
    console.log("status: " + data.status);
    if (myId == data.by) {
        console.log("by YOU");
    } else {
        console.log("by: " + data.by);
    }
});

// sending the button event to node
// updating the text area
function buttonSend(button) {
    console.log('click');
    var date = new Date();
    var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    socket.emit('button update event', {
        status: 'OPEN'
    });
    setTimeout(function() {
        terminal.append("Safe opened from the web at " + time + "\r");
        terminal.animate({
            scrollTop: terminal[0].scrollHeight - terminal.height()
        }, 200);
    }, 6000);
}

// addEventListener to button
window.onload = function() {
  document.getElementById("open").addEventListener("click", buttonSend(this));
}

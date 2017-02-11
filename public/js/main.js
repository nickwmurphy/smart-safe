var socket = io.connect();

var notFirstMessage = false;

socket.on('app connected', function(data) {
    socket.emit('client connected');
    console.log('web socket open');
});

socket.on('disconnect', function(data) {
    console.log('web socket closed');
});

socket.on('update slider', function(data) {
    socket.emit('open');
    if (data.value >= 0) {
        addMessage(data.value);
    }
});

function addMessage(index) {
    const terminal = document.getElementById('terminal');
    const messages = ["Nick entered the safe at ",
        "Tom entered the safe at ",
        "Successful keypad entry to the safe at ",
        "Failed keypad entry to the safe at ",
        "Failed fingerprint entry to the safe at ",
        "Safe locked at ",
        "Safe opened from the web at "
    ];
    var date = new Date(),
        time = formatAMPM(date),
        message;
    if (notFirstMessage) {
        message = document.createTextNode("\n" + messages[index] + time);
    } else {
        message = document.createTextNode(messages[index] + time);
        notFirstMessage = true;
    }
    terminal.appendChild(message);
    terminal.scrollTop += terminal.scrollHeight;
    socket.emit('click');
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var am_pm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var time = hours + ':' + minutes + ':' + seconds + ' ' + am_pm;
    return time;
}

window.onload = function() {
    const open = document.getElementById('open');
    open.addEventListener('click', function() {
        addMessage(6);
    });
}

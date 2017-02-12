'use strict';

const socket = io.connect();

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

const addMessage = index => {
    const terminal = document.getElementById('terminal');
    const messages = ["Nick entered the safe at ",
        "Tom entered the safe at ",
        "Successful keypad entry to the safe at ",
        "Failed keypad entry to the safe at ",
        "Failed fingerprint entry to the safe at ",
        "Safe locked at ",
        "Safe opened from the web at "
    ];
    let date = new Date(),
        time = formattedTime(date),
        message = messages[index] + time,
        firstMessage = terminal.childNodes.length < 1;
    !firstMessage ? message = document.createTextNode(`\n${message}`) :
        message = document.createTextNode(message);
    terminal.appendChild(message);
    terminal.scrollTop += terminal.scrollHeight;
    socket.emit('click');
}

let formattedTime = date => {
    let hours = date.getHours(),
        minutes = date.getMinutes(),
        seconds = date.getSeconds(),
        am_pm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    let time = hours + ':' + minutes + ':' + seconds + ' ' + am_pm;
    return time;
}

window.onload = function() {
    const open = document.getElementById('open');
    open.addEventListener('click', () => addMessage(6));
}

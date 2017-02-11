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
    const terminal = document.getElementById("terminal");
    const messages = ["Nick entered the safe at ",
                      "Tom entered the safe at ",
                      "Successful keypad entry to the safe at ",
                      "Failed keypad entry to the safe at ",
                      "Failed fingerprint entry to the safe at ",
                      "Safe locked at ",
                      "Safe opened from the web at "];
    var date = new Date(),
        time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
        message;
    if (notFirstMessage) {
      message = document.createTextNode("\n" + messages[index] + time);
    } else {
      message = document.createTextNode(messages[index] + time);
      notFirstMessage = true;
    }
    terminal.appendChild(message);
    terminal.scrollTop += terminal.scrollHeight;
}

window.onload = function() {
  const open = document.getElementById("open");
  open.addEventListener("click", function() {
    addMessage(6);
  });
}

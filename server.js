const bodyParser = require('body-parser');

const express = require('express')
const app = express()
const port = 3000

const production = true;

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/public/index.html')
// })

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html')
})

app.use(express.static('dist'))
app.use('/public', express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// FTP CONNECTION FOR UPLOADING FILES
let Client = require('ssh2-sftp-client');               // library: https://github.com/theophilusx/ssh2-sftp-client#readme
let ftp = new Client();
let config = {
  host: '192.168.0.21',
  port: '22',
  username: 'root',
  password: 'easybot'
};

let uploadPath = "/programs/projects/Adidas/export.script";  // destination path

// NET CONNECTION FOR COMMUNICATION
var net = require('net');
const { func } = require('joi');
var socket = new net.Socket();

if (production) {
  try {
    socket.connect(29999, '192.168.0.21', function() {});
  } catch(e) {
    console.log(e);
  }
}

// send request every second
if (production) {
  const intervalID = setInterval(socketWrite, 1000);
}

// receiving data
var isRunning;
socket.on('data', function(data) {
  let running = processData(data);
  console.log('RECEIVED: ' + data);
  isRunning = running;
});


// ROUTES
app.get('/api/status', (req,res) => {
  //res.send(isRunning);
  //const message = {running: isRunning}
  res.json(isRunning);
})

app.post('/api/print', bodyParser.raw({ type : 'text/plain', limit: '2mb' }), (req,res) => {
  let data = req.body;              // a `Buffer` containing the entire uploaded data
  uploadData(data, uploadPath);     //upload and play
});


// FUNCTIONS

// upload data to robot
function uploadData(data, uploadPath) {
  if (production) {
    try {
      ftp.connect(config)                     // connect
        .then(() => {
          console.log('Data writen');
          return ftp.put(data, uploadPath);   // write
        })
        .then(() => {
          socketWritePlay();                  // play robot
          return ftp.end();
        })
        .catch(err => {
          console.error(err.message);
      });
    } catch (e) {
      console.log(e);
    }
  }
}

// write
function socketWritePlay() {
  const command = 'play\n';
  socket.write(command);
  console.log('SENT: ' + command);
}

// process incoming data to string
/*
function processDataPlay(data) {
  const dataString = data.toString('utf8');
  var played;
  switch (dataString) {
    case 'Starting program\n':
      played = 1;
      break;
    case 'Failed to execute: play\n':
      played = 0;
      break;
  }
  return played;
}
*/

// write
function socketWrite() {
    const command = 'running\n';
    try {
      socket.write(command);
      console.log('SENT: ' + command);
    } catch(e) {
      console.log(e);
    }
}

// process incoming data to string
function processData(data) {
  const dataString = data.toString('utf8');
  var running;
  switch (dataString) {
    case 'Program running: true\n':
      running = 1;
      break;
    case 'Program running: false\n':
      running = 0;
      break;
  }
  return running;
}

// close connection
/*
function socketClose() {
  socket.destroy();
  socket.on('close', function() {
    console.log('Connection closed');
  });
}
*/

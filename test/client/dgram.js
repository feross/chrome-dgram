const dgram = require('../../')

const PORT = Number(process.env.PORT)

const sock = dgram.createSocket('udp4')
sock.setMulticastTTL(2)

// If any errors are emitted, log them
sock.on('error', function (err) {
  console.error(err.stack)
})

sock.send('beep', 0, 'beep'.length, PORT, '127.0.0.1')

sock.on('message', function (data, rInfo) {
  if (data.toString() === 'boop') {
    sock.send('pass1', 0, 'pass1'.length, rInfo.port, rInfo.address)
    sock.send('pass2', rInfo.port, rInfo.address)
  } else {
    sock.send('fail', 0, 'fail'.length, rInfo.port, rInfo.address)
  }
})

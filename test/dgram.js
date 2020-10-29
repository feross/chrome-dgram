const dgram = require('dgram')
const helper = require('./helper')
const portfinder = require('portfinder')
const test = require('tape')

test('UDP works (echo test)', function (t) {
  portfinder.getPort(function (err, port) {
    t.error(err, 'Found free ports')
    const socket = dgram.createSocket('udp4')
    let child

    socket.on('listening', function () {
      const env = { PORT: port }
      helper.browserify('dgram.js', env, function (err) {
        t.error(err, 'Clean browserify build')
        child = helper.launchBrowser()
      })
    })

    let i = 0
    socket.on('message', function (message, remote) {
      if (i === 0) {
        t.equal(message.toString(), 'beep', 'Got beep')
        const boop = Buffer.from('boop')
        socket.send(boop, 0, boop.length, remote.port, remote.address)
      } else if (i === 1) {
        t.equal(message.toString(), 'pass1', 'Boop was received')
      } else if (i === 2) {
        t.equal(message.toString(), 'pass2', 'Omitting `offset` and `length` works')
        child.kill()
        socket.close()
        t.end()
      } else {
        t.fail('UDP client sent unexpected message')
      }
      i += 1
    })

    socket.bind(port)
  })
})

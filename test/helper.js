const browserify = require('browserify')
const cp = require('child_process')
const envify = require('envify/custom')
const fs = require('fs')
const once = require('once')
const path = require('path')
const os = require('os')

let CHROME = process.env.CHROME

// locate default chromes for os
switch (os.platform()) {
  case 'win32' :
    if (process.arch === 'x64') {
      CHROME = '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"'
    } else {
      CHROME = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"'
    }
    break
  case 'darwin' :
    CHROME = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome'
    break
  case 'linux' :
    CHROME = '/opt/google/chrome/chrome'
    break
  default :
    console.log('Defaulting to process.env.CHROME `%s`', process.env.CHROME)
    break
}

const BUNDLE_PATH = path.join(__dirname, 'chrome-app/bundle.js')

exports.browserify = function (filename, env, cb) {
  if (!env) env = {}
  if (!cb) cb = function () {}
  cb = once(cb)

  const b = browserify()
  b.add(path.join(__dirname, 'client', filename))
  b.transform(envify(env))

  b.bundle()
    .pipe(fs.createWriteStream(BUNDLE_PATH))
    .on('close', cb)
    .on('error', cb)
}

exports.launchBrowser = function () {
  // supply full path because windows
  const app = path.join(__dirname, '/chrome-app')

  let command = CHROME + ' --load-and-launch-app=' + app
  if (os.platform() === 'darwin' || os.platform() === 'linux') {
    command += ' > /dev/null 2>&1'
  }
  const env = { cwd: path.join(__dirname, '..') }

  return cp.exec(command, env, function (err) {
    if (err) throw err
  })
}

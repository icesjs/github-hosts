'use strict'

const os = require('os')
const OS_TYPE = os.type().toLowerCase()
const { exec } = require('child_process')

// 执行命令行命令
function execCommand(cmd) {
  return new Promise((resolve) => {
    exec(
      cmd,
      {
        cwd: process.cwd(),
        windowsHide: true,
      },
      (err) => {
        resolve(err || 0)
      }
    )
  })
}

// 刷新dns缓存
async function flush() {
  if (OS_TYPE === `darwin`) {
    if (
      await execCommand(
        'sudo dscacheutil -flushcache;sudo killall -HUP mDNSResponder'
      )
    ) {
      throw `Maybe supports by OS X 10.10.4 and above.`
    }
    return
  }

  if (OS_TYPE === `linux`) {
    let success = false
    for (const cmd of [
      'sudo /etc/init.d/dns-clean restart;sudo /etc/init.d/networking force-reload',
      'sudo /etc/init.d/nscd restart',
      'sudo /etc/init.d/dnsmasq restart',
      'sudo /etc/init.d/named restart',
    ]) {
      if ((await execCommand(cmd)) === 0) {
        success = true
        break
      }
    }
    if (!success) {
      throw `Can't flush the dns on the Linux OS.`
    }
    return
  }

  if (OS_TYPE === 'win32' || OS_TYPE === 'windows_nt') {
    if (await execCommand('ipconfig /flushdns')) {
      throw `Can't flush the dns on the Windows OS.`
    }
    return
  }

  throw `${OS_TYPE} is an unsupported OS.`
}

module.exports = { flush }

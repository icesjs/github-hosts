'use strict'

//
const os = require('os')
const Hosts = require('hosts-so-easy').default
const domains = require('./domains')
const { DEFAULT_HOSTS } = require('./utils')

// 创建一个hosts文件访问器
function accessHosts(task, setup) {
  return new Promise((resolve, reject) => {
    const hosts = new Hosts(
      Object.assign(
        {
          hostsFile: DEFAULT_HOSTS,
          EOL: os.EOL,
        },
        setup
      )
    )
    hosts.once('updateFinish', (err) => (err ? reject(err) : resolve()))
    task(hosts)
  })
}

// 更新hosts信息
function update(addresses) {
  return accessHosts((accessor) => {
    for (const { domain, host } of addresses) {
      accessor.removeHost(domain)
      accessor.add(host, domain)
    }
  }, {})
}

// 清除hosts信息
function clear() {
  return accessHosts((accessor) => {
    for (const domain of domains) {
      accessor.removeHost(domain)
    }
  }, {})
}

//
module.exports = { update, clear }

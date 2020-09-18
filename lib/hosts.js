'use strict'

//
const os = require('os')
const fs = require('fs')
const Hosts = require('hosts-so-easy').default
const domains = require('./domains')

// 是否是windows平台
const win32 = /^(?:win32|windows_nt)$/i.test(process.platform)

// 默认的HOSTS文件地址
const DEFAULT_HOSTS = win32
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts'

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
    task(hosts, resolve, reject)
  })
}

// 检查hosts文件是否可访问
function isAccessible() {
  if (win32) {
    // windows平台使用写入测试内容的方法来检测
    const host = 'some.domain.test'
    const teardown = () =>
      accessHosts((accessor) => accessor.removeHost(host))
        .catch(() => {})
        .then(() => true)

    // 添加一个测试地址进行可访问性检测
    return accessHosts(
      (accessor, resolve, reject) => {
        accessor.add('127.0.0.1', host)
        // Hosts库内部自动更新时，遇到异常会全局抛出
        // 这里手动更新
        accessor._update((err) => (err ? reject() : resolve()))
      },
      {
        // 这里禁止库自动更新，通过调用内部方法手动更新
        noWrites: true,
      }
    )
      .then(teardown)
      .catch(() => false)
  }

  // linux平台下检测
  return new Promise((resolve) => {
    fs.access(DEFAULT_HOSTS, fs.constants.R_OK | fs.constants.W_OK, (err) =>
      resolve(!err)
    )
  })
}

// 更新hosts信息
function update(addresses) {
  return accessHosts((accessor) => {
    for (const { domain, host } of addresses) {
      accessor.removeHost(domain)
      accessor.add(host, domain)
    }
  })
}

// 清除hosts信息
function clear() {
  return accessHosts((accessor) => {
    for (const domain of domains) {
      accessor.removeHost(domain)
    }
  })
}

//
module.exports = { update, clear, isAccessible, DEFAULT_HOSTS }

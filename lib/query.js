'use strict'

const ping = require('ping')
const { request } = require('./utils')

// 提供IP查询服务的网站
const queryVendor = 'ipaddress.com'

// 根据域名查询IP地址
async function queryIPAddressByDomain(domain) {
  const main = domain.match(/[^.]+\.[^.]+$/g)[0]
  const url = `https://${main}.${queryVendor}/${domain !== main ? domain : ''}`
  const { body } = await request(url).catch(() => '')
  const addresses = new Set()
  body.replace(
    /<li>\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*<\/li>/g,
    (m, $1) => addresses.add($1)
  )
  return { domain, addresses: Array.from(addresses) }
}

// 测试地址访问速度
async function pingAddresses(domain) {
  const { addresses } = domain
  const results = await Promise.all(
    addresses.map((addr) =>
      ping.promise.probe(addr, {
        timeout: 20, // 测试超时时间（单位s）
        min_reply: 8, // ping的次数
      })
    )
  )
  // 按ping的平均耗时升序排序
  results.sort((a, b) => a.avg - b.avg)
  domain.addresses = results
  return domain
}

// 查询地址信息
module.exports = function(domains, progressCallback) {
  return Promise.all(
    domains.map((domain) =>
      queryIPAddressByDomain(domain)
        .then(pingAddresses)
        .then((res) => {
          progressCallback()
          return res
        })
    )
  )
}

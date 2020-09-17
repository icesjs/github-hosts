'use strict'

const chalk = require('chalk')
const query = require('./query')
const domains = require('./domains')
const { update, DEFAULT_HOSTS } = require('./hosts')
const { flush: flushDNSService } = require('./dns')
const { logger, copyToClipboard, createProgressBar } = require('./utils')

// 打印地址信息
function printAddresses(results) {
  logger.table(
    results.map(({ domain, addresses }) => [
      domain,
      addresses.map(({ host }) => host).join('\n'),
      addresses
        .map(({ avg }) => (isNaN(avg) ? 'N/A' : Math.floor(+avg)))
        .join('\n'),
    ]),
    ['Domain Name', 'IP Addresses', 'Avg Delay (ms)']
  )
}

// 筛选地址
function filterFastestAddresses(results) {
  const hosts = []
  // 有多个解析地址时，第一个地址已经是排序延迟最低的了
  for (const { domain, addresses } of results) {
    const { alive, host } = addresses[0] || {}
    if (alive) {
      hosts.push({ domain, host })
    }
  }
  // 仅筛选出能够ping通的地址
  return hosts
}

// 打印写入Hosts文件的内容
function printContent(addresses) {
  logger.info('Contents will be written to the hosts file:')
  logger.box(
    addresses
      .map(({ domain, host }) => `${host.padEnd(16)} ${domain}`)
      .join('\n')
  )
}

// 执行更新
async function execUpdate(hasPerm) {
  console.log('')
  logger.info('Checking domains...')
  // 查询域名的IP地址信息
  const results = await query(domains, createProgressBar(domains.length))
  // 查询成功
  logger.success('DNS information checked completely!')
  // 打印地址信息
  printAddresses(results)
  // 筛选延迟最低的地址
  const addresses = filterFastestAddresses(results)
  if (!addresses.length) {
    throw 'There is no address available.\n  Please check your network connection and try again.'
  }
  printContent(addresses)
  //
  if (hasPerm) {
    // 执行更新
    await update(addresses)
    await flushDNSService().catch(() => {
      logger.warn('Maybe you need to restart your computer.\n')
    })
    logger.success('Update hosts file successfully.\n')
    //
  } else {
    // 执行剪贴板拷贝
    try {
      await copyToClipboard(
        addresses
          .map(({ domain, host }) => `${host.padEnd(16)} ${domain}`)
          .join(require('os').EOL)
      )
      return chalk.cyan(
        `The host entry has been copied to the clipboard.\n  You could paste it to the file which is in the place of "${DEFAULT_HOSTS}" manually.`
      )
    } catch (e) {}
    //
  }
}

// 导出
module.exports = execUpdate

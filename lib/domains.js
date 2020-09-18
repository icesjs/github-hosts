'use strict'

const chalk = require('chalk')
const { logger, request } = require('./utils')

// 默认的域名数据
const DEFAULT_DOMAINS = require('./domains.json')

// 默认的远程数据下载地址
const DEFAULT_REMOTE_DOMAINS_DATA_URL =
  'https://gitee.com/galaxy-walker/github-domains/raw/master/index.json'

// 检查给定的值是否是个合法的域名
function isDomainName(domain) {
  if (typeof domain !== 'string') {
    return false
  }
  domain = domain.trim()
  if (domain.length < 2 || domain.length > 255 || !/[^.]\.[^.]/.test(domain)) {
    return false
  }
  return /^(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.){0,126}(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9]))\.?$/i.test(
    domain
  )
}

// 下载远程数据
async function downloadDomainsData(url) {
  const dataUrl = url || DEFAULT_REMOTE_DOMAINS_DATA_URL
  logger.info(`Downloading domains data from "${dataUrl}"\n`)
  //
  let data
  try {
    data = await request(dataUrl, {
      responseType: 'json',
    }).json()
    //
    data = Array.isArray(data) ? data.filter(isDomainName) : []
    if (data.length) {
      logger.success('Download and parse remote data successfully.\n')
    }
  } catch (e) {
    data = []
    logger.error(`${e instanceof Error ? e.message : e}\n`)
  }
  //
  if (!data.length) {
    // 下载远程数据失败，则使用本地默认数据
    data = DEFAULT_DOMAINS
    logger.info(
      `Download or parse remote data failed. Use ${chalk.yellow(
        'local data'
      )} for default.\n`
    )
  }
  return data.map((s) => s.trim())
}

module.exports = {
  DEFAULT_DOMAINS,
  DEFAULT_REMOTE_DOMAINS_DATA_URL,
  downloadDomainsData,
}

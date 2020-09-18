#!/usr/bin/env node

'use strict'
const chalk = require('chalk')

// 检查node版本要求
function checkNodeVersion() {
  const pkg = require('./package.json')
  const nodeVer = process.version
  const requiredVer = pkg.engines.node
  if (
    parseInt(nodeVer.replace(/^[\D]+/, ''), 10) <
    parseInt(requiredVer.replace(/^[\D]+/, ''), 10)
  ) {
    console.error(
      chalk.red(
        `You are using Node ${nodeVer} , but this tool requires Node ${requiredVer}.\nPlease upgrade your Node version first.\n`
      )
    )
    process.exit(1)
  }
}

// 如果node版本过低，依赖的包会抛异常
checkNodeVersion()

const update = require('./lib/update')
const { clear, isAccessible } = require('./lib/hosts')
const { flush: flushDNSService } = require('./lib/dns')
const { confirm, logger } = require('./lib/utils')

// 运行主逻辑
async function run({ c }) {
  // 检查文件读写权限
  const hasPerm = await isAccessible()
  if (c) {
    // 执行清除操作
    // 必须要有权限
    logger.info('Preparing to clear the hosts of GitHub...\n')
    if (!hasPerm) {
      throw 'Administrator permission required to modify the hosts file.\n  Please run as administrator again.'
    }
    await clear()
    await flushDNSService().catch(() => {
      logger.warn('Maybe you need to restart your computer.\n')
    })
    logger.success('Cleared Successfully.\n')
  } else {
    // 执行更新操作
    let doUpdate = true
    if (!hasPerm) {
      doUpdate = await confirm(
        chalk.yellow(
          `Administrator permission required to modify the hosts file.\n  Do you want to go on ${chalk.red(
            'without admin permission'
          )} ?`
        )
      )
      if (doUpdate) {
        console.log('')
      }
    }
    if (doUpdate) {
      // 如果没有权限，只拷贝hosts内容到剪贴板
      // 如果有权限，则直接更新hosts文件
      return await update(hasPerm)
    }
    console.log('')
  }
}

// 初始化命令行提示信息
const yargs = require('yargs')
  .usage('github-hosts [options]')
  .option('help', {
    alias: 'h',
    type: 'boolean',
    describe: 'Show help',
  })
  .option('version', {
    alias: 'v',
    type: 'boolean',
    describe: 'Show version number',
  })
  .option('clear', {
    alias: 'c',
    type: 'boolean',
    default: false,
    describe: 'Clear the hosts of GitHub',
  })

//
const argv = yargs.argv
if (argv.h) {
  // 显示帮助信息
  yargs.showHelp('log')
} else {
  const printError = (err) =>
    logger.error(err instanceof Error ? err.message : err)

  // 捕获全局异常，防止程序依赖的包抛出未知错误而导致退出
  process.on('uncaughtException', printError)

  // 执行脚本
  run(argv)
    .then((msg = 'Good bye!') => logger.info(msg))
    .catch(printError)
    .then(() => console.log(''))
}

'use strict'

const logSymbols = require('log-symbols')
const chalk = require('chalk')
const inquirer = require('inquirer')
const got = require('got')
const { SingleBar } = require('cli-progress')
const { table } = require('table')

module.exports = {
  // 打印终端信息
  logger: {
    info(msg) {
      console.log(logSymbols.info, chalk.blue(msg))
    },
    warn(msg) {
      console.log(logSymbols.warning, chalk.yellow(msg))
    },
    error(msg) {
      console.error(logSymbols.error, chalk.red(msg))
    },
    success(msg) {
      console.log(logSymbols.success, chalk.cyan(msg))
    },

    // 打印带框信息到终端
    box(msg) {
      console.log(
        table([[msg]], {
          columns: {
            0: {
              wrapWord: false,
              paddingRight: 4,
            },
          },
        })
      )
    },

    // 以表格形式打印数据
    table(data, head) {
      const setup = {
        columnDefault: {
          wrapWord: false,
        },
      }
      const record = [...data]
      if (head) {
        record.unshift(head)
        record.push(head)
      }
      for (const row of record) {
        row.forEach((cell, index) => {
          if (/^(?:undefined|null|[\s\n]*)$/.test(cell)) {
            row[index] = 'N/A'
          }
        })
      }
      console.log(table(record, setup))
    },
  },

  // 创建一个控制台进度条
  createProgressBar(total) {
    const setup = {
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      format: `  {bar} {percentage}% ${chalk.gray('(Cost: {duration}s)')}`,
      hideCursor: true,
      stopOnComplete: true,
      clearOnComplete: false,
      noTTYOutput: !process.stderr.isTTY,
      notTTYSchedule: 1000,
      total: 100,
    }
    if (typeof total === 'object') {
      Object.assign(setup, total)
    } else if (typeof total === 'number') {
      Object.assign(setup, { total })
    }

    // 创建一个实例
    const bar = new SingleBar(setup)

    // 启动进度条
    bar.start(setup.total, 0)
    // 返回更新进度条的回调
    return bar['increment'].bind(bar)
  },

  // 从终端确认操作
  async confirm(message) {
    try {
      const { result } = await inquirer.prompt([
        {
          message,
          default: false,
          type: 'confirm',
          name: 'result',
        },
      ])
      return result
    } catch (e) {
      return false
    }
  },

  // 拷贝内容至剪贴板
  copyToClipboard(content) {
    return require('clipboardy').write(content)
  },

  // 请求资源
  request(url, options) {
    return got(
      url,
      Object.assign(
        {
          timeout: 10000,
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
          },
        },
        options
      )
    )
  },
}

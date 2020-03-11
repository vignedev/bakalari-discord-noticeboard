const { red, blue, yellow } = require('ansi-colors')

module.exports = {
    log(...args){
        console.log(` [~] `, ...args)
    },
    elog(...args){
        console.log(red(` [!] `), ...args)
    }
}
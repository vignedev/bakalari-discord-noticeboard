const
    config = require('./config'),
    fetch = require('node-fetch'),
    bakalari = require('bakalari'),
    { log, elog } = require('./log'),
    fs = require('fs').promises,
    html2md = require('html-to-markdown')

const
    baka = new bakalari.User(config.BAKALARI_URL, config.BAKALARI_USER, config.BAKALARI_PASSWORD)

let
    isWorking = false
;(async() => {
    const user = await safelyObtainUser()
    if(user == null) process.exit(2)

    mainClock()
    setInterval(mainClock, config.CHECK_INTERVAL)
})()

// for clarity
/**
 * Returns null if fails
 * @returns {bakalari.User}
 */
async function safelyObtainUser(){
    try{
        log('Obtaining user...')
        const user = await baka.obtain()
        log('User obtained!', user)
        return user
    }catch(err){
        elog(err)
        return null
    }
}
/**
 * Returns noticeboard in a neat format
 * @returns {object}
 */
async function getNoticeboard(){
    log('Obtaining Noticeboard')
    return (await baka.getPage(bakalari.Pages.COMMENTS_TABLE)).zpravy[0].zprava.reduce((acc,val) => {
        const obj = {}
        for(let key in val) obj[key] = val[key][0]
        acc[obj.id] = obj
        obj.text = html2md.convert(obj.text)
        .replace(/&nbsp;/g, ' ')
        .replace(/<br \/>/gi, '\n\n')
        .replace(/\n+/g, '\n\n')
        .replace(/<.*?>/g, '')
        .replace(/ +/g, ' ')
        .trim()
        return acc
    }, {})
}
/**
 * Create a embed JSON
 */
function createEmbed(data){
    return  {
        title: data.nadpis,
        description: data.text,
        color: 14832449,
        timestamp: parseTime(data.cas).toISOString(),
        footer: { text: data.id + ` | ${data.files}` },
        author: { name: data.od }
    }
}
/**
 * Parse datetime to Date Object
 * @param {string} datetime DateTime string in YYMMDDhhmm
 * @returns {Date}
 */
function parseTime(datetime){
    const [year, month, date, hour, minute] = datetime.match(/\d\d/g).map(x => parseInt(x, 10))
    return new Date(2000+year, month, date, hour, minute, 0, 0)
}
/**
 * Send a webhook
 * @param {Array<object>} embeds Array of embed objects
 */
function sendWebhook(embeds){
    return fetch(config.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({embeds})
    })
    .then(res => res.text())
}
/**
 * Check if the file exists
 * @param {string} path Path
 */
async function safeAccess(path){
    try{
        await fs.access(path)
        return true
    }catch(err){
        return false
    }
}
/**
 * Safely load JSON, otherwise return `{}`
 * @param {string} path Path
 */
async function safeJSONfromPath(path){
    try{return JSON.parse(await fs.readFile(path))}
    catch(err){return {}}
}
/**
 * Main clock, used in SetInterval
 */
async function mainClock() {
    if(isWorking) log('Want to beging a new cycle, but it is working, so I quit!')
    if(isWorking) return
    log('Beginning new Cycle!')
    isWorking = true
    try{
        const
            history = await safeJSONfromPath(config.HISTORY_PATH),
            data = await getNoticeboard(),
            unique = []
        for(let id in data){
            if(!history[id]){   // no history exists
                unique.push(data[id])
                log(id, 'is not in history')
                continue
            }else{              // history exists...
                let
                    fromHistory = history[id], 
                    fromSource = data[id]

                if(fromSource.text != fromHistory.text) log(`    ${id} ==> invalid text`)
                if(fromSource.nadpis != fromHistory.nadpis) log(`    ${id} ==> invalid nadpis`)
                if(fromSource.cas != fromHistory.cas) log(`    ${id} ==> invalid cas`)
                if(fromSource.files != fromHistory.files) log(`    ${id} ==> invalid files`)

                //...old or different data received per ID
                if(fromSource.text != fromHistory.text || fromSource.nadpis != fromHistory.nadpis || fromSource.cas != fromHistory.cas || fromSource.files != fromHistory.files){
                    unique.push(data[id])
                    log(id, 'has invalid history')
                    continue
                }
                // if it's the same then don't post it
            }
        }
        unique.reverse()
        for(let i in unique){
            await sendWebhook([createEmbed(unique[i])])
        }
        await fs.writeFile(config.HISTORY_PATH, JSON.stringify(data))

        log(`  Sent ${unique.length} embeds!`)
    }catch(err){elog(err)}
    isWorking = false
    log('Cycle ended')
}
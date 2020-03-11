module.exports = {
    /** Bakalaři Discord Webhook. */
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
    
    /** Bakalaři server.. */
    BAKALARI_URL: process.env.BAKALARI_URL,
    
    /** Bakalaři username. */
    BAKALARI_USER: process.env.BAKALARI_USER,

    /** Bakalaři password. */
    BAKALARI_PASSWORD: process.env.BAKALARI_PASSWORD,

    /** Sets how often to check the komens for changes. Value is in miliseconds.*/
    CHECK_INTERVAL: 600000,

    /** Location of the history JSON */
    HISTORY_PATH: __dirname + '/history.json'
}
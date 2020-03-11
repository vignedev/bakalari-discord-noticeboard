# bakalari-discord-noticeboard

Because who checks Komens or whatever it is on Bakalari? We have emails which are already considered to be the standard for any important message relaying so why are we trying to reinvent the wheel? 

Basically, because of the COVID-19 breakout in this country all public gatherings with more than 100 people are banned which applies to schools as well. The length of the closure is unknown but it's said to be somewhere between two weeks to a month, perhaps even longer. This has of course not stopped our teachers, who are now distributing homework through a system called *Bakaláři*, specifically Komens's noticeboard.

Since nobody checks that page, it'd be useful to redirect those messages to a different service and because most people in our class use Discord it'd be useful to put that stuff there.

By default it's set to check the board every 10 minutes. During each cycle it's going to check whether the message has been already posted or if it has been modified and based on that it'll out only messages that hasn't been sent. Do note that since the text is provided in HTML it had to be converted to Markdown, which means that some tags may be filtered out (eg. links).

This is not supposed to be a *replacement* for Komens, it's just a way to get notifications from it.

## Usage

You have to set the following environmental variables or manually change `config.js`. 
```
export CK_DISCORD_WEBHOOK
export CK_BAKALARI_URL
export CK_BAKALARI_USER
export CK_BAKALARI_PASSWORD
```
In `config.js` you can also change various settings like the checking period or the location of the history JSON. 

After that, the installation and usage is pretty much straight forward.
```bash
$ npm install
$ npm start
```

## License

MIT
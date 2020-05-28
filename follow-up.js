// 1. GET to https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&count=20
// look at last element, get the date, then make another get call to https://www.linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX&createdBefore=[insert  date]
// 2. data -> elements -> for each element, check if events.previousEventInConversation exisits
// 3. If it doesn't exist, only reached out once, so get the conversation id from events.entityURN
// 4. POST follow up to https://www.linkedin.com/voyager/api/messaging/conversations/6360367873772396544/events?action=create

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios')

const main = async (email, password, numMessages, message) => {
    let driver = await new Builder().forBrowser('chrome').build()
    // let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
    await driver.get('https://www.linkedin.com/login/')

    await driver.findElement(By.css('#username')).sendKeys(email)
    await driver.findElement(By.css('#password')).sendKeys(password)
    await driver.findElement(By.css('#password')).sendKeys(Key.ENTER)
    const response = await getConversations(driver)
    var conversations = await response.data.elements
    while (conversations.length < numMessages) {
        let lastDate = conversations.slice(-1)[0].events[0].createdAt - 1
        let response = await getConversations(driver, null, lastDate)
        conversations = [...conversations, ...response.data.elements]
    }
    console.log('conversations bfore', conversations.length)
    conversations = conversations.filter(convo => convo.totalEventCount == 1)
    console.log('conversations after', conversations.length)
    // await sendFollowUps(driver, conversations[0], message)
}

const getConversations = async (driver, count = 25, createdBefore = null) => {
    const csrf = await driver.manage().getCookie('JSESSIONID')
    const li_at = await driver.manage().getCookie('li_at')
    var params = createdBefore ? { 'createdBefore': createdBefore } : { 'count': count }
    const config = {
        headers: {
            'cookie': `JSESSIONID=${csrf.value}; li_at=${li_at.value};`,
            'csrf-token': csrf.value.replace(/['"]+/g, '')
        },
        params: params
    }
    return axios.get('https://www.linkedin.com/voyager/api/messaging/conversations', config)
}

const sendFollowUp = async (url, body, config) => {
    return axios.post(url, body, config)
}

const sendFollowUps = async (driver, conversations, message) => {
    let body = { "eventCreate": { "value": { "com.linkedin.voyager.messaging.create.MessageCreate": { "attributedBody": { "text": message, "attributes": [] }, "attachments": [] } } }, "dedupeByClientGeneratedToken": false }
    const csrf = await driver.manage().getCookie('JSESSIONID')
    const li_at = await driver.manage().getCookie('li_at')
    const config = {
        headers: {
            'cookie': `JSESSIONID="${csrf.value}"; li_at=${li_at.value};`,
            'csrf-token': csrf.value.replace(/['"]+/g, ''),
            'Content-Type': 'application/json'
        }
    }
    var send = []
    for (let i = 0; i < conversations.length; i++) {
        let conversationId = conversations[i].entityUrn.split(':').slice(-1)[0]
        send.push(sendFollowUp(`https://www.linkedin.com/voyager/api/messaging/conversations/${conversationId}/events?action=create`, body, config))
    }
    return Promise.all(send).then(result => {
        console.log(result)
    })
}

main("nolangray15@gmail.com", "robotsruletheworld!", 75, "Hi, just following up!")
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios')

const main = async (email, password, link, invites, message) => {
    var pages = Math.min(Math.ceil(parseInt(invites) * 0.1), 10)
    let driver = await new Builder().forBrowser('chrome').build()
    // let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build()
    await driver.get('https://www.linkedin.com/login/')

    await driver.findElement(By.css('#username')).sendKeys(email)
    await driver.findElement(By.css('#password')).sendKeys(password)
    await driver.findElement(By.css('#password')).sendKeys(Key.ENTER)
    await driver.get(link)
    var allNames = []
    for (let p = 0; p < pages; p++) {
        await driver.executeScript("document.body.style.zoom='25%'")
        await driver.findElement(By.xpath('//span[text()="Next"]'))
        const profiles = await driver.findElements(By.xpath('//a[contains(@data-control-name, "search_srp_result")]'))
        let names = []
        for (let i = 0; i < profiles.length; i++) {
            const link = await profiles[i].getAttribute('href')
            names.push(link)
        }
        allNames = [...allNames, ...new Set(names)]
        await driver.get(link + '&page=' + (p + 2))
    }
    allNames = allNames.map(name => {
        let splitName = name.split('/')
        return splitName[splitName.length - 2]
    })
    allNames = allNames.slice(0, Math.min(parseInt(invites), 100))
    console.log(allNames)
    const [profileIds, firstNames] = await getProfileIds(driver, allNames)
    const results = await sendConnections(driver, profileIds, firstNames, message)
    console.log(results)

}

const retrieveId = async (name, config) => {
    return axios.get(`https://www.linkedin.com/voyager/api/identity/profiles/${name}/profileView`, config)
}

const sendConnection = async (url, body, config) => {
    return axios.post(url, body, config)
}

const getProfileIds = async (driver, names) => {
    const csrf = await driver.manage().getCookie('JSESSIONID')
    const li_at = await driver.manage().getCookie('li_at')
    var profileIds = []
    const config = {
        headers: {
            'cookie': `JSESSIONID=${csrf.value}; li_at=${li_at.value};`,
            'csrf-token': csrf.value.replace(/['"]+/g, '')
        }
    }
    for (let i = 0; i < names.length; i++) {
        profileIds.push(retrieveId(names[i], config))
    }
    return Promise.all(profileIds).then(result => {
        profileIds = result.map(res => res.data.positionGroupView.profileId)
        firstNames = result.map(res => res.data.profile.firstName)
        return [profileIds, firstNames]
    })
}

const sendConnections = async (driver, profileIds, firstNames, message) => {
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
    for (let i = 0; i < profileIds.length; i++) {
        let body = {
            "emberEntityName": "growth/invitation/norm-invitation",
            "invitee": {
                "com.linkedin.voyager.growth.invitation.InviteeProfile":
                    { "profileId": `${profileIds[i]}` }
            }, "trackingId": "RfQZm0SATwu5eP1HTzqqSg==",
            "message": `${message.replace("{first_name}", firstNames[i])}`
        }
        send.push(sendConnection('https://www.linkedin.com/voyager/api/growth/normInvitations', body, config))
    }
    return Promise.all(send).then(result => {
        console.log(result)
    })
}
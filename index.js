require('dotenv').config();

console.log();

const server = process.env.TRAVIAN_SERVER;
const email = process.env.TRAVIAN_NAME;
const password = process.env.TRAVIAN_PASSWORD;

const baseURL = `https://${server}.travian.com`;
const loginLink = `${baseURL}/login.php`;
const reportsLink = `${baseURL}/berichte.php`;
const mapURL = `${baseURL}/position_details.php`;

var webdriver = require('selenium-webdriver');
const {By, Key, until} = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

(async function run() {
    try{
        var driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();

        await driver.get(loginLink);

        await login(driver);
        await farmList(driver);
    }

    catch(err){
        console.error('Something went wrong!\n', err.stack, '\n');
    }
})();


async function login(driver) {
    await driver.findElement(By.css('.login input[name="name"]'))
        .sendKeys(email);
    await driver.findElement(By.css('.login input[name="password"]'))
        .sendKeys(password);
    await driver.findElement(By.css('.login button[type="submit"]'))
        .click();
}

async function farmList(driver) {
    await driver.get(reportsLink);

    let reports = await  driver.findElements(By.className('newMessage'));
    let reportsCount = reports.length;
    let reportsList = [];
    let attacksSent = [];
    let oasisWithAnimals = [];

    // create list ( stale element error when leaving page )
    for (let i = 0; i < reports.length; i++) {
        let report = reports[i];
        let reportTitle = await report.findElement(By.css('div > a')).getText();
        let reportUrl = await report.findElement(By.css('a:first-child')).getAttribute('href');
        const urlParams = new URLSearchParams(reportUrl.split('?')[1]);
        const id = urlParams.get('id');

        // Get coords ( .match(/\p{N}/gu).join('') -> get only the numbers from text and join them )
        let x = await report.findElement(By.css('div > a .coordinateX')).getText();
        x = x.toString().replace('(', '').match(/\p{N}/gu).join('');
        let y = await report.findElement(By.css('div > a .coordinateY')).getText();
        y = y.toString().replace(')', '').match(/\p{N}/gu).join('');

        let oasisURL = new URL(mapURL);
        oasisURL.searchParams.append("x", x);
        oasisURL.searchParams.append("y", y);

        reportsList.push({
            id: id,
            title: reportTitle,
            url: oasisURL
        })
    }

    let reportsListCount = reportsList.length;

    for (let i = 0; i < reportsListCount; i++) {
        let report = reportsList[i];
        console.log('Report: ' + report.title);
        // Check if oasis has animals
        console.log('### Go to: ' + report.url);
        await driver.get(report.url);
        let troopInfo = await driver.findElement(By.css('#troop_info tr td:first-child')).getText();

        if (troopInfo === 'none') {
            console.log('### Send troops, no defenders');
            await driver.findElement(By.xpath("//*[contains(text(), '" + process.env.TRAVIAN_RAID_BUTTON + "')]")).click();

            // Add troops
            await driver.findElement(By.name('troops[0][t1]'))
                .sendKeys(process.env.TRAVIAN_RAID_TROOPS);

            await driver.findElement(By.css('#build button[type="submit"]'))
                .click();
            await driver.findElement(By.css('#rallyPointButtonsContainer button[type="submit"]#btn_ok'))
                .click();

            attacksSent.push(report.id);
        } else {
            oasisWithAnimals.push(report.title);
            console.log('### Oasis have animals');
        }
    }

    let attacksSentCount = attacksSent.length;
    // Clean sent attacks
    if (attacksSentCount > 0) {
        await driver.get(reportsLink);

        for (let i = 0; i < attacksSentCount; i++) {
            await driver.findElement(By.css(`input[type="checkbox"][value="${attacksSent[i]}"]`))
                .click();
        }

        // delete
        await driver.findElement(By.css('#reportsForm button[type="submit"]#del'))
            .click();
    }

    console.log('Have animals', oasisWithAnimals);

    if (reportsListCount > 0) {
        await farmList(driver);
    }
}
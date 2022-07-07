const app = require('./index');
const puppeteer = require('puppeteer');
const PORT = process.env.PORT | 3000;

app.listen(PORT, () => {
    console.log('listening');
});

app.get('/', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://tfl.gov.uk/tube-dlr-overground/status/#linesResponse-status');

    const element = await page.waitForSelector('#rainbow-list-tube-dlr-overground-elizabeth-line-tram > ul');

    const linesResponse = await element.$$('.service-name');
    const statuses = await element.$$('.disruption-summary');

    const lineNames = await Promise.all(
        linesResponse.map(async item => await item.evaluate(i => i.textContent.trim()))
    );
    const lineStatuses = await Promise.all(
        statuses.map(async status => await status.evaluate(i => i.textContent.trim()))
    );

    const result = {};
    for (let i = 0; i < lineNames.length; i++) {
        result[lineNames[i]] = lineStatuses[i];
    }

    await browser.close();
    res.send(result);
});

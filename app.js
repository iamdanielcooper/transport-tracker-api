const app = require('./index');
const puppeteer = require('puppeteer');
const PORT = process.env.PORT || 3000;
const images = require('./images.json');

const colors = {
    Bakerloo: 0x3b0c00,
    Central: 0xff0000,
    Circle: 0xffee00,
    District: 0x013d01,
    Metropolitan: 0xa3021f,
    'Elizabeth line': 0x9364cd,
    'Hammersmith & City': 0xfc42ff,
    Jubilee: 0xa0a5a9,
    Northern: 0x000000,
    Piccadilly: 0x003688,
    Victoria: 0x0098d4,
    'Waterloo & City': 0x95cdba,
    DLR: 0x00a4a7,
    'London Overground': 0xee7c0e,
    Tram: 0x84b817,
};

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

app.get('/', async (req, res) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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

    const result = [];
    for (let i = 0; i < lineNames.length; i++) {
        let temp = {
            name: lineNames[i],
            status: lineStatuses[i],
            formatted_display_text: `${lineNames[i]}: ${lineStatuses[i]}`,
            color: colors[lineNames[i]],
        };
        result.push(temp);
        result[lineNames[i]] = lineStatuses[i];
    }

    await browser.close();
    res.send(result);
});

app.get('/instagram', async (req, res) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const followedAccounts = [
        'https://dumpor.com/v/georgiasmiles',
        'https://dumpor.com/v/dan_cooper28',
        'https://dumpor.com/v/fingers_harris',
        'https://dumpor.com/v/sadshrimps',
        'https://dumpor.com/v/hattiestewart',
        'https://dumpor.com/v/yukai_du',
    ];

    var url = followedAccounts[Math.floor(Math.random() * followedAccounts.length)];

    await page.goto(url);

    await page.waitForSelector('img.content__img');
    const images = await page.$$('img.content__img');

    const urls = await Promise.all(images.map(async image => await image.evaluate(i => i.getAttribute('src'))));

    console.log(urls);

    // await page.screenshot({ path: 'example.png' });

    var randomPost = urls[Math.floor(Math.random() * urls.length)];

    await browser.close();
    res.send(randomPost);
});

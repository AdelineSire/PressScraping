require('dotenv').config();

const puppeteer = require('puppeteer');
const { UNI_USERNAME, UNI_PASSWORD, UNI_URL, EUROPRESS_URL } = process.env;

const start = async () => {
	// Login
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(UNI_URL);
	await page.focus('#username');
	await page.keyboard.type(UNI_USERNAME);
	await page.focus('#password');
	await page.keyboard.type(UNI_PASSWORD);
	await Promise.all([
		page.click('input[type="submit"]'),
		page.waitForNavigation(),
	]);

	await Promise.all([
		page.goto(EUROPRESS_URL),
		page.waitForSelector('#DateFilter_DateRange'),
	]);

	// Search settings
	await page.select('select#DateFilter_DateRange', '1');
	await page.$eval('option[value="265293"]', (e) =>
		e.setAttribute('selected', 'selected')
	);

	// Search
	await page.focus('#Keywords');
	await page.keyboard.type('Zemmour');
	await page.click('#btnSearch');

	// await browser.close();
};

start();

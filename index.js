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
	await Promise.all([page.goto(EUROPRESS_URL), page.waitForNavigation()]);

	// await browser.close();
};

start();

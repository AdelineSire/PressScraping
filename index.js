require('dotenv').config();

const fs = require('fs').promises;
const puppeteer = require('puppeteer');

const { UNI_USERNAME, UNI_PASSWORD, UNI_URL, EUROPRESS_URL } = process.env;
const keywords = require('./keywords');

const scrapArticles = async (keywords) => {
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

	const results = [];

	const getArticles = async (keyword) => {
		// Go to the page and wait until loaded
		await Promise.all([
			page.goto(EUROPRESS_URL),
			page.waitForSelector('#DateFilter_DateRange'),
		]);

		// Search settings : "aujourd'hui", "presse nationale"
		await page.select('select#DateFilter_DateRange', '1');
		await page.$eval('option[value="265293"]', (e) =>
			e.setAttribute('selected', 'selected')
		);

		// Enter keyword
		await page.focus('#Keywords');
		await page.keyboard.type(`TIT_HEAD=${keyword}`);

		// Search and wait for results
		await Promise.all([
			await page.click('#btnSearch'),
			page.waitForSelector('.docListItem'),
		]);

		const articles = await page.evaluate(() => {
			const evaluatedArticles = [];
			document.querySelectorAll('.docListItem').forEach((el) => {
				const newspaper = el.querySelector('.source-name').textContent;
				const title = el.querySelector('.docList-links').textContent;
				evaluatedArticles.push({ newspaper, title });
			});
			return evaluatedArticles;
		});

		// Push in results
		results.push({ keyword, articles });
	};

	// Execute
	for (const keyword of keywords) {
		await getArticles(keyword);
	}

	await browser.close();

	return results;
};

const start = async (keywords) => {
	const results = await scrapArticles(keywords);
	const data = JSON.stringify(results);
	await fs.writeFile('./data.json', data);
};

start(keywords);

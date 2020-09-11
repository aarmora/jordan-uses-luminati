import axios, { AxiosRequestConfig } from 'axios';
import puppeteer, { launch } from 'puppeteer';
import requestPromise from 'request-promise';
import Request from 'request';
import HttpsProxyAgent from 'https-proxy-agent';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

(async () => {

	// await withAxios();
	// await withRequest();
	await withPuppeteer();

})();


async function withAxios() {
	const url = 'https://lumtest.com/myip.json';
	const options: AxiosRequestConfig = { };

	if (process.env.prod) {
		console.log('Production enabled, using Luminati');
		options.proxy = false;
		options.httpsAgent = new HttpsProxyAgent(`https://${process.env.luminatiUsername}:${process.env.luminatiPassword}@zproxy.lum-superproxy.io:22225`)
	}

	const axiosResponse = await axios.get(url, options);

	console.log('Response from axios', axiosResponse.data);

}

async function withPuppeteer() {	
	const url = 'https://lumtest.com/myip.json';

	const options = {
		args: []
	};

	if (process.env.prod) {
		options.args.push('--proxy-server=zproxy.lum-superproxy.io:22225');
	}
	
	const browser = await puppeteer.launch(options);
	const page = await browser.newPage();

	if (process.env.prod) {
		console.log('Production enabled, using Luminati');
		await page.authenticate({
			username: process.env.luminatiUsername,
			password: process.env.luminatiPassword
		});
	}

	await page.goto(url);

	const response = await page.$eval('pre', elem => elem.textContent);

	console.log('Response from puppeteer', JSON.parse(response));

	await browser.close();

}

async function withRequest() {
	const url = 'http://lumtest.com/myip.json';

	const options: Request.Options = {
		url: url,
		method: 'GET'
	};

	if (process.env.prod) {
		console.log('Production enabled, using Luminati');
		options.proxy = `http://${process.env.luminatiUsername}:${process.env.luminatiPassword}@zproxy.lum-superproxy.io:22225`;
	}

	const response = await requestPromise(options);

	console.log('Response from request', JSON.parse(response));

}
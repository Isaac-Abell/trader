const test = require("ava");
const _ = require("lodash");

const Analysis = require("../dist/analysis.js");

test("Max", (t) => {
	const data = [1, 2, 3, 25, 5, 5, 4, 10, 2, 1];

	const answer = [25, 10];

	const max = Analysis.findMax(data, 5);

	return JSON.stringify(max) == JSON.stringify(answer) ? t.pass() : t.fail();
});

test("EMA", (t) => {
	const data = [6, 5, 4, 3, 2, 1];

	const EMA = Analysis.getEMA(data);
	return EMA === 4 ? t.pass() : t.fail();
});

test("Basic moving average", (t) => {
	const data = [1, 2, 3, 4, 5];

	const average = Analysis.getMovingAverage(data);

	return average === 3 ? t.pass() : t.fail();
});

test("Empty moving average", (t) => {
	const data = [];

	const average = Analysis.getMovingAverage(data);

	return average === 0 ? t.pass() : t.fail();
});

test("Get closing data (AAPL)", async (t) => {
	const days = 7;

	const data = await Analysis.getClosingData("AAPL", days);

	const hasCorrectLength = data.length === days;
	const allNumbers = _.every(data, Number);

	return hasCorrectLength && allNumbers ? t.pass() : t.fail();
});

// Used to generate RSI testing data described here: https://www.investopedia.com/terms/r/rsi.asp
// 7 gain days with average increase of 1%, 7 loss days with average decrease of -0.8%
function rsiDataGenerator() {
	const startingPrice = 100;

	const increaseRate = 0.01;
	const decreaseRate = 0.008;

	let data = [];

	for (let i = 0; i < 15; i++) {
		if (i == 0) {
			data.push(startingPrice);
		} else if (i < 8) {
			data.push(data[i - 1] + data[i - 1] * increaseRate);
		} else {
			data.push(data[i - 1] - data[i - 1] * decreaseRate);
		}
	}

	// Generated in oldest to newest order, need to reverse to match our data API
	return _.reverse(data);
}

test("RSI using generated data", (t) => {
	// Generate RSI testing data
	const data = rsiDataGenerator();

	const rsi = Analysis.getRSI(data);

	return rsi == 55.55555555555559 ? t.pass() : t.fail();
});

test("MACD", (t) => {
	// 26 day closingData
	const slowData = [
		144.57, 142.02, 139.96, 137.27, 136.96, 136.33, 134.78, 133.11, 133.41,
		133.7, 133.98, 132.3, 130.46, 131.79, 130.15, 129.64, 130.48, 127.35,
		126.11, 127.13, 126.74, 125.9, 125.89, 123.54, 125.06, 124.28,
	];

	// 12 day closingData
	const fastData = _.take(slowData, 12);

	const macd = Analysis.getMACD(fastData, slowData);

	return macd === 4.882115384615361 ? t.pass() : t.fail();
});

test("MOM", (t) => {
	const data = [145.09, 143.24, 144.57, 142.02, 139.96];

	const MOM = Analysis.getMOM(data, 4);
	return MOM === 5.1299999999999955 ? t.pass() : t.fail();
});

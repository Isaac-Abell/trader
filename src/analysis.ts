import axios from "axios";
import * as _ from "lodash";

/**
 * Get an array of length <days> closing prices for a givin stock <symbol>
 * @param symbol A stock symbol
 * @param days Number of closing prices you want returned
 * @returns An array of closing prices for the given symbol
 */
async function getClosingData(symbol: string, days: number) {
	const priceData = await axios.get(
		`https://nojance.ozlo.co/api/stock/chart/year?symbol=${symbol}&apikey=Pulse`
	);

	return _.map(priceData.data.data, "close").slice(0, days);
}

/**
 * Get the average for an array of prices
 * @param closingPrices - Array of closing prices for a stock
 * @returns average
 */
function getMovingAverage(closingPrices: Array<number>) {
	if (_.isArray(closingPrices) && closingPrices.length > 0) {
		return _.sum(closingPrices) / closingPrices.length;
	}

	return 0;
}

/**
 * Imperative version of getPriceChanges function
 * Helper for RSI to calculate price changes by percent for an array of closes
 * @param prices Array of closing prices
 * @returns An array of price changes as percents
 */
function getPriceChangesImperative(prices) {
	let changes: number[] = [];

	for (let i = 0; i < prices.length; i++) {
		const lastPrice = prices[i + 1];
		const currentPrice = prices[i];

		if (lastPrice) {
			const change = (currentPrice - lastPrice) / lastPrice;
			changes.push(change);
		}
	}
	return changes;
}

/**
 * Helper for RSI to calculate price changes by percent for an array of closes
 * @param prices Array of closing prices
 * @returns An array of price changes as percents
 */
function getPriceChanges(prices) {
	// takes closing prices in the form [closingPrice[day], closingPrice[day-1], closingPrice[day-2], closingPrice[day-3], ...]
	// returns pairs in the form [[closingPrice[day], closingPrice[day-1]], [closingPrice[day-1], closingPrice[day-2]], ...]
	const pricesToPairs = (ps) => _.dropRight(_.zip(ps, _.drop(ps, 1)), 1);

	// calculate the % diff for a pair [closingPrice[day], closingPrice[day-1]]
	const calcChanges = ([current, previous]) =>
		(current - previous) / previous;

	return _.chain(prices).thru(pricesToPairs).map(calcChanges).value();
}

/**
 * Get the RSI for an array of given closes
 * @param closingPrices Array of closing prices
 * @param period Analysis period, standard and default is 14
 * @returns RSI value between 0 and 100
 */
function getRSI(closingPrices: Array<number>, period: number = 14): number {
	const closes = _.take(closingPrices, period + 1);

	const changes = getPriceChanges(closes);

	// Is 0 a positive number? It is here
	const isPositive = (n) => n >= 0;

	// Filter gains and losses
	const gains = _.filter(changes, isPositive);
	const losses = _.filter(changes, _.negate(isPositive));

	if(losses.length == 0) return 100
	if(gains.length == 0) return 0

	const getPeriodAverage = (a) => _.sum(a) / a.length;

	const averageGain = getPeriodAverage(gains);
	const averageLoss = Math.abs(getPeriodAverage(losses));

	return 100 - 100 / (1 + averageGain / averageLoss);
}

async function getMax(symbol: string) {
	const priceData = await axios.get(
		`https://nojance.ozlo.co/api/stock/chart/year?symbol=${symbol}&apikey=Pulse`
	);

	return _.map(priceData.data.data, "high");
}

/**
 * Get an array with the highs for a certian interval of days
 * use getMax got all of the max values, then put it through findMax
 * @param max an array of the max price of every day
 * @param interval the number of days the highs will be compared to one another
 * @returns an array of the max prices for a certian amount of time
 */
function findMax(max, interval) {
	const maxArray: number[] = [];
	let maxNum: number = 0;

	for (let i = 0; i < max.length; i++) {
		if (max[i] > maxNum) {
			maxNum = max[i];
		}
		if ((i + 1) % interval == 0) {
			maxArray.push(maxNum);
			maxNum = 0;
		}
	}
	return maxArray;
}

/**
 * Get an array with the highs for a certian interval of days
 * use getMax got all of the max values, then put it through findMax
 * @param closingprices array of the closing values
 * @param EMA moving average that excludes the most recent day
 * @returns EMA
 */
function getEMA(closingPrices: Array<number>) {
	let EMA = getMovingAverage(closingPrices.slice(Math.round(closingPrices.length / 3), closingPrices.length));

	for ( let i = Math.round(closingPrices.length / 3) - 1; i >= 0; i-- ){

		EMA = closingPrices[closingPrices.length - i] * (2 / (closingPrices.length - i + 1)) + (EMA * (1 - (2 / (closingPrices.length - i + 1))))
	}
	return EMA
}

// 	const EMA = getMovingAverage(closingPrices.slice(1, closingPrices.length));
// 	return (closingPrices[0] - EMA) * (2 / closingPrices.length) + EMA;
// }

/**
 * Get the MACD value for 2 arrays
 * MACD = FastMA - SlowMA
 * @param fastClosingPrices array of the closing values for the fast moving average
 * @param slowClosingPrices array of the closing values for the slow moving average
 * @returns MACD value
 */
function getMACD(
	fastClosingPrices: Array<number>,
	slowClosingPrices: Array<number>
) {
	const fastMA = getMovingAverage(fastClosingPrices);
	const slowMA = getMovingAverage(slowClosingPrices);
	return fastMA - slowMA;
}

/**
 * Get the current momentum of a stock from a date
 * @param days the number of days ago the stock will be compared to
 * @param closingPrices array of closing values
 * @param MOM the price of a stock compared to n number of days ago
 * @returns MOM
 */
function getMOM(closingPrices, days: number) {
	const MOM = closingPrices[0] - closingPrices[days];
	return MOM;
}

export {
	getClosingData,
	getMovingAverage,
	findMax,
	getEMA,
	getRSI,
	getMOM,
	getMACD,
};

import * as Analysis from "./analysis";
import * as _ from "lodash";
const fs = require('fs');

import { allPass, pipe } from 'ramda'

function getSymbol() {
	const symbol = process.argv[2];

	// if symbol is not undefined return back null
	if (_.isUndefined(symbol)) {
		return null;
	}

	// check if symbol length is equal to atleast 1 and not greater than 4
	if (symbol.length === 0 || symbol.length > 4) {
		return null;
	}

	// check if symbol is all letters
	if (!/^[A-Z]{1,4}$/.test(symbol)) {
		return null;
	}

	return symbol.toUpperCase();
}

async function main() {
	const symbol = getSymbol();

	if (_.isNull(symbol)) {
		console.log("Invalid symbol");
		process.exit();
	}

	const thirtyDayPrices = await Analysis.getClosingData(symbol, 30);
	const tenDayPrices    = await Analysis.getClosingData(symbol, 10);

	const thirtyDayAvg = Analysis.getMovingAverage(thirtyDayPrices);
	const tenDayAvg    = Analysis.getMovingAverage(tenDayPrices);

	const currentPrice = _.head(thirtyDayPrices);
	const RSI          = Analysis.getRSI(thirtyDayPrices)
	const EMA          = Analysis.getEMA(thirtyDayPrices)
	const MACD         = Analysis.getMACD(thirtyDayPrices, tenDayPrices)
	const shortTermMOM = Analysis.getMOM(thirtyDayPrices, 10)
	const longTermMom  = Analysis.getMOM(thirtyDayPrices, 21)

	const isRSILessThan    = val => () => RSI < val
	const isRSIGreaterThan = val => () => RSI > val

	const isEMAHigherThanAverage = () => EMA > tenDayAvg
	const isEMALowerThanAverage  = () => EMA < tenDayAvg

	const isCurrentPriceHigherThanLongTerm = () => currentPrice > thirtyDayAvg
	const isCurrentPriceLowerThanLongTerm = () => currentPrice < thirtyDayAvg

	const isCurrentPriceHigherThanShortTerm = () => currentPrice > tenDayAvg
	const isCurrentPriceLowerThanShortTerm = () => currentPrice < tenDayAvg

	const isMOMHigher = () => shortTermMOM > longTermMom
	const isMOMLower = () => shortTermMOM < longTermMom

	const isMACDHigher = () => MACD > 0
	const isMACDLower = () => MACD <= 0

	const isBuySignal = allPass([
												isRSILessThan(35),
												isEMAHigherThanAverage,
												isCurrentPriceLowerThanShortTerm,
												isCurrentPriceLowerThanLongTerm,
												isMOMHigher,
												isMACDHigher
											])

	const isSellSignal = allPass([
		                    					isRSIGreaterThan(65),
												isEMALowerThanAverage,
												isCurrentPriceHigherThanShortTerm,
												isCurrentPriceHigherThanLongTerm,
												isMOMLower,
												isMACDLower
											])
											
	if (isBuySignal()) {
		console.log(`${symbol} \tBUY`);

		const stocksToBuy = JSON.stringify(symbol);

		if (fs.existsSync('stocksToBuy.json')) {
		    let currentStockInfo = fs.readFileSync('stocksToBuy.json');
		    let combine=`${currentStockInfo} ${stocksToBuy}`
		    let printToJSON=`"${combine.split('"').join('')}"`

		    fs.writeFile('stocksToBuy.json', (printToJSON), (err) => {
			if (err) {
			    throw err;
			 }});
		 }
		else{
		fs.writeFile('stocksToBuy.json', stocksToBuy, (err) => {
		    if (err) {
			throw err;
		     }});
		}
    	} else if (isSellSignal()) {
		console.log(`${symbol} \tSELL`);
	} else {
		console.log(`${symbol} \tNEUTRAL`);
	}

}

main();

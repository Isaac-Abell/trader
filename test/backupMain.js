"use strict";
const fs = require('fs');

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Analysis = __importStar(require("./analysis"));
const _ = __importStar(require("lodash"));
const ramda_1 = require("ramda");
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
    const tenDayPrices = await Analysis.getClosingData(symbol, 10);
    const thirtyDayAvg = Analysis.getMovingAverage(thirtyDayPrices);
    const tenDayAvg = Analysis.getMovingAverage(tenDayPrices);
    const currentPrice = _.head(thirtyDayPrices);
    const RSI = Analysis.getRSI(thirtyDayPrices);
    const EMA = Analysis.getEMA(thirtyDayPrices);
    const MACD = Analysis.getMACD(thirtyDayPrices, tenDayPrices);
    const shortTermMOM = Analysis.getMOM(thirtyDayPrices, 10);
    const longTermMom = Analysis.getMOM(thirtyDayPrices, 21);
    const isRSILessThan = val => () => RSI < val;
    const isRSIGreaterThan = val => () => RSI > val;
    const isEMAHigherThanAverage = () => EMA > tenDayAvg;
    const isEMALowerThanAverage = () => EMA < tenDayAvg;
    const isCurrentPriceHigherThanLongTerm = () => currentPrice > thirtyDayAvg;
    const isCurrentPriceLowerThanLongTerm = () => currentPrice < thirtyDayAvg;
    const isCurrentPriceHigherThanShortTerm = () => currentPrice > tenDayAvg;
    const isCurrentPriceLowerThanShortTerm = () => currentPrice < tenDayAvg;
    const isMOMHigher = () => shortTermMOM > longTermMom;
    const isMOMLower = () => shortTermMOM < longTermMom;
    const isMACDHigher = () => MACD > 0;
    const isMACDLower = () => MACD <= 0;
    const isBuySignal = (0, ramda_1.allPass)([
        isRSILessThan(35),
        isEMAHigherThanAverage,
        isCurrentPriceLowerThanShortTerm,
        isCurrentPriceLowerThanLongTerm,
        isMOMHigher,
        isMACDHigher
    ]);
    const isSellSignal = (0, ramda_1.allPass)([
        isRSIGreaterThan(65),
        isEMALowerThanAverage,
        isCurrentPriceHigherThanShortTerm,
        isCurrentPriceHigherThanLongTerm,
        isMOMLower,
        isMACDLower
    ]);
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

    }
    else if (isSellSignal()) {
        console.log(`${symbol} \tSELL`);
    }
    else {
        console.log(`${symbol} \tNEUTRAL`);
    }

}

main();



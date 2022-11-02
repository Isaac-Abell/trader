import os
import json
import requests
import privateInfo


def getStocks(location):
    if os.path.exists(location):
        with open(location) as stockJson:
            data = json.loads(stockJson.read()) #converts the JSON into usable data

        #takes data, trims all unwanted elements and gets a list of stocks to trade 
        stock = data
        stocks = stock.split()

        stocksArray=[]
        for i in stocks:
            stocksArray.append(str(i.replace('"', "")))

        #deletes json file to prevent repeats
        os.remove(location)
        print(location + "deleted")

        return stocksArray

    else:
        print("The file does not exist")
        return []


def getQuotes(**kwargs):

    url = 'https://api.tdameritrade.com/v1/marketdata/quotes'
    param = {}
    key = privateInfo.api_key

    param.update({'apiKey': key})
    symbol_list = []

    for symbol in kwargs.get('symbol'):
        symbol_list.append(symbol)
    
    param.update({'symbol': symbol_list})

    return requests.get(url, params = param).json()


def getPricesAndStocks(location):

    stockData = getStocks(location)
    data = getQuotes(stockData)
    
    returnData =[]

    for stock in stockData:
        returnData.append([stock, data[stock]["lastPrice"]])
    
    return returnData

buyData = getPricesAndStocks("stocksToBuy.json")
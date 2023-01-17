import os
import json
import requests
import privateInfo

def getStocks(location):
    """gets JSON file at location and converts the data into a list"""

    if os.path.exists(location):
        with open(location) as stockJson:
            data = json.loads(stockJson.read())
        stock = data 
        stocks = stock.split()

        stocksArray=[]
        for i in stocks:
            stocksArray.append(str(i.replace('"', "")))

        os.remove(location)
        print(location + "deleted")

        return stocksArray

    else:
        print("The file does not exist")
        return []

key = ''

def getQuotes(**kwargs):
    """gets a stocks data as a dictionary"""
    url = 'https://api.tdameritrade.com/v1/marketdata/quotes'
    params = {}
    key = privateInfo.api_key

    params.update({'apikey': key})
    symbol_list = []

    for symbol in kwargs.get('symbol'):
        symbol_list.append(symbol)
    
    params.update({'symbol': symbol_list})

    return requests.get(url, params = params).json()


def getPricesAndStocks(location):
    """makes a list of lists that contains stock price and stock symbol"""
    stockData = getStocks(location)
    data = getQuotes(symbol = stockData)
    
    returnData = []

    for stock in stockData:
        returnData.append([stock, data[stock]["lastPrice"]])
    
    return returnData

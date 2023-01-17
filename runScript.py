import os
import scrapeData


stocks = scrapeData.scrapeData()

for symbol in stocks:
    os.system("node dist/main " + symbol.strip("\n"))

os.system("py Trading/tradeStocks.py")
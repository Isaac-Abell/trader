import getStocks
from tda import auth
import privateInfo
from tda.orders.equities import equity_buy_market
import tda
import httpx
import json

try:
    c = auth.client_from_token_file(privateInfo.token_path, privateInfo.api_key)
except FileNotFoundError:
    from selenium import webdriver
    with webdriver.Chrome(executable_path="C:/Users/abell/OneDrive/Desktop/Trader/Trading/chromedriver") as driver:
        c = auth.client_from_login_flow(
            driver, privateInfo.api_key, privateInfo.redirect_uri, privateInfo.token_path)


# owned_stocks = (c.get_account(privateInfo.account_id, fields = tda.client.Client.Account.Fields("positions"))).json()
# for stock in owned_stocks:
#     tda.orders.equities.equity_sell_market(stock[something], stock[somethingelse])
#     order = tda.orders.equities.equity_(stock[0], numStocksToBuy)
#     c.place_order(privateInfo.account_id, order)


stocksToTrade = getStocks.getPricesAndStocks('stocksToBuy.json')
totalPrice = 0
for stock in stocksToTrade:
    # trades simmilar monetary amount for each stock

    #change this to current balance-1000 instead of 5000
    numStocksToBuy = (5000 // max(5, len(stocksToTrade))) // stock[1]

    if numStocksToBuy != 0:
        order = tda.orders.equities.equity_buy_market(stock[0], numStocksToBuy)

    c.place_order(privateInfo.account_id, order)
    totalPrice += numStocksToBuy * stock[1]
    print("bought ", numStocksToBuy, " ", stock[0], "shares, at $", stock[1], " per share, for a total of $", round(numStocksToBuy * stock[1], 2))
    # assert r.status_code == httpx.codes.OK, r.raise_for_status()

print("bought $", totalPrice, "of stock")

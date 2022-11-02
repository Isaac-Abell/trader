import getStocks
from tda import auth, client
import privateInfo
from tda.orders.equities import equity_buy_market
from tda.orders.common import Duration, Session
import tda
import httpx

try:
    c = auth.client_from_token_file(privateInfo.token_path, privateInfo.api_key)
except FileNotFoundError:
    from selenium import webdriver
    with webdriver.Chrome(executable_path="C:/Users/abell/OneDrive/Desktop/Trader/Trading/chromedriver") as driver:
        c = auth.client_from_login_flow(
            driver, privateInfo.api_key, privateInfo.redirect_uri, privateInfo.token_path)

stocksToTrade = getStocks.getPricesAndStocks()

for stock in stocksToTrade:
    # trades simmilar monetary amount for each stock
    numStocksToBuy = (90000 // len(stocksToTrade)) // stock[1]
    
    order = tda.orders.equities.equity_buy_market(stock[0], numStocksToBuy)

    r = c.place_order(privateInfo.account_id, order)
    assert r.status_code == httpx.codes.OK, r.raise_for_status()
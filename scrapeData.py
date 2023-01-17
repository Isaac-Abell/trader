import requests
from bs4 import BeautifulSoup

def scrapeData():
    """returns a list of the symbols for the S&P 500"""
    html_data=requests.get('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies').text
    beautiful_soup=BeautifulSoup(html_data, "html.parser")
    tables = beautiful_soup.find_all('table')
    stocks =[]

    for row in tables[0].tbody.find_all("tr"):
        col = row.find_all("td")
        if (col != []):
            stock = col[0].text.strip().replace('\n','')
            stocks.append(stock) 
    return stocks
    
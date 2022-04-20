import json

with open("stocksToBuy.json") as f:
    data = json.loads(f.read())

stock=data

stocks=stock.split()

stocksArray=[]

for  i in stocks:
    stocksArray.append(i.replace('"',""))


print(stocksArray)
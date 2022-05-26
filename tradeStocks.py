import os
import json

if os.path.exists("stocksToBuy.json"):
    with open("stocksToBuy.json") as stockJson:
        data = json.loads(stockJson.read()) #converts the JSON into usable data

    #takes data and turns it into a list
    stock=data
    stocks=stock.split()

    #takes list, removes unwanted quotation marks, and truns it into an array 
    stocksArray=[]
    for  i in stocks:
        stocksArray.append(i.replace('"',""))

    #deletes json file to prevent repeats
    os.remove("stocksToBuy.json")
    print("stocksToBuy.json deleted")

    print(stocksArray)

else:
  print("The file does not exist")


import pymongo
from pprint import pprint

myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient.test
import requests
import time
import sys
import json

def getEnergyData():
    orgName = sys.argv[1]
    if (orgName == 'org1'):
        url = 'http://localhost:10000/getEnergyData'
    else :
        url = 'http://localhost:10001/getEnergyData'
   
    # payload = {'key1': '', 'key2': 'value2'}
    # x = requests.get(url, params=payload)
    x = requests.get(url)
    print(x.text)
    #sleep for 50 miliseconds
    time.sleep(.05)                             

if (len(sys.argv[1:]) != 1):
    print("Error: please give organization name as argument")
elif (sys.argv[1] == 'org1' or sys.argv[1] == 'org2'):
    getEnergyData()
else:
    print("Error: please give 'org1' or 'org2'")

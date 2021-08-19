import requests
import time
import sys
import json

def postEnergyData():
    orgName = sys.argv[1]
    if (orgName == 'org1'):
        url = 'http://localhost:10000/postEnergyData'
    else :
        url = 'http://localhost:10001/postEnergyData'
    file = open("diploma.energy.data." + orgName + ".csv", "r")
    org = file.readline().split(': ')[1]
    frequency = file.readline().split(': ')[1].split(' ')[0]
    file.readline()

    for line in file.readlines():
        timestamp, energy = line.split('\n')[0].split(', ')
        payload = {
            "timestamp": str(timestamp),
            "energy" : str(energy)
        }
        x = requests.post(url, json = payload)
        print(x.text)
        #sleep for 50 miliseconds
        # time.sleep(.05)                             

    file.close()

if (len(sys.argv[1:]) != 1):
    print("Error: please give organization name as argument")
elif (sys.argv[1] == 'org1' or sys.argv[1] == 'org2'):
    postEnergyData()
else:
    print("Error: please give 'org1' or 'org2'")

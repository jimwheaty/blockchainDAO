from random import randrange

def createSimulationData(orgName, dataFrequency):
    file= open("diploma.energy.data." + orgName + ".csv", "w")
    file.write('Organization : ' + orgName + '\n')
    file.write('Data frequency : ' + str(dataFrequency) + ' minutes\n')
    file.write('<year><month><day><hour><minute>, <energy production power in MW>\n')

    for date in range(20210101, 20210132, 1):
        date_ = str(date)
        for hour in range(0, 24, 1):
            if len(str(hour)) == 1:
                hour_ = '0' + str(hour)
            else : 
                hour_ = str(hour)
            for minute in range(0, 60, 15):
                if minute == 0:
                    minute_ = '00'
                else :
                    minute_ = str(minute)
                timestamp = date_ + hour_ + minute_
                if orgName == 'org1':
                    energyProduction = str(randrange(1000, 1300))
                else :
                    energyProduction = str(randrange(1700, 2000))
                file.write(timestamp + ', ' + energyProduction + '\n')
    file.close()

createSimulationData('org1', 15)
createSimulationData('org2', 15)
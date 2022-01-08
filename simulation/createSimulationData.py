# DECLARATIONS
# 0.19 + 0.20 + 0.30 + 0.31 = 1
# 114/600 = 0.19
# 120/600 = 0.20
# 180/600 = 0.30
# 186/600 = 0.31

# PRODUCTION
# 0.17 + 0.22 + 0.28 + 0.33 = 1
# 85/500 = 0.17
# 110/500 = 0.22
# 140/500 = 0.28
# 165/500 = 0.33

from random import randrange
def createSimulationData(orgName, dataFrequency):
    file= open("diploma.energy.data." + orgName + ".csv", "w")
    file.write('Organization : ' + orgName + '\n')
    file.write('Data frequency : ' + str(dataFrequency) + ' minutes\n')
    file.write('<year><month><day><hour><minute>, <energy declaration in MWh <energy production in MWh>\n')

    for date in range(20220101, 20220132, 1):
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
                    energyDeclaration = str(randrange(99, 129))
                    energyProduction = str(randrange(70, 100))
                elif orgName == 'org2':
                    energyDeclaration = str(randrange(105, 135))
                    energyProduction = str(randrange(95, 125))
                elif orgName == 'org3':
                    energyDeclaration = str(randrange(165, 195))
                    energyProduction = str(randrange(125, 155))
                elif orgName == 'org4':
                    energyDeclaration = str(randrange(171, 201))
                    energyProduction = str(randrange(150, 180))
                file.write(timestamp + ', ' + energyDeclaration + ', ' + energyProduction + '\n')
    file.close()

createSimulationData('org1', 15)
createSimulationData('org2', 15)
createSimulationData('org3', 15)
createSimulationData('org4', 15)

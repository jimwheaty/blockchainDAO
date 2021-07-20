def calculatePercentages():
    energySumOrg1 = calculateEnergySum('org1')
    energySumOrg2 = calculateEnergySum('org2')
    energySum = energySumOrg1 + energySumOrg2
    percentageOrg1 = float(energySumOrg1)/energySum
    percentageOrg2 = float(energySumOrg2)/energySum
    return percentageOrg1, percentageOrg2

def calculateEnergySum(orgName):
    file = open("diploma.energy.data." + orgName + ".csv", "r")
    org = file.readline().split(': ')[1]
    frequency = file.readline().split(': ')[1].split(' ')[0]
    file.readline()

    energySum = 0
    for line in file.readlines():
        timestamp, energy = line.split(', ')
        energySum += int(energy)


    file.close()
    return energySum

percentageOrg1, percentageOrg2 = calculatePercentages()
print('Org1 : ' + str(percentageOrg1))
print('Org2 : ' + str(percentageOrg2))
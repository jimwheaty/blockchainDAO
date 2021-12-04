'use strict';

const { Contract } = require('fabric-contract-api');
const { GetAssetDataByRange, UpdateAsset, ReadAsset } = require('./utils');

class EnergyData extends Contract {
    constructor() {
        super('energyDAO.energyData')
    }

    async PostData(ctx, dataString) {
        console.log(dataString);
        let dataJSON = JSON.parse(dataString)
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        let UID = caller + '.' + dataJSON.timestamp
        await UpdateAsset(ctx, UID, JSON.stringify(dataJSON));
        return dataString
    }

    async GetMonthlyData(ctx, month, year) {
        console.log(month, year);
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        
        const startUID = caller + "." + year + month + "010000"
	    const endUID = caller + "." + year + month + "312345"
        const dataArrayString = await GetAssetDataByRange(ctx, startUID, endUID)
        return dataArrayString // = {timestamp, energy}[]
    }

    async GetPercentage(ctx) {
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        let UID = caller + '.energyPercentage'
        const percentageString = await ReadAsset(ctx, UID); // get the asset from chaincode state
        console.log(percentageString);
        return percentageString
    }
}

module.exports = EnergyData;

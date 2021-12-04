'use strict';

const { Contract } = require('fabric-contract-api');
const { GetAssetDataByRange, UpdateAsset, ReadAsset } = require('./utils');

module.exports.GetMonthlyData = async(ctx, month, year) =>{
    console.log(month, year);
    let caller = ctx.clientIdentity.getMSPID()
    console.log(caller)
    const startUID = caller + "." + year + month + "010000"
    const endUID = caller + "." + year + month + "312345"
    const dataArrayString = await GetAssetDataByRange(ctx, startUID, endUID)
    return dataArrayString // = {timestamp, energy}[]
}

module.exports.GetPercentage = async(ctx) =>{
    let caller = ctx.clientIdentity.getMSPID()
    console.log(caller)
    let UID = caller + '.energyPercentage'
    const percentageString = await ReadAsset(ctx, UID); // get the asset from chaincode state
    console.log(percentageString);
    return percentageString
}	

class EnergyDataContract extends Contract {
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
	let dataArrayString = await module.exports.GetMonthlyData(ctx, month, year)
	return dataArrayString
    }
    
    async GetPercentage(ctx) {
        let percentageString = await module.exports.GetPercentage(ctx)
	return percentageString
    }
}

module.exports.EnergyDataContract = EnergyDataContract;

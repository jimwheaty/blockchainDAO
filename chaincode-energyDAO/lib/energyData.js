'use strict';

const { Contract } = require('fabric-contract-api');
const { ReadAsset, UpdateAsset, GetAssetDataByRange, AssetExists } = require('./utils')

const Organization = ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP']

const GetMonthlyDataPrivate = async(ctx, org, month, year) => {
    console.log(month, year);
    const startUID = org + "." + year + month + "010000"
    const endUID = org + "." + year + month + "312345"
    const dataString = await GetAssetDataByRange(ctx, startUID, endUID)
    console.log("dataString=", dataString);
    return dataString // = {timestamp, declaration, production}[]
}

class EnergyData extends Contract {
    async InitVote(ctx) {
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        let vote = {
            Message: "Vote is in progress...",
            Counter: {
                "yes": 0,
                "no": 0,
                "": 4
            },
            Board: {
                "Org1MSP": "",
                "Org2MSP": "",
                "Org3MSP": "",
                "Org4MSP": ""
            },
            IsFinished: false
        }
        let UID = 'vote'
        let voteString = JSON.stringify(vote)
        UpdateAsset(ctx, UID, voteString);
        return voteString
    }

    async ReadVote(ctx) {
        let assetString = await ReadAsset(ctx, 'vote')
        return assetString
    }

    async DoVote(ctx, proposal) {
        console.log(proposal);
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        
        let voteString = await ReadAsset(ctx, 'vote')
        let vote = JSON.parse(voteString)
        
        vote.Counter[vote.Board[caller]] -= 1
		vote.Board[caller] = proposal
		vote.Counter[vote.Board[caller]] += 1
        
        if (vote.Counter["yes"] > (vote.Counter["no"] + vote.Counter[""])) {
            vote.IsFinished = true
            let percentages = await this.CalculatePercentages(ctx)
            vote.Message = `The vote is done. The result is Yes. New Production Percentages: Org1: declaration: ${percentages[0].declaration}%, production: ${percentages[0].production}%, Org2: declaration: ${percentages[1].declaration}%, production: ${percentages[1].production}%\nOrg3: declaration: ${percentages[2].declaration}%, production: ${percentages[2].production}%\nOrg4: declaration: ${percentages[3].declaration}%, production: ${percentages[3].production}%`
        } else if (vote.Counter["no"] > (vote.Counter["yes"] + vote.Counter[""])){
            vote.IsFinished = true
            vote.Message = 'The vote is done. The result is No.'
        }
        voteString = JSON.stringify(vote)
        UpdateAsset(ctx, 'vote', voteString)
        return voteString
    }

    async PostDeclaration(ctx, dataString) {
        console.log(dataString);
        let dataJSON = JSON.parse(dataString)
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        let UID = caller + '.' + dataJSON.timestamp
        const exists = await AssetExists(ctx, UID);
        if (exists) {
            throw new Error(`The asset ${UID} already exists`);
        }
        await UpdateAsset(ctx, UID, dataString);
        return dataString
    }

    async PostProduction(ctx, dataString) {
        console.log(dataString);
        let dataJSON = JSON.parse(dataString)
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        let UID = caller + '.' + dataJSON.timestamp
        let assetString = await ReadAsset(ctx, UID)
        let asset = JSON.parse(assetString)
        if (!asset.declaration) {
            throw new Error(`The asset ${UID}'s declaration does not exist`);
        }
        asset.production = dataJSON.production
        assetString = JSON.stringify(asset)
        await UpdateAsset(ctx, UID, assetString);
        return assetString
    }

    async GetMonthlyData(ctx, month, year) {
        console.log(month, year);
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        const startUID = caller + "." + year + month + "010000"
        const endUID = caller + "." + year + month + "312345"
        const dataString = await GetAssetDataByRange(ctx, startUID, endUID)
        console.log("dataString=", dataString);
        return dataString // = {timestamp, declaration, production}[]
    }

    async GetPercentage(ctx) {
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        let UID = caller + '.energyPercentage'
        let percentageString = await ReadAsset(ctx, UID); // get the asset from chaincode state
        console.log(percentageString);
        return percentageString
    }

    async CalculatePercentages(ctx) {
        let today = new Date()
        let month = String(today.getMonth() + 1).padStart(2, '0');
        let year = today.getFullYear();
        if (month == '01'){
            month = '12'
            year -= 1
        } else {
            month -= 1
        }
        month = '01' // TODO: get rid of this!
        year = '2022'
    
        let energySum = [
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 }
        ]
        for (let i=0; i<4; i++){
            let dataString = await GetMonthlyDataPrivate(ctx, Organization[i], month, year)
            let data = JSON.parse(dataString)
            Object.values(data).forEach(datum => {
                energySum[i].declaration += parseInt(datum.declaration)
                energySum[i].production += parseInt(datum.production)
            })
            console.log("energySum["+i+"]:"+JSON.stringify(energySum[i]))
        }
        
        let energySumAll = {}
        energySumAll.declaration = energySum[0].declaration + energySum[1].declaration + energySum[2].declaration + energySum[3].declaration
        energySumAll.production = energySum[0].production + energySum[1].production + energySum[2].production + energySum[3].production
        console.log("energySumAll="+JSON.stringify(energySumAll));
        
        let percentages = [
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 },
            { declaration: 0, production: 0 }
        ]
        for (let i=0; i<4; i++){
            percentages[i].declaration = String(Math.round(100 * energySum[i].declaration / energySumAll.declaration))
            percentages[i].production = String(Math.round(100 * energySum[i].production / energySumAll.production))
            let UID = Organization[i] + '.energyPercentage'
            await UpdateAsset(ctx, UID, JSON.stringify(percentages[i]))
            console.log(percentages[i])
        }
        return percentages
    }
}

module.exports = EnergyData;

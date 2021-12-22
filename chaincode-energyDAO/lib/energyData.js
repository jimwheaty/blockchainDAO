'use strict';

const { Contract } = require('fabric-contract-api');
const { ReadAsset, UpdateAsset, GetAssetDataByRange } = require('./utils')

const Organization = ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP']

const GetMonthlyDataPrivate = async(ctx, org, month, year) => {
    console.log(month, year);
    const startUID = org + "." + year + month + "010000"
    const endUID = org + "." + year + month + "312345"
    const dataString = await GetAssetDataByRange(ctx, startUID, endUID)
    console.log("dataString=", dataString);
    return dataString // = {timestamp, energy}[]
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
            vote.Message = `The vote is done. The result is Yes. \nNew Production Percentages: Org1: ${percentages[0]}%, Org2: ${percentages[1]}%, Org3: ${percentages[2]}%, Org4: ${percentages[3]}%`
        } else if (vote.Counter["no"] > (vote.Counter["yes"] + vote.Counter[""])){
            vote.IsFinished = true
            vote.Message = 'The vote is done. The result is No.'
        }
        voteString = JSON.stringify(vote)
        UpdateAsset(ctx, 'vote', voteString)
        return voteString
    }

    async PostData(ctx, dataString) {
        console.log(dataString);
        let dataJSON = JSON.parse(dataString)
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller);
        let UID = caller + '.' + dataJSON.timestamp
        await UpdateAsset(ctx, UID, dataString);
        return dataString
    }

    async GetMonthlyData(ctx, month, year) {
        console.log(month, year);
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        const startUID = caller + "." + year + month + "010000"
        const endUID = caller + "." + year + month + "312345"
        const dataString = await GetAssetDataByRange(ctx, startUID, endUID)
        console.log("dataString=", dataString);
        return dataString // = {timestamp, energy}[]
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
        year = '2021'
    
        let energySum = [0, 0, 0, 0];
        for (let i=0; i<4; i++){
            let dataString = await GetMonthlyDataPrivate(ctx, Organization[i], month, year)
            let data = JSON.parse(dataString)
            Object.values(data).forEach(datum => energySum[i] += parseInt(datum.energy))
            console.log("energySum["+i+"]:"+energySum[i])
        }
        let energySumAll = energySum[0] + energySum[1] + energySum[2] + energySum[3]
        console.log("energySumAll="+energySumAll);
        let percentages = [0, 0, 0, 0];
        for (let i=0; i<4; i++){
            percentages[i] = String(Math.round(100 * energySum[i] / energySumAll))
            let UID = Organization[i] + '.energyPercentage'
            await UpdateAsset(ctx, UID, percentages[i])
            console.log(percentages[i])
        }
        return percentages
    }
}

module.exports = EnergyData;

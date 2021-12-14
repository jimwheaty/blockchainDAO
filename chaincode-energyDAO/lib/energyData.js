'use strict';

const { Contract } = require('fabric-contract-api');
const { ReadAsset, UpdateAsset, GetAssetDataByRange } = require('./utils')

const Organization = ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP']

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
            await this.CalculatePercentages(ctx)
            let myPercentageString = await this.GetPercentage(ctx)
            vote.Message = `The vote is done. The result is Yes. \nMy new Percentage: ${myPercentageString}%`
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
        let assetString = await ReadAsset(ctx, UID)
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
        return dataString // = {timestamp, energy}[]
    }

    async GetPercentage(ctx) {
        let caller = ctx.clientIdentity.getMSPID()
        console.log(caller)
        let UID = caller + '.energyPercentage'
        const percentageString = await ReadAsset(ctx, UID); // get the asset from chaincode state
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
        month = '01'
        year = '2021'
    
        let energySum = [0, 0, 0, 0];
        for (let i=0; i<4; i++){
            let dataString = await this.GetMonthlyData(ctx, month, year)
            let data = JSON.parse(dataString)
            Object.values(data).forEach(datum => energySum[i] += datum.energy)
        }
        let energySumAll = energySum[0] + energySum[1] + energySum[2] + energySum[3]
        
        let percentages = [];
        for (let i=0; i<4; i++){
            percentages[i] = String(100 * Math.round(energySum[i] / energySumAll))
            let UID = Organization[i] + '.energyPercentage'
            await UpdateAsset(ctx, UID, percentages[i])
        }
    }
}

module.exports = EnergyData;

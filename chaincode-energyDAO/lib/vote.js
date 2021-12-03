'use strict';

const { Contract } = require('fabric-contract-api');
const { ReadAsset, UpdateAsset, GetAllAssets } = require('./utils')
const EnergyData = require('./energyData')

const Organization = ['Org1MSP', 'Org2MSP', 'Org3MSP', 'Org4MSP']

const CalculatePercentages = async(ctx) => {
    let today = new Date()
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let year = today.getFullYear();
    if (month == '01'){
        month = '12'
        year -= 1
    } else {
        month -= 1
    }

    let energySum = [0, 0, 0, 0];
    for (let i=0; i<4; i++){
        let dataString = await EnergyData.GetMonthlyData(ctx, month, year)
        let data = JSON.parse(dataString)
        data.map(datum => energySum[i] += datum.energy)
    }
    let energySumAll = energySum[0] + energySum[1] + energySum[2] + energySum[3]
    
    let percentages = [];
    for (let i=0; i<4; i++){
        percentages[i] = String(100 * Math.round(energySum[i] / energySumAll))
        let UID = Organization[i] + '.energyPercentage'
        UpdateAsset(ctx, UID, percentages[i])
    }
}

class Vote extends Contract {
    constructor() {
        super('energyDAO.vote')
    }

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
        UpdateAsset(ctx, UID, JSON.stringify(vote));
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
            await CalculatePercentages(ctx)
            let myPercentageString = await EnergyData.GetPercentage(ctx)
            vote.Message = `The vote is done. The result is Yes. \nMy new Percentage: ${myPercentageString}%`
        } else if (vote.Counter["no"] > (vote.Counter["yes"] + vote.Counter[""])){
            vote.IsFinished = true
            vote.Message = 'The vote is done. The result is No.'
        }
        UpdateAsset(ctx, 'vote', JSON.stringify(vote))
    }
}

module.exports = Vote;

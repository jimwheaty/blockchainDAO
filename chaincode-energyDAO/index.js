'use strict';

const { VoteContract } = require('./lib/vote');
const { EnergyDataContract } = require('./lib/energyData');

module.exports = {
    VoteContract, 
    EnergyDataContract,
    contracts: [VoteContract, EnergyDataContract]
}

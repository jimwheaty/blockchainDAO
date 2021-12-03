'use strict';

const vote = require('./lib/vote');
const energyData = require('./lib/energyData');

module.exports = {
    vote, 
    energyData,
    contracts: [vote, energyData]
}
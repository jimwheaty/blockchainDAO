'use strict';
const express = require('express');
const app = express();
const cors = require('cors');

// import Routers
const energyDataRouter = require('./routes/energyDataRouter');
const voteRouter = require('./routes/voteRouter')

// import Utilities
const { getContract } = require('./utils/getContract');

module.exports.handler = async(res, transactionType, ...args) => {
	let responseBuffer = await contract[transactionType](...args)
	console.log(responseBuffer.toString());
	res.status(200).send(responseBuffer.toString())
}

let contract;
async function main(){
	// set variables based on the organization number (1 or 2 or 3 or 4)
	const orgNum = process.env.ORG
	const port = 10000+Number(orgNum)
	contract= await getContract(orgNum)
	
	let allowedOrigins = { origin: ['http://localhost', 'http://localhost:3000', 'http://172.24.240.72:3000', 'http://localhost:3001', 'http://172.24.240.72:3001', 'http://localhost:3002', 'http://172.24.240.72:3002', 'http://localhost:3003', 'http://172.24.240.72:3003'] }
	app.use(cors(allowedOrigins))
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))

	// use my Routers
	app.use('/vote', voteRouter)
	app.use('/energyData', energyDataRouter)

	app.listen(port, () => {
		console.log('listening on port %s...', port);
	});
}
main()

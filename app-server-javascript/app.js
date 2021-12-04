'use strict';
const express = require('express');
const app = express();
const cors = require('cors');

// import Routers
const energyDataRouter = require('./routes/energyDataRouter');
const voteRouter = require('./routes/voteRouter')

// import Utilities
const { getContracts } = require('./utils/getContracts');

module.exports.handler = async(res, contract, transactionType, ...args) => {
	try {
		let responseBody = await contracts[contract][transactionType](...args)
		res.status(200).send({ success: responseBody.toString()})
	} catch(error) {
		console.error(error); 
		res.send({ error: error.toString() }) 
	}
}

let contracts;
async function main(){
	// set variables based on the organization number (1 or 2 or 3 or 4)
	const orgNum = process.env.ORG
	const port = 10000+Number(orgNum)
	contracts = await getContracts(orgNum)
	
	let allowedOrigins = { origin: ['http://localhost:3000', 'http://172.20.78.79:3000', 'http://localhost:3001', 'http://172.20.78.79:3001', 'http://localhost:3002', 'http://172.20.78.79:3002', 'http://localhost:3003', 'http://172.20.78.79:3003'] }
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
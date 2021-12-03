'use strict';
const express = require('express');
const app = express();
const cors = require('cors');

// import Routers
const energyDataRouter = require('./routes/energyDataRouter');
const voteRouter = require('./routes/voteRouter')

// import Utilities
const { getContracts } = require('./utils/getContracts');

exports.handler = async(res, func,...args) => {
	try {
		let responseBody = await func(...args)
		res.status(200).send({ success: responseBody})
	} catch(error) { 
		res.send({ error }) 
	}
}

async function main(){
	// set variables based on the organization number (1 or 2 or 3 or 4)
	const orgNum = process.env.ORG
	const port = 10000+Number(orgNum)
	exports.contracts = getContracts(orgNum)
	
	let allowedOrigins = { origin: 'http://localhost' }
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

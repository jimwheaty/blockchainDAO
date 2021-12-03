'use strict';
const { buildCCP, buildWallet } = require('./utils');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');

exports.getContracts = async (orgNum) => {
    const walletPath = './wallet';
    const orgMSP = "Org"+orgNum+"MSP"
    const orgName = "org"+orgNum
    const orgUserId = orgName+"AppUser"

	try {
		// get an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCP(orgName);

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);
		const certificate = fs.readFileSync('../test-network/organizations/peerOrganizations/'+orgName+'.example.com/users/User1@'+orgName+'.example.com/msp/signcerts/cert.pem', 'utf-8');
		const privateKey = fs.readFileSync('../test-network/organizations/peerOrganizations/'+orgName+'.example.com/users/User1@'+orgName+'.example.com/msp/keystore/key.pem', 'utf-8');

		const x509Identity = {
			credentials: {
				certificate: certificate,
				privateKey: privateKey,
			},
			mspId: orgMSP,
			type: 'X.509',
		};
		await wallet.put(orgUserId, x509Identity);

		const gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: orgUserId,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});

		// Build a network instance based on the channel where the smart contract is deployed
		const network = await gateway.getNetwork("mychannel");

		// Return the contract from the network.
		const vote = network.getContract("energyDAO", "energyDAO.vote");
		const energyData = network.getContract("energyDAO", "energyDAO.energyData");
		return { vote, energyData }
	} catch (error) {
		console.error(`******** FAILED in function getContracts(): ${error}`);
	}
};
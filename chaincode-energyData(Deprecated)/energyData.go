package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/jimwheaty/blockchainDAO/chaincode-energyData/chaincode"
)

func main() {
	energyDataChaincode, err := contractapi.NewChaincode(&chaincode.SmartContract{})
	if err != nil {
		log.Panicf("Error creating energyData chaincode: %v", err)
	}

	if err := energyDataChaincode.Start(); err != nil {
		log.Panicf("Error starting energyData chaincode: %v", err)
	}
}

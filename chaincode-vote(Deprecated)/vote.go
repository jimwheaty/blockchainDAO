package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/jimwheaty/blockchainDAO/chaincode-vote/chaincode"
)

func main() {
	voteChaincode, err := contractapi.NewChaincode(&chaincode.SmartContract{})
	if err != nil {
		log.Panicf("Error creating vote chaincode: %v", err)
	}

	if err := voteChaincode.Start(); err != nil {
		log.Panicf("Error starting vote chaincode: %v", err)
	}
}

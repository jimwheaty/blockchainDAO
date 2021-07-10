package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Asset
type SmartContract struct {
	contractapi.Contract
}

// 	isFinished: False
// }
// Asset describes basic details of what makes up a simple asset
type counter struct {
	yes       int `json:"yes"`
	no        int `json:"no"`
	undefined int `json:"undefined"`
}

type board struct {
	org1 bool `json:"org1"`
	org2 bool `json:"org2"`
}

type vote struct {
	id      string  `json:"id"`
	message string  `json:"message"`
	counter counter `json:"counter"`
	board   board   `json:"board"`
}

// InitLedger adds a base set of assets to the ledger
func (s *SmartContract) CreateVote(ctx contractapi.TransactionContextInterface) error {
	vote := vote{
		id:      "vote1",
		message: "",
		counter: counter{
			yes:       0,
			no:        0,
			undefined: 2,
		},
		board: board{
			org1: nil,
			org2: nil,
		},
	}

	assetJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(vote.id, assetJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	return nil
}

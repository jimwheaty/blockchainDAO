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
	Yes       int `json:"yes"`
	No        int `json:"no"`
	Undefined int `json:"undefined"`
}

type board struct {
	Org1 string `json:"org1"`
	Org2 string `json:"org2"`
}

type vote struct {
	ID      string  `json:"id"`
	Message string  `json:"message"`
	Counter counter `json:"counter"`
	Board   board   `json:"board"`
}

// InitLedger adds a base set of assets to the ledger
func (s *SmartContract) CreateVote(ctx contractapi.TransactionContextInterface) error {
	vote := vote{
		ID:      "vote1",
		Message: "",
		Counter: counter{
			Yes:       0,
			No:        0,
			Undefined: 2,
		},
		Board: board{
			Org1: "",
			Org2: "",
		},
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(vote.ID, voteJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	return nil
}

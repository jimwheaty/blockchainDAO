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

// ReadAsset returns the asset stored in the world state with given id.
func (s *SmartContract) ReadVote(ctx contractapi.TransactionContextInterface, id string) (*vote, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if voteJSON == nil {
		return nil, fmt.Errorf("the vote %s does not exist", id)
	}

	var vote vote
	err = json.Unmarshal(voteJSON, &vote)
	if err != nil {
		return nil, err
	}

	return &vote, nil
}

// UpdateAsset updates an existing asset in the world state with provided parameters.
func (s *SmartContract) UpdateVote(ctx contractapi.TransactionContextInterface, id string, message string, counter counter, board board) error {
	exists, err := s.VoteExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the vote %s does not exist", id)
	}

	// overwriting original asset with new asset
	vote := vote{
		ID:      id,
		Message: message,
		Counter: counter,
		Board:   board,
	}
	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, voteJSON)
}

// AssetExists returns true when asset with given ID exists in world state
func (s *SmartContract) VoteExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return voteJSON != nil, nil
}

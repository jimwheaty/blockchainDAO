package chaincode

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Vote
type SmartContract struct {
	contractapi.Contract
}

// energyData describes basic details of what makes up a simple energy data
type energyData struct {
	ID     string `json:"id"`
	Energy string `json:"energy"`
}

// PostData initializes a vote to the ledger
func (s *SmartContract) PostData(ctx contractapi.TransactionContextInterface, org string, timestamp string, energy string) error {
	data := energyData{
		ID:     org + "." + timestamp,
		Energy: energy,
	}

	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}

	err = ctx.GetStub().PutState(data.ID, dataJSON)
	if err != nil {
		return fmt.Errorf("failed to put to world state. %v", err)
	}

	return nil
}

// ReadVote returns the vote stored in the world state with given id.
func (s *SmartContract) ReadVote(ctx contractapi.TransactionContextInterface, id string) (*energyData, error) {
	dataJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if dataJSON == nil {
		return nil, fmt.Errorf("the energy data %s does not exist", id)
	}

	var data energyData
	err = json.Unmarshal(dataJSON, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

// GetMonthlyData returns all energy data for the given month found in world state
func (s *SmartContract) GetMonthlyData(ctx contractapi.TransactionContextInterface, org string, year string, month string) ([]*energyData, error) {
	startKey := org + "." + year + month + "010000"
	endKey := org + "." + year + month + "312345"
	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var data []*energyData
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var datum energyData
		err = json.Unmarshal(queryResponse.Value, &datum)
		if err != nil {
			return nil, err
		}
		data = append(data, &datum)
	}

	return data, nil
}

// func (s *SmartContract) GetAddress(ctx contractapi.TransactionContextInterface) (address string, error error) {
// 	creator, err := ctx.GetClientIdentity().GetID()
// 	if err != nil {
// 		return "", fmt.Errorf("failed to read address from context: %v", err)
// 	}

// 	return creator, nil
// }

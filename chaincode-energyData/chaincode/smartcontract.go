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

// energyProductionPercentage describes the percentage of a energy producer compared to others
type energyProductionPercentage struct {
	Org        string `json:"Org"`
	Percentage string `json:"percentage"`
}

// InitPercentage is called to initialize a fake percentage for simulation purposes
func (s *SmartContract) InitPercentage(ctx contractapi.TransactionContextInterface, org string) (*energyProductionPercentage, error) {
	var number string
	if org == "org1" {
		number = "40"
	} else {
		number = "60"
	}

	percentage := energyProductionPercentage{
		Org:        org,
		Percentage: number,
	}

	percentageJSON, err := json.Marshal(percentage)
	if err != nil {
		return nil, err
	}

	err = ctx.GetStub().PutState(percentage.Org, percentageJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to put to world state. %v", err)
	}

	return &percentage, nil
}

// GetPercentage returns the energy production percentage of an energy producer
func (s *SmartContract) GetPercentage(ctx contractapi.TransactionContextInterface, org string) (*energyProductionPercentage, error) {
	percentageJSON, err := ctx.GetStub().GetState(org)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if percentageJSON == nil {
		return nil, fmt.Errorf("the energy data %s does not exist", org)
	}

	var percentage energyProductionPercentage
	err = json.Unmarshal(percentageJSON, &percentage)
	if err != nil {
		return nil, err
	}

	return &percentage, nil
}

// PostData posts new energy data to the ledger
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

// ReadData returns the energy data stored in the world state with given id.
func (s *SmartContract) ReadData(ctx contractapi.TransactionContextInterface, id string) (*energyData, error) {
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

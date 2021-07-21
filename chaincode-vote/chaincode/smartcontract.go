package chaincode

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing an Vote
type SmartContract struct {
	contractapi.Contract
}

// Vote describes basic details of what makes up a simple vote
type vote struct {
	ID         string            `json:"id"`
	Message    string            `json:"message"`
	Counter    map[string]int    `json:"counter"`
	Board      map[string]string `json:"board"`
	IsFinished bool              `json:"isFinished"`
}

// CreateVote initializes a vote to the ledger
func (s *SmartContract) CreateVote(ctx contractapi.TransactionContextInterface) error {
	vote := vote{
		ID:      "vote1",
		Message: "",
		Counter: map[string]int{
			"yes": 0,
			"no":  0,
			"":    2,
		},
		Board: map[string]string{
			"org1": "",
			"org2": "",
		},
		IsFinished: false,
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

// ReadVote returns the vote stored in the world state with given id.
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

// DoVote updates an existing vote in the world state with provided id and vote 'yes' or 'no'.
func (s *SmartContract) DoVote(ctx contractapi.TransactionContextInterface, address string, id string, vote_field string) error {
	exists, err := s.voteExists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the vote %s does not exist", id)
	}

	vote, err := s.ReadVote(ctx, id)
	if err != nil {
		return err
	} else if vote.IsFinished {
		return fmt.Errorf("the vote is closed")
	}

	if vote_field == "yes" || vote_field == "no" {

		vote.Counter[vote.Board[address]] -= 1
		vote.Board[address] = vote_field
		vote.Counter[vote.Board[address]] += 1

		if vote.Counter["yes"] > (vote.Counter["no"] + vote.Counter[""]) {
			vote.Message = "The vote is done. The result is Yes. \nCalculating percentages, please wait ..."
			vote.IsFinished = true
			percentageOrg1, percentageOrg2, err := s.calculatePercentages(ctx)
			if err != nil {
				return err
			}
			vote.Message = "The vote is done. The result is Yes. \nOrganization1: " + percentageOrg1 + "%, Organization2: " + percentageOrg2 + "%"
		} else if vote.Counter["no"] > (vote.Counter["yes"] + vote.Counter[""]) {
			vote.Message = "The vote is done. The result is No"
			vote.IsFinished = true
		} else {
			vote.Message = "The vote is still going... No result yet."
		}

		voteJSON, err := json.Marshal(vote)
		if err != nil {
			return err
		}

		return ctx.GetStub().PutState(id, voteJSON)
	} else {
		return fmt.Errorf("failed to do vote: please use 'yes' or 'no' on your vote")
	}
}

// calculatePercentages calculates the percentages for each organization of the energy data in the world state
func (s *SmartContract) calculatePercentages(ctx contractapi.TransactionContextInterface) (percentageOrg1 string, percentageOrg2 string, error error) {
	energyDataOrg1, err := s.getMonthlyData(ctx, "org1", "2021", "01")
	if err != nil {
		return "", "", err
	}
	energyDataOrg2, err := s.getMonthlyData(ctx, "org2", "2021", "01")
	if err != nil {
		return "", "", err
	}

	var energySumOrg1 float64
	var energySumOrg2 float64
	var datumFloat float64
	for _, datum := range energyDataOrg1 {
		datumFloat, err = strconv.ParseFloat(datum.Energy, 64)
		if err != nil {
			return "", "", err
		}
		energySumOrg1 += datumFloat
	}
	for _, datum := range energyDataOrg2 {
		datumFloat, err = strconv.ParseFloat(datum.Energy, 64)
		if err != nil {
			return "", "", err
		}
		energySumOrg2 += datumFloat
	}

	energySum := energySumOrg1 + energySumOrg2
	percentageOrg1 = strconv.FormatFloat(energySumOrg1/energySum, 'E', -1, 32)
	percentageOrg2 = strconv.FormatFloat(energySumOrg2/energySum, 'E', -1, 32)

	return percentageOrg1, percentageOrg2, nil
}

// voteExists returns true when vote with given ID exists in world state
func (s *SmartContract) voteExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return voteJSON != nil, nil
}

// energyData describes basic details of what makes up a simple energy data
type energyData struct {
	ID     string `json:"id"`
	Energy string `json:"energy"`
}

// getMonthlyData returns all energy data for the given month found in world state
func (s *SmartContract) getMonthlyData(ctx contractapi.TransactionContextInterface, org string, year string, month string) ([]*energyData, error) {
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

// // DeleteAsset deletes an given asset from the world state.
// func (s *SmartContract) DeleteVote(ctx contractapi.TransactionContextInterface, id string) error {
// 	exists, err := s.voteExists(ctx, id)
// 	if err != nil {
// 		return err
// 	}
// 	if !exists {
// 		return fmt.Errorf("the vote %s does not exist", id)
// 	}

// 	return ctx.GetStub().DelState(id)
// }
// func (s *SmartContract) GetAddress(ctx contractapi.TransactionContextInterface) (address string, error error) {
// 	creator, err := ctx.GetClientIdentity().GetID()
// 	if err != nil {
// 		return "", fmt.Errorf("failed to read address from context: %v", err)
// 	}

// 	return creator, nil
// }

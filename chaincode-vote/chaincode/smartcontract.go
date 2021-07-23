package chaincode

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

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

// energyData describes basic details of what makes up a simple energy data
type energyData struct {
	ID     string `json:"id"`
	Energy string `json:"energy"`
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
			percentages, err := s.CalculatePercentages(ctx)
			if err != nil {
				return err
			}
			percentagesArr := strings.Split(percentages, ",")
			vote.Message = "The vote is done. The result is Yes. \nOrganization1: " + percentagesArr[0] + "%, Organization2: " + percentagesArr[1] + "%"
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
func (s *SmartContract) CalculatePercentages(ctx contractapi.TransactionContextInterface) (percentages string, error error) {
	var args [][]byte
	args = append(args, []byte("GetMonthlyData"))
	args = append(args, []byte("org1"))
	args = append(args, []byte("2021"))
	args = append(args, []byte("01"))
	response := ctx.GetStub().InvokeChaincode("energyData", args, "mychannel")
	var energyDataOrg1 []energyData
	err := json.Unmarshal(response.Payload, &energyDataOrg1)
	if err != nil {
		return "", err
	}
	args[1] = []byte("org2")
	response = ctx.GetStub().InvokeChaincode("energyData", args, "mychannel")
	var energyDataOrg2 []energyData
	err = json.Unmarshal(response.Payload, &energyDataOrg2)
	if err != nil {
		return "", err
	}
	var energySumOrg1 int
	for _, datum := range energyDataOrg1 {
		datumInt, err := strconv.Atoi(datum.Energy)
		if err != nil {
			return "", err
		}
		energySumOrg1 += datumInt
	}

	var energySumOrg2 int
	for _, datum := range energyDataOrg2 {
		datumInt, err := strconv.Atoi(datum.Energy)
		if err != nil {
			return "", err
		}
		energySumOrg2 += datumInt
	}
	energySum := energySumOrg1 + energySumOrg2
	percentageOrg1 := strconv.Itoa(100 * energySumOrg1 / energySum)
	percentageOrg2 := strconv.Itoa(100 * energySumOrg2 / energySum)
	return percentageOrg1 + "," + percentageOrg2, nil
}

// voteExists returns true when vote with given ID exists in world state
func (s *SmartContract) voteExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return voteJSON != nil, nil
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

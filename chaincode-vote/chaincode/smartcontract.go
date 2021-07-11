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

// Vote describes basic details of what makes up a simple vote
// type counter struct {
// 	Yes       int `json:"yes"`
// 	No        int `json:"no"`
// 	Undefined int `json:"undefined"`
// }

// type board struct {
// 	Org1 string `json:"org1"`
// 	Org2 string `json:"org2"`
// }

// type vote struct {
// 	ID         string  `json:"id"`
// 	Message    string  `json:"message"`
// 	Counter    counter `json:"counter"`
// 	Board      board   `json:"board"`
// 	IsFinished bool    `json:"isFinished"`
// }
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
	exists, err := s.VoteExists(ctx, id)
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
		// counter := map[string]*int{
		// 	"yes": &vote.Counter.Yes,
		// 	"no":  &vote.Counter.No,
		// 	"":    &vote.Counter.Undefined,
		// }
		// board := map[string]*string{
		// 	"Org1": &vote.Board.Org1,
		// 	"Org2": &vote.Board.Org2,
		// }

		// *counter[*board[address]] -= 1
		// *board[address] = vote_field
		// *counter[*board[address]] += 1

		vote.Counter[vote.Board[address]] -= 1
		vote.Board[address] = vote_field
		vote.Counter[vote.Board[address]] += 1

		// if vote.Counter.Yes > (vote.Counter.No + vote.Counter.Undefined) {
		if vote.Counter["yes"] > (vote.Counter["no"] + vote.Counter[""]) {
			vote.Message = "The vote is done. The result is Yes"
			vote.IsFinished = true
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

// VoteExists returns true when vote with given ID exists in world state
func (s *SmartContract) VoteExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	voteJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return voteJSON != nil, nil
}

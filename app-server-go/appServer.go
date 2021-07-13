/*
Copyright 2020 IBM All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"
)

var contract *gateway.Contract
var org string
var vote string = "yes"

type simpleResponse struct {
	Message string `json:"message"`
}

// Vote describes basic details of what makes up a simple vote
type voteResponse struct {
	ID         string            `json:"id"`
	Message    string            `json:"message"`
	Counter    map[string]int    `json:"counter"`
	Board      map[string]string `json:"board"`
	IsFinished bool              `json:"isFinished"`
}

func homePage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: homePage")
	message := "Welcome to the HomePage!"
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

func createVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: createVote")
	// log.Println("--> Evaluate Transaction: VoteExists() checks if a vote exists in the ledger")
	// result, err := contract.EvaluateTransaction("VoteExists", "vote1")
	// if err != nil {
	// 	fmt.Fprintf(w, "CreateVote failed: VoteExists failed")
	// 	log.Fatalf("Failed to evaluate transaction: %v", err)
	// }
	// log.Println("VoteExists " + string(result))

	var message string
	// if string(result) == "false" {
	log.Println("--> Submit Transaction: CreateVote() initializes a vote to the ledger")
	result, err := contract.SubmitTransaction("CreateVote")
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}
	// message = "Vote1 doesn't exist... \nCreateVote " + string(result)
	message = "CreateVote" + string(result)
	// } else {
	// 	message = "Vote1 already exists..."
	// }
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

func readVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: readVote")
	log.Println("--> Evaluate Transaction: ReadVote() returns the vote stored in the world state with given id")
	result, err := contract.EvaluateTransaction("ReadVote", "vote1")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
	var message voteResponse
	json.Unmarshal(result, &message)
	json.NewEncoder(w).Encode(message)
	// fmt.Fprint(w, string(result))
}

func doVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: doVote")
	log.Println("--> Submit Transaction: DoVote() updates an existing vote in the world state with provided id and vote field")
	result, err := contract.SubmitTransaction("DoVote", org, "vote1", vote)
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}
	// fmt.Fprint(w, "DoVote "+string(result))
	message := "DoVote " + string(result)
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

func handleRequests(contract *gateway.Contract, port string) {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/create", createVote)
	http.HandleFunc("/read", readVote)
	http.HandleFunc("/do", doVote)
	log.Fatal(http.ListenAndServe(port, nil))
}

func main() {
	channelName := "mychannel"
	chaincodeName := "vote"
	walletName := "wallet"

	// please give 'org1' or 'org2' as argument
	org = os.Args[1]
	var orgMSP string
	var orgUserId string
	var port string
	if org == "org1" {
		orgMSP = "Org1MSP"
		orgUserId = "org1AppUser"
		port = ":10000"
	} else if org == "org2" {
		orgMSP = "Org2MSP"
		orgUserId = "org2AppUser"
		port = ":10001"
	} else {
		log.Fatal("Error: Please give 'org1' or 'org2' as an argument")
	}

	log.Println("============ application-golang starts ============")

	err := os.Setenv("DISCOVERY_AS_LOCALHOST", "true")
	if err != nil {
		log.Fatalf("Error setting DISCOVERY_AS_LOCALHOST environemnt variable: %v", err)
	}

	wallet, err := gateway.NewFileSystemWallet(walletName)
	if err != nil {
		log.Fatalf("Failed to create wallet: %v", err)
	}

	if !wallet.Exists(orgUserId) {
		err = populateWallet(wallet, org, orgMSP, orgUserId)
		if err != nil {
			log.Fatalf("Failed to populate wallet contents: %v", err)
		}
	}

	ccpPath := filepath.Join(
		"..",
		"test-network",
		"organizations",
		"peerOrganizations",
		org+".example.com",
		"connection-"+org+".yaml",
	)

	gw, err := gateway.Connect(
		gateway.WithConfig(config.FromFile(filepath.Clean(ccpPath))),
		gateway.WithIdentity(wallet, orgUserId),
	)
	if err != nil {
		log.Fatalf("Failed to connect to gateway: %v", err)
	}
	defer gw.Close()

	network, err := gw.GetNetwork(channelName)
	if err != nil {
		log.Fatalf("Failed to get network: %v", err)
	}

	contract = network.GetContract(chaincodeName)

	handleRequests(contract, port)
	log.Println("============ application-golang ends ============")
}

func populateWallet(wallet *gateway.Wallet, org string, orgMSP string, orgUserId string) error {
	log.Println("============ Populating wallet ============")
	credPath := filepath.Join(
		"..",
		"test-network",
		"organizations",
		"peerOrganizations",
		org+".example.com",
		"users",
		"User1@"+org+".example.com",
		"msp",
	)

	certPath := filepath.Join(credPath, "signcerts", "cert.pem")
	// read the certificate pem
	cert, err := ioutil.ReadFile(filepath.Clean(certPath))
	if err != nil {
		return err
	}

	keyDir := filepath.Join(credPath, "keystore")
	// there's a single file in this dir containing the private key
	files, err := ioutil.ReadDir(keyDir)
	if err != nil {
		return err
	}
	if len(files) != 1 {
		return fmt.Errorf("keystore folder should have contain one file")
	}
	keyPath := filepath.Join(keyDir, files[0].Name())
	key, err := ioutil.ReadFile(filepath.Clean(keyPath))
	if err != nil {
		return err
	}

	identity := gateway.NewX509Identity(orgMSP, string(cert), string(key))

	return wallet.Put(orgUserId, identity)
}

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

var voteContract *gateway.Contract
var energyDataContract *gateway.Contract
var org string
var vote string = "yes"

type simpleResponse struct {
	Message string `json:"message"`
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

	log.Println("--> Submit Transaction: CreateVote() initializes a vote to the ledger")
	result, err := voteContract.SubmitTransaction("CreateVote")
	if err != nil {
		log.Printf("Failed to Submit transaction: %v", err)
	}
	message := "CreateVote" + string(result)
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

func doVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: doVote")
	log.Println("--> Submit Transaction: DoVote() updates an existing vote in the world state with provided id and vote field")
	result, err := voteContract.SubmitTransaction("DoVote", org, "vote1", vote)
	if err != nil {
		log.Printf("Failed to Submit transaction: %v", err)
	}
	// fmt.Fprint(w, "DoVote "+string(result))
	message := "DoVote " + string(result)
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

// Vote describes basic details of what makes up a simple vote
type voteResponse struct {
	ID         string            `json:"id"`
	Message    string            `json:"message"`
	Counter    map[string]int    `json:"counter"`
	Board      map[string]string `json:"board"`
	IsFinished bool              `json:"isFinished"`
}

func readVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: readVote")
	log.Println("--> Evaluate Transaction: ReadVote() returns the vote stored in the world state with given id")
	result, err := voteContract.EvaluateTransaction("ReadVote", "vote1")
	if err != nil {
		log.Printf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
	var message voteResponse
	json.Unmarshal(result, &message)
	json.NewEncoder(w).Encode(message)
	// fmt.Fprint(w, string(result))
}

type energyData struct {
	Timestamp string `json:"timestamp"`
	Energy    string `json:"energy"`
}

func postEnergyData(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method is not supported.", http.StatusNotFound)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: PostData")
	log.Println("--> Submit Transaction: PostData() adds new energy data in the world state")
	var data energyData
	json.NewDecoder(r.Body).Decode(&data)
	result, err := energyDataContract.SubmitTransaction("PostData", org, data.Timestamp, data.Energy)
	if err != nil {
		log.Printf("Failed to Submit transaction: %v", err)
	}
	message := "postEnergyData " + string(result)
	response := simpleResponse{Message: message}
	json.NewEncoder(w).Encode(response)
}

type energyDataResponse struct {
	ID     string
	Energy string
}

func getEnergyData(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method is not supported.", http.StatusNotFound)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: GetMonthlyData")
	log.Println("--> Evaluate Transaction: GetMonthlyData() gets the energy data for a month given year, month")

	result, err := energyDataContract.EvaluateTransaction("GetMonthlyData", org, "2021", "01")
	if err != nil {
		log.Printf("Failed to Evaluate transaction: %v", err)
	}

	var message []energyDataResponse
	json.Unmarshal(result, &message)
	json.NewEncoder(w).Encode(message)
}

type percentageResponse struct {
	Org        string
	Percentage string
}

func getPercentage(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method is not supported.", http.StatusNotFound)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: getPercentage")
	log.Println("--> Evaluate Transaction: getPercentage() gets the energy production percentage of a given organization")

	result, err := energyDataContract.EvaluateTransaction("GetPercentage", org)
	if err != nil {
		log.Printf("Failed to Evaluate transaction: %v", err)
	}

	var message percentageResponse
	json.Unmarshal(result, &message)
	json.NewEncoder(w).Encode(message)
}

func initPercentage(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method is not supported.", http.StatusNotFound)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Println("Endpoint Hit: initPercentage")
	log.Println("--> Submit Transaction: initPercentage() initializes the production percentage of the given organization in the world state")
	result, err := energyDataContract.SubmitTransaction("InitPercentage", org)
	if err != nil {
		log.Printf("Failed to Submit transaction: %v", err)
	}
	var message percentageResponse
	json.Unmarshal(result, &message)
	json.NewEncoder(w).Encode(message)
}

func handleRequests(port string) {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/create", createVote)
	http.HandleFunc("/read", readVote)
	http.HandleFunc("/do", doVote)
	http.HandleFunc("/postEnergyData", postEnergyData)
	http.HandleFunc("/getEnergyData", getEnergyData)
	http.HandleFunc("/initPercentage", initPercentage)
	http.HandleFunc("/getPercentage", getPercentage)
	log.Fatal(http.ListenAndServe(port, nil))
}

func main() {
	channelName := "mychannel"
	chaincodeVoteName := "vote"
	chaincodeEnergyDataName := "energyData"
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

	voteContract = network.GetContract(chaincodeVoteName)
	energyDataContract = network.GetContract(chaincodeEnergyDataName)

	fmt.Printf("Starting server at port " + port + "\n")
	handleRequests(port)
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

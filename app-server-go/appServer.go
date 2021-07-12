/*
Copyright 2020 IBM All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"
)

// pre-requisites:
// - fabric-sample two organization test-network setup with two peers, ordering service,
//   and 2 certificate authorities
//         ===> from directory /fabric-samples/test-network
//         ./network.sh up createChannel -ca
// - Use any of the asset-transfer-basic chaincodes deployed on the channel "mychannel"
//   with the chaincode name of "basic". The following deploy command will package,
//   install, approve, and commit the javascript chaincode, all the actions it takes
//   to deploy a chaincode to a channel.
//         ===> from directory /fabric-samples/test-network
//         ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
// - Be sure that node.js is installed
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         node -v
// - npm installed code dependencies
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         npm install
// - to run this test application
//         ===> from directory /fabric-samples/asset-transfer-basic/application-javascript
//         node app.js

// NOTE: If you see  kind an error like these:
/*
    2020-08-07T20:23:17.590Z - error: [DiscoveryService]: send[mychannel] - Channel:mychannel received discovery error:access denied
    ******** FAILED to run the application: Error: DiscoveryService: mychannel error: access denied

   OR

   Failed to register user : Error: fabric-ca request register failed with errors [[ { code: 20, message: 'Authentication failure' } ]]
   ******** FAILED to run the application: Error: Identity not found in wallet: appUser
*/
// Delete the /fabric-samples/asset-transfer-basic/application-javascript/wallet directory
// and retry this application.
//
// The certificate authority must have been restarted and the saved certificates for the
// admin and application user are not valid. Deleting the wallet store will force these to be reset
// with the new certificate authority.
//

var contract *gateway.Contract

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the HomePage!")
	fmt.Println("Endpoint Hit: homePage")
}

func createVote(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: createVote")
	result, err := contract.EvaluateTransaction("VoteExists", "vote1")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
	if string(result) == "false" {
		log.Println("--> Submit Transaction: CreateVote() initializes a vote to the ledger")
		result, err = contract.SubmitTransaction("CreateVote")
		if err != nil {
			log.Fatalf("Failed to Submit transaction: %v", err)
		}
		log.Println(string(result))
	}
	fmt.Fprint(w, string(result))
}

func readVote(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: readVote")
	log.Println("--> Evaluate Transaction: ReadVote() returns the vote stored in the world state with given id")
	result, err := contract.EvaluateTransaction("ReadVote", "vote1")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
	fmt.Fprint(w, string(result))
}

func doVote(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: doVote")
	log.Println("--> Submit Transaction: DoVote() updates an existing vote in the world state with provided id and vote field")
	result, err := contract.SubmitTransaction("DoVote", "org1", "vote1", "yes")
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}
	log.Println(string(result))
	fmt.Fprint(w, string(result))
}

func handleRequests(contract *gateway.Contract) {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/read", readVote)
	http.HandleFunc("/create", createVote)
	http.HandleFunc("/do", doVote)
	log.Fatal(http.ListenAndServe(":10000", nil))
}

func main() {
	channelName := "mychannel"
	chaincodeName := "vote"
	walletName := "wallet"
	orgUserId := "appUser"

	// please give 'org1' or 'org2' as argument
	org := os.Args[1]
	var orgMSP string
	if org == "org1" {
		orgMSP = "Org1MSP"
	} else {
		orgMSP = "Org2MSP"
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

	handleRequests(contract)
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

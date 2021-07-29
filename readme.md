# This is the Hyperledger Fabric implementation of my Diploma Project

## To simulate the functionality of the App:
### First open a new fresh network and deploy the smart contracts
```sh
cd test-network
./refresh.sh
```

### Secondly, open 2 app servers simulating the apps running in 2 different organizations.
We will need 2 terminals.
In the first terminal:
```sh
cd app-server-go
go run appServer.go org1
```
In the second terminal
```sh
cd app-server-go
go run appServer.go org2
```

### Thirdly, send the organization data to the blockchain for each organization
We will need 2 terminals.
In the first terminal:
```sh
cd Design
python3 postEnergyData.py org1
```
In the second terminal:
```sh
cd Design
python3 postEnergyData.py org2
```

### Finally, we will open the UI for the 2 organizations
```sh
cd react-app
npm start
```
Now we can access the UI from localhost:3000

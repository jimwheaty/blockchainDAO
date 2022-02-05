# This is the Hyperledger Fabric implementation of my Diploma Project

## To simulate the functionality of the App:
### First open a new fresh network and deploy the smart contracts
```sh
cd test-network
./refresh.sh
```

### Secondly, open 4 app servers simulating the apps running in 4 different organizations.
We will need 4 terminals.
In the first terminal:
```sh
cd app-server-javascript && 
npm run start1
```
In the second terminal
```sh
cd app-server-javascript && 
npm run start2
```
In the third terminal
```sh
cd app-server-javascript && 
npm run start3
```
In the fourth terminal
```sh
cd app-server-javascript && 
npm run start4
```

### Thirdly, send the organization data to the blockchain for each organization (sequentially)
We will need 1 terminal.
```sh
cd simulation
```
For the first organization:
```sh
node postEnergyData.js 1
```
For the second organization:
```sh
node postEnergyData.js 2
```
For the third organization:
```sh
node postEnergyData.js 3
```
For the fourth organization:
```sh
node postEnergyData.js 4
```

### Finally, we will open the UI for the 4 organizations
We will need 4 terminals.
In the first terminal:
```sh
cd react-app &&
npm run start1
```
In the second terminal:
```sh
cd react-app &&
npm run start2
```
In the third terminal:
```sh
cd react-app &&
npm run start3
```
In the fourth terminal:
```sh
cd react-app &&
npm run start4
```
Now we can access the UI from localhost:3000, localhost:3001, localhost:3004 and localhost:3003 respectively

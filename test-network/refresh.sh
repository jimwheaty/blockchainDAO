#!/bin/bash

clear
export COMPOSE_PROJECT_NAME="docker"
./network.sh down
./network.sh up createChannel
./network.sh deployCC -ccn energyDAO -ccp ../chaincode-energyDAO -ccl javascript

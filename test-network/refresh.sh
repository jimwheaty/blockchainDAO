#!/bin/bash

export COMPOSE_PROJECT_NAME="docker"
./network.sh down
./network.sh up createChannel -ca
./deploy_chaincode.sh vote
./deploy_chaincode.sh energyData

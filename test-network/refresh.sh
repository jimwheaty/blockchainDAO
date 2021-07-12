#!/bin/bash

./network.sh down
./network.sh up createChannel -ca
source export_enviromental_variables.sh
./deploy_chaincode.sh

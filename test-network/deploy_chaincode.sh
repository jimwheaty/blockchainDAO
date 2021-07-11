#!/bin/bash
CC_NAME=${1:-"vote"}
./network.sh deployCC -ccn ${CC_NAME} -ccp ../chaincode-vote -ccl go


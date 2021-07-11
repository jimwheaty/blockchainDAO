#!/bin/bash
CC_NAME=${1:-"vote"}
CC_VERSION=${2}
./network.sh deployCC -ccn ${CC_NAME} -ccv ${CC_VERSION} -ccp ../chaincode-vote -ccl go


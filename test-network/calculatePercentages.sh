#!/bin/bash
source scripts/utils.sh

CC_NAME=${1:-"vote"}

println "executing with the following"
println "- CHAINCODE_NAME: ${CC_NAME}"

peer chaincode query -C mychannel -n ${CC_NAME} -c '{"Args":["CalculatePercentages"]}'


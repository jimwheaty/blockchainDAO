#!/bin/bash
source scripts/utils.sh

CC_NAME=${1:-"vote"}
ID=${2:-"vote1"}

println "executing with the following"
println "- CHAINCODE_NAME: ${CC_NAME}"
println "- VOTE_ID: ${ID}"

peer chaincode query -C mychannel -n ${CC_NAME} -c '{"Args":["ReadVote","'${ID}'"]}'


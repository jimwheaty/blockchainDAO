#!/bin/bash

source scripts/utils.sh

CC_NAME=${1:-"vote"}
ORG=${2:-"org1"}
ID=${3:-"vote1"}
VOTE=${4:-"yes"}

println "executing with the following"
println "- CHAINCODE_NAME: ${CC_NAME}"
println "- ORGANIZATION_NAME: ${ORG}"
println "- VOTE_ID: ${ID}"
println "- VOTE: ${VOTE}"

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n ${CC_NAME} --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"DoVote","Args":["'${ORG}'","'${ID}'", "'${VOTE}'"]}'


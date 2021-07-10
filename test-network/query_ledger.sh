#!/bin/bash
peer chaincode query -C mychannel -n vote -c '{"Args":["ReadVote","vote1"]}'


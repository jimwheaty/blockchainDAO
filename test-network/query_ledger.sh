#!/bin/bash
peer chaincode query -C mychannel -n basic -c '{"Args":["ReadAsset","asset6"]}'


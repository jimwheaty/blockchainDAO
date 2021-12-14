CC_SEQUENCE=${1:-"1"}
CC_VERSION=0.$CC_SEQUENCE

./network.sh deployCC -ccn energyDAO -ccp ../chaincode-energyDAO -ccl javascript -ccv $CC_VERSION -ccs $CC_SEQUENCE

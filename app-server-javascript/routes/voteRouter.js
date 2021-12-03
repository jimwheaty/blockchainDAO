const express = require('express')
const router = express.Router()

const { handler, contracts } = require('../app')

router.get('/init', (req,res) => {
    console.log('Endpoint GET /vote/init was hit!');
    handler(res, contracts.vote.submitTransaction, 'InitVote')
})

router.get('/', (req,res) => {
    console.log('Endpoint GET /vote was hit!');
    handler(res, contracts.vote.evaluateTransaction, 'ReadVote')
})

router.post('/:proposal', (req,res) => {
    console.log('Endpoint POST /vote was hit!');
    let proposal = req.params['proposal']
    handler(res, contracts.vote.submitTransaction, 'DoVote', proposal)
})

module.exports = router;
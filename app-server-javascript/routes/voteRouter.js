const express = require('express')
const router = express.Router()

const app = require('../app')

router.get('/init', (req,res) => {
    console.log('Endpoint GET /vote/init was hit!');
    app.handler(res, app.contracts.vote.submitTransaction, 'InitVote')
})

router.get('/', (req,res) => {
    console.log('Endpoint GET /vote was hit!');
    app.handler(res, app.contracts.vote.evaluateTransaction, 'ReadVote')
})

router.post('/:proposal', (req,res) => {
    console.log('Endpoint POST /vote was hit!');
    let proposal = req.params['proposal']
    app.handler(res, app.contracts.vote.submitTransaction, 'DoVote', proposal)
})

module.exports = router;
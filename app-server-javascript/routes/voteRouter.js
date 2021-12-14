const express = require('express')
const router = express.Router()

const app = require('../app')

router.get('/init', (req,res) => {
    console.log('Endpoint GET /vote/init was hit!');
    app.handler(res, 'submitTransaction', 'InitVote')
})

router.get('/', (req,res) => {
    console.log('Endpoint GET /vote was hit!');
    app.handler(res, 'evaluateTransaction', 'ReadVote')
})

router.get('/:proposal', (req,res) => {
    console.log('Endpoint GET /vote/:proposal was hit!');
    let proposal = req.params['proposal']
    app.handler(res, 'submitTransaction', 'DoVote', proposal)
})

module.exports = router;

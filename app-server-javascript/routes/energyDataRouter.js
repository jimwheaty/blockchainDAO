const express = require('express')
const router = express.Router()

const { handler, contracts } = require('../app')

router.get('/:month/:year', (req,res) => {
    console.log('Endpoint GET /energyData was hit!');
    let month = req.params['month']
    let year = req.params['year']
    handler(res, contracts.energyData.evaluateTransaction, 'GetMonthlyData', month, year)
})

router.post('/', (req,res) => {
    console.log('Endpoint POST /energyData was hit!');
    handler(res, contracts.energyData.submitTransaction, 'PostData', JSON.stringify(req.body))
})

router.get('/percentage', (req,res) => {
    console.log('Endpoint GET /energyData/percentage was hit!');
    handler(res, contracts.energyData.evaluateTransaction, 'GetPercentage')
})

module.exports = router;
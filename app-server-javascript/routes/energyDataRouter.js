const express = require('express')
const router = express.Router()

const app = require('../app')

router.get('/:month/:year', (req,res) => {
    console.log('Endpoint GET /energyData was hit!');
    let month = req.params['month']
    let year = req.params['year']
    app.handler(res, 'energyData', 'evaluateTransaction', 'GetMonthlyData', month, year)
})

router.post('/', (req,res) => {
    console.log('Endpoint POST /energyData was hit!');
    app.handler(res, 'energyData', 'submitTransaction', 'PostData', JSON.stringify(req.body))
})

router.get('/percentage', (req,res) => {
    console.log('Endpoint GET /energyData/percentage was hit!');
    app.handler(res, 'energyData', 'evaluateTransaction', 'GetPercentage')
})

module.exports = router;

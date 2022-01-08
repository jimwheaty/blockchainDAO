const express = require('express')
const router = express.Router()

const app = require('../app')

router.get('/:month/:year', (req,res) => {
    console.log('Endpoint GET /energyData was hit!');
    let month = req.params['month']
    let year = req.params['year']
    app.handler(res, 'evaluateTransaction', 'GetMonthlyData', month, year)
})

router.post('/declaration', (req,res) => {
    console.log('Endpoint POST /energyData/declaration was hit!');
    app.handler(res, 'submitTransaction', 'PostDeclaration', JSON.stringify(req.body))
})

router.post('/production', (req,res) => {
    console.log('Endpoint POST /energyData/production was hit!');
    app.handler(res, 'submitTransaction', 'PostProduction', JSON.stringify(req.body))
})

router.get('/percentage', (req,res) => {
    console.log('Endpoint GET /energyData/percentage was hit!');
    app.handler(res, 'evaluateTransaction', 'GetPercentage')
})

module.exports = router;

fs = require('fs')
fetch = require('node-fetch')
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
async function postEnergyData(orgNum) {
    let url = `http://localhost:1000${orgNum}/energyData`

    let fileName = 'diploma.energy.data.org' + orgNum + '.csv'
    fs.readFile(fileName, 'utf8', async (err,data) => {
        if (err)  
            return console.log(err)
        let lines = data.split('\n')
        lines = lines.slice(3)
        for (let day=1; day<=31; day++){
            await postEnergyDataPerDay(url, lines.slice(96*(day-1), 96*day), 'declaration')
	        await sleep(2000)
        }
        for (let day=1; day<=31; day++){
            await postEnergyDataPerDay(url, lines.slice(96*(day-1), 96*day), 'production')
	        await sleep(2000)
        }
    })
}

async function postEnergyDataPerDay(url, lines, type) {
    lines.forEach(async line => {
        let [timestamp, declaration, production] = line.split('\n')[0].split(', ')
        
        let body = {}
        body.timestamp = timestamp.toString()
        if (type == 'declaration')
            body.declaration = declaration.toString()
        else if (type == 'production')
            body.production = production.toString()
        else console.log('Please give a type')

        // DECLARATION
        let requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
	    }
        let response = await fetch(url+'/'+type, requestOptions)
        if (!response.ok) {
            console.log('Fetch Error :-S', err);
            return
        }
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' + response.status)
            return
        }
        let data = await response.json()
        console.log(data)
    })
}

async function main() {
    let args = process.argv.slice(2)
    let orgNum = args[0]
    if (orgNum != 1 && orgNum != 2 && orgNum != 3 && orgNum != 4)
	throw Error('please give 1 or 2 or 3 or 4 as argument...')
    await postEnergyData(orgNum)
}
main()

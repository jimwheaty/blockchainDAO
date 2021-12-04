fs = require('fs')
fetch = require('node-fetch')

sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let url = ''
async function postEnergyData(orgNum) {
    url = `http://localhost:1000${orgNum}/energyData`

    let fileName = 'diploma.energy.data.org' + orgNum + '.csv'
    fs.readFile(fileName, 'utf8', async (err,data) => {
        if (err)  
            return console.log(err)
        let lines = data.split('\n')
        lines = lines.slice(3)
        // Sleep half a second for every day
        // Otherwise the blockchain would block us as a malicious user
        for (let day=1; day<=31; day++){
            await postEnergyDataPerDay(lines.slice(96*(day-1), 96*day))
            await sleep(1000)
        }
    })
}

async function postEnergyDataPerDay(lines) {
    lines.forEach(line => {
        let [timestamp, energy] = line.split('\n')[0].split(', ')
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "timestamp": timestamp.toString(),
                "energy" : energy.toString()
            })
        }
        fetch(url, requestOptions)
        .then(
            (response) => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status)
                    return
                }

                // Examine the text in the response
                response.json().then((data) => {
                    console.log(data);
                });
            }
        )
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        })
    })
}

async function main() {
    await postEnergyData('1')
    await postEnergyData('2')
    await postEnergyData('3')
    await postEnergyData('4')
}
main()
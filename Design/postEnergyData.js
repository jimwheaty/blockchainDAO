fs = require('fs')
fetch = require('node-fetch')

let args = []

postEnergyData = () => {
    let orgName = args[0]
    let url = ''
    if (orgName == 'org1') 
        url = 'http://localhost:10000/postEnergyData'
    else
        url = 'http://localhost:10001/postEnergyData'
    
    let fileName = 'diploma.energy.data.' + orgName + '.csv'
    fs.readFile(fileName, 'utf8', (err,data) => {
        if (err)  
            return console.log(err)
        let lines = data.split('\n')
        lines = lines.slice(3)
        let day = 0
        lines.forEach(line => {
            // sleep 1 second for every day. Otherwise the blockchain would block
            // us as a malicious user
            day += 1
            if (day & 96 == 0) // 96 is the daily data count
                new Promise(resolve => setTimeout(resolve, 1000)) 

            let [timestamp, energy] = line.split('\n')[0].split(', ')

            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "timestamp": timestamp.toString(),
                    "energy" : energy.toString()
                })
            };
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
            });
        })
    })
}

args = process.argv.slice(2)
if (args.length != 1)
    console.log("Error: please give organization name as argument")
else if (args[0] == 'org1' || args[0] == 'org2')
    postEnergyData()
else
    console.log("Error: please give 'org1' or 'org2'")


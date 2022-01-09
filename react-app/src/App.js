/* eslint eqeqeq: "off" */

import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {Button, Container, Row, Col, Nav, Navbar, Card} from "react-bootstrap"
import {VictoryAxis, VictoryLine, VictoryChart, VictoryTheme, VictoryLegend} from "victory";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            org: "",
            url: "",
            voteMessage: "",
            voteCounter: "",
            declarationDataDay: [],
            productionDataDay: [],
            declarationDataMonth: [],
            productionDataMonth: [],
            declarationPercentage: "0",
            productionPercentage: "0",
            dayItems: [],
            selectedDate: new Date(),
            selectedDay: '',
            selectedMonth: '', 
            selectedYear: ''
        }
    }

    componentDidMount() {
	let org = process.env.REACT_APP_ORG
        let url = `http://localhost:${process.env.REACT_APP_PORT}`
        this.setState({ org, url })

	    this.setDate(this.state.selectedDate)
    }

    readVote() {
	    fetch(this.state.url+"/vote")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        voteMessage: result.Message,
                        voteCounter: JSON.stringify(result.Counter, null, 4)
                    })
		    if (result.IsFinished){
                        fetch(this.state.url+"/energyData/percentage")
                        .then(res => res.json())
                        .then(
                            (result) => {
                            this.setState({
                                declarationPercentage: result.declaration,
                                productionPercentage: result.production
                            })
                        })
                    }
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    createVote() {
        fetch(this.state.url+"/vote/init")
            .then(res => res.json())
            .then(
                (result) => {
                    this.readVote()
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    doVote(proposal) {
        fetch(this.state.url + '/vote/' + proposal) //http:localhost:3000/vote/yes
            .then(res => res.json())
            .then(
                (result) => {
                    this.readVote()
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    setDate(selectedDate) {
        var selectedDay = String(selectedDate.getDate()).padStart(2, '0');
        let selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
            let selectedYear = selectedDate.getFullYear();
        this.setState({ selectedDate, selectedDay, selectedMonth, selectedYear })
    }

    getEnergyData() {
        let { selectedMonth, selectedYear } = this.state;
        fetch(`${this.state.url}/energyData/${selectedMonth}/${selectedYear}`)
            .then(res => res.json())
            .then(
                (dataItems) => {
                    console.log("dataItems=",dataItems)
                    let declarationDataDay = []
                    let productionDataDay = []
                    let declarationDaySum = 0
                    let productionDaySum = 0
                    let declarationDataMonth = []
                    let productionDataMonth = []
                    Object.values(dataItems).forEach(item => {
                        let day = item.timestamp[6]+item.timestamp[7]
                        let time = item.timestamp[8]+item.timestamp[9]+':'+item.timestamp[10]+item.timestamp[11]
                        let declaration = parseInt(item.declaration)
                        let production = parseInt(item.production)
                        if (day == this.state.selectedDay) {
                            declarationDataDay.push({x: time, y: declaration})
                            productionDataDay.push({x: time, y: production})
                        }
                        declarationDaySum += declaration
                        productionDaySum += production
                        if (time == "23:45"){
                            declarationDataMonth.push({x: day, y: declarationDaySum/4})
                            productionDataMonth.push({x: day, y: productionDaySum/4})
                            declarationDaySum = 0
                            productionDaySum = 0
                        }
                    })
                    this.setState({ 
                        declarationDataDay, productionDataDay, declarationDataMonth, productionDataMonth 
                    });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

	render(){
        const {error, org, url, voteMessage, voteCounter, declarationDataDay, productionDataDay, declarationDataMonth, productionDataMonth, declarationPercentage, productionPercentage, selectedDay, selectedDate, selectedMonth, selectedYear } = this.state;
        if (error) {
            return <h1>org: {org}, url: {url}, Error: {error.message}</h1>;
        } else {
            return (
                <Container>
                    <Navbar bg="dark" expand="lg" variant="dark" className="justify-content-between">
                        <Nav>
                            <Navbar.Text>Signed in as: {org} user1, url={url}</Navbar.Text>
                        </Nav>
                        <Navbar.Text> Declaration: {declarationPercentage}%, Production: {productionPercentage}% </Navbar.Text>
                    </Navbar>
                    <br/>
                    <Card>
                        <Card.Header>
                            <h3>Vote for recalculation of percentages</h3>
                        </Card.Header>
                        <Card.Body>
                            <p style={{"white-space": "pre-wrap"}}>{voteMessage}</p>
                            <pre><code>{voteCounter}</code></pre>
                        </Card.Body>
                        <Card.Footer>
                            <Button onClick={() => this.createVote()} style={{marginRight:10}}>
                                Initialize
                            </Button>
                            <Button onClick={() => this.doVote('yes')} style={{marginRight:10}}> 
                                vote YES
                            </Button>
                            <Button onClick={() => this.doVote('no')} style={{marginRight:10}}> 
                                vote NO
                            </Button>
                            <Button onClick={() => this.readVote()} style={{marginRight:10}}>
                                Refresh
                            </Button>
                        </Card.Footer>
                    </Card>
                    <br/>
                    <Card>
                        <Card.Header>
                            <h3>My Energy Data</h3>
                        </Card.Header>
                        <Card.Body>
                            <h4>Please select a Date:</h4>
                            <DatePicker selected={selectedDate} onChange={(date) => this.setDate(date)} />
                            <br/><br/>
                            <Row>
                                <Col sm>
                                    <Card>
                                        <Card.Header>
                                            THIS DAY <br/>
                                            Day: {selectedDay}, Month: {selectedMonth}, Year: {selectedYear}
                                        </Card.Header>
                                        <Card.Body>
                                            <VictoryChart
                                                theme={VictoryTheme.material}
                                            >
                                                <VictoryLegend x={80}
                                                    orientation="horizontal"
                                                    gutter={20}
                                                    style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                                                    data={[
                                                        { name: "Declaration", symbol: { fill: "red" } },
                                                        { name: "Production", symbol: { fill: "blue" } }
                                                    ]}
                                                />
                                                <VictoryAxis crossAxis
                                                                domain={[0, 96]}
                                                                label="time"
                                                                style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                                                />
                                                <VictoryAxis dependentAxis crossAxis
                                                                label="Energy (MWh)"
                                                                style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                                                />
                                                <VictoryLine
                                                    style={{
                                                        data: { stroke: "red" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={declarationDataDay}
                                                />
                                                <VictoryLine
                                                    style={{
                                                        data: { stroke: "blue" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={productionDataDay}
                                                />
                                            </VictoryChart>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col sm>
                                    <Card>
                                        <Card.Header>
                                            THIS MONTH <br/>
                                            Month: {selectedMonth}, Year: {selectedYear}
                                        </Card.Header>
                                        <Card.Body>
                                            <VictoryChart
                                                theme={VictoryTheme.material}
                                            >
                                                <VictoryAxis crossAxis
                                                                domain={[0, 31]}
                                                                label="day"
                                                                style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                                                />
                                                <VictoryAxis dependentAxis crossAxis
                                                                label="Average Energy (MWh)"
                                                                style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                                                />
                                                <VictoryLine
                                                    style={{
                                                        data: { stroke: "red" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={declarationDataMonth}
                                                />
                                                <VictoryLine
                                                    style={{
                                                        data: { stroke: "blue" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={productionDataMonth}
                                                />
                                            </VictoryChart>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer>
                            <Button onClick={() => this.getEnergyData()}>
                                GET
                            </Button>
                        </Card.Footer>
                    </Card> 
                    <br/><br/>
                </Container>
            );
        }
	}
}
export default App;

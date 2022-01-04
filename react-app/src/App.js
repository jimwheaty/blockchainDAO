/* eslint eqeqeq: "off" */

import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {Button, Container, Row, Col, Nav, Navbar, Card} from "react-bootstrap"
import {VictoryAxis, VictoryLine, VictoryChart, VictoryTheme} from "victory";
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
            energyDataDay: [],
            energyDataMonth: [],
            prodPercentage: "0",
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
                        voteCounter: JSON.stringify(result.Counter)
                    })
		    if (result.IsFinished){
                        fetch(this.state.url+"/energyData/percentage")
                        .then(res => res.json())
                        .then(
                            (result) => {
                            this.setState({
                                prodPercentage: result
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
                    // let dataItems = JSON.parse(result)
                    // console.log('dataItems'+dataItems)
                    let energyDataDay = []
                    let daySum = 0
                    let energyDataMonth = []
                    Object.values(dataItems).forEach(item => {
                        let day = item.timestamp[6]+item.timestamp[7]
                        let time = item.timestamp[8]+item.timestamp[9]+':'+item.timestamp[10]+item.timestamp[11]
                        let energy = parseInt(item.energy)
                        if (day == this.state.selectedDay)
                            energyDataDay.push({x: time, y: energy})
                        daySum += energy
                        if (time == "23:45"){
                            energyDataMonth.push({x: day, y: daySum/4})
                            daySum = 0
                        }
                    })
                    this.setState({
                        energyDataDay: energyDataDay,
                        energyDataMonth: energyDataMonth,
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
        const {error, org, url, voteMessage, voteCounter, energyDataDay, energyDataMonth, prodPercentage, selectedDay, selectedDate, selectedMonth, selectedYear } = this.state;
        if (error) {
            return <h1>org: {org}, url: {url}, Error: {error.message}</h1>;
        } else {
            return (
                <Container>
                    <Navbar bg="dark" expand="lg" variant="dark" className="justify-content-between">
                        <Nav>
                            <Navbar.Text>Signed in as: {org} user1, url={url}</Navbar.Text>
                        </Nav>
                        <Navbar.Text> My production Percentage: {prodPercentage}% </Navbar.Text>
                    </Navbar>
                    <br/>
                    <Container>
                        <Button onClick={() => this.createVote()} style={{marginRight:10}}>
                            Initialise vote for percentages.
                        </Button>
                        <Button onClick={() => this.getEnergyData()}>
                            fetch my energy data
                        </Button>
                    </Container>
                    <br/>
                    <Row>
                        <Col sm={2}>
                            <Card>
                                <Card.Header>
                                    Vote for recalculation of percentages
                                </Card.Header>
                                <Card.Body>
                                    {voteMessage}
                                    {voteCounter}
                                </Card.Body>
                                <Card.Footer>
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
                        </Col>
                        <Col sm={10}>
                            Please select a Date:
                            <DatePicker selected={selectedDate} onChange={(date) => this.setDate(date)} />
                            <br/><br/>
                            <Row>
                                <Col>
                                    <Card>
                                        <Card.Header>
                                            THIS DAY <br/>
                                            Day: {selectedDay}, Month: {selectedMonth}, Year: {selectedYear}
                                        </Card.Header>
                                        <Card.Body>
                                            <VictoryChart
                                                theme={VictoryTheme.material}
                                            >
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
                                                        data: { stroke: "#c43a31" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={energyDataDay}
                                                />
                                            </VictoryChart>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
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
                                                        data: { stroke: "#c43a31" },
                                                        parent: { border: "1px solid #ccc"}
                                                    }}
                                                    data={energyDataMonth}
                                                />
                                            </VictoryChart>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            );
        }
	}
}
export default App;

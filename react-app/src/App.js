import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {Button, Container, Form, Row, Col, Nav, Navbar, Card} from "react-bootstrap"
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
        let url = `http://172.20.78.79:${process.env.REACT_APP_PORT}`
        this.setState({ org, url })

	this.setDate(this.state.selectedDate)
    }

    readVote() {
        fetch(this.state.url+"/vote")
            .then(res => res.json())
            .then(
                (result) => {
		    let vote = JSON.parse(result.success)
		    console.log(result)
                    this.setState({
                        voteMessage: vote.Message
                    })
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
                    alert(result.Message)
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
                    alert(result.message)
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

    getEnergyData(month, year) {
        fetch(`${this.state.url}/energyData/${month}/${year}`)
            .then(res => res.json())
            .then(
                (result) => {
		    console.log(result)
		    let dataArray = JSON.parse(result.success)
		    console.log('dataArray'+dataArray)
                    let energyDataDay = []
                    let daySum = 0
                    let energyDataMonth = []
                    dataArray.map(item => {
                        let day = item.timestamp[11]+item.timestamp[12]
                        let time = item.timestamp[13]+item.timestamp[14]+':'+item.timestamp[15]+item.timestamp[16]
                        let energy = parseInt(item.Energy)
                        if (day == this.state.selectedDay)
                            energyDataDay.push({x: time, y: energy})
                        daySum += energy
                        if (time == "23:45"){
                            energyDataMonth.push({x: day, y: daySum/4})
                            daySum = 0
                        }
                    })
		    console.log('energyDataDay'+energyDataDay)
		    console.log('energyDataMonth'+energyDataMonth)
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
        const {error, org, url, voteMessage, energyDataDay, energyDataMonth, prodPercentage, selectedDay, selectedDate, selectedMonth, selectedYear } = this.state;
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
                        <Col sm={5}>
                            <Card>
		    		Please select a Date:
		    		<DatePicker selected={selectedDate} onChange={(date) => this.setDate(date)} />
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
                                                        label="Energy Power (MW)"
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
                        <Col sm={5}>
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
                                                        label="Average Energy Power (MW)"
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
                </Container>
            );
        }
	}
}
export default App;

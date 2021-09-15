/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {Button, Container, Form, Row, Col, Nav, Navbar, Card} from "react-bootstrap"
import {VictoryAxis, VictoryLine, VictoryChart, VictoryTheme} from "victory";

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            voteID: "", 
            voteMessage: "",
            org: "",
            validOrg: false,
            url: "",
            energyDataDay: [],
            energyDataMonth: [],
            prodPercentage: ""
        }
    }

    readVote() {
        fetch(this.state.url+"/read")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        voteID: result.id,
                        voteMessage: result.message
                    })
                },
                (error) => {
                    alert(error)
                    this.setState({
                        error
                    });
                }
            )
    }

    createVote() {
        fetch(this.state.url+"/create")
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

    doVote() {
        fetch(this.state.url+"/do")
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

    getEnergyData() {
        fetch(this.state.url+"/getEnergyData")
            .then(res => res.json())
            .then(
                (result) => {
                    // questionStats.map(item => questionData.push({x: parseInt(item.day), y: parseInt(item.count)}));
                    let energyDataDay = []
                    let daySum = 0
                    let energyDataMonth = []
                    result.map(item => {
                        let day = item.ID[11]+item.ID[12]
                        let time = item.ID[13]+item.ID[14]+':'+item.ID[15]+item.ID[16]
                        let energy = parseInt(item.Energy)
                        if (day == "01"){
                            energyDataDay.push({x: time, y: energy})
                        }
                        daySum += energy
                        if (time == "23:45"){
                            energyDataMonth.push({x: day, y: daySum/96})
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

    handleOrgSubmit = (e) => {
        let org = this.state.org
        let url = ""
        if (org == "org1") {
            url = "http://localhost:10000"
            this.setState({org: org, url: url, validOrg: true}, () => {this.initPercentage()})
        }
        else if (org == "org2") {
            url = "http://localhost:10001"
            this.setState({org: org, url: url, validOrg: true}, () => {this.initPercentage()})
        }
    }

    handleOrgChange = (e) => {this.setState({org: e.target.value})}

    initPercentage(){
        fetch(this.state.url+"/initPercentage")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({prodPercentage: result.Percentage})
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )

    }

	render(){
        const {error, org, validOrg, url, voteID, voteMessage, energyDataDay, energyDataMonth, prodPercentage} = this.state;
        if (error) {
            return <h1>org: {org}, url: {url}, Error: {error.message}</h1>;
        } else if (!validOrg)
            return (
                <Row className="justify-content-md-center">
                    <Col sm={8}>
                        <Form>
                            <Form.Group>
                                <Form.Label>Your Organization</Form.Label>
                                <Form.Control type="text" placeholder="Enter 'org1' or 'org2'" onChange={(event) => this.handleOrgChange(event)}/>
                            </Form.Group>
                            <Button onClick={() => this.handleOrgSubmit()} >
                                Submit
                            </Button>
                        </Form>
                    </Col>
                </Row>
            )
        else {
            return (
                <Container>
                    <Navbar bg="dark" expand="lg" variant="dark" className="justify-content-between">
                        <Nav>
                            <Navbar.Text>Signed in as: {org} user1, url={url}</Navbar.Text>
                        </Nav>
                        <Navbar.Text> My production Percentage: {prodPercentage} </Navbar.Text>
                    </Navbar>
                    <br/>
                    <Container>
                        <Button onClick={() => this.createVote()} style={{marginRight:10}}>
                            Create Vote1
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
                                    {voteID}
                                </Card.Header>
                                <Card.Body>
                                    {voteMessage}
                                </Card.Body>
                                <Card.Footer>
                                    <Button onClick={() => this.doVote()} style={{marginRight:10}}> 
                                        Vote yes
                                    </Button>
                                    <Button onClick={() => this.readVote()} style={{marginRight:10}}>
                                        Refresh
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                        <Col sm={5}>
                            <Card>
                                <Card.Header>
                                    TODAY <br/>
                                    Day: 01, Month: January, Year: 2021
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
                                    Month: January, Year: 2021
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

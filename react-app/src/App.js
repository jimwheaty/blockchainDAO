/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {Button, Container, Form, Row, Col, Nav, Navbar} from "react-bootstrap"

class App extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            message: "",
            org: "",
            validOrg: false,
            url: ""
        }
    }

    readVote() {
        fetch(this.state.url+"/read")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        message: JSON.stringify(result)
                    });
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
                    this.setState({
                        message: result.message
                    });
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
                    this.setState({
                        message: result.message
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
            this.setState({org: org, url: url, validOrg: true})
        }
        else if (org == "org2") {
            url = "http://localhost:10001"
            this.setState({org: org, url: url, validOrg: true})
        }
    }

    handleOrgChange = (e) => {this.setState({org: e.target.value})}

	render(){
        const {error, message, org, validOrg, url} = this.state;
        if (error) {
            return <h1>org: {org}, url: {url}, Error: {error.message}</h1>;
        } else if (!validOrg)
            return (
                <Row className="justify-content-md-center">
                    <Col sm={8}>
                        <Form>
                            <Form.Group>
                                <Form.Label>Your organization</Form.Label>
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
                    </Navbar>
                    <h2>{message}</h2>
                    <Button onClick={() => this.readVote()} style={{marginRight:10}}>
                        Read Vote1
                    </Button>
                    <Button onClick={() => this.createVote()} style={{marginRight:10}}>
                        Create Vote1
                    </Button>
                    <Button onClick={() => this.doVote()}>
                        Vote yes in vote1
                    </Button>
                </Container>
            );
        }
	}
}
export default App;

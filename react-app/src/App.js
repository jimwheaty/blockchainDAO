/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */


import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
// import {Button, Container}from "react-bootstrap

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

	homepage() {
		fetch(this.state.url)
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
                <form>
                    <label>
                        Name:
                        <input type="text" name="org" onChange={(event) => this.handleOrgChange(event)} />
                    </label>
                    <input type="submit" value="Submit" onClick={() => this.handleOrgSubmit()} />
                </form>
            )
        else {
            return (
                <div>
                    {/* {this.homepage()} */}
                    <h1>logged in as {org} user1, url={url}</h1> 
                    <h2>{message}</h2>
                    <button onClick={() => this.readVote()}>
                        Read Vote1
                    </button>
                    <button onClick={() => this.createVote()}>
                        Create Vote1
                    </button>
                    <button onClick={() => this.doVote()}>
                        Vote yes in vote1
                    </button>
                </div>
            );
        }
	}
}
export default App;

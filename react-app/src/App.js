/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

class App extends React.Component{
	componentDidMount() {
		fetch("localhost:10000/")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        questionItem: result
                    });
                    const { questionItem } = this.state;
                    return questionItem.answers.map(answer => (
                        fetch(backend_url + "/api/users/" + answer.userId)
                            .then(res => res.json())
                            .then(
                                (result) => {
                                    answer.userName = result.username;
                                    this.setState({
                                        questionItem : questionItem
                                    })
                                },
                                (error) => {
                                    this.setState({
                                        error
                                    });
                                }
                            )
                    ))
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                })
	}
	render(){
        return (
			<h1>My blockchain app</h1>
		);
	}
}
export default App;

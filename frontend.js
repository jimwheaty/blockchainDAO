import {SmartContract} from "./smartContract"
let smartContract = SmartContract;

export class frontend {
    constructor() {
        this.voteField = "yes"
    }

    handleChange = (value) => this.voteField = value;

    render() {
        let state = smartContract.getState()
        if (state.isFinished)
            return (
                <div>
                    state.message
                    <button id='createVote' onClick={() => smartContract.createVote()}>Create Vote</button>
                </div>
            )
        else 
            return (
                <div>
                    state.message
                    <Form.Control id='voteField' onChange={(event) => this.handleChange(event.target.value)}>
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                    </Form.Control>
                    <button id='voteBtn' onClick={() => smartContract.doVote(this.voteField)}>vote</button>
                </div>
            )
    }
}
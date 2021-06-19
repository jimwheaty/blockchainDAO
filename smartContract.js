export class SmartContract {
	constructor() {
		this.state = {
			message: "",
			counter = {
				yes: 0,
				no: 0,
				undefined: 3
			},
			board: {
				address1: undefined, 
				address2: undefined, 
				address3: undefined
			}, 
			isFinished: False
		}
	}

	getState() {
		return this.state;
	}

	doVote(vote) {
		if (vote.field == 'yes' || vote.field == 'no') {
			let {message, counter, board, isFinished} = this.state
			counter[board[vote.address]] -= 1;
		
			board[vote.address] = vote.field;
			
			counter[board[vote.address]] += 1

			if (counter.yes > (counter.no + counter.undefined)){
				message = "The vote is done. The result is Yes"
				isFinished = True
			}
			else if (counter.no > (counter.yes + counter.undefined)){
				message = "The vote is done. The result is No"
				isFinished = True
			}
			else message = "The vote is still going... No result yet."

			this.state = {
				message: message,
				counter: counter,
				board: board,
				isFinished: isFinished
			}
		}
	}
	
	createVote = () => this.constructor();
}
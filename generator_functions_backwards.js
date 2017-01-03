/* MIT licence, (c) 2014-2015 coredump Rapperswil, Jannis Grimm */

(function(exports) {

	/**
	 * If the token is allowed here
	 *
	 * @param {string} token - The token
	 * @param {boolean} hadPart2 - If the token 'PART2' was used in the headline
	 * @returns {boolean} The answer
	 */
	function tokenIsAllowed(token, hadPart2) {
		if (hadPart2 && token == 'PART2') {
			return false;
		}
		if (!hadPart2 && token == 'SOF') {
			return false;
		}
		return true;
	}

	/**
	 * Returns the list of possible following tokens
	 *
	 * @param {Array} currentPredecessors - The list of tokens to put in the list (index 1: list with tokens following two tokens, index 2: ... three, index 3: ... four)
	 * @return {Array} The list
	 */
	function getPredecessorCollection(currentPredecessors) {
		var collection = [];
		currentPredecessors.forEach(function(list) {
			var newPredecessors = [];
			var predecessorTokens = Object.getOwnPropertyNames(list);
			predecessorTokens.forEach(function(follower) {
				var repeat = list[follower];
				for (var i = 0; i < repeat; i++) {
					newPredecessors.push(follower);
				}
			});
			if (newPredecessors.length) {
				var ratio = collection.length / newPredecessors.length + 1;
				for (var i = 0; i < ratio; i++) {
					collection = collection.concat(newPredecessors);
				}
			}
		});
		return collection;
	}

	/**
	 * Creates a new headline and returns its tokens
	 *
	 * @todo refactor to smaller functions
	 *
	 * @param {Array} history - The list of already generated tokens
	 * @param {boolean} hadPart2 - If this list already had the token 'PART2'
	 * @param {Object} predecessors - The markov chain
	 * @returns {Array} List of tokens for this headline
	 */
	exports.getHeadlineTokens = function getHeadlineTokens(history, hadPart2, predecessors) {
		var lastToken = history[history.length - 1];
		if (lastToken == 'SOF') {
			return history;
		}

		var currentPredecessors = [];
		if (history.length === 1) {
			currentPredecessors[0] = predecessors[lastToken] || {};
		}
		if (lastToken != 'PART2' || history.length < 3) {
			var doubleToken = lastToken + ' ' + history[history.length - 2];
			currentPredecessors[1] = predecessors[doubleToken] || {};
		}
		var trippleToken = lastToken + ' ' + history[history.length - 2] + ' ' + history[history.length - 3];
		currentPredecessors[2] = predecessors[trippleToken] || {};
		var quadrupleToken = lastToken + ' ' + history[history.length - 2] + ' ' + history[history.length - 3] + ' ' + history[history.length - 4];
		currentPredecessors[3] = predecessors[quadrupleToken] || {};

		var randomizer = getPredecessorCollection(currentPredecessors);

		while (true) {
			if (!randomizer.length) {
				return history;
			}
			var nextIndex = Math.floor(randomizer.length * Math.random());
			var token = randomizer.splice(nextIndex, 1)[0];
			if (tokenIsAllowed(token, hadPart2)) {
				history.push(token);
				if (token == 'SOF') {
					return history;
				}
				var nextHadPart2 = hadPart2 || token == 'PART2';
				var nextHistory = getHeadlineTokens(history, nextHadPart2, predecessors);
				if (nextHistory[nextHistory.length - 1] == 'SOF') {
					return nextHistory;
				} else {
					history.pop();
					randomizer.filter(function(randomToken) {
						return randomToken !== token;
					});
				}
			}
		}
	};

	/**
	 * Counts the occurences of a string in another string
	 * @param {string} needle - The string to count
	 * @returns {number} The number of occurences
	 */
	String.prototype.countString = function(needle) {
		return (this.match(new RegExp(needle, 'g')) || []).length
	};

})(typeof exports === 'undefined' ? this.headlineGeneratorBackwards = {} : exports); // hack to work in the webbrowser and as a node.js module

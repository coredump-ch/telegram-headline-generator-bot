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
		if (!hadPart2 && token == 'EOF') {
			return false;
		}
		return true;
	}

	/**
	 * Returns the list of possible following tokens
	 *
	 * @param {Array} currentSuccessors - The list of tokens to put in the list (index 1: list with tokens following two tokens, index 2: ... three, index 3: ... four)
	 * @return {Array} The list
	 */
	function getSuccessorCollection(currentSuccessors) {
		var collection = [];
		currentSuccessors.forEach(function(list) {
			var newSuccessors = [];
			var successorTokens = Object.getOwnPropertyNames(list);
			successorTokens.forEach(function(follower) {
				var repeat = list[follower];
				for (var i = 0; i < repeat; i++) {
					newSuccessors.push(follower);
				}
			});
			if (newSuccessors.length) {
				var ratio = collection.length / newSuccessors.length + 1;
				for (var i = 0; i < ratio; i++) {
					collection = collection.concat(newSuccessors);
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
	 * @param {Object} successors - The successors markov chain
	 * @returns {Array} List of tokens for this headline
	 */
	function getHeadlineTokens(history, hadPart2, successors) {
		var lastToken = history[history.length - 1];
		if (lastToken == 'EOF') {
			return history;
		}

		var currentSuccessors = [];
		if (history.length === 1) {
			currentSuccessors[0] = successors[lastToken] || {};
		}
		if (lastToken != 'PART2' || history.length < 3) {
			var doubleToken = history[history.length - 2] + ' ' + lastToken;
			currentSuccessors[1] = successors[doubleToken] || {};
		}
		var trippleToken = history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentSuccessors[2] = successors[trippleToken] || {};
		var quadrupleToken = history[history.length - 4] + ' ' + history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentSuccessors[3] = successors[quadrupleToken] || {};

		var randomizer = getSuccessorCollection(currentSuccessors);

		while (true) {
			if (!randomizer.length) {
				return history;
			}
			var nextIndex = Math.floor(randomizer.length * Math.random());
			var token = randomizer.splice(nextIndex, 1)[0];
			if (tokenIsAllowed(token, hadPart2)) {
				history.push(token);
				if (token == 'EOF') {
					return history;
				}
				var nextHadPart2 = hadPart2 || token == 'PART2';
				var nextHistory = getHeadlineTokens(history, nextHadPart2, successors);
				if (nextHistory[nextHistory.length - 1] == 'EOF') {
					return nextHistory;
				} else {
					history.pop();
					randomizer.filter(function(randomToken) {
						return randomToken !== token;
					});
				}
			}
		}
	}

	/**
	 * Counts the occurences of a string in another string
	 * @param {string} needle - The string to count
	 * @returns {number} The number of occurences
	 */
	String.prototype.countString = function(needle) {
		return (this.match(new RegExp(needle, 'g')) || []).length
	};

	/**
	 * Fixes some character uses.
	 *
	 * No » without «, close « with ». Remove space after dashes.
	 * @param {string} headlinePart - The string to fix
	 * @returns {string} The fixed string
	 */
	function fixPart(headlinePart) {
		while (headlinePart.countString('»') > headlinePart.countString('«')) {
			var index = headlinePart.indexOf('»');
			headlinePart = headlinePart.slice(0, index) + headlinePart.slice(index + 1);
		}
		while (headlinePart.countString('«') > headlinePart.countString('»')) {
			headlinePart += '»';
		}
		headlinePart = headlinePart.replace(/- /g, '-');
		return headlinePart;
	}

	/**
	 * Returns a newly created headline
	 *
	 * @param {Object} successors - The successors markov chain
	 * @param {Array} headlines - The list of existing headlines
	 * @returns {Array} The headline. Index 0 is the first part, index 1 the main part.
	 */
	exports.getHeadline = function getHeadline(successors, headlines) {
		var attempts = 0;
		do {
			attempts++;
			var headlineTokens = getHeadlineTokens(['SOF'], false, successors);
			var headline = headlineTokens.slice(1, -1).join(' ');
			var part2Index = headline.indexOf('PART2');
			var headlinePart1 = fixPart(headline.slice(0, part2Index - 1));
			var headlinePart2 = fixPart(headline.slice(part2Index + 6));
		} while (attempts < 20 && headlines.some(function(headline) {
			return headline.indexOf(headlinePart2) != -1;
		}));
		if (headlines.some(function(headline) {
				return headline.indexOf(headlinePart2) != -1;
			})) {
			return ['', ''];
		}

		return [headlinePart1, headlinePart2];
	};

	/**
	 * Returns a newly created headline with a given word
	 *
	 * @param {string} word - The word to use in the headline
	 * @param {Object} successors - The successors markov chain
	 * @param {Object} predecessors - The predecessors markov chain
	 * @param {Array} headlines - The list of existing headlines
	 * @param {Object} headlineGeneratorBackwards - The object in generator_functions_backwards.js
	 * @returns {Array} The headline. Index 0 is the first part, index 1 the main part.
	 */
	exports.getHeadlineWithWord = function getHeadlineWithWord(word, successors, predecessors, headlines, headlineGeneratorBackwards) {
		var attempts = 0;
		var success = false;
		do {
			attempts++;
			var headlineTokensUntilWord = headlineGeneratorBackwards.getHeadlineTokens([word], attempts > 15, predecessors);
			var headlineTokens = getHeadlineTokens(headlineTokensUntilWord.slice().reverse(), attempts <= 15, successors);
			success = headlineTokens[headlineTokens.length - 1] === 'EOF';
      var headline = headlineTokens.slice(1, -1).join(' ');
			var part2Index = headline.indexOf('PART2');
			var headlinePart1 = fixPart(headline.slice(0, part2Index - 1));
			var headlinePart2 = fixPart(headline.slice(part2Index + 6));
		} while (attempts < 30 && (!success || headlines.some(function(headline) {
			return headline.indexOf(headlinePart2) != -1;
		})));
		if (!success || headlines.some(function(headline) {
				return headline.indexOf(headlinePart2) != -1;
			})) {
			return ['', ''];
		}

		return [headlinePart1, headlinePart2];
	}

})(typeof exports === 'undefined' ? this.headlineGenerator = {} : exports); // hack to work in the webbrowser and as a node.js module

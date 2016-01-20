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
	 * @param {array} currentFollowers - The list of tokens to put in the list (index 1: list with tokens following two tokens, index 2: ... three, index 3: ... four)
	 * @return {array} The list
	 */
	function getFollowerCollection(currentFollowers) {
		var collection = [];
		currentFollowers.forEach(function(list) {
			var newFollowers = [];
			var followerTokens = Object.getOwnPropertyNames(list);
			followerTokens.forEach(function(follower) {
				var repeat = list[follower];
				for (var i = 0; i < repeat; i++) {
					newFollowers.push(follower);
				}
			});
			if (newFollowers.length) {
				var ratio = collection.length / newFollowers.length + 1;
				for (var i = 0; i < ratio; i++) {
					collection = collection.concat(newFollowers);
				};
			}
		});
		return collection;
	}
	
	/**
	 * Creates a new headline and returns its tokens
	 * 
	 * @todo refactor to smaller functions
	 * 
	 * @param {array} history - The list of already generated tokens
	 * @param {boolean} hadPart2 - If this list already had the token 'PART2'
	 * @param {object} followers - The markov chain
	 * @returns {array} List of tokens for this headline
	 */
	function getHeadlineTokens(history, hadPart2, followers) {
		var lastToken = history[history.length - 1];
		if (lastToken == 'EOF') {
			return history;
		}
	
		var currentFollowers = [];
		if (lastToken == 'SOF') {
			currentFollowers[0] = followers[lastToken] || {};
		}
		if (lastToken != 'PART2') {
			var doubleToken = history[history.length - 2] + ' ' + lastToken;
			currentFollowers[1] = followers[doubleToken] || {};
		}
		var trippleToken = history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentFollowers[2] = followers[trippleToken] || {};
		var quadrupleToken = history[history.length - 4] + ' ' + history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentFollowers[3] = followers[quadrupleToken] || {};
		
		var randomizer = getFollowerCollection(currentFollowers);
	
		while (true) {
			if (!randomizer.length) {
				return history;
			}
			var nextIndex = Math.floor(randomizer.length * Math.random());
			var token = randomizer.splice(nextIndex, 1);
			if (tokenIsAllowed(token, hadPart2)) {
				history.push(token);
				if (token == 'EOF') {
					return history;
				}
				var nextHadPart2 = hadPart2 || token == 'PART2';
				var nextHistory = getHeadlineTokens(history, nextHadPart2, followers);
				if (nextHistory[nextHistory.length - 1] == 'EOF') {
					return nextHistory;
				} else {
					history.pop();
				}
			}
		};
	}
	
	/**
	 * Counts the occurences of a string in another string
	 * @param {string} needle - The string to count
	 * @returns {number} The number of occurences
	 */
	String.prototype.countString = function(needle) {
		return (this.match(new RegExp(needle, 'g')) || []).length
	}
	
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
	 * @param {object} followers - The markov chain
	 * @param {array} headlines - The list of existing headlines
	 * @returns {array} The headline. Index 0 is the first part, index 1 the main part.
	 */
	exports.getHeadline = function(followers, headlines) {
		do {
			var headlineTokens = getHeadlineTokens(['SOF'], false, followers);
			var headline = headlineTokens.slice(1, -1).join(' ');
			var part2Index = headline.indexOf('PART2');
			var headlinePart1 = fixPart(headline.slice(0, part2Index - 1));
			var headlinePart2 = fixPart(headline.slice(part2Index + 6));
		} while (headlines.some(function(headline) {
			return headline.indexOf(headlinePart2) != -1
		}));
	
		return [headlinePart1, headlinePart2];
	}

})(typeof exports === 'undefined' ? this.headlineGenerator = {} : exports); // hack to work in the webbrowser and as a node.js module

var fs = require('fs');

var tokens = require('./tokens.json');

var followers = {};
function addFollowers(token, nextToken) {
	var thisFollowers = {};
	if (followers[token]) {
		thisFollowers = followers[token];
	}
	if (!thisFollowers[nextToken]) {
		thisFollowers[nextToken] = 0;
	}
	thisFollowers[nextToken]++;
	followers[token] = thisFollowers;
	console.log(token, followers[token]);
}

var lastTokens = [];
tokens.forEach(function(headline) {
	headline.forEach(function(token, index) {
		if (token != 'EOF') {
		  if (token == 'SOF') {
			  addFollowers(token, headline[index + 1]);
			}
			if (lastTokens.length > 0) {
				addFollowers(lastTokens[0] + ' ' + token, headline[index + 1]);
			}
			if (lastTokens.length > 1) {
				addFollowers(lastTokens[1] + ' ' + lastTokens[0] + ' ' + token, headline[index + 1]);
			}
			if (lastTokens.length > 2) {
				addFollowers(lastTokens[2] + ' ' + lastTokens[1] + ' ' + lastTokens[0] + ' ' + token, headline[index + 1]);
			}
			lastTokens.unshift(token);
			if (lastTokens.length > 3) {
				lastTokens.pop();
			}
		}
	});
	lastToken = null;
});
fs.writeFile('followers.json', JSON.stringify(followers));

console.log('===========');
console.log(tokens.length + ' Schlagzeilen analysiert.');

var fs = require('fs');

var tokens = require('./tokens.json');
var successors = {};
var predecessors = {};

function addTokenToKey(map, keyToken, token) {
	var key = keyToken.join(' ');
	var innerMap = {};
	if (map[key]) {
		innerMap = map[key];
	}
	if (!innerMap[token]) {
		innerMap[token] = 0;
	}
	innerMap[token]++;
	map[key] = innerMap;
	console.log(key, token, innerMap[token]);
}

function addSuccessor(lastTokens) {
	var token = lastTokens[lastTokens.length - 1];
	var predecessorTokens = lastTokens.slice(0, -1);
	while(predecessorTokens.length >= 1) {
		addTokenToKey(successors, predecessorTokens, token);
		predecessorTokens = predecessorTokens.slice(1);
	}
}

function addPredecessor(lastTokens) {
	var token = lastTokens[0];
	var successorTokens = lastTokens.slice(1);
	while(successorTokens.length >= 1) {
		addTokenToKey(predecessors, successorTokens, token);
		token = successorTokens[0];
		successorTokens = successorTokens.slice(1);
	}
}

tokens.forEach(function(headline) {
	var lastTokens = [];
	headline.forEach(function(token) {
		lastTokens.push(token);
		if (lastTokens.length > 5) {
			lastTokens = lastTokens.slice(1);
		}
		if (token !== 'SOF') {
			addSuccessor(lastTokens);
			addPredecessor(lastTokens);
		}
	});
});
fs.writeFile('successors.json', JSON.stringify(successors));
fs.writeFile('predecessors.json', JSON.stringify(predecessors));

console.log('===========');
console.log(tokens.length + ' Schlagzeilen analysiert.');

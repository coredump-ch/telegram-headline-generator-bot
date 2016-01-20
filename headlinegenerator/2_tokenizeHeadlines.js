var fs = require('fs');

var headlines = require('./headlines.json');
var tokenCollection = [];

headlines.forEach(function(headline) {
	headline = headline.replace(/-/g, '- ');
	var words = headline.split(' ');
	var tokens = ['SOF'];
	words.forEach(function(word, index) {
		if (word.trim()) {
			if (word == '&' && words[index + 1] == 'Co.' || words[index + 1] == '–') {
				word += ' ' + words[index + 1];
				words[index + 1] = '';
			}
			tokens.push(word.trim());
		}
	});
	tokens.push('EOF');
	tokenCollection.push(tokens);
	console.log(tokens);
});
fs.writeFile('tokens.json', JSON.stringify(tokenCollection));

console.log('===========');
console.log(headlines.length + ' Headlines bearbeitet.');

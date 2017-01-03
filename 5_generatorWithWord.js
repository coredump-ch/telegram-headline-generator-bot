var successors = require('./successors.json');
var predecessors = require('./predecessors.json');
var headlines = require('./headlines.json');
var headlineGenerator = require('./generator_functions');
var headlineGeneratorBackwards = require('./generator_functions_backwards');

function printHeadline(word) {
	var headlineParts = headlineGenerator.getHeadlineWithWord(word, successors, predecessors, headlines, headlineGeneratorBackwards);

	console.log();
	console.log(headlineParts[0] + ':\n', headlineParts[1]);
}

var param = process.argv[2];
if (param) {
	printHeadline(param);
	printHeadline(param);
	printHeadline(param);
} else {
	console.error('Bitte ein Wort als Parameter angeben.');
}

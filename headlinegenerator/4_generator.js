var successors = require('./successors.json');
var headlines = require('./headlines.json');
var headlineGenerator = require('./generator_functions');

function printHeadline() {
	var headlineParts = headlineGenerator.getHeadline(successors, headlines);

	console.log();
	console.log(headlineParts[0] + ':\n', headlineParts[1]);
}

printHeadline();
printHeadline();
printHeadline();

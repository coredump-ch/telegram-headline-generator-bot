var config = require('./config.js');

var TelegramBot = require('node-telegram-bot-api');
var followers = require('./headlinegenerator/followers.json');
var headlines = require('./headlinegenerator/headlines.json');

var bot = new TelegramBot(config.token, {polling: true});

bot.onText(/^\/start(@HeadlineGeneratorBot)?$/, function(message, match) {
  var messageId = message.message_id;
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Hey!', {'reply_to_message_id': messageId});
});

bot.onText(/^\/help(@HeadlineGeneratorBot)?$/, function(message, match) {
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Not helpful.');
});

bot.onText(/^\/generate(@HeadlineGeneratorBot)?( (\d+))?$/, function(message, match) {
  var chatId = message.chat.id;
  var number = match[3] || 1;
  number = number > 5 ? 5 : number;
  
  for (var i = 0; i < number; i++) {
    setTimeout(function() {
      sendHeadline(chatId);
    }, i * 3000);
  }
});

function tokenIsAllowed(token, hadPart2) {
	if (hadPart2 && token == 'PART2') {
		return false;
	}
	if (!hadPart2 && token == 'EOF') {
		return false;
	}
	return true;
}

function getFollowerCollection(currentFollowers, index, multiplicity, noeof) {
	var singleTokensLength = Object.getOwnPropertyNames(currentFollowers[0]).length || 1;
	var list = currentFollowers[index];
	var followerTokens = Object.getOwnPropertyNames(list);
	var repeats = Math.round((singleTokensLength * multiplicity) / followerTokens.length) || 1;
	var collection = [];
	followerTokens.forEach(function(follower) {
		if (!noeof || follower != 'EOF' && follower != 'PART2') {
			for (var i = 0; i < list[follower]; i++) {
				for (var n = 0; n < repeats; n++) {
					collection.push(follower);
				}
			}
		}
	});
	return collection;
}

function getHeadlineTokens(history, hadPart2) {
	var lastToken = history[history.length - 1];
	if (lastToken == 'EOF') {
		return history;
	}

	var currentFollowers = [];
	currentFollowers[0] = {};
	currentFollowers[1] = {};
	if (lastToken != 'PART2') {
		currentFollowers[0] = followers[lastToken] || {};
		var doubleToken = history[history.length - 2] + ' ' + lastToken;
		currentFollowers[1] = followers[doubleToken] || {};
	}
	var trippleToken = history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
	currentFollowers[2] = followers[trippleToken] || {};
	var quadrupleToken = history[history.length - 4] + ' ' + history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
	currentFollowers[3] = followers[quadrupleToken] || {};
	
	var randomizer = [];
	randomizer = randomizer.concat(getFollowerCollection(currentFollowers, 0, 1, true));
	randomizer = randomizer.concat(getFollowerCollection(currentFollowers, 1, 3, false));
	randomizer = randomizer.concat(getFollowerCollection(currentFollowers, 2, 3, false));
	randomizer = randomizer.concat(getFollowerCollection(currentFollowers, 3, 2, false));

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
			var nextHistory = getHeadlineTokens(history, nextHadPart2);
			if (nextHistory[nextHistory.length - 1] == 'EOF') {
				return nextHistory;
			} else {
				history.pop();
			}
		}
	};
}

String.prototype.countString = function(needle) {
	return (this.match(new RegExp(needle, 'g')) || []).length
}

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

function sendHeadline(chatId) {
	do {
		var headlineTokens = getHeadlineTokens(['SOF'], false);
		var headline = headlineTokens.slice(1, -1).join(' ');
		var part2Index = headline.indexOf('PART2');
		var headlinePart1 = fixPart(headline.slice(0, part2Index - 1));
		var headlinePart2 = fixPart(headline.slice(part2Index + 6));
	} while(headlines.some(function(headline) {
		return headline.indexOf(headlinePart2) != -1
	}));

	bot.sendMessage(chatId, headlinePart1 + ':\n' + headlinePart2);
}
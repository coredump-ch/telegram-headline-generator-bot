var TelegramBot = require('node-telegram-bot-api');
var headlineGenerator = require('./headlinegenerator/generator_functions');

var config = require('./config.js');
var followers = require('./headlinegenerator/followers.json');
var headlines = require('./headlinegenerator/headlines.json');

var bot = new TelegramBot(config.token, {polling: true});

bot.onText(/^\/start(@HeadlineGeneratorBot)?$/, function(message, match) {
  var messageId = message.message_id;
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Hey!\n\nNutze /generate, um eine Schlagzeile zu generieren.', {'reply_to_message_id': messageId});
});

bot.onText(/^\/help(@HeadlineGeneratorBot)?$/, function(message, match) {
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Headline Generator nimmt die Schlagzeilen einer Schweizer Abendzeitung und analysiert sie per Markov-Chain (für jedes Wort und jede Wortgruppe wird die Wahrscheinlichkeit berechnet, welche Wörter anschliessend folgen können) um so neue Schlagzeilen zu erzeugen. Dadurch entsteht viel Unsinn, aber manchmal … 😊 Übrigens kam keine Schlagzeile so in der Zeitung vor – das wird auch geprüft.\n\nNutzen mit: /generate');
});

bot.onText(/^\/generate(@HeadlineGeneratorBot)?( (\d+))?$/, function(message, match) {
  var chatId = message.chat.id;
  var number = match[3] || 1;
  number = number > 5 ? 5 : number;
  
  for (var i = 0; i < number; i++) {
    setTimeout(function() {
    	var headlineParts = headlineGenerator.getHeadline(followers, headlines);
    	bot.sendMessage(chatId, headlineParts[0] + ':\n' + headlineParts[1]);
    }, i * 3000);
  }
});

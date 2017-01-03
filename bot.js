var TelegramBot = require('node-telegram-bot-api');
var fs = require('fs');
var headlineGenerator = require('./headlinegenerator/generator_functions');
var headlineGeneratorBackwards = require('./headlinegenerator/generator_functions_backwards');

var config = require('./config.js');
var successors = require('./headlinegenerator/successors.json');
var predecessors = require('./headlinegenerator/predecessors.json');
var headlines = require('./headlinegenerator/headlines.json');

var bot = new TelegramBot(config.token, {polling: true});

bot.onText(/^\/start(@HeadlineGeneratorBot)?$/, function(message) {
  console.log('received', message.text);
  var messageId = message.message_id;
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Hey!\n\nNutze /generate, um eine Schlagzeile zu generieren.', {'reply_to_message_id': messageId});
});

bot.onText(/^\/help(@HeadlineGeneratorBot)?$/, function(message) {
  console.log('received', message.text);
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Headline Generator nimmt die Schlagzeilen einer Schweizer Abendzeitung und analysiert sie per Markov-Chain (für jedes Wort und jede Wortgruppe wird die Wahrscheinlichkeit berechnet, welche Wörter anschliessend folgen können) um so neue Schlagzeilen zu erzeugen. Dadurch entsteht viel Unsinn, aber manchmal … 😊 Übrigens kam keine Schlagzeile so in der Zeitung vor – das wird auch geprüft.\n\nNutzen mit: /generate');
});

bot.onText(/^\/generate(@HeadlineGeneratorBot)?( (\d+))?$/, function(message, match) {
  console.log('received', message.text);
  var chatId = message.chat.id;
  var number = match[3] || 1;
  number = number > 5 ? 5 : number;
  
  for (var i = 0; i < number; i++) {
    setTimeout(function() {
      var headlineParts = headlineGenerator.getHeadline(successors, headlines);
      bot.sendMessage(chatId, headlineParts[0] + ':\n' + headlineParts[1]);
    }, i * 3000);
  }
});

bot.onText(/^\/generate5(@HeadlineGeneratorBot)?$/, function(message) {
  console.log('received', message.text);
  var chatId = message.chat.id;
  for (var i = 0; i < 5; i++) {
    setTimeout(function() {
      var headlineParts = headlineGenerator.getHeadline(successors, headlines);
      bot.sendMessage(chatId, headlineParts[0] + ':\n' + headlineParts[1]);
    }, i * 3000);
  }
});

bot.onText(/^\/generatewithword(@HeadlineGeneratorBot)?( (.*))?$/, function(message, match) {
  console.log('received', message.text);
  var chatId = message.chat.id;
  var text = match[3] && match[3].trim();
  if (!text) {
    bot.sendMessage(chatId, 'Cool, mit welchem Wort?', {
      reply_to_message_id: message.message_id,
      reply_markup: {
        force_reply: true,
        selective: true
      }
    });
  } else if (text.indexOf(' ') !== -1) {
    bot.sendMessage(chatId, 'Sorry, ich kann nur Schlagzeilen mit genau einem gegebenem Wort oder mit /generate generieren.');
  } else {
    var headlineParts = headlineGenerator.getHeadlineWithWord(text, successors, predecessors, headlines, headlineGeneratorBackwards);
    if ((headlineParts[0] + headlineParts[1]).trim()) {
      bot.sendMessage(chatId, headlineParts[0] + ':\n' + headlineParts[1]);
    } else {
      bot.sendMessage(chatId, 'Sorry, dieses Wort kenne ich nicht.');
    }
  }
});

bot.onText(/^[^\/]/, function(message) {
  console.log('received', message.text);
  var chatId = message.chat.id;
  var text = message.text.replace('@HeadlineGeneratorBot', '').trim();
  if (!text || text.indexOf(' ') !== -1) {
    bot.sendMessage(chatId, 'Sorry, ich kann nur Schlagzeilen mit genau einem gegebenem Wort oder mit /generate generieren.');
    return;
  }

  var headlineParts = headlineGenerator.getHeadlineWithWord(text, successors, predecessors, headlines, headlineGeneratorBackwards);
  if ((headlineParts[0] + headlineParts[1]).trim()) {
    bot.sendMessage(chatId, headlineParts[0] + ':\n' + headlineParts[1]);
  } else {
    bot.sendMessage(chatId, 'Sorry, dieses Wort kenne ich nicht.');
  }
});

function tellNoBeta(message) {
  var messageId = message.message_id;
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'Momentan gibt es keinen Beta-Test. Den aktuellen Generator bekommst du mit /generate.', {'reply_to_message_id': messageId});
}

bot.onText(/^\/generate-beta(@HeadlineGeneratorBot)?/, tellNoBeta);
bot.onText(/^\/rate(@HeadlineGeneratorBot)?/, tellNoBeta);

/* var rating = JSON.parse(fs.readFileSync('rating.json', {encoding: 'utf8'}) || '{"goodStable": 0, "goodBeta": 0,   "ratingsStable": 0, "ratingsBeta": 0, "chatStates": {}}');
bot.onText(/^\/results(@HeadlineGeneratorBot)?$/, function(message, match) {
  var chatId = message.chat.id;
  bot.sendMessage(chatId, 'goodStable: ' + rating.goodStable + '\ngoodBeta: ' + rating.goodBeta + '\n\nratingsStable: ' + rating.ratingsStable + '\nratingsBeta: ' + rating.ratingsBeta);
}); */

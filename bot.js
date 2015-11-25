var config = require('./config.js');

var TelegramBot = require('node-telegram-bot-api');

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

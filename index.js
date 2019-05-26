process.env.NTBA_FIX_319 = 1;
const Events = require('./events');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();

const run = async chatId => {
  const events = await Events.get();
  if (events) {
    var msg = Events.format(events);
    if (msg === '') {
      msg = '<b>Você não tem nenhum evento do Insper hoje!</b>';
    }
    return bot.sendMessage(chatId, msg, {
      parse_mode: 'HTML'
    });
  }
  return null;
};

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', msg => {
  const chatId = msg.chat.id;

  if (process.env.TELEGRAM_ID) {
    if (chatId && process.env.TELEGRAM_ID) {
      run(chatId);
    }
  } else {
    run(chatId);
  }
});

bot.on('polling_error', error => {
  console.log(error);
});

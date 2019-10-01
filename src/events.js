const axios = require('axios');
const cheerio = require('cheerio');

BASE64 = str => {
  let buff = new Buffer.from(str);
  let base64data = buff.toString('base64');
  return base64data;
};

titleCase = str => {
  if (str.indexOf(' ') > -1) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word[0] !== undefined) {
          return word.replace(word[0], word[0].toUpperCase());
        }
        return undefined;
      })
      .join(' ');
  } else {
    return str;
  }
};

class Events {
  parse(str) {
    const br = new RegExp('<br>', 'g');
    str = str.replace(br, '\n');
    const doc = cheerio.load(str, {});
    const events = [];

    doc('table#tb')
      .find('tr')
      .each(function(i, el) {
        if (i != 0) {
          var tds = doc(this).find('font[face=Verdana][size=1]');

          const event = {
            date: tds.eq(1).text(),
            activity: tds.eq(2).text(),
            type: tds.eq(3).text(),
            title: tds.eq(4).text(),
            room: tds.eq(5).text(),
          };

          events.push(event);
        }
      });

    return events;
  }

  async get() {
    var events = [];
    const request = await axios({
      method: 'get',
      url:
        'http://portaldoalunoapp.insper.edu.br/restrito/controlealocacao/calendarioacademico.aspx',

      withCredentials: true,
      headers: {
        Authorization:
          'Basic ' +
          BASE64(process.env.INSPER_USER + ':' + process.env.INSPER_PASSWORD),
      },
    })
      .then(async response => {
        events = await this.parse(response.data);
      })
      .catch(err => {
        console.log('A requisição não foi bem sucedida');
        console.log(err);
        events = null;
      });

    return events;
  }

  format(events) {
    var msg = '';
    events.forEach(element => {
      let date = element.date.split(' ');
      let asIndex = date.indexOf('às');
      let title = element.title.split('\n');
      if (title.length > 0) {
        title = title[0];
      } else {
        title = element.title;
      }

      msg += '<b>';
      if (element.activity === 'Atividade Escolar') {
        msg += element.type;
      } else {
        msg += element.activity;
      }
      msg += '</b> \n';

      msg += date[asIndex - 1] + ' - ' + date[asIndex + 1] + '\n';
      msg += '<b>' + titleCase(title) + '</b> \n';
      msg += '<i>' + element.room + '</i> \n';
      msg += '\n';
    });

    return msg;
  }
}

module.exports = new Events();

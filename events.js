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
        return word.replace(word[0], word[0].toUpperCase());
      })
      .join(' ');
  } else {
    return str;
  }
};

class Events {
  parse(str) {
    const doc = cheerio.load(str);
    const events = [];

    doc('table#tb')
      .find('tr')
      .each(function(i, el) {
        if (i != 0) {
          var tds = doc(this).find('td');

          const event = {
            date: tds.eq(1).text(),
            activity: tds.eq(2).text(),
            type: tds.eq(3).text(),
            title: tds.eq(4).text(),
            room: tds.eq(5).text()
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
          BASE64(process.env.INSPER_USER + ':' + process.env.INSPER_PASSWORD)
      }
    })
      .then(async response => {
        events = await this.parse(response.data);
      })
      .catch(err => {
        console.log('A requisição não foi bem sucedida');
        events = null;
      });

    return events;
  }

  format(events) {
    var msg = '';
    events.forEach(element => {
      let date = element.date.split(' ');
      msg += '<b>';
      if (element.activity === 'Atividade Escolar') {
        msg += element.type;
      } else {
        msg += element.activity;
      }
      msg += '</b> \n';

      msg += date[1] + ' - ' + date[3] + '\n';
      msg += '<b>' + titleCase(element.title) + '</b> \n';
      msg += '<i>' + element.room + '</i> \n';
      msg += '\n';
    });

    return msg;
  }
}

module.exports = new Events();

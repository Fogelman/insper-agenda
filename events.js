const axios = require('axios');
const cheerio = require('cheerio');

BASE64 = str => {
  let buff = new Buffer.from(str);
  let base64data = buff.toString('base64');
  return base64data;
};

class Events {
  parse(str) {
    const doc = cheerio.load(str);
    const events = [];

    doc('table#tb')
      .find('tr')
      .each(function(i, el) {
        if (i == 0) {
          var tds = doc(this).find('td');

          const event = {
            date: tds.eq(1).text(),
            activity: tds.eq(2).text(),
            type: tds.eq(3).text(),
            title: tds.eq(4).text(),
            activity: tds.eq(5).text()
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
        console.log(events);
      })
      .catch(err => {
        console.log('A requisição não foi bem sucedida');
        events = null;
      });

    return events;
  }
}

module.exports = new Events();

const axios = require('axios');
const cheerio = require('cheerio');

BASE64 = str => {
  let buff = new Buffer.from(str);
  let base64data = buff.toString('base64');
  return base64data;
};

// titleCase = str => {
//   console.log(str);
//   if (str.indexOf(' ') > -1) {
//     return str
//       .toLowerCase()
//       .split(' ')
//       .map(word => {
//         return word.replace(word[0], word[0].toUpperCase());
//       })
//       .join(' ');
//   } else {
//     return str;
//   }
// };

/*
 * https://github.com/gouch/to-title-case/blob/master/to-title-case.js
 */
String.prototype.toTitleCase = function() {
  'use strict';
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
  var wordSeparators = /([ :–—-])/;

  return this.split(wordSeparators)
    .map(function(current, index, array) {
      if (
        /* Check for small words */
        current.search(smallWords) > -1 &&
        /* Skip first and last word */
        index !== 0 &&
        index !== array.length - 1 &&
        /* Ignore title end and subtitle start */
        array[index - 3] !== ':' &&
        array[index + 1] !== ':' &&
        /* Ignore small words that start a hyphenated phrase */
        (array[index + 1] !== '-' ||
          (array[index - 1] === '-' && array[index + 1] === '-'))
      ) {
        return current.toLowerCase();
      }

      /* Ignore intentional capitalization */
      if (current.substr(1).search(/[A-Z]|\../) > -1) {
        return current;
      }

      /* Ignore URLs */
      if (array[index + 1] === ':' && array[index + 2] !== '') {
        return current;
      }

      /* Capitalize the first letter */
      return current.replace(alphanumericPattern, function(match) {
        return match.toUpperCase();
      });
    })
    .join('');
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
      msg += '<b>' + element.title.toLowerCase().toTitleCase() + '</b> \n';
      msg += '<i>' + element.room + '</i> \n';
      msg += '\n';
    });

    return msg;
  }
}

module.exports = new Events();

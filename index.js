const fetch = require('node-fetch');
const readline = require('readline');

const getPage = async index => {
  const url = `https://www.ceskatelevize.cz/teletext/ct/?page=${index}&ver=TXT`;
  const res = await fetch(url);
  const text = await res.text();
  const [, teletext] = text.split(/<\/?pre>/);

  if (!teletext) return ' Stránka nenalezena';
  return teletext.trim();
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = question => new Promise(resolve => rl.question(question, answer => resolve(answer)));

/**
 *
 * @param {string} str
 * @param {*} splitStr
 */
const trimStart = (str, splitStr) =>
  str
    .split(splitStr)
    .slice(-1)
    .join('')
    .replace(/^\s*$(?:\r\n?|\n)/gm, '');
/**
 *
 * @param {string} str
 * @param {*} splitStr
 */
const trimEnd = (str, splitStr) =>
  str
    .split(splitStr)
    .slice(0, -1)
    .join('')
    .replace(/^\s*$(?:\r\n?|\n)?/gm, '')
    .replace(/\r?\n?[^\r\n]*$/, '');

const isNumber = str => !isNaN(parseInt(str));

const printHome = async () => {
  console.log(trimEnd(await getPage(110), 'obsah 2'));
  console.log(trimEnd(trimStart(await getPage(111), 'STRUČNĚ'), 'ze světa >> '));
  console.log();

  console.log(trimEnd(await getPage(130), 'obsah 2'));
  console.log(trimEnd(trimStart(await getPage(131), 'STRUČNĚ'), 'zajímavosti >> '));
};

(async () => {
  await printHome();

  let answer = null;
  while (answer !== 'q') {
    switch (answer) {
      case 'h':
        await printHome();
        break;
      default:
        if (isNumber(answer)) {
          console.log(await getPage(parseInt(answer)));
        }
    }

    answer = await askQuestion('Stránka: ');
  }

  rl.close();

  rl.on('close', () => {
    console.log('\nDone');
    process.exit(0);
  });
})();

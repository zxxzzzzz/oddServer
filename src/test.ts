import { readFileSync, writeFileSync } from 'fs';
import Convert from 'xml-js';

(async () => {
  // const d = await getJCInfoList()
  // console.log(d);
  const text = readFileSync('./exampleData/gameMore.xml', { encoding: 'utf-8' });
  const mixObj = Convert.xml2js(text, { compact: true }) as any;
  writeFileSync('./exampleData/gameMore.json', JSON.stringify(mixObj), { encoding: 'utf-8' });
})();

import Jsep from 'jsep';
import { corpusPlugin } from './corpusPlugin.js';
import comma from './comma.js';
import object from '@jsep-plugin/object';

Jsep.plugins.register(comma);
// Jsep.plugins.register(object);

const text = '大 师,作品，大 师';

// const text = '{asd: { qwe: "123"}}';

console.log(JSON.stringify(Jsep(text)));

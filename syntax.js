import Jsep from 'jsep';
import { corpusPlugin } from './corpusPlugin.js';
import comma from './comma.js';
import ternary from './ternary.js';
import object from '@jsep-plugin/object';

Jsep.plugins.register(comma);
// Jsep.plugins.register(object);

const text = '(1 + 2), ((e0fg))';

// const text = '{asd: { qwe: "123"}}';

console.log(JSON.stringify(Jsep(text)));

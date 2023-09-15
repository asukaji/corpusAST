import Jsep from 'jsep';
import { corpusPlugin } from './corpusPlugin.js';

Jsep.plugins.register(corpusPlugin);

const text = '(asdasdas))';

console.log(JSON.stringify(Jsep(text)));

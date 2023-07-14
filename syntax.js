import Jsep from 'jsep';
import { corpusPlugin } from './corpusPlugin.js';

Jsep.plugins.register(corpusPlugin);

const text = '((+ast))';

console.log(JSON.stringify(Jsep(text)));

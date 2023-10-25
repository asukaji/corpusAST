import Jsep from 'jsep';
import { corpusPlugin } from './corpusPlugin.js';
import comma from './comma.js';
import ternary from './ternary.js';
import object from '@jsep-plugin/object';
import comment from './comment.js';

Jsep.plugins.register(comment);
// Jsep.plugins.register(object);

const text = '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime), text, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck,UnrealisticDream';

// const text = '{asd: { qwe: "123"}}';

console.log(JSON.stringify(Jsep(text)));

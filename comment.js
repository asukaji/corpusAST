function getIdentifyOpsAsChars(addIdentifierChar) {
  return (ops, toArray = Object.keys, removeOp) =>
    toArray(ops).forEach((operate) => {
      addIdentifierChar(operate)
      removeOp?.(operate)
    });
}

const identifierChars = ['(', ')', '{', '}', '[', ']', ',', ']', '，', ' '];

const corpora = [
  '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime), text, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck,UnrealisticDream'
];
const defaultCorpus = () => ({
  content: '',
  weight: 0,
  leftParentheses: 0,
  rightParentheses: 0,
  isContent: false
});

const someSetHasPrefix = (stringSet, prefix) => {
  let hasPrefix = false;

  stringSet.forEach((str) => {
    if (str.startsWith(prefix)) {
      hasPrefix = true;
    }
  });

  return hasPrefix;
};

/**
 * @example
 * {
 *    type: 'corpus',
 *    properties: [
 *      {
 *        type: 'Identifier',
 *        content: '',
 *        weight: ''
 *      }
 *    ]
 * }
 */
export default {
  name: 'corpora',

  init(jsep) {
    const { addIdentifierChar, removeBinaryOp, removeUnaryOp } = jsep;

    const identifyOpsAsChars = getIdentifyOpsAsChars(addIdentifierChar);

    // 将预设的符号识别为字符
    identifyOpsAsChars(identifierChars, (chars) => chars);
    identifyOpsAsChars(jsep.unary_ops, Object.keys, removeUnaryOp);
    identifyOpsAsChars(jsep.binary_ops, Object.keys, removeBinaryOp);

    jsep.hooks.add('gobble-token', function (env) {
      // 字段增加一个字符方便循环处理
      this.expr += ',';
      let char = this.expr.charAt(this.index);
      let code = this.expr.charCodeAt(this.index);

      const corpus = defaultCorpus();

      const properties = [];

      const clearCorpus = () => Object.assign(corpus, defaultCorpus());
      const addCorpus = () => {
        corpus.content && properties.push({
          type: 'Identifier',
          content: corpus.content,
          weight: corpus.weight
        });
        clearCorpus();
      };

      let matchedCorpora = new Set(corpora);
      let backtrackIndex = 0;
      let latestCommaIndex = 0;
      let preMatchedCorpora = matchedCorpora;
      let matchedCorpus = [];

      while (!isNaN(code)) {
        if (preMatchedCorpora.size && this.index) {
          if ((char === ',' || char === '，') && matchedCorpora.has(corpus.content) && corpus.leftParentheses === corpus.rightParentheses) {
            if (matchedCorpora.size === 1) {
              matchedCorpora = new Set();
            } else {
              matchedCorpus = [corpus.content]
            }
          } else if (!matchedCorpora.size) {
            // 回朔
            backtrackIndex = this.index;
            this.index = latestCommaIndex === 0 ? 0 : latestCommaIndex + 1;

            matchedCorpora = new Set(matchedCorpus);
            matchedCorpus = [];

            clearCorpus();
            char = this.expr.charAt(this.index);
            code = this.expr.charCodeAt(this.index);
          }
        }

        switch (char) {
          case ',':
          case '，':
            // 存在可匹配的词条
            if (matchedCorpora.size) {
              corpus.content += char;
              break;
            }
            latestCommaIndex = this.index;

            // 词条中存在未匹配的 '('
            if (corpus.leftParentheses > corpus.rightParentheses) {
              corpus.content = Array(corpus.leftParentheses - corpus.rightParentheses).fill('(').join('') + corpus.content
            }

            // 非回朔中重制可匹配的词条
            if (!backtrackIndex) {
              matchedCorpora = new Set(corpora)
            }

            addCorpus();
            break;

          case '(':
            // 正在处理内容
            // 起始 '(' 可能匹配词条
            if (corpus.isContent || someSetHasPrefix(matchedCorpora, '(')) {
              corpus.content += char;
            } else {
              corpus.leftParentheses += 1;
            }
            break;

          case ')':
            // 匹配到 '(' 
            if (corpus.leftParentheses > corpus.rightParentheses) {
              corpus.rightParentheses += 1;
              corpus.weight += 1;
            } else {
              corpus.content += char;
            }
            break;

          default:
            if (corpus.rightParentheses > 0) {
              corpus.content += Array(corpus.rightParentheses).fill(')').join('')
              corpus.rightParentheses = 0;
              corpus.weight = 0;
            }
            corpus.isContent = true;
            corpus.content += char;
        }

        preMatchedCorpora = matchedCorpora;
        matchedCorpora = new Set(Array.from(matchedCorpora).filter(text => text.startsWith(corpus.content)));

        char = this.expr.charAt(++this.index);
        code = this.expr.charCodeAt(this.index);

        if (backtrackIndex && this.index > backtrackIndex) {
          backtrackIndex = 0;
          matchedCorpora = new Set(corpora)
        }
      }

      // 移除最后一个字段
      corpus.content = corpus.content.slice(0, -1)
      addCorpus();

      env.node = this.gobbleTokenProperty({
        type: 'corpora',
        properties,
      });
    });
  },
};
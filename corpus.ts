import jsep from "jsep";
import _ from "lodash";

type Jsep = typeof jsep;
interface property {
  type: string;
  content: string;
  weight: number;
}

function getIdentifyOpsAsChars(addIdentifierChar: Jsep["addIdentifierChar"]) {
  return (
    ops: string[] | Record<string, number>,
    toArray = Object.keys,
    removeOp?: (operatorName: string) => void
  ) =>
    toArray(ops).forEach((operate) => {
      addIdentifierChar(operate);
      removeOp?.(operate);
    });
}

const identifierChars = ["(", ")", "{", "}", "[", "]", ",", "]", "，", " "];
const defaultCorpus = () => ({
  content: "",
  weight: 0,
  leftParentheses: 0,
  rightParentheses: 0,
  isContent: false,
});

const someSetHasPrefix = (stringSet: Set<string>, prefix: string) => {
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
export const corpus = (corpora: (string | undefined)[]) => {
  const filteredCorpora = corpora.filter((corpus) => !!corpus) as string[];

  return {
    name: "corpus",

    init(jsep: Jsep) {
      const { addIdentifierChar, removeBinaryOp, removeUnaryOp } = jsep;

      const identifyOpsAsChars = getIdentifyOpsAsChars(addIdentifierChar);

      // 将预设的符号识别为字符
      identifyOpsAsChars(identifierChars, _.identity);
      identifyOpsAsChars(jsep.unary_ops, Object.keys, removeUnaryOp);
      identifyOpsAsChars(jsep.binary_ops, Object.keys, removeBinaryOp);

      jsep.hooks.add("gobble-token", function (env) {
        // 字段增加一个字符方便循环处理
        const expr = this.expr + ",";
        let char = expr.charAt(this.index);
        let code = expr.charCodeAt(this.index);

        const corpus = defaultCorpus();

        const properties: property[] = [];

        const clearCorpus = () => Object.assign(corpus, defaultCorpus());
        const addCorpus = () => {
          corpus.content &&
            properties.push({
              type: "Identifier",
              content: corpus.content,
              weight: corpus.weight,
            });
          clearCorpus();
        };

        let matchedCorpora = new Set(filteredCorpora);
        let backtrackIndex = 0;
        let latestCommaIndex = 0;
        let preMatchedCorpora = matchedCorpora;
        let matchedCorpus: string[] = [];

        while (!isNaN(code)) {
          if (preMatchedCorpora.size && this.index) {
            if (
              (char === "," || char === "，") &&
              matchedCorpora.has(corpus.content) &&
              corpus.leftParentheses === corpus.rightParentheses
            ) {
              if (matchedCorpora.size === 1) {
                matchedCorpora = new Set();
              } else {
                matchedCorpus = [corpus.content];
              }
            } else if (!matchedCorpora.size) {
              // 回朔
              backtrackIndex = this.index;
              this.index = latestCommaIndex === 0 ? 0 : latestCommaIndex + 1;

              matchedCorpora = new Set(matchedCorpus);
              matchedCorpus = [];

              clearCorpus();
              char = expr.charAt(this.index);
              code = expr.charCodeAt(this.index);
            }
          }

          switch (char) {
            case ",":
            case "，":
              // 存在可匹配的词条
              if (matchedCorpora.size) {
                corpus.content += char;
                break;
              }
              latestCommaIndex = this.index;

              // 词条中存在未匹配的 '('
              if (corpus.leftParentheses > corpus.rightParentheses) {
                corpus.content =
                  Array(corpus.leftParentheses - corpus.rightParentheses)
                    .fill("(")
                    .join("") + corpus.content;
              }

              // 非回朔中重制可匹配的词条
              if (!backtrackIndex) {
                matchedCorpora = new Set(filteredCorpora);
              }

              addCorpus();
              break;

            case "(":
              // 正在处理内容
              // 起始 '(' 可能匹配词条
              if (corpus.isContent || someSetHasPrefix(matchedCorpora, "(")) {
                corpus.content += char;
              } else {
                corpus.leftParentheses += 1;
              }
              break;

            case ")":
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
                corpus.content += Array(corpus.rightParentheses)
                  .fill(")")
                  .join("");
                corpus.rightParentheses = 0;
                corpus.weight = 0;
              }
              corpus.isContent = true;
              corpus.content += char;
          }

          preMatchedCorpora = matchedCorpora;
          matchedCorpora = new Set(
            Array.from(matchedCorpora).filter((text) =>
              text.startsWith(corpus.content)
            )
          );

          char = expr.charAt(++this.index);
          code = expr.charCodeAt(this.index);

          if (backtrackIndex && this.index > backtrackIndex) {
            backtrackIndex = 0;
            matchedCorpora = new Set(filteredCorpora);
          }
        }

        // 移除最后一个字段
        corpus.content = corpus.content.slice(0, -1);
        addCorpus();

        env.node = this.gobbleTokenProperty({
          type: "corpora",
          properties,
        });
      });
    },
  } as jsep.IPlugin;
};

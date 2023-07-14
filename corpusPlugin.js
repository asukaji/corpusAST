function getIdentifyOpsAsChars(addIdentifierChar) {
  return (ops) =>
    Object.keys(ops).forEach((operate) => addIdentifierChar(operate));
}

const OBJECT_EXP = 'ObjectExpression';
const PROPERTY = 'Property';

export const corpusPlugin = {
  name: 'Corpus',

  init(jsep) {
    const { OPAREN_CODE, CPAREN_CODE, addUnaryOp, addIdentifierChar, hooks } =
      jsep;

    const identifyOpsAsChars = getIdentifyOpsAsChars(addIdentifierChar);

    // 将预设的符号识别为字符
    identifyOpsAsChars(jsep.unary_ops);
    identifyOpsAsChars(jsep.binary_ops);

    // 增加'('
    addIdentifierChar('(');
    // 增加')'
    addIdentifierChar(')');

    // '()' 栈
    const stack = [];

    hooks.add('gobble-token', function (env) {
      if (this.code === OPAREN_CODE) {
        this.index++;
        const properties = [];

        while (!isNaN(this.code)) {
          this.gobbleSpaces();

          if (this.code === CPAREN_CODE) {
            this.index++;
            env.node = this.gobbleTokenProperty({
              type: OBJECT_EXP,
              properties,
            });
            return;
          }

          // Note: using gobbleExpression instead of gobbleToken to support object destructuring
          const key = this.gobbleExpression();
          if (!key) {
            break;
          }

          this.gobbleSpaces();
          properties.push(key);

          // if (this.code === jsep.COMMA_CODE) {
          //   this.index++;
          // }
        }
        // 如果需要抛出'()'不匹配异常
        // this.throwError('missing )');
      }
    });
  },
};

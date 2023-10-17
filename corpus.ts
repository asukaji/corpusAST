function getIdentifyOpsAsChars(addIdentifierChar) {
  return (ops) =>
    Object.keys(ops).forEach((operate) => addIdentifierChar(operate));
}

const OBJECT_EXP = 'ObjectExpression';
const PROPERTY = 'Property';

export const corpusPlugin = {
  name: 'corpus',

  init(jsep) {
    const { addUnaryOp, addIdentifierChar, hooks } = jsep;

    const identifyOpsAsChars = getIdentifyOpsAsChars(addIdentifierChar);

    // 将预设的符号识别为字符
    identifyOpsAsChars(jsep.unary_ops);
    identifyOpsAsChars(jsep.binary_ops);

    // 增加'('
    addIdentifierChar('(');
    // 增加')'
    addIdentifierChar(')');

    let parenCount = 0;
    let maxParenCount = 0;

    /**
     * this.expr 带解析字段
     * this.index 指针
     * this.code = this.expr.charCodeAt(this.index)
     * this.char = this.expr.charAt(this.index)
     */
    hooks.add('gobble-token', function (env) {
      const { char, expr, code } = this;
      const properties = char;

      switch (char) {
        case '(':
          this.index++;
          break;
        case ')':
          console.log(1);
          this.index++;
          break;
        default:
          this.index++;
          env.node = this.gobbleTokenProperty({
            type: OBJECT_EXP,
            properties,
          });
          break;
      }

      if (this.index >= expr.length) {
        parenCount = 0;
        maxParenCount = 0;
      }
    });
  },
};

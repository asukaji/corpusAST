function getIdentifyOpsAsChars(addIdentifierChar) {
  return (ops) =>
    Object.keys(ops).forEach((operate) => addIdentifierChar(operate));
}

const OBJECT_EXP = 'ObjectExpression';
const PROPERTY = 'Property';

export const corpusPlugin = {
  name: 'Corpus',

  assignmentOperators: new Set(['(', '((', '(((', ')', '))', ')))']),

  init(jsep) {
    const { addUnaryOp, addIdentifierChar, hooks } = jsep;

    const identifyOpsAsChars = getIdentifyOpsAsChars(addIdentifierChar);

    // 将预设的符号识别为字符
    identifyOpsAsChars(jsep.unary_ops);
    identifyOpsAsChars(jsep.binary_ops);
    addIdentifierChar(' ')

    // 增加'('
    addIdentifierChar('(');
    // 增加')'
    addIdentifierChar(')');

    let parenCount = 0;
    let maxParenCount = 0;

    /**
     * this.expr 待解析字段
     * this.index 指针
     * this.code = this.expr.charCodeAt(this.index)
     * this.char = this.expr.charAt(this.index)
     */
    // hooks.add('gobble-token', function (env) {
    //   const properties = [];

    //   console.log(this.char, this.code);
    //   while (!isNaN(this.code)) {
    //     console.log(this.char);
    //     this.gobbleSpaces();

    //     if (this.char === '(') {
    //       this.index++;
    //       env.node = this.gobbleTokenProperty({
    //         type: OBJECT_EXP,
    //         properties,
    //       });
    //       return;
    //     }

    //     // const key = this.gobbleExpression();
    //     // if (!key) {
    //     //   break; // missing }
    //     // }

    //     this.index++;
    //   }
    // });
  },
};

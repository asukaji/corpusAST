function getIdentifyOpsAsChars(addIdentifierChar) {
  return (ops, toArray = Object.keys) =>
    toArray(ops).forEach((operate) => addIdentifierChar(operate));
}

const identifierChars = ['(', ')', '{', '}', '[', ']'];

const plugin = {
  name: 'comma-split',

  init(jsep) {
    const identifyOpsAsChars = getIdentifyOpsAsChars(jsep.addIdentifierChar);
    // 将预设的符号识别为字符
    identifyOpsAsChars(jsep.unary_ops);
    identifyOpsAsChars(jsep.binary_ops);
    // 将 '(' ')' 识别为字符
    identifyOpsAsChars(identifierChars, (chars) => chars);
    jsep.addIdentifierChar(' ')

    // 扩展jsep以支持逗号分隔的多个表达式
    jsep.addBinaryOp(',');
    jsep.addBinaryOp('，');
    jsep.addBinaryOp('(');
    jsep.addBinaryOp(')');

    // 定义处理逗号分隔的表达式的函数
    jsep.hooks.add('gobble-token', function (left) {
      if (/，|,/.test(this.char)) {
        this.gobble();
        const right = this.gobbleExpression();

        // 寻找左边和右边的括号
        const leftParen = env.lastIndexOf('(');
        const rightParen = env.length - 1;

        // 提取括号内的表达式
        const leftExpr = env.slice(leftParen + 1, env.length - 1);

        const rightExpr =
          right.type === 'SequenceExpression' ? right.expressions[0] : right;

        return {
          type: 'SequenceExpression',
          expressions: [jsep(leftExpr), right],
        };
      }
      return null;
    });

    jsep.hooks.add('gobble-token', function gobbleMasterpiece(env) {
      if (this.char === '作品') {
        // 识别到"大师作品"操作符
        this.index += 2; // 移动解析器的索引以继续解析
        env.node = {
          type: 'MasterpieceExpression',
        };
      }
    });
  },
};

export default plugin;

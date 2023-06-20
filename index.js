function tokenizer(template) {
  let tokens = [];
  let type = '';
  let val = '';

  for (let i = 0; i < template.length; i++) {
    let ch = template[i];

    if (ch === '<') {
      push();
      if (template[i + 1] === '/') {
        // 标签结束
        type = 'tagend';
      } else {
        // 标签开始
        type = 'tagstart';
      }
    } else if (ch === '>') {
      push();
      type = 'text';
      continue;
    } else if (/[\s]/.test(ch)) {
      push();
      type = 'props';
      continue;
    }
    val += ch;
  }
  return tokens;

  function push() {
    if (val) {
      if (type === 'tagstart') val = val.slice(1);
      if (type === 'tagend') val = val.slice(2);
      tokens.push({ type, val });
      val = '';
    }
  }
}

let template = `
  <div id="app">
    <h1 @click="add" class="item" :id="count">{{count}}<span>111</span></h1>
    <p>静态标签</p>
  </div>
`;
function parse(template) {
  let ast = null;

  return ast;
}

console.log(tokenizer(template));

enum Type {
  WS = 'weightStart',
  WE = 'weightEnd',
  TEXT = 'text',
}

interface Syntax {
  type: Type;
  value: string;
}

class SyntaxQueue {
  #stack: string[] = [];

  constructor() {
    this.#stack = [];
  }

  get queueLength() {
    return this.#stack.length;
  }

  get lastChar() {
    return this.#stack[this.queueLength - 1];
  }

  get firstChar() {
    return this.#stack[0];
  }

  in(char: string) {
    if (char === '(') {
    }
    if (char === ')') {
    }

    this.#stack.push(char);
  }

  out() {
    this.#stack.shift();
  }
}

function analysis(corpus: string): Syntax[] {
  const corpusLen = corpus.length;
  let value = '';
  const syntax = [];

  const stack = new SyntaxQueue();

  for (let i = 0; i < corpusLen; i++) {
    const char = corpusLen[i];
    const nextChart = corpusLen[i + 1];

    switch (char) {
      case '(':
        break;
      default:
        break;
    }
  }

  return [];
}

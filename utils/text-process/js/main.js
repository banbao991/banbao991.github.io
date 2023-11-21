
let NUMBER = 0;

function main() {
  f1();
  f2();
  f3();
  f4();
}

function check_should_apply(e) {
  return (
      e.inputType === 'insertLineBreak' || e.inputType === 'insertFromPaste' ||
      e.inputType === 'insertText' && e.data === null);
}

function f1() {
  const container = d3.select('#textareas');
  container.append('div')
      .style('float', ((NUMBER & 1) === 0) ? 'left' : 'right')
      .append('textarea')
      .attr('placeholder', '输出变成一行，空格转成横线，回车触发')
      .on('input', function(e) {
        // console.log(e.inputType, `"${e.data}"`);
        if (!check_should_apply(e)) {
          return;
        }
        // 多个空格替换成一个空格
        const text =
            this.value.trim().split('\n').join('').replace(/\s+/g, '-');
        this.value = text;
        // console.log(text);
      });
  ++NUMBER;
}

function f2() {
  const container = d3.select('#textareas');
  container.append('div')
      .style('float', ((NUMBER & 1) === 0) ? 'left' : 'right')
      .append('textarea')
      .attr(
          'placeholder',
          '去掉每一行末尾的换行，合并成一行（论文复制），粘贴/回车触发')
      .on('input', function(e) {
        // console.log(e.inputType, `"${e.data}"`);
        if (!check_should_apply(e)) {
          return;
        }
        // 去掉每一行末尾的换行，合并成一行
        const text =
            this.value.trim().split('\n').join(' ').split(/\s+/g).join(' ');
        this.value = text;
        // console.log(text);
      });
  ++NUMBER;
}

function f3() {
  const container = d3.select('#textareas');
  container.append('div')
      .style('float', ((NUMBER & 1) === 0) ? 'left' : 'right')
      .append('textarea')
      .attr('placeholder', '合并成一行，每个单词第一个字母大写，粘贴/回车触发')
      .on('input', function(e) {
        // console.log(e.inputType, `"${e.data}"`);
        if (!check_should_apply(e)) {
          return;
        }
        // 合并成一行，每个单词第一个字母大写
        const text =
            this.value.trim()
                .split('\n')
                .join(' ')
                .split(/\s+/g)
                .map(d => d[0].toUpperCase() + d.slice(1) /*.toLowerCase()*/)
                .join(' ');
        this.value = text;
        // console.log(text);
      });
  ++NUMBER;
}

function f4() {
  const container = d3.select('#textareas');
  container.append('div')
      .style('float', ((NUMBER & 1) === 0) ? 'left' : 'right')
      .append('textarea')
      .attr('placeholder', 'git-submodule 里面的 http 修改为 git')
      .on('input', function(e) {
        // console.log(e.inputType, `"${e.data}"`);
        if (!check_should_apply(e)) {
          return;
        }
        // 拣择每一行，如果存在 "https://github.com/"，则替换成
        // "git@github.com:"
        const t1 = "https://github.com/";
        const t2 = "git@github.com:";
        const text_ori = this.value;
        let lines = text_ori.split('\n');
        for (let i = 0; i < lines.length; ++i) {
          if(String(lines[i]).indexOf("https://github.com/")) {
            lines[i] = lines[i].replace(t1, t2);
          }
        }
        this.value = lines.join('\n');
        // console.log(text);
      });
  ++NUMBER;
}
const TEXTS = [
  '合并成一行，每个单词第一个字母大写，其余小写，粘贴/回车触发',
  '输出变成一行，空格转成横线，回车触发',
  '去掉每一行末尾的换行，合并成一行（论文复制），粘贴/回车触发',
  '合并成一行，每个单词第一个字母大写，粘贴/回车触发',
  'git-submodule 里面的 http 修改为 git，粘贴触发',
];

const FUNCTIONS = [f0, f1, f2, f3, f4];

///////////////////////////////////////////////////////////////////
// update the function list above if you add a new function here //
///////////////////////////////////////////////////////////////////

let textareas_input = null;

const DEFAULT_FUNTION = 2;

function main() {
  initialize_textareas();
  add_button();
  set_function(DEFAULT_FUNTION);
}

function initialize_textareas() {
  const container = d3.select('#textareas');
  container.selectAll('div').remove();
  textareas_input = container.append('div').append('textarea');
}

function set_function(i) {
  d3.selectAll('button').style('background-color', 'white');
  d3.select('button:nth-child(' + (i + 1) + ')')
      .style('background-color', 'lightblue');

  if (i < 0 || i >= FUNCTIONS.length) {
    console.log('Invalid function index:', i);
    return;
  }
  textareas_input.attr('placeholder', TEXTS[i]).on('input', function(e) {
    // console.log(e.inputType, `"${e.data}"`);
    if (!check_should_apply(e)) {
      return;
    }
    FUNCTIONS[i](this);
  });
  textareas_input.node().value = '';
}

function add_button() {
  const container =
      d3.select('#textareas').append('div').style('float', 'right');

  // generate random style for buttons from 1 to 92
  let button_random_style = Math.floor(Math.random() * 92) + 1;
  button_random_style = Math.min(92, Math.max(1, button_random_style));
  button_random_style = 89;
  for (let i = 0; i < FUNCTIONS.length; ++i) {
    container.append('button')
        .attr('class', 'button-' + button_random_style)
        .style('display', 'block')
        .text(TEXTS[i].split('，').slice(0, -1).join('，'))
        .on('click', function() {
          set_function(i);
        });
  }
}

function check_should_apply(e) {
  return (
      e.inputType === 'insertLineBreak' || e.inputType === 'insertFromPaste' ||
      e.inputType === 'insertText' && e.data === null);
}

function f0(ele) {
  // 合并成一行，每个单词第一个字母大写，其余小写
  const text = ele.value.trim()
                   .split('\n')
                   .join(' ')
                   .split(/\s+/g)
                   .map(d => d[0].toUpperCase() + d.slice(1).toLowerCase())
                   .join(' ');
  ele.value = text;
}

function f1(ele) {
  // 多个空格替换成一个空格
  const text = ele.value.trim().split('\n').join('').replace(/\s+/g, '-');
  ele.value = text;
}

function f2(ele) {
  // 去掉每一行末尾的换行，合并成一行
  const text = ele.value.trim().split('\n').join(' ').split(/\s+/g).join(' ');
  ele.value = text;
}

function f3(ele) {
  // 合并成一行，每个单词第一个字母大写
  const text = ele.value.trim()
                   .split('\n')
                   .join(' ')
                   .split(/\s+/g)
                   .map(d => d[0].toUpperCase() + d.slice(1) /*.toLowerCase()*/)
                   .join(' ');
  ele.value = text;
}

function f4(ele) {
  // 检测每一行，如果存在 "https://github.com/"，则替换成
  // "git@github.com:"
  const t1 = 'https://github.com/';
  const t2 = 'git@github.com:';
  const text_ori = ele.value;
  let lines = text_ori.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    if (String(lines[i]).indexOf('https://github.com/')) {
      lines[i] = lines[i].replace(t1, t2);
    }
  }
  ele.value = lines.join('\n');
}

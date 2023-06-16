// 解析库来源: http://shjs.sourceforge.net/lang/

/* 支持 cpp,python,csharp,xml */
let support_suffix = new Map([
  ["py", "python"],
  ["cs", "csharp"],
  ["xml", "xml"],
  ["js", "javascript"]
]);

// 默认 cpp, 因为后缀太多了
// (c, cc, cpp), (hpp, h)
let code_type = "cpp";

/**
 * 解析地址
 * @returns 返回文件地址
 */
function get_url() {
  let url = location.search; // url
  let target_cpp = "";
  let index = url.indexOf("?");
  if (index != -1) {
    target_cpp = url.substr(index + 1, url.length - index);
  } else {
    return "";
  }

  // console.log(target_cpp);
  if (
    target_cpp.startsWith("http") === false &&
    target_cpp.startsWith("/") === false
  ) {
    // 当前网页下的文件
    target_cpp = "/resources/Code/" + target_cpp;
  }
  // 找到类型
  for (let key of support_suffix.keys()) {
    if (target_cpp.endsWith(key)) {
      code_type = support_suffix.get(key);
      break;
    }
  }
  return target_cpp;
}

/**
 * 利用内置功能实现字符串转义
 * 来源: https://blog.nowcoder.net/n/a2713de085734204a22c3937974d8469
 * @param {String} html 待转义的字符串
 * @returns 转移后的字符串
 */
function encode_html(html) {
  // 1.首先动态创建一个容器标签元素，如 DIV
  let temp = document.createElement("div");
  // 2.然后将要转换的字符串设置为这个元素的 innerText 或者 textContent
  temp.textContent != undefined
    ? (temp.textContent = html)
    : (temp.innerText = html);
  // 3.最后返回这个元素的 innerHTML, 即得到经过 HTML 编码转换的字符串了
  let output = temp.innerHTML;
  temp = null;
  return output;
}

/**
 * 设置代码
 * @param {String} code 源代码
 */
function set_code(code) {
  // 1. 特殊字符的处理
  // (1) d3 自动转义
  let pre = d3.select("body").append("pre");
  pre.classed("sh_sourceCode", true);
  pre.classed("sh_" + code_type, true);
  pre.text(code);
  // (2) 原生的方式需要手动转义
  // $(document.body).append("<pre>" + encode_html(code) + "</pre>");

  // 注册高亮事件
  $(function () {
    sh_highlightDocument();
  });
}

/**
 * @param {String} url cpp 地址
 * @returns 处理 cpp 文件
 */
function deal_with_cpp(url) {
  if (url === "") {
    set_code("// No Code!");
    return;
  }

  d3.text(url)
    .then(function (cpp_data) {
      set_code(cpp_data);
      // $(document).ready(sh_highlightDocument);
    })
    .catch((e) => {
      set_code("// url: " + url + "\n// " + e);
    });
}

/**
 * main 函数
 */
function show_code_main() {
  // 1. 解析地址
  let url = get_url();

  // 2. 读取代码文件并设置代码格式
  deal_with_cpp(url);
}

show_code_main();

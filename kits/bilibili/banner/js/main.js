// find div with class name "animated-banner"
// read all content in file "utils/img-new.txt" then add the to the div

const IMG_DIV_TXT = 'utils/img1/div-new.txt';

let INITIAL_DX = null;

function main() {
  task2 =
      fetch(IMG_DIV_TXT).then(response => response.text()).then(div_content => {
        deal(div_content);
      });
}

function deal(div_content) {
  let div = d3.select('#outter');
  div.html(div_content);

  let imgs = d3.selectAll('.animated-banner>.layer').selectChildren();

  // [STEP#1] set initial dx
  INITIAL_DX = new Array(imgs.size()).fill(0);
  for (let i = 0; i < imgs.size(); ++i) {
    let img = imgs.nodes()[i];
    let transform_str = img.style.transform;
    let x = transform_str.indexOf('translate(');
    let y = transform_str.indexOf('px', x);
    let dx = parseFloat(transform_str.substring(x + 10, y));
    INITIAL_DX[i] = dx;
  }
}

// timer
// 1 second do
// 1. change the color of the div


// browser console helper

function timer1() {
  // set dx
  a = document.getElementsByClassName('animated-banner')[0].childNodes;
  dx = new Array(a.length).fill(0);
  for (let i = 0; i < a.length; ++i) {
    let transform = a[i].children[0].style.transform;
    // 'translate(0px, 0px) rotate(0deg) scale(1)'
    // get the translate tag, then get first number
    let x = transform.indexOf('translate(');
    let y = transform.indexOf('px', x);
    let x0 = parseFloat(transform.substring(x + 10, y));
    dx[i] = x0;
  }

  timer = setInterval(() => {
    a = document.getElementsByClassName('animated-banner')[0].childNodes;
    s = new Array(a.length).fill(0);
    for (let i = 0; i < a.length; ++i) {
      let transform = a[i].children[0].style.transform;
      // 'translate(0px, 0px) rotate(0deg) scale(1)'
      // get the translate tag, then get first number
      let x = transform.indexOf('translate(');
      let y = transform.indexOf('px', x);
      let x0 = parseFloat(transform.substring(x + 10, y));
      s[i] = x0 - dx[i];
    }

    // for (let i = 0; i < a.length; ++i) {
    //   s[i] /= s[1];
    // }

    console.log(s);
  }, 1000);

  // stop timer
  clearInterval(timer);
}
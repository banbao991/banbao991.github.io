// ==UserScript==
// @name        IMG80/100(hexo)
// @namespace   Violentmonkey Scripts
// @match       https://banbao991.github.io/*
// @grant       none
// @version     1.0
// @author      banbao990
// @description 2022/3/8 10:57:42
// ==/UserScript==

let button = document.createElement("button");
button.style.position = "fixed";
button.style.width  = "80px";
button.style.height = "30px";
button.style.top = "20px";
button.style.left = "20px";
button.textContent = "100%";
document.body.appendChild(button);


button.onclick = () => {
  let tmp = button.textContent;
  let update_text = "";
  if(tmp === "100%") {
      update_text = "80%";
  } else if(tmp === "80%") {
    update_text = "100%";
  }
  zoom(tmp);
  button.textContent = update_text;
}

function zoom( tag ) {
  let a = document.getElementsByTagName("img");

  for(let i = 0 ;i < a.length; ++i) {
    console.log(i);
    if(a[i].classList.length == 0) {
      a[i].style.zoom = tag;
    }
  }
}
// ==UserScript==
// @name        Github links
// @namespace   Violentmonkey Scripts
// @match       https://github.com/*
// @grant       none
// @version     1.0
// @author      banbao(990)
// @description 2020/10/14 12:24:10
// ==/UserScript==

// make the link open in the next tab

let a = document.getElementsByTagName("a");
let i;
for(i = 0;i < a.length; ++i){
    // anchor
    /* if(a[i].classList.contains("anchor")) {
     *     continue;
     * }
    */
    if(a[i].classList.length != 0) {
        continue;
    }
    if(a[i].href.indexOf('#') != -1) {
        continue;
    }
    a[i].target = "_blank";
}
'use strict';
// Shared DOM lookup and current inspection tool.
const $ = id => document.getElementById(id);

const wrap = document.getElementById('map-wrap');
const tooltip = document.getElementById('map-tooltip');

let tool = 'inspect';
let hover = null;

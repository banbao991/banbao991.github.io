/**
 * @author banbao990
 * @version 1.0
 */
'use strict';
const FONT_FAMILY = '"Times New Roman", "Microsoft YaHei"';
const DEBUG_ON = false;

class MyImage {
  constructor(path, info, data) {
    this._path = String(path);
    this._info = String(info);
    this._data = data;  // Image

    // path : xxx/year-month-day-index.suffix
    let p = String(path);
    let i = p.indexOf('/');
    if (i !== -1) {
      p = p.substring(i + 1);
    }
    i = p.indexOf('.');
    p = p.substring(0, i);

    let y_m_d = p.split('-');
    this._year = Number(y_m_d[0]);
    this._month = Number(y_m_d[1]);
    this._day = Number(y_m_d[2]);

    // this.output_info();
  }

  output_info() {
    console.log(`path: ${this._path}, info: ${this._info}, year: ${
        this._year}, month: ${this._month}, day: ${this._day}`)
  }
}

class MyBezier {
  constructor(sx, sy, tx, ty, cp1x, cp1y, cp2x, cp2y) {
    this.sx = sx;
    this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.cp1x = cp1x;
    this.cp1y = cp1y;
    this.cp2x = cp2x;
    this.cp2y = cp2y;
  }

  get_position(t) {
    const tb = t;
    const ta = 1 - tb;
    let cx = ta * ta * ta * this.sx + 3 * ta * ta * tb * this.cp1x +
        3 * ta * tb * tb * this.cp2x + tb * tb * tb * this.tx;
    let cy = ta * ta * ta * this.sy + 3 * ta * ta * tb * this.cp1y +
        3 * ta * tb * tb * this.cp2y + tb * tb * tb * this.ty;
    return {x: cx, y: cy, t: t};
  }
}

class MyData {
  constructor() {
    this._index_count = -1;
    this._index = new Map();
    this._data = new Array();
  }

  append(img) {
    if (this._index.get(img._year) === undefined) {
      ++this._index_count;
      this._index.set(img._year, this._index_count);
      this._data.push(new Array());
    }
    let index = this._index.get(img._year);
    this._data[index].push(img);
  }

  clear() {
    this._index_count = -1;
    this._index.clear();
    this._data.splice(0, this._data.length);
  }

  get_data(year) {
    let index = this._index.get(year);
    if (index === undefined) {
      console.log(`[MyData] map error:${year}`);
      return null;
    }
    return this._data[index];
  }

  get_all_data() {
    let ret = new Array();
    this._data.forEach((ele) => {ret = ret.concat(ret, ele)});
    return ret;
  }
}

// 全局变量
const WINDOW_INFO = {
  margin_rate_x: 0.05,
  margin_rate_y: 0.05,
  width: 0,
  height: 0,
};

const IMAGE_LIST = Array();
const DATA_LIST = new MyData();


function resize_font_size() {
  const window_height = $(window).height();
  d3.select('body').style(
      'font-size', `${Math.max(20, window_height * 0.028)}px`);
}

/**
 * main 函数
 */
function main() {
  d3.select(window).on('resize', (e) => {
    if (d3.select('#tip_wrapper') !== undefined) {
      update_info_size();
    }
    resize_font_size();
  });
  // 1. 设置各种属性
  init_the_window();
}


function update_window_info() {
  WINDOW_INFO.height = $(window).height();
  WINDOW_INFO.width = $(window).width();
}

function init_the_window() {
  resize_font_size();

  if (DEBUG_ON) {
    JSZipUtils.getBinaryContent('test-data/test.zip', function(err, data) {
      if (err) {
        console.log(err);
      } else {
        extract_zip_file(data);
      }
    });
  }

  update_info_size();

  $('#start_animation_btn').on('click', function(e) {
    animation_start();
  });

  $('#upload_zip').on('change', function(e) {
    upload_your_zip_file(e);
  });
}

/**
 * 上传一个 zip 压缩包
 * 压缩包里面的结构如下
 * (1) 根目录下有一个 main.txt 文件，表示需要使用的图片信息
 *  (1.1) main.txt 中没有标题
 *  (1.2) main.txt 中每一行格式 '图片路径 : 说明文字'(使用 `:` 分割)
 * (2) 若干图片，图片路径按照 main.txt 中图片路径进行索引
 *
 * 整体处理思路如下
 * (1) 使用一个 promise_list 链进行加载
 *  (1.1) 依次加载 zip 文件、main.txt 文件、图片文件
 *  (1.2) 等待图片文件实际加载完成 (onload)
 *  (1.3) 显示按钮
 * (2) 使用 promise_list = promise_list.then() 将链表指针移动到末尾
 * (3) 每一张图片有两个 promise
 *  (3.1) promise1 负责只用 JZip 的加载函数
 *  (3.2) promise2 处理 promise1 的加载结果，
 *        如果加载成功则为其构造一个 Image 对象，
 *        同时将其加入到 @image_promise_list 中，
 */
// Closure to capture the file information.
function extract_zip_file(f) {
  let result_div = $('#result');
  // remove content
  result_div.html('');

  let title_div = $('<h4>', {text: f.name});
  let error_div =
      $('<ul>').css('text-align', 'left').css('margin-left', '100px');
  result_div.append(title_div);
  result_div.append(error_div);

  // var for record the load time
  let date_before = new Date();
  // the loaded zip file
  let zip_file = null;
  // the whole promise chain
  let promise_list = null;
  // the promises the load the images (Image.onload)
  let image_promise_list = Array();
  // the image info lists for @image_promise_list
  let image_info_list = Array();

  let no_error = true;

  let error_fallback = function(e, info) {
    no_error = false;
    error_div.append($('<li>', {
      text: `[${info}]: ` + e.message,
    }));
  };

  let load_image =
      function(image_data) {
    return new Promise((resolve, reject) => {
      let buffer = new Uint8Array(image_data);
      let blob = new Blob([buffer.buffer]);
      let temp_image = new Image();
      temp_image.src = URL.createObjectURL(blob);
      temp_image.onload = function() {
        resolve(temp_image);
      };
      temp_image.onerror = function(e) {
        reject(e);
      }
    });
  }

  // (1) load zip file, "main.txt" file
  promise_list = JSZip.loadAsync(f).then(function(zip) {
    zip_file = zip;
    return zip_file.file('main.txt').async('string');
  }, (e) => error_fallback(e, zip.name));

  // (2) parse txt & load images
  promise_list = promise_list.then(function(txt) {
    let load_images = null;
    let image_path_list =
        String(txt).split(/\n/).map(x => x.split(':').map(x => x.trim()));

    let first_image = true;
    image_path_list.forEach(ele => {
      const image_path = ele[0];
      // load image, use JZip
      if (first_image) {
        first_image = false;
        // empty Promise()
        load_images = new Promise((resolve, reject) => {
          resolve();
        });
      }

      load_images = load_images.then(() => {
        return zip_file.file(image_path).async('arraybuffer');
      }, (e) => error_fallback(e, image_path));

      // load image, get data
      load_images = load_images.then((image_data) => {
        image_promise_list.push(load_image(image_data));
        image_info_list.push(ele);
      }, (e) => error_fallback(e, image_path));
    });
    return load_images;
  }, (e) => error_fallback(e, 'main.txt'));

  // (3) wait for all images onload()
  promise_list = promise_list.then(
      () => {Promise.allSettled(image_promise_list).then((result) => {
        // result.forEach((ele) => {
        //   console.log(
        //       ele.status, ':',
        //       (ele.status === 'fulfilled' ? ele.value : ele.reason));
        // });

        // construct the image infos
        for (let i = 0; i < image_info_list.length; ++i) {
          // console.log(image_info_list[i]);
          IMAGE_LIST.push(new MyImage(
              image_info_list[i][0], image_info_list[i][1], result[i].value))
        }
        if (DEBUG_ON) {
          let div_show_images = d3.select('#tip_wrapper').append('div');
          IMAGE_LIST.map(ele => ele._data).forEach((ele) => {
            let s = ele.height / ele.width;
            ele.width = 100;
            ele.height = s * ele.width;
            div_show_images.append(() => (ele));
          })
        }
      })});

  // (4) load end, add animation start label
  let not_succesful = () => {
    $('#animation_wrapper').css('display', 'none');
    d3.select('#result').style('display', 'block');
    d3.select('#tooltiptext').classed('tooltiptext', true);
  };
  promise_list =
      promise_list
          .then(function() {
            if (no_error) {
              $('#animation_wrapper').css('display', 'block');
              d3.select('#result').style('display', 'none');
              d3.select('#upload_wrapper').style('display', 'none');
            } else {
              not_succesful();
            }
          })
          .catch(function(e) {
            console.log(
                'There Must be Error When Handling the Result of the Asnyc Promise');
            no_error = false;
            error_div.append($('<li>', {text: e}));
            not_succesful();
          })
          .finally(function() {
            let date_after = new Date();
            title_div.append($('<span>', {
              class: 'small',
              text: ' (loaded in ' + (date_after - date_before) + 'ms)',
            }));
            if (no_error === false) {
              let ex_li = $('<li>', {text: '点击下载示例文件'});
              error_div.append(ex_li);
              ex_li.on('click', (e) => {
                window.location.href = './test-data/test.zip';
              })
            }
            update_info_size();
          });
}

function update_info_size() {
  const container = d3.select('#container');

  const tw = d3.select('#tip_wrapper');
  const f_h = container.node().clientHeight;
  const n_h =
      tw.selectChildren().nodes().reduce((sum, d) => (sum + d.clientHeight), 0);
  tw.style('margin-top', `${(f_h - n_h) / 2}px`);
}

function upload_your_zip_file(evt) {
  let files = evt.target.files;
  for (let i = 0; i < files.length; i++) {
    extract_zip_file(files[i]);
  }
}

/**
 * 开始动画
 */
function animation_start() {
  update_window_info();

  // (1) prepare the svg
  d3.select('#container').select('*').remove();
  const svg = d3.select('#container').append('svg');
  const margin = {
    top: WINDOW_INFO.height * WINDOW_INFO.margin_rate_y,
    right: WINDOW_INFO.width * WINDOW_INFO.margin_rate_x,
    bottom: WINDOW_INFO.height * WINDOW_INFO.margin_rate_y,
    left: WINDOW_INFO.width * WINDOW_INFO.margin_rate_x,
  };
  const svg_width = WINDOW_INFO.width - margin.left - margin.right;
  const svg_height = WINDOW_INFO.height - margin.top - margin.bottom;

  // set postion
  svg.attr('width', svg_width)
      .attr('height', svg_height)
      .attr('overflow', 'visible')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // (2) update data
  DATA_LIST.clear();
  IMAGE_LIST.forEach((ele) => {
    DATA_LIST.append(ele);
  })

  // (3) draw year ball
  draw_year_balls();
  // draw_month_circles(2022);
}

/**
 * 年份画成几个小球
 */
function draw_year_balls() {
  const svg = d3.select('#container').select('svg');
  const svg_height = svg.attr('height');
  const svg_width = svg.attr('width');

  const plane_margin = 0.4;
  const plane = svg_height * (1 - plane_margin);

  // (1) 绘制小球
  const num = DATA_LIST._index_count + 1;
  const r_padding = 1.5;
  const total_segments = 2 * num - 1 + 2 * r_padding;
  const ball_radius = Math.min(svg_width, svg_height) / total_segments * 0.7;
  let year_map =
      Array.from(DATA_LIST._index)
          .map((ele) => ({year: ele[0], index: ele[1]}))
          .map((ele) => ({
                 year: ele.year,
                 index: ele.index,
                 x: (((ele.index) * 2 + 0.5 + r_padding) / total_segments) *
                     svg_width,
                 y: -100 + 50 * (Math.random() - 0.5),
                 end_y: plane + 50 * (Math.random() - 0.5),
                 v: 0,
                 bounces: 0,
               }));

  const balls_g = svg.append('g')
                      .attr('id', 'year_balls_g')
                      .selectAll('g')
                      .data(year_map)
                      .join('g')
                      .attr('transform', (d) => {
                        return `translate(${d.x}, ${d.y})`;
                      });

  const balls = balls_g.append('circle')
                    .attr('stroke', 'none')
                    .attr('fill', '#ffc0cb')
                    .attr('r', ball_radius);

  const balls_text = balls_g.append('text').text((d) => (d.year));

  // (2) 动画
  {
    let last_time = 0;
    let total_iteration = 0;
    const ball_timer = d3.timer((elapsed) => {
      ++total_iteration;
      const step_rate = 0.01;
      const dt = (elapsed - last_time) * step_rate;
      last_time = elapsed;

      const damping = 0.5;
      let changed = false;
      const gravity = 9.8;

      year_map.map((d) => {
        // semi-implicit method
        let y = d.y + d.v * dt;
        d.v += gravity * dt;
        if (y + ball_radius > d.end_y) {
          y = d.end_y - ball_radius;
          d.v = -d.v * damping;
        }
        // if no change (and near the end_y)
        if (Math.abs(d.y - y) > 0.5 ||
            Math.abs(y + ball_radius - d.end_y) > 50) {
          changed = true;
        }
        d.y = y;
        return d;
      });

      balls_g.data(year_map).attr(
          'transform', (d) => (`translate(${d.x}, ${d.y})`));
      if (!changed) {
        // console.log(
        //     `[Year Balls] total_iterations: ${total_iteration}, timer
        //     ends!`);
        ball_timer.stop();
        balls_g.on('click', (e, d) => {
          draw_month_circles(d.year);
        })
      }
    }, 100);
  }
}

/**
 * 月份画在一个贝塞尔曲线上
 */
function draw_month_circles(year) {
  const svg = d3.select('#container').select('svg');
  const svg_height = svg.attr('height');
  const svg_width = svg.attr('width');

  let data_this_year = new Array();
  {
    // map-reduce by key _month
    const data_temp =
        DATA_LIST.get_data(year).sort((a, b) => (a._month - b._month));
    let last_month = data_temp[0]._month;
    let j = 0;
    data_this_year.push(new Array());
    data_this_year[j].push(data_temp[0]);
    for (let i = 1; i < data_temp.length; ++i) {
      let ele = data_temp[i];
      if (ele._month !== last_month) {
        data_this_year.push(new Array());
        ++j;
        last_month = ele._month;
      }
      data_this_year[j].push(ele);
    }
  }

  svg.selectAll('*').remove();

  // (1) 绘制贝塞尔曲线
  let road_curve = null;
  {
    const h = svg_height;
    const w = svg_width;
    const margin = 0.1;
    const cp_x_offset = 1.4;
    const cp_y_offset = 0.6;
    const c = 0.5;
    road_curve = new MyBezier(
        margin * w,
        margin * h,
        w - margin * w,
        h - margin * h,
        w * (c + cp_x_offset),
        h * (c - cp_y_offset),
        w * (c - cp_x_offset),
        h * (c + cp_y_offset),
    );

    const p = d3.path();
    p.moveTo(road_curve.sx, road_curve.sy);
    p.bezierCurveTo(
        road_curve.cp1x, road_curve.cp1y, road_curve.cp2x, road_curve.cp2y,
        road_curve.tx, road_curve.ty);
    let road = svg.append('path')
                   .attr('d', p.toString())
                   .attr('fill', 'none')
                   .attr('stroke', '#5f9ea0');
  }

  // (2) 绘制月份小球，沿着曲线绘制
  {
    const num = data_this_year.length;

    // [1] uniform length distribution
    // 暴力解法：均匀采样很多时间点
    // t，计算离散长度和，找到均匀的位置
    let circle_pos = new Array();
    {
      let length = 0;
      // calculate @length
      const SAMPLES = 1000;
      const delta_t = 1 / (SAMPLES + 1);
      let t = 0;
      let last_point = {x: road_curve.sx, y: road_curve.sy};
      for (let i = 1; i <= SAMPLES; ++i) {
        let now = road_curve.get_position(t);
        let x = now.x - last_point.x;
        let y = now.y - last_point.y;
        length += Math.sqrt(x * x + y * y);

        last_point = now;
        t += delta_t;
      }

      // set @circle_pos
      const margin_rate = 0.5;  // 边上的小段相当于中间正常的几小段
      const total_length = length;
      const delta_length = total_length / (num - 1 + margin_rate * 2);
      let target_length = delta_length * margin_rate;
      length = 0;
      t = 0;

      last_point = {x: road_curve.sx, y: road_curve.sy};
      for (let i = 1; i <= SAMPLES; ++i) {
        let now = road_curve.get_position(t);
        let x = now.x - last_point.x;
        let y = now.y - last_point.y;

        length += Math.sqrt(x * x + y * y);
        if (length > target_length) {
          target_length += delta_length;
          circle_pos.push(now);
          if (circle_pos.length >= num) {
            break;
          }
        }

        last_point = now;
        t += delta_t;
      }
    }

    const start_point = circle_pos[Math.floor(circle_pos.length / 2)];

    // [2] draw the circles
    {
      const color_transition = {s: '#ffc0cb', t: '#ff8888'};
      const r_transition = {
        s: Math.min(svg_height, svg_width) / 20,
        t: Math.min(svg_height, svg_width) / 20 * 1.5,
      };
      const circles_g = svg.append('g')
                            .attr('id', 'circles_g')
                            .selectAll('g')
                            .data(circle_pos)
                            .join('g')
                            .attr('transform', ` translate(
          ${start_point.x}, ${start_point.y}) `);

      const circles = circles_g.append('circle')
                          .attr('stroke', 'none')
                          .attr('fill', color_transition.s)
                          .attr('r', r_transition.s);
      const circles_text = circles_g.append('text')
                               .data(data_this_year)
                               .text((d, i) => (d[0]._month));
      //  .text((d, i) => (data_this_year[i][0]._month));

      const circle_moving_timer = d3.timer((elapsed) => {
        const MOVING_TIME = 1000;

        let t = Math.min((elapsed / MOVING_TIME), 1.0);
        circles_g.attr('transform', (d) => {
          let p = road_curve.get_position(
              t * (d.t - start_point.t) + start_point.t);
          return ` translate(${p.x}, ${p.y}) `
        });

        // 在移动完之后再停止，之前可能还没移动到最终的地方
        if (elapsed > MOVING_TIME) {
          console.log(`[Month Balls] timer stops!`);
          circle_moving_timer.stop();
          // 在移动事件结束的时候加上事件函数
          circles_g
              .on('mouseover',
                  function(e, d) {
                    // console.log(this, e, d,
                    // 'mouseover');
                    d3.select(this)
                        .selectAll('circle')
                        .transition()
                        .duration(600)
                        .attr('fill', color_transition.t)
                        .attr('r', r_transition.t);
                  })
              .on('mouseout',
                  function(e, d) {
                    // console.log(this, e, d,
                    // 'mouseout');
                    d3.select(this)
                        .selectAll('circle')
                        .transition()
                        .duration(600)
                        .attr('fill', color_transition.s)
                        .attr('r', r_transition.s);
                  })
              .on('click', function(e, d, i) {
                // console.log(this, e, d, 'click');
                // manualy trigger click event, use to
                // restore state
                // d3.select(this).dispatch('mouseout');
                open_the_related_event(this, road_curve, year);
              });
        }
      });
    }
  }
}

function open_the_related_event(ele, road_curve, year) {
  const circles_parent = d3.select('#circles_g');
  const circles_g = circles_parent.selectAll('g');
  circles_g.on('mouseover', null).on('mouseout', null).on('click', null);

  const select_circle_g = d3.select(ele);
  // move the select element to the top
  // solution 1: append()
  // circles_parent.append(() => select_circle_g.node());
  // solution 2: raise()
  select_circle_g.raise();

  const end_point = select_circle_g.data()[0];
  const circle_moving_timer = d3.timer((elapsed) => {
    const MOVING_TIME = 1000;
    let t = Math.min((elapsed / MOVING_TIME), 1.0);
    circles_g.attr('transform', (d, i) => {
      let p = road_curve.get_position(t * (end_point.t - d.t) + d.t);
      return `translate(${p.x}, ${p.y}) `
    });

    // 在移动完之后再停止，之前可能还没移动到最终的地方
    if (elapsed > MOVING_TIME) {
      circle_moving_timer.stop();
      const select_text = select_circle_g.selectAll('text');
      show_pics(year, Number(select_text.text()), select_text.data()[0]);
    };
  });
}

/**
 * 显示图片
 */
function show_pics(year, month, images_original) {
  let images = images_original;
  d3.select('#container').select('svg').remove();

  let div_show_images = d3.select('#container')
                            .append('div')
                            .style('margin-left', 'auto')
                            .style('margin-right', 'auto')
                            .style('user-select', 'none')
                            .style('position', 'relative')
                            .style('font-family', FONT_FAMILY);

  // 轮播图效果
  {
    let img_idx = 0;
    let cannot_auto_play = false;
    let auto_play_timer = null;
    let offset_for_auto_play_img_idx = 0;

    show_img_with_index();

    function show_img_with_index() {
      const div_height = $(window).height();
      const div_width = $(window).width();

      const image_height = div_height * 0.5;

      function get_image_width(d) {
        return d.width / d.height * image_height;
      }

      const max_width =
          d3.max(DATA_LIST.get_all_data().map((d) => get_image_width(d._data)));

      const raw = images[img_idx];
      div_show_images.selectAll('*').remove();

      const ele = raw._data;
      let ele_width = get_image_width(ele);
      div_show_images.style('width', `${max_width}px`)
          .style('margin-top', `${image_height / 400 * 50}px`);

      // [1] image
      div_show_images.append('div')
          .style('height', `${image_height}px`)
          .style('margin', '0 auto')  // center
          .style('width', `${ele_width}px`)
          .style('text-align', `center`)
          .append(() => (ele))
          .style('height', '100%')
          .style('width', '100%');
      // .on('click', () => {
      //   img_idx = (img_idx + 1) % images.length;
      //   show_img_with_index(img_idx);
      // });

      // [2] button
      const button_type = update_buttons(cannot_auto_play);
      const button_type_num = button_type.length;
      div_show_images.append('div')
          .style('text-align', 'center')
          // the value is by testing
          .selectAll('div')
          .data(button_type)
          .join('div')
          // 2 rows, not so crowded
          .style('width', `${(max_width - 1) / button_type_num * 2}px`)
          .style('display', 'inline-block')
          .style('margin', '20px 0')
          .append('i')
          .attr('title', (d) => (d.title))
          .attr('class', (d) => (d.class))
          .on('click', (e, d) => {
            if (d.i === 0) {
              offset_for_auto_play_img_idx -= img_idx;
              img_idx = 0;
            } else if (d.i === 1) {
              --offset_for_auto_play_img_idx;
              img_idx = (img_idx - 1 + images.length) % images.length;
            } else if (d.i === 2) {
              ++offset_for_auto_play_img_idx;
              img_idx = (img_idx + 1) % images.length;
            } else if (d.i === 3) {
              // auto play
              if (cannot_auto_play === false) {
                offset_for_auto_play_img_idx = img_idx;
                let last_img_idx = img_idx;
                cannot_auto_play = true;
                // 每隔多久更新一次图片
                const update_image_time_interval = 5000;
                let update_image_time = 0;
                if (auto_play_timer === null) {
                  auto_play_timer = d3.timer((elapsed) => {
                    {
                      // 每隔 update_image_time_interval 时间更新一次
                      if (elapsed < update_image_time) {
                        return;
                      }
                      update_image_time += update_image_time_interval;
                    }

                    // 自动播放的时候允许点击上一张、下一张、回到第一张
                    img_idx = Math.floor(
                        elapsed / update_image_time_interval +
                        offset_for_auto_play_img_idx);
                    img_idx = ((img_idx % images.length) + images.length) %
                        images.length;

                    // console.log(img_idx, images.length,
                    // offset_for_auto_play_img_idx);

                    if (img_idx === last_img_idx) {
                      return;
                    }
                    if (img_idx < images.length) {
                      last_img_idx = img_idx;
                      show_img_with_index();
                    } else {
                      // infinite loop
                      // img_idx = images.length - 1;
                      // cannot_auto_play = false;
                      // auto_play_timer.stop();
                      // auto_play_timer = null;
                      // console.log('Stop Auto Playing!');
                      // show_img_with_index();  // update button

                      console.log('[Button Click] No Reach Here');
                    }
                  }, 100);
                }
              } else {
                cannot_auto_play = false;
                auto_play_timer.stop();
                auto_play_timer = null;
                console.log('Manually Stop Auto Playing!');
              }
            } else if (d.i === 4) {
              // fetch all images
              if (cannot_auto_play === false) {
                images = DATA_LIST.get_all_data();
                img_idx =
                    Math.floor(Math.random() * images.length) % images.length;
              }
            } else if (d.i === 5) {
              if (auto_play_timer !== null) {
                auto_play_timer.stop();
                auto_play_timer = null;
                console.log('[auto_play_timer]: force stop!');
              }
              d3.select('#container').select('div').remove();
              animation_start();
            } else {
              console.log('[div_show_images]: on(\'click\') error!');
            }
            // console.log(img_idx);
            show_img_with_index();
          });

      // [3] infos
      div_show_images.append('div').html(raw._info).style(
          'text-align', 'center');
    }
  }
}


/**
 *  更新 show_pic() 函数中的按钮
 */
function update_buttons(cannot_auto_play) {
  const num = 6;
  let classes = [
    'fa-backward-fast', 'fa-circle-left', 'fa-circle-right',
    (cannot_auto_play === true ? 'fa-stop' : 'fa-play'), 'fa-reply-all',
    'fa-arrow-rotate-left'
  ];
  let titles = [
    '第一张图片', '上一张图片', '下一张图片',
    `${(cannot_auto_play === true ? '停止' : '')}自动播放`,
    '选择所有日期图片，定位到随机一张(自动播放时失效)', '返回选择年界面'
  ];
  let t = new Array();
  for (let i = 0; i < num; ++i) {
    t.push({
      class: `fa-solid ${classes[i]}`,
      title: titles[i],
      i: i,
    });
  }
  return t;
}
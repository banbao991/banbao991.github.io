
let goneSet = null;
let goneTimeMap = null;

let isWe = true;

const SVG_SIZE_RATE = 1.0;

const BASE_COLOR_PROVINCE = '#69b3a2';
const BASE_COLOR_CITY = '#a8ddb5';

const GONE_COLOR = '#ff9f64';

function isGoneProvince(d) {
  return goneSet.has(d.properties.fullname);
}

function provinceColor(d) {
  return isGoneProvince(d) ? GONE_COLOR : BASE_COLOR_PROVINCE;
}

function isGoneCity(d) {
  return goneSet.has(d);
}

function cityColor(d) {
  return isGoneCity(d) ? GONE_COLOR : BASE_COLOR_CITY;
}

function draw_main(geojson) {
  // 设置 SVG 的宽度和高度为窗口大小
  const width = window.innerWidth * SVG_SIZE_RATE;
  const height = window.innerHeight * SVG_SIZE_RATE;

  // 创建 SVG 元素
  const svg =
      d3.select('svg')
          .style('position', 'fixed')  // 固定定位
          .style('top', 0)             // 顶部对齐
          .style('left', 0)            // 左侧对齐
          .attr('width', width)
          .attr('height', height)
          .style('margin-left', (window.innerWidth - width) / 2 + 'px')
          .style('margin-top', (window.innerHeight - height) / 2 + 'px');

  svg.on('click', reset);



  // 创建投影和路径生成器
  let projection = d3.geoMercator()
                       .center([104, 37])  // 中国的大致中心
                       .scale(1000)
                       .translate([width / 2, height / 2]);

  let path = d3.geoPath().projection(projection);

  // 创建一个分组（g）来包含省级路径元素
  const province = svg.append('g');

  // 创建一个分组（g）来包含市级路径元素
  const cityGroup = svg.append('g');

  // 绘制省级地图
  province.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr(
          'fill',
          function(d) {
            return provinceColor(d);
          })
      .attr('stroke', '#fff')
      // .attr('stroke-width', 1)
      .on('click', function(event, d) {
        event.stopPropagation();
        province.selectAll('path').attr('fill', BASE_COLOR_PROVINCE);
        // 点击省份时放大并加载市级数据
        zoomToFeature(d);
        loadCityData(d.properties);
      });

  province.selectAll('path')
      .on('mouseover',
          function(event, d) {
            tooltip.style('opacity', 1)
                .html(d.properties.fullname)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px');
          })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });

  // province.selectAll('path').append('title').text(d => d.properties.name);

  // 初始化缩放行为
  const zoom = d3.zoom()
                   .scaleExtent([1, 50])  // 设置缩放范围
                   .on('zoom', function(event) {
                     // 缩放时更新路径的变换
                     province.attr('transform', event.transform);
                     province.attr('stroke-width', 1 / event.transform.k);
                     cityGroup.attr('transform', event.transform);
                     cityGroup.attr('stroke-width', 1 / event.transform.k);
                     cityGroup.attr('font-size', 18 / event.transform.k);
                   });

  const tooltip = d3.select('.tooltip');

  // 将缩放行为应用到 SVG
  svg.call(zoom);


  {
    const provinceSize =
        Array.from(goneSet).filter(e => e.indexOf('-') == -1).length;
    const citySize =
        Array.from(goneSet).filter(e => e.indexOf('-') != -1).length;
    svg.append('text')
        .attr('x', 50)
        .attr('y', 50)
        .attr('font-size', 20)
        .text(
            (isWe ? '我们' : '') + '已经去过的地方：' + provinceSize +
            '个省份，' + citySize + '个城市')
        .on('click', function() {
          d3.select('svg').selectAll('*').remove();
          isWe = !isWe;
          main();
        });
  }

  // 点击省份时的放大函数
  function zoomToFeature(feature) {
    // 获取点击的省份的边界框
    const bounds = path.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = 0.9 / Math.max(dx / width, dy / height);
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    // 使用 zoom.transform 实现平滑过渡
    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  // 加载市级数据的函数
  function loadCityData(cityData) {
    const code = cityData.code;
    const cityFullName = cityData.fullname;

    // 清除之前的市级地图
    cityGroup.selectAll('path').remove();
    cityGroup.selectAll('text').remove();

    if (code == undefined) {
      return;
    }
    // 动态加载市级数据
    d3.json(`data/shi/${code}.json`)
        .then(function(cityData) {
          // 绘制市级地图
          cityGroup.selectAll('path')
              .data(cityData.features)
              .enter()
              .append('path')
              .attr('d', path)
              // 市级区域填充颜色
              .attr(
                  'fill',
                  function(d) {
                    return cityColor(cityFullName + '-' + d.properties.name);
                  })
              // 市级边界颜色
              .attr('stroke', '#fff')
              // 市级边界宽度
              // .attr('stroke-width', 0.5)
              .on('click', cityClicked);

          // tooltip
          cityGroup.selectAll('path')
              .on('mouseover', cityMouseOver)
              .on('mouseout', cityMouseOut);
          cityGroup.selectAll('text')
              .on('mouseover', cityMouseOver)
              .on('mouseout', cityMouseOut);

          // cityGroup.selectAll('path').append('title')
          // .text(d => d.properties.fullname);

          // 显示市级名称
          cityGroup.selectAll('text')
              .data(cityData.features)
              .enter()
              .append('text')
              .attr('x', d => path.centroid(d)[0])
              .attr('y', d => path.centroid(d)[1])
              .attr('text-anchor', 'middle')
              .style('writing-mode', 'tb-rl')  // 文字竖直排列
              //   .attr('font-size', 5)
              .attr('fill', 'black')
              .text(d => d.properties.name)
              .on('click', cityClicked);

          function cityMouseOver(event, d) {
            tooltip.style('opacity', 1)
                .html(function() {
                  let mapKey = cityFullName + '-' + d.properties.name;
                  let suffix = goneTimeMap.has(mapKey) ?
                      ('<br>' + goneTimeMap.get(mapKey).join(', ')) :
                      '';
                  return d.properties.name + '<br>' + suffix;
                })
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px');
          }

          function cityMouseOut() {
            tooltip.style('opacity', 0);
          }

          function cityClicked(event, d) {
            event.stopPropagation();
            // 点击时，边界变红，对应文字也变红
            cityGroup.selectAll('path')
                .filter(e => e == d)
                .attr('stroke', 'red')
                .attr('fill', 'pink');
            cityGroup.selectAll('text').filter(e => e == d).attr('fill', 'red');
            // 其他的都恢复原样
            cityGroup.selectAll('path')
                .filter(e => e != d)
                .attr('stroke', '#fff')
                .attr('fill', function(d) {
                  return cityColor(cityFullName + '-' + d.properties.name);
                });
            cityGroup.selectAll('text')
                .filter(e => e != d)
                .attr('fill', 'black');
          }
        })
        .catch(function(error) {
          console.error('Error loading city data:', error);
        });
  }

  function reset() {
    svg.transition().duration(750).call(
        zoom.transform, d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([width / 2, height / 2]));
    cityGroup.selectAll('text').remove();
    cityGroup.selectAll('path').remove();
    province.selectAll('path').attr('fill', function(d) {
      return provinceColor(d);
    });
  }


  // 窗口大小变化时的调整函数
  function handleResize() {
    const newWidth = window.innerWidth * SVG_SIZE_RATE;
    const newHeight = window.innerHeight * SVG_SIZE_RATE;

    // 更新 SVG 的大小
    svg.attr('width', newWidth)
        .attr('height', newHeight)
        .style('margin-left', (window.innerWidth - newWidth) / 2 + 'px')
        .style('margin-top', (window.innerHeight - newHeight) / 2 + 'px');

    // 更新投影的平移和缩放
    projection.translate([newWidth / 2, newHeight / 2]);
    path = d3.geoPath().projection(projection);

    // 重新绘制省级地图
    province.selectAll('path').attr('d', path);

    // 重新绘制市级地图
    cityGroup.selectAll('path').attr('d', path);
    cityGroup.selectAll('text')
        .attr('x', d => path.centroid(d)[0])
        .attr('y', d => path.centroid(d)[1]);
  }

  // 监听窗口大小变化事件
  window.addEventListener('resize', handleResize);
}

function initGoneSet(geojson, travel) {
  goneSet = new Set();
  goneTimeMap = new Map();

  let totalSet = new Set();
  for (let i = 0; i < geojson.features.length; i++) {
    totalSet.add(geojson.features[i].properties.fullname);
  }
  // console.log(totalSet);

  travel.split('\n').forEach(line => {
    if (line.startsWith('#')) {
      return;
    }
    const parts = line.split(',');
    const time = parts[0];
    const dst = parts[1].trim().replace(/ /g, '');
    const province = dst.split('-')[0];
    if (!totalSet.has(province)) {
      console.error('unknown province:"', province, '"');
      return;
    }

    function pushGoneTime(province, time) {
      goneSet.add(province);
      if (time == '--') {
        return;
      }
      if (goneTimeMap.has(province)) {
        let oldTime = goneTimeMap.get(province);
        goneTimeMap.set(province, oldTime.concat([time]));
      } else {
        goneTimeMap.set(province, [time]);
      }
    }

    pushGoneTime(province, time);
    if (dst.indexOf('-') != -1) {
      // 省-市, fullname-name
      pushGoneTime(dst, time);
    } else {
      // 省, fullname
    }
  });

  // goneTimeMap 去重、排序
  goneTimeMap.forEach((value, key) => {
    let set = new Set(value);
    let arr = Array.from(set);
    arr.sort();
    goneTimeMap.set(key, arr);
  });

  // console.log(goneSet);
  // console.log(goneTimeMap);
}

function main() {
  const goneFile = isWe ? 'gone-we.txt' : 'gone.txt';
  task1 = d3.json('data/china.json');
  task2 = fetch(goneFile).then(response => response.text());
  Promise.all([task1, task2]).then(([geojson, travel]) => {
    initGoneSet(geojson, travel);
    draw_main(geojson);
  });
}

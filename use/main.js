let DATA;

$(window).on('load', () => {
  let warpper = d3.select('body')
                    .append('div')
                    .classed('container', true)
                    .append('div')
                    .classed('grid', true);

  // 添加小项
  d3.csv('data/infos.csv').then(function(data) {
    DATA = data;
    let link = data['columns'][0].trim();
    let info = data['columns'][1].trim();
    // 没有时间也是可以的
    let date = 'date';
    // 1 个月
    const MONTH = 1000 * 60 * 60 * 24 * 30;
    const NEW_TIME = 1;
    for (let i = 0; i < data.length; ++i) {
      let li = warpper.append('div')
                   .classed('item', true)
                   .attr('data-tooltip', data[i][info]);

      li.append('a')
          .attr('href', data[i][link])
          .attr('target', '_blank')
          .html(data[i][info]);

      if (date !== undefined) {
        li.attr('title', data[i][date]);
        let delta_time =
            (new Date().getTime() - new Date(data[i][date]).getTime()) / MONTH;
        if (delta_time < NEW_TIME) {
          li.append('span').classed('new-badge', true).html('NEW');
        }
      }
    }
  });
});
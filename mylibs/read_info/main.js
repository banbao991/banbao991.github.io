let DATA;

$(window).on('load', () => {
  let warpper = d3.select('body').append('div').attr('id', 'warpper');
  let windows_width = $(window).width();
  let warpper_width = Math.max(400, windows_width * 0.6);
  // 大小与左边距
  warpper.style('width', warpper_width + 'px');
  warpper.style('margin-left', (windows_width - warpper_width) / 2 + 'px');

  // 添加小项
  d3.csv('infos.csv').then(function(data) {
    DATA = data;
    let link = data['columns'][0].trim();
    let info = data['columns'][1].trim();
    // 没有时间也是可以的
    let date = 'date';
    // 1 个月
    const MONTH = 1000 * 60 * 60 * 24 * 30;
    const NEW_TIME = 1;
    for (let i = 0; i < data.length; ++i) {
      let li = warpper.append('a')
                   .attr('href', data[i][link])
                   .attr('target', '_blank')
                   .attr('rel', 'noopener noreferrer')
                   .append('li')
                   .html(data[i][info]);
      if (date !== undefined) {
        li.attr('title', data[i][date]);
        let delta_time =
            (new Date().getTime() - new Date(data[i][date]).getTime()) / MONTH;
        if (delta_time < NEW_TIME) {
          li.append('sup').html('NEW');
        }
      }
    }
  });
});

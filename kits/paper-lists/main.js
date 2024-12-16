const PAPER_FILE = 'paper.txt';

function main() {
  task2 = fetch(PAPER_FILE).then(response => response.text()).then(data => {
    deal(data);
  });
}

function gen_kv(txt) {
  // split by line, trim ,skip empty lines
  let lines = txt.split('\n').map(x => x.trim()).filter(x => x.length > 0);
  let map = [];
  let k = '';
  let kv = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.startsWith('*')) {
      if (k.length > 0 && kv.length > 0) {
        map.push([k, kv]);
      }
      k = line.substring(1);
      kv = [];
    } else {
      kv.push(line);
    }
  }
  map.push([k, kv]);

  // ele in map is [k, arr[v1, v2, ...]]
  // arr is info, link, info, link, ...
  // need to transform to [k, [a, a, ...]]
  // a = <a href="link">info</a>
  map = map.map(x => {
    let k = x[0];
    let v = x[1];
    let a = [];
    for (let i = 0; i < v.length; i += 2) {
      a.push('<a target="_blank" href="' + v[i + 1] + '">' + v[i] + '</a>');
    }
    let info_tag = k.split(';');
    if (info_tag.length != 2) {
      console.log('Error: wrong tag format', k);
    }
    return [info_tag[0], info_tag[1], a];
  });

  // check ele of map have different ele[1]
  let set = new Set();
  for (let i = 0; i < map.length; i++) {
    set.add(map[i][1]);
  }
  if (set.size != map.length) {
    console.log('Error: duplicate tags', map);
  }

  return map;
}

function deal(txt) {
  let map = gen_kv(txt);
  console.log(map);

  const container =
      d3.select('#my_container').append('div').classed('row', true);

  let active_idx = Math.floor(Math.random() * map.length);

  container.append('div')
      .classed('col-4', true)
      .append('div')
      .classed('list-group', true)
      .attr('id', 'list-tab')
      .attr('role', 'tablist')
      .selectAll('a')
      .data(map)
      .enter()
      .append('a')
      .classed('list-group-item list-group-item-action', true)
      .attr('id', d => 'list-' + (d[1]).toLowerCase() + '-list')
      .attr('data-bs-toggle', 'tab')
      .attr('href', d => '#list-' + (d[1]).toLowerCase())
      .attr('aria-controls', d => 'list-' + (d[1]).toLowerCase())
      .attr('role', 'tab')
      // set first to true
      .attr('aria-selected', (d, i) => (i == active_idx))
      .classed('active', (d, i) => (i == active_idx))
      .text(d => d[0]);

  container.append('div')
      .classed('col-8 text-start', true)
      .append('div')
      .classed('tab-content', true)
      .attr('id', 'nav-tabContent')
      .selectAll('div')
      .data(map)
      .enter()
      .append('div')
      .classed('tab-pane fade', true)
      .attr('id', d => 'list-' + (d[1]).toLowerCase())
      .attr('role', 'tabpanel')
      .attr('aria-labelledby', d => 'list-' + (d[1]).toLowerCase() + '-list')
      .classed('show active', (d, i) => (i == active_idx))
      .html(d => d[2].map(x => '<p>' + x + '</p>').join(''));
}

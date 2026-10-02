'use strict';
// The village notice board keeps several independently timed orders.
let renderedOrders = '';
function updateOrdersUI() {
  const orders = [...farm.orders].sort((a, b) => a.due - b.due || a.id - b.id);
  ui.orderSummary.textContent = `${orders.length} 份委托${orders.length > 3 ? ' · 向下滚动' : ''}`;
  const signature = `${farm.day}:${JSON.stringify(orders)}`;
  if (signature === renderedOrders) return;
  renderedOrders = signature;
  const scroll = ui.orderList.scrollTop;
  ui.orderList.replaceChildren(...orders.map(order => {
    const card = document.createElement('article'); card.className = 'order-item';
    const main = document.createElement('div'); main.className = 'order-main';
    const icon = document.createElement('span'); icon.className = 'order-icon';
    icon.textContent = { wheat: '✽', carrot: '♧', pumpkin: '●', strawberry: '♥', corn: '✦' }[order.crop];
    const heading = document.createElement('div');
    const from = document.createElement('small');
    from.textContent = `阿葵委托 · 第 ${order.due} 天截止 · ${order.due === farm.day ? '今日' : `余 ${order.due - farm.day} 天`}`;
    const name = document.createElement('strong'); name.textContent = `新鲜${crops[order.crop].name}`;
    heading.append(from, name);
    const reward = document.createElement('span'); reward.className = 'order-reward';
    reward.textContent = `+${order.reward} 金`;
    main.append(icon, heading, reward);
    const line = document.createElement('div'); line.className = 'order-progress-line';
    const track = document.createElement('div'); track.className = 'order-progress-track';
    const fill = document.createElement('span'); fill.style.width = `${order.progress / order.target * 100}%`;
    track.append(fill);
    const count = document.createElement('strong'); count.textContent = `${order.progress} / ${order.target}`;
    line.append(track, count);
    const focus = document.createElement('button'); focus.type = 'button';
    focus.className = `order-focus${order.focus ? ' active' : ''}`;
    focus.setAttribute('aria-pressed', String(!!order.focus));
    focus.textContent = order.focus ? '✦ 优先种植' : '✧ 设为优先种植';
    focus.addEventListener('click', () => {
      for (const entry of farm.orders) entry.focus = entry.id === order.id ? !entry.focus : false;
      updateUI(); save();
    });
    card.append(main, line, focus);
    return card;
  }));
  ui.orderList.scrollTop = scroll;
}

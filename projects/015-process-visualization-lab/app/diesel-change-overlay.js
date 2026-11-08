const changeChannels = [
  { id: 'torque', field: 'torqueNm', from: 'watchStart', to: 'firstZeroTorque', label: '扭矩首笔归零', unit: 'N·m' },
  { id: 'railPressure', field: 'railPressureMpa', from: 'watchStart', to: 'watchMinRailPressure', label: '片段轨压最低', unit: 'MPa' },
  { id: 'rpm', field: 'rpm', from: 'watchMinRailPressure', to: 'minSpeed', label: '全程转速最低', unit: 'rpm' },
];

const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
const seconds = time => time.toFixed(1) + ' 秒';

export function createDieselChangeOverlay(parent, { onSelect } = {}) {
  const document = parent.ownerDocument;
  const strip = document.createElement('div');
  strip.className = 'diesel-change-strip';
  strip.setAttribute('role', 'group');
  strip.setAttribute('aria-label', '台架原档变化，比较各标注节点的采样');
  strip.hidden = true;
  parent.appendChild(strip);

  const cards = changeChannels.map(channel => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'diesel-change';
    button.dataset.channel = channel.id;
    const time = document.createElement('span');
    time.className = 'diesel-change-time';
    const label = document.createElement('strong');
    label.textContent = channel.label;
    const values = document.createElement('span');
    values.className = 'diesel-change-values';
    button.append(time, label, values);
    button.addEventListener('click', () => onSelect?.(channel.id));
    strip.appendChild(button);
    return { channel, button, time, values };
  });

  let windowStart, windowEnd, tick, comparisons = [], enabled = true;
  function refresh() {
    strip.hidden = !enabled || comparisons.length !== cards.length || tick == null || tick < windowStart || tick > windowEnd;
    if (strip.hidden) {
      delete strip.dataset.observedTime;
      return;
    }
    strip.dataset.observedTime = String(tick);
    const active = comparisons.findLastIndex(change => change.toSeconds <= tick);
    cards.forEach(({ button }, index) => {
      button.dataset.state = index === active ? 'active' : index < active ? 'passed' : 'upcoming';
      if (index === active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  return {
    setData(data) {
      tick = null;
      const moments = data?.moments;
      windowStart = moments?.watchStart;
      windowEnd = moments?.watchEnd;
      const rowAt = time => data?.samples?.[Math.round(time * 10)];
      comparisons = [];
      for (const { channel, button, time, values } of cards) {
        const fromSeconds = moments?.[channel.from], toSeconds = moments?.[channel.to];
        const from = rowAt(fromSeconds), to = rowAt(toSeconds);
        if (!from || !to || from.t !== fromSeconds || to.t !== toSeconds) break;
        const fromValue = from[channel.field], toValue = to[channel.field];
        if (!Number.isFinite(fromValue) || !Number.isFinite(toValue)) break;
        const change = { channel: channel.id, fromSeconds, fromValue, toSeconds, toValue, unit: channel.unit };
        comparisons.push(change);
        time.textContent = seconds(toSeconds);
        values.textContent = number.format(fromValue) + ' → ' + number.format(toValue) + ' ' + channel.unit;
        button.title = '对比 ' + seconds(fromSeconds) + '与 ' + seconds(toSeconds) + '的原档采样';
        button.setAttribute('aria-label', channel.label + '，' + button.title + '，' + values.textContent + '。点击突出对应曲线。');
      }
      refresh();
    },
    render(snapshot) {
      tick = snapshot.elapsedSeconds;
      refresh();
    },
    setVisible(value) {
      enabled = value;
      refresh();
    },
    getBottom() {
      return strip.hidden ? 0 : strip.offsetTop + strip.offsetHeight;
    },
    getVisibleChanges() {
      return strip.hidden ? [] : comparisons.map(change => ({ ...change, reached: change.toSeconds <= tick }));
    },
  };
}

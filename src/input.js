export function createInput() {
  const keys = new Set();
  const buttons = new Map();

  window.addEventListener('keydown', (event) => {
    keys.add(event.key.toLowerCase());
    if (event.code === 'Space') {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });

  document.querySelectorAll('button[data-action]').forEach((button) => {
    const action = button.dataset.action;
    button.addEventListener('pointerdown', () => buttons.set(action, true));
    button.addEventListener('pointerup', () => buttons.set(action, false));
    button.addEventListener('pointerleave', () => buttons.set(action, false));
    button.addEventListener('click', () => {
      if (action === 'drop') buttons.set('dropOnce', true);
    });
  });

  function axis() {
    const left = keys.has('arrowleft') || keys.has('a') || buttons.get('left');
    const right = keys.has('arrowright') || keys.has('d') || buttons.get('right');
    const forward = keys.has('arrowup') || keys.has('w') || buttons.get('forward');
    const backward = keys.has('arrowdown') || keys.has('s') || buttons.get('backward');

    return {
      dx: (right ? 1 : 0) - (left ? 1 : 0),
      dz: (backward ? 1 : 0) - (forward ? 1 : 0),
      drop: keys.has(' ') || keys.has('space') || keys.has('spacebar') || buttons.get('dropOnce'),
    };
  }

  function consumeDrop() {
    buttons.set('dropOnce', false);
  }

  return {
    axis,
    consumeDrop,
  };
}

(function(){
  const COOLDOWN_MS = 2500;
  let lastClick  = 0;
  let intervalId = null;
  let observer   = null;
  let paused     = false;

  // only click if element is visible
  function isVisible(el){
    return el.offsetParent !== null;
  }

  // look for any <a.monaco-button.monaco-text-button> whose text is “Continue”
  function clickIfFound(){
    if (paused) return;

    const now = Date.now();
    if (now - lastClick < COOLDOWN_MS) return;

    const buttons = Array.from(
      document.querySelectorAll('a.monaco-button.monaco-text-button')
    );

    for (const btn of buttons) {
      if (!isVisible(btn)) continue;
      if (btn.textContent.trim() === 'Continue') {
        btn.click();
        lastClick = now;
        console.log('[auto] Clicked Continue');
        break;
      }
    }
  }

  function startAuto(){
    if (intervalId) return;
    paused = false;
    intervalId = setInterval(clickIfFound, 1000);
    observer   = new MutationObserver(clickIfFound);
    observer.observe(document.body, { childList: true, subtree: true });
    updateButtons();
    console.log('[auto] started');
  }
  function pauseAuto(){
    if (!intervalId) return;
    clearInterval(intervalId);
    observer.disconnect();
    intervalId = null;
    paused = true;
    updateButtons();
    console.log('[auto] paused');
  }
  function stopAuto(){
    if (intervalId){
      clearInterval(intervalId);
      observer.disconnect();
      intervalId = null;
    }
    paused = false;
    updateButtons();
    console.log('[auto] stopped');
  }

  function updateButtons(){
    startBtn.disabled = !!intervalId;
    pauseBtn.disabled = !intervalId;
    stopBtn.disabled  = !intervalId && !paused;
  }

  function showHelp(){
    alert(
`Auto-clicker controls:
• Start: begin auto-clicking  
• Pause: temporarily halt  
• Stop: fully disable (reset)  
• ✕ : close panel  
Drag the handle to move me around.`
    );
  }

  // build floating, draggable, closeable panel
  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    'right:10px; bottom:10px',
    'background:#333',
    'color:#eee',
    'padding:8px',
    'border-radius:4px',
    'font-family:sans-serif',
    'font-size:13px',
    'z-index:9999',
    'box-shadow:0 2px 6px rgba(0,0,0,0.4)'
  ].join(';');

  // drag handle
  const dragHandle = document.createElement('div');
  dragHandle.style.cssText = [
    'height:8px',
    'margin:-8px -8px 8px -8px',
    'background:#444',
    'cursor:move',
    'border-radius:4px 4px 0 0'
  ].join(';');
  panel.appendChild(dragHandle);

  const startBtn = document.createElement('button');
  const pauseBtn = document.createElement('button');
  const stopBtn  = document.createElement('button');
  const helpBtn  = document.createElement('button');
  const closeBtn = document.createElement('button');

  startBtn.textContent = 'Start';
  pauseBtn.textContent = 'Pause';
  stopBtn.textContent  = 'Stop';
  helpBtn.textContent  = '?';
  closeBtn.textContent = '✕';

  [startBtn, pauseBtn, stopBtn, helpBtn, closeBtn].forEach(btn => {
    btn.style.cssText = [
      'margin:0 4px 4px 0',
      'padding:4px 8px',
      'background:#555',
      'color:#fff',
      'border:none',
      'border-radius:3px',
      'cursor:pointer',
      'font-size:13px'
    ].join(';');
    panel.appendChild(btn);
  });

  startBtn.addEventListener('click', startAuto);
  pauseBtn.addEventListener('click', pauseAuto);
  stopBtn .addEventListener('click', stopAuto);
  helpBtn .addEventListener('click', showHelp);
  closeBtn.addEventListener('click', () => panel.remove());

  function initDrag(e){
    e.preventDefault();
    const rect = panel.getBoundingClientRect();
    panel.style.left   = rect.left  + 'px';
    panel.style.top    = rect.top   + 'px';
    panel.style.right  = 'auto';
    panel.style.bottom = 'auto';

    const startX = e.clientX, startY = e.clientY;
    const origX  = rect.left,   origY  = rect.top;

    function onMouseMove(e){
      panel.style.left = origX + (e.clientX - startX) + 'px';
      panel.style.top  = origY + (e.clientY - startY) + 'px';
    }
    function onMouseUp(){
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
  }
  dragHandle.addEventListener('mousedown', initDrag);

  document.body.appendChild(panel);
  updateButtons();
  startAuto();

  // allow console stop
  window.stopAutoContinue = stopAuto;
})();

# copilot-auto-continue

A tiny console snippet that automatically clicks the **Continue** button in GitHub Copilot Chat Agent Mode, so you can keep your workflow moving without manual approval.

## Description

When using Copilot’s **Agent Mode**, every action (even harmless ones like `git status`) prompts you to click **Continue**. This snippet removes that friction by auto‑clicking the button as soon as it appears—no more endless taps!

![image](https://github.com/user-attachments/assets/ff4db17b-034d-443f-925a-4c8a99311d2f)

![image](https://github.com/user-attachments/assets/b66a5766-bd1c-4e44-a33c-6006904209e9)



## ⚠️ Important: Script Persistence

**Scripts pasted into the Developer Console are NOT saved and will be lost when you restart VS Code.**

### For Permanent Auto-Loading (Recommended)

Use the [**Custom CSS and JS Loader**](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension to automatically load your script on every VS Code startup:

1. Install the extension from the marketplace
2. Save the script to a `.js` file
3. Configure the extension to load your file
4. Enable custom CSS/JS and restart

This way, the auto-continue functionality will work immediately every time you open VS Code!

---

## Installation

### Console Paste Method (Temporary)

1. Open **VS Code** (Desktop or Web).  
2. Go to **Help → Toggle Developer Tools**.  
3. Switch to the **Console** tab, type:
   ```js
   allow pasting
   ```
   and press Enter.  
4. Paste the snippet below into the console and hit Enter:

```js
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

  // log a timestamp into the log window
  function addLogEntry() {
    const ts = new Date().toLocaleString();
    const entry = document.createElement('div');
    entry.textContent = ts;
    entry.style.cssText = 'padding:2px 4px; border-bottom:1px solid #444; font-size:12px; color:#0f0;';
    logContainer.appendChild(entry);
    // keep scroll at bottom
    logContainer.scrollTop = logContainer.scrollHeight;
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
        console.log('[auto] Clicked Continue at', new Date().toISOString());
        addLogEntry();
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
  }
  function pauseAuto(){
    if (!intervalId) return;
    clearInterval(intervalId);
    observer.disconnect();
    intervalId = null;
    paused = true;
    updateButtons();
  }
  function stopAuto(){
    if (intervalId){
      clearInterval(intervalId);
      observer.disconnect();
      intervalId = null;
    }
    paused = false;
    updateButtons();
  }

  function updateButtons(){
    startBtn.disabled = !!intervalId;
    pauseBtn.disabled = !intervalId;
    stopBtn.disabled  = !intervalId && !paused;
  }

  function showHelp(){
    alert(
`Controls:
• Start: begin auto-clicking  
• Pause: temporarily halt  
• Stop: fully disable  
• ✕ : close panel  
Drag handle to move.  
Timestamps of each “Continue” appear below.`
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
    'box-shadow:0 2px 6px rgba(0,0,0,0.4)',
    'width:220px'
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

  // buttons row
  const btns = ['Start','Pause','Stop','?','✕'];
  const elements = {};
  btns.forEach(label => {
    const btn = document.createElement('button');
    btn.textContent = label;
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
    elements[label] = btn;
  });
  const { Start: startBtn, Pause: pauseBtn, Stop: stopBtn, '?': helpBtn, '✕': closeBtn } = elements;

  startBtn.addEventListener('click', startAuto);
  pauseBtn.addEventListener('click', pauseAuto);
  stopBtn .addEventListener('click', stopAuto);
  helpBtn .addEventListener('click', showHelp);
  closeBtn.addEventListener('click', () => panel.remove());

  // log container
  const logContainer = document.createElement('div');
  logContainer.style.cssText = [
    'background:#222',
    'border:1px solid #444',
    'height:100px',
    'overflow-y:auto',
    'padding:4px',
    'border-radius:3px',
    'font-family:monospace'
  ].join(';');
  panel.appendChild(logContainer);

  // init drag
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

  // expose stop for console
  window.stopAutoContinue = stopAuto;
})();

```

## Usage

Once pasted, the script immediately begins watching for and clicking the **Continue** button whenever it appears.  

You’ll see logs in your console each time it clicks.

## Stopping

To halt the auto‑clicker at any time, switch to the console and run:

```js
window.stopAutoContinue();
```

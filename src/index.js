import "./styles.scss";

const QS = document.querySelector.bind(document);

const elTemplate = QS("#template"),
  elData = QS("#data"),
  elOutput = QS("#output");

const allEls = [elTemplate, elData, elOutput];
const inputEls = [elTemplate, elData];

const state = {
  time: {
    outputRendered: new Date(0),
    outputEdited: new Date(0)
  },

  updateTimeOutputRendered() {
    this.time.outputRendered = new Date();
  },
  updateTimeOutputEdited() {
    this.time.outputEdited = new Date();
  }
};

function replaceAll(text, replaceFrom, replaceTo) {
  let newtext;
  // eslint-disable-next-line no-cond-assign
  while ((newtext = text.replace(replaceFrom, replaceTo)) !== text) {
    text = newtext;
  }
  return text;
}

function createOutput() {
  const template = elTemplate.innerHTML;
  // console.log("template", template);
  const dataStr = elData.innerHTML.trim();
  // console.log("dataStr", dataStr);
  let data = {};
  if (dataStr) {
    // would raise when editing the data string
    data = JSON.parse(dataStr);
  }

  let output = template;
  for (const [k, v] of Object.entries(data)) {
    output = replaceAll(output, k, v);
  }
  return output;
}

function renderOutput() {
  let output;
  try {
    output = createOutput();
  } catch (err) {
    elOutput.innerHTML = err;
    return;
  }
  elOutput.innerHTML = output;
  state.updateTimeOutputRendered();
}

function renderOutputByState() {
  // if edited time is older than generated, leave the output unchanged
  if (state.time.outputRendered < state.time.outputEdited) return;
  renderOutput();
}

function saveElData(key, value) {
  localStorage.setItem(key, value);
}

function loadElData(key, el) {
  el.innerHTML = localStorage.getItem(key) || "";
}

for (const el of inputEls) {
  // no need for contenteditable=plaintext-only
  // el.addEventListener("paste", (event) => {
  //   event.preventDefault();
  //   const text = event.clipboardData.getData("text/plain");
  //   document.execCommand("insertHTML", false, text);
  // });
  el.addEventListener("input", () => {
    saveElData(el.id, el.innerHTML);
    renderOutputByState();
  });
}

elOutput.addEventListener("input", () => {
  saveElData(elOutput.id, elOutput.innerHTML);
  state.updateTimeOutputEdited();
});

function isOutputEdited(created) {
  const output = elOutput.innerHTML.trim();
  if (!output) return false;
  if (output === created) return false;
  return true;
}

// main
(() => {
  for (const el of allEls) {
    loadElData(el.id, el);
  }

  let created;
  try {
    created = createOutput();
  } catch (err) {
    created = `${err}`;
  }

  if (isOutputEdited(created)) {
    state.updateTimeOutputEdited();
  }
  renderOutputByState();
})();

// buttons
QS("#copy").addEventListener("click", () => {
  // Select the text in the div
  const range = document.createRange();
  range.selectNodeContents(elOutput);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Deselect the text
  selection.removeAllRanges();
});

QS("#generate").addEventListener("click", () => {
  renderOutput();
});

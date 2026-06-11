const form = document.querySelector("#note-form");
const output = document.querySelector("#output");
const fields = {
  projectName: document.querySelector("#project-name"),
  chatSource: document.querySelector("#chat-source"),
  goal: document.querySelector("#goal"),
  rawChat: document.querySelector("#raw-chat"),
  stack: document.querySelector("#stack"),
  status: document.querySelector("#status"),
  rules: document.querySelector("#rules"),
  nextSteps: document.querySelector("#next-steps"),
};

const storageKey = "note-apphay-context";

function value(field) {
  return field.value.trim();
}

function listBlock(text, fallback) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return `- ${fallback}`;
  return lines.map((line) => `- ${line.replace(/^[-*]\s*/, "")}`).join("\n");
}

function codeBlock(text, fallback) {
  return text || fallback;
}

function buildMarkdown() {
  const data = getData();
  const today = new Date().toISOString().slice(0, 10);

  return `# Project Context: ${data.projectName || "Unnamed Project"}

Last updated: ${today}
Source: ${data.chatSource || "Manual notes from IDE chats"}

## Current Goal
${data.goal || "Chua co muc tieu ro rang. Hay doc chat goc va hoi lai neu can."}

## Project Status
${data.status || "Chua co trang thai ro rang."}

## Tech Stack
${data.stack || "Chua khai bao."}

## Rules For IDE / AI Agents
${listBlock(data.rules, "Giu thay doi nho, dung muc tieu, khong sua file ngoai pham vi neu chua can.")}

## Next Steps
${listBlock(data.nextSteps, "Doc context nay, kiem tra codebase, xac nhan viec can lam tiep.")}

## Raw Chat Notes
\`\`\`text
${codeBlock(data.rawChat, "Chua paste chat.")}
\`\`\`

## Handoff Prompt
Use this file as shared project memory. Before editing, inspect relevant files, preserve user changes, and continue from Next Steps. If Raw Chat conflicts with current code, trust current code and ask one focused question only when blocked.
`;
}

function getData() {
  return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, value(field)]));
}

function setData(data) {
  Object.entries(fields).forEach(([key, field]) => {
    field.value = data[key] || "";
  });
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(getData()));
}

function render() {
  output.textContent = buildMarkdown();
  save();
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render();
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", render);
});

document.querySelector("#copy-output").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.textContent);
});

document.querySelector("#download-md").addEventListener("click", () => {
  download("project-context.md", output.textContent, "text/markdown;charset=utf-8");
});

document.querySelector("#download-json").addEventListener("click", () => {
  download("project-context.json", JSON.stringify(getData(), null, 2), "application/json;charset=utf-8");
});

document.querySelector("#clear-form").addEventListener("click", () => {
  setData({});
  render();
});

setData(JSON.parse(localStorage.getItem(storageKey) || "{}"));
render();

const storageKey = "note-apphay-store-v1";

const elements = {
  projectList: document.querySelector("#project-list"),
  sessionList: document.querySelector("#session-list"),
  output: document.querySelector("#output"),
  addProject: document.querySelector("#add-project"),
  deleteProject: document.querySelector("#delete-project"),
  addSession: document.querySelector("#add-session"),
  saveSession: document.querySelector("#save-session"),
  deleteSession: document.querySelector("#delete-session"),
  copyOutput: document.querySelector("#copy-output"),
  downloadMd: document.querySelector("#download-md"),
  exportStore: document.querySelector("#export-store"),
  importStore: document.querySelector("#import-store"),
};

const projectFields = {
  name: document.querySelector("#project-name"),
  repoPath: document.querySelector("#repo-path"),
  gitRemote: document.querySelector("#git-remote"),
  stack: document.querySelector("#stack"),
  goal: document.querySelector("#goal"),
  rules: document.querySelector("#rules"),
  nextSteps: document.querySelector("#next-steps"),
};

const sessionFields = {
  ide: document.querySelector("#session-ide"),
  title: document.querySelector("#session-title"),
  summary: document.querySelector("#session-summary"),
  chat: document.querySelector("#session-chat"),
};

let store = loadStore();
let activeProjectId = store.activeProjectId || store.projects[0]?.id;
let activeSessionId = getActiveProject()?.sessions[0]?.id || null;

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createProject(name = "Project mới") {
  const now = new Date().toISOString();
  return {
    id: createId("project"),
    name,
    repoPath: "",
    gitRemote: "",
    stack: "",
    goal: "",
    rules: "",
    nextSteps: "",
    sessions: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createSession() {
  const now = new Date().toISOString();
  return {
    id: createId("session"),
    ide: "",
    title: "Session mới",
    summary: "",
    chat: "",
    createdAt: now,
    updatedAt: now,
  };
}

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved?.projects?.length) return saved;
  } catch (error) {
    console.warn("Cannot parse saved store", error);
  }

  return {
    version: 1,
    activeProjectId: null,
    projects: [createProject("note.apphay.io.vn")],
  };
}

function saveStore() {
  store.activeProjectId = activeProjectId;
  localStorage.setItem(storageKey, JSON.stringify(store));
}

function getActiveProject() {
  return store.projects.find((project) => project.id === activeProjectId) || store.projects[0];
}

function getActiveSession() {
  return getActiveProject()?.sessions.find((session) => session.id === activeSessionId) || null;
}

function getFieldValue(field) {
  return field.value.trim();
}

function setFields(fields, data) {
  Object.entries(fields).forEach(([key, field]) => {
    field.value = data?.[key] || "";
  });
}

function listBlock(text, fallback) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return `- ${fallback}`;
  return lines.map((line) => `- ${line.replace(/^[-*]\s*/, "")}`).join("\n");
}

function updateActiveProjectFromForm() {
  const project = getActiveProject();
  if (!project) return;

  Object.entries(projectFields).forEach(([key, field]) => {
    project[key] = getFieldValue(field);
  });
  project.updatedAt = new Date().toISOString();
}

function updateActiveSessionFromForm() {
  const session = getActiveSession();
  if (!session) return;

  Object.entries(sessionFields).forEach(([key, field]) => {
    session[key] = getFieldValue(field);
  });
  session.updatedAt = new Date().toISOString();
  getActiveProject().updatedAt = session.updatedAt;
}

function renderProjectList() {
  elements.projectList.innerHTML = "";

  store.projects.forEach((project) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `list-item${project.id === activeProjectId ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(project.name || "Chưa đặt tên")}</strong><span>${project.sessions.length} session</span>`;
    button.addEventListener("click", () => {
      updateActiveProjectFromForm();
      updateActiveSessionFromForm();
      activeProjectId = project.id;
      activeSessionId = project.sessions[0]?.id || null;
      render();
    });
    elements.projectList.append(button);
  });
}

function renderSessionList() {
  const project = getActiveProject();
  elements.sessionList.innerHTML = "";

  if (!project.sessions.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Chưa có session. Bấm Thêm session để lưu chat từ IDE.";
    elements.sessionList.append(empty);
    return;
  }

  project.sessions.forEach((session) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `list-item${session.id === activeSessionId ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(session.title || "Session chưa đặt tên")}</strong><span>${escapeHtml(session.ide || "Chưa chọn IDE")}</span>`;
    button.addEventListener("click", () => {
      updateActiveSessionFromForm();
      activeSessionId = session.id;
      render();
    });
    elements.sessionList.append(button);
  });
}

function renderForms() {
  const project = getActiveProject();
  setFields(projectFields, project);
  setFields(sessionFields, getActiveSession());
  elements.deleteSession.disabled = !getActiveSession();
}

function buildMarkdown() {
  const project = getActiveProject();
  if (!project) return "Chưa có project.";

  const sessions = project.sessions
    .map((session, index) => {
      return `### ${index + 1}. ${session.title || "Session chưa đặt tên"}

- IDE: ${session.ide || "Chưa rõ"}
- Cập nhật: ${formatDate(session.updatedAt)}
- Tóm tắt: ${session.summary || "Chưa có tóm tắt."}

\`\`\`text
${session.chat || "Chưa có chat."}
\`\`\``;
    })
    .join("\n\n");

  return `# Project Context: ${project.name || "Chưa đặt tên project"}

Cập nhật lần cuối: ${formatDate(project.updatedAt)}
Repo path: ${project.repoPath || "Chưa khai báo"}
Git remote: ${project.gitRemote || "Chưa khai báo"}
Tech stack: ${project.stack || "Chưa khai báo"}

## Mục tiêu hiện tại
${project.goal || "Chưa có mục tiêu rõ ràng."}

## Quy tắc cho IDE / AI Agents
${listBlock(project.rules, "Giữ thay đổi nhỏ, đọc code hiện tại trước khi sửa, không ghi đè thay đổi của user.")}

## Việc tiếp theo
${listBlock(project.nextSteps, "Đọc context này, kiểm tra repo, rồi tiếp tục từ session mới nhất.")}

## Session Chat Theo IDE
${sessions || "Chưa có session chat."}

## Handoff Prompt
Dùng file này như bộ nhớ chung của project. IDE/agent mới phải đọc mục Project Context, Việc tiếp theo và Session Chat Theo IDE trước khi sửa code. Nếu chat cũ mâu thuẫn với code hiện tại, ưu tiên code hiện tại.
`;
}

function formatDate(value) {
  if (!value) return "Chưa rõ";
  return new Date(value).toLocaleString("vi-VN");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function render() {
  renderProjectList();
  renderSessionList();
  renderForms();
  elements.output.textContent = buildMarkdown();
  saveStore();
}

Object.values(projectFields).forEach((field) => {
  field.addEventListener("input", () => {
    updateActiveProjectFromForm();
    renderProjectList();
    elements.output.textContent = buildMarkdown();
    saveStore();
  });
});

Object.values(sessionFields).forEach((field) => {
  field.addEventListener("input", () => {
    updateActiveSessionFromForm();
    renderSessionList();
    elements.output.textContent = buildMarkdown();
    saveStore();
  });
});

elements.addProject.addEventListener("click", () => {
  updateActiveProjectFromForm();
  updateActiveSessionFromForm();
  const project = createProject();
  store.projects.unshift(project);
  activeProjectId = project.id;
  activeSessionId = null;
  render();
});

elements.deleteProject.addEventListener("click", () => {
  if (store.projects.length === 1) return;
  store.projects = store.projects.filter((project) => project.id !== activeProjectId);
  activeProjectId = store.projects[0].id;
  activeSessionId = store.projects[0].sessions[0]?.id || null;
  render();
});

elements.addSession.addEventListener("click", () => {
  updateActiveProjectFromForm();
  const session = createSession();
  getActiveProject().sessions.unshift(session);
  activeSessionId = session.id;
  render();
});

elements.saveSession.addEventListener("click", () => {
  updateActiveSessionFromForm();
  render();
});

elements.deleteSession.addEventListener("click", () => {
  const project = getActiveProject();
  project.sessions = project.sessions.filter((session) => session.id !== activeSessionId);
  activeSessionId = project.sessions[0]?.id || null;
  render();
});

elements.copyOutput.addEventListener("click", async () => {
  await navigator.clipboard.writeText(elements.output.textContent);
});

elements.downloadMd.addEventListener("click", () => {
  const name = (getActiveProject().name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  download(`${name}-context.md`, elements.output.textContent, "text/markdown;charset=utf-8");
});

elements.exportStore.addEventListener("click", () => {
  updateActiveProjectFromForm();
  updateActiveSessionFromForm();
  download("note-apphay-store.json", JSON.stringify(store, null, 2), "application/json;charset=utf-8");
});

elements.importStore.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const imported = JSON.parse(await file.text());
  if (!imported?.projects?.length) return;

  store = imported;
  activeProjectId = store.activeProjectId || store.projects[0].id;
  activeSessionId = getActiveProject().sessions[0]?.id || null;
  render();
  event.target.value = "";
});

render();

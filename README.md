# Note AppHay

Web tĩnh làm nơi lưu note, project memory và data session chat của nhiều IDE.

## Mục tiêu

- Quản lý nhiều project trong một web.
- Lưu repo path, git remote, tech stack, mục tiêu, quy tắc và việc tiếp theo cho từng project.
- Lưu nhiều session chat theo IDE/agent như Cursor, OpenCode, Claude Code, Copilot.
- Sinh Markdown context để IDE/agent khác đọc tiếp.
- Export/import JSON để dùng làm cầu nối cho MCP hoặc backend sau.
- Lưu tạm trên trình duyệt bằng `localStorage`.

## Chạy local

Mở trực tiếp `index.html` bằng trình duyệt, hoặc dùng static server bất kỳ.

```bash
npx serve .
```

## Deploy

Repo này là static site. Có thể deploy lên GitHub Pages, Cloudflare Pages, Netlify hoặc hosting thường.

## Hướng MCP sau

Static web hiện chưa nhận MCP trực tiếp vì trình duyệt không có server endpoint. Bước sau nên thêm một trong hai hướng:

- Backend API nhận `project`, `ide`, `sessionTitle`, `summary`, `chat`, rồi ghi vào database hoặc JSON file.
- MCP server có tool `save_session`, `list_projects`, `get_project_context`, đồng bộ với cùng database/API đó.

Web này đã có format JSON export/import để làm schema khởi đầu.

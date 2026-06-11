# Note AppHay

Web tĩnh giúp gom chat/ghi chú từ nhiều IDE thành một file context chung cho AI coding agents.

## Mục tiêu

- Paste chat từ Cursor, Copilot, Claude Code, OpenCode hoặc IDE khác.
- Tạo Markdown để lưu vào `AGENTS.md`, `CONTEXT.md` hoặc `docs/handoff.md`.
- Export `.md` và `.json` để IDE/agent tiếp theo đọc hiểu project nhanh hơn.
- Lưu tạm trên trình duyệt bằng `localStorage`.

## Chạy local

Mở trực tiếp `index.html` bằng trình duyệt, hoặc dùng static server bất kỳ.

```bash
npx serve .
```

## Deploy

Repo này là static site. Có thể deploy lên GitHub Pages, Cloudflare Pages, Netlify hoặc hosting thường.

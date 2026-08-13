# TATAN FORCE V1.0 生产交付

## 架构

- Web：React 19、TypeScript、Vite；生产环境由同一 Node 进程托管静态文件。
- API：Express 5、Zod 输入校验、Helmet 安全响应头。
- 数据库：PostgreSQL 16；SQL 迁移位于 `server/migrations`。
- 认证：服务端 scrypt 密码哈希、PostgreSQL Session、HttpOnly/SameSite Cookie、服务端角色校验。
- 存储：本地卷或 S3/OSS 兼容对象存储，统一通过上传适配器。

## 首次启动

1. 复制 `.env.example` 为部署平台的 Secret/Environment 配置，不要提交真实密码。
2. 至少替换 `POSTGRES_PASSWORD`、`SESSION_SECRET`、`OWNER_PASSWORD` 和 `ADMIN_INITIAL_PASSWORD`。
3. 生产域名写入 `APP_ORIGIN`，必须使用 HTTPS。
4. 执行 `docker compose up -d --build`。
5. 容器启动时自动执行幂等迁移与初始数据种子；已有账号、商品不会被覆盖。
6. 健康检查：`GET /api/health`。

## 本地开发

需要 PostgreSQL：

```bash
npm run db:migrate
npm run db:seed
npm run dev:all
```

前端为 `http://127.0.0.1:5173`，API 为 `http://127.0.0.1:4174`。Vite 将 `/api` 与 `/uploads` 代理到 API。

## One-time credential recovery

When the Railway password variables no longer match the credentials stored in
PostgreSQL, set new `OWNER_PASSWORD` and `ADMIN_INITIAL_PASSWORD` values plus
a fresh `CREDENTIAL_RESET_TOKEN` of at least 16 characters, then deploy once.
Only a SHA-256 digest of the token is stored; the same token cannot reset the
accounts a second time. The reset revokes existing sessions. Remove the token
from Railway after a successful deployment. The owner console provides a
password-change audit trail, never a readable password.

## API

- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products` — ADMIN/OWNER
- `PUT /api/products/:id` — ADMIN/OWNER
- `DELETE /api/products/:id` — ADMIN/OWNER
- `POST /api/inquiries`
- `GET /api/inquiries/admin` — ADMIN/OWNER
- `PUT /api/inquiries/admin/:id/status` — ADMIN/OWNER
- `GET /api/settings`
- `PUT /api/settings` — ADMIN/OWNER
- `GET|PUT /api/settings/system` — OWNER
- `GET /api/auth/session`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET|POST /api/owner/users` — OWNER
- `PUT /api/owner/users/:id/password` — OWNER
- `POST /api/uploads` — ADMIN/OWNER

## 上线检查

- 只开放应用端口，不公开 PostgreSQL。
- HTTPS 终止后保留 `X-Forwarded-Proto`，应用已启用 `trust proxy`。
- 对象存储设置私有写权限，仅通过应用上传；公开读取使用 CDN 域名。
- 数据库与对象存储启用定期备份、版本控制和恢复演练。
- 首次登录后立即修改 ADMIN 密码；OWNER 凭据只保存在部署 Secret。
- 监控 `/api/health`、5xx、登录 429、数据库连接数、存储失败与磁盘容量。

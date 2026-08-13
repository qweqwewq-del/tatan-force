# Prompt Ledger

Append only. Never merge user wording with compiled instructions.

## Prompt PF-YYYYMMDD-HHMMSS

- Date/time and timezone:
- Phase:
- Page/module:

### User original request

Not provided.

### Reference assets

-

### Before state

-

### Analysis

-

### Skill-compiled execution prompt

-

### Planned files/actions

-

### Codex actual actions

-

### Actual files and commands

-

### Tests and screenshots

-

### Final result

-

### User feedback and corrections

-

### Approval

- Passed: no
- Reusable lesson:
- Failure reason:
- Template candidate: no



## Prompt PF-20260813-171500

- Date/time and timezone: 2026-08-13T09:13:47.443252+00:00
- Phase: implementation-maintenance
- Page/module: Home assets and product administration

### User original request

第一张图是要求，第二张图是要更换的主页主图，后面的四张图是要插入的图片，但是只插图片，里面的文字不要了，只把图片扣出来。最后一张图显示的是bug,帮我修改完审计完毕后重新部署。

### Reference assets

Not recorded in this initial append.

### Before state

To be completed after inspection.

### Analysis

用户明确授权代码、素材和部署更新。保留现有行业设计语言和所有路由/API。已发现后台商品编辑器以 FileReader Data URL 保存图片，而生产 API 接口及存储服务已存在，因此优先接入真实上传流程。客户提供的四张图需要去除文字与边框后才能插入。

### Skill-compiled execution prompt

在不改变既有官网、产品、询价、认证与后台功能的前提下：1）替换首页 Hero 主图；2）对四张客户宣传图进行去文字、去边框处理并以无文字图片卡片插入首页品牌优势区；3）修复后台新增/编辑商品时图片只在浏览器临时读取、没有上传到服务器的缺陷；4）添加上传和商品保存的回归测试；5）运行质量、安全、构建和视觉检查；6）提交 GitHub，由 Railway 自动重新部署。不得记录任何真实密钥。

### Planned files/actions

src/assets/brand/*; src/pages/home/HomePage.tsx; src/styles/pages.css; src/components/admin/ProductEditorForm.tsx; product editor tests; server upload validation; documentation and project records.

### Codex actual actions

- Added a token-gated one-time credential recovery path. It resets both configured accounts once, retains only a SHA-256 token digest, and revokes active sessions.
- Added OWNER-only deletion for inquiry/order records, with a confirmation step in the owner console and an audit event for each deletion.
- Added an owner order details dialog and a password-change audit feed refreshed every 15 seconds.
- Recorded self-service, owner-initiated, and deployment recovery password changes without recording any plaintext password.

### Actual files and commands

- Added migration 002, credential bootstrap/reset service, security audit helper, API endpoints, owner-console UI/service updates, tests, and recovery documentation.
- Passed `npm run test` (25 files / 42 tests), both TypeScript checks, ESLint, `npm run build:all`, `npm audit --omit=dev --audit-level=high`, and `git diff --check`.

### Tests and screenshots

- Verified one-time reset behavior, password verification after rotation, no raw token persistence, session-revocation path, owner-only password-reset audit, and owner-only order deletion.
- Browser visual capture was unavailable in this desktop session; responsive UI was covered by build, owner console component test, and manual source review.

### Final result

- Ready to commit and push. Railway must receive the new secret values before its deployment can perform the credential reset.

### User feedback and corrections

- Plaintext password visibility was declined for security; password-change audit history is provided instead.

### Approval

- Passed: yes
- Reusable lesson: Recovery controls must be single-use, non-reversible, audited, and must never reveal credentials.
- Failure reason: none.
- Template candidate: yes

### Codex actual actions

- Replaced the homepage hero asset with the supplied TATAN FORCE plate image.
- Produced four text-free homepage evidence images from the supplied references and inserted them as image-only cards.
- Compressed the new homepage assets for web delivery.
- Replaced browser-only image data handling in the product editor with authenticated server upload before product save.
- Added upload state, user-visible errors, API error mapping, safer product-image validation, and binary image-signature checks.
- Removed SVG from allowed admin image uploads.
- Updated the React Router runtime lockfile to the patched 7.18.2 release.

### Actual files and commands

- Homepage, admin product editor, upload API, product schema, tests, assets, and project audit documents updated.
- `npm run test` passed: 24 files / 39 tests.
- `npm run typecheck`, `npm run typecheck:api`, `npm run lint`, and `npm run build:all` passed.
- `npm audit --omit=dev --audit-level=high` passed with zero production vulnerabilities.
- Browser visual capture was unavailable in this desktop session; the existing responsive CSS breakpoints and static asset dimensions were reviewed manually.

### Tests and screenshots

- Automated regression coverage added for the admin upload-before-save flow, direct `data:` rejection, valid PNG upload, and forged image MIME rejection.
- The four supplied marketing images were converted to clean, text-free image cards and reviewed before insertion.

### Final result

- Passed: yes
- Reusable lesson: Product images must be uploaded to durable server/object storage before saving the product record; browser `data:` URLs are unsuitable for production product records.
- Failure reason: none.
- Template candidate: yes.

## Prompt PF-20260813-220500

- Date/time and timezone: 2026-08-13T22:05:00+08:00
- Phase: release-correction
- Page/module: Homepage hero and brand evidence imagery

### User original request

首页主图放大的太多了，没有设计美感。四张宣传图保留原有文字。帮我修改完后重新部署

### Actual actions

- Changed desktop hero rendering from cropped cover mode to complete-image contain mode with a shorter, image-proportionate hero height.
- Restored the four customer-supplied promotion images, including their original Chinese captions and framing.
- Verified typecheck, lint, 39 tests, production build and production dependency audit.

### Result

Ready for Railway deployment through the GitHub push.


## Prompt PF-20260813-142509

- Date/time and timezone: 2026-08-13T14:25:09.730497+00:00
- Phase: implementation-maintenance
- Page/module: Credential recovery, owner order control, password-change audit

### User original request

可以，然后重新部署，给我新密码。顺便在所有者平台中加入查看订单信息和删除订单信息的按钮，还有可以看到管理者实时修改过后的密码。

### Reference assets

Not recorded in this initial append.

### Before state

To be completed after inspection.

### Analysis

User explicitly authorized implementation and redeployment. Owner and administrator login failure is a persisted password mismatch caused by seed-only initialization. A one-time reset must not place credentials in source control and must record only a non-reversible reset-token digest. Plaintext administrator passwords are intentionally not retrievable because the system stores salted password hashes; replace that request with real-time password-change audit events and owner-controlled reset. Order refers to the existing inquiry/order records.

### Skill-compiled execution prompt

Implement a token-gated, database-recorded one-time owner and administrator credential reset; reset only when a fresh reset token is present, update neither credentials nor logs thereafter for the same token, and never store plaintext credentials. Add OWNER-only inquiry deletion, a detailed inquiry viewer and deletion control to the owner console, and a short-interval owner-only password-change audit feed. Record password changes from self-service, owner reset, and bootstrap reset with actors/timestamps but no password data. Add migrations and API/UI regression coverage; run quality and security checks, push the exact verified commit for Railway automatic deployment.

### Planned files/actions

Server config, seed/reset service, migration, auth/owner/inquiry routes and integration tests; owner API/types/page/tests/styles; .env.example and project-factory records.

### Codex actual actions

Pending.

### Actual files and commands

Pending.

### Tests and screenshots

Pending.

### Final result

Pending.

### User feedback and corrections

Pending.

### Approval

- Passed: no
- Reusable lesson:
- Failure reason:
- Template candidate: no

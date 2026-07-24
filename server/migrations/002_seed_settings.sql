BEGIN;

INSERT INTO site_settings (
  id, brand_name, legal_name, logo_url, phone, wechat, email,
  qr_code_url, quote_title, quote_validity_days, default_sales_note
) VALUES (
  1, 'TATAN FORCE', '泰坦引擎体育', '/assets/tatan-logo.png',
  '400-800-2026', 'TATAN-SALES', 'sales@tatanforce.cn',
  '/assets/wechat-qr.png', 'TATAN FORCE 产品报价单', 30,
  '价格含税；运输与安装费用根据项目地址核算。'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_config (id, maintenance_mode, environment_label, api_base_url)
VALUES (1, false, 'PRODUCTION', '/api')
ON CONFLICT (id) DO NOTHING;

COMMIT;

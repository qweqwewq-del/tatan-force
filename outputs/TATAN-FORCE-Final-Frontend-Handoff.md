# TATAN FORCE 最终前端开发交付规范

版本：1.0  
项目：TATAN FORCE 泰坦引擎体育  
定位：专业健身器材品牌官网 + 产品目录 + 询价系统  

## 0. 范围边界

本期包含：

- 企业官网
- 产品目录与筛选
- 产品详情
- 询价清单
- 客户资料表单
- 报价单预览
- 简单商品管理
- 简单询价管理
- 网站信息设置

本期不包含：

- 在线支付、订单与物流
- 会员注册与会员中心
- AI 智能训练馆或智能器械
- SaaS、多租户与数据中心
- 员工权限、多角色工作流
- 复杂 CRM、自动化销售漏斗

核心转化路径：

`首页 → 产品列表 → 产品详情 → 加入询价 → 填写资料 → 报价预览 → 销售联系`

## 1. 页面列表

### 前台官网

1. `/` 首页
   - Hero 品牌展示
   - 推荐产品
   - 品牌优势
   - 应用场景
   - 联系方式

2. `/products` 产品列表
   - 分类浏览
   - 条件筛选
   - 产品卡片
   - 查看详情
   - 加入询价

3. `/products/:slug` 产品详情
   - 产品图集
   - 产品介绍
   - 材质、尺寸、重量与规格
   - 使用场景
   - 加入询价

4. `/inquiry` 询价清单
   - 已选产品
   - 数量修改
   - 单项备注
   - 删除产品

5. `/inquiry/contact` 客户资料
   - 姓名
   - 手机
   - 微信
   - 公司
   - 地址
   - 邮箱
   - 备注

6. `/inquiry/preview` 报价预览
   - Logo 与报价编号
   - 客户资料
   - 产品、规格、数量、单价与金额
   - 报价日期和有效期
   - 联系方式与微信二维码

7. `/inquiry/success` 提交成功
   - 询价编号
   - 后续联系说明
   - 返回产品中心

### 简单后台

1. `/admin/products` 商品管理
2. `/admin/products/new` 新增商品
3. `/admin/products/:id` 修改商品
4. `/admin/inquiries` 询价管理
5. `/admin/inquiries/:id` 询价详情
6. `/admin/settings` 网站信息设置

后台不实现驾驶舱、复杂统计、客户池、报价版本管理或员工权限。

## 2. 组件列表

### 全局

- `SiteHeader`
- `DesktopNavigation`
- `MobileNavigation`
- `SiteFooter`
- `SectionHeader`
- `IndustrialButton`
- `StatusBadge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `Toast`
- `Modal`

### 产品

- `ProductCard`
- `ProductImageGallery`
- `ProductCategoryFilter`
- `ProductSpecTable`
- `ProductFeatureList`
- `ProductSceneSection`
- `InquiryAddButton`
- `QuantityControl`

### 询价与报价

- `InquiryDrawer`
- `InquiryItem`
- `InquirySummary`
- `CustomerForm`
- `QuoteHeader`
- `QuoteCustomerBlock`
- `QuoteItemTable`
- `QuoteTotals`
- `SalesContactBlock`
- `WechatQrBlock`

### 简单后台

- `AdminShell`
- `AdminSidebar`
- `ProductTable`
- `ProductEditorForm`
- `ImageUploader`
- `InquiryTable`
- `InquiryDetail`
- `InquiryStatusSelect`
- `BrandSettingsForm`
- `QuoteSettingsForm`

## 3. 前端开发结构

```text
src/
├─ app/
│  ├─ router/
│  ├─ providers/
│  └─ layouts/
├─ pages/
│  ├─ home/
│  ├─ products/
│  ├─ inquiry/
│  └─ admin/
├─ components/
│  ├─ common/
│  ├─ product/
│  ├─ inquiry/
│  ├─ quote/
│  └─ admin/
├─ features/
│  ├─ catalog/
│  ├─ inquiry-list/
│  ├─ quote-preview/
│  └─ admin-content/
├─ data/
│  ├─ products.mock.ts
│  ├─ inquiries.mock.ts
│  ├─ settings.mock.ts
│  └─ business-rules.mock.ts
├─ models/
├─ services/
├─ styles/
│  ├─ tokens.css
│  ├─ global.css
│  └─ utilities.css
└─ assets/
```

开发原则：

- 页面层只负责组合，不保存业务规则。
- 产品、询价和报价分别放入独立 feature。
- Mock service 与未来真实 API 使用相同函数签名。
- 询价清单第一阶段使用浏览器本地存储。
- 所有金额以整数分或高精度 decimal 表达，禁止浮点直接相加。
- 管理后台为单管理员入口，不设计权限矩阵。

## 4. 数据字段

### Product

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 产品主键 |
| slug | string | 是 | 产品详情 URL |
| sku | string | 是 | 产品编号 |
| name | string | 是 | 中文产品名 |
| brand | string | 是 | TATAN FORCE / HOIST / XMASTER |
| category | string | 是 | 产品分类 |
| summary | string | 是 | 列表和首屏简介 |
| description | string | 是 | 详细说明 |
| images | string[] | 是 | 产品图集 |
| material | string | 否 | 材质 |
| dimensions | string | 否 | 尺寸 |
| weight | string | 否 | 产品重量 |
| specifications | SpecItem[] | 是 | 参数表 |
| useCases | string[] | 否 | 使用场景 |
| price | number | 否 | 报价展示价格 |
| priceVisible | boolean | 是 | 是否展示价格 |
| leadTime | string | 否 | 货期 |
| status | active / draft | 是 | 上架状态 |

### Customer

| 字段 | 类型 | 必填 |
|---|---|---:|
| name | string | 是 |
| phone | string | 是 |
| wechat | string | 否 |
| company | string | 否 |
| address | string | 否 |
| email | string | 否 |
| note | string | 否 |

### Inquiry

| 字段 | 类型 | 必填 |
|---|---|---:|
| id | string | 是 |
| customer | Customer | 是 |
| items | InquiryItem[] | 是 |
| status | pending / contacted / won / closed | 是 |
| submittedAt | ISO datetime | 是 |
| internalNote | string | 否 |

### InquiryItem

| 字段 | 类型 | 必填 |
|---|---|---:|
| productId | string | 是 |
| sku | string | 是 |
| productName | string | 是 |
| specification | string | 否 |
| quantity | number | 是 |
| unitPrice | number | 否 |
| note | string | 否 |

### Quote

| 字段 | 类型 | 必填 |
|---|---|---:|
| quoteNo | string | 是 |
| customer | Customer | 是 |
| items | QuoteItem[] | 是 |
| subtotal | number | 是 |
| extraFees | QuoteFee[] | 否 |
| total | number | 是 |
| quoteDate | ISO date | 是 |
| validUntil | ISO date | 否 |
| salesContact | Contact | 是 |
| remarks | string[] | 否 |

### SiteSettings

| 字段 | 类型 | 必填 |
|---|---|---:|
| brandName | string | 是 |
| logoUrl | string | 是 |
| phone | string | 是 |
| wechat | string | 否 |
| email | string | 否 |
| qrCodeUrl | string | 否 |
| quoteTitle | string | 是 |
| quoteValidityDays | number | 是 |
| defaultSalesNote | string | 否 |

## 5. Mock 数据方案

### 初始产品

1. 彩色竞技杠铃片
2. 三孔包胶杠铃片
3. 六杆位收纳架
4. 可调安全卧推架
5. 深蹲架与举重台

每个产品至少准备：

- 1 张主图
- 3–5 张详情图
- 4 个核心参数
- 3 个产品优势
- 2 个使用场景
- 价格展示开关
- 交付周期

### 真实业务规则 Mock

从 HOIST / XMASTER 历史任务提取，作为报价备注和业务规则示例：

- HOIST 官网标价为真实含税售价。
- HOIST 非偏远地区可配置免运费、安装费和搬运费。
- 无电梯时允许增加人工上楼费用。
- HOIST 默认 50% 预付款。
- HOIST 标准货期 60–90 天。
- XMASTER 标准货期 20–30 天。
- HOIST 白色框架定制：`+¥1,200/台`。
- HOIST 非黑色座椅或靠背：`+¥1,200/台`。
- HOIST 定制颜色货期增加 15 天。
- 偏远地区清单：宁夏、青海、辽宁、吉林、甘肃、内蒙古、海南、云南、黑龙江、新疆、西藏。

这些规则应保存在 `business-rules.mock.ts`，不要硬编码进页面组件。

### Mock 询价状态

- 待联系：新提交，后台默认状态。
- 已联系：销售完成首次沟通。
- 已成交：线下确认成交。
- 已关闭：无效、取消或暂不跟进。

不增加自动分配、销售漏斗、跟进任务或多角色审批。

## 6. 开发阶段

### Phase 1：静态官网

- 首页
- 产品列表
- 产品详情
- 响应式适配
- 基础 SEO

### Phase 2：询价系统

- 询价清单
- 客户表单
- 报价预览
- 提交成功
- 本地 Mock 持久化

### Phase 3：简单后台

- 商品新增与修改
- 图片上传界面
- 询价查看与状态修改
- Logo、联系方式和二维码设置

### Phase 4：后端连接

- 产品与询价数据库
- 单管理员认证
- PDF 生成
- 文件存储
- 用真实 API 替换 Mock service

## 7. 视觉实现约束

- 严格继承 TATAN FORCE Figma Design System。
- 背景近黑，品牌红只用于强调和操作。
- 使用硬边框、金属灰和紧凑参数布局。
- 产品图片是视觉主角。
- 不使用蓝色 SaaS 风、玻璃拟态或大量圆角卡片。
- 动画只包含淡入、轻微视差、金属高光和按钮机械反馈。
- 动效不能影响内容读取和低端设备性能。

## 8. 前端开工条件

- Figma 关键页面完成审稿。
- 五个初始产品图片和说明已确认。
- Logo、电话、微信和二维码素材已确认。
- 价格是否公开展示已确认。
- 报价有效期和默认销售备注已确认。


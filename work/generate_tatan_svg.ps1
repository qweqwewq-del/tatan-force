$ErrorActionPreference = 'Stop'
$out = Join-Path $PSScriptRoot '..\outputs'
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Esc([string]$s) { [System.Security.SecurityElement]::Escape($s) }
function T([string]$s,[int]$x,[int]$y,[int]$size=14,[string]$fill='#F2F3F3',[int]$weight=500) {
  "<text x='$x' y='$y' fill='$fill' font-family='Inter,Arial,sans-serif' font-size='$size' font-weight='$weight'>$(Esc $s)</text>"
}
function Box([int]$x,[int]$y,[int]$w,[int]$h,[string]$fill='#0E1011',[string]$stroke='#383C3E',[int]$rx=0) {
  "<rect x='$x' y='$y' width='$w' height='$h' rx='$rx' fill='$fill' stroke='$stroke'/>"
}
function L([int]$x1,[int]$y1,[int]$x2,[int]$y2,[string]$stroke='#E00717',[int]$sw=2) {
  "<line x1='$x1' y1='$y1' x2='$x2' y2='$y2' stroke='$stroke' stroke-width='$sw'/>"
}
function Wrap([string]$title,[string]$body) {
  "<svg xmlns='http://www.w3.org/2000/svg' width='1440' height='1024' viewBox='0 0 1440 1024'><rect width='1440' height='1024' fill='#070809'/>$body</svg>"
}

$nav = Box 0 0 220 1024 '#050607' '#383C3E'
$nav += T 'TATAN / FORCE' 24 42 22 '#F2F3F3' 800
$nav += T 'INDUSTRIAL SYSTEM' 24 66 10 '#E00717' 700
$nav += L 24 86 196 86
$nav += T '07  ADMIN' 26 138 12 '#F2F3F3' 700
$nav += T '08  QUOTE' 26 190 12 '#777D80' 700
$nav += T '09  SETTINGS' 26 242 12 '#777D80' 700
$nav += T '10  DATA' 26 294 12 '#777D80' 700
$nav += T '11  HANDOFF' 26 346 12 '#777D80' 700
$nav += T '12  PLAN' 26 398 12 '#777D80' 700

$b=$nav
$b+=T 'ADMIN / OPERATIONS' 260 46 11 '#E00717' 700
$b+=T '控制台总览' 260 86 32 '#F2F3F3' 800
$metrics=@(@('今日询价','128','+18.4%'),@('待处理报价','24','06 紧急'),@('本月成交','¥2.84M','+12.7%'),@('设备在线率','99.2%','稳定'))
for($i=0;$i -lt 4;$i++){ $x=260+$i*282;$b+=Box $x 132 260 122;$b+=L $x 132 ($x+260) 132 '#E00717' 3;$b+=T $metrics[$i][0] ($x+18) 162 12 '#858A8C' 700;$b+=T $metrics[$i][1] ($x+18) 205 28 '#F2F3F3' 800;$b+=T $metrics[$i][2] ($x+18) 236 11 '#39B96D' 700}
$b+=Box 260 284 720 344;$b+=T '询价转化 / 近 30 天' 280 320 16 '#F2F3F3' 700
$vals=82,116,98,144,128,180,205,190,238,226,270,296
for($i=0;$i -lt 12;$i++){ $h=[int]($vals[$i]*.7);$x=286+$i*54;$b+=Box $x (590-$h) 28 $h $(if($i -gt 8){'#E00717'}else{'#33383A'}) '#33383A' }
$b+=Box 1004 284 396 344;$b+=T '待办队列' 1024 320 16 '#F2F3F3' 700
$qs=@('Q-240718  华东力健     高','Q-240716  恒力体育     高','Q-240709  锐动健身     中','Q-240702  PRO LAB     中')
for($i=0;$i -lt 4;$i++){ $y=372+$i*58;$b+=L 1024 ($y-22) 1380 ($y-22) '#383C3E' 1;$b+=T $qs[$i] 1024 $y 12 $(if($i -lt 2){'#F0A126'}else{'#D5D7D8'}) 600}
$b+=Box 260 656 1140 310;$b+=T '最近报价' 280 692 16 '#F2F3F3' 700
$rows=@('QT-10284   华东力健   上海   ¥286,400   待确认   L.CHEN   14:28','QT-10283   恒力体育   广州   ¥198,600   已发送   Y.WANG   13:42','QT-10282   PRO LAB   深圳   ¥468,200   谈判中   M.LI     11:16')
for($i=0;$i -lt 3;$i++){ $y=770+$i*62;$b+=L 280 ($y-28) 1380 ($y-28) '#383C3E' 1;$b+=T $rows[$i] 280 $y 12 '#D8DADB' 600}
[IO.File]::WriteAllText((Join-Path $out '07-admin-dashboard.svg'),(Wrap '07' $b),[Text.UTF8Encoding]::new($false))

$b=T 'TATAN FORCE / COMMERCIAL QUOTE' 80 66 18 '#111315' 800
$b+=T '泰坦引擎体育 · 专业力量训练设备制造商' 80 92 11 '#5A5E60' 600
$b+=L 80 118 1360 118 '#D60918' 4
$b+=T '设备配置与商务报价' 80 174 32 '#111315' 800
$b+=T 'QUOTATION / QT-20260723-018' 80 204 11 '#D60918' 700
$b+=Box 80 238 1280 98 '#F4F4F2' '#C6C8C8'
$b+=T '客户：华东力健体育发展有限公司' 104 274 13 '#252829' 700
$b+=T '项目：旗舰训练中心 / 上海' 104 304 12 '#555A5C' 500
$b+=T '报价日期：2026-07-23     有效期：30 天' 900 274 12 '#252829' 600
$heads='序号','产品 / 规格','数量','单价','小计'
$xs=92,164,970,1080,1220
for($i=0;$i -lt 5;$i++){$b+=T $heads[$i] $xs[$i] 380 11 '#FFFFFF' 700}
$b+=Box 80 350 1280 52 '#16191A' '#16191A'
$items=@('01|TF-R8000 商用力量训练架 / 黑红|4|¥38,800|¥155,200','02|TF-B400 可调训练凳 / 8 档|8|¥6,800|¥54,400','03|奥杆匹克杠铃 20KG / 190K PSI|12|¥2,480|¥29,760','04|竞赛杠铃片套装 150KG|6|¥8,600|¥51,600')
for($i=0;$i -lt 4;$i++){ $y=446+$i*72;$p=$items[$i].Split('|');$b+=L 80 ($y-28) 1360 ($y-28) '#C9CBCB' 1;for($j=0;$j -lt 5;$j++){$b+=T $p[$j] $xs[$j] $y 12 '#202324' $(if($j -eq 1){700}else{500})}}
$b+=Box 900 760 460 132 '#F4F4F2' '#C6C8C8';$b+=T '设备小计' 928 792 12 '#555A5C' 600;$b+=T '¥290,960' 1220 792 12 '#202324' 700;$b+=T '安装与运输' 928 824 12 '#555A5C' 600;$b+=T '¥18,000' 1220 824 12 '#202324' 700;$b+=L 928 842 1334 842 '#D60918' 2;$b+=T '合计（含税）' 928 874 13 '#202324' 800;$b+=T '¥308,960' 1190 874 18 '#D60918' 800
$b+=T '付款条件：50% 预付款 / 50% 验收后支付' 80 922 11 '#555A5C' 500;$b+=T 'TATAN FORCE  |  WWW.TATANFORCE.CN  |  400-800-2026' 80 972 10 '#777B7C' 700
$quote="<svg xmlns='http://www.w3.org/2000/svg' width='1440' height='1024' viewBox='0 0 1440 1024'><rect width='1440' height='1024' fill='#FFFFFF'/>$b</svg>"
[IO.File]::WriteAllText((Join-Path $out '08-pdf-quote.svg'),$quote,[Text.UTF8Encoding]::new($false))

function DarkDoc([string]$num,[string]$name,[string[]]$cols,[string[][]]$cards){
  $x=T "TATAN / FORCE  ·  $num" 62 56 12 '#E00717' 700
  $x+=T $name 62 104 34 '#F2F3F3' 800
  $x+=L 62 130 1378 130 '#E00717' 3
  for($i=0;$i -lt $cols.Count;$i++){ $cx=62+$i*([int](1316/$cols.Count));$x+=T $cols[$i] $cx 180 12 '#858A8C' 700 }
  $cw=[int](1260/$cards.Count)
  for($i=0;$i -lt $cards.Count;$i++){ $cx=62+$i*($cw+18);$x+=Box $cx 214 $cw 690 '#0E1011' '#383C3E';$x+=L $cx 214 ($cx+$cw) 214 '#E00717' 3;$x+=T $cards[$i][0] ($cx+22) 258 18 '#F2F3F3' 800;for($j=1;$j -lt $cards[$i].Count;$j++){$x+=T ('—  '+$cards[$i][$j]) ($cx+22) (302+($j-1)*54) 12 '#B8BBBC' 500}}
  $x+=T 'BLACK / RED INDUSTRIAL SYSTEM  ·  REV 1.0' 62 970 10 '#686D6F' 700
  Wrap $num $x
}
$svg=DarkDoc '09' '系统设置 / SETTINGS' @('GENERAL','COMMERCE','ACCESS') @(@('品牌与区域','站点名称 / TATAN FORCE','语言 / 简体中文','时区 / Asia Shanghai','货币 / CNY ¥','品牌红 / #E00717'),@('报价规则','增值税 / 13%','报价有效期 / 30 DAYS','编号前缀 / QT','库存预警 / 12 SETS','PDF 模板 / INDUSTRIAL'),@('权限与安全','超级管理员 / 02','销售账号 / 18','内容编辑 / 06','双因素认证 / ON','审计日志 / 180 DAYS'))
[IO.File]::WriteAllText((Join-Path $out '09-settings.svg'),$svg,[Text.UTF8Encoding]::new($false))
$svg=DarkDoc '10' '数据结构 / DATA STRUCTURE' @('CORE ENTITIES','RELATIONS','API CONTRACT') @(@('PRODUCT','id / sku / slug','name / category_id','price / stock / status','specifications JSON','media Asset[]'),@('RELATION GRAPH','Category 1—N Product','Customer 1—N Quote','Quote 1—N QuoteItem','Product 1—N QuoteItem','User 1—N AuditLog'),@('ENDPOINTS','GET /api/products','POST /api/quotes','PATCH /api/settings','GET /api/dashboard','POST /api/pdf/export'))
[IO.File]::WriteAllText((Join-Path $out '10-data-structure.svg'),$svg,[Text.UTF8Encoding]::new($false))
$svg=DarkDoc '11' '开发交付 / DEVELOPER HANDOFF' @('FOUNDATION','COMPONENTS','QUALITY') @(@('设计令牌','Canvas / #070809','Surface / #0E1011','Signal / #E00717','Grid / 8 PX','Radius / 0—2 PX'),@('组件清单','Button / 4 states','Input / 5 states','Data Table / dense','Metric Card / live','Navigation / rail'),@('验收标准','Desktop / 1440','Tablet / 1024','Mobile / 390','WCAG AA contrast','Keyboard complete'))
[IO.File]::WriteAllText((Join-Path $out '11-developer-handoff.svg'),$svg,[Text.UTF8Encoding]::new($false))
$svg=DarkDoc '12' '开发计划 / DEVELOPMENT PLAN' @('SPRINT 01','SPRINT 02','SPRINT 03','RELEASE') @(@('基础设施','Design tokens','Auth + roles','Data schema','App shell','CI pipeline'),@('核心业务','Product CMS','Quote builder','PDF export','Customer CRM','Dashboard'),@('打磨与联调','Responsive QA','Accessibility','Performance','Analytics','UAT fixes'),@('上线','Data migration','Security review','Production deploy','Monitoring','30-day support'))
[IO.File]::WriteAllText((Join-Path $out '12-development-plan.svg'),$svg,[Text.UTF8Encoding]::new($false))

Get-ChildItem -LiteralPath $out -Filter '*.svg' | Select-Object Name,Length

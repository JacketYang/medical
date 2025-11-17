-- 种子数据

-- 插入管理员用户（密码：admin123，实际部署时应该使用更安全的密码）
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 'admin');

-- 插入产品分类
INSERT INTO categories (name, slug, description) VALUES 
('医疗设备', 'medical-equipment', '各类专业医疗设备'),
('手术器械', 'surgical-instruments', '手术用专业器械'),
('诊断设备', 'diagnostic-equipment', '医学诊断相关设备');

-- 插入示例产品
INSERT INTO products (slug, name, summary, description, price, category, images, specs, featured) VALUES 
('portable-ultrasound-scanner', '便携式超声扫描仪', '高性能便携式超声诊断设备', '<p>这款便携式超声扫描仪采用先进的成像技术，提供清晰的诊断图像。设备轻便易携，适合各种医疗环境使用。</p><p>主要特点：</p><ul><li>高分辨率成像</li><li>便携式设计</li><li>长续航电池</li><li>多种探头选择</li></ul>', 85000.00, '医疗设备', '["https://example.com/ultrasound1.jpg", "https://example.com/ultrasound2.jpg"]', '{"brand": "MedTech", "model": "UT-2000", "weight": "2.5kg", "battery": "8小时", "warranty": "2年"}', 1),
('surgical-scalpel-set', '手术刀套装', '专业外科手术刀具套装', '<p>高品质不锈钢手术刀套装，包含各种规格刀片和刀柄，满足不同手术需求。</p><p>产品特点：</p><ul><li>医用级不锈钢</li><li>精密加工</li><li>一次性刀片</li><li>符合医疗标准</li></ul>', 1200.00, '手术器械', '["https://example.com/scalpel1.jpg"]', '{"material": "不锈钢", "pieces": "15件套", "sterilization": "EO灭菌", "certification": "CE认证"}', 0),
('digital-ecg-monitor', '数字心电监护仪', '多参数心电监护设备', '<p>专业级数字心电监护仪，实时监测心电信号，配备大屏幕显示和数据存储功能。</p><p>核心功能：</p><ul><li>实时心电监测</li><li>数据记录存储</li><li>报警功能</li><li>网络连接</li></ul>', 35000.00, '诊断设备', '["https://example.com/ecg1.jpg", "https://example.com/ecg2.jpg"]', '{"screen": "12寸彩色屏", "channels": "12导联", "storage": "1000小时数据", "connectivity": "WiFi/蓝牙"}', 1);

-- 插入示例文章
INSERT INTO posts (slug, title, summary, content, author, featured) VALUES 
('latest-medical-technology-trends', '2024年医疗技术发展趋势', '探讨最新的医疗技术发展方向和创新应用', '<p>2024年医疗技术领域正在经历前所未有的变革。人工智能、远程医疗、精准医疗等技术正在重塑医疗行业。</p><p>本文将深入分析以下几个关键趋势：</p><ol><li>人工智能在诊断中的应用</li><li>远程医疗的普及</li><li>个性化医疗方案</li><li>医疗设备的小型化</li></ol><p>这些技术的发展将为患者带来更好的医疗服务体验。</p>', '医学编辑部', 1),
('how-to-choose-medical-equipment', '如何选择合适的医疗设备', '医疗机构设备采购指南', '<p>选择合适的医疗设备对医疗机构至关重要。本文为您提供专业的设备采购建议。</p><p>选择医疗设备时需要考虑以下因素：</p><ul><li>临床需求匹配度</li><li>设备性能指标</li><li>预算成本</li><li>售后服务</li><li>培训支持</li></ul><p>通过综合考虑这些因素，您可以做出明智的采购决策。</p>', '设备专家', 0);

-- 插入站点设置
INSERT INTO site_settings (setting_key, setting_value, description) VALUES 
('site_title', '医疗器械销售官网', '网站标题'),
('site_description', '专业医疗器械销售平台，提供高品质医疗设备和手术器械', '网站描述'),
('contact_email', 'info@medsales.com', '联系邮箱'),
('contact_phone', '+86-400-123-4567', '联系电话'),
('company_address', '北京市朝阳区医疗科技园区', '公司地址'),
('about_us', '<p>我们是一家专业的医疗器械销售公司，致力于为医疗机构提供高品质的医疗设备和解决方案。</p>', '关于我们');
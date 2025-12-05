# JSON Extractor - 油猴脚本

这是一个强大的油猴脚本工具，用于检测、提取和格式化显示网页中的 JSON 数据。

## 功能特性

### 🔍 主脚本：JSON 检测器 (`json-detector.user.js`)

- **智能检测**：根据配置的 XPath 规则自动扫描页面元素
- **JSON 识别**：智能识别元素内容中的 JSON 对象（支持嵌套结构）
- **可视化提示**：在包含 JSON 的元素后自动添加美观的"检测到 JSON"按钮
- **一键提取**：点击按钮自动复制内容到剪贴板并打开查看器
- **可配置**：通过油猴菜单配置自定义 XPath 规则
- **动态监听**：实时监听 DOM 变化，自动处理动态加载的内容

### 📊 查看器脚本：JSON 查看器 (`json-viewer.user.js`)

- **文本输入**：顶部文本框可粘贴任意文本，手动提取 JSON（支持 Ctrl+Enter 快捷键）
- **双栏布局**：左侧显示原文内容，右侧显示格式化的 JSON 编辑器
- **多 JSON 支持**：自动提取文本中的所有 JSON 对象
- **下拉选择**：通过下拉菜单轻松切换查看不同的 JSON 对象
- **格式化显示**：语法高亮的格式化 JSON 显示
- **统计信息**：实时显示数据大小、对象数量、数组数量等统计
- **多重复制**：支持复制原文、原始 JSON 和格式化后的 JSON

## 安装步骤

### 1. 安装 Tampermonkey

首先需要在浏览器中安装 Tampermonkey 扩展：

- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Safari](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. 安装脚本

#### 方法一：直接安装

1. 打开 Tampermonkey 管理面板
2. 点击"新建脚本"
3. 将 `src/json-detector.user.js` 的内容复制粘贴进去
4. 保存（Ctrl+S 或 Cmd+S）
5. 重复步骤 2-4，安装 `src/json-viewer.user.js`

#### 方法二：从文件安装

1. 打开 Tampermonkey 管理面板
2. 点击"实用工具"标签
3. 在"导入"区域选择文件
4. 分别选择 `json-detector.user.js` 和 `json-viewer.user.js` 并导入

## 使用说明

### 配置 XPath 规则

1. 点击浏览器工具栏中的 Tampermonkey 图标
2. 选择"JSON 检测器"
3. 点击"配置 XPath 规则"菜单项
4. 在弹出的对话框中，每行输入一个 XPath 表达式
5. 点击确定保存

**默认 XPath 规则：**
```
//pre
//code
//*[@class="json"]
//*[contains(@class, "response")]
```

**常用 XPath 示例：**
```
//pre                              - 匹配所有 <pre> 标签
//code                             - 匹配所有 <code> 标签
//*[@class="json"]                 - 匹配 class="json" 的元素
//*[contains(@class, "response")]  - 匹配 class 包含 "response" 的元素
//div[@id="api-response"]          - 匹配 id="api-response" 的 div
//*[contains(@id, "result")]       - 匹配 id 包含 "result" 的元素
```

### 提取和查看 JSON

#### 方式一：从网页自动提取

1. **访问包含 JSON 的网页**
   - 脚本会自动扫描页面
   - 在包含 JSON 的元素后方会出现"📋 检测到 JSON"按钮

2. **提取 JSON**
   - 点击"📋 检测到 JSON"按钮
   - 内容会自动复制到剪贴板
   - 自动打开新标签页显示 JSON 查看器

#### 方式二：手动粘贴提取

1. **打开查看器页面**
   - 访问任意网页后手动打开 `/json-extractor-viewer` 路径
   - 或先点击任意"检测到 JSON"按钮打开查看器

2. **粘贴文本内容**
   - 在顶部的文本框中粘贴任意包含 JSON 的文本
   - 支持从 API 响应、日志文件、聊天记录等任何地方复制的内容

3. **提取 JSON**
   - 点击"🔍 提取 JSON"按钮（或按 Ctrl+Enter）
   - 自动提取所有 JSON 对象并显示

#### 查看和操作

- **左侧原文区域**：显示完整的原始文本，可复制
- **右侧编辑器区域**：显示格式化的 JSON，带语法高亮
- **下拉选择器**：如果有多个 JSON，可切换查看
- **统计信息**：右侧顶部显示数据大小、对象数、数组数等
- **复制功能**：
  - "📋 复制原始"：复制当前选中的原始 JSON
  - "📋 复制格式化"：复制格式化后的 JSON
  - 左侧"复制原文"：复制完整原文内容

## 技术特性

### 数据传递

- 使用 `localStorage` 在主脚本和查看器之间传递数据
- 带时间戳验证，确保数据新鲜度（5分钟内有效）
- 使用后自动清理，防止数据泄露
- 不依赖系统剪贴板权限，更可靠

### 性能优化

- 使用 `WeakSet` 标记已处理的元素，避免重复处理
- `MutationObserver` 监听 DOM 变化，支持动态内容
- 延迟执行（`@run-at document-idle`），不影响页面加载速度
- JSONEditor 组件按需加载，提升初始化速度

## 兼容性

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Edge 88+
- ✅ Safari 14+
- ✅ 需要 Tampermonkey 4.10+ 或 Violentmonkey 2.12+

## 常见问题

### Q: 为什么没有出现"检测到 JSON"按钮？

**A:** 可能的原因：
1. 页面元素不匹配配置的 XPath 规则 - 尝试添加新的 XPath
2. 元素内容不是有效的 JSON - 检查内容格式
3. 脚本未启用 - 检查 Tampermonkey 中脚本是否已启用

### Q: 查看器页面显示"未找到数据"？

**A:** 可能的原因：
1. 没有从主页面点击按钮 - 需要先在原页面点击"检测到 JSON"按钮
2. 浏览器阻止了 `localStorage` - 检查浏览器隐私设置
3. 数据已过期 - 数据在 5 分钟后会失效，需要重新点击按钮
4. 也可以直接在查看器页面的文本框中粘贴内容手动提取

### Q: 如何提取特定网站的 JSON？

**A:** 
1. 右键点击包含 JSON 的元素
2. 选择"检查"打开开发者工具
3. 在元素面板中右键选中的元素
4. 选择"复制" → "复制 XPath"
5. 在脚本配置中添加这个 XPath

### Q: 支持哪些 JSON 格式？

**A:** 支持所有标准 JSON 格式：
- 对象：`{...}`
- 数组：`[...]`
- 嵌套结构：`{a: {b: {...}}, c: [...]}`
- 基本类型：字符串、数字、布尔值、null


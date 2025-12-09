// ==UserScript==
// @name         JSON 查看器
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  解析和格式化显示 JSON 对象 - 支持标准 JSON 和无引号键名格式
// @author       You
// @match        */json-extractor-viewer*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 创建查看器页面
    function createViewerPage() {
        // 清空页面
        document.open();
        document.close();

        // 创建 HTML 结构
        const html = document.documentElement;
        html.innerHTML = '';
        html.lang = 'zh-CN';

        // 创建 head
        const head = document.createElement('head');
        const headContent = `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>JSON 查看器</title>
        `;
        head.innerHTML = headContent;

        // 添加 JSONEditor CSS
        const cssLink = document.createElement('link');
        cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.4.1/jsoneditor.min.css';
        cssLink.rel = 'stylesheet';
        head.appendChild(cssLink);

        // 添加自定义样式
        const style = document.createElement('style');
        style.textContent = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }

        .container {
            max-width: 1800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 40px);
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            text-align: center;
            flex-shrink: 0;
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 13px;
            opacity: 0.9;
        }

        .input-section {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            flex-shrink: 0;
        }

        .input-section label {
            display: block;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .input-wrapper {
            display: flex;
            gap: 10px;
        }

        #text-input {
            flex: 1;
            padding: 10px 15px;
            border: 2px solid #667eea;
            border-radius: 5px;
            font-size: 14px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            resize: vertical;
            min-height: 80px;
        }

        #text-input:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        #extract-btn {
            padding: 10px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            align-self: flex-start;
        }

        #extract-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .controls {
            padding: 15px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        .controls label {
            font-weight: 600;
            color: #333;
        }

        .controls select {
            flex: 1;
            min-width: 200px;
            padding: 8px 12px;
            border: 2px solid #667eea;
            border-radius: 5px;
            font-size: 14px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .controls select:hover {
            border-color: #764ba2;
        }

        .controls select:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .left-panel, .right-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .left-panel {
            border-right: 2px solid #e0e0e0;
        }

        .panel-header {
            background: #f8f9fa;
            padding: 12px 20px;
            border-bottom: 1px solid #e0e0e0;
            font-weight: 600;
            color: #333;
            text-align: center;
        }

        .panel-content {
            flex: 1;
            overflow: hidden;
        }

        #jsoneditor-code, #jsoneditor-tree {
            height: 100%;
        }

        .error {
            background: #fee;
            color: #c33;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #c33;
            margin: 20px;
        }

        .info {
            background: #e3f2fd;
            color: #1976d2;
            padding: 20px;
            border-radius: 5px;
            border-left: 4px solid #1976d2;
            margin: 20px;
        }

        .copy-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @media (max-width: 1200px) {
            .content {
                flex-direction: column;
            }

            .left-panel {
                border-right: none;
                border-bottom: 2px solid #e0e0e0;
                max-height: 300px;
            }
        }
        `;
        head.appendChild(style);

        // 创建 body
        const body = document.createElement('body');
        body.innerHTML = `
    <div class="container">
        
        <div class="input-section">
            <div class="input-wrapper">
                <textarea id="text-input" placeholder="在此粘贴包含 JSON 的文本，然后点击提取按钮..."></textarea>
                <button id="extract-btn">🔍 提取 JSON</button>
            </div>
        </div>
        
        <div class="controls">
            <label for="json-select" id="select-label">选择 JSON 对象：</label>
            <select id="json-select">
                <option value="">-- 请选择 --</option>
            </select>
        </div>

        <div class="content">
            <div class="left-panel">
                <div class="panel-content">
                    <div id="jsoneditor-code"></div>
                </div>
            </div>
            
            <div class="right-panel">
                <div class="panel-content">
                    <div id="jsoneditor-tree"></div>
                </div>
            </div>
        </div>
    </div>
        `;

        // 组装页面
        html.appendChild(head);
        html.appendChild(body);

        // 加载 JSONEditor 库
        const jsonEditorScript = document.createElement('script');
        jsonEditorScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/10.4.1/jsoneditor.min.js';
        jsonEditorScript.onload = initApplication;
        body.appendChild(jsonEditorScript);
    }

    // 初始化应用逻辑
    function initApplication() {
        const closeCharacterMap = {
            '"': '"',
            '[': ']',
            '{': '}',
        };

        const defaultParser = JSON.parse.bind(JSON);

        // 从文本中提取所有顶层 JSON 对象（不解析嵌套内部的 JSON）
        function extractJson(subject, configuration) {
            const parser = defaultParser;
            const filter = configuration && configuration.filter;

            const foundObjects = [];

            const rule = /["[{]/g;

            let subjectOffset = 0;

            while (true) {
                const offsetSubject = subject.slice(subjectOffset);

                const openCharacterMatch = rule.exec(offsetSubject);

                if (!openCharacterMatch) {
                    break;
                }

                const openCharacter = openCharacterMatch[0];
                const closeCharacter = closeCharacterMap[openCharacter];

                const startIndex = openCharacterMatch.index;

                let haystack = offsetSubject.slice(startIndex);

                while (haystack.length) {
                    if (!filter || filter(haystack)) {
                        try {
                            const result = parser(haystack);
                            // 过滤空对象或数组或字符串
                            if ((typeof result === 'object' && result !== null) && (Object.keys(result).length === 0 || (Array.isArray(result) && result.length === 0)) || (typeof result === 'string' && result.trim() === '')) {
                            } else {
                                foundObjects.push({
                                    raw: haystack,
                                    parsed: result,
                                    preview: generatePreview(result)
                                });
                            }

                            subjectOffset += startIndex + haystack.length;

                            rule.lastIndex = 0;

                            break;
                        } catch (error) {
                            //
                        }
                    }

                    const offsetIndex = haystack.slice(0, -1).lastIndexOf(closeCharacter) + 1;

                    haystack = haystack.slice(0, offsetIndex);
                }
            }

            return foundObjects;
        }


        // 生成 JSON 预览文本
        function generatePreview(obj) {
            const type = Array.isArray(obj) ? 'Array' : typeof obj === 'object' ? 'Object' : typeof obj;
            let preview = type;

            if (Array.isArray(obj)) {
                preview += ` [${obj.length} 项]`;
            } else if (typeof obj === 'object' && obj !== null) {
                const keys = Object.keys(obj);
                preview += ` {${keys.length} 个键`;
                if (keys.length > 0) {
                    preview += `: ${keys.slice(0, 3).join(', ')}`;
                    if (keys.length > 3) preview += '...';
                }
                preview += '}';
            }

            return preview;
        }

        // 初始化编辑器
        let editorCode = null;
        let editorTree = null;
        let currentJSONs = [];

        function initEditors() {
            // 左侧代码编辑器
            const containerCode = document.getElementById('jsoneditor-code');
            const optionsCode = {
                mode: 'code',
                mainMenuBar: true,
                navigationBar: false,
                statusBar: true
            };
            editorCode = new JSONEditor(containerCode, optionsCode);

            // 右侧树形编辑器
            const containerTree = document.getElementById('jsoneditor-tree');
            const optionsTree = {
                mode: 'tree',
                mainMenuBar: true,
                navigationBar: true,
                statusBar: true,
                search: true
            };
            editorTree = new JSONEditor(containerTree, optionsTree);
        }

        // 处理数据
        function processData(data) {
            if (!data) {
                alert('未找到数据！请先在原页面点击"检测到 JSON"按钮，或在上方文本框粘贴内容。');
                return;
            }

            // 提取所有 JSON 对象
            const jsons = extractJson(data);

            if (jsons.length === 0) {
                alert('未能从文本中提取到有效的 JSON 对象！');
                return;
            }

            currentJSONs = jsons;

            // 填充下拉选择器
            const jsonSelect = document.getElementById('json-select');
            const selectLabel = document.getElementById('select-label');
            jsonSelect.innerHTML = '<option value="">-- 请选择 --</option>';
            jsons.forEach((json, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `JSON ${index + 1}: ${json.preview}`;
                jsonSelect.appendChild(option);
            });

            // 自动选择并显示第一个 JSON
            if (jsons.length > 0) {
                jsonSelect.value = '0';
                showJSON(jsons[0].parsed);
                selectLabel.innerText = `识别到 ${jsons.length} 个 JSON 对象：`;
            } else {
                selectLabel.innerText = `未识别到有效的 JSON 对象：`;
            }
        }

        // 显示 JSON
        function showJSON(json) {
            editorCode.set(json);
            editorTree.set(json);
            editorTree.expandAll();
        }

        // 初始化
        initEditors();
        // 提取按钮
        const extractBtn = document.getElementById('extract-btn');
        const textInput = document.getElementById('text-input');

        // 从 localStorage 获取数据
        try {
            const stored = localStorage.getItem('json_extractor_data');
            if (stored) {
                const data = JSON.parse(stored);
                textInput.value = data.content || '';
                processData(data.content);
            }
        } catch (err) {
            console.error('无法读取 localStorage:', err);
        }


        extractBtn.addEventListener('click', function () {
            const inputData = textInput.value.trim();
            if (!inputData) {
                alert('请先输入或粘贴文本内容！');
                return;
            }
            processData(inputData);
        });

        // Ctrl+Enter 快捷键
        textInput.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                extractBtn.click();
            }
        });

        // 选择事件
        const jsonSelect = document.getElementById('json-select');
        jsonSelect.addEventListener('change', function () {
            const index = parseInt(this.value);
            if (isNaN(index) || index < 0 || index >= currentJSONs.length) {
                return;
            }
            showJSON(currentJSONs[index].parsed);
        });
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createViewerPage);
    } else {
        createViewerPage();
    }

    let tryCount = 0;

    let removeMonica = setInterval(() => {
        // 移除monica
        var elementNodeList = document.querySelectorAll("body[monica-id]");
        if (elementNodeList && elementNodeList.length > 0) {
            elementNodeList.forEach(el => el.remove());
            clearInterval(removeMonica);
        } else if (tryCount++ > 20) {
            clearInterval(removeMonica);
        }
    }, 100);
})();


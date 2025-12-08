// ==UserScript==
// @name         JSON 检测器
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  检测页面中的 JSON - 支持标准 JSON 和日志格式的无引号键名 JSON
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // 默认 XPath 配置
    const DEFAULT_XPATHS = [
        '//pre',
        '//code',
        '//*[@class="json"]',
        '//*[contains(@class, "response")]'
    ];

    const closeCharacterMap = {
        '"': '"',
        '[': ']',
        '{': '}',
    };

    const defaultParser = JSON.parse.bind(JSON);

    // 获取或初始化 XPath 配置
    function getXPathConfig() {
        const saved = GM_getValue('xpath_config', null);
        if (saved) {
            return JSON.parse(saved);
        }
        return DEFAULT_XPATHS;
    }

    // 保存 XPath 配置
    function saveXPathConfig(xpaths) {
        GM_setValue('xpath_config', JSON.stringify(xpaths));
    }

    // 配置管理界面
    function showConfigDialog() {
        const xpaths = getXPathConfig();
        const currentConfig = xpaths.join('\n');

        const newConfig = prompt(
            'XPath 配置（每行一个 XPath 表达式）：',
            currentConfig
        );

        if (newConfig !== null) {
            const newXPaths = newConfig.split('\n')
                .map(x => x.trim())
                .filter(x => x.length > 0);
            saveXPathConfig(newXPaths);
            alert('配置已保存！刷新页面后生效。');
        }
    }

    // 注册配置菜单
    GM_registerMenuCommand('配置 XPath 规则', showConfigDialog);

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
                        // 过滤空对象或数组
                        if((typeof result === 'object' && result !== null) && (Object.keys(result).length === 0 || (Array.isArray(result) && result.length === 0))) continue;

                        foundObjects.push(result);

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

    // 检查元素是否包含 JSON
    function containsJSON(element) {
        const text = element.textContent || element.innerText || '';
        if (!text.trim()) return false;

        const jsons = extractJson(text);
        return jsons.length > 0;
    }

    // 创建检测按钮
    function createDetectButton(element) {
        const button = document.createElement('button');
        button.textContent = '识别到 JSON ';
        button.style.cssText = `
            background: none;
            color: blue;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            z-index: 9999;
            position: relative;
        `;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const text = element.textContent || element.innerText || '';

            // 将数据保存到 localStorage（用于跨页面传递）
            try {
                const data = {
                    content: text,
                    timestamp: Date.now()
                };
                localStorage.setItem('json_extractor_data', JSON.stringify(data));
            } catch (err) {
                console.error('无法保存到 localStorage:', err);
                // 尝试使用剪贴板作为后备
                try {
                    GM_setClipboard(text);
                } catch (clipboardErr) {
                    console.error('剪贴板也失败了:', clipboardErr);
                }
            }

            // 打开查看器页面
            const viewerUrl = window.location.origin + '/json-extractor-viewer';
            window.open(viewerUrl, '_blank');
        });

        return button;
    }

    // 标记已处理的元素
    const processedElements = new WeakSet();

    // 扫描页面并添加按钮
    function scanPage() {
        const xpaths = getXPathConfig();

        xpaths.forEach(xpath => {
            try {
                const result = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < result.snapshotLength; i++) {
                    const element = result.snapshotItem(i);

                    // 跳过已处理的元素
                    if (processedElements.has(element)) continue;

                    // 检查是否包含 JSON
                    if (containsJSON(element)) {
                        const button = createDetectButton(element);

                        // 在元素后面插入按钮
                        if (element.nextSibling) {
                            element.parentNode.insertBefore(button, element.nextSibling);
                        } else {
                            element.parentNode.appendChild(button);
                        }

                        // 标记为已处理
                        processedElements.add(element);
                    }
                }
            } catch (e) {
                console.error('XPath 执行错误:', xpath, e);
            }
        });
    }

    // 初始扫描
    scanPage();

    // 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        scanPage();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('JSON 检测器已启动');
})();


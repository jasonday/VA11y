"use strict";
const va11yVersion = "1.2 beta";

// Singleton to prevent multiple instances
if (window.va11yInstance) {
    if (window.va11yInstance.cleanup) {
        window.va11yInstance.cleanup();
    }
}

function va11y() {
    // --- Shared Constants & Styles ---
    const PANEL_ID = "va11y-panel";
    const FAB_ID = "va11y-fab";
    const OVERLAY_CONTAINER_ID = "va11y-overlay-container";
    const PANEL_WIDTH = 450;

    // Universal Access Icon 
    const FAB_ICON = "";

    // UI STYLES (Injected into Shadow DOM)
    const UI_STYLES = `
        /* FAB */
        #${FAB_ID} {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px;
            background: #005fcc;
            color: white;
            border-radius: 12px;
            text-align: center;
            font-size: 24px;
            cursor: pointer;
            z-index: 2147483647;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            user-select: none;
            transition: transform 0.2s;
            box-sizing: border-box; 
            line-height: normal;
        }
        #${FAB_ID}:hover {
            transform: scale(1.1);
            background: #004a9e;
        }
        #${FAB_ID}:active {
            transform: scale(0.95);
        }
        
        /* Panel Container */
        #${PANEL_ID} {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: ${PANEL_WIDTH}px;
            height: 600px;
            max-height: 80vh;
            background: #1a1a1a;
            color: #eee;
            border: 1px solid #444;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            display: none; /* Hidden by default */
            flex-direction: column;
            z-index: 2147483647;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
        }
        #${PANEL_ID}.visible {
            display: flex;
        }
        
        /* Header & Tabs */
        #${PANEL_ID}-header {
            display: flex;
            background: #333;
            border-bottom: 1px solid #444;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
            flex-shrink: 0;
        }
        #${PANEL_ID} .va11y-tab {
            flex: 1;
            padding: 10px 5px;
            background: #333;
            color: #ccc;
            border: none;
            cursor: pointer;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            border-right: 1px solid #444;
        }
        #${PANEL_ID} .va11y-tab:last-child { border-right: none; }
        #${PANEL_ID} .va11y-tab:hover { background: #444; color: white; }
        #${PANEL_ID} .va11y-tab.active {
            background: #005fcc;
            color: white;
        }
        
        /* Content Area */
        #${PANEL_ID}-content {
            flex-grow: 1;
            overflow-y: auto;
            padding: 15px;
            position: relative;
            background: #000;
        }
        
        /* Footer */
        #${PANEL_ID}-footer {
            padding: 8px;
            text-align: right;
            border-top: 1px solid #333;
            background: #222;
        }
        #${PANEL_ID}-close,
        #${PANEL_ID}-exit {
            background: transparent;
            border: 1px solid #555;
            color: #ddd;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
        }
        #${PANEL_ID}-close:hover,
        #${PANEL_ID}-exit:hover { background: #333; }

        /* Utility Styles from original tools */
        .va11y-list { list-style: none; margin: 0; padding: 0; }
        .va11y-list li { margin-bottom: 4px; padding: 4px; background: #222; border-left: 3px solid #555; }
        .va11y-name .va11y-list li,
        .va11y-image .va11y-list li { color: #999;}
        .va11y-name .va11y-list li:first-child,
        .va11y-image .va11y-list li:first-child { border-left-color: #007bff; color: #fff;}
        .va11y-tag { font-family: monospace; background: #333; padding: 1px 3px; border-radius: 2px; color: #fa0; }
        .va11y-good { color: #99f170; font-weight: bold; }
        .va11y-bad { color: #ff8888; font-weight: bold; }
        .va11y-warn { color: #ffcc00; font-weight: bold; }

        .va11y-indent-1 { margin-left: 0; border-left-color: #007bff !important; }
        .va11y-indent-2 { margin-left: 10px; border-left-color: #28a745 !important; }
        .va11y-indent-3 { margin-left: 20px; border-left-color: #ffc107 !important; }
        .va11y-indent-4 { margin-left: 30px; border-left-color: #dc3545 !important; }
        .va11y-indent-5 { margin-left: 40px; border-left-color: #17a2b8 !important; }
        .va11y-indent-6 { margin-left: 50px; border-left-color: #6c757d !important; }

        /* Tools Module */
        .va11y-tools-container { margin: 10px 0; }
        .va11y-tools-btn {
            padding: 8px 16px;
            background: #005fcc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .va11y-tools-btn:hover { background: #004a9e; }
        .va11y-tools-desc {
            margin-top: 10px;
            font-size: 12px;
            color: #aaa;
        }

        /* ARIA Switch */
        .va11y-switch {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }
        .va11y-switch-track {
            width: 44px;
            height: 24px;
            background: #555;
            border-radius: 12px;
            position: relative;
            transition: background 0.2s;
            margin-right: 8px;
        }
        .va11y-switch[aria-checked="true"] .va11y-switch-track {
            background: #005fcc;
        }
        .va11y-switch-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: left 0.2s;
        }
        .va11y-switch[aria-checked="true"] .va11y-switch-thumb {
            left: 22px;
        }
        .va11y-switch:focus {
            outline: 2px solid #005fcc;
            outline-offset: 2px;
        }
        .va11y-tool-desc {
            margin-left: 52px;
            font-size: 12px;
            color: #aaa;
        }
    `;

    // OVERLAY STYLES (Injected into Light DOM)
    const OVERLAY_STYLES = `
        .va11y-heading-highlight {
            position: absolute;
            background: rgba(255, 230, 0, 0.2);
            outline: 2px solid orange;
            pointer-events: none;
            z-index: 2147483640;
        }
        .va11y-heading-label,
        .va11y-structure-label {
            position: absolute;
            background: orange;
            color: black;
            font-size: 12px;
            font-weight: bold;
            padding: 2px 4px;
            z-index: 2147483641;
            pointer-events: none;
        }
        

        /* Module: aStructure Global Overlay */
        #${OVERLAY_CONTAINER_ID} {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 0;
            overflow: visible;
            z-index: 2147483646;
            pointer-events: none;
        }
        .va11y-structure-highlight {
            outline: 1px dashed black !important;
            box-shadow: 0px 0px 0px 1px white !important;
        }
        
        /* Module: aName focus styles */
        .va11y-name-focus:focus {
            outline: 5px solid #005fcc !important;
            outline-offset: 2px !important;
        }
    `;

    // --- State & DOM ---
    let host, shadow, fab, panel, contentArea;
    let activeModule = null;
    let overlayContainer = null;
    let structureActive = false;
    let textSpacingActive = false;
    let grayscaleActive = false;

    // Module cleaning functions stored here
    const moduleCleanups = {
        name: null,
        image: null,
        heading: null,
        structure: null
    };

    // --- Core UI Functions ---

    function createUI() {
        // Create Host
        host = document.createElement("div");
        host.id = "va11y-host";
        document.body.appendChild(host);

        // Create Shadow Root
        shadow = host.attachShadow({ mode: "open" });

        // Inject UI Styles into Shadow
        const uiStyle = document.createElement("style");
        uiStyle.textContent = UI_STYLES;
        shadow.appendChild(uiStyle);

        // Inject Overlay Styles into Light DOM
        const overlayStyle = document.createElement("style");
        overlayStyle.id = "va11y-overlay-styles";
        overlayStyle.textContent = OVERLAY_STYLES;
        document.head.appendChild(overlayStyle);

        // Create FAB
        fab = document.createElement("div");
        fab.id = FAB_ID;
        fab.innerHTML = FAB_ICON + '<span>VA11y</span>';
        fab.setAttribute("role", "button");
        fab.setAttribute("aria-label", "VA11y open bookmarklet");
        fab.setAttribute("aria-expanded", "false");
        fab.tabIndex = 0;
        fab.onclick = togglePanel;
        fab.onkeypress = (e) => { if (e.key === "Enter" || e.key === " ") togglePanel(); }
        shadow.appendChild(fab);

        // Create Panel
        panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML = `
            <div id="${PANEL_ID}-header" role="tablist">
                <button class="va11y-tab active" role="tab" aria-selected="true" tabindex="0" data-tab="overview">Overview</button>
                <button class="va11y-tab" role="tab" aria-selected="false" tabindex="-1" data-tab="name">Name</button>
                <button class="va11y-tab" role="tab" aria-selected="false" tabindex="-1" data-tab="image">Images</button>
                <button class="va11y-tab" role="tab" aria-selected="false" tabindex="-1" data-tab="heading">Headings</button>
                <button class="va11y-tab" role="tab" aria-selected="false" tabindex="-1" data-tab="tools">Tools</button>
            </div>
            <div id="${PANEL_ID}-content"></div>
            <div id="${PANEL_ID}-footer">
                <button id="${PANEL_ID}-close">Close VA11y Panel</button>
                <button id="${PANEL_ID}-exit">Exit VA11y</button>
            </div>
        `;
        shadow.appendChild(panel);

        contentArea = shadow.getElementById(`${PANEL_ID}-content`);

        // Event Listeners
        const tabs = panel.querySelectorAll(".va11y-tab");
        tabs.forEach((btn, index) => {
            btn.addEventListener("click", () => activateTab(btn.dataset.tab));
            btn.addEventListener("keydown", (e) => {
                let newIndex = index;
                if (e.key === "ArrowRight") {
                    newIndex = (index + 1) % tabs.length;
                    tabs[newIndex].focus();
                    e.preventDefault();
                } else if (e.key === "ArrowLeft") {
                    newIndex = (index - 1 + tabs.length) % tabs.length;
                    tabs[newIndex].focus();
                    e.preventDefault();
                } else if (e.key === "Enter" || e.key === " ") {
                    activateTab(btn.dataset.tab);
                    e.preventDefault();
                }
            });
        });
        shadow.getElementById(`${PANEL_ID}-close`).addEventListener("click", () => panel.classList.remove("visible"));
        shadow.getElementById(`${PANEL_ID}-exit`).addEventListener("click", () => {
            if (window.va11yInstance && window.va11yInstance.cleanup) window.va11yInstance.cleanup();
        });

        // Initial Tab
        activateTab("overview");
    }

    function togglePanel() {
        const isVisible = panel.classList.toggle("visible");
        fab.setAttribute("aria-expanded", isVisible);
        if (isVisible) {
            // Focus first tab when opened?
            const firstTab = panel.querySelector(".va11y-tab");
            if (firstTab) firstTab.focus();
        }
    }

    function activateTab(tabName) {
        // UI Update
        panel.querySelectorAll(".va11y-tab").forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", isActive);
            btn.setAttribute("tabindex", isActive ? "0" : "-1");
        });

        // Deactivate previous module
        if (activeModule && moduleModules[activeModule] && moduleModules[activeModule].deactivate) {
            moduleModules[activeModule].deactivate();
        }

        // Clean up structure overlay when switching tabs
        if (structureActive) {
            deactivateStructure();
            structureActive = false;
        }

        // Clean up text spacing when switching tabs
        if (textSpacingActive) {
            deactivateTextSpacing();
            textSpacingActive = false;
        }

        // Clean up grayscale when switching tabs
        if (grayscaleActive) {
            deactivateGrayscale();
            grayscaleActive = false;
        }

        // Clear Content
        contentArea.innerHTML = "";

        // Update content area class to reflect active tab
        contentArea.className = `va11y-${tabName}`;

        // Activate new module
        activeModule = tabName;
        if (moduleModules[tabName]) {
            moduleModules[tabName].activate(contentArea);
        }
    }

    // --- Helper Functions ---

    // Shadow DOM Recursion Helpers
    function traverseShadow(root, callback) {
        // Perform action on current level
        callback(root);

        // Recurse on children that have shadow roots
        const all = root.querySelectorAll('*');
        all.forEach(el => {
            if (el.shadowRoot) traverseShadow(el.shadowRoot, callback);
        });
    }

    function getTextContent(element) {
        // Get text content including content inside Shadow DOM
        let text = '';

        function collectText(node) {
            // Skip aria-hidden elements
            if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('aria-hidden') === 'true') {
                return;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Check shadow root first
                if (node.shadowRoot) {
                    Array.from(node.shadowRoot.childNodes).forEach(collectText);
                } else {
                    // Regular children
                    Array.from(node.childNodes).forEach(collectText);
                }
            }
        }

        collectText(element);
        return text.trim();
    }

    function getAbsRect(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        return {
            left: rect.left + scrollX,
            top: rect.top + scrollY,
            width: rect.width,
            height: rect.height,
            right: rect.left + scrollX + rect.width,
            bottom: rect.top + scrollY + rect.height
        };
    }

    function isVisible(el) {
        if (!el) return false;

        // Aria-hidden check walking up
        let current = el;
        while (current && current !== document) {
            if (current.nodeType === 1 && current.getAttribute("aria-hidden") === "true") return false;
            // Shadow boundary check
            if (current.parentNode instanceof ShadowRoot) current = current.parentNode.host;
            else current = current.parentNode;
        }

        if (!el.getClientRects().length) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- MODULES ---

    const moduleModules = {
        overview: {
            activate: (container) => {
                container.innerHTML = `
                    <h3>VA11Y Toolkit</h3>
                    <p>A unified accessibility testing tool.</p>
                    <ul class="va11y-list">
                        <li><strong>Name:</strong> Inspect accessible names of the focused element. Tab through the page to see results.</li>
                        <li><strong>Images:</strong> Hover over images to see alt text, type, and source.</li>
                        <li><strong>Headings:</strong> Visualizes heading structure and warns on errors.</li>
                        <li><strong>Tools:</strong> Testing tools and utilities.</li>
                    </ul>
                    <p>Select a tab above to begin.</p>
                `;
            },
            deactivate: () => { }
        },

        name: {
            activate: (container) => {
                const list = document.createElement("ul");
                list.className = "va11y-list";
                container.innerHTML = "<p>Focus any element to inspect accessible name.<br/><small>Note: Accessible name calculation is approximate and may not be 100% accurate.</small></p>";
                container.appendChild(list);

                function handleFocus(e) {
                    let el = e ? e.target : document.activeElement;
                    while (el && el.shadowRoot && el.shadowRoot.activeElement) {
                        el = el.shadowRoot.activeElement;
                    }
                    if (!el) return;

                    el.classList.add('va11y-name-focus');

                    const info = getAccessibleName(el);
                    const li = document.createElement("li");

                    const role = getElementRole(el);
                    const state = getElementState(el);

                    let status = `<span class="va11y-good">OK</span>`;
                    if (!info.name) status = `<span class="va11y-bad">No Name</span>`;

                    let stateHtml = state ? `<div>State: ${state}</div>` : "";

                    // Accessible Description check
                    let descHtml = "";
                    if (el.getAttribute("aria-describedby")) {
                        const ids = el.getAttribute("aria-describedby").split(" ");
                        const root = el.getRootNode();
                        const desc = ids.map(id => root.querySelector(`#${id}`)?.textContent || "").join(" ");
                        descHtml = `<div>Desc: ${desc} <small>(aria-describedby)</small></div>`;
                    }

                    li.innerHTML = `
                        <div><strong>${status}</strong> &lt;${el.tagName.toLowerCase()}&gt;</div>
                        <div>Name: "${escapeHtml(info.name)}" <small>(${escapeHtml(info.source)})</small></div>
                        <div>Role: ${escapeHtml(role)}</div>
                        ${stateHtml}
                        ${descHtml}
                    `;

                    // Prepend
                    list.insertBefore(li, list.firstChild);

                    // Remove class on blur
                    el.addEventListener('blur', () => el.classList.remove('va11y-name-focus'), { once: true });
                }

                // Global Focus Listener
                const handleGlobalFocus = (e) => handleFocus(e);

                // Attach to main document
                document.addEventListener('focusin', handleGlobalFocus);

                // Attach to all same-origin iframes
                const attachedIframes = [];
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        if (iframe.contentDocument) {
                            iframe.contentDocument.addEventListener('focusin', handleGlobalFocus);
                            attachedIframes.push(iframe.contentDocument);
                        }
                    } catch (e) {
                        // Ignore cross-origin frames
                    }
                });

                moduleCleanups.name = () => {
                    document.removeEventListener('focusin', handleGlobalFocus);

                    // Remove listeners from iframes
                    attachedIframes.forEach(doc => {
                        try {
                            doc.removeEventListener('focusin', handleGlobalFocus);
                        } catch (e) { /* ignore */ }
                    });

                    document.querySelectorAll('.va11y-name-focus').forEach(el => el.classList.remove('va11y-name-focus'));
                };
            },
            deactivate: () => {
                if (moduleCleanups.name) moduleCleanups.name();
            }
        },

        image: {
            activate: (container) => {
                // Create list container for history
                const list = document.createElement("ul");
                list.className = "va11y-list";
                // Check if container already has our list (e.g. from previous activation without clear) - actually we clear container on tab switch.
                container.innerHTML = "<p>Hover over any image or SVG to inspect details.</p>";
                container.appendChild(list);

                function handleHover(e) {
                    let el = e.target;

                    // Traverse up if we hit a path/rect inside an SVG to find the SVG itself
                    const svg = el.closest('svg');
                    if (svg) el = svg;

                    // Detect if image-like
                    const tagName = el.tagName.toLowerCase();
                    const role = el.getAttribute('role');
                    const validTags = ['img', 'svg', 'figure', 'picture', 'canvas', 'area', 'input', 'object', 'embed'];

                    if (!validTags.includes(tagName) && role !== 'img' && role !== 'figure') return;
                    if (tagName === 'input' && el.type !== 'image') return;

                    // Get Info
                    let name = "";
                    let source = "";
                    let url = "";

                    // URL / Source
                    if (tagName === 'img' || tagName === 'input') {
                        url = el.src;
                    } else if (tagName === 'object' || tagName === 'embed') {
                        url = el.data || el.src;
                    } else if (tagName === 'svg') {
                        url = "SVG (Internal/Inline)";
                    }

                    // Truncate URL
                    if (url && url.length > 50) url = url.substring(0, 47) + "...";

                    // Accessible Name Calculation
                    // 1. aria-labelledby
                    if (el.hasAttribute('aria-labelledby')) {
                        const ids = el.getAttribute('aria-labelledby').split(' ');
                        const root = el.getRootNode();
                        const texts = ids.map(id => root.querySelector(`#${id}`)?.textContent.trim() || "").join(" ");
                        if (texts) {
                            name = texts;
                            source = "aria-labelledby";
                        }
                    }
                    // 2. aria-label
                    if (!name && el.hasAttribute('aria-label')) {
                        name = el.getAttribute('aria-label');
                        source = "aria-label";
                    }
                    // 3. alt (for img, area, input)
                    if (!name && (tagName === 'img' || tagName === 'area' || (tagName === 'input' && el.type === 'image'))) {
                        if (el.hasAttribute('alt')) {
                            name = el.getAttribute('alt');
                            source = "alt attribute";
                            if (name === "") {
                                name = "Decorative (empty alt)";
                                source = 'alt=""';
                            }
                        } else {
                            name = "Missing Alt"; // Failure
                            source = "N/A";
                        }
                    }
                    // 4. SVG specific: <title> or <desc>
                    if (!name && tagName === 'svg') {
                        const title = el.querySelector('title');
                        const desc = el.querySelector('desc');
                        if (title && title.textContent.trim()) {
                            name = title.textContent.trim();
                            source = "&lt;title&gt;";
                        } else if (desc && desc.textContent.trim()) {
                            name = desc.textContent.trim();
                            source = "&lt;desc&gt;";
                        }
                    }
                    // 5. title attribute (fallback)
                    if (!name && !source && el.hasAttribute('title')) {
                        name = el.getAttribute('title');
                        source = "title attribute";
                    }

                    // If nothing found for SVG
                    if (!name && tagName === 'svg') {
                        name = "No Accessible Name";
                        source = "N/A";
                    }

                    // Create List Item
                    const li = document.createElement("li");

                    // Status Color
                    let statusClass = "va11y-good";
                    if (name === "Missing Alt" || name === "No Accessible Name") statusClass = "va11y-bad";
                    if (name === "Decorative (empty alt)") statusClass = "va11y-warn";

                    li.innerHTML = `
                    <div><strong class="${statusClass}">Image: &lt;${tagName}&gt;</strong></div>
                    <div>Name: "${escapeHtml(name)}" <small>(${escapeHtml(source)})</small></div>
                    ${url ? `<div><small style="color:#aaa;word-break:break-all;">${escapeHtml(url)}</small></div>` : ''}
                `;

                    // Prepend to list (History behavior)
                    list.insertBefore(li, list.firstChild);
                }

                traverseShadow(document, (root) => {
                    root.addEventListener('mouseover', handleHover);
                });

                moduleCleanups.image = () => {
                    traverseShadow(document, (root) => {
                        root.removeEventListener('mouseover', handleHover);
                    });
                };
            },
            deactivate: () => {
                if (moduleCleanups.image) moduleCleanups.image();
            }
        },

        heading: {
            activate: (container) => {
                const overlays = [];
                const headings = [];

                // Re-implementation of traversal from aHeading.js
                function traverse(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const tagName = node.tagName.toLowerCase();
                        const role = node.getAttribute("role");
                        let level = 0;

                        if (/^h[1-6]$/.test(tagName)) {
                            level = parseInt(tagName.substring(1));
                        } else if (role === "heading") {
                            const ariaLevel = node.getAttribute("aria-level");
                            level = ariaLevel ? parseInt(ariaLevel) : 2;
                        }

                        if (level > 0 && isVisible(node)) {
                            headings.push({
                                element: node,
                                level: level,
                                text: getTextContent(node),
                                tagName: tagName
                            });
                        }
                    }

                    if (node.shadowRoot) {
                        traverse(node.shadowRoot);
                    }

                    if (node.children) { // careful with shadowRoot which also has children
                        for (let i = 0; i < node.children.length; i++) {
                            traverse(node.children[i]);
                        }
                    }
                }
                traverse(document.body);

                // Draw Highlights
                headings.forEach(h => {
                    const rect = getAbsRect(h.element);
                    const div = document.createElement("div");
                    div.className = "va11y-heading-highlight";
                    // Apply styles
                    div.style.left = rect.left + "px";
                    div.style.top = rect.top + "px";
                    div.style.width = rect.width + "px";
                    div.style.height = rect.height + "px";
                    document.body.appendChild(div);
                    overlays.push(div);

                    const label = document.createElement("div");
                    label.className = "va11y-heading-label";
                    label.textContent = `H${h.level}`;
                    label.style.left = rect.left + "px";
                    label.style.top = (rect.top - 20) + "px";
                    document.body.appendChild(label);
                    overlays.push(label);
                });

                // Draw List
                const ul = document.createElement("ul");
                ul.className = "va11y-list";

                let lastLevel = 0;
                let hasH1 = false;

                headings.forEach(h => {
                    if (h.level === 1) hasH1 = true;
                    const li = document.createElement("li");
                    li.className = `va11y-indent-${h.level}`;
                    // Set specific left border color for levels matches aHeading.js
                    // Note: va11y-indent-X classes in STYLES handle border-color. 
                    // We need to ensure border-style is set in base class (checked: yes, 3px solid #555).

                    let warnings = "";
                    if (lastLevel > 0 && h.level > lastLevel + 1) warnings += ` <span class="va11y-warn">[Skipped Level]</span>`;
                    if (!h.text) warnings += ` <span class="va11y-bad">[Empty]</span>`;

                    li.innerHTML = `<strong>H${h.level}</strong> ${escapeHtml(h.text) || "<em>(Empty)</em>"} ${warnings}`;
                    ul.appendChild(li);
                    lastLevel = h.level;
                });

                if (!hasH1 && headings.length > 0) {
                    const li = document.createElement("li");
                    li.innerHTML = `<span class="va11y-bad">NO VISIBLE H1 FOUND</span>`;
                    ul.prepend(li);
                }

                if (headings.length === 0) {
                    container.innerHTML = "<p>No headings detected.</p>";
                } else {
                    container.appendChild(ul);
                }

                moduleCleanups.heading = () => {
                    overlays.forEach(el => el.remove());
                };
            },
            deactivate: () => {
                if (moduleCleanups.heading) moduleCleanups.heading();
            }
        },

        tools: {
            activate: (container) => {
                container.innerHTML = `
                    <h3>Tools</h3>
                    <ul class="va11y-list">
                        <li>
                            <div role="switch" 
                                 aria-checked="${structureActive}" 
                                 aria-labelledby="structure-label"
                                 aria-describedby="structure-desc"
                                 class="va11y-switch" 
                                 id="structure-switch"
                                 tabindex="0">
                                <span class="va11y-switch-track">
                                    <span class="va11y-switch-thumb"></span>
                                </span>
                                <span id="structure-label">Page structure</span>
                            </div>
                            <div id="structure-desc" class="va11y-tool-desc">
                                Displays labels for landmarks and semantic elements
                            </div>
                        </li>
                        <li>
                            <div role="switch" 
                                 aria-checked="${textSpacingActive}" 
                                 aria-labelledby="textspacing-label"
                                 class="va11y-switch" 
                                 id="textspacing-switch"
                                 tabindex="0">
                                <span class="va11y-switch-track">
                                    <span class="va11y-switch-thumb"></span>
                                </span>
                                <span id="textspacing-label">Text Spacing</span>
                            </div>
                            <div class="va11y-tool-desc">
                                Applies increased spacing to test readability
                            </div>
                        </li>
                        <li>
                            <div role="switch" 
                                 aria-checked="${grayscaleActive}" 
                                 aria-labelledby="grayscale-label"
                                 class="va11y-switch" 
                                 id="grayscale-switch"
                                 tabindex="0">
                                <span class="va11y-switch-track">
                                    <span class="va11y-switch-thumb"></span>
                                </span>
                                <span id="grayscale-label">Grayscale</span>
                            </div>
                            <div class="va11y-tool-desc">
                                Removes color from the page to test color reliance.
                            </div>
                        </li>
                    </ul>
                `;

                // Structure switch
                const structureSwitch = container.querySelector('#structure-switch');
                const handleStructureToggle = () => {
                    structureActive = !structureActive;
                    structureSwitch.setAttribute('aria-checked', structureActive);
                    if (structureActive) {
                        activateStructure();
                    } else {
                        deactivateStructure();
                    }
                };
                structureSwitch.addEventListener('click', handleStructureToggle);
                structureSwitch.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStructureToggle();
                    }
                });

                // Text spacing switch
                const textSpacingSwitch = container.querySelector('#textspacing-switch');
                const handleTextSpacingToggle = () => {
                    textSpacingActive = !textSpacingActive;
                    textSpacingSwitch.setAttribute('aria-checked', textSpacingActive);
                    if (textSpacingActive) {
                        activateTextSpacing();
                    } else {
                        deactivateTextSpacing();
                    }
                };
                textSpacingSwitch.addEventListener('click', handleTextSpacingToggle);
                textSpacingSwitch.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleTextSpacingToggle();
                    }
                });

                // Grayscale switch
                const grayscaleSwitch = container.querySelector('#grayscale-switch');
                const handleGrayscaleToggle = () => {
                    grayscaleActive = !grayscaleActive;
                    grayscaleSwitch.setAttribute('aria-checked', grayscaleActive);
                    if (grayscaleActive) {
                        activateGrayscale();
                    } else {
                        deactivateGrayscale();
                    }
                };
                grayscaleSwitch.addEventListener('click', handleGrayscaleToggle);
                grayscaleSwitch.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleGrayscaleToggle();
                    }
                });
            },
            deactivate: () => {
                // Tools remain active when switching tabs
            }
        },

        structure: {
            activate: (container) => {
                // This is now handled by the Tools tab

            },
            deactivate: () => {
                // Structure cleanup is now manual via Tools toggle
            }
        }
    };

    // --- Structure Functions (standalone) ---
    function activateStructure() {
        // Create overlay container
        let overlay = document.getElementById(OVERLAY_CONTAINER_ID);
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = OVERLAY_CONTAINER_ID;
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = ""; // Clear existing

        const validElements = [];

        // Lists synced from aStructure.js
        const structuralRoles = [
            'banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search',
            'application', 'article', 'blockquote', 'caption', 'cell', 'columnheader', 'definition', 'deletion',
            'directory', 'document', 'emphasis', 'feed', 'figure', 'generic', 'group', 'heading', 'img',
            'insertion', 'list', 'listitem', 'math', 'meter', 'none', 'note', 'paragraph', 'presentation',
            'row', 'rowgroup', 'rowheader', 'radiogroup', 'separator', 'strong', 'subscript', 'superscript', 'table',
            'term', 'time', 'toolbar', 'tooltip'
        ];
        const semanticElements = [
            'header', 'nav', 'main', 'article', 'section', 'aside', 'footer',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
            'figure', 'figcaption', 'time', 'address', 'details', 'summary', 'fieldset', 'legend'
        ];

        function scan(root) {
            root.querySelectorAll('*').forEach(el => {
                let label = "";
                const role = el.getAttribute('role');
                const tag = el.tagName.toLowerCase();

                // Logic synced from aStructure.js
                if (structuralRoles.includes(role)) {
                    label = `role="${role}"`;
                } else if (semanticElements.includes(tag)) {
                    label = `<${tag}>`;
                }

                if (label && isVisible(el)) {
                    validElements.push({ element: el, label });
                }

                if (el.shadowRoot) scan(el.shadowRoot);
            });
        }
        scan(document);

        const placedRects = [];

        validElements.forEach(item => {
            item.element.classList.add('va11y-structure-highlight');

            const labelDiv = document.createElement("div");
            labelDiv.className = "va11y-structure-label";
            labelDiv.textContent = item.label;

            const rect = getAbsRect(item.element);
            let top = rect.top;
            const left = rect.left;
            const height = 16;
            const width = 100;

            // Collision Logic
            let collision = true;
            let attempts = 0;
            while (collision && attempts < 50) {
                collision = false;
                for (const p of placedRects) {
                    if (!(left >= p.right || left + width <= p.left || top >= p.bottom || top + height <= p.top)) {
                        collision = true;
                        top = p.bottom + 1;
                        break;
                    }
                }
                attempts++;
            }

            labelDiv.style.left = left + "px";
            labelDiv.style.top = top + "px";
            overlay.appendChild(labelDiv);

            const finalRect = labelDiv.getBoundingClientRect();
            placedRects.push({
                left: left, right: left + finalRect.width,
                top: top, bottom: top + finalRect.height
            });
        });
    }

    function deactivateStructure() {
        document.querySelectorAll('.va11y-structure-highlight').forEach(el => el.classList.remove('va11y-structure-highlight'));
        const overlay = document.getElementById(OVERLAY_CONTAINER_ID);
        if (overlay) overlay.remove();
    }

    // --- Text Spacing Functions (based on WCAG 1.4.12) ---
    function activateTextSpacing() {
        const style = document.createElement('style');
        style.id = 'va11y-text-spacing';
        style.textContent = '*{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important;}p{margin-bottom:2em !important;}*:not(#a #b #c #d #e #f #g #h #i){line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important;}';

        document.head.appendChild(style);

        // Internal traversal function to match original bookmarklet logic exactly
        function applyToShadows(root) {
            const all = root.querySelectorAll('*');
            for (let i = 0; i < all.length; i++) {
                const el = all[i];
                if (el.shadowRoot) {
                    try {
                        el.shadowRoot.appendChild(style.cloneNode(true));
                        applyToShadows(el.shadowRoot);
                    } catch (e) {
                        // ignore errors
                    }
                }
            }
        }

        // Apply to main document
        applyToShadows(document);

        // Apply to iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    iframe.contentDocument.head.appendChild(style.cloneNode(true));
                    applyToShadows(iframe.contentDocument);
                }
            } catch (e) {
                // ignore cross-origin errors
            }
        });
    }

    function deactivateTextSpacing() {
        // Remove from main document
        const style = document.getElementById('va11y-text-spacing');
        if (style) style.remove();

        // Remove from shadow roots
        function removeFromShadows(root) {
            const all = root.querySelectorAll('*');
            for (let i = 0; i < all.length; i++) {
                const el = all[i];
                if (el.shadowRoot) {
                    try {
                        const shadowStyle = el.shadowRoot.getElementById('va11y-text-spacing');
                        if (shadowStyle) shadowStyle.remove();
                        removeFromShadows(el.shadowRoot);
                    } catch (e) {
                        // ignore errors
                    }
                }
            }
        }
        removeFromShadows(document);

        // Remove from iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    const iframeStyle = iframe.contentDocument.getElementById('va11y-text-spacing');
                    if (iframeStyle) iframeStyle.remove();
                    removeFromShadows(iframe.contentDocument);
                }
            } catch (e) {
                // ignore cross-origin errors
            }
        });
    }

    // --- Grayscale Functions ---
    let originalHtmlFilter = null;

    function activateGrayscale() {
        // Store original filter value
        originalHtmlFilter = document.documentElement.style.filter || '';
        document.documentElement.style.setProperty('filter', 'grayscale(1)', 'important');
    }

    function deactivateGrayscale() {
        // Restore original filter value
        if (originalHtmlFilter !== null) {
            if (originalHtmlFilter === '') {
                document.documentElement.style.removeProperty('filter');
            } else {
                document.documentElement.style.setProperty('filter', originalHtmlFilter, 'important');
            }
            originalHtmlFilter = null;
        }
    }

    // --- Helpers used by modules (Ported from aName.js) ---

    function getAccessibleName(element) {
        if (element.hasAttribute('aria-label')) {
            return { name: element.getAttribute('aria-label'), source: 'aria-label' };
        }
        if (element.hasAttribute('aria-labelledby')) {
            const labelledbyIds = element.getAttribute('aria-labelledby').split(' ');
            const rootNode = element.getRootNode();
            const name = labelledbyIds.map(id => {
                const el = rootNode.querySelector(`#${id}`);
                return el ? el.textContent : '';
            }).join(' ');
            if (name) {
                return { name, source: 'aria-labelledby' };
            }
        }
        const parentLabel = element.closest('label');
        if (parentLabel) {
            return { name: parentLabel.textContent.trim(), source: '<label> text' };
        }
        if (element.id) {
            const rootNode = element.getRootNode();
            // Note: querySelector label[for="ID"] works in same root
            const label = rootNode.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return { name: label.textContent.trim(), source: '<label> text' };
            }
        }

        // Check for slotted content in shadow DOM
        const rootNode = element.getRootNode();
        if (rootNode !== document) {
            const host = rootNode.host;
            if (host) {
                const slots = rootNode.querySelectorAll('slot[name]');
                let slottedName = '';

                for (const slot of slots) {
                    const slotName = slot.getAttribute('name');
                    if (slotName) {
                        const slottedElements = host.querySelectorAll(`[slot="${slotName}"]`);
                        if (slottedElements.length > 0) {
                            slottedName = Array.from(slottedElements)
                                .map(el => el.textContent.trim())
                                .join(' ');
                            if (slottedName) {
                                return { name: slottedName, source: `<slot name="${slotName}"> content` };
                            }
                        }
                    }
                }
            }
        }

        // Shadow Root Text Content
        if (element.shadowRoot) {
            const shadowText = element.shadowRoot.textContent.trim();
            if (shadowText) {
                return { name: shadowText, source: 'Shadow DOM text content' };
            }
        }

        if (element.textContent.trim()) {
            return { name: element.textContent.trim().substring(0, 50), source: 'Inner text content' };
        }
        if (element.hasAttribute('title')) {
            return { name: element.getAttribute('title'), source: 'title attribute' };
        }
        if (element.getAttribute('alt')) return { name: element.getAttribute('alt'), source: 'alt' };

        // Fallback checks for inputs without labels
        if (element.placeholder) return { name: element.placeholder, source: 'placeholder (weak)' };

        return { name: '', source: 'n/a' };
    }

    function getElementState(el) {
        const states = {
            // ARIA states
            "aria-busy": "busy",
            "aria-checked": "checked",
            "aria-current": "current",
            "aria-disabled": "disabled",
            "aria-expanded": "expanded",
            "aria-grabbed": "grabbed",
            "aria-hidden": "hidden",
            "aria-invalid": "invalid",
            "aria-pressed": "pressed",
            "aria-selected": "selected",
            // ARIA properties that indicate state
            "aria-haspopup": "haspopup",
            "aria-readonly": "readonly",
            "aria-required": "required",
            // HTML attributes
            "disabled": "disabled",
            "required": "required",
            "readonly": "readonly",
            "checked": "checked",
            "selected": "selected",
            "hidden": "hidden"
        };

        let elementsToCheck = [el];

        // Check shadow host if element is inside shadow DOM
        const rootNode = el.getRootNode();
        if (rootNode && rootNode.host) {
            elementsToCheck.push(rootNode.host);
        }

        // Check parent custom element
        const parentCustomElement = el.closest(':defined');
        if (parentCustomElement && parentCustomElement !== el) {
            elementsToCheck.push(parentCustomElement);
        }

        const foundStates = new Set();

        // Special handling for radio buttons and checkboxes
        if (el.type === 'radio' || el.type === 'checkbox') {
            if (el.checked) {
                foundStates.add('checked');
            }
        }

        elementsToCheck.forEach(element => {
            for (const [attr, a11yState] of Object.entries(states)) {
                if (element.hasAttribute(attr)) {
                    const value = element.getAttribute(attr);
                    // Skip if value is explicitly 'false' or null
                    if (value === 'false' || value === null) {
                        continue;
                    }
                    // For boolean attributes like 'checked', 'disabled', etc., presence means true
                    // But for aria attributes, check the value more carefully
                    if (attr.startsWith('aria-')) {
                        // ARIA attributes: only add if value is 'true' or the attribute name (for boolean)
                        if (value === 'true' || value === attr || value === '') {
                            foundStates.add(a11yState);
                        }
                    } else {
                        // HTML boolean attributes: presence means true (unless explicitly 'false')
                        foundStates.add(a11yState);
                    }
                }
            }

            // Also check for properties on the host element for web components
            if (element !== el && (element.tagName && element.tagName.includes('-'))) {
                // This is likely a custom element/web component
                // Check if any state properties are set directly on the component
                for (const [attr, a11yState] of Object.entries(states)) {
                    // Extract property name (remove 'aria-' prefix if present)
                    const propName = attr.startsWith('aria-') ? attr.substring(5) : attr;

                    // Check if the property exists and is true
                    if (element[propName] === true) {
                        foundStates.add(a11yState);
                    }
                }
            }
        });

        return Array.from(foundStates).join(' ');
    }

    function getElementRole(el) {
        const role = el.getAttribute("role");
        if (role) return role;
        const tag = el.tagName.toLowerCase();
        if (tag === "button") return "button";
        if (tag === "a" && el.hasAttribute("href")) return "link";
        if (tag === "input") {
            const type = el.getAttribute("type") || "text";
            if (["button", "image", "reset", "submit"].includes(type)) return "button";
            if (["checkbox", "radio"].includes(type)) return type;
            return "textbox";
        }
        if (["select", "textarea"].includes(tag)) return "textbox";
        return "generic";
    }

    // --- Cleanup ---
    function cleanup() {
        if (activeModule && moduleModules[activeModule]) {
            moduleModules[activeModule].deactivate();
        }
        if (document.getElementById(OVERLAY_CONTAINER_ID)) document.getElementById(OVERLAY_CONTAINER_ID).remove();
        if (document.getElementById("va11y-overlay-styles")) document.getElementById("va11y-overlay-styles").remove();
        if (host) host.remove();

        // Remove the script tag that loaded va11y.js to allow re-initialization
        const script = document.getElementById("va11y-script");
        if (script) script.remove();

        window.va11yInstance = null;
    }

    // Initialize
    createUI();

    return { cleanup };
}

window.va11yInstance = va11y();

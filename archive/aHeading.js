"use strict";
const aHeadingVersion = "1.0 beta";

function aHeading() {
    // Styles
    const style_heading_overlay = "position:absolute;z-index:9999;pointer-events:none;outline:2px solid;padding:2px;font-weight:bold;color:black;background:rgba(255,255,255,0.8);font-size:12px;border-radius:2px;";
    const style_good_formatting = "font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;";
    const style_bad_formatting = "color:pink;background:#333;padding:3px;font-weight:bold;";
    const style_warning_formatting = "color:orange;background:#333;padding:3px;font-weight:bold;";
    
    // Panel constants
    const aHeadingPanelWidth = 400;
    const PANEL_ID = "aHeadingPanel";
    let panelElement = null;
    let headingOverlays = [];

    // --- Core Logic ---

    function getHeadings(root = document) {
        let headings = [];
        
        function traverse(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if it's a heading
                const tagName = node.tagName.toLowerCase();
                const role = node.getAttribute("role");
                let level = 0;

                if (/^h[1-6]$/.test(tagName)) {
                    level = parseInt(tagName.substring(1));
                } else if (role === "heading") {
                    const ariaLevel = node.getAttribute("aria-level");
                    if (ariaLevel) {
                        level = parseInt(ariaLevel);
                    } else {
                        // Default to 2 if no level provided for role=heading (common fallback, though spec says 2)
                        level = 2; 
                    }
                }

                if (level > 0) {
                    headings.push({
                        element: node,
                        level: level,
                        text: node.textContent.trim(),
                        visible: isVisible(node),
                        tagName: tagName
                    });
                }
            }

            // Shadow DOM traversal
            if (node.shadowRoot) {
                traverse(node.shadowRoot);
            }

            // Child traversal
            const children = node.children || node.childNodes; // childNodes handles ShadowRoot children better in some contexts? No, shadowRoot has children.
            // For shadowRoot, we need to iterate its children.
            // But traverse is called with node. 
            // If node is an element, we iterate children.
            // If node is shadowRoot, we iterate children.
            
            // Note: node.children is adequate for Elements and ShadowRoots (in modern browsers).
            if (node.children) {
                 for (let i = 0; i < node.children.length; i++) {
                    traverse(node.children[i]);
                }
            }
        }

        traverse(root);
        return headings;
    }

    function isVisible(el) {
        // Basic check: offsetParent, or if fixed/absolute and visible
        // Plus aria-hidden
        if (!el) return false;
        
        // Check aria-hidden up the tree
        let current = el;
        while(current && current !== document) {
            if (current.nodeType === Node.ELEMENT_NODE && current.getAttribute("aria-hidden") === "true") {
                return false;
            }
            // Break at shadow root boundary to continue checking host
            if (current.parentNode instanceof ShadowRoot) {
                current = current.parentNode.host;
            } else {
                current = current.parentNode;
            }
        }

        // Check CSS visibility
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }

        // Very basic layout check (might miss some edge cases but good enough for bookmarklet)
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function analyzeHeadings(headings) {
        let issues = [];
        let hasH1 = false;
        let lastLevel = 0;

        headings.forEach(h => {
            if (!h.visible) return; // Skip invisible headings for order analysis? 
            // Usually we analyze structure of visible headings.

            if (h.level === 1) hasH1 = true;

            if (h.text === "") {
                issues.push({ type: "empty", heading: h, message: "Empty heading" });
            }

            if (lastLevel > 0 && h.level > lastLevel + 1) {
                issues.push({ 
                    type: "skipped", 
                    heading: h, 
                    message: `Skipped heading level: H${lastLevel} -> H${h.level}` 
                });
            }
            lastLevel = h.level;
        });

        if (!hasH1 && headings.some(h => h.visible)) {
            issues.push({ type: "missingH1", message: "No visible H1 detected on page" });
        }
        
        return issues;
    }

    // --- UI/Panel Functions ---

    function createPanel() {
        if (document.getElementById(PANEL_ID)) {
            removePanel();
        }

        const panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-label", "Headings Outline");
        
        // Styles similar to aName.js
        const styles = `
            #${PANEL_ID} {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${aHeadingPanelWidth}px;
                max-height: 80vh;
                background: black;
                color: white;
                border: 2px solid white;
                z-index: 10000;
                font-family: sans-serif;
                font-size: 14px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            #${PANEL_ID} header {
                padding: 10px;
                background: #333;
                cursor: move;
                font-weight: bold;
                border-bottom: 1px solid #555;
            }
            #${PANEL_ID} .content {
                overflow-y: auto;
                padding: 10px;
                flex-grow: 1;
            }
            #${PANEL_ID} ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            #${PANEL_ID} li {
                margin-bottom: 5px;
                padding: 3px;
                background: #fff;
                color: #333;
                border-left: 5px solid #ccc;
            }
            #${PANEL_ID} li.h1 { border-left-color: #007bff; }
            #${PANEL_ID} li.h2 { border-left-color: #28a745; }
            #${PANEL_ID} li.h3 { border-left-color: #ffc107; }
            #${PANEL_ID} li.h4 { border-left-color: #dc3545; }
            #${PANEL_ID} li.h5 { border-left-color: #17a2b8; }
            #${PANEL_ID} li.h6 { border-left-color: #6c757d; }
            
            #${PANEL_ID} .issue {
                color: red;
                font-weight: bold;
                font-size: 0.9em;
                display: block;
            }
             #${PANEL_ID} .indent-1 { margin-left: 0; }
             #${PANEL_ID} .indent-2 { margin-left: 10px; }
             #${PANEL_ID} .indent-3 { margin-left: 20px; }
             #${PANEL_ID} .indent-4 { margin-left: 30px; }
             #${PANEL_ID} .indent-5 { margin-left: 40px; }
             #${PANEL_ID} .indent-6 { margin-left: 50px; }

            .aHeading-highlight {
                position: absolute;
                background: rgba(255, 255, 0, 0.3);
                outline: 2px solid orange;
                pointer-events: none;
                z-index: 9991;
            }
            .aHeading-label {
                position: absolute;
                background: orange;
                color: black;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 4px;
                z-index: 9992;
                pointer-events: none;
            }
        `;

        const styleEl = document.createElement("style");
        styleEl.id = "aHeadingStyles";
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        panel.innerHTML = `
            <header id="${PANEL_ID}Header">Headings Outline (Drag Me)</header>
            <div class="content" id="${PANEL_ID}Content"></div>
            <div style="padding: 10px; border-top: 1px solid #555; text-align: right;">
                <button id="${PANEL_ID}Close" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; cursor: pointer;">Close (Esc)</button>
            </div>
        `;

        document.body.appendChild(panel);
        panelElement = panel;

        // Dragging logic (copied/adapted from aName.js)
        dragElement(panel);

        // Close logic
        document.getElementById(`${PANEL_ID}Close`).onclick = removePanel;
        
        return document.getElementById(`${PANEL_ID}Content`);
    }

    function removePanel() {
        if (panelElement) panelElement.remove();
        const style = document.getElementById("aHeadingStyles");
        if (style) style.remove();
        
        // Remove highlights
        headingOverlays.forEach(el => el.remove());
        headingOverlays = [];
        
        window.removeEventListener("keyup", escListener);
        window.removeEventListener("resize", updateHighlightsPosition);
    }

    function escListener(e) {
        if (e.key === "Escape") removePanel();
    }

    function updateHighlightsPosition() {
        // Re-calculate positions if window resizes
        // Simpler implementation: just remove and redraw? To keep state simple, let's just leave it for now or implement if needed. 
        // Actually, user scrolling might not affect absolute position if relative to document, but resize does.
    }

    // --- Highlighting ---

    function highlightHeadings(headings) {
        headings.forEach(h => {
            if (!h.visible) return;

            const rect = h.element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const overlay = document.createElement("div");
            overlay.className = "aHeading-highlight";
            overlay.style.top = (rect.top + scrollTop) + "px";
            overlay.style.left = (rect.left + scrollLeft) + "px";
            overlay.style.width = rect.width + "px";
            overlay.style.height = rect.height + "px";
            
            document.body.appendChild(overlay);
            headingOverlays.push(overlay);

            const label = document.createElement("div");
            label.className = "aHeading-label";
            label.textContent = `H${h.level}`;
            label.style.top = (rect.top + scrollTop - 20) + "px";
            label.style.left = (rect.left + scrollLeft) + "px";
            
            document.body.appendChild(label);
            headingOverlays.push(label);
        });
    }

    function renderOutline(headings, issues, container) {
        const ul = document.createElement("ul");
        
        // Global Issues (missing H1)
        if (issues.some(i => i.type === "missingH1")) {
            const li = document.createElement("li");
            li.style.background = "#faa";
            li.innerHTML = '<span aria-hidden="true">🚨</span> <b>Wait! No visible H1 found on page.</b>';
            ul.appendChild(li);
        }

        headings.forEach(h => {
             if (!h.visible) return; // Only outline visible headings? Usually yes.

             const li = document.createElement("li");
             li.className = `h${h.level} indent-${h.level}`;
             
             let text = h.text || "<em>(Empty Heading)</em>";
             let status = "";
             
             // Check specific issues for this heading
             const headingIssues = issues.filter(i => i.heading === h);
             if (headingIssues.length > 0) {
                 status = headingIssues.map(i => `<span class="issue">⚠️ ${i.message}</span>`).join("");
                 li.style.borderRight = "5px solid orange";
             }

             li.innerHTML = `<strong>H${h.level}</strong>: ${text} ${status}`;
             ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    // --- Utility: Drag ---
    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = document.getElementById(elmnt.id + "Header");
        if (header) {
            header.onmousedown = dragMouseDown;
        } else {
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // --- Initialization ---

    function init() {
        const headings = getHeadings();
        const issues = analyzeHeadings(headings);
        
        const contentContainer = createPanel();
        renderOutline(headings, issues, contentContainer);
        highlightHeadings(headings);

        window.addEventListener("keyup", escListener);
        
        console.log(`aHeading detected ${headings.length} headings.`);
    }

    init();
}

aHeading();

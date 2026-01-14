"use strict";
const aStructureVersion = "1.2 Global";
if (window.aStructureInstance) {
    window.aStructureInstance.cleanup();
}

function aStructure() {
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

    let highlightedElements = []; // { element }
    const validElements = new Map(); // element -> labelText

    // Panel/Container constants
    const CONTAINER_ID = "aStructure-overlay-container";
    const LABEL_HEIGHT = 16; // Approx height for collision stacking

    // Styles
    const STYLE_ID = "aStructureStyles";

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            .aStructure-highlight {
                outline: 1px dashed black !important;
                box-shadow: 0px 0px 0px 1px white !important;
            }
            #${CONTAINER_ID} {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 0;
                overflow: visible;
                z-index: 2147483647; /* Max z-index */
                pointer-events: none;
            }
            .aStructure-label {
                background-color: black;
                color: yellowgreen;
                font-size: 10px;
                line-height: ${LABEL_HEIGHT}px;
                position: absolute;
                padding: 0 4px;
                font-family: sans-serif;
                white-space: nowrap;
                border: 1px solid white;
                box-sizing: border-box;
                pointer-events: auto; /* Allow hovering if needed, though mostly informational */
            }
        `;
        document.head.appendChild(style);
    }

    function createOverlayContainer() {
        let container = document.getElementById(CONTAINER_ID);
        if (!container) {
            container = document.createElement("div");
            container.id = CONTAINER_ID;
            document.body.appendChild(container);
        }
        return container;
    }

    function collectElements(rootNode) {
        // Collect ARIA roles
        rootNode.querySelectorAll('[role]').forEach(element => {
            const role = element.getAttribute('role');
            if (structuralRoles.includes(role)) {
                if (!validElements.has(element)) {
                    validElements.set(element, `role="${role}"`);
                }
            }
        });

        // Collect semantic elements
        semanticElements.forEach(tag => {
            rootNode.querySelectorAll(tag).forEach(element => {
                if (!validElements.has(element)) {
                    validElements.set(element, `<${element.tagName.toLowerCase()}>`);
                }
            });
        });

        // Shadow DOM recursion
        rootNode.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                collectElements(element.shadowRoot);
            }
        });
    }

    function isVisible(el) {
        if (!el.getClientRects().length) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }

    function drawLabels() {
        const container = createOverlayContainer();
        const placedLabels = []; // { top, left, width, height, bottom, right }

        // It's often better to process top-down visually, but DOM order is usually sufficient.
        // We'll process in DOM order. 
        // Note: Map preserves insertion order.

        for (const [element, labelText] of validElements) {
            if (!isVisible(element)) continue;

            // Highlight the element itself
            element.classList.add('aStructure-highlight');
            highlightedElements.push({ element });

            // Create Label
            const label = document.createElement('div');
            label.className = 'aStructure-label';
            label.textContent = labelText;

            // Get position
            const rect = element.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            let labelLeft = rect.left + scrollX;
            let labelTop = rect.top + scrollY;

            // Collision Detection & Stacking
            // We want to avoid overlapping with existing labels.
            // Simplified approach: If this label overlaps any previous label, nudge it down.
            // Optimization: Only check labels that are "near".

            // Estimate label dimensions before append (approximate based on char count or measured?)
            // Measuring is safer but slower. Let's append, measure, then move if needed? 
            // Better: Append hidden, measure, then positions.

            container.appendChild(label); // Appending to measure
            const labelRect = label.getBoundingClientRect(); // relative to viewport, but we can use width/height
            // We need width/height.
            const w = labelRect.width;
            const h = labelRect.height;

            // Initial proposed position (absolute coords)
            let proposedRect = {
                left: labelLeft,
                top: labelTop,
                width: w,
                height: h,
                right: labelLeft + w,
                bottom: labelTop + h
            };

            // Checking collisions
            // We iterate through already placed labels. If we intersect, we move DOWN.
            // We might need to restart check if we moved.

            let collision = true;
            let attempts = 0;
            const MAX_ATTEMPTS = 20; // Prevent infinite loops

            while (collision && attempts < MAX_ATTEMPTS) {
                collision = false;
                for (const placed of placedLabels) {
                    if (intersect(proposedRect, placed)) {
                        // Collision! Nudge down.
                        proposedRect.top = placed.bottom + 1; // 1px spacing
                        proposedRect.bottom = proposedRect.top + h;
                        collision = true;
                        // Optimization: Restart loop to check effectively against all again? 
                        // Or just checking against checking might be enough? 
                        // Simple greedy stacking: Just keep moving down past the one we hit.
                        // Ideally we'd find the lowest bottom of ALL intersecting labels at that X, but loops work for simple cases.
                        break;
                    }
                }
                attempts++;
            }

            // Apply final position
            label.style.left = key(proposedRect.left) + "px";
            label.style.top = key(proposedRect.top) + "px";

            placedLabels.push(proposedRect);
        }
    }

    function key(val) { return Math.round(val); }

    function intersect(r1, r2) {
        return !(r2.left >= r1.right ||
            r2.right <= r1.left ||
            r2.top >= r1.bottom ||
            r2.bottom <= r1.top);
    }

    function cleanup() {
        const styleEl = document.getElementById(STYLE_ID);
        if (styleEl) styleEl.remove();

        const container = document.getElementById(CONTAINER_ID);
        if (container) container.remove();

        highlightedElements.forEach(({ element }) => {
            element.classList.remove('aStructure-highlight');
        });

        highlightedElements = [];
        window.removeEventListener("keyup", keyUpHandler);
        // Clean resize listener if we add one (omitted for brevity but recommended for global overlay)
        window.aStructureInstance = null;
    }

    function keyUpHandler(event) {
        if (event.key === "Escape") {
            cleanup();
        }
    }

    function keypressListeners() {
        window.addEventListener("keyup", keyUpHandler);
    }

    // Init
    injectStyles();
    collectElements(document);
    drawLabels();
    keypressListeners();

    return { cleanup };
}
window.aStructureInstance = aStructure();

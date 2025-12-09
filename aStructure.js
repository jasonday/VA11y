"use strict";
if (window.aStructureInstance) {
    window.aStructureInstance.cleanup();
}

function aStructure() {
    const structuralRoles = [
        // Landmark Roles
        'banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search',
        // Structure Roles
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
    let highlightedElements = [];
    const elementsToHighlight = new Map();

    function findElementsToHighlight(rootNode) {
        // Find elements with ARIA roles
        rootNode.querySelectorAll('[role]').forEach(element => {
            const role = element.getAttribute('role');
            if (structuralRoles.includes(role)) {
                if (!elementsToHighlight.has(element)) {
                    elementsToHighlight.set(element, `role="${role}"`);
                }
            }
        });

        // Find semantic elements
        semanticElements.forEach(tag => {
            rootNode.querySelectorAll(tag).forEach(element => {
                if (!elementsToHighlight.has(element)) {
                    elementsToHighlight.set(element, `<${element.tagName.toLowerCase()}>`);
                }
            });
        });

        // Recurse into shadow DOMs
        rootNode.querySelectorAll('*').forEach(element => {
            if (element.shadowRoot) {
                findElementsToHighlight(element.shadowRoot);
            }
        });
    }

    function highlightElement(element, labelText) {
        const originalBorder = element.style.border;
        const originalPosition = element.style.position;
        highlightedElements.push({
            element,
            originalBorder,
            originalPosition
        });

        element.style.outline = '1px dashed black';
        element.style.boxShadow = '0px 0px 0px 1px white';
        element.style.position = 'relative';

        let label = document.createElement('span');
        label.className = 'aStructure-label';
        label.textContent = labelText;
        label.style.backgroundColor = 'black';
        label.style.color = 'yellowgreen';
        label.style.fontSize = '10px';
        label.style.position = 'absolute';
        label.style.top = '0';
        label.style.left = '0';
        label.style.zIndex = '99999';
        element.appendChild(label);
    }

    function cleanup() {
        highlightedElements.forEach(({
            element,
            originalBorder,
            originalPosition
        }) => {
            element.style.border = originalBorder;
            element.style.position = originalPosition;
            const label = element.querySelector('.aStructure-label');
            if (label) {
                label.remove();
            }
        });
        highlightedElements = [];
        window.removeEventListener("keyup", keyUpHandler);
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


    // Initial setup
    findElementsToHighlight(document);
    for (const [element, label] of elementsToHighlight.entries()) {
        highlightElement(element, label);
    }
    keypressListeners();

    // Expose cleanup method to global scope
    return {
        cleanup
    };
}
window.aStructureInstance = aStructure();

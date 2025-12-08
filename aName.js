"use strict";

function aName() {
    const startFocusPoint = getActiveElement();
    let elCount = 1;
    let consoleOutput = "";
    let textOutput = "";
    let currentFocusedEl = getActiveElement();
    //styles
    const style_title_formatting = "background:#193c10;color:white;";
    const style_overridden_formatting = "background:#fff;color:darkgreen;font-weight:bold;text-decoration:line-through";
    const style_good_formatting = "font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;";
    const style_bad_formatting = "color:pink;background:#333;padding:3px;";
    const style_ok_formatting = "color:black;background:#fefbe3;font-weight:bold;";
    const style_unimportant_formatting = "color:black!important;background:#fff!important;";
    //panel
    const aNamePanel = document.createElement("div");
    const aNamePanelWidth = 400;
    const aNameFocusOutlineWidth = 7;
    const indicator = '<span aria-hidden="true">👉🏽</span><span class="visually-hidden">Accessible name provided by</span> ';
    const warning = '<span aria-hidden="true">🚨</span> <span class="visually-hidden">Warning</span>';
    let accNameLabel = "Accessible name: ";

    let strPageOutput = "";

    let isGood = false;
    let isBad = false;
    let isDupeAccName = false;
    let dupeAccNameIsNoAccName = false;

    let showDetails = false;

    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    function resetGoodBadState() {
        isGood = false;
        isBad = false;
    }
    function addToConsoleOutput(text){
        consoleOutput+=text;
    }
    function log(text, el, style) {
        el = el.split("<").join("&lt;").split(">").join("&gt;");
        strPageOutput += '<li role="listitem"><span style="' + style + '">';
        if (isGood) {
            strPageOutput += indicator;
        }
        if (isBad) {
            strPageOutput += warning;
        }
        strPageOutput += text + "</span>&nbsp;" + el + "</li>\n";
        el = el.replace("&lt;", "<").replace("&gt;", ">");
    }
    function addFocusStyles() {
        const focusStyles = document.createElement("style");
        focusStyles.setAttribute("type", "text/css");
        focusStyles.setAttribute("id", "panelStyles");
        focusStyles.textContent = ".aNameTempFocusStyle:focus {outline:" + aNameFocusOutlineWidth + "px solid black!important;outline-offset:" + aNameFocusOutlineWidth + "px!important;overflow:visible;} .visually-hidden {clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;}";
        document.querySelector("body").appendChild(focusStyles);
    }
    function addPanelStyles(aNamePanelWidth) {
        const consoleStyle = document.createElement("style");
        consoleStyle.setAttribute("type", "text/css");
        consoleStyle.setAttribute("id", "focusStyles");
        consoleStyle.textContent =
            "#aNamePanel.aNameError {background:darkred;} #aNamePanel.aNameWarning {background:#CC3300;} #aNamePanel[hidden] {display:none;} #aNamePanel * {text-align:left; pointer-events: auto;} #aNamePanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: fixed;z-index:10000;background: black;padding: 20px 20px;width:" +
            aNamePanelWidth +
            "px;font-size:16px;bottom:20px;right:20px; pointer-events: none; max-height: fit-content;} #aNamePanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 1em -10px 0;} #aNamePanel ul,#aNamePanel li {margin:0;padding:0;list-style:none} #aNamePanel li {margin:3px 0;background:#fff!important;color:#333!important;padding:2px} #aNamePanel details summary {color:white} #aNamePanel a[download]{display:block;margin:0.5em 0;color:#fff;text-decoration:underline;border:none;padding:0;}";
        document.querySelector("head").appendChild(consoleStyle);
    }
    function addPanelToPage() {
        aNamePanel.setAttribute("id", "aNamePanel");
        aNamePanel.setAttribute("aria-live", "polite");
        aNamePanel.setAttribute("tabindex", "-1");
        aNamePanel.setAttribute("role", "region");
        aNamePanel.setAttribute("aria-label", "Accessibility properties panel");
        
        const panelHeader = document.createElement("div");
        panelHeader.setAttribute("id", "aNamePanelHeader");
        panelHeader.style.cursor = "move";
        panelHeader.style.padding = "10px";
        panelHeader.style.backgroundColor = "#333";
        panelHeader.style.color = "white";
        panelHeader.textContent = "aName Panel (Drag Me)";
        aNamePanel.appendChild(panelHeader);

        const panelContent = document.createElement("div");
        panelContent.setAttribute("id", "aNamePanelContent");
        aNamePanel.appendChild(panelContent);

        document.querySelector("body").appendChild(aNamePanel);
        keypressListeners();
        dragElement(aNamePanel);
    }
    function addButtons() {
        const consoleCloseButton = document.createElement("button");
        consoleCloseButton.textContent = "Close (Esc)";
        consoleCloseButton.setAttribute("type", "button");
        consoleCloseButton.setAttribute("class", "panel-btn");
        consoleCloseButton.addEventListener("click", () => {
            removePanel();
        });
        const panelContent = document.getElementById("aNamePanelContent");
        panelContent.appendChild(consoleCloseButton);

        const downloadLink = document.createElement("a");
        downloadLink.textContent = "Download summary (S)";
        downloadLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(generateSummary()));
        downloadLink.setAttribute("download", "summary.txt");
        panelContent.appendChild(downloadLink);
    }
    function removePanel() {
        if (document.querySelector("#aNamePanel")) {
            document.querySelector("#aNamePanel").remove();
        }
        if (document.querySelector("#panelStyles")) {
            document.querySelector("#panelStyles").remove();
        }
        if (document.querySelector("#focusStyles")) {
            document.querySelector("#focusStyles").remove();
        }
        document.removeEventListener('focusin', handleFocus);
    }
    function keypressListeners() {
        window.addEventListener("keyup", (event) => {
            if (event.key === "Escape" && document.querySelector("#aNamePanel")) {
                removePanel();
            }
            if (event.key.toLowerCase() === "s" && document.querySelector("#aNamePanel")) {
                document.querySelector("#aNamePanel a[download]").click();
            }
        });
    }

    function getActiveElement(root = document) {
        const activeEl = root.activeElement;
        if (!activeEl) {
            return null;
        }
        if (activeEl.shadowRoot) {
            const shadowActiveEl = getActiveElement(activeEl.shadowRoot);
            return shadowActiveEl || activeEl;
        } else {
            return activeEl;
        }
    }

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
            const label = rootNode.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return { name: label.textContent.trim(), source: '<label> text' };
            }
        }
        if (element.textContent.trim()) {
            return { name: element.textContent.trim(), source: 'Inner text content' };
        }
        if (element.hasAttribute('title')) {
            return { name: element.getAttribute('title'), source: 'title attribute' };
        }
        return { name: '', source: 'N/A' };
    }

    function dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "Header")) {
            document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
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
            "aria-modal": "modal",
            "aria-multiline": "multiline",
            "aria-multiselectable": "multiselectable",
            // HTML attributes
            "disabled": "disabled",
            "required": "required",
            "readonly": "readonly",
            "checked": "checked",
            "selected": "selected",
            "hidden": "hidden",
            "open": "open",
            "multiple": "multiple",
            "autofocus": "autofocus",
            "draggable": "draggable",
            "contenteditable": "contenteditable",
            "spellcheck": "spellcheck"
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
        
        // For radio/checkbox inputs, also check if the element itself has the checked property (not just attribute)
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
            
            // Also check for the checked property on the host element for web components
            if (element !== el && (element.tagName && element.tagName.includes('-'))) {
                // This is likely a custom element/web component
                if (element.checked === true) {
                    foundStates.add('checked');
                } else if (element.hasAttribute('checked')) {
                    const checkedValue = element.getAttribute('checked');
                    if (checkedValue !== 'false') {
                        foundStates.add('checked');
                    }
                }
            }
        });
        
        return Array.from(foundStates).join(' ');
    }

    function getElementRole(focusable) {
        let elementRole = focusable.getAttribute("role");
        let focussedTagName = focusable.tagName.toLowerCase();
        if (elementRole) {
            return elementRole;
        }
        if (focussedTagName === "button") {
            return "button";
        }
        if (focussedTagName === "a") {
            return "link";
        }
        if (focussedTagName === "input") {
            let type = focusable.getAttribute("type") ? focusable.getAttribute("type").toLowerCase() : "text";
            if (["button", "image", "reset", "submit"].includes(type)) {
                return "button";
            }
            if (type === "checkbox" || type === "radio") {
                return type;
            }
            return "textbox";
        }
        if (["select", "textarea"].includes(focussedTagName)) {
            return "textbox";
        }
        return "generic";
    }

    function getAllFocusableElements(rootNode) {
        const focusableElements = rootNode.querySelectorAll('a[href],button,select,input:not([type="hidden"]),textarea,summary,area,[tabindex]:not(#aNamePanel):not([tabindex^="-1"]),[contenteditable]:not([contenteditable="false"])');
        const allFocusables = [...focusableElements];
        
        const allElements = rootNode.querySelectorAll('*');
    
        allElements.forEach(element => {
          if (element.shadowRoot) {
            allFocusables.push(...getAllFocusableElements(element.shadowRoot));
          }
        });
        
        return allFocusables;
    }

    function generateSummary() {
        const focusables = getAllFocusableElements(document);
        let summary = "IMPORTANT DISCLAIMER!\n\nThis text file is a *very approximate representation* \nof what this page may be like for screen reader users:\n\n";
        
        focusables.forEach(el => {
            const { name } = getAccessibleName(el);
            const role = getElementRole(el);
            let description = "N/A";
            if (el.hasAttribute("aria-describedby")) {
                const describedByIds = el.getAttribute("aria-describedby").split(' ');
                const rootNode = el.getRootNode();
                description = describedByIds.map(id => {
                    const descEl = rootNode.querySelector(`#${id}`);
                    return descEl ? descEl.textContent : '';
                }).join(' ');
            }
            summary += `Accessible Name: ${name}, Role: ${role}, Description: ${description}\n`;
        });
        return summary;
    }

    function checkForDuplicateAccNames() {
        const focusables = getAllFocusableElements(document);
        const accNames = new Map();

        focusables.forEach(el => {
            const { name } = getAccessibleName(el);
            if (name) {
                if (accNames.has(name)) {
                    accNames.get(name).push(el);
                } else {
                    accNames.set(name, [el]);
                }
            }
        });

        accNames.forEach((elements, name) => {
            if (elements.length > 1) {
                elements.forEach(el => el.setAttribute('data-dupe', 'true'));
            }
        });
    }


    function handleFocus(event) {
        let focusable = event.target;
        
        setTimeout(() => {
            const activeElement = getActiveElement();
            if (activeElement && activeElement !== focusable) {
                focusable = activeElement;
            }

            focusable.classList.add("aNameTempFocusStyle");

            strPageOutput = "";
        const tagName = focusable.tagName.toLowerCase();
        let tagDetails = "<" + tagName + ">";
        if (focusable.getAttribute("role")) {
            tagDetails = "<" + tagName + ' role="' + focusable.getAttribute("role") + '">';
        }

        const { name: accName, source: accNameSource } = getAccessibleName(focusable);
        if (accName === "") {
            isBad = true;
            aNamePanel.classList.add("aNameError");
            log(accNameLabel + "No accessible name!", "", style_bad_formatting);
            log("Accessible Name Source: N/A", "", style_bad_formatting);
        } else {
            aNamePanel.classList.remove("aNameError");
            log(accNameLabel, accName, style_good_formatting);
            log("Accessible Name Source: ", accNameSource, style_good_formatting);
        }

        if (focusable.hasAttribute('data-dupe')) {
            aNamePanel.classList.add("aNameWarning");
            log("Duplicate warning!", "Another element has the same accessible name", style_bad_formatting);
        }

        isBad = false;
        const state = getElementState(focusable);
        if (state) {
            log("State: ", state, style_good_formatting);
        }

        const role = getElementRole(focusable);
        log("Role: ", role, style_good_formatting);

        if (focusable.getAttribute("aria-describedby")) {
            const describedByIds = focusable.getAttribute("aria-describedby").split(' ');
            const rootNode = focusable.getRootNode();
            const description = describedByIds.map(id => {
                const el = rootNode.querySelector(`#${id}`);
                return el ? el.textContent : '';
            }).join(' ');
            log("Accessible Description: ", description, style_good_formatting);
        } else {
            log("Accessible Description: ", "N/A", style_good_formatting);
        }

        log("HTML Element: ", tagDetails, style_good_formatting);

        const panelContent = document.getElementById("aNamePanelContent");
        panelContent.innerHTML = '<ul role="list">' + strPageOutput + "</ul>";
        addButtons();
        }, 0);
    }

    // Main execution
    removePanel();
    addPanelStyles(aNamePanelWidth);
    addPanelToPage();
    addFocusStyles();
    checkForDuplicateAccNames();

    document.addEventListener('focusin', handleFocus);
    
    // Trigger for the initial focused element
    const initialFocus = getActiveElement();
    if (initialFocus) {
        handleFocus({ target: initialFocus });
    }
}
aName();

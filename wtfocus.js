"use strict";

function WTFocus() {
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
    const WTFocusPanel = document.createElement("div");
    const WTFpanelWidth = 400;
    const WTFfocusOutlineWidth = 7;
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
        focusStyles.textContent = ".WTFocusTempFocusStyle:focus {outline:" + WTFfocusOutlineWidth + "px solid black!important;outline-offset:" + WTFfocusOutlineWidth + "px!important;overflow:visible;} .visually-hidden {clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;}";
        document.querySelector("body").appendChild(focusStyles);
    }
    function addPanelStyles(WTFpanelWidth) {
        const consoleStyle = document.createElement("style");
        consoleStyle.setAttribute("type", "text/css");
        consoleStyle.setAttribute("id", "focusStyles");
        consoleStyle.textContent =
            "#WTFocusPanel.error {background:darkred;} #WTFocusPanel.warning {background:#CC3300;} #WTFocusPanel[hidden] {display:none;} #WTFocusPanel * {text-align:left} #WTFocusPanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: fixed;z-index:10000;background: black;padding: 20px 20px;width:" +
            WTFpanelWidth +
            "px;font-size:16px;bottom:20px;right:20px;} #WTFocusPanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 1em -10px 0;} #WTFocusPanel ul,#WTFocusPanel li {margin:0;padding:0;list-style:none} #WTFocusPanel li {margin:3px 0;background:#fff!important;color:#333!important;padding:2px} #WTFocusPanel details summary {color:white} #WTFocusPanel a[download]{display:block;margin:0.5em 0;color:#fff;text-decoration:underline;border:none;padding:0;}";
        document.querySelector("head").appendChild(consoleStyle);
    }
    function addPanelToPage() {
        WTFocusPanel.setAttribute("id", "WTFocusPanel");
        WTFocusPanel.setAttribute("aria-live", "polite");
        WTFocusPanel.setAttribute("tabindex", "-1");
        WTFocusPanel.setAttribute("role", "region");
        WTFocusPanel.setAttribute("aria-label", "Accessibility properties panel");
        document.querySelector("body").appendChild(WTFocusPanel);
        keypressListeners();
    }
    function addButtons() {
        const consoleCloseButton = document.createElement("button");
        consoleCloseButton.textContent = "Close (Esc)";
        consoleCloseButton.setAttribute("type", "button");
        consoleCloseButton.setAttribute("class", "panel-btn");
        consoleCloseButton.addEventListener("click", () => {
            removePanel();
        });
        WTFocusPanel.appendChild(consoleCloseButton);

        const downloadLink = document.createElement("a");
        downloadLink.textContent = "Download summary (S)";
        downloadLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(generateSummary()));
        downloadLink.setAttribute("download", "summary.txt");
        WTFocusPanel.appendChild(downloadLink);
    }
    function removePanel() {
        if (document.querySelector("#WTFocusPanel")) {
            document.querySelector("#WTFocusPanel").remove();
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
            if (event.key === "Escape" && document.querySelector("#WTFocusPanel")) {
                removePanel();
            }
            if (event.key.toLowerCase() === "s" && document.querySelector("#WTFocusPanel")) {
                document.querySelector("#WTFocusPanel a[download]").click();
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

    function getElementState(el) {
        const states = {
            "aria-expanded": "expanded",
            "aria-pressed": "pressed",
            "aria-selected": "selected",
            "aria-checked": "checked",
            "aria-disabled": "disabled",
            "aria-invalid": "invalid",
            "aria-required": "required",
            "disabled": "disabled",
            "required": "required",
            "checked": "checked"
        };
        let elementsToCheck = [el];
        const host = el.getRootNode().host;
        if (host) {
            elementsToCheck.push(host);
        }
        const parentCustomElement = el.closest(':defined');
        if (parentCustomElement && parentCustomElement !== el) {
            elementsToCheck.push(parentCustomElement);
        }
        const foundStates = new Set();
        elementsToCheck.forEach(element => {
            for (const [attr, a11yState] of Object.entries(states)) {
                if (element.hasAttribute(attr)) {
                    const value = element.getAttribute(attr);
                    if (value !== 'false') {
                        foundStates.add(a11yState);
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
        const focusableElements = rootNode.querySelectorAll('a[href],button,select,input:not([type="hidden"]),textarea,summary,area,[tabindex]:not(#WTFocusPanel):not([tabindex^="-1"]),[contenteditable]:not([contenteditable="false"])');
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

            focusable.classList.add("WTFocusTempFocusStyle");

            strPageOutput = "";
        const tagName = focusable.tagName.toLowerCase();
        let tagDetails = "<" + tagName + ">";
        if (focusable.getAttribute("role")) {
            tagDetails = "<" + tagName + ' role="' + focusable.getAttribute("role") + '">';
        }

        const { name: accName, source: accNameSource } = getAccessibleName(focusable);
        if (accName === "") {
            isBad = true;
            WTFocusPanel.classList.add("error");
            log(accNameLabel + "No accessible name!", "", style_bad_formatting);
            log("Accessible Name Source: N/A", "", style_bad_formatting);
        } else {
            WTFocusPanel.classList.remove("error");
            log(accNameLabel, accName, style_good_formatting);
            log("Accessible Name Source: ", accNameSource, style_good_formatting);
        }

        if (focusable.hasAttribute('data-dupe')) {
            WTFocusPanel.classList.add("warning");
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

        WTFocusPanel.innerHTML = '<ul role="list">' + strPageOutput + "</ul>";
        addButtons();
        }, 0);
    }

    // Main execution
    removePanel();
    addPanelStyles(WTFpanelWidth);
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
WTFocus();

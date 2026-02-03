"use strict";
const aImageVersion = "1.0 beta";
function aImage() {
    //styles
    const style_good_formatting = "font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;";
    const style_bad_formatting = "color:pink;background:#333;padding:3px;";
    //panel
    const aImagePanel = document.createElement("div");
    const aImagePanelWidth = 400;
    const aImageFocusOutlineWidth = 7;
    let altTextLabel = "Alt text: ";

    let strPageOutput = "";
    function log(text, el, style) {
        el = el.split("<").join("&lt;").split(">").join("&gt;");
        strPageOutput += '<li role="listitem"><span style="' + style + '">';
        strPageOutput += text + "</span>&nbsp;" + el + "</li>\n";
        el = el.replace("&lt;", "<").replace("&gt;", ">");
    }
    function addPanelStyles(aImagePanelWidth) {
        const consoleStyle = document.createElement("style");
        consoleStyle.setAttribute("type", "text/css");
        consoleStyle.setAttribute("id", "panelStyles");
        consoleStyle.textContent =
            "#aImagePanel.aImageError {background:darkred;} #aImagePanel.aImageWarning {background:#CC3300;} #aImagePanel[hidden] {display:none;} #aImagePanel * {text-align:left; pointer-events: auto;} #aImagePanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: fixed;z-index:10000;background: black;padding: 20px 20px;width:" +
            aImagePanelWidth +
            "px;font-size:16px;bottom:20px;right:20px; pointer-events: none; max-height: fit-content;} #aImagePanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 1em -10px 0;} #aImagePanel ul,#aImagePanel li {margin:0;padding:0;list-style:none} #aImagePanel li {margin:3px 0;background:#fff!important;color:#333!important;padding:2px} #aImagePanel details summary {color:white} #aImagePanel a[download]{display:block;margin:0.5em 0;color:#fff;text-decoration:underline;border:none;padding:0;}";
        document.querySelector("head").appendChild(consoleStyle);
    }
    function setupPanel() {
        aImagePanel.setAttribute("id", "aImagePanel");
        aImagePanel.setAttribute("aria-live", "polite");
        aImagePanel.setAttribute("tabindex", "-1");
        aImagePanel.setAttribute("role", "region");
        aImagePanel.setAttribute("aria-label", "Accessibility properties panel");

        const panelHeader = document.createElement("div");
        panelHeader.setAttribute("id", "aImagePanelHeader");
        panelHeader.style.cursor = "move";
        panelHeader.style.padding = "10px";
        panelHeader.style.backgroundColor = "#333";
        panelHeader.style.color = "white";
        panelHeader.textContent = "aImage Panel (Drag Me)";
        aImagePanel.appendChild(panelHeader);

        const panelContent = document.createElement("div");
        panelContent.setAttribute("id", "aImagePanelContent");
        const contentList = document.createElement('ul');
        contentList.setAttribute('role', 'list');
        panelContent.appendChild(contentList);
        aImagePanel.appendChild(panelContent);

        const consoleCloseButton = document.createElement("button");
        consoleCloseButton.textContent = "Close (Esc)";
        consoleCloseButton.setAttribute("type", "button");
        consoleCloseButton.setAttribute("class", "panel-btn");
        consoleCloseButton.addEventListener("click", () => {
            removePanel();
        });
        aImagePanel.appendChild(consoleCloseButton);

        document.querySelector("body").appendChild(aImagePanel);
        keypressListeners();
        dragElement(aImagePanel);
    }
    function removePanel() {
        if (document.querySelector("#aImagePanel")) {
            document.querySelector("#aImagePanel").remove();
        }
        if (document.querySelector("#panelStyles")) {
            document.querySelector("#panelStyles").remove();
        }
        detachShadowDOMListeners(document);
    }
    function keypressListeners() {
        window.addEventListener("keyup", (event) => {
            if (event.key === "Escape" && document.querySelector("#aImagePanel")) {
                removePanel();
            }
        });
    }

    function detachShadowDOMListeners(rootNode) {
        rootNode.removeEventListener('mouseover', handleHover);
        const allElements = rootNode.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.shadowRoot) {
                detachShadowDOMListeners(element.shadowRoot);
            }
        });
    }

    function getImageInfo(element) {
        if (!element) {
            return { alt: 'N/A', source: 'N/A', type: 'N/A' };
        }

        const tagName = element.tagName.toLowerCase();

        if (tagName === 'picture') {
            const img = element.querySelector('img');
            if (img) {
                const imgInfo = getImageInfo(img);
                imgInfo.type = '<picture>'; // Always report type as picture
                return imgInfo;
            }
        }

        let role = element.getAttribute('role');
        let type = tagName;

        // Check for various image types
        const isImg = tagName === 'img';
        const isSvg = tagName === 'svg';
        const isFigure = tagName === 'figure';
        const isImageRole = role === 'img';
        const isInputImage = tagName === 'input' && element.type === 'image';
        const isObject = tagName === 'object';
        const isEmbed = tagName === 'embed';
        const isI = tagName === 'i';
        const hasBackgroundImage = window.getComputedStyle(element).backgroundImage !== 'none';

        if (isImg) {
            if (element.parentElement && element.parentElement.tagName.toLowerCase() === 'picture') {
                type = '<picture>';
            } else {
                type = '<img>';
            }
        } else if (isSvg) {
            type = '<svg>';
        } else if (isFigure) {
            type = '<figure>';
        } else if (isInputImage) {
            type = '<input type="image">';
        } else if (isObject) {
            type = '<object>';
        } else if (isEmbed) {
            type = '<embed>';
        } else if (isI) {
            type = '<i>';
        } else if (isImageRole) {
            type = `role="img"`;
        } else if (hasBackgroundImage) {
            type = 'CSS Background Image';
        } else {
            return { alt: 'Not an image', source: 'N/A', type: 'N/A' };
        }

        // Alt text calculation
        let alt = '';
        let source = '';

        if (element.hasAttribute('aria-labelledby')) {
            const labelledbyIds = element.getAttribute('aria-labelledby').split(' ');
            const rootNode = element.getRootNode();
            alt = labelledbyIds.map(id => {
                const el = rootNode.querySelector(`#${id}`);
                return el ? el.textContent.trim() : '';
            }).join(' ');
            source = 'aria-labelledby';
        } else if (element.hasAttribute('aria-label')) {
            alt = element.getAttribute('aria-label');
            source = 'aria-label';
        } else if (element.hasAttribute('alt')) {
            const altAttr = element.getAttribute('alt');
            if (altAttr === '') {
                alt = 'Image is decorative';
                source = 'alt=""';
            } else {
                alt = altAttr;
                source = 'alt attribute';
            }
        } else if (element.hasAttribute('title')) {
            alt = element.getAttribute('title');
            source = 'title attribute';
        }

        // For <figure>, look for <figcaption>
        if (isFigure) {
            const figcaption = element.querySelector('figcaption');
            if (figcaption) {
                alt = figcaption.textContent.trim();
                source = '<figcaption>';
            }
        }

        if (!alt) {
            alt = 'No alt text found';
            source = 'N/A';
        }

        return { alt, source, type };
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

    function attachShadowDOMListeners(rootNode) {
        rootNode.addEventListener('mouseover', handleHover);
        const allElements = rootNode.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.shadowRoot) {
                attachShadowDOMListeners(element.shadowRoot);
            }
        });
    }

    function updatePanel(alt, source, type) {
        strPageOutput = ""; // Clear previous output
        if (alt === 'Not an image') {
            log('Not an image', '', style_bad_formatting);
        } else {
            log(altTextLabel, alt, style_good_formatting);
            log('Alt text source: ', source, style_good_formatting);
            log('Image type: ', type, style_good_formatting);
        }
        const panelContentList = document.querySelector("#aImagePanelContent ul");
        panelContentList.innerHTML = strPageOutput;
    }

    function handleHover(event) {
        const hoveredElement = event.target;
        if (!hoveredElement) {
            return;
        }
        const {
            alt,
            source,
            type
        } = getImageInfo(hoveredElement);
        updatePanel(alt, source, type);
    }

    // Main execution
    removePanel();
    addPanelStyles(aImagePanelWidth);
    setupPanel();
    attachShadowDOMListeners(document);
}
aImage();

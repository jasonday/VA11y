function highlightSemantics() {
  const semanticElements = [
    'header', 'nav', 'main', 'article', 'section', 'aside', 'footer',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
    'figure', 'figcaption', 'time', 'address', 'details', 'summary'
  ];

  semanticElements.forEach(tag => {
    document.querySelectorAll(tag).forEach(element => {
      element.style.border = '1px solid blue';
      element.style.position = 'relative';
      element.style.padding = '5px';

      let label = document.createElement('span');
      label.textContent = `<${tag}>`;
      label.style.backgroundColor = 'lightblue';
      label.style.color = 'black';
      label.style.fontSize = '10px';
      label.style.position = 'absolute';
      label.style.top = '0';
      label.style.left = '0';
      label.style.zIndex = '99999';
      element.appendChild(label);
    });
  });
}

highlightSemantics();
}();

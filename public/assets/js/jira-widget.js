const SELECTORS = {
  iframe: '#jsd-widget',
  searchPlaceholder: 'input[placeholder="How can we help?"]',
  contactTitle: 'h2',
  footer: 'footer',
};
const TEXTS = {
  searchPlaceholder: 'Hoe kunnen we helpen?',
  contactTitle: 'Contacteer ons',
};

function modifyIframeContent(iframe) {
  const iframeDocument = getIframeDocument(iframe);
  if (!iframeDocument) return;

  addMaxHeightStyle(iframeDocument);
  customizeSearchPlaceholder(iframeDocument);
  updateContactTitle(iframeDocument);
  removeFooter(iframeDocument);
  observeMutations(iframe, iframeDocument);
}

function getIframeDocument(iframe) {
  return iframe.contentDocument || iframe.contentWindow.document;
}

function addMaxHeightStyle(iframeDocument) {
  if (!iframeDocument.body.dataset.modified) {
    const maxHeight = Math.min(window.innerHeight - 160, 522) + 'px';
    iframeDocument.body.dataset.modified = true;

    const style = iframeDocument.createElement('style');
    style.innerHTML = `
        #search-container .body.expanded {
          max-height: ${maxHeight} !important;
        }
      `;
    iframeDocument.head.appendChild(style);
  }
}

function customizeSearchPlaceholder(iframeDocument) {
  const inputField = iframeDocument.querySelector(SELECTORS.searchPlaceholder);
  if (inputField) {
    iframeDocument.body.dataset.stopObserver = true;
    inputField.placeholder = TEXTS.searchPlaceholder;
  }
}

function updateContactTitle(iframeDocument) {
  const contactTitle = iframeDocument.querySelector(SELECTORS.contactTitle);
  if (contactTitle && contactTitle.innerHTML !== TEXTS.contactTitle) {
    contactTitle.innerHTML = TEXTS.contactTitle;
  }
}

function removeFooter(iframeDocument) {
  const footer = iframeDocument.querySelector(SELECTORS.footer);
  if (footer) footer.remove();
}

function observeMutations(iframe, iframeDocument) {
  if (iframeDocument.body.dataset.stopObserver) return;

  const observer = new MutationObserver((mutations) => {
    if (mutations.length > 0) modifyIframeContent(iframe);
  });

  observer.observe(iframeDocument.body, {
    childList: true,
    subtree: true,
  });
}

function checkIframe() {
  const iframe = document.querySelector(SELECTORS.iframe);
  if (iframe) {
    modifyIframeContent(iframe);
  } else {
    setTimeout(checkIframe, 500);
  }
}
checkIframe();

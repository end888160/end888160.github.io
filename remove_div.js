// ==UserScript==
// @name         Manufacturer's Provided Plugin
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes <div> elements containing bad content
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let count = 0;

    // Define regex patterns to match bad content
    const patterns = [
        /\u305A\u3093\u3060\u3082/i, // Unicode example
        /\x7a\x75\x6e\x64\x61\x6d/i, // Hexadecimal example
    ];

    function containsBadWords(text) {
        return patterns.some(pattern => pattern.test(text));
    }

    function removeBadDivs(root = document.body) {
        const divs = root.querySelectorAll('div');
        for (const div of divs) {
            if (containsBadWords(div.textContent)) {
                div.remove();  // 💥 Remove the entire <div>
            }
        }
    }

    // Initial cleanup
    removeBadDivs();

    // Remove newly added bad divs dynamically
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'DIV') {
                        if (containsBadWords(node.textContent)) {
                            node.remove();
                            count++;
                            // console.log(`(${count}) Removed a bad <div> element: ${node.textContent.trim()}`);
                        }
                    } else {
                        removeBadDivs(node);
                        if (node.querySelectorAll('div').length > 0) {
                            count++;
                            // console.log(`(${count}) Removed ${node.querySelectorAll('div').length} bad <div> elements from subtree: ${node.textContent.trim()}`);
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();

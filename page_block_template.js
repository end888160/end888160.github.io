// ==UserScript==
// @name         🥚 Page Blocker
// @author       end888160
// @version      0.1
// @description  Start with this template - Create your own page blocker
// @match        *://*/*
// ==/UserScript==

(function() {
    // Use strict mode
    'use strict';

    // Define blocked words/phrases (add more as needed) *The most important part of this script*
    const blockedPatterns = [
        // This is random text, replace with your own
        /\u305A\u3093\u3060\u3082/i, // Unicode example
        /\x7a\x75\x6e\x64\x61\x6d/i, // Hexadecimal example
    ];

    // Only in top window: listen for messages from iframes
    if (window.top === window.self) {
        window.addEventListener("message", (event) => {
            if (event?.data?.tamperBlockMatch === true) {
                console.info("Blocked due to iframe match");
                ReplacePage(); // Call ReplacePage() in parent
            }
        });
    }

    // Set the interval (in milliseconds) at which to check for blocked content
    let interval = 100

    
    /**
     * Checks if a given text matches any of the blocked patterns.
     * @param {string} text The text to check
     * @returns {boolean} true if the text matches any blocked pattern, false otherwise
     */
    function isBlocked(text) {
        return text && blockedPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Checks the page title, body text, and specific elements for blocked content.
     * If any blocked content is found, calls ReplacePage() to block the page.
     * @returns {void}
     */
    function checkForBlockedContent() {
        const pageTitle = document.title;
        const bodyText = document.body ? document.body.innerText : "";

        // Quick check on title and body text before scanning individual elements
        if (isBlocked(pageTitle)) {
            // console.info("Blocked title:", pageTitle);
            ReplacePage();
            return;
        }
        if (isBlocked(bodyText)) {
            // console.info("Blocked page content:", window.location.href);
            ReplacePage();
            return;
        }

        // Select specific elements to check (limit scope to reduce performance impact)
        const elementsToCheck = document.querySelectorAll("button, li, h1, h2, h3, a, span, div, option");
        for (const el of elementsToCheck) {
            if (isBlocked(el.innerText)) {
                // console.warn("Blocked page content:", window.location.href);
                ReplacePage();
                return;
            }
        }
    }

    /**
     * This is a fix for YouTube on Chrome.
     * Creates a "TrustedHTML" object from a given string, if supported by the browser.
     * Otherwise, returns the original string.
     * This is used to prevent cross-site script injection.
     * @param {string} html - The string to create a TrustedHTML object from
     * @returns {TrustedHTML|string} The TrustedHTML object, or the original string if unsupported
     */
    function createTrustedHTML(html) {
        if (window.trustedTypes && trustedTypes.createPolicy) {
        let policy = trustedTypes.createPolicy("default", {
            createHTML: input => input
        });
        return policy.createHTML(html);
        } else {
        // Firefox or unsupported → return raw
        return html;
        }
    }
    

    /**
     * Replaces the current page with a custom HTML template.
     * Stops observing mutations, clears pending mutation observer timeout, stops all further script execution, clears page title, clears existing content, and stops media playback.
     * If inside an iframe, tells parent to block the whole page instead.
     * @memberof ReplacePage
     */
    function ReplacePage() {

        // Example: Replace the current page with nothing. Insert your HTML here.
        const TEMPLATE = ``;

        // If inside an iframe, tell parent to block the whole page
        if (window.top !== window.self) {
            window.top.postMessage({ tamperBlockMatch: true }, "*");
            return; // Don't block the iframe itself
        }

        // Stop observing mutations
        observer.disconnect();

        // Clear pending mutation observer timeout
        if (observerTimeout) {
            clearTimeout(observerTimeout);
        }

        // Stop all further script execution
        if (window.stop) {
            window.stop(); // Stops loading (images, scripts, etc.)
        }

        // Example: Clear page title. Replace with your own
        document.title = ""
        
      
        // Example console log
        console.error("Error: An unexpected error occurred");

        // Clear existing content
        try {
            document.open();
            document.write("<style>@media (prefers-color-scheme: dark) { body { background-color: black; color: white; } }</style>");
        } catch (e) { 
            console.error(e);
            // Clear existing content
            document.body.innerHTML = "";
            document.head.innerHTML = "";
            document.documentElement.innerHTML = "<style>@media (prefers-color-scheme: dark) { body { background-color: black; color: white; } }</style>";
        }
        // Replace with blocked page HTML
        // document.write(createTrustedHTML(TEMPLATE));
      	document.documentElement.innerHTML = createTrustedHTML(TEMPLATE);

        // Stop media playback
        document.querySelectorAll("video, audio").forEach(media => {
            media.pause();
            media.src = "";
        });

    }

    // Run once when DOM is loaded
    document.addEventListener("DOMContentLoaded", checkForBlockedContent);

    // Run once at page load
    let observerTimeout;

    // MutationObserver to check dynamically loaded content
    const observer = new MutationObserver(() => {
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(checkForBlockedContent, interval);
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

})();

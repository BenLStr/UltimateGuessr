// ==UserScript==
// @name         UltimateGuessr
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Fängt GeoGuessr API-Daten ab und zeigt sie in einem separaten Fenster an
// @author       BenStr
// @match        https://www.geoguessr.com/*
// @grant        GM_openInTab
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const targetAPI =
    "https://maps.googleapis.com/maps/api/js/GeoPhotoService.GetMetadata";

  function interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async function (resource, init) {
      const response = await originalFetch(resource, init);
      if (typeof resource === "string" && resource.includes(targetAPI)) {
        response
          .clone()
          .json()
          .then((data) => {
            console.log("Intercepted API Data:", data);
            showDataInPopup(data);
          });
      }
      return response;
    };
  }

  function interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (url.includes(targetAPI)) {
        this.addEventListener("load", function () {
          try {
            const data = JSON.parse(this.responseText);
            console.log("Intercepted XHR Data:", data);
            showDataInPopup(data);
          } catch (e) {
            console.error("Error parsing response:", e);
          }
        });
      }
      return originalOpen.apply(this, arguments);
    };
  }

  function showDataInPopup(data) {
    const popupUrl = URL.createObjectURL(
      new Blob(
        [
          `<html><body><h1>GeoGuessr Location</h1><pre>${JSON.stringify(
            data,
            null,
            2
          )}</pre></body></html>`,
        ],
        { type: "text/html" }
      )
    );
    GM_openInTab(popupUrl, { active: true });
  }

  interceptFetch();
  interceptXHR();
})();

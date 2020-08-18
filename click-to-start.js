"use strict";

(async () => {
  const $ = document.querySelector.bind(document);
  const body = $("body");
  const container = document.createElement("div");
  container.style.cssText = `position: absolute; width: 100vw; height: 100vh; background-color: transparent; top: 0; left: 0;`;

  const background = document.createElement("div");
  background.style.cssText = `opacity: 70%; background-color: #000; width: 100%; height: 100%; z-index: 998; position: absolute; top: 0; left: 0;`;

  const modal = document.createElement("div");
  modal.style.cssText = `position: relative; padding: 50px; width: 800px; height: 600px; margin: 0 auto; background-color: #FFF; border: 5px solid #AEC6CF; top: 10vh; opacity: 100%; z-index: 999;`;
  modal.innerHTML = "<h1>Font Access Demo</h1><p>User Activation is required to begin demo.</p";
  modal.id = "font-access-modal";


  const button = document.createElement("button");
  const userActivationEvent = new Event('UserActivationTriggered');

  button.onclick = () => {
    body.removeChild(container);
    window.dispatchEvent(userActivationEvent);
  };
  button.textContent = "Click to enumerate fonts";
  modal.appendChild(button);

  container.appendChild(background);
  container.appendChild(modal);
  body.appendChild(container);
})();

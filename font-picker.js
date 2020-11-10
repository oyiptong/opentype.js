"use strict";

(() => {
  window.addEventListener("EnumerationReady", async () => {
    const $ = document.querySelector.bind(document);
    // Gather all fonts
    let ms = Object.values(window.fonts);
    let searchFilter = "";

    const drawList = (opts = {}) => {
      const defaultOpts = {
        list: [],
        uniq: false,
        search: "",
        display: "fullName"
      };

      opts = Object.assign({}, defaultOpts, opts);
      let list = opts.list;
      let display = opts.display;

      // Sort.
      list = list.sort((a, b) =>
                       a[display] < b[display] ? -1 : a[display] > b[display] ? 1 : 0
                      );

      // Filter by search params.
      if (opts.search) {
        list = list.filter(m =>
                           m[display].toLowerCase().startsWith(opts.search.toLowerCase())
                          );
      }

      // Uniquify (assumes sorted).
      list = list.filter(
        (m, index) => index === 0 || list[index - 1][display] !== m[display]
      );

      // Build UI
      $("#list").innerText = "";
      for (const metadata of list) {
        const entry = Object.assign(document.createElement("div"), {
          className: "item",
          textContent: metadata[display],
          dataPSName: metadata["postscriptName"],
          /*
          style: `font-family: "${
          display === "family" ? metadata[display] : metadata["postscriptName"]
        }"`*/
        });

        $("#list").append(entry);
      }
    };
    drawList({ list: ms, uniq: true, display: "fullName" });

    $("#search").onkeyup = e => {
      console.log(e);
      searchFilter = $("#search").value;
      drawList({ list: ms, search: searchFilter });
    };

    $("#list").onclick = e => {
      if (e.target.className !== "item") return;
      if ($("#list .item.selected"))
        $("#list .item.selected").classList.remove("selected");
      e.target.classList.add("selected");

      const event = new CustomEvent('font-selected', {detail: e.target.dataPSName});
      document.dispatchEvent(event);
      $("#font-picker").style.display = "none";
    };
  }, false);
})();

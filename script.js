const ImageEditor = (function () {
  let filterList = {};
  let img = null;
  let selectedFile;
  let originalWidth;
  let originalHeight;

  const imageInput = document.getElementById("image-input");
  const imagePreview = document.querySelector(".image-preview");
  const removeBtn = document.querySelector(".remove-button");
  const settings = document.querySelector(".settings");
  const actions = document.querySelector(".actions");

  //* update functions
  function updateFilterDisplay(id, data) {
    settings.querySelector(`[data-${id}]`).textContent = data;
  }

  function updateFilterList(id, data) {
    filterList[id] = `${id}(${data})`;
  }

  function updateImagePreview() {
    const image = imagePreview.querySelector("img");
    if (image) {
      image.style.filter = Object.values(filterList).join(" ");
    }
  }

  //* event handlers

  function handleSettings(e) {
    const { id, value } = e.target;
    const { unit } = filters[id];

    // update filter display
    updateFilterDisplay(id, value + unit);

    // update filter list
    updateFilterList(id, value + unit);

    // update image preview
    updateImagePreview();
  }

  async function handleUpload(e) {
    selectedFile = e.target.files[0];

    if (selectedFile) {
      img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      img.addEventListener("load", resetFilters);
      await img.decode();

      originalWidth = img.width;
      originalHeight = img.height;

      renderImagePreview();
    }
  }

  function handleRemove() {
    // remove image from the preview
    const image = imagePreview.querySelector("img");
    image && image.remove();

    // revoke object url and clear upload input
    resetImage();

    // reset filters
    resetFilters();
  }

  function handleAction(e) {
    const btn = e.target;
    if (btn.hasAttribute("data-save")) {
      downloadImage();
    } else {
      // reset
      resetFilters();
      updateImagePreview();
    }
  }

  //* reset functions

  function resetFilters() {
    filterList = {};

    const disabled = img === null;

    const inputs = settings.querySelectorAll("input");
    inputs.forEach((input) => {
      const { id } = input;
      const { initValue, unit } = filters[id];

      input.value = initValue;
      input.disabled = disabled;

      updateFilterDisplay(id, initValue + unit);
    });
  }

  function resetImage() {
    if (img) {
      URL.revokeObjectURL(img);
      img = null;
    }
    imageInput.value = "";
  }

  //* render functions

  function renderImagePreview() {
    const image = imagePreview.querySelector("img");
    image && image.remove();

    imagePreview.appendChild(img);
  }

  function renderSettings() {
    for (const id in filters) {
      const { text, min, max, initValue, unit } = filters[id];

      // div
      const div = document.createElement("div");

      // label
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.textContent = `${text}: `;

      // strong
      const strong = document.createElement("strong");
      strong.toggleAttribute(`data-${id}`, true);
      strong.textContent = initValue + unit;
      label.appendChild(strong);

      // input
      const input = document.createElement("input");
      input.setAttribute("type", "range");
      input.setAttribute("disabled", true);
      input.setAttribute("id", id);
      input.setAttribute("min", min);
      input.setAttribute("max", max);
      input.setAttribute("value", initValue);

      div.appendChild(label);
      div.appendChild(input);

      settings.appendChild(div);
    }
  }

  //* other functions
  function downloadImage() {
    // only do this if there is an image to download
    if (img !== null) {
      // get original filename without extension
      const name = selectedFile.name.replace(/\.[^/.]+$/, "");
      const quality = 1;

      createCanvas().toBlob(
        (blob) => {
          const link = document.createElement("a");
          link.download = `${name}_filtered.webp`;
          link.href = URL.createObjectURL(blob);
          link.click();
        },
        "image/webp",
        quality
      );
    }
  }

  function createCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    const context = canvas.getContext("2d");
    context.filter = Object.values(filterList).join(" ");
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  //* setup

  function setupEventListeners() {
    settings.addEventListener("input", handleSettings);
    actions.addEventListener("click", handleAction);
    imageInput.addEventListener("change", handleUpload);
    removeBtn.addEventListener("click", handleRemove);
  }

  function initialize() {
    renderSettings();
    setupEventListeners();
  }

  return { initialize };
})();

ImageEditor.initialize();

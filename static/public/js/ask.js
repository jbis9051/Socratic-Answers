createEditor(document.querySelector('#qinput'), document.querySelector('#qpreview'));

const tagInput = document.querySelector('#tagInput');
const tagPreview = document.querySelector('#tagPreview');

function updateTags(replace) {
    const tags = tagInput.value.split(",").map(tag => tag.trim().replace(/ /g, "-"));
    if (replace) {
        tagInput.value = tags.join(", ");
    }
    tagPreview.innerHTML = tags.map(tag => `<span class="question-tag">${tag}</span>`).join("");
}

updateTags(true);

tagInput.addEventListener("keydown", function (event) {
    if (!/[\w\d-_, ]/.test(event.key)) {
        event.preventDefault();
    }
});

tagInput.addEventListener("keyup", function (event) {
    updateTags(event.key === ",");
});

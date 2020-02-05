const md = window.markdownit();

function createEditor(textarea, preview) {
    function render() {
        preview.innerHTML = md.render(bioInput.value);
        preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
    textarea.addEventListener("keyup", event => {
        render();
    });
    render();
}
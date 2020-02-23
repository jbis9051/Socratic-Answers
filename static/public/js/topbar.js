window.addEventListener('load', function () {
    const topExpander = document.querySelector('#topbarExpand');
    document.querySelector('#topbarHamburger').addEventListener("click", evt => {
        topExpander.classList.toggle("active");
        evt.stopPropagation();
    });
    topExpander.addEventListener("click", evt => {
        evt.stopPropagation();
    });
    window.addEventListener("click", (evt) => {
        topExpander.classList.remove("active");
    });
});



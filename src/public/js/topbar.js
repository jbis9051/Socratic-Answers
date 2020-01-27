window.addEventListener('load', function () {
    const topExpander = document.querySelector('#topbarExpand');
    document.querySelector('#topbarHamburger').addEventListener("click", evt => {
        topExpander.classList.toggle("active");
    });
});



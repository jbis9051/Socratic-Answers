document.querySelectorAll('.add-comment-wrapper').forEach(el => {
    el.querySelector('.add-comment--button').addEventListener("click", evt => {
        evt.currentTarget.parentElement.classList.add("active");
    });
    el.querySelector('.add-comment--submit').addEventListener("click", async evt => {
        evt.currentTarget.parentElement.parentElement.classList.remove("active");
        const formdata = new URLSearchParams();
        formdata.append("content", el.querySelector('.add-comment--input').value);
        if (el.classList.contains('answer')) {
            formdata.append("qa_id", el.getAttribute("data-link-id"));
        } else {
            formdata.append("question_id", questionid);
        }
        const request = await fetch(`/comments/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formdata
        }).catch(err => createAlert("error", err.toString()));
        const resp = await request.json();
        if (!resp.success) {
            return createAlert("error", resp.errors.join(", "))
        }
        el.parentElement.querySelector(".comments-container").innerHTML += resp.html;
    });
});

document.querySelectorAll('.add-comment-wrapper').forEach(el => {
    el.querySelector('.add-comment--button').addEventListener("click", evt => {
        evt.currentTarget.parentElement.classList.add("active");
    });
    el.querySelector('.add-comment--submit').addEventListener("click", async evt => {
        evt.currentTarget.parentElement.parentElement.classList.remove("active");
        const formdata = new URLSearchParams();
        formdata.append("content", el.querySelector('.add-comment--input').value);
        if (el.classList.contains('answer-type')) {
            formdata.append("id", el.getAttribute("data-link-id"));
            formdata.append("type", "link");
        } else if (el.classList.contains('question-type')) {
            formdata.append("id", questionid);
            formdata.append("type", "question");
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
        el.parentElement.querySelector('details').open = true;
    });
});

document.querySelectorAll('.comments-wrapper').forEach(el => {
    el.addEventListener('click', async e => {
        if (!e.target.classList.contains('comment--delete')) {
            return;
        }
        const formdata = new URLSearchParams();
        formdata.append("type", el.querySelector('.add-comment-wrapper').classList.contains("answer-type") ? "link" : "question");
        const request = await fetch(`/comments/delete/` + e.target.parentElement.getAttribute("data-comment-id"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formdata
        }).catch(err => createAlert("error", err.toString()));
        const json = await request.json();
        if (!json.success) {
            createAlert("error", json.errors.join(", "));
            return;
        }
        e.target.parentElement.remove();
    });
});

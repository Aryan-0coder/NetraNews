const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadArticle() {
    const response = await fetch(
        `http://localhost:8080/api/news/${id}`
    );

    const article = await response.json();

    document.getElementById("title").innerText =
        article.title;

    document.getElementById("content").innerText =
        article.content;
}

loadArticle();
async function loadNews() {
    try {
        const response = await fetch("http://localhost:8080/api/news");
        const articles = await response.json();

        const container = document.getElementById("news-container");
        container.innerHTML = "";

        articles.forEach(article => {
            container.innerHTML += `
                <div class="news-card">
                    <img src="${article.imageUrl}" alt="${article.title}">
                    <h2>${article.title}</h2>
                    <p>${article.summary}</p>
                    <button onclick="viewArticle('${article.id}')">
                        Read More
                    </button>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error loading news:", error);
    }
}

loadNews();
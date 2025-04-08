import View from "./View.js";

export default class extends View {
    constructor(params) {
        super(params);
        this.type = params.type;
        this.id = params.id;
        this.setTitle("페이지");
    }

    async render() {
        this.data = await api(`/${this.type}/${this.id}/?include=authors,tags&formats=html`);
        this.post = this.data[this.type][0];
        this.setTitle(this.post.title);
        this.latest = await api('/posts/?limit=3');

        return `
            <div class="px-4 mb-8">
                <div class="text-gray-800">${this.post.primary_tag ? this.post.primary_tag.name : ''}</div>
                <h1 class="text-4xl my-2">${this.post.title}</h1>
                <div class="text-sm text-gray-500 my-4">
                    <span>${this.post.primary_author.name}</span>
                    <span class="mx-2">${this.formatDate(this.post.published_at)}</span>
                </div>
                <div id="gh-content-container"">
                </div>
            </div>
            <h1 class="text-lg font-bold pt-4 px-4 border-t-1 border-gray-300">
                <span class="text-blue-800">다른</span> 소식
            </h1>
            <div class="p-4">
                <ul class="h-full">
                    ${this.latest.posts.map(post => `
                        <li>
                            <a href="/posts/${post.id}" class="flex flex-row py-4" data-link>
                                <img class="aspect-square object-cover rounded-lg w-1/5" src="${post.feature_image}" alt="${post.feature_image_alt}">
                                <div class="flex flex-col w-4/5 p-2 ml-2">
                                    <h3 class="font-bold truncate">${post.title}</h3>
                                    <p class="text-sm text-gray-500 truncate">${post.excerpt}</p>
                                </div>
                            </a>
                        </li>
                        ${post !== this.latest.posts[this.latest.posts.length - 1] ? '<hr class="text-gray-200">' : ''}
                    `).join('')}
                </ul>
            </div>
        `;
    }

    async rendered() {
        const gbContentContainer = document.getElementById("gh-content-container");

        // Attach Shadow DOM
        const shadowRoot = gbContentContainer.attachShadow({ mode: "open" });

        // Load external CSS into Shadow DOM
        const linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("href", "/static/css/screen.css");

        // Content for Shadow DOM
        const content = document.createElement("div");
        content.className = "gh-content";
        content.innerHTML = this.post.html;

        // Append CSS and content to Shadow DOM
        shadowRoot.appendChild(linkElement);
        shadowRoot.appendChild(content);
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('ko-KR', { 
            year: 'numeric', month: 'numeric', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            hour12: false 
        }).format(date).replace(/\. /g, '. ');
    }
}

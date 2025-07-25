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
        this.postData = this.data[this.type][0];
        this.setTitle(this.postData.title);
        this.otherPosts = await api('/posts/?limit=3');

        return `
            <div class="px-4 pb-4">
                <div class="text-gray-800">${this.postData.primary_tag ? this.postData.primary_tag.name : ''}</div>
                <h1 class="text-4xl my-2">${this.postData.title}</h1>
                <div class="text-sm text-gray-500 my-4">
                    <span>${this.postData.primary_author.name}</span>
                    <span class="mx-2">${this.formatDate(this.postData.published_at)}</span>
                </div>
                <div class="w-full h-full mb-4">
                    <img class="w-full h-full object-cover" src="${this.postData.feature_image}" alt="${this.postData.title}" />
                </div>
                <div id="gh-content-container" class="py-4"></div>
            </div>
            <h1 class="text-lg font-bold px-4 pt-4">
                <span class="text-blue-800">다른</span> 소식
            </h1>
            <div class="px-4 py-2">
                <ul class="h-full">
                    ${this.otherPosts.posts.map(post => `
                        <li>
                            <a href="/posts/${post.id}" class="flex flex-row py-3" data-link>
                                <img class="aspect-square object-cover rounded-lg w-20 h-20" src="${post.feature_image}" alt="${post.feature_image_alt}">
                                <div class="flex flex-col w-4/5 p-2 ml-2">
                                    <h3 class="font-bold truncate">${post.title}</h3>
                                    <p class="text-sm text-gray-500 mt-1 line-clamp-2">${post.excerpt}</p>
                                </div>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    async rendered() {
        const gbContentContainer = document.getElementById("gh-content-container");
        this.attachShadowDOM(gbContentContainer, this.postData.html);
    }

    attachShadowDOM(container, htmlContent) {
        // Attach Shadow DOM
        const shadowRoot = container.attachShadow({ mode: "open" });

        // Load external CSS into Shadow DOM
        const screen = document.createElement("link");
        screen.setAttribute("rel", "stylesheet");
        screen.setAttribute("href", "/static/css/screen.css");
        
        const cards = document.createElement("link");
        cards.setAttribute("rel", "stylesheet");
        cards.setAttribute("href", "/static/css/cards.css");

        // Content for Shadow DOM
        const content = document.createElement("section");
        content.className = "gh-content";
        content.innerHTML = htmlContent;

        // Append CSS and content to Shadow DOM
        shadowRoot.appendChild(screen);
        shadowRoot.appendChild(cards);
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

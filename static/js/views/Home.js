import View from "./View.js";
import Glide from "https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/glide.esm.js";
import { loadCSS } from "../util.js";

loadCSS("https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/css/glide.core.min.css");
loadCSS("https://cdn.jsdelivr.net/npm/@glidejs/glide/dist/css/glide.theme.min.css");

export default class extends View {
    constructor(params) {
        super(params);
        this.setTitle("홈");
    }

    async beforeRender() {
        this.featuredData = await api('/posts/?filter=featured:true%2Btag:news');
        this.pageData = await api('/pages/?order=published_at%20asc');
        this.eventData = await api('/posts/?filter=featured:true%2Btag:events');
        this.latestPostsData = await api('/posts/?page=1');
    }

    async render() {
        return `
            <div>
                <div class="glide slide1">
                    <div class="glide__track" data-glide-el="track">
                        <ul class="glide__slides">
                            ${this.featuredData.posts.map(item => `
                                <li class="glide__slide px-4">
                                    <a href="/posts/${item.id}" data-link>
                                        <img class="rounded-xl aspect-square object-cover" src="${item.feature_image}" alt="${item.feature_image_alt}">
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="glide__bullets" data-glide-el="controls[nav]">
                        ${this.featuredData.posts.map((_, index) => `<button class="glide__bullet" data-glide-dir="=${index}"></button>`).join('')}
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 p-4">
                    ${this.pageData.pages.map(page => `
                        <a href="/pages/${page.id}" data-link>
                            <div class="border-1 border-gray-300 rounded-lg px-4 py-2">
                                <img class="h-6 rounded-lg aspect-square object-cover" src="${page.feature_image}" alt="${page.feature_image_alt}">
                                <div class="text-sm text-bold">${page.title}</div>
                            </div>
                        </a>
                    `).join('')}
                </div>
                <h1 class="text-lg font-bold p-4">
                    <span class="text-blue-800">진행중인</span> 이벤트
                </h1>
                <div class="glide slide2 py-4">
                    <div class="glide__track" data-glide-el="track">
                        <ul class="glide__slides">
                            ${this.eventData.posts.map(item => `
                                <li class="glide__slide text-center px-4">
                                    <a href="/posts/${item.id}" data-link>
                                        <img class="rounded-xl aspect-4/5 object-cover object-top" src="${item.feature_image}" alt="${item.feature_image_alt}">
                                        <div class="text-sm text-bold mt-2">${item.title}</div>
                                        <div class="text-sm text-gray-500 mt-2">${item.excerpt}</div>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <div>
                    <h1 class="text-lg font-bold pt-4 px-4">
                        <span class="text-blue-800">최신</span> 소식
                    </h1>
                    <ul id="latest-posts">
                        ${this.latestPostsData.posts.map(post => `
                            <li class="flex flex-col py-4">
                                <a href="/posts/${post.id}" data-link>
                                    <img class="aspect-2/1 object-cover rounded-lg w-full p-4" src="${post.feature_image}" alt="${post.feature_image_alt}">
                                    <h3 class="font-bold px-6 mb-4">${post.title}</h3>
                                    <p class="text-sm px-8 text-gray-500">${post.excerpt}</p>
                                </a>
                            </li>
                            ${post !== this.latestPostsData.posts[this.latestPostsData.posts.length - 1] ? '<div class="px-4"><hr></div>' : ''}
                        `).join('')}
                    </ul>
                </div>
                <div class="flex justify-center p-4">
                    <button class="more p-2 w-full text-sm font-bold rounded-xl bg-blue-800 text-white" data-event="click:loadMorePosts">더보기</button>
                </div>
            </div>
        `;
    }

    async rendered() {
        new Glide('.slide1', {
            type: 'carousel',
            autoplay: 5000,
        }).mount();
        new Glide('.slide2', {
            type: 'carousel',
            autoplay: 5000,
            perView: 2,
            focusAt: 'center',
        }).mount();
    }

    async loadMorePosts(event) {
        const button = event.target;
        const currentPage = this.latestPostsData.meta.pagination.page;
        const totalPages = this.latestPostsData.meta.pagination.pages;
        if (currentPage < totalPages) {
            const morePostsData = await api(`/posts/?page=${currentPage + 1}`);
            const morePostsHtml = morePostsData.posts.map(post => `
                <li class="flex flex-col py-4">
                    <img class="aspect-2/1 object-cover rounded-lg w-full p-4" src="${post.feature_image}" alt="${post.feature_image_alt}">
                    <h3 class="font-bold px-6 mb-4">${post.title}</h3>
                    <p class="text-sm px-8 text-gray-500">${post.excerpt}</p>
                </li>
                ${post !== morePostsData.posts[morePostsData.posts.length - 1] ? '<div class="px-4"><hr></div>' : ''}
            `).join('');
            document.querySelector('#latest-posts').insertAdjacentHTML('beforeend', morePostsHtml);
            this.latestPostsData.posts.push(...morePostsData.posts);
            this.latestPostsData.meta.pagination.page = currentPage + 1;
        } else {
            button.disabled = true;
            button.textContent = "더 이상 게시물이 없습니다.";
        }
    }
}
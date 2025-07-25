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
        this.featuredData = await api('/posts/?filter=featured:true&include=tags');
        this.pageData = await api('/pages/?order=published_at%20asc');
        this.bookData = await api('/posts/?filter=tag:books&limit=5');
        this.latestPostsData = await api('/posts/?filter=tag:news&page=1');
    }

    async render() {
        const pagination = this.latestPostsData.meta.pagination;
        return `
            <div>
                <div class="glide slide1">
                    <div class="glide__track" data-glide-el="track">
                        <ul class="glide__slides">
                            ${this.featuredData.posts.map(item => `
                                <li class="glide__slide px-4">
                                    <a href="/posts/${item.id}" data-link class="relative block">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                                        <img class="w-full h-full rounded-xl aspect-square object-cover object-top" src="${item.feature_image}" alt="${item.feature_image_alt}">
                                        <div class="absolute bottom-12 left-4 right-4 p-4 text-white">
                                            <h2 class="text-xl font-bold mt-1">${item.title}</h2>
                                            <p class="text-sm mt-2">${item.excerpt}</p>
                                        </div>
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
                    <span class="text-blue-800">이 달의</span> 책
                </h1>
                <div class="glide slide2 py-4">
                    <div class="glide__track" data-glide-el="track">
                        <ul class="glide__slides">
                            ${this.bookData.posts.map(item => `
                                <li class="glide__slide text-center px-4">
                                    <a href="/posts/${item.id}" data-link>
                                        <img class="aspect-2/3 object-cover object-top border-1 border-gray-300" src="${item.feature_image}" alt="${item.feature_image_alt}">
                                        <div class="text-sm text-bold mt-4">${item.title}</div>
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
                            <li class="flex flex-col p-4">
                                <a href="/posts/${post.id}" data-link>
                                    <img class="aspect-2/1 object-cover rounded-lg w-full border-1 border-gray-200" src="${post.feature_image}" alt="${post.feature_image_alt}">
                                    <div class="pt-4 px-4">
                                        <h3 class="font-bold">${post.title}</h3>
                                        <div class="text-sm text-gray-500 mt-1">${post.excerpt}</div>
                                    </div>
                                </a>
                            </li>
                            ${post !== this.latestPostsData.posts[this.latestPostsData.posts.length - 1] ? '<hr class="mx-4 text-gray-300"/>' : ''}
                        `).join('')}
                    </ul>
                </div>
                <div class="flex justify-center p-4" id="pagination-controls">
                    ${this.renderPaginationControls(pagination)}
                </div>
            </div>
        `;
    }

    renderPaginationControls(pagination) {
        let html = '';
        if (pagination.pages <= 1) return html;
        // Prev button
        html += `<button class="px-2 py-1 mx-1 rounded ${pagination.page === 1 ? 'text-gray-400' : ''}" 
            data-page="${pagination.page - 1}" ${pagination.page === 1 ? 'disabled' : ''}>이전</button>`;
        // Page numbers (show up to 5 pages, with current in center if possible)
        let start = Math.max(1, pagination.page - 2);
        let end = Math.min(pagination.pages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) {
            html += `<button class="px-2 py-1 mx-1 rounded ${i === pagination.page ? 'bg-blue-800 text-white font-bold' : 'bg-gray-100'}" 
                data-page="${i}">${i}</button>`;
        }
        // Next button
        html += `<button class="px-2 py-1 mx-1 rounded ${pagination.page === pagination.pages ? 'text-gray-400' : ''}" 
            data-page="${pagination.page + 1}" ${pagination.page === pagination.pages ? 'disabled' : ''}>다음</button>`;
        return html;
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
        // Pagination event delegation
        document.getElementById('pagination-controls')?.addEventListener('click', async (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.page) {
                const page = parseInt(e.target.dataset.page, 10);
                if (!isNaN(page) && page >= 1 && page <= this.latestPostsData.meta.pagination.pages && page !== this.latestPostsData.meta.pagination.page) {
                    await this.changeLatestPostsPage(page);
                }
            }
        });
    }

    async changeLatestPostsPage(page) {
        this.latestPostsData = await api(`/posts/?page=${page}`);
        // Replace posts
        const postsHtml = this.latestPostsData.posts.map(post => `
            <li class="flex flex-col p-4">
                <a href="/posts/${post.id}" data-link>
                    <img class="aspect-2/1 object-cover rounded-lg w-full border-1 border-gray-200" src="${post.feature_image}" alt="${post.feature_image_alt}">
                    <div class="pt-4 px-4">
                        <h3 class="font-bold">${post.title}</h3>
                        <div class="text-sm text-gray-500 mt-1">${post.excerpt}</div>
                    </div>
                </a>
            </li>
            ${post !== this.latestPostsData.posts[this.latestPostsData.posts.length - 1] ? '<hr class="mx-4 text-gray-300"/>' : ''}
        `).join('');
        document.getElementById('latest-posts').innerHTML = postsHtml;
        // Replace pagination controls
        document.getElementById('pagination-controls').innerHTML = this.renderPaginationControls(this.latestPostsData.meta.pagination);
    }
}
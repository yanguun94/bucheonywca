import Home from "./views/Home.js";
import Search from "./views/Search.js";
import Page from "./views/Page.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const bindDataEvents = (view) => {
    const elements = document.querySelectorAll('[data-event]');
    
    elements.forEach(element => {
        const eventConfig = element.dataset.event.split(':');
        const eventName = eventConfig[0];
        const methodName = eventConfig[1];
        if (typeof view[methodName] === 'function') {
            element.addEventListener(eventName, view[methodName].bind(view));
        }
    });
}

const router = async () => {
    const routes = [
        { path: "/", view: Home },
        { path: "/search", view: Search },
        { path: "/:type/:id", view: Page },
    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));

    await view.beforeRender();
    document.querySelector("#app").innerHTML = await view.render();
    bindDataEvents(view);
    await view.rendered();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});
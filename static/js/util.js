const API_URL = 'https://bcywca-api.arkaive.org/ghost/api/content';
const API_KEY = '0e7720348aae8fd3fa3212306e';

window.api = async (...args) => {
  let [resource, config] = args;
  if (resource.startsWith('/')) {
    resource = API_URL + resource;
  }

  const url = new URL(resource);
  url.searchParams.set('key', API_KEY);

  const response = await window.fetch(url.toString(), config);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function loadCSS (href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

export { loadCSS };
export default class {
    constructor(params) {
        this.params = params;
    }

    setTitle(title) {
        document.title = `(사)부천YWCA | ${title}`;
    }

    async beforeRender() {}

    async render() { return ''; }

    async rendered() {}
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://docs.microsoft.com/en-us/rest/api/azure/devops/wiki/wikis?view=azure-devops-rest-5.0
class WikiApiService {
    constructor(client) {
        this.client = client;
    }
    create(wikiId, data, params) {
        return this.client.put(`/wiki/wikis/${wikiId}/pages`, data, {
            params
        });
    }
    update(wikiId, versionEtag, data, params) {
        return this.client.put(`/wiki/wikis/${wikiId}/pages`, data, {
            params,
            headers: {
                'If-Match': versionEtag
            }
        });
    }
    list() {
        return this.client.get('/wiki/wikis');
    }
    get(wikiId, params = {}) {
        return this.client.get(`/wiki/wikis/${wikiId}/pages`, {
            params
        });
    }
}
exports.WikiApiService = WikiApiService;

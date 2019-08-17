import { AxiosInstance } from 'axios';

// https://docs.microsoft.com/en-us/rest/api/azure/devops/wiki/wikis?view=azure-devops-rest-5.0
export class WikiApiService {
  constructor(readonly client: AxiosInstance) {}

  create(
    wikiId: string,
    data: {
      content: string;
    },
    params: {
      path: string;
    }
  ) {
    return this.client.put(`/wiki/wikis/${wikiId}/pages`, data, {
      params
    });
  }

  update(
    wikiId: string,
    versionEtag: string,
    data: {
      content: string;
    },
    params: {
      path: string;
    }
  ) {
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

  get(
    wikiId: string,
    params: {
      path?: string;
    } = {}
  ) {
    return this.client.get(`/wiki/wikis/${wikiId}/pages`, {
      params
    });
  }
}

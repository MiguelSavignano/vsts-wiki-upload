import fs from "fs";
import * as walk from "fs-walk";
import * as _ from "lodash";
import { AxiosInstance } from "axios";
import { createClient } from "./createClient";

export class WikiUploadFileService {
  filePath: string;
  absolutePath: string;
  wikiId?: string;
  client: AxiosInstance;

  constructor({
    organizationName,
    projectName,
    apiToken,
    filePath,
    wikiId = null
  }) {
    this.filePath = filePath;
    this.absolutePath = this.getAbsolutePath(this.filePath);
    this.wikiId = wikiId;
    this.client = createClient({
      organizationName,
      projectName,
      apiToken
    });
  }

  getAbsolutePath(filePath) {
    if (filePath[0] == "/") {
      const pathParts = filePath.split("/");
      pathParts.pop();
      return `${pathParts.join("/")}/`;
    } else {
      return "./";
    }
  }

  async run() {
    await this.setWikiMasterId();
    if (fs.lstatSync(this.filePath).isDirectory()) {
      this.uploadFolder(this.filePath);
    } else {
      await this.uploadSingleFile(this.filePath);
    }
  }

  async uploadFolder(folderPath) {
    const subFolders = this.getSubfoldersForFolder(folderPath);
    await this.createSubfolders(subFolders);

    const filesPath = this.listFolderItems(folderPath);
    for (let i = 0; i < filesPath.length; i++) {
      try {
        await this.uploadSingleFile(filesPath[i]);
      } catch (err) {
        console.error("ERROR [uploadSingleFile]", err);
      }
    }
  }

  async uploadSingleFile(filePath) {
    const wikiPath = this.getwikiPath(filePath);

    return new Promise((resolve, reject) => {
      this.getPageVersion(wikiPath)
        .then(versionEtag => {
          this.updateFile({ filePath, wikiPath, versionEtag }).then(resolve);
        })
        .catch(() => {
          this.createFile({ filePath, wikiPath })
            .then(resolve)
            .catch(error => {
              const response = error.response;
              if (
                response.data.typeKey === "WikiAncestorPageNotFoundException"
              ) {
                const subFolders = this.getSubfoldersForFile(filePath);
                this.createSubfolders(subFolders).then(response => {
                  this.createFile({ filePath, wikiPath });
                });
              }
            });
        });
    });
  }

  async createSubfolders(subfolders) {
    // promiseSeries
    for (let i = 0; i < subfolders.length; i++) {
      try {
        let r = await this.createFolder(subfolders[i]);
      } catch {}
    }
  }

  listFolderItems(folderPath) {
    const items = [];
    walk.walkSync(folderPath, (basedir, filename, stat, next) => {
      if (stat.isDirectory()) return false;
      if (this.absolutePath == "./") {
        items.push(`${this.absolutePath}${basedir}/${filename}`);
      } else {
        items.push(`${basedir}/${filename}`);
      }
    });
    return items;
  }

  getSubfoldersForFile(filePath = "") {
    const folders = filePath.split("/").filter((it, index, array) => {
      if (index == 0 || index == array.length - 1) return false;
      return true;
    });
    return folders.reduce((memo, it, index, array) => {
      if (index == 0) {
        memo.push(it);
      } else {
        const joinPath = `${memo.reverse()[0]}/${it}`;
        memo.push(joinPath);
      }
      return memo;
    }, []);
  }

  getSubfoldersForFolder(filePath = "") {
    const subFoldersPath = [];
    walk.walkSync(filePath, (basedir, filename, stat, next) => {
      subFoldersPath.push(basedir.replace(this.absolutePath, ""));
    });
    return _.uniq(subFoldersPath);
  }

  async createFolder(wikiPath) {
    return this.client.put(
      `/wiki/wikis/${this.wikiId}/pages`,
      { content: "" },
      {
        params: {
          path: wikiPath
        }
      }
    );
  }

  async updateFile({ filePath, wikiPath, versionEtag }) {
    const content = fs.readFileSync(filePath, "utf8");
    await this.client.put(
      `/wiki/wikis/${this.wikiId}/pages`,
      { content },
      {
        params: {
          path: wikiPath
        },
        headers: {
          "If-Match": versionEtag
        }
      }
    );
  }

  async createFile({ filePath, wikiPath }) {
    const content = fs.readFileSync(filePath, "utf8");
    await this.client.put(
      `/wiki/wikis/${this.wikiId}/pages`,
      { content },
      {
        params: {
          path: wikiPath
        }
      }
    );
  }

  async getPageVersion(wikiPath) {
    const response = await this.client.get(`/wiki/wikis/${this.wikiId}/pages`, {
      params: {
        path: wikiPath
      }
    });
    return response.headers.etag;
  }

  async listWikis() {
    return this.client.get("/wiki/wikis");
  }

  async setWikiMasterId() {
    if (this.wikiId) return this.wikiId;
    const response = await this.listWikis();
    const masterWiki = response.data.value.find(it => it.type == "projectWiki");
    this.wikiId = masterWiki.id;
  }

  // private
  getwikiPath(filePath) {
    return filePath.replace(this.absolutePath, "");
  }
}

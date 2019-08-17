"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const walk = __importStar(require("fs-walk"));
const _ = __importStar(require("lodash"));
const createClient_1 = require("./createClient");
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
                "If-Match": versionEtag
            }
        });
    }
    list() {
        return this.client.get("/wiki/wikis");
    }
    get(wikiId, params = {}) {
        return this.client.get(`/wiki/wikis/${wikiId}/pages`, {
            params
        });
    }
}
class WikiUploadFileService {
    constructor({ organizationName, projectName, apiToken, filePath, wikiId = null }) {
        this.filePath = filePath;
        this.absolutePath = this.getAbsolutePath(this.filePath);
        this.wikiId = wikiId;
        this.client = createClient_1.createClient({
            organizationName,
            projectName,
            apiToken
        });
        this.wikiService = new WikiApiService(this.client);
    }
    getAbsolutePath(filePath) {
        if (filePath[0] == "/") {
            const pathParts = filePath.split("/");
            pathParts.pop();
            return `${pathParts.join("/")}/`;
        }
        else {
            return "./";
        }
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setWikiMasterId();
            if (fs_1.default.lstatSync(this.filePath).isDirectory()) {
                this.uploadFolder(this.filePath);
            }
            else {
                yield this.uploadSingleFile(this.filePath);
            }
        });
    }
    uploadFolder(folderPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const subFolders = this.getSubfoldersForFolder(folderPath);
            yield this.createSubfolders(subFolders);
            const filesPath = this.listFolderItems(folderPath);
            for (let i = 0; i < filesPath.length; i++) {
                try {
                    yield this.uploadSingleFile(filesPath[i]);
                }
                catch (err) {
                    console.error("ERROR [uploadSingleFile]", err);
                }
            }
        });
    }
    uploadSingleFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        if (response.data.typeKey === "WikiAncestorPageNotFoundException") {
                            const subFolders = this.getSubfoldersForFile(filePath);
                            this.createSubfolders(subFolders).then(response => {
                                this.createFile({ filePath, wikiPath });
                            });
                        }
                    });
                });
            });
        });
    }
    createSubfolders(subfolders) {
        return __awaiter(this, void 0, void 0, function* () {
            // promiseSeries
            for (let i = 0; i < subfolders.length; i++) {
                try {
                    let r = yield this.createFolder(subfolders[i]);
                }
                catch (_a) { }
            }
        });
    }
    listFolderItems(folderPath) {
        const items = [];
        walk.walkSync(folderPath, (basedir, filename, stat, next) => {
            if (stat.isDirectory())
                return false;
            if (this.absolutePath == "./") {
                items.push(`${this.absolutePath}${basedir}/${filename}`);
            }
            else {
                items.push(`${basedir}/${filename}`);
            }
        });
        return items;
    }
    getSubfoldersForFile(filePath = "") {
        const folders = filePath.split("/").filter((it, index, array) => {
            if (index == 0 || index == array.length - 1)
                return false;
            return true;
        });
        return folders.reduce((memo, it, index, array) => {
            if (index == 0) {
                memo.push(it);
            }
            else {
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
    createFolder(wikiPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.put(`/wiki/wikis/${this.wikiId}/pages`, { content: "" }, {
                params: {
                    path: wikiPath
                }
            });
        });
    }
    updateFile({ filePath, wikiPath, versionEtag }) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = fs_1.default.readFileSync(filePath, "utf8");
            yield this.wikiService.update(this.wikiId, versionEtag, { content }, { path: wikiPath });
        });
    }
    createFile({ filePath, wikiPath }) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = fs_1.default.readFileSync(filePath, "utf8");
            yield this.client.put(`/wiki/wikis/${this.wikiId}/pages`, { content }, {
                params: {
                    path: wikiPath
                }
            });
        });
    }
    getPageVersion(wikiPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.wikiService.get(this.wikiId, {
                path: wikiPath
            });
            return response.headers.etag;
        });
    }
    listWikis() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wikiService.list();
        });
    }
    setWikiMasterId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.wikiId)
                return this.wikiId;
            const response = yield this.listWikis();
            const masterWiki = response.data.value.find(it => it.type == "projectWiki");
            this.wikiId = masterWiki.id;
        });
    }
    // private
    getwikiPath(filePath) {
        return filePath.replace(this.absolutePath, "");
    }
}
exports.WikiUploadFileService = WikiUploadFileService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
exports.createClient = ({ organizationName, projectName, apiToken }) => {
    const client = axios_1.default.create({
        baseURL: `https://dev.azure.com/${organizationName}/${projectName}/_apis/`,
        auth: { username: organizationName, password: apiToken },
        headers: {
            "Content-Type": "application/json"
        }
    });
    client.interceptors.response.use(function (response) {
        console.log(response.status);
        return response;
    }, function (error) {
        const response = error.response;
        console.error(`[${response.status}][${response.data.typeKey}] ${response.data.message}`);
        return Promise.reject(error);
    });
    client.defaults.params = { "api-version": "5.0" };
    return client;
};

const axios = require("axios").default;

const createClient = ({ organizationName, projectName, apiToken }) => {
  const client = axios.create({
    baseURL: `https://dev.azure.com/${organizationName}/${projectName}/_apis/`,
    auth: { username: organizationName, password: apiToken },
    headers: {
      "Content-Type": "application/json"
    }
  });
  client.interceptors.response.use(
    function(response) {
      console.log(response.status);
      return response;
    },
    function(error) {
      const response = error.response;
      console.error(
        `[${response.status}][${response.data.typeKey}] ${response.data.message}`
      );
      return Promise.reject(error);
    }
  );
  client.defaults.params = { "api-version": "5.0" };
  return client;
};
exports.createClient = createClient;

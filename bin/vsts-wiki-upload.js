#! /usr/bin/env node
const { WikiUploadFileService } = require("./dist/index");
const argv = require("minimist")(process.argv.slice(2));
const inputs = {
  organizationName: argv.organization,
  projectName: argv.project,
  wikiId: argv.wikiId,
  apiToken: argv.apiToken,
  absolutePath: argv.absolutePath,
  filePath: argv._[argv._.length - 1]
};

new WikiUploadFileService(inputs).run();

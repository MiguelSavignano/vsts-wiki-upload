# vsts-wiki-upload

Upload files to VSTS wiki using the oficial [API](https://docs.microsoft.com/en-us/rest/api/azure/devops/wiki/pages?view=azure-devops-rest-5.0)

[![Build status](https://dev.azure.com/miguel-savignano/npm-vsts-wiki-upload/_apis/build/status/Build-Lint-Test)](https://dev.azure.com/miguel-savignano/npm-vsts-wiki-upload/_build/latest?definitionId=3)
[![Maintainability](https://api.codeclimate.com/v1/badges/afca14851593c6e017fa/maintainability)](https://codeclimate.com/github/MiguelSavignano/vsts-wiki-upload/maintainability)[![Test Coverage](https://api.codeclimate.com/v1/badges/afca14851593c6e017fa/test_coverage)](https://codeclimate.com/github/MiguelSavignano/vsts-wiki-upload/test_coverage)

## Install

```
npm install vsts-wiki-upload --save
```

## Usage

- All files in folder

```
npx vsts-wiki-upload \
  --organization=$ORGANIZATION \
  --project=$PROJECT \
  --wikiId=$WIKI_ID \
  --apiToken=$API_TOKEN \
  ./docs
```

- Single file

```
npx vsts-wiki-upload \
  --organization=$ORGANIZATION \
  --project=$PROJECT \
  --wikiId=$WIKI_ID \
  --apiToken=$API_TOKEN \
  ./README.md
```

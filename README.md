# vsts-wiki-upload

Upload files to VSTS wiki using the oficial [API](https://docs.microsoft.com/en-us/rest/api/azure/devops/wiki/pages?view=azure-devops-rest-5.0)

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

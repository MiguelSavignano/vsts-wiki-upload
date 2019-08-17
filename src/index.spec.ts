const { WikiUploadFileService } = require('./index');

const wikiUploadFileServiceFactory = (values = {}) => {
  return new WikiUploadFileService({
    organizationName: 'organizationName',
    projectName: 'projectName',
    wikiId: 'wikiId',
    apiToken: 'apiToken',
    filePath: './examples',
    ...values
  });
};

describe('WikiUploadFileService', () => {
  let subject;
  const absolutePath =
    '/home/miguelsavignano/developer/javascript/npm/vsts-wiki-upload/';

  beforeEach(() => {
    subject = wikiUploadFileServiceFactory();
  });

  it('#getAbsolutePath', () => {
    subject = wikiUploadFileServiceFactory();
    expect(subject.getAbsolutePath(`${absolutePath}examples`)).toEqual(
      absolutePath
    );
  });

  it('#getwikiPath', () => {
    subject = wikiUploadFileServiceFactory();
    expect(subject.getwikiPath('./examples')).toEqual('examples');
  });

  it('#getwikiPath absolutePath', () => {
    subject = wikiUploadFileServiceFactory({
      filePath: `${absolutePath}examples/a/example.md`
    });
    expect(subject.absolutePath).toEqual(`${absolutePath}examples/a/`);
    expect(subject.getwikiPath(`${absolutePath}examples/a/example.md`)).toEqual(
      'example.md'
    );
  });

  it('#getSubfoldersForFile', () => {
    expect(subject.getSubfoldersForFile('./examples/a/example.md')).toEqual([
      'examples',
      'examples/a'
    ]);
  });

  it('#getSubfoldersForFolder', () => {
    expect(subject.getSubfoldersForFolder('./examples')).toEqual([
      'examples',
      'examples/a',
      'examples/b'
    ]);
  });

  it('#listFolderItems absolutePath', () => {
    subject = wikiUploadFileServiceFactory({
      filePath: `${absolutePath}examples/a/example.md`
    });
    expect(subject.listFolderItems(`${absolutePath}examples`)).toEqual([
      `${absolutePath}examples/a/example.md`,
      `${absolutePath}examples/a/swagger.md`,
      `${absolutePath}examples/b/example1.md`
    ]);
  });

  it('#listFolderItems', () => {
    expect(subject.listFolderItems('./examples')).toEqual([
      './examples/a/example.md',
      './examples/a/swagger.md',
      './examples/b/example1.md'
    ]);
  });
});

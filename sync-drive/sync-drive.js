require('dotenv').config();
const { google } = require('googleapis');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const FOLDERS = {
  'band-members':      '1dObpofg0yBJRUtDe980Q8hobgikoL3bm',
  'behind-the-scenes': '124FpMQAkvQB8VS-6PiozbuWI_bHq7lFx',
  'history':           '1OxcKLIXcixi8wge4IV4sNcQcpywS7Yb9',
  'other':             '1fFTInBbtqXGATvR3eUnhNIv9AhII6r9j',
  'promo':             '1o9E8x-HCanL5SvXdSPgH1u2k0J6dh35z',
  'shows':             '1b0cgSSOQD-ndumjgmIdMlqv8V35qXInB'
};

const OWNER = process.env.GITHUB_OWNER;
const REPO  = process.env.GITHUB_REPO;

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  return google.drive({ version: 'v3', auth });
}

async function listDriveFiles(drive, folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 100
  });
  return res.data.files || [];
}

async function getGithubFiles(folder) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO,
      path: `photos/${folder}`
    });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

async function uploadToGithub(folder, filename, content) {
  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO,
      path: `photos/${folder}/${filename}`
    });
    sha = data.sha;
  } catch (e) {}

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path: `photos/${folder}/${filename}`,
    message: `Sync: update ${folder}/${filename}`,
    content: content.toString('base64'),
    ...(sha ? { sha } : {})
  });
  console.log(`Uploaded: photos/${folder}/${filename}`);
}

async function deleteFromGithub(folder, filename, sha) {
  await octokit.repos.deleteFile({
    owner: OWNER, repo: REPO,
    path: `photos/${folder}/${filename}`,
    message: `Sync: remove ${folder}/${filename}`,
    sha
  });
  console.log(`Deleted: photos/${folder}/${filename}`);
}

async function syncFolder(drive, folderName, folderId) {
  console.log(`\nSyncing ${folderName}...`);
  const driveFiles = await listDriveFiles(drive, folderId);
  const githubFiles = await getGithubFiles(folderName);

  const driveNames = new Set(driveFiles.map(f => f.name));
  const githubMap = {};
  for (const f of githubFiles) githubMap[f.name] = f.sha;

  // Upload new files from Drive to GitHub
  for (const file of driveFiles) {
    if (!githubMap[file.name]) {
      const res = await drive.files.get(
        { fileId: file.id, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      await uploadToGithub(folderName, file.name, Buffer.from(res.data));
    }
  }

  // Delete files from GitHub that are no longer in Drive
  for (const file of githubFiles) {
    if (!driveNames.has(file.name)) {
      await deleteFromGithub(folderName, file.name, file.sha);
    }
  }

  // Return the current list of files for the manifest
  return driveFiles.map(f => `photos/${folderName}/${f.name}`);
}

async function updateManifest(manifest) {
  const content = JSON.stringify(manifest, null, 2);
  let sha;
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER, repo: REPO,
      path: 'photos/manifest.json'
    });
    sha = data.sha;
  } catch (e) {}

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO,
    path: 'photos/manifest.json',
    message: 'Sync: update photo manifest',
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {})
  });
  console.log('\nManifest updated in GitHub.');
}

async function main() {
  console.log('Starting BDD Drive → GitHub sync...');
  const drive = await getDriveClient();
  const manifest = {};

  for (const [folderName, folderId] of Object.entries(FOLDERS)) {
    manifest[folderName] = await syncFolder(drive, folderName, folderId);
  }

  await updateManifest(manifest);
  console.log('\nSync complete!');
}

main().catch(console.error);

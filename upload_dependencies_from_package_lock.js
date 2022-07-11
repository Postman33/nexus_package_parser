const { exec } = require('child_process');
const semver = require('semver');
const fs = require('fs');
const url = require("url");
const path = require("path");
const httpsDownloadFile = require('./https_download_file');

const day24Feb = new Date('2022-02-23T00:00:00');

function executeExternalCommand(command) {
  return new Promise((done, failed)=> {
    exec(command, null, function (error, stdout, stderr) {
      if (error) {
        failed(stdout)
      }
      else done(stdout);
    })
  });
}

// Parsed a scoped package name into name, version, and path.
const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/
// Parsed a non-scoped package name into name, version, path
const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/

function parsePackageName(input) {
  const m = RE_SCOPED.exec(input) || RE_NON_SCOPED.exec(input)

  if (!m) {
    throw new Error(`[parse-package-name] invalid package name: ${input}`)
  }

  return {
    name: m[1] || '',
    version: m[2] || 'latest',
    path: m[3] || '',
  }
}

const dependenciesDirectory = './dependencies_to_upload';
if (!fs.existsSync(dependenciesDirectory)){
  fs.mkdirSync(dependenciesDirectory);
}

function installMissingDependenciesRec() {

  let dependencyNameWithVersion = null;
  let package = null;
  let dependencyFileRelativePath = null;

  return executeExternalCommand('npm i --json').then(
      (installJsonStr) => {

      }, (installJsonError) => {
        let installJson = JSON.parse(installJsonError);
        if (installJson.error && installJson.error.code === 'ETARGET') {
          let errorSummary = installJson.error.summary;
          console.log(errorSummary);
          let errorPrefix = 'No matching version found for ';
          let postfix = '.'
          if (errorSummary.startsWith(errorPrefix)&& errorSummary.endsWith(postfix)) {
            let library = errorSummary.replace(errorPrefix, '');
            library = library.substring(0, library.length - postfix.length);
            package = parsePackageName(library);
            return package;
          }
        }
        else if(installJson.error && installJson.error.code === 'E404'){
          let errorDetails = installJson.error.detail;
          console.log(errorDetails);
          let libPrefixPart = "'";
          let libPostfixPart = "' is not in the npm registry."

          let prefixIdx = errorDetails.indexOf(libPrefixPart);
          let postfixIdx = errorDetails.indexOf(libPostfixPart);

          if(prefixIdx >=0 && postfixIdx >=0 && prefixIdx < postfixIdx){
            let library = errorDetails.substring(
                prefixIdx + libPrefixPart.length,
                postfixIdx
            );
            package = parsePackageName(library);
            return package;
          }
        }
      }).then(() => {
    if (package) {
      fs.renameSync('.npmrc', '.npmrc-renamed');
      return executeExternalCommand(
          `npm view ${package.name} time --json`);
    }
  }).then((versionsJSON) => {
    try{
      fs.renameSync('.npmrc-renamed', '.npmrc');
    }
    catch{}
    if (versionsJSON) {
      let json = undefined
      try {
        json = JSON.parse(versionsJSON);
      } catch (e) {
        console.log('\x1b[31m%s\x1b[0m', `Failed to parse release dates for package ${package.name}`);
        console.log(versionsJSON);
        return;
      }

      let suitableVersions = [];

      let versionsToIgnore = ['created', 'modified'];

      for(let curVersion in json){
        let curVersionReleaseDate = new Date(json[curVersion]);

        if (curVersionReleaseDate < day24Feb && !versionsToIgnore.includes(curVersion) && (
            semver.satisfies(curVersion, package.version) ||
            curVersion.startsWith(package.version) ||
            package.version === 'latest')) {
          suitableVersions.push({version: curVersion, date: curVersionReleaseDate});
        }
      }

      if(suitableVersions.length !== 0) {
        suitableVersions.sort(function (d1, d2) {
          return d2.date.getTime() - d1.date.getTime();
        });

        let exactVersion = suitableVersions[0].version;

        dependencyNameWithVersion = `${package.name}@${exactVersion}`;
        console.log(`Need to install package ${dependencyNameWithVersion}...`);

        fs.renameSync('.npmrc', '.npmrc-renamed');
        return executeExternalCommand(
            `npm view ${dependencyNameWithVersion} dist.tarball`);
      }
      else{
        console.log('\x1b[31m%s\x1b[0m', `No version for package ${package.name} released before 24 feb found. Skipped.`);
      }
    }
  }).then((result) => {
    try{
      fs.renameSync('.npmrc-renamed', '.npmrc');
    }
    catch{}
    if (result) {
      console.log(`Downloading package ${dependencyNameWithVersion}...`);
      let packageDownloadUrl = result;
      let parsedUrl = url.parse(packageDownloadUrl);
      let fileName = path.basename(parsedUrl.pathname);

      dependencyFileRelativePath = `${dependenciesDirectory}/${fileName}`;

      if (!fs.existsSync(dependencyFileRelativePath)) {
        return httpsDownloadFile.do(packageDownloadUrl, dependencyFileRelativePath);
      }
    }
  }).then(() => {
    console.log(`Uploading package ${dependencyNameWithVersion}...`);
    let args = ` -s -u deployer:XETm2ZyzRpjc -X 'POST' 'https://builder.reinform-int.ru/nexus/service/rest/v1/components?repository=npm-dev-hosted' -H 'accept: application/json' -H 'Content-Type: multipart/form-data' -F 'npm.asset=@${dependencyFileRelativePath};type=application/x-compressed-tar'`;

    return executeExternalCommand('curl ' + args);
  }).then(() => {
    console.log(`Upload ${dependencyNameWithVersion} Completed.`);
    return installMissingDependenciesRec();
  }, (error) => {
    console.log('\x1b[31m%s\x1b[0m', `Failed to upload package ${dependencyNameWithVersion}`);
    console.log('\x1b[31m%s\x1b[0m', error);
  });
}

installMissingDependenciesRec();

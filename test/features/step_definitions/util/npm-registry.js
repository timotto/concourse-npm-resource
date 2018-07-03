const { promisify } = require('util');
const fs = require('fs-extra');
const path = require('path');
const tar = require('tar')
const RegClient = require('npm-registry-client')
const Readable = require('stream').Readable;

const request = require('request');
request.delete = promisify(request.delete);
request.get = promisify(request.get);

const regClient = new RegClient();
regClient.get = promisify(regClient.get);
regClient.unpublish = promisify(regClient.unpublish);
regClient.publish = promisify(regClient.publish);

const inventPackage = async (tempDirectory, packageName, version) =>
    fs.writeFile(path.join(tempDirectory, 'package.json'), JSON.stringify({ name: packageName, version }))
        .then(() => fs.writeFile(path.join(tempDirectory, 'README.md'), 'this package is the result of a step in a test automation setup'))
        .then(() => ['package.json', 'README.md']);

const publishInventedPackage = async (tempDirectory, registry, token, packageName, version) =>
    inventPackage(tempDirectory, packageName, version)
        .then(files => regClient.publish(packageUrl(registry, packageName), {
            metadata: {
                "name": packageName.split('/').reduce((p, c, i, a) => a[a.length - 1]),
                "version": version
            },
            access: 'public',
            body: new Readable().wrap(tar.c({
                gzip: true,
                cwd: tempDirectory
            }, files)),
            ...requestOptions(token)
        }));

const packageUrl = (registry, packageName) => `${registry}${packageName}`;

const requestOptions = token => ({ auth: { token }, alwaysAuth: true });

const getPackageVersions = async (registry, token, packageName) =>
    regClient.get(packageUrl(registry, packageName), requestOptions(token))
        .then(response => Object.keys(response.versions))
        .catch(() => []);

const ensurePackageVersionNotAvailable = async (registry, token, packageName, packageVersion) =>
    getPackageVersions(registry, token, packageName)
        .then(versions => versions.filter(version => version === packageVersion))
        .then(versions => versions.map(async version => unpublish(registry, token, packageName, version)))
        .then(promises => Promise.all(promises))

const unpublishReal = async (registry, token, packageName, version) =>
    regClient.unpublish(
        packageUrl(registry, packageName),
        { version, ...requestOptions(token) });

const getNexusRequestOptions = (url, token) =>
    ({ url, headers: { Authorization: `Bearer ${token}` } });

const unpublishNexusWorkaround_tooWrong = async (registry, token, packageName, version) =>
    request.delete(getNexusRequestOptions(`${packageUrl(registry, packageName)}/-/${packageName}-${version}.tgz`, token))
        .then(result => {
            if ((result.statusCode >= 200 && result.statusCode < 300) || result.statusCode === 404)
                return result;
            throw `${result.statusCode} - ${result.body}`;
        });

const unpublishNexusWorkaround = async (registry, token, packageName, version) =>
    request.delete(getNexusRequestOptions(`${packageUrl(registry, packageName)}`, token))
        .then(result => {
            console.log(`Workaround for Sonatype Nexus 3.12 problems when unpublishing npm packages deleting ALL versions has status ${result.statusCode}`);
            if ((result.statusCode >= 200 && result.statusCode < 300) || result.statusCode === 404)
                return result;
            throw `${result.statusCode} - ${result.body}`;
        });

const unpublish = process.env['NEXUS_WORKAROUND'] === 'true'
    ? unpublishNexusWorkaround
    : unpublishReal;

const ensurePackageVersionAvailable = async (tempDirectory, registry, token, packageName, version) =>
    getPackageVersions(registry, token, packageName)
        .then(versions => versions.filter(v => v === version).length > 0)
        .then(async packagePresent => packagePresent ? true :
            publishInventedPackage(tempDirectory, registry, token, packageName, version));

module.exports = { ensurePackageVersionNotAvailable, ensurePackageVersionAvailable, inventPackage, getPackageVersions };

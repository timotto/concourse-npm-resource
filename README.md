# NPM Resource for Concourse

Concourse resource to fetch and publish NPM package to the public and private registries.

## Installing

Add the resource type to your pipeline:

```yaml
resource_types:
- name: npm
  type: docker-image
  source:
    repository: timotto/concourse-npm-resource
```

## Source Configuration

* `package`: *Required.* Package name.
* `scope`: *Optional.* Use `scope-name` as scope value instead of using `@scope-name/package-name` as package name.
* `registry.uri`: *Optional.* Registry containing the package, either a public mirror or a private registry. Defaults to `https://registry.npmjs.org/`.
* `registry.token`: *Optional.* Access credentials for the registry, use `npm login` on your machine and look for the `_authToken` value in your `~/.npmrc`.

## Behavior

### `check`: Check for new releases

The latest version of the package available using the source.list line is returned.

### `in`: Download the package

* `skip_download`: *Optional.* Do not download the package including dependencies, just save the version file.

### `out`: Publish the package

* `path`: *Required.* Path to the directory containing the `package.json` file.
* `version`: *Optional.* Path to a file containing the version, overrides the version stored in `package.json`.

## Example

### Trigger on new version

Define the resource:

```yaml
resources:
- name: jasmine
  type: npm
  check_every: 24h
  source:
    package: jasmine
    scope: @myorg
    registry:
      uri: https://private.registry.domain/some/path
      token: NpmToken.as-seen-in-HOME-.npmrc
```

Add to job:

```yaml
jobs:
  # ...
  plan:
  - get: jasmine
    trigger: true
```

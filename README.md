# NPM Resource for Concourse

Check NPM packages from [Concourse](https://concourse.ci/).

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
* `registry.uri`: *Optional.* Registry containing the package.
* `registry.token`: *Optional.* Access credentials for the registry.
* `registry.scope`: *Optional.* Limit registry to a single scope.

## Behavior

### `check`: Check for new releases

The latest version of the package available using the source.list line are returned.

### `in`: Not supported.

### `out`: Not supported.

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
    registry:
      uri: https://private.registry.domain/some/path
      token: NpmToken.as-seen-in-HOME-.npmrc
      scope: @myorg
```

Add to job:

```yaml
jobs:
  # ...
  plan:
  - get: jasmine
    trigger: true
```

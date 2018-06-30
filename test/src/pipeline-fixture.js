const sourceDefinition = (packageName, scope = undefined, registry = undefined) => ({
  name: `test-resource-${packageName}`,
  type: 'npm',
  source: {
    package: packageName,
    scope,
    registry
  }
});

module.exports = {sourceDefinition};

const sourceDefinition = (packageName, scope = undefined, registry = undefined) => ({
  package: packageName,
  scope,
  registry
});

module.exports = { sourceDefinition };

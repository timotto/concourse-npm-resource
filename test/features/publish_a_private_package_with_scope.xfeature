Feature: Publish a private package

  The scope of a package is part of the package.json "name" property. 
  In the Concourse resource definition scope and package name are two different properties.

  Background: Private registry with an existing package

    Given a source configuration for private package "publish-test" scope "test" with correct credentials
    # While the Nexus workaround is required, because the workaround deletes ALL versions,
    # the order of the following statements must always be "no package" before "a package"
    And the registry has no package "publish-test-fail" available in version "1.2.3"
    And the registry has no package "publish-test" available in version "1.2.3"
    And the registry has no package "publish-test" available in version "1.2.4"
    And the registry has no package "@test/publish-test-fail" available in version "1.2.3"
    And the registry has no package "@test/publish-test" available in version "1.2.3"
    And the registry has no package "@test/publish-test" available in version "1.2.4"
    But the registry has a package "@test/publish-test" available in version "1.2.2"

  Scenario: Uploading a package to a private registry with scope

    Given I have a put step with params package: "@test/publish-test"
    And I have valid npm package source code for package "@test/publish-test" with version "1.2.3"
    When the package is published
    Then version "1.2.3" is returned
    And there should be a package "@test/publish-test" available with version "1.2.3" in the registry

  Scenario: Uploading a package to a private registry with scope using explicit version definition

    Given I have a put step with params package: "@test/publish-test" and delete: false and version: "1.2.4"
    And I have valid npm package source code for package "@test/publish-test" with version "1.2.3"
    When the package is published
    Then version "1.2.4" is returned
    And there should be a package "@test/publish-test" available with version "1.2.4" in the registry
    But there should be no package "@test/publish-test" available with version "1.2.3" in the registry

  Scenario: Uploading a package to a private registry with scope with version conflicts fails

    The source code of the package defines the published version using the package.json file.
    There is no automatic bumping in this resource, the defined version is published and errors are forwarded.

    Given I have a put step with params package: "@test/publish-test"
    And I have valid npm package source code for package "@test/publish-test" with version "1.2.2"
    When the package is published
    Then an error is returned
    And there should be no package "@test/publish-test" available with version "1.2.3" in the registry

  Scenario: Uploading a package to a private registry with scope requires matching package name in package.json and Concourse resource definition

    Given I have a put step with params package: "@test/publish-test"
    And I have valid npm package source code for package "@test/publish-test-fail" with version "1.2.3"
    When the package is published
    Then an error is returned
    And there should be no package "@test/publish-test-fail" available with version "1.2.3" in the registry

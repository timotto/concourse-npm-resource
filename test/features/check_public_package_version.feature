Feature: Check a public package version.

  Checking a package returns the version queried from the registry.
  The public package registry does not require authentication or configuration.

  Scenario: Checking an existing package "package"

    Given a source configuration for package "package"
    When the resource is checked
    Then version "1.0.1" is returned

  Scenario: Checking an existing package "static"

    Given a source configuration for package "static"
    When the resource is checked
    Then version "2.0.0" is returned

  Scenario: Checking a not existing package returns an error

    Given a source configuration for package "does not exist"
    When the resource is checked
    Then an error is returned

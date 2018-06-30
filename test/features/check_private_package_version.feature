Feature: Check a private package version.

  Checking a package returns the version queried from the registry.
  The private package registry requires authentication and credentials.

  Scenario: Checking an existing package
    
    Given a source configuration for private package "@tym/dummy-module" with correct credentials
    When the resource is checked
    Then version "1.1.9-alpha.1" is returned

  Scenario: Checking an non-existing package
    
    Given a source configuration for private package "does-not-exist" with correct credentials
    When the resource is checked
    Then an error is returned

  Scenario: Checking an existing package with bad credentials
    
    Given a source configuration for private package "@tym/dummy-module" with incorrect credentials
    When the resource is checked
    Then an error is returned

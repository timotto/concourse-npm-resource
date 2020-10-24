Feature: Check a private package version.

  Checking a package returns the version queried from the registry.
  The private package registry requires authentication and credentials.

  Scenario: Checking an existing private package
    
    Given the registry has a package "check-test" available in version "1.1.9"
    And a source configuration for private package "check-test" with correct credentials
    When the resource is checked
    Then version "1.1.9" is returned

  Scenario: Checking an existing private package with scope
    
    Given the registry has a package "@test/check-test" available in version "1.1.9"
    And a source configuration for private package "check-test" scope "test" with correct credentials
    When the resource is checked
    Then version "1.1.9" is returned

  Scenario: Checking an non-existing private package
    
    Given a source configuration for private package "does-not-exist" with correct credentials
    When the resource is checked
    Then an error is returned

  Scenario: Checking an existing private package with bad credentials
    
    Given the registry has a package "check-test" available in version "1.1.9"
    And a source configuration for private package "check-test" with incorrect credentials
    When the resource is checked
    Then an error is returned

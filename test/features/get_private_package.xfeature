Feature: Get packages from private registries

  Get on the resource causes the version to be stored, as well as the package with all the dependencies.
  The actual download can be disabled.

  Background: There is a package in a specific version in the private registry

    Given a source configuration for private package "private-package" with correct credentials
    And the registry has no package "private-package" available in version "1.1.0"
    But the registry has a package "private-package" available in version "1.2.3"

  Scenario: Get a private package
    
    Given a get step with skip_download: false params
    And a known version "1.2.3" for the resource
    When the resource is fetched
    Then the content of file "version" is "1.2.3"
    And the file "node_modules/private-package/package.json" does exist
    
  Scenario: Get a private package without download
    
    Given a get step with skip_download: true params
    And a known version "1.2.3" for the resource
    When the resource is fetched
    Then the content of file "version" is "1.2.3"
    And the file "node_modules/private-package/package.json" does not exist
    
  Scenario: Friendly error when a version does not exist
    
    And a get step with skip_download: false params
    And a known version "1.1.0" for the resource
    When the resource is fetched
    Then an error is returned
    And the file "version" does not exist
    
  Scenario: Friendly error when a version does not exist lower than a current version
    
    The package named "package" really exists, but it does not have a version "1.0.0".
    The resource is expected to not automatically get a more recent existing package.

    And a get step with skip_download: false params
    And a known version "1.0.0" for the resource
    When the resource is fetched
    Then an error is returned
    And the file "version" does not exist
    
    
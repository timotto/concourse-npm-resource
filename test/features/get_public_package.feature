Feature: Get a public package

  Get on the resource causes the version to be stored, as well as the package with all the dependencies.
  The actual download can be disabled.

  Scenario: Get a public package
    
    Given a source configuration for package "package"
    And a get step with skip_download: false params
    And a known version "1.0.1" for the resource
    When the resource is fetched
    Then the content of file "version" is "1.0.1"
    And the file "node_modules/package/package.json" does exist
    And the homedir file ".npmrc" does not exist
    
  Scenario: Get a public package without download
    
    Given a source configuration for package "package"
    And a get step with skip_download: true params
    And a known version "1.0.1" for the resource
    When the resource is fetched
    Then the content of file "version" is "1.0.1"
    And the file "node_modules/package/package.json" does not exist
    
  Scenario: Friendly error when a version does not exist
    
    The package named "package" really exists, but it does not have a version "1.2.3".

    Given a source configuration for package "package"
    And a get step with skip_download: false params
    And a known version "1.2.3" for the resource
    When the resource is fetched
    Then an error is returned
    And the file "version" does not exist
    
  Scenario: Friendly error when a version does not exist lower than a current version
    
    The package named "package" really exists, but it does not have a version "0.0.2".

    Given a source configuration for package "package"
    And a get step with skip_download: false params
    And a known version "0.0.2" for the resource
    When the resource is fetched
    Then an error is returned
    And the file "version" does not exist
    
    
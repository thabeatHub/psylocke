# Changelog
All notable changes to this project will be documented in this file.

The format is slightly based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). 
Basically MAJOR.MINOR.PATCH and types of Changes:

- Added for new features.
- Changed for changes in existing functionality.
- Deprecated for soon-to-be removed features.
- Removed for now removed features.
- Fixed for any bug fixes.
- Security in case of vulnerabilities.

## [Unreleased]

### Added
- Now jump command can tunnel ports
- (-s) option enters in an interactive list
- Now custom Role can be specified on the Clients Config with role_name
- Interactive list is searchable

### Fixed
- Region in SDK is retrieved from CLI config EXPLICITLY in jump command
- Dest_Port and Local_Port description now in help
- Help is not duplicated anymore

## v.1.0.1

### Added
- Command regions with minimal functionality: List Avaiilable, Set, Get
- Modules for commands
- TODO file
- Changelog File
- Add list instances at least per ID/Name
- Add filter to list capabilities (just per Name/Tag)
- Open Remote Console Automation

### Changed
- Global Config File Format: Added available regions
- Moved federate functions (default) to module

## v.1.0.0

Starting Repo
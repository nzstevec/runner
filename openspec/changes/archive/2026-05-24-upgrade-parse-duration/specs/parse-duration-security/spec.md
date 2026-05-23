## ADDED Requirements

### Requirement: parse-duration version constraint
The project's `parse-duration` dependency SHALL resolve to version `2.1.6` or higher to eliminate the high-severity vulnerability present in the `1.x` line.

#### Scenario: Secure version resolved at install time
- **WHEN** `npm install` is run against the updated `package.json`
- **THEN** the resolved version of `parse-duration` in `package-lock.json` SHALL be `>= 2.1.6`

#### Scenario: No regression in duration parsing
- **WHEN** a duration step runs with a valid duration string (e.g. `"500ms"`, `"2s"`, `"1m"`)
- **THEN** the step SHALL delay or time out for the correct number of milliseconds as it did before the upgrade

#### Scenario: Graceful handling of invalid duration strings
- **WHEN** a duration step is given an unparseable string
- **THEN** `parseDuration` SHALL return `null`, which is coerced to `undefined`, and the step SHALL use its default timeout behaviour

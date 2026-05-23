## Release Note

StepCI capture handling now includes support for JSON capture updates.

Highlights:

- Update existing keys in a captured JSON object.
- Add new keys to a captured JSON object.
- Use dot-notation paths only in the initial release.
- Reject array index updates and invalid traversal.
- Resolve update values with the normal StepCI templating context before storing the updated capture.

This capability is intended for flows that fetch a JSON payload, adjust selected fields, and reuse the updated object in a later step.

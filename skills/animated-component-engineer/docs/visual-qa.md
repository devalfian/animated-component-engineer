# Visual QA

## Manual QA matrix

| Check | Desktop | Mobile |
|---|---:|---:|
| Initial composition | [ ] | [ ] |
| Primary interaction | [ ] | [ ] |
| Focus and keyboard | [ ] | [ ] |
| Touch interaction | N/A | [ ] |
| Reduced motion | [ ] | [ ] |
| Overflow and clipping | [ ] | [ ] |
| Loading and error states | [ ] | [ ] |

## Technical checks

- Run the repository's lint, typecheck, and test scripts when available.
- Check browser console and network failures.
- Verify no animation continues unnecessarily after unmount.
- Confirm no content is inaccessible before an animation completes.
- Record any checks that could not be performed.

# Release Process

1. Update the root `VERSION` using semantic versioning.
2. Add a matching heading to root `CHANGELOG.md`.
3. Run `python scripts/validate_skill.py`.
4. Run `.\scripts\package-release.ps1` on Windows PowerShell.
5. Inspect `dist/animated-component-engineer.zip`.
6. Publish the ZIP and checksum file as GitHub Release assets.
7. Verify installation from the public repository with the Skills CLI.

The repository itself is the canonical source. The release ZIP is a portable distribution artifact.

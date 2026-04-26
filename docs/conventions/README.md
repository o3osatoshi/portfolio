# Conventions

This section collects monorepo-wide implementation conventions that are expected to stay stable across packages and apps.

These documents do not replace package-specific `README.md` files. They define shared rules that help keep design and code review decisions consistent across the repository.
They are also the canonical place to record newly agreed shared engineering rules when those rules should apply beyond the current package.

## Available guides

- [RichError Conventions](./rich-error.md)
- [HTTP Conventions](./http.md)
- [neverthrow Conventions](./neverthrow.md)

## Scope

- Use these guides for shared engineering rules.
- Update these guides in the same change when a monorepo-wide rule is introduced, clarified, or intentionally revised.
- Document durable principles and decision criteria here, not package-specific setup steps or one-off implementation notes.
- Keep package-specific setup, public APIs, and operational notes in the relevant package/app `README.md`.
- Consult only the guide that matches the concern you are changing or reviewing; do not load every convention file by default.

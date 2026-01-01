# pr-review

Review PR feedback from Tech Lead and apply changes.

## Steps

1. **Read PR feedback**:
   - Get current branch: `git branch --show-current`
   - Find open PR: `gh pr list --head <branch> --json number,url`
   - Read general comments: `gh pr view <number> --comments`
   - Read inline code comments: `gh api repos/softwarecrafters-io/elearning-core/pulls/<number>/comments`

2. **Review architecture rules** before making changes:
   - @.cursor/rules/architecture-domain-value-objects.mdc
   - @.cursor/rules/architecture-domain-entities.mdc
   - @.cursor/rules/architecture-domain-repositories.mdc
   - @.cursor/rules/architecture-application-usecases.mdc
   - @.cursor/rules/architecture-application-dtos.mdc
   - @.cursor/rules/design-naming.mdc
   - @.cursor/rules/design-functions.mdc
   - @.cursor/rules/design-classes-modules.mdc
   - @.cursor/rules/design-errors.mdc
   - @.cursor/rules/practices-testing.mdc
   - @.cursor/rules/practices-tdd.mdc

3. **Summarize feedback** received from Tech Lead

4. **Apply changes** following:
   - Architecture rules from step 2
   - Tech Lead comments from step 1
   - TDD practices (if changes require new tests)

5. **Commit and push** the fixes with appropriate commit message

If a PR number is provided (`pr-review #123`), use that number directly.

If Tech Lead mentions a specific file, line, or concern, focus on that area first while still reviewing all comments.


# pr-refactor

Review current PR and apply refactoring rules to all changed files.

## Steps

1. **Get PR changed files**:
   - Get current branch: `git branch --show-current`
   - Find open PR: `gh pr list --head <branch> --json number`
   - Get changed files: `gh pr diff <number> --name-only`

2. **Review rules** before refactoring:
   - @.cursor/rules/design-naming.mdc
   - @.cursor/rules/design-functions.mdc
   - @.cursor/rules/design-classes-modules.mdc
   - @.cursor/rules/practices-testing.mdc

3. **For each changed file**:
   - Test files: apply @.cursor/commands/refactor-tests.md
   - Production files: apply @.cursor/commands/refactor.md

4. **Run tests**: `npm test`

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "refactor: apply code quality improvements"
   git push
   ```


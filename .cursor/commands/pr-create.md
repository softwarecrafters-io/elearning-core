# pr-create

Create a Pull Request for the current branch.

## Steps

1. **Verify branch** is not `master`:
   ```bash
   git branch --show-current
   ```

2. **Push branch** to origin (hooks will validate):
   ```bash
   git push -u origin <branch>
   ```

3. **Determine PR type** from branch name:
   - `feat/...` → title prefix `feat:`
   - `fix/...` → title prefix `fix:`
   - `refactor/...` → title prefix `refactor:`
   - `docs/...` → title prefix `docs:`
   - `chore/...` → title prefix `chore:`

4. **Create PR** with reviewer:
   ```bash
   gh pr create --base master --title "<type>: <description>" --body "<detailed description>" --reviewer softwarecrafters-io
   ```

5. **Report PR URL** to Tech Lead

If a description is provided (`pr-create add user authentication`), use it in the title.


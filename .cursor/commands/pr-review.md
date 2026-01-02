# pr-review

Review PR feedback, apply fixes, and resolve conversations.

## Steps

1. **Get PR info**:
   ```bash
   git branch --show-current
   gh pr list --head <branch> --json number,url
   ```

2. **Read feedback**:
   ```bash
   gh pr view <number> --comments
   gh api repos/softwarecrafters-io/elearning-core/pulls/<number>/comments
   ```

3. **Summarize and apply fixes** following architecture rules

4. **Resolve conversations** via GraphQL:
   ```bash
   # Get thread IDs
   gh api graphql -f query='{ repository(owner:"softwarecrafters-io", name:"elearning-core") { pullRequest(number:<number>) { reviewThreads(first:20) { nodes { id isResolved } } } } }'
   
   # Resolve each thread
   gh api graphql -f query='mutation { resolveReviewThread(input:{threadId:"<id>"}) { thread { isResolved } } }'
   ```

5. **Commit and push**

## If PR already merged

```bash
git checkout master && git pull origin master && git branch -d <branch>
```

Inform: "PR merged, synced with master, ready for next task"

# Re-trigger Workflows on open PRs

GitHub Action to re-trigger Workflows on open PRs when a commit happens on this PRs base branch.

### Motivation

When working on repositories where many PRs tend to be open at the same time, it's often difficult to keep track of which checks should be re-run or not. When a commit happens on a PR's target branch, it's a good practice to re-run the checks to prevent Semantic Conflicts from happening.

This GitHub Action simply identifies the open PRs targeting the branch where the action is running and pushes an empty commit to the PRs branches, triggering the necessary Workflows again.

**NOTE:** The provided GitHub Token must be a Maintainer of the repository, otherwise it won't be able to push to PR branches. Also, the PRs to be updated must have "Allow edits from Maintainers" checked.

### Important notes

Everything comes with a cost. This action is not different, so there are some drawbacks:
1. An empty commit is pushed to PR branches to re-trigger Workflows. ([GitHub's API doesn't allow re-running successful Workflow runs.](https://github.community/t/cannot-re-run-a-successful-workflow-run-using-the-rest-api/123661))
2. All the PRs will be updated at once, making GitHub schedule many jobs to run after an update is made to the target branch.

Please be aware of those topics before using this GitHub Action! It might be very useful, but it can be that it's not ideal for your use-case.

### Usage

```yaml
name: "Re-trigger Workflows on open PRs"

on:
  push:
    # Here you can limit the branches where you want this action to be run
  
jobs:
  retrigger-workflows-on-open-prs:
    runs-on: ubuntu-latest

    steps:
      - uses: tiagobento/retrigger-workflows-on-open-prs@master**
        with:
          github_token: ${{ secrets.MY_TOKEN_WITH_MAINTAINER_PERMISSIONS }}
```
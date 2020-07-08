/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require("node-fetch");

async function run() {
  const workflowFile = core.getInput("workflow_file");
  const githubToken = core.getInput("github_token");

  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const branch = github.context.ref.split("/").pop();

  const githubApiDomain = `https://api.github.com`;
  const authHeaders = {
    headers: {
      Authorization: "x-oauth-basic " + githubToken,
      Accept: "application/vnd.github.v3+json"
    }
  };

  const workflows = await fetch(`${githubApiDomain}/repos/${owner}/${repo}/actions/workflows`, authHeaders)
    .then(c => c.json())
    .then(c => c.workflows);

  const workflow = workflows.filter(w => w.path.endsWith(workflowFile)).pop();
  if (!workflow) {
    throw new Error(`There's no workflow file called '${workflowFile}'`);
  }

  console.info(`Workflow '${workflowFile}' has id ${workflow.id}`);

  const openPrs = await fetch(
    `${githubApiDomain}/repos/${owner}/${repo}/pulls?state=open&base=${branch}`,
    authHeaders
  ).then(c => c.json());

  console.info(`Found ${openPrs.length} open PRs targeting ${branch}`);

  return Promise.all(
    openPrs.map(pr => {
      console.info(`Re-triggering ${workflow.name} on #${pr.number}: ${pr.title}`);
      return fetch(`${githubApiDomain}/repos/${owner}/${repo}/actions/workflows/${workflow.id}/dispatches`, {
        ...authHeaders,
        method: "POST",
        body: JSON.stringify({ ref: pr.head.sha })
      })
        .then(c => c.json())
        .then(c => console.info(c));
    })
  );
}

run()
  .then(() => console.info("Finished."))
  .catch(e => core.setFailed(e.message));

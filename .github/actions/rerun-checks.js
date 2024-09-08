import { Octokit } from '@octokit/rest'
import fetch from 'node-fetch'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN, request: { fetch } })

async function rerunChecks(owner, repo, pullNumber) {
  try {
    const { data: pr } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: parseInt(pullNumber, 10),
    })
    console.log(pr)

    const { data: checkSuites } = await octokit.checks.listSuitesForRef({
      owner,
      repo,
      ref: pr.head.sha,
    })
    console.log(checkSuites)

    for (const suite of checkSuites.check_suites) {
      console.log(suite)
      await octokit.checks.rerequest({
        owner,
        repo,
        check_suite_id: suite.id,
      })
      console.log('Rerun requested for check suite ' + suite.id)
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

await rerunChecks(process.env.REPOSITORY_OWNER, process.env.REPOSITORY_NAME, process.env.PULL_REQUEST_NUMBER)

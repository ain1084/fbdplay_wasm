import { defineEventHandler } from 'h3'
import { Octokit } from '@octokit/rest'
import type { GithubContent } from '~/types/GithubContent'

type QueryParams = Readonly<{
  owner: string
  repo: string
  path?: string
}>

export default defineEventHandler(async (event): Promise<GithubContent[]> => {
  const query = getQuery(event) as QueryParams
  const { owner, repo, path = '' } = query
  if (!owner || !repo) {
    throw new Error('Owner, repo are required query parameters')
  }

  const token = useRuntimeConfig().private.github.token
  if (!token) {
    throw new Error('GITHUB_TOKEN is not set in environment variables')
  }

  const octokit = new Octokit({ auth: token })

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    if (!Array.isArray(data)) {
      throw new TypeError(`Edpected an array but got:${data}`)
    }
    return data
      .filter(item => item.type === 'dir' || item.type === 'file')
      .map(
        item =>
          ({
            type: item.type,
            name: item.name,
            url: new URL(item.type === 'dir' ? item.url : item.download_url!),
          }) as GithubContent,
      )
  }
  catch (error) {
    throw new Error(`GitHub API error: ${error}`)
  }
})

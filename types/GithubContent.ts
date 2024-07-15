export type GithubContent = Readonly<{
  type: 'file' | 'dir'
  name: string
  url: URL
}>

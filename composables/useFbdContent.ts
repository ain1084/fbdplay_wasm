import type { FbdContent } from '~/types/FbdContent'

const generateTitle = (array: Uint8Array): string => {
  const result = []
  for (let i = 0; i < array.length; ++i) {
    let ch = array[i]
    if (ch === 0x00) {
      break
    }
    if (ch === 0x0a) {
      ch = 0x20
    }
    result.push(ch)
  }
  return new TextDecoder('utf-8').decode(new Uint8Array(result))
}

const fetchDetail = async (content: FbdContent) => {
  try {
    const response = await fetch(content.url.toString())
    if (response.ok) {
      const data = new Uint8Array(await response.arrayBuffer())
      content.data = data
      content.title = generateTitle(data)
    }
  }
  catch (error) {
    throw new Error(`Error fetching URL:${content.url} error:${error}`)
  }
}

export const useFbdContent = () => {
  const contents = ref<FbdContent[]>([])
  const preload = (async () => {
    const { owner, repo, path } = useRuntimeConfig().public.github
    const { data } = await useFetch('/api/github-content', {
      query: { owner, repo, path },
    })
    if (!data.value) {
      return []
    }
    return data.value.map((value) => {
      return {
        name: value.name,
        url: new URL(value.url),
        title: '',
        data: new Uint8Array(),
      }
    })!
  })()
  return {
    contents,
    start: async () => {
      contents.value = await preload
      contents.value.forEach(item => fetchDetail(item))
    },
  }
}

import { cpSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const githubRepositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.GITHUB_ACTIONS === 'true' && githubRepositoryName
    ? `/${githubRepositoryName}/`
    : '/'

export default defineConfig({
  base,
  plugins: [
    {
      name: 'copy-vocabulary-assets',
      closeBundle() {
        cpSync(resolve('assets'), resolve('dist/assets'), {
          recursive: true,
          filter: (source) => !source.endsWith('.DS_Store'),
        })
      },
    },
  ],
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
})

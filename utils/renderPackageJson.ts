import * as fs from 'node:fs'
import * as path from 'node:path'

import type { Linter } from 'eslint'

import createESLintConfig from '@vue/create-eslint-config'

import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'

export default function renderPackageJson(rootDir: string, needsTypeScript: boolean) {
  const additionalConfig: Linter.Config = {}
  const additionalDependencies = {}

  const { pkg } = createESLintConfig({
    vueVersion: '3.x',
    styleGuide: 'default',
    hasTypeScript: needsTypeScript,
    needsPrettier: true,
    additionalConfig,
    additionalDependencies
  })

  const scripts: Record<string, string> = {
    // Note that we reuse .gitignore here to avoid duplicating the configuration
    lint: needsTypeScript
      ? 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore'
      : 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore',
    format: 'prettier --write src/'
  }

  // update package.json
  const packageJsonPath = path.resolve(rootDir, 'package.json')
  const existingPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const updatedPkg = sortDependencies(deepMerge(deepMerge(existingPkg, pkg), { scripts }))
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf-8')
}

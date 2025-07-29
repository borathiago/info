import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import ts from '@typescript-eslint/eslint-plugin'

function cleanConfig(config) {
    if (config.extends) {
        const { extends: _ignored, ...cleanedConfig } = config
        return cleanedConfig
    }
    return config
}

/** @type {import('eslint').Linter.Config[]} */
export default [
    cleanConfig(ts.configs.recommended),
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.browser } },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'max-len': ['off', { code: 3600 }],
            'no-console': 'off',
        },
    },
    cleanConfig(pluginJs.configs.recommended),
    ...tseslint.configs.recommended.map(cleanConfig),
]

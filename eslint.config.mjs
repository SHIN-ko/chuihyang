import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'babel.config.js',
      'metro.config.js',
      'docs/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '__tests__/**',
      'scripts/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // === spotless 대응: 코드 품질 강제 ===

      // console.log 경고 (AGENTS.md 규칙 — 새 코드에서는 사용 금지, 기존 코드 점진 제거)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // var 금지
      'no-var': 'error',

      // const 선호
      'prefer-const': 'error',

      // TypeScript unused vars (ts 전용 규칙으로 대체)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // any 타입 경고 (AGENTS.md: any 타입 금지)
      '@typescript-eslint/no-explicit-any': 'warn',

      // require 금지 (import 사용)
      '@typescript-eslint/no-require-imports': 'warn',

      // debugger 금지
      'no-debugger': 'error',

      // eval 금지
      'no-eval': 'error',

      // alert 금지
      'no-alert': 'error',

      // === React 규칙 ===
      'react/jsx-uses-react': 'off', // React 19 JSX transform
      'react/react-in-jsx-scope': 'off', // React 19 JSX transform
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // === Import 규칙 ===
      'no-duplicate-imports': 'error',
    },
  },
];

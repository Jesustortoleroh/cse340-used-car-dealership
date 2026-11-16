import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node, // Permite variables como process, __dirname, etc.
                ...globals.browser // Permite variables como document, window, localStorage
            }
        },
        rules: {
            // Reglas recomendadas
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignora variables con _ (ej. _next)
            'no-console': 'off', // Permitimos console.log temporalmente (Pino ya está en server)
            eqeqeq: ['error', 'always'], // Obliga a usar === en lugar de ==
            curly: ['error', 'all'], // Obliga a usar llaves en los if
            'no-var': 'error', // Prohíbe var, usa let o const
            'prefer-const': 'error' // Usa const si la variable no se reasigna
        }
    },
    {
        // Ignorar carpetas
        ignores: ['node_modules/', 'public/js/**/*.js', 'dist/']
    }
];

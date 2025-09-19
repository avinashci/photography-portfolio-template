import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Accessibility rules - warn instead of error for template flexibility
      "@next/next/no-img-element": "warn",
      
      // Performance rules
      "@next/next/no-sync-scripts": "error",
      
      // TypeScript rules - more lenient for template
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Disable problematic rules for template compatibility
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      
      // Allow console statements - warn only
      "no-console": "warn",
    },
    ignores: [
      ".next/**",
      "node_modules/**",
      "build/**",
      "dist/**",
      "*.config.js",
      "*.config.ts",
      "scripts/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
];

export default eslintConfig;
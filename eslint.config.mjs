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
      // Allow unused variables with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      
      // Allow any type in some cases (will be gradually improved)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Allow missing dependencies in useEffect (when intentional)
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow img element (will be gradually replaced with next/image)
      "@next/next/no-img-element": "warn",
      
      // Allow console.error and console.warn for debugging
      "no-console": ["warn", { allow: ["warn", "error"] }],
    }
  }
];

export default eslintConfig;

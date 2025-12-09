/**
 * Translation Validation Script
 *
 * Validates that all locale translation files have consistent keys.
 * Uses en.json as the baseline and checks zh.json, es.json, ar.json.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MESSAGES_DIR = join(import.meta.dirname, "..", "messages");
const BASELINE_LOCALE = "en";
const TARGET_LOCALES = ["zh", "es", "ar"];

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

function getAllKeys(
  object: TranslationObject,
  prefix = ""
): Set<string> {
  const keys = new Set<string>();

  for (const [key, value] of Object.entries(object)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      for (const nestedKey of getAllKeys(
        value as TranslationObject,
        fullKey
      )) {
        keys.add(nestedKey);
      }
    } else {
      keys.add(fullKey);
    }
  }

  return keys;
}

function loadTranslations(locale: string): TranslationObject {
  const filePath = join(MESSAGES_DIR, `${locale}.json`);
  const content = readFileSync(filePath, "utf8");
  return JSON.parse(content) as TranslationObject;
}

function validateTranslations(): boolean {
  console.log("🔍 Validating translations...\n");

  const baselineTranslations = loadTranslations(BASELINE_LOCALE);
  const baselineKeys = getAllKeys(baselineTranslations);

  console.log(`📋 Baseline (${BASELINE_LOCALE}): ${baselineKeys.size} keys\n`);

  let hasErrors = false;
  const results: Array<{
    locale: string;
    missing: string[];
    extra: string[];
    total: number;
  }> = [];

  for (const locale of TARGET_LOCALES) {
    const translations = loadTranslations(locale);
    const localeKeys = getAllKeys(translations);

    const missing = [...baselineKeys].filter((key) => !localeKeys.has(key));
    const extra = [...localeKeys].filter((key) => !baselineKeys.has(key));

    results.push({
      locale,
      missing,
      extra,
      total: localeKeys.size,
    });

    if (missing.length > 0 || extra.length > 0) {
      hasErrors = true;
    }
  }

  // Print results table
  console.log("| Locale | Total | Missing | Extra | Status |");
  console.log("|--------|-------|---------|-------|--------|");

  for (const result of results) {
    const status =
      result.missing.length === 0 && result.extra.length === 0
        ? "✅ PASS"
        : "❌ FAIL";
    console.log(
      `| ${result.locale.padEnd(6)} | ${String(result.total).padEnd(5)} | ${String(result.missing.length).padEnd(7)} | ${String(result.extra.length).padEnd(5)} | ${status} |`
    );
  }

  console.log();

  // Print detailed errors
  for (const result of results) {
    if (result.missing.length > 0) {
      console.log(`\n❌ ${result.locale}: Missing ${result.missing.length} keys:`);
      for (const key of result.missing.slice(0, 10)) {
        console.log(`   - ${key}`);
      }
      if (result.missing.length > 10) {
        console.log(`   ... and ${result.missing.length - 10} more`);
      }
    }

    if (result.extra.length > 0) {
      console.log(`\n⚠️  ${result.locale}: Extra ${result.extra.length} keys:`);
      for (const key of result.extra.slice(0, 10)) {
        console.log(`   - ${key}`);
      }
      if (result.extra.length > 10) {
        console.log(`   ... and ${result.extra.length - 10} more`);
      }
    }
  }

  if (hasErrors) {
    console.log("\n❌ Translation validation FAILED");
    process.exit(1);
  } else {
    console.log("\n✅ All translations are consistent");
    process.exit(0);
  }

  return !hasErrors;
}

// Run validation
validateTranslations();

/**
 * 아키텍처 의존성 검증 스크립트 (ArchUnit 대응)
 *
 * AGENTS.md에 정의된 레이어 의존 방향을 검증합니다.
 *
 * 금지 규칙:
 * - components/ → stores/    (컴포넌트는 순수 UI)
 * - components/ → services/  (컴포넌트가 직접 API 호출 금지)
 * - services/ → stores/      (서비스는 상태에 의존하지 않음)
 * - utils/ → stores/         (유틸리티는 순수 함수)
 * - utils/ → services/       (유틸리티는 외부 의존성 없음)
 * - types/ → 다른 src 레이어  (타입은 순수 정의만 포함)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const SRC_DIR = join(process.cwd(), 'src');

// 금지된 의존성 규칙
// [소스 디렉토리, 금지된 import 대상, 이유]
const FORBIDDEN_RULES = [
  {
    from: 'components',
    cannotImport: 'stores',
    reason: '컴포넌트는 순수 UI입니다. Store 접근은 screens에서만 허용됩니다.',
  },
  {
    from: 'components',
    cannotImport: 'services',
    reason: '컴포넌트가 직접 API를 호출할 수 없습니다. screens → stores → services 순서를 지키세요.',
  },
  {
    from: 'services',
    cannotImport: 'stores',
    reason: '서비스는 상태에 의존하지 않아야 합니다. 필요한 데이터는 파라미터로 전달하세요.',
  },
  {
    from: 'utils',
    cannotImport: 'stores',
    reason: '유틸리티는 순수 함수여야 합니다. Store에 의존할 수 없습니다.',
  },
  {
    from: 'utils',
    cannotImport: 'services',
    reason: '유틸리티는 외부 의존성이 없어야 합니다.',
  },
  {
    from: 'types',
    cannotImport: 'stores',
    reason: '타입 파일은 순수 타입 정의만 포함해야 합니다.',
  },
  {
    from: 'types',
    cannotImport: 'services',
    reason: '타입 파일은 순수 타입 정의만 포함해야 합니다.',
  },
  {
    from: 'types',
    cannotImport: 'screens',
    reason: '타입 파일은 순수 타입 정의만 포함해야 합니다.',
  },
  {
    from: 'types',
    cannotImport: 'components',
    reason: '타입 파일은 순수 타입 정의만 포함해야 합니다.',
  },
];

function getAllTsFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...getAllTsFiles(fullPath));
      } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  } catch {
    // 디렉토리가 없으면 무시
  }
  return files;
}

function extractImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imports = [];

  // import ... from '...' 패턴
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // require('...') 패턴
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function getLayer(filePath) {
  const rel = relative(SRC_DIR, filePath);
  const parts = rel.split('/');
  return parts[0]; // components, screens, services, stores, types, utils, etc.
}

function importTargetsLayer(importPath, targetLayer) {
  // @/src/stores/... 또는 @/src/services/... 패턴
  if (importPath.startsWith('@/src/')) {
    const afterSrc = importPath.replace('@/src/', '');
    return afterSrc.startsWith(targetLayer + '/') || afterSrc === targetLayer;
  }

  // 상대 경로에서 상위 디렉토리로 올라가는 경우 (../stores/...)
  if (importPath.includes(`/${targetLayer}/`) || importPath.endsWith(`/${targetLayer}`)) {
    return true;
  }

  return false;
}

// Frozen violations (기존 코드의 허용된 위반 — ArchUnit FreezingArchRule 대응)
// 이 목록에 있는 위반은 경고만 출력하고 실패하지 않음
// 새로운 위반 추가 금지! 기존 위반을 해소하면 이 목록에서도 제거할 것.
const BASELINE_FILE = join(process.cwd(), 'scripts', 'architecture-baseline.json');

function loadBaseline() {
  try {
    if (existsSync(BASELINE_FILE)) {
      return JSON.parse(readFileSync(BASELINE_FILE, 'utf-8'));
    }
  } catch {
    // baseline 파일이 없거나 파싱 실패 시 빈 배열
  }
  return [];
}

function makeViolationKey(relPath, from, cannotImport, imp) {
  return `${relPath}|${from}→${cannotImport}|${imp}`;
}

// 실행
const baseline = loadBaseline();
const baselineSet = new Set(baseline);
let newViolations = 0;
let frozenViolations = 0;
const files = getAllTsFiles(SRC_DIR);

for (const file of files) {
  const layer = getLayer(file);
  const imports = extractImports(file);
  const relPath = relative(process.cwd(), file);

  for (const rule of FORBIDDEN_RULES) {
    if (layer !== rule.from) continue;

    for (const imp of imports) {
      if (importTargetsLayer(imp, rule.cannotImport)) {
        const key = makeViolationKey(relPath, rule.from, rule.cannotImport, imp);

        if (baselineSet.has(key)) {
          frozenViolations++;
          // baseline에 있는 기존 위반은 경고만
        } else {
          newViolations++;
          console.error(
            `\n❌ 새로운 아키텍처 위반: ${relPath}\n` +
              `   ${rule.from}/ → ${rule.cannotImport}/ 의존 금지\n` +
              `   import: '${imp}'\n` +
              `   이유: ${rule.reason}\n` +
              `   → AGENTS.md § 아키텍처 참조`,
          );
        }
      }
    }
  }
}

if (frozenViolations > 0) {
  console.warn(`\n⚠️  기존 허용된 위반 ${frozenViolations}건 (baseline). 향후 리팩토링 시 해소 필요.`);
}

if (newViolations > 0) {
  console.error(`\n🚫 새로운 아키텍처 위반 ${newViolations}건 발견. AGENTS.md 의존성 규칙을 확인하세요.`);
  process.exit(1);
} else {
  console.log('✅ 아키텍처 의존성 검증 통과. 새로운 위반 없음.');
  process.exit(0);
}

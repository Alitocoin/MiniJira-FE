#!/usr/bin/env bash
# run-ci-frontend-local.sh
# Simula localmente el pipeline CI del frontend MiniJira.
# Honesto: si algo no existe o falla, lo reporta y continúa — no simula éxito.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

PASS=0
FAIL=0
SKIP=0

echo "======================================"
echo "  CI LOCAL — MiniJira Frontend"
echo "  Directorio: $PROJECT_ROOT"
echo "======================================"
echo ""

# ─── PASO 1: npm ci ─────────────────────────────────────────────
echo "[1/5] Instalando dependencias (npm ci)..."
if npm ci; then
  echo "      OK — dependencias instaladas."
  PASS=$((PASS + 1))
else
  echo "      FALLO — npm ci retornó error. Abortando."
  exit 1
fi
echo ""

# ─── PASO 2: Lint ───────────────────────────────────────────────
echo "[2/5] Lint (ESLint)..."
LINT_CONFIG_FOUND=false
for f in eslint.config.js .eslintrc .eslintrc.js .eslintrc.json .eslintrc.yml; do
  if [ -f "$f" ]; then
    LINT_CONFIG_FOUND=true
    break
  fi
done

if [ "$LINT_CONFIG_FOUND" = true ]; then
  if npm run lint; then
    echo "      OK — lint sin errores."
    PASS=$((PASS + 1))
  else
    echo "      FALLO — lint reportó errores. Revisa los archivos marcados."
    FAIL=$((FAIL + 1))
  fi
else
  echo "      SKIP — Lint configuration not found. Documented as pending."
  SKIP=$((SKIP + 1))
fi
echo ""

# ─── PASO 3: Tests ──────────────────────────────────────────────
echo "[3/5] Tests unitarios (Vitest)..."
TEST_COUNT=$(find src -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
if [ "$TEST_COUNT" -gt "0" ]; then
  if npm test -- --run; then
    echo "      OK — $TEST_COUNT archivos de test ejecutados."
    PASS=$((PASS + 1))
  else
    echo "      FALLO — uno o más tests fallaron."
    FAIL=$((FAIL + 1))
  fi
else
  echo "      SKIP — Tests not found. Documented as pending."
  SKIP=$((SKIP + 1))
fi
echo ""

# ─── PASO 4: Build ──────────────────────────────────────────────
echo "[4/5] Build de producción (npm run build)..."
if npm run build; then
  echo "      OK — artefacto generado en dist/."
  PASS=$((PASS + 1))
else
  echo "      FALLO — el build falló. No apto para despliegue."
  FAIL=$((FAIL + 1))
fi
echo ""

# ─── PASO 5: Audit ──────────────────────────────────────────────
echo "[5/5] Audit de seguridad (npm audit --audit-level=high)..."
if [ -f "package-lock.json" ]; then
  # npm audit devuelve exit code != 0 si hay vulns al nivel indicado
  if npm audit --audit-level=high; then
    echo "      OK — sin vulnerabilidades de nivel high o critical."
    PASS=$((PASS + 1))
  else
    echo "      FALLO — vulnerabilidades de nivel high/critical encontradas."
    echo "             Revisar salida de npm audit y actualizar dependencias."
    FAIL=$((FAIL + 1))
  fi
else
  echo "      SKIP — package-lock.json no encontrado. Security audit tooling not configured. Documented as pending."
  SKIP=$((SKIP + 1))
fi
echo ""

# ─── RESUMEN ────────────────────────────────────────────────────
echo "======================================"
echo "  RESUMEN CI LOCAL"
echo "======================================"
echo "  Pasaron : $PASS"
echo "  Fallaron: $FAIL"
echo "  Saltados: $SKIP (pendientes documentados)"
echo "======================================"

if [ "$FAIL" -gt "0" ]; then
  echo "  Estado: FALLO — corregir antes de push."
  exit 1
else
  echo "  Estado: OK — seguro para push."
  exit 0
fi

#!/usr/bin/env bash
# Genera dist/ con la propuesta elegida en la raíz, lista para subir a https://marianadiaz.site
# Uso:  ./publicar.sh 1     (o 3)
# Solo copia lo necesario: nunca incluye portfolio.pdf ni la página de comparación.
set -euo pipefail
cd "$(dirname "$0")"

case "${1:-}" in
  1) src="propuesta-1-pedacito" ;;
  2) src="propuesta-2-carta-de-color" ;;
  3) src="propuesta-3-sala-md" ;;
  *) echo "Uso: $0 1|3   (1 = Un pedacito de mí, 3 = Sala MD)"; exit 1 ;;
esac
[ -d "$src" ] || { echo "✗ No existe la carpeta $src"; exit 1; }

rm -rf dist
mkdir -p dist/assets
cp "$src/index.html" "$src/styles.css" "$src/app.js" dist/
cp assets/data.js assets/kit.js dist/assets/
cp -R assets/img assets/og dist/assets/

# La propuesta pasa de estar en una subcarpeta a la raíz: ../assets/ → assets/
for f in dist/index.html dist/app.js dist/styles.css; do
  sed -i.bak 's#\.\./assets/#assets/#g' "$f" && rm -f "$f.bak"
done

# Comprobaciones de seguridad antes de subir nada
# (patrones genéricos: cualquier móvil venezolano o correo de Gmail/Hotmail/Yahoo/Outlook)
if grep -rIlE -e "(\+?58|0)[ -]?4(12|14|16|24|26)[ -]?[0-9]{3}[ -]?[0-9]{4}" -e "@(gmail|hotmail|yahoo|outlook)\." dist >/dev/null; then
  echo "✗ Hay un teléfono o un correo personal en dist/. Revisa assets/data.js antes de publicar."
  exit 1
fi
if grep -q 'web3formsKey: ""' dist/assets/data.js; then
  echo "⚠ Falta la clave de Web3Forms en assets/data.js: el formulario no enviará mensajes."
fi

echo "✓ dist/ lista con '$src'. Sube el contenido de dist/ a la raíz de marianadiaz.site."

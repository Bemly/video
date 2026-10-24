# usage: tools/check.sh file.html  -> syntax-check each inline script with exact line numbers
S=/private/tmp/claude-501/-Volumes--------mac/9253d91a-866d-4a30-89a2-533c82b7f8f0/scratchpad/chk; rm -rf $S; mkdir -p $S
python3 - "$1" "$S" <<'PY'
import re,sys
h=open(sys.argv[1]).read()
for i,m in enumerate(re.finditer(r'<script((?:(?!src=)[^>])*)>(.*?)</script>',h,re.S)):
    if 'importmap' in m.group(1): continue
    ext='mjs' if 'module' in m.group(1) else 'js'
    line=h[:m.start(2)].count('\n')
    open(f'{sys.argv[2]}/s{i}_L{line}.{ext}','w').write(m.group(2))
PY
for f in $S/*; do node --check "$f" 2>&1 | grep -A3 "^/" | head -4 | sed "s#$S/##"; done

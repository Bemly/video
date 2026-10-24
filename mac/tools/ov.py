# python3 tools/ov.py <id> <fix-label> <old> <new> [<old> <new> ...]  -> append replace pairs + fix label
import json, sys
o = json.load(open('tools/overrides.json'))
e = o.setdefault(sys.argv[1], {})
if sys.argv[2] and sys.argv[2] not in e.setdefault('fixes', []): e['fixes'].append(sys.argv[2])
a = sys.argv[3:]
for i in range(0, len(a), 2): e.setdefault('replace', []).append([a[i], a[i + 1]])
json.dump(o, open('tools/overrides.json', 'w'), ensure_ascii=False, indent=1)

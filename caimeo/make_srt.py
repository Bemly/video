import json, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(HERE, 'timeline.json')))


def ts(t):
    ms = int(round(t * 1000))
    return '%02d:%02d:%02d,%03d' % (ms // 3600000, ms // 60000 % 60, ms // 1000 % 60, ms % 1000)


out = []
for i, ln in enumerate(tl['lines'], 1):
    out.append('%d\n%s --> %s\n%s\n' % (i, ts(ln['start'] - 0.1), ts(ln['end'] + 0.45), ln['zh']))
open(sys.argv[1], 'w', encoding='utf-8').write('\n'.join(out))
print(len(out), 'cues')

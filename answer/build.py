"""逐题鉴赏 answer/ 数据构建（只读源目录，不修改源文件）。

来源（全部只读）：
- LLM=/Volumes/*/Projects/llmtest
  - 手动评分/00_题目/T-*.md          # 题面（```user 块）
  - 手动评分/参考/评分要点/T-*.md    # 考察 / 难度 / 评分要点
  - 手动评分/01_盲评包/T-*/M*.md     # 各模型作答（匿名）
  - 手动解盲（主会话专用）/03_映射表/mapping.csv  # 匿名ID -> 模型
- SUM=/Volumes/*/影片/文笔/汇总
  - 明细_逐题逐裁判.csv              # 题号×模型×裁判：十维 + 专项 + 总分 + 点评
  - 逐题排名_去自评.csv              # 每题名次（剔除自评后均值）

输出（本目录下）：
- data/index.json                    # 107 题列表（无全文，用于首页）
- data/T-*.json                      # 每题详情（含全文 + 摘录高亮 + 全部分数点评）

用法：python3 build.py
"""
import csv
import glob
import html
import json
import os
import re
import statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
SUM = glob.glob('/Volumes/*/影片/文笔/汇总')[0]
LLM = glob.glob('/Volumes/*/Projects/llmtest')[0]
PACK = os.path.join(LLM, '手动评分/01_盲评包')
OUT = os.path.join(HERE, 'data')
os.makedirs(OUT, exist_ok=True)
esc = html.escape

MODELS = [
    'claude-opus-5-5', 'gemini-4-argon-contributor', 'Muse Spark 1.2 Contributor',
    'deepseek-v4-pro', 'Muse-Spark-1.3-Free', 'LongCat-2.0', 'space-bunny-free',
    'gemini-3.7-flash', 'LongCat-2.5-Preview-Free', 'Qwen3.6-27B-FP8',
]
NAMES = {
    'claude-opus-5-5': 'Claude Opus 5.5', 'gemini-4-argon-contributor': 'Gemini 4 Argon',
    'Muse Spark 1.2 Contributor': 'Muse Spark 1.2', 'deepseek-v4-pro': 'DeepSeek V4 Pro 0813',
    'Muse-Spark-1.3-Free': 'Muse Spark 1.3', 'LongCat-2.0': 'LongCat 2.0',
    'space-bunny-free': 'space-bunny', 'gemini-3.7-flash': 'Gemini 3.7 Flash',
    'LongCat-2.5-Preview-Free': 'LongCat 2.5 Preview', 'Qwen3.6-27B-FP8': 'Qwen3.6 27B',
}
JUDGES = ['opus5.5', 'gemini4', 'dsv4p', 'muse1.2', 'muse1.3', 'gemini3.7']
JNAMES = {
    'opus5.5': 'Claude Opus 5.5', 'gemini4': 'Gemini 4 Argon', 'dsv4p': 'DeepSeek V4 Pro',
    'muse1.2': 'Muse Spark 1.2', 'muse1.3': 'Muse Spark 1.3', 'gemini3.7': 'Gemini 3.7 Flash',
}
SELF_MODEL = {  # 裁判 -> 同一模型（自评需标记，计均值时剔除）
    'opus5.5': 'claude-opus-5-5', 'gemini4': 'gemini-4-argon-contributor',
    'dsv4p': 'deepseek-v4-pro', 'muse1.2': 'Muse Spark 1.2 Contributor',
    'muse1.3': 'Muse-Spark-1.3-Free', 'gemini3.7': 'gemini-3.7-flash',
}
DIMS = ['指令遵循', '文笔与文气', '活人感去AI味', '结构与节奏', '人物与对白',
        '逻辑与一致性', '吸引力可读性', '文体类型契合', '信息密度', '准确与诚实']
MODS = {'A': '语言基本功', 'B': '叙事结构', 'C': '人物与对白', 'D': '类型文学',
        'E': 'RP与互动', 'F': '法学社科论文', 'G': '长上下文续航', 'H': '综合实验',
        'I': '去AI味', 'J': '多语言'}

# ---------- 读源 ----------
detail = list(csv.DictReader(open(os.path.join(SUM, '明细_逐题逐裁判.csv'), encoding='utf-8-sig')))
rank_rows = list(csv.DictReader(open(os.path.join(SUM, '逐题排名_去自评.csv'), encoding='utf-8-sig')))
mapping = list(csv.DictReader(open(os.path.join(LLM, '手动解盲（主会话专用）/03_映射表/mapping.csv'), encoding='utf-8-sig')))
anon_of = {(r['题号'], r['模型']): r['匿名ID'] for r in mapping if r['模型'] in MODELS}

by_qm = {}
for r in detail:
    by_qm.setdefault((r['题号'], r['模型']), {})[r['裁判']] = r
rank_of = {(r['题号'], r['模型']): (int(r['名次']), float(r['均分']), int(r['裁判数'])) for r in rank_rows}
qids = sorted({r['题号'] for r in detail})
assert len(qids) == 107, f'题数={len(qids)}'


def answer_text(qid, model):
    anon = anon_of.get((qid, model))
    if not anon:
        return ''
    p = os.path.join(PACK, qid, anon + '.md')
    try:
        return open(p, encoding='utf-8').read()
    except FileNotFoundError:
        return ''


def excerpt_html(full, quotes):
    """点评引用的原句若在作答中找到，取所在句前后各 60 字并高亮；否则取开头。返回已转义 HTML。"""
    lines = [l.strip() for l in full.splitlines()
             if l.strip() and not l.lstrip().startswith(('#', '>', '|', '---', '```', '**风格', '- **'))]
    picked = []
    for q in quotes:
        core = q.strip('…. ')
        if not core:
            continue
        for l in lines:
            if core and core in l and l not in [p[0] for p in picked]:
                picked.append((l, core))
                break
        if len(picked) == 5:
            break
    out = []
    for l, core in picked:
        i = l.find(core)
        s, e = max(0, i - 60), min(len(l), i + len(core) + 60)
        seg = ('…' if s else '') + esc(l[s:i]) + f'<mark>{esc(core)}</mark>' + esc(l[i + len(core):e]) + ('…' if e < len(l) else '')
        out.append(f'<p>{seg}</p>')
    if len(''.join(out)) < 260:
        body = ''.join(lines[:6])[:320]
        out = [f'<p>{esc(body)}…</p>'] + out
    return ''.join(out)


index = []
for qid in qids:
    prompt_md = open(os.path.join(LLM, '手动评分/00_题目', qid + '.md'), encoding='utf-8').read()
    title = prompt_md.splitlines()[0].split('｜', 1)[1].strip()
    blocks = re.findall(r'```user\n(.*?)```', prompt_md, re.S)
    prompt_blocks = [b.strip() for b in blocks]
    rub = open(os.path.join(LLM, '手动评分/参考/评分要点', qid + '.md'), encoding='utf-8').read()
    m = re.search(r'考察：(.*?)｜\s*难度：(\S+)', rub)
    focus, level = (m.group(1).strip(), m.group(2)) if m else ('', '')
    points = [re.sub(r'\*\*', '', l[2:].strip()) for l in rub.split('**评分要点**', 1)[-1].splitlines() if l.startswith('- ')]
    mod = next((r['模块'] for r in detail if r['题号'] == qid), qid[2])
    models = sorted({r['模型'] for r in detail if r['题号'] == qid})
    avgs = {}
    for mod_id in models:
        vals = [float(by_qm[(qid, mod_id)][j]['总分']) for j in by_qm[(qid, mod_id)] if by_qm[(qid, mod_id)][j]['自评'] == '0']
        avgs[mod_id] = st.mean(vals)
    order = sorted(models, key=lambda x: avgs[x])  # 低 -> 高（与视频一致）
    top, bottom = max(models, key=lambda x: avgs[x]), min(models, key=lambda x: avgs[x])

    q_models = {}
    for mod_id in models:
        full = answer_text(qid, mod_id)
        quotes = []
        for j in JUDGES:
            r = by_qm[(qid, mod_id)].get(j)
            if r and r['点评']:
                quotes += re.findall(r'[“"「]([^”"」]{3,40})[”"」]', r['点评'])
        quotes = sorted({q.strip('…. ') for q in quotes if q.strip('…. ')}, key=len, reverse=True)[:12]
        scores = {}
        for j in JUDGES:
            r = by_qm[(qid, mod_id)].get(j)
            if not r:
                continue
            dims = {}
            for k in DIMS:
                try:
                    dims[k] = float(r[k]) if r[k] not in ('', None) else None
                except ValueError:
                    dims[k] = None
            try:
                spec = float(r['专项分']) if r['专项分'] not in ('', None) else None
            except ValueError:
                spec = None
            scores[j] = {'dims': dims, 'special': spec, 'total': float(r['总分']),
                         'comment': r['点评'], 'self': r['自评'] == '1'}
        rk, rk_avg, rk_n = rank_of.get((qid, mod_id), (0, round(avgs[mod_id], 2), 0))
        q_models[mod_id] = {
            'avg': round(avgs[mod_id], 2), 'rank': rk, 'rank_avg': rk_avg, 'n_judges': rk_n,
            'hanzi': len(re.findall(r'[\u4e00-\u9fff]', full)),
            'anon': anon_of.get((qid, mod_id), ''),
            'excerpt_html': excerpt_html(full, quotes),
            'quotes': quotes,
            'scores': scores,
            'full': full,
        }

    qobj = {'qid': qid, 'title': title, 'module': mod, 'module_name': MODS.get(mod, mod),
            'rounds': len(prompt_blocks), 'n_models': len(models),
            'prompt_blocks': prompt_blocks, 'focus': focus, 'level': level, 'points': points,
            'order_low_high': order,
            'ranking': [{'model': x, 'avg': round(avgs[x], 2), 'rank': rank_of.get((qid, x), (0, 0, 0))[0]} for x in
                        sorted(models, key=lambda x: -avgs[x])],
            'models': q_models}
    json.dump(qobj, open(os.path.join(OUT, qid + '.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'))
    index.append({'qid': qid, 'title': title, 'module': mod, 'module_name': MODS.get(mod, mod),
                  'rounds': len(prompt_blocks), 'n_models': len(models),
                  'top_model': top, 'top_avg': round(avgs[top], 2),
                  'bottom_model': bottom, 'bottom_avg': round(avgs[bottom], 2),
                  'focus': focus, 'level': level})

json.dump({'total': len(index), 'models': MODELS, 'names': NAMES, 'judges': JUDGES,
           'jnames': JNAMES, 'dims': DIMS, 'mods': MODS, 'questions': sorted(index, key=lambda x: x['qid'])},
          open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
print(f'done: {len(index)} questions -> {OUT}')

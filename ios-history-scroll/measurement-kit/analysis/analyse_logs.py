import json,sys
# REPAIR (2026-10-22): same logic as analyse2.py, but takes log file paths instead of
# the fixed /tmp/t3-ios/probe/log-<mode>.jsonl names. Usage: python3 analyse_logs.py <log.jsonl>...
# Scrolling up through history moves content down the screen (dy > 0). A jerk is
# content moving backwards (dy < 0) or a one-frame spike well above both neighbours.
for mode in sys.argv[1:]:
    ev=[]
    for line in open(mode):
        line=line.strip()
        if line: ev+=json.loads(line)
    ev.sort(key=lambda e:e['t'])
    fr=[e for e in ev if e['k']=='f']
    back=[f for f in fr if f['dy']<-10]
    spikes=[]
    for a,b,c in zip(fr,fr[1:],fr[2:]):
        if c['t']-a['t']>60: continue
        if b['dy']>max(a['dy'],c['dy'])+40: spikes.append(b)
    by=[e for e in ev if e['k']=='scrollBy']
    print(f"== {mode}: frames={len(fr)} code scroll writes={len(by)} (finger down {sum(1 for e in by if e['touchingNow'])})")
    print(f"   backward jumps (>10px): {len(back)}  sizes: {sorted([round(-f['dy']) for f in back],reverse=True)}")
    print(f"   forward one-frame spikes (>40px above neighbours): {len(spikes)}  sizes: {[round(f['dy']) for f in spikes]}")

from __future__ import annotations
from html import escape
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = [
    ROOT / "public/images/architectures",
    ROOT / "apps/web/public/images/architectures",
]
for output in OUTPUTS:
    output.mkdir(parents=True, exist_ok=True)

DEFS = '''<defs>
<marker id="a" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="7" markerHeight="7" orient="auto" markerUnits="strokeWidth"><path d="M1 1L9 5L1 9Z" fill="context-stroke"/></marker>
<style>
.t{font-family:Arial,Helvetica,sans-serif}.h{font-size:44px;font-weight:700;fill:#111513}.e{font-size:18px;font-weight:700;fill:#143C2E}.n{font-size:20px;font-weight:700;fill:#111513}.s{font-size:13px;fill:#66706A}.m{font-size:11px;font-weight:700;fill:#66706A}.box{fill:#fff;stroke:#E3E6E2}.surf{fill:#F5F6F4;stroke:#E3E6E2}.core{fill:#143C2E;stroke:#143C2E}.edge,.rail{fill:none;stroke:#8A9690;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.edge{marker-end:url(#a)}.capital{stroke:#2457C5}.utility{stroke:#143C2E}.trust{stroke:#248A57}.risk{stroke:#C9362B}.warn{stroke:#C98A16}.dash{stroke-dasharray:7 6}.label{fill:#fff;stroke:#E3E6E2}.badge{stroke-width:1}.core-title{fill:#fff}.core-sub{fill:#DDE8E3}
</style></defs>'''


def write(name: str, content: str) -> None:
    for output in OUTPUTS:
        (output / name).write_text(content, encoding="utf-8")


def wrap(title: str, desc: str, body: str, footer: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="1440" height="900" fill="#fff"/>{DEFS}<g class="t">{body}<text x="90" y="855" class="s">{escape(footer)}</text></g></svg>'''


def text_width(text: str, px_per_char: float = 6.6) -> float:
    return max(1.0, len(text)) * px_per_char


def badge_metrics(text: str, card_w: float) -> tuple[float, str]:
    max_w = max(62.0, card_w - 28.0)
    w = min(max_w, max(66.0, 20.0 + text_width(text, 6.2)))
    shown = text
    if 20 + text_width(shown, 6.2) > max_w:
        max_chars = max(4, int((max_w - 30) / 6.2))
        shown = shown[: max_chars - 1] + "…"
    return w, shown


def split_lines(text: str, max_chars: int, max_lines: int = 2) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) <= max_chars or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
            if len(lines) == max_lines - 1:
                break
    if len(lines) < max_lines and current:
        remaining_index = sum(len(line.split()) for line in lines)
        rest = " ".join(words[remaining_index:])
        if len(rest) > max_chars:
            rest = rest[: max_chars - 1].rstrip() + "…"
        lines.append(rest)
    return lines[:max_lines]


def card(
    x: float,
    y: float,
    w: float,
    h: float,
    title: str,
    sub: str = "",
    cls: str = "box",
    *,
    status: str | None = None,
    status_fill: str = "#F5F6F4",
    status_stroke: str = "#E3E6E2",
    status_color: str = "#66706A",
) -> str:
    dark = cls == "core"
    title_cls = "n core-title" if dark else "n"
    sub_cls = "s core-sub" if dark else "s"
    status_markup = ""
    title_y = 45
    sub_y = 76
    if status:
        bw, shown = badge_metrics(status, w)
        bx = w - bw - 14
        by = 12
        status_markup = (
            f'<g class="node-badge" data-badge="{escape(status)}">'
            f'<rect x="{bx:.1f}" y="{by}" width="{bw:.1f}" height="24" rx="12" fill="{status_fill}" stroke="{status_stroke}" class="badge"/>'
            f'<text x="{bx + bw/2:.1f}" y="{by + 16}" text-anchor="middle" font-size="10" font-weight="700" fill="{status_color}">{escape(shown)}</text></g>'
        )
        title_y = 58
        sub_y = 86
    max_title_chars = max(11, int((w - 34) / 10.8))
    title_lines = split_lines(title, max_title_chars, 2)
    if len(title_lines) > 1:
        first_y = title_y - 9
        title_markup = f'<text x="{w/2}" y="{first_y}" text-anchor="middle" class="{title_cls}">' + "".join(
            f'<tspan x="{w/2}" dy="{0 if i == 0 else 22}">{escape(line)}</tspan>' for i, line in enumerate(title_lines)
        ) + "</text>"
        sub_y += 13
    else:
        title_markup = f'<text x="{w/2}" y="{title_y}" text-anchor="middle" class="{title_cls}">{escape(title_lines[0])}</text>'
    sub_markup = ""
    if sub:
        max_sub_chars = max(18, int((w - 30) / 7.2))
        sub_lines = split_lines(sub, max_sub_chars, 2)
        sub_markup = f'<text x="{w/2}" y="{sub_y}" text-anchor="middle" class="{sub_cls}">' + "".join(
            f'<tspan x="{w/2}" dy="{0 if i == 0 else 17}">{escape(line)}</tspan>' for i, line in enumerate(sub_lines)
        ) + "</text>"
    return (
        f'<g class="node-card" transform="translate({x} {y})" data-card-x="{x}" data-card-y="{y}" data-card-width="{w}" data-card-height="{h}">'
        f'<rect x="0" y="0" width="{w}" height="{h}" rx="16" class="{cls}"/>{status_markup}{title_markup}{sub_markup}</g>'
    )


def label(x: float, y: float, text: str) -> str:
    w = min(156.0, max(68.0, 18.0 + text_width(text, 5.8)))
    shown = text if 18 + text_width(text, 5.8) <= 156 else text[:22].rstrip() + "…"
    return f'<g class="edge-label"><rect x="{x-w/2:.1f}" y="{y-13}" width="{w:.1f}" height="22" rx="9" class="label"/><text x="{x}" y="{y+2}" text-anchor="middle" class="m">{escape(shown)}</text></g>'


def path(d: str, state: str = "", *, dashed: bool = False, arrow: bool = True) -> str:
    cls = "edge" if arrow else "rail"
    if state:
        cls += f" {state}"
    if dashed:
        cls += " dash"
    return f'<path d="{d}" class="{cls}"/>'


def h_edge(x1: float, y: float, x2: float, *, state: str = "", dashed: bool = False, text: str | None = None, label_y: float | None = None) -> str:
    result = path(f"M{x1} {y}H{x2}", state, dashed=dashed, arrow=True)
    if text:
        result += label((x1+x2)/2, label_y if label_y is not None else y-12, text)
    return result


def v_edge(x: float, y1: float, y2: float, *, state: str = "", dashed: bool = False, text: str | None = None, label_x: float | None = None) -> str:
    result = path(f"M{x} {y1}V{y2}", state, dashed=dashed, arrow=True)
    if text:
        result += label(label_x if label_x is not None else x, (y1+y2)/2-2, text)
    return result


def orth_edge(sx: float, sy: float, tx: float, ty: float, *, mid_y: float | None = None, mid_x: float | None = None, state: str = "", dashed: bool = False, text: str | None = None, lx: float | None = None, ly: float | None = None) -> str:
    if mid_y is not None:
        d = f"M{sx} {sy}V{mid_y}H{tx}V{ty}"
        default_lx, default_ly = (sx+tx)/2, mid_y-12
    else:
        mx = mid_x if mid_x is not None else (sx+tx)/2
        d = f"M{sx} {sy}H{mx}V{ty}H{tx}"
        default_lx, default_ly = mx, (sy+ty)/2
    result = path(d, state, dashed=dashed, arrow=True)
    if text:
        result += label(lx if lx is not None else default_lx, ly if ly is not None else default_ly, text)
    return result


def branch_down(source_x: float, source_y: float, targets: list[tuple[float,float,str,bool]], rail_y: float, *, trunk_state: str = "utility", trunk_label: str | None = None) -> str:
    xs = [t[0] for t in targets]
    result = path(f"M{source_x} {source_y}V{rail_y}", trunk_state, arrow=False)
    result += path(f"M{min(xs)} {rail_y}H{max(xs)}", trunk_state, arrow=False)
    if trunk_label:
        result += label(source_x, (source_y+rail_y)/2-2, trunk_label)
    for tx, ty, state, dashed in targets:
        result += path(f"M{tx} {rail_y}V{ty}", state, dashed=dashed, arrow=True)
    return result


def converge_down(sources: list[tuple[float,float,str,bool]], target_x: float, target_y: float, rail_y: float, *, trunk_state: str = "utility", trunk_label: str | None = None) -> str:
    xs = [s[0] for s in sources]
    result = ""
    for sx, sy, state, dashed in sources:
        result += path(f"M{sx} {sy}V{rail_y}", state, dashed=dashed, arrow=False)
    result += path(f"M{min(xs)} {rail_y}H{max(xs)}", trunk_state, arrow=False)
    result += path(f"M{target_x} {rail_y}V{target_y}", trunk_state, arrow=True)
    if trunk_label:
        result += label(target_x, (rail_y+target_y)/2-2, trunk_label)
    return result

# PWRC utility
body='<text x="90" y="82" class="e">PWRC UTILITY ARCHITECTURE · v1.0.0</text><text x="90" y="132" class="h">Utility powers the network. Stable assets fund relief.</text>'
body += card(545,185,350,110,'PWRC','Token-2022 utility','core',status='UTILITY ONLY',status_fill='#F1F8F4',status_stroke='#A2CDB6',status_color='#17653F')
body += v_edge(720,295,355,state='utility',text='meter',label_x=720)
body += card(490,355,460,115,'Utility Engine','Power Units · Entitlements · Credits · Consumption','surf')
children=[(105,'Access','tiers + entitlements'),(355,'AI / Compute','bounded budgets'),(605,'Services / API','metered usage'),(855,'Participation','programs + governance'),(1105,'Rewards','verified contribution')]
targets=[(x+112.5,525,'utility',False) for x,_,_ in children]
body += branch_down(720,470,targets,505,trunk_state='utility',trunk_label='route')
for x,t,s in children: body += card(x,525,225,125,t,s)
body += card(220,720,1000,105,'POWERCHAIN CORE','CRISIS · ENERGY · FINANCE · PAYMENTS · RWA · AI','surf')
write('pwrc-utility.svg',wrap('PWRC utility architecture','PWRC utility engine routes utility into access, compute, services, participation and rewards while financial authority remains separate.',body,'Source: PWRC Utility Architecture v1.0.0 · PWRC balance never grants treasury authority.'))

# Cross-chain
body='<text x="90" y="82" class="e">CROSS-CHAIN TRUST ROUTES</text><text x="90" y="132" class="h">No generic bridge switch. Each route has its own controls.</text>'
body += card(105,245,270,120,'Solana','PWRC · USDC · Token-2022','surf')
body += card(585,215,270,100,'PowerChain Router','policy + route registry','core')
body += card(1065,245,270,120,'Destination','approved EVM / Sui lane','surf')
body += h_edge(375,305,585,state='utility',text='bind route',label_y=286)
body += h_edge(855,305,1065,state='utility',text='authorize',label_y=286)
lower=[
    (120,'Circle CCTP V2','native USDC · provider fees live','SUPPORTED','#2457C5','capital',False),
    (555,'Chainlink CCIP','approved message/token lane','DISABLED','#66706A','utility',True),
    (990,'wPWRC · Sui','planned 1:1 utility representation','TBA','#C98A16','utility',True),
]
body += branch_down(720,315,[(x+165,520,state,dashed) for x,_,_,_,_,state,dashed in lower],445,trunk_state='utility',trunk_label='provider gate')
for x,t,s,st,bc,_,_ in lower:
    body += card(x,520,330,165,t,s,status=st,status_fill='#fff',status_stroke='#E3E6E2',status_color=bc)
write('cross-chain.svg',wrap('Cross-chain trust routes','Cross-chain routes use provider-specific policy, replay, finality, custody and audit controls.',body,'Source: PowerChain cross-chain security model v1.0.0 · Route limits, replay key, finality and audit status are mandatory before execution.'))

# Fee stack
body='<text x="90" y="82" class="e">FEE STACK · SIGNED QUOTE</text><text x="90" y="132" class="h">Every applicable fee is named before authorization.</text>'
xs=[130,375,620,865,1110]
fees=[('Principal','crisis capital','capital',False),('Service fee','only if configured','',True),('Token transfer fee','asset-specific','',True),('Network fee','Solana estimate','warn',False),('Provider fee','only if rail applies','',True)]
for x,(t,s,_,_) in zip(xs,fees): body += card(x,250,220,120,t,s)
sources=[(x+110,370,state,dashed) for x,(_,_,state,dashed) in zip(xs,fees)]
body += converge_down(sources,720,455,420,trunk_state='utility',trunk_label='quote inputs')
body += card(420,455,600,130,'Canonical Quote','quoteHash · policyVersion · feeScheduleVersion · expiry','core')
body += v_edge(720,585,650,state='trust',text='sign',label_x=720)
body += card(485,650,470,105,'Wallet / Payment Authorization','material changes require re-quote + re-simulation','surf')
write('fee-stack.svg',wrap('Fee stack and signed quote','Applicable fee components feed a canonical signed quote before user authorization.',body,'Source: PowerChain fee model v1.0.0 · The 5% success commission is charged from successful pool proceeds, not contributor checkout.'))

# Source of truth
body='<text x="90" y="82" class="e">SOURCE OF TRUTH &amp; RECONCILIATION</text><text x="90" y="132" class="h">Client intent is never authoritative settlement evidence.</text>'
coords=[(90,250,'Quote / intent','hash + policy',250),(385,250,'Wallet signature','authorized actor',250),(680,250,'Submitted tx','signature known',250),(975,250,'Authoritative RPC','chain evidence',350)]
for x,y,t,s,w in coords: body += card(x,y,w,110,t,s)
body += h_edge(340,305,385,state='capital',text='authorize',label_y=286)
body += h_edge(635,305,680,state='capital',text='submit',label_y=286)
body += h_edge(930,305,975,state='trust',text='confirm',label_y=286)
body += orth_edge(1150,360,720,460,mid_y=425,state='trust',text='parsed tx',lx=920,ly=408)
body += card(450,460,540,125,'Reconciliation Engine','program · signer · destination · amount · state · slot','core')
body += v_edge(720,585,655,state='trust',text='verified transition',label_x=720)
body += card(470,655,500,105,'Ledger / Audit / Impact','advance only after verified state','surf')
write('source-of-truth.svg',wrap('Source of truth and reconciliation','Authoritative RPC and reconciliation gate financial state advancement.',body,'Source: PowerChain reconciliation architecture v1.0.0 · Unknown outcome remains EXECUTION_UNKNOWN until reconciled.'))

# Token factory
body='<text x="90" y="82" class="e">TOKEN FACTORY · POLICY FIRST</text><text x="90" y="132" class="h">One factory. Safer defaults by issuer profile.</text>'
issuers=[(110,'Project','capped mint default'),(555,'Company','verified organization + multisig'),(1000,'Government','restricted-transfer review default')]
for x,t,s in issuers: body += card(x,225,330,125,t,s,'surf')
body += converge_down([(x+165,350,'utility',False) for x,_,_ in issuers],720,455,420,trunk_state='utility',trunk_label='issuer policy')
body += card(405,455,630,120,'Token-2022 Factory Policy','metadata · cap · mint authority · transfer controls · reserve policy','core')
children=[(170,'Fixed supply','mint authority revoked','trust'),(555,'Capped mint','policy-controlled issuance','utility'),(940,'Reserve backed','reserve + redemption policy required','warn')]
body += branch_down(720,575,[(x+165,650,state,False) for x,_,_,state in children],620,trunk_state='utility',trunk_label='approved mode')
for x,t,s,_ in children: body += card(x,650,330,120,t,s)
write('token-factory.svg',wrap('Token factory policy architecture','Project, company and government issuer profiles converge on a policy-first Token-2022 factory.',body,'Source: Token Factory Security v1.0.0 · Default planning cap and fee never bypass issuer, signer, reserve or compatibility review.'))

# Community rewards
body='<text x="90" y="82" class="e">COMMUNITY REWARD SYSTEM</text><text x="90" y="132" class="h">Reward verified contribution, not passive holding.</text>'
xs=[100,365,630,895,1160]
steps=[('Contribution','candidate event'),('Evidence','unique evidence IDs'),('Verification','verified state'),('Policy review','caps + challenge'),('Reward','manual settlement')]
widths=[200,200,200,200,180]
for x,(t,s),w in zip(xs,steps,widths): body += card(x,260,w,110,t,s)
for i in range(4):
    body += h_edge(xs[i]+widths[i],315,xs[i+1],state='trust' if i>=1 else 'utility',text=['evidence','verify','review','approve'][i],label_y=296)
body += orth_edge(1250,370,720,510,mid_y=455,state='trust',text='epoch budget',lx=980,ly=438)
body += card(260,510,920,180,'Epoch Controls','bounded budget · subject/org caps · duplicate/replay detection · challenge/reversal','surf',status='NO AUTO MINT',status_fill='#FFF9EE',status_stroke='#E3C889',status_color='#8D5E08')
write('community-rewards.svg',wrap('Community reward system','Verified contribution flows through evidence, verification, policy review and bounded reward settlement.',body,'Source: Community Rewards roadmap v1.0.0 · Rewards never grant treasury authority or automatically change trust status.'))

# Capital lifecycle
body='<text x="90" y="82" class="e">CAPITAL LIFECYCLE · DISTINCT STATES</text><text x="90" y="132" class="h">Raised is not released. Released is not verified impact.</text>'
labels=[('Need','verified requirement','risk'),('Funded','settled capital','capital'),('Available','unallocated','capital'),('Allocated','purpose-bound','capital'),('Escrowed','policy locked','warn'),('Released','authorized transfer','capital'),('Delivered','operational record',''),('Verified','evidence satisfied','trust'),('Reconciled','audit matched','trust')]
coords=[]
for i,(t,s,state) in enumerate(labels):
    row=0 if i<5 else 1
    col=i if i<5 else 8-i
    x=80+col*260; y=235+row*300
    coords.append((x,y)); body += card(x,y,210,105,t,s,'surf')
for i in range(4):
    x1,y1=coords[i];x2,y2=coords[i+1];state=labels[i+1][2]
    body += h_edge(x1+210,y1+52.5,x2,state=state,text='advance',label_y=y1+34)
x1,y1=coords[4];x2,y2=coords[5]
body += orth_edge(x1+105,y1+105,x2+105,y2,mid_y=455,state='capital',text='release',lx=1145,ly=438)
for i in range(5,8):
    x1,y1=coords[i];x2,y2=coords[i+1];state=labels[i+1][2]
    body += h_edge(x1,y1+52.5,x2+210,state=state,text=['delivery','verify','reconcile'][i-5],label_y=y1+34)
write('capital-lifecycle.svg',wrap('Capital lifecycle','Distinct financial and operational capital states advance only under explicit settlement, policy and evidence conditions.',body,'Source: CCN capital lifecycle v1.0.0 · State values must never be collapsed into one generic progress percentage.'))

# Data provenance
body='<text x="90" y="82" class="e">DATA PROVENANCE &amp; FRESHNESS</text><text x="90" y="132" class="h">Every operational value carries source identity and state.</text>'
tops=[
    (80,'Solana / Helius','settlement + chain events','LIVE','#F1F8F4','#D6E7DD','#17653F','trust'),
    (365,'Pyth / Providers','price observations','LIVE','#F1F8F4','#D6E7DD','#17653F','trust'),
    (650,'Field Evidence','documents · IoT · attestations','DEGRADED','#FFF9EE','#E5CF9D','#8D5E08','warn'),
    (935,'Application DB','workflow + policy records','LIVE','#F1F8F4','#D6E7DD','#17653F','trust'),
]
for x,t,s,st,sf,ss,sc,_ in tops: body += card(x,230,230,120,t,s,status=st,status_fill=sf,status_stroke=ss,status_color=sc)
body += converge_down([(x+115,350,state,False) for x,_,_,_,_,_,_,state in tops],720,445,415,trunk_state='trust',trunk_label='provenance')
body += card(475,445,490,120,'Provenance & Freshness Gate','sourceId · observedAt · updatedAt · latency · freshness · stale','core')
outs=[(160,'LIVE','authoritative + fresh','trust'),(475,'DEGRADED','stale / partial provider','warn'),(790,'UNAVAILABLE','no acceptable source',''),(1105,'DEMO','fixture only','warn')]
body += branch_down(720,565,[(x+90,650,state,False) for x,_,_,state in outs],620,trunk_state='trust',trunk_label='classify')
for x,t,s,_ in outs: body += card(x,650,180,100,t,s,'surf')
write('data-provenance.svg',wrap('Data provenance and freshness','Operational data is classified by source identity, observation time, freshness, latency and explicit mode.',body,'Source: PowerChain data contract v1.0.0 · Mainnet renders authoritative data or explicit DEGRADED / UNAVAILABLE; demo fixtures stay labeled DEMO.'))

# Solana market data
body='<text x="90" y="82" class="e">SOLANA TOKEN MARKET DATA</text><text x="90" y="132" class="h">On-chain supply. Jupiter market reference. Explicit provenance.</text>'
inputs=[
    (90,'Solana RPC','getTokenSupply · getSlot','capital',False),
    (555,'Jupiter Price API V3','usdPrice · 24h change · blockId','utility',False),
    (1020,'Jupiter Tokens V2','liquidity market metadata','utility',True),
]
for x,t,s,_,_ in inputs: body += card(x,225,330,125,t,s,'surf')
body += converge_down([(x+165,350,state,dashed) for x,_,_,state,dashed in inputs],720,465,425,trunk_state='utility',trunk_label='resolve')
body += card(440,465,560,125,'PowerChain Market Data Gate','mint validation · block lag · decimal match · provider divergence','core')
outputs=[
    (250,'On-chain truth','supplyAtomic · decimals','trust',None),
    (570,'Market reference','USD price · 24h · price block','utility',None),
    (890,'Liquidity enrichment','USD liquidity or null','warn','NO FAKE ZERO'),
]
body += branch_down(720,590,[(x+150,655,state,False) for x,_,_,state,_ in outputs],625,trunk_state='trust',trunk_label='classify')
for x,t,s,_,st in outputs:
    body += card(x,655,300,120,t,s,'surf',status=st,status_fill='#FFF9EE',status_stroke='#E3C889',status_color='#8D5E08') if st else card(x,655,300,120,t,s,'surf')
write('solana-market-data.svg',wrap('Solana token market data','Token supply and decimals are sourced from Solana RPC while Jupiter Price API V3 supplies reference price, 24h change and block reference; Jupiter Tokens V2 can enrich liquidity.',body,'Source: PowerChain Solana data architecture v1.0.0 · Missing liquidity remains null; payment execution uses signed quotes, not display prices.'))

print(f"generated {len(list(OUTPUTS[0].glob('*.svg')))} architecture SVGs in both public trees")

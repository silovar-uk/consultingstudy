(function bootCertLab() {
  'use strict';
  const D=window.CERT_LAB_DATA;
  if(!D) return;
  const esc = (v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n=>String(n).padStart(2,'0');
  const trackQs = id => D.questions.filter(q=>D.moduleById(q.moduleId)?.trackId===id);
  const dayText = date => new Date(date).toLocaleDateString('ja-JP',{month:'numeric',day:'numeric'});
  const getStats=(s,id)=>{
    const qs=trackQs(id), recent=qs.map(q=>(s.attempts||[]).filter(a=>a.id===q.id).at(-1)).filter(Boolean);
    const correct=recent.filter(a=>a.correct).length;
    const now=Date.now();
    const due=recent.filter(a=>!a.nextAt || Date.parse(a.nextAt)<=now);
    return {total:qs.length,answered:recent.length,correct,due:due.length,remaining:qs.length-recent.length};
  };
  const weekly=(track,index)=>{
    const m=track.modules;
    const items=[
      ['目的と現在地',`目指す業務を決め、${track.exam}の公式出題範囲を確認。診断を解く。`],
      ['第1単元を理解',`${m[0].title}：説明を読み、例題を自分の言葉にする。`],
      ['第1単元を解く',`${m[0].title}：独自クイズに取り組み、間違いを記録。`],
      ['第1成果物を作る',`${m[0].title}の実務演習を一枚にまとめ、第三者に説明。`],
      ['第2単元を理解',`${m[1].title}：判断の型を学ぶ。`],
      ['第2単元を解く',`${m[1].title}：理由付きでクイズを解き、誤答を復習。`],
      ['横断ケースで試す','既存の財務・問題解決教材も使い、現実の課題を分析。'],
      ['第3単元を理解',`${m[2].title}：資料と業務への接続を確認。`],
      ['第3単元を解く',`${m[2].title}：クイズと短いメモで理解を測る。`],
      ['統合成果物を作る',`${m.map(x=>x.title).join('・')}を組み合わせた一枚を作る。`],
      ['弱点を再診断','誤答を解き直す。正答率だけでなく説明可能性を点検。'],
      ['資格投資を判断','取得・学習のみ・見送りを、時間と成果から選択。']
    ];
    return items[index];
  };
  function mount(root,state,api={}) {
    if(!state.certLab||typeof state.certLab!=='object') state.certLab={};
    const s=state.certLab;
    if(!D.trackById(s.trackId))s.trackId=({finance:'bookkeeping',materials:'statistics',business:'diagnosis',consulting:'pmp'}[state.profile?.goal]||'pmp');
    s.tab=s.tab||'today';
    s.moduleId=D.moduleById(s.moduleId)?.trackId===s.trackId?s.moduleId:D.trackById(s.trackId).modules[0].id;
    s.attempts=Array.isArray(s.attempts)?s.attempts:[];
    s.notes=s.notes&&typeof s.notes==='object'?s.notes:{};
    s.completed=Array.isArray(s.completed)?s.completed:[];
    s.weeklyDone=Array.isArray(s.weeklyDone)?s.weeklyDone:[];
    s.diagnostic=s.diagnostic&&typeof s.diagnostic==='object'?s.diagnostic:{};
    s.mode=s.mode||'new';
    s.certDecision=s.certDecision||'learn';
    const track=D.trackById(s.trackId);
    const active=D.moduleById(s.moduleId);
    const stats=getStats(s,track.id);
    const moduleQuizzes=D.questionsFor(active.id);
    const save=()=>api.persist?.();
    const nav= api.navigate||(()=>{});
    const toast=api.toast||(()=>{});
    const act=(label,action,cls='')=>`<button type="button" class="cl-button ${cls}" data-cl-action="${action}">${esc(label)}</button>`;
    const quote=(text)=>esc(text).replace(/\n/g,'<br>');
    const source=ref=>`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.name)} ↗</a>`;
    const lessonDone=id=>s.completed.includes(id);
    const recentAttempt=id=>s.attempts.filter(a=>a.id===id).at(-1);
    const dueQuestions=()=>{
      const now=Date.now();
      return trackQs(s.trackId).filter(q=>{let a=recentAttempt(q.id);return a&&(!a.nextAt||Date.parse(a.nextAt)<=now);});
    };
    const pickNext=(mode=s.mode,exclude)=>{
      const all=trackQs(s.trackId).filter(q=>q.id!==exclude);
      const due=dueQuestions().filter(q=>q.id!==exclude);
      const unseen=all.filter(q=>!recentAttempt(q.id));
      return (mode==='review'?due[0]:mode==='new'?unseen[0]:(due[0]||unseen[0]||all[0]))||null;
    };
    const percent = track.modules.filter(m=>lessonDone(m.id)).length / track.modules.length *100;
    const tabs=[['today','今日'],['curriculum','教材'],['quiz','クイズ'],['work','成果物'],['strategy','資格の判断']];
    function render(){
      const tr=D.trackById(s.trackId), info=getStats(s,tr.id);
      const header=`<section class="cl-heading"><div><p class="cl-eyebrow">CONSULTING STUDY / SKILL × CERTIFICATION</p><h2>資格・実務ラボ</h2><p>資格に受かる前に、仕事で使えるようになる。読む → 解く → つくる → 復習する。</p></div><div class="cl-select-wrap"><label for="clTrack">学ぶ領域</label><select id="clTrack">${D.tracks.map(t=>`<option value="${t.id}" ${s.trackId===t.id?'selected':''}>${esc(t.short)}｜${esc(t.name)}</option>`).join('')}</select></div></section>
      <div class="cl-switcher" role="navigation" aria-label="資格学習メニュー">${tabs.map(([id,label])=>`<button type="button" class="cl-tab ${s.tab===id?'active':''}" data-cl-tab="${id}" ${s.tab===id?'aria-current="page"':''}>${label}${id==='quiz'&&info.due?` <span class="cl-count">${info.due}</span>`:''}</button>`).join('')}</div>`;
      root.innerHTML=`<div class="cert-lab">${header}<div id="cl-panel" class="cl-panel">${s.tab==='today'?today(tr,info):s.tab==='curriculum'?curriculum(tr):s.tab==='quiz'?quiz(tr):s.tab==='work'?work(tr):strategy(tr)}</div><footer class="cl-footnote">問題とケースは本サイト作成の独自教材です。公式の模擬試験・合格判定ではありません。学習ログはこのブラウザに保存され、既存の「設定・データ」からJSONでバックアップできます。最終更新：2026年10月19日。</footer></div>`;
      root.onclick=onClick;
      root.onchange=onChange;
    }
    function today(tr,info){
      const nextModule=tr.modules.find(m=>!lessonDone(m.id))||tr.modules[0];
      const nextQ=pickNext('mixed');
      const due=dueQuestions();
      const completedWeeks=s.weeklyDone.filter(x=>x.startsWith(tr.id+':')).length;
      return `<section class="cl-hero"><div><p class="cl-eyebrow">TODAY'S BEST NEXT STEP</p><h3>${due.length?'忘れかけた知識から取り戻す。':'次の一歩を、仕事につなげる。'}</h3><p>${due.length?`${due.length}問の復習対象があります。先に解き直して理解を確かめます。`:`${esc(nextModule.title)}を学び、短い実務演習へ進みましょう。`}</p><div class="cl-actions">${act(due.length?'復習を始める':'今日の講義を開く',due.length?'due':'next-lesson','primary')}${act('7問の現在地診断','diagnostic','ghost')}</div></div><div class="cl-hero-mark"><span>${Math.round(percent)}%</span><small>単元の学習チェック</small></div></section>
      <div class="cl-metrics"><div><strong>${tr.modules.length}</strong><small>学習単元</small></div><div><strong>${info.answered}/${info.total}</strong><small>回答済み問題</small></div><div><strong>${info.due}</strong><small>復習対象</small></div><div><strong>${completedWeeks}/12</strong><small>週間タスク</small></div></div>
      <section class="cl-card"><div class="cl-card-header"><div><p class="cl-eyebrow">YOUR TRACK</p><h3>${esc(tr.exam)}の実務学習</h3></div><span class="cl-chip">${esc(tr.for)}</span></div><p>${esc(tr.summary)}</p><p class="cl-warning">確認事項：${esc(tr.caveat)}</p><p class="cl-source">一次情報：${source(D.references[tr.id])}</p></section>
      <section class="cl-card"><div class="cl-card-header"><div><p class="cl-eyebrow">THE 12-WEEK PLAN</p><h3>週ごとに一つ、成果を残す</h3></div><span class="cl-chip">週2〜3時間を想定した提案</span></div><p class="cl-muted">受験日までの合格計画ではなく、実務の能力を見極めるための12週間。自分のペースでチェックできます。</p><div class="cl-week-grid">${Array.from({length:12},(_,i)=>{let item=weekly(tr,i),key=tr.id+':'+i,done=s.weeklyDone.includes(key);return `<button type="button" class="cl-week ${done?'done':''}" data-cl-week="${key}" aria-pressed="${done}"><span class="cl-week-num">W${pad(i+1)} ${done?'✓':''}</span><strong>${esc(item[0])}</strong><span>${esc(item[1])}</span></button>`;}).join('')}</div></section>
      <div class="cl-link-row">${act('教材一覧を開く','curriculum','ghost')}${act('資格を取らない選択も検討する','strategy','ghost')}</div>`;
    }
    function curriculum(tr){
      const m=D.moduleById(s.moduleId),qs=D.questionsFor(m.id),note=Boolean(s.notes[m.id]?.text?.trim());
      return `<div class="cl-two-column"><aside class="cl-module-list" aria-label="単元一覧"><h3>学習単元</h3>${tr.modules.map((x,i)=>`<button type="button" class="cl-module-item ${s.moduleId===x.id?'selected':''}" data-cl-module="${x.id}"><span class="cl-module-index">${pad(i+1)}</span><span><strong>${esc(x.title)}</strong><small>${x.minutes}分・独自問題2問</small></span><span aria-hidden="true">${lessonDone(x.id)?'✓':'›'}</span></button>`).join('')}</aside><article class="cl-card cl-lesson"><p class="cl-eyebrow">LESSON / ${esc(tr.short)}</p><h3>${esc(m.title)}</h3><p class="cl-lead">${esc(m.why)}</p><div class="cl-example"><strong>具体例</strong><p>${esc(m.example)}</p></div><h4>重要概念を3つだけ押さえる</h4><dl class="cl-concepts">${m.concepts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="cl-case"><p class="cl-eyebrow">PRACTICAL TRANSFER</p><h4>仕事の形にする</h4><p>${esc(m.task)}</p><div class="cl-rubrics">${m.checks.map(x=>`<span>□ ${esc(x)}</span>`).join('')}</div></div><p class="cl-source">出題範囲の参照：${source(m.source)}</p><div class="cl-actions">${act('この単元のクイズを解く','module-quiz','primary')}${act(note?'保存済みの成果物を開く':'成果物をつくる','module-work','ghost')}${act(lessonDone(m.id)?'学習済み ✓':'読了チェックを付ける','complete','secondary')}</div><p class="cl-muted">このチェックは読了の自己申告です。試験合格・実務能力の認定ではありません。</p><div class="cl-mini-list"><strong>この単元の問題</strong>${qs.map(q=>`<button type="button" data-cl-question="${q.id}">${esc(q.stem)} <span>→</span></button>`).join('')}</div></article></div>`;
    }
    function quiz(tr){
      if(s.mode==='diagnostic')return diagnostic();
      let q=D.questions.find(q=>q.id===s.quizId&&D.moduleById(q.moduleId)?.trackId===tr.id);
      if(!q)q=pickNext(s.mode);
      const available = s.mode==='review'?dueQuestions():s.mode==='new'?trackQs(tr.id).filter(q=>!recentAttempt(q.id)):trackQs(tr.id);
      if(!q|| (s.mode!=='mixed'&&!available.some(x=>x.id===q.id))){
        q=available[0]||null;
      }
      s.quizId=q?.id||null;
      const modes=[['new','未回答'],['review','復習'],['mixed','すべて']];
      if(!q)return `<section class="cl-empty"><h3>${s.mode==='review'?'いま期限の来た復習はありません':'未回答の問題はありません'}</h3><p>復習は正答・自信度をもとに、1・3・7・14日後を目安に提示します。実際の試験成績を予測するものではありません。</p><div class="cl-actions">${act('すべての問題から解く','all-quiz','primary')}${act('教材へ戻る','curriculum','ghost')}</div></section>`;
      const revealed=s.revealId===q.id;
      const last=recentAttempt(q.id);
      return `<div class="cl-quiz-layout"><section class="cl-card cl-quiz-card"><div class="cl-card-header"><div><p class="cl-eyebrow">ORIGINAL PRACTICE QUESTION</p><h3>理由まで理解するクイズ</h3></div><span class="cl-chip">${esc(D.moduleById(q.moduleId).title)}</span></div><div class="cl-modes">${modes.map(([id,title])=>`<button type="button" class="${s.mode===id?'active':''}" data-cl-mode="${id}">${title}</button>`).join('')}${act('7問診断','diagnostic','ghost')}</div><p class="cl-question">${esc(q.stem)}</p><fieldset class="cl-options" ${revealed?'disabled':''}><legend class="sr-only">回答を選択</legend>${q.choices.map((c,i)=>`<button type="button" class="cl-option ${revealed?(i===q.answer?'correct':s.choice===i?'wrong':''):''}" data-cl-choice="${i}" ${revealed?'disabled':''}><span>${'ABCD'[i]}</span>${esc(c)}</button>`).join('')}</fieldset>${revealed?`<div class="cl-feedback" role="status"><strong>${s.choice===q.answer?'正解。理由まで言えるか確認しよう。':'ここは復習しよう。'}</strong><p>${esc(q.why)}</p><p class="cl-muted">${esc(q.trap)}</p><p class="cl-source">関連資料：${source(D.moduleById(q.moduleId).source)}</p>${last?`<small>次の復習：${dayText(last.nextAt)}</small>`:''}<div class="cl-actions">${act('次の問題','next-question','primary')}${act('解説を教材で確認','back-lesson','ghost')}</div></div>`:`<p class="cl-muted">選択肢を押すと採点と理由が表示されます。独自問題であり、公式過去問ではありません。</p>`}</section><aside class="cl-card cl-side"><p class="cl-eyebrow">RECALL SYSTEM</p><h3>間違えた問題が次に出る</h3><p>誤答は翌日以降、正答は3日・7日・14日後を目安に再表示。回答履歴を端末内に記録します。</p><p class="cl-muted">予定は固定間隔による学習補助であり、記憶定着を保証するものではありません。</p><div class="cl-mini-stats"><span>解答した問題 <b>${stats.answered}</b></span><span>最新回答が正解 <b>${stats.correct}</b></span><span>復習対象 <b>${stats.due}</b></span></div></aside></div>`;
    }
    function diagnostic(){
      const ids=['pmp','bookkeeping','statistics','diagnosis','it','ecba','scrum'];
      const answered=ids.filter(id=>s.diagnostic[id]!==undefined).length;
      if(answered===7){const errs=ids.filter(id=>!s.diagnostic[id]);return `<section class="cl-card"><p class="cl-eyebrow">SKILL CHECK / 7 QUESTIONS</p><h3>現在地：7問中${7-errs.length}問正解</h3><p>得点はこの7問だけの正答数です。試験の合格見込みや、職業適性の判定ではありません。</p><div class="cl-diagnostic-grid">${ids.map(id=>`<div class="cl-diag-result"><span>${esc(D.trackById(id).short)}</span><strong>${s.diagnostic[id]?'正答':'復習候補'}</strong></div>`).join('')}</div>${errs.length?`<p>復習候補：${errs.map(id=>esc(D.trackById(id).name)).join('、')}</p>`:''}<div class="cl-actions">${act('今の学習領域の問題へ','all-quiz','primary')}${act('7問診断をやり直す','diagnostic-reset','ghost')}</div></section>`;}
      const id=ids.find(x=>s.diagnostic[x]===undefined),quest=trackQs(id)[0];
      return `<section class="cl-card cl-diagnostic"><p class="cl-eyebrow">BASELINE / ${answered+1} OF 7</p><progress value="${answered}" max="7" aria-label="診断の進捗"></progress><h3>${esc(D.trackById(id).name)}</h3><p class="cl-question">${esc(quest.stem)}</p><div class="cl-options">${quest.choices.map((x,i)=>`<button type="button" class="cl-option" data-cl-diagnostic-choice="${i}" data-id="${id}"><span>${'ABCD'[i]}</span>${esc(x)}</button>`).join('')}</div><p class="cl-muted">全7領域を1問ずつ確認する短い出発点の診断です。実際の得意・不得意を確定できる検査ではありません。</p></section>`;
    }
    function work(tr){
      const m=D.moduleById(s.moduleId),saved=s.notes[m.id]||{},done=saved.checks||[];
      return `<div class="cl-two-column"><aside class="cl-module-list"><h3>成果物を選ぶ</h3>${tr.modules.map(x=>`<button type="button" class="cl-module-item ${s.moduleId===x.id?'selected':''}" data-cl-module="${x.id}"><span>▣</span><span><strong>${esc(x.title)}</strong><small>${s.notes[x.id]?.text?.trim()?'下書き保存済み':'未着手'}</small></span></button>`).join('')}</aside><article class="cl-card"><p class="cl-eyebrow">WORK PRODUCT / SELF REVIEW</p><h3>${esc(m.title)}の実務メモ</h3><p>${esc(m.task)}</p><p class="cl-muted">架空データまたは公開情報を使用してください。業務上の秘密・個人情報は入力しないでください。</p><label class="cl-input-label" for="clWorkText">成果物の下書き</label><textarea id="clWorkText" class="cl-textarea" rows="12" placeholder="${esc(m.template)}">${esc(saved.text||'')}</textarea><div class="cl-checks"><strong>セルフレビュー（自動採点ではありません）</strong>${m.checks.map((v,i)=>`<label><input type="checkbox" data-cl-check="${i}" ${done.includes(i)?'checked':''}> ${esc(v)}</label>`).join('')}</div><div class="cl-actions">${act('この端末に保存','save-note','primary')}${act('記入の型をコピー','copy-template','ghost')}${act('Markdownを書き出す','download-note','ghost')}</div>${saved.at?`<p class="cl-muted">最終保存：${esc(new Date(saved.at).toLocaleString('ja-JP'))}</p>`:''}<p class="cl-source">参考資料：${source(m.source)}</p></article></div>`;
    }
    function strategy(tr){
      return `<div class="cl-strategy"><section class="cl-card"><p class="cl-eyebrow">QUESTION THE ASSUMPTION</p><h3>資格を取らない選択肢も、同じ条件で比較する</h3><p>「合格すること」と「仕事の判断が変わること」は別。受験料、研修、維持費だけでなく、勉強の時間を実務演習に使う場合も比べます。</p><div class="cl-three"><div><strong>知識を獲得する</strong><span>試験範囲を教材として使う。受験しなくても可能。</span></div><div><strong>能力を証明する</strong><span>採用・上司・顧客が資格をどう評価するか、一次情報で確かめる。</span></div><div><strong>機会を得る</strong><span>応募や案件に必須条件か。歓迎条件と分ける。</span></div></div><h4>今回の投資方針</h4><div class="cl-decision">${[['learn','まず学ぶ。受験は未決定'],['exam','受験も検討する'],['practice','実務成果物を優先する']].map(([id,l])=>`<label><input type="radio" name="clDecision" value="${id}" ${s.certDecision===id?'checked':''}> ${l}</label>`).join('')}</div><p class="cl-warning">${esc(tr.caveat)}</p><p class="cl-source">受験制度：${source(D.references[tr.id])}</p></section>
      <section class="cl-card"><p class="cl-eyebrow">90-DAY DECISION FRAME</p><h3>資格を取るか、90日で決める</h3><ol class="cl-timeline"><li><strong>1〜14日</strong>公式出題範囲と受験条件を確認し、現在地診断を行う。</li><li><strong>15〜30日</strong>試験学習と実務演習を同じ時間で比較する。</li><li><strong>31〜60日</strong>実際に使える資料を作成し、第三者へ説明する。</li><li><strong>61〜90日</strong>上達したこと、費用、求められる資格条件を検証して意思決定する。</li></ol><p class="cl-muted">12週間の学習計画は学習支援用です。合格に必要な学習時間や受験資格を満たす保証ではありません。</p>${act('今日の学習に戻る','today','primary')}</section></div>`;
    }
    function onChange(event){
      const t=event.target;
      if(t.id==='clTrack'){s.trackId=t.value;s.moduleId=D.trackById(t.value).modules[0].id;s.quizId=null;s.revealId=null;save();render();}
      if(t.name==='clDecision'){s.certDecision=t.value;save();}
    }
    function onClick(event){
      const t=event.target.closest('button');
      if(!t||!root.contains(t))return;
      if(t.dataset.clTab){s.tab=t.dataset.clTab;s.revealId=null;save();render();return;}
      if(t.dataset.clModule){s.moduleId=t.dataset.clModule;s.quizId=null;s.revealId=null;save();render();return;}
      if(t.dataset.clWeek){let a=s.weeklyDone,k=t.dataset.clWeek;s.weeklyDone=a.includes(k)?a.filter(x=>x!==k):[...a,k];save();render();return;}
      if(t.dataset.clQuestion){s.quizId=t.dataset.clQuestion;s.tab='quiz';s.mode='mixed';s.revealId=null;save();render();return;}
      if(t.dataset.clMode){s.mode=t.dataset.clMode;s.quizId=null;s.revealId=null;save();render();return;}
      if(t.dataset.clChoice!==undefined&&s.tab==='quiz'){
        const q=D.questions.find(x=>x.id===s.quizId);
        if(!q||s.revealId===q.id)return;
        const choice=Number(t.dataset.clChoice),correct=choice===q.answer;
        const previous=s.attempts.filter(a=>a.id===q.id).at(-1);
        const streak=correct?(previous?.correct?(previous.streak||1)+1:1):0;
        const days=correct?[3,7,14][Math.min(streak-1,2)]:1;
        const next=new Date(Date.now()+days*86400000).toISOString();
        s.attempts.push({id:q.id,choice,correct,streak,nextAt:next,at:new Date().toISOString()});
        if(s.attempts.length>600)s.attempts=s.attempts.slice(-600);
        s.choice=choice;s.revealId=q.id;save();render();return;
      }
      if(t.dataset.clDiagnosticChoice!==undefined){
        const ids=['pmp','bookkeeping','statistics','diagnosis','it','ecba','scrum'];
        const id=t.dataset.id,q=trackQs(id)[0];
        if(!ids.includes(id)||s.diagnostic[id]!==undefined)return;
        s.diagnostic[id]=Number(t.dataset.clDiagnosticChoice)===q.answer;
        save();render();return;
      }
      switch(t.dataset.clAction){
        case 'next-lesson':s.tab='curriculum';s.moduleId=D.trackById(s.trackId).modules.find(m=>!lessonDone(m.id))?.id||s.moduleId;break;
        case 'due':s.tab='quiz';s.mode='review';s.quizId=null;s.revealId=null;break;
        case 'diagnostic':s.tab='quiz';s.mode='diagnostic';s.quizId=null;s.revealId=null;break;
        case 'diagnostic-reset':s.diagnostic={};s.mode='diagnostic';break;
        case 'curriculum':s.tab='curriculum';break;
        case 'strategy':s.tab='strategy';break;
        case 'today':s.tab='today';break;
        case 'module-quiz':s.tab='quiz';s.mode='mixed';s.quizId=D.questionsFor(s.moduleId)[0]?.id;s.revealId=null;break;
        case 'module-work':s.tab='work';break;
        case 'complete':s.completed=lessonDone(s.moduleId)?s.completed.filter(id=>id!==s.moduleId):[...s.completed,s.moduleId];break;
        case 'all-quiz':s.tab='quiz';s.mode='mixed';s.quizId=null;s.revealId=null;break;
        case 'next-question':{
          const q=pickNext(s.mode,s.quizId)||trackQs(s.trackId).find(q=>q.id!==s.quizId)||trackQs(s.trackId)[0];
          s.quizId=q?.id||null;s.revealId=null;break;
        }
        case 'back-lesson':s.tab='curriculum';s.moduleId=D.questions.find(q=>q.id===s.quizId)?.moduleId||s.moduleId;s.revealId=null;break;
        case 'save-note':{
          const text=root.querySelector('#clWorkText')?.value||'';
          const checks=[...root.querySelectorAll('[data-cl-check]:checked')].map(x=>Number(x.dataset.clCheck));
          if(text.trim().length<12){toast('メモを12文字以上入力してください。','error');return;}
          s.notes[s.moduleId]={text,checks,at:new Date().toISOString()};
          save();toast('実務メモを端末内に保存しました。');render();return;
        }
        case 'copy-template':{
          const value=D.moduleById(s.moduleId).template;
          navigator.clipboard?.writeText(value).then(()=>toast('記入の型をコピーしました。')).catch(()=>fallbackCopy(value));
          return;
        }
        case 'download-note':{
          const m=D.moduleById(s.moduleId),text=root.querySelector('#clWorkText')?.value||'';
          const body='# '+m.title+'\n\n'+(text.trim()||m.template)+'\n\n出典: '+m.source.url+'\n';
          const blob=new Blob([body],{type:'text/markdown;charset=utf-8'});
          const href=URL.createObjectURL(blob),a=document.createElement('a');
          a.href=href;a.download='consulting-study-'+m.id+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);return;
        }
        default:return;
      }
      save();render();
    }
    function fallbackCopy(text){
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('記入の型をコピーしました。');}finally{ta.remove();}
    }
    render();
  }
  window.CERT_LAB={mount};
})();

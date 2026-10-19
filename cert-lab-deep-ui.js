(function bootDeepUI(){
'use strict';
const DB=window.CERT_LAB_DEEP;
if(!DB)return;
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
const labelType=q=>DB.formats[q.format]||q.format;
const pad=n=>String(n).padStart(2,'0');
function mount(root,certState,api={},trackId='pmp'){
  if(!root)return;
  const S=certState.deepPractice&&typeof certState.deepPractice==='object'?certState.deepPractice:(certState.deepPractice={});
  S.view=S.view==='case'?'case':'drill';
  S.attempts=Array.isArray(S.attempts)?S.attempts:[];
  S.drafts=S.drafts&&typeof S.drafts==='object'?S.drafts:{};
  S.selected=S.selected&&typeof S.selected==='object'?S.selected:{};
  S.selfChecks=S.selfChecks&&typeof S.selfChecks==='object'?S.selfChecks:{};
  S.caseIndex=Number.isInteger(S.caseIndex)&&S.caseIndex>=0&&S.caseIndex<DB.caseStudy.stages.length?S.caseIndex:0;
  const save=()=>api.persist?.();
  const toast=(txt,level)=>api.toast?.(txt,level);
  const trackItems=DB.trackDrills(trackId);
  if(certState.practiceStartModuleId){
    const match=trackItems.find(q=>q.moduleId===certState.practiceStartModuleId);
    if(match){S.view='drill';S.selected[trackId]=match.id;}
    certState.practiceStartModuleId=null;
  }
  if(!trackItems.some(q=>q.id===S.selected[trackId]))S.selected[trackId]=trackItems[0]?.id;
  let message='';
  const button=(title,action,variant='')=>`<button type="button" class="cl-button ${variant}" data-dp-action="${action}">${esc(title)}</button>`;
  const latest=id=>S.attempts.filter(a=>a.id===id).at(-1)||null;
  const current=()=>S.view==='case'?DB.caseStudy.stages[S.caseIndex]:DB.byId(S.selected[trackId]);
  function table(data){
    if(!data)return '';
    return `<div class="cl-deep-table-wrap" role="region" aria-label="演習用資料" tabindex="0"><table class="cl-deep-table"><thead><tr>${data.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${data.rows.map(r=>`<tr>${r.map((x,i)=>i?`<td>${esc(x)}</td>`:`<th scope="row">${esc(x)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function inputForm(q){
    const draft=S.drafts[q.id];
    if(q.format==='number')return `<label class="cl-input-label" for="dpNumber">数値を入力（単位：${esc(q.unit)}）</label><div class="cl-deep-number"><input id="dpNumber" type="text" inputmode="decimal" autocomplete="off" placeholder="例：35 または -5" value="${esc(typeof draft==='string'?draft:'')}"><span>${esc(q.unit)}</span></div>`;
    if(q.format==='choice')return `<fieldset class="cl-deep-choice"><legend>最も適切なものを1つ選択</legend>${q.choices.map((x,i)=>`<label class="cl-deep-option"><input type="radio" name="dpSingle" value="${i}" ${String(draft)===String(i)?'checked':''}><span>${'ABCD'[i]}　${esc(x)}</span></label>`).join('')}</fieldset>`;
    if(q.format==='multi')return `<fieldset class="cl-deep-choice"><legend>該当するものをすべて選択（正解数は非公開）</legend>${q.choices.map((x,i)=>`<label class="cl-deep-option"><input type="checkbox" name="dpMulti" value="${i}" ${Array.isArray(draft)&&draft.includes(i)?'checked':''}><span>${'ABCD'[i]}　${esc(x)}</span></label>`).join('')}</fieldset>`;
    if(q.format==='order')return `<div class="cl-deep-orders"><p class="cl-muted">各欄で「何を何番目に行うか」を選択します。項目は重複できません。</p>${q.items.map((_,position)=>`<label for="dpOrder${position}"><strong>${position+1}番目</strong><select id="dpOrder${position}" data-dp-order="${position}"><option value="">選択してください</option>${q.items.map((item,index)=>`<option value="${index}" ${Array.isArray(draft)&&draft[position]===index?'selected':''}>${esc(item)}</option>`).join('')}</select></label>`).join('')}</div>`;
    return `<label class="cl-input-label" for="dpText">自分の根拠と結論を書く（機械採点なし）</label><textarea class="cl-deep-textarea" id="dpText" rows="7" placeholder="事実・仮説・判断・確認事項を分けて記述する">${esc(typeof draft==='string'?draft:'')}</textarea><p class="cl-muted">業務上の機密情報・個人情報は入力せず、公開情報または架空の事例だけを扱ってください。</p>`;
  }
  function getInput(q){
    if(q.format==='number')return root.querySelector('#dpNumber')?.value??'';
    if(q.format==='choice'){const selected=root.querySelector('input[name="dpSingle"]:checked');return selected?Number(selected.value):null;}
    if(q.format==='multi')return [...root.querySelectorAll('input[name="dpMulti"]:checked')].map(el=>Number(el.value));
    if(q.format==='order')return [...root.querySelectorAll('[data-dp-order]')].map(el=>el.value===''?null:Number(el.value));
    return root.querySelector('#dpText')?.value??'';
  }
  function stash(){
    const q=current();
    if(!q||!root.querySelector('#dpNumber,#dpText,input[name="dpSingle"],input[name="dpMulti"],[data-dp-order]'))return;
    S.drafts[q.id]=getInput(q);
    save();
  }
  function feedback(q){
    if(S.revealId!==q.id)return '';
    const entry=latest(q.id);
    if(!entry)return '';
    const manual=entry.status==='manual';
    const result=manual?'記述を保存しました。自己評価で確認してください。':entry.status==='correct'?'正解です。理由も確認しましょう。':'解答を確認し、考え方を振り返りましょう。';
    const answers=(q.format==='number')?`模範数値：${q.answer} ${q.unit}`:q.format==='multi'?`該当する選択肢：${q.answer.map(x=>'ABCD'[x]).join('・')}`:q.format==='choice'?`該当する選択肢：${'ABCD'[q.answer]}`:q.format==='order'?`基本順序：${q.answer.map((x,i)=>`${i+1}. ${q.items[x]}`).join(' → ')}`:'';
    const reasons=q.whyChoices?`<div class="cl-deep-explain"><h4>選択肢ごとの判断根拠</h4>${q.whyChoices.map((r,i)=>`<p><b>${'ABCD'[i]}　${esc(q.choices[i])}</b>：${esc(r)}</p>`).join('')}</div>`:'';
    const rubrics=manual?`<div class="cl-deep-rubric"><h4>セルフレビュー（正解と判定しません）</h4>${q.rubric.map((r,i)=>`<label><input type="checkbox" data-dp-self="${i}" ${S.selfChecks[q.id]?.includes(i)?'checked':''}> ${esc(r)}</label>`).join('')}<p class="cl-muted">${esc(q.reviewNote||'評価基準と比べて、足りない情報を補ってください。')}</p></div>`:'';
    return `<section class="cl-deep-feedback" role="status"><h3>${esc(result)}</h3>${answers?`<p><strong>${esc(answers)}</strong></p>`:''}${manual?`<div class="cl-deep-model"><h4>参考となる模範例（一例）</h4><p>${esc(q.model)}</p></div>`:`<p>${esc(q.explanation)}</p>`}${reasons}${rubrics}<p class="cl-muted">この結果は個人学習用です。公式試験の成績・実務能力を保証する判定ではありません。</p><div class="cl-actions">${button('回答を見直す','retry','ghost')}${button(S.view==='case'?'次の場面へ':'次の実戦問題へ','next','primary')}${button('関連教材を見る','module','ghost')}</div></section>`;
  }
  function caseFacts(){
    return `<details class="cl-deep-case-facts" ${S.caseIndex===0?'open':''}><summary>共通ケース資料｜${esc(DB.caseStudy.name)}</summary><div class="cl-deep-case-intro"><p>${esc(DB.caseStudy.brief)}</p><p class="cl-muted">${esc(DB.caseStudy.disclaimer)}</p>${DB.caseStudy.facts.map(x=>`<h4>${esc(x.title)}</h4>${table(x)}`).join('')}<h4>追加の仮定</h4><ul>${DB.caseStudy.assumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul></div></details>`;
  }
  function render(){
    const q=current();
    const latestDrills=trackItems.filter(x=>latest(x.id));
    const caseDone=DB.caseStudy.stages.filter(x=>latest(x.id));
    const successes=DB.items.filter(x=>latest(x.id)?.status==='correct').length;
    const submitted=DB.items.filter(x=>latest(x.id)).length;
    const manual=DB.items.filter(x=>latest(x.id)?.status==='manual').length;
    const modeSwitch=`<div class="cl-deep-modes" role="group" aria-label="演習メニュー"><button type="button" data-dp-view="drill" class="${S.view==='drill'?'is-current':''}" aria-pressed="${S.view==='drill'}">領域別の深掘り｜${latestDrills.length}/${trackItems.length}</button><button type="button" data-dp-view="case" class="${S.view==='case'?'is-current':''}" aria-pressed="${S.view==='case'}">統合ケース｜${caseDone.length}/6</button></div>`;
    if(!q){root.innerHTML='<p>演習データを読み込めませんでした。</p>';return;}
    const menu=S.view==='drill'?`<aside class="cl-deep-sidebar"><h3>思考形式を選んで学ぶ</h3>${trackItems.map(item=>`<button type="button" class="cl-deep-list-item ${item.id===q.id?'is-current':''}" data-dp-question="${item.id}"><span>${esc(labelType(item))}</span><strong>${esc(item.title)}</strong><small>${latest(item.id)?latest(item.id).status==='manual'?'記述済み・自己評価':'回答済み':'未回答'}・${esc(item.skill)}</small></button>`).join('')}</aside>`:
      `<aside class="cl-deep-sidebar"><h3>一社を横断して判断する</h3><p class="cl-muted">複数の科目をつなげる、6つの場面。</p>${DB.caseStudy.stages.map((item,i)=>`<button type="button" class="cl-deep-list-item ${i===S.caseIndex?'is-current':''}" data-dp-stage="${i}"><span>STEP ${pad(i+1)} · ${esc(labelType(item))}</span><strong>${esc(item.title.split('｜').at(-1))}</strong><small>${latest(item.id)?latest(item.id).status==='manual'?'記述済み':'回答済み':'未回答'} · ${esc(item.skill)}</small></button>`).join('')}</aside>`;
    root.innerHTML=`<div class="cl-deep"><header class="cl-card cl-deep-head"><div class="cl-deep-kicker">TRANSFER / PRACTICAL THINKING</div><h3>実戦問題｜知識を別の仕事へ移す</h3><p>数字で確かめる、資料を読む、誤りを直す、手順を考える、根拠を説明する。4択の正答数だけでは測れない力を練習します。</p><div class="cl-deep-stats"><span>領域別 ${latestDrills.length}/${trackItems.length}</span><span>統合ケース ${caseDone.length}/6</span><span>全${DB.items.length}問中 回答${submitted}・自動正解${successes}・記述${manual}</span></div>${modeSwitch}</header><div class="cl-deep-layout">${menu}<main class="cl-card cl-deep-task"><div class="cl-card-header"><div><p class="cl-eyebrow">${S.view==='case'?'CROSS-DOMAIN CASE':'VARIED FORMAT / ORIGINAL'}</p><h3>${esc(q.title)}</h3></div><span class="cl-chip">${esc(labelType(q))}</span></div><p class="cl-deep-meta">主に問う力：${esc(q.skill)}　/　認知段階：${q.level}　/　目安：${q.minutes}分</p>${S.view==='case'?caseFacts():''}<p class="cl-deep-stem">${esc(q.stem)}</p>${q.table?table(q.table):''}${inputForm(q)}${message?`<p class="cl-deep-alert" role="alert">${esc(message)}</p>`:''}<div class="cl-actions">${S.revealId===q.id?'':button('解答を確かめる','submit','primary')}${button('入力を端末に保存','stash','ghost')}${button('別の問題を選ぶ','next','ghost')}</div>${feedback(q)}<p class="cl-source">関連分野の一次情報：<a href="${esc(q.source.url)}" target="_blank" rel="noopener noreferrer">${esc(q.source.name)} ↗</a></p></main></div><footer class="cl-footnote">練習問題・架空ケースは本サイトのオリジナル。記述問題は自己点検であり自動採点・合格判定ではありません。下書きと回答履歴はこの端末に保存し、設定画面でJSONバックアップできます。</footer></div>`;
    root.onclick=onClick;
    root.oninput=onInput;
    root.onchange=onChange;
  }
  function navigate(action){
    const q=current();
    if(action==='drill'||action==='case'){stash();S.view=action;S.revealId=null;message='';save();render();return;}
    if(action==='next'){
      stash();
      if(S.view==='case')S.caseIndex=(S.caseIndex+1)%DB.caseStudy.stages.length;
      else {const idx=trackItems.findIndex(x=>x.id===q.id);const next=trackItems.slice(idx+1).find(x=>!latest(x.id))||trackItems.find(x=>!latest(x.id))||trackItems[(idx+1)%trackItems.length];S.selected[trackId]=next.id;}
      S.revealId=null;message='';save();render();return;
    }
    if(action==='retry'){S.revealId=null;message='';save();render();return;}
    if(action==='module'){stash();api.openModule?.(q.moduleId);return;}
    if(action==='stash'){stash();toast('入力を端末内に保存しました。');return;}
    if(action==='submit'){
      const input=getInput(q);
      const graded=DB.grade(q,input);
      S.drafts[q.id]=input;
      if(graded.status==='invalid'){message=graded.reason;save();render();return;}
      S.attempts.push({id:q.id,at:now(),format:q.format,status:graded.status,response:graded.response,skill:q.skill,level:q.level});
      if(S.attempts.length>1000)S.attempts=S.attempts.slice(-1000);
      S.revealId=q.id;
      message='';
      save();render();return;
    }
  }
  function onClick(event){
    const el=event.target.closest('button');
    if(!el||!root.contains(el))return;
    if(el.dataset.dpView){navigate(el.dataset.dpView);return;}
    if(el.dataset.dpQuestion){stash();S.selected[trackId]=el.dataset.dpQuestion;S.revealId=null;message='';save();render();return;}
    if(el.dataset.dpStage!==undefined){stash();S.caseIndex=Number(el.dataset.dpStage);S.revealId=null;message='';save();render();return;}
    if(el.dataset.dpAction)navigate(el.dataset.dpAction);
  }
  function onInput(event){
    if(!event.target.closest?.('.cl-deep-task'))return;
    const q=current();if(!q)return;
    S.drafts[q.id]=getInput(q);
    save();
  }
  function onChange(event){
    const el=event.target;
    if(el?.dataset?.dpSelf!==undefined){
      const q=current();const index=Number(el.dataset.dpSelf);
      const old=S.selfChecks[q.id]||[];
      S.selfChecks[q.id]=el.checked?[...new Set([...old,index])]:old.filter(x=>x!==index);
      save();return;
    }
    if(el.closest?.('.cl-deep-task'))onInput(event);
  }
  render();
}
window.CERT_LAB_DEEP_UI={mount};
})();
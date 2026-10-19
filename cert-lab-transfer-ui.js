(function bootTransferUI(){
'use strict';
const T=window.CERT_LAB_TRANSFER;
if(!T)return;
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateText=iso=>new Date(iso).toLocaleString('ja-JP',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
function mount(root,s,api={}){
  if(!root)return;
  const st=s.transferPilot&&typeof s.transferPilot==='object'?s.transferPilot:(s.transferPilot={});
  st.domains=st.domains&&typeof st.domains==='object'?st.domains:{};
  st.selectedDomain=T.byDomain(st.selectedDomain)?st.selectedDomain:'finance';
  const save=()=>api.persist?.();
  const toast=msg=>api.toast?.(msg);
  let warning='';
  const dataFor=id=>{
    const v=st.domains[id]&&typeof st.domains[id]==='object'?st.domains[id]:(st.domains[id]={});
    v.answers=v.answers&&typeof v.answers==='object'?v.answers:{};
    v.drafts=v.drafts&&typeof v.drafts==='object'?v.drafts:{};
    return v;
  };
  const button=(label,action,variant='')=>`<button type="button" class="cl-button ${variant}" data-tf-action="${action}">${esc(label)}</button>`;
  const statusTag=(value)=>value?.status==='correct'?'正解':value?.status==='incorrect'?'再確認':'未実施';
  function questionEntry(q,pr){
    const draft=pr.drafts[q.phase];
    if(q.kind==='number')return `<label class="cl-input-label" for="tfValue">変化幅を数値で回答（単位：${esc(q.unit)}）</label><div class="cl-deep-number"><input id="tfValue" type="text" inputmode="decimal" autocomplete="off" value="${esc(draft??'')}" placeholder="例：-2"><span>${esc(q.unit)}</span></div>`;
    return `<fieldset class="cl-deep-choice"><legend>適切な選択肢を一つ選ぶ</legend>${q.choices.map((c,i)=>`<label class="cl-deep-option"><input type="radio" name="tfChoice" value="${i}" ${String(draft)===String(i)?'checked':''}><span>${'ABCD'[i]}　${esc(c)}</span></label>`).join('')}</fieldset>`;
  }
  function feedback(q,answer){
    if(!q||!answer)return '';
    return `<section class="cl-deep-feedback"><h4>${answer.status==='correct'?'正解した問題の根拠':'次に確認する根拠'}</h4><p><strong>正答：</strong>${esc(q.kind==='number'?`${q.answer}${q.unit}`:`${'ABCD'[q.answer]}｜${q.choices[q.answer]}`)}</p><p>${esc(q.why)}</p></section>`;
  }
  function render(){
    const domain=T.byDomain(st.selectedDomain),pr=dataFor(domain.id),progress=T.stepFor(st.domains,domain.id);
    const phase=progress.phase,answers=pr.answers;
    const progressBar=T.studies.map(d=>{
      const step=T.stepFor(st.domains,d.id);
      return `<button type="button" class="cl-tf-domain ${d.id===domain.id?'selected':''}" data-tf-domain="${d.id}" aria-pressed="${d.id===domain.id}"><strong>${esc(d.name)}</strong><small>${step.state==='done'?'3段階完了':step.state==='locked'?'数日後の評価待ち':step.phase==='A'?'初回未実施':'途中から再開'}</small></button>`;
    }).join('');
    const stages=['A','B','C'].map((p,i)=>`<div class="cl-tf-stage ${answers[p]?'complete':phase===p?'current':''}"><span>${p}</span><strong>${['初回の確認','別事例の練習','後日の初見評価'][i]}</strong><small>${answers[p]?statusTag(answers[p]):phase===p?progress.state==='locked'?'未公開':'実施対象':'未実施'}</small></div>`).join('');
    let main='';
    if(progress.state==='locked'){
      main=`<section class="cl-card cl-tf-assessment"><p class="cl-eyebrow">DELAYED TRANSFER / UNSEEN ITEM</p><h3>初見評価は、後日に解く</h3><p>別事例の練習まで完了しました。次は、<strong>${dateText(progress.availableAt)}以降</strong>に、この画面でまだ見ていない問題を解けます。</p><p>この3日間隔は<strong>試行的な運用値</strong>です。学習の最適間隔や効果を保証するものではありません。時刻が来るまでは問題文も正解も表示しません。</p>${feedback(domain.questions[1],answers.B)}<div class="cl-actions">${button('関連教材を復習する','lesson','ghost')}${button('表示を更新','refresh','secondary')}</div></section>`;
    }else if(progress.state==='done'){
      const correct=['A','B','C'].filter(p=>answers[p]?.status==='correct').length;
      main=`<section class="cl-card cl-tf-assessment"><p class="cl-eyebrow">ALL THREE PHASES / SELF-STUDY RECORD</p><h3>3段階の結果を、別々に見る</h3><p>正答：${correct}/3。ただし、この3問のみの記録で、能力向上や因果的な学習効果を証明したわけではありません。</p><div class="cl-tf-results">${domain.questions.map(q=>`<div><strong>${q.phase}：${q.phase==='A'?'初回':q.phase==='B'?'別事例':'後日初見'}</strong><span>${statusTag(answers[q.phase])}</span></div>`).join('')}</div>${domain.questions.map(q=>feedback(q,answers[q.phase])).join('')}<div class="cl-actions">${button('関連教材を開く','lesson','primary')}${button('別の領域を選ぶ','choose','ghost')}</div></section>`;
    }else{
      const q=progress.question, intro=phase==='A'?'解説はまだ見ずに、現在の力で解きます。回答後に別事例へ進みます。':phase==='B'?'初回の回答は保存済みです。下の要点を確認したうえで、別の場面で試します。':'前回の学習から日を空け、初めて見る事例で評価します。回答前に解説は表示しません。';
      main=`<section class="cl-card cl-tf-assessment"><p class="cl-eyebrow">TRANSFER PROTOTYPE / PHASE ${phase}</p><h3>${esc(q.context)}</h3><p class="cl-muted">${esc(intro)}</p>${phase==='B'?`<div class="cl-tf-principle"><strong>今回の判断の型</strong><p>${esc(domain.sample)}</p></div>`:''}<p class="cl-deep-stem">${esc(q.stem)}</p>${questionEntry(q,pr)}${warning?`<p role="alert" class="cl-deep-alert">${esc(warning)}</p>`:''}<div class="cl-actions">${button('この回答を記録する','submit','primary')}${button('入力を保存する','draft','ghost')}${button('関連教材を開く','lesson','ghost')}</div><p class="cl-muted">回答は端末内だけに記録。各段階の初回回答を残して比較します。送信後、この段階の回答は変更できません。</p></section>`;
    }
    root.innerHTML=`<div class="cl-tf"><header class="cl-card cl-tf-head"><p class="cl-eyebrow">LEARNING EVIDENCE / SMALL PILOT</p><h3>「解けた」と「初見でも使えた」を分けて測る</h3><p>同じ能力を、初回の確認（A）→別事例の練習（B）→3日後の初見評価（C）で確認する小規模な試作です。</p><div class="cl-tf-domain-grid">${progressBar}</div></header><div class="cl-tf-steps" aria-label="3段階の学習経路">${stages}</div>${main}<p class="cl-muted">比較できるのは3問の回答のみ。問題の難易度が等しいこと、成績向上の原因、資格試験の予測力は未検証です。<a href="${esc(domain.source)}" target="_blank" rel="noopener noreferrer">関連する一次情報 ↗</a>。端末時刻による簡易判定であり、厳格な試験監督や不正対策ではありません。</p></div>`;
    root.onclick=onClick;root.oninput=onInput;root.onchange=onInput;
  }
  function answerValue(q){
    if(q.kind==='number')return root.querySelector('#tfValue')?.value??'';
    const selected=root.querySelector('input[name="tfChoice"]:checked');return selected?Number(selected.value):null;
  }
  function onInput(event){
    const q=T.stepFor(st.domains,st.selectedDomain).question;
    if(!q||!event.target)return;
    if(event.target.id==='tfValue'||event.target.name==='tfChoice'){
      dataFor(st.selectedDomain).drafts[q.phase]=answerValue(q);
      save();
    }
  }
  function onClick(event){
    const target=event.target.closest('button');if(!target||!root.contains(target))return;
    if(target.dataset.tfDomain){
      st.selectedDomain=target.dataset.tfDomain;warning='';save();render();return;
    }
    if(!target.dataset.tfAction)return;
    const action=target.dataset.tfAction;
    if(action==='lesson'){api.openModule?.(T.byDomain(st.selectedDomain).moduleId);return;}
    if(action==='choose'){st.selectedDomain=T.studies.find(d=>T.stepFor(st.domains,d.id).state!=='done')?.id||'finance';save();render();return;}
    if(action==='refresh'){warning='';render();return;}
    if(action==='draft'){save();toast('回答の下書きを端末内に保存しました。');return;}
    if(action!=='submit')return;
    const study=T.byDomain(st.selectedDomain),phaseState=T.stepFor(st.domains,study.id),q=phaseState.question;
    if(!q||phaseState.state!=='ready')return;
    const input=answerValue(q),value=T.grade(q,input);
    if(value.status==='invalid'){warning=value.reason;dataFor(study.id).drafts[q.phase]=input;save();render();return;}
    const pr=dataFor(study.id);
    if(pr.answers[q.phase])return;
    pr.answers[q.phase]={id:q.id,at:new Date().toISOString(),response:value.response,status:value.status,phase:q.phase,questionVersion:1};
    pr.drafts[q.phase]=input;
    warning='';save();render();
  }
  render();
}
window.CERT_LAB_TRANSFER_UI={mount};
})();
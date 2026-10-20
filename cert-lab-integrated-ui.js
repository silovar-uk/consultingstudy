(function bootIntegratedUI(){
'use strict';
const X=window.CERT_LAB_INTEGRATED;if(!X)return;
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(root,certState,api={}){
 if(!root)return;
 const state=certState.crossCasePilot&&typeof certState.crossCasePilot==='object'?certState.crossCasePilot:(certState.crossCasePilot={});
 state.submissions=state.submissions&&typeof state.submissions==='object'?state.submissions:{};
 state.drafts=state.drafts&&typeof state.drafts==='object'?state.drafts:{};
 const sc=X.scenario,save=()=>api.persist?.(),toast=(msg)=>api.toast?.(msg);
 let message='';
 function progress(){
  const done=sc.stages.filter(x=>state.submissions[x.id]).length;
  return `<ol class="cl-x-progress" aria-label="三つの視点">${sc.stages.map((step,i)=>`<li class="${state.submissions[step.id]?'done':done===i?'active':''}"><span>${i+1}</span><div><strong>${esc(step.role)}</strong><small>${state.submissions[step.id]?'初回提出済み':done===i?'いま取り組む':'次の視点'}</small></div></li>`).join('')}</ol>`;
 }
 const sourcePanel=()=>`<aside class="cl-card cl-x-sources"><div class="cl-x-sources-top"><p class="cl-eyebrow">SOURCE PACK / FICTIONAL</p><h3>最初に渡された原資料</h3><p>確認済みの記録・当事者の認識・運用ルールを区別する。すべて架空の情報です。</p></div><details open class="cl-x-source-details"><summary>原資料 ${sc.records.length}件を参照する</summary><div class="cl-x-source-list">${sc.records.map(r=>`<article class="cl-x-source"><strong>${esc(r.id)}｜${esc(r.label)}</strong><small>${esc(r.at)}</small><p>${esc(r.text)}</p></article>`).join('')}</div></details></aside>`;
 const button=(label,action,type='ghost')=>`<button type="button" class="cl-button ${type}" data-x-action="${action}">${esc(label)}</button>`;
 function render(){
  const step=X.nextStep(state.submissions),done=!step;
  let panel='';
  if(step){
    const val=state.drafts[step.id]||'';
    panel=`<section class="cl-card cl-x-editor"><p class="cl-eyebrow">${esc(step.tag)} / YOUR OWN WORDS</p><h3>${esc(step.title)}</h3><p class="cl-x-prompt">${esc(step.prompt)}</p><div class="cl-x-checks"><strong>答案を確認するための観点</strong>${step.checks.map(x=>`<div><span aria-hidden="true">□</span>${esc(x)}</div>`).join('')}</div><label for="clXText">自分の判断・連絡文を記入</label><textarea id="clXText" rows="9" maxlength="2500" aria-describedby="clXInstructions" ${message?'aria-invalid="true" aria-describedby="clXError"':''} placeholder="事実の根拠と判断、具体的な次の行動を書いてください。">${esc(val)}</textarea><p id="clXInstructions" class="cl-muted">45〜2500文字。入力はこの端末内に自動保存。提出後は固定され、参考例の表示は3段階を終えてからです。</p>${message?`<p class="cl-deep-alert" role="alert" id="clXError">${esc(message)}</p>`:''}<div class="cl-actions">${button('この視点の初回提出を確定','submit','primary')}${button('下書きを保存','save')}</div></section>`;
  }else{
    panel=`<section class="cl-card cl-x-completed"><p class="cl-eyebrow">ALL THREE SUBMITTED</p><h3>三つの立場で、同じ事実を扱った</h3><p>PMOとしての判断、顧客への応対、上司への決裁依頼をそれぞれ固定保存しました。ここでは自動で点数や学力向上を判定しません。</p><div class="cl-actions">${button('第三者評価票をMarkdownで保存','download','primary')}${button('評価票をコピー','copy')}</div></section>
    <section class="cl-card cl-x-review"><h3>提出後の参考例と点検基準</h3><p class="cl-muted">次の文章は唯一の正解ではありません。参考例は外部評価票には含めません。</p>${sc.stages.map(st=>`<details><summary>${esc(st.role)}｜${esc(st.title)}：参考例と初回回答を比較</summary><div class="cl-x-example"><strong>提出した文章</strong><p>${esc(state.submissions[st.id]?.text||'')}</p><strong>参考例</strong><p>${esc(st.model)}</p></div></details>`).join('')}<h4>独立評価者に確認してもらう観点</h4><div class="cl-x-rubrics">${sc.rubric.map(r=>`<div><strong>${esc(r.name)}</strong><p>0：${esc(r.zero)}／1：${esc(r.one)}／2：${esc(r.two)}</p></div>`).join('')}</div><h4>重大な見落とし</h4>${sc.critical.map(x=>`<p>□ ${esc(x)}</p>`).join('')}</section>`;
  }
  const submitted=sc.stages.filter(st=>state.submissions[st.id]);
  root.innerHTML=`<div class="cl-x"><header class="cl-card cl-x-intro"><p class="cl-eyebrow">ONE PROJECT, THREE PERSPECTIVES</p><h3>${esc(sc.title)}</h3><p>${esc(sc.purpose)}</p><p>同じ案件を三つの役割で考える。<strong>PMOとして判断 → 顧客へ連絡 → 上司に決裁を求める。</strong> 初回提出を残し、別の相手に必要な情報だけを届ける。</p>${progress()}</header><div class="cl-x-workbench">${sourcePanel()}<div class="cl-x-writing">${panel}${submitted.length?`<details class="cl-x-past"><summary>提出済みの文章を確認（${submitted.length}件）</summary>${submitted.map(st=>`<section><strong>${esc(st.role)}｜${esc(st.title)}</strong><small>${esc(new Date(state.submissions[st.id].at).toLocaleString('ja-JP'))}</small><p>${esc(state.submissions[st.id].text)}</p></section>`).join('')}</details>`:''}</div></div><p class="cl-muted">実在案件の秘密・個人情報は入力しないでください。静的サイトなので、段階の非表示は学習上の演出であり、安全な試験監督ではありません。<a href="https://www.pmi.org/learning/library/risks-vs-issues-project-failure-2328" target="_blank" rel="noopener noreferrer">PMIの問題とリスク</a>／<a href="https://jitsumu-ginou-kentei.jp/assets/files/articles/2376/files237667ca9875c14be.pdf" target="_blank" rel="noopener noreferrer">秘書検定2級公式審査基準</a></p></div>`;
  root.oninput=e=>{if(e.target?.id!=='clXText'||!step)return;state.drafts[step.id]=e.target.value;save();};
  root.onclick=e=>{
   const btn=e.target.closest('button[data-x-action]');if(!btn||!root.contains(btn))return;
   const action=btn.dataset.xAction;
   if(action==='save'){save();toast('下書きをこの端末に保存しました');return;}
   if(action==='submit'){
    const current=X.nextStep(state.submissions);if(!current)return;
    const response=root.querySelector('#clXText')?.value||'';
    state.drafts[current.id]=response;const v=X.validate(response);
    if(!v.ok){message=v.reason;save();render();root.querySelector('#clXText')?.focus();return;}
    state.submissions[current.id]={version:sc.version,at:new Date().toISOString(),text:response.trim()};
    message='';save();render();root.querySelector('.cl-x-editor h3, .cl-x-completed h3')?.setAttribute('tabindex','-1');root.querySelector('.cl-x-editor h3, .cl-x-completed h3')?.focus({preventScroll:true});return;
   }
   if(action!=='download'&&action!=='copy')return;
   const report=X.makeReview(state.submissions);if(!report)return;
   if(action==='copy'){
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(report).then(()=>toast('評価票をコピーしました')).catch(()=>toast('コピーできません。Markdown保存を使用してください。'));
    else toast('コピー非対応の環境です。Markdown保存を使用してください。');
    return;
   }
   const blob=new Blob([report],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='consultingstudy-cross-case-review.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
 }
 render();
}
window.CERT_LAB_INTEGRATED_UI={mount};
})();
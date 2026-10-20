(function bootEvidenceUI(){
'use strict';
const E=window.CERT_LAB_EVIDENCE;
if(!E)return;
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(root,certState,api={}){
 if(!root)return;
 const s=certState.evidencePilot&&typeof certState.evidencePilot==='object'?certState.evidencePilot:(certState.evidencePilot={});
 s.drafts=s.drafts&&typeof s.drafts==='object'?s.drafts:{};
 s.submissions=s.submissions&&typeof s.submissions==='object'?s.submissions:{};
 s.selfChecks=s.selfChecks&&typeof s.selfChecks==='object'?s.selfChecks:{};
 s.activeCase=E.byId(s.activeCase)?.id||E.cases[0].id;
 const save=()=>api.persist?.();
 const toast=api.toast||(()=>{});
 let error='';
 const button=(label,action,type='ghost')=>`<button type="button" class="cl-button ${type}" data-ec-action="${action}">${esc(label)}</button>`;
 const firstDone=()=>Boolean(s.submissions[E.cases[0].id]);
 const available=id=>id===E.cases[0].id||firstDone();
 const getDraft=id=>s.drafts[id]&&typeof s.drafts[id]==='object'?s.drafts[id]:(s.drafts[id]={});
 const capture=(id)=>{
   const c=E.byId(id);if(!c||s.submissions[id])return;
   const draft=getDraft(id);
   for(const f of E.fields){const el=root.querySelector('[data-ec-field="'+f.id+'"]');if(el)draft[f.id]=el.value;}
   save();
 };
 const detail=(caseData)=>`<section class="cl-card cl-ec-evidence"><p class="cl-eyebrow">SOURCE RECORDS / FICTIONAL</p><h3>判断の根拠となる5分程度の資料</h3><p class="cl-muted">すべて架空の資料です。発言の確からしさと確認済みの記録を混同しないようにしてください。</p><details class="cl-ec-reference" open><summary>原資料 ${caseData.records.length}件を見る・折りたたむ</summary><div class="cl-ec-records">${caseData.records.map(r=>`<article class="cl-ec-record"><div class="cl-ec-record-head"><strong>${esc(r.id)}｜${esc(r.kind)}</strong><small>${esc(r.at)}</small></div><p>${esc(r.text)}</p></article>`).join('')}</div></details></section>`;
 const rubrics=c=>`<section class="cl-card cl-ec-review" aria-label="参考例と評価票"><p class="cl-eyebrow">EVIDENCE / INDEPENDENT REVIEW</p><h3>提出後の参考例と、外部評価の観点</h3><p class="cl-muted">この文章は正答の一例です。字面の一致ではなく、根拠の確からしさ、代替案の比較、判断の安全性を確認します。</p>${E.fields.map(f=>`<div class="cl-ec-anchor"><h4>${esc(f.title)}</h4><p>${esc(c.anchor[f.id])}</p></div>`).join('')}<div class="cl-ec-rubric"><h4>評価者が独立に記入する5つの基準</h4>${E.rubric.map(r=>`<details><summary>${esc(r.title)}（0／1／2）</summary><p>0：${esc(r.zero)}</p><p>1：${esc(r.one)}</p><p>2：${esc(r.two)}</p></details>`).join('')}<h4>重大な見落とし</h4>${c.critical.map(x=>`<p>□ ${esc(x)}</p>`).join('')}</div><p>自分でも振り返れますが、自己チェックは外部採点ではありません。第三者に提出物と評価票を送り、本人の自己評価は知らせずに確認してもらってください。</p><div class="cl-actions">${button('評価依頼票をMarkdownで保存','download','primary')}${button('評価依頼票をコピー','copy')}</div></section>`;
 function render(){
  const c=E.byId(s.activeCase),draft=getDraft(c.id),submitted=s.submissions[c.id];
  const cases=E.cases.map((item,i)=>`<button type="button" data-ec-case="${item.id}" class="cl-ec-case-button ${item.id===c.id?'selected':''}" ${available(item.id)?'':'disabled'} aria-pressed="${item.id===c.id}"><strong>${i===0?'A｜最初の判断':'B｜別案件への応用'}</strong><span>${esc(item.title)}</span><small>${s.submissions[item.id]?'初回提出を保存済み':available(item.id)?'提出前':'Aの提出後に開放'}</small></button>`).join('');
  const form=E.fields.map(f=>`<div class="cl-ec-field"><label for="ec-${f.id}"><strong>${esc(f.title)}</strong><small>${esc(f.hint)}</small></label><textarea id="ec-${f.id}" data-ec-field="${f.id}" rows="4" ${error&&String(draft[f.id]??'').trim().length<12?'aria-invalid="true" aria-describedby="ec-validation-error"':''} placeholder="${esc(f.placeholder)}" ${submitted?'readonly':''}>${esc(submitted?submitted.response[f.id]:draft[f.id]||'')}</textarea></div>`).join('');
  const end=submitted?`<section class="cl-card cl-ec-submitted"><h3 id="ec-result-heading" tabindex="-1">初回提出を保存しました</h3><p>提出：${esc(new Date(submitted.at).toLocaleString('ja-JP'))}。提出時の文章を保持し、後から修正して上書きしません。これだけで能力・改善効果は判定できません。</p>${c.id===E.cases[0].id&&!s.submissions[E.cases[1].id]?button('別案件で応用を試す','second','primary'):''}</section>${rubrics(c)}`:
   `<div class="cl-ec-end"><p class="cl-muted">最初の提出を確定すると、提出文面が固定され、参考例と第三者評価票が表示されます。自動採点はありません。</p>${error?`<p class="cl-deep-alert" id="ec-validation-error" role="alert">${esc(error)}。各欄に根拠を含む12文字以上の説明を記入してください。</p>`:''}<div class="cl-actions">${button('初回の判断を確定して保存','submit','primary')}${button('下書きをこの端末に保存','draft')}</div></div>`;
  const comparison=s.submissions[E.cases[0].id]&&s.submissions[E.cases[1].id]?`<section class="cl-card cl-ec-comparison"><h3>2案件を比較するときの注意</h3><p>初回提出を2件保存しました。両ケースの難易度は等化されていません。改善前後の能力差をこの2件だけで測ったことにはなりません。</p><p>第三者の評価者2名が、同一の基準でそれぞれの提出文を独立に確認し、評価の食い違いを記録してください。次の実証を行うまでは、自己評価や総合スコアを表示しません。</p></section>`:'';
  root.innerHTML=`<div class="cl-ec"><section class="cl-card cl-ec-intro"><p class="cl-eyebrow">AUTHENTIC TASK / EVIDENCE-CENTERED DESIGN</p><h3>実務判断の証拠を残す｜PMO</h3><p>目標：不確実な状況で、<strong>事実・発生済み問題・将来リスク・複数案・決裁事項</strong>を整理し、意思決定者が動けるメモを作る。</p><p>資料を読む→判断メモを書く→初回提出を固定→参考例で省察→別案件へ応用する。選択式の正答数では測りきれない過程を記録します。</p><div class="cl-ec-case-switch" aria-label="実務判断の2案件">${cases}</div></section><section class="cl-card cl-ec-brief"><p class="cl-eyebrow">${c.id===E.cases[0].id?'CASE A / BASELINE':'CASE B / DIFFERENT CONTEXT'}</p><h3>${esc(c.title)}</h3><p><strong>現在：</strong>${esc(c.timing)}　<strong>目的：</strong>${esc(c.objective)}</p><p>${esc(c.question)}</p></section><div class="cl-ec-workbench">${detail(c)}<section class="cl-card cl-ec-editor"><p class="cl-eyebrow">YOUR FIRST SUBMISSION / FIVE EVIDENCE FIELDS</p><h3>判断メモを構造化する</h3><p class="cl-muted">演習は架空データ限定。実案件の秘密・個人情報は入力しないでください。各欄は12文字以上、単なる「なし」「不明」ではなく判断の根拠を書くことを推奨します。</p>${form}${end}</section></div>${comparison}<p class="cl-muted">評価手順の参考：<a href="https://www.ets.org/research/policy_research_reports/publications/report/2011/imbu.html" target="_blank" rel="noopener noreferrer">ETSの証拠中心設計</a>／<a href="https://www.pmi.org/learning/library/risks-vs-issues-project-failure-2328" target="_blank" rel="noopener noreferrer">PMIのリスクと問題</a>。試作教材でありPMP公式問題や能力認定ではありません。</p></div>`;
  root.onclick=onClick;root.oninput=onInput;
 }
 function download(text,fileName){
  const blob=new Blob([text],{type:'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),800);
 }
 function onInput(event){
  const t=event.target;if(!t?.dataset?.ecField)return;
  const c=E.byId(s.activeCase);if(!c||s.submissions[c.id])return;
  getDraft(c.id)[t.dataset.ecField]=t.value;save();
 }
 function onClick(event){
  const t=event.target.closest('button');if(!t||!root.contains(t))return;
  if(t.dataset.ecCase){
   const to=t.dataset.ecCase;if(!available(to))return;
   capture(s.activeCase);s.activeCase=to;error='';save();render();return;
  }
  const action=t.dataset.ecAction;if(!action)return;
  const c=E.byId(s.activeCase),existing=s.submissions[c.id];
  if(action==='second'){
   if(!firstDone())return;s.activeCase=E.cases[1].id;error='';save();render();return;
  }
  if(action==='draft'){capture(c.id);toast('下書きを端末内に保存しました。');return;}
  if(action==='submit'){
   if(existing)return;capture(c.id);
   const draft=getDraft(c.id),valid=E.validate(draft);
   if(!valid.ok){error='不足している欄：'+valid.missing.join('、');render();root.querySelector('[data-ec-field][aria-invalid="true"]')?.focus();return;}
   s.submissions[c.id]={version:1,at:new Date().toISOString(),response:E.snapshot(draft)};
   error='';save();render();
   root.querySelector('#ec-result-heading')?.focus({preventScroll:true});
   return;
  }
  if(!existing||!['copy','download'].includes(action))return;
  const text=E.exportReview(c,existing);
  if(action==='download'){download(text,'consulting-study-pmo-review-'+c.id+'.md');return;}
  if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast('評価票をコピーしました。')).catch(()=>toast('コピーできませんでした。Markdown保存を使用してください。','error'));}
  else toast('この環境ではコピーを使用できません。Markdown保存を使用してください。','error');
 }
 render();
}
window.CERT_LAB_EVIDENCE_UI={mount};
})();
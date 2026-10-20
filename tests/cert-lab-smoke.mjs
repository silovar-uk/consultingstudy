// node tests/cert-lab-smoke.mjs
// GitHub Pagesだけで動作する教材をNode.jsのVMで検証。実ブラウザ操作試験とは区別する。
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx=vm.createContext({window:{},console,setTimeout,clearTimeout});
const file=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
for(const name of ['data.js','cert-lab-data.js','cert-lab-crosswalk.js','cert-lab-secretary.js','cert-lab.js']){
  new Function(file(name));
  vm.runInContext(file(name),ctx,{filename:name});
}
const D=ctx.window.CERT_LAB_DATA, legacy=ctx.window.ATLAS_DATA;
assert.equal(legacy.chapters.length,43);
assert.equal(D.tracks.length,8);
assert.equal(D.modules.length,24);
assert.equal(D.questions.length,72);
assert.equal(new Set(D.modules.map(x=>x.id)).size,24);
assert.equal(new Set(D.questions.map(x=>x.id)).size,72);
assert.equal(Object.keys(D.crosswalk).length,24);
assert.equal(D.curriculumAudit.applicationCases,21);
assert.equal(D.curriculumAudit.updatedChoices,24);
for(const m of D.modules){
  assert.equal(D.questionsFor(m.id).length,3,'3 original/application questions per module: '+m.id);
  const link=D.crosswalkFor(m.id);
  assert.ok(link,'missing mapping '+m.id);
  assert.ok(link.atlasChapters.length,'no linked chapters '+m.id);
  assert.ok(link.atlasChapters.every(id=>legacy.chapters.some(x=>x.id===id)),'broken legacy chapter link '+m.id);
  assert.ok(m.source.url.startsWith('https://'),'missing primary source '+m.id);
  assert.equal(m.concepts.length,3);
  assert.equal(m.checks.length,3);
  assert.ok(m.task?.length>15&&m.example?.length>15);
}
for(const t of D.tracks){
  assert.equal(D.scopeGaps[t.id].length,3);
  assert.equal(D.questions.filter(q=>D.moduleById(q.moduleId).trackId===t.id).length,9);
}
for(const q of D.questions){
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,'bad key '+q.id);
  assert.equal(q.choices.length,4,'four choices '+q.id);
  assert.equal(new Set(q.choices).size,4,'duplicate choices '+q.id);
  assert.ok(q.stem?.length>=14&&q.why?.length>=15&&q.trap?.length>=8,'shallow explanation '+q.id);
}
assert.equal(D.questions.find(x=>x.id==='bk03a').answer,2);
assert.equal(D.questions.find(x=>x.id==='case-book-03').answer,1);
assert.equal(D.questions.find(x=>x.id==='case-it-03').answer,3);
assert.equal(D.questions.find(x=>x.id==='case-pmp-02').answer,1);
let stored=0,openedChapter=null,toast='';
const root={
  innerHTML:'',onclick:null,onchange:null,oninput:null,
  contains:()=>true,
  workValue:'業務の出典、期間、単位を確認し、意思決定者と必要情報を明記する。',
  querySelector(selector){
    if(selector==='#clWorkText'&&this.innerHTML.includes('id="clWorkText"'))return {value:this.workValue};
    return null;
  },
  querySelectorAll:selector=>selector==='[data-cl-check]:checked'?[{dataset:{clCheck:'0'}}]:[]
};
const state={profile:{goal:'finance'},certLab:{}};
function mount(){
  ctx.window.CERT_LAB.mount(root,state,{
    persist:()=>stored++,toast:t=>toast=t,
    atlasChapters:legacy.chapters,
    openChapter:id=>openedChapter=id
  });
}
const click=data=>{
  assert.equal(typeof root.onclick,'function','click handler present');
  root.onclick({target:{closest:()=>({dataset:data})}});
};
mount();
assert.match(root.innerHTML,/資格・実務ラボ/);
assert.match(root.innerHTML,/簿記2級/);
assert.match(root.innerHTML,/NEXT REASON/);
click({clAction:'next-action'});
assert.match(root.innerHTML,/取引を資産と負債に翻訳する/);
assert.match(root.innerHTML,/既存43章との対応/);
assert.match(root.innerHTML,/独自問題3問/);
click({clAction:'complete'});
assert.deepEqual([...state.certLab.completed],['book-01']);
click({clTab:'today'});
assert.match(root.innerHTML,/知識を別の場面で試す/);
click({clAction:'next-action'});
assert.match(root.innerHTML,/掛けで売り上げた/);
const first=D.questionsFor('book-01')[0];
click({clChoice:String(first.answer)});
assert.match(root.innerHTML,/正解。理由/);
assert.match(root.innerHTML,/次の復習/);
assert.equal(state.certLab.attempts.length,1);
click({clAction:'confidence-unsure'});
assert.equal(state.certLab.attempts[0].confidence,'unsure');
const delta=Date.parse(state.certLab.attempts[0].nextAt)-Date.parse(state.certLab.attempts[0].at);
assert.equal(delta,86400000,'uncertain correct answer scheduled next day');
click({clAction:'next-question'});
assert.notEqual(state.certLab.quizId,first.id,'new transfer problem, not identical repetition');
assert.equal(D.moduleById(D.questions.find(x=>x.id===state.certLab.quizId).moduleId).id,'book-01');
click({clTab:'scope'});
assert.match(root.innerHTML,/今後追加すべき分野/);
click({clChapter:'chapter-12'});
assert.equal(openedChapter,'chapter-12');
click({clTab:'work'});
assert.match(root.innerHTML,/実務メモ/);
root.workValue='修正版：調査した根拠を整理し、業務の改善案を三つ提示する。';
root.oninput({target:{id:'clWorkText',value:root.workValue}});
assert.equal(state.certLab.drafts['book-01'],root.workValue);
click({clAction:'save-note'});
assert.equal(state.certLab.notes['book-01'].text,root.workValue);
click({clTab:'today'});
click({clWeek:'bookkeeping:0'});
assert.ok(state.certLab.weeklyDone.includes('bookkeeping:0'));
click({clAction:'diagnostic'});
assert.match(root.innerHTML,/OF 8/);
for(const tr of D.tracks){
  const q=D.questions.find(x=>D.moduleById(x.moduleId).trackId===tr.id);
  click({clDiagnosticChoice:String(q.answer),id:tr.id});
  assert.match(root.innerHTML,/DIAGNOSTIC EXPLANATION/);
  click({clAction:'diagnostic-next'});
}
assert.match(root.innerHTML,/8問中8問正解/);
click({clAction:'all-quiz'});
click({clTab:'curriculum'});
root.onchange({target:{id:'clTrack',value:'pmp'}});
assert.equal(state.certLab.trackId,'pmp');
root.onchange({target:{id:'clTrack',value:'bookkeeping'}});
assert.equal(state.certLab.trackId,'bookkeeping');
assert.equal(state.certLab.moduleId,'book-01','resume previous module on track switch');
assert.ok(stored>=15);
// 既存の状態項目を保持したまま新しい導線から復元できる
const oldState={
  profile:{goal:'consulting'},
  certLab:{trackId:'pmp',tab:'quiz',moduleId:'pmp-01',mode:'mixed',
    attempts:[{id:'pm01a',choice:1,correct:true,streak:1,nextAt:'2030-01-01T00:00:00.000Z',at:'2026-10-01T00:00:00.000Z'}],
    notes:{'pmp-01':{text:'従来の成果物',checks:[],at:'2026-10-01T00:00:00.000Z'}},
    completed:['pmp-01']}
};
const legacyRoot={...root,innerHTML:''};
ctx.window.CERT_LAB.mount(legacyRoot,oldState,{persist:()=>{},atlasChapters:legacy.chapters});
assert.equal(oldState.certLab.attempts.length,1);
assert.equal(oldState.certLab.notes['pmp-01'].text,'従来の成果物');
assert.ok(oldState.certLab.completed.includes('pmp-01'));
console.log('PASS: 43 Atlas chapters ↔ 24 modules; 72 questions; answer/review/confidence; drafts; 8-question diagnostic; old state');

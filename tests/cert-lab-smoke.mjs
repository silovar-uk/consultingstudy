// node tests/cert-lab-smoke.mjs
// DOMライブラリ不要：公開用ロジックと教材の最低限の契約を検証する。
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx=vm.createContext({window:{}});
const load=path=>vm.runInContext(readFileSync(new URL('../'+path,import.meta.url),'utf8'),ctx,{filename:path});
load('cert-lab-data.js');
load('cert-lab.js');
const D=ctx.window.CERT_LAB_DATA;
assert.equal(D.tracks.length,7);
assert.equal(D.modules.length,21);
assert.equal(D.questions.length,42);
assert.equal(new Set(D.questions.map(x=>x.id)).size,D.questions.length);
for(const m of D.modules){
  assert.equal(D.questionsFor(m.id).length,2,'missing module questions '+m.id);
  assert.ok(m.source.url.startsWith('https://'));
  assert.ok(m.task&&m.concepts.length===3&&m.checks.length===3);
}
for(const q of D.questions){
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
  assert.equal(q.choices.length,4);
  assert.ok(q.why.length>12&&q.trap.length>8);
}
const root={
  innerHTML:'',
  contains:()=>true,
  querySelector:selector=>selector==='#clWorkText'?{value:'実務メモを作成するための説明と確認事項をここに書きます。'}:null,
  querySelectorAll:()=>[{dataset:{clCheck:'0'}}]
};
const state={profile:{goal:'finance'},certLab:{}};
let persisted=0;
ctx.window.CERT_LAB.mount(root,state,{persist:()=>persisted++,toast:()=>{}});
const click=dataset=>root.onclick({target:{closest:()=>({dataset})}});
assert.match(root.innerHTML,/資格・実務ラボ/);
assert.match(root.innerHTML,/簿記2級/);
click({clTab:'curriculum'});
assert.match(root.innerHTML,/取引を資産と負債に翻訳する/);
click({clAction:'module-quiz'});
const q=D.questionsFor('book-01')[0];
assert.match(root.innerHTML,/売掛金/);
click({clChoice:String(q.answer)});
assert.match(root.innerHTML,/正解。理由まで言えるか確認しよう/);
assert.match(root.innerHTML,/次の復習/);
click({clAction:'next-question'});
assert.notEqual(state.certLab.quizId,q.id);
click({clTab:'work'});
click({clAction:'save-note'});
assert.ok(state.certLab.notes['book-01'].text.length>12);
click({clAction:'today'});
click({clWeek:'bookkeeping:0'});
assert.ok(state.certLab.weeklyDone.includes('bookkeeping:0'));
click({clAction:'diagnostic'});
assert.match(root.innerHTML,/OF 7/);
for(const track of D.tracks){
 const question=D.questions.find(x=>D.moduleById(x.moduleId).trackId===track.id);
 click({clDiagnosticChoice:String(question.answer),id:track.id});
}
assert.match(root.innerHTML,/7問中7問正解/);
assert.ok(persisted>=9);
console.log('cert-lab smoke passed: 7 tracks, 21 lessons, 42 questions, UI navigation, answers, save, diagnostics');

// node tests/cert-lab-transfer.mjs
// 財務・統計・PMOの初回→別事例→後日の初見評価（設問露出防止・保存互換）の契約テスト
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{}});
const load=path=>vm.runInContext(readFileSync(new URL('../'+path,import.meta.url),'utf8'),context,{filename:path});
for(const path of ['cert-lab-data.js','cert-lab-deep-data.js','cert-lab-transfer-data.js','cert-lab-transfer-ui.js'])load(path);
const T=context.window.CERT_LAB_TRANSFER;
const D=context.window.CERT_LAB_DATA;
assert.equal(D.questions.length,42,'base 42 preserved before crosswalk');
assert.equal(T.studies.length,3);
assert.equal(T.studies.flatMap(d=>d.questions).length,9);
assert.equal(new Set(T.studies.flatMap(d=>d.questions.map(q=>q.id))).size,9);
assert.equal(T.intervalDays,3,'pilot: three days, explicitly not an optimal cognitive interval');
const now=Date.parse('2026-10-20T00:00:00.000Z');
for(const domain of T.studies){
  const [a,b,c]=domain.questions;
  assert.deepEqual(domain.questions.map(q=>q.phase),['A','B','C']);
  assert.ok(domain.skill.length>20&&domain.sample.length>30);
  assert.equal(T.stepFor({},domain.id,now).phase,'A');
  assert.equal(T.stepFor({},domain.id,now).state,'ready');
  for(const q of domain.questions){
    assert.ok(q.stem.length>30&&q.why.length>35,'explanation richness '+q.id);
    assert.equal(T.grade(q,q.answer).status,'correct',q.id);
    if(q.kind==='choice'){
      assert.equal(q.choices.length,4);
      assert.equal(new Set(q.choices).size,4);
      const wrong=q.choices.map((_,i)=>i).find(i=>i!==q.answer);
      assert.equal(T.grade(q,wrong).status,'incorrect',q.id);
      assert.equal(T.grade(q,null).status,'invalid',q.id);
    }else{
      assert.equal(T.grade(q,'').status,'invalid');
      assert.equal(T.grade(q,q.answer+0.5).status,'incorrect');
    }
  }
  const p={ [domain.id]:{answers:{A:{id:a.id,status:'correct',at:new Date(now-1000).toISOString()}}}};
  assert.equal(T.stepFor(p,domain.id,now).phase,'B');
  p[domain.id].answers.B={id:b.id,at:new Date(now).toISOString(),status:'correct'};
  const early=T.stepFor(p,domain.id,now+2*86400000);
  assert.equal(early.phase,'C');
  assert.equal(early.state,'locked');
  assert.equal(early.question,null,'never expose sealed question while locked');
  assert.equal(Date.parse(early.availableAt)-now,3*86400000);
  assert.equal(T.stepFor(p,domain.id,now+3*86400000-1).state,'locked');
  const due=T.stepFor(p,domain.id,now+3*86400000);
  assert.equal(due.state,'ready');
  assert.equal(due.question.id,c.id);
  p[domain.id].answers.C={id:c.id,at:new Date(now+3*86400000).toISOString(),status:'incorrect'};
  assert.equal(T.stepFor(p,domain.id,now+5*86400000).state,'done');
  assert.equal(T.stepFor(p,domain.id,now+5*86400000).phase,'complete');
}
assert.equal(T.grade(T.byQuestion('tf-fin-a'),'－２').status,'correct');
assert.equal(T.grade(T.byQuestion('tf-fin-c'),'-3.5').status,'correct');
assert.equal(T.grade(T.byQuestion('tf-fin-b'),'-4pt').status,'invalid');
assert.equal(T.grade(T.byQuestion('tf-fin-b'),'Infinity').status,'invalid');
assert.equal(T.grade(T.byQuestion('tf-pmo-a'),2).status,'incorrect');
assert.equal(T.grade(T.byQuestion('tf-stat-a'),2).status,'correct');
assert.ok(context.window.CERT_LAB_TRANSFER_UI?.mount);
// Preserve old certLab keys rather than migrating/deleting stored learning records.
const s={attempts:[{id:'bk01a'}],notes:{'book-01':{text:'legacy'}}};
assert.ok(!s.transferPilot);
assert.equal(s.attempts[0].id,'bk01a');
console.log('PASS: 3 domains, 9 phases, strict grading, locked delayed assessment, interval boundary, old record contract');

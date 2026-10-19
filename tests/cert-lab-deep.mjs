// node tests/cert-lab-deep.mjs
// 新しい形式の採点・入力検証・出典・能力分類・実ケースの数値整合性を点検
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{}});
for(const name of ['data.js','cert-lab-data.js','cert-lab-crosswalk.js','cert-lab-deep-data.js','cert-lab-deep-ui.js','cert-lab.js']){
  const js=readFileSync(new URL('../'+name,import.meta.url),'utf8');
  new Function(js);
  vm.runInContext(js,context,{filename:name});
}
const D=context.window.CERT_LAB_DEEP;
const prior=context.window.CERT_LAB_DATA;
assert.equal(prior.questions.length,63,'existing 63 multiple-choice questions must remain');
assert.equal(D.drills.length,21);
assert.equal(D.caseStudy.stages.length,6);
assert.equal(D.items.length,27);
assert.equal(new Set(D.items.map(x=>x.id)).size,27);
assert.equal(new Set(D.items.map(x=>x.moduleId)).size>=14,true);
assert.equal(new Set(D.drills.map(q=>q.trackId)).size,7);
assert.equal(new Set(D.items.map(q=>q.format)).size,6);
assert.ok(D.caseStudy.disclaimer.includes('架空'));
for(const tr of prior.tracks)assert.equal(D.trackDrills(tr.id).length,3);
for(const q of D.items){
  assert.ok(q.id&&q.skill&&q.stem&&q.title&&q.minutes>0);
  assert.ok(prior.moduleById(q.moduleId),'No linked lesson '+q.id);
  assert.ok(q.level>=3&&q.level<=6,'Cognitive depth must be explicit '+q.id);
  assert.ok(q.source.url.startsWith('https://'));
  if(['choice','multi'].includes(q.format)){
    assert.equal(q.choices.length,4,'All choices reviewed '+q.id);
    assert.equal(q.whyChoices.length,4,'Distractor rationale '+q.id);
    assert.equal(new Set(q.choices).size,4);
  }
  if(['write','correction'].includes(q.format)){
    assert.ok(q.rubric.length>=3,'Scoring rubric '+q.id);
    assert.ok(q.model.length>=70,'Substantive example '+q.id);
    const v=D.grade(q,q.model);
    assert.equal(v.status,'manual',q.id+' never auto-grade a free answer');
  }else{
    const answer=q.answer;
    assert.equal(D.grade(q,answer).status,'correct',q.id+' reference answer');
  }
}
const g=id=>D.byId(id);
assert.equal(D.grade(g('deep-bk-01'),'３５').status,'correct','full-width Japanese number');
assert.equal(D.grade(g('case-h-01'),'-5').status,'correct');
assert.equal(D.grade(g('deep-bk-01'),'35%').status,'invalid','numeric unit separately');
assert.equal(D.grade(g('deep-bk-01'),'').status,'invalid');
assert.equal(D.grade(g('deep-dg-02'),null).status,'invalid','unselected choice cannot be A');
assert.equal(D.grade(g('deep-st-02'),[1,2]).status,'correct');
assert.equal(D.grade(g('deep-st-02'),[1]).status,'incorrect');
assert.equal(D.grade(g('deep-it-01'),[1,2,3,0]).status,'correct');
assert.equal(D.grade(g('deep-it-01'),[null,2,3,0]).status,'invalid');
assert.equal(D.grade(g('deep-it-01'),[1,1,3,0]).status,'invalid');
assert.equal(D.grade(g('deep-sc-03'),'短すぎる').status,'invalid');
assert.equal(D.grade(g('deep-sc-03'),'スプリント目標は利用者の便益を明確にし、成果と評価可能な成功条件を記述する必要がある。').status,'manual');
assert.equal((27000-17550-8100),1350);
assert.equal((24000-14400-7200),2400);
assert.equal((3900-3000)+(5100-3800)-(2600-2500),2100);
assert.equal((120/(5-1)),30);
console.log('PASS: 63 existing + 21 varied drills + 6 cross-domain stages, six formats, data integrity and grading');

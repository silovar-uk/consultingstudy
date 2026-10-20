// Authentic PMO evidence task: content quality gates, frozen submissions and external review worksheet
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({window:{}});
for(const path of ['cert-lab-data.js','cert-lab-crosswalk.js','cert-lab-deep-data.js','cert-lab-evidence-data.js','cert-lab-evidence-ui.js']){
  const content=readFileSync(new URL('../'+path,import.meta.url),'utf8');
  new Function(content);
  vm.runInContext(content,context,{filename:path});
}
const E=context.window.CERT_LAB_EVIDENCE;
assert.equal(context.window.CERT_LAB_DATA.questions.length,63,'existing multiple-choice questions remain');
assert.equal(context.window.CERT_LAB_DEEP.items.length,27,'existing varied drills remain');
assert.equal(E.cases.length,2);
assert.equal(E.fields.length,5);
assert.equal(E.rubric.length,5);
assert.equal(new Set(E.fields.map(x=>x.id)).size,5);
assert.equal(new Set(E.rubric.map(x=>x.id)).size,5);
assert.deepEqual([...E.fields.map(x=>x.id)],[...E.rubric.map(x=>x.id)],'all dimensions correspond');
assert.equal(E.validate({}).ok,false);
for(const f of E.fields)assert.ok(f.title&&f.hint&&f.placeholder);
const draft=Object.fromEntries(E.fields.map(f=>[f.id,'これは資料と事実を明確にして判断するための提出文章です。']));
assert.equal(E.validate(draft).ok,true);
draft.facts='短い';
const fail=E.validate(draft);
assert.equal(fail.ok,false);
assert.equal(fail.missing.length,1);
assert.match(fail.missing[0],/事実/);
draft.facts='権利台帳によれば40本中12本の許可が未確定である。';
const snapshot=E.snapshot(draft);
draft.facts='後で書き換えたメモ';
assert.match(snapshot.facts,/40本中12本/,'snapshot is frozen copy');
assert.equal(snapshot.facts===draft.facts,false);
for(const c of E.cases){
  assert.ok(c.records.length>=4,'realistic evidence record set');
  assert.equal(new Set(c.records.map(x=>x.id)).size,c.records.length);
  assert.ok(c.records.some(x=>x.kind.includes('発言')),'unverified human statement');
  assert.ok(c.records.some(x=>x.kind.includes('ルール')||x.kind.includes('規程')),'decision constraints');
  assert.ok(c.critical.length>=2,'safety critical flags');
  for(const f of E.fields){
    assert.ok(c.anchor[f.id].length>=50,'specific reference reasoning '+c.id+' '+f.id);
  }
  const submission={version:1,at:'2026-10-20T00:00:00.000Z',response:snapshot};
  const md=E.exportReview(c,submission);
  assert.match(md,/初回提出/);
  assert.match(md,/評価者名/);
  assert.match(md,/N\/A/);
  assert.match(md,/具体的記述/);
  assert.match(md,/PMI Risks vs issues/);
  assert.ok(md.includes(snapshot.facts));
  assert.ok(!md.includes(c.anchor.facts),'review form must not leak the worked example to assessors');
  for(const f of E.fields)assert.ok(md.includes(f.title));
}
for(const x of E.rubric){
  for(const level of ['zero','one','two'])assert.ok(x[level].length>=18,x.id+' '+level);
}
assert.ok(context.window.CERT_LAB_EVIDENCE_UI?.mount);
console.log('PASS: two authentic PMO cases, 5 evidence criteria, evidence records, safety checks, immutable snapshots, reviewer export and 90-question backward compatibility');

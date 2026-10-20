// 秘書検定公式5領域を旧PMO・教材・応用演習へ統合する契約テスト
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx=vm.createContext({window:{},console,setTimeout,clearTimeout});
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const path of ['data.js','cert-lab-data.js','cert-lab-crosswalk.js','cert-lab-secretary.js','cert-lab-deep-data.js','cert-lab-secretary-deep.js','cert-lab.js']){
 const js=read(path);new Function(js);vm.runInContext(js,ctx,{filename:path});
}
const D=ctx.window.CERT_LAB_DATA,DB=ctx.window.CERT_LAB_DEEP,S=D.trackById('secretary');
assert.ok(S,'track must exist');
assert.equal(D.tracks.length,8);
assert.equal(D.modules.length,24);
assert.equal(D.questions.length,72);
assert.equal(DB.items.length,30);
assert.equal(DB.drills.length,24);
assert.equal(S.modules.length,3);
assert.equal(D.questions.filter(q=>q.id.startsWith('sec')).length,9);
assert.equal(DB.trackDrills('secretary').length,3);
assert.equal(new Set(D.questions.map(q=>q.id)).size,D.questions.length);
assert.equal(new Set(DB.items.map(q=>q.id)).size,DB.items.length);
assert.equal(D.secretaryCoverage.categories.length,5);
assert.deepEqual(new Set(D.secretaryCoverage.categories.map(x=>x.name)),new Set(['必要とされる資質','職務知識','一般知識','マナー・接遇','技能']));
assert.equal(D.secretaryCoverage.categories.filter(x=>x.division==='理論').length,3);
assert.equal(D.secretaryCoverage.categories.filter(x=>x.division==='実技').length,2);
for(const q of D.questions.filter(q=>q.moduleId.startsWith('sec-'))){
 assert.ok(q.answer>=0&&q.answer<4);
 assert.equal(new Set(q.choices).size,4);
 assert.ok(q.why.length>=20&&q.trap.length>=16);
 assert.ok(D.secretaryCoverage.categories.some(x=>x.name===q.domain));
}
for(const m of S.modules){
 assert.equal(D.questionsFor(m.id).length,3);
 assert.equal(D.moduleById(m.id).trackId,'secretary');
 assert.equal(m.concepts.length,3);
 assert.ok(D.crosswalkFor(m.id).atlasChapters.every(id=>ctx.window.ATLAS_DATA.chapters.some(x=>x.id===id)));
 assert.ok(m.source.url.startsWith('https://'));
}
for(const x of DB.trackDrills('secretary')){
 assert.equal(DB.byId(x.id).id,x.id);
 assert.ok(x.source.url.startsWith('https://'));
 assert.ok(x.level>=3);
}
assert.equal(DB.grade(DB.byId('deep-sec-01'),[0,1,2]).status,'correct');
assert.equal(DB.grade(DB.byId('deep-sec-01'),[0,3]).status,'incorrect');
assert.equal(DB.grade(DB.byId('deep-sec-02'),[1,0,3,2]).status,'correct');
assert.equal(DB.grade(DB.byId('deep-sec-02'),[0,1,2,3]).status,'incorrect');
assert.equal(DB.grade(DB.byId('deep-sec-03'),'短い').status,'invalid');
assert.equal(DB.grade(DB.byId('deep-sec-03'),'顧客の症状と時点を聞き取り、原因を確認してから期限を示して責任者へ報告する。').status,'manual');
assert.equal(D.questionsFor('pmp-01').length,3,'legacy PMO questions unchanged');
assert.ok(D.crosswalkFor('pmp-01'));
assert.equal(ctx.window.ATLAS_DATA.chapters.length,43);
console.log('PASS: secretary 5 official areas, 3 cross-domain modules, 9 original quiz items, 3 drills, older 7 tracks and 43 Atlas chapters retained');

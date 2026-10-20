// ブラウザ実操作の簡易検証（Chromium PC / WebKitモバイル相当）
// 実際のiPhone Safari実機検証を代替するものではない。
import {chromium,webkit,devices} from 'playwright';
import assert from 'node:assert/strict';
const origin=process.env.BASE_URL||'http://127.0.0.1:8765/';
const variants=[
  {name:'Chromium desktop',browser:chromium,context:{viewport:{width:1366,height:850}}},
  {name:'WebKit mobile emulation',browser:webkit,context:{...devices['iPhone 13']}}
];
for(const v of variants){
  const browser=await v.browser.launch({headless:true});
  const context=await browser.newContext(v.context);
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(origin+'#/cert-lab',{waitUntil:'load'});
  await page.locator('.cert-lab h2').waitFor();
  assert.match(await page.locator('.cert-lab h2').innerText(),/資格・実務ラボ/);
  await page.getByRole('button',{name:'この講義を開く'}).click();
  assert.match(await page.locator('.cl-lesson h3').innerText(),/取引を資産と負債に翻訳する/);
  await page.getByRole('button',{name:'読了チェックを付ける'}).click();
  await page.getByRole('button',{name:'今日',exact:true}).click();
  await page.getByRole('button',{name:'次の1問を解く'}).click();
  assert.match(await page.locator('.cl-question').innerText(),/掛けで売り上げた/);
  await page.locator('.cl-option').nth(1).click();
  await page.locator('.cl-feedback').waitFor();
  assert.match(await page.locator('.cl-feedback').innerText(),/正解/);
  await page.getByRole('button',{name:'説明はまだ不安'}).click();
  await page.getByRole('button',{name:'次の問題'}).click();
  assert.match(await page.locator('.cl-question').innerText(),/普通預金/);
  await page.getByRole('button',{name:'範囲と対応'}).click();
  assert.match(await page.locator('.cl-card').first().innerText(),/既存の43章/);
  await page.getByRole('button',{name:'成果物',exact:true}).click();
  const sample='実地の観測と公開資料を分けて扱い、仮説と判断基準を文書化した。';
  await page.locator('#clWorkText').fill(sample);
  await page.getByRole('button',{name:'今日',exact:true}).click();
  await page.getByRole('button',{name:'成果物',exact:true}).click();
  assert.equal(await page.locator('#clWorkText').inputValue(),sample,'drafts survive tab navigation');
  await page.getByRole('button',{name:'この端末に保存'}).click();
  assert.match(await page.locator('.cl-card').last().innerText(),/最終保存/);
  await page.reload({waitUntil:'load'});
  await page.locator('.cert-lab').waitFor();
  await page.getByRole('button',{name:'成果物',exact:true}).click();
  assert.equal(await page.locator('#clWorkText').inputValue(),sample,'drafts survive reload');
  // 新・多形式の出題と、横断ケースの実DOM操作
  await page.getByRole('button',{name:'実戦演習',exact:true}).click();
  await page.locator('#cl-deep-root .cl-deep-task').waitFor();
  assert.match(await page.locator('#cl-deep-root').innerText(),/知識を別の仕事へ移す/);
  await page.locator('#dpNumber').fill('３５');
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/正解です/);
  await page.locator('[data-dp-question="deep-bk-02"]').click();
  await page.locator('input[name="dpMulti"][value="0"]').check();
  await page.locator('input[name="dpMulti"][value="1"]').check();
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/選択肢ごとの判断根拠/);
  await page.locator('[data-dp-view="case"]').click();
  assert.match(await page.locator('.cl-deep-case-facts').innerText(),/北辰スポーツ映像/);
  await page.locator('#dpNumber').fill('-5');
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/正解です/);
  await page.locator('[data-dp-stage="1"]').click();
  await page.locator('input[name="dpMulti"][value="0"]').check();
  await page.locator('input[name="dpMulti"][value="1"]').check();
  await page.locator('input[name="dpMulti"][value="2"]').check();
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/正解です/);
  await page.locator('[data-dp-stage="2"]').click();
  await page.locator('#dpNumber').fill('2100');
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/正解です/);
  await page.locator('[data-dp-stage="4"]').click();
  for(const [i,n] of [1,3,0,2].entries()){
    await page.locator('[data-dp-order="'+i+'"]').selectOption(String(n));
  }
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/正解です/);
  await page.locator('[data-dp-stage="5"]').click();
  const memo='事実：売上は増えたが利益率は低下。仮説：制作原価や低採算案件の増加を疑う。確認：案件別粗利と債権回収を調べる。判断：契約30社を損益分岐点とする前提、顧客の支払意思と映像権利を検証し、意思決定者に選択肢を報告する。';
  await page.locator('#dpText').fill(memo);
  await page.locator('[data-dp-action="submit"]').click();
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/自己評価で確認/);
  assert.match(await page.locator('.cl-deep-feedback').innerText(),/模範例/);
  await page.locator('[data-dp-self="0"]').check();
  await page.reload({waitUntil:'load'});
  await page.locator('#dpText').waitFor();
  assert.equal(await page.locator('#dpText').inputValue(),memo);
  assert.ok(await page.locator('[data-dp-self="0"]').isChecked());
  // 2026-10-20: 3段階の実力検証（初回→別事例→遅延ロック・再開）
  await page.getByRole('button',{name:'実力検証',exact:true}).click();
  await page.locator('#cl-transfer-root .cl-tf').waitFor();
  await page.locator('#tfValue').fill('-2');
  await page.locator('[data-tf-action="submit"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/別事例の練習/);
  await page.locator('#tfValue').fill('-4');
  await page.locator('[data-tf-action="submit"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/初見評価は、後日に解く/);
  assert.equal(await page.locator('#cl-transfer-root').getByText('施設運営会社').count(),0,'holdout question not shown yet');
  await page.reload({waitUntil:'load'});
  await page.locator('#cl-transfer-root .cl-tf').waitFor();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/初見評価は、後日に解く/);
  await page.locator('[data-tf-domain="statistics"]').click();
  await page.locator('input[name="tfChoice"][value="2"]').check();
  await page.locator('[data-tf-action="submit"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/別事例の練習/);
  await page.locator('input[name="tfChoice"][value="0"]').check();
  await page.locator('[data-tf-action="submit"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/初見評価は、後日に解く/);
  await page.locator('[data-tf-domain="pmo"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/初回確認/);
  await page.locator('input[name="tfChoice"][value="1"]').check();
  await page.locator('[data-tf-action="submit"]').click();
  await page.locator('input[name="tfChoice"][value="3"]').check();
  await page.locator('[data-tf-action="submit"]').click();
  assert.match(await page.locator('#cl-transfer-root').innerText(),/初見評価は、後日に解く/);
  // Authentic case: frozen first submission, external review worksheet and next-case transfer
  await page.getByRole('button',{name:'判断メモ',exact:true}).click();
  await page.locator('#cl-evidence-root .cl-ec-editor').waitFor();
  assert.ok(await page.locator('[data-ec-case="ticket-sync-v1"]').isDisabled(),'case B locked before case A');
  assert.equal(await page.locator('.cl-ec-anchor').count(),0,'reference answer not visible before first submission');
  await page.locator('[data-ec-action="submit"]').click();
  assert.match(await page.locator('[role="alert"]').last().innerText(),/不足している欄/);
  const first={
    facts:'権利台帳M1により40本中12本の許可は未完了。営業担当の40本約束は契約で未確認。',
    classification:'12本未承認は期限経過済みの問題。翌日の変換遅延は未発生のリスクである。',
    options:'Aは許諾済み28本の段階公開、Bは延期。スポンサー条件が許すならAを検討する。',
    governance:'広報責任者が木曜17時までに判断、権利担当と営業担当が資料を集める。',
    verification:'契約原本と権利台帳を確認し、負荷試験の結果次第では予定公開を延期する。'
  };
  for(const [name,value] of Object.entries(first))await page.locator('[data-ec-field="'+name+'"]').fill(value);
  await page.getByRole('button',{name:'下書きをこの端末に保存'}).click();
  await page.reload({waitUntil:'load'});
  await page.locator('#cl-evidence-root .cl-ec-editor').waitFor();
  assert.equal(await page.locator('[data-ec-field="facts"]').inputValue(),first.facts,'evidence draft survives reload');
  await page.locator('[data-ec-action="submit"]').click();
  assert.match(await page.locator('.cl-ec-submitted').innerText(),/初回提出を保存しました/);
  assert.ok(await page.locator('[data-ec-case="ticket-sync-v1"]').isEnabled());
  assert.ok(await page.locator('[data-ec-field="facts"]').getAttribute('readonly')!==null,'frozen initial response');
  assert.match(await page.locator('.cl-ec-review').innerText(),/参考例/);
  assert.match(await page.locator('.cl-ec-review').innerText(),/評価依頼票/);
  await page.locator('[data-ec-case="ticket-sync-v1"]').click();
  assert.equal(await page.locator('.cl-ec-anchor').count(),0,'second reference reasoning not shown before submission');
  const second={
    facts:'T1の記録には12,000席中270席の不整合がある。一部なので大丈夫という販売担当の意見は未検証。',
    classification:'在庫不整合はすでに起きた問題。一方API上限への到達は未発生のリスクである。',
    options:'案Aは一致が確認できた席だけ発売、案Bは全面延期。安全な制御ができる場合だけ案A。',
    governance:'チケット責任者が金曜18時に決裁。情報システム担当が在庫照合を担う。',
    verification:'再照合ログ、限定発売の技術条件、API負荷試験を17時までに確認する。'
  };
  for(const [name,value] of Object.entries(second))await page.locator('[data-ec-field="'+name+'"]').fill(value);
  await page.locator('[data-ec-action="submit"]').click();
  await page.locator('.cl-ec-comparison').waitFor();
  assert.match(await page.locator('.cl-ec-comparison').innerText(),/難易度は等化されていません/);
  await page.reload({waitUntil:'load'});
  await page.locator('.cl-ec-comparison').waitFor();
  assert.equal(await page.locator('[data-ec-field="facts"]').inputValue(),second.facts);
  assert.ok(await page.locator('[data-ec-field="facts"]').getAttribute('readonly')!==null);
  const overflows=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(overflows.scrollWidth<=overflows.viewport+2,'horizontal viewport overflow: '+JSON.stringify(overflows));
  assert.deepEqual(errors,[],'uncaught page errors');
  console.log('PASS '+v.name+' / real DOM flows, state persistence, viewport');
  await context.close();
  await browser.close();
}

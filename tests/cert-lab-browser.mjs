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
  const overflows=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  assert.ok(overflows.scrollWidth<=overflows.viewport+2,'horizontal viewport overflow: '+JSON.stringify(overflows));
  assert.deepEqual(errors,[],'uncaught page errors');
  console.log('PASS '+v.name+' / real DOM flows, state persistence, viewport');
  await context.close();
  await browser.close();
}

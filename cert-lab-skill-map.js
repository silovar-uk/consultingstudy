/* Editorial skill x certification mapping and source-level secretary 2nd-grade gap audit.
 * These are NOT verified exam coverage rates or psychometric ability scores. */
(()=>{
'use strict';
const D=window.CERT_LAB_DATA;if(!D)return;
const competencies=[
{id:'analyze',name:'分析する',example:'数字・現場データを比較して問いを立てる',evidence:'分母・単位・資料の時点と計算過程を正しく示す',primary:['bookkeeping','statistics'],related:['diagnosis','it','ecba','secretary'],caveat:'一般知識の一問正答だけでは分析の実務能力を認定できない。'},
{id:'frame',name:'構造化する',example:'依頼された解決策の背後にある問題を定義する',evidence:'問題・制約・関係者・成果を分けて説明する',primary:['ecba','diagnosis'],related:['pmp','statistics','it','scrum'],caveat:'選択式クイズだけでは成果物の品質を測れない。'},
{id:'judge',name:'判断する',example:'不確実な状況で代替案と停止条件を示す',evidence:'事実と仮説、リスクと問題、代替案・判断条件を区別する',primary:['pmp','diagnosis'],related:['bookkeeping','statistics','it','ecba','secretary'],caveat:'責任を持つ決裁者への実務権限までは含まない。'},
{id:'communicate',name:'伝える',example:'顧客への一次対応と上司への状況報告を変える',evidence:'相手の必要情報、未確認事項、連絡期限、守秘を満たす',primary:['secretary'],related:['pmp','ecba','diagnosis'],caveat:'文面を提出しても実際の接客態度や発声は確認できない。'},
{id:'align',name:'合意する',example:'利害の異なる関係者の判断条件をすり合わせる',evidence:'決裁者・当事者の懸念と合意事項を記録する',primary:['pmp','ecba'],related:['secretary','scrum','diagnosis'],caveat:'一人で作った記述だけで合意形成能力は測れない。'},
{id:'deliver',name:'実行を管理する',example:'担当・期限・依存関係・品質を明らかにする',evidence:'決定事項・担当・期限・確認方法を示す',primary:['pmp','scrum','it'],related:['secretary','ecba'],caveat:'プロジェクトが実際に成功したという実測ではない。'},
{id:'improve',name:'改善する',example:'観察した事実に応じて作業と判断を更新する',evidence:'差分・反証・次の検証を示す',primary:['statistics','scrum'],related:['pmp','ecba','diagnosis'],caveat:'初見問題の一回の正答差は改善の因果的証拠ではない。'}
];
const officialUrl='https://jitsumu-ginou-kentei.jp/assets/files/articles/2376/files237667ca9875c14be.pdf';
const secretaryAudit=[
{domain:'Ⅰ 必要とされる資質',subtopic:'秘書的業務に必要な要件',status:'一部触れる',modules:['sec-01'],note:'判断・機密・機転は練習。記憶力・表現力等の系統的評価はない。'},
{domain:'Ⅰ 必要とされる資質',subtopic:'要求される人柄',status:'未収録',modules:[],note:'身だしなみ・良識・誠実さ等の具体的な教育・評価はない。'},
{domain:'Ⅱ 職務知識',subtopic:'秘書的な仕事の機能',status:'一部触れる',modules:['sec-01'],note:'補佐と決裁を扱う。上司の機能との体系的対応は未完成。'},
{domain:'Ⅲ 一般知識',subtopic:'社会常識・時事問題',status:'未収録',modules:[],note:'時事・社会常識の出題範囲は未実装。'},
{domain:'Ⅲ 一般知識',subtopic:'経営管理の基礎',status:'一部触れる',modules:['sec-03'],note:'損益の簡単な数値例のみ。経営管理全般は未収録。'},
{domain:'Ⅳ マナー・接遇',subtopic:'人間関係',status:'一部触れる',modules:['sec-02'],note:'傾聴・報告を扱うが一般的な人間関係全体は未整備。'},
{domain:'Ⅳ マナー・接遇',subtopic:'ビジネスマナー・一般マナー',status:'一部触れる',modules:['sec-02'],note:'社外応対の一部。社会的慣習等の幅は不足。'},
{domain:'Ⅳ マナー・接遇',subtopic:'話し方・接遇',status:'一部触れる',modules:['sec-02'],note:'敬語・苦情一次応答・短い報告を扱う。説得・忠告の練習は不足。'},
{domain:'Ⅳ マナー・接遇',subtopic:'交際の業務',status:'未収録',modules:[],note:'慶弔・贈答・上司加入団体の事務の演習はない。'},
{domain:'Ⅴ 技能',subtopic:'会議',status:'一部触れる',modules:['sec-03'],note:'日程変更と判断メモ中心。準備・事後処理全般は未整備。'},
{domain:'Ⅴ 技能',subtopic:'文書の作成',status:'一部触れる',modules:['sec-03'],note:'議事録の論点はある。社内外文書作成・グラフの独立演習はない。'},
{domain:'Ⅴ 技能',subtopic:'文書の取り扱い',status:'一部触れる',modules:['sec-01','sec-03'],note:'守秘・版管理を扱う。送付・受発信の事務は未整備。'},
{domain:'Ⅴ 技能',subtopic:'ファイリング',status:'未収録',modules:[],note:'保存方式や実際の整理・検索手順の独立練習がない。'},
{domain:'Ⅴ 技能',subtopic:'資料管理',status:'一部触れる',modules:['sec-03'],note:'版管理を扱う。名刺・情報収集・保管の詳細は不足。'},
{domain:'Ⅴ 技能',subtopic:'スケジュール管理',status:'一部触れる',modules:['sec-03'],note:'変更連絡・締切を扱う。日程管理全般の体系的演習はない。'},
{domain:'Ⅴ 技能',subtopic:'環境・事務用品の整備',status:'未収録',modules:[],note:'事務用品・環境整備の教材なし。'}
];
D.competencyMap={
 version:'editorial-1',interpretation:'編集上の関連づけ。資格試験網羅・職務能力測定・熟達度の評価ではない。',
 competencies,secretaryAudit,officialUrl,
 relatedTracks:id=>{
  const x=competencies.find(x=>x.id===id);return x?[...x.primary,...x.related]:[];
 }
};
})();
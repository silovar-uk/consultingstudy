/* One fictional project, three viewpoints: PMO × secretarial communication.
   Source code is public; staged hiding is a study aid, not exam security. */
window.CERT_LAB_INTEGRATED = (()=>{
'use strict';
const scenario={
id:'cross-rights-communication-v1',version:1,title:'公開前日の「まだ出せない6本」',
purpose:'配信判断を安全に進めながら、顧客との信頼を損なわない',
records:[
{id:'R1',label:'権利管理台帳',at:'金曜15:00',text:'土曜14:00公開予定のハイライト24本中18本の利用許諾を確認。残り6本は未承認で、確認予定だった金曜12:00を過ぎても未解決。'},
{id:'R2',label:'顧客担当のメール',at:'金曜14:30',text:'「明日14時に24本すべて公開できると理解しています。公開可否を金曜16:30までに知らせてください」。ただし契約条項の提示はない。'},
{id:'R3',label:'運用担当の確認',at:'金曜14:45',text:'現時点で配信障害は発生していない。ただし翌日のピーク時に変換遅延が起きる可能性があり、負荷検証は未実施。'},
{id:'R4',label:'架空の社内運用規程',at:'有効な最新版',text:'許諾のないクリップは一切公開できない。公開本数・延期の最終決裁は配信責任者が金曜17:00までに行う。外部への確約は決裁後。'},
{id:'R5',label:'社内営業担当の口頭説明',at:'金曜15:05',text:'「スポンサーには24本を約束したかもしれない」。契約原本は未確認。営業担当の個人携帯番号は顧客に非公開。'}
],
stages:[
{id:'s1',role:'PMO',title:'事実・問題・リスクを仕分ける',tag:'判断の土台',prompt:'配信責任者が判断できるよう、何が確定した事実で、何が未確認で、何が発生済み問題／将来のリスクかを、資料番号を示して整理する。',checks:['R1の期限超過を発生済み問題として示す','R3の遅延可能性はまだ発生していないリスクと区別する','R2とR5の契約・約束を未確認として扱う'],model:'R1：24本中6本が金曜12時の予定期限を過ぎても未承認で、これは発生済み問題。R3：現在障害はなく翌日の変換遅延は将来のリスク。R2とR5の「24本を約束」は顧客の理解と営業の未照合発言であり、契約原本で確認が必要。'},
{id:'s2',role:'秘書検定・接遇',title:'顧客への一次応答をつくる',tag:'信頼を守る',prompt:'顧客に対し、丁寧かつ簡潔な連絡文を作る。未決裁の公開範囲・時刻を確約せず、16:30までの回答要請への対応と次回連絡を示す。個人の連絡先や社内機密を漏らさない。',checks:['相手の懸念・要請を受け止める','未確定の公開内容・時刻を勝手に約束しない','返答時刻・方法を明記し、未回答の場合も連絡すると示す'],model:'ご連絡ありがとうございます。明日の公開範囲について確認を進めております。現時点では全24本の公開可否を確約できません。ご指定の本日16時30分までに確認状況と今後の対応をご案内します。結論が確定していない場合も、その旨と次のご連絡時刻をお伝えします。'},
{id:'s3',role:'PMO × 秘書検定',title:'上司に決裁を求め、行動につなげる',tag:'実行を確定する',prompt:'配信責任者へ送る意思決定メモを書く。18本の限定公開か延期か、成立条件と損失を比較し、情報を誰が何時までに調べ、何を17時までに決裁するかを示す。顧客への16:30連絡と17時決裁の時刻のずれへの対応も考える。',checks:['18本のみ公開と延期を、契約・権利・品質の条件付きで比較する','決裁者と営業・権利・運用担当の役割、17時の決裁期限を示す','16:30には暫定状況を連絡し、確定回答を決裁後に別途届けると整理する'],model:'権利担当は16時までに6本の許諾可否を確認、営業は契約原本とスポンサー条件を照合、運用は16時までに負荷検証を行う。案Aは許諾済み18本に限定して公開（契約上許され品質も確認できる場合）。案Bは公開延期（権利リスクを回避できるが顧客・スポンサーへの影響あり）。金曜16:30には結論未確定でも顧客へ事実と次回連絡予定を案内。配信責任者が17時に案A/Bと顧客への確定回答を決裁し、無許諾素材は公開しない。'}
],
rubric:[
{id:'source',name:'原資料と事実の分離',stageId:'s1',zero:'根拠の記載なし／未確認の発言を事実扱い',one:'一部原資料や未確認点を示す',two:'資料IDと日時・数量を示し確認事項を区別'},
{id:'risk',name:'問題とリスクの識別',stageId:'s1',zero:'期限超過と遅延リスクを混同',one:'分類できるが影響・対応が曖昧',two:'問題・未発生リスクを区別し次の対応まで示す'},
{id:'courtesy',name:'敬意と情報の適切さ',stageId:'s2',zero:'相手の要請を無視／不適切な情報開示',one:'礼節はあるが次の対応が曖昧',two:'相手の要請に対応し必要な範囲で情報を伝える'},
{id:'promise',name:'確約と期待値の管理',stageId:'s2',zero:'未承認公開を確約',one:'確約は避けるが16:30への対応が不明',two:'暫定・確定回答を区別し16:30までの連絡を設計'},
{id:'options',name:'代替案と安全条件',stageId:'s3',zero:'未承認素材公開を推奨／一案だけ断言',one:'二案あるが権利・契約・品質の条件が不足',two:'許諾済み限定公開と延期を条件付きで比較'},
{id:'governance',name:'権限・期限・担当',stageId:'s3',zero:'決裁者と締切・担当が不明',one:'一部明記するが16:30と17:00の矛盾を放置',two:'責任者・担当・期限を示し連絡と決裁時刻のずれを解決'}
],
critical:[
 '未承認の6本を公開する判断を許可していないか',
 '顧客の認識と営業の口頭説明を契約上の確定情報と混同していないか',
 '顧客への16:30の約束と責任者の17:00決裁を混同していないか'
]};
const minLength=45;
const stageById=id=>scenario.stages.find(x=>x.id===id);
function validate(input){const t=String(input??'').trim();return {ok:t.length>=minLength&&t.length<=2500,length:t.length,reason:t.length<minLength?'根拠と判断を45文字以上で記入してください。':t.length>2500?'2500文字以内にまとめてください。':''};}
function nextStep(submissions){return scenario.stages.find(s=>!submissions?.[s.id])||null;}
function makeReview(submissions){
 if(!scenario.stages.every(s=>submissions?.[s.id]))return null;
 let out='# 横断実務ケース｜独立評価依頼票\n\n';
 out+='ケース：'+scenario.title+'／ケース版：'+scenario.version+'\n評価者名：________　評価日：________\n';
 out+='※架空資料のみ。提出文が機密・個人情報を含む場合は共有しない。参考例・自己評価は評価者に渡さない。\n';
 out+='※記述提出と評価は実力の認定や学習効果の証明ではない。\n\n';
 out+='## ケースの一次資料（すべて架空）\n\n';
 for(const r of scenario.records)out+='- '+r.id+'｜'+r.label+'（'+r.at+'）：'+r.text+'\n';
 out+='\n## 初回提出（固定・変更不可）\n';
 for(const st of scenario.stages){const sub=submissions[st.id];out+='\n### '+st.role+'｜'+st.title+'\n提出日時：'+sub.at+'\n\n'+sub.text+'\n';}
 out+='\n## 独立評価票（各項目 0／1／2／判定保留）\n';
 for(const r of scenario.rubric)out+='\n### '+r.name+'\n0：'+r.zero+'\n1：'+r.one+'\n2：'+r.two+'\n評価：____ ／ 根拠となる記述：____\n';
 out+='\n## 重大な見落とし\n'+scenario.critical.map(x=>'- [ ] '+x).join('\n')+'\n';
 out+='\n## 評価者メモ\n最重要の改善点：\n\n別の合理的な判断・前提条件：\n\n再評価したい問い：\n';
 out+='\n## 出典（評価方針の参考）\nhttps://www.pmi.org/learning/library/risks-vs-issues-project-failure-2328\nhttps://jitsumu-ginou-kentei.jp/assets/files/articles/2376/files237667ca9875c14be.pdf\nhttps://www.ets.org/research/policy_research_reports/publications/report/2011/imbu.html\n';
 return out;
}
return {scenario,stageById,validate,nextStep,makeReview,minLength};
})();
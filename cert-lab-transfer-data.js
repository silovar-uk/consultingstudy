window.CERT_LAB_TRANSFER=(function bootTransfer(){
 'use strict';
 const studies=[
  {id:'finance',name:'財務｜利益率を正しく比較する',skill:'営業利益率の分母と前年差（ポイント）を使って採算の変化を説明する',moduleId:'book-02',sample:'営業利益率は「営業利益 ÷ 売上高 × 100」。変化は率同士の差（パーセントポイント）で表す。売上の増加は利益率の改善を意味しない。',source:'https://www.jpx.co.jp/listing/disclosure/index.html',questions:[
    {id:'tf-fin-a',phase:'A',kind:'number',context:'初回確認｜身近な小売企業',stem:'前期売上1,000万円・営業利益120万円、当期売上1,200万円・営業利益120万円。営業利益率は何ポイント変化したか。減少はマイナスで入力。',answer:-2,unit:'ポイント',why:'前期12%、当期10%。10−12＝−2ポイント。利益額が横ばいでも分母の売上が増えれば利益率は下がる。'},
    {id:'tf-fin-b',phase:'B',kind:'number',context:'別事例｜映像配信サービス',stem:'ある配信会社は前期売上20,000万円・営業利益2,000万円、当期売上25,000万円・営業利益1,500万円。営業利益率の変化幅をポイントで求める。',answer:-4,unit:'ポイント',why:'前期10%、当期6%。6−10＝−4ポイント。伸びる売上だけでなく採算の悪化も報告する。'},
    {id:'tf-fin-c',phase:'C',kind:'number',context:'後日の初見評価｜スポーツ施設運営',stem:'施設運営会社の前期売上8,000万円・営業利益1,000万円、当期売上10,000万円・営業利益900万円。営業利益率の変化幅をポイントで答える。',answer:-3.5,unit:'ポイント',why:'前期12.5%、当期9%。9−12.5＝−3.5ポイント。別業種でも同じ分母の考え方が使える。'}
  ]},
  {id:'statistics',name:'統計｜相関と因果を混同しない',skill:'観察データで交絡の可能性を考え、因果効果を断定しない',moduleId:'stat-03',sample:'施策群と非施策群の結果が異なっても、対象者の元々の属性が違えば施策の因果効果とは限らない。割付方法・事前特性・結果測定条件を点検する。',source:'https://www.toukei-kentei.jp/grade/grade2/',questions:[
    {id:'tf-stat-a',phase:'A',kind:'choice',context:'初回確認｜イベント集客',stem:'イベント参加者の購入率は非参加者より高かった。最も慎重で妥当な結論は？',choices:['イベントが購買率を高めたと確定する','参加者数が多ければ因果関係が証明できる','参加前から購買意欲が高い人が参加した可能性を調べる','購入率の差があれば比較群の属性は確認不要'],answer:2,why:'参加選択は元々の関心と関連する可能性がある。観察された差だけではイベントの因果効果を確定できない。'},
    {id:'tf-stat-b',phase:'B',kind:'choice',context:'別事例｜営業研修',stem:'研修を受けた店舗の売上増加率が高かった。しかし研修先は本部が成長店舗から優先的に選んでいた。次に最も重視することは？',choices:['研修前の売上推移や店舗特性を揃えた比較を検討する','売上増加は研修の効果だと確定する','研修対象を増やして平均値だけ再計算する','研修後の対象店舗だけを観察すれば十分とする'],answer:0,why:'対象店舗の選び方に偏りがある。事前推移・規模・地域等の違いを調べ、可能なら適切な比較群を設計する。'},
    {id:'tf-stat-c',phase:'C',kind:'choice',context:'後日の初見評価｜従業員の継続率',stem:'任意参加の社員勉強会に参加した従業員は、半年後の在籍率が高かった。適切な次の判断は？',choices:['学習会が離職を確実に防いだと主張する','半年後の在籍率だけで因果効果を算定する','不参加者のデータを全件除外する','参加前の勤続年数・所属・志向などの違いを確認して検証する'],answer:3,why:'自発的な参加には勤続意欲などの交絡があり得る。条件をそろえた検証なしに勉強会の効果と断定しない。'}
  ]},
  {id:'pmo',name:'PMO｜リスクと発生済み問題を区別する',skill:'未発生のリスクと発生済み問題を分け、責任者・期限・対応を決める',moduleId:'pmp-01',sample:'リスクはまだ発生していない不確実な出来事、問題（Issue）はすでに発生した事象。問題には担当者・影響・期限を、リスクには発生条件・影響・対応方針を設定する。',source:'https://www.pmi.org/certifications/project-management-pmp/new-exam',questions:[
    {id:'tf-pmo-a',phase:'A',kind:'choice',context:'初回確認｜データ納品',stem:'納品業者の遅延が懸念されるが、現時点で納期は守られている。最も適切な扱いは？',choices:['遅延が確定した問題として緊急復旧手順を実施する','発生確率・影響・検知条件を持つリスクとして登録する','納期が守られているため記録も不要','担当者を決めずに納期後まで待つ'],answer:1,why:'現時点では未発生のリスク。検知条件、影響、予防策と責任者を先に設定する。'},
    {id:'tf-pmo-b',phase:'B',kind:'choice',context:'別事例｜システム移行',stem:'本番移行の前日に必要な権限設定が未完了で、担当者も不明だった。まず行うべきことは？',choices:['来月起こるかもしれないリスクだけに記録する','障害ではないので完了扱いにする','担当者への共有なしに設定を独断で変更する','発生済みの問題として影響・担当者・解決期限を明確にする'],answer:3,why:'必要な権限が未設定という事象はすでに発生済み。対処責任と期限、必要なエスカレーションを決める。'},
    {id:'tf-pmo-c',phase:'C',kind:'choice',context:'後日の初見評価｜大会配信プロジェクト',stem:'映像配信を行う大会で、必要な権利許諾の期限が昨日過ぎたが承認は未着。公開予定は明日である。PMOとして最も適切なのは？',choices:['単に「将来起こり得るリスク」として扱い、未着の事実を伏せる','事業成果の達成を優先して無許諾のまま公開する','発生済みの問題として公開影響・責任者・判断期限を整理し決裁を求める','次の定例会議まで関係者に知らせない'],answer:2,why:'期限超過と承認未着は発生済み問題。無許諾で公開せず、事実・影響・責任者・判断期限を整理して権限者に判断を求める。'}
  ]}
 ];
 const byDomain=id=>studies.find(x=>x.id===id);
 const byQuestion=id=>studies.flatMap(x=>x.questions).find(q=>q.id===id);
 const intervalDays=3; // 実装試行用の間隔。最適な学習間隔という科学的主張はしない。
 const stepFor=(progress,domain,at=Date.now())=>{
   const study=byDomain(domain);if(!study)return {phase:'invalid'};
   const answers=progress?.[domain]?.answers||{};
   if(!answers.A)return {phase:'A',state:'ready',question:study.questions[0]};
   if(!answers.B)return {phase:'B',state:'ready',question:study.questions[1]};
   if(!answers.C){
      const available=Date.parse(answers.B.at)+intervalDays*86400000;
      if(!Number.isFinite(available))return {phase:'B',state:'invalid',question:study.questions[1]};
      if(at<available)return {phase:'C',state:'locked',availableAt:new Date(available).toISOString(),question:null};
      return {phase:'C',state:'ready',question:study.questions[2]};
   }
   return {phase:'complete',state:'done',question:null};
 };
 const grade=(q,input)=>{
    if(!q)return {status:'invalid',reason:'問題の指定が不正です'};
    if(q.kind==='number'){
      const val=String(input??'').trim().replace(/[０-９]/g,c=>String(c.charCodeAt(0)-65296)).replace(/[．]/g,'.').replace(/[－−]/g,'-').replace(/,/g,'');
      if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(val))return {status:'invalid',reason:'単位を除いて数値だけ入力してください'};
      const n=Number(val);
      if(!Number.isFinite(n))return {status:'invalid',reason:'有限の数値を入力してください'};
      return {status:Math.abs(n-q.answer)<1e-7?'correct':'incorrect',response:n};
    }
    if(q.kind==='choice'){
       if(input===null||input===undefined||input==='')return {status:'invalid',reason:'一つ選んでください'};
       const n=Number(input);
       if(!Number.isInteger(n)||n<0||n>=q.choices.length)return {status:'invalid',reason:'有効な選択肢を選んでください'};
       return {status:n===q.answer?'correct':'incorrect',response:n};
    }
    return {status:'invalid',reason:'不明な形式'};
 };
 return {studies,byDomain,byQuestion,intervalDays,stepFor,grade};
})();
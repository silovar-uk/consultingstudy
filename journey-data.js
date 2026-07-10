window.ATLAS_JOURNEY = (() => {
  'use strict';

  const phases = [
    { id: 'phase-1', no: 1, title: '問いを立てる', subtitle: '依頼を、判断できる形へ変える' },
    { id: 'phase-2', no: 2, title: '数字を読む', subtitle: '数字を、事業と経営論点へ戻す' },
    { id: 'phase-3', no: 3, title: '一枚で伝える', subtitle: '分析を、相手が判断できる資料へ変える' }
  ];

  const lessons = [
    {
      id: 'lesson-03-01', chapterId: 'chapter-03', phaseId: 'phase-1', week: 1, order: 1,
      title: '依頼を、判断すべき問いに変える', subtitle: '「何を作るか」の前に、「何を決めるか」を置く',
      minutes: 15, xp: 40, contentReady: true, isFictional: true,
      concepts: ['意思決定', '依頼確認', '成功条件', '対象範囲'],
      scene: {
        label: 'PROJECT BRIEF', role: 'プロジェクトメンバー',
        brief: '部長から「若年層の新規顧客を増やす施策を考えて。来週、資料にして」と依頼された。',
        stakes: '明日の打合せで、調査と企画の進め方を決める。'
      },
      prediction: {
        question: '最初の返答として、いちばん良いものは？',
        options: ['競合の若者向け施策を50件集めます', 'どの意思決定に使う資料か、対象と成功条件を確認します', '若者に人気のSNSを調べます'], answer: 1,
        feedback: '施策や調査へ走る前に、誰が何を決めるための仕事かを揃える。'
      },
      interaction: {
        title: '依頼確認メモに必要な項目を選ぶ',
        instruction: 'この時点で確認したいものを4つ選ぼう。', required: 4,
        options: [
          { id: 'decision', label: '今回、誰が何を決めるのか', correct: true },
          { id: 'success', label: '成功をどの指標で測るのか', correct: true },
          { id: 'scope', label: '対象にする若年層と期間', correct: true },
          { id: 'output', label: '必要な成果物と期限', correct: true },
          { id: 'color', label: '資料の表紙を何色にするか', correct: false },
          { id: 'volume', label: '最初から100枚作るか', correct: false }
        ],
        observation: '目的・意思決定・成功条件・対象範囲が揃うと、調査も施策も必要な分だけ設計できる。'
      },
      explanation: {
        prompt: 'なぜ、いきなり施策を考え始めない方がよい？',
        placeholder: '例：誰が何を決めるための仕事かが曖昧なままだと、調査や資料の範囲が広がるから。', minLength: 20
      },
      formalize: {
        bridge: 'やさしく言えば、「宿題の答えを書く前に、先生が何を見たいかを確かめる」。実務では、その先生が意思決定者に当たる。',
        textbook: '依頼確認では、背景・意思決定者・今回決めること・成功条件・期限・成果物・対象範囲・対象外を明確にする。作業依頼を意思決定課題へ言い換えることで、分析の過不足を減らせる。',
        framework: '背景 → 意思決定 → 成功条件 → 対象範囲 → 成果物・期限',
        workedExample: '「若年層向け施策を考える」から、「20代の新規来場を次四半期に増やすため、誰を狙い、どの接点へ投資するかを営業部長が決める」へ言い換える。',
        commonMistake: '質問を増やしすぎて、相手へ確認事項を丸投げすること。分かる範囲で仮置きし、判断に効く未確認事項だけを聞く。',
        column: { label: '現場の一幕', title: '早い人ほど、最初の5分で止まる', body: 'すぐ作り始める人は速く見える。ただ、目的がずれた20枚を直すより、最初の5分で問いを揃える方が最終的には速い。止まることは遅さではなく、手戻りを減らす設計。', takeaway: '持ち帰り：作業速度より、問いの精度。' }
      },
      recall: [
        { id: 'r1', question: '依頼を受けた直後、最初に置くものは？', options: ['調査件数', '意思決定', 'スライド枚数'], answer: 1 },
        { id: 'r2', question: '良い対象範囲の説明は？', options: ['できるだけ全部', '20代・新規顧客・次四半期', '面白そうな人'], answer: 1 }
      ],
      application: { title: '依頼確認メモを1本つくる', prompt: '「若年層の新規顧客を増やす施策を考えて」を、誰が何を決める仕事か分かる一文へ書き換えよう。', placeholder: '営業部長が＿＿を判断するため、＿＿を対象に、＿＿を比較・提案する。', minLength: 30, artifactTitle: '依頼確認メモ｜若年層施策', artifactType: '問題解決' },
      sources: [{ title: 'McKinsey Guide to Problem Solving', url: 'https://www.mckinsey.com/featured-insights/mckinsey-guide-to-problem-solving' }]
    },
    {
      id: 'lesson-09-01', chapterId: 'chapter-09', phaseId: 'phase-2', week: 5, order: 2,
      title: 'P/Lの変化を、原因仮説へつなぐ', subtitle: '売上増だけで終わらず、利益率が動いた場所を探す',
      minutes: 18, xp: 60, contentReady: true, isFictional: true,
      concepts: ['売上総利益率', '販管費率', '営業利益率', '観察と仮説'],
      scene: { label: 'CASE FILE 02', role: '分析担当', brief: 'ホワイトリバーは売上が12%増えた一方、営業利益が16%減った。上司から「何が起きている？」と聞かれた。', stakes: '午後のレビューで、追加分析する論点を三つに絞る。' },
      prediction: { question: '最初に確認する場所として最も適切なのは？', options: ['株価だけを見る', '原価率と販管費率を分ける', '売上が増えたので問題ないと答える'], answer: 1, feedback: '営業利益は売上・原価・販管費の組み合わせ。利益率が落ちた場所を分けて見る。' },
      interaction: {
        title: '事実として言える観察を2つ選ぶ', instruction: '原因の推測ではなく、表から直接読めるものを選ぼう。', required: 2,
        table: { headers: ['項目', '前年', '当年'], rows: [['売上高', '50,000', '56,000'], ['売上原価', '30,000', '35,840'], ['販管費', '14,000', '15,120'], ['営業利益', '6,000', '5,040'], ['営業利益率', '12.0%', '9.0%']] },
        options: [
          { id: 'fact1', label: '売上は12.0%増えた', correct: true },
          { id: 'fact2', label: '営業利益率は3.0pt低下した', correct: true },
          { id: 'hyp1', label: '仕入先が値上げした', correct: false },
          { id: 'hyp2', label: '低粗利商品の販売が増えた', correct: false }
        ],
        observation: '売上増と利益率低下は観察できる。一方、仕入単価や商品構成は、追加情報で確かめる仮説。'
      },
      explanation: { prompt: '売上が増えたのに営業利益が減った理由を、断定せずに説明してみよう。', placeholder: '例：売上原価の伸びが売上を上回っており、仕入単価や商品構成によって粗利率が悪化した可能性がある。', minLength: 24 },
      formalize: {
        bridge: '家計でも、収入が増えても支出がそれ以上に増えれば、残るお金は減る。P/Lでは、その変化が原価と販管費のどちらで起きたかを分ける。',
        textbook: 'P/L分析では、金額と率を併用する。売上総利益率は価格・原価・商品構成、販管費率は人員・広告・出店などの影響を受ける。数値から原因を断定せず、仮説と追加確認事項へ接続する。',
        framework: '観察 → 変化した段階 → 原因仮説 → 追加確認',
        workedExample: '観察：売上+12.0%、売上原価+19.5%、営業利益率−3.0pt。仮説：原価率悪化。確認：商品別粗利率、仕入単価、値引率、商品構成。',
        commonMistake: '営業利益が減った理由を「売上が足りない」で済ませること。今回は売上が増えているため、利益へ残るまでの構造を見る。',
        column: { label: '商売のからくり', title: '成長しているのに苦しくなる会社', body: '売上成長には在庫、人員、広告、設備などの先行負担が伴うことがある。成長率だけでは良し悪しは決まらない。何へ先にお金を使い、それがいつ回収されるかまで見ると、数字が経営の話になる。', takeaway: '持ち帰り：成長率と、成長の質は別物。' }
      },
      recall: [
        { id: 'r1', question: '営業利益率の分母は？', options: ['営業利益', '売上高', '総資産'], answer: 1 },
        { id: 'r2', question: '「仕入単価上昇が原因」は、この表だけでは何に当たる？', options: ['観察', '仮説', '確定事実'], answer: 1 }
      ],
      application: { title: '財務論点メモを1本つくる', prompt: '観察・仮説・次に確認する数字を、それぞれ別の文で書こう。', placeholder: '【観察】\n【仮説】\n【確認事項】', minLength: 50, artifactTitle: '財務論点メモ｜ホワイトリバーP/L', artifactType: '財務' },
      sources: [{ title: '金融庁 EDINET', url: 'https://disclosure2.edinet-fsa.go.jp/' }, { title: 'JPX 上場会社情報', url: 'https://www.jpx.co.jp/listing/disclosure/index.html' }]
    },
    {
      id: 'lesson-32-01', chapterId: 'chapter-32', phaseId: 'phase-3', week: 10, order: 3,
      title: '一枚一メッセージをつくる', subtitle: '情報の見出しではなく、判断に必要な結論を書く',
      minutes: 15, xp: 50, contentReady: true, isFictional: true,
      concepts: ['メッセージ', '根拠', 'So What', '一枚一論点'],
      scene: { label: 'REVIEW ROOM', role: '資料作成担当', brief: 'スライドのタイトルが「若年層アンケート結果」になっている。部長から「で、何が言いたいの？」と戻された。', stakes: '15分後の会議までに、判断できる一枚へ直す。' },
      prediction: { question: 'タイトルの直し方として最も良いものは？', options: ['アンケート結果について', '調査結果の詳細', '20代の離脱は価格より申込手順で起きており、導線改善を優先する'], answer: 2, feedback: 'タイトルだけで、そのページの結論と次の判断が伝わる状態を目指す。' },
      interaction: {
        title: '一枚に残す要素を3つ選ぶ', instruction: 'このページの主張を支える要素だけを残そう。', required: 3,
        options: [
          { id: 'message', label: '結論：申込手順の改善を優先する', correct: true },
          { id: 'fact', label: '離脱者の58%が手順の分かりにくさを回答', correct: true },
          { id: 'next', label: '次の判断：入力項目を減らす改修を検証', correct: true },
          { id: 'all', label: '自由回答200件をすべて掲載', correct: false },
          { id: 'history', label: '調査票を作るまでの経緯を全文掲載', correct: false }
        ],
        observation: '結論・根拠・次の判断が一枚でつながると、読み手は情報を再編集せずに判断できる。'
      },
      explanation: { prompt: '「アンケート結果」というタイトルでは、なぜ判断が進まない？', placeholder: '例：何が分かり、何を決めるべきかが書かれておらず、読み手が本文から結論を作り直す必要があるから。', minLength: 24 },
      formalize: {
        bridge: '新聞の見出しが「昨日の出来事」だけでは中身が分からないのと同じ。スライドタイトルは分類名ではなく、そのページで伝える結論。',
        textbook: '一枚一メッセージでは、スライドごとに一つの主張を置き、本文の図表と根拠をその主張へ従属させる。タイトルを読んだだけでストーリーが追える状態が基本になる。',
        framework: 'メッセージ → 根拠 → So What → 次の判断',
        workedExample: '「来場者アンケート」ではなく、「初回来場者の再来場意向は高いが、情報取得の遅さが障壁。試合2週間前の案内を優先する」。',
        commonMistake: 'タイトルへ情報を詰め込みすぎること。結論は一つに絞り、条件や例外はサブメッセージや注記で扱う。',
        column: { label: '失敗の解剖', title: '「詳しい資料」が伝わるとは限らない', body: '情報をたくさん載せるほど、作成者は安心する。しかし読み手側では、重要度の判断まで任される。良い資料は情報量を減らすのではなく、どの情報を使って何を判断するかを設計している。', takeaway: '持ち帰り：資料は情報の倉庫ではなく、判断の導線。' }
      },
      recall: [
        { id: 'r1', question: 'スライドタイトルの基本的な役割は？', options: ['ページ番号の代わり', 'そのページの結論を伝える', '図表の種類を書く'], answer: 1 },
        { id: 'r2', question: '一枚に置く主張はいくつが基本？', options: ['一つ', '三つ以上', '多いほど良い'], answer: 0 }
      ],
      application: { title: 'タイトルを判断文へ直す', prompt: '「若年層アンケート結果」を、結論と次の判断が分かるタイトルへ書き換えよう。', placeholder: '例：20代の離脱は＿＿で起きており、＿＿を優先する。', minLength: 30, artifactTitle: 'スライドメッセージ｜若年層アンケート', artifactType: '伝える' },
      sources: []
    }
  ];

  return { phases, lessons };
})();

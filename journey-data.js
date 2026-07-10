window.ATLAS_JOURNEY = (() => {
  'use strict';

  const phases = [
    { id: 'phase-0', no: 0, title: '仕事の土台をつくる', subtitle: '学び方と、コンサルの仕事の目的をつかむ' },
    { id: 'phase-1', no: 1, title: '問いを立てる', subtitle: '依頼を、判断できる形へ変える' },
    { id: 'phase-2', no: 2, title: '数字を読む', subtitle: '数字を、事業と経営論点へ戻す' },
    { id: 'phase-3', no: 3, title: '一枚で伝える', subtitle: '分析を、相手が判断できる資料へ変える' }
  ];

  const lessons = [
    {
      id: 'lesson-00-01', chapterId: 'chapter-00', phaseId: 'phase-0', week: 0, order: 0,
      title: 'このJourneyの歩き方', subtitle: '読むだけで終わらず、小さな成果物まで残す', minutes: 12, xp: 25, contentReady: true, isFictional: true,
      concepts: ['予想', '操作', '想起', '成果物'],
      scene: { label: 'ONBOARDING FILE', role: '新しいプロジェクトメンバー', brief: '研修資料が43章ある。全部を順番に読むべきか、まず実務に使うべきか迷っている。', stakes: '今日の15分で、学習を続けられる最小単位を決める。' },
      prediction: { question: 'このアプリで最初に重視するものは？', options: ['全章を一気に読む', '目の前の一歩を試して成果物を残す', '用語だけ暗記する'], answer: 1, feedback: '理解は、読む量ではなく、予想・操作・説明・想起・応用を通ったかで確かめる。' },
      interaction: { title: '一回の学習に必要な行動を選ぶ', instruction: '読む以外に必要な4つを選ぼう。', required: 4, options: [{ id: 'predict', label: '先に予想する', correct: true }, { id: 'try', label: 'ケースを操作する', correct: true }, { id: 'recall', label: '資料を閉じて思い出す', correct: true }, { id: 'make', label: '小さな成果物を残す', correct: true }, { id: 'scroll', label: '最後まで速くスクロールする', correct: false }], observation: '一章を読了するより、一つの判断を自分で行い、説明と成果物まで残す方が現在地を確認しやすい。' },
      explanation: { prompt: '読むだけでは「使える」状態か分かりにくいのはなぜ？', placeholder: '例：内容を見れば分かった気になるが、資料を閉じて説明・応用できるかは別だから。', minLength: 20 },
      formalize: { bridge: '料理本を読んだだけでは、実際に作れるかは分からない。仕事の学習も、手を動かした結果で確かめる。', textbook: '本Journeyは、予想、操作、自己説明、概念化、想起、応用の順で進む。各レッスンの完了は読了ではなく、行動ログと成果物によって判定する。', framework: '予想 → 操作 → 説明 → 型 → 想起 → 成果物', workedExample: '15分しかない日は、予想とケース操作だけ進めてもよい。次回は同じステップから再開する。', commonMistake: '毎回完璧な成果物を作ろうとして止まること。まず最小版を残し、後でレビューして直す。', column: { label: 'Journeyの余白', title: 'できない原因を、才能にしない', body: '一度に要求される作業が大きすぎると、理解不足と手順不足を区別できない。作業を小さく区切れば、どこで止まったかが見える。', takeaway: '持ち帰り：できないことは、まずステップへ分解する。' } },
      recall: [{ id: 'r1', question: '章の完了を何で確かめる？', options: ['読んだ時間', '行動と成果物', 'ページ数'], answer: 1 }, { id: 'r2', question: '途中で閉じた場合は？', options: ['最初からやり直す', '同じステップから再開する', '完了扱いにする'], answer: 1 }],
      application: { title: '自分の学習方針を一文にする', prompt: 'いつ、何分、何を残すかを書こう。', placeholder: '平日の夜に15分取り、1レッスンの最小成果物を残す。', minLength: 24, artifactTitle: '学習方針カード', artifactType: '学び方' }, sources: []
    },
    {
      id: 'lesson-01-01', chapterId: 'chapter-01', phaseId: 'phase-0', week: 0, order: 1,
      title: 'コンサルの仕事を、意思決定から見る', subtitle: '調査や資料作成を、目的ではなく手段として捉える', minutes: 15, xp: 35, contentReady: true, isFictional: true,
      concepts: ['意思決定支援', '作業', '成果', '次の行動'],
      scene: { label: 'FIRST ASSIGNMENT', role: 'プロジェクトメンバー', brief: '「競合10社を調べて、スライドにまとめて」と依頼された。', stakes: 'レビューで、調査結果が何の判断に使えるか説明する。' },
      prediction: { question: '仕事のゴールとして最も適切なのは？', options: ['10社分の資料を埋める', '競合の違いを基に、自社が何を選ぶか判断できる状態にする', 'きれいな表を作る'], answer: 1, feedback: '調査と資料は手段。最終的に誰のどの判断が前へ進むかが成果になる。' },
      interaction: { title: '作業と成果を分ける', instruction: '「成果」に当たるものを2つ選ぼう。', required: 2, options: [{ id: 'choice', label: '参入すべき顧客層を決められる', correct: true }, { id: 'risk', label: '優先して確認するリスクが分かる', correct: true }, { id: 'pages', label: '20枚のスライドを作る', correct: false }, { id: 'search', label: '検索を100回行う', correct: false }], observation: '成果は作業量ではなく、判断・合意・次の行動が変わった状態で表す。' },
      explanation: { prompt: '資料作成そのものをゴールにすると、何が起きやすい？', placeholder: '例：意思決定に不要な情報まで集め、何を判断する資料か分からなくなる。', minLength: 20 },
      formalize: { bridge: '地図を作る目的は、地図を完成させることではなく、行き先と道を選べるようにすること。', textbook: 'コンサルティングの基本的な役割は、クライアントの意思決定と実行を支援することである。調査、分析、資料、会議は、そのための中間成果物として設計する。', framework: '依頼 → 作業 → 発見 → 判断 → 次の行動', workedExample: '「競合を調べた」ではなく、「若年層獲得では価格より申込体験に差があり、導線改善を優先する判断材料を揃えた」と表現する。', commonMistake: '作業を軽視することではない。品質の高い作業を、意思決定へつながる範囲と順番で行う。', column: { label: '現場の一幕', title: '資料は完成しても、仕事は終わらない', body: '会議で「で、どうしますか」と聞かれて止まる資料は、情報としては正しくても仕事としては途中。判断に必要な選択肢と条件まで置く。', takeaway: '持ち帰り：納品物ではなく、変化した判断を見る。' } },
      recall: [{ id: 'r1', question: '調査や資料作成は何に当たる？', options: ['最終目的', '意思決定支援の手段', '評価と無関係'], answer: 1 }, { id: 'r2', question: '良い成果の書き方は？', options: ['検索を50回した', '優先顧客を決められた', '資料を20枚作った'], answer: 1 }],
      application: { title: '作業依頼を成果へ言い換える', prompt: '「競合10社を調べる」を、誰が何を判断できる状態にするかで書き換えよう。', placeholder: '事業責任者が＿＿を判断できるよう、競合の＿＿を比較する。', minLength: 30, artifactTitle: '仕事の全体像マップ', artifactType: '学び方' }, sources: [{ title: 'McKinsey Guide to Problem Solving', url: 'https://www.mckinsey.com/featured-insights/mckinsey-guide-to-problem-solving' }]
    },
    {
      id: 'lesson-02-01', chapterId: 'chapter-02', phaseId: 'phase-0', week: 0, order: 2,
      title: '指摘を、次のチェック項目へ変える', subtitle: '落ち込む材料でも感想でもなく、再発防止の仕組みにする', minutes: 14, xp: 35, contentReady: true, isFictional: true,
      concepts: ['フィードバック', '根本原因', '再発防止', '学習ログ'],
      scene: { label: 'REVIEW NOTE', role: '資料作成担当', brief: '上司から「数字は合っているけど、結論が読み取れない」と指摘された。', stakes: '次の資料で同じ指摘を繰り返さない。' },
      prediction: { question: '次に残すメモとして最も良いものは？', options: ['もっと頑張る', '自分は資料作成が苦手', '各ページのタイトルを結論文にし、提出前に一覧で確認する'], answer: 2, feedback: '指摘を、次回の具体的な確認行動へ変える。' },
      interaction: { title: '再発防止になる項目を選ぶ', instruction: '次回に実行・確認できるものを3つ選ぼう。', required: 3, options: [{ id: 'cause', label: '原因：タイトルが項目名だけだった', correct: true }, { id: 'check', label: '確認：タイトルだけで話が通るか読む', correct: true }, { id: 'result', label: '実践結果：次回レビューの指摘を記録する', correct: true }, { id: 'mood', label: '感想：とにかく悔しかった', correct: false }, { id: 'talent', label: '原因：才能がない', correct: false }], observation: '指摘、根本原因、次からのチェック、実践結果をつなぐと、フィードバックが再利用できる。' },
      explanation: { prompt: '「もっと気をつける」だけでは再発防止になりにくいのはなぜ？', placeholder: '例：いつ何を確認するかが決まっておらず、同じ状況で実行できないから。', minLength: 20 },
      formalize: { bridge: 'ゲームの敗因を「下手だった」で終えると次も同じ。どの場面で、何を見落とし、次に何を押すかまで決める。', textbook: 'フィードバックログは、指摘内容、根本原因、次回のチェック項目、実践結果を記録する。人格評価と作業上の改善点を分け、再現可能な行動へ変換する。', framework: '指摘 → 原因 → 次回チェック → 実践 → 再評価', workedExample: '指摘「結論が弱い」→原因「項目名をタイトルにした」→チェック「全タイトルを結論文として通読」→結果「次回は修正なし」。', commonMistake: '指摘を全部同じ重さで抱えること。頻度、影響、再発可能性から、次回のチェック項目を絞る。', column: { label: '成長のからくり', title: '反省より、再現可能性', body: '深く反省しても、次回の行動が決まっていなければ仕事は変わらない。小さなチェック項目は、気分に左右されにくい。', takeaway: '持ち帰り：指摘は、自分を責める言葉から手順へ変える。' } },
      recall: [{ id: 'r1', question: 'フィードバックログに必要なのは？', options: ['感想だけ', '次回の具体的チェック', '上司への評価'], answer: 1 }, { id: 'r2', question: '根本原因の良い書き方は？', options: ['才能がない', 'タイトルを項目名のまま提出した', 'なんとなく失敗した'], answer: 1 }],
      application: { title: 'フィードバックログを1件つくる', prompt: '最近受けた指摘を、原因と次回チェックへ変換しよう。', placeholder: '【指摘】\n【原因】\n【次回チェック】\n【実践結果】', minLength: 40, artifactTitle: 'フィードバックログ', artifactType: '振り返り' }, sources: []
    },
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
      id: 'lesson-04-01', chapterId: 'chapter-04', phaseId: 'phase-1', week: 2, order: 4,
      title: '論点を、考えられる大きさに分ける', subtitle: 'MECEを目的にせず、判断に必要な切り口をつくる', minutes: 17, xp: 45, contentReady: true, isFictional: true,
      concepts: ['論点', '分解軸', 'ロジックツリー', '優先順位'],
      scene: { label: 'ISSUE BOARD', role: '調査設計担当', brief: '「若年層の新規来場が伸びない理由」を調べることになった。意見が広告、価格、選手、アクセスへ散らばっている。', stakes: '30分後までに、調査を分担できる論点へ整理する。' },
      prediction: { question: '最初の分解として使いやすいものは？', options: ['思いついた順に並べる', '認知→関心→購入→来場→再来場の段階で分ける', '広告だけを深掘る'], answer: 1, feedback: '顧客行動の段階を軸にすると、どこで止まっているかを切り分けられる。' },
      interaction: { title: '同じ分解軸へそろえる', instruction: '「購入段階」の論点を3つ選ぼう。', required: 3, options: [{ id: 'price', label: '価格が許容範囲か', correct: true }, { id: 'seat', label: '席種を選べるか', correct: true }, { id: 'flow', label: '購入手順で離脱していないか', correct: true }, { id: 'awareness', label: 'クラブを知っているか', correct: false }, { id: 'return', label: '再来場したいか', correct: false }], observation: '一つの枝では同じ切り口を保つ。段階が違う論点を混ぜると、原因と打ち手の対応が曖昧になる。' },
      explanation: { prompt: '論点を同じ分解軸でそろえると、何がやりやすくなる？', placeholder: '例：どの段階に問題があり、何を調べ、誰が担当するかを決めやすくなる。', minLength: 20 },
      formalize: { bridge: '散らかった机を、色・用途・期限を混ぜて分類すると片付かない。まず一つの基準を選ぶ。', textbook: '論点分解は、上位の問いを検証可能な下位の問いへ分ける操作である。MECEは目的ではなく、重要な重複と漏れを抑え、検証と役割分担を可能にするための原則として使う。', framework: '上位の問い → 分解軸 → 下位論点 → 優先順位 → 検証', workedExample: '新規来場が伸びない→認知不足／関心不足／購入離脱／来場障壁。各枝へ指標と必要情報を置く。', commonMistake: '名詞を並べただけでツリーにすること。「広告」「価格」ではなく、「広告接触が不足しているか」「価格が購入を妨げているか」と問いで書く。', column: { label: '道具の使い方', title: 'MECEは採点科目ではない', body: '現実の問題は完全には分け切れない。重要なのは、今の意思決定に必要な論点を扱え、検証の担当と順番が決まること。', takeaway: '持ち帰り：美しい木より、調べられる問い。' } },
      recall: [{ id: 'r1', question: '論点は何の形で書くとよい？', options: ['問い', '単語だけ', '結論だけ'], answer: 0 }, { id: 'r2', question: '分解軸の役割は？', options: ['見た目を整える', '同じ基準で切り分ける', '論点を増やす'], answer: 1 }],
      application: { title: '論点ツリーの一段目をつくる', prompt: '「若年層の新規来場が伸びない理由」を3〜5個の問いへ分けよう。', placeholder: '・認知が不足しているか\n・関心から購入へ進めているか\n・＿＿', minLength: 45, artifactTitle: '論点ツリー｜若年層の新規来場', artifactType: '問題解決' }, sources: [{ title: 'McKinsey: Barbara Minto on MECE', url: 'https://www.mckinsey.com/alumni/news-and-events/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it' }]
    },
    {
      id: 'lesson-05-01', chapterId: 'chapter-05', phaseId: 'phase-1', week: 3, order: 5,
      title: '仮説から、検証の順番をつくる', subtitle: '当てずっぽうではなく、次に集める情報を決める', minutes: 17, xp: 45, contentReady: true, isFictional: true,
      concepts: ['仮説', '検証', '影響度', '更新'],
      scene: { label: 'HYPOTHESIS DESK', role: '分析担当', brief: '若年層の購入離脱について、「価格が高いからでは」と意見が出た。ただし、根拠はまだない。', stakes: '限られた時間で、最初に確認するデータを決める。' },
      prediction: { question: '仮説を置いた直後にすることは？', options: ['事実として資料に書く', '必要な情報と、反証された場合の次の仮説を決める', 'その仮説だけを証明する情報を探す'], answer: 1, feedback: '仮説は暫定的な答え。検証方法と更新条件をセットで置く。' },
      interaction: { title: '価格仮説の検証材料を選ぶ', instruction: '価格が離脱要因か確かめる情報を3つ選ぼう。', required: 3, options: [{ id: 'funnel', label: '価格表示前後の離脱率', correct: true }, { id: 'reason', label: '未購入者の理由調査', correct: true }, { id: 'compare', label: '競合・代替娯楽との価格比較', correct: true }, { id: 'logo', label: 'ロゴの好感度', correct: false }, { id: 'weather', label: '一年分の天気だけ', correct: false }], observation: '仮説に直接関係する行動データ、本人理由、比較情報を組み合わせると、一つの数字への依存を減らせる。' },
      explanation: { prompt: '仮説と「思い込み」の違いを説明しよう。', placeholder: '例：仮説は必要情報と反証条件があり、結果によって更新する前提の暫定回答だから。', minLength: 22 },
      formalize: { bridge: '犯人を決めつけるのではなく、候補と確認方法を置く。証拠が違えば候補を変える。', textbook: '仮説は、限られた情報から置く暫定的な答えである。良い仮説は、検証可能で、意思決定への影響があり、必要情報と反証条件が明確になっている。', framework: '仮説 → 必要情報 → 検証方法 → 結果 → 更新', workedExample: '仮説「価格が障壁」→価格表示前後の離脱率、未購入理由、競合価格を確認→離脱が表示前なら、申込手順仮説へ更新。', commonMistake: '仮説を証明する材料だけ集めること。反証される条件を先に書くと、都合の良い情報だけを見る危険を減らせる。', column: { label: '失敗の解剖', title: '仮説は、当てるゲームではない', body: '最初の仮説が外れても失敗ではない。早く安く外れを確認し、次の問いへ更新できれば、調査を前進させている。', takeaway: '持ち帰り：仮説の価値は、正解率より検証を動かす力。' } },
      recall: [{ id: 'r1', question: '仮説とは？', options: ['確定した事実', '検証前の暫定回答', '個人の好み'], answer: 1 }, { id: 'r2', question: '仮説とセットで置くものは？', options: ['必要情報と反証条件', 'きれいな表紙', '結論の断定'], answer: 0 }],
      application: { title: '仮説検証シートを1本つくる', prompt: '若年層の購入離脱について、仮説・必要情報・反証条件を書こう。', placeholder: '【仮説】\n【必要情報】\n【反証される条件】\n【次の仮説】', minLength: 55, artifactTitle: '仮説検証シート｜購入離脱', artifactType: '問題解決' }, sources: [{ title: 'McKinsey: adopting the right problem-solving approach', url: 'https://www.mckinsey.com/featured-insights/mckinsey-guide-to-problem-solving/adopting-the-right-problem-solving-approach' }]
    },
    {
      id: 'lesson-06-01', chapterId: 'chapter-06', phaseId: 'phase-1', week: 4, order: 6,
      title: '事実・解釈・提言を分ける', subtitle: '数字から原因と打ち手へ飛ばず、根拠の階段をつくる', minutes: 18, xp: 50, contentReady: true, isFictional: true,
      concepts: ['事実', '解釈', '仮説', '提言'],
      scene: { label: 'EVIDENCE CHECK', role: 'レビュー担当', brief: '資料に「20代は価格に不満なので、値下げすべき」と書かれている。根拠は、購入率が前年より5pt低いことだけ。', stakes: '会議前に、どこまで言えて何を追加確認するか整理する。' },
      prediction: { question: '現時点で事実として言えるのは？', options: ['20代は価格に不満', '値下げすべき', '20代の購入率が前年より5pt低い'], answer: 2, feedback: '資料から直接確認できるのは購入率の低下。原因と打ち手には追加確認が必要。' },
      interaction: { title: '事実として扱える文を選ぶ', instruction: '確認済みの情報だけを2つ選ぼう。', required: 2, options: [{ id: 'rate', label: '20代の購入率は前年より5pt低い', correct: true }, { id: 'survey', label: '未購入者調査では価格を理由にした人が18%だった', correct: true }, { id: 'cause', label: '価格が主因である', correct: false }, { id: 'action', label: '必ず値下げすべきだ', correct: false }], observation: '数値と調査結果は事実。主因という判断は解釈・仮説、値下げは提言として別に扱う。' },
      explanation: { prompt: '事実と仮説を同じ文に混ぜると、何が危険？', placeholder: '例：未検証の原因が確定したように見え、必要な追加確認を飛ばして打ち手を決めてしまう。', minLength: 22 },
      formalize: { bridge: '防犯カメラに人が映ったことと、その人が犯人であることは別。見えたものと意味づけを分ける。', textbook: '分析コメントでは、観察可能な事実、事実から導く解釈、原因に関する仮説、推奨する提言を区別する。因果関係を断定する前に、代替仮説と追加確認事項を示す。', framework: '事実 → 解釈 → 仮説 → 確認 → 提言', workedExample: '事実「購入率−5pt、価格理由18%」→解釈「価格は障壁の一部」→仮説「申込手順の影響も大きい」→確認「離脱地点」→提言。', commonMistake: '「可能性がある」を付ければ何でも仮説になると思うこと。確認する情報と、判断への影響まで書く。', column: { label: '言葉の精度', title: '断定を弱めるのではなく、根拠を強くする', body: '慎重な表現は逃げではない。分かっていること、まだ分からないこと、次に確認することを分けると、判断者はリスクを理解して選べる。', takeaway: '持ち帰り：強い文章は、断定より根拠の境界が明確。' } },
      recall: [{ id: 'r1', question: '「購入率が5pt低下」は？', options: ['事実', '提言', '感想'], answer: 0 }, { id: 'r2', question: '提言の前に必要なものは？', options: ['原因の断定', '仮説の確認', '表紙の修正'], answer: 1 }],
      application: { title: '分析コメントを階段にする', prompt: '20代の購入率低下について、事実・仮説・確認事項・提言を分けて書こう。', placeholder: '【事実】\n【仮説】\n【確認事項】\n【提言】', minLength: 65, artifactTitle: '事実・仮説・提言シート', artifactType: '問題解決' }, sources: []
    },
    {
      id: 'lesson-09-01', chapterId: 'chapter-09', phaseId: 'phase-2', week: 5, order: 7,
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
      id: 'lesson-32-01', chapterId: 'chapter-32', phaseId: 'phase-3', week: 10, order: 8,
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

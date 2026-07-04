(() => {
  'use strict';

  const DATA = window.ATLAS_DATA;
  const STORAGE_KEY = 'consulting-fundamentals-atlas-v1';
  const THEME_KEY = 'consulting-fundamentals-atlas-theme';
  const root = document.getElementById('viewRoot');
  const appShell = document.getElementById('appShell');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const toastRegion = document.getElementById('toastRegion');
  let activeView = 'home';
  let activeQuestionId = 'finance-pl-001';
  let activeWorkspaceTab = 'pl';
  let activeAnnotation = 'observation';
  let timerInterval = null;
  let timerSeconds = 0;
  let selectedConfidence = 2;
  let selectedErrorTags = new Set();
  let practiceAnswered = false;

  const defaultState = {
    profile: {
      name: '学習者',
      goal: 'finance',
      sessionLength: '30',
      financeLevel: 'basic'
    },
    progress: {
      completedChapters: ['chapter-00', 'chapter-03', 'chapter-07'],
      selectedChapter: 'chapter-08',
      lessonChecks: {},
      lastViewedChapter: 'chapter-08'
    },
    attempts: [
      { questionId: 'finance-cf-001', attemptedAt: '2026-07-03T09:00:00.000Z', isCorrect: false, confidence: 2, errorTags: ['knowledge_gap'], selfNote: '利益と現金の差を、言葉で説明しきれなかった。' },
      { questionId: 'finance-pl-001', attemptedAt: '2026-07-04T08:30:00.000Z', isCorrect: false, confidence: 3, errorTags: ['fact_hypothesis_mixed', 'denominator_error'], selfNote: '売上成長と利益率低下を混ぜて書いた。' }
    ],
    notes: [
      { id: 'note-initial-1', title: '財務メモ', body: '数字を見たら、まず「事実 / 解釈 / 仮説 / 確認事項」に分ける。', createdAt: '2026-07-04T09:00:00.000Z' }
    ],
    workspace: {
      activeCompany: 'ホワイトリバー（架空）',
      pl: { revenuePrev: 50000, revenueCurrent: 56000, cogsPrev: 30000, cogsCurrent: 35840, sgaPrev: 14000, sgaCurrent: 15120 },
      bs: { cashPrev: 9200, cashCurrent: 7600, receivablePrev: 4800, receivableCurrent: 6100, inventoryPrev: 7000, inventoryCurrent: 9100, fixedPrev: 18200, fixedCurrent: 20500, debtPrev: 14200, debtCurrent: 17500, equityPrev: 15000, equityCurrent: 15800 },
      cf: { operatingPrev: 5900, operatingCurrent: 2800, investingPrev: -4200, investingCurrent: -6100, financingPrev: -1100, financingCurrent: 1700 },
      annotations: {
        observation: '売上は前年比12.0%増だが、売上原価は19.5%増。営業利益率は12.0%から9.0%へ低下。',
        interpretation: '売上成長の一方で、粗利率の悪化が利益を押し下げている可能性。',
        hypothesis: '仕入単価上昇、値引き増、低粗利商品の構成比上昇のいずれか、または複合。',
        check: '商品別粗利率、仕入単価、値引率、カテゴリ別売上構成、販管費内訳を確認する。'
      }
    },
    artifacts: DATA.artifacts,
    experience: {
      selectedRoute: 'home',
      diagnostic: { completed: false, answers: {}, score: null, bySkill: {}, completedAt: null },
      work: { query: '営業利益率', recentTopics: ['営業利益率'] }
    },
    settings: { theme: 'system' }
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return structuredClone(defaultState);
      const parsed = JSON.parse(saved);
      return mergeDeep(structuredClone(defaultState), parsed);
    } catch (error) {
      console.warn('Saved state could not be loaded.', error);
      return structuredClone(defaultState);
    }
  }

  function mergeDeep(target, source) {
    Object.keys(source || {}).forEach((key) => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateProfileUI();
  }

  function escapeHTML(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('ja-JP').format(Math.round(Number(value) || 0));
  }

  function signedPercent(current, previous) {
    if (!previous) return '—';
    const percent = ((current - previous) / Math.abs(previous)) * 100;
    const sign = percent > 0 ? '+' : percent < 0 ? '−' : '±';
    return `${sign}${Math.abs(percent).toFixed(1)}%`;
  }

  function changeClass(current, previous) {
    const diff = current - previous;
    return diff > 0 ? 'change-plus' : diff < 0 ? 'change-minus' : '';
  }

  function goalLabel(goal) {
    return {
      finance: '財務を重点的に',
      consulting: 'コンサルの基礎を',
      business: '事業・企画に活かす',
      materials: '資料・分析を強化'
    }[goal] || '学習を進める';
  }

  function getChapter(id) {
    return DATA.chapters.find((chapter) => chapter.id === id) || DATA.chapters[0];
  }

  function getTrack(id) {
    return DATA.tracks.find((track) => track.id === id);
  }

  function chapterStatus(chapter) {
    if (state.progress.completedChapters.includes(chapter.id)) return 'ready';
    if (state.progress.selectedChapter === chapter.id) return 'current';
    const focusFinance = state.profile.goal === 'finance';
    if (focusFinance && chapter.track === 'finance' && chapter.no >= 9) return 'locked';
    return 'locked';
  }

  function statusLabel(status) {
    return { ready: '通過', current: 'いまここ', review: '再復習', locked: '未着手', focus: '重点' }[status] || status;
  }

  function statusPill(status) {
    return `<span class="status-pill ${status}">${statusLabel(status)}</span>`;
  }

  function trackDot(trackId) {
    const track = getTrack(trackId);
    return `<span class="track-dot ${track?.color || 'case'}"></span>`;
  }

  function getNextChapter() {
    const selected = getChapter(state.progress.selectedChapter);
    if (selected && !state.progress.completedChapters.includes(selected.id)) return selected;
    return DATA.chapters.find((chapter) => !state.progress.completedChapters.includes(chapter.id)) || DATA.chapters.at(-1);
  }

  function getWeakSkills() {
    const counts = {};
    state.attempts.filter((attempt) => !attempt.isCorrect).forEach((attempt) => {
      (attempt.errorTags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; });
    });
    const labels = {
      knowledge_gap: '概念の言語化', calculation_error: '計算', unit_error: '単位・桁', period_error: '期間', denominator_error: '分母',
      reading_error: '問題・注記の読解', logic_error: '因果・論理', comparison_error: '比較軸', fact_hypothesis_mixed: '事実と仮説', communication_error: '伝わる表現', execution_error: '手順・確認'
    };
    const fallback = [
      { id: 'fact_hypothesis_mixed', label: '事実と仮説を分ける', count: 3 },
      { id: 'denominator_error', label: '分母・期間を確認する', count: 2 },
      { id: 'knowledge_gap', label: '利益と現金の違い', count: 1 }
    ];
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, count]) => ({ id, label: labels[id] || id, count }));
    return rows.length ? rows : fallback;
  }

  function getFinanceProgress() {
    const financeChapters = DATA.chapters.filter((chapter) => chapter.track === 'finance');
    const completed = financeChapters.filter((chapter) => state.progress.completedChapters.includes(chapter.id)).length;
    return { completed, total: financeChapters.length, percent: Math.round((completed / financeChapters.length) * 100) };
  }

  function addSessionAttempt({ questionId, isCorrect, confidence, errorTags, selfNote }) {
    state.attempts.unshift({
      questionId,
      attemptedAt: new Date().toISOString(),
      isCorrect,
      confidence,
      errorTags,
      selfNote
    });
    persist();
  }

  function updateProfileUI() {
    const name = state.profile.name || '学習者';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileGoal').textContent = goalLabel(state.profile.goal);
    document.getElementById('profileAvatar').textContent = name.slice(0, 1).toUpperCase();
  }

  function setBreadcrumb(...items) {
    breadcrumbs.innerHTML = items.map((item) => escapeHTML(item)).join(' <span>/</span> ');
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3800);
  }

  function activeNav(view) {
    document.querySelectorAll('.nav-item[data-view]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === view);
    });
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  function startTimer() {
    stopTimer();
    timerSeconds = 0;
    const output = document.getElementById('timerOutput');
    const update = () => {
      if (!output) return;
      const min = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
      const sec = String(timerSeconds % 60).padStart(2, '0');
      output.textContent = `${min}:${sec}`;
    };
    update();
    timerInterval = setInterval(() => { timerSeconds += 1; update(); }, 1000);
  }

  const diagnosticQuestions = [
    {
      id: 'diag-01', skill: 'finance_basics',
      prompt: '売上高が前年の50,000から56,000に増えた。売上高前年比として正しいのは？',
      choices: ['+6.0%', '+10.0%', '+12.0%', '+20.0%'], answer: 2
    },
    {
      id: 'diag-02', skill: 'pl',
      prompt: '売上が伸びているのに営業利益率が低下した。最初に分けて確認する組み合わせとして最も適切なのは？',
      choices: ['原価率と販管費率', '社員数と株価', '借入金と配当', '天気と為替だけ'], answer: 0
    },
    {
      id: 'diag-03', skill: 'cashflow',
      prompt: '営業利益が増えているのに営業CFが悪化する例として、最も適切なのは？',
      choices: ['売掛金が増えた', '減価償却費を計上した', '借入金を返済した', '配当を支払った'], answer: 0
    },
    {
      id: 'diag-04', skill: 'reasoning',
      prompt: '「営業利益率は12%から9%へ低下した」は、どれに当たる？',
      choices: ['観察（事実）', '原因の仮説', '提言', '感想'], answer: 0
    },
    {
      id: 'diag-05', skill: 'balance_sheet',
      prompt: '在庫が前年比30%増、売上が5%増。この時点で最も適切な対応は？',
      choices: ['在庫増は悪いと断定する', '在庫回転・商品別在庫・需要予測を確認する', '売上だけを見て判断する', '在庫をすべて値引きする'], answer: 1
    },
    {
      id: 'diag-06', skill: 'comparison',
      prompt: '競合比較で「営業利益率が低い」と言う際、最初に揃えるべきものは？',
      choices: ['比較する期間・会計方針・事業構成', '社長の年齢', '会社ロゴの色', 'IR資料の枚数'], answer: 0
    }
  ];

  const workTopics = [
    {
      key: 'operating-margin',
      labels: ['営業利益率', '利益率', '利益が下がった', '営業利益'],
      title: '営業利益率が低下した理由を考える',
      short: '営業利益率',
      chapterId: 'chapter-09',
      questionId: 'finance-pl-001',
      formula: '営業利益率 = 営業利益 ÷ 売上高',
      meaning: '本業での稼ぐ力を見る指標。金額だけでなく、売上に対してどれだけ利益が残ったかを比較する。',
      nextNumbers: ['売上高の増減率：数量・単価・構成の変化', '売上原価率：仕入価格・製造原価・値引きの影響', '販管費率：人件費・広告費・先行投資の増減', 'セグメント別利益：全社平均に隠れた差'],
      hypotheses: ['原材料・仕入単価の上昇', '値引き増または低粗利商品の構成比上昇', '売上成長に先行した人員・広告・出店投資', '一時費用が含まれている'],
      template: '【結論】\n営業利益率は前年から低下している。\n\n【観察】\n売上は［  ］%増。一方、売上原価は［  ］%増、営業利益率は［  ］pt変化。\n\n【主因仮説】\n原価率の悪化／販管費の増加／商品構成の変化の可能性。\n\n【次に確認する数値】\n・商品別粗利率\n・仕入単価・値引率\n・販管費内訳\n・セグメント別利益'
    },
    {
      key: 'cashflow',
      labels: ['キャッシュフロー', '営業CF', 'キャッシュ', '利益と現金'],
      title: '利益は出ているのに現金が増えない理由を考える',
      short: '営業CF',
      chapterId: 'chapter-13',
      questionId: 'finance-cf-001',
      formula: '営業CF = 利益 ± 非資金項目 − 運転資本の増加 + 運転資本の減少',
      meaning: 'P/L上の利益と、実際の現金の増減をつなぐ。黒字でも資金繰りが苦しくなる理由を見る。',
      nextNumbers: ['売掛金：売上が現金化されているか', '棚卸資産：在庫に資金が滞留していないか', '買掛金：仕入先への支払いが先行していないか', '投資CF：成長投資と資金余力のバランス'],
      hypotheses: ['売上増により売掛金が積み上がった', '在庫を先行して積み増した', '仕入先への支払い条件が変化した', '税金支払い・一時的な運転資本変動があった'],
      template: '【結論】\n営業利益と営業CFに乖離がある。\n\n【観察】\n営業利益は［  ］だが、営業CFは［  ］。\n\n【主因仮説】\n売掛金／在庫／買掛金など、運転資本の変動が資金を吸収している可能性。\n\n【次に確認する数値】\n・売上債権回転日数\n・在庫回転日数\n・仕入債務回転日数\n・四半期別の営業CF'
    },
    {
      key: 'inventory',
      labels: ['在庫', '棚卸資産', 'B/S', '運転資本'],
      title: '在庫が増えたとき、何を確認するか',
      short: '在庫・B/S',
      chapterId: 'chapter-12',
      questionId: 'finance-bs-001',
      formula: '運転資本 = 売掛金 + 棚卸資産 − 買掛金',
      meaning: '在庫増は、成長投資にも滞留にもなりうる。数字だけで良し悪しを断定せず、回転・商品・需要を見る。',
      nextNumbers: ['在庫回転日数：前年・計画・競合との比較', '商品別・拠点別の在庫増減', '値引き・廃棄・評価損の発生', '需要予測・先行調達・供給制約'],
      hypotheses: ['季節需要・新規出店に備えた先行在庫', '供給不安への対応としての積み増し', '需要予測の外れによる滞留', '商品ミックス変化による平均在庫単価上昇'],
      template: '【観察】\n棚卸資産は前年から［  ］%増。売上の伸び［  ］%を上回る。\n\n【仮説】\n先行調達／供給制約／需要鈍化による滞留の可能性。\n\n【確認事項】\n・商品別、拠点別の在庫増加\n・在庫回転日数\n・値引き、廃棄、評価損\n・需要予測と販売計画'
    },
    {
      key: 'comparison',
      labels: ['競合比較', '比較', '3社比較', 'ベンチマーク'],
      title: '競合比較で、差の理由を説明する',
      short: '競合比較',
      chapterId: 'chapter-16',
      questionId: 'finance-pl-001',
      formula: '比較 = 同じ定義 × 同じ期間 × 事業構成の違いを注記',
      meaning: '良し悪しを相対化するための手法。数値を並べるだけでなく、差を生む事業構造まで仮説化する。',
      nextNumbers: ['売上成長率：規模・成長局面の違い', '売上総利益率：価格・原価・商品ミックス', '販管費率：投資局面・固定費構造', 'ROIC / CCC：資本効率・運転資本'],
      hypotheses: ['価格帯・顧客セグメントが異なる', '成長投資のフェーズが異なる', '商品構成・地域構成の差', '会計方針や一時費用の影響'],
      template: '【結論】\nA社はB社より［指標］が［高い／低い］。\n\n【比較条件】\n対象期間：［  ］／事業範囲：［  ］／単位：［  ］\n\n【差の要因仮説】\n粗利構造／販管費の投資局面／事業ミックスの違い。\n\n【追加確認】\n・セグメント別売上・利益\n・一時費用\n・KPI推移\n・経営者説明'
    }
  ];

  const weaknessDefinitions = [
    { id: 'profitability', label: 'P/L・収益性', chapterId: 'chapter-09', questionId: 'finance-pl-001', errorTags: ['denominator_error', 'reading_error', 'logic_error'], next: '売上・原価・販管費を、金額と率の両方で追う' },
    { id: 'cashflow', label: '利益と現金', chapterId: 'chapter-13', questionId: 'finance-cf-001', errorTags: ['knowledge_gap', 'logic_error', 'reading_error'], next: '売掛金・在庫・買掛金の動きを、現金の言葉にする' },
    { id: 'balance', label: 'B/S・運転資本', chapterId: 'chapter-12', questionId: 'finance-bs-001', errorTags: ['comparison_error', 'logic_error', 'fact_hypothesis_mixed'], next: '在庫増を断定せず、回転・商品・需要まで確認する' },
    { id: 'reasoning', label: '事実と仮説', chapterId: 'chapter-06', questionId: 'finance-pl-001', errorTags: ['fact_hypothesis_mixed', 'communication_error'], next: '観察→仮説→確認事項を別の文で書く' },
    { id: 'comparison', label: '比較の設計', chapterId: 'chapter-16', questionId: 'finance-bs-001', errorTags: ['comparison_error', 'period_error', 'denominator_error'], next: '前年・計画・競合の比較条件をそろえる' }
  ];

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function getDiagnosticResult() {
    const diagnostic = state.experience?.diagnostic || {};
    if (!diagnostic.completed || diagnostic.score === null) return null;
    const score = Number(diagnostic.score) || 0;
    const weakSkills = Object.entries(diagnostic.bySkill || {})
      .filter(([, result]) => !result)
      .map(([skill]) => skill);
    const route = score <= 2 ? { chapterId: 'chapter-07', label: 'Gate 0｜数字の言葉から始める', message: 'まずは「数字をどう読むか」の地図から。用語を覚える前に、数字→事業→問いの順をつかむ。' }
      : score <= 4 ? { chapterId: 'chapter-08', label: 'Gate 1｜事業の儲け方を式にする', message: '三表へ急がず、売上と利益を動かす要因を先に分解する。' }
      : { chapterId: 'chapter-09', label: 'Gate 2｜P/Lから実戦へ', message: '基礎はある。P/Lの増減を、事実・仮説・確認事項へ変える練習へ。' };
    return { score, weakSkills, ...route };
  }

  function getWorkTopic(query = '') {
    const normalized = String(query).toLowerCase().replaceAll(' ', '').replaceAll('　', '');
    return workTopics.find((topic) => topic.labels.some((label) => normalized.includes(label.toLowerCase().replaceAll(' ', '').replaceAll('　', '')))) || workTopics[0];
  }

  function getWeaknessMap() {
    return weaknessDefinitions.map((definition) => {
      const relevant = state.attempts.filter((attempt) => {
        const question = DATA.questions.find((item) => item.id === attempt.questionId);
        return question?.chapterId === definition.chapterId || (attempt.errorTags || []).some((tag) => definition.errorTags.includes(tag));
      });
      const misses = relevant.filter((attempt) => !attempt.isCorrect).length;
      const hits = relevant.filter((attempt) => attempt.isCorrect).length;
      const highConfidenceMisses = relevant.filter((attempt) => !attempt.isCorrect && Number(attempt.confidence) >= 4).length;
      const confidenceMismatch = relevant.filter((attempt) => !attempt.isCorrect && Number(attempt.confidence) >= 3).length;
      const level = clamp(5 - misses + Math.min(hits, 2), 1, 5);
      return { ...definition, misses, hits, highConfidenceMisses, confidenceMismatch, level, score: level * 20 };
    });
  }

  function findNextActionForErrors(question, tags = []) {
    const activeTags = tags.length ? tags : question.errorTags || [];
    if (activeTags.includes('fact_hypothesis_mixed')) return { chapterId: 'chapter-06', title: 'Chapter 06｜事実・解釈・提言を分ける', reason: '原因を急いで断定しない型に戻る。' };
    if (activeTags.includes('knowledge_gap') && question.chapterId === 'chapter-13') return { chapterId: 'chapter-13', title: 'Chapter 13｜C/F：利益と現金の違い', reason: '利益と運転資本のつながりを、図で確認する。' };
    if (activeTags.includes('denominator_error') || activeTags.includes('period_error')) return { chapterId: 'chapter-09', title: 'Chapter 09｜P/L：売上から営業利益まで', reason: '金額・率・比較期間をセットで書く練習に戻る。' };
    if (activeTags.includes('comparison_error')) return { chapterId: 'chapter-16', title: 'Chapter 16｜競合比較する', reason: '比較対象と比較条件をそろえる。' };
    return { chapterId: question.chapterId, title: `対応レッスン｜${getChapter(question.chapterId).title}`, reason: '問題の論点を短く復習して、別設定の問題へ進む。' };
  }

  function feedbackNextMarkup(question, tags = []) {
    const next = findNextActionForErrors(question, tags);
    return `<div class="feedback-next"><p class="section-label">NEXT STEP</p><strong>次はここへ戻る</strong><p>${escapeHTML(next.reason)}</p><div class="today-actions"><button class="button ghost small" data-feedback-open-chapter="${next.chapterId}">${escapeHTML(next.title)}を開く</button><button class="button secondary small" data-feedback-next-question="${question.id}">同じ弱点を別の問題で確認</button></div></div>`;
  }

  function render() {
    stopTimer();
    activeNav(activeView);
    appShell.classList.remove('nav-open');
    const renderers = { home: renderHome, diagnostic: renderDiagnostic, work: renderWork, weakness: renderWeakness, map: renderMap, lesson: renderLesson, practice: renderPractice, workspace: renderWorkspace, library: renderLibrary, review: renderReview, settings: renderSettings };
    (renderers[activeView] || renderHome)();
  }

  function renderHome() {
    setBreadcrumb('ホーム', '学び方を選ぶ');
    const next = getNextChapter();
    const finance = getFinanceProgress();
    const weakness = getWeaknessMap();
    const urgent = [...weakness].sort((a, b) => a.score - b.score)[0];
    const diagnostic = getDiagnosticResult();
    const sessionLength = Number(state.profile.sessionLength || 30);
    root.innerHTML = `
      <section class="view-heading purpose-heading">
        <div>
          <p class="section-label">START WITH YOUR PURPOSE</p>
          <h2>今日は、どんな使い方をする？</h2>
          <p>教材の目次から入らない。今の目的に合わせて、学ぶ・使う・弱点をつぶす、の入口を選ぶ。</p>
        </div>
        <div class="header-meta"><span class="tag">1回 ${sessionLength}分</span><span class="status-pill focus">財務重点</span></div>
      </section>

      <section class="path-grid" aria-label="目的別の入口">
        <article class="path-card start">
          <div class="path-icon">◎</div>
          <p class="eyebrow">GUIDED BEGINNER</p>
          <h3>はじめる</h3>
          <p>何から手をつけるか迷うとき。3分診断で、いま必要な最初の一章を決める。</p>
          <ul><li>3分の基礎診断</li><li>今日の10分レッスン</li><li>用語をその場で確認</li></ul>
          <button class="button primary" data-action="open-route" data-route="start">${diagnostic ? '診断結果から進める' : '3分診断を始める'} →</button>
        </article>
        <article class="path-card work">
          <div class="path-icon">⌕</div>
          <p class="eyebrow">JUST-IN-TIME WORKER</p>
          <h3>仕事に使う</h3>
          <p>明日の資料や会議のために。論点を検索し、次に見る数字と分析メモの型をすぐ取り出す。</p>
          <ul><li>論点・用語で検索</li><li>次に見る数字</li><li>コピペ用の分析テンプレ</li></ul>
          <button class="button secondary" data-action="open-route" data-route="work">実務ツールを開く →</button>
        </article>
        <article class="path-card improve">
          <div class="path-icon">↻</div>
          <p class="eyebrow">DELIBERATE IMPROVER</p>
          <h3>弱点をつぶす</h3>
          <p>分かったつもりを減らす。正誤、自信度、誤答タグから、次に戻るべき前提を見つける。</p>
          <ul><li>弱点マップ</li><li>スペシャル問題</li><li>次の7日間の復習案</li></ul>
          <button class="button ghost" data-action="open-route" data-route="weakness">弱点マップを見る →</button>
        </article>
      </section>

      <section class="purpose-dashboard">
        <article class="today-card compact-today">
          <p class="eyebrow">TODAY'S NEXT MOVE</p>
          <h3>${escapeHTML(diagnostic?.label || `Chapter ${String(next.no).padStart(2, '0')}｜${next.title}`)}</h3>
          <p>${escapeHTML(diagnostic?.message || next.outcome)}</p>
          <div class="today-meta"><span class="tag">${diagnostic ? '10分から' : `${next.minutes}分`}</span><span class="tag">${finance.completed} / ${finance.total}章通過</span></div>
          <div class="today-actions"><button class="button primary" data-action="open-chapter" data-chapter-id="${diagnostic?.chapterId || next.id}">最初のレッスンを開く →</button><button class="button ghost" data-action="open-practice">1問だけ解く</button></div>
        </article>
        <aside class="card quick-signal">
          <p class="section-label">RIGHT NOW</p>
          <h3>今、戻ると効くところ</h3>
          <div class="signal-main"><b>${escapeHTML(urgent.label)}</b><span>理解度 ${urgent.score}%</span></div>
          <div class="skill-bar large"><i style="width:${urgent.score}%"></i></div>
          <p>${escapeHTML(urgent.next)}</p>
          <button class="button ghost small" data-action="open-route" data-route="weakness">理由と次の一手を見る →</button>
        </aside>
      </section>

      <section class="dashboard-row" aria-label="学習状況">
        <article class="card metric-card"><div class="metric-label">完了した章</div><div class="metric-value"><b>${state.progress.completedChapters.length}</b><span>/ ${DATA.chapters.length}章</span></div><div class="metric-footer">読了ではなく、チェックと成果物まで残した章。</div></article>
        <article class="card metric-card"><div class="metric-label">自信ありの誤答</div><div class="metric-value"><b>${weakness.reduce((sum, item) => sum + item.highConfidenceMisses, 0)}</b><span>件</span></div><div class="metric-footer">ここがいちばん伸びしろ。復習の優先順位にする。</div></article>
        <article class="card metric-card"><div class="metric-label">実務成果物</div><div class="metric-value"><b>${state.artifacts.filter((artifact) => artifact.status === '完成').length}</b><span>件完成</span></div><div class="metric-footer">分析メモとテンプレを、仕事へ持ち出せる形で残す。</div></article>
        <article class="card metric-card"><div class="metric-label">次のスペシャル問題</div><div class="metric-value"><b>在庫</b><span>の増加を読む</span></div><div class="metric-footer">B/Sの数字から、確認すべき問いを三つつくる。</div></article>
      </section>`;
    bindCommonEvents();
  }

  function renderDiagnostic() {
    setBreadcrumb('はじめる', '3分診断');
    const result = getDiagnosticResult();
    if (result) {
      root.innerHTML = `
        <section class="view-heading"><div><p class="section-label">DIAGNOSTIC RESULT</p><h2>いまの現在地が見えた</h2><p>点数は評価ではなく、最初に戻る場所を決めるためのもの。ここからは一段ずつ、仕事で使える言葉に変える。</p></div><div class="header-meta"><span class="status-pill current">${result.score} / ${diagnosticQuestions.length} 正解</span></div></section>
        <section class="diagnostic-result-layout">
          <article class="result-hero"><p class="eyebrow">YOUR STARTING GATE</p><h3>${escapeHTML(result.label)}</h3><p>${escapeHTML(result.message)}</p><div class="result-score"><b>${result.score}</b><span>/ ${diagnosticQuestions.length}</span></div><div class="today-actions"><button class="button primary" data-action="open-chapter" data-chapter-id="${result.chapterId}">最初の10分を始める →</button><button class="button ghost" data-action="retry-diagnostic">診断をやり直す</button></div></article>
          <aside class="card card-pad"><p class="section-label">REVIEW FIRST</p><h3>先に意識すること</h3><div class="side-checks">${(result.weakSkills.length ? result.weakSkills : ['今は基礎問題で大きな抜けは確認されていない。実務問題で深さを確かめよう。']).map((skill) => `<div class="side-check"><span>□</span><span>${escapeHTML({ finance_basics:'増減率・構成比・利益率の分母', pl:'売上・原価・販管費のつながり', cashflow:'利益と現金・運転資本', reasoning:'事実と仮説の分離', balance_sheet:'在庫・資産・負債の見方', comparison:'比較条件の統一' }[skill] || skill)}</span></div>`).join('')}</div></aside>
        </section>`;
      bindCommonEvents();
      return;
    }
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">3-MINUTE DIAGNOSTIC</p><h2>最初の一章を、今の理解から決める</h2><p>完璧に答える必要はない。分からない項目こそ、今日の学びを決める材料になる。</p></div><div class="header-meta"><span class="tag">全${diagnosticQuestions.length}問</span><span class="tag">目安3分</span></div></section>
      <form id="diagnosticForm" class="diagnostic-form">
        ${diagnosticQuestions.map((question, index) => `<section class="card diagnostic-question"><div class="diagnostic-number">${String(index + 1).padStart(2, '0')}</div><div><p class="section-label">${escapeHTML({ finance_basics:'数字の基礎', pl:'P/L', cashflow:'C/F', reasoning:'分析の型', balance_sheet:'B/S', comparison:'比較' }[question.skill])}</p><h3>${escapeHTML(question.prompt)}</h3><div class="choice-grid">${question.choices.map((choice, choiceIndex) => `<label class="choice-option"><input type="radio" name="${question.id}" value="${choiceIndex}" /><span>${escapeHTML(choice)}</span></label>`).join('')}</div></div></section>`).join('')}
        <div class="diagnostic-actions"><p class="muted">診断結果は、このブラウザにだけ保存されます。</p><button class="button primary" type="submit">診断結果を見る →</button></div>
      </form>`;
    document.getElementById('diagnosticForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const answers = {};
      const bySkill = {};
      let score = 0;
      for (const question of diagnosticQuestions) {
        const raw = form.get(question.id);
        if (raw === null) { showToast('6問すべて選ぶと、最初の一章を提案できる。', 'error'); return; }
        const answer = Number(raw);
        answers[question.id] = answer;
        const correct = answer === question.answer;
        bySkill[question.skill] = correct;
        if (correct) score += 1;
      }
      state.experience.diagnostic = { completed: true, answers, score, bySkill, completedAt: new Date().toISOString() };
      state.experience.selectedRoute = 'start';
      persist();
      renderDiagnostic();
    });
  }

  function renderWork() {
    setBreadcrumb('仕事に使う', '論点検索・テンプレ');
    const query = state.experience?.work?.query || '営業利益率';
    const topic = getWorkTopic(query);
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">JUST-IN-TIME WORKSPACE</p><h2>明日の仕事に必要な論点を、今すぐ取り出す</h2><p>用語の定義だけで終わらない。次に見る数字、原因仮説、コピペできる分析メモまで一続きにする。</p></div><div class="header-meta"><span class="status-pill current">実務モード</span></div></section>
      <form class="work-search" id="workSearchForm"><label class="sr-only" for="workSearchInput">論点を検索</label><input id="workSearchInput" value="${escapeHTML(query)}" placeholder="例：営業利益率 / 在庫 / 営業CF / 競合比較" /><button class="button primary" type="submit">調べる</button></form>
      <div class="suggested-pills">${workTopics.map((item) => `<button class="suggested-pill ${item.key === topic.key ? 'is-active' : ''}" data-work-topic="${item.short}">${escapeHTML(item.short)}</button>`).join('')}</div>
      <section class="work-layout">
        <div class="work-main">
          <article class="card card-pad topic-overview"><p class="section-label">${escapeHTML(topic.short)}</p><h3>${escapeHTML(topic.title)}</h3><p>${escapeHTML(topic.meaning)}</p><div class="formula">${escapeHTML(topic.formula)}</div></article>
          <article class="card card-pad"><p class="section-label">NEXT NUMBERS</p><h3>次に見る数字</h3><div class="number-tree">${topic.nextNumbers.map((item, index) => `<div class="tree-row"><b>${String(index + 1).padStart(2, '0')}</b><span>${escapeHTML(item)}</span></div>`).join('')}</div></article>
          <article class="card card-pad"><p class="section-label">HYPOTHESIS TREE</p><h3>ありうる原因仮説</h3><div class="hypothesis-list">${topic.hypotheses.map((item) => `<div><span>→</span><p>${escapeHTML(item)}</p></div>`).join('')}</div><p class="fine">ここに並ぶのは仮説。決算資料・セグメント情報・KPIで確認するまでは断定しない。</p></article>
        </div>
        <aside class="work-side">
          <section class="card template-card"><p class="section-label">OUTPUT TEMPLATE</p><h3>分析メモの叩き台</h3><textarea id="workTemplateText" class="template-code" rows="18">${escapeHTML(topic.template)}</textarea><div class="today-actions"><button class="button secondary small" data-action="copy-work-template">コピー</button><button class="button ghost small" data-action="open-workspace">数値を入れる</button></div></section>
          <section class="card card-pad"><p class="section-label">LEARN OR APPLY</p><h3>必要な分だけ深掘る</h3><p class="muted">急ぎならテンプレを使う。理由まで説明したくなったら、対応する章とドリルへ。</p><div class="today-actions"><button class="button ghost small" data-action="open-chapter" data-chapter-id="${topic.chapterId}">対応レッスン</button><button class="button primary small" data-action="open-question" data-question-id="${topic.questionId}">ドリルで確認</button></div></section>
        </aside>
      </section>`;
    bindCommonEvents();
    document.getElementById('workSearchForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const value = document.getElementById('workSearchInput').value.trim();
      state.experience.work.query = value || '営業利益率';
      const resolved = getWorkTopic(state.experience.work.query);
      state.experience.work.recentTopics = [resolved.short, ...(state.experience.work.recentTopics || []).filter((item) => item !== resolved.short)].slice(0, 5);
      persist(); renderWork();
    });
    root.querySelectorAll('[data-work-topic]').forEach((button) => button.addEventListener('click', () => {
      state.experience.work.query = button.dataset.workTopic;
      persist(); renderWork();
    }));
  }

  function renderWeakness() {
    setBreadcrumb('弱点をつぶす', '弱点マップ');
    const skills = getWeaknessMap();
    const priority = [...skills].sort((a, b) => (a.score - b.score) || (b.highConfidenceMisses - a.highConfidenceMisses))[0];
    const confidenceMisses = skills.reduce((sum, item) => sum + item.confidenceMismatch, 0);
    const special = DATA.questions.find((item) => item.type === 'special') || DATA.questions.at(-1);
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">DELIBERATE IMPROVEMENT</p><h2>弱点を、次に解く一問へ変える</h2><p>正答率だけで判断しない。自信があるのに外した領域、誤答タグ、回答メモから、戻るべき前提を見つける。</p></div><div class="header-meta"><span class="tag">記録 ${state.attempts.length}回</span><button class="button ghost small" data-action="open-route" data-route="start">3分診断を確認</button></div></section>
      <section class="confidence-alert"><div><p class="eyebrow">HIGH-CONFIDENCE MISSES</p><h3>自信ありの誤答が ${confidenceMisses} 件</h3><p>ここは「知らない」より厄介やけど、直せば一気に精度が上がる場所。最優先で一問解き直す。</p></div><button class="button secondary" data-action="open-question" data-question-id="${priority.questionId}">優先ドリルを開く →</button></section>
      <section class="weakness-map-grid">${skills.map((skill) => `<article class="weakness-card"><div class="weakness-card-top"><div><p class="eyebrow">${skill.level <= 2 ? 'REVIEW FIRST' : skill.level <= 3 ? 'PRACTICING' : 'STABLE'}</p><h3>${escapeHTML(skill.label)}</h3></div><span class="weakness-score">${skill.score}</span></div><div class="skill-bar large"><i style="width:${skill.score}%"></i></div><div class="weakness-metrics"><span>要復習 ${skill.misses}回</span><span>理解 ${skill.hits}回</span></div><p>${escapeHTML(skill.next)}</p><div class="today-actions"><button class="button ghost small" data-action="open-chapter" data-chapter-id="${skill.chapterId}">レッスン</button><button class="button secondary small" data-action="open-question" data-question-id="${skill.questionId}">1問解く</button></div></article>`).join('')}</section>
      <section class="weakness-plan-layout"><article class="card card-pad"><p class="section-label">NEXT 30 MINUTES</p><h3>次の30分メニュー</h3><div class="review-plan"><div class="review-plan-item"><b>01</b><div><strong>5分｜${escapeHTML(getChapter(priority.chapterId).title)}</strong><p>${escapeHTML(priority.next)}</p></div></div><div class="review-plan-item"><b>02</b><div><strong>10分｜対応ドリルを1問</strong><p>自信度も残し、どこで迷ったかをタグで記録する。</p></div></div><div class="review-plan-item"><b>03</b><div><strong>15分｜スペシャル問題</strong><p>別の設定でも同じ型を使えるか、自由記述で確かめる。</p></div></div></div></article><aside class="card card-pad"><p class="section-label">SPECIAL PROBLEM</p><h3>${escapeHTML(special.title)}</h3><p class="muted">${escapeHTML(special.lead)}</p><div class="today-actions"><button class="button primary" data-action="open-question" data-question-id="${special.id}">スペシャル問題を解く →</button><button class="button ghost" data-view="review">振り返りを見る</button></div></aside></section>`;
    bindCommonEvents();
  }

  function renderMap() {
    setBreadcrumb('学習マップ', '全体の現在地');
    const financeTrack = DATA.tracks.find((track) => track.id === 'finance');
    root.innerHTML = `
      <section class="view-heading">
        <div><p class="section-label">CURRICULUM MAP</p><h2>樹形図で、今いる場所と次の枝を見る</h2><p>一本道で詰め込まない。前提が弱ければ戻り、理解できたら実務に近い枝へ進む。</p></div>
        <div class="header-meta"><span class="tag">全${DATA.chapters.length}章</span><span class="tag">財務 ${DATA.chapters.filter(c => c.track === 'finance').length}章</span></div>
      </section>
      <section class="map-layout">
        <aside class="card track-menu">
          ${DATA.tracks.map((track) => `<button class="track-button ${track.id === 'finance' ? 'is-active' : ''}" data-map-track="${track.id}">${trackDot(track.id)}<span>${escapeHTML(track.short)}</span><small>${DATA.chapters.filter(chapter => chapter.track === track.id).length}章</small></button>`).join('')}
        </aside>
        <div class="map-main">
          <article class="card card-pad">
            <p class="section-label">FINANCE GATES</p>
            <div class="card-title-row"><div><h3>${financeTrack.label} ★最重点</h3><p class="muted">${financeTrack.description}</p></div><button class="button primary small" data-action="open-chapter" data-chapter-id="chapter-08">現在の章を開く</button></div>
            <div class="gate-lane">
              ${DATA.financeGates.map((gate) => `<div class="gate-card ${gate.status === 'current' ? 'is-active' : ''}"><span class="gate-no">${gate.no}</span><strong>${escapeHTML(gate.title)}</strong><small>${escapeHTML(gate.description)}</small></div>`).join('')}
            </div>
          </article>
          <div class="chapter-tree">
            ${DATA.tracks.map((track) => {
              const list = DATA.chapters.filter((chapter) => chapter.track === track.id);
              const open = track.id === 'finance' || track.id === 'problem';
              return `<details class="track-block" data-track-block="${track.id}" ${open ? 'open' : ''}><summary>${trackDot(track.id)}<strong>${escapeHTML(track.label)}</strong><small>${list.length}章</small></summary><div class="chapter-list">${list.map((chapter) => `<div class="chapter-row"><span class="chapter-no">${String(chapter.no).padStart(2, '0')}</span><div><strong>${escapeHTML(chapter.title)}</strong><small>${escapeHTML(chapter.outcome)} · ${chapter.minutes}分 · ${escapeHTML(chapter.artifact)}</small></div><div class="row-actions">${statusPill(chapterStatus(chapter))}<button class="button ghost small" data-action="open-chapter" data-chapter-id="${chapter.id}">開く</button></div></div>`).join('')}</div></details>`;
            }).join('')}
          </div>
        </div>
      </section>`;
    bindCommonEvents();
    root.querySelectorAll('[data-map-track]').forEach((button) => {
      button.addEventListener('click', () => {
        const trackId = button.dataset.mapTrack;
        const trackBlock = root.querySelector(`[data-track-block="${trackId}"]`);
        if (trackBlock) { trackBlock.open = true; trackBlock.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        root.querySelectorAll('[data-map-track]').forEach((item) => item.classList.toggle('is-active', item === button));
      });
    });
  }

  function renderLesson() {
    const current = getChapter(state.progress.selectedChapter || 'chapter-08');
    state.progress.lastViewedChapter = current.id;
    persist();
    setBreadcrumb('教科書', `Chapter ${String(current.no).padStart(2, '0')}`);
    const detail = DATA.lessonDetails[current.id] || DATA.defaultDetail;
    const sideChapters = DATA.chapters.filter((chapter) => ['foundation', 'problem', 'finance'].includes(chapter.track));
    const checks = state.progress.lessonChecks[current.id] || { read: false, drill: false, artifact: false };
    root.innerHTML = `
      <section class="lesson-layout">
        <aside class="card lesson-sidebar">
          <div class="lesson-side-title">CORE TEXTBOOK</div>
          ${sideChapters.map((chapter) => `<button class="lesson-item ${chapter.id === current.id ? 'is-active' : ''}" data-action="open-chapter" data-chapter-id="${chapter.id}"><span class="lesson-index">${String(chapter.no).padStart(2, '0')}</span><span><strong>${escapeHTML(chapter.title)}</strong><small>${chapter.minutes}分 · ${chapter.track === 'finance' ? '財務' : getTrack(chapter.track)?.short}</small></span></button>`).join('')}
        </aside>
        <article class="lesson-main">
          <header class="lesson-hero">
            <p class="eyebrow">CHAPTER ${String(current.no).padStart(2, '0')} · ${escapeHTML(getTrack(current.track)?.short || '')}</p>
            <h2>${escapeHTML(current.title)}</h2>
            <p>${escapeHTML(current.outcome)}</p>
            <div class="lesson-meta"><span class="tag finance">${current.minutes}分</span><span class="tag">成果物：${escapeHTML(current.artifact)}</span><span class="tag">${current.level === 'foundation' ? '基礎' : current.level === 'core' ? '中核' : '応用'}</span></div>
          </header>
          <section class="card lesson-section">
            <p class="section-label">WHY THIS MATTERS</p>
            <h3>なぜ、この章を学ぶのか</h3><p>${escapeHTML(detail.why)}</p>
          </section>
          <section class="card lesson-section">
            <p class="section-label">OUTCOME</p>
            <h3>この章を終えたらできること</h3><p>${escapeHTML(detail.goal)}</p>
            <div class="formula">${escapeHTML(detail.formula).replaceAll('\n', '<br>')}</div>
          </section>
          <section class="card lesson-section">
            <p class="section-label">KEY CONCEPTS</p>
            <h3>重要概念</h3>
            <div class="concept-grid">${detail.concepts.map(([title, body]) => `<div class="concept-card"><strong>${escapeHTML(title)}</strong><p>${escapeHTML(body)}</p></div>`).join('')}</div>
          </section>
          <section class="card lesson-section">
            <p class="section-label">EXAMPLE</p>
            <h3>例題：解き方を見る</h3><div class="example-box"><strong>数字を見たら、すぐ原因を断定しない</strong><p>${escapeHTML(detail.example)}</p></div>
          </section>
          <section class="card lesson-section">
            <p class="section-label">NEXT ACTION</p>
            <h3>次は、手を動かす</h3><p>理解を「使える」に変えるには、短問と成果物の両方が必要。この章に対応する問題を解き、回答を残してから実務演習へ進む。</p>
            <div class="today-actions"><button class="button primary" data-action="practice-chapter" data-chapter-id="${current.id}">この章のドリルを解く →</button><button class="button secondary" data-action="open-workspace">財務ワークスペースで試す</button></div>
          </section>
        </article>
        <aside class="lesson-side">
          <section class="card"><p class="section-label">CHAPTER CHECK</p><h3>通過条件</h3><div class="side-checks">
            ${[['read','本文を読み、重要概念を自分の言葉で説明できる'],['drill','対応するドリルを解き、間違い方を記録した'],['artifact',`最小版の「${current.artifact}」を残した`]].map(([key, label]) => `<label class="side-check"><input type="checkbox" data-check="${key}" ${checks[key] ? 'checked' : ''}><span>${escapeHTML(label)}</span></label>`).join('')}
            </div><button class="button ghost small" style="margin-top:14px" data-action="mark-chapter-complete" data-chapter-id="${current.id}">この章を通過にする</button></section>
          <section class="card"><p class="section-label">MY NOTE</p><h3>この章のメモ</h3><textarea class="note-box" id="lessonNote" placeholder="例：利益率を見るときは、金額・率・比較対象をセットで書く。">${escapeHTML(getLessonNote(current.id))}</textarea><button class="button ghost small" style="margin-top:10px" data-action="save-lesson-note" data-chapter-id="${current.id}">メモを保存</button></section>
          <section class="card"><p class="section-label">RESOURCE</p><h3>参照する一次情報</h3><p class="muted">公開企業を題材にする演習では、出所・公表日・単位を必ず残す。</p><div class="source-row"><span class="source-dot"></span><div><strong>EDINET</strong><small>有価証券報告書</small></div><a href="https://disclosure2.edinet-fsa.go.jp/" target="_blank" rel="noreferrer">開く</a></div><div class="source-row"><span class="source-dot"></span><div><strong>JPX</strong><small>決算短信・適時開示</small></div><a href="https://www.jpx.co.jp/listing/disclosure/index.html" target="_blank" rel="noreferrer">開く</a></div></section>
        </aside>
      </section>`;
    bindCommonEvents();
    root.querySelectorAll('[data-check]').forEach((input) => {
      input.addEventListener('change', () => {
        const chapterId = current.id;
        state.progress.lessonChecks[chapterId] = state.progress.lessonChecks[chapterId] || {};
        state.progress.lessonChecks[chapterId][input.dataset.check] = input.checked;
        persist();
      });
    });
  }

  function getLessonNote(chapterId) {
    return (state.notes.find((note) => note.id === `lesson-${chapterId}`) || {}).body || '';
  }

  function renderPractice() {
    const question = DATA.questions.find((item) => item.id === activeQuestionId) || DATA.questions[0];
    const chapter = getChapter(question.chapterId);
    setBreadcrumb('問題演習', question.type === 'special' ? 'スペシャル問題' : `Chapter ${String(chapter.no).padStart(2, '0')}`);
    practiceAnswered = false;
    selectedErrorTags = new Set();
    selectedConfidence = 2;
    timerSeconds = 0;
    root.innerHTML = `
      <section class="view-heading">
        <div><p class="section-label">PRACTICE</p><h2>解く前に考え、解いた後に間違い方を残す</h2><p>正解だけで終わらせない。自信度と迷った場所を残すと、次に戻るべき前提が見える。</p></div>
        <div class="header-meta"><span class="tag ${question.type === 'special' ? 'special' : 'finance'}">${question.type === 'special' ? 'スペシャル問題' : 'ドリル'}</span><span class="tag">${question.minutes}分目安</span></div>
      </section>
      <section class="practice-layout">
        <article class="card question-card">
          <div class="question-top"><div><strong>Q. ${escapeHTML(question.title)}</strong><div class="question-help">${question.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}</div></div><button class="button ghost small" data-action="change-question">別の問題</button></div>
          <div class="question-body">
            <p class="muted">${escapeHTML(question.lead)}</p>
            ${question.table ? `<div class="question-figure"><table class="data-table"><thead><tr>${question.table.headers.map(header => `<th>${escapeHTML(header)}</th>`).join('')}</tr></thead><tbody>${question.table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}
            <div class="answer-area"><label for="practiceAnswer">回答（まずは自分の言葉で。箇条書きでOK）</label><textarea id="practiceAnswer" placeholder="事実：\n仮説：\n次に確認すること："></textarea></div>
            <div class="answer-footer"><div class="confidence"><span>自信度</span>${[1,2,3,4,5].map(value => `<button class="${value === selectedConfidence ? 'is-selected' : ''}" data-confidence="${value}" aria-label="自信度 ${value}">${value}</button>`).join('')}</div><button class="button primary" data-action="submit-answer">解説と照合する →</button></div>
            <div id="answerFeedback"></div>
          </div>
        </article>
        <aside class="question-side">
          <section class="card timer-card"><div><p class="eyebrow">OPTIONAL TIMER</p><strong id="timerOutput">00:00</strong></div><button class="button ghost small" data-action="toggle-timer" id="timerButton">開始</button></section>
          <section class="card card-pad"><p class="section-label">QUESTION SET</p><h3>今日のセット</h3><div class="next-list">${DATA.questions.map((item, index) => `<div class="next-item ${item.id === question.id ? 'current' : ''}"><span class="step-number">${String(index + 1).padStart(2,'0')}</span><div><strong>${item.type === 'special' ? 'スペシャル問題' : getChapter(item.chapterId).title}</strong><small>${item.minutes}分 · ${item.tags.slice(0,2).join(' / ')}</small></div><button class="button ghost small" data-question-id="${item.id}">選ぶ</button></div>`).join('')}</div></section>
          <section class="card card-pad"><p class="section-label">QUALITY CHECK</p><h3>提出前に見ること</h3><div class="side-checks"><div class="side-check"><span>□</span><span>分母・期間・単位を確認した</span></div><div class="side-check"><span>□</span><span>事実と仮説を別の文にした</span></div><div class="side-check"><span>□</span><span>次に確認すべき情報まで書いた</span></div></div></section>
        </aside>
      </section>`;
    bindCommonEvents();
    root.querySelectorAll('[data-confidence]').forEach((button) => button.addEventListener('click', () => {
      selectedConfidence = Number(button.dataset.confidence);
      root.querySelectorAll('[data-confidence]').forEach((item) => item.classList.toggle('is-selected', item === button));
    }));
    root.querySelectorAll('[data-question-id]').forEach((button) => button.addEventListener('click', () => {
      activeQuestionId = button.dataset.questionId;
      renderPractice();
    }));
  }

  function renderAnswerFeedback(question) {
    const feedback = document.getElementById('answerFeedback');
    const answer = document.getElementById('practiceAnswer').value.trim();
    if (!answer) { showToast('まずは自分の回答を一言でも書いてから照合しよう。', 'error'); return; }
    stopTimer();
    practiceAnswered = true;
    feedback.innerHTML = `
      <section class="answer-result" style="margin-top:18px">
        <p class="section-label">MODEL ANSWER & SELF REVIEW</p><h3>解説と照合する</h3><p>${escapeHTML(question.modelAnswer)}</p>
        <div class="card" style="margin-top:13px; padding:13px; box-shadow:none"><strong style="font-size:12px">採点の観点</strong><div class="side-checks" style="margin-top:9px">${question.rubric.map(item => `<div class="side-check"><span>□</span><span>${escapeHTML(item)}</span></div>`).join('')}</div></div>
        <p class="muted" style="margin-top:14px">どこで迷った？ 正誤ではなく、間違い方を選ぶ。</p>
        <div class="error-tag-grid">${question.errorTags.map(tag => `<button class="error-tag-button" data-error-tag="${tag}">${errorLabel(tag)}</button>`).join('')}</div>
        <div id="feedbackNext">${feedbackNextMarkup(question)}</div>
        <div class="today-actions" style="margin-top:14px"><button class="button secondary" data-self-result="correct">理解できたとして記録</button><button class="button primary" data-self-result="review">要復習として記録</button></div>
      </section>`;
    feedback.querySelectorAll('[data-error-tag]').forEach((button) => button.addEventListener('click', () => {
      const tag = button.dataset.errorTag;
      if (selectedErrorTags.has(tag)) selectedErrorTags.delete(tag); else selectedErrorTags.add(tag);
      button.classList.toggle('is-selected', selectedErrorTags.has(tag));
      const nextTarget = feedback.querySelector('#feedbackNext');
      if (nextTarget) {
        nextTarget.innerHTML = feedbackNextMarkup(question, [...selectedErrorTags]);
        bindFeedbackNextActions(nextTarget);
      }
    }));
    bindFeedbackNextActions(feedback);
    feedback.querySelectorAll('[data-self-result]').forEach((button) => button.addEventListener('click', () => {
      const isCorrect = button.dataset.selfResult === 'correct';
      addSessionAttempt({ questionId: question.id, isCorrect, confidence: selectedConfidence, errorTags: [...selectedErrorTags], selfNote: answer });
      if (isCorrect && !state.progress.completedChapters.includes(question.chapterId)) state.progress.completedChapters.push(question.chapterId);
      persist();
      showToast(isCorrect ? '「理解できた」として学習ログに記録した。' : '要復習として記録した。次回のおすすめに反映する。');
      root.querySelectorAll('[data-self-result]').forEach((item) => item.disabled = true);
    }));
  }

  function bindFeedbackNextActions(container) {
    container.querySelectorAll('[data-feedback-open-chapter]').forEach((button) => button.addEventListener('click', () => openChapter(button.dataset.feedbackOpenChapter)));
    container.querySelectorAll('[data-feedback-next-question]').forEach((button) => button.addEventListener('click', () => {
      const currentIndex = DATA.questions.findIndex((item) => item.id === button.dataset.feedbackNextQuestion);
      const nextQuestion = DATA.questions[(currentIndex + 1) % DATA.questions.length];
      activeQuestionId = nextQuestion.id;
      activeView = 'practice';
      render();
    }));
  }

  function errorLabel(tag) {
    return {
      knowledge_gap: '概念が曖昧', calculation_error: '計算', unit_error: '単位・桁', period_error: '期間', denominator_error: '分母',
      reading_error: '読み落とし', logic_error: '因果・論理', comparison_error: '比較軸', fact_hypothesis_mixed: '事実と仮説', communication_error: '表現', execution_error: '手順・確認'
    }[tag] || tag;
  }

  function calculateWorkspace() {
    const { pl, bs, cf } = state.workspace;
    const grossPrev = pl.revenuePrev - pl.cogsPrev;
    const grossCurrent = pl.revenueCurrent - pl.cogsCurrent;
    const operatingPrev = grossPrev - pl.sgaPrev;
    const operatingCurrent = grossCurrent - pl.sgaCurrent;
    const currentAssetsPrev = bs.cashPrev + bs.receivablePrev + bs.inventoryPrev;
    const currentAssetsCurrent = bs.cashCurrent + bs.receivableCurrent + bs.inventoryCurrent;
    const fcfPrev = cf.operatingPrev + cf.investingPrev;
    const fcfCurrent = cf.operatingCurrent + cf.investingCurrent;
    return { grossPrev, grossCurrent, operatingPrev, operatingCurrent, currentAssetsPrev, currentAssetsCurrent, fcfPrev, fcfCurrent };
  }

  function renderWorkspace() {
    setBreadcrumb('財務ワークスペース', state.workspace.activeCompany);
    const calc = calculateWorkspace();
    const { pl, bs, cf } = state.workspace;
    const tabs = [{ id:'pl', label:'P/L' }, { id:'bs', label:'B/S' }, { id:'cf', label:'C/F' }];
    const statements = {
      pl: {
        title: 'P/L｜売上から営業利益まで',
        description: '成長の中身と、どこで利益率が変わったかを見る。',
        rows: [
          ['売上高', 'revenuePrev', 'revenueCurrent'],
          ['売上原価', 'cogsPrev', 'cogsCurrent'],
          ['売上総利益', null, null, calc.grossPrev, calc.grossCurrent],
          ['販売費及び一般管理費', 'sgaPrev', 'sgaCurrent'],
          ['営業利益', null, null, calc.operatingPrev, calc.operatingCurrent],
          ['営業利益率', 'ratio', 'ratio', (calc.operatingPrev / pl.revenuePrev) * 100, (calc.operatingCurrent / pl.revenueCurrent) * 100]
        ]
      },
      bs: {
        title: 'B/S｜資金の置き方と返すべきもの',
        description: '現金・売掛金・在庫・固定資産・借入・自己資本の変化を見る。',
        rows: [
          ['現金及び預金', 'cashPrev', 'cashCurrent'], ['売掛金', 'receivablePrev', 'receivableCurrent'], ['棚卸資産', 'inventoryPrev', 'inventoryCurrent'],
          ['固定資産', 'fixedPrev', 'fixedCurrent'], ['有利子負債', 'debtPrev', 'debtCurrent'], ['純資産', 'equityPrev', 'equityCurrent']
        ]
      },
      cf: {
        title: 'C/F｜利益と現金の違い',
        description: '本業で現金を生み、何に投資し、どこから資金を調達したかを見る。',
        rows: [
          ['営業CF', 'operatingPrev', 'operatingCurrent'], ['投資CF', 'investingPrev', 'investingCurrent'], ['財務CF', 'financingPrev', 'financingCurrent'], ['フリーCF', null, null, calc.fcfPrev, calc.fcfCurrent]
        ]
      }
    };
    const statement = statements[activeWorkspaceTab];
    const rows = statement.rows.map(([label, prevKey, currentKey, derivedPrev, derivedCurrent]) => {
      const source = activeWorkspaceTab === 'pl' ? pl : activeWorkspaceTab === 'bs' ? bs : cf;
      const prev = prevKey ? source[prevKey] : derivedPrev;
      const current = currentKey ? source[currentKey] : derivedCurrent;
      const ratio = prevKey === 'ratio';
      return `<tr><td>${escapeHTML(label)}</td><td>${prevKey && !ratio ? `<input type="number" data-workspace-key="${prevKey}" value="${Number(prev)}" />` : ratio ? `${Number(prev).toFixed(1)}%` : formatNumber(prev)}</td><td>${currentKey && !ratio ? `<input type="number" data-workspace-key="${currentKey}" value="${Number(current)}" />` : ratio ? `${Number(current).toFixed(1)}%` : formatNumber(current)}</td><td class="${changeClass(current, prev)}">${ratio ? `${(current - prev) >= 0 ? '+' : '−'}${Math.abs(current - prev).toFixed(1)}pt` : signedPercent(current, prev)}</td></tr>`;
    }).join('');
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">FINANCE WORKSPACE</p><h2>数字を入れ、観察・仮説・確認事項を分ける</h2><p>まずは架空企業で練習。公開企業を使うときは、単位・期間・出所・公表日を必ず残す。</p></div><div class="header-meta"><span class="tag finance">${escapeHTML(state.workspace.activeCompany)}</span><button class="button primary small" data-action="export-finance-memo">財務診断メモを書き出す</button></div></section>
      <section class="workspace-layout"><div>
        <div class="workspace-tabs">${tabs.map(tab => `<button class="workspace-tab ${tab.id === activeWorkspaceTab ? 'is-active' : ''}" data-workspace-tab="${tab.id}">${tab.label}</button>`).join('')}</div>
        <article class="card statement-card"><p class="section-label">FINANCIAL STATEMENT</p><h3>${statement.title}</h3><p class="muted">${statement.description}</p><div class="question-figure"><table class="statement-table"><thead><tr><th>単位：百万円</th><th>前年</th><th>当年</th><th>増減</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="kpi-grid">
          <div class="kpi-box"><small>売上高前年比</small><b>${signedPercent(pl.revenueCurrent, pl.revenuePrev)}</b></div>
          <div class="kpi-box"><small>営業利益率</small><b>${((calc.operatingCurrent / pl.revenueCurrent) * 100).toFixed(1)}%</b></div>
          <div class="kpi-box"><small>運転資本（売掛金＋在庫）</small><b>${formatNumber(bs.receivableCurrent + bs.inventoryCurrent)}</b></div>
          <div class="kpi-box"><small>フリーCF</small><b>${formatNumber(calc.fcfCurrent)}</b></div>
        </div></article>
      </div>
      <aside class="workspace-side">
        <section class="card"><p class="section-label">ANNOTATION</p><h3>数字の意味を、四つに分ける</h3><div class="annotation-tabs">${[['observation','観察'],['interpretation','解釈'],['hypothesis','仮説'],['check','確認事項']].map(([id,label]) => `<button class="annotation-tab ${id === activeAnnotation ? 'is-active' : ''}" data-annotation="${id}">${label}</button>`).join('')}</div><textarea class="annotation-textarea" id="annotationText" placeholder="ここに書く">${escapeHTML(state.workspace.annotations[activeAnnotation] || '')}</textarea><button class="button ghost small" style="margin-top:10px" data-action="save-annotation">このメモを保存</button></section>
        <section class="card"><p class="section-label">SOURCES</p><h3>出所のルール</h3>${DATA.resources.slice(0,2).map(resource => `<div class="source-row"><span class="source-dot"></span><div><strong>${escapeHTML(resource.title)}</strong><small>${escapeHTML(resource.description)}</small></div><a href="${resource.url}" target="_blank" rel="noreferrer">開く</a></div>`).join('')}</section>
        <section class="card"><p class="section-label">QUALITY CHECK</p><h3>書く前の確認</h3><div class="side-checks"><div class="side-check"><span>□</span><span>金額・率・比較対象を区別した</span></div><div class="side-check"><span>□</span><span>原因を断定せず仮説とした</span></div><div class="side-check"><span>□</span><span>次の確認情報を具体化した</span></div></div></section>
      </aside></section>`;
    bindCommonEvents();
    root.querySelectorAll('[data-workspace-tab]').forEach((button) => button.addEventListener('click', () => { activeWorkspaceTab = button.dataset.workspaceTab; renderWorkspace(); }));
    root.querySelectorAll('[data-workspace-key]').forEach((input) => input.addEventListener('change', () => {
      const key = input.dataset.workspaceKey;
      const target = activeWorkspaceTab === 'pl' ? state.workspace.pl : activeWorkspaceTab === 'bs' ? state.workspace.bs : state.workspace.cf;
      target[key] = Number(input.value) || 0;
      persist();
      renderWorkspace();
    }));
    root.querySelectorAll('[data-annotation]').forEach((button) => button.addEventListener('click', () => { activeAnnotation = button.dataset.annotation; renderWorkspace(); }));
  }

  function renderLibrary() {
    setBreadcrumb('成果物ライブラリ', 'テンプレートとメモ');
    const allArtifacts = [...state.artifacts, ...state.notes.filter((note) => note.id.startsWith('quick-') || note.id.startsWith('lesson-')).map((note) => ({ id: note.id, type: 'メモ', icon: '✎', title: note.title, description: note.body, chapter: '学習メモ', status: '保存済み', date: formatDate(note.createdAt) }))];
    const filters = ['すべて', '財務', '問題解決', '事業', '振り返り', 'メモ'];
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">ARTIFACT LIBRARY</p><h2>学習履歴ではなく、仕事で使える型を残す</h2><p>依頼確認メモ、論点ツリー、財務診断、週次振り返り。つくったものが、次の仕事の下書きになる。</p></div><div class="header-meta"><button class="button primary small" id="libraryQuickNote">＋ メモを追加</button><span class="tag">${allArtifacts.length}件</span></div></section>
      <section class="library-layout"><aside class="card library-filter"><div class="filter-title">FILTER</div>${filters.map((filter, index) => `<button class="filter-button ${index === 0 ? 'is-active' : ''}" data-library-filter="${filter}"><span>${filter}</span><small>${filter === 'すべて' ? allArtifacts.length : allArtifacts.filter(item => item.type === filter).length}</small></button>`).join('')}</aside><div id="artifactGrid" class="artifact-grid">${renderArtifactCards(allArtifacts)}</div></section>`;
    document.getElementById('libraryQuickNote').addEventListener('click', openQuickNote);
    root.querySelectorAll('[data-library-filter]').forEach((button) => button.addEventListener('click', () => {
      root.querySelectorAll('[data-library-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
      const filter = button.dataset.libraryFilter;
      const filtered = filter === 'すべて' ? allArtifacts : allArtifacts.filter((item) => item.type === filter);
      document.getElementById('artifactGrid').innerHTML = renderArtifactCards(filtered);
    }));
  }

  function renderArtifactCards(items) {
    if (!items.length) return `<div class="card empty-state"><div><strong>まだここには何もない。</strong><p>最初のメモか、学習中の成果物を保存しよう。</p></div></div>`;
    return items.map((artifact) => `<article class="artifact-card"><span class="artifact-icon">${escapeHTML(artifact.icon || '▧')}</span><h3>${escapeHTML(artifact.title)}</h3><p>${escapeHTML(artifact.description)}</p><footer><span>${escapeHTML(artifact.chapter || '—')}</span><span>${escapeHTML(artifact.date || '—')} · ${escapeHTML(artifact.status || '')}</span></footer></article>`).join('');
  }

  function renderReview() {
    setBreadcrumb('振り返り', '間違い方と次の30分');
    const weak = getWeakSkills();
    const errorCounts = {};
    state.attempts.filter((attempt) => !attempt.isCorrect).forEach((attempt) => (attempt.errorTags || []).forEach((tag) => { errorCounts[tag] = (errorCounts[tag] || 0) + 1; }));
    const errors = Object.entries(errorCounts).sort((a,b) => b[1]-a[1]);
    const max = Math.max(...errors.map(([,count]) => count), 1);
    const skillRows = [
      ['数字の観察', 4, '事実を先に書く'], ['事実と仮説の分離', 2, 'Chapter 6 / 18 を復習'], ['P/Lの読解', 3, 'Chapter 9 の短問'], ['利益と現金', 2, 'Chapter 13 を復習'], ['比較軸の設定', 3, '前年・競合・計画を揃える']
    ];
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">WEEKLY REVIEW</p><h2>何を間違えたかより、なぜ間違えたかを見る</h2><p>AI連携前でも、誤答タグと自分のメモがあれば、次の30分を具体的に決められる。ここは将来、AIレビューの入力にもなる。</p></div><div class="header-meta"><span class="tag">記録 ${state.attempts.length}回</span><button class="button secondary small" data-action="generate-review">振り返りを生成</button></div></section>
      <section class="review-grid"><div class="card card-pad"><p class="section-label">SKILL STATE</p><h3>スキル別の状態</h3><table class="skill-table"><thead><tr><th>スキル</th><th>状態</th><th>次の一手</th></tr></thead><tbody>${skillRows.map(([skill, level, next]) => `<tr><td><strong>${skill}</strong><div class="progress-dot-row" style="margin-top:6px">${[1,2,3,4,5].map(n => `<i class="${n <= level ? 'is-on' : ''}"></i>`).join('')}</div></td><td>${level <= 2 ? '<span class="status-pill review">再復習</span>' : '<span class="status-pill current">練習中</span>'}</td><td>${next}</td></tr>`).join('')}</tbody></table>
      <div class="card" style="margin-top:18px; padding:17px; box-shadow:none"><p class="section-label">NEXT 30 MINUTES</p><h3>次の30分メニュー</h3><div class="review-plan"><div class="review-plan-item"><b>01</b><div><strong>5分｜Chapter 6の型を読み返す</strong><p>事実・解釈・仮説・確認事項を、別の文にする。</p></div></div><div class="review-plan-item"><b>02</b><div><strong>12分｜P/L短問を1問解く</strong><p>金額、利益率、前年比の分母を書き出してから回答する。</p></div></div><div class="review-plan-item"><b>03</b><div><strong>13分｜財務ワークスペースでメモを直す</strong><p>原因の断定を仮説に戻し、確認事項を三つ置く。</p></div></div></div></div></div>
      <aside class="workspace-side"><section class="card"><p class="section-label">ERROR PATTERNS</p><h3>間違い方の分布</h3><div class="error-distribution">${(errors.length ? errors : [['fact_hypothesis_mixed',2],['denominator_error',1]]).map(([tag,count]) => `<div class="error-row"><span>${errorLabel(tag)}</span><i><b style="width:${Math.round((count/max)*100)}%"></b></i><em>${count}</em></div>`).join('')}</div></section>
      <section class="card"><p class="section-label">REVIEW DRAFT</p><h3>今週の振り返り</h3><div id="reviewDraft" class="quote">まだ生成していません。「振り返りを生成」を押すと、現在のログから下書きを作ります。</div></section>
      <section class="card"><p class="section-label">RECENT NOTES</p><h3>自分で残した気づき</h3>${state.notes.slice(0,3).map(note => `<div class="source-row"><span class="source-dot"></span><div><strong>${escapeHTML(note.title)}</strong><small>${escapeHTML(note.body.slice(0,55))}${note.body.length > 55 ? '…' : ''}</small></div></div>`).join('')}</section></aside></section>`;
    bindCommonEvents();
  }

  function renderSettings() {
    setBreadcrumb('設定・データ', '保存と持ち運び');
    root.innerHTML = `
      <section class="view-heading"><div><p class="section-label">SETTINGS</p><h2>教材はGitで、学習ログは自分の端末で持つ</h2><p>この初期版はログイン不要。章の進捗・問題履歴・メモ・財務ワークスペースを、ブラウザ内に保存し、JSONで持ち出せる。</p></div></section>
      <section class="settings-layout"><article class="card"><p class="section-label">LEARNING PROFILE</p><h3>学習条件</h3><div class="setting-row"><div><strong>表示名</strong><small>${escapeHTML(state.profile.name || '学習者')}</small></div><button class="button ghost small" id="openProfileSettings">編集</button></div><div class="setting-row"><div><strong>主な目標</strong><small>${goalLabel(state.profile.goal)}</small></div><span class="tag">${state.profile.sessionLength}分</span></div><div class="setting-row"><div><strong>財務の現在地</strong><small>${{starter:'ほぼ初めて', basic:'三表は見たことがある', intermediate:'基礎指標は読める', advanced:'実務で使ったことがある'}[state.profile.financeLevel]}</small></div><button class="button ghost small" data-view="map">学習マップ</button></div></article>
      <article class="card"><p class="section-label">EXPORT / IMPORT</p><h3>学習ログを持ち運ぶ</h3><div class="settings-notice">JSONには、プロフィール、進捗、問題の回答履歴、メモ、財務ワークスペースの入力値が含まれます。教材ファイル自体は含まれません。</div><div class="setting-row"><div><strong>学習ログをエクスポート</strong><small>別の端末への移行・バックアップ用。</small></div><button class="button secondary small" id="exportStateButton">JSON出力</button></div><div class="setting-row"><div><strong>学習ログをインポート</strong><small>この端末の現在ログは上書きされます。</small></div><label class="button ghost small" for="importStateInput">JSON読込</label><input id="importStateInput" type="file" accept="application/json" hidden></div></article>
      <article class="card"><p class="section-label">GITHUB PAGES</p><h3>公開・運用の前提</h3><div class="settings-notice">依存パッケージなしの静的サイト。リポジトリ直下をGitHub Pagesの公開元にすれば動く。教材の増補は <code>data.js</code> をJSON/MDXへ分割して進める設計。</div><div class="setting-row"><div><strong>READMEを読む</strong><small>公開手順、フォルダ構成、次の実装候補。</small></div><button class="button ghost small" id="downloadReadme">README保存</button></div></article>
      <article class="card"><p class="section-label">DANGER ZONE</p><h3>端末内の学習ログを初期化</h3><div class="settings-notice">教材コンテンツは消えません。ブラウザ内に保存した進捗、メモ、問題履歴、入力値だけを初期状態へ戻します。</div><div class="setting-row"><div><strong>学習ログをリセット</strong><small>戻せないため、先にJSON出力を推奨。</small></div><button class="button danger small" id="resetStateButton">リセット</button></div></article></section>`;
    document.getElementById('openProfileSettings').addEventListener('click', openProfile);
    document.getElementById('exportStateButton').addEventListener('click', exportState);
    document.getElementById('importStateInput').addEventListener('change', importState);
    document.getElementById('resetStateButton').addEventListener('click', resetState);
    document.getElementById('downloadReadme').addEventListener('click', () => showToast('README.md はリポジトリ直下に同梱済み。ZIPから確認して。'));
  }

  function bindCommonEvents() {
    root.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { activeView = button.dataset.view; render(); }));
    root.querySelectorAll('[data-action="open-chapter"]').forEach((button) => button.addEventListener('click', () => openChapter(button.dataset.chapterId)));
    root.querySelectorAll('[data-action="open-practice"]').forEach((button) => button.addEventListener('click', () => { activeView = 'practice'; render(); }));
    root.querySelectorAll('[data-action="open-route"]').forEach((button) => button.addEventListener('click', () => {
      const route = button.dataset.route;
      state.experience.selectedRoute = route;
      persist();
      activeView = route === 'start' ? 'diagnostic' : route;
      render();
    }));
    root.querySelectorAll('[data-action="open-question"]').forEach((button) => button.addEventListener('click', () => { activeQuestionId = button.dataset.questionId; activeView = 'practice'; render(); }));
    root.querySelectorAll('[data-action="retry-diagnostic"]').forEach((button) => button.addEventListener('click', () => { state.experience.diagnostic = { completed:false, answers:{}, score:null, bySkill:{}, completedAt:null }; persist(); renderDiagnostic(); }));
    root.querySelectorAll('[data-action="copy-work-template"]').forEach((button) => button.addEventListener('click', async () => {
      const text = document.getElementById('workTemplateText')?.value || '';
      try { await navigator.clipboard.writeText(text); showToast('分析メモの型をコピーした。'); }
      catch (error) { const textarea = document.getElementById('workTemplateText'); if (textarea) { textarea.select(); document.execCommand('copy'); showToast('分析メモの型をコピーした。'); } }
    }));
    root.querySelectorAll('[data-action="open-workspace"]').forEach((button) => button.addEventListener('click', () => { activeView = 'workspace'; render(); }));
    root.querySelectorAll('[data-action="practice-chapter"]').forEach((button) => button.addEventListener('click', () => {
      const question = DATA.questions.find((item) => item.chapterId === button.dataset.chapterId) || DATA.questions[0];
      activeQuestionId = question.id; activeView = 'practice'; render();
    }));
    root.querySelectorAll('[data-action="mark-chapter-complete"]').forEach((button) => button.addEventListener('click', () => markChapterComplete(button.dataset.chapterId)));
    root.querySelectorAll('[data-action="save-lesson-note"]').forEach((button) => button.addEventListener('click', () => saveLessonNote(button.dataset.chapterId)));
    root.querySelectorAll('[data-action="submit-answer"]').forEach((button) => button.addEventListener('click', () => {
      const question = DATA.questions.find((item) => item.id === activeQuestionId); renderAnswerFeedback(question);
    }));
    root.querySelectorAll('[data-action="toggle-timer"]').forEach((button) => button.addEventListener('click', () => {
      if (timerInterval) { stopTimer(); button.textContent = '再開'; } else { const output = document.getElementById('timerOutput'); timerInterval = setInterval(() => { timerSeconds += 1; if (output) output.textContent = `${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`; }, 1000); button.textContent = '停止'; }
    }));
    root.querySelectorAll('[data-action="change-question"]').forEach((button) => button.addEventListener('click', () => { const currentIndex = DATA.questions.findIndex((item) => item.id === activeQuestionId); activeQuestionId = DATA.questions[(currentIndex + 1) % DATA.questions.length].id; renderPractice(); }));
    root.querySelectorAll('[data-action="save-annotation"]').forEach((button) => button.addEventListener('click', saveAnnotation));
    root.querySelectorAll('[data-action="export-finance-memo"]').forEach((button) => button.addEventListener('click', exportFinanceMemo));
    root.querySelectorAll('[data-action="generate-review"]').forEach((button) => button.addEventListener('click', generateReview));
  }

  function openChapter(chapterId) {
    state.progress.selectedChapter = chapterId;
    state.progress.lastViewedChapter = chapterId;
    persist(); activeView = 'lesson'; render();
  }

  function markChapterComplete(chapterId) {
    const checks = state.progress.lessonChecks[chapterId] || {};
    if (!checks.read || !checks.drill || !checks.artifact) {
      showToast('通過条件は三つ。本文・ドリル・成果物を最低限チェックしてから進もう。', 'error');
      return;
    }
    if (!state.progress.completedChapters.includes(chapterId)) state.progress.completedChapters.push(chapterId);
    const current = getChapter(chapterId);
    const next = DATA.chapters.find((chapter) => chapter.no === current.no + 1);
    if (next) state.progress.selectedChapter = next.id;
    persist();
    showToast(`Chapter ${String(current.no).padStart(2, '0')} を通過にした。次の章へ進める。`);
    renderLesson();
  }

  function saveLessonNote(chapterId) {
    const value = document.getElementById('lessonNote').value.trim();
    const existing = state.notes.find((note) => note.id === `lesson-${chapterId}`);
    if (!value) { showToast('保存するメモを書いてから押して。', 'error'); return; }
    const chapter = getChapter(chapterId);
    if (existing) { existing.body = value; existing.createdAt = new Date().toISOString(); }
    else state.notes.unshift({ id: `lesson-${chapterId}`, title: `Chapter ${String(chapter.no).padStart(2,'0')}｜${chapter.title}`, body: value, createdAt: new Date().toISOString() });
    persist(); showToast('章のメモをライブラリに保存した。');
  }

  function saveAnnotation() {
    const value = document.getElementById('annotationText').value.trim();
    state.workspace.annotations[activeAnnotation] = value;
    persist(); showToast('財務ワークスペースのメモを保存した。');
  }

  function exportFinanceMemo() {
    const calc = calculateWorkspace();
    const memo = `# 財務診断メモ｜${state.workspace.activeCompany}\n\n作成日: ${new Date().toLocaleDateString('ja-JP')}\n単位: 百万円\n\n## 観察\n${state.workspace.annotations.observation || '—'}\n\n## 解釈\n${state.workspace.annotations.interpretation || '—'}\n\n## 仮説\n${state.workspace.annotations.hypothesis || '—'}\n\n## 確認事項\n${state.workspace.annotations.check || '—'}\n\n## 主要指標\n- 売上高前年比: ${signedPercent(state.workspace.pl.revenueCurrent, state.workspace.pl.revenuePrev)}\n- 営業利益率: ${((calc.operatingCurrent / state.workspace.pl.revenueCurrent) * 100).toFixed(1)}%\n- フリーCF: ${formatNumber(calc.fcfCurrent)}\n\n## 出所\n- 練習用の架空数値。実在企業を使う場合は、EDINET / JPX等の一次情報、資料名、公表日、ページを追記する。\n`;
    downloadText(`finance-memo-${dateStamp()}.md`, memo, 'text/markdown');
    showToast('財務診断メモをMarkdownで書き出した。');
  }

  function generateReview() {
    const target = document.getElementById('reviewDraft');
    if (!target) return;
    const weak = getWeakSkills();
    const correct = state.attempts.filter((attempt) => attempt.isCorrect).length;
    const recent = state.attempts[0];
    target.innerHTML = `<strong>できたこと</strong><br>・${state.attempts.length}回の問題演習を記録し、${correct}回は「理解できた」と自己評価できた。<br><br><strong>つまずきの傾向</strong><br>・${weak.map(item => escapeHTML(item.label)).join('、')}。<br><br><strong>原因仮説</strong><br>・数字の観察と原因の仮説を同じ文に置きやすい。分母・期間を明記する前に結論を書き始めている可能性。<br><br><strong>次の30分</strong><br>・Chapter 6の型を5分復習 → P/L短問12分 → 財務ワークスペースで確認事項を三つ書く。${recent ? `<br><br><span class="fine">直近ログ: ${formatDate(recent.attemptedAt)} · ${recent.selfNote ? escapeHTML(recent.selfNote.slice(0, 46)) : 'メモなし'}</span>` : ''}`;
    showToast('ログから振り返りの下書きを生成した。AI連携前のローカル版。');
  }

  function dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  }

  function downloadText(filename, text, type = 'text/plain') {
    const blob = new Blob([text], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function openProfile() {
    const modal = document.getElementById('profileModal');
    document.getElementById('inputProfileName').value = state.profile.name || '';
    document.getElementById('inputProfileGoal').value = state.profile.goal || 'finance';
    document.getElementById('inputSessionLength').value = state.profile.sessionLength || '30';
    document.getElementById('inputFinanceLevel').value = state.profile.financeLevel || 'basic';
    modal.showModal();
  }

  function saveProfile() {
    state.profile.name = document.getElementById('inputProfileName').value.trim() || '学習者';
    state.profile.goal = document.getElementById('inputProfileGoal').value;
    state.profile.sessionLength = document.getElementById('inputSessionLength').value;
    state.profile.financeLevel = document.getElementById('inputFinanceLevel').value;
    persist(); showToast('学習プロファイルを保存した。今日やる一手に反映する。'); render();
  }

  function openQuickNote() {
    const modal = document.getElementById('quickNoteModal');
    document.getElementById('quickNoteText').value = '';
    modal.showModal();
  }

  function saveQuickNote() {
    const text = document.getElementById('quickNoteText').value.trim();
    if (!text) { showToast('メモの中身を書いてから保存して。', 'error'); return; }
    state.notes.unshift({ id: `quick-${Date.now()}`, title: 'クイックメモ', body: text, createdAt: new Date().toISOString() });
    persist(); showToast('メモをライブラリに保存した。');
    if (activeView === 'library' || activeView === 'review') render();
  }

  function exportState() {
    const output = { app: 'Consulting Fundamentals Atlas', exportedAt: new Date().toISOString(), data: state };
    downloadText(`consulting-atlas-learning-log-${dateStamp()}.json`, JSON.stringify(output, null, 2), 'application/json');
    showToast('学習ログをJSONで書き出した。');
  }

  function importState(event) {
    const [file] = event.target.files;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const candidate = parsed.data || parsed;
        if (!candidate || typeof candidate !== 'object') throw new Error('Invalid data');
        state = mergeDeep(structuredClone(defaultState), candidate);
        persist(); render(); showToast('学習ログを読み込んだ。');
      } catch (error) {
        showToast('JSONを読み込めなかった。Atlasのエクスポートファイルか確認して。', 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  }

  function resetState() {
    if (!window.confirm('端末内の学習ログを初期化します。先にJSON出力を済ませましたか？')) return;
    state = structuredClone(defaultState); persist(); render(); showToast('学習ログを初期化した。');
  }

  function applyTheme(theme) {
    const rootEl = document.documentElement;
    if (theme === 'dark') rootEl.dataset.theme = 'dark';
    else if (theme === 'light') rootEl.dataset.theme = 'light';
    else rootEl.removeAttribute('data-theme');
  }

  function cycleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'system';
    const next = current === 'system' ? 'dark' : current === 'dark' ? 'light' : 'system';
    localStorage.setItem(THEME_KEY, next); applyTheme(next);
    showToast({ system: '表示を端末設定に合わせた。', dark: 'ダークモードに切り替えた。', light: 'ライトモードに切り替えた。' }[next]);
  }

  function setupGlobalEvents() {
    document.querySelectorAll('.nav-item[data-view]').forEach((button) => button.addEventListener('click', () => { activeView = button.dataset.view; render(); }));
    document.getElementById('menuButton').addEventListener('click', () => {
      const open = appShell.classList.toggle('nav-open');
      document.getElementById('menuButton').setAttribute('aria-expanded', String(open));
    });
    document.getElementById('profileButton').addEventListener('click', openProfile);
    document.getElementById('quickNoteButton').addEventListener('click', openQuickNote);
    document.getElementById('themeButton').addEventListener('click', cycleTheme);

    document.getElementById('profileForm').addEventListener('submit', (event) => { event.preventDefault(); saveProfile(); document.getElementById('profileModal').close(); });
    document.getElementById('quickNoteForm').addEventListener('submit', (event) => { event.preventDefault(); saveQuickNote(); document.getElementById('quickNoteModal').close(); });
    document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => {
      const modal = document.getElementById(button.dataset.closeModal);
      if (modal) modal.close();
    }));
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(savedTheme);
  updateProfileUI();
  setupGlobalEvents();
  render();
})();

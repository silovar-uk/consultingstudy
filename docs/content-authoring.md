# 教材コンテンツを増やすためのガイド

このアプリは、まず `data.js` に教材データを置いています。

目的は、UIを先に固め、教材の章立て・問題設計・ログ設計を検証することです。教材が増えてきたら、JSONやMDXへ分けます。

---

## 1. 章の基本情報

`data.js` の `chapterSeeds` で章の見出しを管理します。

```js
['finance', 9, 'P/Lを読む：売上から営業利益まで', '利益がどの段階で、なぜ変わったかを追う', 60]
```

| 項目 | 意味 |
|---|---|
| `finance` | トラックID。`tracks` に存在するものを使う |
| `9` | 章番号 |
| タイトル | 章の名前 |
| 到達点 | 章を終えた時にできること |
| `60` | 目安の学習時間（分） |

---

## 2. 詳細本文

`lessonDetails` に章の内容を追加します。

```js
'chapter-09': {
  why: 'なぜ学ぶのか',
  goal: 'この章でできるようになること',
  formula: '重要な式または思考の流れ',
  concepts: [
    ['概念名', '説明'],
    ['概念名', '説明']
  ],
  example: '例題の説明'
}
```

現在は、表示のために短く入れています。教科書として増補するときは、次の順番をおすすめします。

```text
1. なぜこの章を学ぶのか
2. この章を終えたらできること
3. 前提知識
4. 全体地図
5. 重要概念
6. 例題
7. ドリル
8. スペシャル問題
9. 実務演習
10. よくある間違い
11. 振り返り
12. 参考資料・一次情報
```

---

## 3. 問題の追加

`questions` に問題を追加します。

```js
{
  id: 'finance-pl-002',
  chapterId: 'chapter-09',
  type: 'data_reading',
  title: '問い',
  lead: '前提・データの説明',
  minutes: 12,
  difficulty: 2,
  tags: ['財務', 'P/L'],
  table: {
    headers: ['項目', '前年', '当年'],
    rows: [['売上高', '100', '120']]
  },
  modelAnswer: '解説のたたき台',
  rubric: ['観点1', '観点2'],
  errorTags: ['denominator_error', 'fact_hypothesis_mixed']
}
```

### 問題タイプ

```text
quick_check   用語、正誤、計算
short_answer  理由を説明する
 data_reading  表・グラフを読み、論点を出す
artifact      成果物をつくる
special       学習目的や苦手に応じたスペシャル問題
```

### 誤答タグ

```text
knowledge_gap          用語・概念が曖昧
calculation_error      計算ミス
unit_error             単位・桁の取り違え
period_error           期間・前年比・累計 / 単期の取り違え
denominator_error      分母の取り違え
reading_error          問題文・表・注記の読み落とし
logic_error            因果・論理の飛躍
comparison_error       比較対象が不適切
fact_hypothesis_mixed  事実と仮説の混同
communication_error    読み手に伝わらない表現
execution_error        手順・確認漏れ
```

---

## 4. 財務教材の必須ルール

財務の問題・本文・解説には、できる限り次を入れます。

```text
- 金額だけでなく、率と比較対象を置く
- 分母・期間・単位を明記する
- 観察と仮説を別の文にする
- 原因を断定しない
- 次に確認すべき情報を示す
- 実在企業を扱う場合、出所・公表日・資料名・ページを残す
```

---

## 5. JSON / MDXへ移す基準

次の状態になったら `data.js` から分けます。

```text
- 1トラックの問題が30問を超えた
- 章本文が画面ロジックより長くなった
- 図解、表、ケース教材が増えた
- 本文をGit上でレビューしたい
```

推奨構成です。

```text
content/
├─ curriculum.json
├─ skills.json
├─ chapters/
│  ├─ finance/
│  │  ├─ 07-financial-analysis-overview.mdx
│  │  ├─ 08-business-model-and-profit.mdx
│  │  └─ ...
│  └─ problem-solving/
├─ questions/
│  ├─ finance.json
│  └─ problem-solving.json
├─ rubrics/
└─ resources/
```

この段階で、Vite / React / Next.js などへの移行を検討します。ただし、GitHub Pagesのみで運用する間は、静的HTML + JSONのままでも十分です。

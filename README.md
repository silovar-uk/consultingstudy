# Consulting Fundamentals Atlas

> コンサル一年目の実戦教科書。読む、解く、つくる、振り返るを一つにする、GitHub Pages対応の静的Webアプリ。

財務分析を中心に、問題解決・事業理解・リサーチ・資料化・プロジェクト推進までを、教科書、問題演習、成果物、学習ログとしてつなぐプロトタイプです。

![アプリアイコン](assets/app-icon.png)

## この初期版でできること

- ホーム画面で「今日やる一手」と、財務トラックの現在地を確認
- 全43章を樹形図・Gate形式で閲覧
- 財務中心の教科書画面（Chapter 7 / 8 / 9 / 12 / 13 / 15 / 18 / 21は詳細コンテンツ入り）
- 章の通過条件をチェックし、進捗を保存
- 財務ドリル、スペシャル問題、自信度、誤答タグを記録
- P/L・B/S・C/Fの数値を編集し、指標と「観察 / 解釈 / 仮説 / 確認事項」を分けて書く
- 財務診断メモをMarkdownで書き出し
- 学習ログをJSONでエクスポート / インポート
- クイックメモと章メモを成果物ライブラリへ保存
- ローカルの学習ログから、週次振り返りの下書きを生成
- iPhoneホーム画面用アイコン / Web Manifest を同梱

## まだ入れていないもの

- 本文・問題の網羅的な増補
- 実在企業の決算データ自動取得
- AI APIによる添削・学習プラン最適化
- クラウド同期・ログイン・複数端末同期
- 成果物のPDF / PPTX自動生成

この順で後から足せるよう、画面ロジックと教材データを分けています。

## GitHub Pagesで公開する手順

このリポジトリはビルド不要です。`index.html` がリポジトリ直下にあるため、そのまま静的サイトとして公開できます。

1. GitHubで新しいリポジトリを作成する
   - 例: `consulting-fundamentals-atlas`
2. このフォルダの中身を、リポジトリ直下へアップロードする
3. GitHubの **Settings → Pages** を開く
4. **Build and deployment** で、以下を選ぶ
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/(root)`
5. `Save` を押す
6. 公開URLが表示されたら、iPhone Safariで開く
7. Safariの共有メニューから「ホーム画面に追加」を選ぶ

> `public/` 配下ではなく、**リポジトリ直下**を公開対象にする構成です。GitHub Pagesで迷いにくく、ビルドも要りません。

## ローカルで確認する

Node.jsやnpmは不要です。

```bash
cd consulting-fundamentals-atlas
python3 -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000
```

## フォルダ構成

```text
consulting-fundamentals-atlas/
├─ index.html                    # アプリの土台
├─ styles.css                    # UI / レスポンシブ対応
├─ data.js                       # 章・問題・教材のデータ
├─ app.js                        # 画面描画、進捗、保存、出力のロジック
├─ site.webmanifest              # iPhoneホーム画面向け設定
├─ .nojekyll                     # GitHub Pages用
├─ assets/
│  ├─ app-icon.png               # 元画像
│  ├─ apple-touch-icon.png       # iPhone用
│  ├─ icon-192.png
│  └─ icon-512.png
└─ docs/
   ├─ blueprint.md                # 教科書 × 学習アプリの設計書
   ├─ learning-roadmap.md         # 学習ロードマップ詳細版
   └─ content-authoring.md        # 教材を増やす時の書き方
```

## 教材を増やす方法

現在は、教材を `data.js` にまとめて入れています。プロトタイプを速く動かすためです。

増補するときは、まずこの順で進めるのがおすすめです。

1. `chapterSeeds` に章の基本情報を追加・更新する
2. `lessonDetails` に、以下を追加する
   - なぜ学ぶのか
   - 到達点
   - 重要概念
   - 例題
3. `questions` にドリル・スペシャル問題を追加する
4. 実在企業演習は、出所・公表日・単位・ページを必ず残す
5. 問題数が増えた段階で `content/finance/*.json` へ分割する
6. 本文が長くなった段階で MDX 化する

詳しいデータの型は [docs/content-authoring.md](docs/content-authoring.md) を参照してください。

## 学習ログの保存について

- 進捗・メモ・問題履歴・ワークスペース入力値は、ブラウザの `localStorage` に保存されます。
- Safariの閲覧データを消すと、ログも消える可能性があります。
- 定期的に **設定・データ → JSON出力** でバックアップしてください。
- GitHub Pagesへ公開しても、ユーザーの学習ログはサーバーへ送信されません。

## 財務演習の情報源

実在企業を題材にするときは、一次情報を起点にしてください。

- [金融庁 EDINET](https://disclosure2.edinet-fsa.go.jp/)
- [JPX 上場会社情報 / 適時開示](https://www.jpx.co.jp/listing/disclosure/index.html)

財務演習の原則は、次の4つです。

```text
1. 分母・期間・単位を必ず確認する
2. 前年 / 計画 / 競合 / 業界のいずれかと比較する
3. 数字から原因を断定せず、仮説と追加確認を分ける
4. 出所・公表日・ページを残す
```

## 次に実装すると良い順番

### Phase 2｜教材を強くする

- Gate 0〜6のドリルを各10〜20問へ増やす
- 財務以外の章にも、短問 + 成果物演習を実装する
- 章ごとの参照URL、図解、チェックリストを増やす

### Phase 3｜学習の精度を上げる

- 問題の自動採点（選択・計算問題）
- 誤答タグからの復習キュー
- 章・スキルの依存関係に基づくおすすめ
- Markdownで書いた成果物をテンプレート化

### Phase 4｜AIと同期を足す

- AIによる「観察 / 解釈 / 仮説 / 確認事項」のレビュー
- 週次のAI振り返り
- GitHub / Google Drive / Supabase 等へのバックアップ
- 成果物のPDF / PPTXアウトライン出力

## デザイン方針

- 教育アプリらしすぎず、仕事道具として使える落ち着き
- 財務の数字は「見せる」より「考える」ためのUI
- 連続日数ではなく、理解・演習・成果物・振り返りを進捗の中心に置く
- スマホでも見られるが、財務ワークスペースと成果物作成はPCで深く使える設計

---

Created for a practical learning workflow.  
Designed to grow from a static GitHub Pages app into a personal consulting learning system.


## 2026-07-04 UXアップデート

ホームを「機能一覧」ではなく、目的別の3ルートへ変更しました。

- **はじめる**：3分診断から、最初に学ぶGateと10分レッスンを提案
- **仕事に使う**：営業利益率／営業CF／在庫／競合比較を検索し、次に見る数字・原因仮説・分析メモの型を表示
- **弱点をつぶす**：正誤・自信度・誤答タグから弱点マップと次の30分メニューを表示

すべてブラウザ内保存のまま動作し、GitHub Pagesで追加の設定は不要です。

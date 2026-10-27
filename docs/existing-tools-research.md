# 02. 既存ツール調査

> NUTMEG の進捗確認ツール設計の参考にするための先行事例まとめ。
> 「機能」よりも「**なぜそう設計しているか（設計思想）**」に注目して整理しています。
> 調査日：2026-10-28。料金や機能は変わることがあるので、採用時は公式サイトで再確認してください。

---

## 1. 非同期チェックイン型（事前記入を回す仕組み）

### Geekbot
- **何をするか**：Slack / Teams 上で bot が決まった時刻に質問を送り、メンバーがDMで答えると、回答がチャンネルにまとめて投稿される（非同期スタンドアップ）
- **設計思想**：**書く場所を「普段いる場所（Slack）」にする**。新しいツールを開かせない
- **その他**：参加者のローカル時刻に合わせた配信、アンケート・振り返りにも使える
- **弱点**：レビューでは「5〜6人を超えると投稿が散らかる」「タスク管理には向かない」という声
- **NUTMEG への示唆**：記入リマインド・記入の入口を Slack に寄せる発想は、C-2（見る場所が増える問題）への直接的な答えになる

### Range
- **何をするか**：チェックイン（やったこと・やること）＋ **気分（赤・黄・緑）** の共有、困ったら「助けて」フラグ、チームダッシュボード
- **設計思想**：進捗だけでなく **人の状態（忙しさ・気分）も一緒に共有** する。チェックインを人間関係づくりにも使う（アイスブレイク質問など）
- **その他**：Asana / GitHub のタスクをチェックインに取り込める。誰かが気分を共有したり助けを求めたら Slack に通知
- **NUTMEG への示唆**：「各部門の忙しさを感覚的に把握したい」という課題にぴったり。**% バーより、信号色の自己申告の方が学園祭準備には合う**かもしれない

### Basecamp（Automatic Check-ins / Hill Charts）
- **Automatic Check-ins**：「今日何をした？」のような定型の質問を定期的に自動で投げる
- **Hill Charts**：作業を「山」の上に置き、**登り = まだ不明点がある / 下り = やり方がわかって実行するだけ** で表す。点は人が手でドラッグする
- **設計思想**：進捗を「タスクの完了率」ではなく「**不確実性が解消されたか**」で見る
- **NUTMEG への示唆**：学園祭の企画は「何をやるか決まってない」段階が長い。% より「山の登り/下り」の方が実態に近い可能性あり

## 2. プロジェクト状況報告型（局長・副局長が全体を把握する仕組み）

### Linear（Project Updates）
- **何をするか**：プロジェクトごとに **Health（On track / At risk / Off track）＋ 文章（進捗・課題・次の一手）** で定期更新。最新の更新がプロジェクト概要に表示され、過去分は Updates タブに残る。Slack にも流せる
- **設計思想**：「進捗はタスクの数値だけからは予測できない。チームの定性的な声が必要」（Linear 公式ブログ）
- **NUTMEG への示唆**：PMMT の「部門ごとの進捗報告」は、ほぼこの形に置き換えられる。**3段階の状態だけで、局長は読む部門を選べる**（At risk だけ読む）

### Atlassian Goals & Projects（旧 Atlas）
- **何をするか**：プロジェクトは毎週、目標は毎月アップデートを書く。フォローしている人には **月曜朝にフィードとダイジェスト（メール / Slack / Teams）** が届く。タグでまとめて読める「Topics」、集中して読む「リーディングモード」もある
- **設計思想**：**書く人と読む人のリズムを固定する**（書く日・読む日が決まっている）。読む人は「フォロー」したものだけ受け取る
- **弱点**：周期が固定で変えられないという要望がコミュニティで出ている
- **NUTMEG への示唆**：「平メンバーは自部門以外に関心が薄い」問題には、**フォロー＋ダイジェスト**で「見に行かなくても届く」形が合う

## 3. 会議・議事録・意思決定型

### Fellow
- **何をするか**：共同編集のアジェンダ（テンプレート多数）、会議中のメモ、**アクションアイテム（期限付き、終わるまで次回に繰り越し）**、決定事項の記録。AI が議論からアクションアイテムを生成
- **設計思想**：**会議の「前（アジェンダ）・中（メモ）・後（TODO）」を1つの流れでつなぐ**。未完了の TODO は自動で次回に出てくる
- **弱点**：「軽い確認には大げさ」という声も
- **NUTMEG への示唆**：C-5（前回 TODO が追跡されない）への答え。**未完了 TODO の自動繰り越し**は MVP に入れる価値が高い

### 話者分離付き文字起こしサービス（tl;dv, Notta, Otter など）
- 1台の録音から話者を自動で分ける機能を持つものが多い（日本語の精度はサービスによって差がある）
- **NUTMEG への示唆**：各自録音（収音分離）を作り込む前に、まずこの種のサービスや AI の文字起こしで足りないか試す価値あり

### 意思決定ログ（ADR: Architecture Decision Record の考え方）
- ソフトウェア開発で使われる「**決めたこと・背景・選ばなかった案・日付**」を1件1レコードで残す習慣
- **NUTMEG への示唆**：B-1（記録の単位）の答え。「決定事項」をページの中身ではなく **独立したレコード** にすれば、検索・引継ぎ・LLM 参照が一気に楽になる

---

## 4. 横断して見えた設計パターン

| パターン | 採用例 | 解ける NUTMEG の課題 |
|---|---|---|
| **書く場所を普段いる場所に寄せる** | Geekbot, Atlassian（Slack ダイジェスト） | 事前記入の遅れ / 見に行くのが面倒 |
| **状態を3段階・信号色で自己申告** | Linear, Range | 感覚的な進捗把握 / 局長の読む負担 |
| **書くリズムと読むリズムを固定** | Atlassian, Basecamp | 締切が無い / 読まれない |
| **フォロー＋ダイジェストで届ける** | Atlassian | 平メンバーの他部門把握 |
| **TODO を完了まで自動繰り越し** | Fellow | 決まったことが追跡されない |
| **決定事項を1件1レコードで残す** | ADR, Fellow | 検索性・引継ぎ・LLM 参照 |
| **人の状態（忙しさ・困りごと）も共有** | Range | 忙しさの把握 / 助けを求めやすさ |

## 5. 注意したい点（先行事例の「失敗」側から）
- 投稿が増えると散らかる（Geekbot の声）→ **読む人ごとの絞り込み**が必要
- 機能が多いと「大げさ」と感じられる（Fellow の声）→ MVP は小さく
- 周期の固定は窮屈という声もある（Atlassian）→ ただし NUTMEG は週1固定なので、むしろ固定で良い

---

## 参考リンク
- [Geekbot（GetApp）](https://www.getapp.com/communication-software/a/geekbot/)
- [Geekbot レビュー（Capterra）](https://www.capterra.it/reviews/148076/geekbot)
- [Linear Docs: Initiative and project updates](https://linear.app/docs/initiative-and-project-updates)
- [Linear: How we built project updates](https://linear.app/now/how-we-built-project-updates)
- [Atlassian: Follow goals, projects, teams, and topics](https://support.atlassian.com/platform-experiences/docs/follow-goals-projects-teams-and-topics)
- [Atlassian Community: Goals and Projects](https://community.atlassian.com/forums/Goals-and-Projects/gh-p/teamcentral/page/8)
- [Range: Check-ins](https://www.range.co/product/check-ins)
- [Range: Mood sharing](https://www.range.co/product/mood-sharing)
- [Basecamp 3: New feature round-up（Signal v. Noise）](https://signalvnoise.com/svn3/basecamp-3-new-feature-round-up/)
- [Basecamp Review（TechRepublic）](https://www.techrepublic.com/pt/article/basecamp-review/)
- [Fellow（Zoom Marketplace）](https://marketplace.zoom.us/apps/PSqbhfgwRCe6MHUjwql6eA)
- [Fellow（TrustRadius）](https://www.trustradius.com/products/fellow-app)

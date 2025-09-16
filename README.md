# 📱 シフトマッチ - 軽貨物専用シフト管理アプリ

## 🎯 概要

シフトマッチは、軽貨物運送業界に特化したシフト管理アプリケーションです。従業員のシフト希望提出から管理者のAI自動シフト作成、日報管理まで一元的に管理できます。

## 🏗️ アーキテクチャ

### フロントエンド
- **技術スタック**: React 18 + TypeScript + Vite
- **UI フレームワーク**: Chakra UI
- **状態管理**: Zustand
- **ルーティング**: React Router v6
- **PWA対応**: Service Worker でオフライン機能
- **地図機能**: Leaflet (GPS勤怠管理)
- **画像処理**: Tesseract.js (OCR機能)

### バックエンド
- **技術スタック**: Node.js + Express + TypeScript
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: JWT + Passport.js
- **ファイルアップロード**: Multer + Cloudinary
- **リアルタイム通信**: Socket.io
- **AI機能**: OpenAI API (シフト自動作成)
- **通知**: Firebase Cloud Messaging

### インフラ・デプロイメント
- **クラウド**: Vercel (フロント) + Railway/Render (バック)
- **データベース**: PostgreSQL (Supabase または Railway)
- **ファイルストレージ**: Cloudinary
- **監視**: Sentry

## 🌟 主要機能

### 👤 従業員機能
- ✅ シフト希望提出 (月単位、期限管理)
- ✅ シフト確認 (不足分への応募)
- ✅ 日報提出 (OCR対応、オフライン保存)
- ✅ GPS勤怠打刻
- ✅ ダッシュボード (稼働状況・売上)
- ✅ チャット・掲示板

### 👨‍💼 管理者機能
- ✅ 従業員管理 (招待・グループ管理)
- ✅ AIシフト自動作成
- ✅ 日報管理・売上集計
- ✅ GPS勤怠マップ確認
- ✅ ダッシュボード (全体統計)
- ✅ 外部連携 (会計ソフト・カレンダー)

### 🔐 認証・セキュリティ
- ✅ メール/パスワード認証
- ✅ OTP (ワンタイムパスワード)
- ✅ 生体認証 (指紋・顔認証)
- ✅ JWT トークン管理

### 🎮 モチベーション要素
- ✅ バッジシステム (皆勤賞・売上トップ)
- ✅ ランキング表示
- ✅ 稼働率グラフ化

## 🚀 セットアップ

### 前提条件
- Node.js 18+
- PostgreSQL 14+
- pnpm (推奨)

### インストール

```bash
# リポジトリクローン
git clone <repository-url>
cd shift-match

# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env
# .env ファイルを適切に設定

# データベース初期化
pnpm db:setup

# 開発サーバー起動
pnpm dev
```

## 📂 プロジェクト構成

```
shift-match/
├── frontend/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── store/          # 状態管理
│   │   ├── services/       # API通信
│   │   └── utils/          # ユーティリティ
│   ├── public/
│   └── package.json
├── backend/                 # バックエンドAPI
│   ├── src/
│   │   ├── controllers/    # コントローラー
│   │   ├── models/         # データモデル
│   │   ├── routes/         # ルーティング
│   │   ├── middleware/     # ミドルウェア
│   │   ├── services/       # ビジネスロジック
│   │   └── utils/          # ユーティリティ
│   ├── prisma/             # データベーススキーマ
│   └── package.json
├── shared/                  # 共通型定義・ユーティリティ
├── docs/                   # ドキュメント
└── scripts/                # スクリプト
```

## 🗄️ データベース設計

### 主要エンティティ
- **User** (ユーザー: 管理者・従業員)
- **Company** (会社・グループ)
- **Shift** (シフト)
- **ShiftRequest** (シフト希望)
- **DailyReport** (日報)
- **Location** (勤務地・営業所)
- **Attendance** (勤怠)
- **Chat** (チャット)
- **Notification** (通知)

## 🔧 開発コマンド

```bash
# フロントエンド開発サーバー
pnpm frontend:dev

# バックエンド開発サーバー
pnpm backend:dev

# 両方同時起動
pnpm dev

# データベースマイグレーション
pnpm db:migrate

# テスト実行
pnpm test

# ビルド
pnpm build

# デプロイ
pnpm deploy
```

## 📝 ライセンス

MIT License

## 👥 開発チーム

- フルスタック開発: Claude AI Assistant
- UI/UX デザイン: 要件定義基づく設計
- インフラ: モダンクラウドアーキテクチャ

---

**重要**: このアプリケーションは軽貨物運送業界の特性を理解し、現場の実用性を最重視して開発されています。
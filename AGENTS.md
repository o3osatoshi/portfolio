# リポジトリガイドライン（現行実装）

このドキュメントは、現在のリポジトリの状態を反映したものです。以下のコマンドは既存の `package.json` から直接取得しているため、変更を加えた際は必ず整合性を保って更新してください。

## アーキテクチャ概要
- **Domain (`@repo/domain`)**: 値オブジェクト、エンティティ、ポート。内部依存は `@o3osatoshi/toolkit` に限定されます（外部ライブラリは除く）。
- **Application (`@repo/application`)**: DTO バリデーションとユースケース。Domain のポート/値オブジェクトおよび `@o3osatoshi/toolkit` に依存します。
- **Infrastructure (`@repo/prisma`)**: Prisma を用いた Domain ポート実装と DB クライアントユーティリティ。
- **Integrations (`@repo/integrations`)**: Domain ポートを実装する外部サービスアダプター（API、キャッシュ）。
- **Logging (`@o3osatoshi/logging`)**: Node/Edge/Browser ランタイム向けの Axiom-first ロギングヘルパー。
- **Auth (`@repo/auth`)**: HTTP インターフェース層とデリバリー層で利用する、共有の Auth.js/Hono 設定と React ヘルパー。
- **HTTP Interface (`@repo/interface`)**: Hono ベースの HTTP インターフェース（Node/Edge アプリと型付きクライアント）。ビジネスロジックは持たず、auth とユースケースを接続します。
- **Delivery (`apps/web`, `apps/functions`, `apps/edge`)**: Next.js ルートハンドラー、Firebase Functions、Cloudflare Worker。Infrastructure アダプターをアプリケーションのユースケースへ注入します。
- **Presentation (`@o3osatoshi/ui`, `apps/storybook`)**: ドメイン関心事から分離された、再利用可能な UI ライブラリとドキュメント基盤。
- **Shared Tooling (`@o3osatoshi/config`, `@o3osatoshi/toolkit`)**: スタック横断で利用するビルドプリセット、lint 設定、エラーハンドリングユーティリティ。

## プロジェクト構成
- `apps/web`: Next.js 16 ポートフォリオアプリ（React 19、App Router）。
- `apps/functions`: `tsup` でバンドルされる Firebase Cloud Functions（Node 22 ランタイム）。
- `apps/edge`: `@repo/interface/http/edge` 経由で Edge HTTP API を公開する Cloudflare Worker（Wrangler v4）。
- `apps/storybook`: UI レビューとビジュアルテスト向けの Vite ベース Storybook。
- `packages/domain`, `packages/application`: クリーンアーキテクチャのコア（Vitest）。
- `packages/prisma`: Prisma スキーマ、アダプター、DB スクリプト。
- `packages/integrations`: プロバイダー実装向けの外部サービスアダプター（API、キャッシュ）。
- `packages/auth`: デリバリー層で共有される Auth.js + Hono 設定と React ヘルパー。
- `packages/interface`: ランタイム非依存の HTTP インターフェース（Hono アプリ + 型付き RPC クライアント）。Node/Edge 向け。
- `packages/logging`: Node/Edge/Browser ランタイム向けの Axiom-first ロギングヘルパー。
- `packages/ui`: サーバー/クライアント分割ビルドで公開される React コンポーネントライブラリ。
- `packages/toolkit`: 一貫したエラーハンドリングのための Zod/Neverthrow ヘルパー。
- `packages/eth`: Wagmi CLI で生成されるコントラクト型/フック（`packages/eth/.env.local` が必要）。
- `packages/config`: 共有の tsconfig/biome/eslint/tsup プリセット。
- `packages/supabase`: Supabase CLI 設定（ワークスペースパッケージではありません）。

## セットアップとルートスクリプト
- 依存関係のインストール: `pnpm install`（Node >= 22 が必要）。
- すべての開発ターゲットを起動: `pnpm dev`。
- スコープ指定の開発ターゲットを起動: `pnpm dev:web`, `pnpm dev:edge`, `pnpm dev:functions`, `pnpm dev:storybook`。
- すべてのパッケージ/アプリをビルド: `pnpm build`。
- スコープ指定のターゲットをビルド: `pnpm build:web`, `pnpm build:functions`, `pnpm build:storybook`, `pnpm build:edge`。
- ワークスペース全体を型チェック: `pnpm check:type`。
- すべてのテストを実行: `pnpm check:test`。
- カバレッジ付きでテストを実行: `pnpm check:test:cvrg`。
- 統合チェック（型 + テスト）: `pnpm check`。
- Lint/Format/`package.json` ソート（書き込みあり）: `pnpm style`。
- Lint/Format/`package.json` ソート（チェックのみ）: `pnpm style:pure`。
- Biome のみ: `pnpm style:biome`（書き込み）または `pnpm style:biome:fix`（unsafe 書き込み）または `pnpm style:biome:pure`（チェック）。
- ESLint のみ: `pnpm style:eslint`（fix）または `pnpm style:eslint:pure`（キャッシュのみ）。
- `package.json` ソートのみ: `pnpm style:pkg`（書き込み）または `pnpm style:pkg:pure`（チェック）。
- ビルド成果物をクリーン: `pnpm clean`。
- env ファイルを更新（`env:pull` スクリプトがある場所のみ実行）: `pnpm env:pull`。
- Firebase Functions をデプロイ: `pnpm deploy:functions`。
- Edge をデプロイ（prod）: `pnpm deploy:edge`。
- Edge をデプロイ（preview）: `pnpm deploy:edge:prv`。
- Refine（style → build → check → API extract）: `pnpm refine`。
- API Extractor: `pnpm api:extract`, `pnpm api:report`。
- リリースワークフローヘルパー（Changesets）:
  - インタラクティブ changeset エディターを開く: `pnpm release:log`。
  - 保留中の changeset を適用してバージョンを更新: `pnpm release:version`。
  - npm にパッケージを公開（通常は CI 経由）: `pnpm release`。

## アプリ / パッケージ別コマンド
- Web: `pnpm dev:web`, `pnpm -C apps/web build`, `pnpm -C apps/web start`。
- Storybook: `pnpm dev:storybook`, `pnpm -C apps/storybook build`。
- Functions: `pnpm -C apps/functions dev`, `pnpm -C apps/functions serve`, `pnpm -C apps/functions deploy`, `pnpm -C apps/functions logs`。
- Edge: `pnpm -C apps/edge dev`, `pnpm -C apps/edge build`, `pnpm -C apps/edge deploy`, `pnpm -C apps/edge deploy:prv`。
- Prisma: `pnpm -C packages/prisma migrate:dev`, `pnpm -C packages/prisma migrate:deploy`, `pnpm -C packages/prisma migrate:reset`, `pnpm -C packages/prisma migrate:status`, `pnpm -C packages/prisma db:push`, `pnpm -C packages/prisma db:seed`, `pnpm -C packages/prisma studio`。
- Eth コード生成: `pnpm -C packages/eth generate`（`packages/eth/.env.local` が必要）。
- UI ライブラリ: `pnpm -C packages/ui dev`, `pnpm -C packages/ui build`, `pnpm -C packages/ui test`。
- コアパッケージ（domain/application/auth/interface/integrations/logging/toolkit/eth）: `pnpm -C packages/<name> test`, `pnpm -C packages/<name> typecheck`。

## コード生成
- Prisma クライアント: `pnpm -C packages/prisma build`
  - Turbo は `build` パイプラインの一部としてこのスクリプトを実行するため、ビルド時に Prisma Client は自動生成されます。
- Wagmi/ETH フック: `pnpm -C packages/eth generate`。
- 利用可能な `generate` スクリプトをすべて実行: `pnpm -r run generate`（定義されている場所のみ実行）。

## データベース（Prisma）
- 環境変数ファイル:
  - `packages/prisma/.env`（`prisma.config.ts` + `dotenv/config` 経由で Prisma CLI が使用）
  - `packages/prisma/.env.development.local`, `.env.test.local`, `.env.production.local`（ローカルテンプレート）
- スキーマ/マイグレーション/シード関連の作業はすべて `packages/prisma` のスクリプトを使用してください（上記コマンド参照）。ルートレベルの DB スクリプトはありません。

## テスト
- フレームワーク: 併置された `*.spec.ts(x)` テストを使う Vitest。
- ワークスペース全体: `pnpm check:test`（Turbo がパッケージレベルの `test` スクリプトへ展開）。
- パッケージ単位の例: `pnpm -C packages/domain test`。
- カバレッジ: `pnpm -C <package> test:cvrg`。

## コーディングスタイルと規約
- `pnpm style` を実行すると、package sort + ESLint + Biome を順番に実行します。
- Biome のみ: `pnpm style:biome`（書き込み）, `pnpm style:biome:fix`（unsafe 書き込み）, `pnpm style:biome:pure`（チェック）。
- ESLint のみ: `pnpm style:eslint`（fix）または `pnpm style:eslint:pure`（キャッシュのみ）。
- import は Biome + `eslint-plugin-perfectionist` により自動整列されます。
- 文字列: ダブルクォート、インデント: スペース（Biome で強制）。
- 命名: ファイル = kebab-case、コンポーネント = PascalCase、コードシンボル = camelCase。
- TypeScript を全体で推奨（`apps/web` と `packages/ui` は Next.js ルーティング規約に従う）。

## セキュリティと設定
- 環境変数は、利用側の app/package 配下にある `.env.*` に配置します。
  - `apps/web`: `.env.local`（Next.js）。
  - `apps/functions`: `.env.local`（Firebase Functions）。
  - `apps/edge`: ローカル Wrangler 開発用の `.env.local`。
  - `packages/prisma`: `.env`（CLI）, `.env.development.local`, `.env.test.local`, `.env.production.local`。
  - `packages/eth`: Wagmi CLI 用の `.env.local`。
- Firebase CLI コマンドは認証済みであることを前提とします（`pnpm -C apps/functions deploy`, `pnpm -C apps/functions logs`）。
- すべてのワークスペースで最低 Node バージョンは 22。`apps/functions` は `engines.node` を `22` に固定しています。

## 補足
- `packages/ui` はサーバー/クライアント分割バンドルを公開します。React のクライアントコンポーネント内では `@o3osatoshi/ui/client` を import してください。
- `packages/supabase` は設定のみで、pnpm ワークスペースから除外されています。
- スクリプト、パッケージ名、アーキテクチャ境界に変更があった場合は、このドキュメントを必ず更新してください。

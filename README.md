# MirakTest

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/ci7lus/MirakTest?include_prereleases)](https://github.com/ci7lus/MirakTest/releases)
[![CI](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml/badge.svg)](https://github.com/ci7lus/MirakTest/actions/workflows/ci.yml)

[Mirakurun](https://github.com/Chinachu/Mirakurun) 用映像視聴アプリ実装研究資料<br />

> [!NOTE]
> MirakTest は開発を終了しました。macOS/iOS 向けの代替実装として [kiririn](https://github.com/ci7lus/kiririn) を開発しています。

## 概要

MirakTest は macOS / Windows / Linux 上で Mirakurun を利用しデジタル放送を視聴するアプリの実装を研究する目的で配布される研究資料です。本アプリに CAS 処理は含まれていないため、デコードされていない放送データを視聴することは出来ません。<br />
macOS / Windows 版ビルドでは [aribb24.js](https://github.com/monyone/aribb24.js) による ARIB-STD-B24 形式の字幕表示に対応しています。<br />
プラグインを導入して機能を拡張することが出来ます。

## 導入方法

### 安定版

各 OS 向けビルドを [Releases](https://github.com/ci7lus/MirakTest/releases) にて配布しています。

#### macOS での実行

```sh
brew install --cask ci7lus/miraktest/miraktest
```

Intel / Apple Silicon mac (aarch64) 上で動作する macOS Monterey / Ventura での動作を確認しています。<br />

#### Windows での実行

exe のインストーラーをダウンロードして実行するか、zip を解凍して使用してください。<br />
Windows 11 での動作を確認しています。

#### Linux での実行

実験的なサポートのため、環境によっては正しく動作しない可能性があります。<br>
Debian 13 (trixie) での動作を確認しています。<br>
ハードウェア支援周りの不具合については[こちら](https://github.com/ci7lus/MirakTest/wiki/Linux-%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B-libVLC-%E3%81%AE%E3%83%8F%E3%83%BC%E3%83%89%E3%82%A6%E3%82%A7%E3%82%A2%E6%94%AF%E6%8F%B4%E5%91%A8%E3%82%8A%E3%81%AE%E4%B8%8D%E5%85%B7%E5%90%88%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)。<br />
VLC はシステムのものを使うので、先に導入してください。AppImage を使う場合は FUSE 2 のライブラリも必要です。Debian 13 では次のコマンドで入ります。

```bash
sudo apt-get install vlc libfuse2t64
```

AppImage に実行権限を付けて実行するか、アーカイブ版を展開して `miraktest` を実行してください。Debian 13 のようにユーザー名前空間が使える環境では `--no-sandbox` は要りません。使えない環境では `--no-sandbox` を付けるか、アーカイブ版の `chrome-sandbox` を適切な権限に設定してください（[参考](https://github.com/Revolutionary-Games/Thrive/issues/749)）。

GPU が使えない環境（3D アクセラレーションの無い仮想マシンなど）では、画面が白いまま映像が出ないことがあります。その場合は `--disable-gpu-compositing` を付けて起動してください。映像の描画には WebGL を使っており、GPU が無いときはソフトウェア実装（SwiftShader）で描くようにしてあります。ただ、画面の合成までソフトウェア実装に任せると失敗する環境があるためです。

`miraktest` は Electron 本体（`miraktest.bin`）を起動するシェルスクリプトです。Electron は Chromium 用に機能を絞った FFmpeg（`libffmpeg.so`）を同梱しており、そのままでは libVLC がこちらを使ってしまいます。その FFmpeg には MPEG-2 のデコーダが無いので、放送が音だけで再生され、映像が出ません。スクリプトは、libVLC のプラグインが本来使う `libavcodec` などを `LD_PRELOAD` で先に読み込ませてから起動します。この処理を止めたいときは、環境変数 `MIRAKTEST_NO_LIBAV_PRELOAD=1` を設定してください。

### 開発版

下記開発手順に沿ってビルドを行うか、CI にてコミット毎にビルドが行われているので、コミットメッセージ右の緑色チェック → Artifacts からダウンロードできます（ログインが必要です）。

## 機能

### プラグイン

プラグインを導入して機能を拡張することが出来ます。<br />
利用できるプラグインの一覧は[こちら](https://github.com/ci7lus/MirakTest/wiki/Userland-Plugin)。<br />
API 仕様は[plugin.ts](./src/types/plugin.ts)を参照してください。<br />
型定義ファイル(`plugin.d.ts`)はリリースにてアプリイメージと一緒に配布しています。

### 操作

- [キーボードショートカット](https://github.com/ci7lus/MirakTest/wiki/%E3%82%AD%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%82%AB%E3%83%83%E3%83%88)

## 開発

### macOS

```bash
brew install vlc cmake
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
./setup_libvlc_mac.sh
./setup_wcjs.sh
yarn build:tsc
yarn dev:webpack
yarn dev:electron
yarn build
```

[vlc-miraktest](https://github.com/vivid-lapin/vlc-miraktest) の [Releases](https://github.com/vivid-lapin/vlc-miraktest/releases) にある dmg から `VLC.app` を抽出し MirakTest ディレクトリに配置することで、ビルドが aribb24.js を用いるようになります。

### Windows

```powershell
choco install -y cmake powershell-core
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
yarn
pwsh .\setup_wcjs.ps1
yarn build:tsc
yarn dev:webpack
yarn dev:electron
yarn build
```

### Linux (debian)

Node.js 24 と、それに付属する corepack（yarn 3 を使います）を用意してから進めてください。Electron 44 に内蔵されている Node.js と同じ版です。

```bash
sudo apt-get install build-essential cmake libvlc-dev vlc
git clone git@github.com:ci7lus/MirakTest.git
cd MirakTest
corepack enable
yarn
./setup_wcjs.sh
yarn build:tsc
yarn dev:webpack
yarn dev:electron:linux
yarn build
```

開発中は `yarn dev:electron` ではなく `yarn dev:electron:linux` で起動してください。前者は Electron をそのまま起動するので、上に書いた理由で映像が出ません。

`yarn build` は、webpack の出力を Electron 自身に構文検査させてから（`yarn build:check`）パッケージを作ります。terser は、ビルドに使った Node.js の Unicode の表で「引用符なしのキーとして書けるか」を決めます。ビルドの Node.js と Electron の Unicode の版が食い違うと、Electron が識別子として読めない文字（`アニメ・特撮` の `・` など）を裸のまま出力し、画面がまったく起動しなくなります。Electron 21 のころに実際に起きたので、webpack の設定でキーを常に引用符で囲むようにしてあります。

## 謝辞

MirakTest は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Mirakurun](https://github.com/Chinachu/Mirakurun)
- [RSATom/WebChimera.js](https://github.com/RSATom/WebChimera.js)
- [search-future/miyou.tv](https://github.com/search-future/miyou.tv)
- [monyone/aribb24.js](https://github.com/monyone/aribb24.js)
- [tsukumijima/KonomiTV](https://github.com/tsukumijima/KonomiTV)

DTV コミュニティの皆さまに感謝します。

## ライセンス

MirakTest のソースコードは MIT ライセンスの下で提供されますが、ビルド済みパッケージは libVLC を含んでいる場合があり、その場合は LGPLv2.1 または GPLv2 でライセンスされます（[詳細](https://wiki.videolan.org/Frequently_Asked_Questions/)）。ビルド済みパッケージを Releases や Artifacts にて配布する場合は可能な限り周辺情報としてその旨を表示し、パッケージにはライセンス情報を同梱します。

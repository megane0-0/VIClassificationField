# 両眼開放エスターマン視野検査 - 最大直径計算ツール

視覚障害者スポーツのクラス分け判定支援Webアプリケーション

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 概要

このツールは、両眼開放エスターマン視野検査（Binocular Esterman Visual Field Test）の120点パターンの測定点をインタラクティブに入力し、固視点を通る視野の最大直径を自動計算するWebアプリケーションです。IBTA（International Blind Tennis Association）などの視覚障害者スポーツにおけるクラス分け判定を支援します。

## 主要機能

### 📊 視野検査機能
- **120点の測定点配置**: エスターマン標準パターンに基づく配置
- **インタラクティブ入力**: クリックで測定点のオン/オフを切り替え
- **リアルタイム計算**: 測定点の状態が変わるたびに自動で最大直径を再計算
- **視覚的フィードバック**:
  - 緑色: 見える点（陽性点）
  - グレー: 見えない点（陰性点）

### 📐 計算機能
- **境界点の自動計算**: 各方向で陽性点と陰性点の中間に境界線を設定
- **最大直径の探索**: 固視点を通る全方向（0.5度刻み）で最大直径を探索
- **幾何計算**: Turf.jsを使用した高精度な幾何計算

### 🎨 可視化機能
- **見える領域の表示**: 半透明の緑色で視野領域を表示
- **境界線の描画**: 緑色の実線で境界を表示
- **最大直径ライン**: 赤色の点線で最大直径を表示
- **グリッド表示**: 同心円と放射線のガイドライン

### 💾 出力機能
- **結果のコピー**: 計算結果をテキストとしてクリップボードにコピー
- **画像保存**: 視野図をPNG画像としてダウンロード
- **詳細表示**: 各方向の境界点情報を表示

## 技術仕様

### 使用技術
- **HTML5 + CSS3**: レスポンシブデザイン
- **JavaScript (ES6+)**: オブジェクト指向プログラミング
- **SVG**: 高品質なベクターグラフィックス描画
- **Turf.js 7.x**: 地理空間解析ライブラリ（幾何計算）

### 測定点配置

両眼開放エスターマンパターン:
- **測定範囲**: 中心±76度程度
- **測定点数**: 120点
- **検査方法**: 両眼開放（binocular）

### 計算アルゴリズム

#### ステップ1: 境界点の計算
```
各方向について:
1. 固視点からの距離順に測定点をソート
2. 最も外側の陽性点を探す
3. 次の点が陰性の場合 → 2点の中間を境界点とする
4. 次の点が陽性またはそれ以上外側に点がない場合 → その陽性点を境界点とする
5. すべて陰性の場合 → 固視点(0,0)を境界点とする
```

#### ステップ2: 最大直径の探索
```
1. 固視点(0,0)を通る直線を0.5度刻みで生成（0°〜180°）
2. 各直線と境界ポリゴンの交差点を計算
3. 2つの交差点間の距離を計算
4. 全方向で最大の直径を特定
```

## 使い方

### 基本操作

1. **測定点の入力**
   - 視野図上の点をクリックして見える/見えないを切り替え
   - 緑色 = 見える、グレー = 見えない

2. **一括操作**
   - 「全選択」: すべての測定点をオンにする
   - 「全解除」: すべての測定点をオフにする
   - 「リセット」: 初期状態に戻す

3. **結果の確認**
   - 最大直径、方向、選択点数が自動的に表示されます
   - 境界点の詳細も確認できます

4. **結果の保存**
   - 「結果をコピー」: テキストをクリップボードにコピー
   - 「画像として保存」: PNG形式で視野図を保存

### 操作例

**例1: 全視野が見える場合**
1. 「全選択」をクリック
2. 最大直径: 約140度以上（検査範囲全体）

**例2: 中心のみ見える場合（求心性視野狭窄）**
1. 各方向の内側の点のみ選択
2. 小さな最大直径が計算される

## ファイル構成

```
.
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート
├── ff120-coordinates.js    # エスターマン座標データ
├── ff120-calculator.js     # JavaScript計算ロジック
└── README.md              # このファイル
```

## FF120座標データへの変更方法

将来、ゴールドマンFF120の正確な座標データを入手した場合、以下の手順で変更できます：

### 1. ff120-coordinates.js を編集

ファイルの先頭にあるコメントを参考に、以下のように変更してください：

```javascript
// 右眼用の座標配列を定義
const FF120_RIGHT_EYE_COORDINATES = [
    {x: 0, y: 3}, {x: 2.6, y: 1.5}, // ... FF120の右眼座標データ
];

// 左眼用の座標配列を定義（右眼を水平反転、またはオリジナルデータ）
const FF120_LEFT_EYE_COORDINATES = [
    {x: 0, y: 3}, {x: -2.6, y: 1.5}, // ... FF120の左眼座標データ
];

// getFF120Coordinates関数を更新
function getFF120Coordinates(eye = 'right') {
    const coords = eye === 'right' ? FF120_RIGHT_EYE_COORDINATES : FF120_LEFT_EYE_COORDINATES;
    return coords.map((coord, index) => ({
        id: index,
        x: coord.x,
        y: coord.y,
        isVisible: false
    }));
}
```

### 2. ff120-calculator.js を編集

以下の変更を行ってください：

```javascript
// クラスのコンストラクタにcurrentEyeプロパティを追加
constructor() {
    this.currentEye = 'right'; // 'right' or 'left'
    // ... 既存のコード
}

// init()メソッドでeyeパラメータを渡す
init() {
    this.points = getFF120Coordinates(this.currentEye);
    // ... 既存のコード
}

// 右眼/左眼切り替えメソッドを追加
switchEye(eye) {
    if (eye === this.currentEye) return;
    this.currentEye = eye;
    this.points = getFF120Coordinates(eye);
    this.calculatePointPolarCoordinates();
    this.renderPoints();
    this.updateResults();
}

// attachEventListeners()に右眼/左眼ボタンのリスナーを追加
attachEventListeners() {
    document.getElementById('rightEye').addEventListener('click', () => {
        this.switchEye('right');
    });
    document.getElementById('leftEye').addEventListener('click', () => {
        this.switchEye('left');
    });
    // ... 既存のコード
}

// getResultText()を更新
getResultText() {
    const eyeStr = this.currentEye === 'right' ? '右目 (OD)' : '左目 (OS)';
    let text = `ゴールドマン視野検査 (FF120) 最大直径計算結果\n`;
    text += `測定眼: ${eyeStr}\n`;
    // ... 既存のコード
}
```

### 3. index.html を編集

右眼/左眼選択ボタンを追加：

```html
<div class="controls">
    <div class="eye-selection">
        <label class="eye-label">測定眼:</label>
        <button id="rightEye" class="btn btn-eye active">右目 (OD)</button>
        <button id="leftEye" class="btn btn-eye">左目 (OS)</button>
    </div>
    <!-- 既存のcontrol-buttons ... -->
</div>

<!-- 結果パネル内に測定眼表示を追加 -->
<div class="result-item">
    <span class="result-label">測定眼:</span>
    <span id="eyeDisplay" class="result-value">右目 (OD)</span>
</div>
```

### 4. タイトルと説明の更新

- index.html の `<title>` と `<h1>` をFF120に変更
- README.md の内容をFF120用に更新

## インストールと実行

### オプション1: ローカルで実行

1. リポジトリをクローン
```bash
git clone <repository-url>
cd VIClassificationField
```

2. ブラウザでHTMLファイルを開く
```bash
# Linuxの場合
xdg-open index.html

# macOSの場合
open index.html

# Windowsの場合
start index.html
```

### オプション2: Webサーバーで実行

```bash
# Python 3を使用
python -m http.server 8000

# Node.jsのhttp-serverを使用
npx http-server
```

その後、ブラウザで `http://localhost:8000` を開く

## ブラウザ対応

- ✅ Google Chrome (推奨) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Microsoft Edge 90+

**必須機能**:
- SVGサポート
- ES6+サポート
- Clipboard API

## 計算の精度

- **座標精度**: 小数点以下1桁
- **直径精度**: 小数点以下1桁
- **角度刻み**: 0.5度（最大直径探索時）

## アクセシビリティ

- ✅ キーボード操作対応
- ✅ ツールチップによる測定点情報表示
- ✅ 色覚多様性に配慮した色選択
- ✅ レスポンシブデザイン（モバイル対応）

## 参考資料

- Esterman Visual Field Test 標準検査法
- IBTA (International Blind Tennis Association) クラス分け規定
- Turf.js Documentation: https://turfjs.org/

## ライセンス

MIT License

## 作成情報

- **バージョン**: 2.0
- **作成日**: 2025年11月10日
- **更新日**: 2025年11月18日（エスターマン座標に変更、クリック領域改善）
- **用途**: IBTA視覚障害者スポーツクラス分け判定支援ツール

## 今後の拡張予定

- [ ] データの保存・読み込み機能（JSON形式）
- [ ] よく使うパターンのプリセット保存
- [ ] 複数検査の比較機能
- [ ] 印刷用レポート生成
- [ ] 他の視野検査パターン対応（Goldmann FF120など）
- [ ] アニメーション表示（境界線の変化）
- [ ] 方向別選択機能

## お問い合わせ

バグ報告や機能要望は、GitHubのIssuesにてお願いします。

---

**注意**: このツールは補助的な判定支援ツールです。正式なクラス分け判定は、必ず有資格者によって行われる必要があります。

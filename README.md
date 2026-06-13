# ハンフリー視野検査 最大直径計算ツール

視覚障害者スポーツのクラス分け判定を支援するWebアプリケーション。ハンフリー視野検査（10-2または30-2）の測定点をインタラクティブに入力し、固視点を通る視野の最大直径を自動計算します。

## 🎯 機能

- **2つの検査タイプをサポート**
  - ハンフリー10-2: 72測定点、2度間隔、中心10度範囲
  - ハンフリー30-2: 84測定点、6度間隔、中心30度範囲

- **インタラクティブな測定点入力**
  - クリックで測定点のオン/オフを切り替え
  - 視覚的フィードバック（緑=見える、灰=見えない）
  - 固視点を赤い十字で表示

- **リアルタイム計算**
  - 測定点変更時に自動で最大直径を再計算
  - 見えている領域を半透明の緑で視覚化
  - 最大直径のラインと端点を表示

- **便利な操作**
  - 全選択/全解除/リセットボタン
  - 計算結果のコピー機能
  - 視野図の画像保存（PNG形式）

## 📋 仕様

### ハンフリー10-2プログラム
- 測定点数: 72点（実装版）
- 測定範囲: 中心10度以内
- 測定間隔: 2度
- 配置パターン: 水平・垂直軸から1度ずれた位置
- 見え方: オンの点を中心に2度×2度の正方形領域（±1度）が見えている

### ハンフリー30-2プログラム
- 測定点数: 84点（実装版）
- 測定範囲: 中心30度以内
- 測定間隔: 6度
- 配置パターン: 水平・垂直軸から3度ずれた位置
- 見え方: オンの点を中心に6度×6度の正方形領域（±3度）が見えている

## 🚀 使い方

### オンラインで使用

1. ブラウザで `index.html` を開く
2. 検査タイプ（10-2または30-2）を選択
3. 測定点をクリックして見える点をオンにする
4. 最大直径が自動計算され、結果が表示される

### ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/megane0-0/VIClassificationField.git
cd VIClassificationField

# ブラウザで開く
# index.htmlをダブルクリック、または
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

## 🛠️ 技術スタック

- **HTML5**: 構造
- **CSS3**: スタイリング、レスポンシブデザイン
- **JavaScript (ES6+)**: アプリケーションロジック
- **SVG**: 視野図の描画
- **Turf.js**: 幾何計算ライブラリ
  - 正方形のマージ（Union演算）
  - 直線と領域の交差判定（Line Intersection）
  - 距離計算

## 📐 計算アルゴリズム

### ステップ1: 見えている領域の生成
1. オンになっている測定点をすべて抽出
2. 各オン点について正方形領域を作成
   - 10-2: 点(x, y)を中心に [x-1, x+1] × [y-1, y+1]
   - 30-2: 点(x, y)を中心に [x-3, x+3] × [y-3, y+3]
3. すべての正方形をマージして連続領域を作成

### ステップ2: 最大直径の計算
1. 固視点(0, 0)を通る直線を0°から180°まで0.5°刻みで生成
2. 各直線について見えている領域との交点を計算
3. 固視点を通る最も長い直径を持つ方向を特定
4. 最大直径、方向（角度）、両端点の座標を記録

## 📁 ファイル構成

```
VIClassificationField/
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート
├── humphrey-data.js    # 測定点座標データ
├── app.js              # アプリケーションロジック
└── README.md           # このファイル
```

## 🎨 主要クラスとデータ構造

### `HumphreyFieldCalculator` クラス
メインアプリケーションクラス。視野図の描画、測定点の管理、最大直径の計算を担当。

```javascript
class HumphreyFieldCalculator {
  - currentTestType: '10-2' | '30-2'
  - points: Array<Point>
  - result: DiameterResult

  + renderVisualField()
  + calculateMaxDiameter()
  + updateResults()
  + togglePoint(id)
}
```

### データ構造

```javascript
// 測定点
interface Point {
  id: number;
  x: number;        // X座標（度）
  y: number;        // Y座標（度）
  isVisible: boolean; // 見える/見えない
}

// 計算結果
interface DiameterResult {
  maxDiameter: number;      // 最大直径（度）
  angleDegrees: number;     // 方向（0-180度）
  endpoint1: {x, y};        // 端点1
  endpoint2: {x, y};        // 端点2
  visibleRegion: Polygon;   // 見えている領域
}
```

## 🌐 ブラウザ対応

- Chrome/Edge: ✅ 完全サポート
- Firefox: ✅ 完全サポート
- Safari: ✅ 完全サポート
- モバイルブラウザ: ✅ レスポンシブ対応

## ♿ アクセシビリティ

- キーボード操作対応
- スクリーンリーダー対応（ARIA属性）
- 色覚多様性に配慮した色選択
- 十分なコントラスト比

## 📝 使用例

### 例1: 中心視野のみが見える場合
1. 10-2を選択
2. 中心付近の測定点（±3度程度）のみをオンにする
3. 結果: 最大直径 約6-8度

### 例2: 上半分の視野が見える場合
1. 30-2を選択
2. Y座標が正の測定点をすべてオンにする
3. 結果: 最大直径 約30度（上下方向）

## 🔧 カスタマイズ

### 測定点の追加・変更
`humphrey-data.js` の `HUMPHREY_10_2_POINTS` または `HUMPHREY_30_2_POINTS` を編集します。

### スタイルの変更
`styles.css` を編集して色やサイズをカスタマイズできます。

### 計算パラメータの調整
`app.js` の `calculateMaxDiameter()` 関数内の角度刻み（デフォルト0.5度）を変更できます。

## 🐛 トラブルシューティング

### 計算結果が表示されない
- ブラウザのコンソールでエラーを確認
- Turf.jsが正しく読み込まれているか確認
- 測定点がオンになっているか確認

### 画像保存ができない
- モダンブラウザを使用しているか確認
- ポップアップブロッカーを無効にする

## 📚 参考資料

- HFA3 Instructions for Use (Zeiss)
- Humphrey Visual Field Analyzer 公式ドキュメント
- IBTA (International Blind Tennis Association) クラス分け規定
- [Turf.js Documentation](https://turfjs.org/)

## 📄 ライセンス

MIT License

## 👥 貢献

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📧 お問い合わせ

問題や提案がある場合は、[Issues](https://github.com/megane0-0/VIClassificationField/issues)を開いてください。

## 🎯 今後の拡張予定

- [ ] 左右対称入力モード
- [ ] よく使うパターンのプリセット保存
- [ ] 複数検査の比較機能
- [ ] クラス分け基準値の自動判定
- [ ] 印刷用レポート生成
- [ ] 右眼/左眼の切り替え（盲点位置の考慮）

---

**バージョン**: 1.0
**作成日**: 2025年11月10日
**対象**: IBTA視覚障害者スポーツクラス分け判定支援

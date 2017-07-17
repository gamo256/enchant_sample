// enchant.js本体やクラスをエクスポートする
enchant();

// ページが読み込まれたときに実行される関数
window.onload = function() {

  // コアオブジェクトを作成する
  core = new Core(320, 320);

  // 1秒あたりの画面の描画回数を設定する(省略時は「30」)
  core.fps = 16;

  // ゲームで使用する画像ファイルを読み込む
  core.preload('betty.png');

  // ファイルのプリロードが完了したときに実行される関数
  core.onload = function() {

    // スプライトを作成する
    var player = new Sprite(48, 48);
    // スプライトで表示する画像を設定する
    player.image = core.assets['betty.png'];
    // 表示するフレームの番号を設定する
    player.frame = 3;
    // 表示位置のx座標を設定する
    player.x = 120;
    // 表示位置のy座標を設定する
    player.y = 50;
    
    // rootSceneにスプライトを追加する
    core.rootScene.addChild(player);
    
    // 「enterframe」イベントが発生したときに実行するリスナを登録する
    player.addEventListener('enterframe', function(e) {

      // 左ボタンが押されたら、スプライトをx方向に「-4」ピクセル移動する
      if (core.input.left) this.x -= 4;

      // 右ボタンが押されたら、スプライトをx方向に「4」ピクセル移動する
      if (core.input.right) this.x += 4;

      // 上ボタンが押されたら、スプライトをy方向に「-4」ピクセル移動する
      if (core.input.up) this.y -= 4;

      // 下ボタンが押されたら、スプライトをy方向に「4」ピクセル移動する
      if (core.input.down) this.y += 4;

    });

  }
  // ゲームスタート
  core.start();
}

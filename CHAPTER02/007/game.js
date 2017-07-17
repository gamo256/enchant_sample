// enchant.js本体やクラスをエクスポートする
enchant();

// ページが読み込まれたときに実行される関数
window.onload = function() {

  // コアオブジェクトを作成する
  core = new Core(320, 320);
  
  // ゲームの初期化処理
  
  // fps（1秒あたりの画面の描画回数）を設定する(省略時は「30」)
  core.fps = 16;

  // ゲームで使用する画像ファイルを指定する
  core.preload('betty.png');

  // ファイルのプリロードが完了したときに実行される関数
  core.onload = function() {

    // ゲームのメイン処理 
  
  }
  // ゲームスタート
  core.start();
}


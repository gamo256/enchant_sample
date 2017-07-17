enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 16;

  // ゲームで使用する画像ファイルを指定する
  core.preload('field.png', 'plants.png', 'box.png', 'pig_walk.png');

  // ファイルのプリロードが完了したときに実行される関数
  core.onload = function() {

    // バックグラウンドのスプライトを作成する
    var bg = new Sprite(320, 320);
    // バックグラウンドの背景色を緑色にする
    bg.backgroundColor = "#2f8136";
    core.rootScene.addChild(bg);

    // ボックス(野菜を収穫する箱)のスプライトを作成する
    var box = new Sprite(224, 42);
    // 画像に「box.png」を設定する
    box.image = core.assets['box.png'];
    box.x = 48;  // x座標
    box.y = 240; // y座標
    core.rootScene.addChild(box);

    // 配列のキー(インデックス)に使う変数の初期化
    var key = 0;
    
    // 畑の画像を表示するスプライトを2行3列で並べる
    for (var j = 0; j < 2; j++) {
      for (var i = 0; i < 3; i++) {
        // 畑の画像を表示するスプライトを作成する
        var f = new Field(i * 96 + 16 , j* 96 + 32);
        // 識別キーに「key」変数の値を代入する
        f.key = key;
        // 配列にスプライトを格納する
        fields[key] = f;
        // 「key」変数をインクリメント
        key ++;
      }
    }

  }
  core.start();
}

var fields = []; // 畑のスプライトを格納する配列

// 畑のスプライトを作成するためのクラス
var Field = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 96, 96);
    // 画像に「field.png」を設定する
    this.image = core.assets['field.png'];
    this.x = x;
    this.y = y;
    this.set = false; // 作物有無フラグ 
    core.rootScene.addChild(this);
  }
});



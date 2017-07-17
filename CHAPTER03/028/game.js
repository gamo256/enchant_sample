enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 16;
  // ゲームで使用する画像ファイルを指定する 
  core.preload('chara1.png', 'map2.png', 'timeup.png');
  // スコアを格納するプロパティを設定する
  core.score = 0;
  // 制限時間を管理するプロパティを設定する
  core.limitTime = 60;
  // 「x」キーに「a」ボタンを割り当てる
  core.keybind(88, 'a');

  core.onload = function() {
  
    // バックグラウンド画像を表示するスプライトを作成する
    bg = new Sprite(640, 320);
    // バックグラウンドの背景色を水色に設定する
    bg.backgroundColor = "#4abafa";
    // バックグラウンドのボタンモードに「a」ボタンを設定する
    bg.buttonMode ='a';

    // サーフィスを作成する
    var image = new Surface(320, 320);
    // 「map2.png」の(0，0)の位置から縦横16ピクセル幅の領域を、
    // そのままのサイズで(0, 192)から(320, 192)の範囲に16ピクセル間隔で20個描画する
    for (var i = 0; i < 20; i++) {
      image.draw(core.assets['map2.png'], 0, 0, 16, 16, i * 16, 16 * 12 , 16, 16);
    }
    // サーフィスをスプライトの画像に設定する
    bg.image = image;

    // バックグラウンドの「enterframe」イベントリスナ
    bg.addEventListener('enterframe', function() {
      // バックグラウンド左方向にスクロールする
      this.x -= 4;
      if (this.x < -320) this.x = 0;
    });

    core.rootScene.addChild(bg);

    // プレイヤーの画像を表示するスプライトを作成する
    player = new Sprite(32, 32);
    // プレイヤーの画像に「chara1.png」を設定する
    player.image = core.assets['chara1.png'];
    player.x = 120;   // x座標
    player.y = 160;   // y座標
    player.frame = 0; // フレーム番号

    // ジャンプフラグ
    player.isJump = false;
    // ジャンプ時の高さ、または下降時のグラビティを設定するプロパティ
    player.vy = 0;

    // プレイヤーの「enterframe」イベントリスナ
    player.addEventListener('enterframe', function(e) {
      // アニメーション表示する処理
      this.frame =core.frame % 3;

      // 「a」ボタンが押されたら
      if (core.input.a) {
        this.vy = -64;      // 「vy」プロパティを「-64」にする
        this.isJump = true; // 「true」でジャンプしたことを表す
      }
      // ジャンプしたなら
      if (this.y < 160) {
        // 「vy」プロパティを「4」、ジャンプフラグを「false」にする
        this.vy = 4;        // gravity
        this.isJump = false;
      }
      // 着地したなら、ジャンプの高さを「0」にする
      if (this.isJump == false && this.y == 160) this.vy = 0
      // y座標に「vy」プロパティを足して、ジャンプ、または下降させる
      this.y += this.vy;
    });
    
    core.rootScene.addChild(player);

    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      // 制限時間が「0」なら
      if (core.limitTime == 0) {
        core.end(null, null, core.assets['timeup.png']);
      }

      // 1秒間隔で実行する処理
      if (core.frame % core.fps == 0) {
        core.score += 10; // スコア加算
        // 制限時間をカウントダウンして更新する
        core.limitTime --;
        timeLabel.text = 'TIME:' + core.limitTime;
        // スコアを更新する
        scoreLabel.score = core.score;
      }

      // 「36」フレーム毎に実行する処理
      if (core.frame % 36 == 0) {
        // ランダムな確率で爆弾を生成する
        if (rand(100) <  50) {
          var obstacle = new Obstacle(384, 176);
        }
      }
    });
    
    // 制限時間(残り時間)をフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var timeLabel = new MutableText(10, 0);
    // 表示する文字列の初期設定
    timeLabel.text = 'TIME:' + core.limitTime;
    core.rootScene.addChild(timeLabel);
    
    // スコアをフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var scoreLabel = new ScoreLabel(160, 0);
    // スコアの初期値
    scoreLabel.score = 0;
    // イージング表示なしに設定する
    scoreLabel.easing = 0;
    core.rootScene.addChild(scoreLabel);
    
  }
  core.start();
}

// 障害物(爆弾)のスプライトを作成するクラス
var Obstacle = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y, mode) {
    // 継承元をコール
    enchant.Sprite.call(this, 16, 16);
    // 画像に「icon0.png」を設定する
    this.image = core.assets['icon0.png'];
    this.x = x;      // x座標
    this.y = y;      // y座標
    this.frame = 24; // フレーム番号
    // 「enterframe」イベントリスナ  
    this.addEventListener('enterframe', function(e) {
      // 爆弾の移動
      this.x -= 4;
      if (this.x < -16) this.remove();
      // このスプライトとプレイヤーの当たり判定
      if (this.within(player, 16)) {
        // 当たったら「スコア- 50点」
        core.score -= 50;
        // 「remove」メソッドを実行して、このスプライトを消す
        this.remove();
      }
    });
    core.rootScene.addChild(this);
  },
  // 「remove」メソッド
  remove: function() {
    // このスプライトをrootSceneから削除する
    core.rootScene.removeChild(this);
    // このスプライトを削除する
    delete this;
  }
});


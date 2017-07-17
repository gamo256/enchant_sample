enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 30;
  // ゲームで使用する画像ファイルを指定する
  core.preload('tomato.png', 'emotion.png', 'timeup.png');
  // スコアを格納するプロパティを設定する
  core.score = 0;
  // 制限時間を管理するプロパティを設定する
  core.limitTime = 60;

  core.onload = function() {

    // バックグラウンドのスプライトを作成する
    var bg = new Sprite(320, 320);
    // バックグラウンドの背景色を水色に設定する
    bg.backgroundColor = "#4abafa";
    core.rootScene.addChild(bg);
    
    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      // スコアを更新する
      scoreLabel.score = core.score;
      // 1秒間隔で実行する処理
      if (core.frame % core.fps == 0) {
        // 制限時間を1秒ずつカウントダウンする
        core.limitTime --;
        timeLabel.text = 'TIME:' + core.limitTime;
        if (core.limitTime == 0) {
          // 制限時間が「0」ならタイムアップの画像を表示して終了
          core.end(null, null, core.assets['timeup.png'])
        }
      }
      // ランダム(「10」か「20」か「30」フレーム毎)にトマトのスプライトを作成する
      if (core.frame % ((rand(3) + 1) * 10) == 0) {
        // 表示位置のxy座標は0~320(32ピクセル刻み)の範囲でランダム
        var tomato = new Tomato(rand(10) * 32, rand(10) * 32);
      }
    });

    // スコアをフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var scoreLabel = new ScoreLabel(160, 0);
    // スコアの初期値
    scoreLabel.score = 0;
    // イージング表示なしに設定する
    scoreLabel.easing = 0;
    core.rootScene.addChild(scoreLabel);

    // 制限時間(残り時間)をフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var timeLabel = new MutableText(10, 0);
    // 表示する文字列の初期設定
    timeLabel.text = 'TIME:' + core.limitTime;
    core.rootScene.addChild(timeLabel);
  }
  core.start();
}

// トマトのスプライトが消滅する秒数を設定する定数
SPPED = 2;

// トマトのスプライトを作成するクラス
var Tomato = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y) {
    // 継承元をコール
    enchant.Sprite.call(this, 32, 32);
    // スプライトの画像に「tomato.png」を設定する
    this.image = core.assets['tomato.png'];
    this.x = x;           // x座標
    this.y = y;           // y座標
    this.frame = rand(3); // フレーム番号
    this.tick = 0;        // 経過秒数
    // 「enterframe」イベントリスナ  
    this.addEventListener('enterframe', function(e) {
      // 1秒間隔で実行する処理
      if (core.frame % core.fps == 0) {
        // 経過秒数をカウントする
        this.tick ++;
        // 2秒経過したなら、「remove」メソッドを実行する
        if (this.tick > SPPED) this.remove();
      }
    });
    // 「touchstart」イベントリスナ
    this.addEventListener('touchstart', function(e) {
      // 赤いトマト(フレーム番号が「2」)にタッチ
      if (this.frame == 2) {
        core.score += 10; // スコア + 10点
        // ウィンクのエモーションを作成する
        var emotion = new Emotion(this.x, this.y);
        emotion.frame = 1;
      }
      // 橙色のトマト(フレーム番号が「1」)にタッチ
      if (this.frame == 1) {
        core.score -= 1; // スコア - 1点
        // 怒り顔エモーションを作成する
        var emotion = new Emotion(this.x, this.y);
        emotion.frame = 3;
      }
      //  緑色のトマト(フレーム番号が「0」)にタッチ
      if (this.frame == 0) {
        core.score -= 10; // スコア - 10点
        // 泣き顔のエモーションを作成する
        var emotion = new Emotion(this.x, this.y);
        emotion.frame = 4;
      }
      // 「remove」メソッドを実行して、このスプライトを削除する
      this.remove();
    });
    // このスプライトをrootSceneに追加する
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

// エモーションのスプライトを作成するクラス
var Emotion = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y) {
    // 継承元をコール
    enchant.Sprite.call(this, 32, 32);
    // スプライトの画像に「emotion.png」を設定する
    this.image = core.assets['emotion.png'];
    this.x = x; // x座標
    this.y = y; // y座標
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function(e) {
      // このスプライトの移動処理
      this.frame <= 2 ? this.y -= 4 : this.y += 4;
      // このスプライトが画面の上下端まで移動したら、「remove」メソッドを実行して削除する
      if (this.y < 0 || this.y > 320) this.remove();
    });
    // このスプライトをrootSceneに追加する
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


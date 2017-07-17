enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 30;

  // スコアを格納するプロパティを設定する
  core.score = 0;
  // 制限時間を管理するプロパティを設定する
  core.limitTime = 60;

  // ゲームで使用する画像ファイルを指定する 
  core.preload('icon1.png', 'bricks.png', 'betty.png', 'timeup.png');

  core.onload = function() {

    // 物理シミュレーションを行うための仮想世界を作成する
    physicsWorld = new PhysicsWorld(0, 9.8);

    // バックグラウンド画像を表示するスプライトを作成する
    var bg = new Sprite(320, 320);
    // バックグラウンドの背景色を白色に設定する
    bg.backgroundColor = "#FFFFFF";
    core.rootScene.addChild(bg);

    // 物理シミュレーション用のスプライトを配置するパターンの定義
    var blockPtn = [
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,3,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,3,-1,-1,-1],
      [-1,-1,-1,-1,-1,3,-1,-1,-1,-1,3,3,3,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,3,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,3,3,-1,-1,-1,3,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,3,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,3,3,-1],
      [-1,-1,-1,3,3,-1,-1,-1,-1,-1,-1,3,3,-1,-1,-1,3,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    // 左右の壁を作成する
    for (var i = 0; i < 20; i++) {
      // 左の壁
      // 壁(静止している四角形の物理シミュレーション用スプライト)を作成する
      var wallLeft = new PhyBoxSprite(16, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.5, true);
      // 画像に「bricks.png」を設定する
      wallLeft.image = core.assets['bricks.png'];
      // 表示するフレームの番号を設定する
      wallLeft.frame = 20;
      // 表示位置(座標)を設定する
      wallLeft.position = { x: 8, y: i*16 + 8 };
      core.rootScene.addChild(wallLeft);
      
      // 右の壁
      var wallRight = new PhyBoxSprite(16, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.5, true);
      wallRight.image = core.assets['bricks.png'];
      wallRight.frame = 20;
      wallRight.position = { x: 320 -8, y: i*16 + 8 };
      core.rootScene.addChild(wallRight);
    }

    // パターン(「blockPtn」配列)に従って、物理シミュレーション用のスプライトを配置する
    for (var i = 0; i < blockPtn.length; i++) {
      for (var j = 0; j < blockPtn[i].length; j++ ) {
        //  パターンの値が「-1」ではないなら
        if (blockPtn[i][j] != -1) {
          // ブロック(静止している四角形の物理シミュレーション用スプライト)を作成する
          var block = new PhyBoxSprite(16, 16, enchant.box2d.STATIC_SPRITE, 1.0, 0.5, 0.8, true);
          // 画像に「bricks.png」を設定する
          block.image = core.assets['bricks.png'];
          // 表示するフレームの番号を設定する
          block.frame = blockPtn[i][j];
          // 表示位置(座標)を設定する
          block.position = { x: j * 16 + 8 , y: i * 16  };
          core.rootScene.addChild(block);
        }
      }
    }

    // ボールを格納する配列を定義する
    var balls = [];

    // プレイヤーを表示するスプライトを作成する
    // 引数は初期位置のxy座標を指定する
    var player = new Player(136, 272);

    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function (e) {
      // 物理シミュレーション内の時間を進める
      physicsWorld.step(core.fps);
      
      // 1秒間隔で実行する処理
      if (core.frame % core.fps == 0) {
 
         // 制限時間をカウントダウンして、表示を更新する
        core.limitTime--;
        timeLabel.text = 'TIME:' + core.limitTime;
 
        // 制限時間が「0」なら、タイプアップ画像を表示してゲーム終了
        if (core.limitTime ==0) core.end(null, null, core.assets['timeup.png']);
        
        // ボールの生成
        
        // ボール(動く円形の物理シミュレーション用スプライト)を作成する
        var ball = new PhyCircleSprite(8, enchant.box2d.DYNAMIC_SPRITE, 1.0, 0.5, 0.5, true);
        // 画像に「icon1.png」を設定する
        ball.image = core.assets['icon1.png'];
        // 表示するフレームの番号をランダム(0~7)に設定する
        ball.frame = rand(8);
        // ボール表示位置を設定する(x座標は乱数で決める)
        ball.position = {x: rand(16) * 16 + 36 , y: 0 };
        // ボールの飛ばす方向を乱数で設定する(1：右、-1：左)
        var sign = rand(2) ? 1 : -1;
        // ボールに瞬発的な力を加える
        ball.applyImpulse(new b2Vec2(Math.random() * sign, 0));
        // ボールを識別するためインデックスキー(経過秒数を使用)を設定する
        ball.key = core.frame / core.fps;
        // ボールを配列に格納する
        balls[ball.key] = ball;
        // rootSceneにボールを追加する 
        core.rootScene.addChild(ball);

        // ボールの「enterframe」イベントリスナ
        ball.addEventListener('enterframe', function() {
          // xまたはy座標が300より大きかったら、ボールを消す
          if (ball > 300) ball.destroy();
        })
       }
       
       // ボールとプレイヤーの当たり判定(ボールのキャッチ)
       
       // ボールの数だけ処理を繰り返す
       for (var i in balls) {
         // プレイヤーとボールの中心点の距離が「24」ピクセルなら
         if (player.within(balls[i], 24)) {
           // そのボールを消す
           balls[i].destroy();
           delete balls[i];
           // スコアを加算して、表示を更新する
           core.score += 100;
           scoreLabel.score = core.score;
         }
       }
    });

    // 制限時間(残り時間)をフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var timeLabel = new MutableText(192, 0);
    // 表示する文字列の初期設定
    timeLabel.text = 'TIME:' + core.limitTime;
    core.rootScene.addChild(timeLabel);

    // スコアをフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var scoreLabel = new ScoreLabel(20, 0);
    // スコアの初期値
    scoreLabel.score = 0;
    // イージング表示なしに設定する
    scoreLabel.easing = 0;
    core.rootScene.addChild(scoreLabel);
    
  }
  core.start();
}

// プレイヤーのスプライトを作成するクラス
var Player = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y) {
    // 継承元をコール
    enchant.Sprite.call(this, 48, 48);
    // 画像に「betty.png」を設定する
    this.image = core.assets['betty.png'];
    this.x = x; // x座標
    this.y = y; // y座標
    // 一回の移動量を設定するプロパティ
    this.speed = 8;
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function(e) {
      
      // プレイヤーの移動処理
      
      // 左ボタンが押され、かつx座標が「0」より大きいなら、左に移動する
      if (core.input.left && this.x > 0 ) {
        this.x -= this.speed;
      }
      // 右ボタンが押され、かつx座標が「320 - このスプライトの幅」より小さいなら、右に移動する
      if (core.input.right && this.x < 320 -this.width) {
        this.x += this.speed;
      }
    });
    // タッチムーブでプレイヤーを横移動する
    this.addEventListener('touchmove', function(e) {
      this.x = e.x;
    });
    core.rootScene.addChild(this);
   }
});

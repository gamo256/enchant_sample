enchant();

window.onload = function () {

  core =new Core(320, 320);
  core.fps = 24;

  // スコアを保持するプロパティ
  core.score = 0;
  // ライフを保持するプロパティ
  core.life = 3;
  // ウェイトのカウンタ
  core.wait = 0;
  // 自機の死亡フラグ(被弾したときに「true」)
  core.death = false;
  // ゲームオーバーフラグ(ゲームオーバー時に「true」)
  core.over = false;

  // ゲームで使用する画像ファイルを読み込む
  core.preload('spritesheet.png', 'bg.png', 'exp.png');

  core.onload = function() {


    // 背景を作成する
    background = new Background();
    
    // 自機を作成する
    player = new Player(144, 138);

    // スコアラベルを作成する
    var scoreLabel = new ScoreLabel(5, 0);
    scoreLabel.score = 0;
    scoreLabel.easing = 0;
    core.rootScene.addChild(scoreLabel);
    
    // ライフラベルを作成する
    var lifeLabel = new LifeLabel(180, 0, 3);
    core.rootScene.addChild(lifeLabel);

    // 敵を格納する配列
    enemies = [];

    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function() {
      
      // スコアを更新する
      scoreLabel.score = core.score;
      // ライフを更新する
      lifeLabel.life = core.life;
      // ゲームオーバーなら終了
      if (core.over) core.end();
      // 被弾したら、一定の間、自機を点滅表示する
      if (core.death == true) {
        core.wait ++;
        player.visible = player.visible ? false : true;
        if (core.wait == core.fps * 5) {
          core.death = false;
          player.visible = true;
          core.wait = 0;
        }
      }
      // 敵の生成処理
      if (rand(100) < 5  && core.death == false) {
        var enemy = new Enemy(rand(320), 0, rand(3));
        enemy.id = core.frame;
        enemies[enemy.id] = enemy;
      }

    });

  }
  core.start();
}

// 自機のスプライトを作成するクラス
var Player = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 32, 32);
    // サーフィスを作成する
    var image = new Surface(128, 32);
    // 「spritesheet.png」の(0, 0)から128x32の領域の画像をサーフィスに描画する
    image.draw(core.assets['spritesheet.png'], 0, 0, 128, 32, 0, 0, 128, 32);
    this.image = image;
    this.frame = 0;
    this.x = x;
    this.y = y;
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      
      // 自機の移動処理
      
      // 左ボタンが押され、かつ自機のx座標が「0」以上なら
      if (core.input.left && this.x >= 0) {
        this.x -= 8;    // 「8」ピクセル左に移動する
        this.frame = 0; // フレーム番号「0」の画像を表示する
      }
      // 右ボタンが押され、かつ自機のx座標が「ゲーム幅-32」以下なら
      if (core.input.right && this.x <= core.width - 32) {
        this.x += 8;    // 「8」ピクセル右に移動する
        this.frame = 0; // フレーム番号「0」の画像を表示する
      }
      // 上ボタンが押され、かつ自機のy座標が「0」以上なら
      if (core.input.up  && this.y >= 0 ) {
        this.y -= 8;    // 「8」ピクセル上に移動する
        this.frame = 1; // フレーム番号「1」の画像を表示する
      }
      // 下ボタンが押され、かつ自機のy座標が「ゲーム高さ-32」以下なら
      if (core.input.down && this.y <= core.height- 32) {
        this.y += 8;    // 「8」ピクセル下に移動する
        this.frame = 2; // フレーム番号「2」の画像を表示する
      }
      
      // 8フレーム毎に弾を発射する
      if (core.frame % 8 == 0) {
        // 自弾を生成する
        var s = new PlayerBullet(this.x + 12, this.y - 8);
      }
        
    });
    core.rootScene.addChild(this);
  }
});

// 背景のスプライトを作成するクラス
var Background = enchant.Class.create(enchant.Sprite, {
  initialize: function() {
    enchant.Sprite.call(this, 320, 640);
    this.x = 0;
    this.y = -320;
    this.frame = 0;
    this.image = core.assets['bg.png'];
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // 背景をy方向にスクロールする
      this.y ++;
      // y座標が「0」以上になったら、y座標を最初の位置「-320」に戻す
      if (this.y >= 0) this.y = -320;
    });
    core.rootScene.addChild(this);
  }
});

// 敵のスプライトを作成するクラス
var Enemy = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, type) {
    enchant.Sprite.call(this, 32, 32);
    this.image = core.assets['spritesheet.png'];
    this.x = x; 
    this.y = y;
    this.vx = 4;      // x方向の移動量
    this.type = type; // 敵の種類を設定するプロパティ

    this.tick = 0;    // フレーム数のカウンタ
    this.angle = 0;   // 弾の発射角度を設定するプロパティ

    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {

      // 敵のタイプに応じて、表示するフレームと移動パターンを設定する
      
      // タイプ「0」
      if (this.type == 0) {
        this.frame = 15 + core.frame % 3;
        this.y += 3;
      }

      // タイプ「1」
      if (this.type == 1) {
        this.frame = 22 + core.frame % 3;
        this.y += 6;
      }

      // タイプ「2」
      if (this.type == 2) {
        this.frame = 25 + core.frame % 4;
        if (this.x < player.x - 64) {
          this.x += this.vx 
        } else if (this.x > player.x + 64) {
          this.x -= this.vx;
        } else {
          this.vx = 0;
          this.y += 8;
        }
      }
      
      // 画面の外に出たら、
      if (this.y > 280 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
        // 消す
        this.remove();
      } else if(this.tick++ % 32 == 0 ) {
      // 画面内にいるなら、「32」フレーム毎に、次の弾を発射する処理を実行する
        if (rand(100) < 50) {
          // 自機と敵の位置から弾の発射角度を求める
          var sx = player.x + player.width / 2 - this.x;
          var sy = player.y + player.height / 2- this.y;
          var angle = Math.atan(sx / sy);
          // 弾を発射する
          var s = new EnamyBullet(this.x + this.width / 2, this.y + this.height / 2 ,angle);
        }
      }
    });
    core.rootScene.addChild(this);
  },
  remove: function() {
    core.rootScene.removeChild(this);
    delete enemies[this.id];
    delete this;
  }
});

// 弾のスプライトを作成するクラス
var Bullet = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, angle) {
    enchant.Sprite.call(this, 8, 8);
    var image = new Surface(32, 32);
    image.draw(core.assets['spritesheet.png'], 32, 64, 32, 32, 0, 0, 32, 32);
    this.image = image;
    this.x = x;
    this.y = y;
    this.angle = angle; // 角度
    this.speed = 10;    // スピード
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // 弾の移動処理
      this.x += this.speed * Math.sin(this.angle);
      this.y += this.speed * Math.cos(this.angle);
      // 画面の外に出たら消去する
      if (this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
        this.remove();
      }
    });
    core.rootScene.addChild(this);
  },
  remove: function() {
    core.rootScene.removeChild(this);
    delete this;
  }
});

// 自弾のスプライトを作成するクラス
var PlayerBullet = enchant.Class.create(Bullet, {
  initialize: function(x, y) {
    Bullet.call(this, x, y, Math.PI);
    this.frame = 10;
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // 敵との当たり判定
      for (var i in enemies) {
        // 敵に当たったら、
        if (enemies[i].intersect(this)) {
        	// 爆発エフェクトを表示する
          var effect = new Explosion(enemies[i].x - enemies[i].width / 2, enemies[i].y - enemies[i].height / 2);
          // 当たった敵を消去する
          enemies[i].remove();
          // スコアを加算する
          core.score += 100;
        }
      }
    });
  }
});

// 敵弾のスプライトを作成するクラス
var EnamyBullet = enchant.Class.create(Bullet, {
  initialize: function(x, y, angle) {
    Bullet.call(this, x, y, angle);
    this.speed = 4; // スピード
    this.frame = 7;
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // 自機との当たり判定
      // 自機に当たったら
      if (player.within(this, 8) && core.death == false) {
        // 爆発エフェクトを表示する
        var effect = new Explosion(player.x - player.width / 2, player.y - player.height / 2);
        core.death = true;
        player.visible = false;
        // ライフを1つ減らす
        core.life--;
        // ライフが「0」ならゲームオーバーフラグを「true」にする
        if (core.life == 0 ) core.over = true;
      }
    });
  }
});


// 爆発エフェクトのスプライトを作成するクラス
var Explosion = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 64, 64);
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.image = core.assets['exp.png'];
    this.tick = 0;      // フレーム数のカウンタ 
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // 爆発エフェクトをアニメーション表示する
      this.frame = this.tick ++;
      if (this.frame == 16) this.remove();
    });
    core.rootScene.addChild(this);
  },
  remove: function() {
    core.rootScene.removeChild(this);
    delete this;
  }
});

enchant();

// 定数
PLAYER_HP = 200;  // プレイヤーのHP
MAX_ENEMIES = 10; // 敵の最大数
MAX_DAMAGE = 2;   // 攻撃ダメージ

window.onload = function() {
  core = new Core(320, 320);
  core.fps = 15;
  core.keybind(88, 'a'); // [x]キーを「a」ボタンを割り当てる
  core.enemies = 0;      // 出現中の敵の数
  core.coin = 0;         // 取得したコインの数
  core.isStart = false;  // ゲーム開始フラグ
  
  // 使用する画像ファイルを読み込む
  core.preload('map1.png', 'chara5.png', 'chara6.png', 'piece.png',
               'start.png', 'end.png','button.png');

  core.onload = function() {

    // マップを作成する
    map = new Map(16, 16);
    map.image = core.assets['map1.png'];
    map.loadData(Field.Bg1, Field.Bg2);
    map.collisionData = Field.CollisionData;

    // 「stage」グループを作成する 
    stage = new Group();
    // 「stage」グループにマップを追加する
    stage.addChild(map);

    // プレイヤーを作成する
    player = new Player(6 * 16 - 8, 10 * 16 - 8);
    
    enemies = []; // 敵を格納する配列 

    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      if (!core.isStart) return; // ゲームが始まってないならリターン
      // 敵を生成する処理
      if (rand(100) < 10 && core.enemies < MAX_ENEMIES ) {
        // 敵を出現させる座標を求める
        var ex = rand(18) * 16 + 16;
        var ey = rand(18) * 16 + 16;
        // 求めた座標のマップ上に当たり判定がなかったら、
        if (!map.hitTest(ex, ey)) {
          // 敵を生成する
          var enemy = new Enemy(ex, ey);
          // 敵の数をインクリメント
          core.enemies ++;
          // 現在のフレーム数をキーに設定する
          enemy.key = core.frame;
          // 敵を配列に格納する
          enemies[enemy.key] = enemy;
        }
      }
    });


    // rootSceneに「stage」グループを追加する
    core.rootScene.addChild(stage);

    // バーチャル「a」ボタンを作成する
    btn = new Button(250, 250, 'a');

    // プレイヤーのHP表示ラベルを作成する
    hpLabel = new MutableText(16, 0);
    hpLabel.text = 'HP:' + PLAYER_HP;
    core.rootScene.addChild(hpLabel);

    // 取得コイン数を表示するラベルを作成する
    coinLabel = new MutableText(192, 0);
    coinLabel.text = 'COIN:' + core.coin;
    core.rootScene.addChild(coinLabel);

    // ゲームスタート画像を表示するスプライト(スタートボタン)を作成する
    startbutton = new Sprite(236, 48);
    startbutton.image = core.assets['start.png'];
    startbutton.x = 42;
    startbutton.y = 136;
    // スタートボタンの「touchstart」イベントリスナ
    startbutton.addEventListener('touchstart', function () {
      startbutton.y = -200; // 見えない位置に移動する
      core.isStart = true;  // ゲーム開始フラグを「true」にする
    });
    core.rootScene.addChild(startbutton);

    // ゲームオーバー画像を表示するスプライトを作成する
    gameover = new Sprite(189, 97);
    gameover.image = core.assets['end.png'];
    gameover.x = 60;
    gameover.y = -100; // 見えない位置に移動する
    core.rootScene.addChild(gameover);    
    
  }
  core.start();
}

// バーチャルボタンのスプライトを作成するクラス
var Button = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, mode) {
    enchant.Sprite.call(this,50,50);
    this.image = core.assets['button.png'];
    this.x = x;
    this.y = y;
    this.buttonMode = mode; // ボタンモード
    core.rootScene.addChild(this);
  }
});

// プレイヤーのスプライトを作成するクラス
var Player = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 32, 32);
    this.image = core.assets['chara5.png'];
    this.x = x;
    this.y = y;
    this.hp = PLAYER_HP;   // HP
    this.isMoving = false; // 移動フラグ(移動中なら「true」)
    this.direction = 0;    // 向き
    // 歩行アニメーションの基準フレーム番号を保持するプロパティ
    this.walk = 0;
    // アクションフラグ(攻撃アクション中なら「true」)
    this.isAction = false;
    // 攻撃アクション中のフレーム数を保持するプロパティ
    this.acount = 0;
    
    // ターゲット(攻撃対象の敵)の識別キーを保持するプロパティ
    this.target = null;
    // ターゲットロックフラグ(「false」でロック解除)
    this.targetlock = true;
    
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // ゲームが始まってないないならリターン
      if (!core.isStart) return;

      // プレイヤーの攻撃/移動処理

      // 攻撃アクション時の処理
      if (this.isAction) {
        if (this.acount< 3) {
          // 攻撃アクションのフレーム切り替え
          this.frame = (this.direction + 2) * 3 + this.acount;
          this.acount++;
          // 敵との当たり判定
          for (var i in enemies) {
            // 攻撃が敵に当たったら
            if (enemies[i].intersect(this)) {
              // コインを生成する
              var coin = new Coin(enemies[i].x, enemies[i].y);
              // 敵を消去する
              enemies[i].remove();
              core.enemies --;
              
              // ターゲットを開放する
              this.target = null;
              
            }
          }
        } else {
          // 攻撃アクションが終了したら、
          // 「acount」プロパティを「0」、「isAction」プロパティを「false」にする
          this.acount = 0;
          this.isAction = false;
        }
      } else {
        // 攻撃アクションでない(移動、停止時)ときの処理

        var len = 400; // 敵までの距離を比較するための基準値
        
        // 敵との当たり判定とターゲットの設定
            
        for (var i in enemies) {
          // 自分とすべての敵の距離をチェックし、一番近い敵をターゲットにする
          var ptoe = calclen(this.x, this.y, enemies[i].x, enemies[i].y)
          if (len > ptoe) {
            this.target = i;
            len = ptoe;
          }
        }
        
        // ターゲットに攻撃可能な距離まで近づいたら、攻撃アクションを行うように設定する
        if (enemies[this.target]) {
          var len = calclen(this.x, this.y, enemies[this.target].x, enemies[this.target].y);
          if (len < 32) {
            this.isAction = true;
            this.isMoving = false;
          }
        }

        // 歩行アニメーションのフレーム切り替え
        this.frame = this.direction * 3 + this.walk;
        // 移動中の処理
        if (this.isMoving) {
          // 「vx」「vy」プロパティの分だけ移動する
          this.moveBy(this.vx, this.vy);
          // 歩行アニメーションの基準フレーム番号を取得する
          this.walk = core.frame % 3;
          // 次のマス(16x16が1マス)まで移動しきったら停止する
          if ((this.vx && (this.x - 8) % 16 == 0) || (this.vy && this.y % 16 == 0)) {
            this.isMoving = false;
            this.walk = 0;
          }
        } else {
          // 移動中でないときの処理
          this.vx = this.vy = 0;
          // ターゲットが存在し、ロックしているなら、そのターゲットを追跡するように向きや移動先を設定する
          if (enemies[this.target] && this.targetlock) {
            if (this.x > enemies[this.target].x) {
              this.direction = 3;
              this.vx = -4;
            } else if (this.x < enemies[this.target].x) {
              this.direction = 6;
              this.vx = 4;
            } else if (this.y > enemies[this.target].y) {
              this.direction = 9;
              this.vy = -4;
            } else if (this.y < enemies[this.target].y) {
              this.direction = 0;
              this.vy = 4;
            }
          } else {
           // ターゲットがいないなら、ランダムに向きや移動先を設定する
            this.mov = rand(4);
            if (this.mov == 1) {
              this.direction = 3;
              this.vx = -4;
            } else if (this.mov == 2) {
              this.direction = 6;
              this.vx = 4;
            } else if (this.mov == 3) {
              this.direction = 9;
              this.vy = -4;
            } else if (this.mov == 0) {
              this.direction = 0;
              this.vy = 4;
            }
          }
               
          if (this.vx || this.vy) {
            // 移動先の座標を求める
            var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
            var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
            // その座標が移動可能な場所なら
            if (0 <= x && x < map.width && 0 <= y && y < map.height && !map.hitTest(x, y)) {
              // 移動フラグを「true」にする
              this.isMoving = true;
              // ターゲットロックフラグを「true」にする
              this.targetlock = true;
              // 自身(「enterframe」イベントリスナ)を呼び出す
              // (歩行アニメーションをスムーズに表示するため)
              arguments.callee.call(this);
            } else {
              // 移動できない場所なら、ターゲットを開放する
              this.target = null;
              this.targetlock = false;
            }
          }
        }
      }
    });
    stage.addChild(this);
  }
});

// 敵のスプライトを作成するクラス
var Enemy = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 32, 32);
    this.image = core.assets['chara6.png'];
    this.x = x;
    this.y = y;
    this.isMoving = false; // 移動フラグ(移動中なら「true」)
    this.direction = 0;    // 向き
    // 歩行アニメーションの基準フレーム番号を保持するプロパティ
    this.walk = 0;
    // 敵の種類を保持するプロパティ
    this.kind = rand(2);
    this.frame = this.kind * 3;
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // ゲームが始まってないないならリターン
      if (!core.isStart) return;
      
      // プレイヤーとの当たり判定
      
      // 当たっていたら     
      if (this.within(player, 16)) {
        // プレイヤーのHPからダメージ量を引く
        player.hp -= MAX_DAMAGE;
        // HPが「0」以下ならゲームオーバー
        if (player.hp <= 0) {
          player.hp = 0;
          // ゲーム開始フラグを「false」にする
          core.isStart = false;
          // ゲーム－オーバー画像を表示する
          gameover.y = 112;
        }
        // HP表示を更新する
        hpLabel.text = "HP:" + player.hp;
      }
        
      // 敵の移動処理
      
      // 歩行アニメーションのフレーム切り替え
      this.frame = (this.direction + this.kind) * 3 + this.walk;
      // 移動中の処理
      if (this.isMoving) {
        this.moveBy(this.vx, this.vy);
        this.walk = core.frame % 3;
        if ((this.vx && (this.x-8) % 16 == 0) || (this.vy && this.y % 16 == 0)) {
          this.isMoving = false;
          this.walk = 0;
        }

      } else {
        // 移動中でないときは、ランダムに移動方向を設定する
        this.vx = this.vy = 0;
        this.mov = rand(4);
        if (this.mov == 1) {
          this.direction = 2;
          this.vx = -4;
        } else if (this.mov == 2) {
          this.direction = 4;
          this.vx = 4;
        } else if (this.mov == 3) {
          this.direction = 6;
          this.vy = -4;
        } else if (this.mov == 0) {
          this.direction = 0;
          this.vy = 4;
        }
        
        // プレイヤーを追跡する処理
        
        // 自身のxy軸線上にプレイヤーいたら、その方向に移動方向設定する
        if (this.x > player.x && this.y == player.y) {
          this.direction = 2;
          this.vx = -4;
        } else if (this.x < player.x && this.y == player.y) {
          this.direction = 4;
          this.vx = 4;
        } else if (this.y > player.y && this.x == player.x) {
          this.direction = 6;
          this.vy = -4;
        } else if (this.y < player.y && this.x == player.x) {
          this.direction = 0;
          this.vy = 4;
        }
        // 移動先が決まったら
        if (this.vx || this.vy) {
          // 移動先の座標を求める
          var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
          var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
          // その座標が移動可能な場所なら
          if (0 <= x && x < map.width && 0 <= y && y < map.height && !map.hitTest(x, y)) {
            // 移動フラグを「true」にする
            this.isMoving = true;
            // 自身(「enterframe」イベントリスナ)を呼び出す
            // (歩行アニメーションをスムーズに表示するため)
            arguments.callee.call(this);
          }
        }
      }
    });
    stage.addChild(this);
  },
  remove: function() {
    stage.removeChild(this);
    delete enemies[this.key];
    delete this;
  }
});

// コインのスプライトを作成するクラス
var Coin = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 32, 32);
    this.image = core.assets['piece.png'];
    this.x = x;
    this.y = y;
    // フレーム数カウンタ
    this.tick = 0;
    // アニメーションのパターン
    this.anime = [8, 9, 10, 11];
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // フレームを切り替えてアニメーション表示する
      if (this.tick <= 8) {
        this.frame = this.tick;
      } else {
        this.frame = this.anime[this.tick % 4];
      }
      this.tick ++;
      
      // プレイヤーとの当たり判定
      
      // 30フレーム経過したら、 コイン入手
      if (this.tick > 30) {
        // コインを加算して、ラベルの表示を更新する
        core.coin ++;
        coinLabel.text = "COIN:" + core.coin;
        // コインを消去
        this.remove();
      }
    });
    stage.addChild(this);
  },
  remove: function() {
    stage.removeChild(this);
    delete this;
  }
});

// 2点間の距離を求める関数
var calclen = function(x0, y0, x1, y1) {
  return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 -y1));
}


// マップデータ
var Field ={
  Bg1:[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,83,84,84,84,84,84,84,84,84,84,84,84],
    [1,1,1,1,1,1,1,1,99,100,116,116,116,116,116,116,116,116,116,116],
    [1,1,1,1,1,16,17,18,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,32,33,34,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,48,49,50,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,20,20,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,16,18,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,48,50,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,99,101,1,1,1,1,1,1,1,1,1,1]
  ],
  Bg2:[
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,23,23,23,23,23,-1,-1,-1],
    [-1,23,23,23,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1],
    [-1,-1,-1,-1,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1],
    [-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
  ],
  CollisionData:[
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ]
};

enchant();

// 定数
PLYER_POS_SX = 50;      // プレイヤーキャラの初期位置のx座標

// プレイヤーキャラのステータス
var playerStatus = {
  maxhp: 1000,  // 最大HP
  hp: 1000,     // 現在HP
  attack: 1,    // 攻撃力
}

// プレイヤーキャラクター(以下キャラ)を作成するクラス
var Player = enchant.Class.create(enchant.avatar.Avatar , {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(code, x, y) {
    // 継承元をコール
    enchant.avatar.Avatar.call(this, code);
    this.scaleX = -1; // x方向の向き(1：右向き、-1：左向き)
    this.scaleY = 1;  // y方向の向き(1：上向き、-1：下向き)
    this.x = x;  // x座標
    this.y = y;  // y座標

    this.vx = 4; // x方向の移動量
    this.hp = playerStatus.hp;         // HP
    this.maxhp = playerStatus.maxhp;   // 最大HP
    this.attack = playerStatus.attack; // 攻撃力

    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
        
      // キャラの攻撃、移動処理
        
      // 右ボタンが押され、かつキャラのx座標が「ゲーム幅-64」より小さいなら
      if (core.input.right && this.x < core.width - 64) {
        // キャラを右向きにする
        this.scaleX = -1;
        // キャラを「run」アクション
        this.action = "run";
        // 右方向に「vx」プロパティの値ずつ移動させる
        this.x += this.vx;
        // バックグラウンドをキャラの動きに合わせてスクロールする
        bg.scroll(this.x);

      // 左ボタンが押され、かつキャラのx座標が「0」より大きいなら
      } else if (core.input.left && this.x > 0) {
        // キャラを左向きにする
        this.scaleX = 1;
        // キャラを「run」アクション
        this.action = "run";
        // 左方向に「vx」プロパティの値ずつ移動させる
        this.x -= this.vx;
        // バックグラウンドをキャラの動きに合わせてスクロールする
        bg.scroll(this.x); 

      // 「a」または「b」ボタンが押されたなら 
      } else if (core.input.a || core.input.b) {
        // 「a」ボタンが押された場合、通常攻撃する
        if (core.input.a) {
          this.action = "attack";
        }
        // 「b」ボタンが押された場合、特殊技で攻撃する
        if (core.input.b) {
            this.action = "special";
        }
      } else {
        // ボタンが何も押されていないなら「stop」状態にする
        this.action = "stop";
      }
    });
  core.rootScene.addChild(this);
  }
});

// バーチャルボタンを作成するクラス
var Button = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y, mode) {
    // 継承元をコール
    enchant.Sprite.call(this, 50, 50);
    // 画像に「button.png」を設定する
    this.image = core.assets['button.png'];
    this.x = x; // x座標
    this.y = y; // y座標
    this.buttonMode = mode; // ボタンモード
    // rootSceneにバーチャルボタンを追加する
    core.rootScene.addChild(this);
  }
});

// モンスターテーブル(JSON)
// このテーブルの順番でモンスターを出現させる
//  image : モンスターの画像ファイル名
//  hp    : モンスターのHP
//  speed : モンスターの移動スピード
//  attack: モンスターの攻撃力
var monstorTable = {
    0: {image: 'monster/monster1.gif', hp:100, speed:1, attack:1},
    1: {image: 'monster/monster2.gif', hp:200, speed:1, attack:2},
    2: {image: 'monster/monster3.gif', hp:300, speed:1, attack:3},
    3: {image: 'monster/monster4.gif', hp:400, speed:1, attack:4},
    4: {image: 'monster/monster5.gif', hp:700, speed:1, attack:5},
    5: {image: 'monster/monster6.gif', hp:800, speed:1, attack:6},
    6: {image: 'monster/monster7.gif', hp:500, speed:1, attack:7},
    7: {image: 'monster/bigmonster1.gif', hp:1500, speed:2, attack:8},
    8: {image: 'monster/bigmonster2.gif', hp:2000, speed:2, attack:10},
}

// モンスターを作成するクラス
var Monster = enchant.Class.create(enchant.avatar.AvatarMonster , {
   // 「initialize」メソッド(コンストラクタ)
  initialize: function(m, x, y) {
    // 継承元をコール
    enchant.avatar.AvatarMonster.call(this, core.assets[m.image]);
    this.x = x;             // x座標
    this.y = y;             // y座標
    this.hp = m.hp;         // HP
    this.speed = m.speed;   // スピード
    this.attack = m.attack; // 攻撃力
    this.death = false;     // 死亡フラグ
    this.vx = -this.speed;  // x方向の移動量
    this.tick = 0;          // フレーム数カウンタ
    this.action = 'appear'  // アクションの設定
    core.rootScene.addChild(this);
  }
});

window.onload = function() {

  core = new Core(320,320);

  // ゲームで使用する画像ファイルを指定する
  core.preload('avatarBg1.png', 'avatarBg2.png', 'avatarBg3.png',
               'monster/monster1.gif', 'monster/monster2.gif',
               'monster/monster3.gif', 'monster/monster4.gif',
               'monster/monster5.gif', 'monster/monster6.gif',
               'monster/monster7.gif', 'monster/bigmonster1.gif',
               'monster/bigmonster2.gif', 
               'button.png');

  // 「x」キーに「a」ボタンを割り当てる
  core.keybind(88, 'a');
  // 「z」キーに「b」ボタンを割り当てる
  core.keybind(90, 'b');
  
  // モンスターの種類を指定するプロパティ
  core.monsterNo = 0;
  // モンスター存在フラグ(存在するなら「true」、しないなら「false」)
  core.monster = false;

  core.onload = function() {

    // rootSceneの背景色を白色にする
    core.rootScene.backgroundColor = "#FFFFFF";
    
    // アバターの背景を作成する
    // 引数には、背景パターンの番号(0~3)を指定する
    bg = new AvatarBG(1);
    bg.y = 50; // y座標
    // rootSceneにアバターの背景を追加する
    core.rootScene.addChild(bg);

    // プレイヤーキャラクターを作成する
    // 引数は、アバターコード、x座標、y座標の順に指定する
    chara = new Player("2:2:1:2004:21230:22480", PLYER_POS_SX, 100);
    
    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function() {

      // モンスターの生成処理
      
      // 画面上にモンスターが存在しないなら
      if (!core.monster) {
          // モンスターを作成する
          // 引数は、モンスターの番号、x座標、y座標の順に指定する
          monster = new Monster(monstorTable[core.monsterNo], 220, 100);
          // モンスター存在フラグを「true」にする
          core.monster = true;
      }

    });
    
    // バーチャルパッドを作成する
    var pad = new Pad();
    pad.x = 0;   // x座標
    pad.y = 220; // y座標
    core.rootScene.addChild(pad);

    // 「a」ボタンと「b」ボタンのバーチャルボタンを作成する
    // 引数は、x座標、y座標、ボタンモードの順に指定する
    abtn = new Button(260, 250, 'a');
    bbtn = new Button(200, 250, 'b');

  }
  core.start();
}

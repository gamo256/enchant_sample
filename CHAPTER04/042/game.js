enchant();

// 定数
PLYER_POS_SX = 50;      // プレイヤーキャラの初期位置のx座標
NOMAL_ATTACK_POWER = 1; // 通常攻撃の攻撃力補正値
SP_ATTACK_POWER = 10;   // 特殊技の攻撃力補正値

SP_UP_DAMAGE = 100;     // SPゲージ1メモリアップに必要なダメージ量 
                        
var sp = 0;    // SPゲージのバーの数を格納する変数
var bars = []; // SPゲージのバーを格納する配列

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
    
    this.hitmes = ''; // モンスターの攻撃をヒットさせときのメッセージを設定するプロパティ
    this.adddmg = 0;  // ダメージの積算量を保持するプロパティ

    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // キャラのアクションが「special」、またはゲームオーバーならリターン
      if (this.action == "special" || core.isOver) return;

      // キャラHP表示用ラベルの表示位置、内容を更新する
      pLabel.x = this.x + 16;
      pLabel.y = this.y - 16;
      pLabel.text = String(this.hp);

      // 画面上にモンスターが存在するときに実行する処理
      if (core.monster) {
        // モンスター用ラベルに空文字を設定する
        mLabel.text = ''; 
        
        // キャラの攻撃、移動処理
        
        // 右ボタンが押され、かつキャラのx座標が「ゲーム幅-64」より小さいなら
        if (core.input.right && this.x < core.width - 64) {
          // キャラを右向きにする
          this.scaleX = -1;
          // キャラを「run」アクション
          this.action = "run";
          // 右方向に「vx」プロパティの値ずつ移動させる
          this.x += this.vx;
          // モンスターは左方向に1ずつ移動させる
          monster.x --;
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
          // モンスターは右方向に1ずつ移動させる
          monster.x ++;
          // バックグラウンドをキャラの動きに合わせてスクロールする
          bg.scroll(this.x); 

        // 「a」または「b」ボタンが押されたなら 
        } else if (core.input.a || core.input.b) {
          // 「a」ボタンが押された場合、通常攻撃する
          if (core.input.a) {
            // 通常攻撃するための各プロパティの設定
            this.action = "attack";
            this.spow = NOMAL_ATTACK_POWER;
            this.hitmes = 'Hit!'
          }
          // 「b」ボタンが押された場合で、特殊技が発動可能(SPが1以上)なら特殊技で攻撃する
          if (core.input.b) {
            if (sp > 0) {
              // 特殊技で攻撃するための各プロパティの設定
              this.action = "special";
              this.spow = SP_ATTACK_POWER;
              this.hitmes = 'SP Hit!'
              // SPゲージのバーを1つ減らす(非表示にする)
              sp --;
              bars[sp].visible = false;
           }
          }
        } else {
          // ボタンが何も押されていないなら「stop」状態にする
          this.action = "stop";
          this.spow = 0;
          this.hitmes = '';
        }
        
        // キャラのHPが「0」以下になったら
        if (this.hp <= 0) {
          // 「dead」状態にする
          this.action = "dead";
          // ゲームオーバーフラグを「true」にする
          core.isOver = true;
        }
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
    // モンスターの「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      // アクションが「attack」「appear」「disappear」のいずれか、またはゲームオーバーならリターン
      if (this.action == "attack" || this.action == "appear" || this.action == "disappear" || core.isOver) return;

      // モンスター用ラベルの表示位置を更新する
      mLabel.x = this.x + 16;
      mLabel.y = this.y - 16;
      
      // モンスターを左方向に「this.vx * this.speed」の値ずつ移動する
      this.x += this.vx * this.speed;
      
      // キャラとモンスターの当たり判定
      
      // キャラとモンスターの中心点の同士の距離が「16」ピクセル以下なら
      if (chara.within(this, 16)) {
        // 「attack」アクション
        this.action ="attack";
        // 移動量に「this.speed * 2」を代入する
        this.vx = this.speed * 2;
        // キャラのHPからモンスターの攻撃力を引く
        chara.hp -= this.attack;
        
        // 一定のダメージで、SPゲージのバーを1つ増やす処理
        
        // ダメージの積算量
        chara.adddmg += this.attack;
        // ダメージの積算量が「SP_UP_DAMAGE」以上なら
        if (chara.adddmg >= SP_UP_DAMAGE) {
          // 「sp」プロパティを「0」にする(初期化)
          chara.adddmg = 0;
          // 「sp」変数が「10」より小さいなら
          if (sp < 10) {
            // SPゲージのバーを1つ表示状態にする
            bars[sp].visible = true;
            // 「sp」変数をインクリメントする
            sp ++;
          }
        }
        
        // キャラのHPが「0」以下になったら、キャラのHPを「0」にする
        if (chara.hp <= 0) chara.hp = 0;
        // キャラHP表示用ラベルを更新する
        pLabel.text = String(chara.hp);
      // でなければ、モンスターを「walk」アクション
      } else this.action = "walk";

      // 「モンスターのx座標 - キャラのx座標」の絶対値が「100」より大きい、
      // または、「モンスターのx座標」が「320 - モンスターの幅」以上なら
      if ((Math.abs(this.x - chara.x) > 100) || (this.x >= 320 - this.width)) {
        // モンスターの「vx」プロパティに左方向に移動させるための値を設定する
        this.vx = -2 * this.speed;
      }
      // モンスターのx座標が「0」以下なら、 x座標を「320」にする
      // (左端までいったら、右から出現し直す)
      if (this.x < 0) this.x = 320;     
    });
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
               'monster/bigmonster2.gif', 'button.png', 'clear.png');

  // 「x」キーに「a」ボタンを割り当てる
  core.keybind(88, 'a');
  // 「z」キーに「b」ボタンを割り当てる
  core.keybind(90, 'b');

  // モンスターの種類を指定するプロパティ
  core.monsterNo = 0;
  // モンスター存在フラグ(存在するなら「true」、しないなら「false」)
  core.monster = false;
  // ゲームオーバーフラグ(ゲームオーバーで「ture」)
  core.isOver = false;

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
      
      // ゲームオーバー
      if (core.isOver && core.frame % core.fps == 0) core.end();
      
      // モンスターの生成処理
      // モンスターは「monstorTable」の0から8の順番で出現させる
      
      // 画面上にモンスターが存在せず、
      if (!core.monster) {
        // 「monsterNo」プロパティが「9」より小さいなら
        if (core.monsterNo < 9 ) {
          // モンスターを作成する
          // 引数は、モンスターの番号、x座標、y座標の順に指定する
          monster = new Monster(monstorTable[core.monsterNo], 220, 100);
          // モンスター存在フラグを「true」にする
          core.monster = true;
        } else {
          // すべて倒したら、クリア画像を表示して終了
          core.end(null, null, core.assets['clear.png']);
        }
        // 「monsterNo」プロパティをインクリメントし、次に出現させるモンスターの番号を設定する 
        core.monsterNo ++;
      } else {
        // 画面上にモンスターが存在するなら
        // 攻撃の当たり判定をチェックする
 
        if (monster.intersect(chara)) {
          // 当たっているなら、モンスター頭上にヒットメッセージを表示する
          mLabel.text = chara.hitmes;
          // モンスターのHPを減らす
          // 「chara.attack」プロパティはキャラの攻撃力
          // 「chara.spow」プロパティは、通常攻撃時は定数「NOMAL_ATTACK_POWER」の値、
          // 特殊技攻撃時は、定数「SP_ATTACK_POWER」の値になる
          monster.hp -= chara.attack * chara.spow;

          // モンスターのHPが「0」以下なら
          if (monster.hp <= 0) {
            mLabel.text = "";
            // モンスターを「disappear」アクション
            monster.action = "disappear";
            // モンスターの死亡フラグを「true」にする
            monster.death = true;
          }
        }
      }
      // モンスターを倒したなら
      if (monster.death) {
        // 80フレーム間待ってモンスターを削除する
        monster.tick ++;
        if (monster.tick == 80) {
          // キャラを初期位置に戻す
          chara.x = PLYER_POS_SX;
          core.rootScene.removeChild(monster);
          core.monster = false;
        }
      }
    });

    // SPゲージ用のバーのスプライトを10個作成する
    for (var i = 0; i < 10; i++) {
      // バーを作成し、 (16, 35)の位置からx方向に10ピクセル間隔で並べる
      var spBar = makeBar(i * 10 + 16 , 35);
      core.rootScene.addChild(spBar);
      // 配列にバーを格納する 
      bars[i]= spBar;
    }

    // バーチャルパッドを作成する
    var pad = new Pad();
    pad.x = 0;   // x座標
    pad.y = 220; // y座標
    core.rootScene.addChild(pad);

    // 「a」ボタンと「b」ボタンのバーチャルボタンを作成する
    // 引数は、x座標、y座標、ボタンモードの順に指定する
    abtn = new Button(260, 250, 'a');
    bbtn = new Button(200, 250, 'b');

    // キャラHP表示用ラベルを作成する
    pLabel = new Label();
    pLabel.color = '#FFFFFF'; // 文字色
    pLabel.x = 0;     // x座標
    pLabel.y = -200;  // y座標
    pLabel.text = ""; // 初期表示する文字列
    core.rootScene.addChild(pLabel);

    // モンスター用ラベルを作成する
    mLabel = new Label();
    mLabel.color = '#FF0000'; // 文字色
    mLabel.x = 0;     // x座標
    mLabel.y = -200;  // y座標
    mLabel.text = ""; // 初期表示する文字列
    core.rootScene.addChild(mLabel);

  }
  core.start();
}

// SPゲージのバーを作成する関数
var makeBar = function(x, y) {
  // バーを表示するスプライトを作成する
  var bar = new Sprite(10, 10);
  // 背景色を赤色に設定する
  bar.backgroundColor = "#FF0000";
  bar.x = x;  // x座標
  bar.y = y;  // y座標
  bar.visible = false; // 可視(true：表示、false：非表示)
  return bar; // 作成したバーを返す
}




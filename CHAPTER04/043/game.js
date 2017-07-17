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
  maxhp: 1000,   // 最大HP
  hp: 1000,      // 現在HP
  attack: 10,    // 攻撃力
  speed: 1       // スピード(変更点1)
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
    
    // 変更点2
    // プロパティ追加
    this.spmode = false;   // spモードフラグ(特殊攻撃時「true」、通常攻撃時「false」)
    this.turn = false;     // ターンフラグ(自分のターンなら「true」)
    this.attacked = false; // 攻撃済みフラグ(攻撃済み「true」、攻撃未「false」)
    this.wait = 200;       // ターンのウェイト
    this.speed = playerStatus.speed; // スピード

    // 「enterframe」イベントリスナ 
    this.addEventListener('enterframe', function() {
      // キャラのアクションが「special」、 またはゲームオーバーならリターン
      if (this.action == "special" || core.isOver) return;
      
      // キャラHP表示用ラベルの表示位置、内容を更新する
      pLabel.x = this.x + 16;
      pLabel.y = this.y - 16;
      pLabel.text = String(this.hp);
      
      // 変更点3
      // 200フレームごとにキャラのターンを回す
      if (core.frame %  (this.wait / this.speed) == 0) {
        this.turn = true;
      }
      
      // キャラにターンが回ってきたら
      if (this.turn) {
        // 「a」ボタンの背景色を赤色にする
        abtn.backgroundColor = "#FF0000";
      } else {
        // キャラのターンでなければ、「a」ボタンの背景色を白色にする
        abtn.backgroundColor = "#FFFFFF";
      }
      
      // 特殊技発動条件(キャラのターンかつSPゲージのバーが1つ以上溜まっている)を満たしているなら
      if (this.turn && sp > 0) {
        // 「b」ボタンの背景色を赤色にする
        bbtn.backgroundColor = "#FF0000";
      } else {
        // 特殊技発動条件を満たしてなければ、「b」ボタンの背景色を白色にする
        bbtn.backgroundColor = "#FFFFFF";
      }
      
      // 攻撃済みなら
      if (this.attacked) {
        // 画面上にモンスターが存在するときに実行する処理
        if (core.monster) {
          // モンスター用ラベルに空文字を設定する
          mLabel.text = '';
          
          // キャラの攻撃、移動処理
          
          // キャラが「run」状態かつ、x座標が「ゲーム幅-64」なら
          if (this.action == "run" && this.x < core.width - 64) {
            // 右方向に「vx」プロパティの値ずつ移動させる
            this.x += this.vx;
            // モンスターは左方向に1ずつ移動させる
            monster.x --;
            // バックグラウンドをキャラの動きに合わせてスクロールする
            bg.scroll(this.x);
            
            // キャラとモンスターの当たり判定
            
            if (this.intersect(monster)) {
              // 特殊攻撃で当たったら、「special」アクション
              // 通常攻撃で当たったら、 「attack」アクション  
              if (this.spmode) {
                this.action = "special";
              } else this.action = "attack";
            }
          } else if (this.action == "stop" && this.x > PLYER_POS_SX) {
            // 攻撃が終了したら、キャラを初期位置に戻す
            this.x = PLYER_POS_SX;
          }
        }
      }
      // キャラのHPが「0」以下になったら
      if (this.hp <= 0) {
       // 「dead」状態にする
       this.action = "dead";
       // ゲームオーバーフラグを「true」にする
       core.isOver = true;
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
    // 画像に「button2.png」を設定する
    this.image = core.assets['button2.png']; // 変更箇所その9
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
  initialize: function(m, x, y) {
    // 「initialize」メソッド(コンストラクタ)
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
    
    // 変更点4
    // プロパティ追加
    this.turn = false; // ターンフラグ(自分のターンなら「true」)
    this.wait = 200;   // ターンのウェイト
    
    // モンスターの「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
       
      // 変更点5
      
      // モンスターのターンを一定間隔で回す
      if (core.frame %  (this.wait /this.speed) == 0) {
        this.turn = true;
        // モンスターのターンなら
        if (this.turn) {
          // キャラに攻撃する
          this.x = chara.x + 36;
          this.action ="attack";
          // 「turn」プロパティを「false」にする
          this.turn = false;
          
          // キャラとモンスターの当たり判定
          
          // 攻撃が当たったなら
          if (chara.intersect(this)) {
            // キャラを「damage」アクション
            chara.action = 'damage';
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
          }
        } 
      } else {
        // 20フレームごとにモンスターの位置(x座標)を初期位置に戻す
        if (core.frame % 20 == 0) this.x = 220;
      }
    });
    core.rootScene.addChild(this);
  }
});

window.onload=function(){

  core = new Core(320,320);

  // ゲームで使用する画像ファイルを指定する
  core.preload('avatarBg1.png', 'avatarBg2.png', 'avatarBg3.png',
               'monster/monster1.gif', 'monster/monster2.gif',
               'monster/monster3.gif', 'monster/monster4.gif',
               'monster/monster5.gif', 'monster/monster6.gif',
               'monster/monster7.gif', 'monster/bigmonster1.gif',
               'monster/bigmonster2.gif', 'button2.png','clear.png');

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

  core.onload=function(){

    // rootSceneの背景色を白色にする
    core.rootScene.backgroundColor = "#FFFFFF";

    // アバターの背景を作成する
    // 引数には、背景パターンの番号(0~3)を指定する
    bg = new AvatarBG(1);
    bg.y= 50; // y座標
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
          // 変更点6
          //  当たっており、キャラの アクションが「attack」または「special」なら
          if (chara.action == "attack" || chara.action == "special") {
            // モンスターのラベルの表示位置の更新
            mLabel.x = monster.x + 16;
            mLabel.y = monster.y - 16;
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

    /* 変更点7
    var pad = new Pad();
    pad.x = 0;
    pad.y = 220;
    core.rootScene.addChild(pad);
    */

    // 「a」ボタンと「b」ボタンのバーチャルボタンを作成する
    // 引数は、x座標、y座標、ボタンモードの順に指定する
    abtn = new Button(260, 250, 'a');
    bbtn = new Button(200, 250, 'b');
    
    // 変更点8
    
    // rootSceneの「abuttondown」イベントリスナ
    core.rootScene.addEventListener('abuttondown', function() {
      // キャラのターンなら、モンスターを通常攻撃する
      if (chara.turn) {
        // 通常攻撃するための各プロパティの設定
        chara.action = "run";
        chara.turn = false;
        chara.attacked = true;
        chara.spmode = false;
        chara.spow = NOMAL_ATTACK_POWER;
        chara.hitmes = 'Hit!'
      }
    });

    // rootSceneの「bbuttondown」イベントリスナ
    core.rootScene.addEventListener('bbuttondown', function() {
      // キャラのターンで特殊技が発動可能(SPが1以上)なら特殊技で攻撃する
      if (chara.turn) {
        chara.turn = false;
        chara.attacked = true;
        if (sp > 0) {
          // 特殊技で攻撃するための各プロパティの設定
          chara.spmode = true;
          chara.action = "run";
          chara.spow = SP_ATTACK_POWER;
          chara.hitmes = 'SP Hit!'
          // SPゲージのバーを1つ減らす(非表示にする)
          sp --;
          bars[sp].visible = false;
        }
      }
    });

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

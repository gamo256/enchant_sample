enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 16;

  // ゲームで使用する画像ファイルを指定する
  core.preload('field.png', 'plants.png', 'box.png', 'pig_walk.png');

  // ファイルのプリロードが完了したときに実行される関数
  core.onload = function() {

    core.lv = 1;    // レベル（LV）
    core.point = 0; // ポイント（VP）
 
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

    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      // ポイントの表示を更新する
      vplabel.text = 'VP:' + core.point;
      // 畑のレベルアップ処理
      if (core.point >= core.lv * LVUP_BASE_RATE && core.lv < 100) {
        core.lv ++;
        var mes = makeMessage('畑レベルアップ!成長スピードアップ!')
          core.rootScene.addChild(mes);
          mes.addEventListener('enterframe', function(e) {
            mes.tl.moveBy(0, -100, 80, enchant.Easing.BOUNCE_EASEOUT).removeFromScene();
        });
      }
      // レベルの表示を更新する
      lvlabel.text = 'LV:' + core.lv;
    });

    // ポイント(VP)を表示するためのラベルを作成する
    var vplabel = new MutableText(176, 8);
    core.rootScene.addChild(vplabel);

    // レベル(LV)を表示するためのラベルを作成する
    var lvlabel = new MutableText(64, 8);
    core.rootScene.addChild(lvlabel);

  }
  core.start();
}

// メッセージを表示するラベルを作成する関数
var makeMessage = function(text) {
    var label = new Label(text);
    label.font  = "16px monospace";
    label.color = "rgb(255, 255, 255)";
    label.backgroundColor = "rgba(0, 0, 0, 0.5)";
    label.x     = 20;
    label.y     = 200;
    label.width = 280;
    return label;
}

var fields = [];    // 畑のスプライトを格納する配列
var plantNo = [];   // 各畑の作物の種類を格納する配列
var plantGrow = []; // 各畑の作物の成長度を格納する配列
var plantTick = []; // 各畑の作物が植えられてからの秒数を格納する配列

var GROWTH_RATE = 30;      // 成長率(デフォルト30)
var BASE_POINT = 10;       // 基準ポイント(デフォルト10)
var LVUP_BASE_RATE = 1000; // レベルアップレート(デフォルト1000)


// 畑のスプライトを作成するためのクラス
var Field = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 96, 96);
    // 画像に「field.png」を設定する
    this.image = core.assets['field.png'];
    this.x = x;
    this.y = y;
    this.set = false; // 作物有無フラグ 
    // 「touchstart」イベントリスナ
    this.addEventListener('touchstart', function(e) {
      
      // 畑に作付けする処理
      
      // 作付されていないなら
      if (this.set == false) {
        // 作物のスプライトを作成する
        var p = new Plant(this.x + 32, this.y - 12, this.key);
        // 作付されている状態にする
        this.set = true;
        // 作物の種類を配列に格納する
        plantNo[this.key] = p.no;
      }
    });
    core.rootScene.addChild(this);
  }
});

// 作物のスプライトを作成するクラス
var Plant = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, field_no) {
    enchant.Sprite.call(this, 32, 64);
    // 画像に「plants.png」を設定する
    this.image = core.assets['plants.png'];
    this.x = x;
    this.y = y;
    this.no = rand(7);    // 作物の種類(乱数で設定)
    this.frame = this.no;
    this.grow = 0;        // 成長度
    this.tick = 0;        // 経過秒数
    // 1段階成長するのにかかる秒数
    this.rate = Math.ceil(GROWTH_RATE / core.lv);

    // 収穫した際に獲得できるポイント
    this.point = (this.no + 1) * BASE_POINT;

    // 「touchstart」イベントリスナ
    this.addEventListener('touchstart', TouchPlant);
    // 「touchend」イベントリスナ
    this.addEventListener('touchend', TouchPlant);

    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function(e) {

      // 作物の成長処理
      
      // 1秒間隔で実行される処理
      if (core.frame % core.fps == 0) {
        this.tick ++; // 秒数をカウント
        
        // 1段階成長した
        if (this.tick % this.rate == 0) {
          // 成長度が「3」より小さいなら
          if (this.grow < 3) {
            // 成長度をインクリメント
            this.grow ++;
            // 成長度に応じたフレームの画像を表示する
            this.frame = this.no + this.grow * 9;
          }
          // 収穫済みの状態なら
          if (this.grow == 4) {
            // 畑を作物なしの状態にする
            fields[field_no].set = false;
            // 成長度を「null」にする
            this.grow = null; 
            // 作物を削除する
            this.remove();
          }
        }
        // 経過秒数と成長度を配列に格納する
        plantTick[field_no] = this.tick;
        plantGrow[field_no] = this.grow;
      }
    });
    core.rootScene.addChild(this);
  },
  remove: function() {
    core.rootScene.removeChild(this);
    delete this;
  }
});

// 作物の「touchstart」「touchend」イベントのリスナ
var TouchPlant = function(e) {
  // 作物が実っているなら
  if (this.grow == 3) {
    // 収穫済みの画像のフレーム番号をセットする
    this.frame = this.no + 36;
    // 成長度を「4」(収穫済み)にする
    this.grow = 4;
    // 野菜のスプライトを作成する
    var v = new Vegetable(this.x, this.y , this.no);
    // ポイントを加算する
    core.point += this.point;
  }
}

// 野菜のスプライトを作成するクラス
var Vegetable = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y, no) {
    enchant.Sprite.call(this, 32, 64);
    // 画像に「plants.png」を設定する
    this.image = core.assets['plants.png'];
    this.x = x;
    this.y = y;
    this.frame = no + 45;
    this.my = 196 - this.y; // y方向に移動させる距離
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function(e) {
      // ボックスのある位置にタイムラインのアニメーション(イージング)で移動し、タイムラインから削除する
      this.tl.moveBy(0, this.my, 50, enchant.Easing.BOUNCE_EASEOUT).removeFromScene();
    });
    core.rootScene.addChild(this);
  },
  remove: function() {
    core.rootScene.removeChild(this);
    delete this;
  }
});

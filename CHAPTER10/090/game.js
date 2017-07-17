enchant();

 // コンストラクタ
function interpreter() {
  // プロパティ
  this.images = 背景画像;
  this.charas = 登場人物;
  this.bg = null;         // バックグラウンド
  this.chara =[];         // キャラ
  this.name = null;       // 名前
  this.text = null;       // テキスト
  this.next = null;       // 次のシーン名
};

// 背景画像を表示するコマンド(メソッド)
// '背景画像': ['画像名', 幅, 高さ, , x座標(オプション), y座標(オプション)]
interpreter.prototype.背景画像 = function(args) {
  var bg = new Sprite(args[1], args[2]);
  bg.image = core.assets[this.images[args[0]]];
  bg.x = args[3] ? args[3] : 0;
  bg.y = args[4] ? args[4] : 0;
  imageLayer.addChild(bg);
  this.bg = bg;
}

// キャラ(1人目)を表示するコマンド(メソッド)
// 'キャラ1': ['人物画像名', 幅, 高さ, x座標(オプション), y座標（オプション）]
interpreter.prototype.キャラ1 = function(args) {
  var chara = new Sprite(args[1], args[2]);
  chara.image = core.assets[this.charas[args[0]]];
  chara.x = args[3] ? args[3] : 0;
  chara.y = args[4] ? args[4] : 0;
  imageLayer.addChild(chara);
  this.chara[args[0]] = chara;
}

// キャラ(2人目)を表示するコマンド(メソッド)
// 'キャラ2': ['人物画像名', 幅, 高さ, x座標(オプション), y座標（オプション）]
interpreter.prototype.キャラ2 = function(args) {
  var chara = new Sprite(args[1], args[2]);
  chara.image = core.assets[this.charas[args[0]]];
  chara.x = args[3] ? args[3] : 0;
  chara.y = args[4] ? args[4] : 0;
  imageLayer.addChild(chara);
  this.chara[args[0]] = chara;
}

// キャラのポジションを変更するコマンド(メソッド)
// 'ポジション': ['人物画像名', x座標, y座標]
interpreter.prototype.ポジション = function(args) {
  this.chara[args[0]].x = args[1];
  this.chara[args[0]].y = args[2];
}

// キャラをズームするコマンド(メソッド)
// 'ズーム': ['人物画像名', x方向の拡大率, y方向の拡大率(オプション)]
// y方向の拡大率を省略すると縦横同じ比率で拡大縮小
// 負の数を指定すると反転
interpreter.prototype.ズーム = function(args) {
  this.chara[args[0]].scaleX = args[1];
  this.chara[args[0]].scaleY = args[2] ? args[2] : args[1];
}

// キャラを回転するコマンド(メソッド)
// '回転': ['人物画像名', 角度]
interpreter.prototype.回転 = function(args) {
  this.chara[args[0]].rotation = args[1];
}

// セリフを表示するコマンド(メソッド)
// 'セリフ': ['名前ラベル', 'テキスト']
interpreter.prototype.セリフ = function(args) {
  if (args[0]==undefined) args[0] = "";
  if (args[1]==undefined) args[1] = "";
  var name = new Label(args[0]);
  name.font = "16px monospace";
  name.color = "rgb(255, 255, 255)";
  name.backgroundColor = "rgba(0, 0, 0, 0.6)";
  name.y = 320 - 32 * 3;
  name.width = 320;
  name.height = 32 * 3;
  textLayer.addChild(name);
  this.name = name;

  var text = new Label(args[1]);
  text.font  = "16px monospace";
  text.color = "rgb(255, 255, 255)";
  text.y     = 320 - 32 * 2;
  text.width = 320;
  textLayer.addChild(text);
  this.text = text;
}

// セリフをクリアするコマンド(メソッド)
// 'セリフクリア': null
interpreter.prototype.セリフクリア = function() {
  textLayer.removeChild(this.name);
  textLayer.removeChild(this.text);
  textLayer.removeChild(this.next);
  delete this.name;
  delete this.text;
  delete this.next;
}

// 指定したシーンにジャンプするコマンド(メソッド)
// 'ジャンプ': 'シーン名'
interpreter.prototype.ジャンプ = function(args) {
  var self = this;
  var next = new Label('【次へ】');
  next.font  = "16px monospace";
  next.color = "rgb(255,200,0)";
  next.x     = 320 - 64;
  next.y     = 320 - 32;
  next.width = 320;

  textLayer.addChild(next);
  this.next = next;
  next.addEventListener(Event.TOUCH_START, function(e) {
      self.セリフクリア();
      exec(eval(args));
  });
}

// 自動的に指定したシーンにジャンプさせるコマンド(メソッド)
// 'オートジャンプ': 'シーン名'
interpreter.prototype.オートジャンプ = function(arg) {
  exec(eval(arg));
}



// シナリオを実行する関数
function exec(scenario) {
  for (var command in scenario) {
    var s = (interpreter[command])(scenario[command]);
  }
}


window.onload = function() {

  // 使用する画像を格納する配列
  images = Array();
  
  // 使用する背景画像を配列にプッシュ
  for (var key in 背景画像) {
    images.push(背景画像[key]);
  }
  // 使用する人物画像を配列にプッシュ
  for (var key in 登場人物) {
    images.push(登場人物[key]);
  }

  // 「interpreter」オブジェクトを生成する
  interpreter = new interpreter();

  core = new Core(320, 320);
  core.fps = 16;
  core.preload(images);


  core.onload = function() {


    // 画像表示用のグループを作成する
    imageLayer = new Group();
    core.rootScene.addChild(imageLayer);

    // テキスト表示用のグループを作成する
    textLayer = new Group();
    core.rootScene.addChild(textLayer);
    
    // 「start」からを実行する
    exec(eval('start'));
 
  }

  core.start();

}
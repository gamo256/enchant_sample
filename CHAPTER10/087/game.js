enchant();

 // コンストラクタ
function interpreter() {
  // プロパティ
  this.images = 背景画像;
  this.charas = 登場人物;
  this.bg = null;         // バックグラウンド
  this.chara =[];         // キャラ
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
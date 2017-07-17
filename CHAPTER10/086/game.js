enchant();

 // コンストラクタ
function interpreter() {
  // プロパティ
  this.images = 背景画像;
  this.charas = 登場人物;
};

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
enchant();

// ページが読み込まれたときに実行される関数
window.onload = function() {
 
  core = new Core(320, 320);
  core.fps = 16;
 
  // ゲームで使用する画像ファイルを指定する
  core.preload('bg/prairie.png', 'bg/wood.png', 'bg/woods.png', 'Chat.png');

  core.onload = function() {

    // 1ページ目
    
    // ページデータ(ページの中身を設定するためのJSON形式のデータ)
    var data = {
      bgImage: 'bg/wood.png', // 背景画像 
      nextFunc: 'core.page2',   // 次のページを作成する関数名
      pageNo: 1,                // ページ番号
      textX: 80,                // テキスト表示位置のx座標
      textY: 120,               // テキスト表示位置のy座標
      textColor: '#FFFFFF',     // テキストの文字色
      text: {                   // 表示するテキスト
        1: 'ここはどこだろう？',                   // 1行目
        2: 'どうやら道にまよってしまったようだ。'  // 2行目
      }
    }
    
    // 「makeScene」関数を実行して、ページ(シーン)を作成する
    // 第1引数にデータ、1ページ目を作成する場合は第2引数に「true」を渡す
    var scene = makeScene(data, true);

  }

  // 2ページ目を作成する関数
  core.page2 = function() {

    // 2ページ目
    
    // ページデータ
    var data = {
      bgImage:'bg/woods.png',
      nextFunc: 'core.page3',
      pageNo: 2,
      textX: 20,
      textY: 10,
      textColor: '#FFFFFF',
      text: {
        1: 'あてもなく先に進むと',
        2: 'さらに深い森の中に・・・。',
        3: 'ぼくは そこで不思議なウサギに出会った。'
      }
    }

    // 「makeScene」関数を実行して、ページ(シーン)を作成する
    var scene = makeScene(data);
    
    // ページ(シーン)にキャラを追加する
    
    // キャラのスプライトを作成する(サイズ128x128)
    var chara = new Sprite(128, 128);
    // 画像に「Chat.png」を設定する
    chara.image = core.assets['Chat.png'];
    chara.x = 100; // x座標 
    chara.y = 100; // y座標
    // シーンにキャラを追加する
    scene.addChild(chara);
    
    // 作成したページ(シーン)を返す
    return scene;
  }

  // 3ページ目を作成する関数
  core.page3 = function() {

    // 3ページ目
    
    // ページデータ
    var data = {
      bgImage: 'bg/prairie.png',
      pageNo: 3,
      textX: 80,
      textY: 120,
      textColor: '#FFFFFF',
      text: {
        1: '彼(ウサギ)についていくと・・',
        2: 'そこは----------',
      }
    }
    
    // 「makeScene」関数を実行して、ページ(シーン)を作成する
    var scene = makeScene(data);
    // 作成したページ(シーン)を返す
    return scene;
  }
  core.start();
}

// ページ(シーン)を作成するための関数
// 第1引数： ページ(シーン)のデータ(JSON)
// 第2引数： rootSceneを作成する場合に「true」を指定する
var makeScene = function(data, isRoot) {
  // シーンを格納する変数
  var scene;
  // rootSceneなら
  if (isRoot) {
    // 「scene」変数にルートシーンを設定する
    scene  = core.rootScene;
  // rootSceneでないなら、新しいシーンを作成する 
  } else scene = new Scene();
  
  // バックグラウンドに画像を画面に表示する処理
  
  // バックグラウンドを作成する
  // 引数に画像ファイル名を指定する
  var bg = new Background(data.bgImage);
  // バックグラウンドをシーンに追加する
  scene.addChild(bg);
  
  // テキストを画面に表示する処理
  
  // データに含まれるテキスト行だけ処理を繰り返す
  for (var i in data.text) {
    // テキストのラベルを作成する
    // 引数には、テキスト、x座標、y座標、文字色の順に指定する
    var putText = new makeText(data.text[i], data.textX, data.textY + i* 16, '#FFFFFF');
    // テキストのラベルをシーンに追加する
    scene.addChild(putText);
  }
  
  // ページ番号を画面に表示する処理
  
  // ページ番号のラベルを作成する
  var pageNo = new makeText(String(data.pageNo), 160, 300, '#FFFFFF');
  // ページ番号のラベルをシーンに追加する
  scene.addChild(pageNo);
  
  var func = data.nextFunc;
  
  // 「rightbuttondown」イベントリスナ
  scene.addEventListener('rightbuttondown', function(e) {
    // 右ボタンが押され、かつ「func」引数が「null」でないなら次のページ(シーン)に進む
    if (func != null) core.pushScene(eval(func)());
  });
  // 「leftbuttondown」イベントリスナ
  scene.addEventListener('leftbuttondown', function(e) {
    // 左ボタンが押されたなら、前のページ(シーン)に戻る
    core.popScene();
  });

  // 「touchstart」イベントリスナ
  scene.addEventListener('touchstart', function(e) {
    // タッチ開始した場所のx座標を「sx」プロパティに取得する
    this.sx = e.x;
  });
  
  // 「touchend」イベントリスナ
  scene.addEventListener('touchend', function(e) {
    // 右方向にフリックされ、かつ「func」引数(次のページを作成する関数名)が
    // 「null」でないなら、次のページ(シーン)に進む
    if (this.sx < e.x && func != null) core.pushScene(eval(func)());
    // 左方向にフリックされたなら、 前のページ(シーン)に戻る
    if (this.sx > e.x) core.popScene();
  });

  // バーチャルパッドを画面に表示する処理

  // 「makePad」関数を実行して、パッドを追加する
  makePad(scene);
  
  // 作成したシーンを返す
  return scene;
}

// テキストのラベルを作成するクラス
var makeText = enchant.Class.create(enchant.Label, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(text, x, y, color) {
    // 継承元をコール
    enchant.Label.call(this, text);
    this.x = x; // x座標
    this.y = y; // y座標
    this.color = color; // 文字色
    // フォントサイズとフォントの種類を指定する
    this.font ='14px sens-serif';
  }
});

// バーチャルパッドをシーンに追加する関数
var makePad = function(scene) {
  // バーチャルパッドを作成する
  var pad = new Pad();
  pad.x = 220; // x座標
  pad.y = 220; // y座標
  // シーンにバーチャルパッドを追加する
  scene.addChild(pad);
}

// バックグラウンドのスプライトを作成する関数
var Background = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(image) {
    // 継承元をコール
    enchant.Sprite.call(this, 320, 320);
    // 画像に 引数「image」を設定する
    this.image = core.assets[image];
  } 
});

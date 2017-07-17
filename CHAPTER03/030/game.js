enchant();

// パズルの問題を定義したJSONオブジェクト
// 「0」はスイッチオフ(消灯)、「1」はスイッチオン(点灯)を表す
var Questions =
  {
    0: [[0, 1, 0], [0, 1, 0], [0, 1, 0]],  // 1問目
    1: [[1, 0, 0], [0, 1, 1], [0, 1, 1]],  // 2問目
    2: [[0, 1, 1], [1, 0, 1], [1, 1, 0]],  // 3問目
    3: [[0, 1, 0], [1, 0, 1], [0, 1, 0]],  // 4問目
    4: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],  // 5問目
  }

window.onload = function() {

  core = new Core(160, 160);
  core.preload('Switch01.png', 'clear.png');

  // スイッチを押した数をカウントするプロパティ
  core.count = 0;
  // 何問目を出題するかを指定するプロパティ
  core.cursor = 0;
  // 「questions」プロパティに問題の総数を代入する
  for(core.questions in Questions);
  // スイッチの数を保持するプロパティ
  core.switches = 0;

  core.onload = function() {

    // バックグラウンド画像を表示するスプライトを作成する
    var bg = new Sprite(160, 160);
    // バックグラウンドの背景色を黒色に設定する
    bg.backgroundColor = "#000000";
    core.rootScene.addChild(bg);
    
    // 「puzzle」グループを作成する 
    puzzle = Group();
    // rootSceneにpuzzle」グループを追加する
    core.rootScene.addChild(puzzle);
    
    // スイッチのスプライトを格納する配列を定義する
    switches = [];
    // パズルを作成する関数を実行する(引数には何問目かを指定)
    makePuzzle(core.cursor);
    
    // rootSceneの「enterframe」ベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      
      // すべてのスイッチが点灯しているかどうかを確認する処理

      // スイッチのカウンタ(点灯しているスイッチの数を格納する変数)をクリア
      var check = 0;
      // すべてのスイッチの点灯状態をチェックする
      for (var i in switches) {
        // 点灯しているなら、カウンタをインクリメントする
        if (switches[i].isON == true) check++;
      }
      // スイッチが全点灯なら
      if (check == core.switches) {
        // クリア画像のスプライトを表示する
        clear.x = 14;
        clear.y = 68;
      }
    });
    
    // クリア画像を表示するスプライトを作成する
    var clear = new Sprite(132, 24);
    // サーフィスを作成する
    var image = new Surface(132, 24);
    // 「clear.png」の横幅を132ピクセル、高さを24ピクセルに縮小する
    image.draw(core.assets['clear.png'], 0, 0, 267, 48, 0, 0, 132, 24);
    // クリア画像にサーフィスの画像を設定する
    clear.image = image;
    // クリア画像を画面外の見えない位置に移動する
    clear.y = -68;

    // クリア画像の「touchstart」イベントリスナ
    clear.addEventListener('touchstart', function(e) {
      // 現在の問題をクリア
      for (var i in switches) {
        puzzle.removeChild(switches[i]);
        delete switches[i];
      }
      
      // 次の問題を表示する処理
      
      // クリア画像を画面外の見えない位置に移動する
      clear.y = -68;
      // 「cursor」プロパティをインクリメントする
      core.cursor ++;
      // 次の問題があるなら
      if (core.cursor <= core.questions) {
        // 次の問題の番号を表示する
        info.text = 'QUESTION ' + (core.cursor + 1);
        // 次の問題を作成して表示する
        makePuzzle(core.cursor);
      } else {
        // 次の問題がないなら、 スコアを計算して表示する
        var score = 500 - core.count * 10;
        info.text = 'SCORE:' + score;
      }
    });
    core.rootScene.addChild(clear);
    
    // 問題番号とスコアをフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var info = new MutableText(0, 0);
    // 表示する文字列の初期設定
    info.text = 'QUESTION ' + (core.cursor + 1);
    core.rootScene.addChild(info);

  }
  core.start();
}

// パズルを作成する関数
// 引数には、問題の番号を指定する
var makePuzzle = function(no) {
  var count = 0;
  // 行列の数だけ処理を繰り返し、スイッチを画面上に並べる
  var f = Questions[no].length;
  for (var j = 0; j < f ; j++) {
    var c =  Questions[no][j].length;
    for (var i = 0; i < c ; i++) {
      // スイッチのスプライトを作成する
      var sw = new Switch(i*32+32, j*32+32);
      // 「Questions」の配列データの内容に従って、スイッチの状態を設定する
      // 「0」はスイッチオフ(消灯)、「1」はスイッチオン(点灯)を表す
      sw.isON = Questions[no][j][i];
      // 表示するスプライトのフレーム番号(オフ：3、オン：0)を設定する
      sw.mode = sw.isON ? 0 : 3;
      sw.frame = sw.mode;
      // スイッチを配列に格納する
      switches[[i, j]] = sw;
      sw.row = i; // 行番号
      sw.column = j;  // 列番号
      // スイッチの数をカウント
      count ++;
    }
  }
  // スイッチの数を保持
  core.switches = count;
}

// スイッチのスプライトを作成するクラス
var Switch = enchant.Class.create(enchant.Sprite, {
  // 「initialize」メソッド(コンストラクタ)
  initialize: function(x, y) {
    // 継承元をコール
    enchant.Sprite.call(this, 32, 32);
    this.x = x; // x座標
    this.y = y; // y座標
    // 画像に「Switch01.png」を設定する
    this.image = core.assets['Switch01.png'];
    // アニメーションのパターンを設定する
    this.animePat =[0, 4, 8, 12 , 8, 4, 0];
    // タッチ状態を管理するフラグ
    this.touch = false;
    // フレーム数をカウントするプロパティ
    this.tick = 0;
    
    // 「touchstart」イベントリスナ
    this.addEventListener('touchstart', function() {
      
      // スイッチを押した回数をカウントする
      core.count ++;
      // 「touch」プロパティを「true」にする
      this.touch = true;

      // スイッチの状態を反転する
      this.isON = !this.isON;
      this.mode = this.isON ? 0 : 3;
      this.frame = this.mode;

      // 押したスイッチの上下左右のスイッチの状態も反転する処理
      var r = this.row;
      var c = this.column;
      // 左右上下の順にスイッチの位置を一時配列(バッファ)に格納
      var keys = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      // 「keys」配列の要素数(4)だけ処理を繰り返す
      for (var i in keys) {
        // スイッチのオブジェクト(スプライト)を一時変数に代入する
        var sw = switches[keys[i]];
        // 「sw」変数が空で無いなら、
        if (sw) {
          // スイッチの状態を反転する
          sw.isON = !sw.isON;
          sw.mode = sw.isON ? 0 : 3;
          sw.frame = sw.mode;
        }
      }
    });
    
    // 「enterframe」イベントリスナ
    this.addEventListener('enterframe', function() {
      
      // スイッチをアニメーション表示する処理
      
      // スイッチが押されたらアニメーション開始
      if (this.touch && this.tick < 7)  {
        // フレーム番号を切り替えて、アニメーション表示する
        this.frame = this.animePat[this.tick % 8] + this.mode;
        this.tick ++;
      } else {
        // アニメーション終了時の処理
        this.tick = 0;
        this.touch = false;
      }
    });
    puzzle.addChild(this);
  }
});

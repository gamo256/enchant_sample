enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 16;
  // ゲームで使用する画像ファイルを読み込む
  core.preload('chara0.png', 'map2.png', 'clear.png');

  core.onload = function() {

    // バックグラウンドのスプライトを作成する
    var bg = new Sprite(320, 320);
    bg.backgroundColor = "#4abafa";
    // サーフィスを作成する
    var image = new Surface(320, 320);
    // 「map2.png」の(0，0)の位置から縦横16ピクセル幅の領域を、
    // そのままのサイズで(0, 192)から(320, 192)の範囲に16ピクセル間隔で20個描画する
    for (var i = 0; i < 20; i++) {
      image.draw(core.assets['map2.png'], 0, 0, 16, 16, 16 * i, 16 * 12 , 16, 16);
    }
    // サーフィスをスプライトの画像に設定する
    bg.image = image;
    // バックグラウンドの「touchstart」イベントリスナ
    bg.addEventListener('touchstart', function(e) {
      // プレイヤーの移動フラグを「true」にする
      player.moving = true;
    });
    // バックグラウンドの「touchend」イベントリスナ
    bg.addEventListener('touchend', function(e) {
      // プレイヤーの移動フラグを「false」にする
      player.moving = false;
    });
    core.rootScene.addChild(bg);
    
    // プレイヤーのスプライトを作成する
    var player = new Sprite(32, 32);
    // サーフィスを作成する
    var image = new Surface(96, 128);
    // 「chara0.png」の(0, 0)の位置から幅96ピクセル、高さ128ピクセルの領域を、
    // (0, 0)の位置に幅96ピクセル、高さ128ピクセルで描画する
    image.draw(core.assets['chara0.png'], 0, 0, 96, 128, 0, 0, 96, 128);
    // サーフィスをスプライトの画像に設定する 
    player.image = image;
    // その他のプロパティの初期設定
    player.x = 16;         // x座標
    player.y = 16 * 10;    // y座標
    player.frame = 7;      // スプライトのフレーム番号
    player.vx = 2;         // 1フレームあたりの移動量
    player.moving = false; // 移動フラグ      
    // プレイヤーの「enterframe」イベントリスナ 
    player.addEventListener('enterframe', function(e) {
      // プレイヤーを移動させる処理
      // 移動フラグが「true」なら
      if (this.moving) {
        // 「vx」プロパティの値ずつ移動させる
        this.x += this.vx;
        // 移動中は、フレーム番号を「6」「7」「8」と順に切り替えてアニメーションする
        this.frame = core.frame % 3 + 6;
        // NPCが振り向いた(NPCのフレーム番号が「4」)なら
        if (npc.frame == 4) {
          // プレイヤーを最初の場所に戻す
          this.x = 16;
          this.frame = 7;
        }
      }
      // ゲームクリア処理
      if (this.within(npc, 16)) {
        // プレイヤーとNPCの当たり判定を行い、プレイヤーとNPCのスプライトの中心距離が16ピクセル以下なら
        // ゲームクリアの画像を表示して終了
        core.end(null, null, core.assets['clear.png']);
      }
    });
    // プレイヤーのスプライトをrootSceneに追加して、スプライトを表示する
    core.rootScene.addChild(player);

    // NPC(Non Player Character)のスプライトを作成する
    var npc = new Sprite(32, 32);
    // サーフィスを作成する
    var image = new Surface(96, 128);
    // 「chara0.png」の(192, 0)の位置から幅96ピクセル、高さ128ピクセルの領域を、
    // (0, 0)の位置に幅96ピクセル、高さ128ピクセルで描画する
    image.draw(core.assets['chara0.png'], 192, 0, 96, 128, 0, 0, 96, 128);
    // サーフィスをスプライトの画像に設定する 
    npc.image = image;
    // その他のプロパティの初期設定
    npc.x = core.width - 64; // x座標
    npc.y = 16 * 10;         // y座標
    npc.frame = 7;           // フレーム番号
    // NPCの「enterframe」イベントリスナ 
    npc.addEventListener('enterframe', function(e) {
      // 「0」から「499の乱数を生成し、その値が10以下なら、
      // NPCの向きを切り替える(フレーム番号を「7」から「4」、または「4」から「7」に切り替える)
      if (rand(500) < 10 ) this.frame = this.frame == 7 ? 4 : 7;
    });
    core.rootScene.addChild(npc);

    // 経過時間を表示するラベルを作成する
    var timeLabel = new TimeLabel(160, 0);
    core.rootScene.addChild(timeLabel);
    
  }
  core.start();
}

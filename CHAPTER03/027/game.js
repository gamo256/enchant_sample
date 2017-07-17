enchant();

window.onload = function() {

  core = new Core(320, 320);
  core.fps = 16;
  // ゲームで使用する画像ファイルを指定する  
  core.preload('player.png', 'ladder.png', 'bg.png', 'timeup.png');
  // スコアを格納するプロパティを設定する
  core.score = 0;
  // 制限時間を管理するプロパティを設定する
  core.limitTime = 30;

  core.onload = function() {
    // バックグラウンド画像を表示するスプライトを作成する
    var bg = new Sprite(320, 640);
    // バックグラウンドの画像に「bg.png」を設定する
    bg.image = core.assets['bg.png'];
    bg.y = -320; // y座標
    core.rootScene.addChild(bg);

    // はしご画像のスプライトを6つ作成して縦方向に並べる
    for (var i = 0; i < 6; i++) {
      var ladder = new Sprite(32, 64);
      // はしごの画像に「ladder.png」を設定する
      ladder.image = core.assets['ladder.png'];
      ladder.x = 160 - 16;     // x座標
      ladder.y = 320 - i * 64; // y座標
      core.rootScene.addChild(ladder);
    }
    
    // プレイヤーの画像を表示するスプライトを作成する
    var player = new Sprite(64, 64);
    // プレイヤーの画像に「player.png」を設定する
    player.image = core.assets['player.png'];
    player.frame = 10;    // フレーム番号
    player.x = 160 - 32; // x座標
    player.y = 160;      // y座標
    core.rootScene.addChild(player);

    // rootSceneの「touchstart」イベントリスナ
    core.rootScene.addEventListener('touchstart', function(e) {
      // プレイヤーのスプライトのフレーム番号を「9」に設定する
      player.frame = 9;
      // バックグラウンドを下方向にスクロールする
      bg.y += 2;
      if (bg.y > 0) bg.y = -320;
      core.score ++; // スコア加算
    });

    // rootSceneの「touchend」イベントリスナ
    core.rootScene.addEventListener('touchend', function(e) {
      // プレイヤーのスプライトのフレーム番号を「11」に設定する
      player.frame = 11;
      // バックグラウンドを下方向にスクロールする
      bg.y += 2;
      if (bg.y > 0) bg.y = -320;
      core.score ++; // スコア加算
    });
    
    // rootSceneの「enterframe」イベントリスナ
    core.rootScene.addEventListener('enterframe', function(e) {
      // 制限時間が「0」ならタイムアップ
      if (core.limitTime == 0) {
        core.end(null, null, core.assets['timeup.png'])
      }
      // 1秒間隔で実行する処理
      if (core.frame % core.fps == 0) {
        // 制限時間をカウントダウンして更新する
        core.limitTime --;
        timeLabel.text = 'TIME:' + core.limitTime;
        // スコアを更新する
        scoreLabel.score = core.score;
      }
    });

    // 制限時間(残り時間)をフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var timeLabel = new MutableText(10, 0);
    // 表示する文字列の初期設定
    timeLabel.text = 'TIME:' + core.limitTime;
    core.rootScene.addChild(timeLabel);

    // スコアをフォントで表示するラベルを作成する
    // 引数はラベル表示位置のxy座標
    var scoreLabel = new ScoreLabel(160, 0);
    // スコアの初期値
    scoreLabel.score = 0;
    // イージング表示なしに設定する
    scoreLabel.easing = 0;
    core.rootScene.addChild(scoreLabel);

  }
  core.start();
}

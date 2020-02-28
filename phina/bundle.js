/*
 *  AssetList.js
 */

phina.namespace(function() {

  phina.define("AssetList", {
    _static: {
      loaded: [],
      isLoaded: function(assetType) {
        return AssetList.loaded[assetType]? true: false;
      },
      get: function(assetType) {
        AssetList.loaded[assetType] = true;
        switch (assetType) {
          case "preload":
            return {
              image: {
              },
              text: {
                "vs": "assets/vertex.vs",
                "fs": "assets/fragment.fs",
              },
            };
          case "common":
            return {
              image: {
              },
            };

          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});

/*
 *  main.js
 */

phina.globalize();

const SCREEN_WIDTH = 300;
const SCREEN_HEIGHT = 300;
const SCREEN_WIDTH_HALF = SCREEN_WIDTH * 0.5;
const SCREEN_HEIGHT_HALF = SCREEN_HEIGHT * 0.5;

const SCREEN_OFFSET_X = 0;
const SCREEN_OFFSET_Y = 0;

let phina_app;

window.onload = function() {
  phina_app = Application();
  phina_app.replaceScene(FirstSceneFlow({}));
  phina_app.run();
};

phina.namespace(function() {

  phina.define("Application", {
    superClass: "phina.display.CanvasApp",

    quality: 1.0,
  
    init: function() {
      this.superInit({
        fps: 60,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        fit: true,
        query: "#world",
      });
  
      //シーンの幅、高さの基本を設定
      phina.display.DisplayScene.defaults.$extend({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });
      this.glCanvas = document.getElementById('world2');
      this.glCanvas.width = 300;
      this.glCanvas.height = 300;
      this.glCanvas.style.position = "absolute";
      this.glCanvas.style.margin = "auto";
      this.glCanvas.style.left = "0px";
      this.glCanvas.style.top = "0px";
      this.glCanvas.style.bottom =  "0px";
      this.glCanvas.style.right = "0px";
      this.glCanvas.style.width = "434px";
      this.glCanvas.style.height = "434px";
      phina.gl = this.glCanvas.getContext('webgl');

    },

    update: function() {
      const src = this.glCanvas.getContext('2d');
      const dest = this.canvas.domElement.getContext('2d');
      dest.drawImage(src, 300, 300);
    },

    fitScreen: function() {
      this.canvas.fitScreen();
    },
});
  
});
/*
 *  AssetList.js
 */

phina.namespace(function() {

  phina.define("AssetList", {
    _static: {
      loaded: [],
      isLoaded: function(assetType) {
        return AssetList.loaded[assetType]? true: false;
      },
      get: function(assetType) {
        AssetList.loaded[assetType] = true;
        switch (assetType) {
          case "preload":
            return {
              image: {
                // "fighter": "assets/textures/fighter.png",
                // "particle": "assets/textures/particle.png",
              },
              text: {
                "vs": "assets/vertex.vs",
                "fs": "assets/fragment.fs",
              },
            };
          case "common":
            return {
              image: {
              },
            };

          default:
            throw "invalid assetType: " + options.assetType;
        }
      },
    },
  });

});

/*
 *  MainScene.js
 *  2018/10/26
 */

phina.namespace(function() {

  phina.define("BaseScene", {
    superClass: 'DisplayScene',

    //廃棄エレメント
    disposeElements: null,

    init: function(options) {
      options = (options || {}).$safe({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: 'transparent',
      });
      this.superInit(options);

      //シーン離脱時canvasメモリ解放
      this.disposeElements = [];
      this.app = phina_app;
    },

    destroy: function() {},

    fadeIn: function(options) {
      options = (options || {}).$safe({
        color: "white",
        millisecond: 500,
      });
      return new Promise(resolve => {
        const mask = RectangleShape({
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          fill: options.color,
          strokeWidth: 0,
        }).setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5).addChildTo(this);
        mask.tweener.clear()
          .fadeOut(options.millisecond)
          .call(() => {
            resolve();
            this.app.one('enterframe', () => mask.destroyCanvas());
          });
      });
    },

    fadeOut: function(options) {
      options = (options || {}).$safe({
        color: "white",
        millisecond: 500,
      });
      return new Promise(resolve => {
        const mask = RectangleShape({
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          fill: options.color,
          strokeWidth: 0,
        }).setPosition(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5).addChildTo(this);
        mask.alpha = 0;
        mask.tweener.clear()
          .fadeIn(options.millisecond)
          .call(() => {
            resolve();
            this.app.one('enterframe', () => mask.destroyCanvas());
          });
      });
    },

    //シーン離脱時に破棄するShapeを登録
    registDispose: function(element) {
      this.disposeElements.push(element);
    },
  });

});
/*
 *  FirstSceneFlow.js
 */

phina.namespace(function() {

  phina.define("FirstSceneFlow", {
    superClass: "ManagerScene",

    init: function(options) {
      options = options || {};
      startLabel = options.startLabel || "title";
      this.superInit({
        startLabel: startLabel,
        scenes: [
          {
            label: "title",
            className: "TitleScene",
            nextLabel: "home",
          },
          {
            label: "main",
            className: "MainScene",
          },
        ],
      });
    }
  });

});
phina.namespace(function() {

  phina.define('MainScene', {
    superClass: 'BaseScene',

    init: function(options) {
      this.superInit();
      this.setup();
    },

    setup: function() {
      const gl = phina.gl;

      const vs = phina.asset.AssetManager.get('text', 'vs').data;
      const fs = phina.asset.AssetManager.get('text', 'fs').data;

      // canvasを初期化する色を設定する
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      // canvasを初期化する際の深度を設定する
      gl.clearDepth(1.0);
      
      // canvasを初期化
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // 頂点シェーダとフラグメントシェーダの生成
      const v_shader = this.create_shader("vs", vs);
      const f_shader = this.create_shader("fs", fs);
      
      // プログラムオブジェクトの生成とリンク
      const prg = this.create_program(v_shader, f_shader);
      
      // attributeLocationを配列に取得
      const attLocation = new Array(2);
      attLocation[0] = gl.getAttribLocation(prg, 'position');
      attLocation[1] = gl.getAttribLocation(prg, 'color');
      
      // attributeの要素数を配列に格納
      const attStride = new Array(2);
      attStride[0] = 3;
      attStride[1] = 4;
      
      // 頂点の位置情報を格納する配列
      const vertex_position = [
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
      ];
      
      // 頂点の色情報を格納する配列
      const vertex_color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
      ];
      
      // VBOの生成
      const position_vbo = this.create_vbo(vertex_position);
      const color_vbo = this.create_vbo(vertex_color);
      
      // VBOをバインドし登録する(位置情報)
      gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);
      gl.enableVertexAttribArray(attLocation[0]);
      gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);
      
      // VBOをバインドし登録する(色情報)
      gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
      gl.enableVertexAttribArray(attLocation[1]);
      gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);
      
      // minMatrix.js を用いた行列関連処理
      // matIVオブジェクトを生成
      var m = new matIV();
      
      // 各種行列の生成と初期化
      const mMatrix = m.identity(m.create());
      const vMatrix = m.identity(m.create());
      const pMatrix = m.identity(m.create());
      const mvpMatrix = m.identity(m.create());
      
      // ビュー座標変換行列
      m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
      
      // プロジェクション座標変換行列
      const width = 300;
      const height = 300;
      m.perspective(90, width / height, 0.1, 100, pMatrix);
      
      // 各行列を掛け合わせ座標変換行列を完成させる
      m.multiply(pMatrix, vMatrix, mvpMatrix);
      m.multiply(mvpMatrix, mMatrix, mvpMatrix);
      
      // uniformLocationの取得
      const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
      
      // uniformLocationへ座標変換行列を登録
      gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
      
      // モデルの描画
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      
      // コンテキストの再描画
      gl.flush();
    },

    // シェーダを生成する関数
    create_shader: function(type, data){
      const gl = phina.gl;
      // シェーダを格納する変数
      var shader;
      
      // scriptタグのtype属性をチェック
      switch(type){
          // 頂点シェーダの場合
          case 'vs':
              shader = gl.createShader(gl.VERTEX_SHADER);
              break;
              
          // フラグメントシェーダの場合
          case 'fs':
              shader = gl.createShader(gl.FRAGMENT_SHADER);
              break;
          default :
              return;
      }
      
      // 生成されたシェーダにソースを割り当てる
      gl.shaderSource(shader, data);
      
      // シェーダをコンパイルする
      gl.compileShader(shader);
      
      // シェーダが正しくコンパイルされたかチェック
      if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        // 成功していたらシェーダを返して終了
        return shader;
      }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getShaderInfoLog(shader));
      }
    },
    
    // プログラムオブジェクトを生成しシェーダをリンクする関数
    create_program: function(vs, fs){
      const gl = phina.gl;
      // プログラムオブジェクトの生成
      var program = gl.createProgram();
      
      // プログラムオブジェクトにシェーダを割り当てる
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      
      // シェーダをリンク
      gl.linkProgram(program);
      
      // シェーダのリンクが正しく行なわれたかチェック
      if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        // 成功していたらプログラムオブジェクトを有効にする
        gl.useProgram(program);
        // プログラムオブジェクトを返して終了
        return program;
      }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getProgramInfoLog(program));
      }
    },
    
    // VBOを生成する関数
    create_vbo: function(data){
      const gl = phina.gl;
      // バッファオブジェクトの生成
      var vbo = gl.createBuffer();
      
      // バッファをバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      
      // バッファにデータをセット
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      
      // バッファのバインドを無効化
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      
      // 生成した VBO を返して終了
      return vbo;
    },

    update: function() {
    },

  });

});

/*
 *  TitleScene.js
 */

phina.namespace(function() {

  phina.define('TitleScene', {
    superClass: 'BaseScene',

    _static: {
      isAssetLoad: false,
    },

    init: function(options) {
      this.superInit();

      this.unlock = false;
      this.loadcomplete = false;
      this.progress = 0;

      //ロード済みならアセットロードをしない
      if (TitleScene.isAssetLoad) {
        this.setup();
      } else {
        //preload asset
        const assets = AssetList.get("preload")
        this.loader = phina.asset.AssetLoader();
        this.loader.load(assets);
        this.loader.on('load', () => this.setup());
        TitleScene.isAssetLoad = true;
      }
    },

    setup: function() {
      const back = RectangleShape({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, fill: "black" })
        .setPosition(SCREEN_WIDTH_HALF, SCREEN_HEIGHT_HALF)
        .addChildTo(this);
      this.registDispose(back);

      const label = Label({ text: "TitleScene", fill: "white" })
        .setPosition(SCREEN_WIDTH_HALF, SCREEN_HEIGHT_HALF)
        .addChildTo(this);
      this.registDispose(label);

      this.one('nextscene', () => this.exit("main"));
      this.flare('nextscene');
    },

    update: function() {
    },

  });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAyMF9zY2VuZS9tYWluc2NlbmUuanMiLCIwMjBfc2NlbmUvdGl0bGVzY2VuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogIEFzc2V0TGlzdC5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICAgIF9zdGF0aWM6IHtcbiAgICAgIGxvYWRlZDogW10sXG4gICAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIHJldHVybiBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0/IHRydWU6IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXSA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAoYXNzZXRUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInByZWxvYWRcIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBcInZzXCI6IFwiYXNzZXRzL3ZlcnRleC52c1wiLFxuICAgICAgICAgICAgICAgIFwiZnNcIjogXCJhc3NldHMvZnJhZ21lbnQuZnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIG1haW4uanNcbiAqL1xuXG5waGluYS5nbG9iYWxpemUoKTtcblxuY29uc3QgU0NSRUVOX1dJRFRIID0gMzAwO1xuY29uc3QgU0NSRUVOX0hFSUdIVCA9IDMwMDtcbmNvbnN0IFNDUkVFTl9XSURUSF9IQUxGID0gU0NSRUVOX1dJRFRIICogMC41O1xuY29uc3QgU0NSRUVOX0hFSUdIVF9IQUxGID0gU0NSRUVOX0hFSUdIVCAqIDAuNTtcblxuY29uc3QgU0NSRUVOX09GRlNFVF9YID0gMDtcbmNvbnN0IFNDUkVFTl9PRkZTRVRfWSA9IDA7XG5cbmxldCBwaGluYV9hcHA7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgcGhpbmFfYXBwID0gQXBwbGljYXRpb24oKTtcbiAgcGhpbmFfYXBwLnJlcGxhY2VTY2VuZShGaXJzdFNjZW5lRmxvdyh7fSkpO1xuICBwaGluYV9hcHAucnVuKCk7XG59O1xuIiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFwcGxpY2F0aW9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuQ2FudmFzQXBwXCIsXG5cbiAgICBxdWFsaXR5OiAxLjAsXG4gIFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBmcHM6IDYwLFxuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgIGZpdDogdHJ1ZSxcbiAgICAgICAgcXVlcnk6IFwiI3dvcmxkXCIsXG4gICAgICB9KTtcbiAgXG4gICAgICAvL+OCt+ODvOODs+OBruW5heOAgemrmOOBleOBruWfuuacrOOCkuioreWumlxuICAgICAgcGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmUuZGVmYXVsdHMuJGV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5nbENhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3b3JsZDInKTtcbiAgICAgIHRoaXMuZ2xDYW52YXMud2lkdGggPSAzMDA7XG4gICAgICB0aGlzLmdsQ2FudmFzLmhlaWdodCA9IDMwMDtcbiAgICAgIHRoaXMuZ2xDYW52YXMuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICB0aGlzLmdsQ2FudmFzLnN0eWxlLm1hcmdpbiA9IFwiYXV0b1wiO1xuICAgICAgdGhpcy5nbENhbnZhcy5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICAgIHRoaXMuZ2xDYW52YXMuc3R5bGUudG9wID0gXCIwcHhcIjtcbiAgICAgIHRoaXMuZ2xDYW52YXMuc3R5bGUuYm90dG9tID0gIFwiMHB4XCI7XG4gICAgICB0aGlzLmdsQ2FudmFzLnN0eWxlLnJpZ2h0ID0gXCIwcHhcIjtcbiAgICAgIHRoaXMuZ2xDYW52YXMuc3R5bGUud2lkdGggPSBcIjQzNHB4XCI7XG4gICAgICB0aGlzLmdsQ2FudmFzLnN0eWxlLmhlaWdodCA9IFwiNDM0cHhcIjtcbiAgICAgIHBoaW5hLmdsID0gdGhpcy5nbENhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcpO1xuXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBzcmMgPSB0aGlzLmdsQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICBjb25zdCBkZXN0ID0gdGhpcy5jYW52YXMuZG9tRWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgZGVzdC5kcmF3SW1hZ2Uoc3JjLCAzMDAsIDMwMCk7XG4gICAgfSxcblxuICAgIGZpdFNjcmVlbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNhbnZhcy5maXRTY3JlZW4oKTtcbiAgICB9LFxufSk7XG4gIFxufSk7IiwiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgIC8vIFwiZmlnaHRlclwiOiBcImFzc2V0cy90ZXh0dXJlcy9maWdodGVyLnBuZ1wiLFxuICAgICAgICAgICAgICAgIC8vIFwicGFydGljbGVcIjogXCJhc3NldHMvdGV4dHVyZXMvcGFydGljbGUucG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBcInZzXCI6IFwiYXNzZXRzL3ZlcnRleC52c1wiLFxuICAgICAgICAgICAgICAgIFwiZnNcIjogXCJhc3NldHMvZnJhZ21lbnQuZnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMTAvMjZcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQmFzZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcblxuICAgIC8v5buD5qOE44Ko44Os44Oh44Oz44OIXG4gICAgZGlzcG9zZUVsZW1lbnRzOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcblxuICAgICAgLy/jgrfjg7zjg7Ppm6LohLHmmYJjYW52YXPjg6Hjg6Ljg6rop6PmlL5cbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzID0gW107XG4gICAgICB0aGlzLmFwcCA9IHBoaW5hX2FwcDtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7fSxcblxuICAgIGZhZGVJbjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2sudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLmZhZGVPdXQob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmFkZU91dDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2suYWxwaGEgPSAwO1xuICAgICAgICBtYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgIC5mYWRlSW4ob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/jgrfjg7zjg7Ppm6LohLHmmYLjgavnoLTmo4TjgZnjgotTaGFwZeOCkueZu+mMslxuICAgIHJlZ2lzdERpc3Bvc2U6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfSxcbiAgfSk7XG5cbn0pOyIsIi8qXG4gKiAgRmlyc3RTY2VuZUZsb3cuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiRmlyc3RTY2VuZUZsb3dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiTWFuYWdlclNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHN0YXJ0TGFiZWwgPSBvcHRpb25zLnN0YXJ0TGFiZWwgfHwgXCJ0aXRsZVwiO1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBzdGFydExhYmVsOiBzdGFydExhYmVsLFxuICAgICAgICBzY2VuZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJ0aXRsZVwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlRpdGxlU2NlbmVcIixcbiAgICAgICAgICAgIG5leHRMYWJlbDogXCJob21lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJtYWluXCIsXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ01haW5TY2VuZScsIHtcbiAgICBzdXBlckNsYXNzOiAnQmFzZVNjZW5lJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICB0aGlzLnNldHVwKCk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmEuZ2w7XG5cbiAgICAgIGNvbnN0IHZzID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndGV4dCcsICd2cycpLmRhdGE7XG4gICAgICBjb25zdCBmcyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAnZnMnKS5kYXRhO1xuXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJbjgZnjgovoibLjgpLoqK3lrprjgZnjgotcbiAgICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgIFxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyW44GZ44KL6Zqb44Gu5rex5bqm44KS6Kit5a6a44GZ44KLXG4gICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgXG4gICAgICAvLyDpoILngrnjgrfjgqfjg7zjg4Djgajjg5Xjg6njgrDjg6Hjg7Pjg4jjgrfjgqfjg7zjg4Djga7nlJ/miJBcbiAgICAgIGNvbnN0IHZfc2hhZGVyID0gdGhpcy5jcmVhdGVfc2hhZGVyKFwidnNcIiwgdnMpO1xuICAgICAgY29uc3QgZl9zaGFkZXIgPSB0aGlzLmNyZWF0ZV9zaGFkZXIoXCJmc1wiLCBmcyk7XG4gICAgICBcbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkOOBqOODquODs+OCr1xuICAgICAgY29uc3QgcHJnID0gdGhpcy5jcmVhdGVfcHJvZ3JhbSh2X3NoYWRlciwgZl9zaGFkZXIpO1xuICAgICAgXG4gICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgYXR0TG9jYXRpb24gPSBuZXcgQXJyYXkoMik7XG4gICAgICBhdHRMb2NhdGlvblswXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ3Bvc2l0aW9uJyk7XG4gICAgICBhdHRMb2NhdGlvblsxXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ2NvbG9yJyk7XG4gICAgICBcbiAgICAgIC8vIGF0dHJpYnV0ZeOBruimgee0oOaVsOOCkumFjeWIl+OBq+agvOe0jVxuICAgICAgY29uc3QgYXR0U3RyaWRlID0gbmV3IEFycmF5KDIpO1xuICAgICAgYXR0U3RyaWRlWzBdID0gMztcbiAgICAgIGF0dFN0cmlkZVsxXSA9IDQ7XG4gICAgICBcbiAgICAgIC8vIOmggueCueOBruS9jee9ruaDheWgseOCkuagvOe0jeOBmeOCi+mFjeWIl1xuICAgICAgY29uc3QgdmVydGV4X3Bvc2l0aW9uID0gW1xuICAgICAgICAwLjAsIDEuMCwgMC4wLFxuICAgICAgICAxLjAsIDAuMCwgMC4wLFxuICAgICAgICAtMS4wLCAwLjAsIDAuMFxuICAgICAgXTtcbiAgICAgIFxuICAgICAgLy8g6aCC54K544Gu6Imy5oOF5aCx44KS5qC857SN44GZ44KL6YWN5YiXXG4gICAgICBjb25zdCB2ZXJ0ZXhfY29sb3IgPSBbXG4gICAgICAgIDEuMCwgMC4wLCAwLjAsIDEuMCxcbiAgICAgICAgMC4wLCAxLjAsIDAuMCwgMS4wLFxuICAgICAgICAwLjAsIDAuMCwgMS4wLCAxLjBcbiAgICAgIF07XG4gICAgICBcbiAgICAgIC8vIFZCT+OBrueUn+aIkFxuICAgICAgY29uc3QgcG9zaXRpb25fdmJvID0gdGhpcy5jcmVhdGVfdmJvKHZlcnRleF9wb3NpdGlvbik7XG4gICAgICBjb25zdCBjb2xvcl92Ym8gPSB0aGlzLmNyZWF0ZV92Ym8odmVydGV4X2NvbG9yKTtcbiAgICAgIFxuICAgICAgLy8gVkJP44KS44OQ44Kk44Oz44OJ44GX55m76Yyy44GZ44KLKOS9jee9ruaDheWgsSlcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBwb3NpdGlvbl92Ym8pO1xuICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0TG9jYXRpb25bMF0pO1xuICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihhdHRMb2NhdGlvblswXSwgYXR0U3RyaWRlWzBdLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgXG4gICAgICAvLyBWQk/jgpLjg5DjgqTjg7Pjg4njgZfnmbvpjLLjgZnjgoso6Imy5oOF5aCxKVxuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGNvbG9yX3Zibyk7XG4gICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRMb2NhdGlvblsxXSk7XG4gICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dExvY2F0aW9uWzFdLCBhdHRTdHJpZGVbMV0sIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICBcbiAgICAgIC8vIG1pbk1hdHJpeC5qcyDjgpLnlKjjgYTjgZ/ooYzliJfplqLpgKPlh6bnkIZcbiAgICAgIC8vIG1hdElW44Kq44OW44K444Kn44Kv44OI44KS55Sf5oiQXG4gICAgICB2YXIgbSA9IG5ldyBtYXRJVigpO1xuICAgICAgXG4gICAgICAvLyDlkITnqK7ooYzliJfjga7nlJ/miJDjgajliJ3mnJ/ljJZcbiAgICAgIGNvbnN0IG1NYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3Qgdk1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCBwTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IG12cE1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBcbiAgICAgIC8vIOODk+ODpeODvOW6p+aomeWkieaPm+ihjOWIl1xuICAgICAgbS5sb29rQXQoWzAuMCwgMS4wLCAzLjBdLCBbMCwgMCwgMF0sIFswLCAxLCAwXSwgdk1hdHJpeCk7XG4gICAgICBcbiAgICAgIC8vIOODl+ODreOCuOOCp+OCr+OCt+ODp+ODs+W6p+aomeWkieaPm+ihjOWIl1xuICAgICAgY29uc3Qgd2lkdGggPSAzMDA7XG4gICAgICBjb25zdCBoZWlnaHQgPSAzMDA7XG4gICAgICBtLnBlcnNwZWN0aXZlKDkwLCB3aWR0aCAvIGhlaWdodCwgMC4xLCAxMDAsIHBNYXRyaXgpO1xuICAgICAgXG4gICAgICAvLyDlkITooYzliJfjgpLmjpvjgZHlkIjjgo/jgZvluqfmqJnlpInmj5vooYzliJfjgpLlrozmiJDjgZXjgZvjgotcbiAgICAgIG0ubXVsdGlwbHkocE1hdHJpeCwgdk1hdHJpeCwgbXZwTWF0cml4KTtcbiAgICAgIG0ubXVsdGlwbHkobXZwTWF0cml4LCBtTWF0cml4LCBtdnBNYXRyaXgpO1xuICAgICAgXG4gICAgICAvLyB1bmlmb3JtTG9jYXRpb27jga7lj5blvpdcbiAgICAgIGNvbnN0IHVuaUxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ212cE1hdHJpeCcpO1xuICAgICAgXG4gICAgICAvLyB1bmlmb3JtTG9jYXRpb27jgbjluqfmqJnlpInmj5vooYzliJfjgpLnmbvpjLJcbiAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pTG9jYXRpb24sIGZhbHNlLCBtdnBNYXRyaXgpO1xuICAgICAgXG4gICAgICAvLyDjg6Ljg4fjg6vjga7mj4/nlLtcbiAgICAgIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCAzKTtcbiAgICAgIFxuICAgICAgLy8g44Kz44Oz44OG44Kt44K544OI44Gu5YaN5o+P55S7XG4gICAgICBnbC5mbHVzaCgpO1xuICAgIH0sXG5cbiAgICAvLyDjgrfjgqfjg7zjg4DjgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVfc2hhZGVyOiBmdW5jdGlvbih0eXBlLCBkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmEuZ2w7XG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLmoLzntI3jgZnjgovlpInmlbBcbiAgICAgIHZhciBzaGFkZXI7XG4gICAgICBcbiAgICAgIC8vIHNjcmlwdOOCv+OCsOOBrnR5cGXlsZ7mgKfjgpLjg4Hjgqfjg4Pjgq9cbiAgICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgICAvLyDpoILngrnjgrfjgqfjg7zjg4Djga7loLTlkIhcbiAgICAgICAgICBjYXNlICd2cyc6XG4gICAgICAgICAgICAgIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgIC8vIOODleODqeOCsOODoeODs+ODiOOCt+OCp+ODvOODgOOBruWgtOWQiFxuICAgICAgICAgIGNhc2UgJ2ZzJzpcbiAgICAgICAgICAgICAgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBleOCjOOBn+OCt+OCp+ODvOODgOOBq+OCveODvOOCueOCkuWJsuOCiuW9k+OBpuOCi1xuICAgICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgZGF0YSk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuOCs+ODs+ODkeOCpOODq+OBmeOCi1xuICAgICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgYzmraPjgZfjgY/jgrPjg7Pjg5HjgqTjg6vjgZXjgozjgZ/jgYvjg4Hjgqfjg4Pjgq9cbiAgICAgIGlmKGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSl7XG4gICAgICAgIC8vIOaIkOWKn+OBl+OBpuOBhOOBn+OCieOCt+OCp+ODvOODgOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIOWkseaVl+OBl+OBpuOBhOOBn+OCieOCqOODqeODvOODreOCsOOCkuOCouODqeODvOODiOOBmeOCi1xuICAgICAgICBhbGVydChnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS55Sf5oiQ44GX44K344Kn44O844OA44KS44Oq44Oz44Kv44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlX3Byb2dyYW06IGZ1bmN0aW9uKHZzLCBmcyl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hLmdsO1xuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgIFxuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gr44K344Kn44O844OA44KS5Ymy44KK5b2T44Gm44KLXG4gICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdnMpO1xuICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44KS44Oq44Oz44KvXG4gICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44Gu44Oq44Oz44Kv44GM5q2j44GX44GP6KGM44Gq44KP44KM44Gf44GL44OB44Kn44OD44KvXG4gICAgICBpZihnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSl7XG4gICAgICAgIC8vIOaIkOWKn+OBl+OBpuOBhOOBn+OCieODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkuacieWKueOBq+OBmeOCi1xuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZfjgabntYLkuoZcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5aSx5pWX44GX44Gm44GE44Gf44KJ44Ko44Op44O844Ot44Kw44KS44Ki44Op44O844OI44GZ44KLXG4gICAgICAgIGFsZXJ0KGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZCT+OCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZV92Ym86IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYS5nbDtcbiAgICAgIC8vIOODkOODg+ODleOCoeOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgdmFyIHZibyA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym8pO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgavjg4fjg7zjgr/jgpLjgrvjg4Pjg4hcbiAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBruODkOOCpOODs+ODieOCkueEoeWKueWMllxuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZfjgZ8gVkJPIOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgcmV0dXJuIHZibztcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgVGl0bGVTY2VuZS5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ1RpdGxlU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICBpc0Fzc2V0TG9hZDogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG5cbiAgICAgIC8v44Ot44O844OJ5riI44G/44Gq44KJ44Ki44K744OD44OI44Ot44O844OJ44KS44GX44Gq44GEXG4gICAgICBpZiAoVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCkge1xuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgICAgY29uc3QgYXNzZXRzID0gQXNzZXRMaXN0LmdldChcInByZWxvYWRcIilcbiAgICAgICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICB0aGlzLmxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICAgIHRoaXMubG9hZGVyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5zZXR1cCgpKTtcbiAgICAgICAgVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJhY2sgPSBSZWN0YW5nbGVTaGFwZSh7IHdpZHRoOiBTQ1JFRU5fV0lEVEgsIGhlaWdodDogU0NSRUVOX0hFSUdIVCwgZmlsbDogXCJibGFja1wiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShiYWNrKTtcblxuICAgICAgY29uc3QgbGFiZWwgPSBMYWJlbCh7IHRleHQ6IFwiVGl0bGVTY2VuZVwiLCBmaWxsOiBcIndoaXRlXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgdGhpcy5yZWdpc3REaXNwb3NlKGxhYmVsKTtcblxuICAgICAgdGhpcy5vbmUoJ25leHRzY2VuZScsICgpID0+IHRoaXMuZXhpdChcIm1haW5cIikpO1xuICAgICAgdGhpcy5mbGFyZSgnbmV4dHNjZW5lJyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICB9KTtcblxufSk7XG4iXX0=

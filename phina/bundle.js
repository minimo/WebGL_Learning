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

const SCREEN_WIDTH = 512;
const SCREEN_HEIGHT = 512;
const SCREEN_WIDTH_HALF = SCREEN_WIDTH * 0.5;
const SCREEN_HEIGHT_HALF = SCREEN_HEIGHT * 0.5;

const SCREEN_OFFSET_X = 0;
const SCREEN_OFFSET_Y = 0;

let phina_app;

window.onload = function() {
  phina_app = Application();
  phina_app.enableStats();
  phina_app.replaceScene(FirstSceneFlow({}));
  phina_app.run();
};

phina.namespace(function() {

  phina.define('MainScene', {
    superClass: 'BaseScene',

    init: function(options) {
      this.superInit();

      this.backgroundColor = "blue";

      const glLayer = glCanvasLayer(phina_app.glCanvas)
        .setPosition(SCREEN_WIDTH_HALF, SCREEN_HEIGHT_HALF)
        .addChildTo(this);

      // const canvas = glCanvas(phina_app.glCanvas);
      // Sprite(canvas, 300, 300)
      //   .setPosition(100, 100)
      //   .setScale(0.2, 0.2)
      //   .addChildTo(this);

      Label({ text: "test", fill: "white", align: "left", baseline: "top" })
        .setPosition(10, 10)
        .addChildTo(this)

      this.setup();
    },

    setup: function() {
      const gl = phina_app.gl;

      const vs = phina.asset.AssetManager.get('text', 'vs').data;
      const fs = phina.asset.AssetManager.get('text', 'fs').data;

      // canvasを初期化する色を設定する
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      
      // canvasを初期化する際の深度を設定する
      gl.clearDepth(1.0);
      
      // canvasを初期化
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
      // 頂点シェーダとフラグメントシェーダの生成
      const v_shader = this.createShader("vs", vs);
      const f_shader = this.createShader("fs", fs);

      // プログラムオブジェクトの生成とリンク
      const prg = this.createProgram(v_shader, f_shader);
      
      // attributeLocationを配列に取得
      const attLocation = new Array(3);
      attLocation[0] = gl.getAttribLocation(prg, 'position');
      attLocation[1] = gl.getAttribLocation(prg, 'normal');
      attLocation[2] = gl.getAttribLocation(prg, 'color');
      
      // attributeの要素数を配列に格納
      const attStride = new Array(3);
      attStride[0] = 3;
      attStride[1] = 3;
      attStride[2] = 4;
      
      // トーラスの頂点データを生成
      const torusData = this.createTorus(32, 32, 1.0, 2.0);
      const position = torusData[0];
      const normal = torusData[1];
      const color = torusData[2];
      const index = torusData[3];
      
      // VBOの生成
      const position_vbo = this.createVbo(position);
      const normal_vbo = this.createVbo(normal);
      const color_vbo = this.createVbo(color);

      // VBO を登録する
      this.setAttribute([position_vbo, normal_vbo, color_vbo], attLocation, attStride);
      
      // IBOの生成
      const ibo = this.createIbo(index);
      
      // IBOをバインドして登録する
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      
      // uniformLocationを配列に取得
      const uniLocation = new Array();
      uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
      uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
      uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection'); 
      uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection'); 
      uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor'); 

      // minMatrix.js を用いた行列関連処理
      // matIVオブジェクトを生成
      const m = new matIV();
      
      // 各種行列の生成と初期化
      const mMatrix = m.identity(m.create());
      const vMatrix = m.identity(m.create());
      const pMatrix = m.identity(m.create());
      const tmpMatrix = m.identity(m.create());
      const mvpMatrix = m.identity(m.create());
      const invMatrix = m.identity(m.create());

      //並行光源の向き
      const lightDirection = [-0.5, 0.5, 0.5];

      //視点ベクトル
      const eyeDirection = [0.0, 0.0, 20.0];

      //環境光色
      const ambientColor = [0.1, 0.1, 0.1, 1.0];

      // ビュー×プロジェクション座標変換行列
      m.lookAt([0.0, 0.0, 30.0], [0, 0, 0], [0, 1, 0], vMatrix);
      m.perspective(45, this.width / this.height, 0.1, 100, pMatrix);
      m.multiply(pMatrix, vMatrix, tmpMatrix);
      
      // カウンタの宣言
      let count = 0;
      
      // カリングと深度テストを有効にする
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.CULL_FACE);

      this.on('enterframe', () => {
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタをインクリメントする
        count++;
        
        // カウンタを元にラジアンを算出
        var rad = (count % 360) * Math.PI / 180;
        
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        // uniform変数の登録
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform3fv(uniLocation[3], eyeDirection);
        gl.uniform4fv(uniLocation[4], ambientColor);

        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        
        // コンテキストの再描画
        gl.flush();
      })
    },

    // シェーダを生成する関数
    createShader: function(type, data){
      const gl = phina_app.gl;
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
    createProgram: function(vs, fs){
      const gl = phina_app.gl;
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
    createVbo: function(data){
      const gl = phina_app.gl;
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
    // VBOをバインドし登録する関数
    setAttribute: function(vbo, attL, attS) {
      const gl = phina_app.gl;
      // 引数として受け取った配列を処理する
      for(var i in vbo){
        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        
        // attributeLocationを有効にする
        gl.enableVertexAttribArray(attL[i]);
        
        // attributeLocationを通知し登録する
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
      }
    },
    
    // IBOを生成する関数
    createIbo: function(data) {
      const gl = phina_app.gl;
      // バッファオブジェクトの生成
      var ibo = gl.createBuffer();
      
      // バッファをバインドする
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      
      // バッファにデータをセット
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
      
      // バッファのバインドを無効化
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      // 生成したIBOを返して終了
      return ibo;
    },

    createTorus: function(row, column, irad, orad) {
      function hsva(h, s, v, a){
        if(s > 1 || v > 1 || a > 1){return;}
        var th = h % 360;
        var i = Math.floor(th / 60);
        var f = th / 60 - i;
        var m = v * (1 - s);
        var n = v * (1 - s * f);
        var k = v * (1 - s * (1 - f));
        var color = new Array();
        if(!s > 0 && !s < 0){
          color.push(v, v, v, a); 
        } else {
          var r = new Array(v, n, m, m, k, v);
          var g = new Array(k, v, v, n, m, m);
          var b = new Array(m, m, k, v, v, n);
          color.push(r[i], g[i], b[i], a);
        }
        return color;
      }

      const pos = new Array();
      const nor = new Array();
      const col = new Array();
      const idx = new Array();
      for(let i = 0; i <= row; i++){
        const r = Math.PI * 2 / row * i;
        const rr = Math.cos(r);
        const ry = Math.sin(r);
        for(let ii = 0; ii <= column; ii++){
          const tr = Math.PI * 2 / column * ii;
          const tx = (rr * irad + orad) * Math.cos(tr);
          const ty = ry * irad;
          const tz = (rr * irad + orad) * Math.sin(tr);
          const rx = rr * Math.cos(tr);
          const rz = rr * Math.sin(tr);
          pos.push(tx, ty, tz);
          nor.push(rx, ry, rz);
          const tc = hsva(360 / column * ii, 1, 1, 1);
          col.push(tc[0], tc[1], tc[2], tc[3]);
        }
      }
      for(i = 0; i < row; i++){
        for(ii = 0; ii < column; ii++){
          r = (column + 1) * i + ii;
          idx.push(r, r + column + 1, r + 1);
          idx.push(r + column + 1, r + column + 2, r + 1);
        }
      }
      return [pos, nor, col, idx];
    },

    createSphere: function(row, column, rad, color) {
      const pos = new Array();
      const nor = new Array();
      const col = new Array();
      const idx = new Array();
      for(let i = 0; i <= row; i++){
        const r = Math.PI / row * i;
        const ry = Math.cos(r);
        const rr = Math.sin(r);
        for(let ii = 0; ii <= column; ii++){
          const tr = Math.PI * 2 / column * ii;
          const tx = rr * rad * Math.cos(tr);
          const ty = ry * rad;
          const tz = rr * rad * Math.sin(tr);
          const rx = rr * Math.cos(tr);
          const rz = rr * Math.sin(tr);
          let tc;
          if(color){
            tc = color;
          }else{
            tc = hsva(360 / row * i, 1, 1, 1);
          }
          pos.push(tx, ty, tz);
          nor.push(rx, ry, rz);
          col.push(tc[0], tc[1], tc[2], tc[3]);
        }
      }
      r = 0;
      for(i = 0; i < row; i++){
        for(ii = 0; ii < column; ii++){
          r = (column + 1) * i + ii;
          idx.push(r, r + 1, r + column + 2);
          idx.push(r, r + column + 2, r + column + 1);
        }
      }
      return {
        position : pos,
        normal : nor,
        color : col,
        index : idx
      };
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
      });
  
      //シーンの幅、高さの基本を設定
      phina.display.DisplayScene.defaults.$extend({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
      });

      this.glCanvas = document.createElement('canvas');
      this.glCanvas.width = SCREEN_WIDTH;
      this.glCanvas.height = SCREEN_HEIGHT;
      this.gl = this.glCanvas.getContext('webgl', {
        preserveDrawingBuffer: true,
      });
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

  phina.define('glCanvas', {
    superClass: 'phina.display.Layer',

    init: function(canvas) {
      this.canvas = canvas;
      this.domElement = canvas;
    },
  });
});
phina.namespace(function() {

  phina.define('glCanvasLayer', {
    superClass: 'phina.display.Layer',

    init: function(canvas) {
      const options = {
        width: canvas.width,
        height: canvas.height,
      };
      this.superInit(options);
      this.domElement = canvas;

      //タブ切り替え時にdrawingBufferをクリアするChromeのバグ？対策
      this.buffer = canvas.cloneNode();
      this.bufferContext = this.buffer.getContext('2d');
    },
    draw: function(canvas) {
      if (!this.domElement) return ;

      const image = this.domElement;
      this.bufferContext.drawImage(image, 0, 0);
      canvas.context.drawImage(this.buffer,
        0, 0, image.width, image.height,
        -this.width * this.originX, -this.height * this.originY, this.width, this.height
      );
    },
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMjBfc2NlbmUvbWFpbnNjZW5lLmpzIiwiMDIwX3NjZW5lL3RpdGxlc2NlbmUuanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJ2c1wiOiBcImFzc2V0cy92ZXJ0ZXgudnNcIixcbiAgICAgICAgICAgICAgICBcImZzXCI6IFwiYXNzZXRzL2ZyYWdtZW50LmZzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBtYWluLmpzXG4gKi9cblxucGhpbmEuZ2xvYmFsaXplKCk7XG5cbmNvbnN0IFNDUkVFTl9XSURUSCA9IDUxMjtcbmNvbnN0IFNDUkVFTl9IRUlHSFQgPSA1MTI7XG5jb25zdCBTQ1JFRU5fV0lEVEhfSEFMRiA9IFNDUkVFTl9XSURUSCAqIDAuNTtcbmNvbnN0IFNDUkVFTl9IRUlHSFRfSEFMRiA9IFNDUkVFTl9IRUlHSFQgKiAwLjU7XG5cbmNvbnN0IFNDUkVFTl9PRkZTRVRfWCA9IDA7XG5jb25zdCBTQ1JFRU5fT0ZGU0VUX1kgPSAwO1xuXG5sZXQgcGhpbmFfYXBwO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHBoaW5hX2FwcCA9IEFwcGxpY2F0aW9uKCk7XG4gIHBoaW5hX2FwcC5lbmFibGVTdGF0cygpO1xuICBwaGluYV9hcHAucmVwbGFjZVNjZW5lKEZpcnN0U2NlbmVGbG93KHt9KSk7XG4gIHBoaW5hX2FwcC5ydW4oKTtcbn07XG4iLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdNYWluU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuXG4gICAgICBjb25zdCBnbExheWVyID0gZ2xDYW52YXNMYXllcihwaGluYV9hcHAuZ2xDYW52YXMpXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgLy8gY29uc3QgY2FudmFzID0gZ2xDYW52YXMocGhpbmFfYXBwLmdsQ2FudmFzKTtcbiAgICAgIC8vIFNwcml0ZShjYW52YXMsIDMwMCwgMzAwKVxuICAgICAgLy8gICAuc2V0UG9zaXRpb24oMTAwLCAxMDApXG4gICAgICAvLyAgIC5zZXRTY2FsZSgwLjIsIDAuMilcbiAgICAgIC8vICAgLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgIExhYmVsKHsgdGV4dDogXCJ0ZXN0XCIsIGZpbGw6IFwid2hpdGVcIiwgYWxpZ246IFwibGVmdFwiLCBiYXNlbGluZTogXCJ0b3BcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oMTAsIDEwKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuXG4gICAgICB0aGlzLnNldHVwKCk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuXG4gICAgICBjb25zdCB2cyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAndnMnKS5kYXRhO1xuICAgICAgY29uc3QgZnMgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0ZXh0JywgJ2ZzJykuZGF0YTtcblxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyW44GZ44KL6Imy44KS6Kit5a6a44GZ44KLXG4gICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMluOBmeOCi+mam+OBrua3seW6puOCkuioreWumuOBmeOCi1xuICAgICAgZ2wuY2xlYXJEZXB0aCgxLjApO1xuICAgICAgXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJZcbiAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICAgIFxuICAgICAgLy8g6aCC54K544K344Kn44O844OA44Go44OV44Op44Kw44Oh44Oz44OI44K344Kn44O844OA44Gu55Sf5oiQXG4gICAgICBjb25zdCB2X3NoYWRlciA9IHRoaXMuY3JlYXRlU2hhZGVyKFwidnNcIiwgdnMpO1xuICAgICAgY29uc3QgZl9zaGFkZXIgPSB0aGlzLmNyZWF0ZVNoYWRlcihcImZzXCIsIGZzKTtcblxuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQ44Go44Oq44Oz44KvXG4gICAgICBjb25zdCBwcmcgPSB0aGlzLmNyZWF0ZVByb2dyYW0odl9zaGFkZXIsIGZfc2hhZGVyKTtcbiAgICAgIFxuICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLphY3liJfjgavlj5blvpdcbiAgICAgIGNvbnN0IGF0dExvY2F0aW9uID0gbmV3IEFycmF5KDMpO1xuICAgICAgYXR0TG9jYXRpb25bMF0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdwb3NpdGlvbicpO1xuICAgICAgYXR0TG9jYXRpb25bMV0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdub3JtYWwnKTtcbiAgICAgIGF0dExvY2F0aW9uWzJdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAnY29sb3InKTtcbiAgICAgIFxuICAgICAgLy8gYXR0cmlidXRl44Gu6KaB57Sg5pWw44KS6YWN5YiX44Gr5qC857SNXG4gICAgICBjb25zdCBhdHRTdHJpZGUgPSBuZXcgQXJyYXkoMyk7XG4gICAgICBhdHRTdHJpZGVbMF0gPSAzO1xuICAgICAgYXR0U3RyaWRlWzFdID0gMztcbiAgICAgIGF0dFN0cmlkZVsyXSA9IDQ7XG4gICAgICBcbiAgICAgIC8vIOODiOODvOODqeOCueOBrumggueCueODh+ODvOOCv+OCkueUn+aIkFxuICAgICAgY29uc3QgdG9ydXNEYXRhID0gdGhpcy5jcmVhdGVUb3J1cygzMiwgMzIsIDEuMCwgMi4wKTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gdG9ydXNEYXRhWzBdO1xuICAgICAgY29uc3Qgbm9ybWFsID0gdG9ydXNEYXRhWzFdO1xuICAgICAgY29uc3QgY29sb3IgPSB0b3J1c0RhdGFbMl07XG4gICAgICBjb25zdCBpbmRleCA9IHRvcnVzRGF0YVszXTtcbiAgICAgIFxuICAgICAgLy8gVkJP44Gu55Sf5oiQXG4gICAgICBjb25zdCBwb3NpdGlvbl92Ym8gPSB0aGlzLmNyZWF0ZVZibyhwb3NpdGlvbik7XG4gICAgICBjb25zdCBub3JtYWxfdmJvID0gdGhpcy5jcmVhdGVWYm8obm9ybWFsKTtcbiAgICAgIGNvbnN0IGNvbG9yX3ZibyA9IHRoaXMuY3JlYXRlVmJvKGNvbG9yKTtcblxuICAgICAgLy8gVkJPIOOCkueZu+mMsuOBmeOCi1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoW3Bvc2l0aW9uX3Zibywgbm9ybWFsX3ZibywgY29sb3JfdmJvXSwgYXR0TG9jYXRpb24sIGF0dFN0cmlkZSk7XG4gICAgICBcbiAgICAgIC8vIElCT+OBrueUn+aIkFxuICAgICAgY29uc3QgaWJvID0gdGhpcy5jcmVhdGVJYm8oaW5kZXgpO1xuICAgICAgXG4gICAgICAvLyBJQk/jgpLjg5DjgqTjg7Pjg4njgZfjgabnmbvpjLLjgZnjgotcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGlibyk7XG4gICAgICBcbiAgICAgIC8vIHVuaWZvcm1Mb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgdW5pTG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIHVuaUxvY2F0aW9uWzBdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ212cE1hdHJpeCcpO1xuICAgICAgdW5pTG9jYXRpb25bMV0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAnaW52TWF0cml4Jyk7XG4gICAgICB1bmlMb2NhdGlvblsyXSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICdsaWdodERpcmVjdGlvbicpOyBcbiAgICAgIHVuaUxvY2F0aW9uWzNdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ2V5ZURpcmVjdGlvbicpOyBcbiAgICAgIHVuaUxvY2F0aW9uWzRdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ2FtYmllbnRDb2xvcicpOyBcblxuICAgICAgLy8gbWluTWF0cml4LmpzIOOCkueUqOOBhOOBn+ihjOWIl+mWoumAo+WHpueQhlxuICAgICAgLy8gbWF0SVbjgqrjg5bjgrjjgqfjgq/jg4jjgpLnlJ/miJBcbiAgICAgIGNvbnN0IG0gPSBuZXcgbWF0SVYoKTtcbiAgICAgIFxuICAgICAgLy8g5ZCE56iu6KGM5YiX44Gu55Sf5oiQ44Go5Yid5pyf5YyWXG4gICAgICBjb25zdCBtTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHZNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgcE1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCB0bXBNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgbXZwTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IGludk1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG5cbiAgICAgIC8v5Lim6KGM5YWJ5rqQ44Gu5ZCR44GNXG4gICAgICBjb25zdCBsaWdodERpcmVjdGlvbiA9IFstMC41LCAwLjUsIDAuNV07XG5cbiAgICAgIC8v6KaW54K544OZ44Kv44OI44OrXG4gICAgICBjb25zdCBleWVEaXJlY3Rpb24gPSBbMC4wLCAwLjAsIDIwLjBdO1xuXG4gICAgICAvL+eSsOWig+WFieiJslxuICAgICAgY29uc3QgYW1iaWVudENvbG9yID0gWzAuMSwgMC4xLCAwLjEsIDEuMF07XG5cbiAgICAgIC8vIOODk+ODpeODvMOX44OX44Ot44K444Kn44Kv44K344On44Oz5bqn5qiZ5aSJ5o+b6KGM5YiXXG4gICAgICBtLmxvb2tBdChbMC4wLCAwLjAsIDMwLjBdLCBbMCwgMCwgMF0sIFswLCAxLCAwXSwgdk1hdHJpeCk7XG4gICAgICBtLnBlcnNwZWN0aXZlKDQ1LCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQsIDAuMSwgMTAwLCBwTWF0cml4KTtcbiAgICAgIG0ubXVsdGlwbHkocE1hdHJpeCwgdk1hdHJpeCwgdG1wTWF0cml4KTtcbiAgICAgIFxuICAgICAgLy8g44Kr44Km44Oz44K/44Gu5a6j6KiAXG4gICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgXG4gICAgICAvLyDjgqvjg6rjg7PjgrDjgajmt7Hluqbjg4bjgrnjg4jjgpLmnInlirnjgavjgZnjgotcbiAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xuICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG5cbiAgICAgIHRoaXMub24oJ2VudGVyZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kr44Km44Oz44K/44KS44Kk44Oz44Kv44Oq44Oh44Oz44OI44GZ44KLXG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIFxuICAgICAgICAvLyDjgqvjgqbjg7Pjgr/jgpLlhYPjgavjg6njgrjjgqLjg7PjgpLnrpflh7pcbiAgICAgICAgdmFyIHJhZCA9IChjb3VudCAlIDM2MCkgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICBcbiAgICAgICAgLy8g44Oi44OH44Or5bqn5qiZ5aSJ5o+b6KGM5YiX44Gu55Sf5oiQXG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIHJhZCwgWzAsIDEsIDFdLCBtTWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseSh0bXBNYXRyaXgsIG1NYXRyaXgsIG12cE1hdHJpeCk7XG4gICAgICAgIG0uaW52ZXJzZShtTWF0cml4LCBpbnZNYXRyaXgpO1xuXG4gICAgICAgIC8vIHVuaWZvcm3lpInmlbDjga7nmbvpjLJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblswXSwgZmFsc2UsIG12cE1hdHJpeCk7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pTG9jYXRpb25bMV0sIGZhbHNlLCBpbnZNYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtM2Z2KHVuaUxvY2F0aW9uWzJdLCBsaWdodERpcmVjdGlvbik7XG4gICAgICAgIGdsLnVuaWZvcm0zZnYodW5pTG9jYXRpb25bM10sIGV5ZURpcmVjdGlvbik7XG4gICAgICAgIGdsLnVuaWZvcm00ZnYodW5pTG9jYXRpb25bNF0sIGFtYmllbnRDb2xvcik7XG5cbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgaW5kZXgubGVuZ3RoLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjgrPjg7Pjg4bjgq3jgrnjg4jjga7lho3mj4/nlLtcbiAgICAgICAgZ2wuZmx1c2goKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIOOCt+OCp+ODvOODgOOCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVNoYWRlcjogZnVuY3Rpb24odHlwZSwgZGF0YSl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuagvOe0jeOBmeOCi+WkieaVsFxuICAgICAgdmFyIHNoYWRlcjtcbiAgICAgIFxuICAgICAgLy8gc2NyaXB044K/44Kw44GudHlwZeWxnuaAp+OCkuODgeOCp+ODg+OCr1xuICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgIC8vIOmggueCueOCt+OCp+ODvOODgOOBruWgtOWQiFxuICAgICAgICAgIGNhc2UgJ3ZzJzpcbiAgICAgICAgICAgICAgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgLy8g44OV44Op44Kw44Oh44Oz44OI44K344Kn44O844OA44Gu5aC05ZCIXG4gICAgICAgICAgY2FzZSAnZnMnOlxuICAgICAgICAgICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GV44KM44Gf44K344Kn44O844OA44Gr44K944O844K544KS5Ymy44KK5b2T44Gm44KLXG4gICAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBkYXRhKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44KS44Kz44Oz44OR44Kk44Or44GZ44KLXG4gICAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOBjOato+OBl+OBj+OCs+ODs+ODkeOCpOODq+OBleOCjOOBn+OBi+ODgeOCp+ODg+OCr1xuICAgICAgaWYoZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44K344Kn44O844OA44KS6L+U44GX44Gm57WC5LqGXG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5aSx5pWX44GX44Gm44GE44Gf44KJ44Ko44Op44O844Ot44Kw44KS44Ki44Op44O844OI44GZ44KLXG4gICAgICAgIGFsZXJ0KGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLnlJ/miJDjgZfjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq/jgZnjgovplqLmlbBcbiAgICBjcmVhdGVQcm9ncmFtOiBmdW5jdGlvbih2cywgZnMpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgXG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgavjgrfjgqfjg7zjg4DjgpLlibLjgorlvZPjgabjgotcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2cyk7XG4gICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq9cbiAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4Djga7jg6rjg7Pjgq/jgYzmraPjgZfjgY/ooYzjgarjgo/jgozjgZ/jgYvjg4Hjgqfjg4Pjgq9cbiAgICAgIGlmKGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDlpLHmlZfjgZfjgabjgYTjgZ/jgonjgqjjg6njg7zjg63jgrDjgpLjgqLjg6njg7zjg4jjgZnjgotcbiAgICAgICAgYWxlcnQoZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gVkJP44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlVmJvOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgdmJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZibyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxuICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoZGF0YSksIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBl+OBnyBWQk8g44KS6L+U44GX44Gm57WC5LqGXG4gICAgICByZXR1cm4gdmJvO1xuICAgIH0sXG4gICAgLy8gVkJP44KS44OQ44Kk44Oz44OJ44GX55m76Yyy44GZ44KL6Zai5pWwXG4gICAgc2V0QXR0cmlidXRlOiBmdW5jdGlvbih2Ym8sIGF0dEwsIGF0dFMpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g5byV5pWw44Go44GX44Gm5Y+X44GR5Y+W44Gj44Gf6YWN5YiX44KS5Yem55CG44GZ44KLXG4gICAgICBmb3IodmFyIGkgaW4gdmJvKXtcbiAgICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym9baV0pO1xuICAgICAgICBcbiAgICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLmnInlirnjgavjgZnjgotcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0TFtpXSk7XG4gICAgICAgIFxuICAgICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumAmuefpeOBl+eZu+mMsuOBmeOCi1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dExbaV0sIGF0dFNbaV0sIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBJQk/jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVJYm86IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgaWJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaWJvKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gr44OH44O844K/44KS44K744OD44OIXG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgSW50MTZBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZfjgZ9JQk/jgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiBpYm87XG4gICAgfSxcblxuICAgIGNyZWF0ZVRvcnVzOiBmdW5jdGlvbihyb3csIGNvbHVtbiwgaXJhZCwgb3JhZCkge1xuICAgICAgZnVuY3Rpb24gaHN2YShoLCBzLCB2LCBhKXtcbiAgICAgICAgaWYocyA+IDEgfHwgdiA+IDEgfHwgYSA+IDEpe3JldHVybjt9XG4gICAgICAgIHZhciB0aCA9IGggJSAzNjA7XG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih0aCAvIDYwKTtcbiAgICAgICAgdmFyIGYgPSB0aCAvIDYwIC0gaTtcbiAgICAgICAgdmFyIG0gPSB2ICogKDEgLSBzKTtcbiAgICAgICAgdmFyIG4gPSB2ICogKDEgLSBzICogZik7XG4gICAgICAgIHZhciBrID0gdiAqICgxIC0gcyAqICgxIC0gZikpO1xuICAgICAgICB2YXIgY29sb3IgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgaWYoIXMgPiAwICYmICFzIDwgMCl7XG4gICAgICAgICAgY29sb3IucHVzaCh2LCB2LCB2LCBhKTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHIgPSBuZXcgQXJyYXkodiwgbiwgbSwgbSwgaywgdik7XG4gICAgICAgICAgdmFyIGcgPSBuZXcgQXJyYXkoaywgdiwgdiwgbiwgbSwgbSk7XG4gICAgICAgICAgdmFyIGIgPSBuZXcgQXJyYXkobSwgbSwgaywgdiwgdiwgbik7XG4gICAgICAgICAgY29sb3IucHVzaChyW2ldLCBnW2ldLCBiW2ldLCBhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvcyA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3Qgbm9yID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBjb2wgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGlkeCA9IG5ldyBBcnJheSgpO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSByb3c7IGkrKyl7XG4gICAgICAgIGNvbnN0IHIgPSBNYXRoLlBJICogMiAvIHJvdyAqIGk7XG4gICAgICAgIGNvbnN0IHJyID0gTWF0aC5jb3Mocik7XG4gICAgICAgIGNvbnN0IHJ5ID0gTWF0aC5zaW4ocik7XG4gICAgICAgIGZvcihsZXQgaWkgPSAwOyBpaSA8PSBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIGNvbnN0IHRyID0gTWF0aC5QSSAqIDIgLyBjb2x1bW4gKiBpaTtcbiAgICAgICAgICBjb25zdCB0eCA9IChyciAqIGlyYWQgKyBvcmFkKSAqIE1hdGguY29zKHRyKTtcbiAgICAgICAgICBjb25zdCB0eSA9IHJ5ICogaXJhZDtcbiAgICAgICAgICBjb25zdCB0eiA9IChyciAqIGlyYWQgKyBvcmFkKSAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBjb25zdCByeCA9IHJyICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHJ6ID0gcnIgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgcG9zLnB1c2godHgsIHR5LCB0eik7XG4gICAgICAgICAgbm9yLnB1c2gocngsIHJ5LCByeik7XG4gICAgICAgICAgY29uc3QgdGMgPSBoc3ZhKDM2MCAvIGNvbHVtbiAqIGlpLCAxLCAxLCAxKTtcbiAgICAgICAgICBjb2wucHVzaCh0Y1swXSwgdGNbMV0sIHRjWzJdLCB0Y1szXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvcihpID0gMDsgaSA8IHJvdzsgaSsrKXtcbiAgICAgICAgZm9yKGlpID0gMDsgaWkgPCBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIHIgPSAoY29sdW1uICsgMSkgKiBpICsgaWk7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIGNvbHVtbiArIDEsIHIgKyAxKTtcbiAgICAgICAgICBpZHgucHVzaChyICsgY29sdW1uICsgMSwgciArIGNvbHVtbiArIDIsIHIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtwb3MsIG5vciwgY29sLCBpZHhdO1xuICAgIH0sXG5cbiAgICBjcmVhdGVTcGhlcmU6IGZ1bmN0aW9uKHJvdywgY29sdW1uLCByYWQsIGNvbG9yKSB7XG4gICAgICBjb25zdCBwb3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IG5vciA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgY29sID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBpZHggPSBuZXcgQXJyYXkoKTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gcm93OyBpKyspe1xuICAgICAgICBjb25zdCByID0gTWF0aC5QSSAvIHJvdyAqIGk7XG4gICAgICAgIGNvbnN0IHJ5ID0gTWF0aC5jb3Mocik7XG4gICAgICAgIGNvbnN0IHJyID0gTWF0aC5zaW4ocik7XG4gICAgICAgIGZvcihsZXQgaWkgPSAwOyBpaSA8PSBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIGNvbnN0IHRyID0gTWF0aC5QSSAqIDIgLyBjb2x1bW4gKiBpaTtcbiAgICAgICAgICBjb25zdCB0eCA9IHJyICogcmFkICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHR5ID0gcnkgKiByYWQ7XG4gICAgICAgICAgY29uc3QgdHogPSByciAqIHJhZCAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBjb25zdCByeCA9IHJyICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHJ6ID0gcnIgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgbGV0IHRjO1xuICAgICAgICAgIGlmKGNvbG9yKXtcbiAgICAgICAgICAgIHRjID0gY29sb3I7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0YyA9IGhzdmEoMzYwIC8gcm93ICogaSwgMSwgMSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvcy5wdXNoKHR4LCB0eSwgdHopO1xuICAgICAgICAgIG5vci5wdXNoKHJ4LCByeSwgcnopO1xuICAgICAgICAgIGNvbC5wdXNoKHRjWzBdLCB0Y1sxXSwgdGNbMl0sIHRjWzNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgciA9IDA7XG4gICAgICBmb3IoaSA9IDA7IGkgPCByb3c7IGkrKyl7XG4gICAgICAgIGZvcihpaSA9IDA7IGlpIDwgY29sdW1uOyBpaSsrKXtcbiAgICAgICAgICByID0gKGNvbHVtbiArIDEpICogaSArIGlpO1xuICAgICAgICAgIGlkeC5wdXNoKHIsIHIgKyAxLCByICsgY29sdW1uICsgMik7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIGNvbHVtbiArIDIsIHIgKyBjb2x1bW4gKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcG9zaXRpb24gOiBwb3MsXG4gICAgICAgIG5vcm1hbCA6IG5vcixcbiAgICAgICAgY29sb3IgOiBjb2wsXG4gICAgICAgIGluZGV4IDogaWR4XG4gICAgICB9O1xuICAgIH0sXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgVGl0bGVTY2VuZS5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ1RpdGxlU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICBpc0Fzc2V0TG9hZDogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG5cbiAgICAgIC8v44Ot44O844OJ5riI44G/44Gq44KJ44Ki44K744OD44OI44Ot44O844OJ44KS44GX44Gq44GEXG4gICAgICBpZiAoVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCkge1xuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgICAgY29uc3QgYXNzZXRzID0gQXNzZXRMaXN0LmdldChcInByZWxvYWRcIilcbiAgICAgICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICB0aGlzLmxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICAgIHRoaXMubG9hZGVyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5zZXR1cCgpKTtcbiAgICAgICAgVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJhY2sgPSBSZWN0YW5nbGVTaGFwZSh7IHdpZHRoOiBTQ1JFRU5fV0lEVEgsIGhlaWdodDogU0NSRUVOX0hFSUdIVCwgZmlsbDogXCJibGFja1wiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShiYWNrKTtcblxuICAgICAgY29uc3QgbGFiZWwgPSBMYWJlbCh7IHRleHQ6IFwiVGl0bGVTY2VuZVwiLCBmaWxsOiBcIndoaXRlXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgdGhpcy5yZWdpc3REaXNwb3NlKGxhYmVsKTtcblxuICAgICAgdGhpcy5vbmUoJ25leHRzY2VuZScsICgpID0+IHRoaXMuZXhpdChcIm1haW5cIikpO1xuICAgICAgdGhpcy5mbGFyZSgnbmV4dHNjZW5lJyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICB9KTtcblxufSk7XG4iLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXBwbGljYXRpb25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5DYW52YXNBcHBcIixcblxuICAgIHF1YWxpdHk6IDEuMCxcbiAgXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIGZwczogNjAsXG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgZml0OiB0cnVlLFxuICAgICAgfSk7XG4gIFxuICAgICAgLy/jgrfjg7zjg7Pjga7luYXjgIHpq5jjgZXjga7ln7rmnKzjgpLoqK3lrppcbiAgICAgIHBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lLmRlZmF1bHRzLiRleHRlbmQoe1xuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nbENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgdGhpcy5nbENhbnZhcy53aWR0aCA9IFNDUkVFTl9XSURUSDtcbiAgICAgIHRoaXMuZ2xDYW52YXMuaGVpZ2h0ID0gU0NSRUVOX0hFSUdIVDtcbiAgICAgIHRoaXMuZ2wgPSB0aGlzLmdsQ2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywge1xuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUsXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcbiAgXG59KTsiLCIvKlxuICogIEFzc2V0TGlzdC5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICAgIF9zdGF0aWM6IHtcbiAgICAgIGxvYWRlZDogW10sXG4gICAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIHJldHVybiBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0/IHRydWU6IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXSA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAoYXNzZXRUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInByZWxvYWRcIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgLy8gXCJmaWdodGVyXCI6IFwiYXNzZXRzL3RleHR1cmVzL2ZpZ2h0ZXIucG5nXCIsXG4gICAgICAgICAgICAgICAgLy8gXCJwYXJ0aWNsZVwiOiBcImFzc2V0cy90ZXh0dXJlcy9wYXJ0aWNsZS5wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIFwidnNcIjogXCJhc3NldHMvdmVydGV4LnZzXCIsXG4gICAgICAgICAgICAgICAgXCJmc1wiOiBcImFzc2V0cy9mcmFnbWVudC5mc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIFwiY29tbW9uXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBcImludmFsaWQgYXNzZXRUeXBlOiBcIiArIG9wdGlvbnMuYXNzZXRUeXBlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgTWFpblNjZW5lLmpzXG4gKiAgMjAxOC8xMC8yNlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJCYXNlU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6ICdEaXNwbGF5U2NlbmUnLFxuXG4gICAgLy/lu4Pmo4Tjgqjjg6zjg6Hjg7Pjg4hcbiAgICBkaXNwb3NlRWxlbWVudHM6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuXG4gICAgICAvL+OCt+ODvOODs+mbouiEseaZgmNhbnZhc+ODoeODouODquino+aUvlxuICAgICAgdGhpcy5kaXNwb3NlRWxlbWVudHMgPSBbXTtcbiAgICAgIHRoaXMuYXBwID0gcGhpbmFfYXBwO1xuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgZmFkZUluOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgbWlsbGlzZWNvbmQ6IDUwMCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBtYXNrID0gUmVjdGFuZ2xlU2hhcGUoe1xuICAgICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgIH0pLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSCAqIDAuNSwgU0NSRUVOX0hFSUdIVCAqIDAuNSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgbWFzay50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAuZmFkZU91dChvcHRpb25zLm1pbGxpc2Vjb25kKVxuICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLm9uZSgnZW50ZXJmcmFtZScsICgpID0+IG1hc2suZGVzdHJveUNhbnZhcygpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmYWRlT3V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgbWlsbGlzZWNvbmQ6IDUwMCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBtYXNrID0gUmVjdGFuZ2xlU2hhcGUoe1xuICAgICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgIH0pLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSCAqIDAuNSwgU0NSRUVOX0hFSUdIVCAqIDAuNSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgbWFzay5hbHBoYSA9IDA7XG4gICAgICAgIG1hc2sudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLmZhZGVJbihvcHRpb25zLm1pbGxpc2Vjb25kKVxuICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLm9uZSgnZW50ZXJmcmFtZScsICgpID0+IG1hc2suZGVzdHJveUNhbnZhcygpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+OCt+ODvOODs+mbouiEseaZguOBq+egtOajhOOBmeOCi1NoYXBl44KS55m76YyyXG4gICAgcmVnaXN0RGlzcG9zZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdGhpcy5kaXNwb3NlRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBGaXJzdFNjZW5lRmxvdy5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJGaXJzdFNjZW5lRmxvd1wiLCB7XG4gICAgc3VwZXJDbGFzczogXCJNYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgc3RhcnRMYWJlbCA9IG9wdGlvbnMuc3RhcnRMYWJlbCB8fCBcInRpdGxlXCI7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIHN0YXJ0TGFiZWw6IHN0YXJ0TGFiZWwsXG4gICAgICAgIHNjZW5lczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiVGl0bGVTY2VuZVwiLFxuICAgICAgICAgICAgbmV4dExhYmVsOiBcImhvbWVcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIm1haW5cIixcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxufSk7IiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnZ2xDYW52YXMnLCB7XG4gICAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuTGF5ZXInLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGNhbnZhcztcbiAgICB9LFxuICB9KTtcbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ2dsQ2FudmFzTGF5ZXInLCB7XG4gICAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuTGF5ZXInLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICB3aWR0aDogY2FudmFzLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGNhbnZhcy5oZWlnaHQsXG4gICAgICB9O1xuICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjYW52YXM7XG5cbiAgICAgIC8v44K/44OW5YiH44KK5pu/44GI5pmC44GrZHJhd2luZ0J1ZmZlcuOCkuOCr+ODquOCouOBmeOCi0Nocm9tZeOBruODkOOCsO+8n+WvvuetllxuICAgICAgdGhpcy5idWZmZXIgPSBjYW52YXMuY2xvbmVOb2RlKCk7XG4gICAgICB0aGlzLmJ1ZmZlckNvbnRleHQgPSB0aGlzLmJ1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH0sXG4gICAgZHJhdzogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICBpZiAoIXRoaXMuZG9tRWxlbWVudCkgcmV0dXJuIDtcblxuICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLmRvbUVsZW1lbnQ7XG4gICAgICB0aGlzLmJ1ZmZlckNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmJ1ZmZlcixcbiAgICAgICAgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCxcbiAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLm9yaWdpblgsIC10aGlzLmhlaWdodCAqIHRoaXMub3JpZ2luWSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG59KTsiXX0=
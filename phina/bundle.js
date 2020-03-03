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
      const attLocation = new Array();
      attLocation[0] = gl.getAttribLocation(prg, 'position');
      attLocation[1] = gl.getAttribLocation(prg, 'color');
      attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');

      // attributeの要素数を配列に格納
      const attStride = new Array();
      attStride[0] = 3;
      attStride[1] = 4;
      attStride[2] = 2;

      // 頂点の位置
      const position = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
      ];

      // 頂点色
      const color = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
      ];

      // テクスチャ座標
      const textureCoord = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
      ];

      // 頂点インデックス
      const index = [
        0, 1, 2,
        3, 2, 1
      ];
      // VBOとIBOの生成
      const vPosition     = this.createVbo(position);
      const vColor        = this.createVbo(color);
      const vTextureCoord = this.createVbo(textureCoord);
      const VBOList       = [vPosition, vColor, vTextureCoord];
      const iIndex        = this.createIbo(index);

      // VBOとIBOの登録
      this.setAttribute(VBOList, attLocation, attStride);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

      // uniformLocationを配列に取得
      const uniLocation = new Array();
      uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
      uniLocation[1]  = gl.getUniformLocation(prg, 'texture');
      
      // 各種行列の生成と初期化
      const m = new matIV();
      const mMatrix   = m.identity(m.create());
      const vMatrix   = m.identity(m.create());
      const pMatrix   = m.identity(m.create());
      const tmpMatrix = m.identity(m.create());
      const mvpMatrix = m.identity(m.create());
      
      // ビュー×プロジェクション座標変換行列
      m.lookAt([0.0, 2.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
      m.perspective(45, this.width / this.height, 0.1, 100, pMatrix);
      m.multiply(pMatrix, vMatrix, tmpMatrix);
      
      // 深度テストを有効にする
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      
      // 有効にするテクスチャユニットを指定
      gl.activeTexture(gl.TEXTURE0);
      
      // テクスチャ用変数の宣言
      const texture = null;
      
      // テクスチャを生成
      this.createTexture('assets/texture.png');
      
      // カウンタの宣言
      let count = 0;

      this.on('enterframe', () => {
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタを元にラジアンを算出
        count++;
        const rad = (count % 360) * Math.PI / 180;
        
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // uniform変数にテクスチャを登録
        gl.uniform1i(uniLocation[1], 0);
        
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        
        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
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
      return {
        position : pos,
        normal : nor,
        color : col,
        index : idx
      };
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
	// テクスチャを生成する関数
	  createTexture: function(source){
      const gl = phina_app.gl;
      // イメージオブジェクトの生成
      var img = new Image();
      
      // データのオンロードをトリガーにする
      img.onload = function(){
        // テクスチャオブジェクトの生成
        var tex = gl.createTexture();
        
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, tex);
        
        // テクスチャへイメージを適用
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        
        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);
        
        // テクスチャのバインドを無効化
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        // 生成したテクスチャをグローバル変数に代入
        texture = tex;
      };
      
      // イメージオブジェクトのソースを指定
      img.src = source;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIiwiMDIwX3NjZW5lL21haW5zY2VuZS5qcyIsIjAyMF9zY2VuZS90aXRsZXNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNVpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgQXNzZXRMaXN0LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFzc2V0TGlzdFwiLCB7XG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9hZGVkOiBbXSxcbiAgICAgIGlzTG9hZGVkOiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXT8gdHJ1ZTogZmFsc2U7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChhc3NldFR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicHJlbG9hZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIFwidnNcIjogXCJhc3NldHMvdmVydGV4LnZzXCIsXG4gICAgICAgICAgICAgICAgXCJmc1wiOiBcImFzc2V0cy9mcmFnbWVudC5mc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIFwiY29tbW9uXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBcImludmFsaWQgYXNzZXRUeXBlOiBcIiArIG9wdGlvbnMuYXNzZXRUeXBlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgbWFpbi5qc1xuICovXG5cbnBoaW5hLmdsb2JhbGl6ZSgpO1xuXG5jb25zdCBTQ1JFRU5fV0lEVEggPSA1MTI7XG5jb25zdCBTQ1JFRU5fSEVJR0hUID0gNTEyO1xuY29uc3QgU0NSRUVOX1dJRFRIX0hBTEYgPSBTQ1JFRU5fV0lEVEggKiAwLjU7XG5jb25zdCBTQ1JFRU5fSEVJR0hUX0hBTEYgPSBTQ1JFRU5fSEVJR0hUICogMC41O1xuXG5jb25zdCBTQ1JFRU5fT0ZGU0VUX1ggPSAwO1xuY29uc3QgU0NSRUVOX09GRlNFVF9ZID0gMDtcblxubGV0IHBoaW5hX2FwcDtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBwaGluYV9hcHAgPSBBcHBsaWNhdGlvbigpO1xuICBwaGluYV9hcHAuZW5hYmxlU3RhdHMoKTtcbiAgcGhpbmFfYXBwLnJlcGxhY2VTY2VuZShGaXJzdFNjZW5lRmxvdyh7fSkpO1xuICBwaGluYV9hcHAucnVuKCk7XG59O1xuIiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFwcGxpY2F0aW9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuQ2FudmFzQXBwXCIsXG5cbiAgICBxdWFsaXR5OiAxLjAsXG4gIFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBmcHM6IDYwLFxuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgIGZpdDogdHJ1ZSxcbiAgICAgIH0pO1xuICBcbiAgICAgIC8v44K344O844Oz44Gu5bmF44CB6auY44GV44Gu5Z+65pys44KS6Kit5a6aXG4gICAgICBwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZS5kZWZhdWx0cy4kZXh0ZW5kKHtcbiAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2xDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIHRoaXMuZ2xDYW52YXMud2lkdGggPSBTQ1JFRU5fV0lEVEg7XG4gICAgICB0aGlzLmdsQ2FudmFzLmhlaWdodCA9IFNDUkVFTl9IRUlHSFQ7XG4gICAgICB0aGlzLmdsID0gdGhpcy5nbENhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIHtcbiAgICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG4gIFxufSk7IiwiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgIC8vIFwiZmlnaHRlclwiOiBcImFzc2V0cy90ZXh0dXJlcy9maWdodGVyLnBuZ1wiLFxuICAgICAgICAgICAgICAgIC8vIFwicGFydGljbGVcIjogXCJhc3NldHMvdGV4dHVyZXMvcGFydGljbGUucG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBcInZzXCI6IFwiYXNzZXRzL3ZlcnRleC52c1wiLFxuICAgICAgICAgICAgICAgIFwiZnNcIjogXCJhc3NldHMvZnJhZ21lbnQuZnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMTAvMjZcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQmFzZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcblxuICAgIC8v5buD5qOE44Ko44Os44Oh44Oz44OIXG4gICAgZGlzcG9zZUVsZW1lbnRzOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcblxuICAgICAgLy/jgrfjg7zjg7Ppm6LohLHmmYJjYW52YXPjg6Hjg6Ljg6rop6PmlL5cbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzID0gW107XG4gICAgICB0aGlzLmFwcCA9IHBoaW5hX2FwcDtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7fSxcblxuICAgIGZhZGVJbjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2sudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLmZhZGVPdXQob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmFkZU91dDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2suYWxwaGEgPSAwO1xuICAgICAgICBtYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgIC5mYWRlSW4ob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/jgrfjg7zjg7Ppm6LohLHmmYLjgavnoLTmo4TjgZnjgotTaGFwZeOCkueZu+mMslxuICAgIHJlZ2lzdERpc3Bvc2U6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfSxcbiAgfSk7XG5cbn0pOyIsIi8qXG4gKiAgRmlyc3RTY2VuZUZsb3cuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiRmlyc3RTY2VuZUZsb3dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiTWFuYWdlclNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHN0YXJ0TGFiZWwgPSBvcHRpb25zLnN0YXJ0TGFiZWwgfHwgXCJ0aXRsZVwiO1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBzdGFydExhYmVsOiBzdGFydExhYmVsLFxuICAgICAgICBzY2VuZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJ0aXRsZVwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlRpdGxlU2NlbmVcIixcbiAgICAgICAgICAgIG5leHRMYWJlbDogXCJob21lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJtYWluXCIsXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ2dsQ2FudmFzJywge1xuICAgIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LkxheWVyJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjYW52YXM7XG4gICAgfSxcbiAgfSk7XG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdnbENhbnZhc0xheWVyJywge1xuICAgIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LkxheWVyJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0LFxuICAgICAgfTtcbiAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gY2FudmFzO1xuXG4gICAgICAvL+OCv+ODluWIh+OCiuabv+OBiOaZguOBq2RyYXdpbmdCdWZmZXLjgpLjgq/jg6rjgqLjgZnjgotDaHJvbWXjga7jg5DjgrDvvJ/lr77nrZZcbiAgICAgIHRoaXMuYnVmZmVyID0gY2FudmFzLmNsb25lTm9kZSgpO1xuICAgICAgdGhpcy5idWZmZXJDb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9LFxuICAgIGRyYXc6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgaWYgKCF0aGlzLmRvbUVsZW1lbnQpIHJldHVybiA7XG5cbiAgICAgIGNvbnN0IGltYWdlID0gdGhpcy5kb21FbGVtZW50O1xuICAgICAgdGhpcy5idWZmZXJDb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XG4gICAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5idWZmZXIsXG4gICAgICAgIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQsXG4gICAgICAgIC10aGlzLndpZHRoICogdGhpcy5vcmlnaW5YLCAtdGhpcy5oZWlnaHQgKiB0aGlzLm9yaWdpblksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0XG4gICAgICApO1xuICAgIH0sXG4gIH0pO1xufSk7IiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnTWFpblNjZW5lJywge1xuICAgIHN1cGVyQ2xhc3M6ICdCYXNlU2NlbmUnLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsdWVcIjtcblxuICAgICAgY29uc3QgZ2xMYXllciA9IGdsQ2FudmFzTGF5ZXIocGhpbmFfYXBwLmdsQ2FudmFzKVxuICAgICAgICAuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIX0hBTEYsIFNDUkVFTl9IRUlHSFRfSEFMRilcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgIC8vIGNvbnN0IGNhbnZhcyA9IGdsQ2FudmFzKHBoaW5hX2FwcC5nbENhbnZhcyk7XG4gICAgICAvLyBTcHJpdGUoY2FudmFzLCAzMDAsIDMwMClcbiAgICAgIC8vICAgLnNldFBvc2l0aW9uKDEwMCwgMTAwKVxuICAgICAgLy8gICAuc2V0U2NhbGUoMC4yLCAwLjIpXG4gICAgICAvLyAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuXG4gICAgICBMYWJlbCh7IHRleHQ6IFwidGVzdFwiLCBmaWxsOiBcIndoaXRlXCIsIGFsaWduOiBcImxlZnRcIiwgYmFzZWxpbmU6IFwidG9wXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKDEwLCAxMClcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcylcblxuICAgICAgdGhpcy5zZXR1cCgpO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcblxuICAgICAgY29uc3QgdnMgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0ZXh0JywgJ3ZzJykuZGF0YTtcbiAgICAgIGNvbnN0IGZzID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndGV4dCcsICdmcycpLmRhdGE7XG5cbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMluOBmeOCi+iJsuOCkuioreWumuOBmeOCi1xuICAgICAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJbjgZnjgovpmpvjga7mt7HluqbjgpLoqK3lrprjgZnjgotcbiAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgIFxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyWXG4gICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgICBcbiAgICAgIC8vIOmggueCueOCt+OCp+ODvOODgOOBqOODleODqeOCsOODoeODs+ODiOOCt+OCp+ODvOODgOOBrueUn+aIkFxuICAgICAgY29uc3Qgdl9zaGFkZXIgPSB0aGlzLmNyZWF0ZVNoYWRlcihcInZzXCIsIHZzKTtcbiAgICAgIGNvbnN0IGZfc2hhZGVyID0gdGhpcy5jcmVhdGVTaGFkZXIoXCJmc1wiLCBmcyk7XG5cbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkOOBqOODquODs+OCr1xuICAgICAgY29uc3QgcHJnID0gdGhpcy5jcmVhdGVQcm9ncmFtKHZfc2hhZGVyLCBmX3NoYWRlcik7XG4gICAgICBcbiAgICAgIC8vIGF0dHJpYnV0ZUxvY2F0aW9u44KS6YWN5YiX44Gr5Y+W5b6XXG4gICAgICBjb25zdCBhdHRMb2NhdGlvbiA9IG5ldyBBcnJheSgpO1xuICAgICAgYXR0TG9jYXRpb25bMF0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdwb3NpdGlvbicpO1xuICAgICAgYXR0TG9jYXRpb25bMV0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdjb2xvcicpO1xuICAgICAgYXR0TG9jYXRpb25bMl0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICd0ZXh0dXJlQ29vcmQnKTtcblxuICAgICAgLy8gYXR0cmlidXRl44Gu6KaB57Sg5pWw44KS6YWN5YiX44Gr5qC857SNXG4gICAgICBjb25zdCBhdHRTdHJpZGUgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGF0dFN0cmlkZVswXSA9IDM7XG4gICAgICBhdHRTdHJpZGVbMV0gPSA0O1xuICAgICAgYXR0U3RyaWRlWzJdID0gMjtcblxuICAgICAgLy8g6aCC54K544Gu5L2N572uXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IFtcbiAgICAgICAgLTEuMCwgIDEuMCwgIDAuMCxcbiAgICAgICAgIDEuMCwgIDEuMCwgIDAuMCxcbiAgICAgICAgLTEuMCwgLTEuMCwgIDAuMCxcbiAgICAgICAgIDEuMCwgLTEuMCwgIDAuMFxuICAgICAgXTtcblxuICAgICAgLy8g6aCC54K56ImyXG4gICAgICBjb25zdCBjb2xvciA9IFtcbiAgICAgICAgMS4wLCAxLjAsIDEuMCwgMS4wLFxuICAgICAgICAxLjAsIDEuMCwgMS4wLCAxLjAsXG4gICAgICAgIDEuMCwgMS4wLCAxLjAsIDEuMCxcbiAgICAgICAgMS4wLCAxLjAsIDEuMCwgMS4wXG4gICAgICBdO1xuXG4gICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PluqfmqJlcbiAgICAgIGNvbnN0IHRleHR1cmVDb29yZCA9IFtcbiAgICAgICAgMC4wLCAwLjAsXG4gICAgICAgIDEuMCwgMC4wLFxuICAgICAgICAwLjAsIDEuMCxcbiAgICAgICAgMS4wLCAxLjBcbiAgICAgIF07XG5cbiAgICAgIC8vIOmggueCueOCpOODs+ODh+ODg+OCr+OCuVxuICAgICAgY29uc3QgaW5kZXggPSBbXG4gICAgICAgIDAsIDEsIDIsXG4gICAgICAgIDMsIDIsIDFcbiAgICAgIF07XG4gICAgICAvLyBWQk/jgahJQk/jga7nlJ/miJBcbiAgICAgIGNvbnN0IHZQb3NpdGlvbiAgICAgPSB0aGlzLmNyZWF0ZVZibyhwb3NpdGlvbik7XG4gICAgICBjb25zdCB2Q29sb3IgICAgICAgID0gdGhpcy5jcmVhdGVWYm8oY29sb3IpO1xuICAgICAgY29uc3QgdlRleHR1cmVDb29yZCA9IHRoaXMuY3JlYXRlVmJvKHRleHR1cmVDb29yZCk7XG4gICAgICBjb25zdCBWQk9MaXN0ICAgICAgID0gW3ZQb3NpdGlvbiwgdkNvbG9yLCB2VGV4dHVyZUNvb3JkXTtcbiAgICAgIGNvbnN0IGlJbmRleCAgICAgICAgPSB0aGlzLmNyZWF0ZUlibyhpbmRleCk7XG5cbiAgICAgIC8vIFZCT+OBqElCT+OBrueZu+mMslxuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoVkJPTGlzdCwgYXR0TG9jYXRpb24sIGF0dFN0cmlkZSk7XG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpSW5kZXgpO1xuXG4gICAgICAvLyB1bmlmb3JtTG9jYXRpb27jgpLphY3liJfjgavlj5blvpdcbiAgICAgIGNvbnN0IHVuaUxvY2F0aW9uID0gbmV3IEFycmF5KCk7XG4gICAgICB1bmlMb2NhdGlvblswXSAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAnbXZwTWF0cml4Jyk7XG4gICAgICB1bmlMb2NhdGlvblsxXSAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAndGV4dHVyZScpO1xuICAgICAgXG4gICAgICAvLyDlkITnqK7ooYzliJfjga7nlJ/miJDjgajliJ3mnJ/ljJZcbiAgICAgIGNvbnN0IG0gPSBuZXcgbWF0SVYoKTtcbiAgICAgIGNvbnN0IG1NYXRyaXggICA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCB2TWF0cml4ICAgPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgcE1hdHJpeCAgID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHRtcE1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCBtdnBNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgXG4gICAgICAvLyDjg5Pjg6Xjg7zDl+ODl+ODreOCuOOCp+OCr+OCt+ODp+ODs+W6p+aomeWkieaPm+ihjOWIl1xuICAgICAgbS5sb29rQXQoWzAuMCwgMi4wLCA1LjBdLCBbMCwgMCwgMF0sIFswLCAxLCAwXSwgdk1hdHJpeCk7XG4gICAgICBtLnBlcnNwZWN0aXZlKDQ1LCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQsIDAuMSwgMTAwLCBwTWF0cml4KTtcbiAgICAgIG0ubXVsdGlwbHkocE1hdHJpeCwgdk1hdHJpeCwgdG1wTWF0cml4KTtcbiAgICAgIFxuICAgICAgLy8g5rex5bqm44OG44K544OI44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcbiAgICAgIFxuICAgICAgLy8g5pyJ5Yq544Gr44GZ44KL44OG44Kv44K544OB44Oj44Om44OL44OD44OI44KS5oyH5a6aXG4gICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcbiAgICAgIFxuICAgICAgLy8g44OG44Kv44K544OB44Oj55So5aSJ5pWw44Gu5a6j6KiAXG4gICAgICBjb25zdCB0ZXh0dXJlID0gbnVsbDtcbiAgICAgIFxuICAgICAgLy8g44OG44Kv44K544OB44Oj44KS55Sf5oiQXG4gICAgICB0aGlzLmNyZWF0ZVRleHR1cmUoJ2Fzc2V0cy90ZXh0dXJlLnBuZycpO1xuICAgICAgXG4gICAgICAvLyDjgqvjgqbjg7Pjgr/jga7lrqPoqIBcbiAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgIHRoaXMub24oJ2VudGVyZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kr44Km44Oz44K/44KS5YWD44Gr44Op44K444Ki44Oz44KS566X5Ye6XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGNvbnN0IHJhZCA9IChjb3VudCAlIDM2MCkgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuICAgICAgICBcbiAgICAgICAgLy8gdW5pZm9ybeWkieaVsOOBq+ODhuOCr+OCueODgeODo+OCkueZu+mMslxuICAgICAgICBnbC51bmlmb3JtMWkodW5pTG9jYXRpb25bMV0sIDApO1xuICAgICAgICBcbiAgICAgICAgLy8g44Oi44OH44Or5bqn5qiZ5aSJ5o+b6KGM5YiX44Gu55Sf5oiQXG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIHJhZCwgWzAsIDEsIDBdLCBtTWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseSh0bXBNYXRyaXgsIG1NYXRyaXgsIG12cE1hdHJpeCk7XG4gICAgICAgIFxuICAgICAgICAvLyB1bmlmb3Jt5aSJ5pWw44Gu55m76Yyy44Go5o+P55S7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pTG9jYXRpb25bMF0sIGZhbHNlLCBtdnBNYXRyaXgpO1xuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCBpbmRleC5sZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOOCs+ODs+ODhuOCreOCueODiOOBruWGjeaPj+eUu1xuICAgICAgICBnbC5mbHVzaCgpO1xuICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8g44K344Kn44O844OA44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlU2hhZGVyOiBmdW5jdGlvbih0eXBlLCBkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44K344Kn44O844OA44KS5qC857SN44GZ44KL5aSJ5pWwXG4gICAgICB2YXIgc2hhZGVyO1xuICAgICAgXG4gICAgICAvLyBzY3JpcHTjgr/jgrDjga50eXBl5bGe5oCn44KS44OB44Kn44OD44KvXG4gICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgICAgLy8g6aCC54K544K344Kn44O844OA44Gu5aC05ZCIXG4gICAgICAgICAgY2FzZSAndnMnOlxuICAgICAgICAgICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAvLyDjg5Xjg6njgrDjg6Hjg7Pjg4jjgrfjgqfjg7zjg4Djga7loLTlkIhcbiAgICAgICAgICBjYXNlICdmcyc6XG4gICAgICAgICAgICAgIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZXjgozjgZ/jgrfjgqfjg7zjg4Djgavjgr3jg7zjgrnjgpLlibLjgorlvZPjgabjgotcbiAgICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIGRhdGEpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLjgrPjg7Pjg5HjgqTjg6vjgZnjgotcbiAgICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44GM5q2j44GX44GP44Kz44Oz44OR44Kk44Or44GV44KM44Gf44GL44OB44Kn44OD44KvXG4gICAgICBpZihnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpe1xuICAgICAgICAvLyDmiJDlip/jgZfjgabjgYTjgZ/jgonjgrfjgqfjg7zjg4DjgpLov5TjgZfjgabntYLkuoZcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDlpLHmlZfjgZfjgabjgYTjgZ/jgonjgqjjg6njg7zjg63jgrDjgpLjgqLjg6njg7zjg4jjgZnjgotcbiAgICAgICAgYWxlcnQoZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkueUn+aIkOOBl+OCt+OCp+ODvOODgOOCkuODquODs+OCr+OBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVByb2dyYW06IGZ1bmN0aW9uKHZzLCBmcyl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgICBcbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBq+OCt+OCp+ODvOODgOOCkuWJsuOCiuW9k+OBpuOCi1xuICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcyk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuODquODs+OCr1xuICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOBruODquODs+OCr+OBjOato+OBl+OBj+ihjOOBquOCj+OCjOOBn+OBi+ODgeOCp+ODg+OCr1xuICAgICAgaWYoZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpe1xuICAgICAgICAvLyDmiJDlip/jgZfjgabjgYTjgZ/jgonjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLmnInlirnjgavjgZnjgotcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS6L+U44GX44Gm57WC5LqGXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIOWkseaVl+OBl+OBpuOBhOOBn+OCieOCqOODqeODvOODreOCsOOCkuOCouODqeODvOODiOOBmeOCi1xuICAgICAgICBhbGVydChnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBWQk/jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVWYm86IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciB2Ym8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmJvKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gr44OH44O844K/44KS44K744OD44OIXG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GX44GfIFZCTyDjgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiB2Ym87XG4gICAgfSxcbiAgICAvLyBWQk/jgpLjg5DjgqTjg7Pjg4njgZfnmbvpjLLjgZnjgovplqLmlbBcbiAgICBzZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKHZibywgYXR0TCwgYXR0Uykge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDlvJXmlbDjgajjgZfjgablj5fjgZHlj5bjgaPjgZ/phY3liJfjgpLlh6bnkIbjgZnjgotcbiAgICAgIGZvcih2YXIgaSBpbiB2Ym8pe1xuICAgICAgICAvLyDjg5Djg4Pjg5XjgqHjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZib1tpXSk7XG4gICAgICAgIFxuICAgICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkuacieWKueOBq+OBmeOCi1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRMW2ldKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGF0dHJpYnV0ZUxvY2F0aW9u44KS6YCa55+l44GX55m76Yyy44GZ44KLXG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoYXR0TFtpXSwgYXR0U1tpXSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIElCT+OCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZUlibzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBpYm8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpYm8pO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgavjg4fjg7zjgr/jgpLjgrvjg4Pjg4hcbiAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBJbnQxNkFycmF5KGRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBruODkOOCpOODs+ODieOCkueEoeWKueWMllxuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBl+OBn0lCT+OCkui/lOOBl+OBpue1guS6hlxuICAgICAgcmV0dXJuIGlibztcbiAgICB9LFxuXG4gICAgY3JlYXRlVG9ydXM6IGZ1bmN0aW9uKHJvdywgY29sdW1uLCBpcmFkLCBvcmFkKSB7XG4gICAgICBmdW5jdGlvbiBoc3ZhKGgsIHMsIHYsIGEpe1xuICAgICAgICBpZihzID4gMSB8fCB2ID4gMSB8fCBhID4gMSl7cmV0dXJuO31cbiAgICAgICAgdmFyIHRoID0gaCAlIDM2MDtcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHRoIC8gNjApO1xuICAgICAgICB2YXIgZiA9IHRoIC8gNjAgLSBpO1xuICAgICAgICB2YXIgbSA9IHYgKiAoMSAtIHMpO1xuICAgICAgICB2YXIgbiA9IHYgKiAoMSAtIHMgKiBmKTtcbiAgICAgICAgdmFyIGsgPSB2ICogKDEgLSBzICogKDEgLSBmKSk7XG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBBcnJheSgpO1xuICAgICAgICBpZighcyA+IDAgJiYgIXMgPCAwKXtcbiAgICAgICAgICBjb2xvci5wdXNoKHYsIHYsIHYsIGEpOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgciA9IG5ldyBBcnJheSh2LCBuLCBtLCBtLCBrLCB2KTtcbiAgICAgICAgICB2YXIgZyA9IG5ldyBBcnJheShrLCB2LCB2LCBuLCBtLCBtKTtcbiAgICAgICAgICB2YXIgYiA9IG5ldyBBcnJheShtLCBtLCBrLCB2LCB2LCBuKTtcbiAgICAgICAgICBjb2xvci5wdXNoKHJbaV0sIGdbaV0sIGJbaV0sIGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9zID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBub3IgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGNvbCA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgaWR4ID0gbmV3IEFycmF5KCk7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHJvdzsgaSsrKXtcbiAgICAgICAgY29uc3QgciA9IE1hdGguUEkgKiAyIC8gcm93ICogaTtcbiAgICAgICAgY29uc3QgcnIgPSBNYXRoLmNvcyhyKTtcbiAgICAgICAgY29uc3QgcnkgPSBNYXRoLnNpbihyKTtcbiAgICAgICAgZm9yKGxldCBpaSA9IDA7IGlpIDw9IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgY29uc3QgdHIgPSBNYXRoLlBJICogMiAvIGNvbHVtbiAqIGlpO1xuICAgICAgICAgIGNvbnN0IHR4ID0gKHJyICogaXJhZCArIG9yYWQpICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHR5ID0gcnkgKiBpcmFkO1xuICAgICAgICAgIGNvbnN0IHR6ID0gKHJyICogaXJhZCArIG9yYWQpICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIGNvbnN0IHJ4ID0gcnIgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgcnogPSByciAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBwb3MucHVzaCh0eCwgdHksIHR6KTtcbiAgICAgICAgICBub3IucHVzaChyeCwgcnksIHJ6KTtcbiAgICAgICAgICBjb25zdCB0YyA9IGhzdmEoMzYwIC8gY29sdW1uICogaWksIDEsIDEsIDEpO1xuICAgICAgICAgIGNvbC5wdXNoKHRjWzBdLCB0Y1sxXSwgdGNbMl0sIHRjWzNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yKGkgPSAwOyBpIDwgcm93OyBpKyspe1xuICAgICAgICBmb3IoaWkgPSAwOyBpaSA8IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgciA9IChjb2x1bW4gKyAxKSAqIGkgKyBpaTtcbiAgICAgICAgICBpZHgucHVzaChyLCByICsgY29sdW1uICsgMSwgciArIDEpO1xuICAgICAgICAgIGlkeC5wdXNoKHIgKyBjb2x1bW4gKyAxLCByICsgY29sdW1uICsgMiwgciArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbiA6IHBvcyxcbiAgICAgICAgbm9ybWFsIDogbm9yLFxuICAgICAgICBjb2xvciA6IGNvbCxcbiAgICAgICAgaW5kZXggOiBpZHhcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZVNwaGVyZTogZnVuY3Rpb24ocm93LCBjb2x1bW4sIHJhZCwgY29sb3IpIHtcbiAgICAgIGNvbnN0IHBvcyA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3Qgbm9yID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBjb2wgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGlkeCA9IG5ldyBBcnJheSgpO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSByb3c7IGkrKyl7XG4gICAgICAgIGNvbnN0IHIgPSBNYXRoLlBJIC8gcm93ICogaTtcbiAgICAgICAgY29uc3QgcnkgPSBNYXRoLmNvcyhyKTtcbiAgICAgICAgY29uc3QgcnIgPSBNYXRoLnNpbihyKTtcbiAgICAgICAgZm9yKGxldCBpaSA9IDA7IGlpIDw9IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgY29uc3QgdHIgPSBNYXRoLlBJICogMiAvIGNvbHVtbiAqIGlpO1xuICAgICAgICAgIGNvbnN0IHR4ID0gcnIgKiByYWQgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgdHkgPSByeSAqIHJhZDtcbiAgICAgICAgICBjb25zdCB0eiA9IHJyICogcmFkICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIGNvbnN0IHJ4ID0gcnIgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgcnogPSByciAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBsZXQgdGM7XG4gICAgICAgICAgaWYoY29sb3Ipe1xuICAgICAgICAgICAgdGMgPSBjb2xvcjtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRjID0gaHN2YSgzNjAgLyByb3cgKiBpLCAxLCAxLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zLnB1c2godHgsIHR5LCB0eik7XG4gICAgICAgICAgbm9yLnB1c2gocngsIHJ5LCByeik7XG4gICAgICAgICAgY29sLnB1c2godGNbMF0sIHRjWzFdLCB0Y1syXSwgdGNbM10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByID0gMDtcbiAgICAgIGZvcihpID0gMDsgaSA8IHJvdzsgaSsrKXtcbiAgICAgICAgZm9yKGlpID0gMDsgaWkgPCBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIHIgPSAoY29sdW1uICsgMSkgKiBpICsgaWk7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIDEsIHIgKyBjb2x1bW4gKyAyKTtcbiAgICAgICAgICBpZHgucHVzaChyLCByICsgY29sdW1uICsgMiwgciArIGNvbHVtbiArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbiA6IHBvcyxcbiAgICAgICAgbm9ybWFsIDogbm9yLFxuICAgICAgICBjb2xvciA6IGNvbCxcbiAgICAgICAgaW5kZXggOiBpZHhcbiAgICAgIH07XG4gICAgfSxcblx0Ly8g44OG44Kv44K544OB44Oj44KS55Sf5oiQ44GZ44KL6Zai5pWwXG5cdCAgY3JlYXRlVGV4dHVyZTogZnVuY3Rpb24oc291cmNlKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44Kk44Oh44O844K444Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBcbiAgICAgIC8vIOODh+ODvOOCv+OBruOCquODs+ODreODvOODieOCkuODiOODquOCrOODvOOBq+OBmeOCi1xuICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgICB2YXIgdGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgbjjgqTjg6Hjg7zjgrjjgpLpgannlKhcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWcpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Of44OD44OX44Oe44OD44OX44KS55Sf5oiQXG4gICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgICAgICBcbiAgICAgICAgLy8g55Sf5oiQ44GX44Gf44OG44Kv44K544OB44Oj44KS44Kw44Ot44O844OQ44Or5aSJ5pWw44Gr5Luj5YWlXG4gICAgICAgIHRleHR1cmUgPSB0ZXg7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyDjgqTjg6Hjg7zjgrjjgqrjg5bjgrjjgqfjgq/jg4jjga7jgr3jg7zjgrnjgpLmjIflrppcbiAgICAgIGltZy5zcmMgPSBzb3VyY2U7XG4gICAgfVxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIFRpdGxlU2NlbmUuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdUaXRsZVNjZW5lJywge1xuICAgIHN1cGVyQ2xhc3M6ICdCYXNlU2NlbmUnLFxuXG4gICAgX3N0YXRpYzoge1xuICAgICAgaXNBc3NldExvYWQ6IGZhbHNlLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICB0aGlzLnVubG9jayA9IGZhbHNlO1xuICAgICAgdGhpcy5sb2FkY29tcGxldGUgPSBmYWxzZTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuXG4gICAgICAvL+ODreODvOODiea4iOOBv+OBquOCieOCouOCu+ODg+ODiOODreODvOODieOCkuOBl+OBquOBhFxuICAgICAgaWYgKFRpdGxlU2NlbmUuaXNBc3NldExvYWQpIHtcbiAgICAgICAgdGhpcy5zZXR1cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9wcmVsb2FkIGFzc2V0XG4gICAgICAgIGNvbnN0IGFzc2V0cyA9IEFzc2V0TGlzdC5nZXQoXCJwcmVsb2FkXCIpXG4gICAgICAgIHRoaXMubG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgICAgdGhpcy5sb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICB0aGlzLmxvYWRlci5vbignbG9hZCcsICgpID0+IHRoaXMuc2V0dXAoKSk7XG4gICAgICAgIFRpdGxlU2NlbmUuaXNBc3NldExvYWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBiYWNrID0gUmVjdGFuZ2xlU2hhcGUoeyB3aWR0aDogU0NSRUVOX1dJRFRILCBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsIGZpbGw6IFwiYmxhY2tcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIX0hBTEYsIFNDUkVFTl9IRUlHSFRfSEFMRilcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICB0aGlzLnJlZ2lzdERpc3Bvc2UoYmFjayk7XG5cbiAgICAgIGNvbnN0IGxhYmVsID0gTGFiZWwoeyB0ZXh0OiBcIlRpdGxlU2NlbmVcIiwgZmlsbDogXCJ3aGl0ZVwiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShsYWJlbCk7XG5cbiAgICAgIHRoaXMub25lKCduZXh0c2NlbmUnLCAoKSA9PiB0aGlzLmV4aXQoXCJtYWluXCIpKTtcbiAgICAgIHRoaXMuZmxhcmUoJ25leHRzY2VuZScpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgfSk7XG5cbn0pO1xuIl19

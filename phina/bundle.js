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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIiwiMDIwX3NjZW5lL21haW5zY2VuZS5qcyIsIjAyMF9zY2VuZS90aXRsZXNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJ2c1wiOiBcImFzc2V0cy92ZXJ0ZXgudnNcIixcbiAgICAgICAgICAgICAgICBcImZzXCI6IFwiYXNzZXRzL2ZyYWdtZW50LmZzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBtYWluLmpzXG4gKi9cblxucGhpbmEuZ2xvYmFsaXplKCk7XG5cbmNvbnN0IFNDUkVFTl9XSURUSCA9IDUxMjtcbmNvbnN0IFNDUkVFTl9IRUlHSFQgPSA1MTI7XG5jb25zdCBTQ1JFRU5fV0lEVEhfSEFMRiA9IFNDUkVFTl9XSURUSCAqIDAuNTtcbmNvbnN0IFNDUkVFTl9IRUlHSFRfSEFMRiA9IFNDUkVFTl9IRUlHSFQgKiAwLjU7XG5cbmNvbnN0IFNDUkVFTl9PRkZTRVRfWCA9IDA7XG5jb25zdCBTQ1JFRU5fT0ZGU0VUX1kgPSAwO1xuXG5sZXQgcGhpbmFfYXBwO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHBoaW5hX2FwcCA9IEFwcGxpY2F0aW9uKCk7XG4gIHBoaW5hX2FwcC5lbmFibGVTdGF0cygpO1xuICBwaGluYV9hcHAucmVwbGFjZVNjZW5lKEZpcnN0U2NlbmVGbG93KHt9KSk7XG4gIHBoaW5hX2FwcC5ydW4oKTtcbn07XG4iLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXBwbGljYXRpb25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5DYW52YXNBcHBcIixcblxuICAgIHF1YWxpdHk6IDEuMCxcbiAgXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIGZwczogNjAsXG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgZml0OiB0cnVlLFxuICAgICAgfSk7XG4gIFxuICAgICAgLy/jgrfjg7zjg7Pjga7luYXjgIHpq5jjgZXjga7ln7rmnKzjgpLoqK3lrppcbiAgICAgIHBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lLmRlZmF1bHRzLiRleHRlbmQoe1xuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5nbENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgdGhpcy5nbENhbnZhcy53aWR0aCA9IFNDUkVFTl9XSURUSDtcbiAgICAgIHRoaXMuZ2xDYW52YXMuaGVpZ2h0ID0gU0NSRUVOX0hFSUdIVDtcbiAgICAgIHRoaXMuZ2wgPSB0aGlzLmdsQ2FudmFzLmdldENvbnRleHQoJ3dlYmdsJywge1xuICAgICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUsXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcbiAgXG59KTsiLCIvKlxuICogIEFzc2V0TGlzdC5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICAgIF9zdGF0aWM6IHtcbiAgICAgIGxvYWRlZDogW10sXG4gICAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIHJldHVybiBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0/IHRydWU6IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXSA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAoYXNzZXRUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInByZWxvYWRcIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgICAgLy8gXCJmaWdodGVyXCI6IFwiYXNzZXRzL3RleHR1cmVzL2ZpZ2h0ZXIucG5nXCIsXG4gICAgICAgICAgICAgICAgLy8gXCJwYXJ0aWNsZVwiOiBcImFzc2V0cy90ZXh0dXJlcy9wYXJ0aWNsZS5wbmdcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIFwidnNcIjogXCJhc3NldHMvdmVydGV4LnZzXCIsXG4gICAgICAgICAgICAgICAgXCJmc1wiOiBcImFzc2V0cy9mcmFnbWVudC5mc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIFwiY29tbW9uXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBcImludmFsaWQgYXNzZXRUeXBlOiBcIiArIG9wdGlvbnMuYXNzZXRUeXBlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgTWFpblNjZW5lLmpzXG4gKiAgMjAxOC8xMC8yNlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJCYXNlU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6ICdEaXNwbGF5U2NlbmUnLFxuXG4gICAgLy/lu4Pmo4Tjgqjjg6zjg6Hjg7Pjg4hcbiAgICBkaXNwb3NlRWxlbWVudHM6IG51bGwsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuXG4gICAgICAvL+OCt+ODvOODs+mbouiEseaZgmNhbnZhc+ODoeODouODquino+aUvlxuICAgICAgdGhpcy5kaXNwb3NlRWxlbWVudHMgPSBbXTtcbiAgICAgIHRoaXMuYXBwID0gcGhpbmFfYXBwO1xuICAgIH0sXG5cbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHt9LFxuXG4gICAgZmFkZUluOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgbWlsbGlzZWNvbmQ6IDUwMCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBtYXNrID0gUmVjdGFuZ2xlU2hhcGUoe1xuICAgICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgIH0pLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSCAqIDAuNSwgU0NSRUVOX0hFSUdIVCAqIDAuNSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgbWFzay50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAuZmFkZU91dChvcHRpb25zLm1pbGxpc2Vjb25kKVxuICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLm9uZSgnZW50ZXJmcmFtZScsICgpID0+IG1hc2suZGVzdHJveUNhbnZhcygpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBmYWRlT3V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gKG9wdGlvbnMgfHwge30pLiRzYWZlKHtcbiAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgbWlsbGlzZWNvbmQ6IDUwMCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBtYXNrID0gUmVjdGFuZ2xlU2hhcGUoe1xuICAgICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICAgIGZpbGw6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgIH0pLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSCAqIDAuNSwgU0NSRUVOX0hFSUdIVCAqIDAuNSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgbWFzay5hbHBoYSA9IDA7XG4gICAgICAgIG1hc2sudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLmZhZGVJbihvcHRpb25zLm1pbGxpc2Vjb25kKVxuICAgICAgICAgIC5jYWxsKCgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLm9uZSgnZW50ZXJmcmFtZScsICgpID0+IG1hc2suZGVzdHJveUNhbnZhcygpKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+OCt+ODvOODs+mbouiEseaZguOBq+egtOajhOOBmeOCi1NoYXBl44KS55m76YyyXG4gICAgcmVnaXN0RGlzcG9zZTogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgdGhpcy5kaXNwb3NlRWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICB9LFxuICB9KTtcblxufSk7IiwiLypcbiAqICBGaXJzdFNjZW5lRmxvdy5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJGaXJzdFNjZW5lRmxvd1wiLCB7XG4gICAgc3VwZXJDbGFzczogXCJNYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgc3RhcnRMYWJlbCA9IG9wdGlvbnMuc3RhcnRMYWJlbCB8fCBcInRpdGxlXCI7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIHN0YXJ0TGFiZWw6IHN0YXJ0TGFiZWwsXG4gICAgICAgIHNjZW5lczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiVGl0bGVTY2VuZVwiLFxuICAgICAgICAgICAgbmV4dExhYmVsOiBcImhvbWVcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiBcIm1haW5cIixcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxufSk7IiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnZ2xDYW52YXMnLCB7XG4gICAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuTGF5ZXInLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGNhbnZhcztcbiAgICB9LFxuICB9KTtcbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ2dsQ2FudmFzTGF5ZXInLCB7XG4gICAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuTGF5ZXInLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICB3aWR0aDogY2FudmFzLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGNhbnZhcy5oZWlnaHQsXG4gICAgICB9O1xuICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjYW52YXM7XG5cbiAgICAgIC8v44K/44OW5YiH44KK5pu/44GI5pmC44GrZHJhd2luZ0J1ZmZlcuOCkuOCr+ODquOCouOBmeOCi0Nocm9tZeOBruODkOOCsO+8n+WvvuetllxuICAgICAgdGhpcy5idWZmZXIgPSBjYW52YXMuY2xvbmVOb2RlKCk7XG4gICAgICB0aGlzLmJ1ZmZlckNvbnRleHQgPSB0aGlzLmJ1ZmZlci5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH0sXG4gICAgZHJhdzogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICBpZiAoIXRoaXMuZG9tRWxlbWVudCkgcmV0dXJuIDtcblxuICAgICAgY29uc3QgaW1hZ2UgPSB0aGlzLmRvbUVsZW1lbnQ7XG4gICAgICB0aGlzLmJ1ZmZlckNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLmJ1ZmZlcixcbiAgICAgICAgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCxcbiAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLm9yaWdpblgsIC10aGlzLmhlaWdodCAqIHRoaXMub3JpZ2luWSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdNYWluU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuXG4gICAgICBjb25zdCBnbExheWVyID0gZ2xDYW52YXNMYXllcihwaGluYV9hcHAuZ2xDYW52YXMpXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgLy8gY29uc3QgY2FudmFzID0gZ2xDYW52YXMocGhpbmFfYXBwLmdsQ2FudmFzKTtcbiAgICAgIC8vIFNwcml0ZShjYW52YXMsIDMwMCwgMzAwKVxuICAgICAgLy8gICAuc2V0UG9zaXRpb24oMTAwLCAxMDApXG4gICAgICAvLyAgIC5zZXRTY2FsZSgwLjIsIDAuMilcbiAgICAgIC8vICAgLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgIExhYmVsKHsgdGV4dDogXCJ0ZXN0XCIsIGZpbGw6IFwid2hpdGVcIiwgYWxpZ246IFwibGVmdFwiLCBiYXNlbGluZTogXCJ0b3BcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oMTAsIDEwKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuXG4gICAgICB0aGlzLnNldHVwKCk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuXG4gICAgICBjb25zdCB2cyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAndnMnKS5kYXRhO1xuICAgICAgY29uc3QgZnMgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0ZXh0JywgJ2ZzJykuZGF0YTtcblxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyW44GZ44KL6Imy44KS6Kit5a6a44GZ44KLXG4gICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMluOBmeOCi+mam+OBrua3seW6puOCkuioreWumuOBmeOCi1xuICAgICAgZ2wuY2xlYXJEZXB0aCgxLjApO1xuICAgICAgXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJZcbiAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICAgIFxuICAgICAgLy8g6aCC54K544K344Kn44O844OA44Go44OV44Op44Kw44Oh44Oz44OI44K344Kn44O844OA44Gu55Sf5oiQXG4gICAgICBjb25zdCB2X3NoYWRlciA9IHRoaXMuY3JlYXRlU2hhZGVyKFwidnNcIiwgdnMpO1xuICAgICAgY29uc3QgZl9zaGFkZXIgPSB0aGlzLmNyZWF0ZVNoYWRlcihcImZzXCIsIGZzKTtcblxuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQ44Go44Oq44Oz44KvXG4gICAgICBjb25zdCBwcmcgPSB0aGlzLmNyZWF0ZVByb2dyYW0odl9zaGFkZXIsIGZfc2hhZGVyKTtcbiAgICAgIFxuICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLphY3liJfjgavlj5blvpdcbiAgICAgIGNvbnN0IGF0dExvY2F0aW9uID0gbmV3IEFycmF5KCk7XG4gICAgICBhdHRMb2NhdGlvblswXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ3Bvc2l0aW9uJyk7XG4gICAgICBhdHRMb2NhdGlvblsxXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ2NvbG9yJyk7XG4gICAgICBhdHRMb2NhdGlvblsyXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ3RleHR1cmVDb29yZCcpO1xuXG4gICAgICAvLyBhdHRyaWJ1dGXjga7opoHntKDmlbDjgpLphY3liJfjgavmoLzntI1cbiAgICAgIGNvbnN0IGF0dFN0cmlkZSA9IG5ldyBBcnJheSgpO1xuICAgICAgYXR0U3RyaWRlWzBdID0gMztcbiAgICAgIGF0dFN0cmlkZVsxXSA9IDQ7XG4gICAgICBhdHRTdHJpZGVbMl0gPSAyO1xuXG4gICAgICAvLyDpoILngrnjga7kvY3nva5cbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gW1xuICAgICAgICAtMS4wLCAgMS4wLCAgMC4wLFxuICAgICAgICAgMS4wLCAgMS4wLCAgMC4wLFxuICAgICAgICAtMS4wLCAtMS4wLCAgMC4wLFxuICAgICAgICAgMS4wLCAtMS4wLCAgMC4wXG4gICAgICBdO1xuXG4gICAgICAvLyDpoILngrnoibJcbiAgICAgIGNvbnN0IGNvbG9yID0gW1xuICAgICAgICAxLjAsIDEuMCwgMS4wLCAxLjAsXG4gICAgICAgIDEuMCwgMS4wLCAxLjAsIDEuMCxcbiAgICAgICAgMS4wLCAxLjAsIDEuMCwgMS4wLFxuICAgICAgICAxLjAsIDEuMCwgMS4wLCAxLjBcbiAgICAgIF07XG5cbiAgICAgIC8vIOODhuOCr+OCueODgeODo+W6p+aomVxuICAgICAgY29uc3QgdGV4dHVyZUNvb3JkID0gW1xuICAgICAgICAwLjAsIDAuMCxcbiAgICAgICAgMS4wLCAwLjAsXG4gICAgICAgIDAuMCwgMS4wLFxuICAgICAgICAxLjAsIDEuMFxuICAgICAgXTtcblxuICAgICAgLy8g6aCC54K544Kk44Oz44OH44OD44Kv44K5XG4gICAgICBjb25zdCBpbmRleCA9IFtcbiAgICAgICAgMCwgMSwgMixcbiAgICAgICAgMywgMiwgMVxuICAgICAgXTtcbiAgICAgIC8vIFZCT+OBqElCT+OBrueUn+aIkFxuICAgICAgY29uc3QgdlBvc2l0aW9uICAgICA9IHRoaXMuY3JlYXRlVmJvKHBvc2l0aW9uKTtcbiAgICAgIGNvbnN0IHZDb2xvciAgICAgICAgPSB0aGlzLmNyZWF0ZVZibyhjb2xvcik7XG4gICAgICBjb25zdCB2VGV4dHVyZUNvb3JkID0gdGhpcy5jcmVhdGVWYm8odGV4dHVyZUNvb3JkKTtcbiAgICAgIGNvbnN0IFZCT0xpc3QgICAgICAgPSBbdlBvc2l0aW9uLCB2Q29sb3IsIHZUZXh0dXJlQ29vcmRdO1xuICAgICAgY29uc3QgaUluZGV4ICAgICAgICA9IHRoaXMuY3JlYXRlSWJvKGluZGV4KTtcblxuICAgICAgLy8gVkJP44GoSUJP44Gu55m76YyyXG4gICAgICB0aGlzLnNldEF0dHJpYnV0ZShWQk9MaXN0LCBhdHRMb2NhdGlvbiwgYXR0U3RyaWRlKTtcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGlJbmRleCk7XG5cbiAgICAgIC8vIHVuaWZvcm1Mb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgdW5pTG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIHVuaUxvY2F0aW9uWzBdICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICdtdnBNYXRyaXgnKTtcbiAgICAgIHVuaUxvY2F0aW9uWzFdICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICd0ZXh0dXJlJyk7XG4gICAgICBcbiAgICAgIC8vIOWQhOeoruihjOWIl+OBrueUn+aIkOOBqOWIneacn+WMllxuICAgICAgY29uc3QgbSA9IG5ldyBtYXRJVigpO1xuICAgICAgY29uc3QgbU1hdHJpeCAgID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHZNYXRyaXggICA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCBwTWF0cml4ICAgPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgdG1wTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IG12cE1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBcbiAgICAgIC8vIOODk+ODpeODvMOX44OX44Ot44K444Kn44Kv44K344On44Oz5bqn5qiZ5aSJ5o+b6KGM5YiXXG4gICAgICBtLmxvb2tBdChbMC4wLCAyLjAsIDUuMF0sIFswLCAwLCAwXSwgWzAsIDEsIDBdLCB2TWF0cml4KTtcbiAgICAgIG0ucGVyc3BlY3RpdmUoNDUsIHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCwgMC4xLCAxMDAsIHBNYXRyaXgpO1xuICAgICAgbS5tdWx0aXBseShwTWF0cml4LCB2TWF0cml4LCB0bXBNYXRyaXgpO1xuICAgICAgXG4gICAgICAvLyDmt7Hluqbjg4bjgrnjg4jjgpLmnInlirnjgavjgZnjgotcbiAgICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICAgIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpO1xuICAgICAgXG4gICAgICAvLyDmnInlirnjgavjgZnjgovjg4bjgq/jgrnjg4Hjg6Pjg6bjg4vjg4Pjg4jjgpLmjIflrppcbiAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuICAgICAgXG4gICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PnlKjlpInmlbDjga7lrqPoqIBcbiAgICAgIGNvbnN0IHRleHR1cmUgPSBudWxsO1xuICAgICAgXG4gICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgpLnlJ/miJBcbiAgICAgIHRoaXMuY3JlYXRlVGV4dHVyZSgnYXNzZXRzL3RleHR1cmUucG5nJyk7XG4gICAgICBcbiAgICAgIC8vIOOCq+OCpuODs+OCv+OBruWuo+iogFxuICAgICAgbGV0IGNvdW50ID0gMDtcblxuICAgICAgdGhpcy5vbignZW50ZXJmcmFtZScsICgpID0+IHtcbiAgICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyWXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgICAgZ2wuY2xlYXJEZXB0aCgxLjApO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjgqvjgqbjg7Pjgr/jgpLlhYPjgavjg6njgrjjgqLjg7PjgpLnrpflh7pcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgY29uc3QgcmFkID0gKGNvdW50ICUgMzYwKSAqIE1hdGguUEkgLyAxODA7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XG4gICAgICAgIFxuICAgICAgICAvLyB1bmlmb3Jt5aSJ5pWw44Gr44OG44Kv44K544OB44Oj44KS55m76YyyXG4gICAgICAgIGdsLnVuaWZvcm0xaSh1bmlMb2NhdGlvblsxXSwgMCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg6Ljg4fjg6vluqfmqJnlpInmj5vooYzliJfjga7nlJ/miJBcbiAgICAgICAgbS5pZGVudGl0eShtTWF0cml4KTtcbiAgICAgICAgbS5yb3RhdGUobU1hdHJpeCwgcmFkLCBbMCwgMSwgMF0sIG1NYXRyaXgpO1xuICAgICAgICBtLm11bHRpcGx5KHRtcE1hdHJpeCwgbU1hdHJpeCwgbXZwTWF0cml4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIHVuaWZvcm3lpInmlbDjga7nmbvpjLLjgajmj4/nlLtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblswXSwgZmFsc2UsIG12cE1hdHJpeCk7XG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIGluZGV4Lmxlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kz44Oz44OG44Kt44K544OI44Gu5YaN5o+P55S7XG4gICAgICAgIGdsLmZsdXNoKCk7XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyDjgrfjgqfjg7zjg4DjgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVTaGFkZXI6IGZ1bmN0aW9uKHR5cGUsIGRhdGEpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLmoLzntI3jgZnjgovlpInmlbBcbiAgICAgIHZhciBzaGFkZXI7XG4gICAgICBcbiAgICAgIC8vIHNjcmlwdOOCv+OCsOOBrnR5cGXlsZ7mgKfjgpLjg4Hjgqfjg4Pjgq9cbiAgICAgIHN3aXRjaCh0eXBlKXtcbiAgICAgICAgICAvLyDpoILngrnjgrfjgqfjg7zjg4Djga7loLTlkIhcbiAgICAgICAgICBjYXNlICd2cyc6XG4gICAgICAgICAgICAgIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgIC8vIOODleODqeOCsOODoeODs+ODiOOCt+OCp+ODvOODgOOBruWgtOWQiFxuICAgICAgICAgIGNhc2UgJ2ZzJzpcbiAgICAgICAgICAgICAgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBleOCjOOBn+OCt+OCp+ODvOODgOOBq+OCveODvOOCueOCkuWJsuOCiuW9k+OBpuOCi1xuICAgICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgZGF0YSk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuOCs+ODs+ODkeOCpOODq+OBmeOCi1xuICAgICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgYzmraPjgZfjgY/jgrPjg7Pjg5HjgqTjg6vjgZXjgozjgZ/jgYvjg4Hjgqfjg4Pjgq9cbiAgICAgIGlmKGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSl7XG4gICAgICAgIC8vIOaIkOWKn+OBl+OBpuOBhOOBn+OCieOCt+OCp+ODvOODgOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgICByZXR1cm4gc2hhZGVyO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIOWkseaVl+OBl+OBpuOBhOOBn+OCieOCqOODqeODvOODreOCsOOCkuOCouODqeODvOODiOOBmeOCi1xuICAgICAgICBhbGVydChnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS55Sf5oiQ44GX44K344Kn44O844OA44KS44Oq44Oz44Kv44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlUHJvZ3JhbTogZnVuY3Rpb24odnMsIGZzKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgIFxuICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44Gr44K344Kn44O844OA44KS5Ymy44KK5b2T44Gm44KLXG4gICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdnMpO1xuICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44KS44Oq44Oz44KvXG4gICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44Gu44Oq44Oz44Kv44GM5q2j44GX44GP6KGM44Gq44KP44KM44Gf44GL44OB44Kn44OD44KvXG4gICAgICBpZihnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSl7XG4gICAgICAgIC8vIOaIkOWKn+OBl+OBpuOBhOOBn+OCieODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkuacieWKueOBq+OBmeOCi1xuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZfjgabntYLkuoZcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5aSx5pWX44GX44Gm44GE44Gf44KJ44Ko44Op44O844Ot44Kw44KS44Ki44Op44O844OI44GZ44KLXG4gICAgICAgIGFsZXJ0KGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIFZCT+OCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVZibzogZnVuY3Rpb24oZGF0YSl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOODkOODg+ODleOCoeOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgdmFyIHZibyA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym8pO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgavjg4fjg7zjgr/jgpLjgrvjg4Pjg4hcbiAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBruODkOOCpOODs+ODieOCkueEoeWKueWMllxuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZfjgZ8gVkJPIOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgcmV0dXJuIHZibztcbiAgICB9LFxuICAgIC8vIFZCT+OCkuODkOOCpOODs+ODieOBl+eZu+mMsuOBmeOCi+mWouaVsFxuICAgIHNldEF0dHJpYnV0ZTogZnVuY3Rpb24odmJvLCBhdHRMLCBhdHRTKSB7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOW8leaVsOOBqOOBl+OBpuWPl+OBkeWPluOBo+OBn+mFjeWIl+OCkuWHpueQhuOBmeOCi1xuICAgICAgZm9yKHZhciBpIGluIHZibyl7XG4gICAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmJvW2ldKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGF0dHJpYnV0ZUxvY2F0aW9u44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGF0dExbaV0pO1xuICAgICAgICBcbiAgICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLpgJrnn6XjgZfnmbvpjLLjgZnjgotcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihhdHRMW2ldLCBhdHRTW2ldLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gSUJP44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlSWJvOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOODkOODg+ODleOCoeOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgdmFyIGlibyA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGlibyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxuICAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbmV3IEludDE2QXJyYXkoZGF0YSksIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GX44GfSUJP44KS6L+U44GX44Gm57WC5LqGXG4gICAgICByZXR1cm4gaWJvO1xuICAgIH0sXG5cbiAgICBjcmVhdGVUb3J1czogZnVuY3Rpb24ocm93LCBjb2x1bW4sIGlyYWQsIG9yYWQpIHtcbiAgICAgIGZ1bmN0aW9uIGhzdmEoaCwgcywgdiwgYSl7XG4gICAgICAgIGlmKHMgPiAxIHx8IHYgPiAxIHx8IGEgPiAxKXtyZXR1cm47fVxuICAgICAgICB2YXIgdGggPSBoICUgMzYwO1xuICAgICAgICB2YXIgaSA9IE1hdGguZmxvb3IodGggLyA2MCk7XG4gICAgICAgIHZhciBmID0gdGggLyA2MCAtIGk7XG4gICAgICAgIHZhciBtID0gdiAqICgxIC0gcyk7XG4gICAgICAgIHZhciBuID0gdiAqICgxIC0gcyAqIGYpO1xuICAgICAgICB2YXIgayA9IHYgKiAoMSAtIHMgKiAoMSAtIGYpKTtcbiAgICAgICAgdmFyIGNvbG9yID0gbmV3IEFycmF5KCk7XG4gICAgICAgIGlmKCFzID4gMCAmJiAhcyA8IDApe1xuICAgICAgICAgIGNvbG9yLnB1c2godiwgdiwgdiwgYSk7IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciByID0gbmV3IEFycmF5KHYsIG4sIG0sIG0sIGssIHYpO1xuICAgICAgICAgIHZhciBnID0gbmV3IEFycmF5KGssIHYsIHYsIG4sIG0sIG0pO1xuICAgICAgICAgIHZhciBiID0gbmV3IEFycmF5KG0sIG0sIGssIHYsIHYsIG4pO1xuICAgICAgICAgIGNvbG9yLnB1c2gocltpXSwgZ1tpXSwgYltpXSwgYSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbG9yO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwb3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IG5vciA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgY29sID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBpZHggPSBuZXcgQXJyYXkoKTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gcm93OyBpKyspe1xuICAgICAgICBjb25zdCByID0gTWF0aC5QSSAqIDIgLyByb3cgKiBpO1xuICAgICAgICBjb25zdCByciA9IE1hdGguY29zKHIpO1xuICAgICAgICBjb25zdCByeSA9IE1hdGguc2luKHIpO1xuICAgICAgICBmb3IobGV0IGlpID0gMDsgaWkgPD0gY29sdW1uOyBpaSsrKXtcbiAgICAgICAgICBjb25zdCB0ciA9IE1hdGguUEkgKiAyIC8gY29sdW1uICogaWk7XG4gICAgICAgICAgY29uc3QgdHggPSAocnIgKiBpcmFkICsgb3JhZCkgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgdHkgPSByeSAqIGlyYWQ7XG4gICAgICAgICAgY29uc3QgdHogPSAocnIgKiBpcmFkICsgb3JhZCkgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgY29uc3QgcnggPSByciAqIE1hdGguY29zKHRyKTtcbiAgICAgICAgICBjb25zdCByeiA9IHJyICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIHBvcy5wdXNoKHR4LCB0eSwgdHopO1xuICAgICAgICAgIG5vci5wdXNoKHJ4LCByeSwgcnopO1xuICAgICAgICAgIGNvbnN0IHRjID0gaHN2YSgzNjAgLyBjb2x1bW4gKiBpaSwgMSwgMSwgMSk7XG4gICAgICAgICAgY29sLnB1c2godGNbMF0sIHRjWzFdLCB0Y1syXSwgdGNbM10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IoaSA9IDA7IGkgPCByb3c7IGkrKyl7XG4gICAgICAgIGZvcihpaSA9IDA7IGlpIDwgY29sdW1uOyBpaSsrKXtcbiAgICAgICAgICByID0gKGNvbHVtbiArIDEpICogaSArIGlpO1xuICAgICAgICAgIGlkeC5wdXNoKHIsIHIgKyBjb2x1bW4gKyAxLCByICsgMSk7XG4gICAgICAgICAgaWR4LnB1c2gociArIGNvbHVtbiArIDEsIHIgKyBjb2x1bW4gKyAyLCByICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvc2l0aW9uIDogcG9zLFxuICAgICAgICBub3JtYWwgOiBub3IsXG4gICAgICAgIGNvbG9yIDogY29sLFxuICAgICAgICBpbmRleCA6IGlkeFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY3JlYXRlU3BoZXJlOiBmdW5jdGlvbihyb3csIGNvbHVtbiwgcmFkLCBjb2xvcikge1xuICAgICAgY29uc3QgcG9zID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBub3IgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGNvbCA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgaWR4ID0gbmV3IEFycmF5KCk7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHJvdzsgaSsrKXtcbiAgICAgICAgY29uc3QgciA9IE1hdGguUEkgLyByb3cgKiBpO1xuICAgICAgICBjb25zdCByeSA9IE1hdGguY29zKHIpO1xuICAgICAgICBjb25zdCByciA9IE1hdGguc2luKHIpO1xuICAgICAgICBmb3IobGV0IGlpID0gMDsgaWkgPD0gY29sdW1uOyBpaSsrKXtcbiAgICAgICAgICBjb25zdCB0ciA9IE1hdGguUEkgKiAyIC8gY29sdW1uICogaWk7XG4gICAgICAgICAgY29uc3QgdHggPSByciAqIHJhZCAqIE1hdGguY29zKHRyKTtcbiAgICAgICAgICBjb25zdCB0eSA9IHJ5ICogcmFkO1xuICAgICAgICAgIGNvbnN0IHR6ID0gcnIgKiByYWQgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgY29uc3QgcnggPSByciAqIE1hdGguY29zKHRyKTtcbiAgICAgICAgICBjb25zdCByeiA9IHJyICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIGxldCB0YztcbiAgICAgICAgICBpZihjb2xvcil7XG4gICAgICAgICAgICB0YyA9IGNvbG9yO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGMgPSBoc3ZhKDM2MCAvIHJvdyAqIGksIDEsIDEsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwb3MucHVzaCh0eCwgdHksIHR6KTtcbiAgICAgICAgICBub3IucHVzaChyeCwgcnksIHJ6KTtcbiAgICAgICAgICBjb2wucHVzaCh0Y1swXSwgdGNbMV0sIHRjWzJdLCB0Y1szXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHIgPSAwO1xuICAgICAgZm9yKGkgPSAwOyBpIDwgcm93OyBpKyspe1xuICAgICAgICBmb3IoaWkgPSAwOyBpaSA8IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgciA9IChjb2x1bW4gKyAxKSAqIGkgKyBpaTtcbiAgICAgICAgICBpZHgucHVzaChyLCByICsgMSwgciArIGNvbHVtbiArIDIpO1xuICAgICAgICAgIGlkeC5wdXNoKHIsIHIgKyBjb2x1bW4gKyAyLCByICsgY29sdW1uICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvc2l0aW9uIDogcG9zLFxuICAgICAgICBub3JtYWwgOiBub3IsXG4gICAgICAgIGNvbG9yIDogY29sLFxuICAgICAgICBpbmRleCA6IGlkeFxuICAgICAgfTtcbiAgICB9LFxuICBcbiAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgpLnlJ/miJDjgZnjgovplqLmlbBcblx0ICBjcmVhdGVUZXh0dXJlOiBmdW5jdGlvbihzb3VyY2Upe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjgqTjg6Hjg7zjgrjjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIFxuICAgICAgLy8g44OH44O844K/44Gu44Kq44Oz44Ot44O844OJ44KS44OI44Oq44Ks44O844Gr44GZ44KLXG4gICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICAgIHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OBuOOCpOODoeODvOOCuOOCkumBqeeUqFxuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltZyk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg5/jg4Pjg5fjg57jg4Pjg5fjgpLnlJ/miJBcbiAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6Pjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgICAgIFxuICAgICAgICAvLyDnlJ/miJDjgZfjgZ/jg4bjgq/jgrnjg4Hjg6PjgpLjgrDjg63jg7zjg5Djg6vlpInmlbDjgavku6PlhaVcbiAgICAgICAgdGV4dHVyZSA9IHRleDtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIOOCpOODoeODvOOCuOOCquODluOCuOOCp+OCr+ODiOOBruOCveODvOOCueOCkuaMh+WumlxuICAgICAgaW1nLnNyYyA9IHNvdXJjZTtcbiAgICB9XG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgVGl0bGVTY2VuZS5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ1RpdGxlU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICBpc0Fzc2V0TG9hZDogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG5cbiAgICAgIC8v44Ot44O844OJ5riI44G/44Gq44KJ44Ki44K744OD44OI44Ot44O844OJ44KS44GX44Gq44GEXG4gICAgICBpZiAoVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCkge1xuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgICAgY29uc3QgYXNzZXRzID0gQXNzZXRMaXN0LmdldChcInByZWxvYWRcIilcbiAgICAgICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICB0aGlzLmxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICAgIHRoaXMubG9hZGVyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5zZXR1cCgpKTtcbiAgICAgICAgVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJhY2sgPSBSZWN0YW5nbGVTaGFwZSh7IHdpZHRoOiBTQ1JFRU5fV0lEVEgsIGhlaWdodDogU0NSRUVOX0hFSUdIVCwgZmlsbDogXCJibGFja1wiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShiYWNrKTtcblxuICAgICAgY29uc3QgbGFiZWwgPSBMYWJlbCh7IHRleHQ6IFwiVGl0bGVTY2VuZVwiLCBmaWxsOiBcIndoaXRlXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgdGhpcy5yZWdpc3REaXNwb3NlKGxhYmVsKTtcblxuICAgICAgdGhpcy5vbmUoJ25leHRzY2VuZScsICgpID0+IHRoaXMuZXhpdChcIm1haW5cIikpO1xuICAgICAgdGhpcy5mbGFyZSgnbmV4dHNjZW5lJyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICB9KTtcblxufSk7XG4iXX0=

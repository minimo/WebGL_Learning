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
        fit: false,
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
      // this.buffer = canvas.cloneNode();
      // this.bufferContext = this.buffer.getContext('2d');
    },
    draw: function(canvas) {
      if (!this.domElement) return ;

      const image = this.domElement;
      canvas.context.drawImage(image,
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

      // canvas とクォータニオンをグローバルに扱う
      const q = new qtnIV();
      const qt = q.identity(q.create());
   
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
      attLocation[1] = gl.getAttribLocation(prg, 'normal');
      attLocation[2] = gl.getAttribLocation(prg, 'color');
      attLocation[3] = gl.getAttribLocation(prg, 'textureCoord');

      // attributeの要素数を配列に格納
      const attStride = new Array();
      attStride[0] = 3;
      attStride[1] = 3;
      attStride[2] = 4;
      attStride[3] = 2;
    
      //VBO/IBO生成
      const cubeData      = cube(2.0, [1.0, 1.0, 1.0, 1.0]);
      const cPosition     = this.createVbo(cubeData.p);
      const cNormal       = this.createVbo(cubeData.n);
      const cColor        = this.createVbo(cubeData.c);
      const cTextureCoord = this.createVbo(cubeData.t);
      const cVBOList      = [cPosition, cNormal, cColor, cTextureCoord];
      const cIndex        = this.createIbo(cubeData.i);              

      // 球体モデル
      const earthData     = sphere(64, 64, 1.0, [1.0, 1.0, 1.0, 1.0]);
      const ePosition     = this.createVbo(earthData.p);
      const eNormal       = this.createVbo(earthData.n);
      const eColor        = this.createVbo(earthData.c);
      const eTextureCoord = this.createVbo(earthData.t);
      const eVBOList      = [ePosition, eNormal, eColor, eTextureCoord];
      const eIndex        = this.createIbo(earthData.i);

      // uniformLocationを配列に取得
      const uniLocation = new Array();
      uniLocation[0] = gl.getUniformLocation(prg, 'mMatrix');
      uniLocation[1] = gl.getUniformLocation(prg, 'mvpMatrix');
      uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
      uniLocation[3] = gl.getUniformLocation(prg, 'lightDirection');
      uniLocation[4] = gl.getUniformLocation(prg, 'useLight');
      uniLocation[5] = gl.getUniformLocation(prg, 'texture');

      // 各種行列の生成と初期化
      const m = new matIV();
      const mMatrix   = m.identity(m.create());
      const vMatrix   = m.identity(m.create());
      const pMatrix   = m.identity(m.create());
      const tmpMatrix = m.identity(m.create());
      const mvpMatrix = m.identity(m.create());
      const invMatrix = m.identity(m.create());
      
      // 深度テストを有効にする
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      // テクスチャを生成
      this.texture = [];
      this.createTexture('assets/texture2.png', 0);
      this.createTexture('assets/texture3.png', 1);
      gl.activeTexture(gl.TEXTURE0);
      
      // フレームバッファオブジェクトの取得
      const fBufferWidth  = 512;
      const fBufferHeight = 512;
      const fBuffer = this.createFramebuffer(fBufferWidth, fBufferHeight);
		
      // カウンタの宣言
      let count = 0;

      this.on('enterframe', () => {
        // カウンタをインクリメントする
        count++;
        
        // カウンタを元にラジアンを算出
        var rad  = (count % 360) * Math.PI / 180;
        var rad2 = (count % 720) * Math.PI / 360;
        
        // フレームバッファをバインド
        gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.frameBuffer);
        
        // フレームバッファを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // 地球用のVBOとIBOをセット
        this.setAttribute(eVBOList, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eIndex);
        
        // ライト関連
        var lightDirection = [-1.0, 2.0, 1.0];
        
        // ビュー×プロジェクション座標変換行列
        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, fBufferWidth / fBufferHeight, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);
        
        // 背景用球体をフレームバッファにレンダリング
        gl.bindTexture(gl.TEXTURE_2D, this.texture[1]);
        m.identity(mMatrix);
        m.scale(mMatrix, [50.0, 50.0, 50.0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform3fv(uniLocation[3], lightDirection);
        gl.uniform1i(uniLocation[4], false);
        gl.uniform1i(uniLocation[5], 0);
        gl.drawElements(gl.TRIANGLES, earthData.i.length, gl.UNSIGNED_SHORT, 0);
        
        // 地球本体をフレームバッファにレンダリング
        gl.bindTexture(gl.TEXTURE_2D, this.texture[0]);
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.uniform1i(uniLocation[4], true);
        gl.drawElements(gl.TRIANGLES, earthData.i.length, gl.UNSIGNED_SHORT, 0);
        
        // フレームバッファのバインドを解除
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        // canvasを初期化
        gl.clearColor(0.0, 0.7, 0.7, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // キューブのVBOとIBOをセット
        this.setAttribute(cVBOList, attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cIndex);
        
        // フレームバッファに描き込んだ内容をテクスチャとして適用
        gl.bindTexture(gl.TEXTURE_2D, fBuffer.texture);
        
        // ライト関連
        lightDirection = [-1.0, 0.0, 0.0];
        
        // ビュー×プロジェクション座標変換行列
        m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, this.width / this.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);
        
        // キューブをレンダリング
        m.identity(mMatrix);
        m.rotate(mMatrix, rad2, [1, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.drawElements(gl.TRIANGLES, cubeData.i.length, gl.UNSIGNED_SHORT, 0);
        
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
      
    // テクスチャを生成する関数
	  createTexture: function(source, num){
      const gl = phina_app.gl;
      // イメージオブジェクトの生成
      const img = new Image();
      
      // データのオンロードをトリガーにする
      img.onload = () => {
        // テクスチャオブジェクトの生成
        const tex = gl.createTexture();
        
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, tex);
        
        // テクスチャへイメージを適用
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        
        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);
        
        // テクスチャのバインドを無効化
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        // 生成したテクスチャをグローバル変数に代入
        this.texture[num] = tex;

        console.log("texture load finished.")
      };
      
      // イメージオブジェクトのソースを指定
      img.src = source;
    },
    // フレームバッファをオブジェクトとして生成する関数
    createFramebuffer: function(width, height) {
      const gl = phina_app.gl;

      // フレームバッファの生成
      const frameBuffer = gl.createFramebuffer();
      
      // フレームバッファをWebGLにバインド
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      
      // 深度バッファ用レンダーバッファの生成とバインド
      const depthRenderBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
      
      // レンダーバッファを深度バッファとして設定
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      
      // フレームバッファにレンダーバッファを関連付ける
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
      
      // フレームバッファ用テクスチャの生成
      const texture = gl.createTexture();
      
      // フレームバッファ用のテクスチャをバインド
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // フレームバッファ用のテクスチャにカラー用のメモリ領域を確保
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      
      // テクスチャパラメータ
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      
      // フレームバッファにテクスチャを関連付ける
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      
      // 各種オブジェクトのバインドを解除
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      
      // オブジェクトを返して終了
      return { frameBuffer, depthRenderBuffer, texture };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIiwiMDIwX3NjZW5lL21haW5zY2VuZS5qcyIsIjAyMF9zY2VuZS90aXRsZXNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgQXNzZXRMaXN0LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFzc2V0TGlzdFwiLCB7XG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9hZGVkOiBbXSxcbiAgICAgIGlzTG9hZGVkOiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXT8gdHJ1ZTogZmFsc2U7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChhc3NldFR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicHJlbG9hZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgdGV4dDoge1xuICAgICAgICAgICAgICAgIFwidnNcIjogXCJhc3NldHMvdmVydGV4LnZzXCIsXG4gICAgICAgICAgICAgICAgXCJmc1wiOiBcImFzc2V0cy9mcmFnbWVudC5mc1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlIFwiY29tbW9uXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBcImludmFsaWQgYXNzZXRUeXBlOiBcIiArIG9wdGlvbnMuYXNzZXRUeXBlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgbWFpbi5qc1xuICovXG5cbnBoaW5hLmdsb2JhbGl6ZSgpO1xuXG5jb25zdCBTQ1JFRU5fV0lEVEggPSA1MTI7XG5jb25zdCBTQ1JFRU5fSEVJR0hUID0gNTEyO1xuY29uc3QgU0NSRUVOX1dJRFRIX0hBTEYgPSBTQ1JFRU5fV0lEVEggKiAwLjU7XG5jb25zdCBTQ1JFRU5fSEVJR0hUX0hBTEYgPSBTQ1JFRU5fSEVJR0hUICogMC41O1xuXG5jb25zdCBTQ1JFRU5fT0ZGU0VUX1ggPSAwO1xuY29uc3QgU0NSRUVOX09GRlNFVF9ZID0gMDtcblxubGV0IHBoaW5hX2FwcDtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBwaGluYV9hcHAgPSBBcHBsaWNhdGlvbigpO1xuICBwaGluYV9hcHAuZW5hYmxlU3RhdHMoKTtcbiAgcGhpbmFfYXBwLnJlcGxhY2VTY2VuZShGaXJzdFNjZW5lRmxvdyh7fSkpO1xuICBwaGluYV9hcHAucnVuKCk7XG59O1xuIiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFwcGxpY2F0aW9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuQ2FudmFzQXBwXCIsXG5cbiAgICBxdWFsaXR5OiAxLjAsXG4gIFxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBmcHM6IDYwLFxuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgIGZpdDogZmFsc2UsXG4gICAgICB9KTtcbiAgXG4gICAgICAvL+OCt+ODvOODs+OBruW5heOAgemrmOOBleOBruWfuuacrOOCkuioreWumlxuICAgICAgcGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmUuZGVmYXVsdHMuJGV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdsQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICB0aGlzLmdsQ2FudmFzLndpZHRoID0gU0NSRUVOX1dJRFRIO1xuICAgICAgdGhpcy5nbENhbnZhcy5oZWlnaHQgPSBTQ1JFRU5fSEVJR0hUO1xuICAgICAgdGhpcy5nbCA9IHRoaXMuZ2xDYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCB7XG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0pO1xuICBcbn0pOyIsIi8qXG4gKiAgQXNzZXRMaXN0LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFzc2V0TGlzdFwiLCB7XG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9hZGVkOiBbXSxcbiAgICAgIGlzTG9hZGVkOiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXT8gdHJ1ZTogZmFsc2U7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChhc3NldFR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicHJlbG9hZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAvLyBcImZpZ2h0ZXJcIjogXCJhc3NldHMvdGV4dHVyZXMvZmlnaHRlci5wbmdcIixcbiAgICAgICAgICAgICAgICAvLyBcInBhcnRpY2xlXCI6IFwiYXNzZXRzL3RleHR1cmVzL3BhcnRpY2xlLnBuZ1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJ2c1wiOiBcImFzc2V0cy92ZXJ0ZXgudnNcIixcbiAgICAgICAgICAgICAgICBcImZzXCI6IFwiYXNzZXRzL2ZyYWdtZW50LmZzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBNYWluU2NlbmUuanNcbiAqICAyMDE4LzEwLzI2XG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkJhc2VTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogJ0Rpc3BsYXlTY2VuZScsXG5cbiAgICAvL+W7g+ajhOOCqOODrOODoeODs+ODiFxuICAgIGRpc3Bvc2VFbGVtZW50czogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG5cbiAgICAgIC8v44K344O844Oz6Zui6ISx5pmCY2FudmFz44Oh44Oi44Oq6Kej5pS+XG4gICAgICB0aGlzLmRpc3Bvc2VFbGVtZW50cyA9IFtdO1xuICAgICAgdGhpcy5hcHAgPSBwaGluYV9hcHA7XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge30sXG5cbiAgICBmYWRlSW46IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICBtaWxsaXNlY29uZDogNTAwLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSBSZWN0YW5nbGVTaGFwZSh7XG4gICAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgfSkuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIICogMC41LCBTQ1JFRU5fSEVJR0hUICogMC41KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICBtYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgIC5mYWRlT3V0KG9wdGlvbnMubWlsbGlzZWNvbmQpXG4gICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdGhpcy5hcHAub25lKCdlbnRlcmZyYW1lJywgKCkgPT4gbWFzay5kZXN0cm95Q2FudmFzKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZhZGVPdXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICBtaWxsaXNlY29uZDogNTAwLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSBSZWN0YW5nbGVTaGFwZSh7XG4gICAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgfSkuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIICogMC41LCBTQ1JFRU5fSEVJR0hUICogMC41KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICBtYXNrLmFscGhhID0gMDtcbiAgICAgICAgbWFzay50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAuZmFkZUluKG9wdGlvbnMubWlsbGlzZWNvbmQpXG4gICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdGhpcy5hcHAub25lKCdlbnRlcmZyYW1lJywgKCkgPT4gbWFzay5kZXN0cm95Q2FudmFzKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v44K344O844Oz6Zui6ISx5pmC44Gr56C05qOE44GZ44KLU2hhcGXjgpLnmbvpjLJcbiAgICByZWdpc3REaXNwb3NlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB0aGlzLmRpc3Bvc2VFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgIH0sXG4gIH0pO1xuXG59KTsiLCIvKlxuICogIEZpcnN0U2NlbmVGbG93LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkZpcnN0U2NlbmVGbG93XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIk1hbmFnZXJTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBzdGFydExhYmVsID0gb3B0aW9ucy5zdGFydExhYmVsIHx8IFwidGl0bGVcIjtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgc3RhcnRMYWJlbDogc3RhcnRMYWJlbCxcbiAgICAgICAgc2NlbmVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJUaXRsZVNjZW5lXCIsXG4gICAgICAgICAgICBuZXh0TGFiZWw6IFwiaG9tZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwibWFpblwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIk1haW5TY2VuZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdnbENhbnZhcycsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5MYXllcicsXG5cbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gY2FudmFzO1xuICAgIH0sXG4gIH0pO1xufSk7IiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnZ2xDYW52YXNMYXllcicsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5MYXllcicsXG5cbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIHdpZHRoOiBjYW52YXMud2lkdGgsXG4gICAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodCxcbiAgICAgIH07XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGNhbnZhcztcblxuICAgICAgLy/jgr/jg5bliIfjgormm7/jgYjmmYLjgatkcmF3aW5nQnVmZmVy44KS44Kv44Oq44Ki44GZ44KLQ2hyb21l44Gu44OQ44Kw77yf5a++562WXG4gICAgICAvLyB0aGlzLmJ1ZmZlciA9IGNhbnZhcy5jbG9uZU5vZGUoKTtcbiAgICAgIC8vIHRoaXMuYnVmZmVyQ29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG4gICAgfSxcbiAgICBkcmF3OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIGlmICghdGhpcy5kb21FbGVtZW50KSByZXR1cm4gO1xuXG4gICAgICBjb25zdCBpbWFnZSA9IHRoaXMuZG9tRWxlbWVudDtcbiAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZShpbWFnZSxcbiAgICAgICAgMCwgMCwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCxcbiAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLm9yaWdpblgsIC10aGlzLmhlaWdodCAqIHRoaXMub3JpZ2luWSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdNYWluU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuXG4gICAgICBjb25zdCBnbExheWVyID0gZ2xDYW52YXNMYXllcihwaGluYV9hcHAuZ2xDYW52YXMpXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgLy8gY29uc3QgY2FudmFzID0gZ2xDYW52YXMocGhpbmFfYXBwLmdsQ2FudmFzKTtcbiAgICAgIC8vIFNwcml0ZShjYW52YXMsIDMwMCwgMzAwKVxuICAgICAgLy8gICAuc2V0UG9zaXRpb24oMTAwLCAxMDApXG4gICAgICAvLyAgIC5zZXRTY2FsZSgwLjIsIDAuMilcbiAgICAgIC8vICAgLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgIExhYmVsKHsgdGV4dDogXCJ0ZXN0XCIsIGZpbGw6IFwid2hpdGVcIiwgYWxpZ246IFwibGVmdFwiLCBiYXNlbGluZTogXCJ0b3BcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oMTAsIDEwKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuXG4gICAgICB0aGlzLnNldHVwKCk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuXG4gICAgICBjb25zdCB2cyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAndnMnKS5kYXRhO1xuICAgICAgY29uc3QgZnMgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0ZXh0JywgJ2ZzJykuZGF0YTtcblxuICAgICAgLy8gY2FudmFzIOOBqOOCr+OCqeODvOOCv+ODi+OCquODs+OCkuOCsOODreODvOODkOODq+OBq+aJseOBhlxuICAgICAgY29uc3QgcSA9IG5ldyBxdG5JVigpO1xuICAgICAgY29uc3QgcXQgPSBxLmlkZW50aXR5KHEuY3JlYXRlKCkpO1xuICAgXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJbjgZnjgovoibLjgpLoqK3lrprjgZnjgotcbiAgICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgIFxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyW44GZ44KL6Zqb44Gu5rex5bqm44KS6Kit5a6a44GZ44KLXG4gICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgXG4gICAgICAvLyDpoILngrnjgrfjgqfjg7zjg4Djgajjg5Xjg6njgrDjg6Hjg7Pjg4jjgrfjgqfjg7zjg4Djga7nlJ/miJBcbiAgICAgIGNvbnN0IHZfc2hhZGVyID0gdGhpcy5jcmVhdGVTaGFkZXIoXCJ2c1wiLCB2cyk7XG4gICAgICBjb25zdCBmX3NoYWRlciA9IHRoaXMuY3JlYXRlU2hhZGVyKFwiZnNcIiwgZnMpO1xuXG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJDjgajjg6rjg7Pjgq9cbiAgICAgIGNvbnN0IHByZyA9IHRoaXMuY3JlYXRlUHJvZ3JhbSh2X3NoYWRlciwgZl9zaGFkZXIpO1xuICAgICAgXG4gICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgYXR0TG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIGF0dExvY2F0aW9uWzBdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAncG9zaXRpb24nKTtcbiAgICAgIGF0dExvY2F0aW9uWzFdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAnbm9ybWFsJyk7XG4gICAgICBhdHRMb2NhdGlvblsyXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ2NvbG9yJyk7XG4gICAgICBhdHRMb2NhdGlvblszXSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByZywgJ3RleHR1cmVDb29yZCcpO1xuXG4gICAgICAvLyBhdHRyaWJ1dGXjga7opoHntKDmlbDjgpLphY3liJfjgavmoLzntI1cbiAgICAgIGNvbnN0IGF0dFN0cmlkZSA9IG5ldyBBcnJheSgpO1xuICAgICAgYXR0U3RyaWRlWzBdID0gMztcbiAgICAgIGF0dFN0cmlkZVsxXSA9IDM7XG4gICAgICBhdHRTdHJpZGVbMl0gPSA0O1xuICAgICAgYXR0U3RyaWRlWzNdID0gMjtcbiAgICBcbiAgICAgIC8vVkJPL0lCT+eUn+aIkFxuICAgICAgY29uc3QgY3ViZURhdGEgICAgICA9IGN1YmUoMi4wLCBbMS4wLCAxLjAsIDEuMCwgMS4wXSk7XG4gICAgICBjb25zdCBjUG9zaXRpb24gICAgID0gdGhpcy5jcmVhdGVWYm8oY3ViZURhdGEucCk7XG4gICAgICBjb25zdCBjTm9ybWFsICAgICAgID0gdGhpcy5jcmVhdGVWYm8oY3ViZURhdGEubik7XG4gICAgICBjb25zdCBjQ29sb3IgICAgICAgID0gdGhpcy5jcmVhdGVWYm8oY3ViZURhdGEuYyk7XG4gICAgICBjb25zdCBjVGV4dHVyZUNvb3JkID0gdGhpcy5jcmVhdGVWYm8oY3ViZURhdGEudCk7XG4gICAgICBjb25zdCBjVkJPTGlzdCAgICAgID0gW2NQb3NpdGlvbiwgY05vcm1hbCwgY0NvbG9yLCBjVGV4dHVyZUNvb3JkXTtcbiAgICAgIGNvbnN0IGNJbmRleCAgICAgICAgPSB0aGlzLmNyZWF0ZUlibyhjdWJlRGF0YS5pKTsgICAgICAgICAgICAgIFxuXG4gICAgICAvLyDnkIPkvZPjg6Ljg4fjg6tcbiAgICAgIGNvbnN0IGVhcnRoRGF0YSAgICAgPSBzcGhlcmUoNjQsIDY0LCAxLjAsIFsxLjAsIDEuMCwgMS4wLCAxLjBdKTtcbiAgICAgIGNvbnN0IGVQb3NpdGlvbiAgICAgPSB0aGlzLmNyZWF0ZVZibyhlYXJ0aERhdGEucCk7XG4gICAgICBjb25zdCBlTm9ybWFsICAgICAgID0gdGhpcy5jcmVhdGVWYm8oZWFydGhEYXRhLm4pO1xuICAgICAgY29uc3QgZUNvbG9yICAgICAgICA9IHRoaXMuY3JlYXRlVmJvKGVhcnRoRGF0YS5jKTtcbiAgICAgIGNvbnN0IGVUZXh0dXJlQ29vcmQgPSB0aGlzLmNyZWF0ZVZibyhlYXJ0aERhdGEudCk7XG4gICAgICBjb25zdCBlVkJPTGlzdCAgICAgID0gW2VQb3NpdGlvbiwgZU5vcm1hbCwgZUNvbG9yLCBlVGV4dHVyZUNvb3JkXTtcbiAgICAgIGNvbnN0IGVJbmRleCAgICAgICAgPSB0aGlzLmNyZWF0ZUlibyhlYXJ0aERhdGEuaSk7XG5cbiAgICAgIC8vIHVuaWZvcm1Mb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgdW5pTG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIHVuaUxvY2F0aW9uWzBdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ21NYXRyaXgnKTtcbiAgICAgIHVuaUxvY2F0aW9uWzFdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ212cE1hdHJpeCcpO1xuICAgICAgdW5pTG9jYXRpb25bMl0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAnaW52TWF0cml4Jyk7XG4gICAgICB1bmlMb2NhdGlvblszXSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICdsaWdodERpcmVjdGlvbicpO1xuICAgICAgdW5pTG9jYXRpb25bNF0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAndXNlTGlnaHQnKTtcbiAgICAgIHVuaUxvY2F0aW9uWzVdID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ3RleHR1cmUnKTtcblxuICAgICAgLy8g5ZCE56iu6KGM5YiX44Gu55Sf5oiQ44Go5Yid5pyf5YyWXG4gICAgICBjb25zdCBtID0gbmV3IG1hdElWKCk7XG4gICAgICBjb25zdCBtTWF0cml4ICAgPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3Qgdk1hdHJpeCAgID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHBNYXRyaXggICA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCB0bXBNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgbXZwTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IGludk1hdHJpeCA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBcbiAgICAgIC8vIOa3seW6puODhuOCueODiOOCkuacieWKueOBq+OBmeOCi1xuICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgZ2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XG5cbiAgICAgIC8vIOODhuOCr+OCueODgeODo+OCkueUn+aIkFxuICAgICAgdGhpcy50ZXh0dXJlID0gW107XG4gICAgICB0aGlzLmNyZWF0ZVRleHR1cmUoJ2Fzc2V0cy90ZXh0dXJlMi5wbmcnLCAwKTtcbiAgICAgIHRoaXMuY3JlYXRlVGV4dHVyZSgnYXNzZXRzL3RleHR1cmUzLnBuZycsIDEpO1xuICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XG4gICAgICBcbiAgICAgIC8vIOODleODrOODvOODoOODkOODg+ODleOCoeOCquODluOCuOOCp+OCr+ODiOOBruWPluW+l1xuICAgICAgY29uc3QgZkJ1ZmZlcldpZHRoICA9IDUxMjtcbiAgICAgIGNvbnN0IGZCdWZmZXJIZWlnaHQgPSA1MTI7XG4gICAgICBjb25zdCBmQnVmZmVyID0gdGhpcy5jcmVhdGVGcmFtZWJ1ZmZlcihmQnVmZmVyV2lkdGgsIGZCdWZmZXJIZWlnaHQpO1xuXHRcdFxuICAgICAgLy8g44Kr44Km44Oz44K/44Gu5a6j6KiAXG4gICAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgICB0aGlzLm9uKCdlbnRlcmZyYW1lJywgKCkgPT4ge1xuICAgICAgICAvLyDjgqvjgqbjg7Pjgr/jgpLjgqTjg7Pjgq/jg6rjg6Hjg7Pjg4jjgZnjgotcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgXG4gICAgICAgIC8vIOOCq+OCpuODs+OCv+OCkuWFg+OBq+ODqeOCuOOCouODs+OCkueul+WHulxuICAgICAgICB2YXIgcmFkICA9IChjb3VudCAlIDM2MCkgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICB2YXIgcmFkMiA9IChjb3VudCAlIDcyMCkgKiBNYXRoLlBJIC8gMzYwO1xuICAgICAgICBcbiAgICAgICAgLy8g44OV44Os44O844Og44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJXG4gICAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZkJ1ZmZlci5mcmFtZUJ1ZmZlcik7XG4gICAgICAgIFxuICAgICAgICAvLyDjg5Xjg6zjg7zjg6Djg5Djg4Pjg5XjgqHjgpLliJ3mnJ/ljJZcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWcsOeQg+eUqOOBrlZCT+OBqElCT+OCkuOCu+ODg+ODiFxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShlVkJPTGlzdCwgYXR0TG9jYXRpb24sIGF0dFN0cmlkZSk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGVJbmRleCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg6njgqTjg4jplqLpgKNcbiAgICAgICAgdmFyIGxpZ2h0RGlyZWN0aW9uID0gWy0xLjAsIDIuMCwgMS4wXTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODk+ODpeODvMOX44OX44Ot44K444Kn44Kv44K344On44Oz5bqn5qiZ5aSJ5o+b6KGM5YiXXG4gICAgICAgIG0ubG9va0F0KFswLjAsIDAuMCwgNS4wXSwgWzAsIDAsIDBdLCBbMCwgMSwgMF0sIHZNYXRyaXgpO1xuICAgICAgICBtLnBlcnNwZWN0aXZlKDQ1LCBmQnVmZmVyV2lkdGggLyBmQnVmZmVySGVpZ2h0LCAwLjEsIDEwMCwgcE1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkocE1hdHJpeCwgdk1hdHJpeCwgdG1wTWF0cml4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiDjOaZr+eUqOeQg+S9k+OCkuODleODrOODvOODoOODkOODg+ODleOCoeOBq+ODrOODs+ODgOODquODs+OCsFxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0aGlzLnRleHR1cmVbMV0pO1xuICAgICAgICBtLmlkZW50aXR5KG1NYXRyaXgpO1xuICAgICAgICBtLnNjYWxlKG1NYXRyaXgsIFs1MC4wLCA1MC4wLCA1MC4wXSwgbU1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkodG1wTWF0cml4LCBtTWF0cml4LCBtdnBNYXRyaXgpO1xuICAgICAgICBtLmludmVyc2UobU1hdHJpeCwgaW52TWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblswXSwgZmFsc2UsIG1NYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzFdLCBmYWxzZSwgbXZwTWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblsyXSwgZmFsc2UsIGludk1hdHJpeCk7XG4gICAgICAgIGdsLnVuaWZvcm0zZnYodW5pTG9jYXRpb25bM10sIGxpZ2h0RGlyZWN0aW9uKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHVuaUxvY2F0aW9uWzRdLCBmYWxzZSk7XG4gICAgICAgIGdsLnVuaWZvcm0xaSh1bmlMb2NhdGlvbls1XSwgMCk7XG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIGVhcnRoRGF0YS5pLmxlbmd0aCwgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICBcbiAgICAgICAgLy8g5Zyw55CD5pys5L2T44KS44OV44Os44O844Og44OQ44OD44OV44Kh44Gr44Os44Oz44OA44Oq44Oz44KwXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZVswXSk7XG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIHJhZCwgWzAsIDEsIDBdLCBtTWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseSh0bXBNYXRyaXgsIG1NYXRyaXgsIG12cE1hdHJpeCk7XG4gICAgICAgIG0uaW52ZXJzZShtTWF0cml4LCBpbnZNYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzBdLCBmYWxzZSwgbU1hdHJpeCk7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pTG9jYXRpb25bMV0sIGZhbHNlLCBtdnBNYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzJdLCBmYWxzZSwgaW52TWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHVuaUxvY2F0aW9uWzRdLCB0cnVlKTtcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgZWFydGhEYXRhLmkubGVuZ3RoLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg5Xjg6zjg7zjg6Djg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLop6PpmaRcbiAgICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC43LCAwLjcsIDEuMCk7XG4gICAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kt44Ol44O844OW44GuVkJP44GoSUJP44KS44K744OD44OIXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGNWQk9MaXN0LCBhdHRMb2NhdGlvbiwgYXR0U3RyaWRlKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgY0luZGV4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODleODrOODvOODoOODkOODg+ODleOCoeOBq+aPj+OBjei+vOOCk+OBoOWGheWuueOCkuODhuOCr+OCueODgeODo+OBqOOBl+OBpumBqeeUqFxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBmQnVmZmVyLnRleHR1cmUpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Op44Kk44OI6Zai6YCjXG4gICAgICAgIGxpZ2h0RGlyZWN0aW9uID0gWy0xLjAsIDAuMCwgMC4wXTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODk+ODpeODvMOX44OX44Ot44K444Kn44Kv44K344On44Oz5bqn5qiZ5aSJ5o+b6KGM5YiXXG4gICAgICAgIG0ubG9va0F0KFswLjAsIDAuMCwgNS4wXSwgWzAsIDAsIDBdLCBbMCwgMSwgMF0sIHZNYXRyaXgpO1xuICAgICAgICBtLnBlcnNwZWN0aXZlKDQ1LCB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQsIDAuMSwgMTAwLCBwTWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseShwTWF0cml4LCB2TWF0cml4LCB0bXBNYXRyaXgpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kt44Ol44O844OW44KS44Os44Oz44OA44Oq44Oz44KwXG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIHJhZDIsIFsxLCAxLCAwXSwgbU1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkodG1wTWF0cml4LCBtTWF0cml4LCBtdnBNYXRyaXgpO1xuICAgICAgICBtLmludmVyc2UobU1hdHJpeCwgaW52TWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblswXSwgZmFsc2UsIG1NYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzFdLCBmYWxzZSwgbXZwTWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1bmlMb2NhdGlvblsyXSwgZmFsc2UsIGludk1hdHJpeCk7XG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIGN1YmVEYXRhLmkubGVuZ3RoLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjgrPjg7Pjg4bjgq3jgrnjg4jjga7lho3mj4/nlLtcbiAgICAgICAgZ2wuZmx1c2goKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIOOCt+OCp+ODvOODgOOCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVNoYWRlcjogZnVuY3Rpb24odHlwZSwgZGF0YSl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuagvOe0jeOBmeOCi+WkieaVsFxuICAgICAgdmFyIHNoYWRlcjtcbiAgICAgIFxuICAgICAgLy8gc2NyaXB044K/44Kw44GudHlwZeWxnuaAp+OCkuODgeOCp+ODg+OCr1xuICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgIC8vIOmggueCueOCt+OCp+ODvOODgOOBruWgtOWQiFxuICAgICAgICAgIGNhc2UgJ3ZzJzpcbiAgICAgICAgICAgICAgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgLy8g44OV44Op44Kw44Oh44Oz44OI44K344Kn44O844OA44Gu5aC05ZCIXG4gICAgICAgICAgY2FzZSAnZnMnOlxuICAgICAgICAgICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GV44KM44Gf44K344Kn44O844OA44Gr44K944O844K544KS5Ymy44KK5b2T44Gm44KLXG4gICAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBkYXRhKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44KS44Kz44Oz44OR44Kk44Or44GZ44KLXG4gICAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOBjOato+OBl+OBj+OCs+ODs+ODkeOCpOODq+OBleOCjOOBn+OBi+ODgeOCp+ODg+OCr1xuICAgICAgaWYoZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44K344Kn44O844OA44KS6L+U44GX44Gm57WC5LqGXG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5aSx5pWX44GX44Gm44GE44Gf44KJ44Ko44Op44O844Ot44Kw44KS44Ki44Op44O844OI44GZ44KLXG4gICAgICAgIGFsZXJ0KGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLnlJ/miJDjgZfjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq/jgZnjgovplqLmlbBcbiAgICBjcmVhdGVQcm9ncmFtOiBmdW5jdGlvbih2cywgZnMpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgXG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgavjgrfjgqfjg7zjg4DjgpLlibLjgorlvZPjgabjgotcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2cyk7XG4gICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq9cbiAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4Djga7jg6rjg7Pjgq/jgYzmraPjgZfjgY/ooYzjgarjgo/jgozjgZ/jgYvjg4Hjgqfjg4Pjgq9cbiAgICAgIGlmKGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDlpLHmlZfjgZfjgabjgYTjgZ/jgonjgqjjg6njg7zjg63jgrDjgpLjgqLjg6njg7zjg4jjgZnjgotcbiAgICAgICAgYWxlcnQoZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gVkJP44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlVmJvOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgdmJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZibyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxuICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoZGF0YSksIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBl+OBnyBWQk8g44KS6L+U44GX44Gm57WC5LqGXG4gICAgICByZXR1cm4gdmJvO1xuICAgIH0sXG4gICAgLy8gVkJP44KS44OQ44Kk44Oz44OJ44GX55m76Yyy44GZ44KL6Zai5pWwXG4gICAgc2V0QXR0cmlidXRlOiBmdW5jdGlvbih2Ym8sIGF0dEwsIGF0dFMpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g5byV5pWw44Go44GX44Gm5Y+X44GR5Y+W44Gj44Gf6YWN5YiX44KS5Yem55CG44GZ44KLXG4gICAgICBmb3IodmFyIGkgaW4gdmJvKXtcbiAgICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym9baV0pO1xuICAgICAgICBcbiAgICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLmnInlirnjgavjgZnjgotcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0TFtpXSk7XG4gICAgICAgIFxuICAgICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumAmuefpeOBl+eZu+mMsuOBmeOCi1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dExbaV0sIGF0dFNbaV0sIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBJQk/jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVJYm86IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgaWJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaWJvKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gr44OH44O844K/44KS44K744OD44OIXG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgSW50MTZBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZfjgZ9JQk/jgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiBpYm87XG4gICAgfSxcbiAgICAgIFxuICAgIC8vIOODhuOCr+OCueODgeODo+OCkueUn+aIkOOBmeOCi+mWouaVsFxuXHQgIGNyZWF0ZVRleHR1cmU6IGZ1bmN0aW9uKHNvdXJjZSwgbnVtKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44Kk44Oh44O844K444Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIFxuICAgICAgLy8g44OH44O844K/44Gu44Kq44Oz44Ot44O844OJ44KS44OI44Oq44Ks44O844Gr44GZ44KLXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6Pjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgICAgY29uc3QgdGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgbjjgqTjg6Hjg7zjgrjjgpLpgannlKhcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWcpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Of44OD44OX44Oe44OD44OX44KS55Sf5oiQXG4gICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKGdsLlRFWFRVUkVfMkQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIG51bGwpO1xuICAgICAgICBcbiAgICAgICAgLy8g55Sf5oiQ44GX44Gf44OG44Kv44K544OB44Oj44KS44Kw44Ot44O844OQ44Or5aSJ5pWw44Gr5Luj5YWlXG4gICAgICAgIHRoaXMudGV4dHVyZVtudW1dID0gdGV4O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwidGV4dHVyZSBsb2FkIGZpbmlzaGVkLlwiKVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgLy8g44Kk44Oh44O844K444Kq44OW44K444Kn44Kv44OI44Gu44K944O844K544KS5oyH5a6aXG4gICAgICBpbWcuc3JjID0gc291cmNlO1xuICAgIH0sXG4gICAgLy8g44OV44Os44O844Og44OQ44OD44OV44Kh44KS44Kq44OW44K444Kn44Kv44OI44Go44GX44Gm55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlRnJhbWVidWZmZXI6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuXG4gICAgICAvLyDjg5Xjg6zjg7zjg6Djg5Djg4Pjg5XjgqHjga7nlJ/miJBcbiAgICAgIGNvbnN0IGZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICAgIFxuICAgICAgLy8g44OV44Os44O844Og44OQ44OD44OV44Kh44KSV2ViR0zjgavjg5DjgqTjg7Pjg4lcbiAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgZnJhbWVCdWZmZXIpO1xuICAgICAgXG4gICAgICAvLyDmt7Hluqbjg5Djg4Pjg5XjgqHnlKjjg6zjg7Pjg4Djg7zjg5Djg4Pjg5XjgqHjga7nlJ/miJDjgajjg5DjgqTjg7Pjg4lcbiAgICAgIGNvbnN0IGRlcHRoUmVuZGVyQnVmZmVyID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgZGVwdGhSZW5kZXJCdWZmZXIpO1xuICAgICAgXG4gICAgICAvLyDjg6zjg7Pjg4Djg7zjg5Djg4Pjg5XjgqHjgpLmt7Hluqbjg5Djg4Pjg5XjgqHjgajjgZfjgaboqK3lrppcbiAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoZ2wuUkVOREVSQlVGRkVSLCBnbC5ERVBUSF9DT01QT05FTlQxNiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBcbiAgICAgIC8vIOODleODrOODvOODoOODkOODg+ODleOCoeOBq+ODrOODs+ODgOODvOODkOODg+ODleOCoeOCkumWoumAo+S7mOOBkeOCi1xuICAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIGdsLkRFUFRIX0FUVEFDSE1FTlQsIGdsLlJFTkRFUkJVRkZFUiwgZGVwdGhSZW5kZXJCdWZmZXIpO1xuICAgICAgXG4gICAgICAvLyDjg5Xjg6zjg7zjg6Djg5Djg4Pjg5XjgqHnlKjjg4bjgq/jgrnjg4Hjg6Pjga7nlJ/miJBcbiAgICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICBcbiAgICAgIC8vIOODleODrOODvOODoOODkOODg+ODleOCoeeUqOOBruODhuOCr+OCueODgeODo+OCkuODkOOCpOODs+ODiVxuICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XG4gICAgICBcbiAgICAgIC8vIOODleODrOODvOODoOODkOODg+ODleOCoeeUqOOBruODhuOCr+OCueODgeODo+OBq+OCq+ODqeODvOeUqOOBruODoeODouODqumgmOWfn+OCkueiuuS/nVxuICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCB3aWR0aCwgaGVpZ2h0LCAwLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBudWxsKTtcbiAgICAgIFxuICAgICAgLy8g44OG44Kv44K544OB44Oj44OR44Op44Oh44O844K/XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgXG4gICAgICAvLyDjg5Xjg6zjg7zjg6Djg5Djg4Pjg5XjgqHjgavjg4bjgq/jgrnjg4Hjg6PjgpLplqLpgKPku5jjgZHjgotcbiAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSwgMCk7XG4gICAgICBcbiAgICAgIC8vIOWQhOeoruOCquODluOCuOOCp+OCr+ODiOOBruODkOOCpOODs+ODieOCkuino+mZpFxuICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKGdsLlJFTkRFUkJVRkZFUiwgbnVsbCk7XG4gICAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDjgqrjg5bjgrjjgqfjgq/jg4jjgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiB7IGZyYW1lQnVmZmVyLCBkZXB0aFJlbmRlckJ1ZmZlciwgdGV4dHVyZSB9O1xuICAgIH1cbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBUaXRsZVNjZW5lLmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnVGl0bGVTY2VuZScsIHtcbiAgICBzdXBlckNsYXNzOiAnQmFzZVNjZW5lJyxcblxuICAgIF9zdGF0aWM6IHtcbiAgICAgIGlzQXNzZXRMb2FkOiBmYWxzZSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgdGhpcy51bmxvY2sgPSBmYWxzZTtcbiAgICAgIHRoaXMubG9hZGNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB0aGlzLnByb2dyZXNzID0gMDtcblxuICAgICAgLy/jg63jg7zjg4nmuIjjgb/jgarjgonjgqLjgrvjg4Pjg4jjg63jg7zjg4njgpLjgZfjgarjgYRcbiAgICAgIGlmIChUaXRsZVNjZW5lLmlzQXNzZXRMb2FkKSB7XG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vcHJlbG9hZCBhc3NldFxuICAgICAgICBjb25zdCBhc3NldHMgPSBBc3NldExpc3QuZ2V0KFwicHJlbG9hZFwiKVxuICAgICAgICB0aGlzLmxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgICAgIHRoaXMubG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgICAgdGhpcy5sb2FkZXIub24oJ2xvYWQnLCAoKSA9PiB0aGlzLnNldHVwKCkpO1xuICAgICAgICBUaXRsZVNjZW5lLmlzQXNzZXRMb2FkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgYmFjayA9IFJlY3RhbmdsZVNoYXBlKHsgd2lkdGg6IFNDUkVFTl9XSURUSCwgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULCBmaWxsOiBcImJsYWNrXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgdGhpcy5yZWdpc3REaXNwb3NlKGJhY2spO1xuXG4gICAgICBjb25zdCBsYWJlbCA9IExhYmVsKHsgdGV4dDogXCJUaXRsZVNjZW5lXCIsIGZpbGw6IFwid2hpdGVcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIX0hBTEYsIFNDUkVFTl9IRUlHSFRfSEFMRilcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICB0aGlzLnJlZ2lzdERpc3Bvc2UobGFiZWwpO1xuXG4gICAgICB0aGlzLm9uZSgnbmV4dHNjZW5lJywgKCkgPT4gdGhpcy5leGl0KFwibWFpblwiKSk7XG4gICAgICB0aGlzLmZsYXJlKCduZXh0c2NlbmUnKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gIH0pO1xuXG59KTtcbiJdfQ==

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
      uniLocation[1]  = gl.getUniformLocation(prg, 'texture0');
      uniLocation[2]  = gl.getUniformLocation(prg, 'texture1');
      
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
            
      // テクスチャ用変数の宣言
      this.texture = [];
      
      // テクスチャを生成
      this.createTexture('assets/texture0.png', 0);
      this.createTexture('assets/texture1.png', 1);
      
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
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture[0]);
        gl.uniform1i(uniLocation[1], 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture[1]);
        gl.uniform1i(uniLocation[2], 1);
                
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
	  createTexture: function(source, num){
      const gl = phina_app.gl;
      // イメージオブジェクトの生成
      var img = new Image();
      
      // データのオンロードをトリガーにする
      img.onload = () => {
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
        this.texture[num] = tex;

        console.log("texture load finished.")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIiwiMDIwX3NjZW5lL21haW5zY2VuZS5qcyIsIjAyMF9zY2VuZS90aXRsZXNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogIEFzc2V0TGlzdC5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBc3NldExpc3RcIiwge1xuICAgIF9zdGF0aWM6IHtcbiAgICAgIGxvYWRlZDogW10sXG4gICAgICBpc0xvYWRlZDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIHJldHVybiBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0/IHRydWU6IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oYXNzZXRUeXBlKSB7XG4gICAgICAgIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXSA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAoYXNzZXRUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInByZWxvYWRcIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBcInZzXCI6IFwiYXNzZXRzL3ZlcnRleC52c1wiLFxuICAgICAgICAgICAgICAgIFwiZnNcIjogXCJhc3NldHMvZnJhZ21lbnQuZnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIG1haW4uanNcbiAqL1xuXG5waGluYS5nbG9iYWxpemUoKTtcblxuY29uc3QgU0NSRUVOX1dJRFRIID0gNTEyO1xuY29uc3QgU0NSRUVOX0hFSUdIVCA9IDUxMjtcbmNvbnN0IFNDUkVFTl9XSURUSF9IQUxGID0gU0NSRUVOX1dJRFRIICogMC41O1xuY29uc3QgU0NSRUVOX0hFSUdIVF9IQUxGID0gU0NSRUVOX0hFSUdIVCAqIDAuNTtcblxuY29uc3QgU0NSRUVOX09GRlNFVF9YID0gMDtcbmNvbnN0IFNDUkVFTl9PRkZTRVRfWSA9IDA7XG5cbmxldCBwaGluYV9hcHA7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgcGhpbmFfYXBwID0gQXBwbGljYXRpb24oKTtcbiAgcGhpbmFfYXBwLmVuYWJsZVN0YXRzKCk7XG4gIHBoaW5hX2FwcC5yZXBsYWNlU2NlbmUoRmlyc3RTY2VuZUZsb3coe30pKTtcbiAgcGhpbmFfYXBwLnJ1bigpO1xufTtcbiIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoXCJBcHBsaWNhdGlvblwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkNhbnZhc0FwcFwiLFxuXG4gICAgcXVhbGl0eTogMS4wLFxuICBcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgZnBzOiA2MCxcbiAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgICBmaXQ6IHRydWUsXG4gICAgICB9KTtcbiAgXG4gICAgICAvL+OCt+ODvOODs+OBruW5heOAgemrmOOBleOBruWfuuacrOOCkuioreWumlxuICAgICAgcGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmUuZGVmYXVsdHMuJGV4dGVuZCh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmdsQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICB0aGlzLmdsQ2FudmFzLndpZHRoID0gU0NSRUVOX1dJRFRIO1xuICAgICAgdGhpcy5nbENhbnZhcy5oZWlnaHQgPSBTQ1JFRU5fSEVJR0hUO1xuICAgICAgdGhpcy5nbCA9IHRoaXMuZ2xDYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wnLCB7XG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH0pO1xuICBcbn0pOyIsIi8qXG4gKiAgQXNzZXRMaXN0LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkFzc2V0TGlzdFwiLCB7XG4gICAgX3N0YXRpYzoge1xuICAgICAgbG9hZGVkOiBbXSxcbiAgICAgIGlzTG9hZGVkOiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIEFzc2V0TGlzdC5sb2FkZWRbYXNzZXRUeXBlXT8gdHJ1ZTogZmFsc2U7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbihhc3NldFR5cGUpIHtcbiAgICAgICAgQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChhc3NldFR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwicHJlbG9hZFwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgICAvLyBcImZpZ2h0ZXJcIjogXCJhc3NldHMvdGV4dHVyZXMvZmlnaHRlci5wbmdcIixcbiAgICAgICAgICAgICAgICAvLyBcInBhcnRpY2xlXCI6IFwiYXNzZXRzL3RleHR1cmVzL3BhcnRpY2xlLnBuZ1wiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJ2c1wiOiBcImFzc2V0cy92ZXJ0ZXgudnNcIixcbiAgICAgICAgICAgICAgICBcImZzXCI6IFwiYXNzZXRzL2ZyYWdtZW50LmZzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBNYWluU2NlbmUuanNcbiAqICAyMDE4LzEwLzI2XG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkJhc2VTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogJ0Rpc3BsYXlTY2VuZScsXG5cbiAgICAvL+W7g+ajhOOCqOODrOODoeODs+ODiFxuICAgIGRpc3Bvc2VFbGVtZW50czogbnVsbCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG5cbiAgICAgIC8v44K344O844Oz6Zui6ISx5pmCY2FudmFz44Oh44Oi44Oq6Kej5pS+XG4gICAgICB0aGlzLmRpc3Bvc2VFbGVtZW50cyA9IFtdO1xuICAgICAgdGhpcy5hcHAgPSBwaGluYV9hcHA7XG4gICAgfSxcblxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge30sXG5cbiAgICBmYWRlSW46IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICBtaWxsaXNlY29uZDogNTAwLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSBSZWN0YW5nbGVTaGFwZSh7XG4gICAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgfSkuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIICogMC41LCBTQ1JFRU5fSEVJR0hUICogMC41KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICBtYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgIC5mYWRlT3V0KG9wdGlvbnMubWlsbGlzZWNvbmQpXG4gICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdGhpcy5hcHAub25lKCdlbnRlcmZyYW1lJywgKCkgPT4gbWFzay5kZXN0cm95Q2FudmFzKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGZhZGVPdXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSAob3B0aW9ucyB8fCB7fSkuJHNhZmUoe1xuICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICBtaWxsaXNlY29uZDogNTAwLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hc2sgPSBSZWN0YW5nbGVTaGFwZSh7XG4gICAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgICBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsXG4gICAgICAgICAgZmlsbDogb3B0aW9ucy5jb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogMCxcbiAgICAgICAgfSkuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIICogMC41LCBTQ1JFRU5fSEVJR0hUICogMC41KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICBtYXNrLmFscGhhID0gMDtcbiAgICAgICAgbWFzay50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAuZmFkZUluKG9wdGlvbnMubWlsbGlzZWNvbmQpXG4gICAgICAgICAgLmNhbGwoKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdGhpcy5hcHAub25lKCdlbnRlcmZyYW1lJywgKCkgPT4gbWFzay5kZXN0cm95Q2FudmFzKCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v44K344O844Oz6Zui6ISx5pmC44Gr56C05qOE44GZ44KLU2hhcGXjgpLnmbvpjLJcbiAgICByZWdpc3REaXNwb3NlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB0aGlzLmRpc3Bvc2VFbGVtZW50cy5wdXNoKGVsZW1lbnQpO1xuICAgIH0sXG4gIH0pO1xuXG59KTsiLCIvKlxuICogIEZpcnN0U2NlbmVGbG93LmpzXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZShcIkZpcnN0U2NlbmVGbG93XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIk1hbmFnZXJTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICBzdGFydExhYmVsID0gb3B0aW9ucy5zdGFydExhYmVsIHx8IFwidGl0bGVcIjtcbiAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgc3RhcnRMYWJlbDogc3RhcnRMYWJlbCxcbiAgICAgICAgc2NlbmVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJUaXRsZVNjZW5lXCIsXG4gICAgICAgICAgICBuZXh0TGFiZWw6IFwiaG9tZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IFwibWFpblwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIk1haW5TY2VuZVwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdnbENhbnZhcycsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5MYXllcicsXG5cbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gY2FudmFzO1xuICAgIH0sXG4gIH0pO1xufSk7IiwicGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gIHBoaW5hLmRlZmluZSgnZ2xDYW52YXNMYXllcicsIHtcbiAgICBzdXBlckNsYXNzOiAncGhpbmEuZGlzcGxheS5MYXllcicsXG5cbiAgICBpbml0OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIHdpZHRoOiBjYW52YXMud2lkdGgsXG4gICAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodCxcbiAgICAgIH07XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGNhbnZhcztcblxuICAgICAgLy/jgr/jg5bliIfjgormm7/jgYjmmYLjgatkcmF3aW5nQnVmZmVy44KS44Kv44Oq44Ki44GZ44KLQ2hyb21l44Gu44OQ44Kw77yf5a++562WXG4gICAgICB0aGlzLmJ1ZmZlciA9IGNhbnZhcy5jbG9uZU5vZGUoKTtcbiAgICAgIHRoaXMuYnVmZmVyQ29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG4gICAgfSxcbiAgICBkcmF3OiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgIGlmICghdGhpcy5kb21FbGVtZW50KSByZXR1cm4gO1xuXG4gICAgICBjb25zdCBpbWFnZSA9IHRoaXMuZG9tRWxlbWVudDtcbiAgICAgIHRoaXMuYnVmZmVyQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICAgICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMuYnVmZmVyLFxuICAgICAgICAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LFxuICAgICAgICAtdGhpcy53aWR0aCAqIHRoaXMub3JpZ2luWCwgLXRoaXMuaGVpZ2h0ICogdGhpcy5vcmlnaW5ZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgKTtcbiAgICB9LFxuICB9KTtcbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ01haW5TY2VuZScsIHtcbiAgICBzdXBlckNsYXNzOiAnQmFzZVNjZW5lJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJibHVlXCI7XG5cbiAgICAgIGNvbnN0IGdsTGF5ZXIgPSBnbENhbnZhc0xheWVyKHBoaW5hX2FwcC5nbENhbnZhcylcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuXG4gICAgICAvLyBjb25zdCBjYW52YXMgPSBnbENhbnZhcyhwaGluYV9hcHAuZ2xDYW52YXMpO1xuICAgICAgLy8gU3ByaXRlKGNhbnZhcywgMzAwLCAzMDApXG4gICAgICAvLyAgIC5zZXRQb3NpdGlvbigxMDAsIDEwMClcbiAgICAgIC8vICAgLnNldFNjYWxlKDAuMiwgMC4yKVxuICAgICAgLy8gICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgTGFiZWwoeyB0ZXh0OiBcInRlc3RcIiwgZmlsbDogXCJ3aGl0ZVwiLCBhbGlnbjogXCJsZWZ0XCIsIGJhc2VsaW5lOiBcInRvcFwiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbigxMCwgMTApXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG5cbiAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG5cbiAgICAgIGNvbnN0IHZzID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndGV4dCcsICd2cycpLmRhdGE7XG4gICAgICBjb25zdCBmcyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAnZnMnKS5kYXRhO1xuXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJbjgZnjgovoibLjgpLoqK3lrprjgZnjgotcbiAgICAgIGdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgIFxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyW44GZ44KL6Zqb44Gu5rex5bqm44KS6Kit5a6a44GZ44KLXG4gICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgXG4gICAgICAvLyDpoILngrnjgrfjgqfjg7zjg4Djgajjg5Xjg6njgrDjg6Hjg7Pjg4jjgrfjgqfjg7zjg4Djga7nlJ/miJBcbiAgICAgIGNvbnN0IHZfc2hhZGVyID0gdGhpcy5jcmVhdGVTaGFkZXIoXCJ2c1wiLCB2cyk7XG4gICAgICBjb25zdCBmX3NoYWRlciA9IHRoaXMuY3JlYXRlU2hhZGVyKFwiZnNcIiwgZnMpO1xuXG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJDjgajjg6rjg7Pjgq9cbiAgICAgIGNvbnN0IHByZyA9IHRoaXMuY3JlYXRlUHJvZ3JhbSh2X3NoYWRlciwgZl9zaGFkZXIpO1xuICAgICAgXG4gICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgYXR0TG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIGF0dExvY2F0aW9uWzBdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAncG9zaXRpb24nKTtcbiAgICAgIGF0dExvY2F0aW9uWzFdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAnY29sb3InKTtcbiAgICAgIGF0dExvY2F0aW9uWzJdID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJnLCAndGV4dHVyZUNvb3JkJyk7XG5cbiAgICAgIC8vIGF0dHJpYnV0ZeOBruimgee0oOaVsOOCkumFjeWIl+OBq+agvOe0jVxuICAgICAgY29uc3QgYXR0U3RyaWRlID0gbmV3IEFycmF5KCk7XG4gICAgICBhdHRTdHJpZGVbMF0gPSAzO1xuICAgICAgYXR0U3RyaWRlWzFdID0gNDtcbiAgICAgIGF0dFN0cmlkZVsyXSA9IDI7XG5cbiAgICAgIC8vIOmggueCueOBruS9jee9rlxuICAgICAgY29uc3QgcG9zaXRpb24gPSBbXG4gICAgICAgIC0xLjAsICAxLjAsICAwLjAsXG4gICAgICAgICAxLjAsICAxLjAsICAwLjAsXG4gICAgICAgIC0xLjAsIC0xLjAsICAwLjAsXG4gICAgICAgICAxLjAsIC0xLjAsICAwLjBcbiAgICAgIF07XG5cbiAgICAgIC8vIOmggueCueiJslxuICAgICAgY29uc3QgY29sb3IgPSBbXG4gICAgICAgIDEuMCwgMS4wLCAxLjAsIDEuMCxcbiAgICAgICAgMS4wLCAxLjAsIDEuMCwgMS4wLFxuICAgICAgICAxLjAsIDEuMCwgMS4wLCAxLjAsXG4gICAgICAgIDEuMCwgMS4wLCAxLjAsIDEuMFxuICAgICAgXTtcblxuICAgICAgLy8g44OG44Kv44K544OB44Oj5bqn5qiZXG4gICAgICBjb25zdCB0ZXh0dXJlQ29vcmQgPSBbXG4gICAgICAgIDAuMCwgMC4wLFxuICAgICAgICAxLjAsIDAuMCxcbiAgICAgICAgMC4wLCAxLjAsXG4gICAgICAgIDEuMCwgMS4wXG4gICAgICBdO1xuXG4gICAgICAvLyDpoILngrnjgqTjg7Pjg4fjg4Pjgq/jgrlcbiAgICAgIGNvbnN0IGluZGV4ID0gW1xuICAgICAgICAwLCAxLCAyLFxuICAgICAgICAzLCAyLCAxXG4gICAgICBdO1xuICAgICAgLy8gVkJP44GoSUJP44Gu55Sf5oiQXG4gICAgICBjb25zdCB2UG9zaXRpb24gICAgID0gdGhpcy5jcmVhdGVWYm8ocG9zaXRpb24pO1xuICAgICAgY29uc3QgdkNvbG9yICAgICAgICA9IHRoaXMuY3JlYXRlVmJvKGNvbG9yKTtcbiAgICAgIGNvbnN0IHZUZXh0dXJlQ29vcmQgPSB0aGlzLmNyZWF0ZVZibyh0ZXh0dXJlQ29vcmQpO1xuICAgICAgY29uc3QgVkJPTGlzdCAgICAgICA9IFt2UG9zaXRpb24sIHZDb2xvciwgdlRleHR1cmVDb29yZF07XG4gICAgICBjb25zdCBpSW5kZXggICAgICAgID0gdGhpcy5jcmVhdGVJYm8oaW5kZXgpO1xuXG4gICAgICAvLyBWQk/jgahJQk/jga7nmbvpjLJcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFZCT0xpc3QsIGF0dExvY2F0aW9uLCBhdHRTdHJpZGUpO1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaUluZGV4KTtcblxuICAgICAgLy8gdW5pZm9ybUxvY2F0aW9u44KS6YWN5YiX44Gr5Y+W5b6XXG4gICAgICBjb25zdCB1bmlMb2NhdGlvbiA9IG5ldyBBcnJheSgpO1xuICAgICAgdW5pTG9jYXRpb25bMF0gID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ212cE1hdHJpeCcpO1xuICAgICAgdW5pTG9jYXRpb25bMV0gID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByZywgJ3RleHR1cmUwJyk7XG4gICAgICB1bmlMb2NhdGlvblsyXSAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAndGV4dHVyZTEnKTtcbiAgICAgIFxuICAgICAgLy8g5ZCE56iu6KGM5YiX44Gu55Sf5oiQ44Go5Yid5pyf5YyWXG4gICAgICBjb25zdCBtID0gbmV3IG1hdElWKCk7XG4gICAgICBjb25zdCBtTWF0cml4ICAgPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3Qgdk1hdHJpeCAgID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHBNYXRyaXggICA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCB0bXBNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgbXZwTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIFxuICAgICAgLy8g44OT44Ol44O8w5fjg5fjg63jgrjjgqfjgq/jgrfjg6fjg7PluqfmqJnlpInmj5vooYzliJdcbiAgICAgIG0ubG9va0F0KFswLjAsIDIuMCwgNS4wXSwgWzAsIDAsIDBdLCBbMCwgMSwgMF0sIHZNYXRyaXgpO1xuICAgICAgbS5wZXJzcGVjdGl2ZSg0NSwgdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0LCAwLjEsIDEwMCwgcE1hdHJpeCk7XG4gICAgICBtLm11bHRpcGx5KHBNYXRyaXgsIHZNYXRyaXgsIHRtcE1hdHJpeCk7XG4gICAgICBcbiAgICAgIC8vIOa3seW6puODhuOCueODiOOCkuacieWKueOBq+OBmeOCi1xuICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgZ2wuZGVwdGhGdW5jKGdsLkxFUVVBTCk7XG4gICAgICAgICAgICBcbiAgICAgIC8vIOODhuOCr+OCueODgeODo+eUqOWkieaVsOOBruWuo+iogFxuICAgICAgdGhpcy50ZXh0dXJlID0gW107XG4gICAgICBcbiAgICAgIC8vIOODhuOCr+OCueODgeODo+OCkueUn+aIkFxuICAgICAgdGhpcy5jcmVhdGVUZXh0dXJlKCdhc3NldHMvdGV4dHVyZTAucG5nJywgMCk7XG4gICAgICB0aGlzLmNyZWF0ZVRleHR1cmUoJ2Fzc2V0cy90ZXh0dXJlMS5wbmcnLCAxKTtcbiAgICAgIFxuICAgICAgLy8g44Kr44Km44Oz44K/44Gu5a6j6KiAXG4gICAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgICB0aGlzLm9uKCdlbnRlcmZyYW1lJywgKCkgPT4ge1xuICAgICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJZcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOOCq+OCpuODs+OCv+OCkuWFg+OBq+ODqeOCuOOCouODs+OCkueul+WHulxuICAgICAgICBjb3VudCsrO1xuICAgICAgICBjb25zdCByYWQgPSAoY291bnQgJSAzNjApICogTWF0aC5QSSAvIDE4MDtcbiAgICAgICAgXG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlWzBdKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHVuaUxvY2F0aW9uWzFdLCAwKTtcblxuICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUxKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlWzFdKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHVuaUxvY2F0aW9uWzJdLCAxKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgLy8gdW5pZm9ybeWkieaVsOOBq+ODhuOCr+OCueODgeODo+OCkueZu+mMslxuICAgICAgICBnbC51bmlmb3JtMWkodW5pTG9jYXRpb25bMV0sIDApO1xuICAgICAgICBcbiAgICAgICAgLy8g44Oi44OH44Or5bqn5qiZ5aSJ5o+b6KGM5YiX44Gu55Sf5oiQXG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIHJhZCwgWzAsIDEsIDBdLCBtTWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseSh0bXBNYXRyaXgsIG1NYXRyaXgsIG12cE1hdHJpeCk7XG4gICAgICAgIFxuICAgICAgICAvLyB1bmlmb3Jt5aSJ5pWw44Gu55m76Yyy44Go5o+P55S7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pTG9jYXRpb25bMF0sIGZhbHNlLCBtdnBNYXRyaXgpO1xuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCBpbmRleC5sZW5ndGgsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOOCs+ODs+ODhuOCreOCueODiOOBruWGjeaPj+eUu1xuICAgICAgICBnbC5mbHVzaCgpO1xuICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8g44K344Kn44O844OA44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlU2hhZGVyOiBmdW5jdGlvbih0eXBlLCBkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44K344Kn44O844OA44KS5qC857SN44GZ44KL5aSJ5pWwXG4gICAgICB2YXIgc2hhZGVyO1xuICAgICAgXG4gICAgICAvLyBzY3JpcHTjgr/jgrDjga50eXBl5bGe5oCn44KS44OB44Kn44OD44KvXG4gICAgICBzd2l0Y2godHlwZSl7XG4gICAgICAgICAgLy8g6aCC54K544K344Kn44O844OA44Gu5aC05ZCIXG4gICAgICAgICAgY2FzZSAndnMnOlxuICAgICAgICAgICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAvLyDjg5Xjg6njgrDjg6Hjg7Pjg4jjgrfjgqfjg7zjg4Djga7loLTlkIhcbiAgICAgICAgICBjYXNlICdmcyc6XG4gICAgICAgICAgICAgIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZXjgozjgZ/jgrfjgqfjg7zjg4Djgavjgr3jg7zjgrnjgpLlibLjgorlvZPjgabjgotcbiAgICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIGRhdGEpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLjgrPjg7Pjg5HjgqTjg6vjgZnjgotcbiAgICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44GM5q2j44GX44GP44Kz44Oz44OR44Kk44Or44GV44KM44Gf44GL44OB44Kn44OD44KvXG4gICAgICBpZihnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpe1xuICAgICAgICAvLyDmiJDlip/jgZfjgabjgYTjgZ/jgonjgrfjgqfjg7zjg4DjgpLov5TjgZfjgabntYLkuoZcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDlpLHmlZfjgZfjgabjgYTjgZ/jgonjgqjjg6njg7zjg63jgrDjgpLjgqLjg6njg7zjg4jjgZnjgotcbiAgICAgICAgYWxlcnQoZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkueUn+aIkOOBl+OCt+OCp+ODvOODgOOCkuODquODs+OCr+OBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVByb2dyYW06IGZ1bmN0aW9uKHZzLCBmcyl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkFxuICAgICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgICBcbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBq+OCt+OCp+ODvOODgOOCkuWJsuOCiuW9k+OBpuOCi1xuICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcyk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuODquODs+OCr1xuICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOBruODquODs+OCr+OBjOato+OBl+OBj+ihjOOBquOCj+OCjOOBn+OBi+ODgeOCp+ODg+OCr1xuICAgICAgaWYoZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpe1xuICAgICAgICAvLyDmiJDlip/jgZfjgabjgYTjgZ/jgonjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLmnInlirnjgavjgZnjgotcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgLy8g44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS6L+U44GX44Gm57WC5LqGXG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgICAgfWVsc2V7XG4gICAgICAgIC8vIOWkseaVl+OBl+OBpuOBhOOBn+OCieOCqOODqeODvOODreOCsOOCkuOCouODqeODvOODiOOBmeOCi1xuICAgICAgICBhbGVydChnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBWQk/jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVWYm86IGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciB2Ym8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmJvKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gr44OH44O844K/44KS44K744OD44OIXG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GX44GfIFZCTyDjgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiB2Ym87XG4gICAgfSxcbiAgICAvLyBWQk/jgpLjg5DjgqTjg7Pjg4njgZfnmbvpjLLjgZnjgovplqLmlbBcbiAgICBzZXRBdHRyaWJ1dGU6IGZ1bmN0aW9uKHZibywgYXR0TCwgYXR0Uykge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDlvJXmlbDjgajjgZfjgablj5fjgZHlj5bjgaPjgZ/phY3liJfjgpLlh6bnkIbjgZnjgotcbiAgICAgIGZvcih2YXIgaSBpbiB2Ym8pe1xuICAgICAgICAvLyDjg5Djg4Pjg5XjgqHjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZib1tpXSk7XG4gICAgICAgIFxuICAgICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkuacieWKueOBq+OBmeOCi1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhdHRMW2ldKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGF0dHJpYnV0ZUxvY2F0aW9u44KS6YCa55+l44GX55m76Yyy44GZ44KLXG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoYXR0TFtpXSwgYXR0U1tpXSwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIElCT+OCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZUlibzogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBpYm8gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpYm8pO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjgavjg4fjg7zjgr/jgpLjgrvjg4Pjg4hcbiAgICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBJbnQxNkFycmF5KGRhdGEpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBruODkOOCpOODs+ODieOCkueEoeWKueWMllxuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBl+OBn0lCT+OCkui/lOOBl+OBpue1guS6hlxuICAgICAgcmV0dXJuIGlibztcbiAgICB9LFxuXG4gICAgY3JlYXRlVG9ydXM6IGZ1bmN0aW9uKHJvdywgY29sdW1uLCBpcmFkLCBvcmFkKSB7XG4gICAgICBmdW5jdGlvbiBoc3ZhKGgsIHMsIHYsIGEpe1xuICAgICAgICBpZihzID4gMSB8fCB2ID4gMSB8fCBhID4gMSl7cmV0dXJuO31cbiAgICAgICAgdmFyIHRoID0gaCAlIDM2MDtcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKHRoIC8gNjApO1xuICAgICAgICB2YXIgZiA9IHRoIC8gNjAgLSBpO1xuICAgICAgICB2YXIgbSA9IHYgKiAoMSAtIHMpO1xuICAgICAgICB2YXIgbiA9IHYgKiAoMSAtIHMgKiBmKTtcbiAgICAgICAgdmFyIGsgPSB2ICogKDEgLSBzICogKDEgLSBmKSk7XG4gICAgICAgIHZhciBjb2xvciA9IG5ldyBBcnJheSgpO1xuICAgICAgICBpZighcyA+IDAgJiYgIXMgPCAwKXtcbiAgICAgICAgICBjb2xvci5wdXNoKHYsIHYsIHYsIGEpOyBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgciA9IG5ldyBBcnJheSh2LCBuLCBtLCBtLCBrLCB2KTtcbiAgICAgICAgICB2YXIgZyA9IG5ldyBBcnJheShrLCB2LCB2LCBuLCBtLCBtKTtcbiAgICAgICAgICB2YXIgYiA9IG5ldyBBcnJheShtLCBtLCBrLCB2LCB2LCBuKTtcbiAgICAgICAgICBjb2xvci5wdXNoKHJbaV0sIGdbaV0sIGJbaV0sIGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9zID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBub3IgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGNvbCA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgaWR4ID0gbmV3IEFycmF5KCk7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDw9IHJvdzsgaSsrKXtcbiAgICAgICAgY29uc3QgciA9IE1hdGguUEkgKiAyIC8gcm93ICogaTtcbiAgICAgICAgY29uc3QgcnIgPSBNYXRoLmNvcyhyKTtcbiAgICAgICAgY29uc3QgcnkgPSBNYXRoLnNpbihyKTtcbiAgICAgICAgZm9yKGxldCBpaSA9IDA7IGlpIDw9IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgY29uc3QgdHIgPSBNYXRoLlBJICogMiAvIGNvbHVtbiAqIGlpO1xuICAgICAgICAgIGNvbnN0IHR4ID0gKHJyICogaXJhZCArIG9yYWQpICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHR5ID0gcnkgKiBpcmFkO1xuICAgICAgICAgIGNvbnN0IHR6ID0gKHJyICogaXJhZCArIG9yYWQpICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIGNvbnN0IHJ4ID0gcnIgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgcnogPSByciAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBwb3MucHVzaCh0eCwgdHksIHR6KTtcbiAgICAgICAgICBub3IucHVzaChyeCwgcnksIHJ6KTtcbiAgICAgICAgICBjb25zdCB0YyA9IGhzdmEoMzYwIC8gY29sdW1uICogaWksIDEsIDEsIDEpO1xuICAgICAgICAgIGNvbC5wdXNoKHRjWzBdLCB0Y1sxXSwgdGNbMl0sIHRjWzNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yKGkgPSAwOyBpIDwgcm93OyBpKyspe1xuICAgICAgICBmb3IoaWkgPSAwOyBpaSA8IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgciA9IChjb2x1bW4gKyAxKSAqIGkgKyBpaTtcbiAgICAgICAgICBpZHgucHVzaChyLCByICsgY29sdW1uICsgMSwgciArIDEpO1xuICAgICAgICAgIGlkeC5wdXNoKHIgKyBjb2x1bW4gKyAxLCByICsgY29sdW1uICsgMiwgciArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbiA6IHBvcyxcbiAgICAgICAgbm9ybWFsIDogbm9yLFxuICAgICAgICBjb2xvciA6IGNvbCxcbiAgICAgICAgaW5kZXggOiBpZHhcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZVNwaGVyZTogZnVuY3Rpb24ocm93LCBjb2x1bW4sIHJhZCwgY29sb3IpIHtcbiAgICAgIGNvbnN0IHBvcyA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3Qgbm9yID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBjb2wgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGlkeCA9IG5ldyBBcnJheSgpO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSByb3c7IGkrKyl7XG4gICAgICAgIGNvbnN0IHIgPSBNYXRoLlBJIC8gcm93ICogaTtcbiAgICAgICAgY29uc3QgcnkgPSBNYXRoLmNvcyhyKTtcbiAgICAgICAgY29uc3QgcnIgPSBNYXRoLnNpbihyKTtcbiAgICAgICAgZm9yKGxldCBpaSA9IDA7IGlpIDw9IGNvbHVtbjsgaWkrKyl7XG4gICAgICAgICAgY29uc3QgdHIgPSBNYXRoLlBJICogMiAvIGNvbHVtbiAqIGlpO1xuICAgICAgICAgIGNvbnN0IHR4ID0gcnIgKiByYWQgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgdHkgPSByeSAqIHJhZDtcbiAgICAgICAgICBjb25zdCB0eiA9IHJyICogcmFkICogTWF0aC5zaW4odHIpO1xuICAgICAgICAgIGNvbnN0IHJ4ID0gcnIgKiBNYXRoLmNvcyh0cik7XG4gICAgICAgICAgY29uc3QgcnogPSByciAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBsZXQgdGM7XG4gICAgICAgICAgaWYoY29sb3Ipe1xuICAgICAgICAgICAgdGMgPSBjb2xvcjtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRjID0gaHN2YSgzNjAgLyByb3cgKiBpLCAxLCAxLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcG9zLnB1c2godHgsIHR5LCB0eik7XG4gICAgICAgICAgbm9yLnB1c2gocngsIHJ5LCByeik7XG4gICAgICAgICAgY29sLnB1c2godGNbMF0sIHRjWzFdLCB0Y1syXSwgdGNbM10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByID0gMDtcbiAgICAgIGZvcihpID0gMDsgaSA8IHJvdzsgaSsrKXtcbiAgICAgICAgZm9yKGlpID0gMDsgaWkgPCBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIHIgPSAoY29sdW1uICsgMSkgKiBpICsgaWk7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIDEsIHIgKyBjb2x1bW4gKyAyKTtcbiAgICAgICAgICBpZHgucHVzaChyLCByICsgY29sdW1uICsgMiwgciArIGNvbHVtbiArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbiA6IHBvcyxcbiAgICAgICAgbm9ybWFsIDogbm9yLFxuICAgICAgICBjb2xvciA6IGNvbCxcbiAgICAgICAgaW5kZXggOiBpZHhcbiAgICAgIH07XG4gICAgfSxcbiAgXG4gICAgLy8g44OG44Kv44K544OB44Oj44KS55Sf5oiQ44GZ44KL6Zai5pWwXG5cdCAgY3JlYXRlVGV4dHVyZTogZnVuY3Rpb24oc291cmNlLCBudW0pe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjgqTjg6Hjg7zjgrjjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIFxuICAgICAgLy8g44OH44O844K/44Gu44Kq44Oz44Ot44O844OJ44KS44OI44Oq44Ks44O844Gr44GZ44KLXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6Pjgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgICAgdmFyIHRleCA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXgpO1xuICAgICAgICBcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44G444Kk44Oh44O844K444KS6YGp55SoXG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1nKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODn+ODg+ODl+ODnuODg+ODl+OCkueUn+aIkFxuICAgICAgICBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OBruODkOOCpOODs+ODieOCkueEoeWKueWMllxuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBudWxsKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOeUn+aIkOOBl+OBn+ODhuOCr+OCueODgeODo+OCkuOCsOODreODvOODkOODq+WkieaVsOOBq+S7o+WFpVxuICAgICAgICB0aGlzLnRleHR1cmVbbnVtXSA9IHRleDtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInRleHR1cmUgbG9hZCBmaW5pc2hlZC5cIilcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIOOCpOODoeODvOOCuOOCquODluOCuOOCp+OCr+ODiOOBruOCveODvOOCueOCkuaMh+WumlxuICAgICAgaW1nLnNyYyA9IHNvdXJjZTtcbiAgICB9XG4gIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgVGl0bGVTY2VuZS5qc1xuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ1RpdGxlU2NlbmUnLCB7XG4gICAgc3VwZXJDbGFzczogJ0Jhc2VTY2VuZScsXG5cbiAgICBfc3RhdGljOiB7XG4gICAgICBpc0Fzc2V0TG9hZDogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG5cbiAgICAgIC8v44Ot44O844OJ5riI44G/44Gq44KJ44Ki44K744OD44OI44Ot44O844OJ44KS44GX44Gq44GEXG4gICAgICBpZiAoVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCkge1xuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgICAgY29uc3QgYXNzZXRzID0gQXNzZXRMaXN0LmdldChcInByZWxvYWRcIilcbiAgICAgICAgdGhpcy5sb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICB0aGlzLmxvYWRlci5sb2FkKGFzc2V0cyk7XG4gICAgICAgIHRoaXMubG9hZGVyLm9uKCdsb2FkJywgKCkgPT4gdGhpcy5zZXR1cCgpKTtcbiAgICAgICAgVGl0bGVTY2VuZS5pc0Fzc2V0TG9hZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJhY2sgPSBSZWN0YW5nbGVTaGFwZSh7IHdpZHRoOiBTQ1JFRU5fV0lEVEgsIGhlaWdodDogU0NSRUVOX0hFSUdIVCwgZmlsbDogXCJibGFja1wiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShiYWNrKTtcblxuICAgICAgY29uc3QgbGFiZWwgPSBMYWJlbCh7IHRleHQ6IFwiVGl0bGVTY2VuZVwiLCBmaWxsOiBcIndoaXRlXCIgfSlcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgdGhpcy5yZWdpc3REaXNwb3NlKGxhYmVsKTtcblxuICAgICAgdGhpcy5vbmUoJ25leHRzY2VuZScsICgpID0+IHRoaXMuZXhpdChcIm1haW5cIikpO1xuICAgICAgdGhpcy5mbGFyZSgnbmV4dHNjZW5lJyk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICB9KTtcblxufSk7XG4iXX0=

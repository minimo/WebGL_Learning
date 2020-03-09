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

      const eLines     = true;
      const eLineStrip = false;
      const eLineLoop  = false;
      const ePointSize = 300;
    
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

      // attributeの要素数を配列に格納
      const attStride = new Array();
      attStride[0] = 3;
      attStride[1] = 4;

      // 点のVBO生成
      const pointSphere = this.createSphere(16, 16, 2.0);
      const pPos = this.createVbo(pointSphere.position);
      const pCol = this.createVbo(pointSphere.color);
      const pVBOList = [pPos, pCol];

      // 線のVBOの生成
      const plane = this.createPlane(1.0);
      const lPosition     = this.createVbo(plane.position);
      const lColor        = this.createVbo(plane.color);
      const lVBOList       = [lPosition, lColor];

      // uniformLocationを配列に取得
      const uniLocation = new Array();
      uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
      uniLocation[1]  = gl.getUniformLocation(prg, 'pointSize');
      uniLocation[2]  = gl.getUniformLocation(prg, 'texture');
      uniLocation[3]  = gl.getUniformLocation(prg, 'useTexture');
          
          
      // 各種行列の生成と初期化
      const m = new matIV();
      const mMatrix   = m.identity(m.create());
      const vMatrix   = m.identity(m.create());
      const pMatrix   = m.identity(m.create());
      const tmpMatrix = m.identity(m.create());
      const mvpMatrix = m.identity(m.create());
      
      // 深度テストを有効にする
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);

      // ブレンドファクター
    	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

      // カウンタの宣言
      let count = 0;

      // テクスチャを生成
      this.texture = [];
      this.createTexture('assets/pointsprite_texture.png', 0);

      this.on('enterframe', () => {
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタを元にラジアンを算出
        count++;
        const rad = (count % 360) * Math.PI / 180;
        
        // クォータニオンを行列に適用
        const qMatrix = m.identity(m.create());
        q.toMatIV(qt, qMatrix);

        // ビュー×プロジェクション座標変換行列
        const camPosition = [0.0, 5.0, 10.0];
        m.lookAt(camPosition, [0, 0, 0], [0, 1, 0], vMatrix);
        m.multiply(vMatrix, qMatrix, vMatrix);
        m.perspective(45, this.width / this.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);
        
        // 点のサイズをエレメントから取得
        const pointSize = ePointSize / 10;
        
        // ポイントスプライトに設定するテクスチャをバインド
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture[0]);
        
        // 点を描画
        this.setAttribute(pVBOList, attLocation, attStride);
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniform1f(uniLocation[1], pointSize);
        gl.uniform1i(uniLocation[2], 0);
        gl.uniform1i(uniLocation[3], true);
        gl.drawArrays(gl.POINTS, 0, pointSphere.position.length / 3);
        
        // 線タイプを判別
        let lineOption = 0;
        if(eLines) lineOption = gl.LINES;
        if(eLineStrip) lineOption = gl.LINE_STRIP;
        if(eLineLoop) lineOption = gl.LINE_LOOP;
        
        // 線を描画
        this.setAttribute(lVBOList, attLocation, attStride);
        m.identity(mMatrix);
        m.rotate(mMatrix, Math.PI / 2, [1, 0, 0], mMatrix);
        m.scale(mMatrix, [3.0, 3.0, 1.0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniform1i(uniLocation[3], false);
        gl.drawArrays(lineOption, 0, plane.position.length / 3);
        
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

    createPlane: function(size) {
      // 頂点の位置
      const position = [
        -size,  size,  0.0,
         size,  size,  0.0,
        -size, -size,  0.0,
         size, -size,  0.0
      ];

      // 線の頂点色
      const color = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
      ];

      return { position, color };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzc2V0TGlzdC5qcyIsIm1haW4uanMiLCIwMTBfYXBwbGljYXRpb24vQXBwbGljYXRpb24uanMiLCIwMTBfYXBwbGljYXRpb24vQXNzZXRMaXN0LmpzIiwiMDEwX2FwcGxpY2F0aW9uL0Jhc2VTY2VuZS5qcyIsIjAxMF9hcHBsaWNhdGlvbi9GaXJzdFNjZW5lRmxvdy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhcy5qcyIsIjAxMF9hcHBsaWNhdGlvbi9nbENhbnZhc0xheWVyLmpzIiwiMDIwX3NjZW5lL21haW5zY2VuZS5qcyIsIjAyMF9zY2VuZS90aXRsZXNjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6YkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgICAgICAgXCJ2c1wiOiBcImFzc2V0cy92ZXJ0ZXgudnNcIixcbiAgICAgICAgICAgICAgICBcImZzXCI6IFwiYXNzZXRzL2ZyYWdtZW50LmZzXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGNhc2UgXCJjb21tb25cIjpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGltYWdlOiB7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IFwiaW52YWxpZCBhc3NldFR5cGU6IFwiICsgb3B0aW9ucy5hc3NldFR5cGU7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbn0pO1xuIiwiLypcbiAqICBtYWluLmpzXG4gKi9cblxucGhpbmEuZ2xvYmFsaXplKCk7XG5cbmNvbnN0IFNDUkVFTl9XSURUSCA9IDUxMjtcbmNvbnN0IFNDUkVFTl9IRUlHSFQgPSA1MTI7XG5jb25zdCBTQ1JFRU5fV0lEVEhfSEFMRiA9IFNDUkVFTl9XSURUSCAqIDAuNTtcbmNvbnN0IFNDUkVFTl9IRUlHSFRfSEFMRiA9IFNDUkVFTl9IRUlHSFQgKiAwLjU7XG5cbmNvbnN0IFNDUkVFTl9PRkZTRVRfWCA9IDA7XG5jb25zdCBTQ1JFRU5fT0ZGU0VUX1kgPSAwO1xuXG5sZXQgcGhpbmFfYXBwO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHBoaW5hX2FwcCA9IEFwcGxpY2F0aW9uKCk7XG4gIHBoaW5hX2FwcC5lbmFibGVTdGF0cygpO1xuICBwaGluYV9hcHAucmVwbGFjZVNjZW5lKEZpcnN0U2NlbmVGbG93KHt9KSk7XG4gIHBoaW5hX2FwcC5ydW4oKTtcbn07XG4iLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXBwbGljYXRpb25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5DYW52YXNBcHBcIixcblxuICAgIHF1YWxpdHk6IDEuMCxcbiAgXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgIGZwczogNjAsXG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgZml0OiBmYWxzZSxcbiAgICAgIH0pO1xuICBcbiAgICAgIC8v44K344O844Oz44Gu5bmF44CB6auY44GV44Gu5Z+65pys44KS6Kit5a6aXG4gICAgICBwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZS5kZWZhdWx0cy4kZXh0ZW5kKHtcbiAgICAgICAgd2lkdGg6IFNDUkVFTl9XSURUSCxcbiAgICAgICAgaGVpZ2h0OiBTQ1JFRU5fSEVJR0hULFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZ2xDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIHRoaXMuZ2xDYW52YXMud2lkdGggPSBTQ1JFRU5fV0lEVEg7XG4gICAgICB0aGlzLmdsQ2FudmFzLmhlaWdodCA9IFNDUkVFTl9IRUlHSFQ7XG4gICAgICB0aGlzLmdsID0gdGhpcy5nbENhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcsIHtcbiAgICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG4gIFxufSk7IiwiLypcbiAqICBBc3NldExpc3QuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQXNzZXRMaXN0XCIsIHtcbiAgICBfc3RhdGljOiB7XG4gICAgICBsb2FkZWQ6IFtdLFxuICAgICAgaXNMb2FkZWQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICByZXR1cm4gQXNzZXRMaXN0LmxvYWRlZFthc3NldFR5cGVdPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBnZXQ6IGZ1bmN0aW9uKGFzc2V0VHlwZSkge1xuICAgICAgICBBc3NldExpc3QubG9hZGVkW2Fzc2V0VHlwZV0gPSB0cnVlO1xuICAgICAgICBzd2l0Y2ggKGFzc2V0VHlwZSkge1xuICAgICAgICAgIGNhc2UgXCJwcmVsb2FkXCI6XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgIC8vIFwiZmlnaHRlclwiOiBcImFzc2V0cy90ZXh0dXJlcy9maWdodGVyLnBuZ1wiLFxuICAgICAgICAgICAgICAgIC8vIFwicGFydGljbGVcIjogXCJhc3NldHMvdGV4dHVyZXMvcGFydGljbGUucG5nXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRleHQ6IHtcbiAgICAgICAgICAgICAgICBcInZzXCI6IFwiYXNzZXRzL3ZlcnRleC52c1wiLFxuICAgICAgICAgICAgICAgIFwiZnNcIjogXCJhc3NldHMvZnJhZ21lbnQuZnNcIixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSBcImNvbW1vblwiOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaW1hZ2U6IHtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgXCJpbnZhbGlkIGFzc2V0VHlwZTogXCIgKyBvcHRpb25zLmFzc2V0VHlwZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIE1haW5TY2VuZS5qc1xuICogIDIwMTgvMTAvMjZcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiQmFzZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiAnRGlzcGxheVNjZW5lJyxcblxuICAgIC8v5buD5qOE44Ko44Os44Oh44Oz44OIXG4gICAgZGlzcG9zZUVsZW1lbnRzOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIHdpZHRoOiBTQ1JFRU5fV0lEVEgsXG4gICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zKTtcblxuICAgICAgLy/jgrfjg7zjg7Ppm6LohLHmmYJjYW52YXPjg6Hjg6Ljg6rop6PmlL5cbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzID0gW107XG4gICAgICB0aGlzLmFwcCA9IHBoaW5hX2FwcDtcbiAgICB9LFxuXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7fSxcblxuICAgIGZhZGVJbjogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2sudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgLmZhZGVPdXQob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZmFkZU91dDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IChvcHRpb25zIHx8IHt9KS4kc2FmZSh7XG4gICAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgIG1pbGxpc2Vjb25kOiA1MDAsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgY29uc3QgbWFzayA9IFJlY3RhbmdsZVNoYXBlKHtcbiAgICAgICAgICB3aWR0aDogU0NSRUVOX1dJRFRILFxuICAgICAgICAgIGhlaWdodDogU0NSRUVOX0hFSUdIVCxcbiAgICAgICAgICBmaWxsOiBvcHRpb25zLmNvbG9yLFxuICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuICAgICAgICB9KS5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEggKiAwLjUsIFNDUkVFTl9IRUlHSFQgKiAwLjUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIG1hc2suYWxwaGEgPSAwO1xuICAgICAgICBtYXNrLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgIC5mYWRlSW4ob3B0aW9ucy5taWxsaXNlY29uZClcbiAgICAgICAgICAuY2FsbCgoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLmFwcC5vbmUoJ2VudGVyZnJhbWUnLCAoKSA9PiBtYXNrLmRlc3Ryb3lDYW52YXMoKSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy/jgrfjg7zjg7Ppm6LohLHmmYLjgavnoLTmo4TjgZnjgotTaGFwZeOCkueZu+mMslxuICAgIHJlZ2lzdERpc3Bvc2U6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZGlzcG9zZUVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfSxcbiAgfSk7XG5cbn0pOyIsIi8qXG4gKiAgRmlyc3RTY2VuZUZsb3cuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKFwiRmlyc3RTY2VuZUZsb3dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiTWFuYWdlclNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIHN0YXJ0TGFiZWwgPSBvcHRpb25zLnN0YXJ0TGFiZWwgfHwgXCJ0aXRsZVwiO1xuICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICBzdGFydExhYmVsOiBzdGFydExhYmVsLFxuICAgICAgICBzY2VuZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJ0aXRsZVwiLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlRpdGxlU2NlbmVcIixcbiAgICAgICAgICAgIG5leHRMYWJlbDogXCJob21lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogXCJtYWluXCIsXG4gICAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ2dsQ2FudmFzJywge1xuICAgIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LkxheWVyJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSBjYW52YXM7XG4gICAgfSxcbiAgfSk7XG59KTsiLCJwaGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdnbENhbnZhc0xheWVyJywge1xuICAgIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LkxheWVyJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0LFxuICAgICAgfTtcbiAgICAgIHRoaXMuc3VwZXJJbml0KG9wdGlvbnMpO1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gY2FudmFzO1xuXG4gICAgICAvL+OCv+ODluWIh+OCiuabv+OBiOaZguOBq2RyYXdpbmdCdWZmZXLjgpLjgq/jg6rjgqLjgZnjgotDaHJvbWXjga7jg5DjgrDvvJ/lr77nrZZcbiAgICAgIC8vIHRoaXMuYnVmZmVyID0gY2FudmFzLmNsb25lTm9kZSgpO1xuICAgICAgLy8gdGhpcy5idWZmZXJDb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9LFxuICAgIGRyYXc6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgaWYgKCF0aGlzLmRvbUVsZW1lbnQpIHJldHVybiA7XG5cbiAgICAgIGNvbnN0IGltYWdlID0gdGhpcy5kb21FbGVtZW50O1xuICAgICAgY2FudmFzLmNvbnRleHQuZHJhd0ltYWdlKGltYWdlLFxuICAgICAgICAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0LFxuICAgICAgICAtdGhpcy53aWR0aCAqIHRoaXMub3JpZ2luWCwgLXRoaXMuaGVpZ2h0ICogdGhpcy5vcmlnaW5ZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgKTtcbiAgICB9LFxuICB9KTtcbn0pOyIsInBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuICBwaGluYS5kZWZpbmUoJ01haW5TY2VuZScsIHtcbiAgICBzdXBlckNsYXNzOiAnQmFzZVNjZW5lJyxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJibHVlXCI7XG5cbiAgICAgIGNvbnN0IGdsTGF5ZXIgPSBnbENhbnZhc0xheWVyKHBoaW5hX2FwcC5nbENhbnZhcylcbiAgICAgICAgLnNldFBvc2l0aW9uKFNDUkVFTl9XSURUSF9IQUxGLCBTQ1JFRU5fSEVJR0hUX0hBTEYpXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuXG4gICAgICAvLyBjb25zdCBjYW52YXMgPSBnbENhbnZhcyhwaGluYV9hcHAuZ2xDYW52YXMpO1xuICAgICAgLy8gU3ByaXRlKGNhbnZhcywgMzAwLCAzMDApXG4gICAgICAvLyAgIC5zZXRQb3NpdGlvbigxMDAsIDEwMClcbiAgICAgIC8vICAgLnNldFNjYWxlKDAuMiwgMC4yKVxuICAgICAgLy8gICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgTGFiZWwoeyB0ZXh0OiBcInRlc3RcIiwgZmlsbDogXCJ3aGl0ZVwiLCBhbGlnbjogXCJsZWZ0XCIsIGJhc2VsaW5lOiBcInRvcFwiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbigxMCwgMTApXG4gICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG5cbiAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG5cbiAgICAgIGNvbnN0IHZzID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndGV4dCcsICd2cycpLmRhdGE7XG4gICAgICBjb25zdCBmcyA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RleHQnLCAnZnMnKS5kYXRhO1xuXG4gICAgICAvLyBjYW52YXMg44Go44Kv44Kp44O844K/44OL44Kq44Oz44KS44Kw44Ot44O844OQ44Or44Gr5omx44GGXG4gICAgICBjb25zdCBxID0gbmV3IHF0bklWKCk7XG4gICAgICBjb25zdCBxdCA9IHEuaWRlbnRpdHkocS5jcmVhdGUoKSk7XG5cbiAgICAgIGNvbnN0IGVMaW5lcyAgICAgPSB0cnVlO1xuICAgICAgY29uc3QgZUxpbmVTdHJpcCA9IGZhbHNlO1xuICAgICAgY29uc3QgZUxpbmVMb29wICA9IGZhbHNlO1xuICAgICAgY29uc3QgZVBvaW50U2l6ZSA9IDMwMDtcbiAgICBcbiAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMluOBmeOCi+iJsuOCkuioreWumuOBmeOCi1xuICAgICAgZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgXG4gICAgICAvLyBjYW52YXPjgpLliJ3mnJ/ljJbjgZnjgovpmpvjga7mt7HluqbjgpLoqK3lrprjgZnjgotcbiAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgIFxuICAgICAgLy8gY2FudmFz44KS5Yid5pyf5YyWXG4gICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gICAgICBcbiAgICAgIC8vIOmggueCueOCt+OCp+ODvOODgOOBqOODleODqeOCsOODoeODs+ODiOOCt+OCp+ODvOODgOOBrueUn+aIkFxuICAgICAgY29uc3Qgdl9zaGFkZXIgPSB0aGlzLmNyZWF0ZVNoYWRlcihcInZzXCIsIHZzKTtcbiAgICAgIGNvbnN0IGZfc2hhZGVyID0gdGhpcy5jcmVhdGVTaGFkZXIoXCJmc1wiLCBmcyk7XG5cbiAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOBrueUn+aIkOOBqOODquODs+OCr1xuICAgICAgY29uc3QgcHJnID0gdGhpcy5jcmVhdGVQcm9ncmFtKHZfc2hhZGVyLCBmX3NoYWRlcik7XG4gICAgICBcbiAgICAgIC8vIGF0dHJpYnV0ZUxvY2F0aW9u44KS6YWN5YiX44Gr5Y+W5b6XXG4gICAgICBjb25zdCBhdHRMb2NhdGlvbiA9IG5ldyBBcnJheSgpO1xuICAgICAgYXR0TG9jYXRpb25bMF0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdwb3NpdGlvbicpO1xuICAgICAgYXR0TG9jYXRpb25bMV0gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcmcsICdjb2xvcicpO1xuXG4gICAgICAvLyBhdHRyaWJ1dGXjga7opoHntKDmlbDjgpLphY3liJfjgavmoLzntI1cbiAgICAgIGNvbnN0IGF0dFN0cmlkZSA9IG5ldyBBcnJheSgpO1xuICAgICAgYXR0U3RyaWRlWzBdID0gMztcbiAgICAgIGF0dFN0cmlkZVsxXSA9IDQ7XG5cbiAgICAgIC8vIOeCueOBrlZCT+eUn+aIkFxuICAgICAgY29uc3QgcG9pbnRTcGhlcmUgPSB0aGlzLmNyZWF0ZVNwaGVyZSgxNiwgMTYsIDIuMCk7XG4gICAgICBjb25zdCBwUG9zID0gdGhpcy5jcmVhdGVWYm8ocG9pbnRTcGhlcmUucG9zaXRpb24pO1xuICAgICAgY29uc3QgcENvbCA9IHRoaXMuY3JlYXRlVmJvKHBvaW50U3BoZXJlLmNvbG9yKTtcbiAgICAgIGNvbnN0IHBWQk9MaXN0ID0gW3BQb3MsIHBDb2xdO1xuXG4gICAgICAvLyDnt5rjga5WQk/jga7nlJ/miJBcbiAgICAgIGNvbnN0IHBsYW5lID0gdGhpcy5jcmVhdGVQbGFuZSgxLjApO1xuICAgICAgY29uc3QgbFBvc2l0aW9uICAgICA9IHRoaXMuY3JlYXRlVmJvKHBsYW5lLnBvc2l0aW9uKTtcbiAgICAgIGNvbnN0IGxDb2xvciAgICAgICAgPSB0aGlzLmNyZWF0ZVZibyhwbGFuZS5jb2xvcik7XG4gICAgICBjb25zdCBsVkJPTGlzdCAgICAgICA9IFtsUG9zaXRpb24sIGxDb2xvcl07XG5cbiAgICAgIC8vIHVuaWZvcm1Mb2NhdGlvbuOCkumFjeWIl+OBq+WPluW+l1xuICAgICAgY29uc3QgdW5pTG9jYXRpb24gPSBuZXcgQXJyYXkoKTtcbiAgICAgIHVuaUxvY2F0aW9uWzBdICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICdtdnBNYXRyaXgnKTtcbiAgICAgIHVuaUxvY2F0aW9uWzFdICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICdwb2ludFNpemUnKTtcbiAgICAgIHVuaUxvY2F0aW9uWzJdICA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcmcsICd0ZXh0dXJlJyk7XG4gICAgICB1bmlMb2NhdGlvblszXSAgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJnLCAndXNlVGV4dHVyZScpO1xuICAgICAgICAgIFxuICAgICAgICAgIFxuICAgICAgLy8g5ZCE56iu6KGM5YiX44Gu55Sf5oiQ44Go5Yid5pyf5YyWXG4gICAgICBjb25zdCBtID0gbmV3IG1hdElWKCk7XG4gICAgICBjb25zdCBtTWF0cml4ICAgPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3Qgdk1hdHJpeCAgID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIGNvbnN0IHBNYXRyaXggICA9IG0uaWRlbnRpdHkobS5jcmVhdGUoKSk7XG4gICAgICBjb25zdCB0bXBNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgY29uc3QgbXZwTWF0cml4ID0gbS5pZGVudGl0eShtLmNyZWF0ZSgpKTtcbiAgICAgIFxuICAgICAgLy8g5rex5bqm44OG44K544OI44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTtcbiAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG5cbiAgICAgIC8vIOODluODrOODs+ODieODleOCoeOCr+OCv+ODvFxuICAgIFx0Z2wuYmxlbmRGdW5jU2VwYXJhdGUoZ2wuU1JDX0FMUEhBLCBnbC5PTkVfTUlOVVNfU1JDX0FMUEhBLCBnbC5PTkUsIGdsLk9ORSk7XG5cbiAgICAgIC8vIOOCq+OCpuODs+OCv+OBruWuo+iogFxuICAgICAgbGV0IGNvdW50ID0gMDtcblxuICAgICAgLy8g44OG44Kv44K544OB44Oj44KS55Sf5oiQXG4gICAgICB0aGlzLnRleHR1cmUgPSBbXTtcbiAgICAgIHRoaXMuY3JlYXRlVGV4dHVyZSgnYXNzZXRzL3BvaW50c3ByaXRlX3RleHR1cmUucG5nJywgMCk7XG5cbiAgICAgIHRoaXMub24oJ2VudGVyZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgIC8vIGNhbnZhc+OCkuWIneacn+WMllxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgICAgIGdsLmNsZWFyRGVwdGgoMS4wKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kr44Km44Oz44K/44KS5YWD44Gr44Op44K444Ki44Oz44KS566X5Ye6XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGNvbnN0IHJhZCA9IChjb3VudCAlIDM2MCkgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICBcbiAgICAgICAgLy8g44Kv44Kp44O844K/44OL44Kq44Oz44KS6KGM5YiX44Gr6YGp55SoXG4gICAgICAgIGNvbnN0IHFNYXRyaXggPSBtLmlkZW50aXR5KG0uY3JlYXRlKCkpO1xuICAgICAgICBxLnRvTWF0SVYocXQsIHFNYXRyaXgpO1xuXG4gICAgICAgIC8vIOODk+ODpeODvMOX44OX44Ot44K444Kn44Kv44K344On44Oz5bqn5qiZ5aSJ5o+b6KGM5YiXXG4gICAgICAgIGNvbnN0IGNhbVBvc2l0aW9uID0gWzAuMCwgNS4wLCAxMC4wXTtcbiAgICAgICAgbS5sb29rQXQoY2FtUG9zaXRpb24sIFswLCAwLCAwXSwgWzAsIDEsIDBdLCB2TWF0cml4KTtcbiAgICAgICAgbS5tdWx0aXBseSh2TWF0cml4LCBxTWF0cml4LCB2TWF0cml4KTtcbiAgICAgICAgbS5wZXJzcGVjdGl2ZSg0NSwgdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0LCAwLjEsIDEwMCwgcE1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkocE1hdHJpeCwgdk1hdHJpeCwgdG1wTWF0cml4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOeCueOBruOCteOCpOOCuuOCkuOCqOODrOODoeODs+ODiOOBi+OCieWPluW+l1xuICAgICAgICBjb25zdCBwb2ludFNpemUgPSBlUG9pbnRTaXplIC8gMTA7XG4gICAgICAgIFxuICAgICAgICAvLyDjg53jgqTjg7Pjg4jjgrnjg5fjg6njgqTjg4jjgavoqK3lrprjgZnjgovjg4bjgq/jgrnjg4Hjg6PjgpLjg5DjgqTjg7Pjg4lcbiAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZVswXSk7XG4gICAgICAgIFxuICAgICAgICAvLyDngrnjgpLmj4/nlLtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUocFZCT0xpc3QsIGF0dExvY2F0aW9uLCBhdHRTdHJpZGUpO1xuICAgICAgICBtLmlkZW50aXR5KG1NYXRyaXgpO1xuICAgICAgICBtLnJvdGF0ZShtTWF0cml4LCByYWQsIFswLCAxLCAwXSwgbU1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkodG1wTWF0cml4LCBtTWF0cml4LCBtdnBNYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzBdLCBmYWxzZSwgbXZwTWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKHVuaUxvY2F0aW9uWzFdLCBwb2ludFNpemUpO1xuICAgICAgICBnbC51bmlmb3JtMWkodW5pTG9jYXRpb25bMl0sIDApO1xuICAgICAgICBnbC51bmlmb3JtMWkodW5pTG9jYXRpb25bM10sIHRydWUpO1xuICAgICAgICBnbC5kcmF3QXJyYXlzKGdsLlBPSU5UUywgMCwgcG9pbnRTcGhlcmUucG9zaXRpb24ubGVuZ3RoIC8gMyk7XG4gICAgICAgIFxuICAgICAgICAvLyDnt5rjgr/jgqTjg5fjgpLliKTliKVcbiAgICAgICAgbGV0IGxpbmVPcHRpb24gPSAwO1xuICAgICAgICBpZihlTGluZXMpIGxpbmVPcHRpb24gPSBnbC5MSU5FUztcbiAgICAgICAgaWYoZUxpbmVTdHJpcCkgbGluZU9wdGlvbiA9IGdsLkxJTkVfU1RSSVA7XG4gICAgICAgIGlmKGVMaW5lTG9vcCkgbGluZU9wdGlvbiA9IGdsLkxJTkVfTE9PUDtcbiAgICAgICAgXG4gICAgICAgIC8vIOe3muOCkuaPj+eUu1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShsVkJPTGlzdCwgYXR0TG9jYXRpb24sIGF0dFN0cmlkZSk7XG4gICAgICAgIG0uaWRlbnRpdHkobU1hdHJpeCk7XG4gICAgICAgIG0ucm90YXRlKG1NYXRyaXgsIE1hdGguUEkgLyAyLCBbMSwgMCwgMF0sIG1NYXRyaXgpO1xuICAgICAgICBtLnNjYWxlKG1NYXRyaXgsIFszLjAsIDMuMCwgMS4wXSwgbU1hdHJpeCk7XG4gICAgICAgIG0ubXVsdGlwbHkodG1wTWF0cml4LCBtTWF0cml4LCBtdnBNYXRyaXgpO1xuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVuaUxvY2F0aW9uWzBdLCBmYWxzZSwgbXZwTWF0cml4KTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKHVuaUxvY2F0aW9uWzNdLCBmYWxzZSk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMobGluZU9wdGlvbiwgMCwgcGxhbmUucG9zaXRpb24ubGVuZ3RoIC8gMyk7XG4gICAgICAgIFxuICAgICAgICAvLyDjgrPjg7Pjg4bjgq3jgrnjg4jjga7lho3mj4/nlLtcbiAgICAgICAgZ2wuZmx1c2goKTtcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIC8vIOOCt+OCp+ODvOODgOOCkueUn+aIkOOBmeOCi+mWouaVsFxuICAgIGNyZWF0ZVNoYWRlcjogZnVuY3Rpb24odHlwZSwgZGF0YSl7XG4gICAgICBjb25zdCBnbCA9IHBoaW5hX2FwcC5nbDtcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOCkuagvOe0jeOBmeOCi+WkieaVsFxuICAgICAgdmFyIHNoYWRlcjtcbiAgICAgIFxuICAgICAgLy8gc2NyaXB044K/44Kw44GudHlwZeWxnuaAp+OCkuODgeOCp+ODg+OCr1xuICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgIC8vIOmggueCueOCt+OCp+ODvOODgOOBruWgtOWQiFxuICAgICAgICAgIGNhc2UgJ3ZzJzpcbiAgICAgICAgICAgICAgc2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgLy8g44OV44Op44Kw44Oh44Oz44OI44K344Kn44O844OA44Gu5aC05ZCIXG4gICAgICAgICAgY2FzZSAnZnMnOlxuICAgICAgICAgICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8g55Sf5oiQ44GV44KM44Gf44K344Kn44O844OA44Gr44K944O844K544KS5Ymy44KK5b2T44Gm44KLXG4gICAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBkYXRhKTtcbiAgICAgIFxuICAgICAgLy8g44K344Kn44O844OA44KS44Kz44Oz44OR44Kk44Or44GZ44KLXG4gICAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgICBcbiAgICAgIC8vIOOCt+OCp+ODvOODgOOBjOato+OBl+OBj+OCs+ODs+ODkeOCpOODq+OBleOCjOOBn+OBi+ODgeOCp+ODg+OCr1xuICAgICAgaWYoZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44K344Kn44O844OA44KS6L+U44GX44Gm57WC5LqGXG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgLy8g5aSx5pWX44GX44Gm44GE44Gf44KJ44Ko44Op44O844Ot44Kw44KS44Ki44Op44O844OI44GZ44KLXG4gICAgICAgIGFsZXJ0KGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgpLnlJ/miJDjgZfjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq/jgZnjgovplqLmlbBcbiAgICBjcmVhdGVQcm9ncmFtOiBmdW5jdGlvbih2cywgZnMpe1xuICAgICAgY29uc3QgZ2wgPSBwaGluYV9hcHAuZ2w7XG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjga7nlJ/miJBcbiAgICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgXG4gICAgICAvLyDjg5fjg63jgrDjg6njg6Djgqrjg5bjgrjjgqfjgq/jg4jjgavjgrfjgqfjg7zjg4DjgpLlibLjgorlvZPjgabjgotcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2cyk7XG4gICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4DjgpLjg6rjg7Pjgq9cbiAgICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgXG4gICAgICAvLyDjgrfjgqfjg7zjg4Djga7jg6rjg7Pjgq/jgYzmraPjgZfjgY/ooYzjgarjgo/jgozjgZ/jgYvjg4Hjgqfjg4Pjgq9cbiAgICAgIGlmKGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKXtcbiAgICAgICAgLy8g5oiQ5Yqf44GX44Gm44GE44Gf44KJ44OX44Ot44Kw44Op44Og44Kq44OW44K444Kn44Kv44OI44KS5pyJ5Yq544Gr44GZ44KLXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAgICAgIC8vIOODl+ODreOCsOODqeODoOOCquODluOCuOOCp+OCr+ODiOOCkui/lOOBl+OBpue1guS6hlxuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyDlpLHmlZfjgZfjgabjgYTjgZ/jgonjgqjjg6njg7zjg63jgrDjgpLjgqLjg6njg7zjg4jjgZnjgotcbiAgICAgICAgYWxlcnQoZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gVkJP44KS55Sf5oiQ44GZ44KL6Zai5pWwXG4gICAgY3JlYXRlVmJvOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgdmJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHZibyk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxuICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoZGF0YSksIGdsLlNUQVRJQ19EUkFXKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gu44OQ44Kk44Oz44OJ44KS54Sh5Yq55YyWXG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgICBcbiAgICAgIC8vIOeUn+aIkOOBl+OBnyBWQk8g44KS6L+U44GX44Gm57WC5LqGXG4gICAgICByZXR1cm4gdmJvO1xuICAgIH0sXG4gICAgLy8gVkJP44KS44OQ44Kk44Oz44OJ44GX55m76Yyy44GZ44KL6Zai5pWwXG4gICAgc2V0QXR0cmlidXRlOiBmdW5jdGlvbih2Ym8sIGF0dEwsIGF0dFMpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g5byV5pWw44Go44GX44Gm5Y+X44GR5Y+W44Gj44Gf6YWN5YiX44KS5Yem55CG44GZ44KLXG4gICAgICBmb3IodmFyIGkgaW4gdmJvKXtcbiAgICAgICAgLy8g44OQ44OD44OV44Kh44KS44OQ44Kk44Oz44OJ44GZ44KLXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2Ym9baV0pO1xuICAgICAgICBcbiAgICAgICAgLy8gYXR0cmlidXRlTG9jYXRpb27jgpLmnInlirnjgavjgZnjgotcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0TFtpXSk7XG4gICAgICAgIFxuICAgICAgICAvLyBhdHRyaWJ1dGVMb2NhdGlvbuOCkumAmuefpeOBl+eZu+mMsuOBmeOCi1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dExbaV0sIGF0dFNbaV0sIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBJQk/jgpLnlJ/miJDjgZnjgovplqLmlbBcbiAgICBjcmVhdGVJYm86IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44OQ44OD44OV44Kh44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgaWJvID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICBcbiAgICAgIC8vIOODkOODg+ODleOCoeOCkuODkOOCpOODs+ODieOBmeOCi1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaWJvKTtcbiAgICAgIFxuICAgICAgLy8g44OQ44OD44OV44Kh44Gr44OH44O844K/44KS44K744OD44OIXG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBuZXcgSW50MTZBcnJheShkYXRhKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgXG4gICAgICAvLyDjg5Djg4Pjg5XjgqHjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgICAgXG4gICAgICAvLyDnlJ/miJDjgZfjgZ9JQk/jgpLov5TjgZfjgabntYLkuoZcbiAgICAgIHJldHVybiBpYm87XG4gICAgfSxcblxuICAgIGNyZWF0ZVBsYW5lOiBmdW5jdGlvbihzaXplKSB7XG4gICAgICAvLyDpoILngrnjga7kvY3nva5cbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gW1xuICAgICAgICAtc2l6ZSwgIHNpemUsICAwLjAsXG4gICAgICAgICBzaXplLCAgc2l6ZSwgIDAuMCxcbiAgICAgICAgLXNpemUsIC1zaXplLCAgMC4wLFxuICAgICAgICAgc2l6ZSwgLXNpemUsICAwLjBcbiAgICAgIF07XG5cbiAgICAgIC8vIOe3muOBrumggueCueiJslxuICAgICAgY29uc3QgY29sb3IgPSBbXG4gICAgICAgIDEuMCwgMS4wLCAxLjAsIDEuMCxcbiAgICAgICAgMS4wLCAwLjAsIDAuMCwgMS4wLFxuICAgICAgICAwLjAsIDEuMCwgMC4wLCAxLjAsXG4gICAgICAgIDAuMCwgMC4wLCAxLjAsIDEuMFxuICAgICAgXTtcblxuICAgICAgcmV0dXJuIHsgcG9zaXRpb24sIGNvbG9yIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZVRvcnVzOiBmdW5jdGlvbihyb3csIGNvbHVtbiwgaXJhZCwgb3JhZCkge1xuICAgICAgZnVuY3Rpb24gaHN2YShoLCBzLCB2LCBhKXtcbiAgICAgICAgaWYocyA+IDEgfHwgdiA+IDEgfHwgYSA+IDEpe3JldHVybjt9XG4gICAgICAgIHZhciB0aCA9IGggJSAzNjA7XG4gICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih0aCAvIDYwKTtcbiAgICAgICAgdmFyIGYgPSB0aCAvIDYwIC0gaTtcbiAgICAgICAgdmFyIG0gPSB2ICogKDEgLSBzKTtcbiAgICAgICAgdmFyIG4gPSB2ICogKDEgLSBzICogZik7XG4gICAgICAgIHZhciBrID0gdiAqICgxIC0gcyAqICgxIC0gZikpO1xuICAgICAgICB2YXIgY29sb3IgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgaWYoIXMgPiAwICYmICFzIDwgMCl7XG4gICAgICAgICAgY29sb3IucHVzaCh2LCB2LCB2LCBhKTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHIgPSBuZXcgQXJyYXkodiwgbiwgbSwgbSwgaywgdik7XG4gICAgICAgICAgdmFyIGcgPSBuZXcgQXJyYXkoaywgdiwgdiwgbiwgbSwgbSk7XG4gICAgICAgICAgdmFyIGIgPSBuZXcgQXJyYXkobSwgbSwgaywgdiwgdiwgbik7XG4gICAgICAgICAgY29sb3IucHVzaChyW2ldLCBnW2ldLCBiW2ldLCBhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvcyA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3Qgbm9yID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBjb2wgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IGlkeCA9IG5ldyBBcnJheSgpO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8PSByb3c7IGkrKyl7XG4gICAgICAgIGNvbnN0IHIgPSBNYXRoLlBJICogMiAvIHJvdyAqIGk7XG4gICAgICAgIGNvbnN0IHJyID0gTWF0aC5jb3Mocik7XG4gICAgICAgIGNvbnN0IHJ5ID0gTWF0aC5zaW4ocik7XG4gICAgICAgIGZvcihsZXQgaWkgPSAwOyBpaSA8PSBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIGNvbnN0IHRyID0gTWF0aC5QSSAqIDIgLyBjb2x1bW4gKiBpaTtcbiAgICAgICAgICBjb25zdCB0eCA9IChyciAqIGlyYWQgKyBvcmFkKSAqIE1hdGguY29zKHRyKTtcbiAgICAgICAgICBjb25zdCB0eSA9IHJ5ICogaXJhZDtcbiAgICAgICAgICBjb25zdCB0eiA9IChyciAqIGlyYWQgKyBvcmFkKSAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBjb25zdCByeCA9IHJyICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHJ6ID0gcnIgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgcG9zLnB1c2godHgsIHR5LCB0eik7XG4gICAgICAgICAgbm9yLnB1c2gocngsIHJ5LCByeik7XG4gICAgICAgICAgY29uc3QgdGMgPSBoc3ZhKDM2MCAvIGNvbHVtbiAqIGlpLCAxLCAxLCAxKTtcbiAgICAgICAgICBjb2wucHVzaCh0Y1swXSwgdGNbMV0sIHRjWzJdLCB0Y1szXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvcihpID0gMDsgaSA8IHJvdzsgaSsrKXtcbiAgICAgICAgZm9yKGlpID0gMDsgaWkgPCBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIHIgPSAoY29sdW1uICsgMSkgKiBpICsgaWk7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIGNvbHVtbiArIDEsIHIgKyAxKTtcbiAgICAgICAgICBpZHgucHVzaChyICsgY29sdW1uICsgMSwgciArIGNvbHVtbiArIDIsIHIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcG9zaXRpb24gOiBwb3MsXG4gICAgICAgIG5vcm1hbCA6IG5vcixcbiAgICAgICAgY29sb3IgOiBjb2wsXG4gICAgICAgIGluZGV4IDogaWR4XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjcmVhdGVTcGhlcmU6IGZ1bmN0aW9uKHJvdywgY29sdW1uLCByYWQsIGNvbG9yKSB7XG4gICAgICBjb25zdCBwb3MgPSBuZXcgQXJyYXkoKTtcbiAgICAgIGNvbnN0IG5vciA9IG5ldyBBcnJheSgpO1xuICAgICAgY29uc3QgY29sID0gbmV3IEFycmF5KCk7XG4gICAgICBjb25zdCBpZHggPSBuZXcgQXJyYXkoKTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPD0gcm93OyBpKyspe1xuICAgICAgICBjb25zdCByID0gTWF0aC5QSSAvIHJvdyAqIGk7XG4gICAgICAgIGNvbnN0IHJ5ID0gTWF0aC5jb3Mocik7XG4gICAgICAgIGNvbnN0IHJyID0gTWF0aC5zaW4ocik7XG4gICAgICAgIGZvcihsZXQgaWkgPSAwOyBpaSA8PSBjb2x1bW47IGlpKyspe1xuICAgICAgICAgIGNvbnN0IHRyID0gTWF0aC5QSSAqIDIgLyBjb2x1bW4gKiBpaTtcbiAgICAgICAgICBjb25zdCB0eCA9IHJyICogcmFkICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHR5ID0gcnkgKiByYWQ7XG4gICAgICAgICAgY29uc3QgdHogPSByciAqIHJhZCAqIE1hdGguc2luKHRyKTtcbiAgICAgICAgICBjb25zdCByeCA9IHJyICogTWF0aC5jb3ModHIpO1xuICAgICAgICAgIGNvbnN0IHJ6ID0gcnIgKiBNYXRoLnNpbih0cik7XG4gICAgICAgICAgbGV0IHRjO1xuICAgICAgICAgIGlmKGNvbG9yKXtcbiAgICAgICAgICAgIHRjID0gY29sb3I7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0YyA9IGhzdmEoMzYwIC8gcm93ICogaSwgMSwgMSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvcy5wdXNoKHR4LCB0eSwgdHopO1xuICAgICAgICAgIG5vci5wdXNoKHJ4LCByeSwgcnopO1xuICAgICAgICAgIGNvbC5wdXNoKHRjWzBdLCB0Y1sxXSwgdGNbMl0sIHRjWzNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgciA9IDA7XG4gICAgICBmb3IoaSA9IDA7IGkgPCByb3c7IGkrKyl7XG4gICAgICAgIGZvcihpaSA9IDA7IGlpIDwgY29sdW1uOyBpaSsrKXtcbiAgICAgICAgICByID0gKGNvbHVtbiArIDEpICogaSArIGlpO1xuICAgICAgICAgIGlkeC5wdXNoKHIsIHIgKyAxLCByICsgY29sdW1uICsgMik7XG4gICAgICAgICAgaWR4LnB1c2gociwgciArIGNvbHVtbiArIDIsIHIgKyBjb2x1bW4gKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcG9zaXRpb24gOiBwb3MsXG4gICAgICAgIG5vcm1hbCA6IG5vcixcbiAgICAgICAgY29sb3IgOiBjb2wsXG4gICAgICAgIGluZGV4IDogaWR4XG4gICAgICB9O1xuICAgIH0sXG4gIFxuICAgIC8vIOODhuOCr+OCueODgeODo+OCkueUn+aIkOOBmeOCi+mWouaVsFxuXHQgIGNyZWF0ZVRleHR1cmU6IGZ1bmN0aW9uKHNvdXJjZSwgbnVtKXtcbiAgICAgIGNvbnN0IGdsID0gcGhpbmFfYXBwLmdsO1xuICAgICAgLy8g44Kk44Oh44O844K444Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBcbiAgICAgIC8vIOODh+ODvOOCv+OBruOCquODs+ODreODvOODieOCkuODiOODquOCrOODvOOBq+OBmeOCi1xuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgLy8g44OG44Kv44K544OB44Oj44Kq44OW44K444Kn44Kv44OI44Gu55Sf5oiQXG4gICAgICAgIHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6PjgpLjg5DjgqTjg7Pjg4njgZnjgotcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOODhuOCr+OCueODgeODo+OBuOOCpOODoeODvOOCuOOCkumBqeeUqFxuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsIGdsLlJHQkEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltZyk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg5/jg4Pjg5fjg57jg4Pjg5fjgpLnlJ/miJBcbiAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIFxuICAgICAgICAvLyDjg4bjgq/jgrnjg4Hjg6Pjga7jg5DjgqTjg7Pjg4njgpLnhKHlirnljJZcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgICAgIFxuICAgICAgICAvLyDnlJ/miJDjgZfjgZ/jg4bjgq/jgrnjg4Hjg6PjgpLjgrDjg63jg7zjg5Djg6vlpInmlbDjgavku6PlhaVcbiAgICAgICAgdGhpcy50ZXh0dXJlW251bV0gPSB0ZXg7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJ0ZXh0dXJlIGxvYWQgZmluaXNoZWQuXCIpXG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyDjgqTjg6Hjg7zjgrjjgqrjg5bjgrjjgqfjgq/jg4jjga7jgr3jg7zjgrnjgpLmjIflrppcbiAgICAgIGltZy5zcmMgPSBzb3VyY2U7XG4gICAgfVxuICB9KTtcblxufSk7XG4iLCIvKlxuICogIFRpdGxlU2NlbmUuanNcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbiAgcGhpbmEuZGVmaW5lKCdUaXRsZVNjZW5lJywge1xuICAgIHN1cGVyQ2xhc3M6ICdCYXNlU2NlbmUnLFxuXG4gICAgX3N0YXRpYzoge1xuICAgICAgaXNBc3NldExvYWQ6IGZhbHNlLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICB0aGlzLnVubG9jayA9IGZhbHNlO1xuICAgICAgdGhpcy5sb2FkY29tcGxldGUgPSBmYWxzZTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuXG4gICAgICAvL+ODreODvOODiea4iOOBv+OBquOCieOCouOCu+ODg+ODiOODreODvOODieOCkuOBl+OBquOBhFxuICAgICAgaWYgKFRpdGxlU2NlbmUuaXNBc3NldExvYWQpIHtcbiAgICAgICAgdGhpcy5zZXR1cCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9wcmVsb2FkIGFzc2V0XG4gICAgICAgIGNvbnN0IGFzc2V0cyA9IEFzc2V0TGlzdC5nZXQoXCJwcmVsb2FkXCIpXG4gICAgICAgIHRoaXMubG9hZGVyID0gcGhpbmEuYXNzZXQuQXNzZXRMb2FkZXIoKTtcbiAgICAgICAgdGhpcy5sb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICB0aGlzLmxvYWRlci5vbignbG9hZCcsICgpID0+IHRoaXMuc2V0dXAoKSk7XG4gICAgICAgIFRpdGxlU2NlbmUuaXNBc3NldExvYWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBiYWNrID0gUmVjdGFuZ2xlU2hhcGUoeyB3aWR0aDogU0NSRUVOX1dJRFRILCBoZWlnaHQ6IFNDUkVFTl9IRUlHSFQsIGZpbGw6IFwiYmxhY2tcIiB9KVxuICAgICAgICAuc2V0UG9zaXRpb24oU0NSRUVOX1dJRFRIX0hBTEYsIFNDUkVFTl9IRUlHSFRfSEFMRilcbiAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICB0aGlzLnJlZ2lzdERpc3Bvc2UoYmFjayk7XG5cbiAgICAgIGNvbnN0IGxhYmVsID0gTGFiZWwoeyB0ZXh0OiBcIlRpdGxlU2NlbmVcIiwgZmlsbDogXCJ3aGl0ZVwiIH0pXG4gICAgICAgIC5zZXRQb3NpdGlvbihTQ1JFRU5fV0lEVEhfSEFMRiwgU0NSRUVOX0hFSUdIVF9IQUxGKVxuICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgIHRoaXMucmVnaXN0RGlzcG9zZShsYWJlbCk7XG5cbiAgICAgIHRoaXMub25lKCduZXh0c2NlbmUnLCAoKSA9PiB0aGlzLmV4aXQoXCJtYWluXCIpKTtcbiAgICAgIHRoaXMuZmxhcmUoJ25leHRzY2VuZScpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgfSk7XG5cbn0pO1xuIl19

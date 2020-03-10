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

phina.namespace(function() {

  phina.define('MainScene', {
    superClass: 'BaseScene',

    init: function(options) {
      this.superInit();
      this.setup();

      this.backgroundColor = "blue";

      const label = Label({
        text: "test",
        color: "black"
      }).addChildTo(this)
    },

    _render: function() {
      this.renderer.render(this);

      const glCanvas = phina_app.glCanvas;
      const dest = this.canvas.domElement.getContext('2d');
      dest.drawImage(glCanvas, 0, 0);
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
  });

});

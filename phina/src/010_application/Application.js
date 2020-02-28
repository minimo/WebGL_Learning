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
phina.namespace(function() {

  phina.define('MainScene', {
    superClass: 'BaseScene',

    init: function(options) {
      this.superInit();
      this.setup();
    },

    setup: function() {
      const gl = this.canvas.domElement.getContext('webgl');
      const vs = phina.asset.AssetManager.get('text', 'vs').data;
      const fs = phina.asset.AssetManager.get('text', 'fs').data;
    },

    update: function() {
    },

  });

});

      var style = "#animation { width: 64px; height: 65px; background-repeat: no-repeat; }"
      qx.bom.Stylesheet.createElement(style);
      var html = '<div id="animation"></div>';
      var htmlEmbed = new qx.ui.embed.Html(html).set({
        width: 100,
        height: 100
      });
      
      htmlEmbed.addListener("appear", function(ev) {
        var image = document.getElementById("animation");
        
        this._effect = new qx.fx.effect.core.Style(image, "background-image", function(value) {
          if (Math.ceil(value * 10) % 2 == 0) {
            return "url(http://demo.qooxdoo.org/current/playground/resource/qx/icon/Tango/64/actions/dialog-apply.png)";
          } else {
            return "url(http://demo.qooxdoo.org/current/playground/resource/qx/icon/Tango/64/actions/dialog-close.png)";
          }
          
        }).set({
          fps : 20,
          duration : 5,
          transition : "linear"
        });
        
      }, this);
      
      this.getRoot().add(htmlEmbed, {left: 20, top: 20});      
      
      var btn = new qx.ui.form.Button("Start");
      this.getRoot().add(btn, {left: 200, top: 20})
      btn.addListener("execute", function(ev) {
        this._effect.start();
      }, this);

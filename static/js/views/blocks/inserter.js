define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/buffer"
      , "views/contextmenu"], function ($, _, Backbone, sg) {

  var views = sg.views
    , buffer = sg.buffer;


  // TODO: generate context menu using view
  views.BlockInserter = Backbone.View.extend({
    
    className: "sg-block-inserter js-inserter",

    template: _.template($("#block-inserter-template").html()),

    events: {
      "mousemove": "mousemoveEvent",
      "click .js-create": "createBlock",
      "click .js-paste": "pasteBlock",
      "click .js-menu-trigger": "toggleMenu",
      "click .js-close": "undisplayMenu"
    },

    initialize: function(options) {
      this.options = options || {};
      this.proximity =  50;
      buffer.on("save:block", this.showPaste, this);
      this.$menu = this.$el.find('.sg-block-inserter-menu');
      this.listenTo(this,'inserter:detach', this.detach);
      this.listenTo(sg.vent,'inserter:inserting', this.inserting);
      this.listenTo(sg.vent,'inserter:uninsert', this.uninsert);
      this.listenTo(sg.vent,'inserter:detachOthers', this.detachOthers);
      
      this._isInserting = false; // inserting = menu displayed
    },
    detach: function(){this.$el.detach(); },
    
    detachOthers: function(el){ 
      if(el !== this){
        this.detach(); 
      }
    },

    toggleMenu: function(e){
      if (!this._isInserting) {
          this.displayMenu(e.clientX);
        } else {
          this.undisplayMenu();
        }
    },
    displayMenu: function(x) {
      this.$menu.show()
      var l = this.$el.offset()['left'] || 0;
      var w = this.$menu.outerWidth(true);
      this.$menu.css('left', (x-l-w-5)+'px');
      sg.vent.trigger("inserter:inserting");
    },    
    undisplayMenu: function() {
      this.$menu.hide();
      sg.vent.trigger("inserter:uninsert");
    },
    inserting: function(){ this._isInserting = true;},
    uninsert: function(){ this._isInserting = false;},

    showPaste: function(key){this.$(".js-paste").show()},
    hidePaste: function(key){this.$(".js-paste").hide()},

    mousemoveEvent: function(e) {
      e.preventDefault();
    },

    render: function() {
      this.$el.html(this.template())
      this.$menu = this.$el.find('.sg-block-inserter-menu');
      this.undisplayMenu()
      
      if (buffer.has("block")) {
        this.showPaste();
      } else {
        this.hidePaste();
      }
      return this;
    },

    getPosition: function() {
      return this.$el.parent().children().index(this.el) + 1;
    },

    pasteBlock: function(e) {
      var block = buffer.load("block");
      e.preventDefault()
      e.stopPropagation();
      _.extend(block, {position: this.getPosition()});
      this.trigger("block:paste", block);
    },

    createBlock: function(e) {
      var $link = $(e.currentTarget)
        , template = $link.data("template")
        , type = $link.data("type");

      e.preventDefault()

      this.trigger("block:create", {
        template: template,
        type: type,
        position: this.getPosition()
      });

    }

  });


});

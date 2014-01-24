define(["jquery"
      , "underscore"
      , "backbone"
      , "stonegarden"
      , "models/documents/document"
      , "models/documents/documents"
      , "views/documents/document"
      , "jquery.ui"], function ($, _, Backbone, sg) {

  var utils = sg.utils
    , views = sg.views
    , collections = sg.collections
    , models = sg.models
    ;

  views.DocumentList = Backbone.View.extend({

    loaderTemplate: _.template($("#document-loader-template").html()),
    backTemplate: _.template($("#document-back-template").html()),

    className: "sg-document-tiles",
    tagName: "ul",

    shadow_buffer: {}, //keep cutted documents here
    
    events: {
      "dblclick .js-back": "openParent",
      // "dblclick .sg-document-folder": "openDocument",
      "sortupdate": "sortupdateEvent",
      "sortstart": "sortstartEvent"
    },

    initialize: function(options) {
      this.options = options || {};
      this.filter = this.options.filter || {};
      this.collection = this.collection || new collections.Documents;

      this.collection
        .on("add", this.appendDocument, this)
        .on("reset", this.render, this)
        .on("document:open", this.openDocument, this)

      if (this.options.isSelectable) {
        // for widget mode
        // pass event from model to collection 
        this.collection.on('change:chosen', this.chooseDocument, this);
           
      } else {
        // for app mode
        this.collection.on("document:select document:deselect", this.toolbarReflection, this)
        .on("documents:selectAll", this.selectAll, this)
        .on("documents:deselectAll", this.deselectAll, this)
        .on("selected:cut", this.cutSelected, this)
        .on("selected:paste", this.pasteSelected, this)
        .on("selected:delete", this.deleteSelected, this)
      }
    },

    selectAll: function(){
      this.collection.forEach(function(model){
        if(model.get('type') !== 'folder'){
                model.set('selected',true);
                model.trigger('document:select');
          }
      })
    },
    deselectAll: function(){
      this.collection.forEach(function(model){
        model.set('selected',false);
        model.trigger('document:deselect');
      })
    },
    
    getSelected: function(){
      return this.collection.filter(function(doc){
        return doc.get('selected')
      });
    },

    cutSelected: function(){
      if(this.getSelected().length > 0){
        var e = this.$el.parent()
          , cut = e.find('.js-toolbar .js-cut')
          , paste = e.find('.js-toolbar .js-paste')
          , selected = this.getSelected();
        
        this.shadow_buffer = this.getSelected();
        paste.removeClass('disabled').find('ins').text('('+selected.length+')');
        cut.addClass('disabled');
      }
    },

    pasteSelected: function(){
      if(this.shadow_buffer.length > 0){

        // var newParent = this.collection.at(0)
        var newParent = this.model;
        var offset = this.collection.where({'type':'folder'}).length
        var selected = this.shadow_buffer;
        console.log('Paste selected files', newParent, offset, this.shadow_buffer.length)
        selected.forEach(function(model, c){
          _position = offset+c;
          console.log('iterate', c, _position)
          model.set({
            'parent_id': newParent.get('id'),
            'ids': newParent.get('ids'),
            'position': _position+1,
          });
          model.save();
          this.collection.add(model,{at:_position})
        },this);
       this.collection.trigger('reset')

        //cleanup
        this.collection.trigger('documents:deselectAll');
        this.$el.parent().find('.js-toolbar .js-paste').addClass('disabled').find('ins').text('');
        this.$el.parent().find('.js-toolbar .js-cut').removeClass('disabled');
        this.shadow_buffer = {};
      }  
    },

    deleteSelected: function(){
    var sentenced = this.getSelected();
      if (sentenced.length > 0 && confirm('Delete all selected files?')){
        sentenced.forEach(function(model){
          if(!model.isSystem()){
            model.destroy({wait: true});            
          }
        });
        this.collection.trigger('documents:deselectAll');
      }
    },
 

    toolbarReflection: function(){
      var counter = this.collection.where({'selected':true})
          , e = this.$el.parent()
          , select_all =  e.find('.js-toolbar .js-selected-counter')
          , deselect_all = e.find('.js-toolbar .js-deselect-all')    
          , cut = e.find('.js-toolbar .js-cut')    
          , paste = e.find('.js-toolbar .js-paste')    
          , del_selected =e.find('.js-toolbar .js-delete')

      if (counter.length > 0){
        deselect_all.removeClass('disabled');
        cut.removeClass('disabled');
        // paste.removeClass('disabled');
        del_selected.removeClass('disabled');
        e.find('.js-selected-counter').text('Selected ('+counter.length+')');

      } else {
        deselect_all.addClass('disabled');
        cut.addClass('disabled');
        e.find('.js-selected-counter').text('Select all');
         if(!this.shadow_buffer.length > 0){
            paste.addClass('disabled');
            del_selected.addClass('disabled');
          }
      }

    },

    //chooseDocument for widget mode only (for image_form.js & co) 
    // → only trigger choose event
    // corresponding select / deselect events triggered in model.documents
    chooseDocument: function(model, isChosen) {
      if (isChosen && this.filter.type === model.get("type")) {
          this.trigger("document:chosen", model);

      }
    },


    render: function() {
      this.$el.empty();
      if (this.model.get("parent_id")) {
        this.$el.append(this.backTemplate());
      }
      this.collection.each(this.appendDocument, this);

      if (this.options.isSortable) {
        this.$el.sortable({forcePlaceholderSize: true, items: '.sg-document'});
      }
      // write folder name 
      var storageTitle = this.$el.parent().find('.sg-storage-title p');
      storageTitle.text(this.model.get('title'));

      // clear selection on change folder (but not CUT|Paste Buffer)
      this.collection.trigger('documents:deselectAll');
      return this;
    },

    makeItemView: function(model) {
      return new views.Document({
        model: model,
        isSelectable: this.options.isSelectable,
        isContextMenuEnabled: this.options.isContextMenuEnabled
      }).render();
    },

    appendDocument: function(model, collection, options) {
      var view, index;
      if (model.get("parent_id") === this.model.get("id")) {
        view = this.makeItemView(model);
        index = options.index;
        this.insertAt(view.el, index);
      } else {
        this.collection.remove(model);
      }
      return this;
    },

    insertAt: function(el, index) {
      if (_.isNumber(index) && index < this.collection.length) {
          this.$el.children(":not(.js-back)").eq(index).before(el);
      } else {
        this.$el.append(el);
      }
    },

    uploadFile: function(file, position) {
      var filename = file.name.substr(0, file.name.lastIndexOf(".")),
         $load = $(this.loaderTemplate({filename: filename}));
      this.insertAt($load, position - 1);
      this.collection.create({
        upload: file,
        parent_id: this.model.get("id"),
        position: position
      }, {
        wait: true,
        at: position - 1,
        complete: function() { $load.remove(); }
      });
      return this;
    },

    openDocument: function(model) {
      //model = model || this.model;
      var data;
      if (model.get("type") === "folder") {
        this.collection.remove(model);
        this.model = model;
        this.collection.fetch({
          reset: true,
          data: _.extend({parent_id: model.get("id")}, this.filter)
        });
      } else if (model.get("type") === "image") {
        model.trigger("document:preview", model);
      }
      this.trigger("document:open", model);
      return this;
    },

    openParent: function() {
      var folder_id = this.model.get("parent_id")
        , folder = new models.Document({id: folder_id})
            .on("change", function(model) {
              this.collection.trigger("document:open", model);
            }, this)
            .fetch();
    },

    sortstartEvent: function(e, ui) {
      // Fix the bug when placeholder doesn't get its height
      ui.placeholder.height(ui.helper.height())
    },

    sortupdateEvent: function(e, ui) {
      var docId = ui.item.data("id")
        , collection = this.collection
        , position = this.$el.children('.sg-document').index(ui.item) + 1
        , doc = collection.get(docId)
        // in backbone 1.1  The Collection methods add, remove, set, push, 
        // and shift now return the model (or models) added or removed from the collection 
        collection.remove(doc, {silent: true})
        collection.add(doc, {at: position - 1, silent: true})
        collection.each(function(m, index) {
          m.set({position: index + 1})
        })
      doc.save();
    }

  });

});

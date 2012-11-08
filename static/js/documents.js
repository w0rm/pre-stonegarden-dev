(function() {
  var BasicDocument, DocumentDocument, FolderDocument, ImageDocument, documents,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  BasicDocument = (function() {

    function BasicDocument() {}

    BasicDocument.prototype.edit_properties = function() {
      var _this = this;
      return $.get("/a/documents/" + (this.data("id")) + ".json", function(data) {
        var dialog;
        contextmenu_button.detach();
        return dialog = $("<div/>").attr("title", t_("Properties")).append(_this.find(".ui-document-container").clone().css({
          float: "left"
        }), $("<div>").css({
          overflow: "hidden",
          padding: "0 20px"
        }).append($("<p/>").append($("<label/>").text(t_("Title") + " ").append("<br>", $("<input type=\"text\" name=\"title\" />").val(data.title))), $("<p/>").append($("<label/>").text(t_("Description") + " ").append($("<textarea type=\"text\" name=\"content\" />").val(data.content))), $("<p/>").append($("<label/>").text(t_("Show on site")).prepend((data.is_published === 1 ? $("<input type=\"checkbox\" name=\"is_published\" checked=\"checked\" />") : $("<input type=\"checkbox\" name=\"is_published\" />")))))).appendTo("body").dialog({
          width: 500,
          buttons: [
            {
              text: t_("Apply"),
              click: function() {
                $.post("/a/documents/" + (_this.data("id")) + "/edit_settings", {
                  title: $.trim(dialog.find("input[name=title]").val()),
                  is_published: dialog.find("input[name=is_published]").attr("checked") || undefined,
                  content: $.trim(dialog.find("textarea[name=content]").val())
                }, function(data) {
                  contextmenu_button.detach();
                  return _this.replaceWith(data.html);
                });
                return dialog.dialog("close");
              }
            }, {
              text: t_("Cancel"),
              click: function() {
                return dialog.dialog("close");
              }
            }
          ]
        });
      });
    };

    BasicDocument.prototype.delete_document = function() {
      var _this = this;
      return $.post("/a/documents/" + (this.data("id")) + "/delete", function() {
        contextmenu_button.detach();
        growl("default", {
          text: "Удаление прошло успешно"
        }, {
          expires: 3000
        });
        return _this.remove();
      });
    };

    BasicDocument.prototype.context_items = function() {
      var items,
        _this = this;
      items = [];
      (restrict("admin", "editor")(function() {
        if (!_this.hasClass("is_system")) {
          items.push({
            text: t_("Properties") + "…",
            click: function() {
              return _this.call_doc("edit_properties");
            }
          });
          return items.push({
            text: t_("Delete"),
            click: function() {
              var dialog;
              return dialog = $("<div/>").attr("title", t_("Delete this document?")).append($("<p/>").text(t_("Deleting folder will also delete all nested documents."))).appendTo("body").dialog({
                modal: true,
                close: function(ev, ui) {
                  return dialog.remove();
                },
                buttons: [
                  {
                    text: t_("Delete"),
                    click: function() {
                      _this.call_doc("delete_document");
                      return dialog.dialog("close");
                    }
                  }, {
                    text: t_("Cancel"),
                    click: function() {
                      return dialog.dialog("close");
                    }
                  }
                ]
              });
            }
          });
        }
      }))();
      return items;
    };

    return BasicDocument;

  })();

  DocumentDocument = (function(_super) {

    __extends(DocumentDocument, _super);

    function DocumentDocument() {
      DocumentDocument.__super__.constructor.apply(this, arguments);
    }

    DocumentDocument.prototype.context_items = function() {
      var _this = this;
      return $.merge([
        {
          text: t_("Copy link") + "…",
          click: function() {
            var dialog;
            dialog = $("<div/>").attr("title", t_("Copy download link")).append($("<p/>").append($("<input/>").attr({
              type: "text",
              value: "" + window.location.protocol + "//" + window.location.host + "/uploads/" + (_this.data("filename"))
            }).css({
              width: 250
            }).click(function() {
              return $(this).select();
            }))).appendTo("body").dialog({
              buttons: [
                {
                  text: t_("Close"),
                  click: function() {
                    return dialog.dialog("close");
                  }
                }
              ]
            });
            return dialog.find("input").focus().select();
          }
        }, {
          text: t_("Download"),
          click: function() {
            return window.location.replace("/uploads/" + (_this.data("filename")));
          }
        }, {
          separator: true
        }
      ], DocumentDocument.__super__.context_items.call(this));
    };

    return DocumentDocument;

  })(BasicDocument);

  FolderDocument = (function(_super) {

    __extends(FolderDocument, _super);

    function FolderDocument() {
      FolderDocument.__super__.constructor.apply(this, arguments);
    }

    FolderDocument.prototype.context_items = function() {
      var _this = this;
      return $.merge([
        {
          text: t_("Copy link") + "…",
          click: function() {
            var dialog;
            dialog = $("<div/>").attr("title", t_("Copy link")).append($("<p/>").append($("<input/>").attr({
              type: "text",
              value: "" + window.location.protocol + "//" + window.location.host + "/a/documents/" + (_this.data("id"))
            }).css({
              width: 250
            }).click(function() {
              return $(this).select();
            }))).appendTo("body").dialog({
              buttons: [
                {
                  text: t_("Close"),
                  click: function() {
                    return dialog.dialog("close");
                  }
                }
              ]
            });
            return dialog.find("input").focus().select();
          }
        }
      ], FolderDocument.__super__.context_items.call(this));
    };

    return FolderDocument;

  })(BasicDocument);

  ImageDocument = (function(_super) {

    __extends(ImageDocument, _super);

    function ImageDocument() {
      ImageDocument.__super__.constructor.apply(this, arguments);
    }

    ImageDocument.prototype.preview_size = function(s) {
      var _this = this;
      return function() {
        return $.get("/a/documents/" + (_this.data("id")) + "/image_size", {
          size: s.size
        }, function(data) {
          var dialog;
          return dialog = $("<div/>").attr("title", t_("Image preview")).append($("<img/>").attr("src", data.src)).appendTo("body").dialog({
            width: 730,
            height: 750,
            buttons: [
              {
                text: t_("Close"),
                click: function() {
                  return dialog.dialog("close");
                }
              }
            ]
          });
        });
      };
    };

    ImageDocument.prototype.context_items = function() {
      var k, s, sizes, sizes_items, v;
      sizes = ((function() {
        var _ref, _results;
        _ref = config.image;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push({
            size: k,
            settings: v
          });
        }
        return _results;
      })()).sort(function(a, b) {
        var a1, b1;
        a1 = a.settings[0] || 999999999;
        b1 = b.settings[0] || 999999999;
        if (a1 > b1) return 1;
        if (a1 < b1) return -1;
        return 0;
      });
      sizes_items = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = sizes.length; _i < _len; _i++) {
          s = sizes[_i];
          _results.push({
            text: t_(config.labels[s.size]) + (s.settings[0] ? " [" + s.settings[0] + "]" : "") + "…",
            href: ("/a/documents/" + (this.data("id")) + "/image_size?") + $.param({
              size: s.size
            }),
            target: "_blank"
          });
        }
        return _results;
      }).call(this);
      return $.merge([
        {
          text: t_("Preview") + "…",
          click: this.call_doc("preview_size", {
            size: "m",
            settings: config.image["m"]
          })
        }, {
          text: t_("Preview sizes") + " →",
          items: sizes_items
        }, {
          separator: true
        }
      ], ImageDocument.__super__.context_items.call(this));
    };

    return ImageDocument;

  })(BasicDocument);

  documents = {
    folder: new FolderDocument,
    document: new DocumentDocument,
    image: new ImageDocument
  };

  $.fn.call_doc = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return documents[this.data("filetype")][f].apply(this, args);
  };

  $.fn.documents = function() {
    var is_uploading, navigate, root_id, _ref,
      _this = this;
    is_uploading = false;
    root_id = (_ref = this.data("root_id")) != null ? _ref : 1;
    navigate = function(document_id) {
      return $.get("/a/documents/" + document_id, function(data) {
        var $container, $documents;
        contextmenu_button.detach();
        $container = $(data);
        $documents = $container.find(".ui-documents");
        if (root_id !== document_id) {
          $documents.prepend("<li class=\"ui-document folder is_parent\" data-filetype=\"folder\" data-id=\"" + ($container.data("document_id")) + "\">\n    <div class=\"ui-document-container folder\"></div>\n    <p class=\"ui-document-title\">...</p>\n</li>");
        }
        _this.find(".js-documents-container").empty().append($documents);
        _this.data("id", document_id);
        _this.find(".js-documents-breadcrumbs").replaceWith($(data).find(".js-documents-breadcrumbs"));
        return (restrict("admin", "editor")(function() {
          return $documents.sortable({
            handle: ".js-drag-handle",
            items: "li:not(.folder)",
            update: function(e, ui) {
              return $.post("/a/documents/" + (ui.item.data("id")) + "/order", {
                position: $(this).children("li:not(.folder)").index(ui.item) + 1
              });
            }
          });
        }))();
      });
    };
    this.on("navigate", function(e, document_id) {
      return navigate(document_id);
    });
    this.on("click", ".js-documents-breadcrumbs a, .ui-document.folder", function(e) {
      e.preventDefault();
      return navigate($(this).data("id"));
    });
    this.on("click", ".js-documents-tile", function(e) {
      e.preventDefault();
      _this.find(".js-documents-tile").addClass("active");
      _this.find(".js-documents-list").removeClass("active");
      return _this.removeClass("ui-documents-list");
    });
    this.on("click", ".js-documents-list", function(e) {
      e.preventDefault();
      _this.find(".js-documents-list").addClass("active");
      _this.find(".js-documents-tile").removeClass("active");
      return _this.addClass("ui-documents-list");
    });
    this.on("mouseenter", ".ui-document", function(e) {
      var doc;
      e.stopPropagation();
      if (!(contextmenu_button.parent().is(this) || $(this).is(".is_parent.folder"))) {
        doc = $(this);
        contextmenu_button.prependTo(doc);
        contextmenu_button.off("click");
        return contextmenu_button.on("click", function(e) {
          var coords, items;
          e.preventDefault();
          e.stopPropagation();
          items = doc.call_doc("context_items");
          coords = contextmenu_button.offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    });
    this.on("contextmenu", ".ui-document", function(e) {
      var items;
      if (!$(this).is(".is_parent.folder")) {
        e.preventDefault();
        items = $(this).call_doc("context_items");
        return show_contextmenu(items, {
          left: e.pageX - 2,
          top: e.pageY - 2
        });
      }
    });
    this.on("click", ".image.ui-document", function(e) {
      e.preventDefault();
      return $(this).call_doc("preview_size", {
        size: "m",
        settings: config.image["m"]
      })();
    });
    (restrict("admin", "editor")(function() {
      var upload;
      _this.on("click", ".js-documents-newfolder", function(e) {
        var title;
        e.preventDefault();
        title = prompt(t_("New folder"), t_("New folder"));
        if (title) {
          return $.post("/a/documents/newfolder", {
            title: title,
            document_id: _this.data("id")
          }, function(data) {
            var root_folder;
            root_folder = _this.find(".ui-documents .is_parent.folder");
            if (root_folder.length > 0) {
              return $(data.html).insertAfter(root_folder).effect("highlight", {}, 1000);
            } else {
              return $(data.html).prependTo(_this.find(".ui-documents")).effect("highlight", {}, 1000);
            }
          });
        }
      });
      upload = function(files) {
        var f, form, new_document, status, xhr, xhr_upload, _i, _len;
        if (typeof FormData === "undefined" || FormData === null) {
          alert("Your browser does not support standard HTML5 Drag and Drop");
          return;
        }
        xhr = new XMLHttpRequest();
        status = $("<span/>");
        new_document = $("<li />").addClass("ui-document-dropping").append($("<p/>").text(t_("Uploading")), status).appendTo(_this.find(".ui-documents"));
        xhr_upload = xhr.upload;
        form = new FormData();
        xhr_upload.addEventListener("progress", (function(e) {
          if (e.lengthComputable) {
            return status.text((e.loaded === e.total ? t_("Processing") : Math.round(e.loaded * 100 / e.total) + "%"));
          }
        }), false);
        xhr_upload.addEventListener("load", (function(e) {}), false);
        xhr_upload.addEventListener("error", (function(error) {
          return status.text("" + (t_("Error")) + ": " + error);
        }), false);
        xhr.open("POST", "/a/documents/upload");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.onreadystatechange = function(e) {
          var data;
          if (xhr.readyState === 4) {
            is_uploading = false;
            if (xhr.status === 200) {
              data = $.parseJSON(e.target.responseText);
              if (data.status === 0) {
                status.text(t_("File upload error!"));
                return new_document.fadeOut(function() {
                  return $(this).remove();
                });
              } else {
                return navigate(_this.data("id"));
              }
            } else {
              status.text(t_("File upload error!"));
              return new_document.fadeOut(function() {
                return $(this).remove();
              });
            }
          }
        };
        form.append("document_id", _this.data("id"));
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          form.append("files", f);
        }
        is_uploading = true;
        return xhr.send(form);
      };
      return _this.on({
        dragover: function(e) {
          var dt;
          dt = e.originalEvent.dataTransfer;
          if (!(dt != null) || !(dt.files != null) || dt.items[0].kind !== "file" || is_uploading) {
            return true;
          }
          dt.dropEffect = "copy";
          _this.addClass("active");
          return false;
        },
        dragleave: function(e) {
          return _this.removeClass("active");
        },
        dragenter: function(e) {
          return false;
        },
        drop: function(e) {
          var dt;
          dt = e.originalEvent.dataTransfer;
          _this.removeClass("active");
          if (!((dt != null) && (dt.files != null))) return true;
          upload(dt.files);
          return false;
        }
      });
    }))();
    return navigate(this.data("id"));
  };

  $(".js-documents").documents();

}).call(this);

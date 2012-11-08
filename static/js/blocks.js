(function() {
  var Block, HTMLBlock, RichtextBlock, blocks, insert, page_id, placeholderHTML,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Block = (function() {

    function Block() {}

    Block.prototype.new_block = function(inserter) {
      var container;
      container = inserter.parent(".container");
      return $.post("/a/blocks/new", {
        block_id: inserter.closest(".block").data("id"),
        page_id: page_id,
        container: container.data("container"),
        template: this.data("template"),
        is_template: container.hasClass("is_template") || undefined,
        position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
      }, function(data) {
        container.children(".placeholder").remove();
        return inserter.after(data);
      });
    };

    Block.prototype.create_block = function() {};

    Block.prototype.edit_block = function() {};

    Block.prototype.update_block = function() {};

    Block.prototype.update_template = function(template) {
      var _this = this;
      return $.post("/a/blocks/" + (this.data("id")) + "/edit_template", {
        template: template,
        page_id: page_id
      }, function(data) {
        contextmenu_button.detach();
        insert.detach();
        return _this.parent(".container").html(data);
      });
    };

    Block.prototype.unwrap_block = function() {
      var _this = this;
      return $.post("/a/blocks/" + (this.data("id")) + "/unwrap", {
        page_id: page_id
      }, function(data) {
        contextmenu_button.detach();
        insert.detach();
        return _this.parent(".container").html(data);
      });
    };

    Block.prototype.wrap_block = function(template) {
      var _this = this;
      return $.post("/a/blocks/" + (this.data("id")) + "/wrap", {
        template: template,
        page_id: page_id
      }, function(data) {
        insert.detach();
        contextmenu_button.detach();
        return _this.replaceWith(data);
      });
    };

    Block.prototype.paste_block = function(inserter) {
      var container,
        _this = this;
      container = inserter.closest(".container");
      return $.post("/a/blocks/paste", {
        block_id: inserter.closest(".block").data("id"),
        page_id: page_id,
        container: container.data("container"),
        is_template: container.hasClass("is_template") || undefined,
        position: inserter.siblings(".block").index(inserter.prev(".block")) + 2
      }, function(data) {
        inserter.next(".placeholder").remove();
        inserter.after(data);
        _this.remove();
        return $(".block.is_cut").each(function() {
          container = $(this).parent(".container");
          $(this).remove();
          if (container.children().not(".ui-insert").length === 0) {
            return container.append(placeholderHTML);
          }
        });
      });
    };

    Block.prototype.move_block = function(duplicate) {
      var _this = this;
      return $.post("/a/blocks/" + (this.data("id")) + "/move", {
        duplicate: duplicate,
        page_id: page_id
      }, function(data) {
        contextmenu_button.detach();
        _this.replaceWith(data);
        if (!duplicate) _this.addClass("is_cut");
        if (insert.find(".js-paste-block").length === 0) {
          return insert.children(".ui-insert-menu").prepend($("<a class=\"ui-insert-default js-paste-block\" href=\"#\"/>").text(t_("Paste")));
        }
      });
    };

    Block.prototype.delete_block = function() {
      var _this = this;
      return $.post("/a/blocks/" + (this.data("id")) + "/delete", function(data) {
        var container;
        container = _this.parent(".container");
        contextmenu_button.detach();
        _this.remove();
        if (container.children().not(".ui-insert").length === 0) {
          return container.append(placeholderHTML);
        }
      });
    };

    Block.prototype.edit_columns = function() {
      var block, container, dialog, has_columns, in_columns, options;
      block = this;
      container = block.parent(".container");
      options = $("<div/>");
      dialog = $("<div/>").attr("title", t_("Columns"));
      has_columns = container.hasClass("has_columns");
      in_columns = !has_columns && container.closest(".block").length > 0 && container.closest(".block").data("template").substr(0, 4) === "cols";
      options.append($("<p/>").append($("<label class=\"after\"/>").append((has_columns && !in_columns ? $("<input type=\"radio\" name=\"template\" checked=\"checked\" />") : $("<input type=\"radio\" name=\"template\"/>")), $("<span class=\"ui-icon ui-icon-edzo-t-cols_100\"/>").css({
        display: "inline-block",
        "vertical-align": "text-bottom"
      }), document.createTextNode(t_("No columns")))));
      $.each(config.container_blocks, function(k, v) {
        var input;
        input = $("<input type=\"radio\" name=\"template\"/>").data("template", v);
        if (in_columns && container.closest(".block").data("template") === v) {
          input.attr("checked", true);
        }
        return options.append($("<p/>").append($("<label class=\"after\"/>").append(input, $("<span class=\"ui-icon\"/>").addClass("ui-icon-edzo-t-" + v).css({
          display: "inline-block",
          "vertical-align": "text-bottom"
        }), document.createTextNode(t_(config.labels[v])))));
      });
      return dialog.append(options).appendTo("body").dialog({
        buttons: [
          {
            text: t_("Apply"),
            click: function() {
              var new_template;
              new_template = options.find("input:checked").data("template");
              if (has_columns) {
                if (new_template) block.call_block("wrap_block", new_template);
              } else if (in_columns) {
                if (new_template) {
                  container.closest(".block").call_block("update_template", new_template);
                } else {
                  container.closest(".block").call_block("unwrap_block");
                }
              }
              return $(this).dialog("close");
            }
          }, {
            text: t_("Cancel"),
            click: function() {
              return $(this).dialog("close");
            }
          }
        ]
      });
    };

    Block.prototype.edit_properties = function() {
      var block, container, dialog;
      block = this;
      container = block.parent(".container");
      dialog = $("<div/>").attr("title", t_("Properties"));
      return $.get("/a/blocks/" + block.data("id") + ".json", function(data) {
        return dialog.append($("<div class=\"small-padding-block\">").append($("<p/>").append($("<label for=\"css_class\" />").text(t_("CSS class") + " "), $("<input id=\"css_class\" type=\"text\" name=\"css_class\" class=\"fullwidth\" />").val(data.css_class)), $("<p/>").append($("<label class=\"after\"/>").text(t_("Show on site")).prepend((data.is_published === 1 ? $("<input type=\"checkbox\" name=\"is_published\" checked=\"checked\" />") : $("<input type=\"checkbox\" name=\"is_published\" />")))))).appendTo("body").dialog({
          buttons: [
            {
              text: t_("Apply"),
              click: function() {
                var css_class, is_published;
                css_class = $.trim(dialog.find("input[name=css_class]").val());
                is_published = dialog.find("input[name=is_published]").attr("checked") || undefined;
                $.post("/a/blocks/" + block.data("id") + "/edit_settings", {
                  css_class: css_class,
                  is_published: is_published,
                  page_id: page_id
                }, function(data) {
                  return block.replaceWith(data);
                });
                return $(this).dialog("close");
              }
            }, {
              text: t_("Cancel"),
              click: function() {
                return $(this).dialog("close");
              }
            }
          ]
        }).dialog("widget").find(".ui-dialog-title").addClass("small-padding-block");
      });
    };

    Block.prototype.context_items = function() {
      var block, container, items;
      block = this;
      container = block.parent(".container");
      items = [];
      if (container.hasClass("has_columns") || container.closest(".block").length > 0 && container.closest(".block").data("template").substr(0, 4) === "cols") {
        items.push({
          text: t_("Columns") + "…",
          click: function() {
            return block.call_block("edit_columns");
          }
        });
        items.push({
          separator: true
        });
      }
      items.push({
        text: t_("Properties") + "…",
        click: function() {
          return block.call_block("edit_properties");
        }
      });
      if (container.closest(".block").length > 0 && container.closest(".block").data("template").substr(0, 4) === "cols") {
        items.push({
          text: t_("Container properties") + "…",
          click: function() {
            return container.closest(".block").call_block("edit_properties");
          }
        });
      }
      items.push({
        separator: true
      });
      items.push({
        text: t_("Copy"),
        click: function() {
          return block.call_block("move_block", true);
        }
      });
      items.push({
        text: t_("Cut"),
        click: function() {
          return block.call_block("move_block");
        }
      });
      items.push({
        separator: true
      });
      items.push({
        text: t_("Delete"),
        click: function() {
          var dialog;
          return dialog = $("<div/>").attr("title", t_("Delete this block?")).append($("<p/>").text(t_("It will also delete all the nested blocks."))).appendTo("body").dialog({
            buttons: [
              {
                text: t_("Delete"),
                click: function() {
                  block.call_block("delete_block");
                  return $(this).dialog("close");
                }
              }, {
                text: t_("Cancel"),
                click: function() {
                  return $(this).dialog("close");
                }
              }
            ]
          });
        }
      });
      return items;
    };

    return Block;

  })();

  HTMLBlock = (function(_super) {

    __extends(HTMLBlock, _super);

    function HTMLBlock() {
      HTMLBlock.__super__.constructor.apply(this, arguments);
    }

    HTMLBlock.prototype.new_block = function(inserter) {
      var container, new_block;
      new_block = $("<div class=\"fixed-block\"/>").data("template", this.data("template")).addClass(this.data("template"));
      container = inserter.parent(".container");
      new_block.append($("<textarea name=\"content\" rows=\"10\"/>"), $("<div class=\"ui-block-edit\"/>").append($("<button/>").button({
        label: t_("OK")
      }).click(function() {
        $(this).button("disable");
        return new_block.call_block("create_block");
      }), $("<button name=\"cancel\"/>").button({
        label: t_("Cancel")
      }).click(function() {
        new_block.remove();
        if (container.children(".block").length === 0) {
          return container.append(placeholderHTML);
        }
      }))).insertAfter(inserter).call_block("form_init");
      container.children(".placeholder").remove();
      return inserter.detach();
    };

    HTMLBlock.prototype.create_block = function() {
      var container, content,
        _this = this;
      content = $.trim(this.find("textarea[name=content]").val());
      container = this.parent(".container");
      if (content) {
        return $.post("/a/blocks/new", {
          block_id: this.closest(".block").data("id"),
          page_id: page_id,
          container: container.data("container"),
          template: this.data("template"),
          is_template: container.hasClass("is_template") || undefined,
          position: this.siblings(".block").index(this.prev(".block")) + 2,
          content: content
        }, function(data) {
          return _this.replaceWith(data);
        });
      } else {
        return this.find("button[name=cancel]").trigger("click");
      }
    };

    HTMLBlock.prototype.edit_block = function() {
      var block;
      block = this;
      return $.get("/a/blocks/" + (this.data("id")) + ".json", function(data) {
        insert.detach();
        contextmenu_button.detach();
        return block.empty().append($("<textarea name=\"content\" rows=\"10\"/>").val(data.content), $("<div class=\"ui-block-edit\"/>").append($("<button/>").button({
          label: t_("OK")
        }).click(function() {
          $(this).button("disable");
          return block.call_block("update_block");
        }), $("<button name=\"cancel\"/>").button({
          label: t_("Cancel")
        }).click(function() {
          return block.html("<div class=\"content\">" + data.content_cached + "</div>").removeClass("fixed-block").addClass("block");
        }))).removeClass("block").addClass("fixed-block").call_block("form_init");
      });
    };

    HTMLBlock.prototype.update_block = function() {
      var container, content,
        _this = this;
      content = $.trim(this.find("textarea[name=content]").val());
      container = this.closest(".container");
      if (content) {
        return $.post("/a/blocks/" + (this.data("id")) + "/edit", {
          container: container.data("container"),
          content: content,
          page_id: page_id
        }, function(data) {
          return _this.replaceWith(data);
        });
      } else {
        return this.find("button[name=cancel]").trigger("click");
      }
    };

    HTMLBlock.prototype.context_items = function() {
      var _this = this;
      return $.merge([
        {
          text: t_("Edit"),
          click: function() {
            return _this.call_block("edit_block");
          }
        }
      ], HTMLBlock.__super__.context_items.call(this));
    };

    HTMLBlock.prototype.form_init = function() {
      return this.find("textarea[name=content]").focus();
    };

    return HTMLBlock;

  })(Block);

  RichtextBlock = (function(_super) {

    __extends(RichtextBlock, _super);

    function RichtextBlock() {
      RichtextBlock.__super__.constructor.apply(this, arguments);
    }

    RichtextBlock.prototype.form_init = function() {
      return this.find("textarea[name=content]").tinymce(config.tinymce);
    };

    return RichtextBlock;

  })(HTMLBlock);

  blocks = {
    "default": new Block,
    htmlcode: new HTMLBlock,
    richtext: new RichtextBlock
  };

  $.fn.call_block = function() {
    var args, f, _ref;
    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return ((_ref = blocks[this.data("template")]) != null ? _ref : blocks["default"])[f].apply(this, args);
  };

  placeholderHTML = "<div class=\"placeholder\" data-template=\"richtext\">\n  <p>\n    " + (t_("This text is not written yet.")) + "\n    <strong>" + (t_("Click to write the text.")) + "</strong>\n    <br>\n    " + (t_("Do not worry, such placeholder texts are not visible on the public website until you edit them.")) + "\n  </p>\n</div>";

  page_id = $("body").data("id");

  insert = $(".ui-insert").on("mousemove", function(e) {
    e.stopPropagation();
    return contextmenu_button.detach();
  }).detach();

  $(document).on("click", ".js-insert-block, .placeholder", function(e) {
    e.preventDefault();
    return $(this).call_block("new_block", insert);
  });

  $(document).on("click", ".js-paste-block", function(e) {
    e.preventDefault();
    return $(this).call_block("paste_block", insert);
  });

  $(document).on("mousemove", ".placeholder", function(e) {
    e.stopPropagation();
    if (!insert.next().is(this)) return insert.insertBefore(this);
  });

  $(document).on({
    mouseenter: function(e) {
      e.stopPropagation();
      if (!contextmenu_button.parent().is(this) && $(this).find(".container").length === 0) {
        return contextmenu_button.prependTo(this).off("click").on("click", function(e) {
          var block, coords, items, template;
          e.preventDefault();
          e.stopPropagation();
          block = $(this).parent();
          template = block.data("template");
          items = block.call_block("context_items");
          coords = contextmenu_button.offset();
          coords.left += $(this).innerWidth();
          return show_contextmenu(items, coords);
        });
      }
    },
    mousemove: function(e) {
      var el, top;
      e.stopPropagation();
      top = (e.pageY - $(this).offset().top) < $(this).height() / 2;
      el = $(this)[(top ? "prev" : "next")]();
      if (el.length === 0 || (!el.hasClass("fixed-block") && !el.hasClass("ui-insert"))) {
        return insert[(top ? "insertBefore" : "insertAfter")](this);
      }
    },
    dblclick: function(e) {
      e.stopPropagation();
      return $(this).call_block("edit_block");
    }
  }, ".block");

}).call(this);

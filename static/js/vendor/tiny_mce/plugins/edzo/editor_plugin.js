/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	tinymce.create('tinymce.plugins.EdzoPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceEdzoImage', function() {
				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(ed.selection.getNode(), 'class', '').indexOf('mceItem') != -1)
					return;
			    openStorage(ed, url);
			});
			
			ed.addCommand('mceEdzoLink', function() {
				// No selection and not in link
				if (ed.selection.isCollapsed() && !ed.dom.getParent(ed.selection.getNode(), 'A'))
					return;
				openLink(ed, url);
			});

			// Register buttons
			ed.addButton('image', {
				title : 'advimage.image_desc',
				cmd : 'mceEdzoImage'
			});
			
			// Register buttons
			ed.addButton('link', {
				title : 'advlink.link_desc',
				cmd : 'mceEdzoLink'
			});
			
			ed.addShortcut('ctrl+k', 'advlink.advlink_desc', 'mceEdzoLink');

			ed.onNodeChange.add(function(ed, cm, n, co) {
				cm.setDisabled('link', co && n.nodeName != 'A');
				cm.setActive('link', n.nodeName == 'A' && !n.name);
			});
			
		},

		getInfo : function() {
			return {
				longname : 'Edzo plugin',
				author : 'Edzohogusava',
				authorurl : 'http://edzohogusava.com',
				infourl : 'http://edzohogusava.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('edzo', tinymce.plugins.EdzoPlugin);
})();
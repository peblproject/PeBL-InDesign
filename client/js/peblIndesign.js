var node_fs = require('fs');
var node_os = require("os");
var node_path = require('path');

var PeblIndesign = {};
window.PeblIndesign = PeblIndesign;

var needsListenerEdit = true;
var needsListenerPreview = true;

const themes = {
	'Default': 'pebl-theme-default.css',
	'Gunmetal': 'pebl-theme-gunmetal.css',
	'Rounded Blue': 'pebl-theme-roundedBlue.css'
}

PeblIndesign.logToFile = function(message) {
	var funcString = 'logToFile("' + escape(message) + '", true);';
	csInterface.evalScript(funcString, function(result) {
        //
    });
}

PeblIndesign.openPreviewPanel = function(data) {
	try {
		var onload = function(event) {
			try {
				var newEvent = new CSEvent("previewExtension", "APPLICATION");
		        newEvent.data = data;
		        csInterface.dispatchEvent(newEvent);
		        csInterface.removeEventListener("loadedPreviewPanel", onload);
		        needsListenerPreview = true;
			} catch (e) {
				alert('PeBL Error: 39 - ' + e.toString());
			}
	    }

	    if (needsListenerPreview) {
	        needsListenerPreview = false;
	        csInterface.addEventListener("loadedPreviewPanel", onload);
	    }

	    var newEvent = new CSEvent("previewExtension", "APPLICATION");
	    newEvent.data = data;
	    csInterface.dispatchEvent(newEvent);

	    csInterface.requestOpenExtension("com.eduworks.pebl.preview", "");
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 38 - ' + e.toString());
		alert('PeBL Error: 38 - ' + e.toString());
	}
}

PeblIndesign.openEditWidgetDialog = function(slug, editArgs, imageMap) {
	try {
		PeblIndesign.checkSelectedContent(function(result) {
	        var onload = function(event) {
	        	try {
	        		var event = new CSEvent("generateEditWidgetDialog", "APPLICATION");
		            event.data = JSON.stringify({slug: slug, editArgs: editArgs, selectedContent: result, imageMap: imageMap});
		            csInterface.dispatchEvent(event);
		            csInterface.removeEventListener("loadedEditWidgetDialog", onload);
		            needsListenerEdit = true;
		            PeblIndesign.closeInsertPeblWindow();
	        	} catch (e) {
	        		alert('PeBL Error: 41 - ' + e.toString());
	        	}
	        }

	        if (needsListenerEdit) {
	            needsListenerEdit = false;
	            csInterface.addEventListener("loadedEditWidgetDialog", onload);
	        }

	        var event = new CSEvent("generateEditWidgetDialog", "APPLICATION");
	        event.data = JSON.stringify({slug: slug, editArgs: editArgs, selectedContent: result, imageMap: imageMap});
	        csInterface.dispatchEvent(event);

	        csInterface.requestOpenExtension('com.eduworks.pebl.editWidgetDialog', '');
	    });
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 40 - ' + e.toString());
		alert('PeBL Error: 40 - ' + e.toString());
	}
}

PeblIndesign.resetInsertPeblWindow = function() {
	try {
		if (!document.getElementById('testDiv')) {
	        var testDiv = document.createElement('div');
	        testDiv.id = 'testDiv';

	        document.body.appendChild(testDiv);
	    }

	    var insertPebl = document.getElementById('insertPeblWindowTarget');
	    if (insertPebl) {
	        insertPebl.parentNode.removeChild(insertPebl);
	    }
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 42 - ' + e.toString());
		alert('PeBL Error: 42 - ' + e.toString());
	}
}



PeblIndesign.resetContentPeblWindow = function() {
	try {
		if (!document.getElementById('testDiv')) {
	        var testDiv = document.createElement('div');
	        testDiv.id = 'testDiv';

	        document.body.appendChild(testDiv);
	    }

	    var contentPebl = document.getElementById('contentPeblWindowTarget');
	    if (contentPebl) {
	        contentPebl.parentNode.removeChild(contentPebl);
	    }
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 43 - ' + e.toString());
		alert('PeBL Error: 43 - ' + e.toString());
	}
}

PeblIndesign.resetEditPeblWindow = function() {
	try {
		if (!document.getElementById('testDiv')) {
	        var testDiv = document.createElement('div');
	        testDiv.id = 'testDiv';

	        document.body.appendChild(testDiv);
	    }

	    var insertPebl = document.getElementById('editPeblWindowTarget');
	    if (insertPebl) {
	        insertPebl.parentNode.removeChild(insertPebl);
	    }
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 44 - ' + e.toString());
		alert('PeBL Error: 44 - ' + e.toString());
	}
}

PeblIndesign.resetPreviewPeblWindow = function() {
	try {
		if (!document.getElementById('peblPreviewAnchor')) {
	        var previewAnchor = document.createElement('div');
	        previewAnchor.id = 'peblPreviewAnchor';

	        var anchorWrapper = document.getElementById('peblPreviewAnchorWrapper');

	        anchorWrapper.appendChild(previewAnchor);
	    }

	    var previewPebl = document.getElementById('previewPeblWindowTarget');
	    if (previewPebl) {
	        previewPebl.parentNode.removeChild(previewPebl);
	    }
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 45 - ' + e.toString());
		alert('PeBL Error: 45 - ' + e.toString());
	}
}

PeblIndesign.resetSettingsPeblWindow = function() {
	try {
		if (!document.getElementById('testDiv')) {
	        var testDiv = document.createElement('div');
	        testDiv.id = 'testDiv';

	        document.body.appendChild(testDiv);
	    }

	    var insertPebl = document.getElementById('settingsPeblWindowTarget');
	    if (insertPebl) {
	        insertPebl.parentNode.removeChild(insertPebl);
	    }
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 46 - ' + e.toString());
		alert('PeBL Error: 46 - ' + e.toString());
	}
}

PeblIndesign.closeInsertPeblWindow = function() {
	if (window.__adobe_cep__.getExtensionId() === 'com.eduworks.pebl.addNewWidget')
    	window.__adobe_cep__.closeExtension();
}

PeblIndesign.closeEditPeblWindow = function() {
	if (window.__adobe_cep__.getExtensionId() === 'com.eduworks.pebl.editWidgetDialog')
    	window.__adobe_cep__.closeExtension();
}

PeblIndesign.closeSettingsPeblWindow = function() {
	if (window.__adobe_cep__.getExtensionId() === 'com.eduworks.pebl.settingsDialog')
    	window.__adobe_cep__.closeExtension();
}

PeblIndesign.checkSelectedContent = function(callback) {
    var funcString = "checkSelectedContent();";
    csInterface.evalScript(funcString, function(result) {
        callback(result);
    });
}

PeblIndesign.getPeblExtensions = function(callback) {
    var funcString = "getPeblExtensions();";
    csInterface.evalScript(funcString, function(result) {
        callback(result);
    });
}

PeblIndesign.selectPeblExtension = function(id) {
    var funcString = 'selectPeblExtension("' + id + '");';
    csInterface.evalScript(funcString, function(result) {
        console.log(result);
    });
}

PeblIndesign.editPeblExtension = function(extensionData) {

    PeblIndesign.selectPeblExtension(extensionData.id);

    var event = new CSEvent("editExtension", "APPLICATION");
    event.data = extensionData;
    csInterface.dispatchEvent(event);
}

PeblIndesign.previewPeblExtension = function(html, slug) {
    csInterface.requestOpenExtension('com.eduworks.pebl.preview', '');

    var event = new CSEvent("previewExtension", "APPLICATION");
    event.data = JSON.stringify({html: html, slug: slug});
    csInterface.dispatchEvent(event);
}


PeblIndesign.openInsertPeblWindow = function() {
    csInterface.requestOpenExtension('com.eduworks.pebl.addNewWidget', '');
}

PeblIndesign.removePeblExtension = function(id) {
    if (window.confirm('Are you sure you want to delete this extension?')) {
        var funcString = 'removePeblExtension("' + id + '");';
        csInterface.evalScript(funcString, function(result) {
            console.log(result);
        });
    }
}

PeblIndesign.openAddThemeWindow = function() {
	csInterface.requestOpenExtension('com.eduworks.pebl.addThemeDialog', '');
}

PeblIndesign.closeAddThemeWindow = function() {
	if (window.__adobe_cep__.getExtensionId() === 'com.eduworks.pebl.addThemeDialog')
    	window.__adobe_cep__.closeExtension();
}

PeblIndesign.goToPage = function(page) {
    var funcString = 'goToPage(' + page + ');';
    csInterface.evalScript(funcString, function(result) {
        console.log(result);
    });
}

PeblIndesign.previewHtml = function(html, slug) {
    csInterface.requestOpenExtension('com.eduworks.pebl.preview', '');
    var funcString = "previewHtml('" + escape(html) + "', '" + slug + "');";
    csInterface.evalScript(funcString,
        function(result) {
            console.log(result);
        }
    )
}

PeblIndesign.getPlaceholderCss = function() {
	try {
		var path = csInterface.getSystemPath(SystemPath.EXTENSION)
	    path = path.replace(/^\//, '');

	    var separator = '/';
	    var os = csInterface.getOSInformation();
	    

	    path += separator + 'client' + separator + 'css' + separator + 'indesignExtensionPlaceholders.css';

	    if (os) {
	        os = os.toLowerCase().indexOf('mac') >= 0 ? "MAC": "WINDOWS";
	        if (os === 'MAC') {
	            path = '/' + path;
	        }
	    }

	    var result = node_fs.readFileSync(path, 'utf8');
	    return result;
	} catch (e) {
		PeblIndesign.logToFile('PeBL Error: 52 - ' + e.toString());
		alert('PeBL Error: 52 - ' + e.toString());
	}

}

PeblIndesign.insertHtml = function(html, propertiesObject, dependenciesArray, selectedContentBehavior, imageMap) {
	try {
		var placeholderCss = PeblIndesign.getPlaceholderCss();
		html = '<style>' + placeholderCss + '</style>' + html;
		var propertiesJSON = JSON.stringify(propertiesObject);
		var dependenciesString = '<head><script type="text/javascript" src="js/iframeResizer.contentWindow.min.js"></script>' + dependenciesArray.join('') + '</head>';
	    var funcString = "insertHtml('" + escape(html) + "', '" + propertiesJSON + "', '" + dependenciesString + "', '" + selectedContentBehavior + "', '" + JSON.stringify(imageMap) + "');";
		csInterface.evalScript(funcString,
			function(result) {
				console.log(result);
			}
		)
	} catch(e) {
		PeblIndesign.logToFile('PeBL Error: 47 - ' + e.toString());
		alert('PeBL Error: 47 - ' + e.toString());
	}
}

PeblIndesign.updateHtml = function(html, propertiesObject, dependenciesArray, imageMap) {
	try {
		var placeholderCss = PeblIndesign.getPlaceholderCss();
		html = '<style>' + placeholderCss + '</style>' + html;
		var propertiesJSON = JSON.stringify(propertiesObject);
	    var dependenciesString = '<head><script type="text/javascript" src="js/iframeResizer.contentWindow.min.js"></script>' + dependenciesArray.join('') + '</head>';
	    var funcString = "updateHtml('" + escape(html) + "', '" + propertiesJSON + "', '" + dependenciesString + "', '" + JSON.stringify(imageMap) + "');";
	    csInterface.evalScript(funcString,
	        function(result) {
	            console.log(result);
	        }
	    )
	} catch(e) {
		PeblIndesign.logToFile('PeBL Error: 48 - ' + e.toString());
		alert('PeBL Error: 48 - ' + e.toString());
	}
}

PeblIndesign.getSelectedContent = function(callback) {
    var funcString = "getSelectedContent();";
    csInterface.evalScript(funcString, function(result) {
        callback(result);
    });
}


PeblIndesign.saveSettings = function(settingsObject) {
    var funcString = "savePeblSettings('" + JSON.stringify(settingsObject) + "');";
    csInterface.evalScript(funcString, function(result) {
        console.log(result);
    });
}

PeblIndesign.getSettings = function(callback) {
	var funcString = "getPeblSettings();";
	csInterface.evalScript(funcString, function(result) {
		var settingsObject = {};
        try {
            settingsObject = JSON.parse(result);
            console.log(settingsObject);
        } catch (e) {
            console.log(e);
            console.log(settingsObject);
        }
		callback(settingsObject);
	});
}

PeblIndesign.getContentMorphingLevels = function(callback) {
	PeblIndesign.getSettings(function(settingsObject) {
		if (settingsObject.contentMorphingLevels)
			callback(settingsObject.contentMorphingLevels);
		else
			callback([]);
	});
}

PeblIndesign.getThemes = function(callback) {
	PeblIndesign.getSettings(function(settingsObject) {
		var customThemes = Object.keys(settingsObject.customThemes ? settingsObject.customThemes : {});
		callback(['Default', 'Gunmetal', 'Rounded Blue'].concat(customThemes));
	});
}

PeblIndesign.getTheme = function(themeName, callback) {
	PeblIndesign.getSettings(function(settingsObject) {
		try {
			if (!themes[themeName] && (!settingsObject.customThemes || !settingsObject.customThemes[themeName]))
				callback(null);

			if (themes[themeName]) {
				var path = csInterface.getSystemPath(SystemPath.EXTENSION)
			    path = path.replace(/^\//, '');

			    var separator = '/';
			    var os = csInterface.getOSInformation();
			    

			    path += separator + 'client' + separator + 'Extensions' + separator + 'Themes' + separator + themes[themeName];

			    if (os) {
		            os = os.toLowerCase().indexOf('mac') >= 0 ? "MAC": "WINDOWS";
		            if (os === 'MAC') {
		                path = '/' + path;
		            }
		        }

			    var result = node_fs.readFileSync(path, 'utf8');
			    callback(result);
			} else {
				var path = settingsObject.customThemes[themeName];
				if (path[0] === '~' && (path[1] === '/' || path.length === 1))
					path = path.replace('~', node_os.homedir());

				var result = node_fs.readFileSync(node_path.resolve('/', path), 'utf8');
				callback(result);
			}
		} catch(e) {
			// alert('PeBL Error: 49 - ' + e.toString());
			callback()
		}
	});
}

PeblIndesign.getGlobalTheme = function(callback) {
	var funcString = 'getGlobalPeblThemeName();';
	csInterface.evalScript(funcString, function(result) {
		callback(result);
	});
}

PeblIndesign.verifyContentBlocksExist = function(arrayOfIds, callback) {
	var stringified = JSON.stringify(arrayOfIds);
	var funcString = "contentBlocksExist('" + stringified + "');";
	csInterface.evalScript(funcString, function(result) {
		callback(JSON.parse(result));
	});
}

PeblIndesign.verifyInsertionPoint = function(callback) {
	var funcString = 'verifyInsertionPoint();';
	csInterface.evalScript(funcString, function(result) {
		if (result === "true") {
			callback(true);
		} else {
			callback(false);
		}
	});
}

PeblIndesign.verifyInsertionPointNotContentMorphingBlock = function(callback) {
	var funcString = 'verifyInsertionPointNotContentMorphingBlock();';
	csInterface.evalScript(funcString, function(result) {
		if (result === "true") {
			callback(true);
		} else {
			callback(false);
		}
	});
}

PeblIndesign.addTheme = function(name, pathToCss) {
	var funcString = "addTheme('" + escape(name) + "', '" + escape(pathToCss) + "');";
	csInterface.evalScript(funcString, function(result) {
		console.log(result);
	});
}
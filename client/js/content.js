var node_os = require("os");

csInterface = new CSInterface();

//Make the panel persistent so it doesn't reload when hidden and re-opened
var event = new CSEvent("com.adobe.InDesignPersistent", "APPLICATION");
event.extensionId = "com.eduworks.pebl.content";
csInterface.dispatchEvent(event);

var needsListenerEdit = true;
var needsListenerPreview = true;

csInterface.addEventListener("refreshPeblContentWindow", function(event) {
    try {
        window.PeblIndesign.resetContentPeblWindow();
        window.PeblAuthoring.openContentPeblWindow('#testDiv');
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 30 - ' + e.toString());
        alert('PeBL Error: 30 - ' + e.toString());
    }
});

csInterface.addEventListener("editExtension", function(event) {
    try {
        var slug = event.data.dataProperties.type;
        window.PeblIndesign.openEditWidgetDialog(slug, event.data.dataProperties, event.data.imageMap);
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 31 - ' + e.toString());
        alert('PeBL Error: 31 - ' + e.toString());
    }
});

csInterface.addEventListener("openPreviewPeblWindow", function(event) {
    try {
        window.PeblIndesign.openPreviewPanel(event.data);
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 32 - ' + e.toString());
        alert('PeBL Error: 32 - ' + e.toString());
    }
});

csInterface.addEventListener("peblExtensionSelected", function(event) {
    var id = event.data;
    var event = new CustomEvent('peblExtensionSelected', {detail: id});
    window.dispatchEvent(event);
});

csInterface.addEventListener("setEpubExportOptions", function(event) {
    try {
        var additionalOptions = event.data;
        console.log(additionalOptions);
        var path = csInterface.getSystemPath(SystemPath.EXTENSION)
        path = path.replace(/^\//, '');
        // alert(csInterface.getSystemPath(SystemPath.EXTENSION));
        // var separator = path.split('com.eduworks.pebl')[1].charAt(0);
        var separator = '/';
        var os = csInterface.getOSInformation();
        if (os) {
            os = os.toLowerCase().indexOf('mac') >= 0 ? "MAC": "WINDOWS";
            if (os === 'MAC') {
                separator = ':';
                path = path.replace(/\//g, separator);
            }
        }
        
        path += separator + 'client' + separator;

        var options = {
            externalStyleSheets: [
                path + "Extensions" + separator + "LoginExtension" + separator + "pebl-login-widget.css",
                path + "Extensions" + separator + "DiscussionExtension" + separator + "pebl-discussion-widget.css",
                path + "Extensions" + separator + "AskExpertExtension" + separator + "pebl-askExpert-widget.css",
                path + "Extensions" + separator + "ContentMorphingExtension" + separator + "pebl-contentMorphing-widgetV2.css",
                path + "Extensions" + separator + "DataEntryExtension" + separator + "pebl-dataEntry-widget.css",
                path + "Extensions" + separator + "DynamicReturnLinkExtension" + separator + "pebl-dynamicReturnLink-widget.css",
                path + "Extensions" + separator + "DynamicTOCExtension" + separator + "pebl-dynamicTOC-widget.css",
                path + "Extensions" + separator + "FigureExtension" + separator + "pebl-figure-widget.css",
                path + "Extensions" + separator + "GuidedTourExtension" + separator + "pebl-guidedTour-widget.css",
                path + "Extensions" + separator + "HotwordExtension" + separator + "pebl-hotword-widget.css",
                path + "Extensions" + separator + "KnowledgeNetworkExtension" + separator + "pebl-knowledgeNetwork-widget.css",
                path + "Extensions" + separator + "PopoutExtension" + separator + "pebl-popout-widget.css",
                path + "Extensions" + separator + "QuizExtension" + separator + "pebl-quiz-widgetV2.css",
                path + "Extensions" + separator + "RatingExtension" + separator + "pebl-ratings-widget.css",
                path + "Extensions" + separator + "ShowHideExtension" + separator + "pebl-showHide-widget.css",
                path + "Extensions" + separator + "ExternalResourcesExtension" + separator + "pebl-externalResources-widget.css",
                path + "Extensions" + separator + "NotificationsExtension" + separator + "pebl-notifications-widget.css",
                path + "Extensions" + separator + "MenuBarExtension" + separator + "pebl-menuBar-widget.css",
                path + "Extensions" + separator + "Themes" + separator + "pebl-theme-default.css",
                path + "css" + separator + "indesignOverrides.css"
            ],
            javascripts: [
                path + "js" + separator + "jquery-3.3.1.min.js",
                path + "js" + separator + "vue.min.js",
                path + "Extensions" + separator + "PEBLCore.js",
                path + "Extensions" + separator + "LoginExtension" + separator + "pebl-login-widget.js",
                path + "Extensions" + separator + "DiscussionExtension" + separator + "pebl-discussion-widget.js",
                path + "Extensions" + separator + "AskExpertExtension" + separator + "pebl-askExpert-widget.js",
                path + "Extensions" + separator + "CarouselExtension" + separator + "pebl-carousel-widget.js",
                path + "Extensions" + separator + "ContentMorphingExtension" + separator + "pebl-contentMorphing-widgetV2.js",
                path + "Extensions" + separator + "DataEntryExtension" + separator + "pebl-dataEntry-widget.js",
                path + "Extensions" + separator + "DynamicReturnLinkExtension" + separator + "pebl-dynamicReturnLink-widget.js",
                path + "Extensions" + separator + "DynamicTOCExtension" + separator + "pebl-dynamicTOC-widget.js",
                path + "Extensions" + separator + "FigureExtension" + separator + "pebl-figure-widget.js",
                path + "Extensions" + separator + "GuidedTourExtension" + separator + "pebl-guidedTour-widget.js",
                path + "Extensions" + separator + "HotwordExtension" + separator + "pebl-hotword-widget.js",
                path + "Extensions" + separator + "KnowledgeNetworkExtension" + separator + "pebl-knowledgeNetwork-widget.js",
                path + "Extensions" + separator + "PopoutExtension" + separator + "pebl-popout-widget.js",
                path + "Extensions" + separator + "QuizExtension" + separator + "pebl-quiz-widgetV2.js",
                path + "Extensions" + separator + "RatingExtension" + separator + "pebl-ratings-widget.js",
                path + "Extensions" + separator + "ShowHideExtension" + separator + "pebl-showHide-widget.js",
                path + "Extensions" + separator + "ExternalResourcesExtension" + separator + "pebl-externalResources-widget.js",
                path + "Extensions" + separator + "NotificationsExtension" + separator + "pebl-notifications-widget.js",
                path + "Extensions" + separator + "MenuBarExtension" + separator + "pebl-menuBar-widget.js"
            ]
        }

        if (additionalOptions && additionalOptions.theme) {
            options.externalStyleSheets.push(path + "Extensions" + separator + "Themes" + separator + additionalOptions.theme);
        } else if (additionalOptions && additionalOptions.customTheme) {
            if (additionalOptions.customTheme[0] === '~' && (additionalOptions.customTheme[1] === '/' || additionalOptions.customTheme.length === 1))
                    additionalOptions.customTheme = additionalOptions.customTheme.replace('~', node_os.homedir());
            options.externalStyleSheets.push(additionalOptions.customTheme);
        }

        var funcString = "setEpubExportOptions('" + escape(JSON.stringify(options)) + "');";
        csInterface.evalScript(funcString,
            function(result) {
                console.log(result);
            }
        )
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 33 - ' + e.toString());
        alert('PeBL Error: 33 - ' + e.toString());
    }
});

function init() {
    try {
        window.PeblAuthoring.openContentPeblWindow('#testDiv');
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 34 - ' + e.toString());
        alert('PeBL Error: 34 - ' + e.toString());
    }
}
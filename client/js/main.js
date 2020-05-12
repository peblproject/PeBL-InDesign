csInterface = new CSInterface();

function init() {
    try {
        var event = new CSEvent("loadedInsertWidgetDialog", "APPLICATION");
        csInterface.dispatchEvent(event);
        window.PeblAuthoring.openInsertPeblWindow('#testDiv');
    } catch (e) {
    	window.PeblIndesign.logToFile('PeBL Error: 37 - ' + e.toString());
        alert('PeBL Error: 37 - ' + e.toString());
    }
}
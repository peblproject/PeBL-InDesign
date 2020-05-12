csInterface = new CSInterface();

function init() {
    try {
        csInterface.setWindowTitle('Add PeBL Theme');
        var event = new CSEvent("loadedAddThemeDialog", "APPLICATION");
        csInterface.dispatchEvent(event);

        window.PeblAuthoring.openAddThemeWindow('#testDiv');
    } catch(e) {
    	window.PeblIndesign.logToFile('PeBL Error: init addThemeDialog - ' + e.toString());
        alert('PeBL Error: init addThemeDialog - ' + e.toString());
    }
}

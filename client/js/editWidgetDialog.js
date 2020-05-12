csInterface = new CSInterface();

csInterface.addEventListener("generateEditWidgetDialog", function(event) {
    try {
        console.log(event.data);
        window.PeblIndesign.resetEditPeblWindow();
        var extensionTitle = window.PeblAuthoring.getExtensionTitle(event.data.slug);
        csInterface.setWindowTitle('Edit ' + extensionTitle);
        window.PeblAuthoring.openEditPeblWindow('#testDiv', event.data.slug, undefined, event.data.editArgs, event.data.selectedContent, event.data.imageMap);
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 35 - ' + e.toString());
        alert('PeBL Error: 35 - ' + e.toString());
    }
});

function init() {
    try {
        var event = new CSEvent("loadedEditWidgetDialog", "APPLICATION");
        csInterface.dispatchEvent(event);
    } catch (e) {
        window.PeblIndesign.logToFile('PeBL Error: 36 - ' + e.toString());
        alert('PeBL Error: 36 - ' + e.toString());
    }
}

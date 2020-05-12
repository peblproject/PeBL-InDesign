csInterface = new CSInterface();

csInterface.addEventListener("addedPeblTheme", function(evt) {
    window.PeblIndesign.resetSettingsPeblWindow();
    init();
});



function init() {
    try {
        document.body.addEventListener('click', function(evt) {
            var targetElement = evt.target;
            while (targetElement != null) {
                if (targetElement.matches('a.mailtoLink')) {
                    csInterface.openURLInDefaultBrowser(targetElement.getAttribute('href'));
                    return;
                }
                targetElement = targetElement.parentElement;
            }
        }, true);
        
        var event = new CSEvent("loadedSettingsDialog", "APPLICATION");
        csInterface.dispatchEvent(event);

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
            window.PeblAuthoring.openSettingsPeblWindow('#testDiv', settingsObject);
        });
    } catch(e) {
        window.PeblIndesign.logToFile('PeBL Error: 51 - ' + e.toString());
        alert('PeBL Error: 51 - ' + e.toString());
    }
}

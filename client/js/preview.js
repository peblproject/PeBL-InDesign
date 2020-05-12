csInterface = new CSInterface();

//https://stackoverflow.com/questions/5069464/replace-multiple-strings-at-once
function replaceBulk( str, findArray, replaceArray ){
  var i, regex = [], map = {}; 
  for( i=0; i<findArray.length; i++ ){ 
    regex.push( findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g,'\\$1') );
    map[findArray[i]] = replaceArray[i]; 
  }
  regex = regex.join('|');
  str = str.replace( new RegExp( regex, 'g' ), function(matched){
    return map[matched];
  });
  return str;
}

csInterface.addEventListener("previewExtension", function(event) {    
  try {
    var payload = event.data;
    
    window.PeblIndesign.resetPreviewPeblWindow();

    if (payload.imageMap) {
        console.log(payload.imageMap);
        var findStrings = Object.keys(payload.imageMap.ebookToLocalPaths);
        var replaceStrings = [];
        for (let i = 0; i < findStrings.length; i++) {
            replaceStrings.push(payload.imageMap.ebookToLocalPaths[findStrings[i]]);
        }
        if (findStrings.length > 0 && replaceStrings.length > 0)
          payload.html = replaceBulk(payload.html, findStrings, replaceStrings);
    }

    window.PeblAuthoring.openPreviewPeblWindow('#peblPreviewAnchor', payload.html, payload.slug);
  } catch (e) {
    alert('PeBL Error: 50 - ' + e.toString());
  }
});

function init() {
    var event = new CSEvent("loadedPreviewPanel", "APPLICATION");
    csInterface.dispatchEvent(event);
}
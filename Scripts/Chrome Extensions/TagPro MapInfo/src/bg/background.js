
chrome.pageAction.onClicked.addListener(function(){
    chrome.tabs.create({
        url: "src/page_action/page_action.html"
    });
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.type === 'view') {
        chrome.pageAction.show(sender.tab.id);

    } else if(request.type === 'error') {
        var opts = {
            type: "basic",
            title: "Error",
            iconUrl: "icons/icon48.png",
            message: request.message
        };
        chrome.notifications.create('', opts, function(){console.log('notification created');});
    }
});

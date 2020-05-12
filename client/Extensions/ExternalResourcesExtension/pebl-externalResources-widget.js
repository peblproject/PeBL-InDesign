/*
Copyright 2020 Eduworks Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//TODO: Perform some checks to find where these variables are on different platforms.
var globalPebl = (window.parent && window.parent.PeBL) ? window.parent.PeBL : (window.PeBL ? window.PeBL : null);
var globalReadium = window.parent.READIUM;

var externalResources = {};

globalPebl.extension.externalResources = externalResources;

$(document).ready(function() {
    jQuery('.peblExtension[data-peblextension="externalResources"], .peblExtension[data-peblExtension="externalResources"]').each(function () {
        var insertID = this.getAttribute('id');
        var buttonText = this.getAttribute('data-buttonText');
        var resources = JSON.parse(this.getAttribute('data-externalResources'));
        var enablePulling = this.getAttribute('data-enablePulling');
        externalResources.createExternalResourcesButton(insertID, buttonText, resources, enablePulling);
    });

    globalPebl.subscribeSingularEvent(globalPebl.events.eventNextPage, 'externalResources', false, function() {
        externalResources.closeDynamicPage();
        jQuery('.peblModal').remove();
    });

    globalPebl.subscribeSingularEvent(globalPebl.events.eventPrevPage, 'externalResources', false, function() {
        externalResources.closeDynamicPage();
        jQuery('.peblModal').remove();
    });
});

// hide modals when clicking other areas
jQuery(document).mouseup(function (e) {
    var container = jQuery('.peblModal');
    if (!container.is(e.target) // if the target of the click isn't the container...
        &&
        container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        container.remove();
    }
});

externalResources.createExternalResourcesButton = function(insertID, buttonText, resources, enablePulling) {
    var externalResourcesButtonWrapper = document.createElement('div');
    externalResourcesButtonWrapper.setAttribute('data-theme-target', insertID);

    var externalResourcesButton = document.createElement('button');
    externalResourcesButton.classList.add('externalResourcesButton');
    externalResourcesButton.textContent = buttonText;
    externalResourcesButton.addEventListener('click', function() {
        externalResources.createExternalResourcesModal(document.body, resources, insertID, false, enablePulling);
    });

    externalResourcesButtonWrapper.appendChild(externalResourcesButton);

    insertLocation = document.getElementById(insertID);

    insertLocation.parentNode.insertBefore(externalResourcesButtonWrapper, insertLocation);
    insertLocation.remove();
}

externalResources.createDynamicPage = function(url, title, hideSource) {
    externalResources.closeDynamicPage();

    var dynamicPageHeader = document.createElement('div');
    dynamicPageHeader.id = 'dynamicPageHeader';
    dynamicPageHeader.classList.add('dynamicPageHeader');

    var dynamicPageHeaderLink = document.createElement('a');
    dynamicPageHeaderLink.id = 'dynamicPageHeaderLink';
    dynamicPageHeaderLink.classList.add('dynamicPageHeaderLink');
    dynamicPageHeaderLink.href = url;
    dynamicPageHeaderLink.innerHTML = url;
    dynamicPageHeaderLink.addEventListener('click', function() {
        externalResources.handleDynamicPageHeaderLinkClick(event);
    });

    if (!hideSource)
        dynamicPageHeader.appendChild(dynamicPageHeaderLink);


    var dynamicPageCloseButton = document.createElement('i');
    dynamicPageCloseButton.id = 'dynamicPageCloseButton';
    dynamicPageCloseButton.classList.add('dynamicPageCloseButton', 'fa', 'fa-times');
    dynamicPageCloseButton.addEventListener('click', function() {
        externalResources.closeDynamicPage();
    });

    var dynamicPage = document.createElement('div');
    dynamicPage.id = 'dynamicPage';
    dynamicPage.classList.add('dynamicPage');
    dynamicPage.setAttribute('resource-id', url);
    dynamicPage.setAttribute('title', title);

    var dynamicPageWrapper = document.createElement('div');
    dynamicPageWrapper.classList.add('responsive-wrapper');

    var dynamicPageFrame = document.createElement('iframe');
    dynamicPageFrame.id = 'dynamicPageFrame';
    dynamicPageFrame.classList.add('dynamicPageFrame');
    dynamicPageFrame.src = url;

    dynamicPageWrapper.appendChild(dynamicPageFrame);

    dynamicPage.appendChild(dynamicPageWrapper);
    document.body.appendChild(dynamicPageHeader);
    document.body.appendChild(dynamicPage);
    document.body.appendChild(dynamicPageCloseButton);
}

externalResources.handleResourceClick = function(event, id) {
    event.preventDefault();
    if (event.currentTarget.hasAttribute('data-url')) {
        globalPebl.emitEvent(globalPebl.events.eventAccessed, {
            name: event.currentTarget.textContent,
            type: 'resource',
            description: event.currentTarget.getAttribute('data-url'),
            target: id
        });
        externalResources.createDynamicPage($(event.currentTarget).attr('data-url'), $(event.currentTarget).text()); 
        $('#externalResourcesModal').remove();
    }
}

externalResources.closeDynamicPage = function() {
    $('#dynamicPageHeader').remove();
    $('#dynamicPageCloseButton').remove();
    $('#dynamicPage').remove();
}

externalResources.createExternalResourcesModal = function(element, resources, id, showAllResources, enablePulling) {
    jQuery('.peblModal').remove();

    var externalResourcesModal = document.createElement('div');
    externalResourcesModal.id = 'externalResourcesModal';
    externalResourcesModal.classList.add('externalResourcesModal', 'peblModal');
    externalResourcesModal.setAttribute('data-theme-target', id);

    var externalResourcesModalHeader = document.createElement('div');
    externalResourcesModalHeader.classList.add('externalResourcesModalHeader');

    var externalResourcesModalHeaderText = document.createElement('span');
    externalResourcesModalHeaderText.textContent = 'External Resources';

    externalResourcesModalHeader.appendChild(externalResourcesModalHeaderText);

    var externalResourcesModalAddButton = document.createElement('button');
    externalResourcesModalAddButton.textContent = 'Add a Resource to Your Book';
    externalResourcesModalAddButton.addEventListener('click', function() {
        externalResources.createAddResourceModal(document.body, id);
    });
    
    var closeButton = document.createElement('i');
    closeButton.classList.add('fa', 'fa-times', 'externalResourcesModalCloseButton');
    closeButton.addEventListener('click', function() {
        $('#externalResourcesModal').remove();
        globalPebl.emitEvent(globalPebl.events.eventUndisplayed, {
            type: 'resource',
            target: id
        });
    });

    externalResourcesModalHeader.appendChild(closeButton);

    externalResourcesModal.appendChild(externalResourcesModalHeader);

    var externalResourcesModalBody = document.createElement('div');
    externalResourcesModalBody.classList.add('externalResourcesModalBody');

    externalResourcesModal.appendChild(externalResourcesModalBody);
    for (var resource of resources) {
        if (resource.enabled || showAllResources) {
            var externalResource = externalResources.createResourceLink(resource, id);
            if (externalResource)
                externalResourcesModalBody.appendChild(externalResource);
        } 
    }

    //Add additional added resources
    //Assumes a dummy TOC is in place with just a Section1
    var getAdditionalResorces = function() {
        globalPebl.utils.getToc(function(toc) {
            if (toc && toc.Section1) {
                $(externalResourcesModalBody).children('.additionalResource').remove();
                for (var key in toc.Section1) {
                    var tocEntry = toc.Section1[key];
                    if (tocEntry.externalURL && tocEntry.documentName &&
                       (tocEntry.card === id || showAllResources)) {
                        var resource = {
                            url: tocEntry.externalURL,
                            title: tocEntry.documentName,
                            id: tocEntry.pageKey
                        }
                        var externalResource = externalResources.createResourceLink(resource, id);
                        if (externalResource) {
                            externalResource.classList.add('additionalResource');
                            externalResourcesModalBody.appendChild(externalResource);
                        }
                    }
                }
            }
        });
        console.log('adding more resources');
    }
    getAdditionalResorces();
    
    globalPebl.unsubscribeEvent(globalPebl.events.updatedToc, false, getAdditionalResorces);
    globalPebl.subscribeEvent(globalPebl.events.updatedToc, false, getAdditionalResorces);

    if (enablePulling || showAllResources)
        externalResourcesModal.appendChild(externalResourcesModalAddButton);

    element.appendChild(externalResourcesModal);

    globalPebl.emitEvent(globalPebl.events.eventDisplayed, {
        type: 'resource',
        target: id
    });
    //Fix scrolling, iOS sucks
    setTimeout(function() {
        $('.externalResourcesModalBody').attr('style', 'transform: translate3d(0px, 0px, 0px);');
    }, 1000);
}

externalResources.createResourceLink = function(resource, id) {
    var externalResource = document.createElement('div');
    externalResource.classList.add('externalResource');
    externalResource.setAttribute('data-url', resource.url);
    externalResource.addEventListener('click', function() {
        externalResources.handleResourceClick(event, id);
    });

    var externalResourceIconWrapper = document.createElement('div');
    externalResourceIconWrapper.classList.add('externalResourceIconWrapper');

    var externalResourceIcon = document.createElement('i');
    externalResourceIcon.classList.add('externalResourceIcon', 'fa', 'fa-external-link-square-alt');

    externalResourceIconWrapper.appendChild(externalResourceIcon);

    var externalResourceText = document.createElement('span');
    externalResourceText.textContent = resource.title;

    externalResource.appendChild(externalResourceText);
    externalResource.appendChild(externalResourceIconWrapper);

    return externalResource;
}

externalResources.pullResource = function(target, url, docType, name, id)  {
    globalPebl.storage.getCurrentBook(function(book) {
        var data = {
            target: target,
            location: 'Section1',
            card: id,
            book: book,
            externalURL: url,
            docType: docType,
            name: name,
            url: url
        }
        globalPebl.emitEvent(globalPebl.events.newReference, data);
    });
}

externalResources.createAddResourceModal = function(element, id) {
    jQuery('.peblModal').remove();

    var addResourceModal = document.createElement('div');
    addResourceModal.classList.add('externalResourcesAddResourceModal', 'peblModal');
    addResourceModal.id = 'externalResourcesAddResourceModal';

    var addResourceModalHeader = document.createElement('div');
    addResourceModalHeader.classList.add('externalResourcesAddResourceModalHeader');

    var addResourceModalHeaderText = document.createElement('span');
    addResourceModalHeaderText.classList.add('externalResourcesAddResourceModalHeaderText');
    addResourceModalHeaderText.textContent = 'Add Resource';

    addResourceModalHeader.appendChild(addResourceModalHeaderText);

    var addResourceModalCloseButton = document.createElement('i');
    addResourceModalCloseButton.classList.add('fa', 'fa-times', 'externalResourcesAddResourceModalCloseButton');
    addResourceModalCloseButton.addEventListener('click', function() {
        jQuery('#externalResourcesAddResourceModal').remove();
    });

    addResourceModalHeader.appendChild(addResourceModalCloseButton);

    addResourceModal.appendChild(addResourceModalHeader);

    var addResourceModalBody = document.createElement('div');
    addResourceModalBody.classList.add('externalResourcesAddResourceModalBody');

    var addResourceDescription = document.createElement('p');
    addResourceDescription.classList.add('externalResourcesAddResourceModalDescription');
    addResourceDescription.textContent = 'Enter a title and URL below to add a resource to your Additional Resources. Your resource will be added to the list based on your current place in the book.';

    var addResourceTitle = document.createElement('div');
    addResourceTitle.classList.add('AddResources_inputContainer');

    var addResourceTitleInputLabel = document.createElement('label');
    addResourceTitleInputLabel.for = 'externalResourcesAddResourceTitle';
    addResourceTitleInputLabel.textContent = 'Resource Title: ';

    var addResourceTitleInput = document.createElement('input');
    addResourceTitleInput.id = 'externalResourcesAddResourceTitle';

    addResourceTitle.appendChild(addResourceTitleInputLabel);
    addResourceTitle.appendChild(addResourceTitleInput);

    var addResourceUrl = document.createElement('div');
    addResourceUrl.classList.add('AddResources_inputContainer');

    var addResourceUrlInputLabel = document.createElement('label');
    addResourceUrlInputLabel.for = 'externalResourcesAddResourceUrl';
    addResourceUrlInputLabel.textContent = 'Resource URL: ';

    var addResourceUrlInput = document.createElement('input');
    addResourceUrlInput.id = 'externalResourcesAddResourceUrl'

    addResourceUrl.appendChild(addResourceUrlInputLabel);
    addResourceUrl.appendChild(addResourceUrlInput);

    var addResourceSuccess = document.createElement('div');
    addResourceSuccess.classList.add('externalResourcesAddResourceModalSuccess');

    var addResourceSuccessText = document.createElement('p');
    addResourceSuccessText.textContent = 'Your resource will be added to your Additional Resources shortly.';

    var addResourceAgainButton = document.createElement('button');
    addResourceAgainButton.textContent = 'Add Another Resource';
    addResourceAgainButton.addEventListener('click', function () {
        externalResources.createAddResourceModal(element, id);
    });

    addResourceSuccess.appendChild(addResourceSuccessText);
    addResourceSuccess.appendChild(addResourceAgainButton);

    var addResourceSubmitButton = document.createElement('button');
    addResourceSubmitButton.textContent = 'Add Resource';
    addResourceSubmitButton.addEventListener('click', function() {
        globalPebl.user.getUser(function (userProfile) {
            var url = addResourceUrlInput.value;
            var title = addResourceTitleInput.value;

            if (url.trim().length > 0 && title.trim().length > 0 && userProfile) {
                if (!url.match(/^http?:\/\//i) && !url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }
                externalResources.pullResource(userProfile.identity, url, 'html', title, id);
                jQuery(addResourceSuccess).show();
                jQuery(addResourceModalBody).hide();
            } else {
                window.alert('Please fill out both fields.');
            }
        });
    });

    addResourceModalBody.appendChild(addResourceDescription);
    addResourceModalBody.appendChild(addResourceTitle);
    addResourceModalBody.appendChild(addResourceUrl);
    addResourceModalBody.appendChild(addResourceSubmitButton);

    addResourceModal.appendChild(addResourceModalBody);
    addResourceModal.appendChild(addResourceSuccess);

    element.appendChild(addResourceModal);
}
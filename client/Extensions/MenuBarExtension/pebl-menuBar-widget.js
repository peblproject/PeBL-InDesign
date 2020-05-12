var globalPebl = (window.parent && window.parent.PeBL) ? window.parent.PeBL : (window.PeBL ? window.PeBL : null);
var globalReadium = window.parent.READIUM;

var menuBar = {};

globalPebl.extension.menuBar = menuBar;

$(document).ready(function() {
	if (globalPebl.extension.config.menuBar.enabled)
		menuBar.createOverlay();
});

menuBar.createOverlay = function() {
	document.querySelector('head').innerHTML += '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous" type="text/css"/>';
	var menu = document.createElement('nav');
	menu.id = "pebl__main-menu";

	var collapsedMenu = document.createElement('div');
	collapsedMenu.id = 'main-menu__collapsed';

	//External Resources button

	var expandedMenuExternalResourcesButton = document.createElement('li');
	expandedMenuExternalResourcesButton.title = 'External Resources';
	expandedMenuExternalResourcesButton.id = 'menuBarExternalResourcesButton';
	
	var externalResourcesButtonLink = document.createElement('a');
	externalResourcesButtonLink.addEventListener('click', function() {
		globalPebl.extension.externalResources.createExternalResourcesModal(document.body, globalPebl.extension.config.externalResources.resources, 'menuBarExternalResources', true);
	});

	var externalResourcesSpan = document.createElement('span');
	externalResourcesSpan.classList.add('fa-stack', 'fa-lg');

	var externalResourcesCircleIcon = document.createElement('i');
	externalResourcesCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

	var externalResourcesButtonIcon = document.createElement('i');
	externalResourcesButtonIcon.classList.add('fa', 'fa-list', 'fa-stack-1x', 'fa-inverse');
	externalResourcesButtonIcon.setAttribute('aria-hidden', 'true');

	externalResourcesSpan.appendChild(externalResourcesCircleIcon);
	externalResourcesSpan.appendChild(externalResourcesButtonIcon);

	var externalResourcesTextSpan = document.createElement('span');
	externalResourcesTextSpan.textContent = ' External Resources';
	externalResourcesTextSpan.classList.add('main-menu__iconLabel');

	externalResourcesButtonLink.appendChild(externalResourcesSpan);
	//externalResourcesButtonLink.appendChild(externalResourcesTextSpan);
	expandedMenuExternalResourcesButton.appendChild(externalResourcesButtonLink);
	collapsedMenu.appendChild(expandedMenuExternalResourcesButton);

	//Note button

	var expandedMenuNoteButton = document.createElement('li');
	expandedMenuNoteButton.title = 'Notes';
	expandedMenuNoteButton.id = 'menuBarNotesButton';

	var expandedMenuNoteButtonLink = document.createElement('a');
	expandedMenuNoteButtonLink.setAttribute('data-sharing', 'private');
	expandedMenuNoteButtonLink.setAttribute('detailText', 'Take private notes.');
	expandedMenuNoteButtonLink.id = globalPebl.extension.config.menuBar.notesThread;
	expandedMenuNoteButtonLink.addEventListener('click', function() {
		globalPebl.extension.discussion.handleChatButtonClick(this);
	});

	var noteSpan = document.createElement('span');
	noteSpan.classList.add('fa-stack', 'fa-lg');

	var noteCirceIcon = document.createElement('i');
	noteCirceIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

	var expandedMenuNoteButtonIcon = document.createElement('i');
	expandedMenuNoteButtonIcon.classList.add('fa', 'fa-sticky-note', 'fa-stack-1x', 'fa-inverse');
	expandedMenuNoteButtonIcon.setAttribute('aria-hidden', 'true');

	noteSpan.appendChild(noteCirceIcon);
	noteSpan.appendChild(expandedMenuNoteButtonIcon);

	var expandedMenuNoteButtonPrompt = document.createElement('p');
	expandedMenuNoteButtonPrompt.textContent = 'My Notes';
	expandedMenuNoteButtonPrompt.style.display = 'none';

	var noteTextSpan = document.createElement('span');
	noteTextSpan.textContent = ' Notes';
	noteTextSpan.classList.add('main-menu__iconLabel');

	expandedMenuNoteButtonLink.appendChild(noteSpan);
	//expandedMenuNoteButtonLink.appendChild(noteTextSpan);
	expandedMenuNoteButton.appendChild(expandedMenuNoteButtonLink);
	expandedMenuNoteButton.appendChild(expandedMenuNoteButtonPrompt);
	collapsedMenu.appendChild(expandedMenuNoteButton);

	//Discuss button

	var expandedMenuDiscussButton = document.createElement('li');
	expandedMenuDiscussButton.title = 'Forum';
	expandedMenuDiscussButton.id = 'menuBarForumButton';

	var expandedMenuDiscussButtonLink = document.createElement('a');
	expandedMenuDiscussButtonLink.setAttribute('data-sharing', 'all');
	expandedMenuDiscussButtonLink.setAttribute('detailText', 'Discuss with other users.');
	expandedMenuDiscussButtonLink.setAttribute('data-peblAction', 'menuBarDiscussion');
	expandedMenuDiscussButtonLink.id = globalPebl.extension.config.menuBar.forumThread;
	menuBar.openMenuBarDiscussion = function() {
		globalPebl.extension.discussion.handleChatButtonClick(expandedMenuDiscussButtonLink);
	}
	expandedMenuDiscussButtonLink.addEventListener('click', function() {
		menuBar.openMenuBarDiscussion();
	});

	var discussSpan = document.createElement('span');
	discussSpan.classList.add('fa-stack', 'fa-lg');

	var discussCircleIcon = document.createElement('i');
	discussCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

	var expandedMenuDiscussButtonIcon = document.createElement('i');
	expandedMenuDiscussButtonIcon.classList.add('fa', 'fa-comments', 'fa-stack-1x', 'fa-inverse');
	expandedMenuDiscussButtonIcon.setAttribute('aria-hidden', 'true');

	discussSpan.appendChild(discussCircleIcon);
	discussSpan.appendChild(expandedMenuDiscussButtonIcon);

	var expandedMenuDiscussButtonPrompt = document.createElement('p');
	expandedMenuDiscussButtonPrompt.textContent = 'Forum';
	expandedMenuDiscussButtonPrompt.style.display = 'none';

	var discussTextSpan = document.createElement('span');
	discussTextSpan.textContent = ' Forum';
	discussTextSpan.classList.add('main-menu__iconLabel');

	expandedMenuDiscussButtonLink.appendChild(discussSpan);
	//expandedMenuDiscussButtonLink.appendChild(discussTextSpan);
	expandedMenuDiscussButton.appendChild(expandedMenuDiscussButtonLink);
	expandedMenuDiscussButton.appendChild(expandedMenuDiscussButtonPrompt);
	collapsedMenu.appendChild(expandedMenuDiscussButton);

	//Content Morph button
	if (globalPebl.extension.config.contentMorphing && globalPebl.extension.config.contentMorphing.contentMorphingGroup.length > 0) {
		var currentContentMorphLevel = window.localStorage.getItem('globalContentMorph-' + globalPebl.extension.config.contentMorphing.contentMorphingGroup);
		if (currentContentMorphLevel)
			currentContentMorphLevel = parseInt(currentContentMorphLevel);
		else
			currentContentMorphLevel = 1;

		var expandedMenuContentMorphButton = document.createElement('li');
		expandedMenuContentMorphButton.title = 'Content Morphing';
		expandedMenuContentMorphButton.id = 'menuBarContentMorphButton';
		
		var expandedMenuContentMorphButtonLink = document.createElement('a');
		expandedMenuContentMorphButtonLink.addEventListener('click', function() {
			// TODO
		});

		var contentMorphSpan = document.createElement('span');
		contentMorphSpan.classList.add('fa-stack', 'fa-lg');
		
		var levelOptions = document.createElement('div');
		levelOptions.classList.add('level-options');

		var levelSelectList = document.createElement('ul');
		levelOptions.appendChild(levelSelectList);
		
		levelSelectList.style.display = 'none';

	    for (var i = 0; i < globalPebl.extension.config.contentMorphing.contentMorphingLevels.length; i++) {
	        var convertedValue = i + 1;
	        levelListElement = document.createElement('li');
	        (function(convertedValue, levelListElement) {
	        	levelListElement.addEventListener('click', function() {
		        	console.log(convertedValue);
		        	window.localStorage.setItem('globalContentMorph-' + globalPebl.extension.config.contentMorphing.contentMorphingGroup, convertedValue);
		        	globalPebl.extension.contentMorphing.setGroupLevel(convertedValue.toString(), globalPebl.extension.config.contentMorphing.contentMorphingGroup);
		        	jQuery(levelSelectList).find('li.selected').removeClass('selected');
		        	levelListElement.classList.add('selected');
		        });
	        })(convertedValue, levelListElement);
	    

	        levelListElement.classList.add('select-level' + convertedValue);

	        if (convertedValue === currentContentMorphLevel)
	        	levelListElement.classList.add('selected');

	        levelListElement.textContent = globalPebl.extension.config.contentMorphing.contentMorphingLevels[i];

	        levelSelectList.appendChild(levelListElement);
	    }

	    contentMorphSpan.addEventListener('click', function() {
			jQuery(levelSelectList).toggle();
		});


		var contentMorphCircleIcon = document.createElement('i');
		contentMorphCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

		var contentMorphButtonIcon = document.createElement('i');
		contentMorphButtonIcon.classList.add('fa', 'fa-sync-alt', 'fa-stack-1x', 'fa-inverse');
		contentMorphButtonIcon.setAttribute('aria-hidden', 'true');

		contentMorphSpan.appendChild(contentMorphCircleIcon);
		contentMorphSpan.appendChild(contentMorphButtonIcon);
		contentMorphSpan.appendChild(levelOptions);

		var contentMorphTextspan = document.createElement('span');
		contentMorphTextspan.textContent = ' Content Morphing';
		contentMorphTextspan.classList.add('main-menu__iconLabel');

		expandedMenuContentMorphButtonLink.appendChild(contentMorphSpan);
		//expandedMenuContentMorphButtonLink.appendChild(contentMorphTextspan);
		expandedMenuContentMorphButton.appendChild(expandedMenuContentMorphButtonLink);
		collapsedMenu.appendChild(expandedMenuContentMorphButton);
	}

	//Feedback button
	if (globalPebl.extension.config.feedbackEmail) {
		var expandedMenuFeedbackButton = document.createElement('li');
		expandedMenuFeedbackButton.title = 'Feedback';
		expandedMenuFeedbackButton.id = 'menuBarFeedbackButton';

		var expandedMenuFeedbackButtonLink = document.createElement('a');
		globalPebl.storage.getCurrentBook(function(book) {
	        var mailtoLink = 'mailto:';
	        mailtoLink += globalPebl.extension.config.feedbackEmail ? globalPebl.extension.config.feedbackEmail : '';
	        mailtoLink += '?subject=Feedback%20for%20' + encodeURI(book);
	        expandedMenuFeedbackButtonLink.setAttribute('href', mailtoLink);
	    });

		var feedbackSpan = document.createElement('span');
		feedbackSpan.classList.add('fa-stack', 'fa-lg');

		var feedbackCircleIcon = document.createElement('i');
		feedbackCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

		var expandedMenuFeedbackButtonIcon = document.createElement('i');
		expandedMenuFeedbackButtonIcon.classList.add('fa', 'fa-share-square', 'fa-stack-1x', 'fa-inverse');
		expandedMenuFeedbackButtonIcon.setAttribute('aria-hidden', 'true');

		feedbackSpan.appendChild(feedbackCircleIcon);
		feedbackSpan.appendChild(expandedMenuFeedbackButtonIcon);

		var feedbackTextSpan = document.createElement('span');
		feedbackTextSpan.textContent = ' Forum';
		feedbackTextSpan.classList.add('main-menu__iconLabel');

		expandedMenuFeedbackButtonLink.appendChild(feedbackSpan);
		//expandedMenuFeedbackButtonLink.appendChild(feedbackTextSpan);
		expandedMenuFeedbackButton.appendChild(expandedMenuFeedbackButtonLink);
		collapsedMenu.appendChild(expandedMenuFeedbackButton);
	}
	

	if (globalPebl.extension.config.helpUrl) {
		//Help button
		var expandedMenuHelpButton = document.createElement('li');
		expandedMenuHelpButton.title = 'Help';
		expandedMenuHelpButton.id = 'menuBarHelpButton';
		
		var expandedMenuHelpButtonLink = document.createElement('a');
		expandedMenuHelpButtonLink.addEventListener('click', function() {
			globalPebl.extension.externalResources.createDynamicPage(globalPebl.extension.config.helpUrl, 'Help', true);
		});

		var helpSpan = document.createElement('span');
		helpSpan.classList.add('fa-stack', 'fa-lg');

		var helpCircleIcon = document.createElement('i');
		helpCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

		var helpButtonIcon = document.createElement('i');
		helpButtonIcon.classList.add('fa', 'fa-question-circle', 'fa-stack-1x', 'fa-inverse');
		helpButtonIcon.setAttribute('aria-hidden', 'true');

		helpSpan.appendChild(helpCircleIcon);
		helpSpan.appendChild(helpButtonIcon);

		var helpTextSpan = document.createElement('span');
		helpTextSpan.textContent = ' Help';
		helpTextSpan.classList.add('main-menu__iconLabel');

		expandedMenuHelpButtonLink.appendChild(helpSpan);
		//expandedMenuHelpButtonLink.appendChild(helpTextSpan);
		expandedMenuHelpButton.appendChild(expandedMenuHelpButtonLink);
		collapsedMenu.appendChild(expandedMenuHelpButton);
	}
	

	//Notification button

	var expandedMenuNotificationButton = document.createElement('li');
	expandedMenuNotificationButton.title = 'Notifications';
	expandedMenuNotificationButton.id = 'menuBarNotificationButton';
	
	var expandedMenuNotificationButtonLink = document.createElement('a');
	expandedMenuNotificationButtonLink.addEventListener('click', function() {
		// TODO
	});

	var notificationSpan = document.createElement('span');
	notificationSpan.classList.add('fa-stack', 'fa-lg');
	notificationSpan.addEventListener('click', function() {
		globalPebl.extension.notifications.handleNotificationsButtonClick();
	});

	var notificationCircleIcon = document.createElement('i');
	notificationCircleIcon.classList.add('fa', 'fa-circle', 'fa-stack-2x');

	var notificationButtonIcon = document.createElement('i');
	notificationButtonIcon.classList.add('fa', 'fa-bell', 'fa-stack-1x', 'fa-inverse');
	notificationButtonIcon.setAttribute('aria-hidden', 'true');

	var notificationBadge = document.createElement('div');
    notificationBadge.id = 'notificationBadge';
    notificationBadge.classList.add('notificationBadge');

	notificationSpan.appendChild(notificationCircleIcon);
	notificationSpan.appendChild(notificationButtonIcon);
	notificationSpan.appendChild(notificationBadge);

	var notificationTextspan = document.createElement('span');
	notificationTextspan.textContent = ' Notifications';
	notificationTextspan.classList.add('main-menu__iconLabel');

	expandedMenuNotificationButtonLink.appendChild(notificationSpan);
	//expandedMenuNotificationButtonLink.appendChild(notificationTextspan);
	expandedMenuNotificationButton.appendChild(expandedMenuNotificationButtonLink);
	collapsedMenu.appendChild(expandedMenuNotificationButton);

	menu.appendChild(collapsedMenu);
	document.body.appendChild(menu);
}

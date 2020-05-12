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

var notifications = {};

globalPebl.extension.notifications = notifications;

$(document).ready(function() {
    notifications.updateNotificationsCount();
});

notifications.updateNotificationsCount = function() {
    notifications.getNotificationsCount();
    setTimeout(notifications.updateNotificationsCount, 2000);
}

notifications.clearNotifications = function() {
	$('.notificationsWrapper').remove();
}

notifications.setNotificationsBadgeCounter = function(n) {
	$('#notificationBadge').text(n);
    if (n === 0) {
        $('#notificationBadge').hide();
    } else {
        $('#notificationBadge').show();
    }
}

notifications.createNotifications = function(element) {
	var notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'notificationsContainer';
    notificationsContainer.classList.add('notificationsContainer');

    var notificationsWrapper = document.createElement('div');
    notificationsWrapper.classList.add('notificationsWrapper');

    var notificationsClearButton = document.createElement('button');
    notificationsClearButton.textContent = 'Clear Notifications'
    notificationsClearButton.classList.add('notificationsClearButton');
    notificationsClearButton.addEventListener('click', function() {
        $('#notificationsContainer').children('div').each(function() {
            globalPebl.utils.removeNotification($(this).attr('notification-id'));
        });
        notifications.clearNotifications();
    });
    
    globalPebl.user.getUser(function(userProfile) {
        globalPebl.utils.getNotifications(function(n) {
            if (n.length === 0)
                return;

            for (var notification of n) {
                var notificationElementWrapper = document.createElement('div');
                notificationElementWrapper.classList.add('notificationElementWrapper');
                notificationElementWrapper.setAttribute('notification-id', notification.id);

                var notificationElement = document.createElement('p');
                notificationElement.classList.add('notificationElement');

                var notificationElementSenderText = document.createElement('span');
                notificationElementSenderText.classList.add('notificationElementSenderText');

                var notificationElementContentText = document.createElement('span');
                notificationElementContentText.classList.add('notificationElementContentText');
                

                var toSpan = document.createElement('span');

                var notificationElementLocationText = document.createElement('a');
                notificationElementLocationText.classList.add('notificationElementLocationText');
                

                if (notification.verb.display['en-US'] === 'pulled' || notification.verb.display['en-US'] === 'pushed'){
                    var pulled;
                    if (notification.identity === userProfile.identity) {
                        pulled = true;
                    } else {
                        pulled = false;
                    }   

                    (function(notification) {
                        notificationElementWrapper.addEventListener('click', function() {
                            externalResources.createDynamicPage(notification.externalURL, notification.name);
                            globalPebl.utils.removeNotification(notification.id);
                            notifications.clearNotifications();
                        });
                    })(notification)

                    if (pulled)
                        notificationElementSenderText.textContent = 'You added ';
                    else
                        notificationElementSenderText.textContent = notification.actor.name + ' shared ';

                    notificationElementContentText.textContent = notification.name;

                    toSpan.textContent = ' to ';

                    notificationElementLocationText.textContent = notification.book.replace('.epub', '');
                } else if (notification.verb.display['en-US'] === 'shared') {
                    (function(notification) {
                        notificationElementWrapper.addEventListener('click', function() {
                            if (globalReadium) {
                                globaReadium.reader.openSpineItemElementCfi(notification.idRef, notification.cfi);
                            }
                            globalPebl.utils.removeNotification(notification.id);
                            notifications.clearNotifications();
                        });
                    })(notification)

                    notificationElementSenderText.textContent = notification.actor.name + " shared ";

                    notificationElementContentText.textContent = notification.title;

                    toSpan.textContent = ' in ';

                    notificationElementLocationText.textContent = notification.book.replace('.epub', '');
                } else if (notification.verb.display['en-US'] === 'responded') {
                    (function(notification) {
                        notificationElementWrapper.addEventListener('click', function() {
                            globalPebl.extension.discussion.scrollToMessage[notification.thread] = notification.id;
                            if (notification.peblAction && notification.peblAction === 'menuBarDiscussion') {
                                globalPebl.extension.menuBar.openMenuBarDiscussion();
                            } else if (notification.cfi && notification.idRef && globalReadium) {
                                globalReadium.reader.openSpineItemElementCfi(notification.idRef, notification.cfi);
                            }
                            globalPebl.utils.removeNotification(notification.id);
                            notifications.clearNotifications();
                        });
                    })(notification)

                    notificationElementSenderText.textContent = notification.actor.name + " responded to ";

                    if (notification.prompt === "DataEntry" || notification.prompt === "TeamDataEntry" || notification.prompt === "ClassDataEntry") {
                        var msg = JSON.parse(notification.text);
                        if (msg.length > 1 && msg[0].mainPrompt)
                            notificationElementContentText.textContent = msg[0].mainPrompt
                        else
                            notificationElementContentText.textContent = msg[0].prompt;

                        toSpan.textContent = ' in ';

                        notificationElementLocationText.textContent = notification.book ? notification.book.replace('.epub', '') : '';
                    } else {
                        notificationElementContentText.textContent = notification.prompt;

                        toSpan.textContent = ' in ';

                        notificationElementLocationText.textContent = notification.book ? notification.book.replace('.epub', '') : '';
                    }
                }
                

                notificationElement.appendChild(notificationElementSenderText);
                notificationElement.appendChild(notificationElementContentText);
                notificationElement.appendChild(toSpan);
                notificationElement.appendChild(notificationElementLocationText);

                notificationElementWrapper.appendChild(notificationElement);
                notificationsContainer.appendChild(notificationElementWrapper);
            }

            notificationsWrapper.appendChild(notificationsContainer);
            notificationsWrapper.appendChild(notificationsClearButton);

            element.appendChild(notificationsWrapper);
        });
    });
}

notifications.handleNotificationsButtonClick = function() {
	if ($('.notificationsWrapper').length) {
        notifications.clearNotifications();
    } else {
        notifications.createNotifications(document.body);
    }
}

notifications.getNotificationsCount = function() {
    globalPebl.utils.getNotifications(function(n) {
        var notificationsCount = n.length;
        notifications.setNotificationsBadgeCounter(notificationsCount);
    });
}
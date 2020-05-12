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

var globalPebl = (window.parent && window.parent.PeBL) ? window.parent.PeBL : (window.PeBL ? window.PeBL : null);
var globalConfiguration = window.parent.Configuration;
var globalLightbox = window.parent.Lightbox;
var globalReadium = window.parent.READIUM;

var discussion = {};
if (globalPebl)
    globalPebl.extension.discussion = discussion;

jQuery(document).ready(function () {

    jQuery('.discussion_discussionExtension, .peblExtension[data-peblextension="discussion"], .peblExtension[data-peblExtension="discussion"]').each(function() {    
        var buttonText = jQuery(this)[0].getAttribute('data-buttonText') || jQuery(this)[0].getAttribute('data-buttontext');
        var prompt = jQuery(this)[0].getAttribute('data-prompt');
        var id = jQuery(this)[0].getAttribute('data-id');
        if (!id) {
            id = this.getAttribute('id');
        }
        var detailText = jQuery(this)[0].hasAttribute('data-detailText') ? jQuery(this)[0].getAttribute('data-detailText') : null;
        var insertID = jQuery(this)[0].getAttribute('id');
        var sharing = jQuery(this)[0].getAttribute('data-sharing') ? jQuery(this)[0].getAttribute('data-sharing') : null;
        var customPeblAction = this.getAttribute('data-peblAction') ? this.getAttribute('data-peblAction') : null;
        discussion.createDiscussion(insertID, buttonText, prompt, id, detailText, sharing, customPeblAction);
    });

    jQuery(document.body).on('click', '.chat', function (evt) {
        discussion.handleChatButtonClick(evt.currentTarget);
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

discussion.scrollToMessage = {};

discussion.createDiscussion = function (insertID, buttonText, question, id, detailText, sharing, peblAction) {
    var calloutDiv,
        chatButton,
        chatIcon,
        questionParagraph,
        insertLocation;

    var calloutWrapper = document.createElement('div');
    calloutWrapper.setAttribute('data-theme-target', insertID);

    calloutDiv = document.createElement('div');
    calloutDiv.classList.add('callout');

    calloutWrapper.appendChild(calloutDiv);
    

    chatButton = document.createElement('button');
    chatButton.classList.add('chat');
    chatButton.id = id;
    chatButton.setAttribute('data-theme-target', insertID);
    if (peblAction)
        chatButton.setAttribute('data-peblAction', peblAction);
    chatButton.innerHTML = buttonText.replace('&',' and ');
    chatIcon = document.createElement('i');
    chatIcon.classList.add('fa', 'fa-comments');
    chatButton.appendChild(chatIcon);
    if (detailText)
        chatButton.setAttribute('detailText', detailText);
    if (sharing)
        chatButton.setAttribute('data-sharing', sharing);

    questionParagraph = document.createElement('p');
    questionParagraph.innerHTML = question.replace(/&lt;br\/>/g, '<br/>').replace('&',' and ');

    calloutDiv.appendChild(chatButton);
    calloutDiv.appendChild(questionParagraph);

    insertLocation = document.getElementById(insertID);

    insertLocation.parentNode.insertBefore(calloutWrapper, insertLocation);
    insertLocation.remove();
}

discussion.createDiscussionLightBox = function (question, chatButton) {
    globalPebl.user.getUser(function (userProfile) {
        var private = false;
        var thread = chatButton.id;
        var sharing = 'all';
        if (chatButton.hasAttribute('data-sharing')) {
            sharing = chatButton.getAttribute('data-sharing');
        }

        var messageOptions = {};
        if (sharing === 'private')
            messageOptions.isPrivate = true;
        else if (sharing === 'group')
            messageOptions.groupId = userProfile.currentTeam;

        if (chatButton.hasAttribute('data-peblAction')) {
            messageOptions.peblAction = chatButton.getAttribute('data-peblAction');
        }

        var lightBox = document.createElement('div');
        lightBox.id = 'pebl__discussion--lightbox';
        lightBox.classList.add('pebl__discussion--lightbox', 'peblModal');
        lightBox.setAttribute('data-theme-target', chatButton.getAttribute('data-theme-target'));

        var lightBoxContent = document.createElement('div');
        lightBoxContent.classList.add('pebl__discussion--lightbox__content');

        var discussionHeader = document.createElement('div');
        discussionHeader.classList.add('pebl__discussion--lightbox__header');

        var promptContainer = document.createElement('div');
        promptContainer.classList.add('discussionPromptContainer');

        var prompt = document.createElement('span');
        prompt.classList.add('discussionPrompt');
        prompt.innerHTML = question.replace('&',' and ');

        promptContainer.appendChild(prompt);

        var lightBoxCloseButtonContainer = document.createElement('div');
        lightBoxCloseButtonContainer.classList.add('discussionLightboxCloseButtonContainer');

        var lightBoxCloseButton = document.createElement('i');
        lightBoxCloseButton.classList.add('fa', 'fa-times');
        lightBoxCloseButton.addEventListener('click', function () {
            jQuery(lightBox).remove();
        });

        lightBoxCloseButtonContainer.appendChild(lightBoxCloseButton);

        discussionHeader.appendChild(promptContainer);
        discussionHeader.appendChild(lightBoxCloseButtonContainer);


        var discussionInputBody = document.createElement('div');
        discussionInputBody.classList.add('discussionInputBody');

        var discussionDetailTextContainer = document.createElement('div');
        discussionDetailTextContainer.classList.add('discussionDetailTextContainer');

        var discussionDetailText = document.createElement('span');
        discussionDetailText.classList.add('discussionDetailText');
        if (chatButton.hasAttribute('detailText'))
            discussionDetailText.textContent = chatButton.getAttribute('detailText');

        discussionDetailTextContainer.appendChild(discussionDetailText);

        var discussionTextAreaContainer = document.createElement('div');
        discussionTextAreaContainer.classList.add('discussionTextAreaContainer');

        var discussionTextArea = document.createElement('textarea');
        discussionTextArea.classList.add('pebl__discussion--lightbox__textarea');

        discussionTextAreaContainer.appendChild(discussionTextArea);

        var discussionButtonContainer = document.createElement('div');
        discussionButtonContainer.classList.add('discussionButtonContainer');

        var discussionSubmitButton = document.createElement('button');
        discussionSubmitButton.classList.add('discussionSubmitButton');
        discussionSubmitButton.textContent = 'Submit';


        discussionButtonContainer.appendChild(discussionSubmitButton);

        discussionInputBody.appendChild(discussionDetailTextContainer);
        discussionInputBody.appendChild(discussionTextAreaContainer);
        discussionInputBody.appendChild(discussionButtonContainer);


        var discussionResponseBody = document.createElement('div');
        discussionResponseBody.classList.add('discussionResponseBody');

        discussionSubmitButton.addEventListener('click', function () {
            discussion.createThread(thread, jQuery(discussionTextArea).val(), question, discussionTextArea, discussionResponseBody, messageOptions);
        });

        

        var messageHandle = discussion.messageHandler(discussionResponseBody, thread, messageOptions);

        
        globalPebl.subscribeThread(thread, false, messageHandle, messageOptions);

        lightBoxContent.appendChild(discussionHeader);
        lightBoxContent.appendChild(discussionInputBody);
        lightBoxContent.appendChild(discussionResponseBody);

        lightBox.appendChild(lightBoxContent);
        document.body.appendChild(lightBox);
        discussionTextArea.focus();
    });
}

function isReplyContainer(message, responseBox) {
    if (!message.replyThread)
        return true;
    if (message.replyThread && message.replyThread === $(responseBox).attr('data-replyId'))
        return true;
    return false;
}

discussion.messageHandler = function (responseBox, thread, options) {
    return function (newMessages) {
        newMessages.sort(discussion.sortMessages);
        globalPebl.user.getUser(function (userProfile) {
            if (userProfile) {
                for (var i = 0; i < newMessages.length; i++) {
                    var message = newMessages[i];
                    if (jQuery("#" + message.id).length == 0) {
                        var mine = userProfile.identity == message.actor.account.name;
                        var userIdBox = jQuery('<span class="userId"></span>');
                        userIdBox.text(message.name);
                        var timestampBox = jQuery('<span class="timestamp"></span>');
                        timestampBox.text(new Date(message.timestamp).toLocaleString());
                        var textBox = jQuery('<p class="message"></p>');
                        textBox.text(message.text);
                        var messageContainer = jQuery('<div id="' + message.id + '" class="' + (mine ? "your " : "") + 'response"></div>');
                        messageContainer.append(userIdBox);
                        messageContainer.append(timestampBox);
                        messageContainer.append(textBox);
                        if (!options.isPrivate) {
                            var messageReplyButton = document.createElement('a');
                            messageReplyButton.classList.add('messageReplyButton');
                            messageReplyButton.textContent = 'Reply';
                            messageReplyButton.addEventListener('click', function (event) {
                                event.preventDefault();
                                discussion.replyDiscussion(thread, event, options);
                            });
                            messageContainer.append(jQuery(messageReplyButton));
                        }
                        var chatReplies = document.createElement('div');
                        chatReplies.classList.add('chatReplies');
                        chatReplies.setAttribute('data-replyId', message.id);
                        messageContainer.append(jQuery(chatReplies));
                        // if (mine) {
                        //     var messageDeleteButtonWrapper = document.createElement('div');
                        //     messageDeleteButtonWrapper.classList.add('messageDeleteButtonWrapper');

                        //     var messageDeleteButton = document.createElement('span');
                        //     messageDeleteButton.classList.add('messageDeleteButton');
                        //     messageDeleteButton.innerHTML = '&#215;';
                        //     messageDeleteButton.setAttribute('messageID', message.id);
                        //     messageDeleteButton.setAttribute('thread', thread);
                        //     messageDeleteButton.addEventListener('click', function() {
                        //         window.pebl.removeMessage(this.getAttribute('messageID'), this.getAttribute('thread'));
                        //         jQuery('#' + this.getAttribute('messageID')).remove();
                        //     });

                        //     messageDeleteButtonWrapper.appendChild(messageDeleteButton);
                        //     messageContainer.append(jQuery(messageDeleteButtonWrapper));
                        // }
                        if (message.replyThread) {
                            jQuery('[data-replyId="' + message.replyThread + '"]').prepend(messageContainer);
                            if (discussion.scrollToMessage[message.thread]) {
                                // jQuery(responseBox).scrollTo('#' + discussion.scrollToMessage[message.thread]);
                                // console.log('scrollToReply');
                                //TODO
                            }
                        } else {
                            jQuery(responseBox).prepend(messageContainer);
                            if (discussion.scrollToMessage[message.thread]) {
                                // jQuery(responseBox).scrollTo('#' + discussion.scrollToMessage[message.thread]);
                                // console.log('scrollToMessage');
                                //TODO
                            }
                        }
                    }
                }
            }
        });
    };
}

discussion.createThread = function (thread, input, prompt, textarea, responseBox, options) {
    if (input.trim() != "") {
        globalPebl.storage.getCurrentBook(function(book) {
            var message = {
                "prompt": prompt,
                "thread": thread,
                "text": input,
                "isPrivate": options.isPrivate,
                "groupId": options.groupId,
                "book": book,
                "peblAction": options.peblAction
            };
            if (globalReadium) {
                let bookmark = globalReadium.reader.bookmarkCurrentPage();
                if (bookmark)
                    bookmark = JSON.parse(bookmark);

                message.cfi = bookmark.contentCFI;
                message.idRef = bookmark.idref;
            }

            if (options.isPrivate) {
                globalPebl.emitEvent(globalPebl.events.eventNoted, message);
            } else {
                globalPebl.emitEvent(globalPebl.events.newMessage, message);
            }
            
            jQuery(textarea).val("");
            
            
        });
    }
}

discussion.createSubThread = function (thread, replyThread, input, prompt, textarea, responseBox, options) {
    if (input.trim() != "") {
        globalPebl.storage.getCurrentBook(function(book) {
            var message = {
                "prompt": prompt,
                "thread": thread,
                "text": input,
                "replyThread": replyThread,
                "isPrivate": options.isPrivate,
                "groupId": options.groupId,
                "book": book,
                "peblAction": options.peblAction
            };

            if (globalReadium) {
                let bookmark = globalReadium.reader.bookmarkCurrentPage();
                if (bookmark)
                    bookmark = JSON.parse(bookmark);

                message.cfi = bookmark.contentCFI;
                message.idRef = bookmark.idref;
            }

            globalPebl.emitEvent(globalPebl.events.newMessage,
                message);
            textarea.val("");
        });
    }
}



discussion.handleChatButtonClick = function (elem, options) {
    var self = this;
    globalPebl.user.isLoggedIn(function(isLoggedIn) {
        if (!isLoggedIn) {
            if (globalConfiguration && globalConfiguration.useLinkedIn && globalLightbox && globalLightbox.linkedInSignIn) {
                globalLightbox.linkedInSignIn();
            }
        } else {
            jQuery('.lightBox').remove();
            var element,
                question;
            if (elem)
                element = jQuery(elem);
            else
                element = jQuery(self);
            question = (options && options.prompt) ? options.prompt : element.parent().children('p:first').html();
            if (globalPebl) {
                if ((element[0].id != null) && (element[0].id != "")) {
                    if (element.parent().children(".chatBox").length == 0) {
                        discussion.createDiscussionLightBox(question, element[0], options);
                    }
                }
            }
        }
    });
}

discussion.replyDiscussion = function (thread, event, options) {
    discussion.replyClose();
    var parentPost = jQuery(event.currentTarget).parent();
    var parentAuthor = parentPost.children('.userId');
    var parentMessage = parentPost.children('.message').text();
    var parentId = parentPost.attr('id');
    var parentChatReplies = parentPost.children('.chatReplies');

    var replyContainer = document.createElement('div');
    replyContainer.classList.add('replyContainer');

    var replyTextArea = document.createElement('textarea');
    replyTextArea.classList.add('replyTextArea');
    replyTextArea.placeholder = 'Reply to ' + parentAuthor.text();

    var replyCloseButton = document.createElement('button');
    replyCloseButton.classList.add('replyCloseButton');
    replyCloseButton.textContent = 'Cancel';
    replyCloseButton.addEventListener('click', discussion.replyClose);

    var replySubmitButton = document.createElement('button');
    replySubmitButton.classList.add('replySubmitButton');
    replySubmitButton.textContent = 'Submit';
    replySubmitButton.addEventListener('click', function (event) {
        discussion.replySubmit(thread, parentId, jQuery(replyTextArea).val(), parentMessage, jQuery(replyTextArea), parentChatReplies, options);
    });

    replyContainer.appendChild(replyTextArea);
    replyContainer.appendChild(replySubmitButton);
    replyContainer.appendChild(replyCloseButton);

    jQuery(event.currentTarget).hide();
    jQuery(event.currentTarget).after(replyContainer);

}

discussion.replyClose = function () {
    jQuery('.replyContainer').remove();
    jQuery('.messageReplyButton').show();
}

discussion.replySubmit = function (thread, replyThread, input, prompt, textarea, responseBox, options) {
    discussion.createSubThread(thread, replyThread, input, prompt, textarea, responseBox, options);
    discussion.replyClose();
}

discussion.sortMessages = function (a, b) {
    var aDate = new Date(a.timestamp);
    var bDate = new Date(b.timestamp);
    var aTimestamp = aDate.getTime();
    var bTimestamp = bDate.getTime();

    return aTimestamp - bTimestamp;
}

//Combines any number of strings with _ between them
discussion.comboID = function () {
    var newID = null;
    for (var i = 0; i < arguments.length; i++) {
        var string = arguments[i];
        if (newID === null)
            newID = string;
        else
            newID = newID + '_' + string;
    }

    return newID;
}
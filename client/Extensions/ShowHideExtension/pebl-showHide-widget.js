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
var globalReadium = window.parent.READIUM;

var showHide = {};

globalPebl.extension.showHide = showHide;

showHide.toggleVisibility = function (event, programInvoked) {
    console.log(event);
    var id = event.currentTarget.getAttribute('otherId'),
        buttonText1 = event.currentTarget.getAttribute('buttonText1'),
        buttonText2 = event.currentTarget.getAttribute('buttonText2'),
        state;

    var trackingId = event.currentTarget.getAttribute('data-trackingId');

    console.log(event.currentTarget);


    if ($('.' + id + 'Btn').hasClass('hiding')) {
        // var res = str.replace(buttonText1, buttonText2);
        // $('#' + id + 'Btn').html(res);
        $('.' + id + 'Btn').removeClass('hiding');
        if (buttonText2 != null) {
            $('.' + id + 'Btn').children('span').first().text(buttonText2);
        }
        $('.' + id + 'Btn').children('i').first()[0].classList.remove('fa-plus-circle');
        $('.' + id + 'Btn').children('i').first()[0].classList.add('fa-minus-circle');
        state = "showing";
        $('.' + id).slideDown(400, function() {
            $(this).css('display', 'block');
            if (globalReadium && globalReadium.reader.plugins.highlights != null)
                globalReadium.reader.plugins.highlights.redrawAnnotations();
        });
    } else {
        // var res = str.replace(buttonText2, buttonText1);
        // $('#' + id + 'Btn').html(res);
        $('.' + id + 'Btn').addClass('hiding');
        if (buttonText1 != null) {
            $('.' + id + 'Btn').children('span').first().text(buttonText1);
        }
        $('.' + id + 'Btn').children('i').first()[0].classList.add('fa-plus-circle');
        $('.' + id + 'Btn').children('i').first()[0].classList.remove('fa-minus-circle');
        state = "hiding";
        $('.' + id).slideUp(400, function() {
            $(this).css('display', 'none');
            if (globalReadium && globalReadium.reader.plugins.highlights != null)
                globalReadium.reader.plugins.highlights.redrawAnnotations();
        });
    }


    if (globalPebl != null) {
        if (!programInvoked) {
            var target = $('.' + id + 'Btn')[0].dataset.cassTarget;
            var cfi = "";
            $('.' + id).addClass("userToggled");
            // if (window.top.ReadiumSDK != null)
            //  cfi = window.top.ReadiumSDK.reader.getCfiForElement($("#" + target));
            if (state === "showing") {
                globalPebl.emitEvent(globalPebl.events.eventShowed, {
                    target: trackingId,
                    type: 'showHide'
                });
            } else if (state === "hiding") {
                globalPebl.emitEvent(globalPebl.events.eventHid, {
                    target: trackingId,
                    type: 'showHide'
                });
            }
        }
    }
}

$(document).ready(function () {
    $('.showHide_showHideExtension, .peblExtension[data-peblExtension="showHide"], .peblExtension[data-peblextension="showHide"]').each(function () {
        var insertID = $(this)[0].getAttribute('id');
        var buttonText1 = $(this)[0].getAttribute('data-buttonText1');
        var buttonText2 = $(this)[0].getAttribute('data-buttonText2');
        var id = $(this)[0].getAttribute('data-id');
        var cassMapping = $(this)[0].hasAttribute('data-cassMapping') ? $(this)[0].getAttribute('data-cassMapping') : null;
        var cassTarget = $(this)[0].hasAttribute('data-cassTarget') ? $(this)[0].getAttribute('data-cassTarget') : null;
        var cassLevel = $(this)[0].hasAttribute('data-cassLevel') ? $(this)[0].getAttribute('data-cassLevel') : null;
        var isInline = false;
        if ($(this)[0].hasAttribute('data-displayBtnInline') && $(this)[0].getAttribute('data-displayBtnInline') == 'true') {
            isInline = true;
        }

        var defaultState = this.hasAttribute('data-defaultState') ? this.getAttribute('data-defaultState') : 'hidden'
        showHide.createShowHide(insertID, buttonText1, buttonText2, id, isInline, cassMapping, cassTarget, cassLevel, defaultState);
    });
});

showHide.createShowHide = function (insertID, buttonText1, buttonText2, id, isInline, cassMapping, cassTarget, cassLevel, defaultState) {
    var button,
        buttonIcon,
        insertLocation,
        handleButtonClick;
    var buttonWrapper = document.createElement('div');
    buttonWrapper.setAttribute('data-theme-target', insertID);

    button = document.createElement('button');
    button.classList.add(id + 'Btn');
    button.setAttribute('otherId', id);
    button.setAttribute('data-trackingId', insertID);
    button.classList.add('showHideButton');
    if (defaultState === 'hidden')
        button.classList.add('hiding');
    if (isInline == true) {
        button.classList.add('inline');
    }
    button.setAttribute('buttonText1', buttonText1);
    button.setAttribute('buttonText2', buttonText2);
    button.addEventListener('click', showHide.toggleVisibility);
    buttonIcon = document.createElement('i');
    buttonIcon.classList.add('fa');
    if (defaultState === 'hidden') {
        buttonIcon.classList.add('fa-plus-circle');
    } else {
        buttonIcon.classList.add('fa-minus-circle');
    }
    button.appendChild(buttonIcon);

    if (buttonText1 != null && buttonText2 != null) {
        var buttonText = document.createElement('span');
        if (defaultState === 'hidden') {
            buttonText.textContent = buttonText1;
        } else {
            buttonText.textContent = buttonText2;
        }
        button.classList.add('text');
        button.appendChild(buttonText);
    }

    if (cassMapping) {
        button.setAttribute('data-cassMapping', cassMapping);
    }
    if (cassTarget) {
        button.setAttribute('data-cassTarget', cassTarget);
    }
    if (cassLevel) {
        button.setAttribute('data-cassLevel', cassLevel);
    }

    if (defaultState === 'hidden') {
        $('.' + id).hide();
    }

    buttonWrapper.appendChild(button);

    insertLocation = document.getElementById(insertID);

    insertLocation.parentNode.insertBefore(buttonWrapper, insertLocation);
    insertLocation.remove();

}
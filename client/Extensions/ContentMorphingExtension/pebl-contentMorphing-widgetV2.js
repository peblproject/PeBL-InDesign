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

var contentMorphing = {};
if (globalPebl)
    globalPebl.extension.contentMorphing = contentMorphing;

$(document).ready(function () {
    $('.peblExtension[data-peblextension="contentMorphingControlPanel"]').each(function () {
        var insertID = this.getAttribute('id');
        var levels = JSON.parse(this.getAttribute('data-levels'));
        var id = this.getAttribute('data-id');
        contentMorphing.createMorphingControlPanel(insertID, levels, id);
    });

    $('.peblExtension[data-peblextension="contentmorphing"], .peblExtension[data-peblExtension="contentmorphing"], .contentMorphing_contentMorphingExtension').each(function () {
        var insertID = $(this)[0].getAttribute('id');
        var levels = JSON.parse($(this)[0].getAttribute('data-levels'));
        var levelContent = JSON.parse($(this)[0].getAttribute('data-levelContent'));
        var id = $(this)[0].getAttribute('id');
        var contentMorphingGroup = this.hasAttribute('data-contentMorphingGroup') ? this.getAttribute('data-contentMorphingGroup') : null;
        var cassMapping = $(this)[0].hasAttribute('data-cassMapping') ? $(this)[0].getAttribute('data-cassMapping') : null;
        var cassTarget = $(this)[0].hasAttribute('data-cassTarget') ? $(this)[0].getAttribute('data-cassTarget') : null;
        var cassLevels = $(this)[0].hasAttribute('data-cassLevels') ? JSON.parse($(this)[0].getAttribute('data-cassLevels')) : null;
        var controls = this.hasAttribute('data-controls') ? this.getAttribute('data-controls') : 'true';
        var controller = this.hasAttribute('data-controller') ? this.getAttribute('data-controller') : 'user';
        contentMorphing.createMorphing(insertID, levels, levelContent, id, cassMapping, cassTarget, cassLevels, controls, controller, contentMorphingGroup);
    });
});

contentMorphing.createMorphingControlPanel = function (insertID, levels, id) {
    var controlPanelContainer = document.createElement('label');
    controlPanelContainer.classList.add('contentMorphingControlPanelContainer');

    var whichLevels = localStorage.getItem('contentMorphingControlPanel-' + id);
    if (whichLevels)
        whichLevels = JSON.parse(whichLevels);

    for (var i = 0; i < levels.length; i++) {
        var levelCheckboxContainer = document.createElement('div');
        levelCheckboxContainer.classList.add('contentMorphingControlPanelLevelCheckboxContainer');

        var levelCheckbox = document.createElement('input');
        var levelCheckboxSpan = document.createElement('span');
        levelCheckboxSpan.classList.add('levelCheckboxSpan');
        levelCheckbox.type = 'checkbox';
        levelCheckbox.value = 'level' + (i + 1) + '-' + levels[i];
        levelCheckbox.addEventListener('click', function (evt) {
            var checkboxes = $(controlPanelContainer).find('input[type="checkbox"]');
            var activeLevels = [];
            if (evt.currentTarget.checked) {
            	globalPebl.emitEvent(globalPebl.events.eventSelected, {
	            	name: evt.currentTarget.value,
	            	type: 'checkbox',
	            	target: id
	            });
            }

            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    if (evt.currentTarget.checked && evt.currentTarget.value === 'level1-Select-All') {
                        if (checkboxes[i].value === 'level1-Select-All') {
                            activeLevels.push(checkboxes[i].value);
                        } else {
                            checkboxes[i].checked = false;
                        }
                    } else {
                        if (checkboxes[i].value === 'level1-Select-All') {
                            checkboxes[i].checked = false;
                        } else {
                            activeLevels.push(checkboxes[i].value);
                        }
                    }
                }
            }


            if (activeLevels.length > 0) {
                localStorage.setItem('contentMorphingControlPanel-' + id, JSON.stringify(activeLevels));
            } else {
                localStorage.removeItem('contentMorphingControlPanel-' + id);
            }

            contentMorphing.applyMorphingControlPanel(id);
        });
        if (whichLevels) {
            for (var level of whichLevels) {
                if (level === levelCheckbox.value)
                    levelCheckbox.checked = true;
            }
        }

        var levelLabel = document.createElement('span');
        levelLabel.classList.add('levelCheckboxLabel');
        if (i === 0) {
            levelLabel.textContent = 'See All Scenario Types';
        } else {
            levelLabel.textContent = levels[i];
        }

        levelCheckboxContainer.appendChild(levelCheckbox);
        levelCheckboxContainer.appendChild(levelCheckboxSpan);
        levelCheckboxContainer.appendChild(levelLabel);

        controlPanelContainer.appendChild(levelCheckboxContainer);
    }

    insertLocation = document.getElementById(insertID);

    insertLocation.parentNode.insertBefore(controlPanelContainer, insertLocation);
    insertLocation.remove();
}

contentMorphing.applyMorphingControlPanel = function (id) {
    var whichLevels = localStorage.getItem('contentMorphingControlPanel-' + id);
    var elems = $('#' + id + '.adjustable-content').children();

    for (var elem of elems) {
        $(elem).hide();
    }

    if (whichLevels) {
        whichLevels = JSON.parse(whichLevels);
        var levelToDisplay = '';

        for (var level of whichLevels) {
            levelToDisplay += level;
        }

        var elem = $('#' + id + '.adjustable-content #' + levelToDisplay).parent();
        elem.show();

        $('#' + id + '.adjustable-content').addClass('active');
    } else {
        $('#' + id + '.adjustable-content').removeClass('active');
    }
}

//Takes an array with names of desired levels, and array with the content to be contained within those levels, optional parameters cassMapping, cassTarget, cassLevels[]
contentMorphing.createMorphing = function (insertID, levels, levelContent, id, cassMapping, cassTarget, cassLevels, controls, controller, contentMorphingGroup) {
    var adjustableContentDiv,
        levelOptionsDiv,
        currentLevelDiv,
        levelSelectList,
        levelListElement,
        level,
        content,
        clickEvent,
        levelContentDiv,
        insertLocation;

    var wrapper = document.createElement('div');
    wrapper.classList.add('contentMorphingWrapper');
    wrapper.setAttribute('data-theme-target', insertID);

    adjustableContentDiv = document.createElement('div');
    adjustableContentDiv.classList.add('adjustable-content', 'ignore-cfi');
    adjustableContentDiv.id = id;

    var globalContentMorph;
    if (contentMorphingGroup) {
        globalContentMorph = window.localStorage.getItem('globalContentMorph-' + contentMorphingGroup);
        if (globalContentMorph)
            globalContentMorph = parseInt(globalContentMorph);
        adjustableContentDiv.setAttribute('data-contentMorphingGroup', contentMorphingGroup);
    }

    wrapper.appendChild(adjustableContentDiv);

    levelOptionsDiv = document.createElement('div');
    levelOptionsDiv.classList.add('level-options');

    currentLevelDiv = document.createElement('div');
    currentLevelDiv.classList.add('current-level', 'set-level1');
    currentLevelDiv.addEventListener('click', contentMorphing.handleCurrentLevelClick);

    levelSelectList = document.createElement('ul');

    for (level in levels) {
        var convertedValue = parseInt(level) + 1;
        levelListElement = document.createElement('li');

        if (cassMapping !== null) {
            levelListElement.setAttribute('data-cassMapping', cassMapping);
        }
        if (cassTarget !== null) {
            levelListElement.setAttribute('data-cassTarget', cassTarget);
        }
        if (cassLevels !== null && cassLevels.constructor === Array) {
            levelListElement.setAttribute('data-cassLevel', cassLevels[level]);
        }


        clickEvent = document.createAttribute('onclick');
        clickEvent.value = "globalPebl.extension.contentMorphing.setLevel('" + convertedValue + "', '" + id + "');";

        levelListElement.classList.add('select-level' + convertedValue);

        if (globalContentMorph) {
            if (globalContentMorph === convertedValue) {
                levelListElement.classList.add('selected');
                currentLevelDiv.classList.remove('set-level1');
                currentLevelDiv.classList.add('set-level' + convertedValue);
            }
        } else if (level == 0) {
            levelListElement.classList.add('selected');
        }

        levelListElement.innerHTML = levels[level];

        levelListElement.setAttributeNode(clickEvent);

        levelSelectList.appendChild(levelListElement);
    }

    levelOptionsDiv.appendChild(currentLevelDiv);
    levelOptionsDiv.appendChild(levelSelectList);



    if (controls === 'true')
        adjustableContentDiv.appendChild(levelOptionsDiv);

    for (var i = 0; i < levelContent.length; i++) {
        var convertedValue = i + 1;
        var targets = document.querySelectorAll('.' + levelContent[i]);
        
        levelContentDiv = document.createElement('div');
        levelContentDiv.classList.add('level' + convertedValue);

        for (var target of targets) {
            var clone = target.cloneNode(true);
            levelContentDiv.appendChild(clone);
            target.outerHTML = "";
            delete outerHTML;
        }

        if (globalContentMorph) {
            if (globalContentMorph === convertedValue) {
                levelContentDiv.style.display = 'block';
            } else {
                jQuery(levelContentDiv).hide();
            }
        }

        adjustableContentDiv.appendChild(levelContentDiv);

        var morphingExperienced = function(elem, n) {
        	if (contentMorphing.isElementXPercentInViewport(elem, 1) && jQuery(elem).is(':visible')) {
        		globalPebl.emitEvent(globalPebl.events.eventExperienced, {
		        	target: id,
		        	type: "morphing",
		        	description: 'Level - ' + n,
		        	name: "Level - " + n
		        });
        	} else {
        		setTimeout(function() {
        			morphingExperienced(elem, n)
        		}, 1000);
        	}
        }

        setTimeout(function(levelContentDiv, n) {
        	return(function() {
        		morphingExperienced(levelContentDiv, n)
        	});
        }(levelContentDiv, convertedValue), 2000);
    }



    insertLocation = document.getElementById(insertID);

    insertLocation.parentNode.insertBefore(wrapper, insertLocation);

    if (controller === 'user') {
        adjustableContentDiv.classList.add('active');
        if (!globalContentMorph) {
            var elem = $('#' + id + '.adjustable-content .level1');
            setTimeout(function () {
                elem.show();
            }, 500);
        }
    } else if (controller === 'controlPanel') {
        setTimeout(function () {
            contentMorphing.applyMorphingControlPanel(id);
        }, 500);
    }


    insertLocation.remove();
}

contentMorphing.handleCurrentLevelClick = function () {
    //console.log('Toggle level');
    $(this).next('ul').toggleClass('active');
}

contentMorphing.isLevelSet = function (n, sectionID) {
    return $("#" + sectionID + ".adjustable-content .level-options .current-level").hasClass('set-level' + n);
}

contentMorphing.setLevel = function (n, sectionID, programInvoked) {
    //    $("#"+sectionID+".adjustable-content .level-options .current-level").removeClass('set-level' + contentLevel);

    // if (contentMorphing.isLevelSet(n, sectionID))
    //  return;

    $("#" + sectionID + ".adjustable-content .level-options .current-level").removeClass('set-level1 set-level2 set-level3');

    $("#" + sectionID + ".adjustable-content .level-options .current-level").addClass('set-level' + n);
    $("#" + sectionID + ".adjustable-content .level-options ul").removeClass('active');
    $("#" + sectionID + ".adjustable-content .level-options li").removeClass('selected');
    $("#" + sectionID + ".adjustable-content .level-options li.select-level" + n).addClass('selected');

    if (n != '1') $('#' + sectionID + '.adjustable-content .level1').slideUp();
    if (n != '2') $('#' + sectionID + '.adjustable-content .level2').slideUp();
    if (n != '3') $('#' + sectionID + '.adjustable-content .level3').slideUp();

    $('#' + sectionID + '.adjustable-content .level' + n).slideDown(400, function () {
        if (window.top.ReadiumSDK != null && window.top.ReadiumSDK.reader.plugins.highlights != null)
            window.top.ReadiumSDK.reader.plugins.highlights.redrawAnnotations();
    });
    //contentLevel = n;

    if (globalPebl != null) {
        if (!programInvoked) {
            $('#' + sectionID).addClass("userToggled");
            var cfi = "";
            // if (window.top.ReadiumSDK != null)
            //  cfi = window.top.ReadiumSDK.reader.getCfiForElement($("#" + sectionID));
            globalPebl.emitEvent(globalPebl.events.eventContentMorphed,
                {
                    target: sectionID,
                    type: "morphing",
                    description: "Level - " + n,
                    name: "Level - " + n
                });
        }
    }
    //    console.log("#" + sectionID + ", Content Level: " + n);
}

contentMorphing.setGroupLevel = function(n, groupId) {
    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level-options .current-level').removeClass('set-level1 set-level2 set-level3');
    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level-options .current-level').addClass('set-level' + n);
    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level-options ul').removeClass('active');
    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level-options li').removeClass('selected');
    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level-options li.select-level' + n).addClass('selected');

    if (n != '1') $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level1').hide();
    if (n != '2') $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level2').hide();
    if (n != '3') $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level3').hide();

    $('[data-contentMorphingGroup="' + groupId + '"].adjustable-content .level' + n).show();

    globalPebl.emitEvent(globalPebl.events.eventContentMorphed,
                {
                    target: groupId,
                    type: "morphing",
                    description: 'Global Content Morph',
                    name: "Level - " + n
                });
}

contentMorphing.isElementXPercentInViewport = function(el, percentVisible) {
	if (typeof jQuery === "function" && el instanceof jQuery) {
	    el = el[0];
	}
	var rect = el.getBoundingClientRect();
	var windowHeight = (window.innerHeight || document.documentElement.clientHeight);

	return !(
		Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-(rect.height / 1)) * 100)) < percentVisible ||
		Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
	)
};

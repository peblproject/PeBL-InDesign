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
var globalConfiguration = window.parent.Configuration;
var globalLightbox = window.parent.Lightbox;

var lowStakesQuiz = {};
if (globalPebl)
    globalPebl.extension.lowStakesQuiz = lowStakesQuiz;

lowStakesQuiz.createQuizAnchor = function(id, passMessage, failMessage, passingScore) {
    var quizWrapper = document.createElement('div');
    quizWrapper.setAttribute('data-theme-target', id);

    var anchor = document.createElement('ol');
    anchor.id = id;
    anchor.classList.add('pebl__quiz');
    
    var quizScore = document.createElement('h3');
    quizScore.classList.add('quizScore');
    quizScore.textContent = "You haven't answered all of the questions yet!";
    quizScore.setAttribute('data-passingMessage', passMessage);
    quizScore.setAttribute('data-failureMessage', failMessage);
    quizScore.setAttribute('data-passingScore', passingScore);

    quizWrapper.appendChild(anchor);
    anchor.appendChild(quizScore);

    return {wrapper: quizWrapper, anchor: anchor};
}

lowStakesQuiz.createLowStakesMultiChoiceQuestion = function (question) {
    var questionElement = document.createElement('li');
    var questionPromptContainer = document.createElement('div');
    questionPromptContainer.classList.add('questionPromptContainer');
    var questionPrompt = document.createElement('span');
    var responseList = document.createElement('ul');
    var feedbackElement = document.createElement('div');

    questionPrompt.innerHTML = question.prompt;
    questionPromptContainer.appendChild(questionPrompt);
    questionElement.appendChild(questionPromptContainer);

    responseList.classList.add('pebl__quiz--choices');

    for (var i = 0; i < question.answers.length; i++) {
        var listElement = document.createElement('li');
        listElement.textContent = question.answers[i].answerText;
        if (question.answers[i].answerText === question.correctAnswer) {
            listElement.classList.add('pebl__quiz--correct');
        }
        if (question.answers[i].feedbackText && question.answers[i].feedbackText.length > 0) {
            listElement.setAttribute('data-feedbackText', question.answers[i].feedbackText);
        }
        responseList.appendChild(listElement);
    }
    questionElement.appendChild(responseList);
    feedbackElement.classList.add('pebl__quiz--feedback');
    feedbackElement.style.display = 'none';
    feedbackElement.textContent = 'Feedback';
    questionElement.appendChild(feedbackElement);
    
    return questionElement;
    // attachClickHandler(id);
}

jQuery().ready(function () {
    jQuery('.quiz_quizExtension, .peblExtension[data-peblextension="quiz"], .peblExtension[data-peblExtension="quiz"]').each(function() {
        var id = jQuery(this)[0].getAttribute('id');

        var passMessage = this.hasAttribute('data-passingMessage') ? this.getAttribute('data-passingMessage') : '';
        var failMessage = this.hasAttribute('data-failureMessage') ? this.getAttribute('data-failureMessage') : '';
        var passingScore = this.getAttribute('data-passingScore');
        var questions = JSON.parse(this.getAttribute('data-questions'));

        var quizObject = lowStakesQuiz.createQuizAnchor(id, passMessage, failMessage, passingScore);

        var quizAnchor = quizObject.anchor;

        for (var question of questions) {
            quizAnchor.insertBefore(lowStakesQuiz.createLowStakesMultiChoiceQuestion(question), quizAnchor.lastChild);
        }

        var insertLocation = document.getElementById(id);
        insertLocation.parentNode.insertBefore(quizObject.wrapper, insertLocation);
        insertLocation.remove();
    });

    jQuery('ol.pebl__quiz').each(function () {
        var quizEntry = this.id + '-quizAttempts';

        lowStakesQuiz.attachClickHandler(this.id);

        var quizAttempts = localStorage.getItem(quizEntry);

        if (quizAttempts) {
            quizAttempts = JSON.parse(quizAttempts);

            if (quizAttempts.length != 0) {
                var counter = 0;
                jQuery('ol.pebl__quiz > li').each(function () {
                    if (quizAttempts[counter][0] == false && quizAttempts[counter][1] == false) {
                        jQuery(this).children('.pebl__quiz--choices').addClass('reveal', 'secondary');
                        var feedbackText = jQuery(this).attr('data-feedbackText');
                        if (feedbackText)
                            jQuery(this).children('.pebl__quiz--feedback').html(feedbackText.replace(/&lt;br\/>/g, '<br/>'));
                        lowStakesQuiz.handleResize(function () {
                            jQuery(this).children('.pebl__quiz--feedback').slideDown(400, function() {
                                if (globalReadium && globalReadium.reader.plugins.highlights != null)
                                    globalReadium.reader.plugins.highlights.redrawAnnotations();
                            });
                        });
                    }
                    if (quizAttempts[counter][0] == true || quizAttempts[counter][1] == true) {
                        jQuery(this).children('.pebl__quiz--choices').addClass('reveal');
                        var feedbackText = jQuery(this).attr('data-feedbackText');
                        if (feedbackText)
                            jQuery(this).children('.pebl__quiz--feedback').html(feedbackText.replace(/&lt;br\/>/g, '<br/>'));
                        lowStakesQuiz.handleResize(function () {
                            jQuery(this).children('.pebl__quiz--feedback').slideDown(400, function() {
                                if (globalReadium && globalReadium.reader.plugins.highlights != null)
                                    globalReadium.reader.plugins.highlights.redrawAnnotations();
                            });
                        });
                    }
                    counter++;
                });
            }

        }

    });
});

lowStakesQuiz.attachClickHandler = function (quizId) {
    // tries and results
    // [0,1],[1] ...
    var quizEntry = quizId + '-quizAttempts'

    var quizAttempts = localStorage.getItem(quizEntry);

    if (quizAttempts) {
        quizAttempts = JSON.parse(quizAttempts);
    } else {
        quizAttempts = [];
        jQuery('ol.pebl__quiz[id="' + quizId + '"] > li').each(function () {
            quizAttempts.push([]);
        });
    }

    var gradeTest = function (id) {
        var score = 0;
        var total = 0;
        var finished = true;
        for (var i = 0; i < quizAttempts.length && finished; i++) {
            var question = quizAttempts[i];
            if ((question.length == 0) || ((question.length == 1) && (!question[0])))
                finished = false;
            if (finished) {
                if ((question.length == 2) && question[1])
                    score += 1;
                else if (question[0])
                    score += 1;
            }
            total += 1;
        }
        if (finished) {
            var promptElems = jQuery("i[data-id=" + id + "]");
            var quizScoreElem = jQuery("#" + id + " .quizScore");
            var passingScore = parseInt(quizScoreElem.attr('data-passingScore')) / 100;
            var passingMessage = quizScoreElem.attr('data-passingMessage');
            var failureMessage = quizScoreElem.attr('data-failureMessage');
            var prompts = [];
            promptElems.each(function (i, elem) {
                prompts.push(" ][ " + jQuery(elem).attr("data-prompt"));
            });
            var description = id;
            var normalizedScore = ((Math.round((score / total) * 100) / 100) * 100) | 0;
            var quizFeedback = normalizedScore + "%";
            var event;
            var success;
            if ((score / total) >= 0.8) {
                event = globalPebl.events.eventPassed;
                success = true;
                if (globalPebl.extension.config && globalPebl.extension.config.lowStakesQuiz && globalPebl.extension.config.lowStakesQuiz.passMessage)
                    quizFeedback = globalPebl.extension.config.lowStakesQuiz.passMessage;
                else if (passingMessage.length > 0)
                    quizFeedback += " - " + passingMessage;
                else
                    quizFeedback += " - You passed!";
            } else {
                event = globalPebl.events.eventFailed;
                success = false;
                if (globalPebl.extension.config && globalPebl.extension.config.lowStakesQuiz && globalPebl.extension.config.lowStakesQuiz.failMessage)
                    quizFeedback = globalPebl.extension.config.lowStakesQuiz.failMessage;
                else if (failureMessage.length > 0)
                    quizFeedback += " - " + failureMessage;
                else
                    quizFeedback += " - You did not pass, you should review the material and try again.";
            }
            if (globalPebl != null)
                globalPebl.emitEvent(event, {
                    score: score,
                    minScore: 0,
                    maxScore: total,
                    complete: true,
                    success: success,
                    name: id,
                    description: description
                });
            localStorage.removeItem(quizEntry);
            quizScoreElem.html(quizFeedback.replace(/&lt;br\/>/g, '<br/>'));
        }
    };

    jQuery('ol.pebl__quiz[id="' + quizId + '"] .pebl__quiz--choices').off();
    jQuery(document.body).on('click', 'ol.pebl__quiz[id="' + quizId + '"] .pebl__quiz--choices > li', function () {
        var self = this;
        globalPebl.user.isLoggedIn(function(isLoggedIn) {
            if (!isLoggedIn) {
                if (globalConfiguration && globalConfiguration.useLinkedIn && globalLightbox && globalLightbox.linkedInSignIn) {
                    globalLightbox.linkedInSignIn();
                }
            } else {
                var answered = jQuery(self).text();
                var prompt = jQuery(self).parent().parent().find(".questionPromptContainer").text();
                var jQueryanswers = jQuery(self).parents('.pebl__quiz--choices');
                var jQueryanswersText = jQueryanswers.children();
                jQueryanswersText = jQueryanswersText.map(function (i) {
                    return jQuery(jQueryanswersText[i]).text();
                });
                var correctAnswer = jQueryanswers.find('.pebl__quiz--correct').text();
                var jQueryfeedback = jQueryanswers.siblings('.pebl__quiz--feedback');
                var correct = jQuery(self).hasClass('pebl__quiz--correct'); // T or F
                var questionNum = jQuery('#' + quizId + ' .pebl__quiz--choices').index(jQueryanswers);
                var feedbackText = jQuery(self).attr('data-feedbackText');

                if (quizAttempts[questionNum].length == 0) {
                    // first attempt
                    jQueryanswers.children('li').removeClass('pebl__ quiz--wrong');
                    quizAttempts[questionNum].push(correct);
                    localStorage.setItem(quizEntry, JSON.stringify(quizAttempts));
                    if (correct) {
                        jQueryanswers.addClass('reveal');
                        if (feedbackText)
                            jQueryfeedback.html(feedbackText.replace(/&lt;br\/>/g, '<br/>'));
                        else
                            jQueryfeedback.text('Correct');
                    } else {
                        jQuery(self).addClass('pebl__quiz--wrong');
                        //jQuery(self).delay(1000).slideUp();
                        if (feedbackText)
                            jQueryfeedback.html(feedbackText.replace(/&lt;br\/>/g, '<br/>') + ' Try again.');
                        else
                            jQueryfeedback.text('Not quite. Try again.');
                    }

                    if (globalPebl != null)
                        globalPebl.emitEvent(globalPebl.events.eventAttempted, {
                            "prompt": prompt,
                            "answers": jQueryanswersText,
                            "correctAnswers": [
                                [correctAnswer]
                            ],
                            "answered": answered,
                            "score": correct ? 1 : 0,
                            "minScore": 0,
                            "maxScore": 1,
                            "complete": true,
                            "success": correct
                        });


                    gradeTest(quizId);
                    lowStakesQuiz.handleResize(function () {
                        jQueryfeedback.slideDown(400, function() {
                            if (globalReadium && globalReadium.reader.plugins.highlights != null)
                                globalReadium.reader.plugins.highlights.redrawAnnotations();
                        });
                    });
                } else if (quizAttempts[questionNum].length == 1 && quizAttempts[questionNum][0] == false) {

                    // 2nd attempt
                    //jQueryanswers.children('li').removeClass('wrong');
                    quizAttempts[questionNum].push(correct);
                    localStorage.setItem(quizEntry, JSON.stringify(quizAttempts));
                    if (correct == true) {
                        jQueryanswers.addClass('reveal');
                        if (feedbackText)
                            jQueryfeedback.html(feedbackText.replace(/&lt;br\/>/g, '<br/>'));
                        else
                            jQueryfeedback.text('Correct');
                    } else {
                        setTimeout(function () {
                            jQueryanswers.addClass('reveal secondary');
                        }, 1500);

                        jQuery(self).addClass('pebl__quiz--wrong');
                        //jQuery(self).delay(1000).slideUp();
                        if (feedbackText)
                            jQueryfeedback.html(feedbackText.replace(/&lt;br\/>/g, '<br/>'));
                        else
                            jQueryfeedback.text('Please study the correct answer');
                    }

                    if (globalPebl != null)
                        globalPebl.emitEvent(globalPebl.events.eventAttempted, {
                            "prompt": prompt,
                            "answers": jQueryanswersText,
                            "correctAnswers": [
                                [correctAnswer]
                            ],
                            "answered": answered,
                            "score": correct ? 1 : 0,
                            "minScore": 0,
                            "maxScore": 1,
                            "complete": true,
                            "success": correct
                        });
                    gradeTest(quizId);
                    lowStakesQuiz.handleResize(function () {
                        jQueryfeedback.slideDown(400, function() {
                            if (globalReadium && globalReadium.reader.plugins.highlights != null)
                                globalReadium.reader.plugins.highlights.redrawAnnotations();
                        });
                    });
                } else if (quizAttempts[questionNum].length > 1) {
                    // Ignore repeated attempts
                }
            }
        });
    });
}

lowStakesQuiz.handleResize = function (callback) {
    //var currentPage = JSON.parse(globalReadium.reader.bookmarkCurrentPage());
    callback();
    // setTimeout(function() {
    //     globalReadium.reader.openSpineItemElementCfi(currentPage.idref, currentPage.contentCFI);
    // }, 500);
}

lowStakesQuiz.wrongFeedback = function (attempt) {
    var feedback = "";
    if (attempt == 1) {
        // First try
        //        feedback = "Attempt number " + attempt + " is wrong. Try again."
        feedback = "Not quite. Try again.";
    } else {
        // 2nd Try
        //        feedback = "Attempt number " + attempt + " is wrong. Check out the right answer."
        feedback = "Please study the correct answer.";
    }
    return feedback;
}

lowStakesQuiz.correctFeedback = function (attempt) {
    var feedback = "";
    feedback = "That's correct.";
    return feedback;
}
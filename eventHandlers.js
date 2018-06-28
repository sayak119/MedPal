/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there are players or not.
        storage.loadMedList(session, function (medList) {
            var speechOutput = '',
                reprompt;
            if (medList.data.medications.length === 0) {
                speechOutput += 'Hi it\'s Med Pal, Let\'s check . What\'s your first request? You can add medicines and check the medicines you have taken, missed or are due.';
                reprompt = "Please tell me what can I do for you today?";
            } else if (medList.isEmptyScore()) {
                speechOutput += 'Med Pal, '
                    + 'you have ' + medList.data.medications.length + ' medication.';
                if (medList.data.medications.length > 1) {
                    speechOutput += 's';
                }
                speechOutput += ' You can add medications, check the time of medications, reset all medications or exit. Which would you like?';
                reprompt = textHelper.completeHelp;
            } else {
                speechOutput += 'Med Pal, What can I do for you?';
                reprompt = textHelper.nextHelp;
            }
            response.ask(speechOutput, reprompt);
        });
    };
};
exports.register = registerEventHandlers;


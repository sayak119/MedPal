/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage'),
    medicationHelper = require('./medicationHelper');

var currentMedName = '';
var currentMedDosage = '';
var currentMedDuration = '';
var currentMedFrequency = '';

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.NewMedIntent = function (intent, session, response) {
      //add a player to the current game,
      //terminate or continue the conversation based on whether the intent
      //is from a one shot command or not.
      if (intent.slots.Medication.value)
      {
      currentMedName = intent.slots.Medication.value;
      storage.loadMedList(session, function (medList) {
          var speechOutput = '';
          var reprompt;
          if (intent.slots.Dosage.value != null)
          {
            currentMedDosage = intent.slots.Dosage.value;
          }
          if (intent.slots.Frequency.value != null)
          {
            currentMedFrequency = intent.slots.Frequency.value;
          }
          if (intent.slots.Duration.value != null)
          {
            currentMedDuration = intent.slots.Duration.value;
          }
	  console.log(currentMedDosage + ' of ' + currentMedName + ' added for '
              + currentMedDuration + ' to be taken ' + currentMedFrequency + '.');
          if (currentMedDosage && currentMedFrequency && currentMedDuration)
          {
            var medDate = new Date();
            var frequency = parseInt(medicationHelper.getFrequency(currentMedFrequency),10);
            var dayCount = parseInt(medicationHelper.getDayCount(currentMedDuration),10);
            var key, value;
            for (var i = 0; i < dayCount; i += frequency)
            {
              key = currentMedName + ';' + textHelper.formatDate(medDate);
              value = currentMedDosage + ';not taken';
              if (medList.data.dosages[key])
              {
                speechOutput = 'You are already scheduled to take ' + currentMedName + '. '
                  + 'You\'re schedule will be updated.  ';
              }
              else
              {
                medList.data.medications.push(key);
              }
              medList.data.dosages[key] = value;

              medDate.setDate(medDate.getDate() + frequency);
            }
            speechOutput += currentMedDosage + ' of ' + currentMedName + ' added for '
              + currentMedDuration + ' to be taken ' + currentMedFrequency + '.';
            currentMedName = '';
            currentMedDosage = '';
            currentMedDuration = '';
            currentMedFrequency = '';
          }
          else if (currentMedFrequency)
          {
            speechOutput = 'How long will you be taking ' + currentMedName + '?';
            reprompt = 'How long will you be taking ' + currentMedName + '?';
          }
          else if (currentMedDosage)
          {
            speechOutput = 'How often will you be taking ' + currentMedName + '?';
            reprompt = 'How often will you be taking  ' + currentMedName + '?';
          }
          else
          {
            speechOutput = 'How much ' + currentMedName + ' will you be taking?';
            reprompt = 'How much ' + currentMedName + ' will you be taking?';
          }
          medList.save(function () {
              if (reprompt) {
                  response.ask(speechOutput, reprompt);
              } else {
                  response.tell(speechOutput);
              }
          });
      });
      }
      else
      {
        var speechOutput,reprompt;
        speechOutput = 'Please tell me the name of the medicine.';
        reprompt = 'Please tell me the naame of the medicine to me.';
         if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
      }
    };

    intentHandlers.GetDosageIntent = function (intent, session, response) {
      //add a player to the current game,
      //terminate or continue the conversation based on whether the intent
      //is from a one shot command or not.
      storage.loadMedList(session, function (medList) {
          var speechOutput,
              reprompt;
          currentMedDosage = intent.slots.Dosage.value;
          speechOutput = 'How often will you be taking ' + currentMedName + '?';
          reprompt = 'How often will you be taking ' + currentMedName + '?';
          medList.save(function () {
              response.ask(speechOutput, reprompt);
          });
      });
    };

    /*
    medList.data.medications --> all the keys in the form "medName;yyyy-mm-dd"
      Example: "Tylenol;2016-11-05"
    medList.data.dosages[key] --> the value for the key in the form "dosageAmount;taken/not taken"
      Example: "3 mg;not taken"
    probably want to add something to the key, i.e. "medName;yyyy-mm-dd;frequencyTag"
    */
    intentHandlers.GetFrequencyIntent = function (intent, session, response) {
      if (intent.slots.Frequency.value) {
      storage.loadMedList(session, function (medList) {
        var speechOutput, reprompt;
        currentMedFrequency = intent.slots.Frequency.value;

        speechOutput = 'How long will you be taking ' + currentMedName + '?';
        reprompt = 'How long will you be taking ' + currentMedName + '?';

        medList.save(function () {
          response.ask(speechOutput, reprompt);
        });
      });
      }
      else
      {
        var speechOutput = 'Please tell the frequency of your medication.';
            response.tell(speechOutput);
      }
    };

    intentHandlers.GetDurationIntent = function (intent, session, response) {
      //add a player to the current game,
      //terminate or continue the conversation based on whether the intent
      //is from a one shot command or not.
      if (intent.slots.Duration.value) {
      storage.loadMedList(session, function (medList) {
          if (!(currentMedName && currentMedDosage && currentMedFrequency))
          {
            response.tell('Please specify the name of the medication first.');
            return;
          }
          var speechOutput = '';

          currentMedDuration = intent.slots.Duration.value;
          var medDate = new Date();
          var frequency = parseInt(medicationHelper.getFrequency(currentMedFrequency),10);
          var dayCount = parseInt(medicationHelper.getDayCount(currentMedDuration),10);
          var key, value;
          for (var i = 0; i < dayCount; i += frequency)
          {
            key = currentMedName + ';' + textHelper.formatDate(medDate);
            value = currentMedDosage + ';not taken';
            if (medList.data.dosages[key])
            {
              speechOutput = 'You are already scheduled to take ' + currentMedName + '. '
                + 'You\'re schedule will be updated.  ';
            }
            else
            {
              medList.data.medications.push(key);
            }
            medList.data.dosages[key] = value;

            medDate.setDate(medDate.getDate() + frequency);
          }
          speechOutput = currentMedDosage + ' of ' + currentMedName + ' added for '
            + currentMedDuration + ' to be taken ' + currentMedFrequency + '.';
          currentMedName = '';
          currentMedDosage = '';
          currentMedDuration = '';
          currentMedFrequency = '';
          medList.save(function () {
              response.tell(speechOutput);
          });
      });
      }
      else
      {
        var speechOutput = 'Please tell me how long would you liek to take this medicine.';
            response.ask(speechOutput);
      }
    };

    intentHandlers.GetMedsIntent = function (intent, session, response) {
        storage.loadMedList(session, function (medList) {
            var medListCopy = [],
                speechOutput = 'You need to take the following today. ';
            medList.data.medications.forEach(function (med) {
                medListCopy.push({
                    dosage: medList.data.dosages[med],
                    name: med
                });
            });
            var currentDate = textHelper.formatDate(new Date());
            var medsToTakeToday = medicationHelper.getMissedMedicationsForDate(currentDate, medListCopy);
            if (medsToTakeToday.length == 0)
            {
              speechOutput = 'You have no more medications to take today.';
            }
            else
            {
              medsToTakeToday.forEach(function (med) {
                var keySplit = med.name.split(';');
                var valueSplit = med.dosage.split(';');
                speechOutput += (valueSplit[0] + ' of ' + keySplit[0] + '. ');
              });
            }
            response.tell(speechOutput);
        });
    };

    // intentHandlers.GetTODIntent = function (intent, session, response) {
    //   storage.loadMedList(session, function (medList) {
    //
    //   }
    // };

    intentHandlers.MarkTakenIntent = function (intent, session, response) {
        storage.loadMedList(session, function (medList) {
            var speechOutput;
            var medName = intent.slots.Medication.value;
            var currentDate = textHelper.formatDate(new Date());
            var keyPrefix = medName + ';' + currentDate;
            // medList.data.medications.forEach( function (med) {
            //   if (med.includes(keyPrefix))
            //   {
            //     keyPrefix = med;
            //   }
            // });
            var value = medList.data.dosages[keyPrefix].split(';');
            value[1] = "taken";
            medList.data.dosages[keyPrefix] = value.join(';');
            speechOutput = 'Great job taking your ' + medName + '. ';
            var medListCopy = [];
            medList.data.medications.forEach(function (med) {
                medListCopy.push({
                    dosage: medList.data.dosages[med],
                    name: med
                });
            });
            var medsToTakeToday = medicationHelper.getMissedMedicationsForDate(currentDate, medListCopy);
            if (medsToTakeToday.length == 0)
            {
              speechOutput += 'You have no more medications to take today.';
            }
            else
            {
              speechOutput += 'You still need to take the following medications. ';
              medsToTakeToday.forEach(function (med) {
                var keySplit = med.name.split(';');
                var valueSplit = med.dosage.split(';');
                speechOutput += (valueSplit[0] + ' of ' + keySplit[0] + '. ');
              });
            }
             medList.save(function () {
                response.tell(speechOutput);
            });
        });
    };

    intentHandlers.ReportIntent = function (intent, session, response) {
      storage.loadMedList(session, function (medList) {
        // code that will break program goes here
        var speechOutput;
        var date = intent.slots.MedDate.value;
        var medListCopy = [];
        medList.data.medications.forEach(function (med) {
            medListCopy.push({
                dosage: medList.data.dosages[med],
                name: med
            });
        });
        if (medListCopy.length == 0)
        {
          response.tell('No meds have been scheduled for ' + date + '.');
          return;
        }
        speechOutput = 'Here\'s you\'re report for ' + intent.slots.MedDate.value + '. ';
        var takenMeds = medicationHelper.getTakenMedicationsForDate(date,medListCopy);
        if (takenMeds.length == 0)
        {
          speechOutput += 'You did not take any medications. ';
        }
        else
        {
          speechOutput += 'You took the following. ';
          takenMeds.forEach(function (med) {
            var parsedMed = med.name.split(';');
            var parsedDosage = med.dosage.split(';');
            speechOutput += parsedDosage[0] + ' of ' + parsedMed[0] + '. ';
          });
        }

        var missedMeds = medicationHelper.getMissedMedicationsForDate(date,medListCopy);
        if (missedMeds.length == 0)
        {
          speechOutput += 'You did not miss any medications. '
        }
        else
        {
          speechOutput += 'You missed the following. ';
          missedMeds.forEach(function (med) {
            var parsedMed = med.name.split(';');
            var parsedDosage = med.dosage.split(';');
            speechOutput += parsedDosage[0] + ' of ' + parsedMed[0] + '. ';
          });
        }
        response.tell(speechOutput);//get rekt
      });
    };

    intentHandlers.PrepareIntent = function (intent, session, response) {
      storage.loadMedList(session, function (medList) {
        // code that will break program goes here
        var speechOutput;
        var date = intent.slots.MedDate.value;
        var medListCopy = [];
        medList.data.medications.forEach(function (med) {
            medListCopy.push({
                dosage: medList.data.dosages[med],
                name: med
            });
        });
        if (medListCopy.length == 0)
        {
          response.tell('You have no medications scheduled at all. '
            + 'Please make sure you are telling me what you need to take.');
          return;
        }

        var toBeTakenMeds = medicationHelper.getAllMedicationsForDate(date,medListCopy);
        if (toBeTakenMeds.length == 0)
        {
          response.tell('You are currently not scheduled to take any medication on ' + date + '.');
          return;
        }
        else
        {
          speechOutput = 'You are scheduled to take the following medications on ' + date + '. ';
          toBeTakenMeds.forEach(function (med) {
            var parsedMed = med.name.split(';');
            var parsedDosage = med.dosage.split(';');
            speechOutput += parsedDosage[0] + ' of ' + parsedMed[0] + '. ';
          });
        }
        response.tell(speechOutput);//get rekt
      });
    };

    intentHandlers.ResetRecordIntent = function (intent, session, response) {
        //remove all players
        storage.newMedList(session).save(function () {
            response.tell('All medication records have been deleted.');
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        // if (skillContext.needMoreHelp) {
            response.tell('Keep up the great work.');
        // } else {
        //     response.tell('');
        // }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        // if (skillContext.needMoreHelp) {
            response.tell('Keep up the great work.');
        // } else {
        //     response.tell('');
        // }
    };
};
exports.register = registerIntentHandlers;


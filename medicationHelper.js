/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var medicationHelper = (function () {

    return {
        getFrequency: function (frequencyString) {
            var frequency = 1;
            var frequencyArray = frequencyString.split(' ');

            for(var i=0; i<frequencyArray.length; i++)
            {
              if(!isNaN(frequencyArray[i]))
              {
                frequency = frequencyArray[i];
              }

              else if(frequencyArray[i].includes('week'))
              {
                frequency *= 7;
              }

              else if(frequencyArray[i].includes('month'))
              {
                frequency *= 30;
              }

              else if(frequencyArray[i].includes('year'))
              {
                frequency *= 365;
              }

              if(frequencyArray[i] === 'other'){
                frequency *= 2;
              }
            }
            return frequency;
        },

        getDayCount: function (durationString) {
          var dayCount = 1;
          var durationArray = durationString.split(' ');
          if (durationArray.length == 1)
          {
            switch (durationArray[0]) {
              case 'day':
                dayCount = 1;
                break;
              case 'week':
                dayCount = 7;
                break;
              case 'month':
                dayCount = 30;
                break;
              case 'year':
                dayCount = 365;
                break;
              default:
                dayCount = 1;
            }
          }
          else
          {
            dayCount = parseInt(durationArray[0], 10);
            if (durationArray[1].includes('day'))
            {
                dayCount *= 1;
            }
            else if (durationArray[1].includes('week'))
            {
                dayCount *= 7;
            }
            else if (durationArray[1].includes('month'))
            {
                dayCount *= 30;
            }
            else if (durationArray[1].includes('year'))
            {
                dayCount *= 365;
            }
          }
          return dayCount;
        },

        getPreviouslyMissedMedications: function (date, meds) {
          var missedMedsBeforeDate = [];
          meds.forEach(function (med)
          {
            var parsedKey = med.name.split(';');
            parsedKey[1].replace('-','');
            var dateCopy = date;
            dateCopy.replace('-','');
            if (parseInt(parsedKey[1],10) < parseInt(dateCopy,10))
            {
              var parsedValue = med.dosage.split(';');
              if (parsedValue.length > 1 && parsedValue[1] === 'not taken')
              {
                missedMedsBeforeDate.push(med);
              }
            }
          });
          return missedMedsBeforeDate;
        },

        //date as the key form
        //meds: {name:, dosage:}
        getAllMedicationsForDate: function (date, meds) {
          var medsOnDate = [];
          meds.forEach(function (med)
          {
            var parsedKey = med.name.split(';');
            if (parsedKey[1] === date)
            {
              medsOnDate.push(med);
            }
          });
          return medsOnDate;
        },

        getTakenMedicationsForDate: function (date, meds) {
          var takenMedsOnDate = [];
          meds.forEach(function (med)
          {
            var parsedKey = med.name.split(';');
            if (parsedKey[1] === date)
            {
              var parsedValue = med.dosage.split(';');
              if (parsedValue[1] === 'taken')
              {
                takenMedsOnDate.push(med);
              }
            }
          });
          return takenMedsOnDate;
        },

        getMissedMedicationsForDate: function (date, meds) {
          var missedMedsOnDate = [];
          meds.forEach(function (med)
          {
            var parsedKey = med.name.split(';');
            if (parsedKey[1] === date)
            {
              var parsedValue = med.dosage.split(';');
              if (parsedValue[1] === 'not taken')
              {
                missedMedsOnDate.push(med);
              }
            }
          });
          return missedMedsOnDate;
        }
    };
})();
module.exports = medicationHelper;


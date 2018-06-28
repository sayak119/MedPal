/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Game class stores all game states for the user
     */
    function MedList(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                medications: [],
                dosages: {}
            };
        }
        this._session = session;
    }

    MedList.prototype = {
        isEmptyScore: function () {
            //check if any one had non-zero score,
            //it can be used as an indication of whether the game has just started
            var allEmpty = true;
            var medListData = this.data;
            medListData.medications.forEach(function (med) {
                if (medListData.dosages[med] !== 0) {
                    allEmpty = false;
                }
            });
            return allEmpty;
        },
        save: function (callback) {
            //save the game states in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.medList = this.data;
            dynamodb.putItem({
                TableName: 'MedManagerMedicationTable',
                Item: {
                    MedicationId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadMedList: function (session, callback) {
            if (session.attributes.medList) {
                console.log('get game from session=' + session.attributes.medList);
                callback(new MedList(session, session.attributes.medList));
                return;
            }
            dynamodb.getItem({
                TableName: 'MedManagerMedicationTable',
                Key: {
                    MedicationId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var medList;
                if (err) {
                    console.log(err, err.stack);
                    medList = new MedList(session);
                    session.attributes.medList = medList.data;
                    callback(medList);
                } else if (data.Item === undefined) {
                    medList = new MedList(session);
                    session.attributes.medList = medList.data;
                    callback(medList);
                } else {
                    console.log('get game from dynamodb=' + data.Item.Data.S);
                    medList = new MedList(session, JSON.parse(data.Item.Data.S));
                    session.attributes.medList = medList.data;
                    callback(medList);
                }
            });
        },
        newMedList: function (session) {
            return new MedList(session);
        }
    };
})();
module.exports = storage;


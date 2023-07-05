'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('top3100Ctrl', top3100Ctrl);

    top3100Ctrl.$inject = ['$q', '$scope', 'API', '$resource', 'Query', '$filter', 'PagedCollection', '$rootScope'];


    function top3100Ctrl($q, $scope, API, $resource, Query, $filter, PagedCollection, $rootScope) {
        //array of colours for the layers
        $scope.colors = [
            "border-left:4px solid rgba(66, 235, 245, 0.7);background: linear-gradient(90deg, rgba(32, 180, 189, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid #DC1982;background: linear-gradient(90deg, rgba(152, 19, 91, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid rgba(65, 41, 203, 0.7); background: linear-gradient(90deg, rgba(45, 17, 209, 0.6) 0%, rgba(10, 31, 46, 0) 100%);"
        ]
        var _config = $scope.config;


        function init() {
            if (_config.moduleType == 'Across Modules') { getTop3records(); }
            else { getRecordsFromCustomModule(); }
        }
        init();


        if (_config.broadcastEvent) {
            $rootScope.$on(_config.eventName, function (event, data) {
                var element = document.getElementById("top3ParentDiv-" + _config.wid);
                element.style.visibility = 'hidden';
                element.style.opacity = 0;
                element.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
                if (_config.moduleType == 'Single Module') {
                    var defer = $q.defer();
                    $resource(data).get(function (response) {
                      defer.resolve(response);
                    }, function (error) {
                      defer.reject(error);
                    })
                    defer.promise.then(function (response) {
                        formatDataForWidget(true, response[_config.customModuleField])
                        setTimeout(function () {
                          element.style.visibility = 'visible';
                          element.style.opacity = 1;
                        }, 600);
                    })
                }
            })
        }

        function getTop3records() {
            //building query
            _config.query.sort = [{
                field: 'total',
                direction: 'DESC'
            }];
            _config.query.aggregates = [
                {
                    'operator': 'countdistinct',
                    'field': '*',
                    'alias': 'total'
                },
                {
                    'alias': 'type',
                    'field': _config.groupByPicklistOrLookup + '.itemValue',
                    'operator': 'groupby'
                }
            ];
            _config.query.limit = 3;

            var _queryObj = new Query(_config.query);

            getResourceData(_config.module, _queryObj).then(function (result) {
                var _dataSource = undefined;
                if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
                    $scope.res = result['hydra:member'];
                    _dataSource = {};
                    if ($scope.res.length > 0) {
                        $scope.res.forEach(element => {
                            if (element.type !== null) {
                                _dataSource[element.type] = $filter('numberToDisplay')(element.total);
                            }
                        });
                        createLayers(_dataSource);
                    }
                }
            });

        }

        function getRecordsFromCustomModule() {
            var filters = {
                query: _config.query
            };
            var pagedTotalData = new PagedCollection(_config.module, null, null);
            pagedTotalData.loadByPost(filters).then(function () {
                var data = pagedTotalData.fieldRows[0][_config.customModuleField].value;
                // if (_config.keyForCustomModule != "") {
                //     var nestedKeysArray = _config.keyForCustomModule.split('.');
                //     nestedKeysArray.forEach(function (value) {
                //         data = data[value];
                //     })
                // }
                // if (data === undefined) {
                //     _dataSource = { "Key is invalid... ": "" }
                // }
                // else {
                //     var dataArray = Object.entries(data);
                //     dataArray.sort((a, b) => b[1] - a[1]);
                //     _dataSource = {};
                //     for (var index = 1; index <= Math.min(3, dataArray.length); index++) {
                //         _dataSource[dataArray[index - 1][0]] = $filter('numberToDisplay')(dataArray[index - 1][1]);
                //     }
                // }
                formatDataForWidget(false, data)
            })
        }

        function formatDataForWidget(changeData, data){
            var _dataSource = undefined;
            if (_config.keyForCustomModule != "") {
                var nestedKeysArray = _config.keyForCustomModule.split('.');
                nestedKeysArray.forEach(function (value) {
                    data = data[value];
                })
            }
            if (data === undefined) {
                _dataSource = { "Key is invalid... ": "" }
            }
            else {
                var dataArray = Object.entries(data);
                dataArray.sort((a, b) => b[1] - a[1]);
                _dataSource = {};
                for (var index = 1; index <= Math.min(3, dataArray.length); index++) {
                    _dataSource[dataArray[index - 1][0]] = $filter('numberToDisplay')(dataArray[index - 1][1]);
                }
            }
            if (changeData) {
                changeInnerData(_dataSource);
            }
            else {
                createLayers(_dataSource);
            }
        }

        function changeInnerData(element) {
            var index = 0;
            for (let [key, value] of Object.entries(element)) {
                var getInnerNumber = document.getElementById((index + 1) + "-innerNumberElement-" + _config.wid);
                var getInnerText = document.getElementById((index + 1) + "-innerTextElement-" + _config.wid);
                getInnerText.innerHTML = key;
                getInnerNumber.innerHTML = value;
                index++;
            }
        }

        function getResourceData(resource, queryObject) {
            var defer = $q.defer();
            $resource(API.QUERY + resource).save(queryObject.getQueryModifiers(), queryObject.getQuery(true)).$promise.then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function createLayers(element) {

            var parentDiv = document.getElementById("top3ParentDiv-" + _config.wid);

            var leftBorderElement = document.createElement('div');
            leftBorderElement.setAttribute('class', 'layer-border-left');
            var innerTextElement = document.createElement('div');
            innerTextElement.setAttribute('class', 'innder-div-text');
            var innerNumberElement = document.createElement('class', 'inner-div-number');
            innerNumberElement.setAttribute('class', 'inner-div-number');
            var innerOuterDiv = document.createElement('div');
            innerOuterDiv.setAttribute('class', 'inner-outer-div');
            var index = 0;

            for (let [key, value] of Object.entries(element)) {

                var leftBorderElement = document.createElement('div');
                leftBorderElement.setAttribute('class', 'layer-border-left margin-top-20 display-block margin-left-md');
                leftBorderElement.setAttribute('id', key + "-leftBorderElement");
                leftBorderElement.setAttribute('style', $scope.colors[index])

                var innerTextElement = document.createElement('div');
                innerTextElement.setAttribute('class', 'innder-div-text');
                innerTextElement.setAttribute('id', (index + 1) + "-innerTextElement-" + _config.wid);
                innerTextElement.innerHTML = key;

                var innerNumberElement = document.createElement('div');
                innerNumberElement.setAttribute('class', 'inner-div-number padding-right-lg');
                innerNumberElement.setAttribute('id', (index + 1) + "-innerNumberElement-" + _config.wid);
                innerNumberElement.innerHTML = value;

                var innerOuterDiv = document.createElement('div');
                innerOuterDiv.setAttribute('class', 'inner-outer-div display-inline-block display-flex-space-between');
                innerOuterDiv.setAttribute('id', key + "-innerOuterDiv");

                innerOuterDiv.appendChild(innerTextElement);
                innerOuterDiv.appendChild(innerNumberElement);
                leftBorderElement.appendChild(innerOuterDiv);
                parentDiv.appendChild(leftBorderElement);

                index++;
            }


        }
    }
})();
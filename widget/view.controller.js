'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('topX100Ctrl', topX100Ctrl);

    topX100Ctrl.$inject = ['$q', '$scope', 'API', '$resource', 'Query', '$filter', 'PagedCollection', '$rootScope'];


    function topX100Ctrl($q, $scope, API, $resource, Query, $filter, PagedCollection, $rootScope) {
        //array of colours for the layers
        $scope.colors = [
            "border-left:4px solid rgba(66, 235, 245, 0.7);background: linear-gradient(90deg, rgba(32, 180, 189, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid #DC1982;background: linear-gradient(90deg, rgba(152, 19, 91, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid rgba(65, 41, 203, 0.7); background: linear-gradient(90deg, rgba(45, 17, 209, 0.6) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left: 4px solid #DED609;background: linear-gradient(90deg, #DED60966 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left: 4px solid #21D980;background: linear-gradient(90deg, #1fae6999 0%, rgba(10, 31, 46, 0) 100%);"
        ]
        var _config = $scope.config;
        $scope.processing = false;


        function init() {
            //check if this event is supposed to listen to eny of the broadcasted events, if yes then turn the listner up
            if (_config.broadcastEvent) {
                //example widget:globalVisibilityEvent from Record Summary card
                $rootScope.$on("widget:" + _config.eventName, function (event, data) {
                    updateLayers(data);
                })
            }
            //to get data from single JSON record or FSR
            if (_config.moduleType == 'Across Modules') { getTopXrecords(); }
            else { getRecordsFromCustomModule(); }
        }
        init();


        function updateLayers(data) {
            var element = document.getElementById("topXParentDiv-" + _config.wid);
            element.style.visibility = 'hidden';
            element.style.opacity = 0;
            element.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
            $scope.processing = true;

            //else condition is not possible, since on click event is possible in case of single module
            if (_config.moduleType == 'Single Module') {
                var defer = $q.defer();
                $resource(data).get(function (response) {
                    defer.resolve(response);
                }, function (error) {
                    defer.reject(error);
                })
                defer.promise.then(function (response) {
                    formatDataForWidget(response[_config.customModuleField])
                    $scope.processing = false;
                    setTimeout(function () {
                        element.style.visibility = 'visible';
                        element.style.opacity = 1;
                    }, 600);
                })
            }
        }

        //Only to format data in a way that is required by widget
        function formatDataForWidget(data) {
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
                for (var index = 1; index <= Math.min(_config.queryLimit, dataArray.length); index++) {
                    _dataSource[dataArray[index - 1][0]] = $filter('numberToDisplay')(dataArray[index - 1][1]);
                }
            }
            createLayers(_dataSource);
        }

        function getTopXrecords() {
            var picklistQuery = getQuery();

            picklistQuery.filters.push({ "filters": _config.query.filters, "logic": _config.query.logic });
            var _queryObj = new Query(picklistQuery);

            getResourceData(_config.module, _queryObj).then(function (result) {
                var _dataSource = undefined;
                if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
                    _dataSource = {};
                    result['hydra:member'].forEach(element => {
                        if (element.type !== null) {
                            _dataSource[element.type] = $filter('numberToDisplay')(element.total);
                        }
                    });
                    createLayers(_dataSource);
                }
            });
        }

        //building query
        function getQuery() {
            var query = {
                'sort':[{
                    field: 'total',
                    direction: 'DESC'
                }],
                'aggregates': [
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
                ],
                'limit': _config.queryLimit,
                'filters': [
                    {
                        'field': _config.groupByPicklistOrLookup + '.itemValue',
                        'operator': 'isnull',
                        'type': 'object',
                        'value': 'false'
                    }
                ]
            };
            return query;
        }

        function getRecordsFromCustomModule() {
            var filters = {
                query: _config.query
            };
            var pagedTotalData = new PagedCollection(_config.module, null, null);
            pagedTotalData.loadByPost(filters).then(function () {
                var data = pagedTotalData.fieldRows[0][_config.customModuleField].value;
                formatDataForWidget(data)
            })
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

            var parentDiv = document.getElementById("topXParentDiv-" + _config.wid);
            parentDiv.innerHTML = "";
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

                //create a function for all elements
                var leftBorderElement = document.createElement('div');
                leftBorderElement.setAttribute('class', 'margin-top-20 display-block margin-left-md layer-border-left-' + _config.queryLimit);
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
                innerOuterDiv.setAttribute('class', 'display-inline-block display-flex-space-between inner-outer-div-' + _config.queryLimit);
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
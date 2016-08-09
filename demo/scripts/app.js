(function () {
    'use strict';

    var app = angular.module('scaleApp', [
        'scaleConfigModule',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'emguo.poller',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.pagination',
        'ui.grid.resizeColumns',
        'cfp.hotkeys',
        'toggle-switch'
    ]);

    app.config(['$routeProvider', '$resourceProvider', '$provide', 'pollerConfig', function($routeProvider, $resourceProvider, $provide, pollerConfig) {
        // Fix sourcemaps
        // @url https://github.com/angular/angular.js/issues/5217#issuecomment-50993513
        $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
            return function (exception, cause) {
                $delegate(exception, cause);
                setTimeout(function() {
                    throw exception;
                });
            };
        }]);

        // stop pollers when route changes
        pollerConfig.stopOnRouteChange = true;
        pollerConfig.smart = true;

        // preserve trailing slashes
        $resourceProvider.defaults.stripTrailingSlashes = false;

        //routing
        $routeProvider
            .when('/', {
                controller: 'ovController',
                controllerAs: 'vm',
                templateUrl: 'modules/overview/partials/ovTemplate.html'
            })
            .when('/admin/login',{
                controller: 'adminLoginController',
                templateUrl: 'modules/admin/partials/adminLoginTemplate.html'
            })
            .when('/admin/logout',{
                controller: 'logoutController',
                templateUrl: 'modules/admin/partials/adminLoginTemplate.html'
            })
            .when('/about', {
                controller: 'aboutController',
                controllerAs: 'vm',
                templateUrl: 'modules/about/partials/aboutTemplate.html'
            })
            .when('/feed', {
                controller: 'feedDetailsController',
                controllerAs: 'vm',
                templateUrl: 'modules/feed/partials/feedDetailsTemplate.html',
                reloadOnSearch: false
            })
            .when('/feed/ingests', {
                controller: 'ingestRecordsController',
                controllerAs: 'vm',
                templateUrl: 'modules/feed/partials/ingestRecordsTemplate.html',
                reloadOnSearch: false
            })
            .when('/feed/ingests/:id', {
                controller: 'ingestRecordDetailsController',
                controllerAs: 'vm',
                templateUrl: 'modules/feed/partials/ingestRecordDetailsTemplate.html'
            })
            .when('/metrics', {
                controller: 'metricsController',
                controllerAs: 'vm',
                templateUrl: 'modules/metrics/partials/metricsTemplate.html',
                reloadOnSearch: false
            })
            .when('/nodes', {
                controller: 'nodesController',
                controllerAs: 'vm',
                templateUrl: 'modules/nodes/partials/nodesTemplate.html'
            })
            .when('/nodes/:id', {
                controller: 'nodeDetailsController',
                controllerAs: 'vm',
                templateUrl: 'modules/nodes/partials/nodeDetailsTemplate.html'
            })
            .when('/load/queued', {
                controller: 'loadController',
                controllerAs: 'vm',
                templateUrl: 'modules/load/partials/loadTemplate.html'
            })
            .when('/load/running', {
                controller: 'queueRunningController',
                controllerAs: 'vm',
                templateUrl: 'modules/load/partials/queueRunningTemplate.html'
            })
            .when('/load/depth', {
                controller: 'loadDepthController',
                controllerAs: 'vm',
                templateUrl: 'modules/load/partials/loadDepthTemplate.html'
            })
            .when('/recipes', {
                controller: 'recipesController',
                controllerAs: 'vm',
                templateUrl: 'modules/recipes/partials/recipesTemplate.html',
                reloadOnSearch: false
            })
            .when('/recipes/recipe/:id', {
                controller: 'recipeDetailsController',
                controllerAs: 'vm',
                templateUrl: 'modules/recipes/partials/recipeDetailsTemplate.html'
            })
            .when('/recipes/types/:id?', {
                controller: 'recipeTypesController',
                controllerAs: 'vm',
                templateUrl: 'modules/recipes/partials/recipeTypesTemplate.html'
            })
            .when('/jobs', {
                controller: 'jobsController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobsTemplate.html',
                reloadOnSearch: false
            })
            .when('/jobs/job/:id', {
                controller: 'jobDetailController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobDetailTemplate.html'
            })
            .when('/jobs/types/:id?', {
                controller: 'jobTypesController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobTypesTemplate.html'
            })
            .when('/jobs/failure-rates', {
                controller: 'jobTypesFailureRatesController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobTypesFailureRatesTemplate.html',
                reloadOnSearch: false
            })
            .when('/jobs/executions', {
                controller: 'jobExecutionsController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobExecutionsTemplate.html'
            })
            .when('/jobs/executions/:id', {
                controller: 'jobExecutionDetailController',
                controllerAs: 'vm',
                templateUrl: 'modules/jobs/partials/jobExecutionDetailTemplate.html'
            })
            .when('/workspaces/:id?', {
                controller: 'workspacesController',
                controllerAs: 'vm',
                templateUrl: 'modules/workspaces/partials/workspacesTemplate.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .value('moment', window.moment)
    .value('localStorage', window.localStorage)
    .value('XMLHttpRequest', window.XMLHttpRequest)
    .value('toastr', window.toastr);
})();

(function () {
    'use strict';

    angular.module('scaleConfigModule', []).provider('scaleConfig', function () {
        var scaleConfig = {},
            scaleConfigLocal = {};

        this.$get = function () {
            var config = $.ajax({
                type: 'GET',
                url: 'config/scaleConfig.json',
                cache: false,
                async: false,
                contentType: 'application/json',
                dataType: 'json'
            });
            
            if (config.status === 200) {
                scaleConfig = config.responseJSON.scaleConfig;

                var configLocal = $.ajax({
                    type: 'GET',
                    url: 'config/scaleConfig.local.json',
                    cache: false,
                    async: false,
                    contentType: 'application/json',
                    dataType: 'json'
                });

                if (configLocal.status === 200) {
                    scaleConfigLocal = configLocal.responseJSON.scaleConfigLocal;
                }

                _.merge(scaleConfig, scaleConfigLocal);
            }

            return scaleConfig;
        }
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisHeaderController', ['subnavService', function(subnavService) {
        var vm = this;
        vm.currentPath = subnavService.getCurrentPath();
    }])
    .directive('aisHeader', function () {
        /**
         * Usage: <ais-header name={name}></ais-header>
         */
        return {
            controller: 'aisHeaderController',
            controllerAs: 'vm',
            restrict: 'E',
            templateUrl: 'modules/header/headerTemplate.html',
            scope: {
                name: '=',
                hideTitle: '=',
                loading: '=', // optional - will overlay a loading spinner on the page based on the passed-in value
                showSubnav: '=',
                subnavLinks: '='
            }
        };

    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').directive('scaleNavigation', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/navigation/partials/navTemplate.html',
            controller: 'navController',
            controllerAs: 'vm'
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aboutController', ['$scope', '$location', 'navService', 'stateService', function($scope, $location, navService, stateService) {
        var vm = this;
        
        vm.stateService = stateService;
        vm.version = '';

        var initialize = function() {
            navService.updateLocation('about');
        };

        initialize();

        $scope.$watch('vm.stateService.getVersion()', function (newValue) {
            vm.version = newValue;
        });
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('adminLoginController', ['$timeout', '$location', 'stateService', 'userService', function ($timeout, $location, stateService, userService) {

        var initialize = function () {
            var user = userService.getUserCreds();
            
            if (!user) {
                userService.login('admin');
            }

            $timeout(function () {
                // Any code in here will automatically have an $scope.apply() run afterwards
                $location.path('/');
            });
        };

        initialize();
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('logoutController', ['$timeout', '$rootScope', '$location', 'userService', function ($timeout, $rootScope, $location, userService) {

        var initialize = function () {
            userService.logout();
            $timeout(function(){
                // Any code in here will automatically have an $scope.apply() run afterwards
                $location.path("/");
            });
        };

        initialize();
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('aisDataFeedController', ['$scope', 'scaleConfig', 'loadService', 'scaleService', function ($scope, scaleConfig, loadService, scaleService) {
        var days = [],
            hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
            values = {};
        
        var processNewFeed = function () {
            days = [];
            var day = '';
            if ($scope.feed) {
                _.forEach($scope.feed.values, function (val) {
                    var valday = moment.utc(val.time).format(scaleConfig.dateFormats.day);
                    var valhour = moment.utc(val.time).hour();
                    var id = valday + '_' + valhour;
                    values[id] = val;
                    if (valday !== day) {
                        day = valday;
                        days.push(valday);
                    }
                });
                buildTable();
            }
        };

        var buildTable = function () {
            var currDay = moment().utc().format(scaleConfig.dateFormats.day);
            var currHour = moment().utc().hour();

            var table_html = '<div class="table-responsive"><table>';
            table_html += '<tr><th>Hour (UTC)</th>';
            for(day in days) {
                table_html += '<td class="day-label" title="' + days[day] + '"><div class="day-of-week">' + scaleService.getDayString(moment(days[day]).day()) + '</div>' + moment(days[day]).format('MM/DD') + '</td>';
            }
            table_html += '</tr>';
            for(var hour in hours) {
                hour = 23-hour;
                table_html += '<tr>';
                table_html += '<th title="' + hours[hour] + ':00">' + hours[hour] + '</th>';

                for(var day in days) {
                    var key =  days[day] + '_' + hours[hour];
                    var files = values[key].files;
                    var size = values[key].size;
                    var cls = 'good';
                    if (days[day] === currDay) {
                        if (hours[hour] === currHour) {
                            cls = 'current';
                        }
                        else if (hours[hour] > currHour) {
                            cls = 'future';
                        }
                    }
                    if (files === 0 && size === 0 && cls !== 'current' && cls !== 'future') {
                        cls = 'unknown';
                    }
                    table_html += '<td id="' + key + '" title="' + days[day] + ' ' + hours[hour] + ':00">';
                    if (cls === 'future') {
                        table_html += '<span class="' + cls + '" id="span_' + days[day] + '_' + hours[hour] + '" style="display: block;">&nbsp;</span></td>';
                    }
                    else{
                        table_html += '<span class="' + cls + '" id="span_' + days[day] + '_' + hours[hour] + '" style="display: block;">' + scaleService.calculateFileSizeFromBytes(size,1) + ' / ' + files + '</span></td>';
                    }

                }
                table_html += '</tr>';
            }
            table_html += '</table></div>';
            $('#history').html(table_html);
        };

        var initialize = function () {

            $scope.$watch('feed', function (value) {
                if ($scope.feed) {
                    processNewFeed();
                }
            });
        };

        initialize();
    }]).directive('aisDataFeed', function () {
        return {
            controller: 'aisDataFeedController',
            templateUrl: 'modules/charts/dataFeed/dataFeedTemplate.html',
            restrict: 'E',
            scope: {
                feed: '=' // Feed data
            }
        };

    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisDonutController', ['$scope', '$element', 'scaleConfig', function ($scope, $element, scaleConfig) {
        var colData = [],
            chart = null;

        var genChart = function () {
            if (chart) {
                var oldData = [],
                    removeIds = [];

                // reassemble currently displayed data to match colData
                _.forEach(chart.data(), function (d) {
                    oldData.push([d.values[0].id, d.values[0].value]);
                });

                // determine which elements to remove
                _.forEach(oldData, function (od) {
                    var keep = _.find(colData, function (cd) {
                        return cd[0] === od[0];
                    });
                    if (!keep) {
                        removeIds.push(od[0]);
                    }
                });

                // update chart
                chart.load({
                    columns: colData,
                    unload: removeIds
                });
            } else {
                chart = c3.generate({
                    bindto: $element[0],
                    data: {
                        columns: colData,
                        type: $scope.type,
                        colors: {
                            down: scaleConfig.colors.chart_red,
                            warning: scaleConfig.colors.chart_yellow,
                            up: scaleConfig.colors.chart_green,
                            Completed: scaleConfig.colors.chart_green,
                            Done: '#3681bf',
                            Queue: scaleConfig.colors.chart_yellow,
                            Failed: scaleConfig.colors.chart_red,
                            ALGORITHM: scaleConfig.colors.failure_algorithm,
                            DATA: scaleConfig.colors.failure_data,
                            SYSTEM: scaleConfig.colors.failure_system,
                            Offline: scaleConfig.colors.chart_red,
                            'High Failure Rate': scaleConfig.colors.chart_orange,
                            Paused: scaleConfig.colors.chart_yellow
                        }
                    },
                    transition: {
                        duration: 700
                    },
                    pie: {
                        label: {
                            format: d3.format(',')
                        }
                    },
                    donut: {
                        label: {
                            format: $scope.showLabel ? d3.format(',') : function () {
                                return '';
                            }
                        },
                        width: $scope.width,
                        title: $scope.name
                    },
                    tooltip: {
                        format: {
                            value: d3.format(',')
                        }
                    },
                    size: {
                        height: $scope.size || 320
                    }
                });
            }
            $element[0].style.position = 'static';
        };

        var initColumnData = function (){
            colData = [];
            $scope.data.forEach(function (obj){
                colData.push([obj.status,obj.count]);
            });
        };

        var initialize = function () {
            initColumnData();
            genChart();
        };

        $scope.$watch('data', function (data) {
            if (data) {
                if (data.length > 0) {
                    initialize();
                } else {
                    $($element[0]).empty();
                }
            }
        });

        window.onresize = function () {
            genChart();
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').directive('aisDonut', function () {
        return {
            controller: 'aisDonutController',
            restrict: 'E',
            scope: {
                data: '=',
                type: '=',
                size: '=',
                showLabel: '=',
                width: '=',
                name: '='
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisGridChartController', ['$rootScope', '$scope', '$location', '$uibModal', 'userService', 'scaleConfig', 'scaleService', function ($rootScope, $scope, $location, $uibModal, userService, scaleConfig, scaleService) {
        var vm = this,
            svg = null,
            rect = null,
            scale = parseFloat($scope.scale),
            tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var failures = d.status.getFailures(),
                        failStr = failures.length > 0 ? '<br /><br />' : '',
                        running = getCellActivityTotal(d),
                        completed = getCellTotal(d),
                        statusStr = running > 0 || completed > 0 ? '<br />' : '';

                    if (running > 0) {
                        statusStr = statusStr + '<span class="label label-running">Running: ' + running + '</span>';
                    }
                    if (completed > 0) {
                        statusStr = statusStr + ' <span class="label label-completed">Completed: ' + completed + '</span>';
                    }

                    failures = _.sortByOrder(failures, ['order']);

                    _.forEach(failures, function (f) {
                        failStr = failStr + '<span class="label label-' + f.status.toLowerCase() + '">' + _.capitalize(f.status.toLowerCase()) + ': ' + f.count + '</span> ';
                    });
                    return d.title + ' ' + d.version + '<br />' + statusStr + failStr;
                }),
            cellWidth = 50 * scale,
            cellHeight = 50 * scale,
            enableZoom = typeof $scope.mode !== 'undefined' ? $scope.mode === 'zoom' : true,
            enableTooltip = typeof $scope.mode !== 'undefined' ? $scope.mode === 'tooltip' : false,
            enableReveal = typeof $scope.reveal !== 'undefined' ? $scope.reveal : true,
            user = userService.getUserCreds(),
            gridData = [],
            width = $('.grid-chart').width(),
            height = (Math.ceil(width / cellWidth) * cellHeight),
            cols = 0,
            rows = 0,
            cellFontLg = .4,
            cellFontSm = .3;
        
        vm.loading = true;
        vm.pauseReason = '';
        vm.dataValues = [];
        vm.gridClass = function () {
            return $scope.icons === true ? 'icons' : '';
        };

        $scope.$watchCollection('vm.dataValues', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            height = (Math.ceil(newValue.length / (Math.floor(width / cellWidth))) * cellHeight);
            if (enableZoom) {
                height = height * 6;
            }
            d3.select('.grid-chart-container svg').attr('height', height);
            d3.select('.overlay').attr('height', height);
        });

        var getDataValues = function (data) {
            gridData = [];
            vm.dataValues = [];
            if (data.data) {
                var dataType = data.data.toString().split(',')[0];
                if (dataType === 'JobType') {
                    vm.dataValues = _.sortByOrder(_.values(data.data), ['name'], ['asc']);
                    // associate JobType with JobTypeStatus
                    _.forEach(vm.dataValues, function (val) {
                        val.status = _.find(data.status, 'job_type.id', val.id);
                    });
                    vm.dataValues = _.sortByOrder(_.values(data.data), ['status.has_running', 'status.description', 'name'], ['asc', 'asc', 'asc']);
                } else if (dataType === 'Node') {
                    vm.dataValues = _.values(data.data);
                    //vm.dataValues = _.sortByOrder(_.values(data.data), ['hostname'], ['asc']);
                    // associate Node with NodeStatus
                    _.forEach(vm.dataValues, function (val) {
                        val.status = _.find(data.status, 'node.id', val.id);
                    });
                    //vm.dataValues = _.sortByOrder(vm.dataValues, ['hostname'], ['asc']); // sort by hostName asc
                } else {
                    vm.dataValues = data.data;
                }

                cols = $scope.columns ? $scope.columns : Math.floor(width / cellWidth);
                rows = $scope.rows ? $scope.rows : Math.ceil(vm.dataValues.length / cols);

                d3.range(rows).map(function (row) {
                    d3.range(cols).map(function (col) {
                        if (col <= vm.dataValues.length - 1) {
                            var dataObj = vm.dataValues[(cols * row) + col];
                            if (dataObj) {
                                dataObj.coords = [col * cellHeight, row * cellWidth];
                                gridData.push(dataObj);
                            }
                        }
                    });
                });

                update();
            }
        };

        var revealData = function () {
            d3.selectAll('.cell-text')
                .style('display', 'none');
            d3.selectAll('.cell-text-detail')
                .style('display', 'block');
            d3.selectAll('.cell-pause-resume-icon')
                .style('display', 'block');
        };

        var hideData = function () {
            d3.selectAll('.cell-text')
                .style('display', 'block');
            d3.selectAll('.cell-text-detail')
                .style('display', 'none');
            d3.selectAll('.cell-pause-resume-icon')
                .style('display', 'none');
        };

        var initialize = function (data) {
            cols = $scope.columns ? $scope.columns : Math.floor(width / cellWidth);
            rows = $scope.rows ? $scope.rows : Math.ceil(vm.dataValues.length / cols);

            var tickValues = Array.apply(null, {length: rows}).map(Number.call, Number);

            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 6])
                //.center([0, 0])
                .on('zoom', zoomed);

            if (enableZoom) {
                svg = d3.select('.grid-chart').append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .call(zoom)
                    .append('g');
            } else if (enableTooltip) {
                svg = d3.select('.grid-chart').append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g')
                    .call(tip);
            } else {
                svg = d3.select('.grid-chart').append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .append('g');
            }

            svg.append('rect')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height);

            if (vm.showAxes) {
                var y = d3.scale.linear()
                    .domain([0, rows])
                    .range([0, height-10]);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickValues(tickValues);

                svg.attr('transform', 'translate(' + 25 + ',' + 0 + ')')
                    .append('g')
                    .attr('class', 'y axis')
                    .attr('transform', 'translate(' + 0 + ',' + cellHeight / 2 + ')')
                    .call(yAxis);
            }

            getDataValues(data);

            function zoomed() {
                var s = d3.event.scale;

                if (enableReveal) {
                    if (s > 3) {
                        revealData();
                    } else {
                        hideData();
                    }
                }
                if (s === 1) {
                    if ($scope.showAxes) {
                        zoom.translate([25, 0]);
                    } else {
                        zoom.translate([0, 0]);
                    }
                }
                svg.attr('transform', 'translate(' + zoom.translate() + ')scale(' + d3.event.scale + ')');
            }

            vm.loading = false;
        };

        var dragOffsetX = 0,
            dragOffsetY = 0,
            clickOffsetX = 0,
            clickOffsetY = 0;

        var drag = d3.behavior.drag()
            .on('dragstart', function () {
                // track offsetX and offsetY to distinguish between drag and click
                dragOffsetX = d3.event.sourceEvent.layerX;
                dragOffsetY = d3.event.sourceEvent.layerY;
            });

        var getCellFill = function (d) {
            if (d && d.status) {
                return d.status.getCellFill();
            }
            return 'none';
        };

        var getCellText = function (d) {
            if (d) {
                return d.getCellText();
            }
        };

        var getCellActivity = function (d) {
            if (d && d.status) {
                if (d.toString() === 'JobType') {
                    return d.status.getCellActivity();
                }
            }
        };

        var getCellPauseResume = function (d) {
            if (d && d.status) {
                return d.status.getCellPauseResume();
            }
        };

        var getCellActivityTotal = function (d) {
            if (d && d.status) {
                return d.status.getCellActivityTotal();
            }
        };

        var getCellTitle = function (d) {
            if (d) {
                return d.getCellTitle();
            }
        };

        var getCellError = function (d) {
            if (d && d.status) {
                return d.status.getCellError();
            }
            return 'Failed: Unavailable';
        };

        var getCellTotal = function (d) {
            if (d && d.status) {
                return d.status.getCellTotal();
            }
            return 'Completed: Unavailable';
        };

        var getCellStatus = function (d) {
            if (d && d.status) {
                if (d.toString() === 'Node') {
                    return d.status.getCellStatus();
                }
            }
            return 'Status Unavailable';
        };

        var getCellJobs = function (d) {
            if (d && d.status) {
                if (d.toString() === 'Node') {
                    return d.status.getCellJobs();
                }
            }
        };

        var getCellFailures = function (d) {
            if (d && d.status) {
                if (d.toString() === 'JobType') {
                    return d.status.getCellFailures();
                }
            }
        };

        var cellClickHandler = function (target) {
            // track offsetX and offsetY to distinguish between drag and click
            clickOffsetX = d3.event.layerX;
            clickOffsetY = d3.event.layerY;
            if (dragOffsetX === clickOffsetX && dragOffsetY === clickOffsetY) {
                // offsets are the same; no dragging occurred; process as click event
                $scope.$apply(function () {
                    if (target.toString() === 'JobType') {
                        $location.path('/jobs').search('job_type_id', target.id).search('status', target.status.has_running.status);
                    } else if (target.toString() === 'Node') {
                        $location.path('/nodes/' + target.id);
                    }
                });
            }
        };

        var update = function () {
            var elem = $('.cell-activity-icon');
            TweenMax.to(elem, 1, {
                rotation: 360,
                transformOrigin: '50% 50%',
                repeat: -1,
                ease: Linear.easeNone
            });

            // DATA JOIN
            // Join new data with old elements, if any.
            if (enableTooltip) {
                var containerGroup = svg.selectAll('.cell-group')
                    .data(gridData, function (d) { return d.coords; })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .on('click', tip.hide);
            } else {
                var containerGroup = svg.selectAll('.cell-group')
                    .data(gridData, function (d) { return d.coords; });
            }

            // UPDATE
            // Update old elements as needed.
            containerGroup.selectAll('.stop1')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 0) {
                        if (failures.length === 1) {
                            return '100%';
                        }
                        return '0%';
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 0) {
                        return failures[0] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[0] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });

            containerGroup.selectAll('.stop2')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 0) {
                        if (failures.length === 3) {
                            return '50%';
                        } else if (failures.length === 2) {
                            return '100%';
                        }
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 1) {
                        return failures[1] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[1] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });

            containerGroup.selectAll('.stop3')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 2) {
                        if (failures.length === 3) {
                            return '100%';
                        }
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 2) {
                        return failures[2] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[2] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });

            containerGroup.selectAll('.cell')
                .data(gridData, function (d) { return d.coords; })
                .transition()
                .duration(750)
                .style('stroke', function (d) {
                    return d ? '#fff' : 'none';
                })
                .style('fill', function (d) {
                    if (d.toString() === 'Node') {
                        return getCellFill(d);
                    }
                });

            var cg = containerGroup.selectAll('.cell-gradient');

            containerGroup.selectAll('.cell-text')
                .data(gridData, function (d) { return d.coords; })
                .html(function (d) {
                    return getCellText(d);
                })
                .attr('y', function (d) {
                    if (d.toString() === 'JobType' && getCellActivityTotal(d) > 0) {
                        return cellHeight / 2;
                    }
                    return (cellHeight / 2) + 10;
                });

            containerGroup.selectAll('.cell-total-active')
                .data(gridData, function (d) { return d.coords; })
                .text(function (d) {
                    if (d.toString() === 'JobType') {
                        return getCellActivityTotal(d);
                    }
                });

            containerGroup.selectAll('.cell-pause-resume-icon')
                .data(gridData, function (d) { return d.coords; })
                .html(function (d) {
                    return getCellPauseResume(d);
                });

            containerGroup.selectAll('.cell-activity-icon')
                .data(gridData, function (d) { return d.coords; })
                .html(function (d) {
                    return getCellActivity(d);
                });

            containerGroup.selectAll('.cell-title')
                .data(gridData, function (d) { return d.coords; })
                .html(function (d) {
                    return getCellTitle(d);
                });

            containerGroup.selectAll('.cell-error')
                .data(gridData, function (d) { return d.coords; })
                .text(function (d) {
                    return getCellError(d, true);
                });

            containerGroup.selectAll('.cell-total')
                .data(gridData, function (d) { return d.coords; })
                .text(function (d) {
                    return getCellTotal(d);
                });

            containerGroup.selectAll('.cell-status')
                .data(gridData, function (d) { return d.coords; })
                .text(function (d) {
                    return getCellStatus(d);
                });

            containerGroup.selectAll('.cell-jobs')
                .data(gridData, function (d) { return d.coords; })
                .html(function (d) {
                    return getCellJobs(d);
                });

            containerGroup.selectAll('.cell-overlay')
                .data(gridData, function (d) { return d.coords; })
                .on('click', function (target) {
                    cellClickHandler(target);
                });

            // ENTER
            // Create new elements as needed.
            var cellGroup = containerGroup.enter()
                .append('g')
                .attr('class', 'cell-group');

            var defs = cellGroup.append('defs');
            var gradient = defs.append('linearGradient')
                .attr('id', function (d) {
                    return d.name;
                })
                .attr('class', 'cell-gradient')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', 1);
            gradient.append('stop')
                .attr('class', 'stop1')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 0) {
                        if (failures.length === 1) {
                            return '100%';
                        }
                        return '0%';
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 0) {
                        return failures[0] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[0] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });
            gradient.append('stop')
                .attr('class', 'stop2')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 1) {
                        if (failures.length === 3) {
                            return '50%';
                        } else if (failures.length === 2) {
                            return '100%';
                        }
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 1) {
                        return failures[1] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[1] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });
            gradient.append('stop')
                .attr('class', 'stop3')
                .attr('offset', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 2) {
                        if (failures.length === 3) {
                            return '100%';
                        }
                    }
                    return '0%';
                })
                .attr('stop-color', function (d) {
                    var failures = getCellFailures(d);
                    if (failures && failures.length > 2) {
                        return failures[2] === 'SYSTEM' ? scaleConfig.colors.failure_system : failures[2] === 'DATA' ? scaleConfig.colors.failure_data : scaleConfig.colors.failure_algorithm;
                    }
                    return getCellFill(d);
                });

            cellGroup.append('rect')
                .attr('class', 'cell')
                .attr('width', cellWidth)
                .attr('height', cellHeight)
                .style('fill', function (d) {
                    if (d.toString() === 'Node') {
                        return getCellFill(d);
                    }
                })
                .attr('fill', function (d) {
                    if (d.toString() === 'JobType') {
                        return 'url(#' + d.name + ')';
                    }
                })
                .style('stroke', function (d) {
                    return d ? '#fff' : 'none';
                })
                .transition()
                .duration(750);

            cellGroup.append('text')
                .attr('class', 'cell-text')
                .html(function (d) {
                    return getCellText(d);
                })
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', function (d) {
                    if (d.toString() === 'JobType') {
                        if (getCellActivityTotal(d) > 0) {
                            return cellHeight / 2;
                        }
                        return (cellHeight / 2) + 10;
                    }
                    return cellHeight / 2;
                })
                .style('font-size', function (d) {
                    if (d.toString() === 'Node') {
                        return $scope.scale * 8 + 'px';
                    }
                    return '';
                })
                .style('display', enableReveal ? 'block' : 'none');

            cellGroup.append('text')
                .attr('class', 'cell-total-active')
                .text(function (d) {
                    if (d.toString() === 'JobType') {
                        return getCellActivityTotal(d);
                    }
                })
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', cellHeight - 5)
                .style('display', enableReveal ? 'block' : 'none');

            cellGroup.append('g')
                .attr('class', 'cell-activity')
                .append('text')
                .attr('class', 'cell-activity-icon')
                .attr('font-size', 11)
                .html(function (d) {
                    return getCellActivity(d);
                })
                .attr('text-anchor', 'end')
                .attr('x', cellWidth - 2)
                .attr('y', 13);

            var detail = cellGroup.append('text')
                .attr('class', 'cell-text-detail')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight *.15)) // 15% from top of cell
                .attr('dy', 0)
                .style('display', enableReveal ? 'none' : 'block');

            detail.append('tspan')
                .attr('class', 'cell-title')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight * .15)) // 15% from top of cell
                .attr('dy', 0)
                .style('font-size', cellFontSm * scale + 'em')
                .html(function (d) {
                    return getCellTitle(d);
                })
                .call(wrap);

            detail.append('tspan')
                .attr('class', 'cell-error')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight *.3)) // 30% from top of cell
                .attr('dy', 0)
                .style('font-size', cellFontSm * scale + 'em')
                .text(function (d) {
                    return getCellError(d);
                })
                .call(wrap);

            detail.append('tspan')
                .attr('class', 'cell-total')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight *.4)) // 40% from top of cell
                .attr('dy', 0)
                .style('font-size', cellFontSm * scale + 'em')
                .text(function (d) {
                    return getCellTotal(d);
                })
                .call(wrap);

            detail.append('tspan')
                .attr('class', 'cell-status')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight * .55)) // 55% from top of cell
                .attr('dy', 0)
                .style('font-size', cellFontLg * scale + 'em')
                .text(function (d) {
                    return getCellStatus(d);
                });

            detail.append('tspan')
                .attr('class', 'cell-jobs')
                .attr('text-anchor', 'middle')
                .attr('x', cellWidth / 2)
                .attr('y', Math.floor(cellHeight * .75)) // 75% from top of cell
                .attr('dy', 0)
                .style('font-size', cellFontSm * scale + 'em')
                .html(function (d) {
                    return getCellJobs(d);
                })
                .call(wrap);

            cellGroup.append('rect')
                .attr('class', 'cell-overlay')
                .attr('width', cellWidth)
                .attr('height', cellHeight)
                .style('fill', '#fff')
                .on('mouseover', function () {
                    d3.select(this)
                        .style('fill-opacity', '0.25');
                })
                .on('mouseout', function () {
                    d3.select(this)
                        .style('fill-opacity', '0');
                })
                .on('click', function (d) {
                    cellClickHandler(d);
                })
                .call(drag);

            if (user && user.is_admin) {
                cellGroup.append('text')
                    .attr('class', 'cell-pause-resume-icon')
                    .html(function (d) {
                        return getCellPauseResume(d);
                    })
                    .attr('text-anchor', 'start')
                    .attr('x', enableReveal ? 2 : 5)
                    .attr('y', enableReveal ? $scope.scale * 8 : 20)
                    .style('display', enableReveal ? 'none' : 'block')
                    .style('font-size', enableReveal ? $scope.scale * 7 + 'px' : '1.3em')
                    .on('mouseover', function () {
                        d3.select(this)
                            .style('cursor', 'pointer')
                            .style('fill', scaleConfig.colors.chart_blue);
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                            .style('fill', 'white');
                    });
            }

            // ENTER + UPDATE
            // Appending to the enter selection expands the update selection to include
            // entering elements; so, operations on the update selection after appending to
            // the enter selection will apply to both entering and updating nodes.
            containerGroup.transition()
                .duration(750)
                .attr('transform', function (d) {
                    return 'translate(' + d.coords + ')';
                });

            var updateCellFill = function () {
                containerGroup.selectAll('.cell')
                    .transition()
                    .duration(250)
                    .style('stroke', function (d) {
                        return d ? '#fff' : 'none';
                    })
                    .style('fill', function (d) {
                        return getCellFill(d);
                    });
            };

            var updatePauseResume = function () {
                containerGroup.selectAll('.cell-pause-resume-icon')
                    .html(function (d) {
                        return getCellPauseResume(d);
                    });
            };

            var updateCellStatus = function () {
                containerGroup.selectAll('.cell-status')
                    .text(function (d) {
                        return getCellStatus(d);
                    });
            };

            // EXIT
            // Remove old elements as needed.
            containerGroup.exit()
                .attr('class', 'cell-exit')
                .transition()
                .duration(750)
                .attr('transform', 'translate(0,0)')
                .remove();

            function wrap (text, width) {
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1,
                        y = text.attr('y'),
                        dy = parseFloat(text.attr('dy')),
                        tspan = text.text(null).append('tspan').attr('x', cellWidth / 2).attr('y', y).attr('dy', dy + 'em');
                    while (word = words.pop()) {
                        if (word !== 'undefined') {
                            line.push(word);
                            tspan.text(line.join(' '));
                            if (tspan.node().getComputedTextLength() > (cellWidth - 10)) {
                                line.pop();
                                tspan.text(line.join(' '));
                                line = [word];
                                tspan = text.append('tspan').attr('x', cellWidth / 2).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                            }
                        }
                    }
                });
            }
        };

        $scope.$watch('data', function (data) {
            if (_.keys(data).length > 0) {
                $('.grid-chart').empty();
                initialize(data);
            }
        });

        $scope.$on('redrawGrid', function (event, data) {
            getDataValues(data);
        });
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').directive('aisGridChart', function () {
        return {
            controller: 'aisGridChartController',
            controllerAs: 'vm',
            templateUrl: 'modules/charts/grid/gridChartTemplate.html',
            restrict: 'E',
            scope: {
                data: '=',
                icons: '=', // indicates whether cell-text is entirely made up of icons
                scale: '=', // multiplier to increase cell size
                reveal: '=', // if true, less data will show when zoomed out
                mode: '@', // valid values are zoom or tooltip
                columns: '=',
                rows: '=',
                showAxes: '='
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisHealthController', ['$scope', function ($scope) {
        var vm = this,
            initialized = false;

        var initialize = function () {
            initialized = true;
            var scale = $scope.scale || 1;
            vm.donutSize = 275 * scale;
            vm.donutWidth = 25 * scale;
        };

        $scope.$watch('data', function (data) {
            if (data) {
                if (_.keys(data).length > 0) {
                    if (!initialized) {
                        initialize();
                    }
                }
            }
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').directive('aisHealth', function () {
        return {
            controller: 'aisHealthController',
            controllerAs: 'vm',
            templateUrl: 'modules/charts/health/healthTemplate.html',
            restrict: 'E',
            scope: {
                name: '=',
                data: '=',
                scale: '=',
                errorLabel: '=',
                type: '='
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisJobLoadController', ['$scope', 'scaleConfig', 'scaleService', 'loadService', function ($scope, scaleConfig, scaleService, loadService) {
        var vm = this,
            chart = null,
            colArr = [],
            xArr = [];

        vm.filterValue = 1;
        vm.filterDuration = 'w';
        vm.filterDurations = ['M', 'w', 'd'];
        vm.zoomEnabled = false;
        vm.zoomClass = 'btn-default';
        vm.zoomText = 'Enable Zoom';
        vm.jobLoadData = {};
        vm.loadingJobLoad = true;
        vm.jobLoadError = null;
        vm.jobLoadErrorStatus = null;
        vm.total = 0;
        vm.chartStyle = '';

        var jobLoadParams = {
            started: moment.utc().subtract(vm.filterValue, vm.filterDuration).startOf('d').toDate(), ended: moment.utc().endOf('d').toDate(), job_type_id: null, job_type_name: null, job_type_category: null, url: null
        };

        vm.toggleZoom = function () {
            vm.zoomEnabled = !vm.zoomEnabled;
            chart.zoom.enable(vm.zoomEnabled);
            if (vm.zoomEnabled) {
                vm.zoomClass = 'btn-primary';
                vm.zoomText = 'Disable Zoom';
            } else {
                vm.zoomClass = 'btn-default';
                vm.zoomText = 'Enable Zoom';
            }
        };

        var initChart = function () {
            xArr = [];
            
            xArr = _.pluck(vm.jobLoadData.results, 'time');
            _.forEach(xArr, function (d, i) {
                xArr[i] = moment.utc(d).toDate();
            });
            xArr.unshift('x');

            var pendingArr = _.pluck(vm.jobLoadData.results, 'pending_count'),
                queuedArr = _.pluck(vm.jobLoadData.results, 'queued_count'),
                runningArr = _.pluck(vm.jobLoadData.results, 'running_count');

            pendingArr.unshift('Pending');
            queuedArr.unshift('Queued');
            runningArr.unshift('Running');

            // add to colArr
            colArr = [xArr, pendingArr, queuedArr, runningArr];

            var types = {},
                type = {},
                groups = [];

            _.forEach(colArr, function(col){
                type = {};
                if (col[0] !== 'x') {
                    type[col[0]] = 'area';
                    groups.push(col[0]);
                }
                angular.extend(types, type);
            });

            if (chart) {
                chart.flush();
            }
            // chart config
            chart = c3.generate({
                bindto: '#job-load',
                data: {
                    x: 'x',
                    columns: colArr,
                    types: types,
                    groups: [groups],
                    colors: {
                        Pending: scaleConfig.colors.chart_pink,
                        Queued: scaleConfig.colors.chart_purple,
                        Running: scaleConfig.colors.chart_blue
                    }
                },
                transition: {
                    duration: 700
                },
                tooltip: {
                    format: {
                        title: function (x) {
                            return moment.utc(x).startOf('h').format(scaleConfig.dateFormats.day_second);
                        }
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: function (d) {
                                return moment.utc(d).format(scaleConfig.dateFormats.day);
                            }
                        }
                    }
                }
            });
            vm.loadingJobLoad = false;
        };

        var getJobLoad = function (showPageLoad) {
            if (showPageLoad) {
                $scope.$parent.loading = true;
            } else {
                vm.loadingJobLoad = true;
            }
            jobLoadParams.started = moment.utc().subtract(vm.filterValue, vm.filterDuration).startOf('d').toDate();
            jobLoadParams.ended = moment.utc(jobLoadParams.started).add(1, vm.filterDuration).endOf('d').toDate();
            jobLoadParams.page_size = 1000;

            loadService.getJobLoad(jobLoadParams).then(null, null, function (result) {
                if (result.$resolved) {
                    vm.jobLoadData = result;
                    initChart();
                } else {
                    if (result.statusText && result.statusText !== '') {
                        vm.jobLoadErrorStatus = result.statusText;
                    }
                    vm.jobLoadError = 'Unable to retrieve job load.';
                }
                if (showPageLoad) {
                    $scope.$parent.loading = false;
                } else {
                    vm.loadingJobLoad = false;
                }
            });
        };

        vm.updateJobLoadRange = function (action) {
            if (action === 'older') {
                vm.filterValue++;
            } else if (action === 'newer') {
                if (vm.filterValue > 1) {
                    vm.filterValue--;
                }
            } else if (action === 'today') {
                vm.filterValue = 1;
            }
            getJobLoad(true);
        };

        $scope.$watch('vm.filterValue', function (value) {
            var $jobLoadNewer = $('.job-load-newer'),
                $jobLoadToday = $('.job-load-today');

            if (value > 1) {
                $jobLoadNewer.removeAttr('disabled');
                $jobLoadToday.removeAttr('disabled');
            } else {
                $jobLoadNewer.attr('disabled', 'disabled');
                $jobLoadToday.attr('disabled', 'disabled');
            }
        });


        if ($scope.autoHeight) {
            // set chart height
            angular.element(document).ready(function () {
                // set container heights equal to available page height
                var viewport = scaleService.getViewportSize(),
                    offset = scaleConfig.headerOffset,
                    headerOffset = $('.job-load-header').height(),
                    legendOffset = $('.job-load-legend-label').height(),
                    filterOffset = $('.job-load-filter').outerHeight(true),
                    chartMaxHeight = viewport.height - offset - headerOffset - legendOffset - filterOffset - 5;

                vm.chartStyle = 'height: ' + chartMaxHeight + 'px; max-height: ' + chartMaxHeight + 'px;';
                getJobLoad();
            });
        } else {
            getJobLoad();
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').directive('aisJobLoad', function () {
        return {
            controller: 'aisJobLoadController',
            controllerAs: 'vm',
            templateUrl: 'modules/charts/jobLoad/jobLoadTemplate.html',
            restrict: 'E',
            scope: {
                showFilter: '=', // show time range filter UI
                cullLegend: '=', // only show job types in legend whose value is > 0
                hideTitle: '=',
                autoHeight: '='
            }
        };
    });
})();

'use strict';

angular.module('scaleApp').controller('aisRadialPercentageController', ['$scope', '$element', 'scaleConfig', function ($scope, $element, scaleConfig) {
    var isInitialized = false,
        foreground = '',
        text = '',
        arcTween = '',
        textTween = '';

    var getForeground = function () {
        var value = parseFloat($scope.percentage);
        if (value >= 75) {
            return scaleConfig.colors.chart_green;
        } else if (value < 75 && value >= 50) {
            return scaleConfig.colors.chart_yellow;
        } else {
            return scaleConfig.colors.chart_red;
        }
    };

    var initialize = function () {
        // handle input either .83 or 83
        var percentage = $scope.percentage || 0;
        if (percentage > 1) {
            percentage /= 100;
        }

        // size the chart to the parent container. It's square, so take the
        // smaller of width/height
        var size = $element[0].parentNode.clientWidth;
        if ($element[0].parentNode.clientHeight < size) {
            size = $element[0].parentNode.clientHeight;
        }
        
        var formatPercent = d3.format('.0%');

        var arc = d3.svg.arc()
            .startAngle(0)
            .outerRadius(size * 0.95 / 2)
            .innerRadius(size * 0.80 / 2);

        var svg = d3.select($element[0]).append('svg').attr({
            width: size,
            height: size
        }).append('g').attr({
            'transform': 'translate(' + size / 2 + ',' + size / 2 + ')',
            'class': 'aisRadial'
        });

        var meter = svg.append('g').attr({
            'transform': 'rotate(180)'
        });
        meter.append('path')
            .datum({
                endAngle: (2 * Math.PI),
            })
            .attr('class', 'background')
            .attr('d', arc);

        foreground = meter.append('path')
            .datum({
                endAngle: 0
            })
            .attr({
                'd': arc
            })
            .style('fill', function () {
                return getForeground();
            });

        text = svg.append('text')
            .datum({
                percentage: 0
            })
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em');


        textTween = function (transition, newPercentage) {
            transition.attrTween('text', function (d) {
                if (typeof d === 'undefined') {
                    d = 0;
                }
                var i = d3.interpolate(d.percentage, newPercentage);
                return function (t) {
                    d.percentage = i(t);
                    text.text(formatPercent(i(t)));
                    return t;
                }
            });
        };
        arcTween = function (transition, newAngle) {
            transition.attrTween('d', function (d) {
                var i = d3.interpolate(d.endAngle, newAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arc(d);
                };
            });
        };

        isInitialized = true;

        redraw(percentage);
    };

    var redraw = function (value) {
        if (isInitialized) {
            var percentage = value;
            if (percentage > 1) {
                percentage /= 100;
            }

            foreground.transition().duration(1000)
                .style('fill', function () {
                    return getForeground();
                })
                .call(arcTween, (Math.PI * 2) * percentage);
            text.transition().duration(1000).call(textTween, percentage);
        }
    };

    $scope.$watch('percentage', function (value) {
        if (value && !isInitialized) {
            initialize();
        } else {
            redraw(value);
        }
    })
}]);

'use strict';

angular.module('scaleApp').directive('aisRadialPercentage', function () {
    return {
        controller: 'aisRadialPercentageController',
        restrict: 'E',
        scope: {
            percentage: '@'
        }
    };
});

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisTimelineDirectiveController', ['$scope', '$element', 'scaleConfig', function ($scope, $element, scaleConfig) {
        var vm = this,
            gantt = null,
            taskNames = [];

        $element[0].onresize = function () {
            console.log('element resize');
        };

        var initialize = function () {
            $scope.$watch('tasks', function (value) {
                drawTimeline();
            });
        };

        var drawTimeline = function () {
            if ($scope.tasks && $scope.tasks.length > 0) {
                $scope.tasks.sort(function (a, b) {
                    return a[$scope.ended] - b[$scope.ended];
                });

                taskNames = _($scope.tasks).pluck('taskName').uniq().value();
                var height = taskNames.length * 30 + 20;

                var width = $element[0].clientWidth;
                if (!width || width === 0) { width = 600; }


                $scope.tasks.sort(function (a, b) {
                    return a[$scope.started] - b[$scope.started];
                });
                var minDate = $scope.tasks[0][$scope.started];
                var maxDate = $scope.tasks[$scope.tasks.length - 1][$scope.ended];
                var daysDiff = moment.utc(maxDate).diff(moment.utc(minDate),'days');
                var format = '%H:%M:%S.%m';
                if (daysDiff > 0) {
                    format = "%m/%d/%y %H:%M";
                }

                gantt = d3.gantt().renderTo("#ais-timeline").taskTypes(taskNames).taskStatus(scaleConfig.taskStatusStyles).tickFormat(format).begin($scope.started).ended($scope.ended).height(height).width(width);

                gantt.timeDomainMode("fit");

                gantt($scope.tasks);

            }
        };

        vm.formatDate = function (date) {
            if (date) {
                return moment.utc(date).toISOString();
            }
            else {
                return date;
            }
        };
        initialize();

    }]).directive('aisTimeline', function () {
        return {
            controller: 'aisTimelineDirectiveController',
            controllerAs: 'vm',
            templateUrl: 'modules/charts/timeline/timelineDirectiveTemplate.html',
            restrict: 'E',
            scope: {
                tasks: '=',
                started: '=',
                ended: '='
            }
        };

    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').directive('aisGridPagination', function () {
        return {
            templateUrl: 'modules/common/directives/aisGridPaginationTemplate.html',
            restrict: 'E'
        };
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').directive('aisMultiselect', function () {
        return {
            restrict: 'A',
            require: '^ngModel',
            scope: {
                multiselectDataProvider: '=',
                enableFiltering: '=',
                maxHeight: '=',
                numberDisplayed: '=',
                includeSelectAllOption: '=',
                nonSelectedText: '=',
                ngModel: '='
            },
            link: function(scope, element, attributes) {
                element = $(element[0]);

                element.multiselect({
                    enableFiltering: scope.enableFiltering,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: scope.maxHeight || 300,
                    numberDisplayed: scope.numberDisplayed || 3,
                    includeSelectAllOption: scope.includeSelectAllOption,
                    nonSelectedText: scope.nonSelectedText || 'None Selected',
                    onChange: function (optionElement, checked) {
                        scope.$apply(function () {
                            scope.ngModel = element.val();
                        });
                    }
                });

                scope.$watchCollection('multiselectDataProvider', function (newValue, oldValue) {
                    if (angular.equals(newValue, oldValue)) {
                        return;
                    }
                    element.multiselect('dataprovider', newValue);
                });

                /*
                // Watch for any changes to the length of our select element
                scope.$watch(function () {
                    return element[0];
                }, function (newValue) {
                    debugger;
                    //element.multiselect('setOptions', element[0]);
                    //element.multiselect('rebuild');
                }, true);

                // Watch for any changes from outside the directive and refresh
                scope.$watch(attributes.ngModel, function () {
                    element.multiselect('refresh');
                });
                */
            }
        };
    })
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('gaugeFactory', ['scaleConfig', function (scaleConfig) {
        var Gauge = function (placeholderName, configuration)
        {
            this.placeholderName = placeholderName;

            var self = this; // for internal d3 functions

            this.configure = function(configuration)
            {
                this.config = configuration;

                this.config.size = this.config.size * 0.9;

                this.config.radius = this.config.size * 0.97 / 2;
                this.config.cx = this.config.size / 2;
                this.config.cy = this.config.size / 2;

                this.config.min = undefined != configuration.min ? configuration.min : 0;
                this.config.max = undefined != configuration.max ? configuration.max : 100;
                this.config.range = this.config.max - this.config.min;

                this.config.majorTicks = configuration.majorTicks || 5;
                this.config.minorTicks = configuration.minorTicks || 2;

                this.config.greenColor 	= configuration.greenColor || '#8fca0e';
                this.config.yellowColor = configuration.yellowColor || '#ffc317';
                this.config.redColor 	= configuration.redColor || '#f54d36';
                this.config.grayColor   = configuration.grayColor || '#aaa';

                this.config.transitionDuration = configuration.transitionDuration || 500;
            };

            this.render = function()
            {
                this.body = d3.select('#' + this.placeholderName)
                    .append('svg:svg')
                    .attr('class', 'gauge')
                    .attr('width', this.config.size)
                    .attr('height', this.config.size);

                this.body.append('svg:circle')
                    .attr('class', 'outer-circle')
                    .attr('cx', this.config.cx)
                    .attr('cy', this.config.cy)
                    .attr('r', this.config.radius)
                    .style('fill', '#ccc');
                /*.style('stroke', '#000')
                 .style('stroke-width', '0.5px');*/

                this.body.append('svg:circle')
                    .attr('cx', this.config.cx)
                    .attr('cy', this.config.cy)
                    .attr('r', 0.9 * this.config.radius)
                    .style('fill', '#fff')
                    .style('stroke', '#e0e0e0')
                    .style('stroke-width', '2px');

                for (var greenIdx in this.config.greenZones)
                {
                    this.drawBand(this.config.greenZones[greenIdx].from, this.config.greenZones[greenIdx].to, self.config.greenColor);
                }

                for (var yellowIdx in this.config.yellowZones)
                {
                    this.drawBand(this.config.yellowZones[yellowIdx].from, this.config.yellowZones[yellowIdx].to, self.config.yellowColor);
                }

                for (var redIdx in this.config.redZones)
                {
                    this.drawBand(this.config.redZones[redIdx].from, this.config.redZones[redIdx].to, self.config.redColor);
                }

                var fontSize = 0;

                if (undefined != this.config.label)
                {
                    fontSize = Math.round(this.config.size / 9);
                    this.body.append('svg:text')
                        .attr('x', this.config.cx)
                        .attr('y', this.config.cy / 2 + fontSize / 2)
                        .attr('dy', fontSize / 2)
                        .attr('text-anchor', 'middle')
                        .text(this.config.label)
                        .style('font-size', fontSize + 'px')
                        .style('fill', '#333')
                        .style('stroke-width', '0px');
                }

                fontSize = Math.round(this.config.size / 16);
                var majorDelta = this.config.range / (this.config.majorTicks - 1);
                for (var major = this.config.min; major <= this.config.max; major += majorDelta)
                {
                    var minorDelta = majorDelta / this.config.minorTicks,
                        point1 = 0,
                        point2 = 0;
                    for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta)
                    {
                        point1 = this.valueToPoint(minor, 0.75);
                        point2 = this.valueToPoint(minor, 0.85);

                        this.body.append('svg:line')
                            .attr('x1', point1.x)
                            .attr('y1', point1.y)
                            .attr('x2', point2.x)
                            .attr('y2', point2.y)
                            .style('stroke', '#666')
                            .style('stroke-width', '1px');
                    }

                    point1 = this.valueToPoint(major, 0.7);
                    point2 = this.valueToPoint(major, 0.85);

                    this.body.append('svg:line')
                        .attr('x1', point1.x)
                        .attr('y1', point1.y)
                        .attr('x2', point2.x)
                        .attr('y2', point2.y)
                        .style('stroke', '#333')
                        .style('stroke-width', '2px');

                    if (major == this.config.min || major == this.config.max)
                    {
                        var point = this.valueToPoint(major, 0.63);

                        this.body.append('svg:text')
                            .attr('x', point.x)
                            .attr('y', point.y)
                            .attr('dy', fontSize / 3)
                            .attr('text-anchor', major == this.config.min ? 'start' : 'end')
                            .text(major)
                            .style('font-size', fontSize + 'px')
                            .style('fill', '#333')
                            .style('stroke-width', '0px');
                    }
                }

                var pointerContainer = this.body.append('svg:g').attr('class', 'pointerContainer');

                var midValue = (this.config.min + this.config.max) / 2;

                var pointerPath = this.buildPointerPath(midValue);

                var pointerLine = d3.svg.line()
                    .x(function(d) { return d.x })
                    .y(function(d) { return d.y })
                    .interpolate('basis');

                pointerContainer.selectAll('path')
                    .data([pointerPath])
                    .enter()
                    .append('svg:path')
                    .attr('d', pointerLine)
                    .style('fill', '#888');

                pointerContainer.append('svg:circle')
                    .attr('cx', this.config.cx)
                    .attr('cy', this.config.cy)
                    .attr('r', 0.07 * this.config.radius)
                    .style('fill', '#888');

                fontSize = Math.round(this.config.size / 10);
                pointerContainer.selectAll('text')
                    .data([midValue])
                    .enter()
                    .append('svg:text')
                    .attr('x', this.config.cx)
                    .attr('y', this.config.size - this.config.cy / 4 - fontSize)
                    .attr('dy', fontSize / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', fontSize + 'px')
                    .style('fill', '#000')
                    .style('stroke-width', '0px');

                this.redraw(this.config.min, 0);
            };

            this.buildPointerPath = function(value)
            {
                var delta = this.config.range / 13;

                var head = valueToPoint(value, 0.85);
                var head1 = valueToPoint(value - delta, 0.12);
                var head2 = valueToPoint(value + delta, 0.12);

                var tailValue = value - (this.config.range * (1/(270/360)) / 2);
                var tail = valueToPoint(tailValue, 0.28);
                var tail1 = valueToPoint(tailValue - delta, 0.12);
                var tail2 = valueToPoint(tailValue + delta, 0.12);

                return [head, head1, tail2, tail, tail1, head2, head];

                function valueToPoint(value, factor)
                {
                    var point = self.valueToPoint(value, factor);
                    point.x -= self.config.cx;
                    point.y -= self.config.cy;
                    return point;
                }
            };

            this.drawBand = function(start, end, color)
            {
                if (0 >= end - start) return;

                this.body.append('svg:path')
                    .style('fill', color)
                    .attr('d', d3.svg.arc()
                        .startAngle(this.valueToRadians(start))
                        .endAngle(this.valueToRadians(end))
                        .innerRadius(0.65 * this.config.radius)
                        .outerRadius(0.85 * this.config.radius))
                    .attr('transform', function() { return 'translate(' + self.config.cx + ', ' + self.config.cy + ') rotate(270)' });
            };

            this.redraw = function(value, transitionDuration)
            {
                var isDisabled = false;
                if (value < 0) {
                    isDisabled = true;
                    value = 0;
                }
                var pointerContainer = this.body.select('.pointerContainer');

                pointerContainer.selectAll('text').text(parseFloat(value).toFixed(2) + '%');

                var pointer = pointerContainer.selectAll('path');
                pointer.transition()
                    .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
                    //.delay(0)
                    //.ease('linear')
                    //.attr('transform', function(d)
                    .attrTween('transform', function()
                    {
                        var pointerValue = value;
                        if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
                        else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
                        var targetRotation = (self.valueToDegrees(pointerValue) - 90);
                        var currentRotation = self._currentRotation || targetRotation;
                        self._currentRotation = targetRotation;

                        return function(step)
                        {
                            var rotation = currentRotation + (targetRotation-currentRotation)*step;
                            return 'translate(' + self.config.cx + ', ' + self.config.cy + ') rotate(' + rotation + ')';
                        }
                    });

                var outerCircle = this.body.select('.outer-circle')
                    .transition()
                    .duration(750)
                    .style('fill', function () {
                        var i = parseInt(value);
                        if (i >= 0 && i < 75 && !isDisabled) {
                            return self.config.greenColor;
                        } else if (i >= 75 && i < 90 && !isDisabled) {
                            return self.config.yellowColor;
                        } else if (i === 0 && isDisabled) {
                            return self.config.redColor;
                        } else {
                            return self.config.redColor;
                        }
                    });
            };

            this.valueToDegrees = function(value)
            {
                // thanks @closealert
                //return value / this.config.range * 270 - 45;
                return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
            };

            this.valueToRadians = function(value)
            {
                return this.valueToDegrees(value) * Math.PI / 180;
            };

            this.valueToPoint = function(value, factor)
            {
                return { 	x: this.config.cx - this.config.radius * factor * Math.cos(this.valueToRadians(value)),
                    y: this.config.cy - this.config.radius * factor * Math.sin(this.valueToRadians(value)) 		};
            };

            // initialization
            this.configure(configuration);
        };

        return {
            createGauge: function (name, label, min, max, size) {
                var config = {
                    size: size || scaleConfig.defaultGaugeWidth,
                    label: label,
                    min: min || 0,
                    max: max || 100,
                    minorTicks: 5
                };

                var range = config.max - config.min;
                config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
                config.redZones = [{ from: config.min + range*0.9, to: config.max }];

                var gauge = new Gauge(name + 'GaugeContainer', config);
                gauge.render();
                return gauge;
            }
        }
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('gridFactory', ['uiGridConstants', function (uiGridConstants) {

        var getSortConfig = function (orderParam) {
            var sortArr = [];

            if (orderParam) {
                _.forEach(orderParam, function (param) {
                    var sortField = param;
                    var sortDirection = 'asc';
                    if (_.startsWith(param, '-')) {
                        sortDirection = 'desc';
                    }
                    sortArr.push({
                        direction: sortDirection,
                        field: sortField
                    })
                });
            }

            return sortArr;
        };

        return {
            defaultGridOptions: function () {
                return {
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
                    enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
                    multiSelect: false,
                    enableFiltering: true,
                    useExternalSorting: true,
                    useExternalFiltering: true,
                    enableSorting: true,
                    minRowsToShow: 17,
                    paginationPageSizes: [25, 50, 75, 100],
                    paginationPageSize: 25,
                    useExternalPagination: true,
                    enablePaginationControls: false,
                    paginationCurrentPage: 1
                }
            },
            applySortConfig: function (columnDefs, gridParams) {
                var sortConfig = getSortConfig(gridParams.order);
                _.forEach(sortConfig, function (config, idx) {
                    var field = _.startsWith(config.field, '-') ? config.field.substring(1) : config.field,
                        colDef = _.find(columnDefs, {field: field});

                    if (colDef) {
                        colDef.sort = {
                            direction: config.direction,
                            priority: idx
                        };
                    }
                });
                return columnDefs;
            }
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('pollerFactory', ['poller', function (poller) {
        return {
            newPoller: function (resource, interval) {
                return poller.get(resource, {
                    delay: interval,
                    catchError: true
                });
            }
        }
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('Status', ['StatusMaster', 'StatusScheduler', 'StatusResources', function (StatusMaster, StatusScheduler, StatusResources) {
        var Status = function ($resolved, master, scheduler, queue_depth, resources) {
            this.$resolved = $resolved;
            this.master = StatusMaster.transformer(master);
            this.scheduler = StatusScheduler.transformer(scheduler);
            this.queue_depth = queue_depth;
            this.resources = StatusResources.transformer(resources);
        };

        // public methods
        Status.prototype = {
            getCpuUsage: function () {
                if (this.resources.scheduled.cpus && this.resources.total.cpus) {
                    if (this.resources.total.cpus > 0) {
                        return ((this.resources.scheduled.cpus / this.resources.total.cpus) * 100).toFixed(2);
                    }
                }
                return 0.00;
            },
            getMemUsage: function () {
                if (this.resources.scheduled.mem && this.resources.total.mem) {
                    if (this.resources.total.mem > 0) {
                        return ((this.resources.scheduled.mem / this.resources.total.mem) * 100).toFixed(2);
                    }
                }
                return 0.00;
            },
            getDiskUsage: function () {
                if (this.resources.scheduled.disk && this.resources.total.disk) {
                    if (this.resources.total.disk > 0) {
                        return ((this.resources.scheduled.disk / this.resources.total.disk) * 100).toFixed(2);
                    }
                }
                return 0.00;
            }
        };

        // static methods, assigned to class
        Status.build = function (data) {
            if (data) {
                return new Status(
                    data.$resolved,
                    data.master,
                    data.scheduler,
                    data.queue_depth,
                    data.resources
                );
            }
            return new Status();
        };

        Status.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Status.build)
                    .filter(Boolean);
            }
            return Status.build(data);
        };

        return Status;
    }]);
})();
(function () {
    'use strict';
    
    angular.module('scaleApp').factory('StatusMaster', function () {
        var StatusMaster = function (is_online, hostname, port) {
            this.is_online = is_online;
            this.hostname = hostname;
            this.port = port;
        };

        // public methods
        StatusMaster.prototype = {

        };

        // static methods, assigned to class
        StatusMaster.build = function (data) {
            if (data) {
                return new StatusMaster(
                    data.is_online,
                    data.hostname,
                    data.port
                );
            }
            return new StatusMaster();
        };

        StatusMaster.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(StatusMaster.build)
                    .filter(Boolean);
            }
            return StatusMaster.build(data);
        };

        return StatusMaster;
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('StatusResource', function () {
        var StatusResource = function (cpus, mem, disk) {
            this.cpus = cpus;
            this.mem = mem;
            this.disk = disk;
        };

        // public methods
        StatusResource.prototype = {

        };

        // static methods, assigned to class
        StatusResource.build = function (data) {
            if (data) {
                return new StatusResource(
                    data.cpus,
                    data.mem,
                    data.disk
                );
            }
            return new StatusResource();
        };

        StatusResource.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(StatusResource.build)
                    .filter(Boolean);
            }
            return StatusResource.build(data);
        };

        return StatusResource;
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('StatusResources', ['StatusResource', function (StatusResource) {
        var StatusResources = function (total, scheduled, used) {
            this.total = StatusResource.transformer(total);
            this.scheduled = StatusResource.transformer(scheduled);
            this.used = StatusResource.transformer(used);
        };

        // public methods
        StatusResources.prototype = {

        };

        // static methods, assigned to class
        StatusResources.build = function (data) {
            if (data) {
                return new StatusResources(
                    data.total,
                    data.scheduled,
                    data.used
                );
            }
            return new StatusResources();
        };

        StatusResources.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(StatusResources.build)
                    .filter(Boolean);
            }
            return StatusResources.build(data);
        };

        return StatusResources;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('StatusScheduler', function () {
        var StatusScheduler = function (is_online, is_paused, hostname) {
            this.is_online = is_online;
            this.is_paused = is_paused;
            this.hostname = hostname;
        };

        // public methods
        StatusScheduler.prototype = {

        };

        // static methods, assigned to class
        StatusScheduler.build = function (data) {
            if (data) {
                return new StatusScheduler(
                    data.is_online,
                    data.is_paused,
                    data.hostname
                );
            }
            return new StatusScheduler();
        };

        StatusScheduler.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(StatusScheduler.build)
                    .filter(Boolean);
            }
            return StatusScheduler.build(data);
        };

        return StatusScheduler;
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').service('scaleService', ['$q', '$http', 'scaleConfig', function ($q, $http, scaleConfig) {
        function padWithZero (input, length) {
            // Cast input to string
            input = '' + input;

            var paddingSize = Math.max(0, length - input.length);
            return new Array(paddingSize > 0 ? paddingSize + 1 : 0).join('0') + input;
        }

        return {
            calculateFileSizeFromMib: function(num){
                if (num > 0) {
                    if (num < 1024) {
                        return num.toFixed(2) + ' MB';
                    }
                    if (num >= 1024 && num < 1024*1024) {
                        return (num/1024).toFixed(2) + ' GB';
                    }
                    return (num/1024/1024).toFixed(2) + ' TB';
                }
                return num;
            },
            calculateFileSizeFromBytes: function(num,decimals){
                if (num > 0) {
                    if (num < 1024) {
                        return num.toFixed(decimals) + ' Bytes';
                    }
                    if (num >= 1024 && num < 1024*1024) {
                        return (num/1024).toFixed(decimals) + ' KB';
                    }
                    if (num >= 1024*1024 && num < 1024*1024*1024) {
                        return (num/1024/1024).toFixed(decimals) + ' MB';
                    }
                    if (num >= 1024*1024*1024 && num < 1024*1024*1024*1024) {
                        return (num/1024/1024/1024).toFixed(decimals) + ' GB';
                    }
                    return (num/1024/1024/1024/1024).toFixed(decimals) + ' TB';
                }
                return num;
            },
            getViewportSize: function () {
                var w = window,
                    d = document,
                    e = d.documentElement,
                    g = document.body,
                    x = w.innerWidth || e.clientWidth || g.clientWidth,
                    y = w.innerHeight || e.clientHeight || g.clientHeight;

                return {
                    width: x,
                    height: y
                };
            },
            calculateDuration: function (start, stop) {
                var to = moment.utc(stop),
                    from = moment.utc(start),
                    diff = moment.utc(to).diff(moment.utc(from)),
                    durationStr = '';

                var duration = moment.duration(diff);

                durationStr = duration.days() > 0 ? durationStr + padWithZero(duration.days(), 2) + 'd, ' : durationStr;
                durationStr = duration.hours() > 0 ? durationStr + padWithZero(duration.hours(), 2) + 'h, ' : durationStr;
                durationStr = duration.minutes() > 0 ? durationStr + padWithZero(duration.minutes(), 2) + 'm, ' : durationStr;
                durationStr = durationStr + padWithZero(duration.seconds(), 2) + 's';
                
                return durationStr;
            },
            getDayString: function(dayNumber){
                var dayArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                return dayArr[dayNumber];
            },
            isIE: function () {
                var ua = window.navigator.userAgent,
                    oldIE = ua.indexOf('MSIE'),
                    newIE = ua.indexOf('Trident/');

                if ((oldIE > -1) || (newIE > -1)) {
                    return true;
                }
                return false;
            },
            getVersion: function () {
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'v' + scaleConfig.majorVersion + '/version/',
                    method: 'GET'
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },
            setGridHeight: function (offset) {
                // set container heights equal to available page height
                offset = offset || scaleConfig.headerOffset;
                
                var viewport = this.getViewportSize(),
                    gridMaxHeight = viewport.height - offset;

                return 'height: ' + gridMaxHeight + 'px; max-height: ' + gridMaxHeight + 'px; overflow-y: auto;';
            }
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('schedulerService', ['$http', '$q', 'scaleConfig', function ($http, $q, scaleConfig) {
        var getUpdateSchedulerData = function (is_paused) {
            return {
                is_paused: is_paused
            };
        };

        return {
            updateScheduler: function (data) {
                data = data || getUpdateSchedulerData();
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'scheduler/',
                    method: 'PATCH',
                    data: data
                }).success(function (result) {
                    d.resolve(result);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            }
        }
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('stateService', ['$location', function ($location) {
        var version = '',
            jobsColDefs = [],
            jobsParams = {},
            jobExecutionsParams = {},
            recipesColDefs = [],
            jobTypesFailureRatesParams = {},
            recipesParams = {},
            ingestsColDefs = [],
            ingestsParams = {},
            nodesColDefs = [],
            nodeStatusParams = {},
            showActiveWorkspaces = true,
            nodesParams = {};

        var updateQuerystring = function (data) {
            // set defaults
            data.page = data.page || 1;
            data.page_size = data.page_size || 25;
            data.started = data.started || moment.utc().subtract(1, 'weeks').startOf('d').toISOString();
            data.ended = data.ended || moment.utc().endOf('d').toISOString();
            data.order = data.order ? Array.isArray(data.order) ? data.order : [data.order] : null;
            data.status = data.status || null;
            // check for params in querystring, and update as necessary
            _.forEach(_.pairs(data), function (param) {
                $location.search(param[0], param[1]);
            });
        };

        var initJobsParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(1, 'weeks').startOf('d').toISOString(),
                ended: data.ended ? data.ended : moment.utc().endOf('d').toISOString(),
                order: data.order ? Array.isArray(data.order) ? data.order : [data.order] : ['-last_modified'],
                status: data.status ? data.status : null,
                error_category: data.error_category ? data.error_category : null,
                job_type_id: data.job_type_id ? parseInt(data.job_type_id) : null,
                job_type_name: data.job_type_name ? data.job_type_name : null,
                job_type_category: data.job_type_category ? data.job_type_category : null,
                url: null
            };
        };

        var initJobExecutionsParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(1, 'weeks').startOf('d').toISOString(),
                ended: data.ended ? data.ended : moment.utc().endOf('d').toISOString(),
                order: data.order ? Array.isArray(data.order) ? data.order : [data.order] : ['-last_modified'],
                status: data.status ? data.status : null,
                job_type_id: data.job_type_id ? parseInt(data.job_type_id) : null,
                job_type_name: data.job_type_name ? data.job_type_name : null,
                job_type_category: data.job_type_category ? data.job_type_category : null,
                node_id: data.node_id ? data.node_id : null
            };
        };

        var initJobTypesFailureRatesParams = function (data) {
            return {
                page: null,
                page_size: null,
                started: null,
                ended: null,
                name: data.name ? data.name : null,
                category: null,
                order: null
            };
        };

        var initRecipesParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(1, 'weeks').startOf('d').toISOString(),
                ended: data.ended ? data.ended : moment.utc().endOf('d').toISOString(),
                order: data.order ? Array.isArray(data.order) ? data.order : [data.order] : ['-last_modified'],
                type_id: data.type_id ? parseInt(data.type_id) : null,
                type_name: data.type_name ? data.type_name : null,
                url: null
            };
        };

        var initIngestsParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(1, 'weeks').startOf('d').toISOString(),
                ended: data.ended ? data.ended : moment.utc().endOf('d').toISOString(),
                order: data.order ? Array.isArray(data.order) ? data.order : [data.order] : ['-ingest_started'],
                status: data.status ? data.status : null
            };
        };

        var initNodesParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(1, 'weeks').startOf('d').toISOString(),
                ended: data.ended ? data.ended : moment.utc().endOf('d').toISOString(),
                order: data.order ? Array.isArray(data.order) ? data.order : [data.order] : ['hostname'],
                include_inactive: data.include_inactive ? data.include_inactive : null
            };
        };

        var initNodeStatusParams = function (data) {
            return {
                page: data.page ? parseInt(data.page) : 1,
                page_size: data.page_size ? parseInt(data.page_size) : 25,
                started: data.started ? data.started : moment.utc().subtract(3, 'hours').toISOString(),
                ended: data.ended ? data.ended : moment.utc().toISOString()
            };
        };

        return {
            getVersion: function () {
                return version;
            },
            setVersion: function (data) {
                version = data;
            },
            getJobsColDefs: function () {
                return jobsColDefs;
            },
            setJobsColDefs: function (data) {
                jobsColDefs = data;
            },
            getJobsParams: function () {
                if (_.keys(jobsParams).length === 0) {
                    return initJobsParams($location.search());
                }
                return jobsParams;
            },
            setJobsParams: function (data) {
                jobsParams = initJobsParams(data);
                updateQuerystring(jobsParams);
            },
            getJobExecutionsParams: function () {
                if (_.keys(jobExecutionsParams).length === 0) {
                    return initJobExecutionsParams($location.search());
                }
                return jobExecutionsParams;
            },
            setJobExecutionsParams: function (data) {
                jobExecutionsParams = initJobExecutionsParams(data);
                updateQuerystring(jobExecutionsParams);
            },
            getJobTypesFailureRatesParams: function () {
                if (_.keys(jobTypesFailureRatesParams).length === 0) {
                    return initJobTypesFailureRatesParams($location.search());
                }
                return jobTypesFailureRatesParams;
            },
            setJobTypesFailureRatesParams: function (data) {
                jobTypesFailureRatesParams = initJobTypesFailureRatesParams(data);
                _.forEach(_.pairs(jobTypesFailureRatesParams), function (param) {
                    $location.search(param[0], param[1]);
                });
            },
            getRecipesColDefs: function () {
                return recipesColDefs;
            },
            setRecipesColDefs: function (data) {
                recipesColDefs = data;
            },
            getRecipesParams: function () {
                if (_.keys(recipesParams).length === 0) {
                    return initRecipesParams($location.search());
                }
                return recipesParams;
            },
            setRecipesParams: function (data) {
                recipesParams = initRecipesParams(data);
                updateQuerystring(recipesParams);
            },
            getIngestsColDefs: function () {
                return ingestsColDefs;
            },
            setIngestsColDefs: function (data) {
                ingestsColDefs = data;
            },
            getIngestsParams: function () {
                if (_.keys(ingestsParams).length === 0) {
                    return initIngestsParams($location.search());
                }
                return ingestsParams;
            },
            setIngestsParams: function (data) {
                ingestsParams = initIngestsParams(data);
                updateQuerystring(ingestsParams);
            },
            getNodesColDefs: function () {
                return nodesColDefs;
            },
            setNodesColDefs: function (data) {
                nodesColDefs = data;
            },
            getNodeStatusParams: function () {
                if (_.keys(nodeStatusParams).length === 0) {
                    return initNodeStatusParams($location.search());
                }
                return nodeStatusParams;
            },
            setNodeStatusParams: function (data) {
                nodeStatusParams = initNodeStatusParams(data);
                updateQuerystring(nodeStatusParams);
            },
            getShowActiveWorkspaces: function () {
                return showActiveWorkspaces;
            },
            setShowActiveWorkspaces: function (data) {
                showActiveWorkspaces = data;
            },
            getNodesParams: function () {
                if (_.keys(nodesParams).length === 0) {
                    return initNodesParams($location.search());
                }
                return nodesParams;
            },
            setNodesParams: function (data) {
                nodesParams = initNodesParams(data);
                updateQuerystring(nodesParams);
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('statusService', ['$resource', 'scaleConfig', 'poller', 'pollerFactory', 'Status', function ($resource, scaleConfig, poller, pollerFactory, Status) {
        return {
            getStatus: function () {
                var statusResource = $resource(scaleConfig.urls.apiPrefix + 'status/'),
                    statusPoller = pollerFactory.newPoller(statusResource, scaleConfig.pollIntervals.status);

                return statusPoller.promise.then(null, null, function (result) {
                    if (result.$resolved) {
                        result = Status.transformer(result);
                    } else {
                        statusPoller.stop();
                    }
                    return result;
                });
            }
        }
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').service('userService', function () {
        return {
            getUserCreds: function () {
                var creds = localStorage.getItem('userCreds');
                try {
                    return JSON.parse(creds);
                } catch (e) {
                    console.log('Error parsing user credentials');
                    return creds;
                }
            },
            setUserCreds: function (user) {
                if (user !== null) {
                    localStorage.setItem('userCreds', JSON.stringify(user));
                } else {
                    localStorage.removeItem('userCreds');
                }

            },
            login: function (username) {
                var user = {
                    username: username,
                    is_admin: true
                };
                this.setUserCreds(user);
                return user;
            },
            logout: function () {
                this.setUserCreds(null);
            }
        }
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('feedDetailsController', ['$scope', '$location', 'scaleConfig', 'navService', 'subnavService', 'feedService', 'moment', function ($scope, $location, scaleConfig, navService, subnavService, feedService, moment) {
        var vm = this;
        
        vm.loading = true;
        vm.feedData = {};
        vm.subnavLinks = scaleConfig.subnavLinks.feed;
        vm.useIngestTime = 'false';
        vm.filterValue = 1;
        vm.filterDuration = 'w';

        vm.changeFeedSelection = function (){
            setFeedUrl();
            //getFeed();
        };

        vm.changeIngestTimeSelection = function (){
            setFeedUrl();
            getFeed();
        };

        var getFeedParams = function (){
            var params = {};
            var strikeId = vm.selectedFeed ? vm.selectedFeed.strike.id : null;
            var useIngestTime = vm.useIngestTime ? vm.useIngestTime : null;

            params.started = moment.utc().subtract(vm.filterValue, vm.filterDuration).startOf('d').toISOString();
            params.ended = moment.utc(params.started).add(1, vm.filterDuration).endOf('d').toISOString();

            if (strikeId != $location.search().strike_id) {
                params.strike_id = strikeId;
            } else if ($location.search().strike_id) {
                params.strike_id = $location.search().strike_id;
            }

            if (useIngestTime != $location.search().use_ingest_time) {
               params.use_ingest_time = useIngestTime;
            } else if ($location.search().use_ingest_time) {
               console.log('getFeedParams use_ingest_time: ' + $location.search().use_ingest_time);
               params.use_ingest_time = $location.search().use_ingest_time;
            }

            return params;
        };

        var getFeed = function () {
            vm.loading = true;
            if ($location.search().use_ingest_time) {
                vm.useIngestTime = $location.search().use_ingest_time;
            }
            var feedParams = getFeedParams();
            $location.search(feedParams);
            feedService.getFeed(feedParams).then(function (data) {
                vm.allFeeds = _.sortByOrder(data.results, ['strike.name'], ['asc']);
                var strikeId = $location.search().strike_id;
                if(strikeId){
                    // set selectedFeed = new feed
                    var feed = _.find(vm.allFeeds, function (feed){
                        return feed.strike.id == strikeId;
                    });
                    vm.selectedFeed = feed ? feed : null;
                } else {
                    vm.selectedFeed = vm.allFeeds[0];
                    setFeedUrl();
                }
            }).finally(function (){
                vm.loading = false;
            });
        };

        vm.updateFeedRange = function (action) {
            if (action === 'older') {
                vm.filterValue++;
            } else if (action === 'newer') {
                if (vm.filterValue > 1) {
                    vm.filterValue--;
                }
            } else if (action === 'today') {
                vm.filterValue = 1;
            }
            getFeed();
        };

        var setFeedUrl = function (){
            // set param in URL
            var params = getFeedParams();
            $location.search(params);
        };

        var initialize = function () {
            navService.updateLocation('feed');
            subnavService.setCurrentPath('feed');
            getFeed();
        };

        initialize();

        $scope.$watch('vm.filterValue', function (value) {
            var $feedNewer = $('.feed-newer'),
                $feedToday = $('.feed-today');

            if (value > 1) {
                $feedNewer.removeAttr('disabled');
                $feedToday.removeAttr('disabled');
            } else {
                $feedNewer.attr('disabled', 'disabled');
                $feedToday.attr('disabled', 'disabled');
            }
        });
    }]);
})();

(function () {
    'use strict';
    
    angular.module('scaleApp').controller('ingestRecordDetailsController', ['$scope', '$routeParams', 'scaleConfig', 'scaleService', 'navService', 'subnavService', 'feedService', function ($scope, $routeParams, scaleConfig, scaleService, navService, subnavService, feedService) {
        var vm = this;
        
        vm.loading = false;
        vm.subnavLinks = scaleConfig.subnavLinks.feed;
        vm.scaleService = scaleService;
        vm.moment = moment;
        vm.ingestRecord = null;

        var getIngestRecordDetails = function () {
            vm.loading = true;
            feedService.getSourceDetails($routeParams.id).then(function (data) {
                vm.ingestRecord = data;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function () {
            navService.updateLocation('feed');
            subnavService.setCurrentPath('feed/ingests');
            getIngestRecordDetails();
        };

        vm.calculateFileSize = function (size) {
            return scaleService.calculateFileSizeFromBytes(size);
        };

        initialize();
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('ingestRecordsController', ['$scope', '$location', 'scaleConfig', 'scaleService', 'stateService', 'feedService', 'navService', 'subnavService', 'gridFactory', function ($scope, $location, scaleConfig, scaleService, stateService, feedService, navService, subnavService, gridFactory) {
        subnavService.setCurrentPath('feed/ingests');

        var vm = this;

        vm.ingestsParams = stateService.getIngestsParams();

        vm.stateService = stateService;
        vm.loading = true;
        vm.subnavLinks = scaleConfig.subnavLinks.feed;
        vm.ingestStatusValues = scaleConfig.ingestStatus;
        vm.selectedIngestStatus = vm.ingestsParams.status || vm.ingestStatusValues[0];
        vm.lastModifiedStart = moment.utc(vm.ingestsParams.started).toDate();
        vm.lastModifiedStartPopup = {
            opened: false
        };
        vm.openLastModifiedStartPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStartPopup.opened = true;
        };
        vm.lastModifiedStop = moment.utc(vm.ingestsParams.ended).toDate();
        vm.lastModifiedStopPopup = {
            opened: false
        };
        vm.openLastModifiedStopPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStopPopup.opened = true;
        };
        vm.dateModelOptions = {
            timezone: '+000'
        };
        vm.ingestData = [];
        vm.searchText = '';
        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.paginationCurrentPage = vm.ingestsParams.page || 1;
        vm.gridOptions.paginationPageSize = vm.ingestsParams.page_size || vm.gridOptions.paginationPageSize;
        vm.gridOptions.data = [];

        vm.refreshData = function () {
            var filteredData = _.filter(vm.ingestData, function (d) {
                return d.file_name.toLowerCase().includes(vm.searchText.toLowerCase());
            });
            vm.gridOptions.data = filteredData.length > 0 ? filteredData : vm.gridOptions.data;
        };

        var filteredByStatus = vm.ingestsParams.status ? true : false,
            filteredByOrder = vm.ingestsParams.order ? true : false;

        vm.colDefs = [
            {
                field: 'file_name',
                displayName: 'File Name',
                //filterHeaderTemplate: '<div class="ui-grid-filter-container"><input ng-model="grid.appScope.vm.searchText" ng-change="grid.appScope.vm.refreshData()" class="form-control" placeholder="Search"></div>'
                enableFiltering: false
            },
            {
                field: 'file_size',
                displayName: 'File Size',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.file_size_formatted }}</div>'
            },
            {
                field: 'strike.id',
                displayName: 'Strike Process',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.strike.id }}</div>'
            },
            {
                field: 'status',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedIngestStatus" ng-options="status.toUpperCase() for status in grid.appScope.vm.ingestStatusValues"></select></div>'
            },
            {
                field: 'transfer_started',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.transfer_started_formatted }}</div>'
            },
            {
                field: 'transfer_ended',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.transfer_ended_formatted }}</div>'
            },
            {
                field: 'ingest_started',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.ingest_started_formatted }}</div>'
            },
            {
                field: 'ingest_ended',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.ingest_ended_formatted }}</div>'
            }
        ];

        vm.getIngests = function () {
            vm.loading = true;
            feedService.getIngestsOnce(vm.ingestsParams).then(function (data) {
                vm.ingestData = data.results;
                vm.gridOptions.minRowsToShow = data.results.length;
                vm.gridOptions.virtualizationThreshold = data.results.length;
                vm.gridOptions.totalItems = data.count;
                vm.gridOptions.data = data.results;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.filterResults = function () {
            stateService.setIngestsParams(vm.ingestsParams);
            vm.loading = true;
            vm.getIngests();
        };

        vm.updateColDefs = function () {
            vm.gridOptions.columnDefs = gridFactory.applySortConfig(vm.colDefs, vm.ingestsParams);
        };

        vm.updateIngestOrder = function (sortArr) {
            vm.ingestsParams.order = sortArr.length > 0 ? sortArr : null;
            filteredByOrder = sortArr.length > 0;
            vm.filterResults();
        };

        vm.updateIngestStatus = function (value) {
            if (value != vm.ingestsParams.status) {
                vm.ingestsParams.page = 1;
            }
            vm.ingestsParams.status = value === 'VIEW ALL' ? null : value;
            vm.ingestsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            vm.gridApi = gridApi;
            vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                vm.ingestsParams.page = currentPage;
                vm.ingestsParams.page_size = pageSize;
                vm.filterResults();
            });
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $location.search({});
                $location.path('/feed/ingests/' + row.entity.id);
            });
            vm.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                _.forEach(vm.gridApi.grid.columns, function (col) {
                    col.colDef.sort = col.sort;
                });
                stateService.setIngestsColDefs(vm.gridApi.grid.options.columnDefs);
                var sortArr = [];
                _.forEach(sortColumns, function (col) {
                    sortArr.push(col.sort.direction === 'desc' ? '-' + col.field : col.field);
                });
                vm.updateIngestOrder(sortArr);
            });
        };

        vm.initialize = function () {
            stateService.setIngestsParams(vm.ingestsParams);
            vm.updateColDefs();
            vm.getIngests();
            navService.updateLocation('feed');
        };

        vm.initialize();

        $scope.$watch('vm.selectedIngestStatus', function (value) {
            if (vm.loading) {
                if (filteredByStatus) {
                    vm.updateIngestStatus(value);
                }
            } else {
                filteredByStatus = value !== 'VIEW ALL';
                vm.updateIngestStatus(value);
            }
        });

        $scope.$watch('vm.lastModifiedStart', function (value) {
            if (!vm.loading) {
                vm.ingestsParams.started = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watch('vm.lastModifiedStop', function (value) {
            if (!vm.loading) {
                vm.ingestsParams.ended = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watchCollection('vm.stateService.getIngestsColDefs()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.colDefs = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.stateService.getIngestsParams()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.ingestsParams = newValue;
            vm.updateColDefs();
        });
    }]);
})();
/**
 * <scale-file-ancestry-tree />
 */
(function () {
    angular.module('scaleApp').controller('scaleFileAncestryTreeController', ['$scope', function ($scope) {
        $scope.source = null;


        var treeData = [
            {
                "name": "Top Level",
                "parent": "null",
                "children": [
                    {
                        "name": "Level 2: A",
                        "parent": "Top Level"
                        //"children": [
                        //    {
                        //        "name": "Son of A",
                        //        "parent": "Level 2: A"
                        //    },
                        //    {
                        //        "name": "Daughter of A",
                        //        "parent": "Level 2: A"
                        //    }
                        //]
                    },
                    {
                        "name": "Level 2: B",
                        "parent": "Top Level"
                    }
                ]
            }
        ];


// ************** Generate the tree diagram	 *****************
        var margin = {top: 20, right: 120, bottom: 20, left: 120};
        var width = 500 - margin.right - margin.left;
        var height = 400 - margin.top - margin.bottom;

        var i = 0,
            duration = 750,
            root;

        var tree = d3.layout.tree()
            .size([height, width]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var svg = d3.select("svg");
            //.attr("width", width + margin.right + margin.left)
            //.attr("height", height + margin.top + margin.bottom)
        var inner = svg.append("g");

        inner.attr("transform", "translate(" + margin.left/1.5 + "," + margin.top/2 + ")," +
                "scale(" + 1 + ")");
        inner.attr("class", "tree-group");


        root = treeData[0];
        root.x0 = height / 2;
        root.y0 = 0;

        update(root);

        d3.select(self.frameElement).style("height", "500px");

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            // Update the nodes…
            var node = inner.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
                //.on("click", click);

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeEnter.append("text")
                .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 10)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = inner.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

        }

// Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
        
    }]).directive('scaleFileAncestryTree', function () {
        'use strict';
        /**
         * Usage: <scale-file-ancestry-tree source="source" />
         */
        return {
            controller: 'scaleFileAncestryTreeController',
            templateUrl: 'modules/feed/directives/fileAncestryTreeTemplate.html',
            restrict: 'E',
            scope: {
                source: '='
            }
        };

    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('Feed', ['scaleConfig', function (scaleConfig) {
        var Feed = function (value, status) {
            this.value = value;
            this.status = status;
        };

        // public methods
        Feed.prototype = {
            toString: function () {
                return 'Feed';
            },
            getCellText: function () {
                return this.value;
            },
            getCellTitle: function () {
                return '';
            }
        };

        // static methods, assigned to class
        Feed.build = function (data) {
            if (data) {
                return new Feed(
                    data.value,
                    data.status
                );
            }
            return new Feed();
        };

        Feed.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Feed.build)
                    .filter(Boolean);
            }
            return Feed.build(data);
        };

        return Feed;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('FeedStatus', ['scaleConfig', function (scaleConfig) {
        var FeedStatus = function (status) {
            this.status = status;
        };

        // public methods
        FeedStatus.prototype = {
            toString: function () {
                return 'FeedStatus';
            },
            getCellFill: function () {
                return scaleConfig.colors.chart_green;
            },
            getCellActivity: function () {
                return '';
            },
            getCellActivityTotal: function () {
                return '';
            },
            getCellError: function () {
                return '';
            },
            getCellTotal: function () {
                return '';
            }
        };

        // static methods, assigned to class
        FeedStatus.build = function (data) {
            if (data) {
                return new FeedStatus(
                    data.status
                );
            }
            return new FeedStatus();
        };

        FeedStatus.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(FeedStatus.build)
                    .filter(Boolean);
            }
            return FeedStatus.build(data);
        };

        return FeedStatus;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('Ingest', ['scaleConfig', 'scaleService', function (scaleConfig, scaleService) {
        var Ingest = function (id, file_name, strike, status, bytes_transferred, transfer_started, transfer_ended, media_type, file_size, data_type, ingest_started, ingest_ended, source_file, created, last_modified) {
            this.id = id;
            this.file_name = file_name;
            this.strike = strike;
            this.status = status;
            this.bytes_transferred = bytes_transferred;
            this.transfer_started = transfer_started;
            this.transfer_started_formatted = moment.utc(transfer_started).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.transfer_ended = transfer_ended;
            this.transfer_ended_formatted = moment.utc(transfer_ended).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.media_type = media_type;
            this.file_size = file_size;
            this.file_size_formatted = scaleService.calculateFileSizeFromBytes(file_size);
            this.data_type = data_type;
            this.ingest_started = ingest_started;
            this.ingest_started_formatted = ingest_started ? moment.utc(ingest_started).format(scaleConfig.dateFormats.day_second_utc_nolabel) : '';
            this.ingest_ended = ingest_ended;
            this.ingest_ended_formatted = ingest_ended ? moment.utc(ingest_ended).format(scaleConfig.dateFormats.day_second_utc_nolabel) : '';
            this.source_file = source_file;
            this.created = created;
            this.created_formatted = moment.utc(created).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.last_modified = last_modified;
            this.last_modified_formatted = moment.utc(last_modified).format(scaleConfig.dateFormats.day_second_utc_nolabel);
        };

        // public methods
        Ingest.prototype = {
            
        };

        // static methods, assigned to class
        Ingest.build = function (data) {
            if (data) {
                return new Ingest(
                    data.id,
                    data.file_name,
                    data.strike,
                    data.status,
                    data.bytes_transferred,
                    data.transfer_started,
                    data.transfer_ended,
                    data.media_type,
                    data.file_size,
                    data.data_type,
                    data.ingest_started,
                    data.ingest_ended,
                    data.source_file,
                    data.created,
                    data.last_modified
                );
            }
            return new Ingest();
        };

        Ingest.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Ingest.build);
            }
            return Ingest.build(data);
        };

        return Ingest;
    }]);
})();

(function () {
    'use strict';
    angular.module('scaleApp').service('feedService', ['$location', '$timeout', '$q', '$http', 'scaleConfig', 'Ingest', function ($location, $timeout, $q, $http, scaleConfig, Ingest) {

        var getFeedParams = function (params) {
            if(!params) { params = {}; }
            var p = {};
            p.page_size = 1000;
            p.started = params.started ? params.started : moment.utc().add(-7,'days').startOf('d').toDate();
            p.ended = params.ended ? params.ended : moment.utc().toDate();
            p.use_ingest_time = params.use_ingest_time ? params.use_ingest_time : null;
            return p;
        };

        var getIngestsParams = function (params) {
            return params;
        };

        var getSourceParams = function (page, page_size, started, ended, order, is_parsed, file_name) {
            return {
                page: page,
                page_size: page_size ? page_size : 1000,
                started: started,
                ended: ended,
                order: order ? order : '-last_modified',
                is_parsed: is_parsed,
                file_name: file_name
            };
        };

        return {
            getFeed: function (params) {
                var d = $q.defer();
                var params = getFeedParams(params);
                $http({
                    url: scaleConfig.urls.apiPrefix + 'ingests/status/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getIngestsOnce: function (params) {
                var d = $q.defer();
                var params = getIngestsParams(params);
                $http({
                    url: scaleConfig.urls.apiPrefix + 'ingests/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = Ingest.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getSources: function (params) {
                params = params || getSourceParams();
                var d = $q.defer();
                $http({
                    url: scaleConfig.urls.apiPrefix + 'sources/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getSourceDetails: function (id) {
                var d = $q.defer();
                $http({
                    url: scaleConfig.urls.apiPrefix + 'sources/' + id + '/',
                    method: 'GET'
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('jobDetailController', ['$scope', '$rootScope', '$location', '$routeParams', '$uibModal', 'stateService', 'navService', 'jobService', 'jobExecutionService', 'nodeService', 'loadService', 'scaleConfig', 'subnavService', 'userService', 'scaleService', 'toastr', function ($scope, $rootScope, $location, $routeParams, $uibModal, stateService, navService, jobService, jobExecutionService, nodeService, loadService, scaleConfig, subnavService, userService, scaleService, toastr) {
        var vm = this;
        
        vm.job = {};
        vm.jobId = $routeParams.id;
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        subnavService.setCurrentPath('jobs');
        vm.loadingJobDetail = false;
        vm.latestExecution = null;
        vm.executionLog = null;
        vm.executionDetails = null;
        vm.selectedExecutionDetailValues = null;
        vm.timeline = [];
        vm.readonly = true;
        vm.jobErrorCreated = '';
        vm.jobErrorLastModified = '';
        vm.lastStatusChange = '';
        vm.triggerOccurred = '';

        vm.showLog = function (execution) {
            vm.selectedExecutionLog = execution;
            $uibModal.open({
                animation: true,
                templateUrl: 'showLog.html',
                scope: $scope,
                windowClass: 'log-modal-window'
            });
        };

        vm.showExecutionDetails = function (executionId) {
            jobExecutionService.getJobExecutionDetails(executionId).then(function (data) {
                vm.selectedExecutionDetails = data;
                vm.selectedExecutionDetailValues = _.pairs(data);
                $uibModal.open({
                    animation: true,
                    templateUrl: 'showExecutionDetails.html',
                    scope: $scope,
                    size: 'lg'
                });
            }).catch(function (error) {
                console.log(error);
            });
        };

        vm.requeueJob = function (jobId) {
            vm.loading = true;
            loadService.requeueJobs({ job_ids: [jobId] }).then(function (data) {
                toastr['success']('Requeued Job');
                vm.job.status = data.job_status;
                getJobDetail(jobId);
            }).catch(function (error) {
                toastr['error']('Requeue request failed');
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.cancelJob = function (job) {
            vm.loading = true;
            vm.actionClicked = true;
            vm.loading = true;
            var originalStatus = job.status;
            job.status = 'CANCEL';
            jobService.updateJob(job.id, { status: 'CANCELED' }).then(function () {
                toastr['success']('Job Canceled');
                job.status = 'CANCELED';
            }).catch(function (error) {
                toastr['error'](error);
                console.log(error);
                job.status = originalStatus;
            }).finally(function () {
                vm.loading = false;
            });
        };
        
        vm.calculateFileSize = function (size) {
            return scaleService.calculateFileSizeFromBytes(size);
        };

        var getJobDetail = function (jobId) {
            vm.loadingJobDetail = true;
            jobService.getJobDetail(jobId).then(function (data) {
                vm.job = data;
                vm.timeline = calculateTimeline(data);
                vm.latestExecution = data.getLatestExecution();
                vm.jobErrorCreated = data.error ? moment.utc(data.error.created).toISOString() : '';
                vm.lastStatusChange = data.last_status_change ? moment.duration(moment.utc(data.last_status_change).diff(moment.utc())).humanize(true) : '';
                vm.triggerOccurred = data.event.occurred ? moment.duration(moment.utc(data.event.occurred).diff(moment.utc())).humanize(true) : '';
                vm.inputs = data.inputs;
                vm.outputs = data.outputs;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loadingJobDetail = false;
            });
        };

        var calculateTimeline = function (job) {
            var tl = [];
            tl.push({ taskName: 'Created', started: job.created ? moment.utc(job.created).toDate() : job.created, ended: job.queued ? moment.utc(job.queued).toDate() : job.queued });
            tl.push({ taskName: 'Queued', started: job.queued ? moment.utc(job.queued).toDate() : job.queued, ended: job.started ? moment.utc(job.started).toDate() : job.started });
            tl.push({ taskName: 'Executed', started: job.started ? moment.utc(job.started).toDate() : job.started, ended: job.ended ? moment.utc(job.ended).toDate() : job.ended });

            return tl;
        };

        var initialize = function () {
            navService.updateLocation('jobs');
            var user = userService.getUserCreds();
            vm.readonly = !(user && user.is_admin);
            getJobDetail(vm.jobId);
        };

        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('jobExecutionDetailController', ['$scope', '$location', '$routeParams', 'navService', 'jobExecutionService', 'nodeService', 'scaleConfig', 'subnavService', function ($scope, $location, $routeParams, navService, jobExecutionService, nodeService, scaleConfig, subnavService) {
        var vm = this;
        
        vm.jobExecution = {};
        vm.jobExecutionId = $routeParams.id;
        vm.loading = true;
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        subnavService.setCurrentPath('jobs/runs');

        var getJobExecutionDetail = function () {
            jobExecutionService.getJobExecutionDetail(id).then(function (data) {
                vm.jobExecution = data;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function () {
            getJobExecutionDetail($routeParams.id);
            navService.updateLocation('jobs');
        };

        initialize();
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('jobExecutionsController', ['$scope', '$location', 'navService', 'stateService', 'gridFactory', 'userService', 'jobExecutionService', 'jobTypeService', 'uiGridConstants', 'scaleConfig', 'subnavService', function ($scope, $location, navService, stateService, gridFactory, userService, jobExecutionService, jobTypeService, uiGridConstants, scaleConfig, subnavService) {
        subnavService.setCurrentPath('jobs');

        var vm = this,
            jobTypeViewAll = { name: 'VIEW ALL', title: 'VIEW ALL', version: '', id: 0 };

        vm.jobExecutionsParams = stateService.getJobExecutionsParams();

        vm.stateService = stateService;
        vm.loading = true;
        vm.readonly = true;
        vm.jobTypeValues = [jobTypeViewAll];
        vm.jobExecution = null;
        vm.selectedJobType = vm.jobExecutionsParams.job_type_id ? vm.jobExecutionsParams.job_type_id : jobTypeViewAll;
        vm.jobStatusValues = scaleConfig.jobStatus;
        vm.selectedJobStatus = vm.jobExecutionsParams.status || vm.jobStatusValues[0];
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        vm.actionClicked = false;
        vm.lastModifiedStart = moment.utc(vm.jobExecutionsParams.started).toDate();
        vm.lastModifiedStartPopup = {
            opened: false
        };
        vm.openLastModifiedStartPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStartPopup.opened = true;
        };
        vm.lastModifiedStop = moment.utc(vm.jobExecutionsParams.ended).toDate();
        vm.lastModifiedStopPopup = {
            opened: false
        };
        vm.openLastModifiedStopPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStopPopup.opened = true;
        };
        vm.dateModelOptions = {
            timezone: '+000'
        };
        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.paginationCurrentPage = vm.jobExecutionsParams.page || 1;
        vm.gridOptions.paginationPageSize = vm.jobExecutionsParams.page_size || vm.gridOptions.paginationPageSize;
        vm.gridOptions.data = [];

        var filteredByJobType = vm.jobExecutionsParams.job_type_id ? true : false,
            filteredByJobStatus = vm.jobExecutionsParams.status ? true : false,
            filteredByOrder = vm.jobExecutionsParams.order ? true : false;

        vm.colDefs = [
            {
                field: 'job_type',
                displayName: 'Job Type',
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-bind-html="row.entity.job_type.getIcon()"></span> {{ row.entity.job_type.title }} {{ row.entity.job_type.version }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedJobType" ng-options="jobType as (jobType.title + \' \' + jobType.version) for jobType in grid.appScope.vm.jobTypeValues"></select></div>'
            },
            {
                field: 'created',
                displayName: 'Created (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.created_formatted }}</div>'
            },
            {
                field: 'last_modified',
                displayName: 'Last Modified (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.last_modified_formatted }}</div>'
            },
            {
                field: 'duration',
                enableFiltering: false,
                enableSorting: false,
                width: 120,
                cellTemplate: '<div class="ui-grid-cell-contents text-right">{{ row.entity.getDuration() }}</div>'
            },
            {
                field: 'status',
                width: 150,
                cellTemplate: '<div class="ui-grid-cell-contents"><div class="pull-right"><button ng-show="((!grid.appScope.vm.readonly) && (row.entity.status === \'FAILED\' || row.entity.status === \'CANCELED\'))" ng-click="grid.appScope.vm.requeueJobs({ job_ids: [row.entity.id] })" class="btn btn-xs btn-default" title="Requeue Job"><i class="fa fa-repeat"></i></button> <button ng-show="!grid.appScope.vm.readonly && row.entity.status !== \'COMPLETED\' && row.entity.status !== \'CANCELED\'" ng-click="grid.appScope.vm.cancelJob(row.entity)" class="btn btn-xs btn-default" title="Cancel Job"><i class="fa fa-ban"></i></button></div> {{ row.entity.status }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedJobStatus"><option ng-selected="{{ grid.appScope.vm.jobStatusValues[$index] == grid.appScope.vm.selectedJobStatus }}" value="{{ grid.appScope.vm.jobStatusValues[$index] }}" ng-repeat="status in grid.appScope.vm.jobStatusValues track by $index">{{ status.toUpperCase() }}</option></select></div>'
            },
            {
                field: 'id',
                displayName: 'Log',
                enableFiltering: false,
                sortable: false,
                width: 60,
                cellTemplate: '<div class="ui-grid-cell-contents text-center"><button ng-click="grid.appScope.vm.showLog(row.entity)" class="btn btn-xs btn-default"><i class="fa fa-file-text"></i></button></div>'
            }
        ];

        vm.getJobExecutions = function () {
            jobExecutionService.getJobExecutions(vm.jobExecutionsParams).then(function (data) {
                vm.gridOptions.totalItems = data.count;
                vm.gridOptions.minRowsToShow = data.results.length;
                vm.gridOptions.virtualizationThreshold = data.results.length;
                vm.gridOptions.data = data.results;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.getJobTypes = function () {
            jobTypeService.getJobTypesOnce().then(function (data) {
                vm.jobTypeValues.push(data.results);
                vm.jobTypeValues = _.flatten(vm.jobTypeValues);
                vm.selectedJobType = _.find(vm.jobTypeValues, { id: vm.jobExecutionsParams.job_type_id }) || jobTypeViewAll;
                vm.getJobExecutions();
            }).catch(function () {
                vm.loading = false;
            });
        };

        vm.showLog = function (jobExecution) {
            // show log modal
            vm.actionClicked = true;
            vm.jobExecution = jobExecution;
            $uibModal.open({
                animation: true,
                templateUrl: 'showLog.html',
                scope: $scope,
                size: 'lg',
                windowClass: 'log-modal-window'
            });
        };

        vm.filterResults = function () {
            stateService.setJobsParams(vm.jobExecutionsParams);
            vm.loading = true;
            vm.getJobs();
        };

        vm.updateColDefs = function () {
            vm.gridOptions.columnDefs = gridFactory.applySortConfig(vm.colDefs, vm.jobExecutionsParams);
        };

        vm.updateJobOrder = function (sortArr) {
            vm.jobExecutionsParams.order = sortArr.length > 0 ? sortArr : null;
            filteredByOrder = sortArr.length > 0;
            vm.filterResults();
        };

        vm.updateJobType = function (value) {
            if (value.id !== vm.jobExecutionsParams.job_type_id) {
                vm.jobExecutionsParams.page = 1;
            }
            vm.jobExecutionsParams.job_type_id = value.id === 0 ? null : value.id;
            vm.jobExecutionsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.updateJobStatus = function (value) {
            if (value != vm.jobExecutionsParams.status) {
                vm.jobExecutionsParams.page = 1;
            }
            vm.jobExecutionsParams.status = value === 'VIEW ALL' ? null : value;
            vm.jobExecutionsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            vm.gridApi = gridApi;
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (vm.actionClicked) {
                    vm.actionClicked = false;
                } else {
                    $location.path('/jobs/job/' + row.entity.id);
                }
            });
            vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                vm.jobExecutionsParams.page = currentPage;
                vm.jobExecutionsParams.page_size = pageSize;
                vm.filterResults();
            });
            vm.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                _.forEach(vm.gridApi.grid.columns, function (col) {
                    col.colDef.sort = col.sort;
                });
                stateService.setJobsColDefs(vm.gridApi.grid.options.columnDefs);
                var sortArr = [];
                _.forEach(sortColumns, function (col) {
                    sortArr.push(col.sort.direction === 'desc' ? '-' + col.field : col.field);
                });
                vm.updateJobOrder(sortArr);
            });
        };

        vm.initialize = function () {
            stateService.setJobExecutionsParams(vm.jobExecutionsParams);
            vm.updateColDefs();
            var user = userService.getUserCreds();
            vm.readonly = !(user && user.is_admin);
            vm.getJobTypes();
            navService.updateLocation('jobs/executions');
        };

        vm.initialize();

        $scope.$watch('vm.selectedJobType', function (value) {
            if (parseInt(value)) {
                value = _.find(vm.jobTypeValues, {id: parseInt(value)});
            }
            if (value) {
                if (vm.loading) {
                    if (filteredByJobType) {
                        vm.updateJobType(value);
                    }
                } else {
                    filteredByJobType = !angular.equals(value, jobTypeViewAll);
                    vm.updateJobType(value);
                }
            }
        });

        $scope.$watch('vm.selectedJobStatus', function (value) {
            if (vm.loading) {
                if (filteredByJobStatus) {
                    vm.updateJobStatus(value);
                }
            } else {
                filteredByJobStatus = value !== 'VIEW ALL';
                vm.updateJobStatus(value);
            }
        });

        $scope.$watch('vm.lastModifiedStart', function (value) {
            if (!vm.loading) {
                vm.jobExecutionsParams.started = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watch('vm.lastModifiedStop', function (value) {
            if (!vm.loading) {
                vm.jobExecutionsParams.ended = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watchCollection('vm.stateService.getJobsColDefs()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.colDefs = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.stateService.getJobsParams()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.jobExecutionsParams = newValue;
            vm.updateColDefs();
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('jobTypesController', ['$rootScope', '$scope', '$routeParams', '$location', 'hotkeys', 'scaleService', 'navService', 'jobTypeService', 'scaleConfig', 'subnavService', 'nodeService', 'localStorage', 'userService', function ($rootScope, $scope, $routeParams, $location, hotkeys, scaleService, navService, jobTypeService, scaleConfig, subnavService, nodeService, localStorage, userService) {
        var vm = this;
        
        vm.containerStyle = '';
        vm.requestedJobTypeId = parseInt($routeParams.id);
        vm.jobTypes = [];
        vm.jobTypeIds = [];
        vm.jobTypeCount = 0;
        vm.activeJobTypeDetails = {};
        vm.activeJobTypeInterfaceValues = [];
        vm.activeJobTypeErrors = [];
        vm.activeJobTypeStats = {};
        vm.showJobTypeErrors = false;
        vm.loading = true;
        vm.activeJobType = null;
        vm.healthData6 = {};
        vm.healthData12 = {};
        vm.healthData24 = {};
        vm.activityIcon = '<i class="fa fa-pulse">&#x' + scaleConfig.activityIconCode + '</i>';
        vm.jobDetailsClass = 'hidden';
        vm.pauseBtnClass = 'fa-pause';
        vm.user = userService.getUserCreds();
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        subnavService.setCurrentPath('jobs/types');

        vm.viewDetails = function (id) {
            vm.activeJobType = _.find(vm.jobTypes, 'id', id);
            vm.activeJobType.created = formatDateTime(vm.activeJobType.created);
            vm.activeJobType.lastModified = formatDateTime(vm.activeJobType.lastModified);

            $location.path('jobs/types/' + id);

            getJobTypeDetails(vm.activeJobType.id);

            vm.jobDetailsClass = 'visible';
        };

        vm.togglePause = function () {
            vm.activeJobType.is_paused = !vm.activeJobType.is_paused;
            vm.activeJobTypeDetails.is_paused = vm.activeJobType.is_paused;
            vm.loading = true;
            jobTypeService.updateJobType(vm.activeJobTypeDetails).then(function(data){
                vm.activeJobTypeDetails = data;
                vm.pauseBtnClass = vm.getPauseButtonClass(vm.activeJobTypeDetails.is_paused);
                vm.loading = false;
            }).catch(function (error) {
                console.log(error);
                toastr['error'](error);
                vm.loading = false;
            });
        };

        vm.getPauseButtonClass = function(is_paused){
            return is_paused ? 'fa-play' : 'fa-pause';
        };

        vm.getJobTypeListItemClass = function(jobType){
            return jobType.is_paused ? 'paused' : '';
        };

        var formatDateTime = function (dt) {
            return moment.utc(dt).toISOString();
        };

        var getJobTypes = function () {
            jobTypeService.getJobTypesOnce().then(function (data) {
                vm.jobTypes = data.results;
                vm.jobTypeIds = _.pluck(vm.jobTypes, 'id');
                vm.jobTypeCount = data.count;
                if (vm.requestedJobTypeId) {
                    vm.viewDetails(vm.requestedJobTypeId);
                } else {
                    vm.loading = false;
                }
                hotkeys.bindTo($scope)
                    .add({
                        combo: 'ctrl+up',
                        description: 'Previous Job Type',
                        callback: function () {
                            if (vm.activeJobType) {
                                var idx = _.indexOf(vm.jobTypeIds, vm.activeJobType.id);
                                if (idx > 0) {
                                    vm.viewDetails(vm.jobTypeIds[idx - 1]);
                                }
                            }
                        }
                    }).add({
                        combo: 'ctrl+down',
                        description: 'Next Job Type',
                        callback: function () {
                            if (vm.activeJobType) {
                                var idx = _.indexOf(vm.jobTypeIds, vm.activeJobType.id);
                                if (idx < (vm.jobTypeIds.length - 1)) {
                                    vm.viewDetails(vm.jobTypeIds[idx + 1]);
                                }
                            }
                        }
                    });
            }).catch(function (error) {
                console.log(error);
                vm.loading = false;
            });
        };

        var getJobTypeDetails = function (id) {
            vm.loading = true;
            jobTypeService.getJobTypeDetails(id).then(function (data) {
                vm.activeJobTypeDetails = data;
                vm.activeJobTypeInterfaceValues = _.pairs(data.job_type_interface);
                vm.pauseBtnClass = vm.getPauseButtonClass(vm.activeJobTypeDetails.is_paused);
                // format error mapping
                vm.activeJobTypeErrors = [];
                vm.showJobTypeErrors = _.keys(data.error_mapping.exit_codes).length > 0;
                if (vm.showJobTypeErrors) {
                    _.forEach(data.error_mapping.exit_codes, function (error_name) {
                        var error = _.find(data.errors, 'name', error_name),
                            exitCode = _.invert(data.error_mapping.exit_codes)[error_name];
                        vm.activeJobTypeErrors.push({code: exitCode, data: error});
                    });
                }

                // format job type stats
                var performance = data.getPerformance(),
                    failures = data.getFailures();

                vm.activeJobTypeStats = performance;

                vm.healthData6 = {
                    gaugeData: performance.hour6.rate,
                    donutData: failures.hour6
                };
                vm.healthData12 = {
                    gaugeData: performance.hour12.rate,
                    donutData: failures.hour12
                };
                vm.healthData24 = {
                    gaugeData: performance.hour24.rate,
                    donutData: failures.hour24
                };
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function () {
            getJobTypes();
            navService.updateLocation('jobs');
        };

        initialize();

        angular.element(document).ready(function () {
            // set container heights equal to available page height
            var viewport = scaleService.getViewportSize(),
                offset = scaleConfig.headerOffset,
                containerMaxHeight = viewport.height - offset;

            vm.containerStyle = 'height: ' + containerMaxHeight + 'px; max-height: ' + containerMaxHeight + 'px;';
        });
    }]);
})();

(function () {
    'use strict';
    
    angular.module('scaleApp').controller('jobTypesFailureRatesController', ['$scope', '$location', 'scaleConfig', 'stateService', 'scaleService', 'subnavService', 'jobTypeService', 'metricsService', 'gridFactory', 'JobType', 'toastr', 'moment', function ($scope, $location, scaleConfig, stateService, scaleService, subnavService, jobTypeService, metricsService, gridFactory, JobType, toastr, moment) {
        var vm = this,
            jobTypeViewAll = { name: 'VIEW ALL', title: 'VIEW ALL', version: '', id: 0 };

        vm.jobTypesParams = stateService.getJobTypesFailureRatesParams();

        var jobTypes = [],
            started = moment.utc().subtract(30, 'days').startOf('d').toISOString(),
            ended = moment.utc().endOf('d').toISOString(),
            filteredByJobType = vm.jobTypesParams.name ? true : false;

        vm.stateService = stateService;
        vm.scaleService = scaleService;
        vm.loading = true;
        vm.dates = [];
        vm.performanceData = [];
        vm.jobTypeValues = [jobTypeViewAll];
        vm.selectedJobType = vm.jobTypesParams.name ? vm.jobTypesParams.name : jobTypeViewAll;
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        subnavService.setCurrentPath('jobs/failure-rates');

        var defaultColumnDefs = [
            {
                field: 'job_type',
                displayName: 'Job Type',
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-bind-html="row.entity.job_type.getIcon()"></span> {{ row.entity.job_type.title }} {{ row.entity.job_type.version }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedJobType" ng-options="jobType as (jobType.title + \' \' + jobType.version) for jobType in grid.appScope.vm.jobTypeValues"></select></div>',
                enableSorting: false
            },
            {
                field: 'twentyfour_hours',
                displayName: '24 Hours',
                enableSorting: false,
                enableFiltering: false,
                headerCellTemplate: 'gridHeader.html',
                cellTemplate: 'gridRow.html'
            },
            {
                field: 'fortyeight_hours',
                displayName: '48 Hours',
                enableSorting: false,
                enableFiltering: false,
                headerCellTemplate: 'gridHeader.html',
                cellTemplate: 'gridRow.html'
            },
            {
                field: 'thirty_days',
                displayName: '30 Days',
                enableSorting: false,
                enableFiltering: false,
                headerCellTemplate: 'gridHeader.html',
                cellTemplate: 'gridRow.html'
            }
        ];

        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.columnDefs = defaultColumnDefs;
        vm.gridOptions.data = [];
        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if ($scope.actionClicked) {
                    $scope.actionClicked = false;
                } else {
                    $scope.$apply(function () {
                        $location.path('/jobs/types/' + row.entity.job_type.id);
                    });
                }
            });
        };
        
        vm.setStyle = function (colField, errorType) {
            var errorValue = (colField[errorType] / colField.total).toFixed(2);
            var textColor = errorValue >= 0.5 ? '#fff' : '#000';
            var rgb = errorType === 'system' ? '103, 0, 13' : errorType === 'algorithm' ? '203, 24, 29' : '241, 105, 19';
            return 'background: rgba(' + rgb + ', ' + errorValue + '); color: ' + textColor;
        };

        vm.failRateStyle = function (error, total) {
            var percentage = ((error / total) * 100).toFixed(0);
            return percentage > 0 ? 'width: ' + percentage + '%' : 'display: none';
        };
        
        vm.getPercentageOfTotal = function (errorTotal, total) {
            if (total === 0) {
                return '0%';
            }
            return ((errorTotal / total) * 100).toFixed(0) + '%';
        };

        vm.filterResults = function () {
            vm.gridOptions.data = [];
            stateService.setJobTypesFailureRatesParams(vm.jobTypesParams);
            _.forEach(_.pairs(vm.jobTypesParams), function (param) {
                $location.search(param[0], param[1]);
            });
            vm.loading = true;
            initialize();
        };

        vm.updateJobType = function (value) {
            vm.jobTypesParams.name = value.name === 'VIEW ALL' ? null : value.name;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        var formatData = function (data, numDays) {
            var dataArr = [];
            _.forEach(data, function (result) {
                var filteredResult = _.filter(result, function (d) {
                    var date = moment.utc(d.date, 'YYYY-MM-DD');
                    if (moment.utc().diff(moment.utc(date), 'd') <= numDays) {
                        return d;
                    }
                });
                dataArr.push(filteredResult);
            });
            return dataArr;
        };

        var formatColumn = function (cData, id) {
            var systemErrors = cData[0],
                algorithmErrors = cData[1],
                dataErrors = cData[2],
                totalCount = cData[3];

            var obj = {
                system: _.sum(_.map(_.filter(systemErrors, { id: id }), 'value')),
                algorithm: _.sum(_.map(_.filter(algorithmErrors, { id: id }), 'value')),
                data: _.sum(_.map(_.filter(dataErrors, { id: id }), 'value')),
                total: _.sum(_.map(_.filter(totalCount, { id: id }), 'value'))
            };
            obj.errorTotal = obj.system + obj.algorithm + obj.data;

            return obj;
        };

        var initialize = function () {
            stateService.setJobTypesFailureRatesParams(vm.jobTypesParams);
            jobTypeService.getJobTypesOnce().then(function (jobTypesData) {
                jobTypes = _.cloneDeep(jobTypesData.results);
                vm.jobTypeValues.push(jobTypesData.results);
                vm.jobTypeValues = _.flatten(vm.jobTypeValues);
                vm.selectedJobType = _.find(vm.jobTypeValues, { name: vm.jobTypesParams.name }) || jobTypeViewAll;
                vm.gridOptions.totalItems = jobTypesData.count;

                var metricsParams = {
                    page: null,
                    page_size: null,
                    started: started,
                    ended: ended,
                    choice_id: vm.selectedJobType.id > 0 ? [vm.selectedJobType.id] : _.map(jobTypes, 'id'),
                    column: ['error_system_count', 'error_algorithm_count', 'error_data_count', 'total_count'],
                    group: null,
                    dataType: 'job-types'
                };

                metricsService.getPlotData(metricsParams).then(function (data) {
                    if (data.results.length > 0) {
                        var data30Days = _.map(data.results, 'values'),
                            data48Hours = formatData(data30Days, 2),
                            data24Hours = formatData(data48Hours, 1);

                        _.forEach(jobTypes, function (jobType) {
                            vm.performanceData.push({
                                job_type: JobType.transformer(jobType),
                                twentyfour_hours: formatColumn(data24Hours, jobType.id),
                                fortyeight_hours: formatColumn(data48Hours, jobType.id),
                                thirty_days: formatColumn(data30Days, jobType.id)
                            });
                        });

                        vm.performanceData = _.sortByOrder(vm.performanceData, [function (d) {
                            if (d.twentyfour_hours.total > 0) {
                                return d.twentyfour_hours.errorTotal / d.twentyfour_hours.total;
                            }
                            return 0;
                        }, 'twentyfour_hours.total'], ['desc', 'desc']);

                        vm.gridOptions.minRowsToShow = vm.performanceData.length;
                        vm.gridOptions.virtualizationThreshold = vm.performanceData.length;
                        vm.gridOptions.data = vm.performanceData;
                    }

                    vm.loading = false;
                }).catch(function (error) {
                    vm.loading = false;
                    console.log(error);
                    toastr['error'](error);
                });
            });
        };
        
        initialize();

        $scope.$watch('vm.selectedJobType', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            if (vm.loading) {
                if (filteredByJobType) {
                    vm.updateJobType(newValue);
                }
            } else {
                filteredByJobType = newValue !== 'VIEW ALL';
                vm.updateJobType(newValue);
            }
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('jobsController', ['$scope', '$location', '$uibModal', 'scaleConfig', 'scaleService', 'stateService', 'navService', 'subnavService', 'userService', 'jobService', 'jobTypeService', 'loadService', 'gridFactory', 'toastr', function ($scope, $location, $uibModal, scaleConfig, scaleService, stateService, navService, subnavService, userService, jobService, jobTypeService, loadService, gridFactory, toastr) {
        subnavService.setCurrentPath('jobs');

        var vm = this,
            jobTypeViewAll = { name: 'VIEW ALL', title: 'VIEW ALL', version: '', id: 0 };

        vm.jobsParams = stateService.getJobsParams();

        vm.stateService = stateService;
        vm.loading = true;
        vm.readonly = true;
        vm.jobTypeValues = [jobTypeViewAll];
        vm.jobExecution = null;
        vm.selectedJobType = vm.jobsParams.job_type_id ? vm.jobsParams.job_type_id : jobTypeViewAll;
        vm.jobStatusValues = scaleConfig.jobStatus;
        vm.selectedJobStatus = vm.jobsParams.status || vm.jobStatusValues[0];
        vm.errorCategoryValues = _.map(scaleConfig.errorCategories, 'name');
        vm.selectedErrorCategory = vm.jobsParams.error_category || vm.errorCategoryValues[0];
        vm.subnavLinks = scaleConfig.subnavLinks.jobs;
        vm.actionClicked = false;
        vm.lastModifiedStart = moment.utc(vm.jobsParams.started).toDate();
        vm.lastModifiedStartPopup = {
            opened: false
        };
        vm.openLastModifiedStartPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStartPopup.opened = true;
        };
        vm.lastModifiedStop = moment.utc(vm.jobsParams.ended).toDate();
        vm.lastModifiedStopPopup = {
            opened: false
        };
        vm.openLastModifiedStopPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStopPopup.opened = true;
        };
        vm.dateModelOptions = {
            timezone: '+000'
        };
        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.paginationCurrentPage = vm.jobsParams.page || 1;
        vm.gridOptions.paginationPageSize = vm.jobsParams.page_size || vm.gridOptions.paginationPageSize;
        vm.gridOptions.data = [];

        var filteredByJobType = vm.jobsParams.job_type_id ? true : false,
            filteredByJobStatus = vm.jobsParams.status ? true : false,
            filteredByErrorCategory = vm.jobsParams.error_category ? true : false,
            filteredByOrder = vm.jobsParams.order ? true : false;

        vm.colDefs = [
            {
                field: 'job_type',
                displayName: 'Job Type',
                cellTemplate: '<div class="ui-grid-cell-contents"><span ng-bind-html="row.entity.job_type.getIcon()"></span> {{ row.entity.job_type.title }} {{ row.entity.job_type.version }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedJobType" ng-options="jobType as (jobType.title + \' \' + jobType.version) for jobType in grid.appScope.vm.jobTypeValues"></select></div>'
            },
            {
                field: 'created',
                displayName: 'Created (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.created_formatted }}</div>'
            },
            {
                field: 'last_modified',
                displayName: 'Last Modified (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.last_modified_formatted }}</div>'
            },
            {
                field: 'duration',
                enableFiltering: false,
                enableSorting: false,
                width: 120,
                cellTemplate: '<div class="ui-grid-cell-contents text-right">{{ row.entity.getDuration() }}</div>'
            },
            {
                field: 'status',
                width: 150,
                cellTemplate: '<div class="ui-grid-cell-contents"><div class="pull-right"><button ng-show="((!grid.appScope.vm.readonly) && (row.entity.status === \'FAILED\' || row.entity.status === \'CANCELED\'))" ng-click="grid.appScope.vm.requeueJobs({ job_ids: [row.entity.id] })" class="btn btn-xs btn-default" title="Requeue Job"><i class="fa fa-repeat"></i></button> <button ng-show="!grid.appScope.vm.readonly && row.entity.status !== \'COMPLETED\' && row.entity.status !== \'CANCELED\'" ng-click="grid.appScope.vm.cancelJob(row.entity)" class="btn btn-xs btn-default" title="Cancel Job"><i class="fa fa-ban"></i></button></div> {{ row.entity.status }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedJobStatus"><option ng-selected="{{ grid.appScope.vm.jobStatusValues[$index] == grid.appScope.vm.selectedJobStatus }}" value="{{ grid.appScope.vm.jobStatusValues[$index] }}" ng-repeat="status in grid.appScope.vm.jobStatusValues track by $index">{{ status.toUpperCase() }}</option></select></div>'
            },
            {
                field: 'error.category',
                width: 150,
                displayName: 'Error Category',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedErrorCategory"><option ng-selected="{{ grid.appScope.vm.errorCategoryValues[$index] == grid.appScope.vm.selectedErrorCategory }}" value="{{ grid.appScope.vm.errorCategoryValues[$index] }}" ng-repeat="error in grid.appScope.vm.errorCategoryValues track by $index">{{ error.toUpperCase() }}</option></select></div>'
            },
            {
                field: 'error.title',
                displayName: 'Error',
                cellTemplate: '<div class="ui-grid-cell-contents"><div uib-tooltip="{{ row.entity.error.description }}" tooltip-append-to-body="true">{{ row.entity.error.title }}</div></div>',
                width: 200,
                enableFiltering: false
            },
            {
                field: 'id',
                displayName: 'Log',
                enableFiltering: false,
                sortable: false,
                width: 60,
                cellTemplate: '<div class="ui-grid-cell-contents text-center"><button ng-click="grid.appScope.vm.showLog(row.entity.id)" class="btn btn-xs btn-default"><i class="fa fa-file-text"></i></button></div>'
            }
        ];

        vm.getJobs = function () {
            jobService.getJobsOnce(vm.jobsParams).then(function (data) {
                vm.gridOptions.totalItems = data.count;
                vm.gridOptions.minRowsToShow = data.results.length;
                vm.gridOptions.virtualizationThreshold = data.results.length;
                vm.gridOptions.data = data.results;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.getJobTypes = function () {
            jobTypeService.getJobTypesOnce().then(function (data) {
                vm.jobTypeValues.push(data.results);
                vm.jobTypeValues = _.flatten(vm.jobTypeValues);
                vm.selectedJobType = _.find(vm.jobTypeValues, { id: vm.jobsParams.job_type_id }) || jobTypeViewAll;
                vm.getJobs();
            }).catch(function () {
                vm.loading = false;
            });
        };

        vm.showLog = function (jobId) {
            // show log modal
            vm.actionClicked = true;
            jobService.getJobDetail(jobId).then(function (data) {
                vm.jobExecution = data.getLatestExecution();
                $uibModal.open({
                    animation: true,
                    templateUrl: 'showLog.html',
                    scope: $scope,
                    size: 'lg',
                    windowClass: 'log-modal-window'
                });
            });
        };

        vm.requeueJobs = function (jobsParams) {
            if (!jobsParams) {
                jobsParams = vm.jobsParams ? vm.jobsParams : { started: vm.lastModifiedStart.toISOString(), ended: vm.lastModifiedStop.toISOString() };
            }
            vm.actionClicked = true;
            vm.loading = true;
            loadService.requeueJobs(jobsParams).then(function () {
                toastr['success']('Requeue Successful');
                vm.getJobs();
            }).catch(function (error) {
                toastr['error']('Requeue request failed');
                vm.loading = false;
            });
        };

        vm.cancelJob = function (job) {
            vm.actionClicked = true;
            vm.loading = true;
            var originalStatus = job.status;
            job.status = 'CANCEL';
            jobService.updateJob(job.id, { status: 'CANCELED' }).then(function () {
                toastr['success']('Job Canceled');
                job.status = 'CANCELED';
            }).catch(function (error) {
                toastr['error'](error);
                job.status = originalStatus;
            }).finally(function () {
                vm.loading = false;
            });
        };
        
        vm.filterResults = function () {
            stateService.setJobsParams(vm.jobsParams);
            vm.loading = true;
            vm.getJobs();
        };

        vm.updateColDefs = function () {
            vm.gridOptions.columnDefs = gridFactory.applySortConfig(vm.colDefs, vm.jobsParams);
        };

        vm.updateJobOrder = function (sortArr) {
            vm.jobsParams.order = sortArr.length > 0 ? sortArr : null;
            filteredByOrder = sortArr.length > 0;
            vm.filterResults();
        };

        vm.updateJobType = function (value) {
            if (value.id !== vm.jobsParams.job_type_id) {
                vm.jobsParams.page = 1;
            }
            vm.jobsParams.job_type_id = value.id === 0 ? null : value.id;
            vm.jobsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.updateJobStatus = function (value) {
            if (value != vm.jobsParams.status) {
                vm.jobsParams.page = 1;
            }
            vm.jobsParams.status = value === 'VIEW ALL' ? null : value;
            vm.jobsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.updateErrorCategory = function (value) {
            if (value != vm.jobsParams.error_category) {
                vm.jobsParams.page = 1;
            }
            vm.jobsParams.error_category = value === 'VIEW ALL' ? null : value;
            vm.jobsParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            vm.gridApi = gridApi;
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (vm.actionClicked) {
                    vm.actionClicked = false;
                } else {
                    $location.path('/jobs/job/' + row.entity.id);
                }
            });
            vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                vm.jobsParams.page = currentPage;
                vm.jobsParams.page_size = pageSize;
                vm.filterResults();
            });
            vm.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                _.forEach(vm.gridApi.grid.columns, function (col) {
                    col.colDef.sort = col.sort;
                });
                stateService.setJobsColDefs(vm.gridApi.grid.options.columnDefs);
                var sortArr = [];
                _.forEach(sortColumns, function (col) {
                    sortArr.push(col.sort.direction === 'desc' ? '-' + col.field : col.field);
                });
                vm.updateJobOrder(sortArr);
            });
        };

        vm.initialize = function () {
            stateService.setJobsParams(vm.jobsParams);
            vm.updateColDefs();
            var user = userService.getUserCreds();
            vm.readonly = !(user && user.is_admin);
            vm.getJobTypes();
            navService.updateLocation('jobs');
        };

        vm.initialize();

        $scope.$watch('vm.selectedJobType', function (value) {
            if (parseInt(value)) {
                value = _.find(vm.jobTypeValues, {id: parseInt(value)});
            }
            if (value) {
                if (vm.loading) {
                    if (filteredByJobType) {
                        vm.updateJobType(value);
                    }
                } else {
                    filteredByJobType = !angular.equals(value, jobTypeViewAll);
                    vm.updateJobType(value);
                }
            }
        });

        $scope.$watch('vm.selectedJobStatus', function (value) {
            if (vm.loading) {
                if (filteredByJobStatus) {
                    vm.updateJobStatus(value);
                }
            } else {
                filteredByJobStatus = value !== 'VIEW ALL';
                vm.updateJobStatus(value);
            }
        });

        $scope.$watch('vm.selectedErrorCategory', function (value) {
            if (vm.loading) {
                if (filteredByErrorCategory) {
                    vm.updateErrorCategory(value);
                }
            } else {
                filteredByErrorCategory = value !== 'VIEW ALL';
                vm.updateErrorCategory(value);
            }
        });

        $scope.$watch('vm.lastModifiedStart', function (value) {
            if (!vm.loading) {
                vm.jobsParams.started = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watch('vm.lastModifiedStop', function (value) {
            if (!vm.loading) {
                vm.jobsParams.ended = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watchCollection('vm.stateService.getJobsColDefs()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.colDefs = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.stateService.getJobsParams()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.jobsParams = newValue;
            vm.updateColDefs();
        });
    }]);
})();
(function () {
    'use strict';
    
    angular.module('scaleApp').controller('jobExecutionLogController', ['$scope', '$location', '$element', '$timeout', 'jobExecutionService', 'scaleConfig', function ($scope, $location, $element, $timeout, jobExecutionService, scaleConfig) {
        var vm = this;
        
        var initialize = function () {
            vm.forceScroll = true;
            vm.jobLogError = null;

            $scope.$watch('execution', function () {
                if ($scope.execution) {
                    jobExecutionService.getLog($scope.execution.id).then(null, null, function (result) {
                        // get difference of max scroll length and current scroll length.
                        var logResult = result.execution_log;
                        if (result.$resolved) {
                            var div = $($element[0]).find('.bash');
                            vm.scrollDiff = (div.scrollTop() + div.prop('offsetHeight')) - div.prop('scrollHeight');
                            if (vm.scrollDiff >= 0) {
                                vm.forceScroll = true;
                            }
                            vm.execLog = logResult;
                        } else {
                            if (result.statusText && result.statusText !== '') {
                                vm.jobLogErrorStatus = result.statusText;
                            }
                            $scope.jobLogError = 'Unable to retrieve job logs.';
                        }
                    });
                }
            });
            $scope.$watch('vm.execLog', function () {
                if (vm.execLog) {
                    if (vm.forceScroll || vm.scrollDiff >= 0) {
                        $timeout(function () {
                            vm.forceScroll = false;
                            var scrlHeight = $($element[0]).find('.bash').prop('scrollHeight');
                            $($element[0]).find('.bash').scrollTop(scrlHeight);
                        }, 50);
                    }
                }
            });
        };

        vm.scrollitem = function (item) {
            console.log(item);
        };

        vm.stdoutChanged = function () {
            console.log('stdout changed.');
        };

        initialize();

    }]).directive('jobExecutionLog', function () {
        return {
            controller: 'jobExecutionLogController',
            controllerAs: 'vm',
            templateUrl: 'modules/jobs/directives/jobExecutionLogTemplate.html',
            restrict: 'E',
            scope: {
                execution: '='
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('aisJobHealthController', ['$rootScope', '$scope', 'jobTypeService', function ($rootScope, $scope, jobTypeService) {
        var vm = this;
        
        vm.loadingJobHealth = true;
        vm.jobHealthError = null;
        vm.jobHealthErrorStatus = null;
        vm.jobHealth = {};

        var getJobTypeStatus = function () {
            jobTypeService.getJobTypeStatus({
                page: null,
                page_size: 1000,
                started: $scope.duration,
                ended: null
            }).then(null, null, function (data) {
                if (data.$resolved) {
                    vm.jobHealthError = null;
                    vm.jobTypeStatus = data.results;
                    vm.total = 0;
                    vm.failed = 0;

                    var performance = {},
                        failures = [];

                    _.forEach(data.results, function (status) {
                        performance = status.getPerformance();
                        vm.total = vm.total + performance.total;
                        vm.failed = vm.failed + performance.failed;
                        failures.push(status.getFailures());
                    });

                    var failureData = [],
                        systemFailures = 0,
                        dataFailures = 0,
                        algorithmFailures = 0;

                    _.forEach(failures, function (f) {
                        _.forEach(f, function (type) {
                            if (type.status === 'SYSTEM') {
                                systemFailures = systemFailures + type.count;
                            } else if (type.status === 'DATA') {
                                dataFailures = dataFailures + type.count;
                            } else if (type.status === 'ALGORITHM') {
                                algorithmFailures = algorithmFailures + type.count;
                            }
                        });
                    });

                    if (systemFailures > 0 || dataFailures > 0 || algorithmFailures > 0) {
                        if (systemFailures > 0) {
                            failureData.push({
                                status: 'SYSTEM',
                                count: systemFailures
                            });
                        }
                        if (algorithmFailures > 0) {
                            failureData.push({
                                status: 'ALGORITHM',
                                count: algorithmFailures
                            });
                        }
                        if (dataFailures > 0) {
                            failureData.push({
                                status: 'DATA',
                                count: dataFailures
                            });
                        }
                    }

                    vm.jobHealth = {
                        gaugeData: vm.total === 0 ? 0 : 100 - ((vm.failed / vm.total) * 100).toFixed(2),
                        donutData: failureData
                    };

                    if ($scope.broadcastData) {
                        $rootScope.$broadcast('jobTypeStatus', vm.jobTypeStatus);
                    }
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.jobHealthErrorStatus = data.statusText;
                    }
                    vm.jobHealthError = 'Unable to retrieve job statistics.';
                }
                vm.loadingJobHealth = false;
            });
        };

        getJobTypeStatus();
    }]).directive('aisJobHealth', function(){
        /**
         * Usage: <ais-job-health />
         **/
        return {
            controller: 'aisJobHealthController',
            controllerAs: 'vm',
            templateUrl: 'modules/jobs/directives/jobHealthTemplate.html',
            restrict: 'E',
            scope: {
                duration: '=',
                broadcastData: '=', // set to true when using another widget in the same view that also calls getJobTypeStatus
                showDescription: '='
            }
        };
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('jobTypeInterfaceDirectiveController', ['$rootScope', '$scope', 'jobTypeService', function ($rootScope, $scope, jobTypeService) {

    }]).directive('aisJobTypeInterface', function(){
        /**
         * Usage: <ais-job-health />
         **/
        return {
            controller: 'jobTypeInterfaceDirectiveController',
            templateUrl: 'modules/jobs/directives/jobTypeInterfaceTemplate.html',
            restrict: 'E',
            scope: {
                jobTypeInterface: '='
            }
        };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('Job', ['scaleConfig', 'JobType', 'scaleService', function (scaleConfig, JobType, scaleService) {
        var Job = function (id, job_type, job_type_rev, event, error, status, priority, num_exes, timeout, max_tries, cpus_required, mem_required, disk_in_required, disk_out_required, created, queued, started, ended, last_status_change, last_modified) {
            this.id = id;
            this.job_type = JobType.transformer(job_type);
            this.job_type_rev = job_type_rev;
            this.event = event;
            this.error = error;
            this.status = status;
            this.priority = priority;
            this.num_exes = num_exes;
            this.timeout = timeout;
            this.max_tries = max_tries;
            this.cpus_required = cpus_required;
            this.mem_required = mem_required;
            this.disk_in_required = disk_in_required;
            this.disk_out_required = disk_out_required;
            this.created = created;
            this.created_formatted = moment.utc(created).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.queued = queued;
            this.started = started;
            this.ended = ended;
            this.last_status_change = last_status_change;
            this.last_modified = last_modified;
            this.last_modified_formatted = moment.utc(last_modified).format(scaleConfig.dateFormats.day_second_utc_nolabel);
        };

        // public methods
        Job.prototype = {
            getDuration: function () {
                var start = this.started,
                    end = this.ended ? this.ended : moment.utc().toISOString();
                return scaleService.calculateDuration(start, end);
            }
        };

        // static methods, assigned to class
        Job.build = function (data) {
            if (data) {
                return new Job(
                    data.id,
                    data.job_type,
                    data.job_type_rev,
                    data.event,
                    data.error,
                    data.status,
                    data.priority,
                    data.num_exes,
                    data.timeout,
                    data.max_tries,
                    data.cpus_required,
                    data.mem_required,
                    data.disk_in_required,
                    data.disk_out_required,
                    data.created,
                    data.queued,
                    data.started,
                    data.ended,
                    data.last_status_change,
                    data.last_modified
                );
            }
            return new Job();
        };

        Job.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Job.build)
                    .filter(Boolean);
            }
            return Job.build(data);
        };

        return Job;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobDetailEvent', ['JobDetailEventRule', function (JobDetailEventRule) {
        var JobDetailEvent = function (id, type, rule, occurred) {
            this.id = id;
            this.type = type;
            this.rule = JobDetailEventRule.transformer(rule);
            this.occurred = occurred;
        };

        // public methods
        JobDetailEvent.prototype = {

        };

        // static methods, assigned to class
        JobDetailEvent.build = function (data) {
            if (data) {
                return new JobDetailEvent(
                    data.id,
                    data.type,
                    data.rule,
                    data.occurred
                );
            }
            return new JobDetailEvent();
        };

        JobDetailEvent.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobDetailEvent.build)
                    .filter(Boolean);
            }
            return JobDetailEvent.build(data);
        };

        return JobDetailEvent;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobDetailEventRule', function () {
        var JobDetailEventRule = function (id, type, is_active, created, archived, last_modified) {
            this.id = id;
            this.type = type;
            this.is_active = is_active;
            this.created = created;
            this.archived = archived;
            this.last_modified = last_modified;
        };

        // public methods
        JobDetailEventRule.prototype = {

        };

        // static methods, assigned to class
        JobDetailEventRule.build = function (data) {
            if (data) {
                return new JobDetailEventRule(
                    data.id,
                    data.type,
                    data.is_active,
                    data.created,
                    data.archived,
                    data.last_modified
                );
            }
            return new JobDetailEventRule();
        };

        JobDetailEventRule.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobDetailEventRule.build)
                    .filter(Boolean);
            }
            return JobDetailEventRule.build(data);
        };

        return JobDetailEventRule;
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobDetailInputData', function () {
        var JobDetailInputData = function (name, value, file_id, file_ids, files) {
            this.name = name;
            this.value = value;
            this.file_id = file_id;
            this.file_ids = file_ids;
            this.files = files;
        };

        // public methods
        JobDetailInputData.prototype = {
            getValue: function () {
                if (this.value)
                    return this.value;
                if (this.file_id)
                    return this.file_id;
                if (this.file_ids)
                    return this.file_ids;
            }
        };

        // static methods, assigned to class
        JobDetailInputData.build = function (data) {
            if (data) {
                return new JobDetailInputData(
                    data.name,
                    data.value,
                    data.file_id,
                    data.file_ids,
                    data.files
                );
            }
            return new JobDetailInputData();
        };

        JobDetailInputData.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobDetailInputData.build)
                    .filter(Boolean);
            }
            return JobDetailInputData.build(data);
        };

        return JobDetailInputData;
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobDetailOutputData', function () {
        var JobDetailOutputData = function (name, workspace_id, files) {
            this.name = name;
            this.workspace_id = workspace_id;
            this.files = files;
        };

        // public methods
        JobDetailOutputData.prototype = {

        };

        // static methods, assigned to class
        JobDetailOutputData.build = function (data) {
            if (data) {
                return new JobDetailOutputData(
                    data.name,
                    data.workspace_id,
                    data.files
                );
            }
            return new JobDetailOutputData();
        };

        JobDetailOutputData.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobDetailOutputData.build)
                    .filter(Boolean);
            }
            return JobDetailOutputData.build(data);
        };

        return JobDetailOutputData;
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobDetails', ['scaleConfig', 'JobType', 'JobExecution', 'Product', 'JobDetailInputData', 'JobDetailOutputData', 'Recipe', 'JobDetailEvent', 'scaleService', function (scaleConfig, JobType, JobExecution, Product, JobDetailInputData, JobDetailOutputData, Recipe, JobDetailEvent, scaleService) {
        var JobDetails = function (id, job_type, job_type_rev, event, error, status, priority, num_exes, timeout, max_tries, cpus_required, mem_required, disk_in_required, disk_out_required, created, queued, started, ended, last_status_change, last_modified, data, results, recipes, job_exes, inputs, outputs) {
            this.id = id;
            this.job_type = JobType.transformer(job_type);
            this.job_type_rev = job_type_rev;
            this.event = JobDetailEvent.transformer(event);
            this.error = error;
            this.status = status;
            this.priority = priority;
            this.num_exes = num_exes;
            this.timeout = timeout;
            this.max_tries = max_tries;
            this.cpus_required = cpus_required;
            this.mem_required = mem_required;
            this.disk_in_required = disk_in_required;
            this.disk_out_required = disk_out_required;
            this.created = created;
            this.created_formatted = moment.utc(created).format(scaleConfig.dateFormats.day_second_utc);
            this.queued = queued;
            this.queued_formatted = moment.utc(queued).format(scaleConfig.dateFormats.day_second_utc);
            this.started = started;
            this.started_formatted = moment.utc(started).format(scaleConfig.dateFormats.day_second_utc);
            this.ended = ended;
            this.ended_formatted = moment.utc(ended).format(scaleConfig.dateFormats.day_second_utc);
            this.last_status_change = last_status_change;
            this.last_modified = last_modified;
            this.data = {
                input_data: JobDetailInputData.transformer(data.input_data),
                version: data.version,
                output_data: JobDetailOutputData.transformer(data.output_data)
            };
            this.results = {
                output_data: JobDetailOutputData.transformer(results.output_data),
                version: results.version
            };
            this.recipes = Recipe.transformer(recipes);
            this.job_exes = JobExecution.transformer(job_exes);
            this.inputs = inputs;
            this.outputs = outputs;
        };

        // public methods
        JobDetails.prototype = {
            getDuration: function () {
                return scaleService.calculateDuration(this.created, this.last_modified);
            },
            getLatestExecution: function(){
                if (this.num_exes > 0 ) {
                    return this.job_exes[0];
                }
                return null;
            },
            getStatusClass: function(){
                // if(this.status === 'COMPLETED'){
                //     return 'label-success';
                // }
                // else if( this.status === 'FAILED'){
                //     return 'label-default';//    return 'label-danger';
                // }
                // else{
                //     return 'label-default';
                // }
                return this.status.toLowerCase();
            }
        };

        // static methods, assigned to class
        JobDetails.build = function (data) {
            if (data) {
                return new JobDetails(
                    data.id,
                    data.job_type,
                    data.job_type_rev,
                    data.event,
                    data.error,
                    data.status,
                    data.priority,
                    data.num_exes,
                    data.timeout,
                    data.max_tries,
                    data.cpus_required,
                    data.mem_required,
                    data.disk_in_required,
                    data.disk_out_required,
                    data.created,
                    data.queued,
                    data.started,
                    data.ended,
                    data.last_status_change,
                    data.last_modified,
                    data.data,
                    data.results,
                    data.recipes,
                    data.job_exes,
                    data.inputs,
                    data.outputs
                );
            }
            return new JobDetails();
        };

        JobDetails.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobDetails.build)
                    .filter(Boolean);
            }
            return JobDetails.build(data);
        };

        return JobDetails;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobExecution', ['scaleConfig', 'Job', 'Node', 'moment', function (scaleConfig, Job, Node, moment) {
        var JobExecution = function (id, status, command_arguments, timeout, pre_started, pre_completed, pre_exit_code, job_started, job_completed, job_exit_code, post_started, post_completed, post_exit_code, created, queued, started, ended, last_modified, job, node, error, environment, cpus_scheduled, mem_scheduled, disk_in_scheduled, disk_out_scheduled, disk_total_scheduled, results, current_stdout_url, current_stderr_url, results_manifest) {
            this.id = id;
            this.status = status;
            this.command_arguments = command_arguments;
            this.timeout = timeout;
            this.pre_started = pre_started;
            this.pre_completed = pre_completed;
            this.pre_exit_code = pre_exit_code;
            this.job_started = job_started;
            this.job_completed = job_completed;
            this.job_exit_code = job_exit_code;
            this.post_started = post_started;
            this.post_completed = post_completed;
            this.post_exit_code = post_exit_code;
            this.created = created;
            this.created_formatted = created ? moment.utc(created).toISOString() : created;
            this.queued = queued;
            this.queued_formatted = queued ? moment.utc(queued).toISOString() : queued;
            this.started = started;
            this.started_formatted = started ? moment.utc(started).toISOString() : started;
            this.ended = ended;
            this.ended_formatted = ended ? moment.utc(ended).toISOString() : ended;
            this.last_modified = last_modified;
            this.last_modified_formatted = last_modified ? moment.utc(last_modified).toISOString() : last_modified;
            this.job = Job.transformer(job);
            this.node = Node.transformer(node);
            this.error = error;
            this.environment = environment;
            this.cpus_scheduled = cpus_scheduled;
            this.mem_scheduled = mem_scheduled;
            this.disk_in_scheduled = disk_in_scheduled;
            this.disk_out_scheduled = disk_out_scheduled;
            this.disk_total_scheduled = disk_total_scheduled;
            this.results = results;
            this.current_stdout_url = current_stdout_url;
            this.current_stderr_url = current_stderr_url;
            this.results_manifest = results_manifest;
        };

        // public methods
        JobExecution.prototype = {
            getDuration: function () {
                return moment.utc(this.job_completed).diff(moment.utc(this.job_started));
            },
            getIcon: function () {
                return this.job.jobType.iconCode ? '<i class="fa">&#x' + this.job.jobType.iconCode + '</i>' : '<i class="fa">&#x' + scaleConfig.defaultIconCode + '</i>';
            }
        };

        // static methods, assigned to class
        JobExecution.build = function (data) {
            if (data) {
                return new JobExecution(
                    data.id,
                    data.status,
                    data.command_arguments,
                    data.timeout,
                    data.pre_started,
                    data.pre_completed,
                    data.pre_exit_code,
                    data.job_started,
                    data.job_completed,
                    data.job_exit_code,
                    data.post_started,
                    data.post_completed,
                    data.post_exit_code,
                    data.created,
                    data.queued,
                    data.started,
                    data.ended,
                    data.last_modified,
                    data.job,
                    data.node,
                    data.error,
                    data.environment,
                    data.cpus_scheduled,
                    data.mem_scheduled,
                    data.disk_in_scheduled,
                    data.disk_out_scheduled,
                    data.disk_total_scheduled,
                    data.results,
                    data.current_stdout_url,
                    data.current_stderr_url,
                    data.results_manifest
                );
            }
            return new JobExecution();
        };

        JobExecution.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobExecution.build)
                    .filter(Boolean);
            }
            return JobExecution.build(data);
        };

        return JobExecution;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobExecutionLog', ['scaleConfig', 'Job', 'Node', function (scaleConfig, Job, Node) {
        var JobExecutionLog = function (id, status, command_arguments, timeout, exit_code, created, queued, scheduled, pre_started, pre_completed, job_started, job_completed, post_started, post_completed, ended, last_modified, job, node, error, is_finished, stdout, stderr) {
            this.id = id;
            this.status = status;
            this.command_arguments = command_arguments;
            this.timeout = timeout;
            this.exit_code = exit_code;
            this.created = created;
            this.queued = queued;
            this.scheduled = scheduled;
            this.pre_started = pre_started;
            this.pre_completed = pre_completed;
            this.job_started = job_started;
            this.job_completed = job_completed;
            this.post_started = post_started;
            this.post_completed = post_completed;
            this.ended = ended;
            this.last_modified = last_modified;
            this.job = Job.transformer(job);
            this.node = Node.transformer(node);
            this.error = error;
            this.is_finished = is_finished;
            this.stdout = stdout;
            this.stdoutHtml = stdout ? stdout.replace(new RegExp('\r?\n','g'), '<br />') : '';
            this.stderr = stderr;
        };

        // public methods
        JobExecutionLog.prototype = {
            toHtml: function(instr){
                return instr
            }

        };

        // static methods, assigned to class
        JobExecutionLog.build = function (data) {
            if (data) {
                return new JobExecutionLog(
                    data.id,
                    data.status,
                    data.command_arguments,
                    data.timeout,
                    data.exit_code,
                    data.created,
                    data.queued,
                    data.scheduled,
                    data.pre_started,
                    data.pre_completed,
                    data.job_started,
                    data.job_completed,
                    data.post_started,
                    data.post_completed,
                    data.ended,
                    data.last_modified,
                    data.job,
                    data.node,
                    data.error,
                    data.is_finished,
                    data.stdout,
                    data.stderr
                );
            }
            return new JobExecutionLog();
        };

        JobExecutionLog.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobExecutionLog.build)
                    .filter(Boolean);
            }
            return JobExecutionLog.build(data);
        };

        return JobExecutionLog;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobType', ['scaleConfig', 'JobTypeInterface', function (scaleConfig, JobTypeInterface) {
        var JobType = function (id, name, title, version, description, is_system, is_long_running, is_active, is_operational, is_paused, uses_docker, docker_privileged, docker_image, priority, timeout, max_tries, cpus_required, mem_required, disk_out_const_required, disk_out_mult_required, icon_code, created, archived, paused, last_modified, job_type_interface) {
            this.id = id;
            this.name = name;
            this.title = title;
            this.version = version;
            this.description = description;
            this.is_system = is_system;
            this.is_long_running = is_long_running;
            this.is_active = is_active;
            this.is_operational = is_operational;
            this.is_paused = is_paused;
            this.uses_docker = uses_docker;
            this.docker_privileged = docker_privileged;
            this.docker_image = docker_image;
            this.priority = priority;
            this.timeout = timeout;
            this.max_tries = max_tries;
            this.cpus_required = cpus_required;
            this.mem_required = mem_required;
            this.disk_out_const_required = disk_out_const_required;
            this.disk_out_mult_required = disk_out_mult_required;
            this.icon_code = icon_code;
            this.created = created;
            this.archived = archived;
            this.paused = paused;
            this.last_modified = last_modified;
            this.job_type_interface = JobTypeInterface.transformer(job_type_interface);
        };

        // public methods
        JobType.prototype = {
            toString: function () {
                return 'JobType';
            },
            getIcon: function () {
                return this.icon_code ? '<i class="fa fa-fw">&#x' + this.icon_code + '</i>' : '<i class="fa fa-fw">&#x' + scaleConfig.defaultIconCode + '</i>';
            },
            getCellText: function () {
                return this.icon_code ? '&#x' + this.icon_code + ';' : '&#x' + scaleConfig.defaultIconCode + ';';
            },
            getCellTitle: function () {
                return this.title;
            }
        };

        // static methods, assigned to class
        JobType.build = function (data) {
            if (data) {
                return new JobType(
                    data.id,
                    data.name,
                    data.title,
                    data.version,
                    data.description,
                    data.is_system,
                    data.is_long_running,
                    data.is_active,
                    data.is_operational,
                    data.is_paused,
                    data.uses_docker,
                    data.docker_privileged,
                    data.docker_image,
                    data.priority,
                    data.timeout,
                    data.max_tries,
                    data.cpus_required,
                    data.mem_required,
                    data.disk_out_const_required,
                    data.disk_out_mult_required,
                    data.icon_code,
                    data.created,
                    data.archived,
                    data.paused,
                    data.last_modified,
                    data.interface
                );
            }
            return new JobType();
        };

        JobType.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobType.build)
                    .filter(Boolean);
            }
            return JobType.build(data);
        };

        return JobType;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeDetails', ['scaleConfig', 'JobTypeInterface', 'JobTypeErrorMapping', 'JobTypeError', 'scaleService', function (scaleConfig, JobTypeInterface, JobTypeErrorMapping, JobTypeError, scaleService) {
        var JobTypeDetails = function (id, name, version, title, description, category, author_name, author_url, is_system, is_long_running, is_active, is_operational, is_paused, icon_code, uses_docker, docker_privileged, docker_image, revision_num, priority, timeout, max_scheduled, max_tries, cpus_required, mem_required, disk_out_const_required, disk_out_mult_required, created, archived, paused, last_modified, job_type_interface, error_mapping, trigger_rule, errors, job_counts_6h, job_counts_12h, job_counts_24h) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.title = title;
            this.description = description;
            this.category = category;
            this.author_name = author_name;
            this.author_url = author_url;
            this.is_system = is_system;
            this.is_long_running = is_long_running;
            this.is_active = is_active;
            this.is_operational = is_operational;
            this.is_paused = is_paused;
            this.icon_code = icon_code;
            this.uses_docker = uses_docker;
            this.docker_privileged = docker_privileged;
            this.docker_image = docker_image;
            this.revision_num = revision_num;
            this.priority = priority;
            this.timeout = timeout;
            this.max_scheduled = max_scheduled;
            this.max_tries = max_tries;
            this.cpus_required = cpus_required;
            this.mem_required = mem_required;
            this.mem_required_formatted = scaleService.calculateFileSizeFromMib(mem_required);
            this.disk_out_const_required = disk_out_const_required;
            this.disk_out_const_required_formatted = scaleService.calculateFileSizeFromMib(disk_out_const_required);
            this.disk_out_mult_required = disk_out_mult_required;
            this.created = created;
            this.archived = archived;
            this.paused = paused;
            this.last_modified = last_modified;
            this.job_type_interface = job_type_interface;
            this.error_mapping = JobTypeErrorMapping.transformer(error_mapping);
            this.trigger_rule = trigger_rule;
            this.errors = JobTypeError.transformer(errors);
            this.job_counts_6h = job_counts_6h;
            this.job_counts_12h = job_counts_12h;
            this.job_counts_24h = job_counts_24h;
        };

        // public methods
        JobTypeDetails.prototype = {
            getIcon: function () {
                return this.icon_code ? '<i class="fa">&#x' + this.icon_code + '</i>' : '<i class="fa">&#x' + scaleConfig.defaultIconCode + '</i>';
            },
            getPerformance: function () {
                var failed6Arr = _.where(this.job_counts_6h, { 'status': 'FAILED' }),
                    failed12Arr = _.where(this.job_counts_12h, { 'status': 'FAILED' }),
                    failed24Arr = _.where(this.job_counts_24h, { 'status': 'FAILED' });

                var completed6 = _.find(this.job_counts_6h, 'status', 'COMPLETED') || { count: 0 },
                    failed6 = _.sum(failed6Arr, 'count'),
                    total6 = failed6Arr.length > 0 ? failed6 + completed6.count : completed6.count,
                    successRate6 = total6 === 0 ? 0 : 100 - ((failed6 / total6) * 100).toFixed(2),
                    completed12 = _.find(this.job_counts_12h, 'status', 'COMPLETED') || { count: 0 },
                    failed12 = _.sum(failed12Arr, 'count'),
                    total12 = failed12Arr.length > 0 ? failed12 + completed12.count : completed12.count,
                    successRate12 = total12 === 0 ? 0 : 100 - ((failed12 / total12) * 100).toFixed(2),
                    completed24 = _.find(this.job_counts_24h, 'status', 'COMPLETED') || { count: 0 },
                    failed24 = _.sum(failed24Arr, 'count'),
                    total24 = failed24Arr.length > 0 ? failed24 + completed24.count : completed24.count,
                    successRate24 = total24 === 0 ? 0 : 100 - ((failed24 / total24) * 100).toFixed(2);

                return {
                    hour6: {
                        rate: successRate6,
                        failed: failed6,
                        completed: completed6.count,
                        total: total6
                    },
                    hour12: {
                        rate: successRate12,
                        failed: failed12,
                        completed: completed12.count,
                        total: total12
                    },
                    hour24: {
                        rate: successRate24,
                        failed: failed24,
                        completed: completed24.count,
                        total: total24
                    }
                };
            },
            getFailures: function () {
                var failed6 = _.where(this.job_counts_6h, { 'status': 'FAILED' }),
                    failed6Values = _.values(_.groupBy(failed6, 'category')),
                    failed12 = _.where(this.job_counts_12h, { 'status': 'FAILED' }),
                    failed12Values = _.values(_.groupBy(failed12, 'category')),
                    failed24 = _.where(this.job_counts_24h, { 'status': 'FAILED' }),
                    failed24Values = _.values(_.groupBy(failed24, 'category'));

                var getFailureCounts = function (categories) {
                    var returnArr = [];
                    _.forEach(categories, function (category) {
                        _.forEach(category, function (val) {
                            returnArr.push({ status: val.category, count: val.count });
                        });
                    });
                    return returnArr;
                };

                return {
                    hour6: getFailureCounts(failed6Values),
                    hour12: getFailureCounts(failed12Values),
                    hour24: getFailureCounts(failed24Values)
                };
            }
        };

        // static methods, assigned to class
        JobTypeDetails.build = function (data) {
            if (data) {
                // TODO: change property returned by API from "interface" to "job_type_interface" because "interface" is a reserved word in JS
                var jobTypeInterface = data.interface ? data.interface : data.job_type_interface;
                return new JobTypeDetails(
                    data.id,
                    data.name,
                    data.version,
                    data.title,
                    data.description,
                    data.category,
                    data.author_name,
                    data.author_url,
                    data.is_system,
                    data.is_long_running,
                    data.is_active,
                    data.is_operational,
                    data.is_paused,
                    data.icon_code,
                    data.uses_docker,
                    data.docker_privileged,
                    data.docker_image,
                    data.revision_num,
                    data.priority,
                    data.timeout,
                    data.max_scheduled,
                    data.max_tries,
                    data.cpus_required,
                    data.mem_required,
                    data.disk_out_const_required,
                    data.disk_out_mult_required,
                    data.created,
                    data.archived,
                    data.paused,
                    data.last_modified,
                    jobTypeInterface,
                    data.error_mapping,
                    data.trigger_rule,
                    data.errors,
                    data.job_counts_6h,
                    data.job_counts_12h,
                    data.job_counts_24h
                );
            }
            return new JobTypeDetails();
        };

        JobTypeDetails.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeDetails.build);
            }
            return JobTypeDetails.build(data);
        };

        return JobTypeDetails;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeError', ['moment', 'scaleConfig', function (moment, scaleConfig) {
        var JobTypeError = function (id, name, title, description, category, created, last_modified) {
            this.id = id;
            this.name = name;
            this.title = title;
            this.description = description;
            this.category = category;
            this.created = created;
            this.created_formatted = created ? moment.utc(created).toISOString() : created;
            this.last_modified = last_modified;
            this.last_modified_formatted = last_modified ? moment.utc(last_modified).toISOString() : last_modified;
        };

        // public methods
        JobTypeError.prototype = {

        };

        // static methods, assigned to class
        JobTypeError.build = function (data) {
            if (data) {
                return new JobTypeError(
                    data.id,
                    data.name,
                    data.title,
                    data.description,
                    data.category,
                    data.created,
                    data.last_modified
                );
            }
            return new JobTypeError();
        };

        JobTypeError.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeError.build)
                    .filter(Boolean);
            }
            return JobTypeError.build(data);
        };

        return JobTypeError;
    }])
})();

(function () {
    'use strict';
    
    angular.module('scaleApp').factory('JobTypeErrorMapping', function () {
        var JobTypeErrorMapping = function (version, exit_codes) {
            this.version = version;
            this.exit_codes = exit_codes;
        };

        // public methods
        JobTypeErrorMapping.prototype = {

        };

        // static methods, assigned to class
        JobTypeErrorMapping.build = function (data) {
            if (data) {
                return new JobTypeErrorMapping(
                    data.version,
                    data.exit_codes
                );
            }
            return new JobTypeErrorMapping();
        };

        JobTypeErrorMapping.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeErrorMapping.build)
                    .filter(Boolean);
            }
            return JobTypeErrorMapping.build(data);
        };

        return JobTypeErrorMapping;
    })
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeInputData', ['scaleConfig', function (scaleConfig) {
        var JobTypeInputData = function (media_types, required, type, name) {
            this.media_types = media_types;
            this.required = required;
            this.type = type;
            this.name = name;
        };

        // public methods
        JobTypeInputData.prototype = {

        };

        // static methods, assigned to class
        JobTypeInputData.build = function (data) {
            if (data) {
                return new JobTypeInputData(
                    data.media_types,
                    data.required,
                    data.type,
                    data.name
                );
            }
            return new JobTypeInputData();
        };

        JobTypeInputData.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeInputData.build);
            }
            return JobTypeInputData.build(data);
        };

        return JobTypeInputData;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeInterface', ['scaleConfig', 'JobTypeInputData', 'JobTypeOutputData', function (scaleConfig, JobTypeInputData, JobTypeOutputData) {
        var JobTypeInterface = function (version, command, command_arguments, input_data, output_data) {
            this.version = version;
            this.command = command;
            this.command_arguments = command_arguments;
            this.input_data = JobTypeInputData.transformer(input_data);
            this.output_data = JobTypeOutputData.transformer(output_data);
        };

        // public methods
        JobTypeInterface.prototype = {
            getIcon: function () {
                return this.iconCode ? '<i class="fa">&#x' + this.iconCode + '</i>' : '<i class="fa">&#x' + scaleConfig.defaultIconCode + '</i>';
            }
        };

        // static methods, assigned to class
        JobTypeInterface.build = function (data) {
            if (data) {
                return new JobTypeInterface(
                    data.version,
                    data.command,
                    data.command_arguments,
                    data.input_data,
                    data.output_data
                );
            }
            return new JobTypeInterface();
        };

        JobTypeInterface.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeInterface.build)
                    .filter(Boolean);
            }
            return JobTypeInterface.build(data);
        };

        return JobTypeInterface;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeOutputData', function () {
        var JobTypeOutputData = function (name, type, required, media_type) {
            this.name = name;
            this.type = type;
            this.required = required;
            this.media_type = media_type;
        };

        // public methods
        JobTypeOutputData.prototype = {

        };

        // static methods, assigned to class
        JobTypeOutputData.build = function (data) {
            if (data) {
                return new JobTypeOutputData(
                    data.name,
                    data.type,
                    data.required,
                    data.media_type
                );
            }
            return new JobTypeOutputData();
        };

        JobTypeOutputData.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeOutputData.build)
                    .filter(Boolean);
            }
            return JobTypeOutputData.build(data);
        };

        return JobTypeOutputData;
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('JobTypeStatus', ['scaleConfig', 'JobType', 'JobExecution', function (scaleConfig, JobType, JobExecution) {
        var JobTypeStatus = function (job_type, job_counts) {
            this.job_type = JobType.transformer(job_type);
            this.job_counts = job_counts;
            this.has_running = _.find(job_counts, 'status', 'RUNNING');
            this.description = this.getPerformance().rateDescription;
        };

        // public methods
        JobTypeStatus.prototype = {
            toString: function () {
                return 'JobTypeStatus';
            },
            getPerformance: function () {
                var failedArr = _.sortByOrder(_.filter(this.job_counts, { status: 'FAILED' }), ['count'], ['desc']),
                    completed = _.find(this.job_counts, 'status', 'COMPLETED') || { count: 0 },
                    failed = _.sum(failedArr, 'count'),
                    failedCategory = failedArr.length > 0 ? failedArr[0].category : '',
                    total = failedArr.length > 0 ? failed + completed.count : completed.count,
                    successRate = total === 0 ? 0 : 100 - ((failed / total) * 100).toFixed(2),
                    successRateDescription = 'success';

                if (successRate <= 30 && total > 0) {
                    successRateDescription = 'error';
                } else if (successRate > 30 && successRate <= 60 && total > 0) {
                    successRateDescription = 'warning';
                } else if (total === 0 && !this.has_running) {
                    successRateDescription = 'z_inactive'; // prepend with 'z_' for ordering purposes
                }

                return {
                    rate: successRate,
                    rateDescription: successRateDescription,
                    failed: failed,
                    failedCategory: failedCategory,
                    completed: completed.count,
                    total: total
                };
            },
            getRunning: function () {
                return _.find(this.job_counts, 'status', 'RUNNING') || { count: 0 };
            },
            getFailures: function () {
                var failed = _.where(this.job_counts, { 'status': 'FAILED' });

                _.forEach(failed, function (f) {
                    var category = _.find(scaleConfig.errorCategories, { name: f.category });
                    f.order = category ? category.order : '';
                });

                var failedValues = _.values(_.groupBy(failed, 'order'));

                var getFailureCounts = function (categories) {
                    var returnArr = [];
                    _.forEach(categories, function (category) {
                        _.forEach(category, function (val) {
                            returnArr.push({ status: val.category, count: val.count, order: val.order });
                        });
                    });
                    return _.sortByOrder(returnArr, ['order'], ['desc']);
                };

                return getFailureCounts(failedValues);
            },
            getCellFill: function () {
                var status = this.getPerformance();
                if (status.rateDescription === 'z_inactive') {
                    return scaleConfig.colors.chart_gray_dark;
                }
                return scaleConfig.colors.chart_green;
            },
            getCellActivity: function () {
                var running = this.getRunning();
                if (running.count > 0) {
                    return '&#x' + scaleConfig.activityIconCode + ';';
                }
                return '';
            },
            getCellActivityTotal: function () {
                return this.getRunning().count > 0 ? this.getRunning().count : '';
            },
            getCellError: function () {
                var performance = this.getPerformance();
                return 'Failed: ' + (performance.failed);
            },
            getCellTotal: function () {
                var performance = this.getPerformance();
                return performance.completed;
            },
            getCellPauseResume: function () {
                return;
            },
            getCellFailures: function () {
                return _.map(this.getFailures(), 'status');
            }
        };

        // static methods, assigned to class
        JobTypeStatus.build = function (data) {
            if (data) {
                return new JobTypeStatus(
                    data.job_type,
                    data.job_counts
                );
            }
            return new JobTypeStatus();
        };

        JobTypeStatus.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(JobTypeStatus.build)
                    .filter(Boolean);
            }
            return JobTypeStatus.build(data);
        };

        return JobTypeStatus;
    }]);
})();

(function (){
    'use strict';

    angular.module('scaleApp').factory('Product', ['JobType', 'scaleService', 'scaleConfig', function (JobType, scaleService, scaleConfig) {
        var Product = function (id, workspace, file_name, media_type, file_size, data_type, is_deleted, uuid, url, created, deleted, data_started, data_ended, geometry, center_point, meta_data, countries, last_modified, is_operational, is_published, published, unpublished, job_type, job, job_exe, update, source_files) {
            this.id = id;
            this.workspace = workspace;
            this.file_name = file_name;
            this.media_type = media_type;
            this.file_size = file_size;
            this.file_size_readable = this.getReadableFileSize();
            this.data_type = data_type;
            this.is_deleted = is_deleted;
            this.uuid = uuid;
            this.url = url;
            this.created = created;
            this.created_formatted = created ? moment.utc(created).toISOString() : created;
            this.deleted = deleted;
            this.data_started = data_started;
            this.data_ended = data_ended;
            this.geometry = geometry;
            this.center_point = center_point;
            this.meta_data = meta_data;
            this.countries = countries;
            this.last_modified = last_modified;
            this.last_modified_formatted = last_modified ? moment.utc(last_modified).toISOString() : last_modified;
            this.is_operational = is_operational;
            this.is_operational_label = is_operational ? 'Operational' : 'R&amp;D';
            this.is_published = is_published;
            this.published = published;
            this.unpublished = unpublished;
            this.job_type = JobType.transformer(job_type);
            this.job = job;
            this.job_exe = job_exe;
            this.update = update;
            this.source_files = source_files;
        };

        // public methods
        Product.prototype = {
            getDuration: function () {
                return moment.utc(this.last_modified).diff(moment.utc(this.created));
            },
            getReadableFileSize: function () {
                return scaleService.calculateFileSizeFromBytes(this.file_size);
            }
        };

        // static methods, assigned to class
        Product.build = function (data) {
            if (data) {
                return new Product(
                    data.id,
                    data.workspace,
                    data.file_name,
                    data.media_type,
                    data.file_size,
                    data.data_type,
                    data.is_deleted,
                    data.uuid,
                    data.url,
                    data.created,
                    data.deleted,
                    data.data_started,
                    data.data_ended,
                    data.geometry,
                    data.center_point,
                    data.meta_data,
                    data.countries,
                    data.last_modified,
                    data.is_operational,
                    data.is_published,
                    data.published,
                    data.unpublished,
                    data.job_type,
                    data.job,
                    data.job_exe,
                    data.update,
                    data.source_files
                );
            }
            return new Product();
        };

        Product.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Product.build)
                    .filter(Boolean);
            }
            return Product.build(data);
        };

        return Product;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('RunningJob', ['scaleConfig', 'scaleService', 'JobType', function (scaleConfig, scaleService, JobType) {
        var RunningJob = function (count, longest_running, job_type) {
            this.count = count;
            this.longest_running = longest_running;
            this.job_type = JobType.transformer(job_type);
        };

        // public methods
        RunningJob.prototype = {
            getDuration: function () {
                return scaleService.calculateDuration(this.longest_running, moment.utc().toISOString());
            },
            getIcon: function () {
                var icon = this.job_type.icon_code ? '<i class="fa fa-fw">&#x' + this.job_type.icon_code + '</i>' : '<i class="fa fa-fw">&#x' + scaleConfig.defaultIconCode + '</i>';
                return icon;
            }
        };

        // static methods, assigned to class
        RunningJob.build = function (data) {
            if (data) {
                return new RunningJob(
                    data.count,
                    data.longest_running,
                    data.job_type
                );
            }
            return new RunningJob();
        };

        RunningJob.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RunningJob.build)
                    .filter(Boolean);
            }
            return RunningJob.build(data);
        };

        return RunningJob;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('SystemFailure', ['scaleConfig', 'scaleService', function (scaleConfig, scaleService) {
        var SystemFailure = function (count, job_type_name, job_type_version, error_name, first_error, last_error) {
            this.count = count;
            this.job_type_name = job_type_name;
            this.job_type_version = job_type_version;
            this.error_name = error_name;
            this.first_error = first_error;
            this.last_error = last_error;
        };

        // public methods
        SystemFailure.prototype = {
            getDuration: function () {
                return scaleService.calculateDuration(this.first_error, this.last_error);
            },
            getIcon: function () {
                var configJobType = _.find(scaleConfig.jobTypes, 'title', this.job_type_name);
                if (configJobType) {
                    return configJobType.icon;
                }
                return scaleConfig.defaultIcon;
            }
        };

        // static methods, assigned to class
        SystemFailure.build = function (data) {
            if (data) {
                return new SystemFailure(
                    data.count,
                    data.job_type_name,
                    data.job_type_version,
                    data.error_name,
                    data.first_error,
                    data.last_error
                );
            }
            return new SystemFailure();
        };

        SystemFailure.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(SystemFailure.build)
                    .filter(Boolean);
            }
            return SystemFailure.build(data);
        };

        return SystemFailure;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('jobExecutionService', ['$http', '$q', '$resource', 'poller', 'scaleConfig', 'JobExecution', 'JobExecutionLog', function ($http, $q, $resource, poller, scaleConfig, JobExecution, JobExecutionLog) {

        var getJobExecutionsParams = function (page, page_size, started, ended, order, status, job_type_id, job_type_name, job_type_category, node_id) {
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                order: order,
                status: status,
                job_type_id: job_type_id,
                job_type_name: job_type_name,
                job_type_category: job_type_category,
                node_id: node_id
            };
        };

        return {
            getJobExecutions: function (params) {
                params = params || getJobExecutionsParams();
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'job-executions/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = JobExecution.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getJobExecutionDetails: function (id) {
                var d = $q.defer();

                $http.get(scaleConfig.urls.apiPrefix + 'job-executions/' + id + '/').success(function (data) {
                    d.resolve(JobExecution.transformer(data));
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getLogOnce: function(execId){
                var d = $q.defer();

                $http.get(scaleConfig.urls.apiPrefix + 'job-executions/' + execId + '/logs/').success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getLog: function(execId){
                var url = url || scaleConfig.urls.apiPrefix + 'job-executions/' + execId + '/logs/';

                // Update view. Since a promise can only be resolved or rejected once but we want
                // to keep track of all requests, poller service uses the notifyCallback. By default
                // poller only gets notified of success responses.
                var jobExecutionLogResource = $resource(url);
                var jobExecutionLogPoller = poller.get(jobExecutionLogResource, {
                        delay: scaleConfig.pollIntervals.jobExecutionLog
                    });

                return jobExecutionLogPoller.promise.then(null, null, function (result) {
                    if(result.$resolved){
                        result.execution_log = JobExecutionLog.transformer(result);
                        if(result.execution_log.status === 'COMPLETED' || result.execution_log.status === 'FAILED'){
                            jobExecutionLogPoller.stop();
                        }
                        return result;
                    } else {
                        jobExecutionLogPoller.stop();
                        return result;
                    }

                });
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('jobService', ['$http', '$q', '$resource', 'scaleConfig', 'Job', 'JobDetails', 'RunningJob', 'poller', 'pollerFactory', function($http, $q, $resource, scaleConfig, Job, JobDetails, RunningJob, poller, pollerFactory) {

        var getJobsParams = function (page, page_size, started, ended, order, status, job_type_id, job_type_name, job_type_category, url) {
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                order: order,
                status: status,
                job_type_id: job_type_id,
                job_type_name: job_type_name,
                job_type_category: job_type_category,
                url: url
            };
        };

        var getJobUpdateData = function (status) {
            return {
                status: status
            };
        };

        return {
            getJobs: function (params) {
                params = params || getJobsParams();
                params.url = params.url ? params.url : scaleConfig.urls.apiPrefix + 'jobs/';

                var jobsResource = $resource(params.url, params),
                    jobsPoller = pollerFactory.newPoller(jobsResource, scaleConfig.pollIntervals.jobs);

                return jobsPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        data.results = Job.transformer(data.results);
                    } else {
                        jobsPoller.stop();
                    }
                    return data;
                });
            },
            getJobsOnce: function (params) {
                params = params || getJobsParams();
                var d = $q.defer();

                $http({
                    url: params.url ? params.url : scaleConfig.urls.apiPrefix + 'jobs/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = Job.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },
            getJobCountsByStatus: function (hour) {
                hour = hour || 3;
                var d = $q.defer();

                $http.get(scaleConfig.urls.getJobCountsByStatus(hour)).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getJobDetail: function (id) {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'jobs/' + id + '/').success(function (data) {
                    d.resolve(JobDetails.transformer(data));
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getRunningJobs: function (pageNumber, pageSize) {
                var params = {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                };
                var runningJobsResource = $resource(scaleConfig.urls.apiPrefix + 'job-types/running/', params),
                    runningJobsPoller = pollerFactory.newPoller(runningJobsResource, scaleConfig.pollIntervals.runningJobs);

                return runningJobsPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        data.results = RunningJob.transformer(data.results);
                    } else {
                        runningJobsPoller.stop();
                    }
                    return data;
                });
            },
            getRunningJobsOnce: function (pageNumber, pageSize) {
                var params = {
                    pageNumber: pageNumber,
                    pageSize: pageSize
                };
                var d = $q.defer();

                $http.get(scaleConfig.urls.apiPrefix + 'job-types/running/', params).success(function (data) {
                    data.results = RunningJob.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            updateJob: function (id, data) {
                data = data || getJobUpdateData();
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'jobs/' + id + '/',
                    method: 'PATCH',
                    data: data
                }).success(function (result) {
                    d.resolve(result);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('jobTypeService', ['$http', '$q', '$resource', 'poller', 'pollerFactory', 'scaleConfig', 'jobService', 'JobType', 'JobTypeDetails', 'JobTypeStatus', function ($http, $q, $resource, poller, pollerFactory, scaleConfig, jobService, JobType, JobTypeDetails, JobTypeStatus) {
        /*var totalJobTypes = 5;

        var getTotalJobTypes = function () {
            return totalJobTypes;
        };

        var setTotalJobTypes = function () {
            totalJobTypes = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
        };

        setInterval(function () {
            setTotalJobTypes();
        }, 3100);*/

        var getJobTypeParams = function (page, page_size, started, ended, name, category, order) {
            return {
                page: page,
                page_size: page_size ? page_size : 1000,
                started: started,
                ended: ended,
                name: name,
                category: category,
                order: order ? order : ['title', 'version']
            };
        };

        var getJobTypeStatusParams = function (page, page_size, started, ended) {
            return {
                page: page,
                page_size: page_size ? page_size : 1000,
                started: started,
                ended: ended
            };
        };

        return {
            getJobTypes: function (params) {
                params = params || getJobTypeParams();
                // var params = {
                //     order: order || ['name','version']
                // };

                var jobTypesResource = $resource(scaleConfig.urls.apiPrefix + 'job-types/', params),
                    jobTypesPoller = pollerFactory.newPoller(jobTypesResource, scaleConfig.pollIntervals.jobTypes);

                return jobTypesPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        /*var returnResult = {
                            $resolved: true,
                            job_types: []
                        };
                        for (var i = 1; i < getTotalJobTypes(); i++) {
                            returnResult.job_types.push(
                                {
                                    "is_system": true,
                                    "paused": null,
                                    "disk": 64.0,
                                    "id": i,
                                    "docker_image": null,
                                    "archived": null,
                                    "uses_docker": false,
                                    "priority": 10,
                                    "version": "1.0",
                                    "icon_code": scaleConfig.jobTypes[i - 1].code,
                                    "description": "Ingests a source file into a workspace",
                                    "mem": 64.0,
                                    "is_active": true,
                                    "cpus": 1.0,
                                    "last_modified": "2015-03-11T00:00:00Z",
                                    "max_tries": 3,
                                    "is_paused": false,
                                    "name": scaleConfig.jobTypes[i - 1].title,
                                    "created": "2015-03-11T00:00:00Z",
                                    "timeout": 1800,
                                    "is_long_running": false
                                }
                            )
                        }
                        result = returnResult;*/

                        data.results = JobType.transformer(data.results);
                        return data;
                    } else {
                        jobTypesPoller.stop();
                        return data;
                    }
                });
            },
            getJobTypesOnce: function (params) {
                params = params || getJobTypeParams();

                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'job-types/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = JobType.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getJobTypeStatus: function (params) {
                params = params || getJobTypeStatusParams();

                var jobTypeStatusResource = $resource(scaleConfig.urls.apiPrefix + 'job-types/status/', params),
                    jobTypeStatusPoller = pollerFactory.newPoller(jobTypeStatusResource, scaleConfig.pollIntervals.jobTypeStatus);

                return jobTypeStatusPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        /*var returndata = {
                            $resolved: true,
                            job_type_stats: []
                        };
                        for (var i = 0; i < getTotalJobTypes(); i++) {
                            returndata.job_type_stats.push(
                                {
                                    "id": i,
                                    "icon_code": "",
                                    "name": "",
                                    "version": "",
                                    "num_completed": Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000,
                                    "num_canceled": Math.floor(Math.random() * (100 - 20 + 1)) + 20,
                                    "num_error_DATA": Math.floor(Math.random() * (9000 - 20 + 1)) + 20,
                                    "num_error_SYSTEM": Math.floor(Math.random() * (9000 - 20 + 1)) + 20,
                                    "num_error_ALGORITHM": Math.floor(Math.random() * (9000 - 20 + 1)) + 20
                                }
                            )
                        }
                        data = returndata;*/

                        data.results = JobTypeStatus.transformer(data.results);
                    } else {
                        jobTypeStatusPoller.stop();
                    }
                    return data;
                });
            },
            getJobTypeStatusOnce: function (params) {
                var d = $q.defer();

                params = params || getJobTypeStatusParams();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'job-types/status/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = JobTypeStatus.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getJobTypeDetails: function (id) {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'job-types/' + id + '/').success(function (data) {
                    d.resolve(JobTypeDetails.transformer(data));
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            updateJobType: function (data){
                var updatedJobType = function(data){
                    return {
                        error_mappings: data.error_mappings,
                        is_paused: data.is_paused
                    };
                };
                var updatedData = updatedJobType(data);
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'job-types/' + data.id + '/',
                    method: 'PATCH',
                    data: updatedData
                }).success(function (result) {
                    d.resolve(JobTypeDetails.transformer(result));
                }).error(function (error) {
                    d.reject(error);
                });                
                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('loadController', ['$scope', '$location', 'scaleService', 'stateService', 'navService', 'loadService', 'uiGridConstants', 'scaleConfig', 'subnavService', 'QueueStatus', 'gridFactory', function($scope, $location, scaleService, stateService, navService, loadService, uiGridConstants, scaleConfig, subnavService, QueueStatus, gridFactory) {
        var vm = this;
        
        vm.loading = true;
        vm.queueStatusError = null;
        vm.queueStatusErrorStatus = null;
        vm.totalQueued = 0;
        vm.subnavLinks = scaleConfig.subnavLinks.load;
        subnavService.setCurrentPath('load/queued');
        
        var jobsParams = stateService.getJobsParams();

        vm.getPage = function (pageNumber, pageSize) {
            vm.loading = true;
            loadService.getQueueStatus(pageNumber - 1, pageSize).then(function (data) {
                var newData = [];
                for (var i = 0; i < vm.gridOptions.paginationPageSize; i++) {
                    newData.push(data.jobs[i]);
                }
                vm.gridOptions.minRowsToShow = newData.length;
                vm.gridOptions.virtualizationThreshold = newData.length;
                vm.gridOptions.data = newData;
            }).catch(function (error) {
                vm.status = 'Unable to load queue status: ' + error.message;
                console.error(vm.status);
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function () {
            vm.gridOptions = gridFactory.defaultGridOptions();
            vm.gridOptions.enableSorting = false;
            vm.gridOptions.columnDefs = [
                {
                    field: 'job_type.title',
                    displayName: 'Job Type',
                    enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-bind-html="row.entity.job_type.getIcon()"></span> {{ row.entity.job_type.title }}</div>'
                },
                { field: 'job_type.version', displayName: 'Version', enableFiltering: false },
                { field: 'highest_priority', enableFiltering: false },
                {
                    field: 'longestQueued',
                    displayName: 'Duration of Longest Queued Job',
                    enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-right">{{ row.entity.getDuration() }}</div>'
                },
                { field: 'count', enableFiltering: false }
            ];
            vm.gridOptions.data = [];
            vm.gridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                vm.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    stateService.setJobsParams({job_type_id: row.entity.job_type.id, status: 'QUEUED', page: jobsParams.page, page_size: jobsParams.page_size, order: jobsParams.order});
                    $location.path('/jobs');
                });
                vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                    vm.getPage(currentPage, pageSize);
                });
            };


            loadService.getQueueStatus(0, vm.gridOptions.paginationPageSize).then(null, null, function (result) {
                if (result.$resolved) {
                    vm.gridOptions.minRowsToShow = result.results.length;
                    vm.gridOptions.virtualizationThreshold = result.results.length;
                    vm.gridOptions.data = result.results;
                    vm.gridOptions.totalItems = result.results.length;
                    vm.totalQueued = _.sum(result.results, 'count');
                    console.log('queue status updated');
                } else {
                    if (result.statusText && result.statusText !== '') {
                        vm.queueStatusErrorStatus = result.statusText;
                    }
                    vm.queueStatusError = 'Unable to retrieve queue status.';
                }
                vm.loading = false
            });

            navService.updateLocation('load');
        };
        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('loadDepthController', ['$scope', '$location', 'navService', 'scaleConfig', 'subnavService', function ($scope, $location, navService, scaleConfig, subnavService) {
        var vm = this;
        
        vm.subnavLinks = scaleConfig.subnavLinks.load;
        subnavService.setCurrentPath('load/depth');

        vm.loading = false;

        var initialize = function () {
            navService.updateLocation('load');
        };

        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('queueRunningController', ['$scope', '$location', 'scaleService', 'stateService', 'navService', 'jobService', 'gridFactory', 'uiGridConstants', 'scaleConfig', 'subnavService', function($scope, $location, scaleService, stateService, navService, jobService, gridFactory, uiGridConstants, scaleConfig, subnavService) {
        var vm = this;
        
        vm.loading = true;
        vm.runningJobsError = null;
        vm.runningJobsErrorStatus = null;
        vm.totalRunning = 0;
        vm.subnavLinks = scaleConfig.subnavLinks.load;
        subnavService.setCurrentPath('load/running');

        var jobsParams = stateService.getJobsParams();

        vm.getPage = function (pageNumber, pageSize){
            vm.loading = true;
            jobService.getRunningJobsOnce(pageNumber - 1, pageSize).then(function (data) {
                var newData = [];
                for(var i = 0; i < vm.gridOptions.paginationPageSize; i++){
                    newData.push(data.results[i]);
                }
                vm.gridOptions.minRowsToShow = newData.length;
                vm.gridOptions.virtualizationThreshold = newData.length;
                vm.gridOptions.data = newData;
            }).catch(function (error) {
                vm.status = 'Unable to load queue running status: ' + error.message;
                console.error(vm.status);
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function () {
            vm.gridOptions = gridFactory.defaultGridOptions();
            vm.gridOptions.enableSorting = false;
            vm.gridOptions.columnDefs = [
                {
                    field: 'title',
                    displayName: 'Job Type',
                    enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-bind-html="row.entity.getIcon()"></span> {{ row.entity.job_type.title }}</div>'
                },
                {field: 'job_type.version', displayName: 'Version', enableFiltering: false},
                {field: 'count', displayName: 'Number of Jobs', enableFiltering: false},
                {
                    field: 'longestRunning',
                    displayName: 'Duration of Longest Running Job',
                    enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-right">{{ row.entity.getDuration() }}</div>'
                }
            ];
            vm.gridOptions.data = [];
            vm.gridOptions.onRegisterApi = function (gridApi) {
                // set gridApi on scope
                vm.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    stateService.setJobsParams({job_type_id: row.entity.job_type.id, status: 'RUNNING', page: jobsParams.page, page_size: jobsParams.page_size, order: jobsParams.order});
                    $location.path('/jobs');
                });
                vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                    vm.getPage(currentPage, pageSize);
                });
            };

            jobService.getRunningJobs(0, vm.gridOptions.paginationPageSize).then(null, null, function (data) {
                if (data.$resolved) {
                    vm.gridOptions.minRowsToShow = data.results.length;
                    vm.gridOptions.virtualizationThreshold = data.results.length;
                    vm.gridOptions.data = data.results;
                    vm.gridOptions.totalItems = data.results.length;
                    vm.totalRunning = _.sum(data.results, 'count');
                    console.log('running jobs updated');
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.runningJobsErrorStatus = data.statusText;
                    }
                    vm.runningJobsError = 'Unable to retrieve running jobs.';
                }
                vm.loading = false;
            });
            navService.updateLocation('load');
        };
        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('QueueStatus', ['scaleConfig', 'scaleService', 'JobType', function (scaleConfig, scaleService, JobType) {
        var QueueStatus = function (job_type, count, longest_queued, highest_priority) {
            this.job_type = JobType.transformer(job_type);
            this.count = count;
            this.longest_queued = longest_queued;
            this.highest_priority = highest_priority;
        };

        // public methods
        QueueStatus.prototype = {
            getIcon: function () {
                return this.job_type.icon_code ? '<i class="fa">&#x' + this.job_type.icon_code + '</i>' : '<i class="fa">&#x' + scaleConfig.defaultIconCode + '</i>';
            },
            getDuration: function () {
                return scaleService.calculateDuration(this.longest_queued, moment.utc().toISOString());
            }
        };

        // static methods, assigned to class
        QueueStatus.build = function (data) {
            if (data) {
                return new QueueStatus(
                    data.job_type,
                    data.count,
                    data.longest_queued,
                    data.highest_priority
                );
            }
            return new QueueStatus();
        };

        QueueStatus.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(QueueStatus.build);
            }
            return QueueStatus.build(data);
        };

        return QueueStatus;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('loadService', ['$http', '$q', '$resource', 'scaleConfig', 'poller', 'pollerFactory', 'QueueStatus', function($http, $q, $resource, scaleConfig, poller, pollerFactory, QueueStatus) {
        var getJobLoadParams = function (page, page_size, started, ended, order, status, job_type_id, job_type_name, job_type_category, url) {
            return {
                started: started,
                ended: ended,
                job_type_id: job_type_id,
                job_type_name: job_type_name,
                job_type_category: job_type_category,
                page_size: 1000,
                url: url
            };
        };

        var getRequeueJobsParams = function (started, ended, job_status, job_type_ids, job_type_names, job_type_categories, priority, url) {
            return {
                started: started,
                ended: ended,
                job_status: job_status,
                job_ids: job_ids,
                job_type_ids: job_type_ids,
                job_type_names: job_type_names,
                job_type_categories: job_type_categories,
                priority: priority,
                url: url
            };
        };

        return {
            getQueueStatus: function (pageNumber, pageSize) {
                var params = {
                    page_number: pageNumber,
                    page_size: pageSize
                };

                var queueStatusResource = $resource(scaleConfig.urls.apiPrefix + 'queue/status/', params),
                    queueStatusPoller = pollerFactory.newPoller(queueStatusResource, scaleConfig.pollIntervals.queueStatus);

                return queueStatusPoller.promise.then(null, null, function (result) {
                    if (result.$resolved) {
                        result.results = QueueStatus.transformer(result.results);
                    } else {
                        queueStatusPoller.stop();
                    }
                    return result;
                });
            },
            getQueueStatusOnce: function () {
                var d = $q.defer();

                $http.get(scaleConfig.urls.apiPrefix + 'queue/status/').success(function (data) {
                    data.results = QueueStatus.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },
            requeueJobs: function (params) {
                params = params || getRequeueJobsParams();
                params.url = params.url ? params.url : scaleConfig.urls.apiPrefix + 'queue/requeue-jobs/';

                var d = $q.defer();

                $http.post(params.url, params).success(function (result) {
                    d.resolve(result);
                }).error(function(error){
                    d.reject(error);
                });

                return d.promise;
            },
            getJobLoad: function (params) {
                params = params || getJobLoadParams();
                params.url = params.url ? params.url : scaleConfig.urls.apiPrefix + 'load/';

                var jobLoadResource = $resource(params.url, params),
                    jobLoadPoller = pollerFactory.newPoller(jobLoadResource, scaleConfig.pollIntervals.jobLoad);

                return jobLoadPoller.promise.then(null, null, function (data) {
                    if (!data.$resolved) {
                        jobLoadPoller.stop();
                    }
                    return data;
                });
            },
            getJobLoadOnce: function (params) {
                params = params || getJobLoadParams();
                var d = $q.defer();

                $http({
                    url: params.url ? params.url : scaleConfig.urls.apiPrefix + 'load/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('metricsController', ['$scope', '$location', 'scaleConfig', 'scaleService', 'navService', 'metricsService', 'moment', function ($scope, $location, scaleConfig, scaleService, navService, metricsService, moment) {
        var vm = this,
            chart = null,
            colArr = [],
            colNames = {},
            xArr = [],
            removeIds = [],
            yUnits = [];

        vm._ = _;
        vm.moment = moment;
        vm.loadingMetrics = false;
        vm.chartArr = [];
        vm.chartData = [];
        vm.chartStyle = '';
        vm.selectedDataType = {};
        vm.inputStartDate = moment.utc().subtract(1, 'M').toDate();
        vm.inputEndDate = moment.utc().toDate();
        vm.openInputStart = function ($event) {
            $event.stopPropagation();
            vm.inputStartOpened = true;
        };
        vm.inputStartOpened = false;
        vm.openInputEnd = function ($event) {
            $event.stopPropagation();
            vm.inputEndOpened = true;
        };
        vm.inputEndOpened = false;
        vm.dateModelOptions = {
            timezone: '+000'
        };
        vm.dataTypeFilterText = '';
        vm.filtersApplied = [];
        vm.filteredChoices = [];
        vm.filteredChoicesOptions = [];
        vm.selectedMetrics = [];
        vm.columnGroupsOptions = [];
        vm.columns = [];
        vm.groups = [];
        vm.chartTitle = '';
        vm.chartDisplay = 'stacked';
        vm.stackedClass = 'btn-primary';
        vm.groupedClass = 'btn-default';
        vm.subchartClass = 'btn-primary';
        vm.subchartEnabled = false;
        vm.chartType = 'bar';
        vm.chartTypeDisplay = 'Bar';
        vm.barClass = 'btn-primary';
        vm.areaClass = 'btn-default';
        vm.lineClass = 'btn-default';
        vm.splineClass = 'btn-default';
        vm.scatterClass = 'btn-default';

        vm.getPlotDataParams = function (obj) {
            return {
                page: null,
                page_size: null,
                started: obj.started,
                ended: obj.ended,
                choice_id: obj.choice_id,
                column: obj.column,
                group: obj.group,
                dataType: obj.dataType.name
            };
        };

        vm.resetSelections = function () {
            vm.inputStartDate = moment.utc().subtract(1, 'M').toDate();
            vm.inputEndDate = moment.utc().toDate();
            vm.selectedDataType = {};
            vm.changeDataTypeSelection();
        };

        vm.updateChart = function () {
            vm.chartData = [];
            if (vm.chartArr.length === 0) {
                // nothing to show on chart
                chart.destroy();
                chart = null;
            } else {
                var callInit = _.after(vm.chartArr.length, function () {
                    // only initChart after this function has been called for all datasets in chartArr
                    vm.loadingMetrics = false;
                    vm.initChart();
                });

                _.forEach(vm.chartArr, function (obj) {
                    var params = vm.getPlotDataParams(obj);
                    metricsService.getPlotData(params).then(function (data) {
                    //metricsService.getGeneratedPlotData({query: obj, params: params}).then(function (data) {
                        vm.chartData.push({
                            query: obj,
                            results: data.results
                        });
                        callInit();
                    }).catch(function (error) {
                        vm.loadingMetrics = false;
                        console.log(error);
                        toastr['error'](error);
                    });
                });
            }
        };

        vm.addToChart = function () {
            vm.chartArr = []; // comment this out if allowing multiple adds
            vm.loadingMetrics = true;
            var filteredChoices = [],
                selectedColumns = [];
            // find the filter object associated with the chosen filter IDs
            _.forEach(vm.filtersApplied, function (id) {
                filteredChoices.push(_.find(vm.filteredChoices, { id: parseInt(id) }));
            });
            if (angular.isArray(vm.selectedMetrics)) {
                _.forEach(vm.selectedMetrics, function (metric) {
                    selectedColumns.push(_.find(vm.columns, { name: metric }));
                });
            } else {
                selectedColumns.push(_.find(vm.columns, { name: vm.selectedMetrics }));
            }
            vm.chartArr.push({
                started: vm.inputStartDate.toISOString(),
                ended: vm.inputEndDate.toISOString(),
                choice_id: vm.filtersApplied,
                column: _.pluck(selectedColumns, 'name'),
                group: null,
                dataType: vm.selectedDataType,
                filtersApplied: filteredChoices,
                selectedMetrics: selectedColumns
            });
            vm.updateChart();
            //vm.resetSelections();
        };

        vm.deleteFromChart = function (objToDelete) {
            _.remove(vm.chartArr, function (obj) {
                return JSON.stringify(obj) === JSON.stringify(objToDelete);
            });
            vm.updateChart();
        };

        vm.getFilterOptions = function (param) {
            return _.uniq(_.pluck(vm.filteredChoices, param));
        };

        vm.changeDataTypeSelection = function () {
            // reset options
            vm.filtersApplied = [];
            vm.selectedDataTypeOptions = [];
            vm.dataTypeFilterText = '';
            vm.selectedMetrics = [];
            vm.columns = [];

            if (!vm.selectedDataType.name || vm.selectedDataType.name === '') {
                vm.selectedDataType = {};
                vm.getDataTypes();
            } else {
                vm.getDataTypeOptions(vm.selectedDataType);
            }
        };

        vm.areFiltersApplied = function () {
            return vm.filtersApplied.length > 0;
        };

        vm.updateChartDisplay = function (display) {
            vm.chartDisplay = display;
            vm.stackedClass = display === 'stacked' ? 'btn-primary' : 'btn-default';
            vm.groupedClass = display === 'grouped' ? 'btn-primary' : 'btn-default';
            vm.initChart();
        };

        vm.updateChartType = function (type) {
            vm.chartType = type;
            vm.chartTypeDisplay = _.capitalize(type);
            vm.barClass = type === 'bar' ? 'btn-primary' : 'btn-default';
            vm.areaClass = type === 'area' ? 'btn-primary' : 'btn-default';
            vm.lineClass = type === 'line' ? 'btn-primary' : 'btn-default';
            vm.splineClass = type === 'spline' ? 'btn-primary' : 'btn-default';
            vm.scatterClass = type === 'scatter' ? 'btn-primary' : 'btn-default';
            vm.initChart();
        };

        vm.toggleSubchart = function () {
            vm.subchartEnabled = !vm.subchartEnabled;
            if (vm.subchartEnabled) {
                vm.subchartClass = 'btn-primary';
            } else {
                vm.subchartClass = 'btn-default';
            }
        };

        vm.initialize = function () {
            navService.updateLocation('metrics');
            vm.getDataTypes();
        };

        vm.getDataTypes = function () {
            metricsService.getDataTypes().then(function (result) {
                vm.availableDataTypes = result.results;
            }).catch(function (error) {
                console.log(error);
                toastr['error'](error);
            });
        };

        vm.getDataType = function (id) {
            metricsService.getDataTypeMetrics(id).then(function (result) {
                vm.selectedDataTypeAvailableMetrics = result.metrics;
            }).catch(function (error) {
                console.log(error);
            });
        };

        vm.getDataTypeOptions = function (dataType) {
            metricsService.getDataTypeOptions(dataType.name).then(function (result) {
                vm.selectedDataTypeOptions = result;
                _.forEach(result.filters, function (filter) {
                    vm.dataTypeFilterText = vm.dataTypeFilterText.length === 0 ? _.capitalize(filter.param) : vm.dataTypeFilterText + ', ' + _.capitalize(filter.param);
                });
                vm.filteredChoices = _.sortByOrder(result.choices, ['title','version'], ['asc','asc']);
                // format filteredChoices for use with multiselect directive
                var filteredChoicesOptions = [];
                _.forEach(vm.filteredChoices, function (choice) {
                    filteredChoicesOptions.push({
                        label: choice.version ? choice.title + ' ' + choice.version : choice.title,
                        title: choice.version ? choice.title + ' ' + choice.version : choice.title,
                        value: choice.id
                    });
                });
                vm.filteredChoicesOptions = filteredChoicesOptions;
                vm.columns = _.sortByOrder(result.columns, ['title'], ['asc']);
                vm.groups = result.groups;

                // create an array of objects containing grouped columns
                var columnGroupsOptions = [],
                    columnGroups = _.pairs(_.groupBy(result.columns, 'group'));
                _.forEach(columnGroups, function (group) {
                    var option = {
                        label: _.find(vm.groups, { name: group[0] }).title,
                        children: []
                    };
                    _.forEach(group[1], function (column) {
                        var child = {
                            label: column.title,
                            title: column.title,
                            value: column.name
                        };
                        option.children.push(child);
                    });
                    columnGroupsOptions.push(option);
                });
                columnGroupsOptions.unshift({
                    label: 'None Selected',
                    title: 'None Selected',
                    value: ''
                });
                vm.columnGroupsOptions = columnGroupsOptions;
            }).catch(function (error){
                console.log(error);
                toastr['error'](error);
            });
        };

        vm.initialize();

        $scope.$watch('vm.inputEndDate', function (value) {
            console.log(value)
        });

        // set up chart
        vm.initChart = function () {
            // mark any existing data for removal
            // compare currCols (columns currently in the chart) with displayCols (columns to display)
            removeIds = [];
            var currCols = [],
                displayCols = [];
            _.forEach(colArr, function (col, idx) {
                if (idx > 0) {
                    currCols.push(col[0]);
                }
            });
            _.forEach(vm.chartData, function (d) {
                displayCols = displayCols.concat(_.pluck(d.query.filtersApplied, 'name'));
            });
            // determine the exact differences between currCols and displayCols
            // if none are found, then removeIds stays empty
            _.forEach(currCols, function (currCol) {
                var displayCol = _.find(displayCols, function (dCol) {
                    return dCol === currCol;
                });
                if (!displayCol) {
                    removeIds.push(currCol);
                }
            });

            // init with new data
            colArr = [];
            xArr = [];
            colNames = {};

            // create xArr
            var numDays = moment.utc(vm.inputEndDate).endOf('d').diff(moment.utc(vm.inputStartDate.toISOString()).startOf('d'), 'd') + 1; // add 1 to include starting day in count
            for (var i = 0; i < numDays; i++) {
                xArr.push(moment.utc(vm.inputStartDate.toISOString()).startOf('d').add(i, 'd').toDate());
            }

            // iterate over datatypes and add values to colArr
            _.forEach(vm.chartData, function (data) {
                var valueArr = [],
                    query = data.query,
                    queryFilter = {},
                    queryDates = [];

                yUnits = _.pluck(query.selectedMetrics, 'units');

                if (query.filtersApplied.length > 0) {
                    // filters were applied, so build data source accordingly
                    _.forEach(data.results, function (result) {
                        if (result.values.length > 0) {
                            // values for all filters are returned in one array of arrays,
                            // so group results by id to isolate filter values
                            var groupedResult = _.groupBy(result.values, 'id'),
                                resultObj = {},
                                filterIds = _.pluck(query.filtersApplied, 'id');
                            // try to get each filter id from groupedResult.
                            // if it's undefined, an empty array will be returned
                            // this allows a zeroed array to appear in the chart,
                            // since we want to include all filters selected by the user
                            // regardless of value
                            if (filterIds.length > 1) {
                                // when more than one filter is requested, then an id
                                // value is present within data.results
                                _.forEach(filterIds, function (id) {
                                    resultObj[id] = _.get(groupedResult, id, []);
                                });
                            } else {
                                // when one filter is requested, no id value is included
                                // in data.results, so build resultObj with the other
                                // info we have
                                resultObj[query.choice_id[0]] = _.pairs(groupedResult)[0][1];
                            }
                            _.forEach(_.pairs(resultObj), function (d) {
                                valueArr = [];
                                // d[0] will be choice id, d[1] will be values
                                // if only one filter was selected, d[0] will return as string 'undefined' since no id is included in this case
                                queryFilter = d[0] === 'undefined' ? query.filtersApplied[0] : _.find(query.filtersApplied, {id: parseInt(d[0])});
                                queryDates = d[1];

                                // add result values to valueArr
                                _.forEach(xArr, function (xDate) {
                                    var valueObj = _.find(queryDates, function (qDate) {
                                        return moment.utc(qDate.date).isSame(xDate, 'day');
                                    });
                                    // push 0 if data for xDate is not present in queryDates
                                    valueArr.push(valueObj ? valueObj.value : 0);
                                });

                                // prepend valueArr with filter title, and push onto colArr
                                valueArr.unshift(queryFilter.name + queryFilter.id);
                                colNames[queryFilter.name + queryFilter.id] = queryFilter.version ? queryFilter.title + ' ' + queryFilter.version : queryFilter.title;
                                colArr.push(valueArr);
                            });
                        }
                    });
                } else {
                    // no filters were applied, so show aggregate statistics
                    _.forEach(data.results, function (result) {
                        // add result values to valueArr
                        _.forEach(xArr, function (xDate) {
                            var valueObj = _.find(result.values, function (qDate) {
                                return moment.utc(qDate.date).isSame(xDate, 'day');
                            });
                            // push 0 if data for xDate is not present in result.values
                            valueArr.push(valueObj ? valueObj.value : 0);
                        });

                        // prepend valueArr with filter title, and push onto colArr
                        var columnLabel = result.column.title + ' for all ' + query.dataType.title;
                        valueArr.unshift(columnLabel);
                        colNames['aggregate'] = columnLabel;
                        colArr.push(valueArr);
                    });
                }
            });

            // inform the user if the metrics they selected are empty
            if (_.sum(_.flatten(colArr)) === 0) {
                toastr['info']('There is no data to display.');
            }

            // prepend xArr with an 'x' label and add to colArr
            xArr.unshift('x');
            colArr.unshift(xArr);

            var types = {},
                type = {},
                groups = [];

            _.forEach(colArr, function (col) {
                type = {};
                if (col[0] !== 'x') {
                    type[col[0]] = vm.chartType;
                    if (vm.chartDisplay === 'stacked') {
                        groups.push(col[0]);
                    }
                }
                angular.extend(types, type);
            });

            if (chart) {
                // chart already exists, so update values
                chart.groups([groups]);
                chart.data.names(colNames);
                chart.axis.labels({
                    y: _.capitalize(yUnits[0])
                });
                chart.load({
                    columns: colArr,
                    types: types,
                    unload: removeIds
                });
            } else {
                // no chart yet, so set it up
                chart = c3.generate({
                    bindto: '#metrics',
                    data: {
                        x: 'x',
                        columns: colArr,
                        types: types,
                        groups: [groups],
                        names: colNames
                    },
                    subchart: {
                        show: vm.subchartEnabled
                    },
                    transition: {
                        duration: 700
                    },
                    color: {
                        pattern: scaleConfig.colors.patternD320
                    },
                    axis: {
                        type: 'timeseries',
                        x: {
                            tick: {
                                format: function (d) {
                                    return moment.utc(d).toISOString();
                                }
                            },
                            label: {
                                text: 'Dates',
                                position: 'outer-center'
                            }
                        },
                        y: {
                            tick: {
                                format: function (d) {
                                    if (yUnits[0] === 'seconds') {
                                        return scaleService.calculateDuration(moment.utc().startOf('d'), moment.utc().startOf('d').add(d, 's'));
                                    } else if (yUnits[0] === 'bytes') {
                                        return scaleService.calculateFileSizeFromBytes(d, 1);
                                    }
                                    return d;
                                }
                            },
                            label: {
                                text: _.capitalize(yUnits[0]),
                                position: 'outer-middle'
                            }
                        }
                    }
                });
            }
        };

        // set chart height
        angular.element(document).ready(function () {
            // set container heights equal to available page height
            var viewport = scaleService.getViewportSize(),
                offset = scaleConfig.headerOffset,
                chartMaxHeight = viewport.height - offset;

            vm.chartStyle = 'height: ' + chartMaxHeight + 'px; max-height: ' + chartMaxHeight + 'px;';
        });
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('metricsService', ['$http', '$q', '$resource', 'scaleConfig', function ($http, $q, $resource, scaleConfig) {
        var getPlotDataParams = function (page, page_size, started, ended, choice_id, column, group, dataType) {
            console.log(choice_id);
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                choice_id: choice_id,
                column: column,
                group: group,
                dataType: dataType
            };
        };

        return {
            getDataTypes: function () {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'metrics/').success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getDataTypeMetrics: function (id) {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'metrics/' + id + '/').success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getDataTypeOptions: function (name) {
                var d = $q.defer();
                var url = scaleConfig.urls.apiPrefix + 'metrics/' + name + '/';
                $http.get(url).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getPlotData: function (params) {
                var params = params || getPlotDataParams(),
                    d = $q.defer();

                $http({
                    method: 'GET',
                    url: scaleConfig.urls.apiPrefix + 'metrics/' + params.dataType + '/plot-data/',
                    params: params
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },
            getGeneratedPlotData: function (obj) {
                var d = $q.defer();

                var returnObj = {
                    count: 28,
                    next: null,
                    previous: null,
                    results: []
                };

                var numDays = moment.utc(obj.params.ended).diff(moment.utc(obj.params.started), 'd') + 1;

                _.forEach(obj.query.selectedMetrics, function (metric) {
                    var returnResult = {
                        column: metric,
                        min_x: moment.utc(obj.params.started).format('YYYY-MM-DD'),
                        max_x: moment.utc(obj.params.ended).format('YYYY-MM-DD'),
                        min_y: 1,
                        max_y: 100,
                        values: []
                    };

                    for (var i = 0; i < numDays; i++) {
                        if (obj.query.filtersApplied.length > 1) {
                            _.forEach(obj.query.filtersApplied, function (filter) {
                                returnResult.values.push({
                                    date: moment.utc(obj.params.started).add(i, 'd').format('YYYY-MM-DD'),
                                    value: Math.floor(Math.random() * (1000 - 1 + 1)) + 1,
                                    id: filter.id
                                });
                            });
                        } else {
                            returnResult.values.push({
                                date: moment.utc(obj.params.started).add(i, 'd').format('YYYY-MM-DD'),
                                value: Math.floor(Math.random() * (1000 - 1 + 1)) + 1
                            });
                        }
                    }
                    returnObj.results.push(returnResult);
                });

                d.resolve(returnObj);

                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('navController', ['$scope', '$location', '$window', 'scaleConfig', 'scaleService', 'stateService', 'navService', function($scope, $location, $window, scaleConfig, scaleService, stateService, navService) {
        document.getElementsByTagName('body')[0].style.backgroundColor = scaleConfig.colors.nav_bg;

        var vm = this;

        vm.version = '';
        vm.activePage = 'overview';
        vm.docsUrl = scaleConfig.urls.documentation;

        vm.goto = function(loc) {
            $location.search('');
            $location.path(loc);
        };

        var locationUpdated = function() {
            vm.activePage = navService.location;
        };

        var initialize = function() {
            navService.registerObserver(locationUpdated);

            scaleService.getVersion().then(function (data) {
                vm.version = data.version;
                stateService.setVersion(data.version);
            });
        };
        initialize();
    }]);
})();

(function () {
    'use strict';
    /**
     * See: http://stackoverflow.com/questions/12576798/angularjs-how-to-watch-service-variables/17558885#17558885
     * Doing things this way so that ssNavbarController can get notified
     * when the location changes. Then, our controllers just need to call into
     * this service to updateLocation.
     *
     * The only thing I don't like about this is that the individual
     * controllers have to call in and tell the ssNavigationService what
     * page they are showing.
     */
    angular.module('scaleApp').service('navService', ['$location', function ($location) {

        this.location = 'overview'; // where the app starts

        var observers = [];

        this.registerObserver = function(callback) {
            observers.push(callback);
        };

        this.notifyObservers = function() {
            angular.forEach(observers, function(observer) {
                observer();
            });
        };

        this.updateLocation = function(locationIn) {
            this.location = locationIn;
            this.notifyObservers();
        };

    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('subnavService', ['$http', 'scaleConfig', function ($http, scaleConfig) {
        var currentPath = '';

        this.setCurrentPath = function (path) {
            currentPath = path;
        };

        this.getCurrentPath = function () {
            return currentPath;
        };
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('nodeDetailsController', ['$scope', '$location', '$routeParams', '$timeout', 'navService', 'nodeService', 'scaleService', function($scope, $location, $routeParams, $timeout, navService, nodeService, scaleService) {
        var vm = this;
        
        vm.loading = true;
        vm.nodeId = $routeParams.id;
        vm.scaleService = scaleService;

        var getNodeDetails = function (nodeId) {
            nodeService.getNode(nodeId).then( function (data) {
                vm.node = data;
            }).finally(function () {
                vm.loading = false;
            });
        };

        var initialize = function() {
            navService.updateLocation('nodes');
            getNodeDetails(vm.nodeId);
        };

        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('nodesController', ['$scope', '$location', '$timeout', '$uibModal', 'navService', 'nodeService', 'stateService', 'userService', 'gridFactory', 'toastr', function($scope, $location, $timeout, $uibModal, navService, nodeService, stateService, userService, gridFactory, toastr) {
        var vm = this;

        vm.nodesParams = stateService.getNodesParams();

        vm.stateService = stateService;
        vm.nodeStatus = [];
        vm.loading = true;
        vm.loadingStatus = true;
        vm.readonly = true;
        vm.nodesError = null;
        vm.nodesErrorStatus = null;
        vm.statusError = null;
        vm.statusErrorStatus = null;
        vm.actionClicked = false;
        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.paginationCurrentPage = vm.nodesParams.page || 1;
        vm.gridOptions.paginationPageSize = vm.nodesParams.page_size || vm.gridOptions.paginationPageSize;
        vm.gridOptions.data = [];

        $scope.pauseReason = '';

        var filteredByOrder = vm.nodesParams.order ? true : false;

        vm.colDefs = [
            {
                field: 'hostname',
                displayName: 'Hostname',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents"><div class="pull-right" ng-show="!grid.appScope.vm.readonly && grid.appScope.vm.nodeStatus.length > 0"><button class="btn btn-xs btn-default" ng-click="grid.appScope.vm.pauseNode(row.entity.id)"><i class="fa" ng-class="{ \'fa-pause\': !row.entity.is_paused && !row.entity.is_paused_errors, \'fa-play\': row.entity.is_paused || row.entity.is_paused_errors }"></i></button></div> {{ row.entity.hostname }}</div>'
            },
            {
                field: 'is_online',
                displayName: 'Status',
                enableFiltering: false,
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.status"><span ng-bind-html="row.entity.statusLabel"></span></div>'
            },
            {
                field: 'id',
                displayName: 'Statistics',
                enableFiltering: false,
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.status">{{ row.entity.status.getCellError() }} / {{ row.entity.status.getCellTotal() }}</div>'
            },
            {
                field: 'id',
                displayName: 'Current Jobs',
                enableFiltering: false,
                enableSorting: false,
                cellTemplate: '<div class="ui-grid-cell-contents" ng-show="row.entity.status"><span ng-bind-html="row.entity.status.getCellJobs()"></span></div>'
            }
        ];

        vm.gridOptions.columnDefs = vm.colDefs;

        vm.pauseNode = function (id) {
            $scope.pauseReason = '';
            vm.actionClicked = true;
            var nodeStatus = _.find(vm.nodeStatus, { node: { id: id } });

            $scope.updateReason = function (value) {
                $scope.pauseReason = value;
            };

            var pauseResume = function () {
                nodeStatus.pauseResumeCell($scope.pauseReason).then(function (result) {
                    var node = _.find(vm.gridOptions.data, { id: result.id });
                    node.is_paused = result.is_paused;
                    if (node.isPaused()) {
                        toastr.info(node.hostname + ' Paused');
                    } else {
                        toastr.info(node.hostname + ' Resumed');
                    }
                });
            };

            // only prompt for reason when pausing (not resuming)
            if (!nodeStatus.node.is_paused && !nodeStatus.node.is_paused_errors) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'pauseDialog.html',
                    scope: $scope
                });

                modalInstance.result.then(function () {
                    pauseResume();
                });
            } else {
                pauseResume();
            }
        };

        vm.getStatusLabel = function (status) {
            var online = status.is_online ? '<span class="label label-online">Online</span>' : '<span class="label label-offline">Offline</span>';
            var paused = status.node.is_paused ? '<span class="label label-paused">Paused</span>' : '';
            var pausedErrors = status.node.is_paused_errors ? '<span class="label label-paused-errors">Paused with Errors</span>' : '';
            return online + ' ' + paused + ' ' + pausedErrors;
        };

        vm.filterResults = function () {
            stateService.setNodesParams(vm.nodesParams);
            vm.loading = true;
            getNodes();
        };

        vm.updateColDefs = function () {
            vm.gridOptions.columnDefs = gridFactory.applySortConfig(vm.colDefs, vm.nodesParams);
        };

        vm.updateNodeOrder = function (sortArr) {
            vm.nodesParams.order = sortArr.length > 0 ? sortArr : null;
            filteredByOrder = sortArr.length > 0;
            vm.filterResults();
        };

        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            vm.gridApi = gridApi;
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                if (vm.actionClicked) {
                    vm.actionClicked = false;
                } else {
                    $location.search({});
                    $location.path('/nodes/' + row.entity.id);
                }
            });
            vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                vm.nodesParams.page = currentPage;
                vm.nodesParams.page_size = pageSize;
                vm.filterResults();
            });
            vm.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                _.forEach(vm.gridApi.grid.columns, function (col) {
                    col.colDef.sort = col.sort;
                });
                stateService.setNodesColDefs(vm.gridApi.grid.options.columnDefs);
                var sortArr = [];
                _.forEach(sortColumns, function (col) {
                    sortArr.push(col.sort.direction === 'desc' ? '-' + col.field : col.field);
                });
                vm.updateNodeOrder(sortArr);
            });
        };

        var getNodes = function () {
            nodeService.getNodes(vm.nodesParams).then(null, null, function (data) {
                if (data.$resolved) {
                    vm.nodesError = null;
                    vm.gridOptions.totalItems = data.count;
                    vm.gridOptions.minRowsToShow = data.results.length;
                    vm.gridOptions.virtualizationThreshold = data.results.length;
                    vm.gridOptions.data = data.results;
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.nodesErrorStatus = data.statusText;
                    }
                    vm.nodesError = 'Unable to retrieve nodes.';
                }
                vm.loading = false;
            })
        };

        var getNodeStatus = function () {
            nodeService.getNodeStatus(null, null, 'PT3H', null).then(null, null, function (data) {
                if (data.$resolved) {
                    vm.statusError = null;
                    vm.nodeStatus = data.results;
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.statusErrorStatus = data.statusText;
                    }
                    vm.statusError = 'Unable to retrieve node status.';
                }
                vm.loadingStatus = false;
            });
        };

        var initialize = function () {
            stateService.setNodesParams(vm.nodesParams);
            vm.updateColDefs();
            var user = userService.getUserCreds();
            vm.readonly = !(user && user.is_admin);
            getNodes();
            getNodeStatus();
            navService.updateLocation('nodes');
        };

        initialize();

        $scope.$watchCollection('vm.stateService.getNodesColDefs()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.colDefs = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.stateService.getNodesParams()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.nodesParams = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.nodeStatus', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            _.forEach(vm.gridOptions.data, function (node) {
                var status = _.find(newValue, { node: { id: node.id } });
                if (status) {
                    node.status = status;
                    node.statusLabel = vm.getStatusLabel(status);
                }
            });
        });
    }]);
})();
(function (){
    'use strict';

    angular.module('scaleApp').controller('aisNodeHealthController', ['$rootScope', '$scope', function ($rootScope, $scope) {
        var vm = this;
        
        vm.nodes = [];
        vm.nodesOffline = 0;
        vm.nodesPausedErrors = 0;
        vm.nodesPaused = 0;
        vm.nodesOfflineAndPaused = 0;
        vm.nodesOfflineAndPausedErrors = 0;
        vm.healthyNodes = 0;
        vm.totalNodes = 0;

        var getNodeStatus = function () {
            vm.totalNodes = vm.nodes.length;

            var nodesOffline = [],
                nodesPausedErrors = [],
                nodesPaused = [],
                nodesOfflineAndPausedErrors = [],
                nodesOfflineAndPaused = [];

            _.forEach(vm.nodes, function (n) {
                if (!n.is_online) {
                    // node is offline
                    if (n.node.is_paused_errors) {
                        nodesOfflineAndPausedErrors.push(n);
                    } else if (n.node.is_paused) {
                        nodesOfflineAndPaused.push(n);
                    } else {
                        nodesOffline.push(n);
                    }
                } else {
                    // node is online
                    if (n.node.is_paused_errors) {
                        nodesPausedErrors.push(n);
                    } else if (n.node.is_paused) {
                        nodesPaused.push(n);
                    }
                }
            });

            vm.nodesOffline = nodesOffline.length;
            vm.nodesPausedErrors = nodesPausedErrors.length;
            vm.nodesPaused = nodesPaused.length;
            vm.nodesOfflineAndPausedErrors = nodesOfflineAndPausedErrors.length;
            vm.nodesOfflineAndPaused = nodesOfflineAndPaused.length;

            // add the length of nodes both offline and paused to produce an accurate healthy count
            vm.healthyNodes = vm.totalNodes - vm.nodesOffline - vm.nodesPausedErrors - vm.nodesPaused - vm.nodesOfflineAndPaused - vm.nodesOfflineAndPausedErrors;

            var donutData = [];

            // determine percentage of healthy nodes, and breakdown of why nodes are unhealthy
            var gaugeData = vm.totalNodes > 0 ? ((vm.healthyNodes / vm.totalNodes) * 100).toFixed(2) : 0.00;

            if (vm.nodesOffline > 0) {
                donutData.push({
                    status: 'Offline',
                    count: vm.nodesOffline
                });
            }

            if (vm.nodesPausedErrors > 0) {
                donutData.push({
                    status: 'High Failure Rate',
                    count: vm.nodesPausedErrors
                });
            }

            if (vm.nodesPaused > 0) {
                donutData.push({
                    status: 'Paused',
                    count: vm.nodesPaused
                });
            }

            if (vm.nodesOfflineAndPaused) {
                donutData.push({
                    status: 'Offline and Paused',
                    count: vm.nodesOfflineAndPaused
                });
            }

            if (vm.nodesOfflineAndPausedErrors) {
                donutData.push({
                    status: 'Offline and Paused due to Errors',
                    count: vm.nodesOfflineAndPausedErrors
                });
            }

            vm.nodeHealth = {
                gaugeData: gaugeData,
                donutData: donutData
            };
        };

        $scope.$watch('data', function (newValue) {
            vm.nodes = newValue;
            getNodeStatus();
        });
    }]).directive('aisNodeHealth', function(){
        /**
         * Usage: <ais-node-health />
         **/
         return {
             controller: 'aisNodeHealthController',
             controllerAs: 'vm',
             templateUrl: 'modules/nodes/directives/nodeHealthTemplate.html',
             restrict: 'E',
             scope: {
                 data: '=',
                 duration: '=',
                 showDescription: '=',
                 loading: '='
             }
         };
    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('nodeStatusGridController', ['$scope', '$location', function ($scope, $location) {
        var vm = this,
            cellSize = $scope.cellSize || '10px';

        vm.nodes = [];
        vm.hours = $scope.hours || 3;
        vm.cellStyle = {
            width: cellSize,
            height: cellSize
        };

        vm.getNodeClass = function (node) {
            console.log('getNodeClass');
            if (!node.is_online) {
                return 'offline';
            } else {
                if (node.node.is_paused) {
                    return 'is-paused';
                } else if (node.node.is_paused_errors) {
                    return 'is-paused-errors';
                }
            }
            return 'online';
        };

        vm.viewNode = function (id) {
            $location.path('nodes/' + id);
        };

        $scope.$watch('data', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            _.forEach(newValue, function (node) {
                if (!node.is_online) {
                    node.class = 'offline';
                } else {
                    if (node.node.is_paused) {
                        node.class = 'is-paused';
                    } else if (node.node.is_paused_errors) {
                        node.class = 'is-paused-errors';
                    } else {
                        node.class = 'online';
                    }
                }
            });
            vm.nodes = newValue;
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').directive('aisNodeStatusGrid', function () {
        return {
            controller: 'nodeStatusGridController',
            controllerAs: 'vm',
            templateUrl: 'modules/nodes/directives/nodeStatusGridTemplate.html',
            restrict: 'E',
            scope: {
                data: '=',
                hours: '=',
                cellSize: '@'
            }
        };
    });
})();
(function(){
    'use strict';

    angular.module('scaleApp').factory('Node', ['NodeResources', 'scaleService', function (NodeResources, scaleService) {
        var Node = function (id, hostname, port, slave_id, is_paused, is_paused_errors, is_active, archived, created, last_offer, last_modified, job_exes_running, resources) {
            this.id = id;
            this.hostname = hostname;
            this.port = port;
            this.slave_id = slave_id;
            this.is_paused = is_paused;
            this.is_paused_errors = is_paused_errors;
            this.is_active = is_active;
            this.archived = archived;
            this.created = created;
            this.last_offer = last_offer;
            this.last_modified = last_modified;
            this.job_exes_running = job_exes_running;
            this.resources = NodeResources.transformer(resources);
        };

        //public methods
        Node.prototype = {
            toString: function () {
                return 'Node';
            },
            getDuration: function () {
                return scaleService.calculateDuration(this.created, this.last_modified);
            },
            getCellText: function () {
                // this is only used reveal = true on gridChart directive
                return this.hostname;
            },
            getCellTitle: function () {
                return this.hostname;
            },
            isPaused: function () {
                return !(!this.is_paused && !this.is_paused_errors);
            }
        };

        // static methods, assigned to class
        Node.build = function (data) {
            if (data) {
                return new Node(
                    data.id,
                    data.hostname,
                    data.port,
                    data.slave_id,
                    data.is_paused,
                    data.is_paused_errors,
                    data.is_active,
                    data.archived,
                    data.created,
                    data.last_offer,
                    data.last_modified,
                    data.job_exes_running,
                    data.resources
                );
            }
            return new Node();
        };

        Node.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Node.build);
            }
            return Node.build(data);
        };

        return Node;
    }]);
})();

(function(){
    'use strict';

    angular.module('scaleApp').factory('NodeResources', function(){
        var NodeResources = function (total, scheduled, used) {
            this.total = total;
            this.scheduled = scheduled;
            this.used = used;
        };

        //public methods
        NodeResources.prototype = {
            // getDuration: function() {
                //return scaleService.calculateDuration(this.created, this.last_modified);
            // }
        };

        // static methods, assigned to class
        NodeResources.build = function (data) {
            if (data) {
                return new NodeResources(
                    data.total,
                    data.scheduled,
                    data.used
                );
            }
            return new NodeResources();
        };

        NodeResources.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(NodeResources.build)
                    .filter(Boolean);
            }
            return NodeResources.build(data);
        };

        return NodeResources;
    });
})();

(function() {
    'use strict';

    angular.module('scaleApp').factory('NodeStatus', ['scaleConfig', 'nodeUpdateService', 'Node', 'JobExecution', function (scaleConfig, nodeUpdateService, Node, JobExecution) {
        var NodeStatus = function (node, is_online, job_exe_counts, job_exes_running) {
            this.node = Node.transformer(node);
            this.is_online = is_online;
            this.job_exe_counts = job_exe_counts;
            this.job_exes_running = JobExecution.transformer(job_exes_running);
        };

        //public methods
        NodeStatus.prototype = {
            toString: function () {
                return 'NodeStatus';
            },
            getCompleted: function () {
                var completed = _.find(this.job_exe_counts, 'status', 'COMPLETED');
                return completed ? completed.count : 0;
            },
            getFailed: function () {
                var failed = _.find(this.job_exe_counts, 'status', 'FAILED');
                return failed ? failed.count : 0;
            },
            getCellFill: function () {
                var color = '';
                if (this.is_online) {
                    if (this.node.is_paused_errors) {
                        color = scaleConfig.colors.chart_orange;
                    } else if (this.node.is_paused) {
                        color = scaleConfig.colors.chart_yellow;
                    } else {
                        color = scaleConfig.colors.chart_green;
                    }
                } else {
                    color = scaleConfig.colors.chart_red;
                }
                return color;
            },
            getRunning: function () {
                return { count: 0 };
            },
            getCellError: function () {
                return 'Failed: ' + this.getFailed();
            },
            getCellTotal: function () {
                return 'Completed: ' + this.getCompleted();
            },
            getCellStatus: function () {
                if (this.is_online) {
                    if (this.node.is_paused_errors) {
                        return 'High Failure Rate';
                    } else if (this.node.is_paused) {
                        return 'Paused';
                    } else {
                        return 'Online';
                    }
                } else {
                    return 'Offline';
                }
            },
            getCellJobs: function () {
                var text = '';
                _.forEach(this.job_exes_running, function (jobExecution) {
                    text = jobExecution.job.job_type.icon_code ?
                    text + ' ' + '<i class="fa fa-fw">&#x' + jobExecution.job.job_type.icon_code + '</i>' :
                    text + ' ' + '<i class="fa fa-fw">&#x' + scaleConfig.defaultIconCode + '</i>';
                });
                return text;
            },
            getCellPauseResume: function () {
                return this.node.is_paused ? '&#xf04b;' : '&#xf04c;';
            },
            pauseResumeCell: function (pause_reason) {
                var updateData = {
                    pause_reason: pause_reason || '',
                    is_paused: !this.node.is_paused
                };
                return nodeUpdateService.updateNode(this.node.id, updateData).then(function (result) {
                    return Node.transformer(result);
                }).catch(function (error) {
                    console.log(error);
                });
            }
        };

        // static methods, assigned to class
        NodeStatus.build = function (data) {
            if (data) {
                return new NodeStatus(
                    data.node,
                    data.is_online,
                    data.job_exe_counts,
                    data.job_exes_running
                );
            }
            return new NodeStatus();
        };

        NodeStatus.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(NodeStatus.build);
            }
            return NodeStatus.build(data);
        };

        return NodeStatus;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('nodeService', ['$http', '$q', '$resource', 'scaleConfig', 'Node', 'NodeStatus', 'poller', 'pollerFactory', function ($http, $q, $resource, scaleConfig, Node, NodeStatus, poller, pollerFactory) {
        var getNodesParams = function (page, page_size, started, ended, order, include_inactive, url) {
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                order: order,
                include_inactive: include_inactive,
                url: url
            };
        };

        var getNodeStatusParams = function (page, page_size, started, ended) {
            var params = {};

            if(page) { params.page = page; }
            if(page_size) { params.page_size = page_size; }
            if(started) { params.started = started; }
            if(ended) { params.ended = ended; }

            return params;
        };

        return {
            getNodes: function (params) {
                params = params || getNodesParams();
                params.url = params.url ? params.url : scaleConfig.urls.apiPrefix + 'nodes/';

                var nodesResource = $resource(params.url, params),
                    nodesPoller = pollerFactory.newPoller(nodesResource, scaleConfig.pollIntervals.nodes);

                return nodesPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        data.results = Node.transformer(data.results);
                    } else {
                        nodesPoller.stop();
                    }
                    return data;
                });
            },
            getNodesOnce: function (params) {
                params = params || getNodesParams();
                var d = $q.defer();

                $http({
                    url: params.url ? params.url : scaleConfig.urls.apiPrefix + 'nodes/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    var returnData = Node.transformer(data.nodes);
                    d.resolve(returnData);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },
            getNode: function (slaveId) {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'nodes/' + slaveId + '/').success(function (data) {
                    var returnData = Node.transformer(data);
                    d.resolve(returnData);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getNodeStatus: function (page, page_size, started, ended) {
                var params = getNodeStatusParams(page, page_size, started, ended);

                var nodeStatusResource = $resource(scaleConfig.urls.apiPrefix + 'nodes/status/', params),
                    nodeStatusPoller = pollerFactory.newPoller(nodeStatusResource, scaleConfig.pollIntervals.nodeStatus);

                return nodeStatusPoller.promise.then(null, null, function (data) {
                    if (data.$resolved) {
                        data.results = NodeStatus.transformer(data.results);
                    } else {
                        nodeStatusPoller.stop();
                    }
                    return data;
                });
            },
            getNodeStatusOnce: function (page, page_size, started, ended) {
                var d = $q.defer();
                var params = getNodeStatusParams(page, page_size, started, ended);
                $http({
                    url: scaleConfig.urls.apiPrefix + 'nodes/status/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = NodeStatus.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getNodeData: function (slaveId, since) {
                var data = {},
                    self = this;

                since = since || 'PT3H';

                return self.getNodes().then(function (nodes) {
                    data.nodes = nodes;
                    return self.getNodeStatus(since).then(function (stats) {
                        data.stats = stats;
                        return data;
                    });
                });
            }
        };

    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('nodeUpdateService', ['$http', '$q', 'scaleConfig', 'Node', function ($http, $q, scaleConfig, Node) {
        var getNodeUpdateData = function (pause_reason, is_paused) {
            return {
                pause_reason: pause_reason,
                is_paused: is_paused
            };
        };

        return {
            updateNode: function (id, data) {
                data = data || getNodeUpdateData();
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'nodes/' + id + '/',
                    method: 'PATCH',
                    data: data
                }).success(function (result) {
                    d.resolve(Node.transformer(result));
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            }
        };
    }])
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('ovController', ['$rootScope', '$scope', 'navService', 'nodeService', 'jobService', 'jobTypeService', 'statusService', 'gaugeFactory', 'scaleConfig', 'scaleService', 'schedulerService', 'userService', function($rootScope, $scope, navService, nodeService, jobService, jobTypeService, statusService, gaugeFactory, scaleConfig, scaleService, schedulerService, userService) {
        var vm = this;
        
        vm.date = new Date();
        vm.jobError = null;
        vm.jobErrorStatus = null;
        vm.loadingJobs = true;
        vm.loadingNodeHealth = true;
        vm.jobTypes = [];
        vm.nodes = [];
        vm.nodeHealthError = null;
        vm.nodeHealthErrorStatus = '';
        vm.hourValue = 3;
        vm.jobData = {
            data: null,
            status: null
        };
        vm.jobErrorBreakdown = [];
        vm.status = null;
        vm.statusError = null;
        vm.loadingStatus = true;
        vm.masterStatus = '';
        vm.masterStatusClass = 'alert-success';
        vm.schedulerStatus = '';
        vm.schedulerStatusClass = 'alert-success';
        vm.memCalc = '';
        vm.diskCalc = '';
        vm.schedulerIsPaused = false;
        vm.user = userService.getUserCreds();
        vm.schedulerContainerClass = vm.user ? vm.user.is_admin ? 'col-xs-8 col-lg-10' : 'col-xs-12' : 'col-xs-12';
        vm.schedulerBtnClass = 'fa-pause';

        vm.toggleScheduler = function () {
            vm.schedulerIsPaused = !vm.schedulerIsPaused;
            var schedulerData = {
                is_paused: vm.schedulerIsPaused
            };
            schedulerService.updateScheduler(schedulerData).then(function (data) {
                vm.schedulerStatus = data.is_paused ? 'Paused' : 'Running';
                vm.schedulerStatusClass = data.is_paused ? 'alert-warning' : 'alert-success';
                vm.schedulerBtnClass = data.is_paused ? 'fa-play' : 'fa-pause';
            }).catch(function (error) {
                console.log(error);
            });
        };

        var redrawGrid = function () {
            $scope.$broadcast('redrawGrid', vm.jobData);
        };

        var getJobTypes = function () {
            jobTypeService.getJobTypes().then(null, null, function (data) {
                if (data.$resolved) {
                    vm.jobError = null;
                    vm.jobData.data = data.results;
                    redrawGrid();
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.jobErrorStatus = data.statusText;
                    }
                    vm.jobError = 'Unable to retrieve job types.';
                }
                vm.loadingJobs = false;
            });
        };

        var getStatus = function () {
            var cpuGauge = gaugeFactory.createGauge('cpu', 'CPU', 0, 100, 180),
                memGauge = gaugeFactory.createGauge('memory', 'Memory', 0, 100, 180),
                diskGauge = gaugeFactory.createGauge('disk', 'Disk', 0, 100, 180);

            statusService.getStatus().then(null, null, function (result) {
                if (result.$resolved) {
                    vm.statusError = null;
                    vm.status = result;
                    cpuGauge.redraw(result.getCpuUsage());
                    memGauge.redraw(result.getMemUsage());
                    diskGauge.redraw(result.getDiskUsage());
                    vm.masterStatus = result.master.is_online ? 'Master is Online' : 'Master is Offline';
                    vm.masterStatusClass = result.master.is_online ? 'alert-success' : 'alert-danger';
                    if (result.scheduler.is_online) {
                        vm.schedulerStatus = result.scheduler.is_paused ? 'Scheduler is Paused' : 'Scheduler is Running';
                        vm.schedulerStatusClass = result.scheduler.is_paused ? 'alert-warning' : 'alert-success';
                        vm.schedulerIsPaused = result.scheduler.is_paused;
                        vm.schedulerBtnClass = result.scheduler.is_paused ? 'fa-play' : 'fa-pause';
                    } else {
                        vm.schedulerStatus = result.scheduler.is_paused ? 'Scheduler is Offline; Paused' : 'Scheduler is Offline';
                        vm.schedulerStatusClass = 'alert-danger';
                        vm.schedulerIsPaused = result.scheduler.is_paused;
                        vm.schedulerBtnClass = result.scheduler.is_paused ? 'fa-play' : 'fa-pause';
                    }
                    if (result.resources.scheduled.mem && result.resources.total.mem) {
                        vm.memCalc = scaleService.calculateFileSizeFromMib(result.resources.scheduled.mem) + ' / ' + scaleService.calculateFileSizeFromMib(result.resources.total.mem);
                    }
                    if (result.resources.scheduled.disk && result.resources.total.disk) {
                        vm.diskCalc = scaleService.calculateFileSizeFromMib(result.resources.scheduled.disk) + ' / ' + scaleService.calculateFileSizeFromMib(result.resources.total.disk);
                    }
                } else {
                    vm.statusError = result.statusText && result.statusText !== '' ? result.statusText : 'Unable to retrieve cluster status.';
                    cpuGauge.redraw(-1);
                    memGauge.redraw(-1);
                    diskGauge.redraw(-1);
                    vm.masterStatus = 'Master Status is Unknown';
                    vm.masterStatusClass = 'alert-danger';
                    vm.schedulerContainerClass = 'col-xs-12';
                    vm.schedulerStatus = 'Scheduler Status is Unknown';
                    vm.schedulerStatusClass = 'alert-danger';
                }
                vm.loadingStatus = false;
            });
        };

        var getNodeStatus = function () {
            nodeService.getNodeStatus(null, null, 'PT3H', null).then(null, null, function (data) {
                if (data.$resolved) {
                    vm.nodeHealthError = null;
                    vm.nodes = data.results;
                } else {
                    if (data.statusText && data.statusText !== '') {
                        vm.nodeHealthErrorStatus = data.statusText;
                    }
                    vm.nodeHealthError = 'Unable to retrieve nodes.';
                }
                vm.loadingNodeHealth = false;
            });
        };

        $rootScope.$on('jobTypeStatus', function (event, data) {
            vm.jobData.status = data;
            redrawGrid();
        });

        var initialize = function () {
            getJobTypes();
            getStatus();
            getNodeStatus();
            navService.updateLocation('overview');
        };

        initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('recipeDetailsController', ['$rootScope', '$scope', '$location', '$routeParams', 'navService', 'recipeService', 'scaleConfig', 'subnavService', 'userService', function ($rootScope, $scope, $location, $routeParams, navService, recipeService, scaleConfig, subnavService, userService) {

        var vm = this;

        vm.recipe = {};
        vm.recipeId = $routeParams.id;
        vm.subnavLinks = scaleConfig.subnavLinks.recipes;
        subnavService.setCurrentPath('recipes');
        vm.loadingRecipeDetail = true;
        vm.activeTab = 'status';
        vm.lastStatusChange = '';

        vm.getRecipeDetail = function (recipeId) {
            vm.loadingRecipeDetail = true;
            recipeService.getRecipeDetails(recipeId).then(function (data) {
                vm.recipe = data;
                recipeService.getRecipeTypeDetail(data.recipe_type.id).then(function(recipeType){
                    vm.recipeType = recipeType;
                }).catch(function(error){
                   console.log(error);
                });
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loadingRecipeDetail = false;
            });
        };

        vm.initialize = function () {
            navService.updateLocation('recipes');
            vm.getRecipeDetail(vm.recipeId);
        };



        vm.switchTab = function (tab) {
            $('#' + vm.activeTab).hide();
            vm.activeTab = tab;
            $('#' + vm.activeTab).show();
        };

        vm.initialize();
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').controller('recipeTypesController', ['$rootScope', '$scope', '$routeParams', '$location', '$uibModal', 'hotkeys', 'scaleService', 'navService', 'recipeService', 'subnavService', 'jobTypeService', 'scaleConfig', 'RecipeType', 'userService', 'localStorage', function ($rootScope, $scope, $routeParams, $location, $uibModal, hotkeys, scaleService, navService, recipeService, subnavService, jobTypeService, scaleConfig, RecipeType, userService, localStorage) {
        var vm = this;
        
        vm.loading = true;
        vm.containerStyle = '';
        vm.recipeTypes = [];
        vm.recipeTypeIds = [];
        vm.requestedRecipeTypeId = parseInt($routeParams.id);
        vm.activeRecipeType = null;
        vm.percentage = 73;
        vm.date = new Date();
        vm.recipes = null;
        vm.mode = 'view'; // valid values are add, view, and edit
        vm.addBtnText = 'New Recipe';
        vm.addBtnClass = 'btn-primary';
        vm.addBtnIcon = 'fa-plus-circle';
        vm.editBtnText = 'Edit';
        vm.editBtnClass = 'btn-success';
        vm.editBtnIcon = 'fa-edit';
        vm.jobTypeValues = [];
        vm.isRecipeModified = false;
        vm.saveBtnClass = 'btn-default';
        vm.masterClass = 'col-xs-3';
        vm.detailClass = 'col-xs-9';
        vm.minimizeMaster = false;
        vm.minimizeBtnClass = 'fa fa-chevron-left';
        vm.user = userService.getUserCreds();
        vm.scaleConfig = scaleConfig;
        vm.localRecipeTypes = [];

        vm.subnavLinks = scaleConfig.subnavLinks.recipes;
        subnavService.setCurrentPath('recipes/types');

        var initialize = function () {
            navService.updateLocation('recipes');
            getRecipeTypes();
        };
        
        var getRecipeTypes = function () {
            recipeService.getRecipeTypes().then(function (data) {
                vm.recipeTypes = data.results;
                if (scaleConfig.static) {
                    var i = 0,
                        oJson = {},
                        sKey;
                    for (; sKey = localStorage.key(i); i++) {
                        oJson[sKey] = localStorage.getItem(sKey);
                    }
                    _.filter(_.pairs(oJson), function (o) {
                        if (_.contains(o[0], 'recipeType')) {
                            var type = JSON.parse(o[1]);
                            vm.localRecipeTypes.push(type);
                            vm.recipeTypes.push(type);
                        }
                    });
                }
                vm.recipeTypeIds = _.pluck(data, 'id');
                vm.viewRecipeTypeDetail(vm.requestedRecipeTypeId);
                hotkeys.bindTo($scope)
                    .add({
                        combo: 'ctrl+up',
                        description: 'Previous Recipe Type',
                        callback: function () {
                            if (vm.activeRecipeType) {
                                var idx = _.indexOf(vm.recipeTypeIds, vm.activeRecipeType.id);
                                if (idx > 0) {
                                    vm.loadRecipeType(vm.recipeTypeIds[idx - 1]);
                                }
                            }
                        }
                    }).add({
                        combo: 'ctrl+down',
                        description: 'Next Recipe Type',
                        callback: function () {
                            if (vm.activeRecipeType) {
                                var idx = _.indexOf(vm.recipeTypeIds, vm.activeRecipeType.id);
                                if (idx < (vm.recipeTypeIds.length - 1)) {
                                    vm.loadRecipeType(vm.recipeTypeIds[idx + 1]);
                                }
                            }
                        }
                    });
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                if (vm.loading) {
                    vm.loading = false;
                }
            })
        };

        vm.clearLocalRecipeTypes = function () {
            _.forEach(vm.localRecipeTypes, function (type) {
                localStorage.removeItem('recipeType' + type.id);
            });
            $location.path('/recipes/types');
        };

        vm.newRecipeType = function(){
            $location.path('/recipes/types/0');
        };

        vm.viewRecipeTypeDetail = function (recipeTypeId) {
            if (recipeTypeId > 0) {
                recipeService.getRecipeTypeDetail(recipeTypeId).then(function (data) {
                    vm.activeRecipeType = data;
                });
            } else if( recipeTypeId === 0) {
                vm.activeRecipeType = new RecipeType();
            }
        };

        vm.loadRecipeType = function (id) {
            if (vm.activeRecipeType && vm.activeRecipeType.modified) {
                confirmChangeRecipe().then(function () {
                    // OK
                    $location.path('/recipes/types/' + id);
                }, function () {
                    // Cancel

                });
            } else {
                $location.path('/recipes/types/' + id);
            }
        };

        var confirmChangeRecipe = function () {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'confirmDialog.html',
                scope: $scope,
                size: 'sm'
            });

            return modalInstance.result;
        };

        vm.toggleMaster = function (minimizeMaster) {
            if (typeof minimizeMaster !== 'undefined') {
                vm.minimizeMaster = minimizeMaster;
            } else {
                vm.minimizeMaster = !vm.minimizeMaster;
            }
            vm.masterClass = vm.minimizeMaster ? 'col-xs-1 minimized' : 'col-xs-3';
            vm.detailClass = vm.minimizeMaster ? 'col-xs-11' : 'col-xs-9';
            vm.minimizeBtnClass = vm.minimizeMaster ? 'fa fa-chevron-right' : 'fa fa-chevron-left';
        };

        $rootScope.$on('toggleEdit', function (event, data) {
            vm.toggleMaster(data === 'edit');
        });

        initialize();

        $rootScope.$on('recipeModified', function () {
            vm.isRecipeModified = true;
            vm.saveBtnClass = 'btn-success';
        });

        angular.element(document).ready(function () {
            // set container heights equal to available page height
            var viewport = scaleService.getViewportSize(),
                offset = scaleConfig.headerOffset,
                containerMaxHeight = viewport.height - offset;

            vm.containerStyle = 'height: ' + containerMaxHeight + 'px; max-height: ' + containerMaxHeight + 'px;';
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('recipesController', ['$scope', '$location', 'scaleConfig', 'scaleService', 'stateService', 'recipeService', 'navService', 'subnavService', 'gridFactory', function ($scope, $location, scaleConfig, scaleService, stateService, recipeService, navService, subnavService, gridFactory) {
        subnavService.setCurrentPath('recipes');

        var vm = this,
            recipeTypeViewAll = { name: 'VIEW ALL', title: 'VIEW ALL', version: '', id: 0 };

        vm.recipesParams = stateService.getRecipesParams();

        vm.stateService = stateService;
        vm.loading = true;
        vm.recipeTypeValues = [recipeTypeViewAll];
        vm.selectedRecipeType = vm.recipesParams.type_id ? vm.recipesParams.type_id : recipeTypeViewAll;
        vm.subnavLinks = scaleConfig.subnavLinks.recipes;
        vm.lastModifiedStart = moment.utc(vm.recipesParams.started).toDate();
        vm.lastModifiedStartPopup = {
            opened: false
        };
        vm.openLastModifiedStartPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStartPopup.opened = true;
        };
        vm.lastModifiedStop = moment.utc(vm.recipesParams.ended).toDate();
        vm.lastModifiedStopPopup = {
            opened: false
        };
        vm.openLastModifiedStopPopup = function ($event) {
            $event.stopPropagation();
            vm.lastModifiedStopPopup.opened = true;
        };
        vm.dateModelOptions = {
            timezone: '+000'
        };
        vm.gridOptions = gridFactory.defaultGridOptions();
        vm.gridOptions.paginationCurrentPage = vm.recipesParams.page || 1;
        vm.gridOptions.paginationPageSize = vm.recipesParams.page_size || vm.gridOptions.paginationPageSize;
        vm.gridOptions.data = [];

        var filteredByRecipeType = vm.recipesParams.type_id ? true : false,
            filteredByOrder = vm.recipesParams.order ? true : false;

        vm.colDefs = [
            {
                field: 'recipe_type',
                displayName: 'Recipe Type',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.recipe_type.title }} {{ row.entity.recipe_type.version }}</div>',
                filterHeaderTemplate: '<div class="ui-grid-filter-container"><select class="form-control input-sm" ng-model="grid.appScope.vm.selectedRecipeType" ng-options="recipeType as (recipeType.title + \' \' + recipeType.version) for recipeType in grid.appScope.vm.recipeTypeValues"></select>'
            },
            {
                field: 'created',
                displayName: 'Created (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.created_formatted }}</div>'
            },
            {
                field: 'last_modified',
                displayName: 'Last Modified (Z)',
                enableFiltering: false,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.last_modified_formatted }}</div>'
            },
            {
                field: 'duration',
                enableFiltering: false,
                enableSorting: false,
                width: 120,
                cellTemplate: '<div class="ui-grid-cell-contents text-right">{{ row.entity.getDuration() }}</div>'
            },
            {
                field: 'completed',
                enableFiltering: false,
                enableSorting: true,
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.completed_formatted }}</div>'
            }
        ];

        vm.getRecipes = function () {
            recipeService.getRecipes(vm.recipesParams).then(function (data) {
                vm.gridOptions.minRowsToShow = data.results.length;
                vm.gridOptions.virtualizationThreshold = data.results.length;
                vm.gridOptions.totalItems = data.count;
                vm.gridOptions.data = data.results;
            }).catch(function (error) {
                console.log(error);
            }).finally(function () {
                vm.loading = false;
            });
        };

        vm.getRecipeTypes = function () {
            recipeService.getRecipeTypes().then(function (data) {
                vm.recipeTypeValues.push(data.results);
                vm.recipeTypeValues = _.flatten(vm.recipeTypeValues);
                vm.selectedRecipeType = _.find(vm.recipeTypeValues, { id: vm.recipesParams.type_id }) || recipeTypeViewAll;
                vm.getRecipes();
            }).catch(function (error) {
                vm.loading = false;
            });
        };

        vm.filterResults = function () {
            stateService.setRecipesParams(vm.recipesParams);
            vm.loading = true;
            vm.getRecipes();
        };

        vm.updateColDefs = function () {
            vm.gridOptions.columnDefs = gridFactory.applySortConfig(vm.colDefs, vm.recipesParams);
        };

        vm.updateRecipeOrder = function (sortArr) {
            vm.recipesParams.order = sortArr.length > 0 ? sortArr : null;
            filteredByOrder = sortArr.length > 0;
            vm.filterResults();
        };

        vm.updateRecipeType = function (value) {
            if (value.id !== vm.recipesParams.type_id) {
                vm.recipesParams.page = 1;
            }
            vm.recipesParams.type_id = value.id === 0 ? null : value.id;
            vm.recipesParams.page_size = vm.gridOptions.paginationPageSize;
            if (!vm.loading) {
                vm.filterResults();
            }
        };

        vm.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            vm.gridApi = gridApi;
            vm.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $location.path('/recipes/recipe/' + row.entity.id);
            });
            vm.gridApi.pagination.on.paginationChanged($scope, function (currentPage, pageSize) {
                vm.recipesParams.page = currentPage;
                vm.recipesParams.page_size = pageSize;
                vm.filterResults();
            });
            vm.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                _.forEach(vm.gridApi.grid.columns, function (col) {
                    col.colDef.sort = col.sort;
                });
                stateService.setRecipesColDefs(vm.gridApi.grid.options.columnDefs);
                var sortArr = [];
                _.forEach(sortColumns, function (col) {
                    sortArr.push(col.sort.direction === 'desc' ? '-' + col.field : col.field);
                });
                vm.updateRecipeOrder(sortArr);
            });
        };

        vm.initialize = function () {
            stateService.setRecipesParams(vm.recipesParams);
            vm.updateColDefs();
            vm.getRecipeTypes();
            navService.updateLocation('recipes');
        };

        vm.initialize();

        $scope.$watch('vm.selectedRecipeType', function (value) {
            if (parseInt(value)) {
                value = _.find(vm.recipeTypeValues, {id: parseInt(value)});
            }
            if (value) {
                if (vm.loading) {
                    if (filteredByRecipeType) {
                        vm.updateRecipeType(value);
                    }
                } else {
                    filteredByRecipeType = !angular.equals(value, recipeTypeViewAll);
                    vm.updateRecipeType(value);
                }
            }
        });

        $scope.$watch('vm.lastModifiedStart', function (value) {
            if (!vm.loading) {
                vm.recipesParams.started = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watch('vm.lastModifiedStop', function (value) {
            if (!vm.loading) {
                vm.recipesParams.ended = value.toISOString();
                vm.filterResults();
            }
        });

        $scope.$watchCollection('vm.stateService.getRecipesColDefs()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.colDefs = newValue;
            vm.updateColDefs();
        });

        $scope.$watchCollection('vm.stateService.getRecipesParams()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.recipesParams = newValue;
            vm.updateColDefs();
        });
    }]);
})();
/**
 * <ais-scale-recipe-viewer />
 */
(function () {
    angular.module('scaleApp').controller('aisScaleRecipeGraphViewerController', ['$rootScope', '$scope', '$location', '$uibModal', 'scaleConfig', 'scaleService', 'jobTypeService', 'recipeService', 'workspacesService', 'RecipeType', 'RecipeTypeDetail', 'JobType', 'localStorage', function ($rootScope, $scope, $location, $uibModal, scaleConfig, scaleService, jobTypeService, recipeService, workspacesService, RecipeType, RecipeTypeDetail, JobType, localStorage) {
        var vm = this;
        
        vm.vertices = [];
        vm.edges = [];
        vm.selectedJob = null;
        vm.selectedInputProvider = null;
        vm.mode = null;
        vm.editMode = null;
        vm.dependencyBtnClass = 'fa-plus';
        vm.addBtnText = 'New Recipe';
        vm.addBtnClass = 'btn-primary';
        vm.addBtnIcon = 'fa-plus-circle';
        vm.editBtnText = 'Edit';
        vm.editBtnClass = 'btn-success';
        vm.editBtnIcon = 'fa-edit';
        vm.jobTypeValues = [];
        vm.saveBtnClass = 'btn-default';
        vm.savingRecipe = false;
        vm.warnings = [];
        vm.readonly = true;
        vm.detailMaxHeight = 0;
        vm.recipeTypeTrigger = { dataTypes: '' };
        vm.detailContainerStyle = '';
        vm.containerClass = $scope.hasContainer ? '' : 'detail-container no-tabs';
        vm.lastStatusChange = '';
        vm.availableWorkspaces = [];
        vm.recipeInputTypes = [
            {
                name: 'property',
                title: 'Property',
                fields: []
            },
            {
                name: 'file',
                title: 'File',
                fields: [
                    {
                        name: 'media_types',
                        title: 'Media Types',
                        value: []
                    }
                ]
            },
            {
                name: 'files',
                title: 'Files',
                fields: [
                    {
                        name: 'media_types',
                        title: 'Media Types',
                        value: []
                    }
                ]
            }
        ];
        vm.availableTriggerTypes = scaleConfig.triggerTypes;
        vm.selectedRecipeInputType = {};
        vm.recipeInput = {
            name: '',
            required: true,
            type: ''
        };
        vm.isIE = scaleService.isIE();

        var startJob = null;
        var zoomScale = 0;

        // Dagre variables
        var svg = null;
        var inner = null;
        var graph = null;
        var zoom = null;
        var render = null;

        var getClosestNode = function (name) {
            return d3.selectAll('.nodeRect').filter(function (d) {
                return d === name;
            });
        };

        var getOtherNodes = function (name) {
            return d3.selectAll('.nodeRect').filter(function (d) {
                return d !== name;
            });
        };

        var resetEditBtn = function () {
            vm.editBtnText = vm.mode === 'edit' ? 'Cancel Edit' : 'Edit';
            vm.editBtnClass = vm.mode === 'edit' ? 'btn-warning' : 'btn-success';
            vm.editBtnIcon = vm.mode === 'edit' ? 'fa-close' : 'fa-edit';
        };

        var resetAddBtn = function () {
            vm.addBtnText = vm.mode === 'add' ? 'Cancel' : 'New Recipe';
            vm.addBtnClass = vm.mode === 'add' ? 'btn-warning' : 'btn-primary';
            vm.addBtnIcon = vm.mode === 'add' ? 'fa-close' : 'fa-plus-circle';
        };

        var toggleAddRecipe = function () {
            vm.mode = vm.mode === 'add' ? 'view' : 'add';
            resetAddBtn();
        };

        var toggleEditRecipe = function () {
            if (vm.mode === 'edit') {
                vm.mode = 'view';
                vm.reloadRecipeTypeDetail($scope.recipeType.id);
            } else {
                vm.mode = 'edit';
            }
            vm.editMode = '';
            resetEditBtn();
        };

        var enableSaveRecipe = function () {
            $scope.recipeType.modified = true;
            vm.saveBtnClass = 'btn-success';
        };

        var disableSaveRecipe = function () {
            $scope.recipeType.modified = false;
            vm.saveBtnClass = 'btn-default;'
        };

        var confirmChangeRecipe = function () {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'confirmDialog.html',
                scope: $scope,
                size: 'sm'
            });

            return modalInstance.result;
        };

        var getRecipeTypeJobClassName = function (job) {
            // default to 'nostatus'
            var className = 'nostatus';
            // find the associated job in the recipe.jobs
            if ($scope.recipe) {
                var recipejob = _.find($scope.recipe.jobs,{job_name: job.name});
                if (recipejob) {
                    className = recipejob.job.status.toLowerCase();
                }
            }
            return className;
        };

        vm.reloadRecipeTypeDetail = function (id) {
            var getRecipeDetail = function () {
                recipeService.getRecipeTypeDetail(id).then(function (data) {
                    $scope.recipeType = data;

                });
            };

            if ($scope.recipeType.modified) {
                confirmChangeRecipe().then(function () {
                    // OK
                    disableSaveRecipe();
                    resetAddBtn();
                    if (vm.mode === 'edit') {
                        toggleEditRecipe();
                    }
                    getRecipeDetail();
                }, function () {
                    // Cancel

                });
            } else {
                if (vm.mode === 'edit') {
                    toggleEditRecipe();
                }
                resetAddBtn();
                getRecipeDetail();
            }
        };

        vm.redraw = function () {
            initialize();
            //$rootScope.$broadcast('recipeModified');
        };

        vm.nodeClick = function (name) {
            // Remove selection class
            //$('div').removeClass('selected-node');
            d3.selectAll('.nodeRect').classed('selected-node', false);

            // find the job in the recipe definition
            var job = _.find($scope.recipeType.definition.jobs, { name: name });

            if (name === 'start') {
                job = startJob;
            }
            var $name = $('#' + name);
            var pos = $name.position();

            // click node different from selectedJob
            if (!vm.selectedJob || job.name !== vm.selectedJob.name) {
                if (vm.editMode === 'addDependency') {
                    addDependency(name);
                    enableSaveRecipe();
                    vm.redraw();

                } else if (vm.editMode === 'addInput') {
                    var contentStr = '';
                    if (job.name === 'start') {
                        contentStr = '<ul class="list-group">';
                        _.forEach($scope.recipeType.definition.input_data, function (recipeInput) {
                            contentStr = contentStr + '<li class="list-group-item">';
                            contentStr = contentStr + '<a onclick="mapInputRecipeInput(\'' + recipeInput.name + '\')">' + recipeInput.name + '</a>';
                            if (recipeInput.media_types) {
                                contentStr = contentStr + '<div class="input-media-types">' + recipeInput.media_types.join(',') + '</div>';
                            }
                            contentStr = contentStr + '</li>';
                        });
                        contentStr = contentStr + '</ul>';
                        $name.popover({
                            container: 'body',
                            content: contentStr,
                            html: true,
                            title: 'Select provider/output'
                        });
                        $name.popover('show');
                    } else {
                        if (job.job_type.job_type_interface.output_data.length > 0) {
                            contentStr = '<ul class="list-group">';
                            _.forEach(job.job_type.job_type_interface.output_data, function (jobOutput) {
                                contentStr = contentStr + '<li class="list-group-item">';
                                contentStr = contentStr + '<a onclick="mapInput(\'' + job.name + '\', \'' + jobOutput.name + '\')">' + jobOutput.name + '</a>';
                                if (jobOutput.media_type) {
                                    contentStr = contentStr + '<div class="input-media-types">' + jobOutput.media_type + '</div>';
                                }
                                contentStr = contentStr + '</li>';
                            });
                            contentStr = contentStr + '</ul>';
                            $name.popover({
                                container: 'body',
                                content: contentStr,
                                html: true,
                                title: 'Select provider/output'
                            });
                            $name.popover('show');
                        }
                    }
                } else if (vm.editMode === 'addOutput') {
                    vm.selectedOutputReceiver = job;
                    if (job.job_type.job_type_interface.input_data.length > 0) {
                        contentStr = '<ul class="list-group">';
                        _.forEach(job.job_type.job_type_interface.input_data, function (jobInput) {
                            contentStr = contentStr + '<li class="list-group-item">';
                            contentStr = contentStr + '<a onclick="mapOutput(\'' + job.name + '\', \'' + jobInput.name + '\')">' + jobInput.name + '</a>';
                            if (jobInput.media_types) {
                                contentStr = contentStr + '<div class="input-media-types">' + jobInput.media_types.join(',') + '</div>';
                            }
                            contentStr = contentStr + '</li>';
                        });
                        contentStr = contentStr + '</ul>';
                        $name.popover({
                            container: 'body',
                            content: contentStr,
                            html: true,
                            title: 'Select receiver/input'
                        });
                        $name.popover('show');
                    }
                } else {
                    // update the selected job
                    vm.selectedJob = job;
                    if ($scope.recipe) {
                        vm.selectedRecipeJob = _.find($scope.recipe.jobs, { job_name: job.name });
                    }
                    // apply the selected-node class
                    //$name.addClass('selected-node');
                    getClosestNode(name).classed('selected-node', true);
                }
            }
            else { // click selected node
                //$('div').removeClass('selected-node');
                d3.selectAll('.nodeRect').classed('selected-node', false);
                vm.selectedJob = null;
                vm.selectedRecipeJob = null;
                vm.selectedOutputReceiver = null;
                vm.selectedInputProvider = null;
                vm.editMode = '';
                vm.dependencyBtnClass = 'fa-plus';

                //$('.recipeNode:not(".selected-node")').removeClass('selected-node-selectable');
                getOtherNodes(name).classed('selected-node-selectable', false);
            }
            if (vm.selectedJob) {
                //$('#' + vm.selectedJob.name).addClass('selected-node');
                getClosestNode(vm.selectedJob.name).classed('selected-node', true);
            }
        };
        vm.toggleEditMode = function () {
            if (vm.mode === 'edit') {
                vm.reloadRecipeTypeDetail($scope.recipeType.id);
            } else {
                toggleEditRecipe();
                resetAddBtn();
            }
            $rootScope.$broadcast('toggleEdit', vm.mode);
        };

        vm.openAddJob = function () {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'addJobContent.html',
                scope: $scope,
                size: 'sm'
            });

            modalInstance.result.then(function () {
                if (vm.selectedJobType) {
                    jobTypeService.getJobTypeDetails(vm.selectedJobType.id).then(function (data) {
                        vm.addJobType(data);
                        enableSaveRecipe();
                    });
                }
            }, function () {

            });
        };

        vm.openEditTrigger = function () {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'editTrigger.html',
                scope: $scope,
                size: 'md'
            });

            modalInstance.result.then(function () {
                if (vm.mode === 'edit' || vm.mode === 'add') {
                    $scope.recipeType.trigger_rule.configuration.condition.data_types = vm.recipeTypeTrigger.dataTypes ? vm.recipeTypeTrigger.dataTypes.split(',') : [];
                    enableSaveRecipe();
                }
            }, function () {

            });


        };

        vm.deleteRecipeInput = function (inputName) {
            var removedRecipeInput = _.remove($scope.recipeType.definition.input_data, function (recipeInput) {
                return recipeInput.name === inputName;
            });
            console.log('removed ' + removedRecipeInput.length + ' recipe inputs.');
            enableSaveRecipe();
            vm.redraw();

        };

        vm.openAddInput = function () {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'addInput.html',
                scope: $scope
            });

            modalInstance.result.then(function () {
                // check for fields and add as necessary
                if ( vm.selectedRecipeInputType.fields.length > 0) {
                    var fieldArr = [];
                    _.forEach(vm.selectedRecipeInputType.fields, function (field) {
                        _.forEach(field.value.split(','), function (value) {
                            fieldArr.push(value);
                        });
                        vm.recipeInput[field.name] = fieldArr;
                    });
                }

                // add input to recipe type definition
                $scope.recipeType.definition.input_data.push(vm.recipeInput);
                _.forEach($scope.recipeType.definition.jobs, function (job) {
                    if (job.recipe_inputs.length === 0) {
                        job.recipe_inputs.push({
                            job_input: vm.recipeInput.name,
                            recipe_input: vm.recipeInput.name
                        });
                    }
                });
                getIoMappings();

                // reset form fields
                vm.recipeInput = {
                    name: '',
                    required: true,
                    type: ''
                };
                vm.selectedRecipeInputType = {};
            });
        };

        vm.changeInputType = function () {
            vm.selectedRecipeInputType = _.find(vm.recipeInputTypes, {'name': vm.recipeInput.type});
        };

        var getWarningsHtml = function (warnings) {
            var warningsHtml = '';
            _.forEach(warnings, function (warning) {
                warningsHtml += '<b>' + warning.id + ':</b> ' + warning.details + '<br /><br />';
            });
            warningsHtml += '<button type="button" class="btn btn-default btn-xs clear">Hide</button>';
            return warningsHtml;
        };

        vm.validateRecipeType = function () {
            recipeService.validateRecipeType($scope.recipeType).then(function (validationResult) {
                if (validationResult.warnings && validationResult.warnings.length > 0) {
                    // display the warnings
                    var warningsHtml = getWarningsHtml(validationResult.warnings);
                    toastr["error"](warningsHtml);
                } else {
                    toastr["success"]('Recipe is valid.');
                }
            }).catch(function (error) {
                if (error.detail) {
                    toastr["error"](error.detail);
                } else {
                    toastr["error"](error);
                }
            });

        };


        vm.saveRecipeType = function () {
            vm.savingRecipe = true;
            recipeService.validateRecipeType($scope.recipeType).then(function (validationResult) {
                if (validationResult.warnings && validationResult.warnings.length > 0) {
                    // display the warnings
                    var warningsHtml = getWarningsHtml(validationResult.warnings);
                    toastr["error"](warningsHtml);
                    vm.savingRecipe = false;
                } else {
                    recipeService.saveRecipeType($scope.recipeType).then(function (saveResult) {
                        vm.savingRecipe = false;
                        $scope.recipeType = RecipeTypeDetail.transformer(saveResult);
                        if (scaleConfig.static) {
                            console.log(JSON.stringify($scope.recipeType));
                            localStorage.setItem('recipeType' + $scope.recipeType.id, JSON.stringify($scope.recipeType));
                        }
                        vm.redraw();
                        $location.path('/recipes/types/' + $scope.recipeType.id);
                    });
                }
            }).catch(function (error) {
                if (error && error.detail) {
                    toastr['error'](error.detail);
                } else {
                    toastr['error'](error);
                }
                vm.savingRecipe = false;
            });

            disableSaveRecipe();
        };

        vm.addJobType = function (selectedJobType) {
            console.log(selectedJobType.name);
            $scope.recipeType.definition.addJob(selectedJobType);
            //$scope.$broadcast('redrawRecipes');
            vm.redraw();
        };

        vm.mapInput = function (providerName, providerOutput) {
            console.log('map selected job input to ' + providerName + '.' + providerOutput);
            var dependency = _.find(vm.selectedJob.dependencies, {name: providerName});

            if (dependency && dependency.connections && dependency.connections.length > 0) {
                var conn = _.find(dependency.connections, { output: providerOutput, input: vm.selectedJobInput.name });
                if (!conn) {
                    dependency.connections.push({ output: providerOutput, input: vm.selectedJobInput.name });
                }
            }
            else if (!dependency) {
                dependency = {name: providerName, connections: [{ output: providerOutput, input: vm.selectedJobInput.name }]};
                vm.selectedJob.dependencies.push(dependency);
            }
            else {
                dependency.connections = [{ output: providerOutput, input: vm.selectedJobInput.name }];
            }
            vm.selectedJob.depStart = false;
            vm.editMode = '';
            vm.selectedJobInput = null;
            vm.selectedInputProvider = null;
            enableSaveRecipe();
            vm.redraw();
        };

        vm.mapInputRecipeInput = function (recipeInput) {
            console.log('map selected job to recipe input ' + recipeInput);
            var existingInput = _.find(vm.selectedJob.recipe_inputs, { job_input: vm.selectedJobInput.name });
            if ( existingInput && existingInput.recipe_name !== recipeInput) {
                // update it
                existingInput.recipe_input = recipeInput;
                enableSaveRecipe();
                vm.redraw();
            } else if ( !existingInput ) {
                // create it
                vm.selectedJob.recipe_inputs.push({
                    job_input: vm.selectedJobInput.name,
                    recipe_input: recipeInput
                });
                enableSaveRecipe();
                vm.redraw();
            }
            vm.editMode = '';
            vm.selectedJobInput = null;
            vm.selectedInputProvider = null;
        };

        vm.mapOutput = function (receiverName, receiverInput) {
            var dependency = _.find(vm.selectedOutputReceiver.dependencies, {name: vm.selectedJob.name});

            if (dependency && dependency.connections && dependency.connections.length > 0) {
                var conn = _.find(dependency.connections, { output: vm.selectedJobOutput.name, input: receiverInput });
                if (!conn) {
                    dependency.connections.push({output: vm.selectedJobOutput.name, input: receiverInput});
                }
            }
            else if (!dependency) {
                dependency = {name: vm.selectedJob.name, connections: [{output: vm.selectedJobOutput.name, input: receiverInput}]};
                vm.selectedOutputReceiver.dependencies.push(dependency);
            }
            else {
                dependency.connections = [{output: vm.selectedJobOutput.name, input: receiverInput}];
            }
            vm.selectedOutputReceiver.depStart = false;
            vm.editMode = '';
            vm.selectedJobOutput = null;
            vm.selectedOutputReceiver = null;
            enableSaveRecipe();
            vm.redraw();
        };

        vm.toggleAddDependency = function () {
            if (vm.editMode === 'addDependency') {
                vm.editMode = '';
                vm.dependencyBtnClass = 'fa-plus';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', false);
                //$('.recipeNode:not(".selected-node")').removeClass('selected-node-selectable');
            } else {
                console.log('toggle addDependency mode');
                vm.editMode = 'addDependency';
                vm.dependencyBtnClass = 'fa-remove';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', true);
                //$('.recipeNode:not(".selected-node")').addClass('selected-node-selectable');
            }
        };

        vm.toggleAddInput = function (jobinput) {
            if (vm.editMode === 'addInput') {
                vm.editMode = '';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', false);
                //$('.recipeNode:not(".selected-node")').removeClass('selected-node-selectable');
            } else {
                vm.selectedJobInput = jobinput;
                console.log('toggle addInput mode');
                vm.editMode = 'addInput';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', true);
                //$('.recipeNode:not(".selected-node")').addClass('selected-node-selectable');
            }
        };

        vm.toggleAddOutput = function (joboutput) {
            if (vm.editMode === 'addOutput') {
                vm.editMode = '';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', false);
                //$('.recipeNode:not(".selected-node")').removeClass('selected-node-selectable');
            } else {
                vm.selectedJobOutput = joboutput;
                console.log('toggle addOutput mode');
                vm.editMode = 'addOutput';
                getOtherNodes(vm.selectedJob.name).classed('selected-node-selectable', true);
                //$('.recipeNode:not(".selected-node")').addClass('selected-node-selectable');
            }
        };

        vm.removeDependency = function (depName) {
            var removedDeps = _.remove(vm.selectedJob.dependencies, function (dep) {
                return dep.name === depName;
            });
            console.log('removed ' + removedDeps.length + ' dependencies.');
            enableSaveRecipe();
            vm.redraw();
        };

        vm.removeInputMapping = function (depName, depOutput) {
            if ( depName === 'recipe' ) {
                // remove it from selectedJob.recipe_inputs
                var dep = _.remove(vm.selectedJob.recipe_inputs, { recipe_input: depOutput });
                enableSaveRecipe();
                vm.redraw();
            } else {
                var dep = _.find(vm.selectedJob.dependencies, {name: depName});
                if (dep && dep.connections) {
                    // it's an input from another job
                    var removedCon = _.remove(dep.connections, function (conn) {
                        return conn.output === depOutput;
                    });
                    console.log('removed ' + removedCon.length + ' input connections.');
                    enableSaveRecipe();
                    vm.redraw();
                }
            }

        };

        vm.deleteRecipeJob = function (jobName) {
            // remove dependent connections
            _.forEach($scope.recipeType.definition.jobs, function (job) {
                _.remove(job.dependencies, {name: jobName});
            });
            // remove job from definition.jobs
            _.remove($scope.recipeType.definition.jobs, { name: jobName });
            // enable save and redraw
            vm.selectedJob = null;
            enableSaveRecipe();
            vm.redraw();
        };

        vm.removeOutputMapping = function (jobName, depOutput) {
            // we have to remove output mapping from the job where the dependency is defined
            var receiver = _.find($scope.recipeType.definition.jobs,{name: jobName});
            // remove it from receiver.dependencies
            var dep = _.find(receiver.dependencies, {name: vm.selectedJob.name});
            if (dep && dep.connections) {
                var removedCon = _.remove(dep.connections, function (conn) {
                    return conn.output === depOutput;
                });
                console.log('removed ' + removedCon.length + ' output connections.');
                enableSaveRecipe();
                vm.redraw();
            }
        };

        vm.selectJobTypeToAdd = function (item) {
            vm.selectedJobType = item;
        };

        $scope.$on('redrawRecipes', function () {
            vm.redraw();
        });

        var addDependency = function (jobName) {
            console.log(vm.selectedJob.name + '->' + jobName);
            if (!vm.selectedJob.dependencies) {
                vm.selectedJob.dependencies = [];
            }
            var existingDependency = _.find(vm.selectedJob.dependencies, {name: jobName});

            if (!existingDependency) { vm.selectedJob.dependencies.push({name: jobName}); }
            vm.selectedJob.depStart = false;
            vm.editMode = '';
            vm.dependencyBtnClass = 'fa-plus';

        };

        var getIoMappings = function () {
            if ($scope.recipeType.definition) {
                _.forEach($scope.recipeType.definition.jobs, function (job) {
                    // populate the current jobType
                    /*var thisJobType = _.find($scope.recipeType.job_types,{id: job.job_type_id});
                    job.job_type = thisJobType;*/

                    // find dependents
                    if (job.job_type && job.job_type.job_type_interface) {
                        _.forEach(job.job_type.job_type_interface.output_data, function (jobOutput, key) {
                            if (jobOutput) {
                                var deps = getDependents(job.name,jobOutput.name);
                                jobOutput.dependents = deps;
                            }
                        });
                        // add dependency mappings
                        _.forEach(job.job_type.job_type_interface.input_data, function (jobInput, key) {
                            if (jobInput) {
                                var inputMappings = [];
                                _.forEach(job.dependencies, function (dependency,key) {
                                    _.forEach(dependency.connections, function (conn,key) {
                                        if (conn.input === jobInput.name) {
                                            inputMappings.push({
                                                name: dependency.name,
                                                output: conn.output,
                                                input: conn.input
                                            });
                                        }
                                    });
                                });
                                _.forEach(job.recipe_inputs, function (recipeInput, key) {
                                    if (recipeInput.job_input === jobInput.name) {
                                        inputMappings.push({
                                            name: 'recipe',
                                            output: recipeInput.recipe_input,
                                            input: recipeInput.job_input
                                        });
                                    }
                                });
                                jobInput.dependencies = inputMappings;
                            }
                        });

                    }
                });
            }

        };

        var initialize = function () {

            jobTypeService.getJobTypesOnce().then(function (data) {
                vm.jobTypeValues = data.results;
            });

            workspacesService.getWorkspaces().then(function (data) {
                vm.availableWorkspaces = data
            });

            $scope.$watch('recipeType', function (newValue, oldValue) {
                if (!$scope.recipeType) {
                    $scope.recipeType = new RecipeType();
                }

                if (typeof $scope.recipeType.id === 'undefined' || $scope.recipeType.id === null || $scope.recipeType.id === 0) {
                    vm.mode = 'add';
                } else {
                    if (vm.mode !== 'edit') {
                        vm.mode = 'view'
                    }
                }
                _.forEach($scope.recipeType.definition.jobs, function (job, idx) {
                    if (!job.job_type.job_type_interface && $scope.recipeType.job_types) {
                        var jobTypeData = _.find($scope.recipeType.job_types, {name: job.job_type.name, version: job.job_type.version});
                        $scope.recipeType.definition.jobs[idx].job_type = jobTypeData;
                    }

                });

                // setup string to bind comma delimited list of trigger rule configuration condition data types
                if ($scope.recipeType.trigger_rule) {
                    if ($scope.recipeType.trigger_rule.configuration) {
                        if ($scope.recipeType.trigger_rule.configuration.condition) {
                            if ($scope.recipeType.trigger_rule.configuration.condition.data_types) {
                                vm.recipeTypeTrigger.dataTypes = $scope.recipeType.trigger_rule.configuration.condition.data_types.join(',');
                            }
                        }
                    }
                }

                initGraph();
                getIoMappings();
                drawGraph();
            });
            if ($scope.$parent.vm.user) {
                vm.readonly = false;
            }
        };

        var initGraph = function () {
            // ******
            // setup D3 container and Graph
            // ******
            //vm.selectedJob = null;
            function clicked() {
                var d = d3.event;
                var x = d3.event.x;
                var y = d3.event.y;
                var width = parseInt(svg.style("width").replace(/px/, ""));
                var height = parseInt(svg.style("height").replace(/px/, ""));

                inner.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(2)translate(" + -x + "," + -y + ")");

                //inner.attr("transform", "translate(50px, 50px)scale(2,3)");

                console.log(d);
            }

            svg = d3.select("svg");
            inner = svg.select("g"); //.on("click", clicked);
            // Set up zoom support
            zoom = d3.behavior.zoom().on("zoom", function () {
                zoomScale = d3.event.scale;
                inner.attr("transform", "translate(" + d3.event.translate + ")" +
                    "scale(" + zoomScale + ")");
            });
            svg.call(zoom);

            render = new dagreD3.render();

            // Left-to-right layout
            graph = new dagreD3.graphlib.Graph();
            graph.setGraph({
                nodesep: 70,
                ranksep: 50,
                rankdir: "TB",
                marginx: 20,
                marginy: 20
            });
        };

        drawGraph = function () {
            // globals because dagre needs a reference to angular scope
            window.nodeClick = function (name) {
                var scope = angular.element(document.getElementById('recipeviewer')).scope();
                scope.$apply(function () {
                    scope.vm.nodeClick(name);
                });
            };

            window.mapInput = function (jobName, jobOutput) {
                $('#' + jobName).popover('destroy');
                var scope = angular.element(document.getElementById('recipeviewer')).scope();
                scope.$apply(function () {
                    scope.vm.mapInput(jobName, jobOutput);
                });
            };

            window.mapInputRecipeInput = function (recipeInputName) {
                $('#start').popover('destroy');
                var scope = angular.element(document.getElementById('recipeviewer')).scope();
                scope.$apply(function () {
                    scope.vm.mapInputRecipeInput(recipeInputName);
                });
            };

            window.mapOutput = function (jobName, jobInput) {
                $('#' + jobName).popover('destroy');
                var scope = angular.element(document.getElementById('recipeviewer')).scope();
                scope.$apply(function () {
                    scope.vm.mapOutput(jobName, jobInput);
                });
            };

            if ($scope.recipe) {
                vm.lastStatusChange = $scope.recipe.last_modified ? moment.duration(moment.utc($scope.recipe.last_modified).diff(moment.utc())).humanize(true) : '';
            }

            var jobs = [];
            if ($scope.recipeType.definition) {
                jobs = $scope.recipeType.definition.jobs;
            }
            var childCounts = [];
            // create graph objects
            for (var idx in jobs) {
                var job = jobs[idx];

                if (job.dependencies === undefined || job.dependencies.length < 1) {
                    job.depStart = true;
                }
                var className = getRecipeTypeJobClassName(job);

                var html = '<div class="recipeNode">';
                //var html = "<div onclick=\"console.log('" + job.job_type.name + "')\">";
                if (className !== 'nostatus') {
                    html += '<span class="status"></span>';
                }
                //   html += "<span class=consumers>"+worker.consumers+"</span>";
                html += '<span class="name">';
                if (job.job_type) {
                    //console.log(job.jobType);
                    html += '<div id="' + job.name + '" class="" onclick="nodeClick(\'' + job.name + '\')"><span class="name">' + job.job_type.getIcon() + ' ' + job.name + '</span></div>';
                    //if (jobType.name) {
                    //    html += '<div id="' + job.name + '" class="recipeNode" onclick="nodeClick(\'' + job.name + '\')"><span class="name">' + jobType.getIcon() + ' ' + jobType.title + '</span></div>';
                    //} else {
                    //    html += '<div id="' + job.name + '" class="recipeNode" onclick="nodeClick(\'' + job.name + '\')"><span class="name">' + jobType.getIcon() + ' ' + job.name + '</span></div>';
                    //}

                }
                html += '</span>';
                //   html += "<span class=queue><span class=counter>"+worker.count+"</span></span>";
                html += '</div>';
                graph.setNode(job.name, {
                    labelType: 'html',
                    label: html,
                    rx: 5,
                    ry: 5,
                    padding: 0,
                    class: className
                });
                // setup edges
                for (var d in job.dependencies) {
                    var dep = job.dependencies[d];

                    if (dep.name) {
                        graph.setEdge(dep.name, job.name, {
                            //labelType: 'html',
                            //label: dep.name + '-->' + job.name,
                            width: 20

                        });
                        if (childCounts[dep.name]) {
                            childCounts[dep.name] += 1;
                        } else {
                            childCounts[dep.name] = 1;
                        }
                    }
                }
            }

            // set start node and edges
            graph.setNode('start', {
                labelType: 'html',
                label: '<div id="start" class="recipeNode" onclick="nodeClick(\'start\')"><span class=name>Start</span></div>',
                rx: 5,
                ry: 5,
                padding: 0
            });
            startJob = {
                name: 'start',
                job_type: {
                    title: 'Start'
                },
                input_data: $scope.recipeType.input_data
            };
            var noDeps = _.filter(jobs, 'depStart', true);
            for (var n in noDeps) {
                graph.setEdge('start', noDeps[n].name, {
                    width: 20
                });
            }

            // set end node and edges
            graph.setNode('end', {
                labelType: 'html',
                label: '<div class="recipeNode"><span class="name">End</span></div>',
                rx: 5,
                ry: 5,
                padding: 0
            });
            var noChildren =_.filter(jobs, function (job) {
                return !childCounts[job.name];
            });
            for (var o in noChildren) {
                graph.setEdge(noChildren[o].name, 'end', {
                    width: 20
                });
            }

            // wait for current call stack to clear
            _.defer(function () {
                inner.call(render, graph);
                zoom.event(d3.select("svg"));

                $('.node rect').attr('class', 'nodeRect');

                // add selected class to appropriate node
                if (vm.selectedJob) {
                    //$('#' + vm.selectedJob.name).addClass('selected-node');
                    getClosestNode(vm.selectedJob.name).classed('selected-node', true);
                }
            });
        };

        var getDependents = function (name,outputName) {
            var results = [];

            _.forEach($scope.recipeType.definition.jobs, function (job, key) {
                if (job.name !== name) {
                    _.forEach(job.dependencies, function (dependency, key) {
                        if (dependency.name === name) {
                            _.forEach(dependency.connections, function (conn, key) {
                                if (conn.output === outputName) {
                                    results.push({
                                        name: job.name,
                                        output: conn.output,
                                        input: conn.input
                                    });
                                }
                            });
                        }
                    });
                }
            });
            return results;
        };

        initialize();

    }]).directive('aisScaleRecipeGraphViewer', function () {
        'use strict';
        /**
         * Usage: <ais-scale-recipe-viewer recipe="recipe" />
         */
        return {
            controller: 'aisScaleRecipeGraphViewerController',
            controllerAs: 'vm',
            templateUrl: 'modules/recipes/partials/recipeGraphViewerTemplate.html',
            restrict: 'E',
            scope: {
                recipeType: '=',
                recipe: '=',
                isModified: '=modified',
                allowEdit: '=',
                hasContainer: '='
            }
        };

    });
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('Recipe', ['scaleConfig', 'RecipeType', 'scaleService', function (scaleConfig, RecipeType, scaleService) {
        var Recipe = function (id, created, completed, last_modified, recipe_type) {
            this.id = id;
            this.created = created;
            this.created_formatted = moment.utc(created).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.completed = completed;
            this.completed_formatted = completed ? moment.utc(completed).format(scaleConfig.dateFormats.day_second_utc_nolabel) : '';
            this.last_modified = last_modified;
            this.last_modified_formatted = moment.utc(last_modified).format(scaleConfig.dateFormats.day_second_utc_nolabel);
            this.last_status_change = last_modified ? moment.duration(moment.utc(last_modified).diff(moment.utc())).humanize(true) : '';
            this.recipe_type = RecipeType.transformer(recipe_type);
        };

        // public methods
        Recipe.prototype = {
            getDuration: function () {
                return scaleService.calculateDuration(this.created, this.last_modified);
            }
        };

        // static methods, assigned to class
        Recipe.build = function (data) {
            if (data) {
                return new Recipe(
                    data.id,
                    data.created,
                    data.completed,
                    data.last_modified,
                    data.recipe_type
                );
            }
            return new Recipe();
        };

        Recipe.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(Recipe.build)
                    .filter(Boolean);
            }
            return Recipe.build(data);
        };

        return Recipe;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeData', function () {
        var RecipeData = function (input_data, version, workspace_id) {
            this.input_data = input_data;
            this.version = version;
            this.workspace_id = workspace_id;
        };

        // static methods, assigned to class
        RecipeData.build = function (data) {
            if (data) {
                return new RecipeData(
                    data.input_data,
                    data.version,
                    data.workspace_id
                );
            }
            return new RecipeData();
        };

        RecipeData.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeData.build)
                    .filter(Boolean);
            }
            return RecipeData.build(data);
        };

        return RecipeData;
    });
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeDetails', ['RecipeData', 'RecipeTypeDefinition', 'RecipeType', 'RecipeTypeDetail', 'RecipeJobContainer', 'scaleConfig', function (RecipeData, RecipeTypeDefinition, RecipeType, RecipeTypeDetail, RecipeJobContainer, scaleConfig) {
        var RecipeDetails = function (id, created, completed, last_modified, data, recipe_type, recipe_type_rev, jobs) {
            this.id = id;
            this.created = created;
            this.completed = completed;
            this.completed_formatted = this.completed ? moment.utc(this.completed).format(scaleConfig.dateFormats.day_second_utc) : this.completed;
            this.last_modified = last_modified;
            this.data = RecipeData.transformer(data);
            this.recipe_type = RecipeType.transformer(recipe_type);
            this.recipe_type_rev = RecipeTypeDetail.transformer(recipe_type_rev);
            this.jobs = RecipeJobContainer.transformer(jobs);
        };

        // static methods, assigned to class
        RecipeDetails.build = function (data) {
            if (data) {
                return new RecipeDetails(
                    data.id,
                    data.created,
                    data.completed,
                    data.last_modified,
                    data.data,
                    data.recipe_type,
                    data.recipe_type_rev,
                    data.jobs
                );
            }
            return new RecipeDetails();
        };

        RecipeDetails.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeDetails.build)
                    .filter(Boolean);
            }
            return RecipeDetails.build(data);
        };

        return RecipeDetails;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeJob', ['JobType', function (JobType) {
        var RecipeJob = function (id, status, job_type) {
            this.id = id;
            this.status = status;
            this.job_type = JobType.transformer(job_type);
        };

        // static methods, assigned to class
        RecipeJob.build = function (data) {
            if (data) {
                return new RecipeJob(
                    data.id,
                    data.status,
                    data.job_type
                );
            }
            return new RecipeJob();
        };

        RecipeJob.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeJob.build)
                    .filter(Boolean);
            }
            return RecipeJob.build(data);
        };

        return RecipeJob;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeJobContainer', ['RecipeJob', function (RecipeJob) {
        var RecipeJobContainer = function (job_name, job) {
            this.job_name = job_name;
            this.job = RecipeJob.transformer(job);
        };

        // static methods, assigned to class
        RecipeJobContainer.build = function (data) {
            if (data) {
                return new RecipeJobContainer(
                    data.job_name,
                    data.job
                );
            }
            return new RecipeJobContainer();
        };

        RecipeJobContainer.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeJobContainer.build)
                    .filter(Boolean);
            }
            return RecipeJobContainer.build(data);
        };

        return RecipeJobContainer;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeType', ['scaleConfig', 'RecipeTypeDefinition', function (scaleConfig, RecipeTypeDefinition) {
        var RecipeType = function (id, name, version, title, description, is_active, definition, revision_num, created,  last_modified, archived, trigger_rule) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.title = title;
            this.description = description;
            this.is_active = is_active;
            this.definition = definition ? RecipeTypeDefinition.transformer(definition) : new RecipeTypeDefinition();
            this.revision_num = revision_num;
            this.created = created;
            this.last_modified = last_modified;
            this.archived = archived;
            if (trigger_rule) {
                this.trigger_rule = trigger_rule;
            } else {
                this.trigger_rule = {
                    type: '',
                    name: '',
                    is_active: false,
                    configuration: {
                        condition: {
                            media_type: '',
                            data_types: []
                        },
                        data: {
                            workspace_name: '',
                            input_data_name: ''
                        }
                    }
                };
            }
            this.modified = false;
        };

        // static methods, assigned to class
        RecipeType.build = function (data) {
            if (data) {
                return new RecipeType(
                    data.id,
                    data.name,
                    data.version,
                    data.title,
                    data.description,
                    data.is_active,
                    data.definition,
                    data.revision_num,
                    data.created,
                    data.last_modified,
                    data.archived,
                    data.trigger_rule
                );
            }
            return new RecipeType();
        };

        RecipeType.transformer = function (data) {
            if (angular.isArray(data)) {
                return data.map(RecipeType.build);
            }
            return RecipeType.build(data);
        };

        return RecipeType;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeTypeDefinition', ['scaleConfig', 'RecipeTypeDefinitionJob', 'JobTypeInputData', function (scaleConfig, RecipeTypeDefinitionJob, JobTypeInputData) {

        var self = this;
        // private methods
        var RecipeTypeDefinition = function (input_data, version, jobs) {
            this.input_data = input_data ? JobTypeInputData.transformer(input_data) : [];
            this.version = version || '1.0';
            this.jobs = jobs ? RecipeTypeDefinitionJob.transformer(jobs) : [];
        };

        var getJobName = function(jobs, jobName){
            var theName = jobName;
            var existing = _.find(jobs, { 'name': jobName });
            var idx = 2;
            while(existing){
                theName = jobName + '-' + idx;
                existing = _.find(jobs, { 'name': theName });
                idx++;
            }
            return theName;
        };

        // public methods
        RecipeTypeDefinition.prototype = {
            addJob: function (jobType) {
                var jname = getJobName(this.jobs, jobType.name);
                console.log(jname);
                var job = {
                    dependencies: [],
                    recipe_inputs: [],
                    name: jname,
                    job_type_id: jobType.id,
                    job_type: jobType
                };
                this.jobs.push(job);
            }
        };

        // static methods, assigned to class
        RecipeTypeDefinition.build = function (data) {
            if(data){
                return new RecipeTypeDefinition(
                    data.input_data,
                    data.version,
                    data.jobs
                );
            }
            return new RecipeTypeDefinition();
        };

        RecipeTypeDefinition.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeTypeDefinition.build);
            }
            return RecipeTypeDefinition.build(data);
        };

        return RecipeTypeDefinition;
    }]);
})();

(function(){
    'use strict';

    angular.module('scaleApp').factory('RecipeTypeDefinitionJob', ['scaleConfig', 'JobTypeDetails', function (scaleConfig, JobTypeDetails) {
        // private methods
        var RecipeTypeDefinitionJob = function (recipe_inputs, name, job_type, dependencies) {
            this.recipe_inputs = recipe_inputs;
            this.name = name;
            this.job_type = job_type;
            //this.job_type = {
            //    name: job_type.name,
            //    version: job_type.version
            //};
            this.dependencies = dependencies || [];
        };

        // static methods, assigned to class
        RecipeTypeDefinitionJob.build = function (data) {
            if (data) {
                return new RecipeTypeDefinitionJob(
                    data.recipe_inputs,
                    data.name,
                    data.job_type,
                    data.dependencies
                );
            }
            return new RecipeTypeDefinitionJob();
        };

        RecipeTypeDefinitionJob.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeTypeDefinitionJob.build);
            }
            return RecipeTypeDefinitionJob.build(data);
        };


        return RecipeTypeDefinitionJob;

    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeTypeDetail', ['scaleConfig', 'RecipeTypeDefinition', 'JobTypeDetails', function (scaleConfig, RecipeTypeDefinition, JobTypeDetails) {
        var RecipeTypeDetail = function (id, name, version, title, description, is_active, definition, created, last_modified, archived, trigger_rule, job_types) {
            this.id = id;
            this.name = name;
            this.version = version;
            this.title = title;
            this.description = description;
            this.is_active = is_active;
            this.definition = RecipeTypeDefinition.transformer(definition);
            this.created = created;
            this.last_modified = last_modified;
            this.archived = archived;
            this.trigger_rule = trigger_rule;
            this.job_types = JobTypeDetails.transformer(job_types);
            this.modified = false;
        };

        // static methods, assigned to class
        RecipeTypeDetail.build = function (data) {
            if (data) {
                return new RecipeTypeDetail(
                    data.id,
                    data.name,
                    data.version,
                    data.title,
                    data.description,
                    data.is_active,
                    data.definition,
                    data.created,
                    data.last_modified,
                    data.archived,
                    data.trigger_rule,
                    data.job_types
                );
            }
            return new RecipeTypeDetail();
        };

        RecipeTypeDetail.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeTypeDetail.build);
            }
            return RecipeTypeDetail.build(data);
        };

        return RecipeTypeDetail;
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').factory('RecipeTypeValidation', ['RecipeTypeDefinition', function (RecipeTypeDefinition) {

        var getRecipeTypeValidationJobs = function (jobs) {
            var jobsOut = [];
            _.forEach(jobs, function(job){
               jobsOut.push({
                   recipe_inputs: job.recipe_inputs,
                   name: job.name,
                   job_type: {
                       name: job.job_type.name,
                       version: job.job_type.version
                   },
                   dependencies: job.dependencies
               })
            });
            return jobsOut;
        };
        
        var RecipeTypeValidation = function (id, name, version, title, description, definition, trigger_rule) {
            if (id) {
                this.id = id;
            }
            this.name = name;
            this.version = version;
            this.title = title;
            this.description = description;
            this.definition = {
                input_data: definition.input_data,
                jobs: getRecipeTypeValidationJobs(definition.jobs)
            };
            this.trigger_rule = trigger_rule;
        };

        // static methods, assigned to class
        RecipeTypeValidation.build = function (data) {
            if (data) {
                return new RecipeTypeValidation(
                    data.id,
                    data.name,
                    data.version,
                    data.title,
                    data.description,
                    data.definition,
                    data.trigger_rule
                );
            }
            return new RecipeTypeValidation();
        };

        RecipeTypeValidation.transformer = function (data) {
            if (angular.isArray(data)) {
                return data
                    .map(RecipeTypeValidation.build);
            }
            return RecipeTypeValidation.build(data);
        };

        return RecipeTypeValidation;
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').controller('workspacesController', ['$scope', '$location', '$uibModal', '$routeParams', 'scaleConfig', 'navService', 'workspacesService', 'scaleService', 'stateService', 'userService', 'gridFactory', 'Workspace', 'toastr', function ($scope, $location, $uibModal, $routeParams, scaleConfig, navService, workspacesService, scaleService, stateService, userService, gridFactory, Workspace, toastr) {
        var vm = this,
            currWorkspace = {},
            activeWorkspaces = [],
            inactiveWorkspaces = [];

        vm.loading = true;
        vm.scaleConfig = scaleConfig;
        vm.showActive = stateService.getShowActiveWorkspaces();
        vm.workspaces = [];
        vm.localWorkspaces = [];
        vm.activeWorkspace = {};
        vm.addBtnClass = 'btn-primary';
        vm.addBtnIcon = 'fa-plus-circle';
        vm.saveBtnClass = 'btn-default';
        vm.mode = 'view';
        vm.user = userService.getUserCreds();
        vm.readonly = !(vm.user && vm.user.is_admin);
        vm.brokerDescription = '';
        vm.availableWorkspaceTypes = _.cloneDeep(scaleConfig.workspaceTypes);

        vm.cancelCreate = function () {
            vm.mode = 'view';
            // revert any changes to the workspace
            vm.activeWorkspace = Workspace.transformer(_.cloneDeep(currWorkspace));
            if ($routeParams.id === '0') {
                $location.path('/workspaces');
            }
        };

        vm.editWorkspace = function () {
            // store a reference of the workspace as it currently exists in case the user cancels the edit
            currWorkspace = Workspace.transformer(_.cloneDeep(vm.activeWorkspace));
            vm.mode = 'edit';
        };

        vm.saveWorkspace = function () {
            workspacesService.saveWorkspace(vm.activeWorkspace).then(function (workspace) {
                vm.activeWorkspace = Workspace.transformer(workspace);
                if (scaleConfig.static) {
                    localStorage.setItem('workspace' + vm.activeWorkspace.id, JSON.stringify(vm.activeWorkspace));
                }
                vm.mode = 'view';
                getWorkspaces();
            }).catch(function () {
                
            });
        };

        vm.clearLocalWorkspaces = function () {
            _.forEach(vm.localWorkspaces, function (workspace) {
                localStorage.removeItem('workspace' + workspace.id);
            });
            $location.path('/workspaces');
        };
        
        vm.newWorkspace = function () {
            vm.mode = 'add';
            vm.loadWorkspace(0);
        };

        vm.loadWorkspace = function (id) {
            $location.path('workspaces/' + id);
        };

        var getWarningsHtml = function (warnings) {
            var warningsHtml = '';
            _.forEach(warnings, function (warning) {
                warningsHtml += '<b>' + warning.id + ':</b> ' + warning.details + '<br /><br />';
            });
            warningsHtml += '<button type="button" class="btn btn-default btn-xs clear">Hide</button>';
            return warningsHtml;
        };

        vm.validateWorkspace = function () {
            vm.loading = true;
            workspacesService.validateWorkspace(vm.activeWorkspace).then(function (data) {
                if (data.warnings && data.warnings.length > 0) {
                    // display the warnings
                    var warningsHtml = getWarningsHtml(data.warnings);
                    toastr['error'](warningsHtml);
                } else {
                    toastr['success']('Workspace is valid.');
                }
            }).catch(function (error) {
                if (error.detail) {
                    toastr['error'](error.detail);
                } else {
                    toastr['error'](error);
                }
            }).finally(function () {
                vm.loading = false;
            });
        };

        $scope.$watch('vm.activeWorkspace.json_config.broker.type', function (newValue) {
            if (newValue === 'nfs') {
                vm.brokerDescription = scaleConfig.nfsBrokerDescription;
            } else if (newValue === 'host') {
                vm.brokerDescription = scaleConfig.hostBrokerDescription;
            } else if (newValue === 's3') {
                vm.brokerDescription = scaleConfig.s3BrokerDescription;
            }
        });

        $scope.$watch('vm.showActive', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            vm.showActive = newValue;
            stateService.setShowActiveWorkspaces(newValue);
            vm.workspaces = vm.showActive ? _.cloneDeep(activeWorkspaces) : _.cloneDeep(inactiveWorkspaces);
        });

        var getWorkspaces = function () {
            vm.loading = true;
            workspacesService.getWorkspaces().then(function (data) {
                if (scaleConfig.static) {
                    var i = 0,
                        oJson = {},
                        sKey;
                    for (; sKey = localStorage.key(i); i++) {
                        oJson[sKey] = localStorage.getItem(sKey);
                    }
                    _.filter(_.pairs(oJson), function (o) {
                        if (_.contains(o[0], 'workspace')) {
                            var type = JSON.parse(o[1]);
                            vm.localWorkspaces.push(type);
                            data.push(type);
                        }
                    });
                }
                activeWorkspaces = _.filter(data, { 'is_active': true });
                inactiveWorkspaces = _.filter(data, { 'is_active': false });
                vm.workspaces = vm.showActive ? _.cloneDeep(activeWorkspaces) : _.cloneDeep(inactiveWorkspaces);
                vm.loading = false;
            }).catch(function (error) {
                vm.loading = false;
                console.log(error);
            });
        };

        var initialize = function () {
            getWorkspaces();
            vm.activeWorkspace = null;
            vm.mode = 'view';

            if ($routeParams.id) {
                var id = parseInt($routeParams.id);
                if (id === 0) {
                    vm.mode = 'add';
                    vm.activeWorkspace = new Workspace();
                } else {
                    // set activeWorkspace = workspace details for id
                    workspacesService.getWorkspaceDetails(id).then(function (data) {
                        vm.activeWorkspace = Workspace.transformer(data);
                    });
                }
            }
            navService.updateLocation('workspaces');
        };

        initialize();

        angular.element(document).ready(function () {
            // set container heights equal to available page height
            var viewport = scaleService.getViewportSize(),
                offset = scaleConfig.headerOffset,
                containerMaxHeight = viewport.height - offset + 60;

            vm.containerStyle = 'height: ' + containerMaxHeight + 'px; max-height: ' + containerMaxHeight + 'px;';
        });
    }]);
})();
(function () {
    'use strict';

    angular.module('scaleApp').factory('Workspace', ['scaleConfig', function (scaleConfig) {
        var Workspace = function (id, name, title, description, base_url, is_active, used_size, total_size, created, archived, last_modified, json_config) {
            this.id = id;
            this.name = name;
            this.title = title;
            this.description = description;
            this.base_url = base_url;
            this.is_active = is_active;
            this.used_size = used_size;
            this.total_size = total_size;
            this.created = created;
            this.archived = archived;
            this.last_modified = last_modified;
            this.json_config = json_config || _.cloneDeep(scaleConfig.workspaceTypes[0]);
        };

        Workspace.prototype = {
            clean: function () {
                return {
                    name: this.name,
                    title: this.title,
                    description: this.description,
                    base_url: this.base_url,
                    is_active: this.is_active,
                    json_config: this.json_config
                };
            }
        };

        // static methods, assigned to class
        Workspace.build = function (data) {
            if (data) {
                return new Workspace(
                    data.id,
                    data.name,
                    data.title,
                    data.description,
                    data.base_url,
                    data.is_active,
                    data.used_size,
                    data.total_size,
                    data.created,
                    data.archived,
                    data.last_modified,
                    data.json_config
                );
            }
            return new Workspace();
        };

        Workspace.transformer = function (data) {
            if (angular.isArray(data)) {
                return data.map(Workspace.build);
            }
            return Workspace.build(data);
        };

        return Workspace;
    }]);
})();

(function () {
    'use strict';
    /**
     *
     */
    angular.module('scaleApp').service('recipeService', ['$http', '$q', '$timeout', 'scaleConfig', 'RecipeType', 'RecipeTypeDetail', 'Recipe', 'RecipeDetails', 'RecipeTypeValidation', function ($http, $q, $timeout, scaleConfig, RecipeType, RecipeTypeDetail, Recipe, RecipeDetails, RecipeTypeValidation) {
        var getRecipesParams = function (page, page_size, started, ended, order, completed, recipe_type_id, recipe_type_name, url) {
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                order: order,
                completed: completed,
                recipe_type_id: recipe_type_id,
                recipe_type_name: recipe_type_name,
                url: url
            };
        };

        var getRecipeTypesParams = function (page, page_size, started, ended, order) {
            return {
                page: page,
                page_size: page_size,
                started: started,
                ended: ended,
                order: order ? order : ['title', 'version']
            };
        };

        return {
            getRecipeTypes: function (params) {
                params = params || getRecipeTypesParams();
                var d = $q.defer();

                $http({
                    url: scaleConfig.urls.apiPrefix + 'recipe-types/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = RecipeType.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                
                return d.promise;
            },

            getRecipeTypeDetail: function (id) {
              var d = $q.defer();

              $http.get(scaleConfig.urls.apiPrefix + 'recipe-types/' + id + '/').success(function (data) {
                  var returnData = RecipeTypeDetail.transformer(data);
                  d.resolve(returnData);
              });
              return d.promise;
            },

            getRecipes: function (params) {
                params = params || getRecipesParams();
                var d = $q.defer();

                $http({
                    url: params.url ? params.url : scaleConfig.urls.apiPrefix + 'recipes/',
                    method: 'GET',
                    params: params
                }).success(function (data) {
                    data.results = Recipe.transformer(data.results);
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });

                return d.promise;
            },

            getRecipeDetails: function (id) {
                var d = $q.defer();
                $http.get(scaleConfig.urls.apiPrefix + 'recipes/' + id + '/').success(function (data) {
                    var result = RecipeDetails.transformer(data);
                    d.resolve(result);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },

            saveRecipeType: function (recipeType) {
                var d = $q.defer();
                var cleanRecipeType = RecipeTypeValidation.transformer(recipeType);

                if (!cleanRecipeType.id) {
                    $http.post(scaleConfig.urls.apiPrefix + 'recipe-types/', cleanRecipeType).success(function (result) {
                        d.resolve(result);
                    }).error(function(error){
                        d.reject(error);
                    });
                } else {
                    $http.patch(scaleConfig.urls.apiPrefix + 'recipe-types/' + cleanRecipeType.id + '/', cleanRecipeType).success(function (result) {
                        recipeType = result;
                        d.resolve(recipeType);
                    }).error(function(error){
                        d.reject(error);
                    });
                }

                return d.promise;
            },

            validateRecipeType: function (recipeType) {
                var d = $q.defer();
                var cleanRecipeType = RecipeTypeValidation.transformer(recipeType);

                $http.post(scaleConfig.urls.apiPrefix + 'recipe-types/validation/', cleanRecipeType).success(function (result) {
                    d.resolve(result);
                }).error(function(error){
                    d.reject(error);
                });

                return d.promise;
            }
        };
    }]);
})();

(function () {
    'use strict';

    angular.module('scaleApp').service('workspacesService', ['$http', '$q', '$resource', 'scaleConfig', function ($http, $q, $resource, scaleConfig) {
        return {
            getWorkspaces: function () {
                var d = $q.defer();
                var url = scaleConfig.urls.apiPrefix + 'workspaces/';

                $http({
                    url: url,
                    method: 'GET',
                    params: { order: '-title' }
                }).success(function (data) {
                    d.resolve(data.results);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
            getWorkspaceDetails: function (id) {
                var d = $q.defer();
                var url = scaleConfig.urls.apiPrefix + 'workspaces/' + id + '/';

                $http({
                    url: url,
                    method: 'GET'
                }).success(function (data) {
                    d.resolve(data);
                }).error(function (error) {
                    d.reject(error);
                });
                return d.promise;

            },
            validateWorkspace: function (workspace) {
                var d = $q.defer();
                var cleanWorkspace = workspace.clean();

                $http.post(scaleConfig.urls.apiPrefix + 'workspaces/validation/', cleanWorkspace).success(function (result) {
                    d.resolve(result);
                }).error(function(error){
                    d.reject(error);
                });

                return d.promise;
            },
            saveWorkspace: function (workspace) {
                var d = $q.defer();

                if (!workspace.id) {
                    $http.post(scaleConfig.urls.apiPrefix + 'workspaces/', workspace.clean()).success(function (result) {
                        d.resolve(result);
                    }).error(function (error) {
                        d.reject(error);
                    });
                } else {
                    $http.patch(scaleConfig.urls.apiPrefix + 'workspaces/' + workspace.id + '/', workspace.clean()).success(function (result) {
                        workspace = result;
                        d.resolve(workspace);
                    }).error(function (error) {
                        d.reject(error);
                    });
                }

                return d.promise;
            }
        };
    }]);
})();

/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

 var updateWindow = function(){
    //  x = w.innerWidth || e.clientWidth || g.clientWidth;
    //  y = w.innerHeight|| e.clientHeight|| g.clientHeight;
     //
    //  svg.attr("width", x).attr("height", y);
    console.log('resize');
 };

 window.onresize = updateWindow;

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var margin = {
		top : 20,
		right : 20,
		bottom : 20,
		left : 60
    };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;
	var renderTo = "body";
	var begin = '';
	var ended = '';

    var tickFormat = "%H:%M:%S";

    var keyFunction = function(d) {
		return d[begin] + d.taskName + d[ended];
    };

    var rectTransform = function(d) {
		return "translate(" + x(d[begin]) + "," + y(d.taskName) + ")";
    };

    var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);

    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    var initTimeDomain = function(tasks) {
	if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
	    if (tasks === undefined || tasks.length < 1) {
		timeDomainStart = d3.time.day.offset(new Date(), -3);
		timeDomainEnd = d3.time.hour.offset(new Date(), +3);
		return;
	    }
	    tasks.sort(function(a, b) {
		return a[ended] - b[ended];
	    });
	    timeDomainEnd = tasks[tasks.length - 1][ended];
	    tasks.sort(function(a, b) {
		return a[begin] - b[begin];
	    });
	    timeDomainStart = tasks[0][begin];
	}
    };

    var initAxis = function() {
	x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
	y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
	xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(Math.ceil(width/150)).tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
		.tickSize(8).tickPadding(8);

	yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };

    function gantt(tasks) {

	initTimeDomain(tasks);
	initAxis();

	var svg = d3.select(renderTo)
	.append("svg")
	.attr("class", "chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("class", "gantt-chart")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

      svg.selectAll(".chart")
	 .data(tasks, keyFunction).enter()
	 .append("rect")
	 .attr("rx", 5)
         .attr("ry", 5)
	 .attr("class", function(d){
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     })
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	 .attr("width", function(d) {
	     return (x(d[ended]) - x(d[begin]));
	     });


	 svg.append("g")
	 .attr("class", "x axis")
	 .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
	 .transition()
	 .call(xAxis);

	 svg.append("g").attr("class", "y axis").transition().call(yAxis);

	 return gantt;

    };

    gantt.redraw = function(tasks) {
        console.log('redraw');
	initTimeDomain(tasks);
	initAxis();

        var svg = d3.select("svg");

        var ganttChartGroup = svg.select(".gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        rect.enter()
         .insert("rect",":first-child")
         .attr("rx", 5)
         .attr("ry", 5)
	 .attr("class", function(d){
	     if(taskStatus[d.status] == null){ return "bar";}
	     return taskStatus[d.status];
	     })
	 .transition()
	 .attr("y", 0)
	 .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	  .attr("width", function(d) {
	     return (x(d[ended]) - x(d[begin]));
	     });

        rect.transition()
          .attr("transform", rectTransform)
	 .attr("height", function(d) { return y.rangeBand(); })
	 .attr("width", function(d) {
	     return (x(d[ended]) - x(d[begin]));
	     });

	rect.exit().remove();

	svg.select(".x").transition().call(xAxis);
	svg.select(".y").transition().call(yAxis);

	return gantt;
    };

    gantt.margin = function(value) {
	if (!arguments.length)
	    return margin;
	margin = value;
	return gantt;
    };

    gantt.timeDomain = function(value) {
	if (!arguments.length)
	    return [ timeDomainStart, timeDomainEnd ];
	timeDomainStart = +value[0], timeDomainEnd = +value[1];
	return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.taskTypes = function(value) {
	if (!arguments.length)
	    return taskTypes;
	taskTypes = value;
	return gantt;
    };

    gantt.taskStatus = function(value) {
	if (!arguments.length)
	    return taskStatus;
	taskStatus = value;
	return gantt;
    };

	gantt.begin = function(value){
		if(!arguments.length){
			return begin;
		}
		begin = value;
		return gantt;
	};

	gantt.ended = function(value){
		if(!arguments.length){
			return ended;
		}
		ended = value;
		return gantt;
	};

    gantt.width = function(value) {
	if (!arguments.length)
	    return width;
	width = +value;
	return gantt;
    };

    gantt.height = function(value) {
	if (!arguments.length)
	    return height;
	height = +value;
	return gantt;
    };

    gantt.tickFormat = function(value) {
	if (!arguments.length)
	    return tickFormat;
	tickFormat = value;
	return gantt;
    };

	gantt.renderTo = function(value) {
		if(!arguments.length){
			return renderTo;
		}
		renderTo = value;
		return gantt;
	};



    return gantt;
};

function Gauge(placeholderName, configuration)
{
    this.placeholderName = placeholderName;

    var self = this; // for internal d3 functions

    this.configure = function(configuration)
    {
        this.config = configuration;

        this.config.size = this.config.size * 0.9;

        this.config.raduis = this.config.size * 0.97 / 2;
        this.config.cx = this.config.size / 2;
        this.config.cy = this.config.size / 2;

        this.config.min = undefined != configuration.min ? configuration.min : 0;
        this.config.max = undefined != configuration.max ? configuration.max : 100;
        this.config.range = this.config.max - this.config.min;

        this.config.majorTicks = configuration.majorTicks || 5;
        this.config.minorTicks = configuration.minorTicks || 2;

        this.config.greenColor 	= configuration.greenColor || "#8fca0e";
        this.config.yellowColor = configuration.yellowColor || "#ffc317";
        this.config.redColor 	= configuration.redColor || "#f54d36";

        this.config.transitionDuration = configuration.transitionDuration || 500;
    };

    this.render = function()
    {
        this.body = d3.select("#" + this.placeholderName)
            .append("svg:svg")
            .attr("class", "gauge")
            .attr("width", this.config.size)
            .attr("height", this.config.size);

        this.body.append("svg:circle")
            .attr("class", "outer-circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", this.config.raduis * 0.95)
            .style("fill", "#ccc");
            /*.style("stroke", "#000")
            .style("stroke-width", "0.5px");*/

        this.body.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", 0.9 * this.config.raduis)
            .style("fill", "#fff")
            .style("stroke", "#e0e0e0")
            .style("stroke-width", "2px");

        for (var greenIdx in this.config.greenZones)
        {
            this.drawBand(this.config.greenZones[greenIdx].from, this.config.greenZones[greenIdx].to, self.config.greenColor);
        }

        for (var yellowIdx in this.config.yellowZones)
        {
            this.drawBand(this.config.yellowZones[yellowIdx].from, this.config.yellowZones[yellowIdx].to, self.config.yellowColor);
        }

        for (var redIdx in this.config.redZones)
        {
            this.drawBand(this.config.redZones[redIdx].from, this.config.redZones[redIdx].to, self.config.redColor);
        }

        var fontSize = 0;

        if (undefined != this.config.label)
        {
            fontSize = Math.round(this.config.size / 9);
            this.body.append("svg:text")
                .attr("x", this.config.cx)
                .attr("y", this.config.cy / 2 + fontSize / 2)
                .attr("dy", fontSize / 2)
                .attr("text-anchor", "middle")
                .text(this.config.label)
                .style("font-size", fontSize + "px")
                .style("fill", "#333")
                .style("stroke-width", "0px");
        }

        fontSize = Math.round(this.config.size / 16);
        var majorDelta = this.config.range / (this.config.majorTicks - 1);
        for (var major = this.config.min; major <= this.config.max; major += majorDelta)
        {
            var minorDelta = majorDelta / this.config.minorTicks,
                point1 = 0,
                point2 = 0;
            for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta)
            {
                point1 = this.valueToPoint(minor, 0.75);
                point2 = this.valueToPoint(minor, 0.85);

                this.body.append("svg:line")
                    .attr("x1", point1.x)
                    .attr("y1", point1.y)
                    .attr("x2", point2.x)
                    .attr("y2", point2.y)
                    .style("stroke", "#666")
                    .style("stroke-width", "1px");
            }

            point1 = this.valueToPoint(major, 0.7);
            point2 = this.valueToPoint(major, 0.85);

            this.body.append("svg:line")
                .attr("x1", point1.x)
                .attr("y1", point1.y)
                .attr("x2", point2.x)
                .attr("y2", point2.y)
                .style("stroke", "#333")
                .style("stroke-width", "2px");

            if (major == this.config.min || major == this.config.max)
            {
                var point = this.valueToPoint(major, 0.63);

                this.body.append("svg:text")
                    .attr("x", point.x)
                    .attr("y", point.y)
                    .attr("dy", fontSize / 3)
                    .attr("text-anchor", major == this.config.min ? "start" : "end")
                    .text(major)
                    .style("font-size", fontSize + "px")
                    .style("fill", "#333")
                    .style("stroke-width", "0px");
            }
        }

        var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");

        var midValue = (this.config.min + this.config.max) / 2;

        var pointerPath = this.buildPointerPath(midValue);

        var pointerLine = d3.svg.line()
            .x(function(d) { return d.x })
            .y(function(d) { return d.y })
            .interpolate("basis");

        pointerContainer.selectAll("path")
            .data([pointerPath])
            .enter()
            .append("svg:path")
            .attr("d", pointerLine)
            .style("fill", "#888");

        pointerContainer.append("svg:circle")
            .attr("cx", this.config.cx)
            .attr("cy", this.config.cy)
            .attr("r", 0.12 * this.config.raduis)
            .style("fill", "#888");

        fontSize = Math.round(this.config.size / 10);
        pointerContainer.selectAll("text")
            .data([midValue])
            .enter()
            .append("svg:text")
            .attr("x", this.config.cx)
            .attr("y", this.config.size - this.config.cy / 4 - fontSize)
            .attr("dy", fontSize / 2)
            .attr("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .style("fill", "#000")
            .style("stroke-width", "0px");

        this.redraw(this.config.min, 0);
    };

    this.buildPointerPath = function(value)
    {
        var delta = this.config.range / 13;

        var head = valueToPoint(value, 0.85);
        var head1 = valueToPoint(value - delta, 0.12);
        var head2 = valueToPoint(value + delta, 0.12);

        var tailValue = value - (this.config.range * (1/(270/360)) / 2);
        var tail = valueToPoint(tailValue, 0.28);
        var tail1 = valueToPoint(tailValue - delta, 0.12);
        var tail2 = valueToPoint(tailValue + delta, 0.12);

        return [head, head1, tail2, tail, tail1, head2, head];

        function valueToPoint(value, factor)
        {
            var point = self.valueToPoint(value, factor);
            point.x -= self.config.cx;
            point.y -= self.config.cy;
            return point;
        }
    };

    this.drawBand = function(start, end, color)
    {
        if (0 >= end - start) return;

        this.body.append("svg:path")
            .style("fill", color)
            .attr("d", d3.svg.arc()
                .startAngle(this.valueToRadians(start))
                .endAngle(this.valueToRadians(end))
                .innerRadius(0.65 * this.config.raduis)
                .outerRadius(0.85 * this.config.raduis))
            .attr("transform", function() { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)" });
    };

    this.redraw = function(value, transitionDuration)
    {
        var pointerContainer = this.body.select(".pointerContainer");

        pointerContainer.selectAll("text").text(Math.round(value));

        var pointer = pointerContainer.selectAll("path");
        pointer.transition()
            .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
            //.delay(0)
            //.ease("linear")
            //.attr("transform", function(d)
            .attrTween("transform", function()
            {
                var pointerValue = value;
                if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
                else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
                var targetRotation = (self.valueToDegrees(pointerValue) - 90);
                var currentRotation = self._currentRotation || targetRotation;
                self._currentRotation = targetRotation;

                return function(step)
                {
                    var rotation = currentRotation + (targetRotation-currentRotation)*step;
                    return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
                }
            });

        var outerCircle = this.body.select(".outer-circle")
            .transition()
            .duration(750)
            .style("fill", function () {
                var i = parseInt(value);
                if (i > 0 && i < 75) {
                    return self.config.greenColor;
                } else if (i >= 75 && i < 90) {
                    return self.config.yellowColor;
                } else {
                    return self.config.redColor;
                }
            });
    };

    this.valueToDegrees = function(value)
    {
        // thanks @closealert
        //return value / this.config.range * 270 - 45;
        return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
    };

    this.valueToRadians = function(value)
    {
        return this.valueToDegrees(value) * Math.PI / 180;
    };

    this.valueToPoint = function(value, factor)
    {
        return { 	x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
            y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value)) 		};
    };

    // initialization
    this.configure(configuration);
}
/*! 
 * angular-hotkeys v1.5.0
 * https://chieffancypants.github.io/angular-hotkeys
 * Copyright (c) 2015 Wes Cruver
 * License: MIT
 */
!function(){"use strict";angular.module("cfp.hotkeys",[]).provider("hotkeys",["$injector",function(a){this.includeCheatSheet=!0,this.useNgRoute=a.has("ngViewDirective"),this.templateTitle="Keyboard Shortcuts:",this.templateHeader=null,this.templateFooter=null,this.template='<div class="cfp-hotkeys-container fade" ng-class="{in: helpVisible}" style="display: none;"><div class="cfp-hotkeys"><h4 class="cfp-hotkeys-title" ng-if="!header">{{ title }}</h4><div ng-bind-html="header" ng-if="header"></div><table><tbody><tr ng-repeat="hotkey in hotkeys | filter:{ description: \'!$$undefined$$\' }"><td class="cfp-hotkeys-keys"><span ng-repeat="key in hotkey.format() track by $index" class="cfp-hotkeys-key">{{ key }}</span></td><td class="cfp-hotkeys-text">{{ hotkey.description }}</td></tr></tbody></table><div ng-bind-html="footer" ng-if="footer"></div><div class="cfp-hotkeys-close" ng-click="toggleCheatSheet()">×</div></div></div>',this.cheatSheetHotkey="?",this.cheatSheetDescription="Show / hide this help menu",this.$get=["$rootElement","$rootScope","$compile","$window","$document",function(a,b,c,d,e){function f(a){var b={command:"⌘",shift:"⇧",left:"←",right:"→",up:"↑",down:"↓","return":"↩",backspace:"⌫"};a=a.split("+");for(var c=0;c<a.length;c++)"mod"===a[c]&&(d.navigator&&d.navigator.platform.indexOf("Mac")>=0?a[c]="command":a[c]="ctrl"),a[c]=b[a[c]]||a[c];return a.join(" + ")}function g(a,b,c,d,e,f){this.combo=a instanceof Array?a:[a],this.description=b,this.callback=c,this.action=d,this.allowIn=e,this.persistent=f,this._formated=null}function h(){for(var a=o.hotkeys.length;a--;){var b=o.hotkeys[a];b&&!b.persistent&&k(b)}}function i(){o.helpVisible=!o.helpVisible,o.helpVisible?(t=l("esc"),k("esc"),j("esc",t.description,i,null,["INPUT","SELECT","TEXTAREA"])):(k("esc"),t!==!1&&j(t))}function j(a,b,c,d,e,f){var h,i=["INPUT","SELECT","TEXTAREA"],j=Object.prototype.toString.call(a);if("[object Object]"===j&&(b=a.description,c=a.callback,d=a.action,f=a.persistent,e=a.allowIn,a=a.combo),b instanceof Function?(d=c,c=b,b="$$undefined$$"):angular.isUndefined(b)&&(b="$$undefined$$"),void 0===f&&(f=!0),"function"==typeof c){h=c,e instanceof Array||(e=[]);for(var k,l=0;l<e.length;l++)e[l]=e[l].toUpperCase(),k=i.indexOf(e[l]),-1!==k&&i.splice(k,1);c=function(a){var b=!0,c=a.target||a.srcElement,d=c.nodeName.toUpperCase();if((" "+c.className+" ").indexOf(" mousetrap ")>-1)b=!0;else for(var e=0;e<i.length;e++)if(i[e]===d){b=!1;break}b&&n(h.apply(this,arguments))}}"string"==typeof d?Mousetrap.bind(a,n(c),d):Mousetrap.bind(a,n(c));var m=new g(a,b,c,d,e,f);return o.hotkeys.push(m),m}function k(a){var b=a instanceof g?a.combo:a;if(Mousetrap.unbind(b),angular.isArray(b)){for(var c=!0,d=b.length;d--;)c=k(b[d])&&c;return c}var e=o.hotkeys.indexOf(l(b));return e>-1?(o.hotkeys[e].combo.length>1?o.hotkeys[e].combo.splice(o.hotkeys[e].combo.indexOf(b),1):o.hotkeys.splice(e,1),!0):!1}function l(a){if(!a)return o.hotkeys;for(var b,c=0;c<o.hotkeys.length;c++)if(b=o.hotkeys[c],b.combo.indexOf(a)>-1)return b;return!1}function m(a){return a.$id in p||(p[a.$id]=[],a.$on("$destroy",function(){for(var b=p[a.$id].length;b--;)k(p[a.$id].pop())})),{add:function(b){var c;return c=arguments.length>1?j.apply(this,arguments):j(b),p[a.$id].push(c),this}}}function n(a){return function(c,d){if(a instanceof Array){var e=a[0],f=a[1];a=function(a){f.scope.$eval(e)}}b.$apply(function(){a(c,l(d))})}}Mousetrap.prototype.stopCallback=function(a,b){return(" "+b.className+" ").indexOf(" mousetrap ")>-1?!1:b.contentEditable&&"true"==b.contentEditable},g.prototype.format=function(){if(null===this._formated){for(var a=this.combo[0],b=a.split(/[\s]/),c=0;c<b.length;c++)b[c]=f(b[c]);this._formated=b}return this._formated};var o=b.$new();o.hotkeys=[],o.helpVisible=!1,o.title=this.templateTitle,o.header=this.templateHeader,o.footer=this.templateFooter,o.toggleCheatSheet=i;var p=[];if(this.useNgRoute&&b.$on("$routeChangeSuccess",function(a,b){h(),b&&b.hotkeys&&angular.forEach(b.hotkeys,function(a){var c=a[2];("string"==typeof c||c instanceof String)&&(a[2]=[c,b]),a[5]=!1,j.apply(this,a)})}),this.includeCheatSheet){var q=e[0],r=a[0],s=angular.element(this.template);j(this.cheatSheetHotkey,this.cheatSheetDescription,i),(r===q||r===q.documentElement)&&(r=q.body),angular.element(r).append(c(s)(o))}var t=!1,u={add:j,del:k,get:l,bindTo:m,template:this.template,toggleCheatSheet:i,includeCheatSheet:this.includeCheatSheet,cheatSheetHotkey:this.cheatSheetHotkey,cheatSheetDescription:this.cheatSheetDescription,useNgRoute:this.useNgRoute,purgeHotkeys:h,templateTitle:this.templateTitle};return u}]}]).directive("hotkey",["hotkeys",function(a){return{restrict:"A",link:function(b,c,d){var e,f;angular.forEach(b.$eval(d.hotkey),function(b,c){f="string"==typeof d.hotkeyAllowIn?d.hotkeyAllowIn.split(/[\s,]+/):[],e=c,a.add({combo:c,description:d.hotkeyDescription,callback:b,action:d.hotkeyAction,allowIn:f})}),c.bind("$destroy",function(){a.del(e)})}}}]).run(["hotkeys",function(a){}])}(),function(a,b,c){function d(a,b,c){return a.addEventListener?void a.addEventListener(b,c,!1):void a.attachEvent("on"+b,c)}function e(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);return a.shiftKey||(b=b.toLowerCase()),b}return r[a.which]?r[a.which]:s[a.which]?s[a.which]:String.fromCharCode(a.which).toLowerCase()}function f(a,b){return a.sort().join(",")===b.sort().join(",")}function g(a){var b=[];return a.shiftKey&&b.push("shift"),a.altKey&&b.push("alt"),a.ctrlKey&&b.push("ctrl"),a.metaKey&&b.push("meta"),b}function h(a){return a.preventDefault?void a.preventDefault():void(a.returnValue=!1)}function i(a){return a.stopPropagation?void a.stopPropagation():void(a.cancelBubble=!0)}function j(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function k(){if(!q){q={};for(var a in r)a>95&&112>a||r.hasOwnProperty(a)&&(q[r[a]]=a)}return q}function l(a,b,c){return c||(c=k()[a]?"keydown":"keypress"),"keypress"==c&&b.length&&(c="keydown"),c}function m(a){return"+"===a?["+"]:(a=a.replace(/\+{2}/g,"+plus"),a.split("+"))}function n(a,b){var c,d,e,f=[];for(c=m(a),e=0;e<c.length;++e)d=c[e],u[d]&&(d=u[d]),b&&"keypress"!=b&&t[d]&&(d=t[d],f.push("shift")),j(d)&&f.push(d);return b=l(d,f,b),{key:d,modifiers:f,action:b}}function o(a,c){return a===b?!1:a===c?!0:o(a.parentNode,c)}function p(a){function c(a){a=a||{};var b,c=!1;for(b in u)a[b]?c=!0:u[b]=0;c||(x=!1)}function k(a,b,c,d,e,g){var h,i,k=[],l=c.type;if(!s._callbacks[a])return[];for("keyup"==l&&j(a)&&(b=[a]),h=0;h<s._callbacks[a].length;++h)if(i=s._callbacks[a][h],(d||!i.seq||u[i.seq]==i.level)&&l==i.action&&("keypress"==l&&!c.metaKey&&!c.ctrlKey||f(b,i.modifiers))){var m=!d&&i.combo==e,n=d&&i.seq==d&&i.level==g;(m||n)&&s._callbacks[a].splice(h,1),k.push(i)}return k}function l(a,b,c,d){s.stopCallback(b,b.target||b.srcElement,c,d)||a(b,c)===!1&&(h(b),i(b))}function m(a){"number"!=typeof a.which&&(a.which=a.keyCode);var b=e(a);if(b)return"keyup"==a.type&&v===b?void(v=!1):void s.handleKey(b,g(a),a)}function o(){clearTimeout(t),t=setTimeout(c,1e3)}function q(a,b,d,f){function g(b){return function(){x=b,++u[a],o()}}function h(b){l(d,b,a),"keyup"!==f&&(v=e(b)),setTimeout(c,10)}u[a]=0;for(var i=0;i<b.length;++i){var j=i+1===b.length,k=j?h:g(f||n(b[i+1]).action);r(b[i],k,f,a,i)}}function r(a,b,c,d,e){s._directMap[a+":"+c]=b,a=a.replace(/\s+/g," ");var f,g=a.split(" ");return g.length>1?void q(a,g,b,c):(f=n(a,c),s._callbacks[f.key]=s._callbacks[f.key]||[],k(f.key,f.modifiers,{type:f.action},d,a,e),void s._callbacks[f.key][d?"unshift":"push"]({callback:b,modifiers:f.modifiers,action:f.action,seq:d,level:e,combo:a}))}var s=this;if(a=a||b,!(s instanceof p))return new p(a);s.target=a,s._callbacks={},s._directMap={};var t,u={},v=!1,w=!1,x=!1;s._handleKey=function(a,b,d){var e,f=k(a,b,d),g={},h=0,i=!1;for(e=0;e<f.length;++e)f[e].seq&&(h=Math.max(h,f[e].level));for(e=0;e<f.length;++e)if(f[e].seq){if(f[e].level!=h)continue;i=!0,g[f[e].seq]=1,l(f[e].callback,d,f[e].combo,f[e].seq)}else i||l(f[e].callback,d,f[e].combo);var m="keypress"==d.type&&w;d.type!=x||j(a)||m||c(g),w=i&&"keydown"==d.type},s._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)r(a[d],b,c)},d(a,"keypress",m),d(a,"keydown",m),d(a,"keyup",m)}for(var q,r={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},s={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},t={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},u={option:"alt",command:"meta","return":"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},v=1;20>v;++v)r[111+v]="f"+v;for(v=0;9>=v;++v)r[v+96]=v;p.prototype.bind=function(a,b,c){var d=this;return a=a instanceof Array?a:[a],d._bindMultiple.call(d,a,b,c),d},p.prototype.unbind=function(a,b){var c=this;return c.bind.call(c,a,function(){},b)},p.prototype.trigger=function(a,b){var c=this;return c._directMap[a+":"+b]&&c._directMap[a+":"+b]({},a),c},p.prototype.reset=function(){var a=this;return a._callbacks={},a._directMap={},a},p.prototype.stopCallback=function(a,b){var c=this;return(" "+b.className+" ").indexOf(" mousetrap ")>-1?!1:o(b,c.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable},p.prototype.handleKey=function(){var a=this;return a._handleKey.apply(a,arguments)},p.init=function(){var a=p(b);for(var c in a)"_"!==c.charAt(0)&&(p[c]=function(b){return function(){return a[b].apply(a,arguments)}}(c))},p.init(),a.Mousetrap=p,"undefined"!=typeof module&&module.exports&&(module.exports=p),"function"==typeof define&&define.amd&&define(function(){return p})}(window,document);
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}
(function () {
    'use strict';

    angular.module('scaleApp').config(['$provide', function ($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
    }]).run(['$httpBackend', 'scaleConfig', 'XMLHttpRequest', function ($httpBackend, scaleConfig, XMLHttpRequest) {

        var getSync = function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send(null);
            return [request.status, request.response, {}];
        };

        var getUrlParams = function (url) {
            var obj = {};

            if (url && url.split('?').length > 1) {
                url.split('?')[1].split('&').forEach(function (item) {
                    var s = item.split('='),
                        k = s[0],
                        v = s[1] && decodeURIComponent(s[1]);
                    (k in obj) ? obj[k].push(v) : obj[k] = [v]
                });
            }

            return obj;
        };

        // Ingests Status
        var ingestsStatusRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'ingests/status/', 'i');
        $httpBackend.whenGET(ingestsStatusRegex).respond(function () {
            var strikes = JSON.parse(getSync('test/data/ingestStrikes.json')[1]),
                startDate = moment.utc().subtract(1, 'w').startOf('d').toISOString(),
                endDate = moment.utc().add(1, 'd').startOf('d').toISOString(),
                numHours = moment.utc(endDate).diff(moment.utc(startDate), 'h'),
                thisTime = '',
                values = [],
                results = [];

            _.forEach(strikes.results, function (strike) {
                values = [];

                for (var i = 0; i < numHours; i++) {
                    thisTime = moment.utc(startDate).add(i, 'h').toISOString();
                    values.push({
                        time: thisTime,
                        files: Math.floor(Math.random() * (500 - 5 + 1)) + 5,
                        size: Math.floor(Math.random() * (500000000 - 5000000 + 1)) + 5000000
                    });
                }

                results.push({
                    strike: strike,
                    most_recent: moment.utc().startOf('h').toISOString(),
                    files: 2,
                    size: 123456789,
                    values: values
                });
            });

            var data = {
                count: 2,
                next: null,
                previous: null,
                results: results
            };

            return [200, data, {}];
        });

        // Ingests
        var ingestsOverrideUrl = 'test/data/ingests.json';
        var ingestsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'ingests/', 'i');
        $httpBackend.whenGET(ingestsRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                returnObj = getSync(ingestsOverrideUrl),
                ingests = JSON.parse(returnObj[1]);

            if (urlParams.order && urlParams.order.length > 0) {
                var orders = [],
                    fields = [];
                _.forEach(urlParams.order, function (o) {
                    var order = o.charAt(0) === '-' ? 'desc' : 'asc',
                        field = order === 'desc' ? urlParams.order[0].substring(1) : urlParams.order[0];

                    orders.push(order);
                    fields.push(field);
                });

                ingests.results = _.sortByOrder(ingests.results, fields, orders);
            }

            if (urlParams.page && urlParams.page.length > 0) {
                var page = parseInt(urlParams.page[0]),
                    pageSize = parseInt(urlParams.page_size[0]);

                if (page === 1) {
                    ingests.results = _.take(ingests.results, pageSize);
                } else {
                    var startIdx = (page - 1) * pageSize,
                        idxArray = [];

                    for (var i = startIdx; i < ingests.results.length - 1; i++) {
                        idxArray.push(i);
                    }

                    ingests.results = _.at(ingests.results, idxArray);
                }
            }

            if (urlParams.status) {
                ingests.results = _.filter(ingests.results, function (ingest) {
                    return ingest.status === urlParams.status[0];
                });
            }

            returnObj[1] = JSON.stringify(ingests);

            return returnObj;
        });

        // Source details
        var sourceDetailsOverrideUrl = 'test/data/sourceDetails.json';
        var sourceDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'sources/.*/', 'i');
        $httpBackend.whenGET(sourceDetailsRegex).respond(function (method, url) {
            // // get the jobType.id from the url
            // url = url.toString();
            // var filename = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            // sourceDetailsOverrideUrl = 'test/data/source-details/' + filename + '.json';
            return getSync(sourceDetailsOverrideUrl);
        });
        
        // Sources
        var sourcesOverrideUrl = 'test/data/sources.json';
        var sourcesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'sources/', 'i');
        $httpBackend.whenGET(sourcesRegex).respond(function (method, url) {
            //return getSync(sourcesOverrideUrl);
            var urlParams = getUrlParams(url),
                returnObj = getSync(sourcesOverrideUrl),
                sources = JSON.parse(returnObj[1]);

            if (urlParams.file_name && urlParams.file_name.length > 0) {
                var orders = ['file_name'],
                    fields = ['asc'];

                sources.results = _.filter(sources.results, function (r) {
                    return r.file_name.toLowerCase().includes(urlParams.file_name[0].toLowerCase());
                });

                sources.results = _.sortByOrder(sources.results, fields, orders);
            }

            returnObj[1] = JSON.stringify(sources);

            return returnObj;
        });

        // Job load
        var jobLoadRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'load/', 'i');
        $httpBackend.whenGET(jobLoadRegex).respond(function () {
            var numHours = moment.utc().endOf('d').diff(moment.utc().subtract(7, 'd').startOf('d'), 'h');
            var startTime = moment.utc().subtract(7, 'd').startOf('d');
            var data = {
                count: numHours,
                next: null,
                previous: null,
                results: []
            };

            for (var i = 0; i < data.count; i++) {
                data.results.push({
                    time: moment.utc(startTime).add(i, 'h').toISOString(),
                    pending_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
                    queued_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20,
                    running_count: Math.floor(Math.random() * (100 - 20 + 1)) + 20
                });
            }

            return [200, data, {}];
        });

        // Job details
        var jobDetailsOverrideUrl = 'test/data/jobDetails.json';
        var jobDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'jobs/.*/', 'i');
        $httpBackend.whenGET(jobDetailsRegex).respond(function (method, url) {
            // get the jobType.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            jobDetailsOverrideUrl = 'test/data/job-details/jobDetails' + id + '.json';
            return getSync(jobDetailsOverrideUrl);
        });

        // Jobs
        var jobsOverrideUrl = 'test/data/jobs.json';
        var jobsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'jobs/', 'i');
        $httpBackend.whenGET(jobsRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                returnObj = getSync(jobsOverrideUrl),
                jobs = JSON.parse(returnObj[1]);

            if (urlParams.order && urlParams.order.length > 0) {
                var orders = [],
                    fields = [];
                _.forEach(urlParams.order, function (o) {
                    var order = o.charAt(0) === '-' ? 'desc' : 'asc',
                        field = order === 'desc' ? urlParams.order[0].substring(1) : urlParams.order[0];

                    if (field === 'job_type') {
                        field = 'job_type.name';
                    }

                    orders.push(order);
                    fields.push(field);
                });

                jobs.results = _.sortByOrder(jobs.results, fields, orders);
            }

            if (urlParams.status) {
                jobs.results = _.filter(jobs.results, function (job) {
                    return job.status === urlParams.status[0];
                });
            }

            returnObj[1] = JSON.stringify(jobs);

            return returnObj;
        });

        // Job type status
        var jobTypeStatusOverrideUrl = 'test/data/jobTypeStatus.json';
        var jobTypeStatusRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'job-types/status/', 'i');
        $httpBackend.whenGET(jobTypeStatusRegex).respond(function () {
            return getSync(jobTypeStatusOverrideUrl);
        });

        // Running job types
        var runningJobsOverrideUrl = 'test/data/runningJobs.json';
        var runningJobsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'job-types/running/', 'i');
        $httpBackend.whenGET(runningJobsRegex).respond(function () {
            return getSync(runningJobsOverrideUrl);
        });

        // Job Type Details
        var jobTypeDetailsOverrideUrl = 'test/data/job-types/jobType1.json';
        var jobTypeDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'job-types/.*/', 'i');
        $httpBackend.whenGET(jobTypeDetailsRegex).respond(function (method, url) {
            // get the jobType.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            jobTypeDetailsOverrideUrl = 'test/data/job-types/jobType' + id + '.json';
            return getSync(jobTypeDetailsOverrideUrl);
        });

        // Job types
        var jobTypesOverrideUrl = 'test/data/jobTypes.json';
        var jobTypesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'job-types/', 'i');
        $httpBackend.whenGET(jobTypesRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                returnObj = getSync(jobTypesOverrideUrl),
                jobTypes = JSON.parse(returnObj[1]);

            if (urlParams.order && urlParams.order.length > 0) {
                var orders = [],
                    fields = [];
                _.forEach(urlParams.order, function (o) {
                    var order = o.charAt(0) === '-' ? 'desc' : 'asc',
                        field = order === 'desc' ? urlParams.order[0].substring(1) : urlParams.order[0];

                    orders.push(order);
                    fields.push(field);
                });

                jobTypes.results = _.sortByOrder(jobTypes.results, fields, orders);
            }

            returnObj[1] = JSON.stringify(jobTypes);

            return returnObj;
        });
        
        // Job execution logs
        var jobExecutionLogsOverrideUrl = 'test/data/jobExecutionLog.json';
        var jobExecutionLogRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'job-executions/.*/logs/', 'i');
        $httpBackend.whenGET(jobExecutionLogRegex).respond(function () {
            return getSync(jobExecutionLogsOverrideUrl);
        });


        // Metrics Plot Data Detail
        //var metricsPlotDataOverrideUrl = 'test/data/metricsJobTypesPlotData.json';
        var metricsPlotDataRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'metrics/.*/.*/','i');
        $httpBackend.whenGET(metricsPlotDataRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                random = 0;

            var returnObj = {
                count: 28,
                next: null,
                previous: null,
                results: []
            };

            var numDays = moment.utc(urlParams.ended[0]).diff(moment.utc(urlParams.started[0]), 'd') + 1;

            _.forEach(urlParams.column, function (metric) {
                var maxRandom = metric === 'total_count' ? 1000 : 200;
                var minRandom = metric === 'total_count' ? 800 : 10;
                var returnResult = {
                    column: { title: _.startCase(metric) },
                    min_x: moment.utc(urlParams.started[0]).format('YYYY-MM-DD'),
                    max_x: moment.utc(urlParams.ended[0]).format('YYYY-MM-DD'),
                    min_y: 1,
                    max_y: 1000,
                    values: []
                };

                for (var i = 0; i < numDays; i++) {
                    if (urlParams.choice_id && urlParams.choice_id.length > 1) {
                        _.forEach(urlParams.choice_id, function (id) {
                            random = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                            if (random <= 4) {
                                var value = Math.floor(Math.random() * (maxRandom - minRandom + 1)) + minRandom;
                                returnResult.values.push({
                                    date: moment.utc(urlParams.started[0]).add(i, 'd').format('YYYY-MM-DD'),
                                    value: value,
                                    id: parseInt(id)
                                });
                            }
                        });
                    } else {
                        random = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
                        if (random <= 4) {
                            returnResult.values.push({
                                date: moment.utc(urlParams.started[0]).add(i, 'd').format('YYYY-MM-DD'),
                                value: Math.floor(Math.random() * (maxRandom - minRandom + 1)) + minRandom
                            });
                        }
                    }
                }
                returnObj.results.push(returnResult);
            });

            return [200, returnObj, {}];
        });

        // Metrics Detail
        var metricsDetailRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'metrics/.*/','i');
        $httpBackend.whenGET(metricsDetailRegex).respond(function (method, url) {
            var urlArr = url.split('/'),
                detailType = urlArr[urlArr.length - 2];

            if (detailType === 'job-types') {
                return getSync('test/data/metricsJobTypes.json');
            } else if (detailType === 'error-types') {
                return getSync('test/data/metricsErrorTypes.json');
            }
            return getSync('test/data/metricsIngest.json');
        });

        // Metrics
        var metricsOverrideUrl = 'test/data/metrics.json';
        var metricsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'metrics/','i');
        $httpBackend.whenGET(metricsRegex).respond(function () {
            return getSync(metricsOverrideUrl);
        });

        // Node status
        var nodeStatusOverrideUrl = 'test/data/nodeStatus.json';
        var nodeStatusRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'nodes/status/', 'i');
        $httpBackend.whenGET(nodeStatusRegex).respond(function () {
            return getSync(nodeStatusOverrideUrl);
        });

        // Node details
        var nodeOverrideUrl = 'test/data/node.json';
        var nodeRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'nodes/.*/', 'i');
        $httpBackend.whenGET(nodeRegex).respond(function () {
            return getSync(nodeOverrideUrl);
        });
        $httpBackend.whenPATCH(nodeRegex).respond(function () {
            return getSync(nodeOverrideUrl);
        });

        // Nodes
        var nodesOverrideUrl = 'test/data/nodes.json';
        var nodesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'nodes/', 'i');
        $httpBackend.whenGET(nodesRegex).respond(function () {
            return getSync(nodesOverrideUrl);
        });

        // Queue Status service
        var queueStatusOverrideUrl = 'test/data/queueStatus.json';
        var queueStatusRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'queue/status/', 'i');
        $httpBackend.whenGET(queueStatusRegex).respond(function () {
            return getSync(queueStatusOverrideUrl);
        });
        
        // Recipe Details
        var recipeDetailsOverrideUrl = 'test/data/recipeDetails.json';
        var recipeDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipes/.*/', 'i');
        $httpBackend.whenGET(recipeDetailsRegex).respond(function (method, url) {
            // get the recipeDetail.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            recipeDetailsOverrideUrl = 'test/data/recipe-details/recipeDetail' + id + '.json';
            return getSync(recipeDetailsOverrideUrl);
        });

        // Recipes service
        var recipesOverrideUrl = 'test/data/recipes.json';
        var recipesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipes/', 'i');
        $httpBackend.whenGET(recipesRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                returnObj = getSync(recipesOverrideUrl),
                recipes = JSON.parse(returnObj[1]);

            if (urlParams.order && urlParams.order.length > 0) {
                var orders = [],
                    fields = [];
                _.forEach(urlParams.order, function (o) {
                    var order = o.charAt(0) === '-' ? 'desc' : 'asc',
                        field = order === 'desc' ? urlParams.order[0].substring(1) : urlParams.order[0];

                    if (field === 'recipe_type') {
                        field = 'recipe_type.name';
                    }

                    orders.push(order);
                    fields.push(field);
                });

                recipes.results = _.sortByOrder(recipes.results, fields, orders);
            }

            returnObj[1] = JSON.stringify(recipes);

            return returnObj;
        });

        // Recipe type validation service
        var recipeTypeValidationOverrideUrl = 'test/data/recipeTypeValidationSuccess.json';
        var recipeTypeValidationRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipe-types/validation/', 'i');
        $httpBackend.whenPOST(recipeTypeValidationRegex).respond(function () {
            return getSync(recipeTypeValidationOverrideUrl);
        });

        // Recipe Type Details
        var recipeTypeDetailsOverrideUrl = 'test/data/recipe-types/recipeType1.json';
        var recipeTypeDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipe-types/.*/', 'i');
        $httpBackend.whenGET(recipeTypeDetailsRegex).respond(function (method, url) {
            // get the recipeType.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            recipeTypeDetailsOverrideUrl = 'test/data/recipe-types/recipeType' + id + '.json';
            var returnValue = getSync(recipeTypeDetailsOverrideUrl);
            if (returnValue[0] !== 200) {
                returnValue = localStorage.getItem('recipeType' + id);
                return [200, JSON.parse(returnValue), {}];
            } else {
                return returnValue;
            }
        });

        // Recipe Types service
        var recipeTypesOverrideUrl = 'test/data/recipeTypes.json';
        var recipeTypesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipe-types/', 'i');
        $httpBackend.whenGET(recipeTypesRegex).respond(function (method, url) {
            var urlParams = getUrlParams(url),
                returnObj = getSync(recipeTypesOverrideUrl),
                recipeTypes = JSON.parse(returnObj[1]);

            if (urlParams.order && urlParams.order.length > 0) {
                var orders = [],
                    fields = [];
                _.forEach(urlParams.order, function (o) {
                    var order = o.charAt(0) === '-' ? 'desc' : 'asc',
                        field = order === 'desc' ? urlParams.order[0].substring(1) : urlParams.order[0];

                    orders.push(order);
                    fields.push(field);
                });

                recipeTypes.results = _.sortByOrder(recipeTypes.results, fields, orders);
            }

            returnObj[1] = JSON.stringify(recipeTypes);

            return returnObj;
        });

        // Save Recipe Type
        var recipeTypeSaveRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'recipe-types/', 'i');
        $httpBackend.whenPOST(recipeTypeSaveRegex).respond(function (method, url, data) {
            var recipeJobTypes = [],
                recipeJobTypesDetails = [],
                jobTypeData = getSync('test/data/jobTypes.json'),
                jobTypes = JSON.parse(jobTypeData[1]).results,
                recipeType = JSON.parse(data),
                uniqueRecipeTypeJobs = _.uniq(recipeType.definition.jobs, 'job_type');
            _.forEach(uniqueRecipeTypeJobs, function (job) {
                recipeJobTypes.push(_.find(jobTypes, function (jobType) {
                    return jobType.name === job.job_type.name && jobType.version === job.job_type.version;
                }));
            });
            _.forEach(recipeJobTypes, function (jobType) {
                var jt = getSync('test/data/job-types/jobType' + jobType.id + '.json');
                recipeJobTypesDetails.push(JSON.parse(jt[1]));
            });
            var returnRecipe = {
                id: Math.floor(Math.random() * (10000 - 5 + 1)) + 5,
                name: recipeType.name,
                version: recipeType.version,
                title: recipeType.title,
                description: recipeType.description,
                is_active: true,
                definition: recipeType.definition,
                revision_num: 1,
                created: new Date().toISOString(),
                last_modified: new Date().toISOString(),
                archived: null,
                trigger_rule: recipeType.trigger_rule,
                job_types: recipeJobTypesDetails
            };
            return [200, JSON.stringify(returnRecipe), {}];
        });

        // Status service
        var statusOverrideUrl = 'test/data/status.json';
        var statusRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'status/', 'i');
        $httpBackend.whenGET(statusRegex).respond(function () {
            return getSync(statusOverrideUrl);
        });

        // Version
        var versionOverrideUrl = 'test/data/version.json';
        var versionRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'v3/version/', 'i');
        $httpBackend.whenGET(versionRegex).respond(function () {
            return getSync(versionOverrideUrl);
        });

        // Workspace Details
        var workspaceDetailsOverrideUrl = 'test/data/workspaces/workspace1.json';
        var workspaceDetailsRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'workspaces/.*/', 'i');
        $httpBackend.whenGET(workspaceDetailsRegex).respond(function (method, url) {
            // get the workspace.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            workspaceDetailsOverrideUrl = 'test/data/workspaces/workspace' + id + '.json';
            var returnValue = getSync(workspaceDetailsOverrideUrl);
            if (returnValue[0] !== 200) {
                returnValue = localStorage.getItem('workspace' + id);
                return [200, JSON.parse(returnValue), {}];
            } else {
                return returnValue;
            }
        });


        // Workspaces
        var workspacesOverrideUrl = 'test/data/workspaces.json';
        var workspacesRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'workspaces/', 'i');
        $httpBackend.whenGET(workspacesRegex).respond(function () {
            return getSync(workspacesOverrideUrl);
        });

        // Save Workspace
        var getReturn = function (data, id) {
            var workspace = JSON.parse(data);

            return {
                id: id || Math.floor(Math.random() * (10000 - 5 + 1)) + 5,
                name: workspace.name,
                title: workspace.title,
                description: workspace.description,
                base_url: workspace.base_url,
                is_active: workspace.is_active || false,
                used_size: 0,
                total_size: 0,
                created: new Date().toISOString(),
                archived: null,
                last_modified: new Date().toISOString(),
                json_config: workspace.json_config
            };
        };
        var workspaceCreateRegex = new RegExp('^' + scaleConfig.urls.apiPrefix + 'workspaces/', 'i');
        $httpBackend.whenPOST(workspaceCreateRegex).respond(function (method, url, data) {
            var returnWorkspace = getReturn(data);
            return [200, JSON.stringify(returnWorkspace), {}];
        });
        $httpBackend.whenPATCH(workspaceDetailsRegex).respond(function (method, url, data) {
            // get the workspace.id from the url
            url = url.toString();
            var id = url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.length-1);
            var returnWorkspace = getReturn(data, id);
            return [200, JSON.stringify(returnWorkspace), {}];
        });

        // For everything else, don't mock
        $httpBackend.whenGET(/^\w+.*/).passThrough();
        $httpBackend.whenPOST(/^\w+.*/).passThrough();
    }]);
})();

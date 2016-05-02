(function () {
    'use strict';

    angular.module('scaleApp').controller('aboutController', function($scope, $location, $window, navService, stateService) {
        $scope.stateService = stateService;
        $scope.version = '';

        var initialize = function() {
            navService.updateLocation('about');
        };

        initialize();

        $scope.$watch('stateService.getVersion()', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) {
                return;
            }
            $scope.version = newValue;
        });
    });
})();
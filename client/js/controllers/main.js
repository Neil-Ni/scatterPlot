'use strict';

var app = angular.module('scatterPlotApp');
app.controller('MainCtrl', function ($scope, $http, StockModel) {
  $scope.stockData = StockModel;
});

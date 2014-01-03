'use strict';

var services = angular.module('scatterPlotApp.services', [])

services.factory('StockModel', function ($http) {
  var obj = {content:null};
  $http.get('/static/scatterPlot/stocks.json').success(function(data) {
    obj.content = data;
  });    
  return obj;  
});



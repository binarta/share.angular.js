angular.module('angularx', [])
    .filter('binStripHtmlTags', function () {
        return jasmine.createSpy('binStripHtmlTags');
    })
    .filter('binTruncate', function () {
        return jasmine.createSpy('binTruncate');
    });
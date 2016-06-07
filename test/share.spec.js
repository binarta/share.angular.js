describe('bin.share', function () {

    beforeEach(module('bin.share'));

    describe('binShare service', function () {
        var binShare, $httpBackend, config, $location, $window;
        
        beforeEach(inject(function (_binShare_, $injector, _config_, _$location_, _$window_) {
            binShare = _binShare_;
            config = _config_;
            $location = _$location_;
            $window = _$window_;
            $httpBackend = $injector.get('$httpBackend');

            config.baseUri = 'baseUri/';
            $location.url('url');
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('get prerendered page', function () {
            beforeEach(function () {
                $httpBackend.whenGET('baseUri/?_escaped_fragment_=/url').respond();
            });

            it('page is requested', function () {
                binShare.getPrerenderedPage();

                $httpBackend.expectGET('baseUri/?_escaped_fragment_=/url');

                $httpBackend.flush();
            });
        });
    });

    describe('share controllers', function () {
        var ctrl, $window;

        beforeEach(inject(function (_$window_, binShare, $location) {
            $window = _$window_;
            $window.open = jasmine.createSpy('open');
            binShare.getPrerenderedPage = function () {
                return {
                    finally: function (callback) {
                        callback();
                    }
                }
            };
            $location.absUrl = function () {
                return 'http://absurl';
            };
        }));

        describe('binShareFacebookController', function () {
            var facebookUrl = 'https://www.facebook.com/sharer/sharer.php';

            beforeEach(inject(function ($controller) {
                ctrl = $controller('binShareFacebookController');
            }));

            it('on share, page is opened in new tab', function () {
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(facebookUrl + '?u=http%3A%2F%2Fabsurl', '_blank');
            });
        });

        describe('binShareTwitterController', function () {
            var scope, twitterUrl = 'https://www.twitter.com/intent/tweet';

            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();

                ctrl = $controller('binShareTwitterController', {$scope: scope});
            }));

            it('on share, page is opened in new tab', function () {
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(twitterUrl + '?url=http%3A%2F%2Fabsurl', '_blank');
            });

            it('with text param', function () {
                scope.ctrl = {
                    text: 'foo bar'
                };
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(twitterUrl + '?text=foo%20bar&url=http%3A%2F%2Fabsurl', '_blank');
            });

            it('with via param', function () {
                scope.ctrl = {
                    via: 'foo bar'
                };
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(twitterUrl + '?via=foo%20bar&url=http%3A%2F%2Fabsurl', '_blank');
            });
        });

        describe('binShareLinkedinController', function () {
            var scope, linkedinUrl = 'https://www.linkedin.com/shareArticle?mini=true';
            var binStripHtmlTags, binTruncate;

            beforeEach(inject(function ($controller, $rootScope, $filter) {
                binStripHtmlTags = $filter('binStripHtmlTags').and.returnValue('stripped');
                binTruncate = $filter('binTruncate').and.returnValue('truncated');

                scope = $rootScope.$new();

                ctrl = $controller('binShareLinkedinController', {$scope: scope});
            }));

            it('on share, page is opened in new tab', function () {
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(linkedinUrl + '&url=http%3A%2F%2Fabsurl', '_blank');
            });

            it('with text param', function () {
                scope.ctrl = {
                    text: 'foo bar'
                };
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(linkedinUrl + '&title=foo%20bar&url=http%3A%2F%2Fabsurl', '_blank');
            });

            it('with summary param', function () {
                scope.ctrl = {
                    summary: 'summary'
                };
                ctrl.share();

                expect(binStripHtmlTags).toHaveBeenCalledWith('summary');
                expect(binTruncate).toHaveBeenCalledWith('stripped', 250);
                expect($window.open).toHaveBeenCalledWith(linkedinUrl + '&summary=truncated&url=http%3A%2F%2Fabsurl', '_blank');
            });

            it('with source param', function () {
                scope.ctrl = {
                    source: 'foo bar'
                };
                ctrl.share();

                expect($window.open).toHaveBeenCalledWith(linkedinUrl + '&source=foo%20bar&url=http%3A%2F%2Fabsurl', '_blank');
            });
        });
    });
});
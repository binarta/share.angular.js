(function () {
    angular.module('bin.share', ['config', 'angularx', 'notifications'])
        .service('binShare', ['$rootScope', '$location', '$document', '$compile', '$http', '$timeout', 'config', shareService])
        .controller('binShareFacebookController', ['$location', '$window', 'binShare', shareFacebookController])
        .controller('binShareTwitterController', ['$scope', '$location', '$window', 'binShare', shareTwitterController])
        .controller('binShareLinkedinController', ['$scope', '$location', '$window', '$filter', 'binShare', shareLinkedinController])
        .directive('binShareFacebook', shareFacebookDirective)
        .directive('binShareTwitter', shareTwitterDirective)
        .directive('binShareLinkedin', shareLinkedinDirective)
        .component('binSocialIcons', new SocialIconsComponent());

    function shareService($rootScope, $location, $document, $compile, $http, $timeout, config) {
        this.getPrerenderedPage = function () {
            var working = true;
            var element;

            $timeout(function () {
                if (working) {
                    var body = $document.find('body');
                    var html = '<div class="bin-modal">' +
                        '<div class="bin-modal-body">' +
                        '<i class="fa fa-spinner fa-spin fa-5x"></i>' +
                        '<h3 i18n code="bin.share.preparing.page" read-only ng-bind="::var"></h3>' +
                        '</div>' +
                        '</div>';
                    element = angular.element(html);
                    $compile(element)($rootScope);
                    body.prepend(element);
                }
            }, 1000);

            return $http.get(config.baseUri + '?_escaped_fragment_=' + $location.url()).finally(function () {
                working = false;
                if (element) element.remove();
            });
        }
    }

    function shareFacebookController($location, $window, binShare) {
        var self = this;

        this.share = function () {
            self.working = true;
            var url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent($location.absUrl());

            binShare.getPrerenderedPage().finally(function () {
                self.working = false;
                $window.open(url, '_blank');
            });
        };
    }

    function shareTwitterController($scope, $location, $window, binShare) {
        var self = this;

        this.share = function () {
            self.working = true;
            var ctrl = $scope.ctrl || {};
            var url = 'https://www.twitter.com/intent/tweet?';
            if (ctrl.text) url += 'text=' + encodeURIComponent(ctrl.text) + '&';
            if (ctrl.via) url += 'via=' + encodeURIComponent(ctrl.via) + '&';
            url += 'url=' + encodeURIComponent($location.absUrl());

            binShare.getPrerenderedPage().finally(function () {
                self.working = false;
                $window.open(url, '_blank');
            });
        };
    }

    function shareLinkedinController($scope, $location, $window, $filter, binShare) {
        var self = this;

        this.share = function () {
            self.working = true;
            var ctrl = $scope.ctrl || {};
            var url = 'https://www.linkedin.com/shareArticle?mini=true';
            if (ctrl.text) url += '&title=' + encodeURIComponent(ctrl.text);
            if (ctrl.summary) {
                var summary = $filter('binStripHtmlTags')(ctrl.summary);
                summary = $filter('binTruncate')(summary, 250);
                url += '&summary=' + encodeURIComponent(summary);
            }
            if (ctrl.source) url += '&source=' + encodeURIComponent(ctrl.source);
            url += '&url=' + encodeURIComponent($location.absUrl());

            binShare.getPrerenderedPage().finally(function () {
                self.working = false;
                $window.open(url, '_blank');
            });
        };
    }

    function shareFacebookDirective() {
        return {
            restrict: 'A',
            scope: {},
            controller: 'binShareFacebookController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: '<button type="button" class="bin-link" ng-click="ctrl.share()" ' +
            'i18n code="bin.share.on.facebook.title" read-only title="{{::var}}">' +
            '<span ng-show="ctrl.working"><i class="fa fa-spinner fa-spin"></i></span>' +
            '<span ng-hide="ctrl.working"><i class="fa fa-facebook-square"></i></span>' +
            '</button>'
        }
    }

    function shareTwitterDirective() {
        return {
            restrict: 'A',
            scope: {
                text: '@',
                via: '@'
            },
            controller: 'binShareTwitterController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: '<button type="button" class="bin-link" ng-click="ctrl.share()" ' +
            'i18n code="bin.share.on.twitter.title" read-only title="{{::var}}">' +
            '<span ng-show="ctrl.working"><i class="fa fa-spinner fa-spin"></i></span>' +
            '<span ng-hide="ctrl.working"><i class="fa fa-twitter-square"></i></span>' +
            '</button>'
        }
    }

    function shareLinkedinDirective() {
        return {
            restrict: 'A',
            scope: {
                text: '@',
                summary: '@',
                source: '@'
            },
            controller: 'binShareLinkedinController',
            controllerAs: 'ctrl',
            bindToController: true,
            template: '<button type="button" class="bin-link" ng-click="ctrl.share()" ' +
            'i18n code="bin.share.on.linkedin.title" read-only title="{{::var}}">' +
            '<span ng-show="ctrl.working"><i class="fa fa-spinner fa-spin"></i></span>' +
            '<span ng-hide="ctrl.working"><i class="fa fa-linkedin-square"></i></span>' +
            '</button>'
        }
    }
    
    function SocialIconsComponent() {
        this.template = '<ul><li ng-repeat="provider in ::$ctrl.providers" i18n code="{{::provider.i18n}}" ' +
            'default="{{provider.url}}" ng-show="provider.isVisible(var)">' +
            '<a ng-href="{{var}}" target="_blank" ng-disabled="provider.isDisabled(var)">' +
            '<i class="fa" ng-class="::provider.icon"></i></a>' +
            '</li></ul>';
        
        this.controller = ['topicRegistry', function (topicRegistry) {
            var $ctrl = this;
            var editing;

            $ctrl.$onInit = function () {
                $ctrl.providers = [
                    {
                        i18n: 'social.link.facebook',
                        icon: 'fa-facebook',
                        url: 'https://www.facebook.com',
                        isVisible: isVisible,
                        isDisabled: isDisabled
                    }, {
                        i18n: 'social.link.twitter',
                        icon: 'fa-twitter',
                        url: 'https://twitter.com',
                        isVisible: isVisible,
                        isDisabled: isDisabled
                    }, {
                        i18n: 'social.link.google-plus',
                        icon: 'fa-google-plus',
                        url: 'https://plus.google.com',
                        isVisible: isVisible,
                        isDisabled: isDisabled
                    }, {
                        i18n: 'social.link.linkedin',
                        icon: 'fa-linkedin',
                        url: 'https://www.linkedin.com',
                        isVisible: isVisible,
                        isDisabled: isDisabled
                    }
                ];

                function isVisible(value) {
                    return (value && value !== this.url) || editing;
                }

                function isDisabled(value) {
                    return !value || value === this.url;
                }

                function editModeListener(e) {
                    editing = e;
                }

                topicRegistry.subscribe('edit.mode', editModeListener);

                $ctrl.$onDestroy = function () {
                    topicRegistry.unsubscribe('edit.mode', editModeListener);
                };
            };
        }];
    }
})();
(function () {
    angular.module('bootstrap.ex', [])
        .service('binModal', ['$rootScope', '$document', '$compile', '$templateCache', binModalService])
        .component('binCols', new BinColsComponent());

    function binModalService($rootScope, $document, $compile, $templateCache) {
        var self = this, scope, element, isOpen, isClosing, openDeferred;

        self.open = function (args) {
            if (!isOpen && !isClosing) open(args);
            if (!isOpen && isClosing) openDeferred = function () {
                open(args);
            };

            self.close = function () {
                isOpen = false;
                isClosing = true;
                element.modal ? element.modal('hide') : removeElement();
            };
        };

        self.close = angular.noop;

        function open(args) {
            isOpen = true;
            scope = $rootScope.$new();
            scope.$ctrl = args.$ctrl;
            element = $compile($templateCache.get(args.templateUrl))(scope);
            $document.find('body').append(element);

            if (element.modal) {
                element.modal({backdrop: 'static', keyboard: false});
                element.on('hidden.bs.modal', removeElement);
            }
        }

        function removeElement() {
            if (scope && scope.$destroy) scope.$destroy();
            if (element && element.remove) element.remove();
            scope = undefined;
            element = undefined;
            isClosing = false;
            if (openDeferred) openDeferred();
            openDeferred = undefined;
        }
    }

    function BinColsComponent() {
        this.template = '<div ng-class="$ctrl.clearfixClass"></div><div ng-class="::$ctrl.cssClass" ng-transclude></div>';
        this.transclude = true;
        this.bindings = {
            index: '<',
            cols: '@'
        };
        this.controller = function () {
            var $ctrl = this, xs, sm, md, lg;

            $ctrl.$onChanges = function () {
                if ($ctrl.cols != undefined && !$ctrl.cssClass) $ctrl.cssClass = getCssClass();
                if ($ctrl.index != undefined) $ctrl.clearfixClass = getClearfixClass();
            };

            function getResponsiveValues() {
                angular.forEach($ctrl.cols.split(' '), function (v) {
                    if (v.indexOf('xs') != -1) xs = extractInt(v);
                    if (v.indexOf('sm') != -1) sm = extractInt(v);
                    if (v.indexOf('md') != -1) md = extractInt(v);
                    if (v.indexOf('lg') != -1) lg = extractInt(v);
                });
            }

            function extractInt(v) {
                return v.match(/[\d]+/)[0];
            }

            function getCssClass() {
                getResponsiveValues();
                var c = '';
                if (xs) c += ' col-xs-' + xs;
                if (sm) c += ' col-sm-' + sm;
                if (md) c += ' col-md-' + md;
                if (lg) c += ' col-lg-' + lg;
                return c.trim();
            }

            function getClearfixClass() {
                var i = $ctrl.index;
                var clearfix = 'clearfix';
                if (i == 0) return clearfix;
                var xsClass = xs && i % (12/xs) == 0 ? getName('xs') : '';
                var smClass = (sm || xs) && i % (12/(sm || xs)) == 0 ? getName('sm') : '';
                var mdClass = (md || sm || xs) && i % (12/(md || sm || xs)) == 0 ? getName('md') : '';
                var lgClass = (lg || md || sm || xs) && i % (12/(lg || md || sm || xs)) == 0 ? getName('lg') : '';
                var c = (xsClass + smClass + mdClass + lgClass).trim();
                if (c != '') c = clearfix + ' ' + c;
                return c;
            }

            function getName(id) {
                return ' visible-' + id + '-block';
            }
        };
    }
})();
define('ajax', function (ajax) {
    ajax.request = function () {
        console.log('test ajax module');
    };
    ajax.test = function () { };

    return ajax;
});
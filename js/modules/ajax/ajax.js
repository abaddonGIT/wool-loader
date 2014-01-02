define('ajax', ['event', 'dom'], function (ajax, event, dom) {
    ajax.request = function () {
        console.log('test ajax module');
    };
    ajax.test = function () { };

    console.log(ajax);
    console.log(event);
    console.log(dom);

    return ajax;
});
define('event', function (event) {
    event.addEvent = function () { };
    event.test = function () { console.log('test event module'); };

    return event;
});
define('event', function (event) {
   // console.log(event);

    event.addEvent = function () { };
    event.test = function () { console.log('test event module'); };

    return event;
});
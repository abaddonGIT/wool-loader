var requery, define;
(function (w) {
    var ob = Object.prototypeб
        modulesQuery = [];
    //проверка на массив
    var isArray = function (item) {
        return ob.toString.call(item) === "[object Array]"; 
    };
    //Ф-я регистрации модуля
    define = function (name, deps, callback) {
        //проверяем если зависимости не переданны
        if(!isArray(deps)) {
            callback = deps;
            deps = null;
        }

        //регистрируем новый модуль
        modulesQuery.push([name, deps, callback]);
    };
})(window);
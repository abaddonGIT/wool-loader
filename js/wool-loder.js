var require, define;
(function (w) {
    var ob = Object.prototype,
        d = document,
        head = d.getElementsByTagName('head')[0],
        config = {},
        contexts = {},
        uploaded = {},
        currContext = null,
        flag = false;

    config = {
        modulPath: 'js/modules/',
        defContextName: 'context' 
    };

    var Sandbox = function () {

        if (!(this instanceof Sandbox)) {
            return new Sandbox();
        }

        this.name = config.defContextName;
        this.queue = [];
        this.sandbox = null;
        /*
        * Расширяет объект переданными модулями
        * @param Array modules - массив модулей
        */
        this.add = function (modules) {
            var ln = modules.length;
            //Инициализируем модули
            for (var i = 0; i < ln; i++) {
                if (this[modules[i][0]] === undefined) {
                    this[modules[i][0]] = {};
                    this[modules[i][0]] = modules[i][2](this[modules[i][0]]);
                } else {
                    this[modules[i][0]] = modules[i][2](this[modules[i][0]]);
                }
            }

            return this;
        }
    };

    //проверка на массив
    var isArray = function (item) {
        return ob.toString.call(item) === "[object Array]"; 
    };
    //Присутствие элемента в массиве
    var in_array = function (array, string) {
        var ln = array.length;
        
        while (ln--) {
            loc = array[ln];
            if (loc === string) {
                return true;
            }
        }    
        return false;
    };
    /*
    * Создает элемент script
    * @return Object node - объект созданного элемента
    */
    var createNode = function () {
        var node = d.createElement('script');  
        node.type = "text/javascript";
        node.charset = "utf-8";
        node.async = true;
        return node;   
    };
    /*
    * Ф-я для подгрузки скриптов на сайт
    * @param Array array - Массив названий модулей
    * @param Int i - шаг
    * @param Function callback - ф-я выполняется после подгрузки всех скриптов
    */
    var load = function (array, callback, i) {
       var ln = array.length,
           node = null,
           currentUrl = '';

       if (i === undefined) {
           i = 0;
       }

        if (i < ln) {
            //Создание элемента script
            currentUrl = config.modulPath + array[i] + '/' + array[i] + '.js';
            node = createNode();
            node.src = currentUrl;
            //проверяем не был ли загружен этот файл ранее
            if (!uploaded[currentUrl]) {
                //Для IE
                if (node.readyState) {
                    node.onreadystatechange = function() {
                        if (node.readyState === 'complete' || node.readyState === 'loaded') {
                            node.onreadystatechange = null;
                            i++;
                            load(array, callback, i);
                        }
                    };    
                } else {
                    node.onload = function () {
                        i++;
                        load(array, callback, i);
                    }
                }
                //Ошибка
                node.onerror = function () {
                    throw ('Не могу загрузить скрипт ' + array[i]);
                }
                head.appendChild(node);
            } else {
                load(array, callback, i);    
            }
        } else {
            callback(); 
        }

    };

    var initModuls = function (array, callback) {
        var contextName = config.defContextName + '_' + array.join('_');
            modules = currContext.queue,
            sandbox = null;

        //расширяем объект модулями
        sandbox = currContext.add(modules);
        contexts[contextName] = currContext;
        callback(sandbox);
    };

    /*
    * Подгрузка и инициализация модулей
    * @param Array массив модулей
    * @param Function вынкция обратного вызова
    * @param Int type - тип подгрузки 
    *  1 - передается массив названий модулей объявленных при помощи define
    *  Создает изолированное пространнствои для рабботы с модулями
    *  2 - Передается массив путей для загружаемых файлов
    *  Просто подгружает заданные файлы
    */
    require = function (array, callback, type) {
        var contextName = config.defContextName + '_';
        
        if (!isArray(array)) {
            throw ('В качестве списка модулей передан не массив!');
        }

        if (type === undefined) {
            type = 1;
        }

        switch (type) {
            case 1:
                contextName += array.join('_');
                //подгружаем js-файлы
                var ln = array.length;
                //Подгружаем скрипты
                var interval = setInterval (function () {
                    if (!flag) {
                        //Смотрим нужно ли создавать новый контекст или можно обойтись уже созданным
                        if (!contexts[contextName]) {
                            currContext = Sandbox();

                            load(array, function () {
                                initModuls(array, function (sandbox) {
                                    callback(sandbox);
                                    clearInterval(interval);
                                    flag= false;
                                });     
                           
                            });
                        } else {
                            clearInterval(interval);
                            callback(contexts[contextName].sandbox);   
                            flag= false; 
                        }
                        flag= true;
                    }
                }, 100);       
                break;
            case 2:

                break;
        }
    };

    /*
    * Регистрирует модуль
    * @param String name - название модуля
    * @param Array deps - массив зависимостей
    * @param Function - тело модуля 
    */
    define = function (name, deps, callback) {
        //проверяем если зависимости не переданны
        if(!isArray(deps)) {
            callback = deps;
            deps = null;
        }
        
        //регистрируем новый модуль
        currContext.name += '_' + name; 
        currContext.queue.push([name, deps, callback]);       
    };
})(window);
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
        packeds = [];

    config = {
        modulPath: 'js/modules/',
        defContextName: 'context' 
    };

    var Context = function () {
        this.id = Math.random();
        this.name = config.defContextName;
        this.queue = [];
        this.sandbox = null;
    };

    var Sandbox = function (modules, callback) {
        var ln = modules.length, S = null;

        if (!(this instanceof Sandbox)) {
            return new Sandbox(modules, callback);
        }

        //Инициализируем модули
        for (var i = 0; i < ln; i++) {
            if (this[modules[i][0]] === undefined) {
                this[modules[i][0]] = {};
                this[modules[i][0]] = modules[i][2](this[modules[i][0]]);
            } else {
                this[modules[i][0]] = modules[i][2](this[modules[i][0]]);
            }
        }
        
        callback(this);
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
            modules = currContext.queue;

        console.log(currContext);

        //Выбираем модули которые необходимо проинициализировать
        currContext.sandbox = Sandbox(modules, function (sandbox) {
            callback(sandbox);
        });

        contexts[contextName] = currContext;
    };

    /*
    * Подгрузка и инициализация модулей
    * @param Array массив модулей
    * @param Function вынкция обратного вызова
    */
    require = function (array, callback) {
        var contextName = config.defContextName + '_';
        if (!isArray(array)) {
            throw ('В качестве списка модулей передан не массив!');
        }
        contextName += array.join('_');
        //подгружаем js-файлы
        var ln = array.length;
        //Подгружаем скрипты
        var interval = setInterval (function () {
            if (!flag) {
                //Смотрим нужно ли создавать новый контекст или можно обойтись уже созданным
                if (!contexts[contextName]) {
                    currContext = new Context();

                    load(array, function () {
                        initModuls(array, function (sandbox) {
                            callback(sandbox);
                            clearInterval(interval);
                            flag= false;
                        });     
                           
                    });
                } else {
                    callback(contexts[contextName].sandbox);   
                    flag= false; 
                }
                flag= true;
            }
        }, 100);
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
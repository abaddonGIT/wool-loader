/******************************************************
 * Copyright 2014 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 0.0.1
 * **************************************************/

var require, define;
(function (w) {
    "use strict";

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

        /*
        * Регистрирует зависимости для переданного модуля
        * @param Object module - модуль зависимости, которого регитсрируются
        */
        this.addDeps = function (module) {
            var deps = module[1],
                moduleName = module[0],
                moduleFn = module[2], 
                ln = null, 
                depsAr = [];

            depsAr[0] = {};

            if (deps) {
                ln = this.queue.length;
                for (var i = 0; i < ln; i++) {
                    if (in_array(deps, this.queue[i][0])) {
                        var loc = this.queue[i],
                            name = loc[0],
                            depend = this[name] = {};

                        this[name] = loc[2](depend);
                        depsAr.push(this[name]);

                        this.addDeps(loc);
                    }
                }
                this[moduleName] = moduleFn.apply(this, depsAr);
            }  else {
                this[moduleName] = moduleFn({});
            }      
        };
        /*
        * Расширяет объект переданными модулями
        * @param Array modules - массив модулей
        */
        this.add = function (modules) {
            var ln = modules.length;

            //Инициализируем модули
            for (var i = 0; i < ln; i++) {
                var module = modules[i],
                    moduleName = module[0],
                    moduleFn = module[2],
                    deps = modules[i][1],
                    depsAr = [];
                //Тут попробуем подгрузить зависимости
                var queueLength = this.queue.length;

                depsAr[0] = null;

                if (deps) {//Если объявленны зависимости
                    for (var j = 0; j < queueLength; j++) {
                        if (in_array(deps, this.queue[j][0])) {
                            var loc = this.queue[j],
                                name = loc[0],
                                depend = this[name] = {};

                            //добавляем зависимости для внутренних элементов
                            this.addDeps(loc);
                            depsAr.push(this[name]);
                        }
                    }
                }
                
                if (this[moduleName] === undefined) {
                    this[moduleName] = {};
                     depsAr[0] = this[moduleName];   
                     this[moduleName] = moduleFn.apply(this,depsAr);
                 } else {
                     depsAr[0] = this[moduleName];
                     this[moduleName] = moduleFn.apply(this,depsAr);
                 }
                            
            }
            //console.log(this);
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
            var loc = array[ln];
            if (loc === string) {
                return true;
            }
        }    
        return false;
    };
    /*
    * Создает элемент
    * @param String тип создаваемого элемента script или link
    * @return Object node - объект созданного элемента
    */
    var createNode = function (type) {
        var node = null;

        if (type === undefined) {
            type = 'js';
        }

        switch (type) {
            case 'js':
                node = d.createElement('script');  
                node.type = "text/javascript";
                node.charset = "utf-8";
                node.async = true;       
                break;
            case 'css':
                node = d.createElement('link');
                node.type = "text/css";
                node.rel = "stylesheet";
                break;
        }
        return node;   
    };
    /*
    * Ф-я для подгрузки файлов на сайт
    * @param Array array - Массив названий модулей
    * @param Int i - шаг
    * @param Function callback - ф-я выполняется после подгрузки всех скриптов
    */
    var load = function (array, callback, i) {
       var ln = array.length,
           node = null,
           modName = null,
           currentUrl = '';

       if (i === undefined) {
           i = 0;
       }

        if (i < ln) {
            //проверяем передано ли название модуля или имя файла
            var names = array[i].split('.'),
                fileExt = names[names.length - 1];

            //console.log(fileExt);

            if (names[1] === undefined) {
                node = createNode();
                currentUrl = config.modulPath + array[i] + '/' + array[i] + '.js';
                node.src = currentUrl;
            } else {
                currentUrl = array[i];
                switch (fileExt) {
                    case 'js':
                        node = createNode();
                        node.src = currentUrl;
                        break;
                    case 'css':
                        node = createNode('css');
                        node.href = currentUrl;
                        break;
                }
            }
            //проверяем не был ли загружен этот файл ранее
            if (!uploaded[currentUrl]) {
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
        var contextName = config.defContextName + '_' + array.join('_'),
            modules = [],
            sandbox = null,
            ln = null;

        clearArray(currContext.queue);
        //Выбираем из очереди только модули и отсекаем зависимости
        
        ln = currContext.queue.length;
        for (var i = 0; i < ln; i++) {
            if (in_array(array, currContext.queue[i][0])) {
                modules.push(currContext.queue[i]);
            }
        }
        
        //Тут надо разобраться с зависимостями
        loadDeps(currContext.queue, function () {
            //расширяем объект модулями
            sandbox = currContext.add(modules);
            contexts[contextName] = currContext;
            callback(sandbox);
        });
    };


    /*
    * Подгружает зависимости
    */
    var loadDeps = function (modules, callback, i) {
        var ln = modules.length,
            deps = null;

        if (i === undefined) {
            i = 0;
        }

        if (i < ln) {
            deps = modules[i][1];

            if (deps) {
               //загружаем зависимости 
               load(deps, function () {
                   i++;
                   loadDeps(modules,callback,i);         
               }); 
            } else {
               i++;
               loadDeps(modules,callback,i); 
            }
        } else {
            callback();
        }
    };

    var clearArray = function (array) {
        var ln = array.length, 
            newArray = [],
            retArray = [];

        for (var i = 0; i < ln; i++) {
            if (!in_array(newArray, array[i][0])) {
                newArray[array[i][0]] = array[i];
            }
        }
       
        for (var i in newArray) {
            retArray.push(newArray[i]);
        }

        currContext.queue = retArray;
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
                load(array, function () {
                    var sandbox = new Sandbox();
                    callback(sandbox);    
                });
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
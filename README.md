wool-loader
===========

Маленький загрузчик файлов.

Скрипт добавляет две ф-и <b>require</b>, которая загружает файлы и ф-я <b>define</b> - для объявления модулей.
Функция <b>require</b> принимает в качестве аргумента массив с путями до файлов модулей, которые необходимо подгрузить.
<pre>
require(['ajax','dom'], function (obj) {
    //Объект содержит все модули
    console.log(obj);
});
</pre>
Ф-я <b>require</b> может подгружать не только модули, которые оформлены в формате <b>AMD</b>, но и обычные js-файлы и библиотеки, а такжы файлы стилей.
<pre>
require(['js/jquery-2.0.0.min.js', 'css/style.css'], function () {
    console.log('jQuery и стили были загружены');
});
</pre>
Функция <b>define</b> занимается объявлением модулей. Получает в качестве аргументов. название модуля, массив названий модулей, от которых зависит и тело модуля.
<pre>
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
</pre>
<hr />
wool-loader
===========

Small loader of files.

The script adds two function <b>require</b>, which loads files and function <b>define</b> - which define module.
Function <b>require</b> accepts as argument the array with ways to files of modules, which it is necessary loaded.
<pre>
require(['ajax','dom'], function (obj) {
    //Object contains all loaded modules
    console.log(obj);
});
</pre>
Function <b>require</b> can load not only modules, which are issued in a format <b>AMD</b>, but also usual js-files and libraries, and files of styles.
<pre>
require(['js/jquery-2.0.0.min.js', 'css/style.css'], function () {
    console.log('jQuery and styles loaded');
});
</pre>
Function <b>define</b> define module. Receives as arguments the module name, array names of modules, on which depends and body of module.
<pre>
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
</pre>
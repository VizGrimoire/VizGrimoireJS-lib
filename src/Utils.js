/*
 * Copyright (C) 2012-2014 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package.
 *
 * Authors:
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */


var Utils = {};

(function() {

    Utils.paramsInURL = paramsInURL;
    Utils.isReleasePage = isReleasePage;
    Utils.filenameInURL = filenameInURL;
    Utils.createLink = createLink;
    Utils.createReleaseLink = createReleaseLink;
    Utils.getParameter = getParameter;
    Utils.escapeHtml = escapeHtml;

    $.urlParam = function(name){
        var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results === null){
            return null;
        }
        else{
            return results[1] || 0;
        }
    };

    function isReleasePage(){
        /*
         Returns true if the GET variable release is available.

         Can be improved checking the conf file with the release names, in order
         to check if the release name is correct.
         */

        if ($.urlParam('release') === null) return false;
        else return true;
    }

    function paramsInURL(){
    /*
     Return raw string with the GET params in the current URL
     */
    params = '';
    if (document.URL.split('?').length > 1){
        params = document.URL.split('?')[1];
    }
    return params;
}

    function filenameInURL(){
        aux = document.URL.split('?')[0].split('/');
        res = aux[aux.length-1];
        return res;
    }

    function createLink(target){
        /*
         Return the URL appending the GET variables of the current page
         */
        url = target;
        if (paramsInURL().length > 0) url+= '?' + paramsInURL();
        return url;
    }

    function createReleaseLink(target){
        /*
         Return the URL appending the GET variable for the release
         */
        url = target;
        if (isReleasePage()){
            if (url.indexOf('?') >= 0){
                url+= '&release=' + $.urlParam('release');
            }
            else{
                url+= '?release=' + $.urlParam('release');
            }
        }
        return url;
    }

    function getParameter(param){
        if ($.urlParam(param) === null) return false;
        return $.urlParam(param);
    }

    function escapeHtml(htmlString){
        $("div.someFakeClass").text(htmlString);
        var escaped = $("<div>").text(htmlString).html();
        return escaped;
    }

})();

String.prototype.supplant = function(o) {
  return this.replace(/{([^{}]*)}/g,function(a, b) {
    var r = o[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};

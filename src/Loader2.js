/* 
 * Copyright (C) 2012-2013 Bitergia
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
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 */

if (Loader2 === undefined) var Loader2 = {};

(function() {
    var data_callbacks = [];
    var api_rest_url = "http://vizgrimoireapi.apiary.io";
    // JSONP support
    var url_callback = "?callback=?";
    var ts_commits = null;

    Loader2.data_load = function() {
        // Read scm_commits from API REST
        var file = api_rest_url + "/var/scm/ts_commits1"+url_callback;
        data_load_file(file, set_tsCommits, self);
    };

    function set_tsCommits(data, DS) {
        Report.log("Read ts_commits data " + data);
    }

    function data_load_file(file, fn_data_set, self) {
        // $.when($.getJSON(file)).done(function(history) {
        $.getJSON(file, null, function(history) {
            fn_data_set(history, self);
        }).fail(function() {
            fn_data_set([], self);
        }).always(function() {
            end_data_load();
        });
    }

    Loader2.data_ready = function(callback) {
        data_callbacks.push(callback);
    };

    function check_data_loaded() {
        if (ts_commits !== null) return true;
        else return false;
    }

    function end_data_load()  {
        if (check_data_loaded()) {    
            for (var i = 0; i < data_global_callbacks.length; i++) {
                data_global_callbacks[i]();
            }
        }
    }
})();
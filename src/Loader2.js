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

    var ts_commits = null, ncommits = null;

    Loader2.data_load = function() {
        // Read scm_commits from API REST
        var file = api_rest_url + "/var/scm/ts_commits1"+url_callback;
        data_load_file_fake(file, set_tsCommits, self);
        file = api_rest_url + "/var/scm/ncommits1"+url_callback;
        data_load_file_fake(file, set_nCommits, self);
    };

    function set_tsCommits(data, DS) {
        ts_commits = data.value;
        Report.log("Read ts_commits data " + data.value);
        DS.setDataItem("ts_commits", data.value.values);
    }

    function set_nCommits(data, DS) {
        ncommits = data.value;
        Report.log("Read ncommits data " + data.value);
        DS.setGlobalDataItem("ncommits", data.value);
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

    // function data_load_file_fake(metric) {
    // add new metric commits identifiers - jgb will add it
    function data_load_file_fake(file, fn_data_set, self) {
        if (file.indexOf("ts_")>-1) {
            var first_date = "2010-01-01";
            var last_date = "2014-02-01";
            var period = "months";
            var months = 50;
            var months_label = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            history = {
                "id": "scm/ts_commits",
                "type": "ts of int",
                "desc": "Time serie of number of commits in SCM repo(s)",
                "value": {
                    "period": period,
                    "first_date": first_date,
                    "last_date": last_date
                }
            };
            var i = 0;
            history.value.values = [];
            for (i=0; i<months; i++) {
                history.value.values.push(Math.random()*100);
            }
            history.value.period_id = [];
            for (i=0; i<months; i++) {
                var month_label = months_label[i%12]+" 1 "+ (2010+parseInt(i/12,10));
                history.value.period_id.push(month_label);
            }
        } else {
            history =  {
                "id": "scm/ncommits",
                "type": "int",
                "desc": "Number of commits in SCM repositories",
                "value": 2245
            };
        }

        fn_data_set(history, Report.getDataSourceByName("scm"));
        end_data_load();
    }

    Loader2.data_ready = function(callback) {
        data_callbacks.push(callback);
    };

    function check_data_loaded() {
        if (ts_commits !== null && ncommits !== null) return true;
        else return false;
    }

    function end_data_load()  {
        if (check_data_loaded()) {
            for (var i = 0; i < data_callbacks.length; i++) {
                data_callbacks[i]();
            }
        }
    }
})();
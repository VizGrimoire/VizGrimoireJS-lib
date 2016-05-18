/*
 * Copyright (C) 2013 Bitergia
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

var DataProcess = {};

(function() {
    DataProcess.info = function() {};

    DataProcess.paginate = function(data, page) {
        if (page === undefined || page === 0 || isNaN(page)) return data;
        var page_items = [];
        var psize = Report.getPageSize();
        var start = (page-1)*psize;
        for (var i=start; i<psize*page; i++ ) {
            if (data[i]) page_items.push(data[i]);
        }
        return page_items;
    };

    DataProcess.convert = function(data, convert, metric_ids) {
        if (convert === "aggregate") {
            data = DataProcess.aggregate(data, metric_ids);
        }
        else if (convert === "substract") {
            data = DataProcess.substract(data, metric_ids[0], metric_ids[1]);
            metric_ids = ['substract'];
        }
        else if (convert === "substract-aggregate") {
            data = DataProcess.substract(data, metric_ids[0], metric_ids[1]);
            metric_ids = ['substract'];
            data = DataProcess.aggregate(data, metric_ids);
        }
        else if (convert === "divide") {
            data = DataProcess.divide(data, metric_ids[0], metric_ids[1]);
            metric_ids = ['divide'];
        }
        return data;
    };

    DataProcess.sortGlobal = function (ds, metric_id, kind) {
        if (metric_id === undefined) metric_id = "scm_commits";
        var metric = [];
        var data = [], sorted = {};
        sorted.name = [];
        sorted[metric_id] = [];
        var metrics_data = null;
        if (kind === "companies") {
            data = ds.getCompaniesData();
            metrics_data = ds.getCompaniesDataFull();
        }
        else if (kind === "repos") {
            data = ds.getReposData();
            metrics_data = ds.getReposDataFull();
        }
        else if (kind === "countries") {
            data = ds.getCountriesData();
        }
        else if (kind === "domains") {
            data = ds.getDomainsData();
            metrics_data = ds.getDomainsDataFull();
        }
        else if (kind === "projects") {
            data = ds.getProjectsData();
        }

        if (data  === null) return [];
        if (metrics_data === null) return data;

        // Change the order using the new metric
        if (metrics_data instanceof Array  || metric_id in metrics_data === false)
            return data;

        for (var i=0; i<metrics_data[metric_id].length; i++ ) {
            var value = metrics_data[metric_id][i];
            if (value === "NA") value = 0; // Easy to filter
            metric.push([metrics_data.name[i],value]);
        }
        metric.sort(function(a, b) {return b[1] - a[1];});
        $.each(metric, function(id, value) {
            sorted.name.push(value[0]);
            sorted[metric_id].push(value[1]);
        });
        return sorted.name;
    };

    // Order items in data sources according widgets params
    DataProcess.orderItems = function (filter_order) {
        $.each($("[class^='FilterItems']"), function (id, div) {
            order_by = $(this).data('order-by');
            if (order_by !== undefined) {
                ds = $(this).data('data-source');
                DS = Report.getDataSourceByName(ds);
                if (DS === null) return;
                var filter = $(this).data('filter');
                if (filter === undefined) return;
                if (filter !== filter_order) return;
                Report.log("Ordering with " + order_by + " " + ds + " for " + filter);
                var data = DataProcess.sortGlobal (DS, order_by, filter);

                if (filter === 'companies') DS.setCompaniesData(data);
                if (filter === 'repos') DS.setReposData(data);
                if (filter === 'countries') DS.setCountriesData(data);
                if (filter === 'domains') DS.setDomainsData(data);
                return false; // Use the first one to order
            }
        });
    };

    DataProcess.mergeConfig = function (config1, config2) {
        var new_config = {};
        $.each(config1, function(entry, value) {
            new_config[entry] = value;
        });
        $.each(config2, function(entry, value) {
            new_config[entry] = value;
        });
        return new_config;
    };

    DataProcess.hideEmail = function(email) {
        var clean = email;
        if ( (typeof email == "string") &&  (email.indexOf("@") > -1) ) {
            clean = email.split('@')[0];
        }
        return clean;
    };

    // Select longest name from identities
    DataProcess.selectPersonName = function(person) {
        var name = "", cname, ctype, i;
        if (person.identity) {
            for (i=0; i<person.identity.length; i++) {
                cname = person.identity[i];
                ctype = person.type[i];
                if (ctype === "name") {
                    if (cname.length>name.length) name = cname;
                }
            }
        }
        // New format in Sortinghat. Just "name" field.
        else if (person.name) {
            if (person.name.constructor !== Array) {
                person.name = [person.name];
            }
            for (i=0; i<person.name.length; i++) {
                cname = person.name[i];
                if (cname !== null && cname.length>name.length){
                    name = cname;
                }
            }
        }
        return name;
    };

    // Select first email from identities
    DataProcess.selectPersonEmail = function(person) {
        var email = "", cemail, ctype;
        if (person.identity === undefined) return;
        for (var i=0; i<person.identity.length; i++) {
            cemail = person.identity[i];
            ctype = person.type[i];
            if (ctype === "email") {
                email = cemail;
            }
        }
        return email;
    };

    /*
    * Remove 0s from the left side of the arrays of the object
    * history[metrics]. Returns a new object without those zeros
    *
    */
    DataProcess.frameTime = function(history, metrics) {
        var new_history = {};
        var i = 0,
            max_offset = 0,
            offset_list = [],
            MIN_LENGTH = 5;

        $.each(metrics, function(id, metric) {
            if (history[metric] === undefined) {return;}
            var offset = 0;
            array_len = history[metric].length;
            max_offset = array_len - MIN_LENGTH;
            for (i =  0; i < max_offset; i++) {
                if (history[metric][i] === 0){
                    offset++;
                }else{
                    offset_list.push(offset);
                    break;
                }
            }
        });

        /* we get the offset for all the metrics and select the smaller one
        in order to display the maximum interval in the chart and to avoid
        losing data */
        var min_offset = offset_list.sort()[0];
        for (var key in history) {
            new_history[key] = [];
            new_history[key] = history[key].slice(min_offset);
        }
        return new_history;
    };

    DataProcess.filterDates = function(start_id, end_id, history) {
        var history_dates = {};
        $.each(history, function(name, data) {
            history_dates[name] = [];
            $.each(data, function(i, value) {
                // var id = history.id[i];
                // TODO: week should be id
                // var id = history.week[i];
                var id = history.unixtime[i];
                if (id > start_id)
                    if (!end_id || (end_id && id <= end_id))
                        history_dates[name].push(value);
            });
        });
        return history_dates;
    };

    DataProcess.filterYear = function(year, history) {
        // var day_msecs = 1000*60*60*24;
        year = parseInt(year, null);
        //var min_id = 12*year, max_id = 12*(year+1);
        // var min_id = (new Date(year.toString()).getTime())/(day_msecs);
        // var max_id = (new Date((year+1).toString()).getTime())/(day_msecs);
        var min_id = new Date(year.toString()).getTime();
        var max_id = new Date((year+1).toString()).getTime();

        var history_year = filterDates(min_id, max_id, history);
        return history_year;
    };

    DataProcess.fillDates = function (dates_orig, more_dates) {

        if (dates_orig[0].length === 0) return more_dates;

        // [ids, values]
        var new_dates = [[],[]];

        // Insert older dates
        var i = 0;
        if (dates_orig[0][0]> more_dates[0][0]) {
            for (i=0; i< more_dates[0].length; i++) {
                new_dates[0][i] = more_dates[0][i];
                new_dates[1][i] = more_dates[1][i];
            }
        }

        // Push already existing dates
        for (i=0; i< dates_orig[0].length; i++) {
            pos = new_dates[0].indexOf(dates_orig[0][i]);
            if (pos === -1) {
                new_dates[0].push(dates_orig[0][i]);
                new_dates[1].push(dates_orig[1][i]);
            }
        }

        // Push newer dates
        if (dates_orig[0][dates_orig[0].length-1] <
                more_dates[0][more_dates[0].length-1]) {
            for (i=0; i< more_dates[0].length; i++) {
                pos = new_dates[0].indexOf(more_dates[0][i]);
                if (pos === -1) {
                    new_dates[0].push(more_dates[0][i]);
                    new_dates[1].push(more_dates[1][i]);
                }
            }
        }

        return new_dates;

    };

    DataProcess.fillHistory = function (hist_complete_id, hist_partial) {
        // [ids, values]
        var new_history = [ [], [] ];
        for ( var i = 0; i < hist_complete_id.length; i++) {
            pos = hist_partial[0].indexOf(hist_complete_id[i]);
            new_history[0][i] = hist_complete_id[i];
            if (pos != -1) {
                new_history[1][i] = hist_partial[1][pos];
            } else {
                new_history[1][i] = 0;
            }
        }
        return new_history;
    };

    // Envision and Flotr2 formats are different.
    DataProcess.fillHistoryLines = function(hist_complete_id, hist_partial) {
        // [ids, values]
        var old_history = [ [], [] ];
        var new_history = [ [], [] ];
        var lines_history = [];

        for ( var i = 0; i < hist_partial.length; i++) {
            // ids
            old_history[0].push(hist_partial[i][0]);
            // values
            old_history[1].push(hist_partial[i][1]);
        }

        new_history = DataProcess.fillHistory(hist_complete_id, old_history);

        for (i = 0; i < hist_complete_id.length; i++) {
            lines_history.push([new_history[0][i],new_history[1][i]]);
        }
        return lines_history;
    };

    DataProcess.addRelativeValues = function (metrics_data, metric) {
        if (metrics_data[metric] === undefined) return;
        metrics_data[metric+"_relative"] = [];
        var added_values = [];

        $.each(metrics_data[metric], function(index, pdata) {
            var metric_values = pdata.data[1];
            for (var i = 0; i<metric_values.length;i++) {
                if (added_values[i] === undefined)
                    added_values[i] = 0;
                added_values[i] += metric_values[i];
            }
        });

        $.each(metrics_data[metric], function(index, pdata) {
            var val_relative = [];
            for (var i = 0; i<pdata.data[0].length;i++) {
                if (added_values[i] === 0) val_relative[i] = 0;
                else {
                    var rel_val = pdata.data[1][i]/added_values[i]*100;
                    val_relative[i] = rel_val;
                }
            }
            metrics_data[metric+"_relative"].push({
                label: pdata.label,
                data: [pdata.data[0],val_relative]
            });
        });
    };

    DataProcess.aggregate = function(data, metrics) {
        var new_data = {};
        if (!(metrics instanceof Array)) metrics = [metrics];
        $.each(data, function(metric, mdata){
            if ($.inArray(metric, metrics)> -1) {
                var metric_agg = [];
                metric_agg[0] = data[metric][0];
                for (var i=1; i<data[metric].length; i++) {
                    metric_agg[i] = metric_agg[i-1] + data[metric][i];
                }
                new_data[metric] = metric_agg;
            } else {
                new_data[metric] = data[metric];
            }
        });
        return new_data;
    };

    DataProcess.substract = function(data, metric1, metric2) {
        var new_data = {};
        var substract = [];
        for (var i=0; i<data[metric1].length; i++) {
            substract[i] = data[metric1][i]-data[metric2][i];
        }
        $.each(data, function(metric, mdata) {
            new_data[metric] = data[metric];
        });
        new_data.substract = substract;
        return new_data;
    };

    DataProcess.divide = function(data, metric1, metric2) {
        var new_data = {};
        var divide = [];
        for (var i=0; i<data[metric1].length; i++) {
            if (data[metric1][i] === 0 || data[metric2][i] === 0)
                divide[i] = 0;
            else divide[i] = parseInt(data[metric1][i]/data[metric2][i],null);
        }
        $.each(data, function(metric, mdata) {
            new_data[metric] = data[metric];
        });
        new_data.divide = divide;
        return new_data;
    };

    DataProcess.revomeLastPoint = function(data) {
        var new_data = {};
        $.each(data, function(key, value) {
            new_data[key] = [];
            for (var i=0; i < data[key].length-1; i++) {
                new_data[key].push(data[key][i]);
            }
        });
        return new_data;
    };
})();

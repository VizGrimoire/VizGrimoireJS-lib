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
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */


if (Viz === undefined) var Viz = {};

(function() {
    var bitergiaColor = "#ffa500";

    Viz.displayTop = displayTop;
    Viz.displayTopCompany = displayTopCompany;
    Viz.displayTopGlobal = displayTopGlobal;
    Viz.displayBasicChart = displayBasicChart;
    Viz.displayMetricCompanies = displayMetricCompanies;
    Viz.displayMetricSubReportStatic = displayMetricSubReportStatic;
    Viz.displayMetricsCompany = displayMetricsCompany;
    Viz.displayMetricsDomain = displayMetricsDomain;
    Viz.displayMetricsProject = displayMetricsProject;
    Viz.displayMetricsPeople = displayMetricsPeople;
    Viz.displayMetricsRepo = displayMetricsRepo;
    Viz.displayMetricRepos = displayMetricRepos;
    Viz.displayMetricsCountry = displayMetricsCountry;
    Viz.displayMetricDomains = displayMetricDomains;
    Viz.displayMetricProjects = displayMetricProjects;
    Viz.displayMetricsEvol = displayMetricsEvol;
    Viz.displayBubbles = displayBubbles;
    Viz.displayDemographicsChart = displayDemographicsChart;
    Viz.displayEnvisionAll = displayEnvisionAll;
    Viz.displayTimeToFix = displayTimeToFix;
    Viz.displayTimeToAttention = displayTimeToAttention;
    Viz.displayMetricSubReportLines = displayMetricSubReportLines;
    Viz.displayRadarActivity = displayRadarActivity;
    Viz.displayRadarCommunity = displayRadarCommunity;
    Viz.displayTreeMap = displayTreeMap;
    Viz.displayMarkovTable = displayMarkovTable;
    Viz.displayDataSourcesTable = displayDataSourcesTable;
    Viz.getEnvisionOptions = getEnvisionOptions;
    Viz.checkBasicConfig = checkBasicConfig;
    Viz.displayTimeZone = displayTimeZone;


    function findMetricDoer(history, metric_id) {
        var doer = '';
        $.each(Report.getAllMetrics(), function(name, metric) {
            if (metric.action === metric_id) {
                doer = metric.column;
                return false;
            }
        });
        return doer;
    }

    function displayMarkovTable(div_id, data, title){
        var html = '<h4>' + title + '</h4>';
        var table = '<table id="itsmarkovtable" class="table table-striped">';
        table += '<thead><tr><th>Transition</th><th>Number</th><th>Percent</th></tr></thead><tbody>';
        $.each(data, function(i, val){
            subdata = data[i];
            old_value = "old_value";
            new_value = "new_value";
            percent = "f";
            number = "issue";
            for(var k = 0; k < subdata[old_value].length; k++){
                var value_new = subdata[new_value][k];
                var value_p = subdata[percent][k];
                value_p = Math.round(value_p*100)/100;
                var value_num = subdata[number][k];
                table += '<tr><td>' + i + ' -> ' + value_new + '</td>';
                table += '<td>' + value_num + '</td>';
                table += '<td>' + value_p + '</td></tr>';
            }
        });
        table += "</tbody></table>";
        html += table;
        div = $("#" + div_id);
        div.append(html);
        return;
    }

    function translate(labels, l){
        if(labels.hasOwnProperty(l)){
            return labels[l];
        }else{
            return l;
        }
    }

    function getTopVarsFromMetric(metric, ds_name){
        //maps the JSON vars with the metric name
        //FIXME this function should be private
        var var_names = {};
        var_names.id = "id";
        if (metric === "senders" && (ds_name === "mls" || ds_name === "irc")){
            var_names.name = "senders";
            var_names.action = "sent";
        }
        if (metric === "authors" && ds_name === "scm"){
            var_names.name = "authors";
            var_names.action = "commits";
        }
        if (metric === "closers" && ds_name === "its"){
            var_names.name = "closers";
            var_names.action = "closed";
        }
        if (ds_name === "scr"){
            if (metric === "mergers"){
                var_names.name = "mergers";
                var_names.action = "merged";
            }
            if (metric === "openers"){
                var_names.name = "openers";
                var_names.action = "opened";
            }
            if (metric === "reviewers"){
                var_names.name = "reviewers";
                var_names.action = "reviews";
            }
        }
        if (ds_name === "downloads"){
            if (metric === "ips"){
                var_names.name = "ips";
                var_names.action = "downloads";
            }
            if (metric === "packages"){
                var_names.name = "packages";
                var_names.action = "downloads";
            }
        }
        if (ds_name === "mediawiki"){
            if (metric === "authors"){
                var_names.name = "authors";
                var_names.action = "reviews";
            }
        }
        if (ds_name === "qaforums"){
            if (metric === "senders" || metric === "asenders" || metric === "qsenders"){
                // the same as in mls and irc
                var_names.name = "senders";
                var_names.action = "sent";
           }else if (metric === "participants"){
               var_names.name = "name";
               var_names.action = "messages_sent";
           }
        }
        if (ds_name === "releases"){
            if (metric === "authors"){
                var_names.name = "username";
                var_names.action = "releases";
            }
        }

        return var_names;
    }

    function getSortedPeriods(){
        return ['last month','last year',''];
    }

    function composeTopRowsDownloads(dl_data, limit, var_names){
        var rows_html = "";
        for (var j = 0; j < dl_data[var_names.name].length; j++) {
            if (limit && limit <= j) break;
            var metric_value = dl_data[var_names.action][j];
            rows_html += "<tr><td> " + (j+1) + "</td>";
            rows_html += "<td>";
            rows_html += dl_data[var_names.name][j];
            rows_html += "</td>";
            rows_html += "<td>"+ metric_value + '</td></tr>';
        }
        return(rows_html);
    }


    function composeTopRowsThreads(threads_data, limit, threads_links){
        var rows_html = "";
        for (var i = 0; i < threads_data.subject.length; i++) {
            if (limit && limit <= i) break;
            rows_html += "<tr><td>#" + (i+1) + "</td>";
            rows_html += "<td>";
            if (threads_links === true){
                var url = "http://www.google.com/search?output=search&q=X&btnI=1";
                if (threads_data.hasOwnProperty('url') && threads_data.url[i].length > 0){
                    url = "http://www.google.com/search?output=search&q=X%20site%3AY&btnI=1";
                    url = url.replace(/Y/g, threads_data.url[i]);
                }
                url = url.replace(/X/g, threads_data.subject[i]);
                rows_html += "<td>";
                rows_html += '<a target="_blank" href="'+url+ '">';
                rows_html += threads_data.subject[i] + "</a>";
                rows_html += "&nbsp;<i class=\"fa fa-external-link\"></i></td>";
            }else{
                rows_html += "<td>" + threads_data.subject[i] + "</td>";
            }
            rows_html += "<td>" + threads_data.initiator_name[i] + "</td>";
            rows_html += "<td>" + threads_data.length[i] + "</td>";
            rows_html += "</tr>";
        }
        return(rows_html);
    }

    function composeTopRowsPeople(people_data, limit, people_links, var_names){
        var rows_html = "";
        for (var j = 0; j < people_data[var_names.id].length; j++) {
            if (limit && limit <= j) break;
            var metric_value = people_data[var_names.action][j];
            rows_html += "<tr><td>" + (j+1) + "</td>";
            rows_html += "<td>";
            if (people_links){
                rows_html += '<a href="people.html?id=' +people_data[var_names.id][j];
                //we spread the GET variables if any
                get_params = Utils.paramsInURL();
                if (get_params.length > 0) rows_html += '&' + get_params;
                rows_html += '">';
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j]) +"</a>";
            }else{
                rows_html += DataProcess.hideEmail(people_data[var_names.name][j]);
            }
            rows_html += "</td>";
            rows_html += "<td>"+ metric_value + '</td></tr>';
        }
        return(rows_html);
    }

    function composeTopTabs(periods, metric, data, ds_name){
        var tabs_html = "";
        var first = true;
        tabs_html += '<ul id="myTab" class="nav nav-tabs">';
        for (var i=0; i< periods.length; i++){
            var mykey = metric + '.' + periods[i];
            if (data[mykey]){
                var data_period = periods[i];
                var data_period_formatted = data_period;
                if (data_period === ""){
                    data_period = "all";
                    data_period_formatted = "Complete history";
                }else if(data_period === "last month"){
                    data_period_formatted = "Last 30 days";
                }else if (data_period === "last year"){
                    data_period_formatted = "Last 365 days";
                }
                var data_period_nows = data_period.replace(/\ /g, '');
                var html = '';
                if (first === true){
                    html = ' class="active"';
                    first = false;
                }
                //FIXME this should be a counter, now it can crash
                tabs_html += '<li'+ html + '><a href="#' + ds_name + metric + data_period_nows +'"data-toogle="tab">';
                tabs_html += data_period_formatted+'</a></li>';
            }
        }
        tabs_html += '</ul>';
        return(tabs_html);
    }

    function composeTitle(metric, ds_name, tabs, desc_metrics, selected_period){
        // use the description desc_metrics to compose the title
        // selected_period: optional

        var key = ds_name + '_' + metric;
        var desc = "";
        var title = "";

        if ( key in desc_metrics){
            desc = desc_metrics[key].desc;
            desc = desc.toLowerCase();
        }

        if (selected_period === ""){
            data_period_formatted = "Complete history";
        }else if(selected_period === "last month"){
            data_period_formatted = "Last 30 days";
        }else if (selected_period === "last year"){
            data_period_formatted = "Last 365 days";
        }

        // If we are watching a release page, we overwrite the title of the table
        if (Utils.isReleasePage()) data_period_formatted = "Release history";


        if (tabs === true){
            //title += '<span class="TabTitle">Top ' + desc + '</span>';
            title += '<h6>Top ' + desc + '</h6>';
        }else{
            //title += '<span class="TabTitle">Top ' + desc + ' ' + selected_period+ '</span>';
            //title += '<h6>Top ' + desc + ' ' + selected_period+ '</h6>';
            title += '<div class="toptable-title">' + data_period_formatted+ '</div>';
        }
        return title;
    }

    String.prototype.capitalize = function() {
        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    function displayTopMetric_new(div_id, data, metric, limit, desc_metrics, people_links, threads_links, selected_period){
        /* This function will replace displayTopMetric + displayTopMetricTable */
        // if selected_period is given it doesn't generate tabs
        var tabs = "";
        var tables = "";
        var title = "";
        var gen_tabs = true;
        var div = $("#" + div_id);
        var ds_name = div.attr('data-data-source'); //we need it to map the vars

        if (Report.getParameterByName("repository") !== undefined) {
            // We don't have yet top people per repository data
            people_links = false;
        }

        // instead of iterating the data, we use the sorted periods
        periods = getSortedPeriods();

        if (selected_period !== undefined){
            gen_tabs = false;
        }

        title += composeTitle(metric, ds_name, gen_tabs, desc_metrics, selected_period);

        if (gen_tabs === true){
            // prints tabs
            tabs += composeTopTabs(periods, metric, data, ds_name);
        }

        tables += '<div class="tab-content">';

        // first we get the var names for that metric to identify the field who and what
        var var_names = getTopVarsFromMetric(metric, ds_name);
        if (gen_tabs === true){
            var first = true;
            var html = "";
            for (var k=0; k< periods.length; k++){
                html = "";
                var key = metric + '.' + periods[k];
                if (data[key]){
                    var data_period = periods[k];
                    if (data_period === ""){
                        data_period = "all";
                    }
                    var data_period_nows = data_period.replace(/\ /g, '');
                    if (first === true){
                        html = " active in";
                        first = false;
                    }
                    tables += '<div class="tab-pane fade'+ html  +'" id="' + ds_name + metric + data_period_nows + '">';
                    //tables += '<table class="table table-striped"><tbody>';
                    tables += '<table class="table table-striped">';
                    if (metric === "threads"){
                        tables += composeTopRowsThreads(data[key], limit, threads_links);
                    }else if (metric === "packages" || metric === "ips"){
                        // duplicated code, see next "else"
                        unit = desc_metrics[ds_name + "_" + metric].action;
                        //tables += '<thead><th>#</th><th>' +metric.capitalize()+'</th><th>'+unit.capitalize() +'</th></thead><tbody>';
                        metric_name = desc_metrics[ds_name + "_" + metric].name;
                        tables += '<thead><th>#</th><th>' +metric_name.capitalize()+'</th>';
                        if (unit !== undefined) tables += '<th>'+unit.capitalize()+'</th>';
                        tables += '</thead><tbody>';
                        // end duplicated code
                        tables += composeTopRowsDownloads(data[key], limit, var_names);
                        //tables += '</tbody>';
                    }else{
                        unit = desc_metrics[ds_name + "_" + metric].action;
                        //tables += '<thead><th>#</th><th>' +metric.capitalize()+'</th><th>'+unit.capitalize() +'</th></thead><tbody>';
                        metric_name = desc_metrics[ds_name + "_" + metric].name;
                        tables += '<thead><th>#</th><th>' +metric_name.capitalize()+'</th>';
                        if (unit !== undefined) tables += '<th>'+unit.capitalize()+'</th>';
                        tables += '</thead><tbody>';
                        tables += composeTopRowsPeople(data[key], limit, people_links, var_names);
                        tables += '</tbody>';
                    }
                    //tables += "</tbody></table>";
                    tables += "</table>";
                    tables += '</div>';
                }
            }
        }else{
            //tables += '<div class="tab-pane fade'+ html  +'" id="' + metric + data_period_nows + '">';
            tables += '<table class="table table-striped"><tbody>';
            if (metric === "threads"){
                tables += composeTopRowsThreads(data, limit, threads_links);
            }else if (metric === "packages" || metric === "ips"){
                // duplicated code, see next "else"
                unit = desc_metrics[ds_name + "_" + metric].action;
                tables += '<thead><th>#</th><th>' +metric.capitalize()+'</th>';
                if (unit !== undefined) tables += '<th>'+unit.capitalize()+'</th>';
                tables += '</thead><tbody>';
                // end duplicated code
                tables += composeTopRowsDownloads(data, limit, var_names);
            }else{
                unit = desc_metrics[ds_name + "_" + metric].action;
                tables += '<thead><th>#</th><th>' +metric.capitalize()+'</th>';
                if (unit !== undefined) tables += '<th>'+unit.capitalize()+'</th>';
                tables += '</thead><tbody>';
                tables += composeTopRowsPeople(data, limit, people_links, var_names);
                tables += '</tbody>';
            }
            tables += "</tbody></table>";
            //tables += '</div>';
        }
        tables += '</div>'; // this closes div tab-content

        if (gen_tabs === false){
            // prints tabs
            div.append(title);
        }
        div.append(tabs);
        div.append(tables);
        if (gen_tabs === true){
            script = "<script>$('#myTab a').click(function (e) {e.preventDefault();$(this).tab('show');});</script>";
            div.append(script);
        }
    }

    function displayTopMetric
    (div_id, metric, metric_period, history, graph, titles, limit, people_links) {
        //
        // this function is being replaced
        //
        var top_metric_id = metric.name;
        if (!history || $.isEmptyObject(history)) return;
        var metric_id = metric.action;
        if (limit && history[metric_id].length<limit) {
            limit = history[metric_id].length;
            graph = false; // Not enough height next to the item list
        }
        var doer = metric.column;
        if (doer === undefined) doer = findMetricDoer(history, metric_id);
        var title = "Top " + top_metric_id + " " + metric_period;
        var table = displayTopMetricTable(history, metric_id, doer, limit, people_links, title);
        // var doer = findMetricDoer(history, metric_id);
        var div = null;

        if (table === undefined) return;
        if (titles === false) {
            div = $("#" + div_id);
            div.append(table);
            return;
        }

        var div_graph = '';
        var new_div = '';
        if (graph) {
            div_graph = "top-" + graph + "-" + doer + "-";
            div_graph += metric_id + "-" + metric_period;
            new_div += "<div id='" + div_graph
                    + "' class='graph' style='float:right'></div>";
        }

        new_div += table;

        div = $("#" + div_id);
        div.append(new_div);
        if (graph) {
            var labels = history[doer];
            var data = history[metric_id];
            if (limit) {
                labels = [];
                data = [];
                for (var i=0; i<limit;i++) {
                    labels.push(history[doer][i]);
                    data.push(history[metric_id][i]);
                }
            }
            displayBasicChart(div_graph, labels, data, graph);
        }
    }

    function displayDataSourcesTable(div){
        dsources = Report.getDataSources();
        html = '<table class="table table-striped">';
        html += '<thead><th>Data Source</th><th>From</th>';
        html += '<th>To <small>(Updated on)</small></th></thead><tbody>';
        $.each(dsources, function(key,ds) {
            if (ds.getName() === 'people') return;
            var gdata = ds.getGlobalData();
            var ds_name = ds.getTitle();
            if (ds_name === undefined){
                ds_name = '-';}
            var last_date = gdata.last_date;
            if (last_date === undefined){
                return;
            }
            var first_date = gdata.first_date;
            if (first_date === undefined){
                first_date = '-'; // shouldn't reach this point
            }
            var type = gdata.type;
            html += '<tr><td>' + ds_name;
            if (type !== undefined){
                type = type.toLowerCase();
                type = type.charAt(0).toUpperCase() + type.slice(1);
                html += ' (' + type + ')';
            }
            html += '</td>';
            html += '<td>' + first_date+ '</td>';
            html += '<td>' + last_date + '</td></tr>';
            });
        html += '</tbody></table>';
        $(div).append(html);
    }

    function showHelp(div_id, metrics, custom_help) {
        var all_metrics = Report.getAllMetrics();
        var help ='<a href="#" class="help"';
        var content = "";

        if (custom_help === "") {
            var addContent = function (id, value) {
                if (metrics[i] === id) {
                    content += "<strong>"+value.name +"</strong>: "+ value.desc + "<br>";
                    return false;
                }
            };
            for (var i=0; i<metrics.length; i++) {
                $.each (all_metrics, addContent);
            }
        } else {
            content = "<strong>Description</strong>: " + custom_help;
        }

        help += 'data-content="'+content+'" data-html="true">';
        help += '<img src="qm_15.png"></a>';
        // Remove previous "?" so we don't duplicate
        var old_help =$('#'+div_id).prev()[0];
        if (old_help && old_help.className === "help") $('#'+div_id).prev().empty();
        $('#'+div_id).before(help);
    }

    function displayMetricsLines(div_id, metrics, history, title, config) {
        if (!(config && config.help === false)) showHelp(div_id, metrics, config.custom_help);

        var lines_data = [];

        if (config.remove_last_point) history =
            DataProcess.revomeLastPoint(history);
        if (config.frame_time) history =
            DataProcess.frameTime(history, metrics);
        if (config.start_time) history =
            DataProcess.filterDates(config.start_time, config.end_time, history);

        $.each(metrics, function(id, metric) {
            if (!history[metric]) return;
            var mdata = [];
            $.each(history[metric], function (i, value) {
                mdata[i] = [history.id[i], history[metric][i]];
            });
            var label = metric;
            if (Report.getAllMetrics()[metric])
                label = Report.getAllMetrics()[metric].name;
            lines_data.push({label:label, data:mdata});
        });
        displayDSLines(div_id, history, lines_data, title, config);

    }

    function displayMetricsLinesRepos(div_id, metrics, history, title, config, repositories) {
        if (!(config && config.help === false)) showHelp(div_id, metrics, config.custom_help);

        var lines_data = [];
        var metric = metrics[0];
        var aux = {};
        $.each(history, function(item, data){
            if (data === undefined) return false;
            if (data[metric] === undefined) return false;
            if (config.remove_last_point) data =
                DataProcess.revomeLastPoint(data);
            if (config.frame_time) data =
                DataProcess.frameTime(data, [metric]);
            if (config.start_time) data =
                DataProcess.filterDates(config.start_time, config.end_time, data);

            var mdata = [[],[]];
            $.each(data[metric], function (i, value) {
                mdata[i] = [data.id[i] , data[metric][i]];
            });
            lines_data.push({label:item, data:mdata});
            aux = data;
        });
        displayDSLines(div_id, aux, lines_data, title, config);
    }


    function displayMetricSubReportLines(div_id, metric, items, title,
            config, start, end, convert, order) {
        var lines_data = [];
        var history = {};


        // TODO: move this data logic to Data Source
        $.each(items, function(item, data) {
            if (data === undefined) return false;
            if (data[metric] === undefined) return false;

            if (convert) data = DataProcess.convert(data, convert, metric);
            if (start) data = DataProcess.filterDates(start, end, data);
            if (config.frame_time) data =
                DataProcess.frameTime(data, [metric]);

            /*if (config.remove_last_point) data =
                DataProcess.revomeLastPoint(data);*/

            var cdata = [[], []];
            for (var i=0; i<data.id.length; i++ ) {
                cdata[i] = [data.id[i], data[metric][i]];
            }

            item = Report.cleanLabel(item);
            lines_data.push({label:item, data:cdata});
            history = data;
        });

        if (lines_data.length === 0) return;

        if (order) {
            var order_lines_data = [];
            $.each(order, function(i, value_order) {
                $.each(lines_data, function(j, value) {
                    if (value_order === value.label) {
                        order_lines_data.push(value);
                        return false;
                    }
                });
            });
            lines_data = order_lines_data;
        }

        displayDSLines(div_id, history, lines_data, title, config);
    }

    // Add SCR companies pending to values
    Viz.track_formatter_com_pending = function(o) {
        scr = Report.getDataSourceByName('scr');
        companies = scr.getCompaniesMetricsData();
        dhistory = Viz._history;
        lines_data = Viz._lines_data;
        var label = dhistory.date[parseInt(o.index, 10)];
        if (label === undefined) label = "";
        else label += "<br>";
        for (var i=0; i<lines_data.length; i++) {
            var value = lines_data[i].data[o.index][1];
            if (value === undefined) continue;
            if (lines_data.length > 1) {
                if (lines_data[i].label !== undefined)
                    company_name = lines_data[i].label;
                    label += lines_data[i].label +":";
            }
            label += "<strong>"+Report.formatValue(value) +"</strong>";
            if (company_name) label += "("+companies[company_name].pending[o.index]+")";
            label += "<br>";
        }
        return label;
    };

    function getConfLinesChart(title, legend_div, history, lines_data, mouse_tracker_fn){
        // simply returns this basic configuration for a lines chart
        var config = {
            subtitle : title,
            legend: {
              show: true,
              container: legend_div
            },
            xaxis : {
                minorTickFreq : 4,
                mode: 'time',
                timeUnit: 'second',
                timeFormat: '%b %y',
                margin: true
            },
            yaxis : {
                // min: null,
                min: null,
                noTicks: 2,
                autoscale: true
            },
            grid : {
                verticalLines: false,
                color: '#000000',
                outlineWidth: 1,
                outline: 's'
            },
            mouse : {
                container: legend_div,
                track : true,
                trackY : false,
                relative: true,
                position: 'ne',
                trackFormatter : function(o) {
                    var label = history.date[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i=0; i<lines_data.length; i++) {
                        var value = lines_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (lines_data.length > 1) {
                            if (lines_data[i].label !== undefined) {
                                value_name = lines_data[i].label;
                                //label += value_name.substring(0,9) +":";
                                label += value_name + ":";
                            }
                        }
                        label += "<strong>"+Report.formatValue(value) +"</strong><br>";
                    }
                    return label;
                }
            },
            selection: {
                mode: 'x',
                fps: 10
            },
            shadowSize: 4
        };

        if (mouse_tracker_fn) {
            Viz._history = history;
            Viz._lines_data = lines_data;
            config.mouse.trackFormatter = Viz[mouse_tracker_fn];
        }

        return config;
    }

    function dropLastLineValue(history, lines_data){
        // If there are several lines, just remove last value
        // Removed because not useful if last data is not fresh
        if (lines_data.length === 0) return lines_data;
        if (lines_data.length>1) {
            for (var j=0; j<lines_data.length; j++) {
                var last = lines_data[j].data.length - 1;
                lines_data[j].data[last][1] = undefined;
            }
        }
    }

    // Last value is incomplete. Change it to a point.
    function lastLineValueToPoint(history, lines_data) {

        if (lines_data.length !== 1) return lines_data;
        var last = lines_data[0].data.length;

        var dots = [];
        var utime = 0;
        for (var i=0; i<last-1; i++) {
            utime = parseInt(history.unixtime[i],10);
            dots.push([utime,undefined]);
        }
        utime = parseInt(history.unixtime[last-1],10);
        dots.push([utime, lines_data[0].data[last-1][1]]);
        var dot_graph = {'data':dots};
        dot_graph.points = {show : true, radius:3, lineWidth: 1, fillColor: null, shadowSize : 0};
        lines_data.push(dot_graph);

        // Remove last data line because covered by dot graph
        lines_data[0].data[last-1][1] = undefined;

        // Copy the label for displaying the legend
        lines_data[1].label= lines_data[0].label;

        return lines_data;
    }


    function composeRangeText(former_title,starting_utime, end_utime){
        //compose text to be appended to title on charts when zooming in/out
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        // watchout! javascript uses miliseconds
        var date = new Date(parseInt(starting_utime,10)*1000);
        var starting_date = months[date.getMonth()] + ' ' + date.getFullYear();
        date = new Date(parseInt(end_utime,10)*1000);
        var end_date = months[date.getMonth()] + ' ' + date.getFullYear();
        return former_title + ' ( ' + starting_date + ' - ' + end_date + ' )';
    }

    function sortBiArray(bi_array){
        bi_array.sort(function(a, b) {
            return (a[1] > b[1] || b[1] === undefined)?1:-1;
        });
        return bi_array;
    }

    function getMax(multiple_array, from_unixstamp, to_unixstamp){
        // get max value of multiple array object
        from_unixstamp = Math.round(from_unixstamp);
        to_unixstamp = Math.round(to_unixstamp);

        // first, we have to filter the arrays
        var narrays = multiple_array.length;
        var aux_array = [];
        for (var i = 0; i < narrays; i++) {
            //for (var z = 0; z < multiple_array[i].data.length; z++) {
            for (var z = multiple_array[i].data.length - 1; z > 0 ; z--) {
                var aux_value = multiple_array[i].data[z][0];
                var cond = aux_value < from_unixstamp || aux_value > to_unixstamp;
                //if(aux_value < from_unixstamp || aux_value > to_unixstamp){
                if(cond){
                    multiple_array[i].data.splice(z,1);
                    //multiple_array[i].data.pop([z]);
                }
            }
        }

        var res = [];
        for (i = 0; i < narrays; i++) {
            aux_array = multiple_array[i].data;
            aux_array = sortBiArray(aux_array);
            res.push(aux_array[aux_array.length-1][1]);
        }
        res.sort(function(a,b){return a-b;});
        return res[res.length-1];
    }

    function addEmptyValue(lines_data){
        // add empty value at the end to avoid drawing an incomplete point

        // In one point series don't add empty value. It is already centered.
        if (lines_data[0].data.length == 1) {return;}

        var step = lines_data[0].data[1][0] - lines_data[0].data[0][0];
        var narrays = lines_data.length;
        var last_date = 0;
        for (var i = 0; i < narrays; i++) {
            var mylength = lines_data[i].data.length;
            last_date = lines_data[i].data[mylength-1][0];
            lines_data[i].data.push([last_date + step, undefined]);
        }
        return lines_data;
    }

    // Lines from the same Data Source

    function displayDSLines(div_id, history, lines_data, title, config_metric) {
        // This is a huge workaround to have both zoom feature and avoid breaking
        //the compatibility with line charts with the stacked flag.
        // Why a problem? Using the timestamp in the X axis breaks the stacked charts
        var use_stacked = false;
        if (config_metric) {
            if (config_metric.lines && config_metric.lines.stacked){
                use_stacked = true;
            }
        }
        if (use_stacked){
            displayDSLinesStacked(div_id, history, lines_data, title, config_metric);
        } else if (history.unixtime === undefined) {
            // Unixtime is not included yet in some metric time series (time_to)
            displayDSLinesStacked(div_id, history, lines_data, title, config_metric);
        } else {
            displayDSLinesZoom(div_id, history, lines_data, title, config_metric);
        }
    }

    function displayDSLinesStacked(div_id, history, lines_data, title, config_metric) {
        /// this is the former displayDSLines function that is being used to draw the stacked
        var container = document.getElementById(div_id);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container)
            legend_div = $('#'+config_metric.legend.container);
        var config = {
            subtitle : title,
            legend: {
              show: true,
              container: legend_div
            },
            xaxis : {
                minorTickFreq : 4,
                tickFormatter : function(x) {
                    var index = null;
                    for ( var i = 0; i < history.id.length; i++) {
                        if (parseInt(x, 10) === history.id[i]) {
                            index = i; break;}
                    }
                    return history.date[index];
                }
            },
            yaxis : {
                // min: null,
                min: 0,
                noTicks: 2,
                autoscale: false
            },
            grid : {
                verticalLines: false,
                color: '#000000',
                outlineWidth: 1,
                outline: 's'
            },
            mouse : {
                container: legend_div,
                track : true,
                trackY : false,
                trackFormatter : function(o) {
                    var label = history.date[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i=0; i<lines_data.length; i++) {
                        var value = lines_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (lines_data.length > 1) {
                            if (lines_data[i].label !== undefined)
                                label += lines_data[i].label +":";
                        }
                        label += Report.formatValue(value) +"<br>";
                    }
                    return label;
                }
            }
        };

        if (config_metric) {
            if (!config_metric.show_title) config.title = '';
            if ("show_legend" in config_metric) {
                if (config_metric.show_legend === true) config.legend.show = true;
                else config.legend.show = false;
            }
            if (config_metric.lines && config_metric.lines.stacked)
                config.lines =
                    {stacked:true, fill:true, fillOpacity: 1, fillBorder:true, lineWidth:0.01};
            if (!config_metric.show_labels) {
                config.xaxis.showLabels = false;
                config.yaxis.showLabels = false;
            }
            if (config_metric.show_grid === false) {
                config.grid.verticalLines = false;
                config.grid.horizontalLines = false;
                config.grid.outlineWidth = 0;
            }
            if (config_metric.show_mouse === false) {
                config.mouse.track = false;
            }
            if (config_metric.graph === "bars") {
                config.bars = {show : true};
            }
            if (config_metric.light_style === true) {
                config.grid.color = '#ccc';
                config.legend.show = false;
            }
            if (config_metric.custom_title){
                config.subtitle = config_metric.custom_title;
            }
        }


        // Show last time series as a point, not a line. The data is incomplete
        // Only show for single lines when time series is complete
        var showLastPoint = false;
        if (config_metric.graph !== "bars" &&
            lines_data.length === 1 &&
            lines_data[0].data[0][0] === 0) {
            showLastPoint = true;
        }
        if (showLastPoint) {
            lines_data = lastLineValueToPoint(history, lines_data);
            // Add an extra entry for adding space for the circle point. Ugly hack!
            // var last = lines_data[0].data.length;
            var next_id = history.id[history.id.length-1]+1;
            lines_data[0].data.push([next_id, undefined]);
            lines_data[1].data.push([next_id, undefined]);
            history.date.push('');
            history.id.push(next_id);

        }

        graph = Flotr.draw(container, lines_data, config);

        // Clean added point. Data is a reference to the original!
        if (showLastPoint) {
            if (history.date) history.date.pop();
            if (history.id) history.id.pop();
        }
    }

    function guessBarWidth(lines_data, history){
        /*
         The idea is to get the time between periods in order to calculated the correct
         bar width for flotr2

         lines_data: list of objects with data to be plotted
         history: object where unixtime for every period of the chart is available
         */

        var gap_size;
        var data_sets = lines_data.length;
        gap_size = parseInt(history.unixtime[1],10) - parseInt(history.unixtime[0],10);
        return gap_size / (data_sets + 1);
    }

    function timeToUnixTime(lines_data, history, bars_flag, bar_width){
        /*
         Convert the number of period to the unixtime stored in history

         lines_data: list of objects with data to be plotted
         history: object where unixtime for period is available
         bars_flag: TRUE when more bars will be drawn for same period (maximum = 2 per period)
         bar_width: width of the bar to be used as offset
         */

        var number_lines = lines_data.length;
        var data_length = lines_data[0].data.length;
        for (var z = 0; z < number_lines; z++){
            for (var i = 0; i < data_length; i++) {
                if (bars_flag){
                //lines_data[z].data[i][0] = parseInt(history.unixtime[i],10);
                    lines_data[z].data[i][0] = parseInt(history.unixtime[i],10) + z * bar_width;
                }else{
                    lines_data[z].data[i][0] = parseInt(history.unixtime[i],10);
                }
            }
        }
        return lines_data;
    }

    function displayDSLinesZoom(div_id, history, lines_data, title, config_metric) {
        var bars_flag = false;
        var bar_width;

        if (lines_data.length === 0) return;
        // evolution of the displayDSLines function with zoom in/out feature
        var container = document.getElementById(div_id);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container)
            legend_div = $('#'+config_metric.legend.container);

        var config = getConfLinesChart(title, legend_div, history, lines_data,
                                       config_metric.mouse_tracker);

        if (config_metric) {
            // depending on the configuration we enable/disable options
            if (!config_metric.show_title) config.title = '';
            if ("show_legend" in config_metric) {
                if (config_metric.show_legend === true) config.legend.show = true;
                else config.legend.show = false;
            }
            if (config_metric.lines && config_metric.lines.stacked){
                config.lines =
                    {stacked:true, fill:true, fillOpacity: 1, fillBorder:true, lineWidth:0.01};
            }
            if (!config_metric.show_labels) {
                config.xaxis.showLabels = false;
                config.yaxis.showLabels = false;
            }
            if (config_metric.show_grid === false) {
                config.grid.verticalLines = false;
                config.grid.horizontalLines = false;
                config.grid.outlineWidth = 0;
            }
            if (config_metric.show_mouse === false) {
                config.mouse.track = false;
            }
            if (config_metric.graph === "bars") {
                // this barWidth won't work with periods of time different to months
                config.bars = {show:true, stacked:false, horizontal:false, barWidth:728000, lineWidth:1};
                config.bars.barWidth = guessBarWidth(lines_data, history);
                bars_flag = true;
                bar_width = config.bars.barWidth;

            }
            if (config_metric.light_style === true) {
                config.grid.color = '#ccc';
                config.legend.show = false;
            }
            if (config_metric.custom_title){
                config.subtitle = config_metric.custom_title;
            }
            // value box on top
            config.mouse.position = 'n';
            config.mouse.margin = 20;
        }

        // we force the legend when several lines are plotted
        if (lines_data.length > 1) config.legend.show = true;

        lines_data = timeToUnixTime(lines_data, history, bars_flag, bar_width);

        // Show last time series as a point, not a line. The data is incomplete
        // Only show for single lines when time series is complete
        var showLastPoint = false;
        // If we show past information to overwrite to false the lastpoint

        if (Utils.isReleasePage() === false){
            if (config_metric.graph !== "bars" && lines_data.length === 1) {
                showLastPoint = true;
            }
            if (showLastPoint) {
                lines_data = lastLineValueToPoint(history, lines_data);
                // Add an extra entry for adding space for the circle point.
                addEmptyValue(lines_data);
            }else if(!showLastPoint && lines_data.length > 1){
                // we drop it to avoid showing not complete periods without points
                dropLastLineValue(history, lines_data);
            }
        }

        /*graph = Flotr.draw(container, lines_data, config);*/
        function drawGraph(opts) {
            // Clone the options, so the 'options' variable always keeps intact.
            var o = Flotr._.extend(Flotr._.clone(config), opts || {});
            // Return a new graph.
            return Flotr.draw(container, lines_data, o);
        }
        console.log(config);
        // Actually draw the graph.
        graph = drawGraph();

        // Hook into the 'flotr:select' event to draw the chart after zoom in
        Flotr.EventAdapter.observe(container, 'flotr:select', function(area) {
            // Draw graph with new area
            var zoom_options = {
                xaxis: {
                    minorTickFreq : 4,
                    mode: 'time',
                    timeUnit: 'second',
                    timeFormat: '%b %y',
                    min: area.x1,
                    max: area.x2
                },
                yaxis: {
                    min: area.y1,
                    autoscale: true
                },
                grid : {
                    verticalLines: true,
                    color: '#000000',
                    outlineWidth: 1,
                    outline: 's'
                }
            };

            zoom_options.subtitle = composeRangeText(config.subtitle, area.xfirst, area.xsecond);

            //we don't want our object data to be modified so ..
            var new_lines_data_object = JSON.parse(JSON.stringify(lines_data));
            var max_value = getMax(new_lines_data_object, area.x1, area.x2);

            zoom_options.yaxis.max = max_value + max_value * 0.2; //we do Y axis a bit higher than max


            graph = drawGraph(zoom_options);
        });

        // When graph is clicked, draw the graph with default area.
        Flotr.EventAdapter.observe(container, 'flotr:click', function() {
            drawGraph();
        });

        $(window).resize(function(){
            drawGraph();
        });
    }

    /**
    * Displays bar chart with timezones and a given metric.
    * @constructor
    * @param {string} divid - Id of the div
    * @param {integer[]} labels - Array of labels for X axis
    * @param {integer[data]} npeople - Array of values (y axis)
    * @param {string} metric_name - Name of the charted metric
    */
    function displayTimeZone(divid, labels, data, metric_name){
        var title = 'Time zones for ' + metric_name;
        var container = document.getElementById(divid);
        var chart_data = [], i;
        var legend_div = null;
        for (i = 0; i < data.length; i++) {
                chart_data.push({
                /* why such array in data? */
                data : [ [ labels[i], data[i] ] ],
                label : i
            });
        }
        var config = {
            subtitle : title,
            grid : {
                verticalLines : false,
                outlineWidth : 0,
                horizontalLines : true
            },
            xaxis : {
                tickFormatter : function (value) {
                    var label = 'UTC ';
                    if (value > 0)
                        label += '+' + value;
                    else
                        label += value;
                    return label;
                },
                color : '#000000',
                tickDecimals : 0
            },
            yaxis : {
                showLabels : true,
                min : 0,
                noTicks: 2,
                color : '#000000'
            },
            mouse : {
                track : true,
                trackY : false,
                relative: true,
                position: 'n',
                trackDecimals: 0,
                trackFormatter : function(tuple) {
                    var label = 'UTC ';
                    if (tuple.x > 0)
                        label += '+' + tuple.x;
                    else
                        label += tuple.x;
                    pretty_name = metric_name.charAt(0).toUpperCase()
                            + metric_name.slice(1);
                    label += '<br/> '+ pretty_name +': <strong>' + tuple.y
                            +'</strong>';
                    return label;
                }
            },
            legend : {
                show: false
            },
            bars :{
                show: true,
                color: '#008080',
                fillColor: '#008080',
                fillOpacity: 0.6
            }
        };
        graph = Flotr.draw(container, chart_data, config);
        $(window).resize(function(){
            graph = Flotr.draw(container, chart_data, config);
        });
    }



    function displayBasicChart
        (divid, labels, data, graph, title, config_metric, rotate, fixColor,
                yformatter) {

        var horizontal = false;
        if (rotate)
            horizontal = true;

        var container = document.getElementById(divid);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container)
            legend_div = $('#'+config_metric.legend.container);
        var chart_data = [], i;

        var label = '';
        if (!horizontal) {
            for (i = 0; i < data.length; i++) {
                if (labels) label = DataProcess.hideEmail(labels[i]);
                chart_data.push({
                    data : [ [ i, data[i] ] ],
                    label : label
                });
            }
        } else {
            for (i = 0; i < data.length; i++) {
                if (labels) label = DataProcess.hideEmail(labels[i]);
                chart_data.push({
                    data : [ [ data[i], i ] ],
                    label : label
                });
            }
        }

        var config = {
            subtitle : title,
            grid : {
                verticalLines : false,
                horizontalLines : false,
                outlineWidth : 0
            },
            xaxis : {
                showLabels : false,
                min : 0
            },
            yaxis : {
                showLabels : false,
                min : 0
            },
            mouse : {
                container: legend_div,
                track : true,
                trackFormatter : function(o) {
                    var i = 'x';
                    if (horizontal) i = 'y';
                    var label = '';
                    if (labels)
                        label = DataProcess.hideEmail(labels[parseInt(o[i], 10)]) + ": ";
                    return label + data[parseInt(o[i], 10)];
                }
            },
            legend : {
                show : false,
                position : 'se',
                backgroundColor : '#D2E8FF',
                container: legend_div
            }
        };

        if (config_metric) {
            if (!config_metric.show_title) config.title = '';
            if (config_metric.show_legend) config.legend.show = true;
        }

        if (graph === "bars") {
            config.bars = {
                show : true,
                horizontal : horizontal
            };
            if (fixColor) {
                config.bars.color = fixColor;
                config.bars.fillColor = fixColor;
            }

            if (config_metric && config_metric.show_legend !== false)
                config.legend = {show:true, position: 'ne',
                    container: legend_div};

            // TODO: Color management should be defined
            //var defaults_colors = [ '#ffa500', '#ffff00', '#00ff00', '#4DA74D',
            //                        '#9440ED' ];
            // config.colors = defaults_colors,
            config.grid.horizontalLines = true;
            config.yaxis = {
                showLabels : true, min:0
            };
            if (config_metric && config_metric.xaxis)
                config.xaxis = {
                        showLabels : config_metric.xaxis, min:0
                };
            if (yformatter) {
                config.yaxis = {
                        showLabels : true, min:0, tickFormatter : yformatter
                };
            }
        }
        if (graph === "pie") {
            config.pie = {show : true};
            config.mouse.position = 'ne';
        }

        graph = Flotr.draw(container, chart_data, config);
    }

    // labels: label for each column series
    // data: values for each column series, Two series now.
    function displayMultiColumnChart
        (divid, labels, data, title, config_metric, rotate,
         yformatter, period_year) {

        var bar_width = 0.4; // 1 total per group of bars
        var lseries = data[0].length;
        if (data[1].length > lseries) lseries = data[1].length;

        var horizontal = false;
        if (rotate)
            horizontal = true;

        var container = document.getElementById(divid);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container)
            legend_div = $('#'+config_metric.legend.container);
        var serie1 = [], i, serie2=[], data_viz = [];

        for (i = 0; i < lseries; i++) {
            var val1, val2;
            if (data[0].length>i) val1 = data[0][i];
            else val1 = undefined;
            if (data[1].length>i) val2 = data[1][i];
            else val2 = undefined;
            if (!horizontal) {
                serie1.push([i-bar_width/2, val1]);
                serie2.push([i+bar_width/2, val2]);
            } else {
                serie1.push([val1, i-bar_width/2]);
                serie2.push([val2, i+bar_width/2 ]);
            }
        }

        data_viz = [{data:serie1,label:labels[0]},
                    {data:serie2,label:labels[1]}];

        var config = {
            title : title,
            bars: {
                show : true,
                horizontal : horizontal,
                barWidth : bar_width
            },
            grid : {
                verticalLines : false,
                horizontalLines : false,
                outlineWidth : 0
            },
            xaxis : {
                showLabels : false,
                min : 0
            },
            yaxis : {
                showLabels : true,
                min : 0
            },
            mouse : {
                container: legend_div,
                track : true,
                trackFormatter : function(o) {
                    var index;
                    var i = 'x';
                    if (horizontal) i = 'y';
                    var point = parseFloat(o[i],1);
                    // point+0.2 serie2, point-0.2 serie1
                    // Strange maths ... round to avoid x.9999
                    var point_down = Math.round((point-0.2)*10)/10;
                    var point_up = Math.round((point+0.2)*10)/10;
                    if (point_down === parseInt(point,10))
                        index = point_down;
                    else index = point_up;
                    var years = index;
                    if (period_year) years = index * period_year;
                    var label = years + " years: ";
                    var val1, val2;
                    if (serie1[index] === undefined) val1 = 0;
                    else val1 = parseInt(serie1[index][0],10);
                    if (isNaN(val1)) val1 = 0;
                    if (serie2[index] === undefined) val2 = 0;
                    else val2 = parseInt(serie2[index][0],10);
                    if (isNaN(val2)) val2 = 0;
                    label += val1 + " " + labels[0];
                    label += " , ";
                    label += val2 + " " + labels[1];
                    label += " (" + parseInt((val1/val2)*100,10)+"% )";
                    return label;
                }
            },
            legend : {
                show : true,
                position : 'ne',
                backgroundColor : '#D2E8FF',
                container: legend_div
            }
        };

        if (config_metric) {
            if (!config_metric.show_title) config.title = '';
            if (config_metric.show_legend) config.legend.show = true;
        }

        if (config_metric && config_metric.show_legend !== false)
            config.legend = {show:true, position: 'ne',
                container: legend_div};

        config.grid.horizontalLines = true;
        config.yaxis = {
            showLabels : true, min:0
        };
        if (yformatter) {
            config.yaxis = {
                    showLabels : true, min:0, tickFormatter : yformatter
            };
        }

        if (config_metric && config_metric.xaxis)
            config.xaxis = {
                    showLabels : config_metric.xaxis, min:0
            };
        graph = Flotr.draw(container, data_viz, config);
    }


    // The two metrics should be from the same data source
    function displayBubbles(divid, metric1, metric2, radius) {

        var container = document.getElementById(divid);

        var DS = Report.getMetricDS(metric1)[0];
        var DS1 = Report.getMetricDS(metric2)[0];

        var bdata = [];

        if (DS != DS1) {
            Report.log("Metrics for bubbles have different data sources");
            return;
        }
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() ===  DS.getName()) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           }
        });

        // [ids, values] Complete timeline for all the data
        var dates = [[],[]];

        // Healthy initial value
        dates = [full_data[0].id, full_data[0].date];

        for (var i=0; i<full_data.length; i++) {
            // if empty data return
            if (full_data[i] instanceof Array) return;
            dates = DataProcess.fillDates(dates, [full_data[i].id, full_data[i].date]);
        }

        for ( var j = 0; j < full_data.length; j++) {
            var serie = [];
            var data = full_data[j];
            var data1 = DataProcess.fillHistory(dates[0], [data.id, data[metric1]]);
            var data2 = DataProcess.fillHistory(dates[0], [data.id, data[metric2]]);
            for (i = 0; i < dates[0].length; i++) {
                serie.push( [ dates[0][i], data1[1][i], data2[1][i] ]);
            }
            bdata.push({label:projects[j],data:serie});
        }

        var config = {
            bubbles : {
                show : true,
                baseRadius : 5
            },
            mouse : {
                track : true,
                trackFormatter : function(o) {
                    var value = full_data[0].date[o.index] + ": ";
                    value += o.series.label + " ";
                    value += o.series.data[o.index][1] + " " + metric1 + ",";
                    value += o.series.data[o.index][2] + " " + metric2;
                    return value;
                }
            },
            xaxis : {
                tickFormatter : function(o) {
                    return full_data[0].date[parseInt(o, 10) - full_data[0].id[0]];
                }
            }
        };

        if (DS.getName() === "its")
            $.extend(config.bubbles, {
                baseRadius : 1.0
            });

        if (radius) {
            $.extend(config.bubbles, {
                baseRadius : radius
            });
        }
        Flotr.draw(container, bdata, config);
    }

    function displayDemographicsChart(divid, ds, data, period_year) {
        if (!data) return;
        if (!period_year) period_year = 0.25;
        else period = 365*period_year;

        // var data = ds.getDemographicsData();
        var period_data_aging = [];
        var period_data_birth = [];
        var labels = [], i;
        var config = {show_legend:false, xaxis:true};
        var age, index;

        // Aging
        for (i = 0; i < data.aging.persons.age.length; i++) {
            age = data.aging.persons.age[i];
            // With some sqlalchemy the format is "1091 days, 9:49:55"
            age = age.toString().split(" ")[0];
            index = parseInt(age / period, 10);
            if (!period_data_aging[index])
                period_data_aging[index] = 0;
            period_data_aging[index] += 1;
        }
        // Birth
        for (i = 0; i < data.birth.persons.age.length; i++) {
            age = data.birth.persons.age[i];
            // With some sqlalchemy the format is "1091 days, 9:49:55"
            age = age.toString().split(" ")[0];
            age = age.split(" ")[0];
            index = parseInt(age / period, 10);
            if (!period_data_birth[index])
                period_data_birth[index] = 0;
            period_data_birth[index] += 1;
        }

        labels = ["Retained","Attracted"];

        yticks = function (val, axisOpts){
            var period = period_year;
            var unit = "years";
            val = val*period_year;
            return val +' ' + unit;
        };

        var period_data = [period_data_aging, period_data_birth];

        if (data)
            displayMultiColumnChart(divid, labels, period_data, "", config, true, yticks, period_year);
    }

    function displayRadarChart(div_id, ticks, data) {
        var container = document.getElementById(div_id);
        var max = $("#" + div_id).data('max');
        var border=0.2;

        if (!(max)) max = 0;

        for (var j=0; j<data.length; j++) {
            for (var i=0; i<data[j].data.length; i++) {
                var value =  data[j].data[i][1];
                if (value>max) {
                    max = value;
                    max = parseInt(max * (1+border),10);
                }
            }
        }

        // TODO: Hack to have vars visible in track/tickFormatter
        (function() {var x = [data, ticks];})();

        graph = Flotr.draw(container, data, {
            radar : {
                show : true
            },
            mouse : {
                track : true,
                trackFormatter : function(o) {
                    var value = "";
                    for (var i=0; i<data.length; i++) {
                        value += data[i].label + " ";
                        value += data[i].data[o.index][1] + " ";
                        value += ticks[o.index][1] + "<br>";
                    }
                    return value;
                }
            },
            grid : {
                circular : true,
                minorHorizontalLines : true
            },
            yaxis : {
                min : 0,
                max : max,
                minorTickFreq : 1
            },
            xaxis : {
                ticks : ticks
            }
        });
    }

    function displayRadar(div_id, metrics) {
        var data = [], ticks = [];
        var radar_data = [];
        var projects = [];

        var i = 0, j = 0;
        for (i = 0; i < metrics.length; i++) {
            var DS = Report.getMetricDS(metrics[i]);
            for (j=0; j<DS.length; j++) {
                if (!data[j]) {
                    data[j] = [];
                    projects[j] = DS[j].getProject();
                }
                data[j].push([ i, parseInt(DS[j].getGlobalData()[metrics[i]], 10) ]);
            }
            ticks.push([ i, DS[0].getMetrics()[metrics[i]].name ]);
        }

        for (j=0; j<data.length; j++) {
            radar_data.push({
                label : projects[j],
                data : data[j]
            });
        }

        displayRadarChart(div_id, ticks, radar_data);
    }

    function displayRadarCommunity(div_id) {
        var metrics = [ 'scm_committers', 'scm_authors', 'its_openers', 'its_closers',
                'its_changers', 'mls_senders' ];
        displayRadar(div_id, metrics);
    }

    function displayRadarActivity(div_id) {
        var metrics = [ 'scm_commits', 'scm_files', 'its_opened', 'its_closed', 'its_changed',
                'mls_sent' ];
        displayRadar(div_id, metrics);
    }

    function displayTimeToAttention(div_id, ttf_data, column, labels, title) {
        displayTimeTo(div_id, ttf_data, column, labels, title);
    }

    function displayTimeToFix(div_id, ttf_data, column, labels, title) {
        displayTimeTo(div_id, ttf_data, column, labels, title);
    }

    function displayTimeTo(div_id, ttf_data, column, labels, title) {
        // We can have several columns (metrics)
        var metrics = column.split(",");
        var history = ttf_data.data;
        if (!history[metrics[0]]) return;
        var new_history = {};
        new_history.date = history.date;
        // We prefer the data in days, not hours
        $.each(history, function(name, data) {
            if ($.inArray(name, metrics) === -1) return;
            new_history[name] = [];
            for (var i=0; i<data.length; i++) {
                var hours = parseFloat((parseInt(data[i],null)/24).toFixed(2),10);
                new_history[name].push(hours);
            }
        });
        //  We need and id column
        new_history.id=[];
        for (var i=0; i<history[metrics[0]].length;i++) {
            new_history.id.push(i);
        }
        var config = {show_legend: true, show_labels: true};
        displayMetricsLines(div_id, metrics, new_history, column, config);
    }

    // Each metric can have several top: metric.period
    // For example: "committers.all":{"commits":[5310, ...],"name":["Brion
    // Vibber",..]}

    function displayTop(div, ds, all, selected_metric, period, period_all, graph, titles, limit, people_links, threads_links, repository) {
        /*
         Call functions to compose the HTML for top tables with multiple of single
         tabs.
         */

        var desc_metrics = ds.getMetrics();
        if (all === undefined) all = true;
        var history;
        if (repository === undefined){
            history = ds.getGlobalTopData();
        }else{
            history = ds.getRepositoriesTopData()[repository];
        }

        // If the release flag is available, we overwrite the period_all and period
        // variables.
        if (Utils.isReleasePage()){
            period_all = false;
            period = '';
        }

        if (period_all === true){
            var filtered_history = {};
            $.each(history, function(key, value) {
                // iterates the values senders.,senders.last month, threads. etc ..
                var aux = key.split(".");
                var data_metric = aux[0]; //metric with no period from JSON
                var data_period = aux[1];
                if (selected_metric && selected_metric !== data_metric){
                    return true;
                }
                if (selected_metric && selected_metric === data_metric){
                    filtered_history[key] = history[key];
                }
            });
            displayTopMetric_new(div, filtered_history, selected_metric, limit, desc_metrics, people_links, threads_links);
        }else{
            $.each(history, function(key, value) {
                // ex: commits.all
                var aux = key.split(".");
                var data_metric = aux[0]; //metric with no period from JSON
                var data_period = aux[1];
                if (selected_metric && selected_metric !== data_metric) return true;
                if ((period !== undefined) && (period !== data_period)) return true;
                // at this point the key is the one we're looking for, time to draw it
                displayTopMetric_new(div, history[key], selected_metric, limit, desc_metrics, people_links, threads_links, period);
            });
        }
    }

    function displayTopCompany(company, data, div, metric, period, titles) {
        var graph = null;
        displayTopMetric(div, metric, period, data, graph, titles);
    }

    function displayTopGlobal(div, data_source, metric_id, period, titles) {
        var project = data_source.getProject();
        var metric = data_source.getMetrics()[metric_id];
        var graph = null;
        if (!data_source.getGlobalTopData()[metric_id]) return;
        data = data_source.getGlobalTopData()[metric_id][period];
        displayTopMetric(div, project, metric, period, data, graph, titles);
    }

    // D3 based
    function displayTreeMap(divid, data_file, data) {
        if (data === undefined) {
            if (data_file === undefined) return;
            Loader.get_file_data_div (data_file, Viz.displayTreeMap, divid);
            return;
        }
        else if (data === null) return;

        // We have the data to be drawn
        var color = d3.scale.category20c();

        var div = d3.select("#"+divid);

        var width = $("#"+divid).width(),
            height = $("#"+divid).height();

        var treemap = d3.layout.treemap()
            .size([ width, height ])
            .sticky(true)
            .value(function(d) {return d.size;}
        );

        var position = function() {
            this.style("left", function(d) {
                return d.x + "px";
            }).style("top", function(d) {
                return d.y + "px";
            }).style("width", function(d) {
                return Math.max(0, d.dx - 1) + "px";
            }).style("height", function(d) {
                return Math.max(0, d.dy - 1) + "px";
            });
        };

        var node = div.datum(data).selectAll(".node")
                .data(treemap.nodes)
            .enter().append("div")
                .attr("class", "treemap-node")
                .call(position)
                .style("background", function(d) {
                    return d.children ? color(d.name) : null;})
                .text(function(d) {
                    return d.children ? null : d.name;
                });

        d3.selectAll("input").on("change", function change() {
            var value = this.value === "count"
                ? function() {return 1;}
                : function(d) {return d.size;};

            node
                    .data(treemap.value(value).nodes)
                .transition()
                    .duration(1500)
                    .call(position);
       });
    }

    // TODO: Remove when mls lists are multiproject
    Viz.getEnvisionOptionsMin = function (div_id, history, hide) {
        var firstMonth = history.id[0],
                container = document.getElementById(div_id), options;
        var markers = Report.getMarkers();
        var basic_metrics = Report.getAllMetrics();

        options = {
            container : container,
            xTickFormatter : function(index) {
                var label = history.date[index - firstMonth];
                if (label === "0")
                    label = "";
                return label;
            },
            yTickFormatter : function(n) {
                return n + '';
            },
            // Initial selection
            selection : {
                data : {
                    x : {
                        min : history.id[0],
                        max : history.id[history.id.length - 1]
                    }
                }
            }
        };

        options.data = {
            summary : [history.id,history.sent],
            markers : markers,
            dates : history.date,
            envision_hide : hide,
            main_metric : "sent"
        };

        var all_metrics = Report.getAllMetrics();
        var label = null;
        for (var metric in history) {
            label = metric;
            if (all_metrics[metric]) label = all_metrics[metric].name;
            options.data[metric] = [{label:label, data:[history.id,history[metric]]}];
        }

        options.trackFormatter = function(o) {
            var sdata = o.series.data, index = sdata[o.index][0] - firstMonth;

            var value = history.date[index] + ":<br>";

            for (var metric in basic_metrics) {
                if (history[metric] === undefined) continue;
                value += history[metric][index] + " " + metric + " , ";
            }
            return value;
        };

        return options;
    };

    function getEnvisionOptions(div_id, projects_data, ds_name, hide, summary_graph) {

        var basic_metrics = null, main_metric="", summary_data = [[],[]];

        if (ds_name) {
            $.each(Report.getDataSources(), function(i, DS) {
                if (DS.getName() === ds_name) {
                    basic_metrics = DS.getMetrics();
                    return false;
                }
            });
        }
        else basic_metrics = Report.getAllMetrics();

        $.each(Report.getDataSources(), function(i, DS) {
            main_metric = DS.getMainMetric();
            if ((ds_name === null && DS.getName() === "scm") ||
                (ds_name && DS.getName() == ds_name)) {
                summary_data = [DS.getData().id, DS.getData()[main_metric]];
                if (summary_graph === false)
                    summary_data = [DS.getData().id, []];
                return false;
            }
        });

        // [ids, values] Complete timeline for all the data
        var dates = [[],[]];

        $.each(projects_data, function(project, data) {
            $.each(data, function(index, DS) {
                if (ds_name && ds_name !== DS.getName()) return;
                dates = DataProcess.fillDates(dates,
                        [DS.getData().id, DS.getData().date]);
            });
        });

        var firstMonth = dates[0][0],
                container = document.getElementById(div_id), options;
        var markers = Report.getMarkers();

        options = {
            container : container,
            xTickFormatter : function(index) {
                var label = dates[1][index - firstMonth];
                if (label === "0")
                    label = "";
                return label;
            },
            yTickFormatter : function(n) {
                return n + '';
            },
            // Initial selection: disabled
            selection : {
                data : {
                    x : {
                        min : dates[0][0],
                        max : dates[0][dates[0].length - 1]
                    }
                }
            }
        };

        options.data = {
            summary : DataProcess.fillHistory(dates[0], summary_data),
            markers : markers,
            dates : dates[1],
            envision_hide : hide,
            main_metric : main_metric
        };

        var project = null;
        var buildProjectInfo = function(index, ds) {
            var data = ds.getData();
            if (data[metric] === undefined) return;
            if (options.data[metric] === undefined)
                options.data[metric] = [];
            var full_data =
                DataProcess.fillHistory(dates[0], [data.id, data[metric]]);
            if (metric === main_metric) {
                options.data[metric].push(
                        {label:project, data:full_data});
                if (data[metric+"_relative"] === undefined) return;
                if (options.data[metric+"_relative"] === undefined)
                    options.data[metric+"_relative"] = [];
                full_data = DataProcess.fillHistory(dates[0],
                            [data.id, data[metric+"_relative"]]);
                options.data[metric+"_relative"].push(
                        {label:project, data:full_data});
            } else {
                //options.data[metric].push({label:"", data:full_data});
                options.data[metric].push({label:project, data:full_data});
            }
        };

        var buildProjectsInfo = function(name, pdata) {
            project = name;
            $.each(pdata, buildProjectInfo);
        };

        for (var metric in basic_metrics) {
            $.each(projects_data, buildProjectsInfo);
        }

        options.trackFormatter = function(o) {
            var sdata = o.series.data, index = sdata[o.index][0] - firstMonth;
            var project_metrics = {};
            var projects = Report.getProjectsList();
            for (var j=0;j<projects.length; j++) {
                project_metrics[projects[j]] = {};
            }

            var value = dates[1][index] + ":<br>";

            for (var metric in basic_metrics) {
                if (options.data[metric] === undefined) continue;
                if ($.inArray(metric,options.data.envision_hide) > -1) continue;
                for (j=0;j<projects.length; j++) {
                    if (options.data[metric][j] === undefined) continue;
                    var project_name = options.data[metric][j].label;
                    var pdata = options.data[metric][j].data;
                    value = pdata[1][index];
                    project_metrics[project_name][metric] = value;
                }
            }

            value  = "<table><tr><td align='right'>"+dates[1][index]+"</td></tr>";
            value += "<tr>";
            if (projects.length>1) value +="<td></td>";
            for (metric in basic_metrics) {
                if (options.data[metric] === undefined) continue;
                if ($.inArray(metric,options.data.envision_hide) > -1)
                    continue;
                value += "<td>"+basic_metrics[metric].name+"</td>";
            }
            value += "</tr>";
            $.each(project_metrics, function(project, metrics) {
                var row = "<tr>";
                for (var metric in basic_metrics) {
                    if (options.data[metric] === undefined) continue;
                    if ($.inArray(metric,options.data.envision_hide) > -1)
                        continue;
                    mvalue = project_metrics[project][metric];
                    if (mvalue === undefined) mvalue = "n/a";
                    row += "<td>" + mvalue + "</td>";
                }
                if (projects.length>1) row = "<td>"+project+"</td>"+row;
                row += "</tr>";
                value += row;
            });
            value += "</table>";

            return value;
        };

        return options;
    }

    function checkBasicConfig(config) {
        if (config === undefined)
            config = {};
        if (config.show_desc === undefined)
            config.show_desc = true;
        if (config.show_title === undefined)
            config.show_title = true;
        if (config.show_labels === undefined)
            config.show_labels = true;
        return config;
    }

    function getMetricFriendlyName(ds, metrics ){
        var desc_metrics = ds.getMetrics();
        var title = '';
        for (var i=0; i<metrics.length; i++) {
            if (i !== 0){
                title += ' vs. ';
            }
            if (metrics[i] in desc_metrics)
                title += desc_metrics[metrics[i]].name;
            else title += metrics[i];
        }
        return title;
    }

    function displayMetricsEvol(ds, metrics, data, div_target, config, repositories) {
        /* gets readeable title for metrics + conf and calls displayMetricsLines*/
        config = checkBasicConfig(config);
        var title = '';
        if (config.show_title){
            if (config.title === undefined){
                title = getMetricFriendlyName(ds, metrics);
            }else{
                title = config.title;
            }
        }
        if (repositories !== undefined){
            //only supports one metric so far
            displayMetricsLinesRepos(div_target, metrics, data, title, config);
        }else{
            displayMetricsLines(div_target, metrics, data, title, config);
        }
    }

    function displayMetricsCompany (ds, company, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsRepo (ds, repo, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsDomain (ds, domain, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsProject (ds, project, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        //var title = project;
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsPeople (ds, upeople_identifier, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        //var title = upeople_identifier;
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricRepos(metric, data, div_target,
            config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false)
            config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title,
                config, start, end);
    }

    function displayMetricsCountry (ds, country, metrics, data, div_id,
            config) {
        config = checkBasicConfig(config);
        var title = getMetricFriendlyName(ds, metrics);
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricCompanies(metric, data, div_target,
            config, start, end, order) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false)
            config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title,
                config, start, end, null, order);
    }

    function displayMetricDomains(metric, data, div_target,
            config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false)
            config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title,
                config, start, end);
    }

    function displayMetricProjects(metric, data, div_target,
            config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false)
            config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title,
                config, start, end);
    }

    function displayMetricSubReportStatic(metric, data, order,
            div_id, config) {
        config = checkBasicConfig(config);
        var title = '';
        if (config.title === undefined)
            title = metric;
        else
            title = config.title;
        var metric_data = [];
        var labels = [];

        var graph = 'bars';
        if (config.graph) graph = config.graph;

        $.each(order, function(i, name) {
            var label = Report.cleanLabel(name);
            labels.push(label);
            metric_data.push(data[name][metric]);
        });
        displayBasicChart(div_id, labels, metric_data, graph, title, config);
    }

    function displayEnvisionAll(div_id, relative, legend_show, summary_graph) {
        var projects_full_data = Report.getProjectsDataSources();
        var config = Report.getVizConfig();
        var options = Viz.getEnvisionOptions(div_id, projects_full_data, null,
                config.summary_hide, summary_graph);
        options.legend_show = legend_show;
        if (relative) {
            // TODO: Improve main metric selection. Report.getMainMetric()
            $.each(projects_full_data, function(project, data) {
                $.each(data, function(index, DS) {
                    main_metric = DS.getMainMetric();
                });
            });
            DataProcess.addRelativeValues(options.data, main_metric);
        }
        new envision.templates.Envision_Report(options);
    }
})();

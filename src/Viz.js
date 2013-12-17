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


if (Viz === undefined) var Viz = {};

(function() {
    var bitergiaColor = "#ffa500";

    Viz.displayTop = displayTop;
    Viz.displayTopBasic = displayTopBasic;
    Viz.displayTopCompany = displayTopCompany;
    Viz.displayTopGlobal = displayTopGlobal;
    Viz.displayBasicChart = displayBasicChart;
    Viz.displayMetricCompanies = displayMetricCompanies;
    Viz.displayMetricSubReportStatic = displayMetricSubReportStatic;
    Viz.displayMetricsCompany = displayMetricsCompany;
    Viz.displayMetricsPeople = displayMetricsPeople;
    Viz.displayMetricsRepo = displayMetricsRepo;
    Viz.displayMetricRepos = displayMetricRepos;
    Viz.displayMetricsCountry = displayMetricsCountry;
    Viz.displayMetricsEvol = displayMetricsEvol;
    Viz.displayBubbles = displayBubbles;
    Viz.displayDemographics = displayDemographics;
    Viz.displayEnvisionAll = displayEnvisionAll;
    Viz.displayTimeToFix = displayTimeToFix;
    Viz.displayTimeToAttention = displayTimeToAttention;
    Viz.displayMetricSubReportLines = displayMetricSubReportLines;
    Viz.displayRadarActivity = displayRadarActivity;
    Viz.displayRadarCommunity = displayRadarCommunity;
    Viz.displayTreeMap = displayTreeMap;
    Viz.getEnvisionOptions = getEnvisionOptions;
    Viz.checkBasicConfig = checkBasicConfig;

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

    function displayTopMetricTable(history, metric_id, doer, limit, people_links, title) {
        var table = '<table class="table table-striped"><tbody>';
        table += "<tr><th colspan=2>" + title + "</th><th>" + metric_id + "</th></tr>";
        if (people_links === undefined) people_links = true;
        if (history[metric_id] === undefined) return;
        if (!(history[metric_id] instanceof Array)) {
            history[metric_id] = [history[metric_id]];
            history[doer] = [history[doer]];
        }
        for (var i = 0; i < history[metric_id].length; i++) {
            if (limit && limit <= i) break;
            var metric_value = history[metric_id][i];
            var doer_value = history[doer][i];
            var doer_id = null;
            if (history.id) doer_id = history.id[i];
            table += "<tr><td>#" + (i+1) + "</td><td>";
            if (doer_id && people_links)
                table += "<a href='people.html?id="+doer_id+"&name="+doer_value+"'>";
            table += DataProcess.hideEmail(doer_value);
            if (doer_id && people_links) table += "</a>";
            table += "</td><td>";
            table += metric_value + "</td></tr>";
        }
        table += "</tbody></table>";

        return table;
    }

    function displayTopMetric
    (div_id, project, metric, metric_period, history, graph, titles, limit, people_links) {
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

    function showHelp(div_id, metrics) {
        var all_metrics = Report.getAllMetrics();
        var help ='<a href="#" class="help"';
        var content = "";
        var addContent = function (id, value) {
            if (metrics[i] === id) {
                content += "<strong>"+value.name +"</strong>: "+ value.desc + "<br>";
                return false;
            }
        };
        for (var i=0; i<metrics.length; i++) {
            $.each (all_metrics, addContent);
        }
        help += 'data-content="'+content+'" data-html="true">'; 
        help += '<img src="qm_15.png"></a>';
        $('#'+div_id).before(help);
    }

    function displayMetricsLines(div_id, metrics, history, title, config) {
        if (!(config && config.help === false)) showHelp(div_id, metrics);

        var lines_data = [];
        $.each(metrics, function(id, metric) {
            if (!history[metric]) return;
            if (config.frame_time) history = DataProcess.frameTime(history, metrics);
            var mdata = [[],[]];
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

    function displayMetricSubReportLines(div_id, metric, items, title, 
            config, start, end) {
        var lines_data = [];
        var history = {};

        $.each(items, function(item, data) {
            if (data === undefined) return false;
            if (data[metric] === undefined) return false;

            if (start) data = DataProcess.filterDates(start, end, data);

            var cdata = [[], []];
            for (var i=0; i<data.id.length; i++ ) {
                cdata[i] = [data.id[i], data[metric][i]];
            }

            item = Report.cleanLabel(item);
            lines_data.push({label:item, data:cdata});
            history = data;
        });

        if (lines_data.length === 0) return;

        displayDSLines(div_id, history, lines_data, title, config);
    }

    // Lines from the same Data Source
    // TODO: Probably we should also fill history
    function displayDSLines(div_id, history, lines_data, title, config_metric) {
        var container = document.getElementById(div_id);
        var legend_div = null;
        if (config_metric && config_metric.legend && config_metric.legend.container)
            legend_div = $('#'+config_metric.legend.container);

        var config = {
            title : title,
            legend: {
              show: false,
              container: legend_div
            },
            xaxis : {
                minorTickFreq : 4,
                tickFormatter : function(x) {
                    var index = null;
                    for ( var i = 0; i < history.id.length; i++) {
                        if (parseInt(x, null)===history.id[i]) {
                            index = i; break;}
                    }
                    return history.date[index];
                }
            },
            yaxis : {
                minorTickFreq : 1000,
                tickFormatter : function(y) {
                    return parseInt(y, 10) + "";
                }
            },
            grid : {
                show : false
            },
            mouse : {
                container: legend_div,
                track : true,
                trackY : false,
                trackFormatter : function(o) {
                    var label = history.date[parseInt(o.index, 10)] + "<br>";

                    for (var i=0; i<lines_data.length; i++) {
                        if (lines_data.length > 1)
                            label += lines_data[i].label +":";
                        label += lines_data[i].data[o.index][1]+"<br>";
                    }
                    return label;
                }
            }
        };

        if (config_metric) {
            if (!config_metric.show_title) config.title = '';
            if (config_metric.show_legend) config.legend.show = true;
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
        }
        graph = Flotr.draw(container, lines_data, config);
    }

    function displayBasicChart
        (divid, labels, data, graph, title, config_metric, rotate, fixColor) {

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
            title : title,
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
        }
        if (graph === "pie") {
            config.pie = {show : true};
            config.mouse.position = 'ne';
        }


        graph = Flotr.draw(container, chart_data, config);
    }

    // The two metrics should be from the same data source
    function displayBubbles(divid, metric1, metric2, radius) {

        var container = document.getElementById(divid);

        var DS = Report.getMetricDS(metric1)[0];
        var DS1 = Report.getMetricDS(metric2)[0];

        var bdata = [];

        if (DS != DS1) {
            alert("Metrics for bubbles have different data sources");
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

    function displayDemographics(divid, ds, file, period) {
        if (!file) {
            var data = ds.getDemographicsData();
            displayDemographicsChart(divid, ds, data, period);
        } else {
            $.when($.getJSON(file)).done(function(history) {
                displayDemographicsChart(divid, ds, history, period);
            }).fail(function() {
                alert("Can't load JSON file: " + file);
            });
        }
    }

    function displayDemographicsChart(divid, ds, data, period_year) {
        if (!data) return;
        if (!period_year) period_year = 0.25;
        else period = 365*period_year;

        // var data = ds.getDemographicsData();
        var period_data = [];
        var labels = [], i;
        var config = {show_legend:false};

        for (i = 0; i < data.persons.age.length; i++) {
            var age = data.persons.age[i];
            var index = parseInt(age / period, 10);
            if (!period_data[index])
                period_data[index] = 0;
            period_data[index] += 1;
        }

        for (i = 0; i < period_data.length; i++) {
            var label_months = "" + parseInt(i * (period/30), 10) +" months";
            labels[i] = label_months;
        }

        if (data)
            displayBasicChart(divid, labels, period_data,
                    "bars", "", config, true, bitergiaColor);
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
                    max = parseInt(max * (1+border),null);
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
                var hours = parseFloat((parseInt(data[i],null)/24).toFixed(2),null);
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

    function displayTop(div, ds, all, show_metric, period, graph, titles, limit, people_links) {
        var basic_metrics = ds.getMetrics();
        var project = ds.getProject();

        if (all === undefined) all = true;
        var history = ds.getGlobalTopData();
        $.each(history, function(key, value) {
            // ex: commits.all
            var data = key.split(".");
            var top_metric = data[0];
            if (show_metric && show_metric !== top_metric) return true;
            var top_period = data[1];
            for (var id in basic_metrics) {
                var metric = basic_metrics[id];
                if (metric.column == top_metric){
                    //continue with the loop if the period is not the one
                    if (period && period !== top_period) return true;
                    displayTopMetric(div, project, metric, 
                            top_period, history[key], graph, titles, limit, people_links);
                    if (!all) return false;
                    break;
                }
            }
        });
    }

    // Each file have just the doer and the do
    // {"authors":["Mark McLoughlin" ... ,"commits":[265 ...
    function displayTopBasic(div, ds, metric_do, metric_doer, graph, titles) {
        var top_file = ds.getTopDataFile();
        $.getJSON(top_file, function(history) {
            var table = displayTopMetricTable(history, metric_do, metric_doer);
            if (table === undefined) return;
            $('#'+div).append(table);
        });
    }

    function displayTopCompany(company, div, ds, metric_id, period, titles) {
        var project = ds.getProject();
        var metric = ds.getMetrics()[metric_id];
        var graph = null;
        var file_top = ds.getDataDir() + "/"+ company +"-" + ds.getName()+"-top-";
        if (DS.getName() === "scm") file_top += "authors";
        if (DS.getName() === "its") file_top += "closers";
        if (DS.getName() === "mls") file_top += "senders";
        file_top += ".json";
        $.getJSON(file_top, function(data) {
            if (data === undefined) return;
            displayTopMetric(div, project, metric, period, data, graph, titles);
        });
    }

    function displayTopGlobal(div, data_source, metric_id, period, titles) {
        var project = data_source.getProject();
        var metric = data_source.getMetrics()[metric_id];
        var graph = null;
        if (!data_source.getGlobalTopData()[metric_id]) return;
        data = data_source.getGlobalTopData()[metric_id][period];
        displayTopMetric(div, project, metric, period, data, graph, titles);
    }
    
    // D3
    function displayTreeMap(divid, data_file) {
        $.getJSON(data_file, function(root) {
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

            var node = div.datum(root).selectAll(".node")
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

        var basic_metrics, main_metric="", summary_data = [[],[]];

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

    function displayMetricsEvol(metrics, data, div_target, config) {
        config = checkBasicConfig(config);
        var title = metrics.join(",");
        if (!config.show_title) title = '';
        displayMetricsLines(div_target, metrics, data, title, config);
    }

    function displayMetricsCompany (company, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = company;
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsRepo (repo, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = repo;
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricsPeople (upeople_identifier, metrics, data, div_id, config) {
        config = checkBasicConfig(config);
        var title = upeople_identifier;
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricRepos(metric, data, div_target, 
            config, start, end) {
        config = checkBasicConfig(config);
        config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title, 
                config, start, end);
    }

    function displayMetricsCountry (country, metrics, data, div_id, 
            config) {
        config = checkBasicConfig(config);
        var title = country;
        displayMetricsLines(div_id, metrics, data, title, config);
    }

    function displayMetricCompanies(metric, data, div_target, 
            config, start, end) {
        config = checkBasicConfig(config);
        if (config.show_legend !== false)
            config.show_legend = true;
        var title = metric;
        displayMetricSubReportLines(div_target, metric, data, title, 
                config, start, end);
    }

    function displayMetricSubReportStatic(metric, data,
            div_id, config) {
        config = checkBasicConfig(config);
        var title = metric;
        var metric_data = [];
        var labels = [];

        var graph = 'bars';
        if (config.graph) graph = config.graph;

        $.each(data, function(item, data) {
            var label = Report.cleanLabel(item);
            labels.push(label);
            metric_data.push(data[metric]);
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

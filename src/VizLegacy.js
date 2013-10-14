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
 * Legacy code for VizJS for compatibility purposes
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Viz = {};

(function() {

var gridster_debug = false;

Viz.displayGridMetric = displayGridMetric;
Viz.displayGridMetricSelector = displayGridMetricSelector;
Viz.displayGridMetricAll = displayGridMetricAll;
Viz.drawMetric = drawMetric;
Viz.displayBasicHTML = displayBasicHTML;
Viz.displayBasicMetricHTML = displayBasicMetricHTML;
Viz.displayBasicLinesFile = displayBasicLinesFile;
Viz.displayBasicLines = displayBasicLines;

function displayBasicLinesFile(div_id, json_file, column, labels, title, projects) {
    $.getJSON(json_file, null, function(history) {
        displayBasicLines(div_id, history, column, labels, title, projects);
    });
}

// Lines from different Data Sources
function displayBasicLines(div_id, history, column, labels, title, projects) {
    var lines_data = [];
    var data = [];
    var full_history_id = [], dates = [];
    container = document.getElementById(div_id);
    
    if (history instanceof Array) data = history;
    else data = [history];
            
    $.each(data, function(i, serie) {
        if (serie.id && serie.id.length > full_history_id.length) {
            full_history_id = serie.id;
            dates = serie.date;                
        }
    });
    
    for ( var j = 0; j < data.length; j++) {
        lines_data[j] = [];
        if (data[j][column] === undefined) continue;
        for ( var i = 0; i < data[j][column].length; i++) {
            lines_data[j][i] = [ data[j].id[i], parseInt(data[j][column][i], 10) ];
        }
        // TODO: projects should be included in data not in a different array
        if (projects)
            lines_data[j] = {label:projects[j], 
                data:DataProcess.fillHistoryLines(full_history_id, lines_data[j])};
        else
            lines_data[j] = {data:DataProcess.fillHistoryLines(full_history_id, lines_data[j])};
    }
    
    // TODO: Hack to have lines_data visible in track/tickFormatter
    (function() {var x = lines_data;})();
    
    var config = {
        xaxis : {
            minorTickFreq : 4,
            tickFormatter : function(x) {
                var index = null;
                for ( var i = 0; i < full_history_id.length; i++) {
                    if (parseInt(x, null)===full_history_id[i]) {
                        index = i; break;}
                }
                return dates[index];
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
            track : true,
            trackY : false,
            trackFormatter : function(o) {
                var label = dates[parseInt(o.index, 10)] + "<br>";
    
                for (var i=0; i<lines_data.length; i++) {
                    if (lines_data.length > 1)
                        label += lines_data[i].label +":";
                    label += lines_data[i].data[o.index][1]+"<br>";
                }
                return label;
            }
        }
    };
    
    config.title = title;
    
    if (!labels || labels === 0) {
        config.xaxis.showLabels = false;
        config.yaxis.showLabels = false;
    }
    if (projects && projects.length === 1) config.legend = {show:false};
        
    graph = Flotr.draw(container, lines_data, config);
}

function drawMetric(metric_id, divid) {
    var config_metric = {};
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    var drawn = false;
    
    $.each(Report.getDataSources(), function(index, DS) {
        if (drawn) return false;
        var list_metrics = DS.getMetrics();
        $.each(list_metrics, function(metric, value) {
            if (value.column === metric_id) {
                DS.displayBasicMetricHTML(value.column, divid,
                        config_metric);
                drawn = true;
                return false;
            }
        });
    });
}

function displayBasicHTML(data, div_target, title, basic_metrics, hide,
        config, projs) {
    config = checkBasicConfig(config);
    //var new_div = '<div class="info-pill">';
    var new_div = '<h4>' + title + '</h4>';
    // new_div += '</div>';
    $("#" + div_target).append(new_div);
    for ( var id in basic_metrics) {
        var metric = basic_metrics[id];
        if (data[0][metric.divid] === undefined) continue;
        if ($.inArray(metric.divid, Report.getVizConfig()[hide]) > -1)
            continue;
        displayBasicMetricHTML(metric, data, div_target, config, projs);
    }
}

function displayBasicMetricHTML(metric, data, div_target, config, projs) {
    config = checkBasicConfig(config);
    var title = metric.name;
    if (!config.show_title)
        title = '';
    
    //var new_div = '<div class="info-pill">';
    //$("#" + div_target).append(new_div);
    new_div = '<div id="flotr2_' + metric.divid
            + '" class="m0-box-div">';
    new_div += '<h4>' + metric.name + '</h4>';
    if (config.realtime) {            
        new_div += '<div class="basic-metric-html" id="' + metric.divid;
        new_div += "_" + div_target;
    }
    else
        new_div += '<div class="basic-metric-html" id="' + metric.divid;
    new_div += '"></div>';
    if (config.show_desc === true)
        new_div += '<p>' + metric.desc + '</p>';
    new_div += '</div>';
    $("#" + div_target).append(new_div);
    if (config.realtime)
        displayBasicLinesFile(metric.divid+"_"+div_target, config.json_ds, 
                metric.column, config.show_labels, title, projs);
    else
        // displayBasicLines(metric.divid, data, metric.column,
        // TODO: temporal hack for ns metric name
        displayBasicLines(metric.divid, data, metric.divid,
                config.show_labels, title, projs);
}


Viz.displayEvoSummary = function(div_id, relative, legend_show, summary_graph) {
    Viz.displayEnvisionAll(div_id, relative, legend_show, summary_graph);
};

// Working fixing gridster issue: redmine issue 991
Viz.gridster_debug = gridster_debug;

function displayGridMetric(metric_id, config) {
    var gridster = Report.getGridster();
    var metric = Report.getAllMetrics()[metric_id];
    var size_x = 1, size_y = 1, col = 2, row = 1;
    var silent = true;
    
    if (config) {
        size_x = config.size_x;
        size_y = config.size_y;
        col = config.col;
        row = config.row;
    }
    
    var divid = metric.divid + "_grid";
    if ($("#" + metric_id + "_check").is(':checked')) {
        if ($("#" + divid).length === 0) {
            gridster.add_widget("<div id='" + divid + "'></div>", size_x,
                    size_y, col, row);
            // gridster.add_widget( "<div id='"+divid+"'></div>", size_x,
            // size_y);
            drawMetric(metric_id, divid);
        }
    } else {
        if ($("#" + divid).length > 0) {
            if (Viz.gridster_debug)
                silent = false;
            gridster.remove_widget($("#" + divid), silent);
        }
    }
}

function displayGridMetricAll(state) {
    var columns = 3;
    var form = document.getElementById('form_metric_selector');
    var config = {
        size_x : 1,
        size_y : 1,
        col : 2,
        row : 0
    };
    for ( var i = 0; i < form.elements.length; i++) {
        if (form.elements[i].type == "checkbox") {
            form.elements[i].checked = state;
            if (i % columns === 0) {
                config.row++;
                config.col = 2;
            }
            displayGridMetric(form.elements[i].value, config);
            config.col++;
        }
    }
}

function displayGridMetricDefault() {
}

function displayGridMetricSelector(div_id) {
    var metrics = {};
    $.each(Report.getDataSources(), function(i, DS) {
        if (DS.getData().length === 0) return;
        metrics = $.extend(metrics, DS.getMetrics());
    });
    
    var html = "Metrics Selector:";
    html += "<form id='form_metric_selector'>";
    
    $.each(metrics, function(metric_id, value) {
        html += '<input type=checkbox name="check_list" value="'
                + metric_id + '" ';
        html += 'onClick="';
        html += 'Viz.displayGridMetric(\'' + metric_id + '\');';
        html += '" ';
        html += 'id="' + metric_id + '_check" ';
        // if ($.inArray(l, user_lists)>-1) html += 'checked ';
        html += '>';
        html += metric_id;
        html += '<br>';
    });
    html += '<input type=button value="All" ';
    html += 'onClick="Viz.displayGridMetricAll(' + true + ')">';
    html += '<input type=button value="None" ';
    html += 'onClick="Viz.displayGridMetricAll(' + false + ')">';
    // html += '<input type=button value="Default" ';
    // html += 'onClick="Viz.displayGridMetricDefault()">';
    html += "</form>";
    $("#" + div_id).html(html);
}

})();
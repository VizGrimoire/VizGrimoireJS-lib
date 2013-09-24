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
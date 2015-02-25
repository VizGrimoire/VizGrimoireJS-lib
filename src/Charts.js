/*
 * Copyright (C) 2015 Bitergia
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
 * This file is a part of the VizGrimoireJS-lib package
 *
 * Authors:
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 *
 */

var Charts = {};

(function(){
    Charts.plotLinesChart = plotLinesChart;

    /**
    * Main function who calls submethods and plotFlotr2LinesChart
    * @constructor
    * @param {string} divid - Id of the div
    * @param {string[]} lines_names - Array of strings with friendly unit names
    * @param {object {}} raw_data - Object with unixtime, strdate and the lines_data[integer[]]
    */
    function plotLinesChart(div_id, line_names, raw_data){
        var flt_data = buildFlotrData(line_names, raw_data);
        var config = getChartConfig(flt_data, raw_data.strdate);
        if (raw_data.max){
            config.yaxis.max = raw_data.max;
        }
        // we force the legend when several lines are plotted
        if (flt_data.length > 1) config.legend.show = true;
        config.subtitle = composeTitle(line_names);
        flt_data = decorateLines(flt_data);
        plotFlotr2LinesChart(div_id, flt_data, config);
    }

    /**
    * Returns array with data in the way Flotr2 expects it to be plotted
    * @constructor
    * @param {string[]} lines_names - Array of strings with friendly unit names
    * @param {integer[]} raw_data - Array of arrays with [unixtime, value]
    */
    function buildFlotrData(line_names, raw_data){
        var aux = [];
        $.each(raw_data.lines_data, function(id,array){ //FIXME awful var name!!!!!!
            var line = [];
            $.each(array, function(subid, value){
                line[line.length] = [raw_data.unixtime[subid], value];
            });
            var aux2 = {};
            aux2.data = line;
            aux2.label = line_names[id];
            aux[aux.length] = aux2;
        });
        return aux;
    }

    /**
    * Decorates the last value (on the right) of the timeseries with a point
    * if the line if single, dropping the last value if not. Returns the
    * modified object
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    */
    function decorateLines(flotr2_data){
        if (Utils.isReleasePage() === false){
            if(flotr2_data.length === 1) {
                flotr2_data = lastLineValueToPoint(flotr2_data);
                flotr2_data = addEmptyValue(flotr2_data);
            }
            else if(flotr2_data.length > 1){
                flotr2_data = dropLastLineValue(flotr2_data);
            }
        }
        return flotr2_data;
    }

    /*
    * Display secondary dotted line where all the points except the last one
    * are invisible. Returns the modified object
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    */
    function lastLineValueToPoint(flotr2_data) {
        if (flotr2_data.length !== 1) return flotr2_data;
        var last = flotr2_data[0].data.length;

        // builds an empty dot line with only one value
        var dots = [];
        var utime = 0;
        for (var i=0; i<last-1; i++) {
            //utime = parseInt(history.unixtime[i],10);
            utime = parseInt(flotr2_data[0].data[i][0],10);
            dots.push([utime,undefined]);
        }
        utime = parseInt(flotr2_data[0].data[last-1][0],10);
        dots.push([utime, flotr2_data[0].data[last-1][1]]);
        var dot_graph = {'data':dots};
        dot_graph.points = {show : true, radius:3, lineWidth: 1,
                            fillColor: null, shadowSize : 0};
        flotr2_data.push(dot_graph);

        // Remove last data line because covered by dot graph
        flotr2_data[0].data[last-1][1] = undefined; //FIXME use dropLastLine instead
        // Copy the label for displaying the legend
        flotr2_data[1].label= flotr2_data[0].label;

        return flotr2_data;
    }

    /*
    * Compose title based on unit_names array
    * @param {string[]} unit_names - Array of strings
    */
    function composeTitle(unit_names){
        return unit_names.join(' & ');
    }

    /*
    * Append undefined value to have more space on the right margin of the
    * chart. Returns the modified object
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    */
    function addEmptyValue(flotr2_data){
        // add empty value at the end to avoid drawing an incomplete point
        var second = parseInt(flotr2_data[0].data[1][0], 10);
        var first = parseInt(flotr2_data[0].data[0][0], 10);
        var step = second - first;
        var narrays = flotr2_data.length;
        var last_date = 0;
        for (var i = 0; i < narrays; i++) {
            var last = flotr2_data[i].data.length - 1;
            last_date = parseInt(flotr2_data[i].data[last][0], 10);
            flotr2_data[i].data.push([last_date + step, undefined]);
        }
        return flotr2_data;
    }

    /*
    * Remove last value of lines contained in object. Returns the modified
    * object.
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    */
    function dropLastLineValue(flotr2_data){
        if (flotr2_data.length === 0) return flotr2_data;
        if (flotr2_data.length>1) {
            for (var j=0; j<flotr2_data.length; j++) {
                var last = flotr2_data[j].data.length - 1;
                flotr2_data[j].data[last][1] = undefined;
            }
        }
        return flotr2_data;
    }

    /**
    * Calls flotr2 draw function with flotr2_data and the object config
    * @constructor. Returns nothing.
    * @param {string} divid - Id of the div
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    * @param {} config - Flotr2 configuration object
    */
    function plotFlotr2LinesChart(div_id, flotr2_data, config){
        if (flotr2_data.length === 0) return;
        var container = document.getElementById(div_id);

        function drawGraph(opts) {
            // Clone the options, so the 'options' variable always keeps intact.
            var o = Flotr._.extend(Flotr._.clone(config), opts || {});
            // Return a new graph.
            //return Flotr.draw(container, lines_data.data, o);
            return Flotr.draw(container, flotr2_data, o);
        }
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
            var new_lines_data_object = JSON.parse(JSON.stringify(flotr2_data));
            var y_max_value = getMax(new_lines_data_object, area.x1, area.x2);

            zoom_options.yaxis.max = y_max_value + y_max_value * 0.2; //we do Y axis a bit higher than max

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
    * Returns flotr2 object configuration for Line Chart.
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    * @param {string[]} strdates - Array of string dates used by the value box
    * @param {string} title - (Sub)Title of the chart
    */
    function getChartConfig(flotr2_data, strdates, title){
        // simply returns this basic configuration for a lines chart
        var legend_div = null;
        var config = {
            subtitle : title,
            legend: {
              show: false,
              container: legend_div //FIXME
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
                margin: 20,
                position: 'n',
                trackFormatter : function(o) {
                    //var label = history.date[parseInt(o.index, 10)];
                    var label = strdates[parseInt(o.index, 10)];
                    if (label === undefined) label = "";
                    else label += "<br>";
                    for (var i=0; i<flotr2_data.length; i++) {
                        var value = flotr2_data[i].data[o.index][1];
                        if (value === undefined) continue;
                        if (flotr2_data.length > 1) {
                            if (flotr2_data[i].label !== undefined) {
                                value_name = flotr2_data[i].label;
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
        return config;
    }

    /**
    * Returns decorated string decorated month names and chart subtitle. Used
    * when user zooms in/out
    * @param {string} former_title - Former title of the chart
    * @param {integer} starting_utime - Starting unixtime
    * @param {integer} end_utime - Finish unixtime
    */
    function composeRangeText(former_title, starting_utime, end_utime){
        var months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
        // watchout! javascript uses miliseconds
        var date = new Date(parseInt(starting_utime,10)*1000);
        var starting_date = months[date.getMonth()] + ' ' + date.getFullYear();
        date = new Date(parseInt(end_utime,10)*1000);
        var end_date = months[date.getMonth()] + ' ' + date.getFullYear();
        return former_title + ' ( ' + starting_date + ' - ' + end_date + ' )';
    }

    /*
    * Returns integer with maximum value for all the data inside the
    * flotr2_data object between the dates included.
    * @param {} flotr2_data - Array of objects with at least parameters 'data'
    * and 'label'
    * @param {integer} from_unixstamp - Starting unixtime
    * @param {integer} to_unixstamp - Finish unixtime
    */
    function getMax(flotr2_data, from_unixstamp, to_unixstamp){
        // get max value of multiple array object
        from_unixstamp = Math.round(from_unixstamp);
        to_unixstamp = Math.round(to_unixstamp);

        // first, we have to filter the arrays
        var narrays = flotr2_data.length;
        var aux_array = [];
        for (var i = 0; i < narrays; i++) {
            //for (var z = flotr2_data[i].data.length - 1; z > 0 ; z--) {
            for (var z = flotr2_data[i].length - 1; z > 0 ; z--) {
                var aux_value = flotr2_data[i][z][0];
                var cond = aux_value < from_unixstamp || aux_value > to_unixstamp;
                //if(aux_value < from_unixstamp || aux_value > to_unixstamp){
                if(cond){
                    flotr2_data[i].splice(z,1);
                    //flotr2_data[i].data.pop([z]);
                }
            }
        }

        var res = [];
        for (i = 0; i < narrays; i++) {
            aux_array = flotr2_data[i].data;
            aux_array = sortBiArray(aux_array);
            res.push(aux_array[aux_array.length-1][1]);
        }
        res.sort(function(a,b){return a-b;});
        return res[res.length-1];
    }

    /*
    * Returns sorted array
    * @param {integer[]} bi_array - Array of integer
    */
    function sortBiArray(bi_array){
        bi_array.sort(function(a, b) {
            return (a[1] > b[1] || b[1] === undefined)?1:-1;
        });
        return bi_array;
    }
})();

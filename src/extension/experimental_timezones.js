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
 *
 */

var TimeZones = {};

(function() {

    var scm_tz, mls_tz, legend_shown = false;

    var drawTimezones = function (div,  ds, metric) {
        $("#"+div).html(null);

        var data_tz, data;
        if (ds === "scm") {
            data_tz = scm_tz;
        }
        else if (ds === "mls") {
            data_tz = mls_tz;
        }
        else {
            $("#"+div).html(ds + " not supported in time zones analysis.");
            return;
        }
        if (metric === undefined) {
            $.each(data_tz, function(key, values) {
                if (key != 'tz') {
                    metric = key;
                    return false;
                }
            });
        }
        labels = data_tz.tz;
        data = data_tz[metric];

        serie = [];
        $.each(data_tz.tz, function(i, value) {
            serie.push({t:value, v:data_tz[metric][i]});
        });

        var getTotal = function(serie) {
            var total = 0;
            for (var i = 0; i < serie.length; i++){
                total = total + serie[i].v;
            }
            return total;
        };

        var getValue = function (serie, tz) {
            for (var i = 0; i < serie.length; i++){
                if (serie[i].t == tz){
                    return serie[i].v;
                }
            }
        };

        var styleFunction = function(feature, resolution) {
            var opacity_add = 1.5; // 30% more opacity
            var name = feature.get('name'); //e.g. GMT -08:30
            var match = name.match(/([\-+]\d{2}):(\d{2})$/);

            if (!match) return;

            var hours = parseInt(match[1], 10);
            var minutes = parseInt(match[2], 10);
            var offset = 60 * hours + minutes;

            var val = getValue(serie, hours);

            //console.log(hours);
            var opacity = (val/getTotal(serie)) * opacity_add;
            return [
                new ol.style.Style ({
                fill: new ol.style.Fill({
                    //color: [0xff, 0xff, 0x33, opacity]
                    color: [255, 69, 0, opacity]
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff'
                })
            })
          ];
        };

        var vector = new ol.layer.Vector({
            source: new ol.source.KML({
                extractStyles: false,
                projection: 'EPSG:3857',
                url: 'data/timezones.kml'
            }),
            style: styleFunction
        });

        var raster = new ol.layer.Tile({
            source: new ol.source.Stamen({
                //layer: 'watercolor'
                layer: 'toner-lite'
            })
        });

        var map = new ol.Map({
            layers: [raster, vector],
            target: $("#"+div)[0],
            view: new ol.View({
                center: [0, 0],
                zoom: 1
            })
        });

    };

    function displayTimeZonesExperimental(div, ds, metric) {
        var data_tz, data, show_legend = false;
        if (ds === "scm") {
            data_tz = scm_tz;
        }
        else if (ds === "mls") {
            data_tz = mls_tz;
        }
        else {
            $("#"+div).html(ds + " not supported in time zones analysis.");
            return;
        }
        if (metric === undefined) {
            $.each(data_tz, function(key, values) {
                if (key != 'tz') {
                    metric = key;
                    return false;
                }
            });
        }
        labels = data_tz.tz;
        data = data_tz[metric];
        graph = "bars";
        title = "Time zones for " + metric;
        if (legend_shown === false) show_legend = true;
        config_metric = {legend : {container: "legend"}, show_legend: show_legend};
        if (show_legend) legend_shown = true;
        Viz.displayBasicChart(div, labels, data, graph, title, config_metric);
    }


    /* 1st parsing of HTML divs */
    TimeZones.displayTimeZonesExperimental = function() {
        var mark = "TimeZonesExperimental";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                var ds = $(this).data('data-source');
                if (ds === undefined) return;
                var metric = $(this).data('metric');
                var map = $(this).data('map');
                if (map !== undefined) {
                    drawTimezones(div.id, ds, metric);
                }
                else {displayTimeZonesExperimental(div.id, ds, metric);}
            });
        }
    };

    /* loader section */
    TimeZones.build = function() {
        loadTimeZonesData(TimeZones.displayTimeZonesExperimental);
    };

    function loadTimeZonesData (cb) {
        var scm_json = "data/json/scm-timezone.json";
        var mls_json = "data/json/mls-timezone.json";
        $.when($.getJSON(scm_json),$.getJSON(mls_json)
            ).done(function(scm_data, mls_data) {
                scm_tz = scm_data[0];
                mls_tz = mls_data[0];
                cb();
        }).fail(function() {
            alert("Can't time zones data. Review: " +
                    scm_json + " " + mls_json);
        });
    }
})();

Loader.data_ready(function() {
    TimeZones.build();
});

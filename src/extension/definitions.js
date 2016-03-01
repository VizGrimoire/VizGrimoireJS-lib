/*
 * Copyright (C) 2012-2015 Bitergia
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

var Glossary = {};

(function() {

    var metrics_data = {},
        menu_data = {};

    Glossary.widget = function(){
        var divs = $(".glossary"),
            ds_name;

        if (divs.length > 0){
            $.each(divs, function(id, div) {
                div.id = "glossary";
                //data_metrics[ds_name] = {};
                //loadGlossaryData(div, ds_name);
                loadGlossaryData(
                    function() {
                        displayGlossary(div.id);
                    });
            });
        }
    };

    function getAvailableSections(){
        var sections = [];
        $.each(menu_data, function(id, value) {
            //data_metrics[ds_name][d.column] = d;
            if (metrics_data.hasOwnProperty(id)){
                sections.push(id);
            }
        });
        return sections;
    }

    function addIconEvent(){
        $(document).ready(function() {
            $('.collapse').on('shown.bs.collapse', function(){
                $(this).parent().find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
            }).on('hidden.bs.collapse', function(){
                $(this).parent().find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
            });
        });
    }

    function displayGlossary(div_id){
        var sections = getAvailableSections();
        var html = '';
        $.each(sections, function(id, value){
            html += displayGlossaryFor(value);
        });
        $("#"+div_id).append(html);

        addIconEvent();
    }

    function displayGlossaryFor(ds_name) {
        var html = '';
        html += '<div class="col-md-6">';
        html += '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">';
        html += '<div class="panel panel-default">';
        html += '<div class="panel-heading" role="tab" id="heading' + ds_name + '">';
        html += '<h4 class="panel-title">';
        html += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapse' + ds_name + '">';
        html += '<span class="fa fa-plus"></span>';
        html += '&nbsp;&nbsp;' + metrics_data[ds_name].desc.name;
        html += '</a></h4></div>';
        html += '<div id="collapse' + ds_name + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + ds_name + '">';
        html += '<div class="panel-body">';
        html += '<p>' + metrics_data[ds_name].desc.desc + '</p>';
        html += '<table class="table">';
        for (var metric in metrics_data[ds_name]) {
            if (metric != "desc"){
                html += '<tr><td>' + metrics_data[ds_name][metric].name + '</td><td>' + metrics_data[ds_name][metric].desc + '</td></tr>';
            }
        }
        html += '</table>';
        html += '</div></div></div></div>';
        html += '</div>';
        return html;
    }

    function loadGlossaryData(cb){
        //suffix = ds_name.toLowerCase();
        var json_file = "data/metrics.json",
            menu_file = "config/menu-elements.json";
        $.when(
            $.getJSON(json_file, function(json_data) {
                metrics_data = json_data;
            }),
            $.getJSON(menu_file, function(json_data){
                menu_data = json_data.menu;
            })
        ).then(function (){
            cb();
        });
    }

    function loadGlossaryData2(div, ds_name) {
        var metrics;

        metrics = "data/metrics.json";

        $.when($.getJSON(metrics)).done(function(data, b_data) {
            $.each(data[ds_name], function(id, d) {
                data_metrics[ds_name][d.column] = d;
            });
            html = '<div class="panel-heading" role="tab" id="headingTable'+ds_name+'">';
            html +=     '<span class="collapsed" data-toggle="collapse" data-parent="#accordion"';
            html +=         'href="#collapseTable'+ds_name+'" aria-expanded="false" aria-controls="collapseTable'+ds_name+'">';
            html +=         "<h2><a>"+data_metrics[ds_name].desc.name+"</a></h2>"+data_metrics[ds_name].desc.desc+'</span></div>';
            html += '<div id="collapseTable'+ds_name+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTable'+ds_name+'">';
            html +=     '<div class="panel-body"  word-break: break-all; word-wrap: break-word; overflow: auto;"><hr>';
            /*for (var metric in data_metrics[ds_name]) {
                if (metric != "desc"){
                    html += "<h3>"+data_metrics[ds_name][metric]["name"]+"</h3>"+data_metrics[ds_name][metric]["desc"]+"\n";
                }
            }*/
            html += '<table class="table">';
            for (var metric in data_metrics[ds_name]) {
                if (metric != "desc"){
                    html += "<tr><td>"+data_metrics[ds_name][metric].name+"</td><td>"+data_metrics[ds_name][metric].desc+"</td></tr>";
                }
            }
            html += '</table>';
            html += "</div></div>";
            $("#"+div.id).append(html);
        }).fail(function() {
            console.log("Glossary widget disabled. Missing " + ds_name);
        });
    }
})();

Loader.data_ready(function() {
    Glossary.widget();
});

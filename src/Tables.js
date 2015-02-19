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
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */

String.prototype.supplant = function(o) {
  return this.replace(/{([^{}]*)}/g,function(a, b) {
    var r = o[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};

// GenericTable

// MessagesTable

// PeopleTable
var Table = {};

(function() {

    Table.displayTopTable = displayTopTable;

    /*
    * Displays table based on data and opts
    * @param {object()} div - html object where table will be appended
    * @param {object()} data - Contains all the top metrics
    * @param {object()} opts - options needed by the table
    */
    function displayTopTable(div, data, opts){
        // div, data, metric, class_name, links_enabled, limit, period, ds_name
        var first = true,
            gen_tabs = true,
            tabs = '',
            tables = '';
        if (opts.period !== 'all'){
             gen_tabs = false;
        }else{
            //FIXME gen_tabs should be checked before this point
            tabs += composeTopTabs(data, opts.metric, opts.class_name);
        }

        periods = getSortedPeriods(); //FIXME we should get this data from JSON
        tables += '<div class="tab-content">';

        var var_names = getTopVarsFromMetric(opts.metric, opts.ds_name);
        for (var k=0; k< periods.length; k++){
            html = "";
            var key = opts.metric + '.' + periods[k];
            if (data[key]){
                var data_period = periods[k];
                if (data_period === ""){
                    data_period = "all";
                }
                if (first === true){
                    html = " active in";
                    first = false;
                }
                var data_period_nows = data_period.replace(/\ /g, '');
                tables += '<div class="tab-pane fade'+ html  +'" id="' + opts.class_name + opts.metric + data_period_nows + '">';
                tables += '<table class="table table-striped">';

                unit = opts.desc_metrics[opts.ds_name + "_" + opts.metric].action;
                tables += '<thead><th>#</th><th>' +opts.metric.capitalize()+'</th>';
                if (unit !== undefined) tables += '<th>'+unit.capitalize()+'</th>';
                tables += '</thead><tbody>';
                tables += composeTopRowsPeople(data[key], opts.limit, opts.links_enabled, var_names);
                tables += '</tbody>';

                tables += "</table>";
                tables += "</div>";
            }
        }

        tables += '</div>';
        $("#"+div.id).append(tabs + tables);
        /*
        if (gen_tabs === true){
            script = "<script>$('#myTab a').click(function (e) {e.preventDefault();$(this).tab('show');});</script>";
            $("#"+div.id).append(script);
        }
        */
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

    function getSortedPeriods(){
        return ['last month','last year',''];
    }

    function composeTopTabs(data, metric, class_name){
        var first = true,
            tabs_html = '<ul id="myTab" class="nav nav-tabs">',
            periods = getSortedPeriods(); //FIXME we should get this data from JSON

        $.each(periods, function(id, p){
            //check data exists
            aux_obj = {'html': ''};
            if (p === ""){
                p = 'all';
                aux_obj.pretty_period = "Complete history";
            }else if(p === "last month"){
                aux_obj.pretty_period = "Last 30 days";
            }else if (p === "last year"){
                aux_obj.pretty_period = "Last 365 days";
            }
            aux_obj.myhref = class_name + metric + p.replace(/\ /g, '');

            if (first === true){
                aux_obj.html = ' class="active"';
                first = false;
            }

            var aux_html = '<li{html}><a href="#{myhref}" data-toogle="tab">{pretty_period}</a></li>';
            tabs_html += aux_html.supplant(aux_obj);
        });

        tabs_html += '</ul>';
        return(tabs_html);
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
 })();

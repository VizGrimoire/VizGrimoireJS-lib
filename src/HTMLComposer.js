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
 * This file is a part of the VizGrimoireJS package.
 * The aim of HTMLComposer is to provide functions where HTML is written in
 * order to maintain the rest of the code cleaner.
 *
 * Authors:
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */


var HTMLComposer = {};

(function() {
    HTMLComposer.personDSBlock = personDSBlock;
    HTMLComposer.filterDSBlock = filterDSBlock;
    HTMLComposer.repositorySummaryTable = repositorySummaryTable;
    HTMLComposer.personSummaryTable = personSummaryTable;
    HTMLComposer.personName = personName;
    HTMLComposer.itemName = itemName;

    function personDSBlock(ds_name, metric_name){
        /* Display block with PersonSummary and PersonMetrics divs.
         This block is used in the people.html page
         */
        var html = '<div class="col-md-12">';
        html += '<div class="well well-small">';
        html += '<div class="row">';
	html += '<div class="col-md-12">';
	html += '<p>' + title4DS(ds_name) + '</p>';
	html += '</div>';
	html += '<div class="col-md-3">';
	html += '<div class="PersonSummary" data-data-source="'+ ds_name +'"></div>';
	html += '</div>';
	html += '<div class="col-md-9">';
	html += '<div class="PersonMetrics" data-data-source="'+ds_name+'"';
        html += 'data-metrics="'+metric_name+'" data-min="true"';
	//html += 'style="height: 140px;" data-frame-time="true"></div>';
        html += 'data-frame-time="true"></div>';
	html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;        
    }

/*    function repositoryDSBlock(ds_name, metric_names){
        return filterDSBlock(ds_name, 'repos', metric_names);
    }
    
    function companyDSBlock(ds_name, metric_names){
        return filterDSBlock(ds_name, 'companies', metric_names);
    }*/

    function filterDSBlock(ds_name, filter_name, metric_names){
        /* 
         Display block with FilterItemSummary and FilterItemMetricsEvol
         for a filter (repository, company, country), data source and 
         the metrics included in metric_names

         Used for div class RepositoryDSBlock
         */

        /*FilterItemTop was not included in this function. It is not working
         on the current dash so I disable it.*/
        
        var html = '<div class="col-md-12">';
        html += '<div class="row">';
        html += '<div class="col-md-3">';
        html += '<div class="well">';
        html += '<div class="FilterItemSummary" data-data-source="'+ ds_name +'" data-filter="'+ filter_name +'"></div>';
        html += '</div></div>';
        html += '<div class="col-md-9">';
        html += '<div class="well">';

        $.each(metric_names, function(id, metric){
            html += '<div class="row"><div class="col-md-12"></br></br></div></div>';
            html += '<div class="row">';
            html += '<div class="col-md-12">';
            html += '<div class="FilterItemMetricsEvol" data-data-source="'+ ds_name +'"';
            html += 'data-metrics="'+ metric +'" data-min="true"';
            html += 'data-filter="'+ filter_name +'" data-frame-time="true"></div>';
            html += '</div></div>';
        });

        html += '</div></div></div></div>';

        return html;
    }

    function repositorySummaryTable(ds, global_data, id_label){
        /*
         Compose the HTML shown in the repository.html for the table with
         total data for the repository
         
         Input:
         - global_data: object with global data for ds from static.json files
         - ds: data source object
         */
        /*var html = '<p class="subsection-title"">' + title4DS(ds.getName()) + '</p>';*/
        var html = "<table class='table-condensed table-hover'>";
        html += '<tr><td colspan="2"><p class="subsection-title">' + title4DS(ds.getName()) + '</p></td></tr>';
        var html_irow = '<tr><td>';
        var html_erow = '</td></tr>';
        $.each(global_data,function(id,value) {
            if (ds.getMetrics()[id]) {
                html += html_irow + ds.getMetrics()[id].name;
                if (id === 'first_date' || id === 'last_date'){
                    html += '</td><td class="numberInTD">' + value + html_erow;
                }
                else{
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow;
                }
            } else if (id_label[id]) { 
                html += html_irow + id_label[id]; 
                                if (id === 'first_date' || id === 'last_date'){
                    html += '</td><td class="numberInTD">' + value + html_erow;
                }
                else{
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow;
                }
            }
        });
        html += "</table>";
        return html;
    }

    function personSummaryTable(ds_name, history){
        /* Compose table with first activity, last activity and total units for
         a given data source.
         */        
        var html = "<table class='table-condensed table-hover'>";
        html += "<tr><td>";
        html += "First contribution: </br>";
        html += "&nbsp;&nbsp;" + history.first_date;
        html += "</td></tr><tr><td>";
        html += "Last contribution: </br>";
        html += "&nbsp;&nbsp;" + history.last_date;
        html += "</td></tr><tr><td>";
        if (ds_name == "scm") html += "Commits:</br>&nbsp;&nbsp;" + history.scm_commits;
        else if (ds_name == "its") html += "Closed:</br>&nbsp;&nbsp;" + history.its_closed;
        else if (ds_name == "mls") html += "Sent:</br>&nbsp;&nbsp;" + history.mls_sent;
        else if (ds_name == "irc") html += "Sent:</br>&nbsp;&nbsp;" + history.irc_sent;
        else if (ds_name == "scr") html += "Closed:</br>&nbsp;&nbsp;" + history.scr_closed;
        html += "</td></tr>";
        html += "</table>";

        return html;
    }

    function personName(name, email){
        var html = '<p class="section-title" style="margin-bottom:0px;"><i class="fa fa-user fa-lg"></i> &nbsp;&nbsp;';
        if (name.length > 0)
            html += name;
        else if (email.length > 0){
            /* we don't want to expose the mail address of people!*/
            if (email.indexOf('@') > 0)
                email = email.split('@')[0];
            html += email;
        }
        html += '</p>';

        return html;
    }

    function itemName(text, filter_name){
        /* Return html title name for filters like repository, company and domain */
        
        //FIXME: replace the public awful name for this
        var html = '<p class="section-title" style="margin-bottom:0px;">';
        if (filter_name === 'companies')
            html += '<i class="fa fa-building-o"></i> &nbsp;&nbsp;';
        html += text;
        html += '</p>';
        return html;
    }

    //
    // Below this point, private methods
    //

    function title4DS(ds_name){
        /* Returns title for section based on ds_name. It includes the
         correspondant font awesome icon for the data source
         */
        var title = '';
        if (ds_name === "scm")
            title = '<i class="fa fa-code"></i> Source Code Management';
        else if(ds_name === "scr")
            title = '<i class="fa fa-check"></i> Source Code Review';
        else if(ds_name === "its")
            title = '<i class="fa fa-ticket"></i> Issue tracking system';
        else if(ds_name === "mls")
            title = '<i class="fa fa-envelope-o"></i> Mailing Lists';
        else if(ds_name === "irc")
            title = '<i class="fa fa-comment-o"></i> IRC Channels';
        else if(ds_name === "mediawiki")
            title = '<i class="fa fa-pencil-square-o"></i> Wiki';
        else if(ds_name === "releases")
            title = '<i class="fa fa-umbrella"></i> Releases';
        return title;
    };


})();

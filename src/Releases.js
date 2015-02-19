/*
 * Copyright (C) 2014 Bitergia
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
 *   Luis Cañas Díaz <lcanas@bitergia.com>
 */

function Releases() {

    var self = this;

    /* These basic metrics are overwritten by the metrics.json file but they are needed
       for instance by the function viz.displayTop and viz.displaytopmetric.
       It the metric is present in basic_metrics, the key of the dict will be used from
       the div when using it.

    */

    this.basic_metrics = {
        "releases_modules" : {
            "name" : "Modules created",
            "desc" : "Number of modules created on the forge",
            "column": "modules"
        },
        "releases_authors":{
            "name" : "Module authors",
            "desc" : "Module authors",
            "column": "authors"
        },
        "releases_releases":{
            "name" : "Number of module releases",
            "desc" : "Number of module releases",
            "column": "releases"
        }
    };

    this.getMainMetric = function() {
        /*only for testing purposes*/
        return "releases_modules";
    };


    this.displayData = function(divid) {
        // FIXME this is a total fake function pasted here to avoid the crash. It seems useless
        var div_id = "#" + divid;

        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + ' .irc_info').hide();
            return;
        }

        var url = '';
        if (this.global_data.repositories === 1) {
            url = this.global_data.url;
        } else {
            url = Report.getProjectData().irc_url;
        }

        if (this.global_data.type)
            $(div_id + ' #irc_type').text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined)  {
            $(div_id + ' #irc_url').attr("href", url);
            $(div_id + ' #irc_name').text("IRC " + this.global_data.type);
        } else {
            $(div_id + ' #irc_url').attr("href", Report.getProjectData().irc_url);
            $(div_id + ' #irc_name').text(Report.getProjectData().irc_name);
            $(div_id + ' #irc_type').text(Report.getProjectData().irc_type);
        }

        var data = this.getGlobalData();

        $(div_id + ' #ircFirst').text(data.first_date);
        $(div_id + ' #ircLast').text(data.last_date);
        $(div_id + ' #ircSent').text(data.irc_sent);
        $(div_id + ' #ircRepositories').text(data.irc_repositories);
        if (data.repositories === 1)
            $(div_id + ' #ircRepositories').hide();
    };

    this.displayBubbles = function(divid, radius) {
        /* only for testing purposes */
        if (false)
            Viz.displayBubbles(divid, "releases_modules", "releases_releases", radius);
    };

    this.getSummaryLabels = function () {
        /* This summary functions should be removed. We can use the metrics.json file instead
           It is used to display the summary table on repository.html*/
        var id_label = {
            first_date:'Start',
            last_date:'End',
            modules:'Modules created',
            releases:'Module releases created',
            authors:'Persons creating/updating modules'
            };
        return id_label;
    };



    this.getTitle = function() {return "Releases";};
}
Releases.prototype = new DataSource("releases");

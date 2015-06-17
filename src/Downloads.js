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

function Downloads() {

    var self = this;

    /* These basic metrics are overwritten by the metrics.json file but they are needed
       for instance by the function viz.displayTop and viz.displaytopmetric.
       It the metric is present in basic_metrics, the key of the dict will be used from
       the div when using it.

    */
    this.basic_metrics = {
        'downloads_downloads':{
            'name' : "Total downloads",
            'column' : "downloads" //only for testing purposes
        },
        'downloads_packages' : {
            'divid' : "",
            'column' : "packages",
            'name' : "Packages downloaded",
            'desc' : "",
            'action' : "downloads"
        },
        'downloads_ips' : {
            'divid' : "",
            'column' : "ips",
            'name' : "IP addresses",
            'desc' : "",
            'action' : "downloads"
        },
        'downloads_bounces' : {
            'divid' : "",
            'column' : "bounces",
            'name' : "Bounces",
            'desc' : ""
        },
        'downloads_uvisitors' : {
            'divid' : "",
            'column' : "uvisitors",
            'name' : "Unique visitors",
            'desc' : ""
        },
        'downloads_visits' : {
            'divid' : "",
            'column' : "visits",
            'name' : "Visits",
            'desc' : ""
        },
        'downloads_pages' : {
            'divid' : "",
            'column' : "page",
            'name' : "Pages",
            'desc' : "",
            'action': "visits"
        },
        'downloads_countries' : {
            'divid' : "",
            'column' : "country",
            'name' : "Countries",
            'desc' : "",
            'action': "visits"
        }
    };

    this.getMainMetric = function() {
        /*only for testing purposes*/
        return "downloads_downloads";
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
            Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius);
    };


    this.getTitle = function() {return "Downloads";};
}
Downloads.prototype = new DataSource("downloads");

/* 
 * Copyright (C) 2013 Bitergia
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

function IRC() {

    var self = this;

    this.basic_metrics = {
        'irc_sent' : {
            'divid' : "irc_sent",
            'column' : "sent",
            'name' : "Sent",
            'desc' : "Messages sent"
        },
        'irc_senders' : {
            'divid' : "irc_senders",
            'column' : "senders",
            'name' : "Senders",
            'desc' : "Messages senders",
            'action' : 'sent'
        },
        'irc_repositories' : {
            'divid' : "irc_repositories",
            'column' : "repositories",
            'name' : "Repositories",
            'desc' : "Number of active repositories",
        }
    };

    this.getMainMetric = function() {
        return "irc_sent";
    };

    this.getSummaryLabels = function () {
        var id_label = {
                first_date : "Start",
                last_date : "End"
        };
        return id_label;
    };

    this.getLabelForRepository = function(){
        return 'channel';
    };
    this.getLabelForRepositories = function(){
        return 'channels';
    };

    this.displayData = function(divid) {
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
        if (false)    
            Viz.displayBubbles(divid, "irc_sent", "irc_senders", radius);
    };

    this.getTitle = function() {return "IRC Messages";};    
}
IRC.prototype = new DataSource("irc");

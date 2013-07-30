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
            'desc' : "Messages senders"
        }
    };
        
    this.getMainMetric = function() {
        return "irc_sent";
    };
    
    // TODO: Move to generic DataSource?
    this.displaySummary = function(report, divid, item, ds) {
        if (!item) item = "";
        var label = item;
        if (item.lastIndexOf("http") === 0) {
            var aux = item.split("_");
            label = aux.pop();
            if (label === '') label = aux.pop();
        }
        var html = "<h4>" + label + "</h4>";
        var global_data = null;
        if (report === "companies")
            global_data = ds.getCompaniesGlobalData()[item];
        if (report === "countries")
            global_data = ds.getCountriesGlobalData()[item];
        else if (report === "repositories")
            global_data = ds.getReposGlobalData()[item];
        else global_data = ds.getGlobalData();        
        if (!global_data) return;

        var id_label = {
                first_date : "Start",
                last_date : "End"
        };

        var self = this;
        $.each(global_data,function(id,value) {
            if (self.getMetrics()[id])
                html += self.getMetrics()[id].name + ": " + value + "<br>";
            else if (id_label[id]) 
                html += id_label[id] + ": " + value + "<br>";
            else
                if (report) html += id + ": " + value + "<br>";
        });
        $("#"+divid).append(html);
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
            url = Report.getProjectData().mls_url;
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

        var company = this.getCompanyQuery();
        var data = this.getGlobalData();
        if (company) {
            data = this.getCompaniesGlobalData()[company];
        }

        $(div_id + ' #ircFirst').text(data.first_date);
        $(div_id + ' #ircLast').text(data.last_date);
        $(div_id + ' #ircSent').text(data.irc_sent);
    };

    this.getTitle = function() {return "IRC Messages";};    
}
IRC.prototype = new DataSource("irc");
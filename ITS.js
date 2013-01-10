/* 
 * Copyright (C) 2012 Bitergia
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

function ITS() {
    // Work around: http://bit.ly/yP8tGP
    var self = this;

    var basic_metrics = {
        'opened' : {
            'divid' : 'its-opened',
            'column' : "opened",
            'name' : "Opened",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'openers' : {
            'divid' : 'its-openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'closed' : {
            'divid' : 'its-closed',
            'column' : "closed",
            'name' : "Closed",
            'desc' : "Number of closed tickets"
        },
        'closers' : {
            'divid' : 'its-closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'changed' : {
            'divid' : 'its-changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'changers' : {
            'divid' : 'its-changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        }
    };
    self.getMetrics = function() {return basic_metrics;};
    
    self.getMainMetric = function() {
        return "opened";
    };
    
    self.displayData = function() {
        $("#itsFirst").text(self.global_data.first_date);
        $("#itsLast").text(self.global_data.last_date);
        $("#itsTickets").text(self.global_data.tickets);
        $("#itsOpeners").text(self.global_data.openers);
    };
    
    self.displayBasicHTML = function(div_target, config) {
        var title = "Tickets";
        Viz.displayBasicHTML(self.getData(), div_target, title, 
                self.basic_metrics, self.name+'_hide', config);
    };
    
    self.displayBubbles = function(divid) {
        Viz.displayBubbles(divid, "opened", "openers");
    };
    
    self.displayEvo = function(id) {
        self.envisionEvo(id, self.getData());
    };
    
    self.envisionEvo = function(div_id, history) {
        config = Report.getConfig();
        options = Viz.getEnvisionOptions(div_id, history, self.basic_metrics,
                self.getMainMetric(), config.its_hide);
        new envision.templates.Envision_Report(options, [ self ]);
    };

    
}
var aux = new ITS();
ITS.prototype = new DataSource("its", aux.getMetrics());
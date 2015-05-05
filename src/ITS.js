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

    this.basic_metrics = {
        'its_opened' : {
            'divid' : 'its_opened',
            'column' : "opened",
            'name' : "Opened",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'its_openers' : {
            'divid' : 'its_openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_closed' : {
            'divid' : 'its_closed',
            'column' : "closed",
            'name' : "Closed",
            'desc' : "Number of closed tickets"
        },
        'its_closers' : {
            'divid' : 'its_closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_bmitickets' : {
            'divid' : 'its_bmitickets',
            'column' : "bmitickets",
            'name' : "Efficiency",
            'desc' : "Efficiency closing tickets: number of closed ticket out of the opened ones in a given period"
        },
        'its_changed' : {
            'divid' : 'its_changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'its_changers' : {
            'divid' : 'its_changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_companies' : {
            'divid' : 'its_companies',
            'column' : "companies",
            'name' : "Companies",
            'desc' : "Number of active companies"
        },
        'its_organizations' : {
            'divid' : 'its_organizations',
            'column' : "companies",
            'name' : "Companies",
            'desc' : "Number of active companies"
        },
        'its_countries' : {
            'divid' : 'its_countries',
            'column' : "countries",
            'name' : "Countries",
            'desc' : "Number of active countries"
        },
        'its_repositories' : {
            'divid' : 'its_repositories',
            'column' : "repositories",
            'name' : "Respositories",
            'desc' : "Number of active respositories"
        },
        'its_domains' : {
            'divid' : 'its_domains',
            'column' : "domains",
            'name' : "Domains",
            'desc' : "Number of active domains"
        }/*,
        'its_people' : {
            'divid' : 'its_people',
            'column' : "people",
            'name' : "People",
            'desc' : "Number of active people"
        }*/ //not used, breaks the tests
    };

    this.getMainMetric = function() {
        return "its_opened";
    };

    this.getSummaryLabels = function () {
        var labels = {
                first_date : "Start",
                last_date : "End",
                tickets : "Tickets",
                trackers : "Trackers"
        };
        return labels;
    };

    this.getLabelForRepository = function(){
        return 'tracker';
    };
    this.getLabelForRepositories = function(){
        return 'trackers';
    };


    this.displayData = function(divid) {
        var div_id = "#" + divid;
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + ' .its-info').hide();
            return;
        }
        $(div_id + ' #its_type').text(this.global_data.type);
        var url = '';
        if (this.global_data.repositories === 1) {
            url = this.global_data.url;
        } else {
            url = Report.getProjectData().its_url;
        }
        if (url === undefined) url = '';
        if (this.global_data.type === "allura")
            url = url.replace("rest/","");
        else if (this.global_data.type === "github") {
            url = url.replace("api.","");
            url = url.replace("repos/","");
        }
        $(div_id + ' #its_url').attr("href", url);
        var tracker_str = this.global_data.type.charAt(0).toUpperCase() + this.global_data.type.slice(1);
        $(div_id + ' #its_name').text(tracker_str + " Tickets");

        var data = this.getGlobalData();

        $(div_id + ' #itsFirst').text(data.first_date);
        $(div_id + ' #itsLast').text(data.last_date);
        $(div_id + ' #itsTickets').text(data.its_opened);
        $(div_id + ' #itsOpeners').text(data.its_openers);
        $(div_id + ' #itsRepositories').text(data.its_repositories);
        if (data.repositories === 1)
            $(div_id + ' #itsRepositories').hide();
    };

    this.getTitle = function() {return "Tickets";};

    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "its_opened", "its_openers", radius);
    };

}
ITS.prototype = new DataSource("its");

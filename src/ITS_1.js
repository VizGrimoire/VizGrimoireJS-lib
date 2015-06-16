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

/*
 * ITS_1 is the same now than ITS. It could be different in the future
 * but now acs can't find the way to reuse it. I need more knowledge about
 * JS objects prototypes.
 * ITS_1.prototype = new ITS()
 * does not work as expected.
 */

function ITS_1() {

    this.basic_metrics = {
        'its_1_opened' : {
            'divid' : 'its_1_opened',
            'column' : "opened",
            'name' : "Opened tickets",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'its_1_openers' : {
            'divid' : 'its_1_openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_1_stories_opened' : {
            'divid' : 'its_1_stories_opened',
            'column' : "stories_opened",
            'name' : "Stories Opened",
            'desc' : "Number of opened stories"
        },
        'its_1_stories_openers' : {
            'divid' : 'its_1_stories_openers',
            'column' : "stories_openers",
            'name' : "Stories Openers",
            'desc' : "Unique identities opening stories",
            'action' : "opened"
        },
        'its_1_closed' : {
            'divid' : 'its_1_closed',
            'column' : "closed",
            'name' : "Closed tickets",
            'desc' : "Number of closed tickets"
        },
        'its_1_closers' : {
            'divid' : 'its_1_closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_1_closers_7' : {
            'divid' : 'its_1_closers_7',
            'column' : "closers_7",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets during last week",
            'action' : "closed"
        },
        'its_1_stories_closed' : {
            'divid' : 'its_1_stories_closed',
            'column' : "stories_closed",
            'name' : "Closed stories",
            'desc' : "Number of closed stories"
        },
        'its_1_stories_pending' : {
            'divid' : 'its_1_stories_pending',
            'column' : "stories_pending",
            'name' : "Pending stories",
            'desc' : "Number of pending stories"
        },
        'its_1_bmitickets' : {
            'divid' : 'its_1_bmitickets',
            'column' : "bmitickets",
            'name' : "Efficiency",
            'desc' : "Efficiency closing tickets: number of closed ticket out of the opened ones in a given period"
        },
        'its_1_changed' : {
            'divid' : 'its_1_changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'its_1_changers' : {
            'divid' : 'its_1_changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'its_1_companies' : {
            'divid' : 'its_1_companies',
            'column' : "companies",
            'name' : "Companies",
            'desc' : "Number of active companies"
        },
        'its_1_countries' : {
            'divid' : 'its_1_countries',
            'column' : "countries",
            'name' : "Countries",
            'desc' : "Number of active countries"
        },
        'its_1_repositories' : {
            'divid' : 'its_1_repositories',
            'column' : "repositories",
            'name' : "Respositories",
            'desc' : "Number of active respositories"
        },
        'its_1_domains' : {
            'divid' : 'its_1_domains',
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
        return "its_1_opened";
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
        $(div_id + ' #itsTickets').text(data.its_1_opened);
        $(div_id + ' #itsOpeners').text(data.its_1_openers);
        $(div_id + ' #itsRepositories').text(data.its_1_repositories);
        if (data.repositories === 1)
            $(div_id + ' #itsRepositories').hide();
    };

    this.getTitle = function() {return "Tickets";};

    this.displayBubbles = function(divid, radius) {
        Viz.displayBubbles(divid, "its_1_opened", "its_1_openers", radius);
    };
}
ITS_1.prototype = new DataSource("its_1");

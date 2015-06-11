/*
 * Copyright (C) 2015 Bitergia
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
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */

function Meetup() {

    var self = this;
    this.events = {};
    this.top_groups = {};

    this.basic_metrics = {
        "meetup_events" : {
            "divid" : "meetup_events",
            "action" : "attendees",
            "column" : "opened",
            "name" : "Meetup meetings",
            "desc" : "Meetup meetings"
        },
        "meetup_attendees" : {
            "divid" : "meetup_attendees",
            "column" : "attendees",
            "action": "events",
            "name" : "Meetup RSVPs",
            "desc" : "Meetup RSVPs"
        },
        "meetup_members" : {
            "divid" : "meetup_members",
            "column" : "members",
            "name" : "Meetup members",
            "desc" : "Meetup members"
        },
        "meetup_cities": {
            "name" : "Cities with Meetup events",
            "action" : "events",
            "desc": "Cities where events took place"
        },
        "meetup_groups" : {
            "divid" : "meetup_groups",
            "column" : "groups",
            "name" : "Active Meetup groups",
            "desc" : "Active Meetup groups"
        }
    };

    this.getMainMetric = function() {
        return "meetup_events";
    };

    this.getSummaryLabels = function () {
        var id_label = {
                first_date : "Start",
                last_date : "End"
        };
        return id_label;
    };

    this.displayData = function(divid) {
        return '';
    };

    this.getTitle = function() {return "Meeetup events";};

    this.displayTopMultiColumn = function(div, headers, columns) {
        loadMeetupEventsData(function(data){
            Table.simpleTable(div, data, headers, columns);
            });
    };

    function buildLink(data){
        if (data.hasOwnProperty('event_name') &&
            data.hasOwnProperty('event_id') &&
            data.hasOwnProperty('group_id')){
            $.each(data.event_name,function(id,value){
                data.event_name[id] = '<a href="http://www.meetup.com/' +
                data.group_id[id] + '/events/' +
                data.event_id[id] + '">' + data.event_name[id] +
                '&nbsp;<i class="fa fa-external-link"></i></a>';
            });
        }if (data.hasOwnProperty('group_name') &&
                data.hasOwnProperty('group_id')){
                $.each(data.event_name,function(id,value){
                    data.group_name[id] = '<a href="./meetup-group.html?group=' +
                    data.group_id[id] + '">' + data.group_name[id] +
                    '</a>';
                });
        }
        return data;
    }

    function loadMeetupEventsData (cb) {
        var json_file = "data/json/meetup-events.json";
        $.when($.getJSON(json_file)
                ).done(function(json_data) {
                this.events = json_data;
                this.events = buildLink(this.events);
                cb(this.events);
        }).fail(function() {
            console.log("Meetup events disabled. Missing " + json_file);
        });
    }
}
Meetup.prototype = new DataSource("meetup");

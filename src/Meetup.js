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
        "eventizer_events" : {
            "divid" : "eventizer_events",
            "action" : "attendees",
            "column" : "events",
            "name" : "Meetup meetings",
            "desc" : "Meetup meetings"
        },
        "eventizer_attendees" : {
            "divid" : "eventizer_attendees",
            "column" : "attendees",
            "action": "events",
            "name" : "Meetup RSVPs",
            "desc" : "Meetup RSVPs"
        },
        "eventizer_rsvps" : {
            "divid" : "eventizer_rsvps",
            "column" : "rsvps",
            "action": "events",
            "name" : "Meetup RSVPs",
            "desc" : "Meetup RSVPs"
        },
        "eventizer_members" : {
            "divid" : "eventizer_members",
            "column" : "members",
            "name" : "Meetup members",
            "desc" : "Meetup members"
        },
        "eventizer_cities": {
            "name" : "Cities with Meetup events",
            "action" : "events",
            "desc": "Cities where events took place"
        },
        "eventizer_groups" : {
            "divid" : "eventizer_groups",
            "column" : "groups",
            "name" : "Active Meetup groups",
            "desc" : "Active Meetup groups"
        }
    };

    this.getMainMetric = function() {
        return "eventizer_events";
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

    this.getTitle = function() {return "Meetup events";};

    this.displayTablePastEvents = function(div, headers, columns, limit) {
        loadMeetupEventsData(function(data){
            data = filterOutFuture(data);
            data = applyLimit(data, limit);
            data = makeUpPastDate(data);
            data = replaceNull(data);
            Table.simpleTable(div, data, headers, columns);
            });
    };

    this.displayTableFutureEvents = function(div, headers, columns, limit) {
        loadMeetupEventsData(function(data){
            data = extractFuture(data);
            data = reverseOrder(data);
            data = applyLimit(data, limit);
            data = makeUpFutureDate(data);
            data = replaceNull(data);
            Table.simpleTable(div, data, headers, columns);
            });
    };

    /*
    *
    */
    function replaceNull(data){
        $.each(data.city, function(id,value){
            if (value === null){
                data.city[id] = '-';
            }
        });
        $.each(data.country, function(id,value){
            if (value === null){
                data.country[id] = '-';
            }
        });
        return data;
    }

    /*
    *
    */
    function makeUpPastDate(data){
        $.each(data.date, function(id,value){
            data.date[id] = moment(value, "YYYY-MM-DD hh:mm:ss")
                            .format('MMMM Do YYYY, h:mm a');
        });
        return data;
    }


    /*
    *
    */
    function makeUpFutureDate(data){
        $.each(data.date, function(id,value){
            data.date[id] = moment(value, "YYYY-MM-DD hh:mm:ss").fromNow();
        });
        return data;
    }

    /*
    *
    */
    function reverseOrder(data){
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id,value){
            newobj[value] = data[value].reverse();
        });
        return newobj;
    }

    /*
    * Return the number of future events and the beginning of the array
    */
    function numberFutureEvents(data){
        var d = new Date(),
            now = d.getTime(),
            offset = 0;
        $.each(data.date, function(id,value){
            var aux_date = new Date(value);
            when = aux_date.getTime();
            if (when <= now){
                offset = id;
                return false; //break
            }
        });
        return offset;
    }

    /*
    * Return the future events filtering out past events
    */
    function extractFuture(data){
        var offset = numberFutureEvents(data);
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id,value){
            //for (i = 0; i < data[value].length; i++) {
            newobj[value] = data[value].slice(0, offset);
        });
        return newobj;
    }

    /*
    * Returns the past events filtering out future events
    */
    function filterOutFuture(data){
        var offset = numberFutureEvents(data);
        var keys = Object.keys(data),
            newobj = {};
        $.each(keys, function(id,value){
            //for (i = 0; i < data[value].length; i++) {
            var array_len = data[value].length;
            newobj[value] = data[value].slice(offset, array_len);
        });
        return newobj;
    }

    /*
    * Returns copy of data object with its arrays cut to limit size
    */
    function applyLimit(data, limit){
        var keys = Object.keys(data),
            newobj = {},
            myarray = [];

        if (limit > data[keys[0]].length){
            return data;
        }

        $.each(keys, function(id,value){
            //for (i = 0; i < data[value].length; i++) {
            myarray = [];
            for (i = 0; i < limit; i++) {
                myarray.push(data[value][i]);
                if (limit === data[value].length - 1 ){
                    break;
                }
            }
            newobj[value] = myarray;
        });
        return newobj;
    }

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
                    data.group_name[id] = '<a href="./meetup-group.html?repository=' +
                    data.group_name[id] + '">' + data.group_name[id] +
                    '</a>';
                });
        }
        return data;
    }

    function loadMeetupEventsData (cb) {
        var json_file = "data/json/eventizer-events.json";
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
Meetup.prototype = new DataSource("eventizer");

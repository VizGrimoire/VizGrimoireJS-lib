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

function People() {

    /* if not initialized breaks function nameSpaceMetrics in DataSource.js*/
    this.basic_metrics = {
        'people_members' : {
            'column' : "members", //only for testing purposes
            'name' : "Members",
            'desc' : "Community Members"
        }
    }; 

    this.getMainMetric = function() {
        /*only for testing purposes*/
        return "people_members";
    };

    this.displayData = function(divid) {
        /*Fake function to avoid crash in unit tests*/
        var div_id = "#" + divid;

        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + ' .mediawiki_info').hide();
            return;
        }

        var url = '';
        if (this.global_data.repositories === 1) {
            url = this.global_data.url;
        } else {
            url = Report.getProjectData().mediawiki_url;
        }

        if (this.global_data.type)
            $(div_id + ' #mediawiki_type').text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined)  {
            $(div_id + ' #mediawiki_url').attr("href", url);
            $(div_id + ' #mediawiki_name').text("MediaWiki " + this.global_data.type);
        } else {
            $(div_id + ' #mediawiki_url').attr("href", Report.getProjectData().mediawiki_url);
            $(div_id + ' #mediawiki_name').text(Report.getProjectData().mediawiki_name);
            $(div_id + ' #mediawiki_type').text(Report.getProjectData().mediawiki_type);
        }

        var data = this.getGlobalData();

        $(div_id + ' #mediawikiFirst').text(data.first_date);
        $(div_id + ' #mediawikiLast').text(data.last_date);
        $(div_id + ' #mediawikiSent').text(data.mediawiki_reviews);
    };

    this.displayBubbles = function(divid, radius) {
        /* only for testing purposes */
        if (false)    
            Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius);
    };


    this.getTitle = function() {return "Community Members";};
}
People.prototype = new DataSource("people");
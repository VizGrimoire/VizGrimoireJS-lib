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

function MediaWiki() {
    var self = this;

    this.basic_metrics = {
        'mediawiki_reviews' : {
            'divid' : "mediawiki_reviews",
            'column' : "reviews",
            'name' : "Editions",
            'desc' : "Wiki page editions"
        },
        'mediawiki_authors' : {
            'divid' : "mediawiki_authors",
            'column' : "authors",
            'name' : "Editors",
            'desc' : "Editors doing editions",
            'action' : 'reviews'
        },
        'mediawiki_pages' : {
            'divid' : "mediawiki_pages",
            'column' : "pages",
            'name' : "Pages",
            'desc' : "Wiki pages"
        }
    };

    this.getMainMetric = function() {
        return "mediawiki_reviews";
    };

    this.getSummaryLabels = function () {
        var id_label = {
                first_date : "Start",
                last_date : "End"
        };
        return id_label;
    };

    this.displayData = function(divid) {
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
        if (false)    
            Viz.displayBubbles(divid, "mediawiki_reviews", "mediawiki_authors", radius);
    };

    this.getTitle = function() {return "MediaWiki Reviews";};    
}
MediaWiki.prototype = new DataSource("mediawiki");
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

function QAForums() {

    var self = this;

    /* These basic metrics are overwritten by the metrics.json file but they are needed
       for instance by the function viz.displayTop and viz.displaytopmetric.
       It the metric is present in basic_metrics, the key of the dict will be used from 
       the div when using it.
       
    */

    this.basic_metrics = {
	"qaforums_sent" : {
            "name" : "Messages posted",
            "desc" : "Number of messages posted to Q&A forums(s)",
            "column" : "sent"
	},
	"qaforums_qsent" : {
            "name" : "Questions posted",
            "desc" : "Number of questions posted to Q&A forums(s)",
            "column": "qsent"
	},
	"qaforums_asent" : {
            "name" : "Answers posted",
            "desc" : "Number of answers posted to Q&A forums(s)",
            "column" : "asent"
	},
	"qaforums_senders" : {
            "name" : "Persons posting messages",
            "desc" : "Number of persons posting messages to Q&A forums(s)",
            "column" : "senders"
	},
	"qaforums_asenders" : {
            "name" : "Persons posting answers",
            "desc" : "Number of persons answering in Q&A forums(s)",
            "column" : "asenders"
	},
	"qaforums_qsenders" : {
            "divid" : "qaforums_qsenders",
            "name" : "Persons posting questions",
            "desc" : "Number of persons asking questions in Q&A forums(s)",
            "column" : "qsenders"
	}
    };

    this.getMainMetric = function() {
        /*only for testing purposes*/
        return "qaforums_qsent";
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
            Viz.displayBubbles(divid, "qaforums_quetions", "qaforums_authors", radius);
    };

    this.getSummaryLabels = function () {
        /* This summary functions should be removed. We can use the metrics.json file instead
           It is used to display the summary table on repository.html*/
        var id_label = {
            first_date:'Start',
            last_date:'End',
            sent:'Messages posted',
            qsent:'Questions posted',
            asent:'Answers posted',
            senders:'Persons posting messages',
            asenders: 'Persons posting answers',
            qsenders:'Persons posting questions'
            };
        return id_label;
    };



    this.getTitle = function() {return "QAForums";};
}
QAForums.prototype = new DataSource("qaforums");
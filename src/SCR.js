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

function SCR() {

    var self = this;

    this.basic_metrics = {
        "scr_opened" : {
            "divid" : "scr_opened",
            "column" : "opened",
            "name" : "Reviews opened",
            "desc" : "Reviews in status new or inprogress"
        },
        "scr_submissions" : {
            "divid" : "scr_submissions",
            "column" : "submissions",
            "name" : "Reviews submitted",
            "desc" : "Reviews submitted"
        },
        "scr_closed" : {
            "divid" : "scr_closed",
            "column" : "closed",
            "name" : "Reviews closed",
            "desc" : "Reviews merged or abandoned"
        },
        "scr_merged" : {
            "divid" : "scr_merged",
            "column" : "merged",
            "name" : "Reviews merged",
            "desc" : "Reviews merged"
        },
        "scr_mergers" : {
            "divid" : "scr_mergers",
            "column" : "mergers",
            "name" : "Reviews mergers",
            "action": "merged",
            "desc" : "People merging reviews"
        },
        "scr_new" : {
            "divid" : "scr_new",
            "column" : "new",
            "name" : "Reviews new",
            "desc" : "Reviews in status new"
        },
        "scr_abandoned" : {
            "divid" : "scr_abandoned",
            "column" : "abandoned",
            "name" : "Reviews abandoned",
            "desc" : "Reviews abandoned"
        },
        "scr_pending" : {
            "divid" : "scr_pending",
            "column" : "pending",
            "name" : "Reviews pending",
            "desc" : "Reviews pending to be attended"
        },
        "scr_review_time_days_avg" : {
            "divid" : "scr_review_time_days_avg",
            "column" : "review_time_days_avg",
            "name" : "Average review time",
            "desc" : "Average review time in days"
        },
        "scr_verified" : {
            "divid" : "scr_verified",
            "column" : "verified",
            "name" : "Patches verified",
            "desc" : "Patches verified"
        },
        "scr_approved" : {
            "divid" : "scr_approved",
            "column" : "approved",
            "name" : "Patches approved",
            "desc" : "Patches approved"
        },
        "scr_codereview" : {
            "divid" : "scr_codereview",
            "column" : "codereview",
            "name" : "Patches codereview",
            "desc" : "Patches in code review process"
        },
        "scr_WaitingForReviewer" : {
            "divid" : "scr_WaitingForReviewer",
            "column" : "WaitingForReviewer",
            "name" : "Patches waiting reviewer",
            "desc" : "Patches waiting for reviewer"
        },
        "scr_WaitingForSubmitter" : {
            "divid" : "scr_WaitingForSubmitter",
            "column" : "WaitingForSubmitter",
            "name" : "Patches waiting submitter",
            "desc" : "Patches waiting for a new version"
        },
        "scr_submitted" : {
            "divid" : "scr_submitted",
            "column" : "submitted",
            "name" : "Reviews submitted",
            "desc" : "Reviews submitted"
        },
        "scr_submitters" : {
            "divid" : "scr_submitters",
            "column" : "submitters",
            "name" : "Reviews submitters",
            "desc" : "Number of people submitting review processes."
        },
        "scr_sent" : {
            "divid" : "scr_sent",
            "column" : "sent",
            "name" : "Patches Sent",
            "desc" : "Patches sent"
        },
        "scr_companies" : {
            "divid" : "scr_companies",
            "column" : "companies",
            "name" : "Companies",
            "desc" : "Number of active companies"
        },
        "scr_organizations" : {
            "divid" : "scr_organizations",
            "column" : "companies",
            "name" : "Companies",
            "desc" : "Number of active companies"
        },
        "scr_countries" : {
            "divid" : "scr_countries",
            "column" : "countries",
            "name" : "Countries",
            "desc" : "Number of active countries"
        },
        "scr_repositories" : {
            "divid" : "scr_repositories",
            "column" : "repositories",
            "name" : "Respositories",
            "desc" : "Number of active respositories"
        },/*
        "scr_people" : {
            "divid" : "scr_people",
            "column" : "people",
            "name" : "People",
            "desc" : "Number of active people"
        },*/
        "scr_closers" : {
            "divid" : "scr_closers",
            "column" : "closers",
            "name" : "Closers",
            "desc" : "Reviews closers",
            "action" : "closed"
        },
        "scr_submitters" : {
            "divid" : "scr_submitters",
            "column" : "openers",
            "name" : "Submitters",
            "desc" : "Reviews submitters",
            "action" : "opened"
        },
        "scr_reviewers" : {
            "divid" : "scr_reviewers",
            "column" : "reviewers",
            "name" : "Reviewers",
            "desc" : "Number of people reviewing contributions"
        },
        "scr_timeto_merge_avg":{
            "divid" : "scr_timeto_merge_avg",
            "column" : "timeto_merge_avg",
            "name" : "Time to merge (average days)",
            "desc" : "Number of average days a contribution waits to be merged"
        },
        "scr_timeto_merge_median":{
            "divid" : "scr_timeto_merge_median",
            "column" : "timeto_merge_median",
            "name" : "Time to merge (median of the days)",
            "desc" : "Median of the number of days a contribution waits to be merged"
        },
        "scr_timeto_close_avg":{
            "divid" : "scr_timeto_close_avg",
            "column" : "timeto_close_avg",
            "name" : "Time to close (average days)",
            "desc" : "Number of average days a contribution waits to be closed"
        },
        "scr_timeto_close_median":{
            "divid" : "scr_timeto_close_median",
            "column" : "timeto_close_median",
            "name" : "Time to close (median of the days)",
            "desc" : "Median of the number of days a contribution waits to be closed"
        },
        "scr_participants":{
            "divid" : "scr_participants",
            "column" : "participants",
            "name" : "Participants",
            "desc" : "Number of participants in the review process",
            "action": "events"
        },
        "scr_active_core_reviewers":{
            "divid" : "scr_active_core_reviewers",
            "column" : "active_core_reviewers",
            "name" : "Active core reviewers",
            "desc" : "Number of active core reviewers",
            "action": "reviews"
        }
    };

    this.getMainMetric = function() {
        return "scr_merged";
    };

    this.getSummaryLabels = function () {
        var id_label = {
                first_date : "Start",
                last_date : "End",
                review_time_pending_ReviewsWaitingForReviewer_days_avg: "Review Time for reviewers (days, avg)",
                review_time_pending_ReviewsWaitingForReviewer_days_median: "Review Time for reviewers (days, median)",
                review_time_pending_update_ReviewsWaitingForReviewer_days_avg: "Update time for reviewers (days, avg)",
                review_time_pending_update_ReviewsWaitingForReviewer_days_median: "Update time for reviewers (days, avg)",
                review_time_pending_days_avg:"Review time (days, avg)",
                review_time_pending_days_median:"Review time (days, median)",
                review_time_pending_update_days_avg:"Update time (days, avg)",
                review_time_pending_update_days_median:"Update time (days, median)"
        };
        return id_label;
    };

    this.displayData = function(divid) {
        var div_id = "#" + divid;

        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + ' .scr_info').hide();
            return;
        }

        var url = '';
        if (this.global_data.repositories === 1) {
            url = this.global_data.url;
        } else {
            url = Report.getProjectData().scr_url;
        }

        if (this.global_data.type)
            $(div_id + ' #scr_type').text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined)  {
            $(div_id + ' #scr_url').attr("href", url);
            $(div_id + ' #scr_name').text("SCR " + this.global_data.type);
        } else {
            $(div_id + ' #scr_url').attr("href", Report.getProjectData().mls_url);
            $(div_id + ' #scr_name').text(Report.getProjectData().scr_name);
            $(div_id + ' #scr_type').text(Report.getProjectData().scr_type);
        }

        var company = this.getCompanyQuery();
        var data = this.getGlobalData();
        if (company) {
            data = this.getCompaniesGlobalData()[company];
        }

        $(div_id + ' #scrFirst').text(data.first_date);
        $(div_id + ' #scrLast').text(data.last_date);
        $(div_id + ' #scrReviews').text(data.scr_opened);
    };

    this.displayBubbles = function(divid, radius) {
        // TODO: we don't have people metrics data
        if (false)
            Viz.displayBubbles(divid, "scr_opened", "scr_openers", radius);
    };

    // http:__lists.webkit.org_pipermail_squirrelfish-dev_
    // <allura-dev.incubator.apache.org>
    SCR.displaySCRListName = function (listinfo) {
        var list_name_tokens = listinfo.split("_");
        var list_name = '';
        if (list_name_tokens.length > 1) {
            list_name = list_name_tokens[list_name_tokens.length - 1];
            if (list_name === "")
                list_name = list_name_tokens[list_name_tokens.length - 2];
        } else {
            list_name = listinfo.replace("<", "");
            list_name = list_name.replace(">", "");
            list_name_tokens = list_name.split(".");
            list_name = list_name_tokens[0];
        }
        return list_name;
    };

    this.getTitle = function() {return "Source Code Review";};
}
SCR.prototype = new DataSource("scr");

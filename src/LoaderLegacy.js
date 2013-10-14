/* 
 * Copyright (C) 2012-2013 Bitergia
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

var Loader = {};

(function() {
// Companies preloading disabled. This functions is not used
function data_load_companies_metrics() {
    var data_sources = Report.getDataSources();
    $.each(data_sources, function(i, DS) {
        var companies = DS.getCompaniesData();
        if (!companies) return;
        $.each(companies, function(i, company) {
            var file = DS.getDataDir()+"/"+company+"-";
            var file_evo = file + DS.getName()+"-evolutionary.json";
            $.when($.getJSON(file_evo)).done(function(history) {
                DS.addCompanyMetricsData(company, history, DS);
                end_data_load();
            });
            var file_static = file + DS.getName()+"-static.json";
            $.when($.getJSON(file_static)).done(function(history) {
                DS.addCompanyGlobalData(company, history, DS);
                end_data_load();
            });
            file_static = file + DS.getName()+"-top-";
            if (DS.getName() === "scm") file_static += "authors";
            if (DS.getName() === "its") file_static += "closers";
            if (DS.getName() === "mls") file_static += "senders";
            // Top not yet supported in SCR
            if (DS.getName() === "scr") return;
            var file_all = file_static + ".json";
            $.when($.getJSON(file_all))
                .done(function(history) {
                    DS.addCompanyTopData(company, history, DS, "all");
                    end_data_load();
            }).fail(function() {
                DS.setCompaniesTopData([], self);
                end_data_load();
            });
        });
    });
}

// Repos preloading disabled. This functions is not used
function data_load_repos_metrics() {
    var data_sources = Report.getDataSources();
    $.each(data_sources, function(i, DS) {
        var repos = DS.getReposData();
        if (repos === null) return;
        $.each(repos, function(i, repo) {
            repo_uri = encodeURIComponent(repo);
            var file = DS.getDataDir()+"/"+repo_uri+"-";
            file_evo = file + DS.getName()+"-evolutionary.json";
            $.when($.getJSON(file_evo)).done(function(history) {
                DS.addRepoMetricsData(repo, history, DS);
                end_data_load();
            });
            file_static = file + DS.getName()+"-static.json";
            $.when($.getJSON(file_static)).done(function(history) {
                DS.addRepoGlobalData(repo, history, DS);
                end_data_load();
            });
        });
    });
}
})();

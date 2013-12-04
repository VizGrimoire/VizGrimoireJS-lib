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

if (Loader === undefined) var Loader = {};

(function() {
    var data_callbacks = [];
    var data_global_callbacks = [];
    var data_repos_callbacks = [];
    var check_companies = false, check_repos = false, check_countries = false;

    Loader.data_ready = function(callback) {
        data_callbacks.push(callback);
    };

    Loader.data_ready_global = function(callback) {
        data_global_callbacks.push(callback);
    };

    function fillProjectInfo(data, dir) {
        if (data.project_name === undefined) {
            data.project_name = dir.replace("data/json","")
                .replace(/\.\.\//g,"");
        }
        var projects_data = Report.getProjectsData();
        projects_data[data.project_name] = {dir:dir,url:data.project_url};
   }

    Loader.data_load = function () {
        data_load_file(Report.getProjectFile(), 
                function(data, self) {Report.setProjectData(data);});
        data_load_file(Report.getVizConfigFile(), 
                function(data, self) {Report.setVizConfig(data);});
        data_load_file(Report.getMarkersFile(), 
                function(data, self) {Report.setMarkers(data);});
        var projects_dirs = Report.getProjectsDirs();
        for (var i=0;  i<projects_dirs.length; i++) {
            var data_dir = projects_dirs[i];
            var prj_file = Report.getDataDir() + "/project-info.json";
            data_load_file(prj_file, fillProjectInfo, data_dir);
        }
        data_load_companies();
        data_load_repos();
        data_load_countries();
        data_load_metrics_definition();
        data_load_metrics();
        data_load_people();
        data_load_tops('authors');
        data_load_time_to_fix();
        data_load_time_to_attention();
    };

    function data_load_file(file, fn_data_set, self) {
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history, self);
            end_data_load();
        }).fail(function() {
            fn_data_set([], self);
            end_data_load();
        });
    }

    function data_load_companies() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getCompaniesDataFile(),
                    DS.setCompaniesData, DS);
        });
    }

    function data_load_repos() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getReposDataFile(), DS.setReposData, DS);
        });
        // Repositories mapping between data sources
        data_load_file(Report.getReposMapFile(), Report.setReposMap);
    }

    function data_load_countries() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getCountriesDataFile(), DS.setCountriesData, DS);
        });
    }

    function data_load_time_to_fix() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getTimeToFixDataFile(), DS.setTimeToFixData, DS);
        });
    }

    function data_load_time_to_attention() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getTimeToAttentionDataFile(), DS.setTimeToAttentionData, DS);
        });
    }

    // TODO: It is better to have all the tops in the same file
    // we should move data load from Viz.displayTop here
    function data_load_tops(metric) {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            // TODO: Support for SCM only in Webkit
            if (DS.getName() !== "scm") {
                DS.setGlobalTopData([], DS);
                return;
            }
            var file_static = DS.getDataDir() + "/"+ DS.getName()+"-top-"+metric;
            var file_all = file_static + ".json";
            var file_2006 = file_static + "_2006.json";
            var file_2009 = file_static + "_2009.json";
            var file_2012 = file_static + "_2012.json";
            $.when($.getJSON(file_all),
                    $.getJSON(file_2006),
                    $.getJSON(file_2009),
                    $.getJSON(file_2012)
                ).done(function(history, hist2006, hist2009, hist2012) {
                    DS.addGlobalTopData(history[0], DS, metric, "all");
                    DS.addGlobalTopData(hist2006[0], DS, metric, "2006");
                    DS.addGlobalTopData(hist2009[0], DS, metric, "2009");
                    DS.addGlobalTopData(hist2012[0], DS, metric, "2012");
                    end_data_load();
            }).fail(function() {
                DS.setGlobalTopData([], DS);
                end_data_load();
            });
        });
    }

    Loader.check_filter_page = function(page, filter) {
        var check = true;
        if (page === undefined) page = 1;
        var start = Report.getPageSize()*(page-1);
        var end = start + Report.getPageSize();
        $.each(Report.getDataSources(), function(index, DS) {
            var total = 0;
            if (filter === "repos") total = DS.getReposData().length;
            if (filter === "companies") total = DS.getCompaniesData().length;
            if (filter === "countries") total = DS.getCountriesData().length;
            if (end>total) end = total;
            for (var i=start;i<end;i++) {
                var item;
                if (filter === "repos") {
                    item = DS.getReposData()[i];
                    if (DS.getReposGlobalData()[item] === undefined ||
                        DS.getReposMetricsData()[item] === undefined) {
                        check = false;
                        return false;
                    }
                }
                if (filter === "companies") {
                    item = DS.getCompaniesData()[i];
                    if (DS.getCompaniesGlobalData()[item] === undefined ||
                        DS.getCompaniesMetricsData()[item] === undefined) {
                        check = false;
                        return false;
                    }
                }
                if (filter === "countries") {
                    item = DS.getCountriesData()[i];
                    if (DS.getCountriesGlobalData()[item] === undefined ||
                        DS.getCountriesMetricsData()[item] === undefined) {
                        check = false;
                        return false;
                    }
                }
            }
            end = start + Report.getPageSize();
        });
        return check;
    };

    Loader.check_item = function(item, filter) {
        var check = false;
        $.each(Report.getDataSources(), function(index, DS) {
            if (filter === "repos") {
                if (DS.getReposGlobalData()[item] !== undefined &&
                    DS.getReposMetricsData()[item] !== undefined) {
                    check = true;
                    return false;
                }
            }
            if (filter === "companies") {
                if (DS.getCompaniesGlobalData()[item] !== undefined &&
                    DS.getCompaniesMetricsData()[item] !== undefined) {
                    check = false;
                    return false;
                }
            }
            if (filter === "countries") {
                if (DS.getCountriesGlobalData()[item] !== undefined &&
                    DS.getCountriesMetricsData()[item] !== undefined) {
                    check = false;
                    return false;
                }
            }
        });
        return check;
    };

    Loader.data_load_items_page = function (DS, page, cb, filter) {
        if (page === undefined) page = 1;
        if (filter === "repos")
            if (DS.getReposData() === null) return false;
        if (filter === "companies")
            if (DS.getCompaniesData() === null) return false;
        if (filter === "countries")
            if (DS.getCountriesData() === null) return false;
        // No data
        var total = 0;
        if (filter === "repos") total = DS.getReposData().length;
        if (filter === "companies") total = DS.getCompaniesData().length;
        if (filter === "countries") total = DS.getCountriesData().length;
        if (total === 0) return true;
        // Check if we have the data for the page and if not load
        var start = Report.getPageSize()*(page-1);
        var end = start + Report.getPageSize();
        if (end>total) end = total;
        for (var i=start;i<end;i++) {
            if (filter === "repos") {
                var repo = DS.getReposData()[i];
                Loader.data_load_item (repo, DS, page, cb, "repos");
            } else if (filter === "companies") {
                var company = DS.getCompaniesData()[i];
                Loader.data_load_item (company, DS, page, cb, "companies");
            } else if (filter === "countries") {
                var country = DS.getCountriesData()[i];
                Loader.data_load_item (country, DS, page, cb, "countries");
            }
        }
    };

    Loader.check_people_item = function(item) {
        var check = true;
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getPeopleGlobalData()[item] === undefined ||
                DS.getPeopleMetricsData()[item] === undefined) {
                    check = false;
                    return false;
                }
        });
        return check;
    };

    Loader.data_load_people_item = function (upeople_id, DS, cb) {
        var file = DS.getDataDir() + "/people-"+upeople_id+"-"+DS.getName();
        var file_evo = file + "-evolutionary.json";
        var file_static = file + "-static.json";
        $.when($.getJSON(file_evo),$.getJSON(file_static)
            ).done(function(evo, global) {
            DS.addPeopleMetricsData(upeople_id, evo[0], DS);
            DS.addPeopleGlobalData(upeople_id, global[0], DS);
            if (Loader.check_people_item(upeople_id)) cb();
        }).fail(function() {
            DS.addPeopleMetricsData(upeople_id, [], DS);
            DS.addPeopleGlobalData(upeople_id, [], DS);
            if (Loader.check_people_item(upeople_id)) cb();
            // $("#"+div_id).hide();
            // $("#people").empty();
            // $("#people").html('No data available for people');
        });
    };

    // Load an item JSON data. If in a page, check all items read and cb.
    Loader.data_load_item = function (item, DS, page, cb, filter) {
        var item_uri = encodeURIComponent(item);
        var file = DS.getDataDir()+"/"+item_uri+"-";
        var file_evo = file + DS.getName()+"-evolutionary.json";
        var file_static = file + DS.getName()+"-static.json";
        $.when($.getJSON(file_evo),$.getJSON(file_static)
                ).done(function(evo, global) {
            if (filter === "repos") {
                DS.addRepoMetricsData(item, evo[0], DS);
                DS.addRepoGlobalData(item, global[0], DS);
            } else if (filter === "companies") {
                DS.addCompanyMetricsData(item, evo[0], DS);
                DS.addCompanyGlobalData(item, global[0], DS);
            } else if (filter === "countries") {
                DS.addCountryMetricsData(item, evo[0], DS);
                DS.addCountryGlobalData(item, global[0], DS);
            }
            if (page !== null) {
                if (Loader.check_filter_page (page, filter)) {
                    cb(filter);
                    // cb.called = true;
                }
            } else {
                cb(filter);
            }
        });
    };

    function data_load_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDataFile(), DS.setData, DS);
            data_load_file(DS.getGlobalDataFile(), DS.setGlobalData, DS);
            // TODO: Demographics just for SCM yet!
            if (DS instanceof SCM) {
                data_load_file(DS.getDemographicsFile(), DS.setDemographicsData, DS);
            }
            if (DS instanceof MLS) {
                data_load_file(DS.getListsFile(), DS.setListsData, DS);
            }

        });
    }

    function data_load_metrics_definition() {
        data_load_file("VizGrimoireJS/data/metrics.json", Report.setMetricsDefinition);
    }

    function data_load_people() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getPeopleDataFile(), DS.setPeopleData, DS);
        });
    }

    function check_companies_loaded(DS) {
        if (DS.getCompaniesData() === null) return false;
        else {
            // Companies metrics will be loaded when needed
            return true;
//            if (DS.getCompaniesData().length>0 && !check_companies) {
//                check_companies = true;
//                data_load_companies_metrics();
//                return false;
//            }
        }
        if (check_companies && DS.getCompaniesData().length>0) {
            var companies_loaded = 0;
            for (var key in DS.getCompaniesMetricsData()) {companies_loaded++;}
            if (companies_loaded !== DS.getCompaniesData().length) 
                return false;
            companies_loaded = 0;
            for (key in DS.getCompaniesGlobalData()) {companies_loaded++;}
            if (companies_loaded !== DS.getCompaniesData().length)
                return false;
            // Tops not yet supported in SCR Data Source (gerrit)
            if (DS.getName() !== "scr") {
                if (DS.getCompaniesTopData() === null) return false;
                companies_loaded = 0;
                for (key in DS.getCompaniesTopData()) {companies_loaded++;}
                if (companies_loaded !== DS.getCompaniesData().length)
                    return false;
            }
        }
        return true;
    }

    function check_repos_loaded(DS) {
        if (DS.getReposData() === null) return false;
        else {
            // Repos metrics will be loaded when needed
            return true;
//            if (DS.getReposData().length>0 && !check_repos) {
//                check_repos = true;
//                data_load_repos_metrics();
//                return false;
//            }
        }
        if (check_repos && DS.getReposData().length>0) {
            var repos_loaded = 0;
            for (var key in DS.getReposMetricsData()) {repos_loaded++;}
            if (repos_loaded !== DS.getReposData().length) return false;
            repos_loaded = 0;
            for (key in DS.getReposGlobalData()) {repos_loaded++;}
            if (repos_loaded !== DS.getReposData().length) return false;
        }
        return true;
    }

    function check_countries_loaded(DS) {
        if (DS.getCountriesData() === null) return false;
        else {
            // Countries metrics will be loaded when needed
            return true;
//            if (DS.getCountriesData().length>0 && !check_countries) {
//                check_countries = true;
//                data_load_countries_metrics();
//                return false;
//            }
        }
        if (check_countries && DS.getCountriesData().length>0) {
            var countries_loaded = 0;
            for (var key in DS.getCountriesMetricsData()) {countries_loaded++;}
            if (countries_loaded !== DS.getCountriesData().length) return false;
            countries_loaded = 0;
            for (key in DS.getCountriesGlobalData()) {countries_loaded++;}
            if (countries_loaded !== DS.getCountriesData().length) return false;
        }
        return true;
    }

    function check_projects_loaded() {
        var projects_loaded = 0;
        var projects_data = Report.getProjectsData();
        var projects_dirs = Report.getProjectsDirs();
        for (var key in projects_data) {projects_loaded++;}
        if (projects_loaded < projects_dirs.length ) return false;
        return true;
    }

    function check_data_loaded_global() {
        var check = true;
        if (Report.getProjectData() === null || 
                Report.getVizConfig() === null || Report.getMarkers() === null) 
            return false;

        if (!(check_projects_loaded())) return false;

        var data_sources = Report.getDataSources();
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) {check = false; return false;}
            if (DS.getGlobalData() === null) {check = false; return false;}
            if (DS.getGlobalTopData() === null) {check = false; return false;}
            if (DS.getTimeToFixData() === null) {check = false; return false;}
            if (DS.getTimeToAttentionData() === null) {check = false; return false;}
        });
        return check;
    }

    Loader.check_data_loaded = function() {
        var check = true;

        if (!(check_data_loaded_global())) return false;

        var data_sources = Report.getDataSources();
        $.each(data_sources, function(index, DS) {
            if (DS.getPeopleData() === null) {check = false; return false;}
 
            if (!check_companies_loaded(DS)) {check = false; return false;}
            if (!check_repos_loaded(DS)) {check = false; return false;}
            if (!check_countries_loaded(DS)) {check = false; return false;}

            // TODO: Demographics just for SCM yet!
            if (DS instanceof SCM) {
                if (DS.getDemographicsData() === null) {check = false; return false;} 
            }
            if (DS instanceof MLS) {
                if (DS.getListsData() === null) {check = false; return false;}
            }
        });
        return check;
    };

    // Two steps data loading
    function end_data_load()  {
        if (check_data_loaded_global()) {
            for (var i = 0; i < data_global_callbacks.length; i++) {
                data_global_callbacks[i]();
            }
            data_global_callbacks = [];
        }
        if (Loader.check_data_loaded()) {
            // Invoke callbacks informing all data needed has been loaded
            for (var j = 0; j < data_callbacks.length; j++) {
                data_callbacks[j]();
            }
        }
    }
})();
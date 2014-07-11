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
    var ds_not_supported_company_top = ['scr','irc','mediawiki'];

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

    Loader.data_load = function() {
        // If we have a config file just load what is configured
        if (Report.getConfig() !== null &&
            Report.getConfig().project_info !== undefined) {
            Report.setProjectData(Report.getConfig().project_info);
            if (Report.getConfig().markers)
                data_load_file(Report.getMarkersFile(),
                    function(data, self) {Report.setMarkers(data);});
        }
        // No config file. Try to load all
        else {
            data_load_file(Report.getProjectFile(),
                function(data, self) {Report.setProjectData(data);});
            data_load_file(Report.getMarkersFile(),
                    function(data, self) {Report.setMarkers(data);});
        }

        // Multiproject not tested with config.json
        var projects_dirs = Report.getProjectsDirs();
        for (var i=0;  i<projects_dirs.length; i++) {
            var data_dir = projects_dirs[i];
            var prj_file = Report.getDataDir() + "/project-info.json";
            data_load_file(prj_file, fillProjectInfo, data_dir);
        }

        // Loads also the project hierarchy
        data_load_file(Report.getProjectsHierarchyFile(), Report.setProjectsHierarchy);

	// Loads the side menu elements
	data_load_file(Report.getMenuElementsFile(), Report.setMenuElements);

        data_load_file(Report.getVizConfigFile(),
                function(data, self) {Report.setVizConfig(data);});

        data_load_metrics_definition();
        data_load_metrics();
        data_load_tops('authors');
        data_load_time_to_fix();
        data_load_time_to_attention();
        data_load_demographics();
        data_load_markov_table();

        if (Report.getConfig() !== null && Report.getConfig().reports !== undefined) {
            var active_reports = Report.getConfig().reports;
            if ($.inArray('companies', active_reports) > -1) data_load_companies();
            if ($.inArray('repositories', active_reports) > -1) data_load_repos();
            if ($.inArray('countries', active_reports) > -1) data_load_countries();
            if ($.inArray('domains', active_reports) > -1) data_load_domains();
            if ($.inArray('projects', active_reports) > -1) data_load_projects();
            if ($.inArray('people', active_reports) > -1) {
                data_load_people();
                data_load_people_identities();
            }
        } else {
            data_load_companies();
            data_load_repos();
            data_load_countries();
            data_load_domains();
            data_load_projects();
            data_load_people();
            data_load_people_identities();
        }
    };

    // Load just one file to viz it in a div
    Loader.get_file_data_div = function (file, cb, div) {
        $.when($.getJSON(file)).done(function(history) {
            cb (div, file, history);
        }).fail(function() {
            cb (file, null);
        });
    };

    function data_load_file(file, fn_data_set, self) {
        /**
           If file is fetched via HTTP then it executes the fn_data_set
           function with the data
         **/
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history, self);
            end_data_load();
        }).fail(function() {
            fn_data_set([], self);
            end_data_load();
        });
    }

    function data_load_companies() {
        var ds_not_supported = ['irc','mediawiki'];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) >-1) 
                DS.setCompaniesData([]);
            else
                data_load_file(DS.getCompaniesDataFile(),
                    DS.setCompaniesData, DS);
        });
    }

    function data_load_repos() {
        var ds_not_supported = ['mediawiki'];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) >-1) 
                DS.setReposData([]);
            else
                data_load_file(DS.getReposDataFile(), 
                        DS.setReposData, DS);
        });
        // Repositories mapping between data sources
        data_load_file(Report.getReposMapFile(), Report.setReposMap);
    }

    function data_load_countries() {
        var ds_not_supported = ['irc','mediawiki'];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) >-1) 
                DS.setCountriesData([]);
            else 
                data_load_file(DS.getCountriesDataFile(), DS.setCountriesData, DS);
        });
    }

    function data_load_domains() {
        var ds_not_supported = ['irc','mediawiki'];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) >-1)
                DS.setDomainsData([]);
            else
                data_load_file(DS.getDomainsDataFile(), DS.setDomainsData, DS);
        });
    }

    function data_load_projects() {
        var ds_not_supported = ['irc','mediawiki'];
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if ($.inArray(DS.getName(), ds_not_supported) >-1)
                DS.setProjectsData([]);
            else
                data_load_file(DS.getProjectsDataFile(), DS.setProjectsData, DS);
        });
    }

    // Just for ITS now
    function data_load_time_to_fix() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "its")
                data_load_file(DS.getTimeToFixDataFile(), DS.setTimeToFixData, DS);
        });
    }

    function data_load_markov_table() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "its")
                data_load_file(DS.getMarkovTableDataFile(), DS.setMarkovTableData, DS);
        });
    }

    // Just for MLS now
    function data_load_time_to_attention() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            if (DS.getName() === "mls")
                data_load_file(DS.getTimeToAttentionDataFile(), 
                        DS.setTimeToAttentionData, DS);
        });
    }

    function data_load_demographics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDemographicsAgingFile(),
                    DS.setDemographicsAgingData, DS);
            data_load_file(DS.getDemographicsBirthFile(),
                    DS.setDemographicsBirthData, DS);
        });
    }

    function data_load_tops(metric) {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            var file_all = DS.getTopDataFile(); 
            $.when($.getJSON(file_all)).done(function(history) {
                DS.setGlobalTopData(history);
                end_data_load();
            }).fail(function() {
                DS.setGlobalTopData([], DS);
                end_data_load();
            });
        });
    }

    Loader.check_filters_page = function(page) {
        var check = true;
        var filters = ["repos","companies","countries"];
        $.each(filters, function(index, filter) {
            if (!Loader.check_filter_page(page, filter)) {
                check = false;
                return false;
            }
        });
        return check;
    };

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
            if (filter === "domains") total = DS.getDomainsData().length;
            if (filter === "projects") total = DS.getProjectsData().length;
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
                if (filter === "domains") {
                    item = DS.getDomainsData()[i];
                    if (DS.getDomainsGlobalData()[item] === undefined ||
                        DS.getDomainsMetricsData()[item] === undefined) {
                        check = false;
                        return false;
                    }
                }
                if (filter === "projects") {
                    item = DS.getProjectsData()[i];
                    if (DS.getProjectsGlobalData()[item] === undefined ||
                        DS.getProjectsMetricsData()[item] === undefined) {
                        check = false;
                        return false;
                    }
                }
            }
            end = start + Report.getPageSize();
        });
        return check;
    };

    // Get the data source for an item
    function getItemDS(item, filter) {
        var ds = null;
        $.each(Report.getDataSources(), function(index, DS) {
            if (filter == "repos") {
                if ($.inArray(item, DS.getReposData())>-1) {
                    ds = DS;
                    return false;
                }
            }
            if (filter == "companies") {
                if ($.inArray(item, DS.getCompaniesData())>-1) {
                    ds = DS;
                    return false;
                }
            }
            if (filter == "countries") {
                if ($.inArray(item, DS.getCountriesData())>-1) {
                    ds = DS;
                    return false;
                }
            }
            if (filter == "domains") {
                if ($.inArray(item, DS.getDomainsData())>-1) {
                    ds = DS;
                    return false;
                }
            }
            if (filter == "projects") {
                if ($.inArray(item, DS.getProjectsData())>-1) {
                    ds = DS;
                    return false;
                }
            }
        });
        return ds;
    }

    // Check for top data for companies (TODO: add others when supported)
    Loader.FilterItemCheck = function(item, filter) {
        var check = true, ds;
        var map = Report.getReposMap();

        if (filter === "repos") {
            if (Loader.check_item (item, filter) === false) {
                ds = getItemDS(item, filter);
                if (ds === null) {
                    Report.log("Can't find data source for " + item);
                    return true;
                }
                Loader.data_load_item (item, ds, null,
                        Convert.convertFilterStudyItem, filter, null);
                return false;
            }

            // Support repositories mapping
            if (map !== undefined && map.length !== 0) {
                var items_map = [];
                $.each(Report.getDataSources(), function(index, DS) {
                    var itmap = Convert.getRealItem(DS, filter, item);
                    if (itmap !== undefined && itmap !== null) items_map.push(itmap);
                });
                if (Loader.check_items (items_map, filter) === false) {
                    for (var i=0; i< items_map.length; i++) {
                        if (Loader.check_item (items_map[i], filter) === false) {
                            ds = getItemDS(items_map[i], filter);
                            if (ds === null) {
                                Report.log("Can't find " + items_map[i]);
                                Report.log("Check repos-map.json");
                                continue;
                            }
                            Loader.data_load_item (items_map[i], ds, null,
                                    Convert.convertFilterStudyItem, filter, items_map);
                        }
                    }
                    check = false;
                }
            }
        }
        // Companies, countries, domains and projects should be loaded for all data sources active
        else {
            $.each(Report.getDataSources(), function(index, DS) {
                if (Loader.check_item (item, filter) === false) {
                    check = false;
                    Loader.data_load_item (item, DS, null, 
                        Convert.convertFilterStudyItem, filter, null);
                    if (filter === "companies") {
                        if ($.inArray(DS.getName(),ds_not_supported_company_top) === -1)
                            Loader.data_load_item_top (item, DS, null,
                                    Convert.convertFilterStudyItem, filter);
                    }
                }
            });
        }
        return check;
    };

    // Check the item in one data source for repos
    // Check the item for all data sources for countries, companies, domains and projects
    Loader.check_item = function(item, filter) {
        var check = false;
        $.each(Report.getDataSources(), function(index, DS) {
            if (filter === "repos") {
                // Check item data. item name is unique in all data sources
                // Ok if item find in any data source
                if (DS.getReposGlobalData()[item] !== undefined &&
                    DS.getReposMetricsData()[item] !== undefined) {
                    check = true;
                    return false;
                }
            }
            else if (filter === "companies") {
                var companies = DS.getCompaniesData();
                // No data for companies
                if (companies.length === 0) check = true;
                // Company available
                else if ($.inArray(item, companies) === -1) check = true;
                // Check item data for all data sources
                else if (DS.getCompaniesGlobalData()[item] === undefined ||
                    DS.getCompaniesMetricsData()[item] === undefined) {
                    check = false;
                    return false;
                }
                // Check item data top for all data sources supported
                else if ($.inArray(DS.getName(),ds_not_supported_company_top) === -1 &&
                         DS.getCompaniesTopData()[item] === undefined) {
                    check = false;
                    return false;
                }
                else check = true;
            }
            else if (filter === "countries") {
                var countries = DS.getCountriesData();
                // No data for countries
                if (countries.length === 0) check = true;
                // Country available
                else if ($.inArray(item, countries) === -1) check = true;
                // Check item data for all data sources
                else if (DS.getCountriesGlobalData()[item] === undefined ||
                    DS.getCountriesMetricsData()[item] === undefined) {
                    check = false;
                    return false;
                }
                else check = true;
            }

            else if (filter === "domains") {
                var domains = DS.getDomainsData();
                // No data for domains
                if (domains.length === 0) check = true;
                // Domain available
                else if ($.inArray(item, domains) === -1) check = true;
                // Check item data for all data sources
                else if (DS.getDomainsGlobalData()[item] === undefined ||
                    DS.getDomainsMetricsData()[item] === undefined) {
                    check = false;
                    return false;
                }
                else check = true;
            }

            else if (filter === "projects") {
                var projects = DS.getProjectsData();
                // No data for projects
                if (projects.length === 0) check = true;
                // Projects available
                else if ($.inArray(item, projects) === -1) check = true;
                // Check item data for all data sources
                else if (DS.getProjectsGlobalData()[item] === undefined ||
                    DS.getProjectsMetricsData()[item] === undefined) {
                    check = false;
                    return false;
                }
                else check = true;
            }
        });
        return check;
    };

    Loader.check_items = function(items, filter) {
        var check = true;
        $.each(items, function(id, item) {
            if (Loader.check_item (item, filter) === false) {
                check = false;
                return false;
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
        if (filter === "domains")
            if (DS.getDomainsData() === null) return false;
        if (filter === "projects")
            if (DS.getProjectsData() === null) return false;
        // No data
        var total = 0;
        if (filter === "repos") total = DS.getReposData().length;
        if (filter === "companies") total = DS.getCompaniesData().length;
        if (filter === "countries") total = DS.getCountriesData().length;
        if (filter === "domains") total = DS.getDomainsData().length;
        if (filter === "projects") total = DS.getProjectsData().length;
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
            } else if (filter === "domains") {
                var domain = DS.getDomainsData()[i];
                Loader.data_load_item (domain, DS, page, cb, "domains");
            } else if (filter === "projects") {
                var project = DS.getProjectsData()[i];
                Loader.data_load_item (project, DS, page, cb, "projects");
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
            if (Loader.check_people_item(upeople_id)) cb(upeople_id);
        }).fail(function() {
            DS.addPeopleMetricsData(upeople_id, [], DS);
            DS.addPeopleGlobalData(upeople_id, [], DS);
            if (Loader.check_people_item(upeople_id)) cb(upeople_id);
        });
    };

    function getFilterSuffix(filter) {
        var filter_suffix = '';
        if (filter === "repos") {
            filter_suffix = 'rep';
        }
        else if (filter === "companies") {
            filter_suffix = 'com';
        }
        else if (filter === "countries") {
            filter_suffix = 'cou';
        }
        else if (filter === "domains") {
            filter_suffix = 'dom';
        }
        else if (filter === "projects") {
            filter_suffix = 'prj';
        }
        return filter_suffix;
    }

    // TODO: Only companies supported yet, but ready for all items!
    Loader.data_load_item_top = function (item, DS, page, cb, filter) {
        var file_top = DS.getDataDir() + "/"+ item +"-" + DS.getName();
        file_top += "-" + getFilterSuffix(filter) + "-top-";
        if (DS.getName() === "scm") file_top += "authors";
        else if (DS.getName() === "its") file_top += "closers";
        else if (DS.getName() === "mls") file_top += "senders";
        // scr, irc, mediawiki not supported yet
        else return;
        file_top += ".json";
        $.when($.getJSON(file_top)).done(function(top) {
            if (filter === "companies") {
                DS.addCompanyTopData(item, top);
            }
        }).fail(function() {
            if (filter === "companies") {
                DS.addCompanyTopData(item, []);
            }
        }).always(function() {
            if (Loader.check_item (item, filter)) {
                if (!cb.called_item) cb(filter);
                cb.called_item = true;
            }
        });
    };

    // Load an item JSON data. If in a page, check all items read and cb.
    // TODO: A bit complex now, we should break it in different functions
    Loader.data_load_item = function (item, DS, page, cb, filter, items_map) {
        var ds_not_supported_countries = ['irc','mediawiki'];
        var ds_not_supported_companies = ['irc','mediawiki'];
        var ds_not_supported_domains = ['irc','mediawiki'];
        var ds_not_supported_repos = ['mediawiki'];
        var ds_not_supported_projects = ['irc','mediawiki'];

        if (filter === "repos") {
            if ($.inArray(DS.getName(),ds_not_supported_repos)>-1) {
                DS.addRepoMetricsData(item, [], DS);
                DS.addRepoGlobalData(item, [], DS);
                return;
            }
        }
        else if (filter === "companies") {
            if ($.inArray(DS.getName(),ds_not_supported_companies)>-1) {
                DS.addCompanyMetricsData(item, [], DS);
                DS.addCompanyGlobalData(item, [], DS);
                return;
            }
        }
        else if (filter === "countries") {
            if ($.inArray(DS.getName(),ds_not_supported_countries)>-1) {
                DS.addCountryMetricsData(item, [], DS);
                DS.addCountryGlobalData(item, [], DS);
                return;
            }
        }
        else if (filter === "domains") {
            if ($.inArray(DS.getName(),ds_not_supported_domains)>-1) {
                DS.addDomainMetricsData(item, [], DS);
                DS.addDomainGlobalData(item, [], DS);
                return;
            }
        }
        else if (filter === "projects") {
            if ($.inArray(DS.getName(),ds_not_supported_projects)>-1) {
                DS.addDomainMetricsData(item, [], DS);
                DS.addDomainGlobalData(item, [], DS);
                return;
            }
        }
        else return;
        var item_uri = encodeURIComponent(item);
        var file = DS.getDataDir()+"/"+item_uri+"-";
        file += DS.getName() + "-" + getFilterSuffix(filter);
        var file_evo = file +"-evolutionary.json";
        var file_static = file +"-static.json";
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
            } else if (filter === "domains") {
                DS.addDomainMetricsData(item, evo[0], DS);
                DS.addDomainGlobalData(item, global[0], DS);
            } else if (filter === "projects") {
                DS.addProjectMetricsData(item, evo[0], DS);
                DS.addProjectGlobalData(item, global[0], DS);
            }

        }).always(function() {
            // Check all items for a page
            if (page !== null) {
                if (Loader.check_filter_page (page, filter)) {
                    if (cb.called_page === undefined) {
                        cb.called_page = {};
                        cb.called_page[filter] = true;
                        cb(filter);
                    }
                    else if (!cb.called_page[filter]) {
                        cb(filter);
                        cb.called_page[filter] = true;
                    }
                }
            } 
            // Check all items for repositories mapping
            else if (items_map !== null) {
                if (Loader.check_items (items_map, filter)) {
                    if (cb.called_map === undefined) {
                        cb.called_map = {};
                        cb.called_map[filter] = true;
                        cb(filter);
                    }
                    else if (!cb.called_map[filter]) {
                        cb(filter);
                        cb.called_map[filter] = true;
                    }
                }
            }
            // Check just one item
            else {
                if (Loader.check_item (item, filter)) {
                    if (cb.called_item === undefined) {
                        cb.called_item = {};
                        cb.called_item[filter] = true;
                        cb(filter, item);
                    }
                    else if (!cb.called_item[filter]) {
                        cb(filter, item);
                        cb.called_item[filter] = true;
                    }
                }
            }
        });
    };

    function data_load_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDataFile(), DS.setData, DS);
            data_load_file(DS.getGlobalDataFile(), DS.setGlobalData, DS);
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

    function data_load_people_identities() {
        data_load_file(Report.getDataDir()+"/people.json", Report.setPeopleIdentities);
    }

    function check_companies_loaded(DS) {
        if (DS.getCompaniesData() === null) return false;
        return true;
    }

    function check_repos_loaded(DS) {
        if (DS.getReposData() === null) return false;
        return true;
    }

    function check_countries_loaded(DS) {
        if (DS.getCountriesData() === null) return false;
        return true;
    }

    function check_domains_loaded(DS) {
        if (DS.getDomainsData() === null) return false;
        return true;
    }

    function check_projects_loaded(DS) {
        if (DS.getProjectsData() === null) return false;
        return true;
    }

    // These are global projects, not projects inside a single report
    function check_meta_projects_loaded() {
        var projects_loaded = 0;
        var projects_data = Report.getProjectsData();
        var projects_dirs = Report.getProjectsDirs();
        for (var key in projects_data) {projects_loaded++;}
        if (projects_loaded < projects_dirs.length ) return false;
        return true;
    }

    function check_data_loaded_global() {
        var check = true;
        if (Report.getProjectData() === null || Report.getVizConfig() === null)
            return false;

        if (Report.getConfig() === null)
            if (Report.getMarkers() === null) return false;

        if (Report.getReposMap() === null) return false;

        // Multiproject not support in config.json report
        if (Report.getConfig() === null)
            if (!(check_meta_projects_loaded())) return false;

        var data_sources = Report.getDataSources();
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) {check = false; return false;}
            if (DS.getGlobalData() === null) {check = false; return false;}
            if (DS.getGlobalTopData() === null) {check = false; return false;}
            if (DS.getDemographicsData().aging === undefined ||
                DS.getDemographicsData().birth === undefined)
                {check = false; return false;}
            if (DS.getName() === "its")
                if (DS.getTimeToFixData() === null) {check = false; return false;}
            if (DS.getName() === "mls")
                if (DS.getTimeToAttentionData() === null) {check = false; return false;}
        });
        return check;
    }

    Loader.check_data_loaded = function() {
        var check = true;

        if (!(check_data_loaded_global())) return false;

        var data_sources = Report.getDataSources();
        var active_reports = ['companies','repositories','countries', 'domains', 'projects'];
        if (Report.getConfig() !== null && Report.getConfig().reports !== undefined)
            active_reports = Report.getConfig().reports;
        $.each(data_sources, function(index, DS) {
            if (DS.getPeopleData() === null) {check = false; return false;}
            if ($.inArray('companies', active_reports) > -1) 
                if (!check_companies_loaded(DS)) {check = false; return false;}
            if ($.inArray('repositories', active_reports) > -1)
                if (!check_repos_loaded(DS)) {check = false; return false;}
            if ($.inArray('countries', active_reports) > -1)
                if (!check_countries_loaded(DS)) {check = false; return false;}
            if ($.inArray('domains', active_reports) > -1)
                if (!check_domains_loaded(DS)) {check = false; return false;}
            if ($.inArray('projects', active_reports) > -1)
                if (!check_projects_loaded(DS)) {check = false; return false;}
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
                if (data_callbacks[j].called !== true) data_callbacks[j]();
                data_callbacks[j].called = true;
            }
        }
    }
})();

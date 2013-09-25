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
 *   Daniel Izquierdo Cortazar <dizquierdo@bitergia.com>
 *   Luis Cañas <lcanas@bitergia.com>
 *
 */

if (Report === undefined) var Report = {};

(function() {

    // Shared config
    var project_data = null, markers = null, config = null, 
        gridster = {}, data_sources = [], html_dir="";
    var data_dir = "data/json";
    var default_data_dir = "data/json";
    var default_html_dir = "";
    var projects_dirs = [default_data_dir];
    var projects_data = {};
    var projects_datasources = {};
    var repos_map = {};
    var project_file = data_dir + "/project-info.json",
        config_file = data_dir + "/viz_cfg.json",
        markers_file = data_dir + "/markers.json",
        repos_map_file = data_dir + "/repos-map.json";
    var page_size = 10;
    
    var legacy = false; //  support old divs API

    // Public API
    Report.convertBasicDivs = convertBasicDivs;
    Report.convertBasicDivsMisc = convertBasicDivsMisc;
    Report.convertTop = convertTop;
    Report.convertDemographics = convertDemographics;
    Report.convertEnvision = convertEnvision;
    Report.convertPeople = convertPeople;
    Report.convertStudy = convertStudy;
    Report.convertSelectors = convertSelectors;
    Report.createDataSources = createDataSources;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getConfig = getConfig;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getPageSize = function() {return page_size;};
    Report.setPageSize = function(size) {page_size = size;};
    Report.getProjectData = getProjectData;
    Report.getProjectsData = getProjectsData;
    Report.getBasicDivs = function() {
        return basic_divs;
    };
    Report.getBasicDivsMisc = function() {
        return basic_divs_misc;
    }; 
    Report.displayReportData = displayReportData;
    Report.convertStudies = convertStudies;
    Report.getDataSources = function() {
        // return data_sources.slice(0,3);
        return data_sources;
    };
    Report.registerDataSource = function(backend) {
        data_sources.push(backend);
    };
    
    Report.setHtmlDir = function (dir) {
        html_dir = dir;
    };

    Report.getDataDir = function() {
      return data_dir;
    };

    Report.setDataDir = function(dataDir) {
        data_dir = dataDir;
        project_file = dataDir + "/project-info.json";
        config_file = dataDir + "/viz_cfg.json";
        markers_file = dataDir + "/markers.json";
        repos_mapping_file = data_dir + "/repos-mapping.json";
    };
   
    function getMarkers() {
        return markers;
    }
    
    Report.setMarkers = function (data) {
        markers = data;
    };    
    Report.getMarkersFile = function () {
        return markers_file;
    };
    
    Report.getReposMap = function() {
        return repos_map;
    };    
    Report.setReposMap = function (data) {
        repos_map = data;
    };    
    Report.getReposMapFile = function () {
        return repos_map_file;
    };
    Report.getValidRepo = function (repo, ds) {
        var valid_repo = null;
        var repos = ds.getReposGlobalData();
        if (repos[repo]) return repo;
        // Search for a mapping repository
        $.each(Report.getReposMap(), function (repo_name, repo_map) {
            var test_repo = null;
            if (repo_name === repo) {
                test_repo = repo_map;
                if (repos[test_repo]!== undefined) {
                    valid_repo = test_repo;
                    return false;
                }
            } else if (repo_map === repo) {
                test_repo = repo_name;
                if (repos[test_repo]!== undefined) {
                    valid_repo = test_repo;
                    return false;
                }
            }
        });
        return valid_repo;
    };

    function getConfig() {
        return config;
    }
    
    Report.setConfig = function(cfg) {
        config = cfg;
    };
    
    Report.getConfigFile = function() {
        return config_file;
    };

    function getGridster() {
        return gridster;
    }

    function setGridster(grid) {
        gridster = grid;
    }

    function getProjectData() {
        return project_data;
    }
    
    Report.setProjectData = function(data) {
        project_data = data;
    };
    
    Report.getProjectFile = function () {
        return project_file;
    };

    function getProjectsData() {
        return projects_data;
    }
    
    Report.getProjectsDirs = function () {
        return projects_dirs;
    };
    
    Report.setProjectsDirs = function (dirs) {
        projects_dirs = dirs;
    };

    
    Report.getProjectsList = function () {
        var projects_list = [];
        $.each(getProjectsData(), function (key,val) {
            projects_list.push(key);
        });
        return projects_list;
    };
    
    Report.getProjectsDataSources = function () {
      return projects_datasources;
    };
    
    Report.setMetricsDefinition = function(metrics) {
        $.each(Report.getDataSources(), function(i, DS) {
           DS.setMetricsDefinition(metrics[DS.getName()]); 
        });
    };
    
    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
    Report.getParameterByName = function(name) {
        // _jshint_ does not like it
        // name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); 
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    function getMetricDS(metric_id) {
        var ds = [];
        $.each(Report.getDataSources(), function(i, DS) {
            if (DS.getMetrics()[metric_id]) {
                ds.push(DS);
            }
        });
        return ds;
    }

    function getAllMetrics() {
        var all = {};
        $.each(Report.getDataSources(), function(index, DS) {
            all = $.extend({}, all, DS.getMetrics());
        });
        return all;
    }
    
    function displayActiveMenu() {
        var active = window.location.href;
        var page = active.substr(active.lastIndexOf("/")+1,active.length);
        page = page.split(".html")[0];
        if (page.indexOf('scm') === 0) {
            $(".scm-menu")[0].className = $(".scm-menu")[0].className + " active"; 
        } else if (page.indexOf('its') === 0) {
            $(".its-menu")[0].className = $(".its-menu")[0].className + " active";
        } else if (page.indexOf('mls') === 0) {
            $(".mls-menu")[0].className = $(".mls-menu")[0].className + " active";
        } else if (page.indexOf('demographics') === 0) {
            $(".demographics-menu")[0].className = 
                $(".demographics-menu")[0].className + " active";
        } else if (page.indexOf('scr') === 0) {
            $(".scr-menu")[0].className = 
                $(".scr-menu")[0].className + " active";
        } else if (page.indexOf('index') === 0 || page === '') {
            $(".summary-menu")[0].className = 
                $(".summary-menu")[0].className + " active";
        } else {
            if ($(".experimental-menu")[0])
                $(".experimental-menu")[0].className = 
                $(".experimental-menu")[0].className + " active";
        }
    }

    function displayReportData() {
        data = project_data;
        document.title = data.project_name + ' Report by Bitergia';
        if (data.title) document.title = data.title;
        $(".report_date").text(data.date);
        $(".report_name").text(data.project_name);
        str = data.blog_url;
        if (str && str.length > 0) {
            $('#blogEntry').html(
                    "<br><a href='" + str
                            + "'>Blog post with some more details</a>");
            $('.blog_url').attr("href", data.blog_url);
        } else {
            $('#more_info').hide();
        }
        str = data.producer;
        if (str && str.length > 0) {
            $('#producer').html(str);
        } else {
            $('#producer').html("<a href='http://bitergia.com'>Bitergia</a>");
        }
        $(".project_name").text(data.project_name);
        $("#project_url").attr("href", data.project_url);
    }

    function checkDynamicConfig() {
        var data_sources = [];
        
        function getDataDirs(dirs_config) {
            var full_params = dirs_config.split ("&");
            var dirs_param = $.grep(full_params,function(item, index) {
                return (item.indexOf("data_dir=") === 0);
            });
            for (var i=0; i< dirs_param.length; i++) {                
                var data_dir = dirs_param[i].split("=")[1];
                data_sources.push(data_dir);
                if (i === 0) Report.setDataDir(data_dir);
            }             
        }
        
        var querystr = window.location.search.substr(1);
        // Config in GET URL
        if (querystr && querystr.indexOf("data_dir")>=0) {
            getDataDirs(querystr);
            if (data_sources.length>0)
                Report.setProjectsDirs(data_sources);
        }
    }
    
    function createDataSources() {
        checkDynamicConfig();
        
        var projects_dirs = Report.getProjectsDirs(); 

        $.each(projects_dirs, function (i, project) {
            // TODO: Only DS with data should exist
            var its = new ITS();
            Report.registerDataSource(its);
            var mls = new MLS();        
            Report.registerDataSource(mls);        
            var scm = new SCM();
            Report.registerDataSource(scm);
            var scr = new SCR();
            Report.registerDataSource(scr);
            var irc = new IRC();
            Report.registerDataSource(irc);
        
            its.setDataDir(project);
            mls.setDataDir(project);
            scm.setDataDir(project);
            scr.setDataDir(project);
            irc.setDataDir(project);
            scm.setITS(its);
        });
        
        return true;
    }

    // Include divs to be convertad later
    var template_divs = {
        "microdash": {
            convert: function() {
                var divs = $(".microdash");
                if (divs.length > 0) {
                    $.each(divs, function(id, div) {
                        var metric = $(this).data('metric');
                        var ds = getMetricDS(metric)[0];
                        var total = ds.getGlobalData()[metric];
                        var html = '<div>';
                        html += '<div style="float:left">';
                        html += '<h4>'+total+' '+ds.getMetrics()[metric].name+'</h4>';
                        html += '</div>';
                        html += '<div id="microdash" '+
                                'class="MetricsEvol" data-data-source="'+ds.getName()+'" data-metrics="'+
                                metric+'" data-min=true style="margin-left:10px; float:left;width:100px; height:25px;"></div>';
                        html += '<div style="clear:both"></div><div>';
                        $.each({7:'week',30:'month',365:'year'}, function(period, name) {
                            var value = ds.getGlobalData()[metric+"_"+period];
                            var value2 = ds.getGlobalData()[metric+"_"+(period*2)];
                            var old_value = value2-value;
                            html += "<em>"+name+"</em>:"+value+"&nbsp;";
                            var inc = parseInt(((value-old_value)/old_value)*100,null);
                            if (value === old_value) {
                                html += '';
                            }
                            else if (value > old_value) {
                                html += '<i class="icon-circle-arrow-up"></i>';
                                html += '<small>('+inc+'%)</small>&nbsp;';
                            } else if (value < old_value) {
                                html += '<i class="icon-circle-arrow-down"></i>';
                                html += '<small>('+inc+'%)</small>&nbsp;';
                            }
                            
                        });
                        html += '</div>';
                        html += '<div>';
                        $(div).append(html);
                    });
                }
            }
        },
        // TODO: share logic between three periods duration
        "microdash2": {
            convert: function() {
                var divs = $(".microdash2");
                if (divs.length > 0) {
                    $.each(divs, function(id, div) {
                        var metric = $(this).data('metric');
                        var ds = getMetricDS(metric)[0];
                        var total = ds.getGlobalData()[metric];
                        var change7 = ds.getGlobalData()[metric+"_7"];
                        //initial square: total
                        var html = '<div class="row-fluid"><div class="span3">';
                        html += '<h4>'+total+'</h4> '+ds.getMetrics()[metric].name;
                        html += '</div><!--span3-->';
                         
                        //second square: arrow + % for last 7 days
                        html += '<div class="span3">';
                        var value = ds.getGlobalData()[metric+"_7"];
                        var value2 = ds.getGlobalData()[metric+"_14"];
                        var old_value = value2 - value;
                        var inc = parseInt(((value-old_value)/old_value)*100,null);
                        if (inc > 0) inc = '+' + inc;
                        if (value === old_value) {
                            html += '';
                        }
                        else if (value > old_value) {
                            html += '<i class="icon-circle-arrow-up"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        } else if (value < old_value) {
                            html += '<i class="icon-circle-arrow-down"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        }
                        html += '<br><span class="dayschange">7 Days Change</span>';
                        html += '</div><!--span3-->';

                        //third square: arrow + % for last 30 days
                        html += '<div class="span3">';
                        value = ds.getGlobalData()[metric+"_30"];
                        value2 = ds.getGlobalData()[metric+"_60"];
                        old_value = value2 - value;
                        inc = parseInt(((value-old_value)/old_value)*100,null);
                        if (inc > 0) inc = '+' + inc;
                        if (value === old_value) {
                            html += '';
                        }
                        else if (value > old_value) {
                            html += '<i class="icon-circle-arrow-up"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        } else if (value < old_value) {
                            html += '<i class="icon-circle-arrow-down"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        }
                        html += '<br><span class="dayschange">30 Days Change</span>';
                        html += '</div><!--span3-->';
                        
                        //fourth square: arrow + % for last 365 days
                        html += '<div class="span3">';
                        value = ds.getGlobalData()[metric+"_365"];
                        value2 = ds.getGlobalData()[metric+"_730"];
                        old_value = value2 - value;
                        inc = parseInt(((value-old_value)/old_value)*100,null);
                        if (inc > 0) inc = '+' + inc;
                        if (value === old_value) {
                            html += '';
                        }
                        else if (value > old_value) {
                            html += '<i class="icon-circle-arrow-up"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        } else if (value < old_value) {
                            html += '<i class="icon-circle-arrow-down"></i>&nbsp;';
                            html += old_value + '<span class="fppercent">&nbsp;('+inc+'%)</span>&nbsp;';
                        }
                        html += '<br><span class="dayschange">365 Days Change</span>';
                        html += '</div><!--span3-->';   

                        html += '</div><!--row-fluid-->';
                        $(div).append(html);
                    });
                }
            }
        }
    };
    
    Report.addDataDir = function () {
        var addURL;
        var querystr = window.location.search.substr(1);
        if (querystr && querystr.indexOf("data_dir")!==-1) {
            addURL = window.location.search.substr(1);
        }
        return addURL;
    };
        
    var basic_divs = {
        "navigation": {
            convert: function() {
                $.get(html_dir+"navigation.html", function(navigation) {
                    $("#navigation").html(navigation);
                    var addURL = Report.addDataDir(); 
                    if (addURL) {
                        var $links = $("#navigation a");
                        $.each($links, function(index, value){
                            if (value.href.indexOf("data_dir")!==-1) return;
                            value.href += "?"+addURL;
                        });
                    }
                });                
            }
        },
        "navbar": {
            convert: function() {
                $.get(html_dir+"navbar.html", function(navigation) {
                    $("#navbar").html(navigation);
                    displayReportData();
                    displayActiveMenu();
                    var addURL = Report.addDataDir(); 
                    if (addURL) {                    
                        var $links = $("#navbar a");
                        $.each($links, function(index, value){
                            if (value.href.indexOf("data_dir")!==-1) return;
                            value.href += "?"+addURL;
                        });
                    }
                });                
            }
        },
        "header": {
            convert: function() {
                $.get(html_dir+"header.html", function(header) {
                    $("#header").html(header);
                    displayReportData();
                    var addURL = Report.addDataDir();
                    if (addURL) {                    
                        var $links = $("#header a");
                        $.each($links, function(index, value){
                            if (value.href.indexOf("data_dir")!==-1) return;
                            value.href += "?"+addURL;
                        });
                    }
                });
            }
        },
        "footer": {
            convert: function() {
                $.get(html_dir+"footer.html", function(footer) {
                    $("#footer").html(footer);
                    $("#vizjs-lib-version").append(vizjslib_git_tag);
                });
            }
        },
        // Reference card with info from all data sources
        "refcard": {
            convert: convertRefcard
        },
        "global-data": {
            convert: convertGlobalNumbers
        },
        "summary": {
            convert: function() {
                div_param = "summary";
                var divs = $("." + div_param);
                if (divs.length > 0) {
                    $.each(divs, function(id, div) {
                        var ds = $(this).data('data-source');
                        var DS = getDataSourceByName(ds);
                        if (DS === null) return;
                        DS.displayGlobalSummary(div.id);
                    });
                }
                if (legacy) Report.convertSummaryLegacy();
            }
        }
    };
    
    var basic_divs_misc = {
        "radar-activity": {
            convert: function() {
                Viz.displayRadarActivity('radar-activity');
            }
        },
        "radar-community": {
            convert: function() {
                Viz.displayRadarCommunity('radar-community');
            }
        },
        "treemap": {
            convert: function() {
                var file = $('#treemap').data('file');
                Viz.displayTreeMap('treemap', file);
            }
        },
        "bubbles": {
            convert: function() {
                $.each(Report.getDataSources(), function(index, DS) {
                    if (DS.getData().length === 0) return;
            
                    var div_time = DS.getName() + "-time-bubbles";
                    if ($("#" + div_time).length > 0) {
                        var radius = $("#" + div_time).data('radius');
                        DS.displayBubbles(div_time, radius);
                    }
                });        
            }
        }
    };
    
    // Legacy widgets to be removed in the future
    var basic_divs_legacy = {
        "gridster": {
            convert: function() {
                var gridster = $("#gridster").gridster({
                    widget_margins : [ 10, 10 ],
                    widget_base_dimensions : [ 140, 140 ]
                }).data('gridster');
    
                Report.setGridster(gridster);
                gridster.add_widget("<div id='metric_selector'></div>", 1, 3);
                Viz.displayGridMetricSelector('metric_selector');
                Viz.displayGridMetricAll(true);
            }
        }
    };
    
    function convertActivity() {
        var all_metrics = Report.getAllMetrics();
        var label = null;
        function activityInfo(div, period, label) {
            var html = "<h4>Last "+ label + "</h4>";
            $.each(Report.getDataSources(), function(index, DS) {
                var data = DS.getGlobalData();
                $.each(data, function (key,val) {
                    var suffix = "_"+period; 
                    if (key.indexOf(suffix, key.length - suffix.length) !== -1) {
                        var metric = key.substring(0, key.length - suffix.length);
                        label = metric;
                        if (all_metrics[metric]) label = all_metrics[metric].name;
                        html += label + ":" + data[key] + "<br>";
                    }
                });
            });  
            $(div).append(html);
        }        
        var divs = $(".activity");
        var period = null;
        var days = {"Week":7,"Month":30,"Quarter":90,"Year":365};
        if (divs.length > 0)
            $.each(divs, function(id, div) {
                period = $(div).data('period');
                activityInfo(div, days[period], period);
            });
    }        
    
    // Needed for callback from Loader
    Report.convertRepos = function() {
        convertStudy('repos');
    };
           
    function convertStudy(type) {
        var config_metric = {};      
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        
        var data_ready = true;
        var repo_valid = null;
        var repo = null, country = null, company = null, divs = null, divlabel = null;
        
        if (type === "repos") repo = Report.getParameterByName("repository");
        if (type === "countries") country = Report.getParameterByName("country");
        if (type === "companies") company = Report.getParameterByName("company");
        var page = Report.getParameterByName("page");
        
        // TODO: On demand loading only for repos yet
        if (type === "repos") {
            if (Loader.check_repos_page(page) === false) {
                data_ready = false;
            }
        }
        
        if (data_ready === false) {
            $.each(Report.getDataSources(), function(index, DS) {
                if (type === "repos")
                    Loader.data_load_repos_page(DS, page, Report.convertRepos);
            });
            return;
        }
        if (type === "repos") divlabel = "ReposSummary";
        if (type === "countries") divlabel = "CountriesSummary";
        if (type === "companies") divlabel = "CompaniesSummary";
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                div.id = ds+"-"+divlabel;
                if (type === "repos")
                    DS.displayReposSummary(div.id, DS);
                if (type === "countries")
                    DS.displayCountriesSummary(div.id, DS);
                if (type === "companies")
                    DS.displayCompaniesSummary(div.id, DS);
            });
        }
        
        if (type === "repos") divlabel = "ReposGlobal";
        if (type === "countries") divlabel = "CountriesGlobal";
        if (type === "companies") divlabel = "CompaniesGlobal";
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;        
                var metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var show_others = $(this).data('show-others');
                var order_by = $(this).data('order-by');
                config_metric.show_legend = $(this).data('legend');
                if ($('#'+$(this).data('legend-div')).length>0) {
                    config_metric.legend = {
                    container: $(this).data('legend-div')};
                } else config_metric.legend = {container: null};
                config_metric.graph = $(this).data('graph');
                div.id = metric+"-"+divlabel;
                if (type === "repos")
                    DS.displayBasicMetricReposStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
                if (type === "countries")
                    DS.displayBasicMetricCountriesStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
                if (type === "companies")
                    DS.displayBasicMetricCompaniesStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
            });
        }

        if (type === "repos") divlabel = "ReposNav";
        if (type === "countries") divlabel = "CountriesNav";
        if (type === "companies") divlabel = "CompaniesNav";
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var order_by = $(this).data('order-by');
                var scm_and_its = $(this).data('scm-and-its');
                div.id = ds+"-"+divlabel;
                if (type === "repos")
                    DS.displayReposNav(div.id, order_by, page, scm_and_its);
                if (type === "countries")
                    DS.displayCountriesNav(div.id, order_by, page, scm_and_its);
                if (type === "companies")
                    DS.displayCompaniesNav(div.id, order_by);
            });
        }
        
        if (type === "repos") divlabel = "ReposList";
        if (type === "countries") divlabel = "CountriesList";
        if (type === "companies") divlabel = "CompaniesList";
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var metrics = $(this).data('metrics');
                var order_by = $(this).data('order-by');
                var scm_and_its = $(this).data('scm-and-its');
                var show_links = true; 
                if ($(this).data('show_links') !== undefined) 
                    show_links = $(this).data('show_links');
                div.id = metrics.replace(/,/g,"-")+"-"+divlabel;
                if (type === "repos")
                    DS.displayReposList(metrics.split(","),div.id, 
                        config_metric, order_by, page, scm_and_its, show_links);
                if (type === "countries")
                    DS.displayCountriesList(metrics.split(","),div.id, 
                        config_metric, order_by, show_links);
                if (type === "companies")
                    DS.displayCompaniesList(metrics.split(","),div.id,
                        config_metric, order_by, show_links);
            });
        }

        if (type === "repos") divlabel = "ReposCompare";
        if (type === "countries") divlabel = "CountriesCompare";
        if (type === "companies") divlabel = "CompaniesCompare";
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var order_by = $(this).data('order-by');
                var stacked = false;
                if ($(this).data('stacked')) stacked = true;
                config_metric.lines = {stacked : stacked};
                div.id = metric+"-"+divlabel;
                if (type === "companies")
                    DS.displayBasicMetricCompanies(metric,div.id,
                        config_metric, limit, order_by);
                if (type === "repos")
                    DS.displayBasicMetricRepos(metric,div.id,
                        config_metric, limit, order_by);
            });
        }

        
        // TODO: This repos logic should be adapted
        //if (repo !== null) repo_valid = Report.getValidRepo(repo, DS);
        //if (repo_valid === null) $("#"+DS.getName()+"-repo").hide();
        //else {
        
        var item = null;
        if (type === "repos") item = repo;
        if (type === "countries") item = country;
        if (type === "companies") item = company;
        
        if (type === "repos") divlabel = "RepoRefcard";
        if (type === "countries") divlabel = "CountryRefcard";
        if (type === "companies") divlabel = "CompanyRefcard";
        divs = $("."+divlabel);
        if (item !== null && divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                div.id = ds+"-"+divlabel;
                if (type === "repos")
                    DS.displayRepoSummary(div.id, repo, DS);
                if (type === "countries")
                    DS.displayCountrySummary(div.id, country, DS);
                if (type === "companies")
                    DS.displayCompanySummary(div.id, company, DS);
            });
        }

        if (type === "repos") divlabel = "RepoMetrics";
        if (type === "countries") divlabel = "CountryMetrics";
        if (type === "companies") divlabel = "CompanyMetrics";
        divs = $("."+divlabel);
        if (item !== null && divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var metrics = $(this).data('metrics');                        
                config.show_legend = false;
                config.frame_time = false;
                if ($(this).data('legend')) 
                    config_metric.show_legend = true;
                if ($(this).data('frame-time')) 
                    config_metric.frame_time = true;
                div.id = metrics.replace(/,/g,"-")+"-"+divlabel;
                if (type === "repos")
                    DS.displayBasicMetricsRepo(repo, metrics.split(","),
                        div.id, config_metric);
                if (type === "countries")
                    DS.displayBasicMetricsCountry(country, metrics.split(","),
                        div.id, config_metric);
                if (type === "companies")
                    DS.displayBasicMetricsCompany(company, metrics.split(","),
                        div.id, config_metric);
            });
        }

        if (type === "repos") divlabel = "RepoTop";
        if (type === "countries") divlabel = "CountryTop";
        if (type === "companies") divlabel = "CompanyTop";        
        divs = $("."+divlabel);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var metric = $(this).data('metric');
                var period = $(this).data('period');
                var titles = $(this).data('titles');
                div.id = metric+"-"+period+"-"+divlabel;
                div.className = "";
                // Only for Company yet
                if (type === "companies")
                    DS.displayTopCompany(company,div.id,metric,period,titles);
            });
        }

        if (legacy) {
            if (type === "repos") Report.convertReposLegacy();
            if (type === "countries") Report.convertCountriesLegacy();
            if (type === "companies") Report.convertCompaniesLegacy();
        }        
    }

    function convertPeople(upeople_id, upeople_identifier) {
        var config_metric = {};                
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        
        if (upeople_id === undefined)
            upeople_id = Report.getParameterByName("id");
        if (upeople_identifier === undefined)
            upeople_identifier = Report.getParameterByName("name");

        if (upeople_id === undefined) return;

        var divs = $(".PeopleRefcard");
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                div.id = ds+"-refcard-people";
                DS.displayPeopleSummary(div.id, upeople_id, upeople_identifier, DS);
            });
        }
        
        divs = $(".PeopleMetrics");
        if (divs.length) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                var metrics = $(this).data('metrics');
                config.show_legend = false;
                if ($(this).data('legend')) config_metric.show_legend = true;
                div.id = metrics.replace(/,/g,"-")+"-people-metrics";
                DS.displayBasicMetricsPeople(upeople_id, upeople_identifier, metrics.split(","),
                        div.id, config_metric);
            });
        }
        
        if (legacy) Report.convertPeopleLegacy(upeople_id, upeople_identifier);
    }

    function getDataSourceByName(ds) {
        var DS = null;
        $.each(Report.getDataSources(), function(index, DSaux) {
            if (DSaux.getName() === ds) {DS = DSaux; return false;}
        });
        return DS;
    }
    
    Report.convertBasicMetrics = function(config) {
        // General config for metrics viz
        var config_metric = {};
                
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
    
        if (config) {
            $.each(config, function(key, value) {
                config_metric[key] = value;
            });
        }

        // Metrics evolution
        var div_param = "MetricsEvol";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var config_viz = {};
                $.each(config_metric, function(key, value) {
                    config_viz[key] = value;
                });

                var metrics = $(this).data('metrics');
                var ds = $(this).data('data-source');
                var DS = getDataSourceByName(ds);
                if (DS === null) return;
                config_viz.help = true;
                var help = $(this).data('help');
                if (help !== undefined) config_viz.help = help;
                config_viz.show_legend = false;
                if ($(this).data('legend'))
                    config_viz.show_legend = true;
                if ($(this).data('frame-time'))
                    config_viz.frame_time = true;
                if ($(this).data('min')) {
                    config_viz.show_legend = false;
                    config_viz.show_labels = false;
                    config_viz.show_grid = false;
                    // config_viz.show_mouse = false;
                    config_viz.help = false;
                }
                div.id = metrics.replace(/,/g,"-")+"-"+ds+"-metrics-evol-"+this.id;
                DS.displayMetricsEvol(metrics.split(","),div.id,
                        config_viz, $(this).data('convert'));
            });
        }
       // Time to fix
        var div_ttfix = "TimeToFix";
        divs = $("."+div_ttfix); 
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var ds = $(this).data('data-source');
                var DS = getDataSourceByName(ds);
                if (DS === null) return;
                var quantil = $(this).data('quantil');
                div.id = ds+"-time-to-fix-"+quantil;
                DS.displayTimeToFix(div.id, quantil);
            });
        }
        // Time to attention
        var div_ttatt = "TimeToAttention";
        divs = $("."+div_ttatt); 
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var ds = $(this).data('data-source');
                var DS = getDataSourceByName(ds);
                if (DS === null) return;
                var quantil = $(this).data('quantil');
                div.id = ds+"-time-to-attention-"+quantil;
                DS.displayTimeToAttention(div.id, quantil);
            });
        }
        
        if (legacy) Report.convertFlotr2();
    };
    
    function convertEnvision() {    
        if ($("#EnvisionAll").length > 0) {
            var relative = $('#EnvisionAll').data('relative');
            var legend = $('#EnvisionAll').data('legend-show');
            var summary_graph = $('#EnvisionAll').data('summary-graph');
            Viz.displayEnvisionAll('EnvisionAll', relative, legend, summary_graph);
        }
        
        div_param = "Envision";
        var divs = $("." + div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var ds = $(this).data('data-source');
                var DS = getDataSourceByName(ds);
                if (DS === null) return;
                var legend = $(this).data('legend-show');
                var relative = $(this).data('relative');
                var summary_graph = $(this).data('summary-graph');
                div.id = ds+"-envision"+this.id;
                DS.displayEnvision(div.id, relative, legend, summary_graph); 
            });
        }
        
        if (legacy) Report.convertEnvisionLegacy();
    }

    function convertTop() {    
        var div_id_top = "Top";        
        var divs = $("." + div_id_top);
        var DS, ds;
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                ds = $(this).data('data-source');
                DS = getDataSourceByName(ds);
                if (DS === null) return;
                if (DS.getData().length === 0) return;
                var show_all = false;
                if ($(this).data('show_all')) show_all = true;
                var top_metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var graph = $(this).data('graph');
                var people_links = $(this).data('people_links');
                if (!div.id) {
                    div.id = ds+"-top"+graph;
                    if (graph) div.id += "-"+graph;
                }
                DS.displayTop(div.id, show_all, top_metric, 
                              graph, limit, people_links);
            });
        }
        if (legacy) Report.convertTopLegacy();
    }

    function convertDemographics() {
        $.each(Report.getDataSources(), function(index, DS) {
            var div_demog = DS.getName() + "-demographics";
            if ($("#" + div_demog).length > 0)
                DS.displayDemographics(div_demog);
            // Specific demographics loaded from files
            var divs = $('[id^="' + DS.getName() + '-demographics"]');
            for ( var i = 0; i < divs.length; i++) {
                var file = $(divs[i]).data('file');
                // period in years
                var period = $(divs[i]).data('period');
                DS.displayDemographics(divs[i].id, file, period);
            }
        });
    }
    
    function convertRefcard() {
        $.when($.get(html_dir+"refcard.html"), 
                $.get(html_dir+"project-card.html"))
        .done (function(res1, res2) {
            refcard = res1[0];
            projcard = res2[0];

            $("#refcard").html(refcard);
            displayReportData();
            $.each(getProjectsData(), function(prj_name, prj_data) {
                var new_div = "card-"+prj_name.replace(".","").replace(" ","");
                $("#refcard #projects_info").append(projcard);
                $("#refcard #projects_info #new_card")
                    .attr("id", new_div);
                $.each(data_sources, function(i, DS) {
                    if (DS.getProject() !== prj_name) {
                        $("#" + new_div + ' .'+DS.getName()+'-info').hide();
                        return;
                    }
                    DS.displayData(new_div);
                });
                $("#"+new_div+" #project_name").text(prj_name);
                if (projects_dirs.length>1)
                    $("#"+new_div+" .project_info")
                        .append(' <a href="VizGrimoireJS/browser/index.html?data_dir=../../'+prj_data.dir+'">Report</a>');
                
                $("#"+new_div+" #project_url")
                    .attr("href", prj_data.url);
            });
        });
    }

    
    function convertSelectors() {       
        // Selectors
        $.each(Report.getDataSources(), function(index, DS) {
            var div_selector = DS.getName() + "-selector";
            var div_envision = DS.getName() + "-envision-lists";
            var div_flotr2 = DS.getName() + "-flotr2-lists";
            if ($("#" + div_selector).length > 0)
                // TODO: Only MLS supported 
                if (DS instanceof MLS) {
                    DS.displayEvoBasicListSelector(div_selector, div_envision,
                            div_flotr2);
                }
        });
    }
    
    // HTML code that will be converted later
    function convertTemplateDivs() {
        $.each (template_divs, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert();
            if ($("."+divid).length > 0) value.convert();
        });
    }

    function convertBasicDivs() {
        $.each (basic_divs, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert();
            if ($("."+divid).length > 0) value.convert();
        });
    }
    
    function convertBasicDivsMisc() {
        $.each (basic_divs_misc, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert();
            if ($("."+divid).length > 0) value.convert();
        });
    }

    function convertBasicDivsLegacy() {
        $.each (basic_divs_legacy, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert();
            if ($("."+divid).length > 0) value.convert();
        });
    }

    function convertGlobalNumbers(){
        $.each(Report.getDataSources(), function(index, DS) {
           var data = DS.getGlobalData();
           var divs = $(".global-data");
           if (divs.length > 0) {
               $.each(divs, function(id, div) {
                   var key = $(this).data('field');
                   $(this).text(data[key]);
                });
             }
       });
    }
    
    // Build mapping between Data Sources and Projects
    Report.configDataSources = function() {
        var prjs_dss = Report.getProjectsDataSources();
        $.each(Report.getDataSources(), function (index, ds) {
            if (ds.getData() instanceof Array) return;
            $.each(projects_data, function (name, project) {
                if (project.dir === ds.getDataDir()) {                    
                    if (prjs_dss[name] === undefined) prjs_dss[name] = [];
                    // Support data reloading. Each project has instance per DS
                    for (var i in prjs_dss[name]) {
                        if (ds.getName() === prjs_dss[name][i].getName()) return false;
                    }
                    // if ($.inArray(ds, prjs_dss[name]) > -1) return false;
                    ds.setProject(name);
                    prjs_dss[name].push(ds);
                    return false;
                }
            });            
        });        
    };
    
    Report.setReportConfig = function (data) {
        if (data) {
            if (data['global-html-dir'])
                Report.setHtmlDir(data['global-html-dir']);
            if (data['global-data-dir']) {
                Report.setDataDir(data['global-data-dir']);
                Report.setProjectsDirs([data['global-data-dir']]);
            }
            if (data['projects-data-dirs'])
                Report.setProjectsDirs(data['projects-data-dirs']);
        }
    };       

    Report.convertGlobal = function() {
        convertTemplateDivs();
        convertBasicDivs();
        convertBasicDivsMisc();
        Report.convertBasicMetrics(config);
        Report.convertEnvision();
        convertActivity();
        if (legacy) {
            convertBasicDivsLegacy();
            Report.convertIdentity();
        }
    };
    
    // Data available in global
    Report.convertStudiesGlobal = function() {
        convertTop();
        convertPeople(); // using on demand file loading        
    };
        
    function convertStudies() {
        convertStudy('repos');
        convertStudy('countries');
        convertStudy('companies');
        convertDemographics();
        convertSelectors();
    }    
})();

Loader.data_ready_global(function() {
    Report.configDataSources();
    Report.convertGlobal();
    Report.convertStudiesGlobal();
});

Loader.data_ready(function() {
    Report.convertStudies();
    $("body").css("cursor", "auto");
    // Popover helps system
    $('.help').popover({
        html: true,
        trigger: 'manual'
    }).click(function(e) {
        $(this).popover('toggle');
        e.stopPropagation();
    });
    $('html').click(function(e) {
        $('.help').popover('hide');
    });
});

$(document).ready(function() {
    $.getJSON('config.json', function(data) {
        Report.setReportConfig(data);
    }).always(function (data) {
        Report.createDataSources();
        Loader.data_load();
        $("body").css("cursor", "progress");
    });
});

// TODO: Hack to reload all window. Do it right only for viz!
function resizedw(){
    /* Report.convertGlobal();
    Report.convertStudies(); */
    // location.reload();
}
var resized;
$(window).resize(function () {
    clearTimeout(resized);
    resized = setTimeout(resizedw, 100);
});


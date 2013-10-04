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
    var project_data = null, markers = null, viz_config = null, 
        gridster = {}, data_sources = [], html_dir="";
    var data_dir = "data/json";
    var default_data_dir = "data/json";
    var default_html_dir = "";
    var projects_dirs = [default_data_dir];
    var projects_data = {};
    var projects_datasources = {};
    var repos_map = {};
    var project_file = data_dir + "/project-info.json",
        viz_config_file = data_dir + "/viz_cfg.json",
        markers_file = data_dir + "/markers.json",
        repos_map_file = data_dir + "/repos-map.json";
    var page_size = 10;
    
    var legacy = false; //  support old divs API

    // Public API
    Report.createDataSources = createDataSources;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getVizConfig = getVizConfig;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getPageSize = function() {return page_size;};
    Report.setPageSize = function(size) {page_size = size;};
    Report.getProjectData = getProjectData;
    Report.getProjectsData = getProjectsData;
    Report.convertStudies = convertStudies;
    Report.getLegacy = function() {return legacy;};
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
    Report.getHtmlDir = function () {
        return html_dir;
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

    function getVizConfig() {
        return viz_config;
    }
    
    Report.setVizConfig = function(cfg) {
        viz_config = cfg;
    };
    
    Report.getVizConfigFile = function() {
        return viz_config_file;
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
    
    Report.getDataSourceByName = function(ds) {
        var DS = null;
        $.each(Report.getDataSources(), function(index, DSaux) {
            if (DSaux.getName() === ds) {DS = DSaux; return false;}
        });
        return DS;
    };

    function getAllMetrics() {
        var all = {};
        $.each(Report.getDataSources(), function(index, DS) {
            all = $.extend({}, all, DS.getMetrics());
        });
        return all;
    }
    
    Report.displayActiveMenu = function() {
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
    };

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

    Report.addDataDir = function () {
        var addURL;
        var querystr = window.location.search.substr(1);
        if (querystr && querystr.indexOf("data_dir")!==-1) {
            addURL = window.location.search.substr(1);
        }
        return addURL;
    };
    
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
        if (legacy) Report.convertTemplateDivsLegacy();
        Convert.convertBasicDivs();
        Convert.convertBasicDivsMisc();
        Convert.convertBasicMetrics();
        Convert.convertMetricsEvolSet();
        Convert.convertLastActivity();
        Convert.convertMicrodash();
        Convert.convertMicrodashText();
        if (legacy) {
            Report.convertBasicDivsLegacy();
            Report.convertIdentity();
        }
    };
    
    // Data available in global
    Report.convertStudiesGlobal = function() {
        Convert.convertTop();
        Convert.convertPeople(); // using on demand file loading        
    };
        
    function convertStudies() {
        Convert.convertFilterStudy('repos');
        Convert.convertFilterStudy('countries');
        Convert.convertFilterStudy('companies');
        Convert.convertDemographics();
        if (legacy) ReportLegacy.convertSelectorsLegacy();
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


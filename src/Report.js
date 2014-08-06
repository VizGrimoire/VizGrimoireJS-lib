/* 
 * Copyright (C) 2012-2014 Bitergia
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
 *   Luis Cañas Díaz <lcanas@bitergia.com>
 *
 */

if (Report === undefined) var Report = {};

(function() {

    // Shared config
    var project_data = null, markers = null, viz_config = null, 
        gridster = {}, data_sources = [], report_config = null, html_dir="";
    var data_dir = "data/json";
    var config_dir = "config";
    var default_data_dir = "data/json";
    var default_html_dir = "";
    var projects_dirs = [default_data_dir];
    var projects_data = {};
    var projects_datasources = {};
    var repos_map;
    var project_file = config_dir + "/project-info.json",
    viz_config_file = data_dir + "/viz_cfg.json",
    markers_file = data_dir + "/markers.json",
    repos_map_file = data_dir + "/repos-map.json",
    projects_hierarchy_file = data_dir + "/projects_hierarchy.json";
    menu_elements_file = config_dir + "/menu-elements.json";
    var page_size = 10, page = null;
    var project_people_identities = {};

    // Public API
    Report.createDataSources = createDataSources;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getVizConfig = getVizConfig;
    Report.getProjectsHierarchy = getProjectsHierarchy;
    Report.getMenuElements = getMenuElements;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getCurrentPage = function() {return page;};
    Report.setCurrentPage = function(current_page) {page = current_page;};
    Report.getPageSize = function() {return page_size;};
    Report.setPageSize = function(size) {page_size = size;};
    Report.getProjectData = getProjectData;
    Report.getProjectsData = getProjectsData;
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
        projects_hierarchy_file = data_dir + "/projects_hierarchy.json";
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

    function getVizConfig() {
        return viz_config;
    }

    Report.setVizConfig = function(cfg) {
        viz_config = cfg;
    };

    Report.getVizConfigFile = function() {
        return viz_config_file;
    };

    function getProjectsHierarchy (){
        return projects_hierarchy;
    }
    Report.setProjectsHierarchy = function(data){
        projects_hierarchy = data;
    };
    Report.getProjectsHierarchyFile = function() {
        return projects_hierarchy_file;
    };

    /** menu_elements contains JSON for side menu**/
    function getMenuElements(){
	return menu_elements;
    }
    Report.setMenuElements = function(data){
	menu_elements = data;
    };
    Report.getMenuElementsFile = function() {
	return menu_elements_file;
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

    Report.getPeopleIdentities = function () {
        return project_people_identities;
    };

    Report.setPeopleIdentities = function (people) {
        project_people_identities = people;
    };

    // Extract title from repositories names
    Report.cleanLabel = function(item) {
        var label = item;
        var aux = null;

        // GlusterFS __gluster-devel.nongnu.org___
        if (item.split("___").length === 2) {
            aux = item.split(" ");
            label = aux[0];
        }
        else if (item.lastIndexOf("http") === 0 || item.split("_").length > 3) {
            aux = item.split("_");
            label = aux.pop();
            if (label === '') label = aux.pop();
            label = label.replace('buglist.cgi?product=','');
            // gmane case:
            // http%3A__dir.gmane.org_gmane.comp.sysutils.puppet.user
            label = label.replace('gmane.comp.sysutils.', '');
        }
        else if (item.lastIndexOf("<") === 0)
            label = MLS.displayMLSListName(item);

        return label;
    };

    // http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function strNumberWithThousands(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
        return parts.join(".");
    }

    // Format: 
    // numbers: 2 decimals, and ,. separators
    // strings: no format
    Report.formatValue = function(number, field) {
        if (number === undefined) return '-';
        var date_fields = ['last_date','first_date'];
        var value = number;
        try {
            // value = parseFloat(number).toFixed(2).toString().replace(/\.00$/, '');
            value = parseFloat(number).toFixed(1).toString().replace(/\.0$/, '');
            value = strNumberWithThousands(value);
            // If language is spanish exchange , and . Not rock solid logic but simple
            if (navigator.language === "es") {
                var parts = value.split(".");
                parts[0] = parts[0].replace(/,/g,".");
                value = parts.join(",");
            }
        } catch(err) {}
        if (typeof(value) === "number" && isNaN(value)) value = number.toString();
        // Don't convert date number (2012)
        if (field !== undefined && $.inArray(field, date_fields)>-1)
            value = number.toString();
        return value;
    };

    Report.escapeHtml = function(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
    Report.getParameterByName = function(name) {
        // _jshint_ does not like it
        // name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); 
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? undefined :
            Report.escapeHtml(decodeURIComponent(results[1].replace(/\+/g, " ")));
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
        } else if (page.indexOf('scr') === 0) {
            $(".scr-menu")[0].className = $(".scr-menu")[0].className + " active";
        } else if (page.indexOf('irc') === 0) {
            $(".irc-menu")[0].className = $(".irc-menu")[0].className + " active";
        } else if (page.indexOf('qaforum') === 0) {
            $(".qaforum-menu")[0].className = $(".qaforum-menu")[0].className + " active";
        } else if (page.indexOf('studies') === 0) {
            $(".studies-menu")[0].className = $(".studies-menu")[0].className + " active";
        } else if (page.indexOf('wiki') === 0) {
            $(".wiki-menu")[0].className = $(".wiki-menu")[0].className + " active";
        } else if (page.indexOf('downloads') === 0) {
            $(".downloads-menu")[0].className = $(".downloads-menu")[0].className + " active";
        } else if (page.indexOf('projects') === 0) {
            $(".listprojects-menu")[0].className = $(".listprojects-menu")[0].className + " active";
        } else if (page.indexOf('index') === 0 || page === '') {
            if ($(".summary-menu").length === 0) return;
            $(".summary-menu")[0].className =  $(".summary-menu")[0].className + " active";
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
        /* Initialize/Register data sources based on getConfig()*/
        checkDynamicConfig();

        var projects_dirs = Report.getProjectsDirs();
        var scm, its, mls, scr, irc, mediawiki, people, downloads, qaforums, releases;

        $.each(projects_dirs, function (i, project) {
            if (Report.getConfig() === null ||
                Report.getConfig()['data-sources'] === undefined) {
                its = new ITS();
                Report.registerDataSource(its);
                mls = new MLS();
                Report.registerDataSource(mls);
                scm = new SCM();
                Report.registerDataSource(scm);
                scr = new SCR();
                Report.registerDataSource(scr);
                irc = new IRC();
                Report.registerDataSource(irc);
                mediawiki = new MediaWiki();
                Report.registerDataSource(mediawiki);
                people = new People();
                Report.registerDataSource(people);
                downloads = new Downloads();
                Report.registerDataSource(downloads);
                qaforums = new QAForums();
                Report.registerDataSource(qaforums);
                releases = new Releases();
                Report.registerDataSource(releases);
            }
            else {
                var active_ds = Report.getConfig()['data-sources'];
                $.each(active_ds, function(i, name) {
                    if (name === "its") {
                        its = new ITS();
                        Report.registerDataSource(its);
                    }
                    else if (name === "mls") {
                        mls = new MLS();
                        Report.registerDataSource(mls);
                    }
                    else if (name === "scm") {
                        scm = new SCM();
                        Report.registerDataSource(scm);
                    }
                    else if (name === "scr") {
                        scr = new SCR();
                        Report.registerDataSource(scr);
                    }
                    else if (name === "irc") {
                        irc = new IRC();
                        Report.registerDataSource(irc);
                    }
                    else if (name === "mediawiki") {
                        mediawiki = new MediaWiki();
                        Report.registerDataSource(mediawiki);
                    }
                    else if (name === "people") {
                        people = new People();
                        Report.registerDataSource(people);
                    }
                    else if (name === "downloads") {
                        downloads = new Downloads();
                        Report.registerDataSource(downloads);
                    }
                    else if (name === "qaforums") {
                        qaforums = new QAForums();
                        Report.registerDataSource(qaforums);
                    }
                    else if (name === "releases") {
                        releases = new Releases();
                        Report.registerDataSource(releases);
                    }

                    else Report.log ("Not support data source " + name);
                });
            }
            if (its) its.setDataDir(project);
            if (mls) mls.setDataDir(project);
            if (scm) scm.setDataDir(project);
            if (scr) scr.setDataDir(project);
            if (irc) irc.setDataDir(project);
            if (mediawiki) mediawiki.setDataDir(project);
            if (people) people.setDataDir(project);
            if (downloads) downloads.setDataDir(project);
            if (qaforums) qaforums.setDataDir(project);
            if (releases) releases.setDataDir(project);
            if (scm && its) scm.setITS(its);
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
                    $.each(prjs_dss[name], function (prj, prjds) {
                        if (ds.getName() === prjds.getName())
                            return false;
                    });
                    // if ($.inArray(ds, prjs_dss[name]) > -1) return false;
                    ds.setProject(name);
                    prjs_dss[name].push(ds);
                    return false;
                }
            });
        });
    };

    Report.getConfig = function () {
        return report_config;
    };

    Report.setConfig = function (data) {
        report_config = data;
        if (data) {
            Report.log('Global config file found');
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
        // Templates markup divs
        Convert.convertMicrodash();
        Convert.convertMicrodashText();
        // Normal markup divs
        Convert.convertBasicDivs();
        Convert.convertBasicDivsMisc();
        Convert.convertBasicMetrics();
        Convert.convertDemographics();
        Convert.convertMetricsEvolSet();
        Convert.convertLastActivity();
    };

    Report.getActiveStudies = function() {
        var activeStudies = [];
        var reports;
        // TODO: people is not yet an study
        var reports_study = ['repositories','countries','companies','domains','projects'];
        if (Report.getConfig() !== null)
            reports = Report.getConfig().reports;
        else
            reports = reports_study;
        $.each (reports_study, function(i, study) {
            if ($.inArray(study, reports) > -1)
                activeStudies.push(study);
        });
        return activeStudies;
    };

    // Data available in global
    Report.convertStudiesGlobal = function() {
        //Convert.convertTop();
        Convert.convertPeople(); // using on demand file loading
    };

    function convertStudies() {
        $.each (Report.getActiveStudies(), function(i, study) {
            // Before loading items data, order to load the correct ones
            var filter = study;
            if (study === "repositories") filter = "repos";
            DataProcess.orderItems(filter);
            Convert.convertFilterStudy(study);
            Convert.convertFilterStudyItem (study);
        });
    }

    var log_on = true;
    Report.getLog = function() {return log_on;};
    Report.setLog = function(status) {log_on = status;};

    Report.log = function(msg) {
        if (Report.getLog() === true)
            if (window.console) console.log(msg);
    };
})();

Loader.data_ready_global(function() {
    Report.configDataSources();
    Report.convertGlobal();
    Report.convertStudiesGlobal();
});


Loader.data_ready(function(){
    // when this is triggered, the scm-repos has been already read
    // but .. are the tops by repos already assigned? -> we need a check
    study = "repos";
    Convert.convertFilterTop(study);
    Convert.convertModifiedBasicMetrics(study);
});

Loader.data_ready(function() {
    Report.convertStudies();
    $("body").css("cursor", "auto");
    // Popover help system
    $('html').click(function(e) {
        $('.help').popover('hide');
    });
    Convert.activateHelp();
});

$(document).ready(function() {
    // var filename = Report.getDataDir()+'/config.json';
    // Config file loaded from root dir
    var filename = './config.json';
    $.getJSON(filename, function(data) {
        Report.setConfig(data);
    }).fail(function() {
        if (window.console)
            Report.log("Can't read global config file " + filename);
    }).always(function (data) {
        Report.createDataSources();
        Loader.data_load();
        $("body").css("cursor", "progress");
    });
});

function resizedw(){
     Report.convertGlobal();
     Report.convertStudiesGlobal();
     Report.convertStudies();
     Convert.activateHelp();
}
var resized;
$(window).resize(function () {
    clearTimeout(resized);
    resized = setTimeout(resizedw, 100);
});

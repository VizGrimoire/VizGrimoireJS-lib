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
 * Legacy code for VizJS for compatibility purposes
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Report = {};

(function() {

Report.convertFlotr2 = function (config) {        
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
    
    var already_shown = [];
    var metric_already_shown = [];
    $.each(Report.getDataSources(), function(index, DS) {
        if (DS.getData().length === 0) return;
        $.each(DS.getMetrics(), function(name, metric) {
            var div_flotr2 = metric.divid+"-flotr2";
            if ($("#"+div_flotr2).length > 0 &&
                    $.inArray(metric.divid, metric_already_shown) === -1) {
                DS.displayBasicMetricHTML(name,div_flotr2, config_metric);
                // TODO: clean this hack
                metric_already_shown.push(metric.divid);
            }
            // Getting data real time
            var div_flotr2_rt = metric.divid+"-flotr2-rt";
            var divs = $("."+div_flotr2_rt);
            if (divs.length > 0) {
                $.each(divs, function(id, div) {
                    config_metric.realtime = true;
                    // config_metric.json_ds = "http://localhost:1337/?callback=?";
                    var db = "acs_cvsanaly_allura_1049";
                    db = $(this).data('db');
                    div.id = db + "_" + div.className;
                    config_metric.json_ds ="http://localhost:3000/scm/"+db+"/";
                    config_metric.json_ds += metric.divid+"_evol/?callback=?";
                    DS.displayBasicMetricHTML(i,div.id, config_metric);
                });
            }
        });
                    
        if ($("#"+DS.getName()+"-flotr2").length > 0) {
            if ($.inArray(DS.getName(), already_shown) === -1) {
                DS.displayBasicHTML(DS.getName()+'-flotr2', config_metric);
                already_shown.push(DS.getName());
            }
        }
        
        if (DS instanceof MLS) {
            if ($("#"+DS.getName()+"-flotr2"+"-lists").length > 0) {
                if (Report.getProjectsList().length === 1)
                    DS.displayBasic
                        (DS.getName() + "-flotr2"+"-lists", config_metric);
            }
        }
    
        // Multiparam
        var div_param = DS.getName()+"-flotr2-metrics";
        var divs = $("."+div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                config_metric.help = true;
                var help = $(this).data('help');
                if (help !== undefined) config_metric.help = help;
                config_metric.show_legend = false;
                if ($(this).data('legend'))
                    config_metric.show_legend = true;
                if ($(this).data('frame-time'))
                    config_metric.frame_time = true;
                div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-"+this.id;
                DS.displayBasicMetrics(metrics.split(","),div.id,
                        config_metric, $(this).data('convert'));
            });
        }
    
        // Multiparam min
        div_param = DS.getName()+"-flotr2-metrics-min";
        divs = $("."+div_param);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                config_metric.show_legend = false;
                config_metric.show_labels = false;
                config_metric.show_grid = false;
                // config_metric.show_mouse = false;
                config_metric.help = false;
                div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-"+this.id;
                DS.displayBasicMetrics(metrics.split(","),div.id,
                        config_metric, $(this).data('convert'));
            });
        }
    
        
       // Time to fix
        var div_ttfix = DS.getName()+"-time-to-fix";
        divs = $("."+div_ttfix); 
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var quantil = $(this).data('quantil');
                div.id = DS.getName()+"-time-to-fix-"+quantil;
                DS.displayTimeToFix(div.id, quantil);
            });
        }
        // Time to attention
        var div_ttatt = DS.getName()+"-time-to-attention";
        divs = $("."+div_ttatt); 
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var quantil = $(this).data('quantil');
                div.id = DS.getName()+"-time-to-attention-"+quantil;
                DS.displayTimeToAttention(div.id, quantil);
            });
        }
    });
};

Report.convertEnvisionLegacy = function()  {
    if ($("#all-envision").length > 0) {
        var relative = $('#all-envision').data('relative');
        var legend = $('#all-envision').data('legend-show');
        var summary_graph = $('#all-envision').data('summary-graph');
        Viz.displayEvoSummary('all-envision', relative, legend, summary_graph);
    }
    var already_shown = [];
    $.each(Report.getDataSources(), function(index, DS) {
        if (DS.getData().length === 0) return;
        var div_envision = DS.getName() + "-envision";
        if ($("#" + div_envision).length > 0) {
            if ($.inArray(DS.getName(), already_shown) !== -1)
                return;
            var legend = $('#'+div_envision).data('legend-show');
            var relative = $('#'+div_envision).data('relative');
            var summary_graph = $('#'+div_envision).data('summary-graph');
            if (DS instanceof MLS) {
                DS.displayEvo(div_envision, relative, legend, summary_graph);
                // DS.displayEvoAggregated(div_envision);
                if (Report.getProjectsList().length === 1)
                    if ($("#" + DS.getName() + "-envision"+"-lists").length > 0)
                        DS.displayEvoListsMain
                            (DS.getName() + "-envision"+"-lists");
            } else if ($.inArray(DS.getName(), already_shown) === -1) { 
                DS.displayEvo(div_envision, relative, legend, summary_graph); 
            }
            already_shown.push(DS.getName());
        }
    });
};

Report.convertIdentity = function() {
    $.each(Report.getDataSources(), function(index, DS) {
        var divid = DS.getName()+"-people";
        if ($("#"+divid).length > 0) {
            Identity.showList(divid, DS);
        }
    });
    if ($("#unique-people").length > 0)
        Identity.showListNested("unique-people");
};

Report.convertSummaryLegacy = function () {
    $.each(Report.getDataSources(), function(index, DS) {
        var div_summary = DS.getName()+"-summary";
        if ($("#"+div_summary).length > 0) {
            DS.displayGlobalSummary(div_summary);
        }
    });        
};

Report.convertTopLegacy = function () {
    $.each(Report.getDataSources(), function(index, DS) {
        if (DS.getData().length === 0) return;
    
        var div_id_top = DS.getName()+"-top";
        var show_all = false;
        
        if ($("#"+div_id_top).length > 0) {
            if ($("#"+div_id_top).data('show_all')) show_all = true;
            var top_metric = $("#"+div_id_top).data('metric');
            var limit = $("#"+div_id_top).data('limit');
            var graph = null;
            DS.displayTop(div_id_top, show_all, top_metric, graph, limit);
        }           
        $.each(['pie','bars'], function (index, chart) {
            var div_id_top = DS.getName()+"-top-"+chart;
            if ($("#"+div_id_top).length > 0) {
                if ($("#"+div_id_top).data('show_all')) show_all = true;
                var people_links = $("#"+div_id_top).data('people_links');
                var show_metric = $("#"+div_id_top).data('metric');
                var limit = $("#"+div_id_top).data('limit');
                DS.displayTop(div_id_top, show_all, show_metric, 
                        chart, limit, people_links);
            }
            div_id_top = DS.getName()+"-top-basic-"+chart;
            if ($("#"+div_id_top).length > 0) {
                var doer = $("#"+div_id_top).data('doer');
                var action = $("#"+div_id_top).data('action');
                DS.displayTopBasic(div_id_top, action, doer, chart);
            }
        });
        
        var div_tops = DS.getName()+"-global-top-metric";
        var divs = $("."+div_tops);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var period = $(this).data('period');
                var titles = $(this).data('titles');
                div.id = metric.replace("_","-")+"-"+period+"-global-metric";
                DS.displayTopGlobal(div.id, metric, period, titles);
            });
        }
    });
};

Report.convertPeopleLegacy = function(upeople_id, upeople_identifier) {
    var config_metric = {};
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    
    var querystr = window.location.search.substr(1);
    if (querystr  &&
            querystr.split("&")[0].split("=")[0] === "id") {
        upeople_id =
            decodeURIComponent(querystr.split("&")[0].split("=")[1]);
        upeople_identifier =
            decodeURIComponent(querystr.split("&")[1].split("=")[1]);
    }
    
    if (upeople_id === undefined) return;
    
    $.each(Report.getDataSources(), function(index, DS) {
        var divid = DS.getName()+"-refcard-people";
        if ($("#"+divid).length > 0) {
            DS.displayPeopleSummary(divid, upeople_id, upeople_identifier, this);
        }
    
        var div_repo = DS.getName()+"-flotr2-metrics-people";
        var divs = $("."+div_repo);
        if (divs.length) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                config_metric.show_legend = false;
                if ($(this).data('legend')) config_metric.show_legend = true;
                div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-people";
                DS.displayBasicMetricsPeople(upeople_id, upeople_identifier, metrics.split(","),
                        div.id, config_metric);
            });
        }
    });
};

Report.convertReposLegacy = function() {
    var config_metric = {};                
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    
    var data_ready = true;
    var repo_valid = null;
    var repo = Report.getParameterByName("repository");
    var page = Report.getParameterByName("page");
    
    if (Loader.check_repos_page(page) === false) {
        data_ready = false;
    }
    
    if (data_ready === false) {
        $.each(Report.getDataSources(), function(index, DS) {
            Loader.data_load_repos_page(DS, page, Report.convertReposLegacy);
        });
        return;
    }
    
    $.each(Report.getDataSources(), function(index, DS) {            
        var divid = DS.getName()+"-repos-summary";
        if ($("#"+divid).length > 0) {
            DS.displayReposSummary(divid, this);
        }
        var div_repos = DS.getName()+"-flotr2-repos-static";
        var divs = $("."+div_repos);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var show_others = $(this).data('show-others');
                var order_by = $(this).data('order-by');
                config_metric.graph = $(this).data('graph');
                div.id = metric+"-flotr2-repos-static";
                DS.displayBasicMetricReposStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
            });
        }
        
        var div_nav = DS.getName()+"-flotr2-repos-nav";
        if ($("#"+div_nav).length > 0) {
            var order_by = $("#"+div_nav).data('order-by');
            var scm_and_its = $("#"+div_nav).data('scm-and-its');
            DS.displayReposNav(div_nav, order_by, page, scm_and_its);
        }            
        
        var divs_repos_list = DS.getName()+"-flotr2-repos-list";
        divs = $("."+divs_repos_list);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                var order_by = $(this).data('order-by');
                var scm_and_its = $(this).data('scm-and-its');
                var show_links = true; 
                if ($(this).data('show_links') !== undefined) 
                    show_links = $(this).data('show_links');
                div.id = metrics.replace(/,/g,"-")+"-flotr2-repos-list";
                DS.displayReposList(metrics.split(","),div.id, 
                        config_metric, order_by, page, scm_and_its, show_links);
            });
        }
        
        if (repo !== null) repo_valid = Report.getValidRepo(repo, DS);
        // Hide all information for this data source
        if (repo_valid === null) $("#"+DS.getName()+"-repo").hide();
        else {                
            divid = DS.getName()+"-refcard-repo";
            if ($("#"+divid).length > 0) {
                DS.displayRepoSummary(divid, repo_valid, this);
            }
            
            var div_repo = DS.getName()+"-flotr2-metrics-repo";
            divs = $("."+div_repo);
            if (divs.length > 0) {
                $.each(divs, function(id, div) {
                    var metrics = $(this).data('metrics');                        
                    config.show_legend = false;
                    config.frame_time = false;
                    if ($(this).data('legend')) 
                        config_metric.show_legend = true;
                    if ($(this).data('frame-time')) 
                        config_metric.frame_time = true;
                    div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-repo";
                    DS.displayBasicMetricsRepo(repo_valid, metrics.split(","),
                            div.id, config_metric);
                });
            }                
        }            
    });
};

Report.convertCountriesLegacy = function() {
    var config_metric = {};                
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    
    var country = Report.getParameterByName("country");
    
    $.each(Report.getDataSources(), function(index, DS) {
        var divid = DS.getName()+"-countries-summary";
        if ($("#"+divid).length > 0) {
            DS.displayCountriesSummary(divid, this);
        }
        
        var div_countries = DS.getName()+"-flotr2-countries-static";
        var divs = $("."+div_countries);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var show_others = $(this).data('show-others');
                var order_by = $(this).data('order-by');
                config_metric.graph = $(this).data('graph');
                div.id = metric+"-flotr2-countries-static";
                DS.displayBasicMetricCountriesStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
            });
        }
        
        var div_nav = DS.getName()+"-flotr2-countries-nav";
        if ($("#"+div_nav).length > 0) {
            var order_by = $("#"+div_nav).data('order-by');
            DS.displayCountriesNav(div_nav, order_by);
        }
        
        var divs_countries_list = DS.getName()+"-flotr2-countries-list";
        divs = $("."+divs_countries_list);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                var order_by = $(this).data('order-by');
                var show_links = true; 
                if ($(this).data('show_links') !== undefined) 
                    show_links = $(this).data('show_links');
                div.id = metrics.replace(/,/g,"-")+"-flotr2-countries-list";
                DS.displayCountriesList(metrics.split(","),div.id, 
                        config_metric, order_by, show_links);
            });
        }
        
        if (country !== null) {
            divid = DS.getName()+"-refcard-country";
            if ($("#"+divid).length > 0) {
                DS.displayCountrySummary(divid, country, this);
            }
            
            var div_country = DS.getName()+"-flotr2-metrics-country";
            divs = $("."+div_country);
            if (divs.length) {
                $.each(divs, function(id, div) {
                    var metrics = $(this).data('metrics');
                    config.show_legend = false;
                    if ($(this).data('legend')) config_metric.show_legend = true;
                    div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-country";
                    DS.displayBasicMetricsCountry(country, metrics.split(","),
                            div.id, config_metric);
                });
            }                
        }            
    });        
};

Report.convertCompaniesLegacy = function(config) {        
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
    
    var div_companies_links = "companies_links";
    if ($("#"+div_companies_links).length > 0) {
        var limit = $("#"+div_companies_links).data('limit');
        var order_by = $("#"+div_companies_links).data('order-by');
        var DS = null;
        // scm support only
        $.each(data_sources, function(i, ds) {
            if (ds.getName() === "scm") {DS = ds; return false;}
        });
        DS.displayCompaniesLinks(div_companies_links, limit, order_by);
    }
    
    var company = Report.getParameterByName("company");
    
    $.each(Report.getDataSources(), function(index, DS) {            
        var divid = DS.getName()+"-companies-summary";
        if ($("#"+divid).length > 0) {
            DS.displayCompaniesSummary(divid, this);
        }
        
        divid = DS.getName()+"-refcard-company";
        if ($("#"+divid).length > 0) {
            DS.displayCompanySummary(divid, company, this);
        }
    
        var div_companies = DS.getName()+"-flotr2-companies";
        var divs = $("."+div_companies);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var limit = $(this).data('limit');
                var order_by = $(this).data('order-by');
                var stacked = false;
                if ($(this).data('stacked')) stacked = true;
                config_metric.lines = {stacked : stacked};
                div.id = metric+"-flotr2-companies";
                DS.displayBasicMetricCompanies(metric,div.id,
                        config_metric, limit, order_by);
            });
        }
        div_companies = DS.getName()+"-flotr2-companies-static";
        divs = $("."+div_companies);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var order_by = $(this).data('order-by');
                var limit = $(this).data('limit');
                var show_others = $(this).data('show-others'); 
                config_metric.graph = $(this).data('graph');
                config_metric.show_legend = $(this).data('legend');
                if ($('#'+$(this).data('legend-div')).length>0) {
                    config_metric.legend = {
                        container: $(this).data('legend-div')};
                } else config_metric.legend = {container: null};
                div.id = metric+"-flotr2-companies-static";
                DS.displayBasicMetricCompaniesStatic(metric,div.id,
                        config_metric, limit, order_by, show_others);
            });
        }
        var div_company = DS.getName()+"-flotr2-metrics-company";
        divs = $("."+div_company);
        if (divs.length > 0 && company) {
            $.each(divs, function(id, div) {
                config_metric.help = true;
                var help = $(this).data('help');
                if (help !== undefined) config_metric.help = help;
                config_metric.show_legend = false;                    
                var metrics = $(this).data('metrics');
                if ($(this).data('legend')) config_metric.show_legend = true;
                div.id = metrics.replace(/,/g,"-")+"-flotr2-metrics-company-"+$(this).id;
                DS.displayBasicMetricsCompany(company, metrics.split(","),
                        div.id, config_metric);
            });
        }
    
        var div_nav = DS.getName()+"-flotr2-companies-nav";
        if ($("#"+div_nav).length > 0) {
            var metric = $("#"+div_nav).data('order-by');
            DS.displayCompaniesNav(div_nav, metric);
        }
        var divs_comp_list = DS.getName()+"-flotr2-companies-list";
        divs = $("."+divs_comp_list);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metrics = $(this).data('metrics');
                var sort_metric = $(this).data('order-by');
                var show_links = true; 
                if ($(this).data('show_links') !== undefined) 
                    show_links = $(this).data('show_links');
                div.id = metrics.replace(/,/g,"-")+"-flotr2-companies-list";
                DS.displayCompaniesList(metrics.split(","),div.id,
                        config_metric, sort_metric, show_links);
            });
        }
    
        div_companies = DS.getName()+"-flotr2-top-company";
        divs = $("."+div_companies);
        if (divs.length > 0) {
            $.each(divs, function(id, div) {
                var metric = $(this).data('metric');
                var period = $(this).data('period');
                var titles = $(this).data('titles');
                div.id = metric+"-"+period+"-flotr2-top-company";
                div.className = "";
                DS.displayTopCompany(company,div.id,metric,period,titles);
            });
        }            
    });
};

function convertGlobalNumbersLegacy(){
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


function convertRefcardLegacy() {
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
    },
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
        convert: convertRefcardLegacy
    },
    "global-data": {
        convert: convertGlobalNumbersLegacy
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
                    div.id = ds+'-summary';
                    DS.displayGlobalSummary(div.id);
                });
            }
            if (legacy) Report.convertSummaryLegacy();
        }
    },
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

Report.convertBasicDivsLegacy = function() {
    $.each (basic_divs_legacy, function(divid, value) {
        if ($("#"+divid).length > 0) value.convert();
        if ($("."+divid).length > 0) value.convert();
    });
};

// Include divs to be convertad later
var template_divs_legacy = {
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

Report.convertDemographics = function() {
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
};

// HTML code that will be converted later
Report.convertTemplateDivsLegacy = function() {
    $.each (template_divs_legacy, function(divid, value) {
        if ($("#"+divid).length > 0) value.convert();
        if ($("."+divid).length > 0) value.convert();
    });
};

Report.convertSelectorsLegacy = function() {       
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
};




})();

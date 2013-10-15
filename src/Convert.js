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

var Convert = {};

(function() {

// TODO: share logic between three periods duration
Convert.convertMicrodashText = function () {
    var divs = $(".MicrodashText");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var metric = $(this).data('metric');
            var ds = Report.getMetricDS(metric)[0];
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
};

Convert.convertMicrodash = function () {
    var divs = $(".Microdash");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var metric = $(this).data('metric');
            var ds = Report.getMetricDS(metric)[0];
            var total = ds.getGlobalData()[metric];
            var html = '<div>';
            html += '<div style="float:left">';
            html += '<h4>'+total+' '+ds.getMetrics()[metric].name+'</h4>';
            html += '</div>';
            html += '<div id="Microdash" '+
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
};

Convert.convertNavbar = function() {
    $.get(Report.getHtmlDir()+"navbar.html", function(navigation) {
        $("#Navbar").html(navigation);
        displayReportData();
        Report.displayActiveMenu();
        var addURL = Report.addDataDir(); 
        if (addURL) {
            var $links = $("#Navbar a");
            $.each($links, function(index, value){
                if (value.href.indexOf("data_dir")!==-1) return;
                value.href += "?"+addURL;
            });
        }
    });
};

Convert.convertFooter = function() {
    $.get(Report.getHtmlDir()+"footer.html", function(footer) {
        $("#Footer").html(footer);
        $("#vizjs-lib-version").append(vizjslib_git_tag);
    });
};

Convert.convertSummary = function() {
    div_param = "Summary";
    var divs = $("." + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            div.id = ds+'-Summary';
            DS.displayGlobalSummary(div.id);
        });
    }
    if (Report.getLegacy()) Report.convertSummaryLegacy();
};

function displayReportData() {
    data = Report.getProjectData();
    document.title = data.project_name + ' Report by Bitergia';
    if (data.title) document.title = data.title;
    $(".report_date").text(data.date);
    $(".report_name").text(data.project_name);
    str = data.blog_url;
    if (str && str.length > 0) {
        $('#blogEntry').html(
                "<br><a href='" + str +
                "'>Blog post with some more details</a>");
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


Convert.convertRefcard = function() {
    $.when($.get(Report.getHtmlDir()+"refcard.html"),
            $.get(Report.getHtmlDir()+"project-card.html"))
    .done (function(res1, res2) {
        refcard = res1[0];
        projcard = res2[0];
    
        $("#Refcard").html(refcard);
        displayReportData();
        $.each(Report.getProjectsData(), function(prj_name, prj_data) {
            var new_div = "card-"+prj_name.replace(".","").replace(" ","");
            $("#Refcard #projects_info").append(projcard);
            $("#Refcard #projects_info #new_card")
                .attr("id", new_div);
            $.each(Report.getDataSources(), function(i, DS) {
                if (DS.getProject() !== prj_name) {
                    $("#" + new_div + ' .'+DS.getName()+'-info').hide();
                    return;
                }
                DS.displayData(new_div);
            });
            $("#"+new_div+" #project_name").text(prj_name);
            if (Report.getProjectsDirs.length>1)
                $("#"+new_div+" .project_info")
                    .append(' <a href="VizGrimoireJS/browser/index.html?data_dir=../../'+prj_data.dir+'">Report</a>');
            $("#"+new_div+" #project_url")
                .attr("href", prj_data.url);
        });
    });
};

Convert.convertGlobalData = function (){
    var divs = $(".GlobalData");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            var data = DS.getGlobalData();
            var key = $(this).data('field');
            $(this).text(data[key]);
        });
    }
};

Convert.convertRadarActivity = function() {
    var div_param = "RadarActivity";
    var divs = $("#" + div_param);
    if (divs.length > 0)
        Viz.displayRadarActivity(div_param);
};

Convert.convertRadarCommunity = function() {
    var div_param = "RadarCommunity";
    var divs = $("#" + div_param);
    if (divs.length > 0)
        Viz.displayRadarCommunity('RadarCommunity');
};

Convert.convertTreemap = function() {
    var file = $('#Treemap').data('file');
    Viz.displayTreeMap('Treemap', file);
};

Convert.convertBubbles = function() {
    div_param = "Bubbles";
    var divs = $("." + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (DS.getData().length === 0) return;
            var radius = $(this).data('radius');
            div.id = ds + "-Bubbles";
            DS.displayBubbles(div.id, radius);
        });
    }
};

Convert.convertMetricsEvol = function() {
    // General config for metrics viz
    var config_metric = {};
    
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    
    var config = Report.getVizConfig();
    if (config) {
        $.each(config, function(key, value) {
            config_metric[key] = value;
        });
    }
    
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
            var DS = Report.getDataSourceByName(ds);
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
    
    if (Report.getLegacy()) Report.convertFlotr2();
};

Convert.convertMetricsEvolSet = function() {
    div_param = "MetricsEvolSet";
    var divs = $("." + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var all = $(this).data('all');
            var relative = $(this).data('relative');
            var summary_graph = $(this).data('summary-graph');
            var legend = $(this).data('legend-show');
            div.id = ds+"-MetricsEvolSet-"+this.id;
            if (all === true) {
                div.id = ds+"-All";
                Viz.displayEnvisionAll(div.id, relative, legend, summary_graph);
                return false;
            }
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;                
            DS.displayEnvision(div.id, relative, legend, summary_graph); 
        });
    }
    
    if (Report.getLegacy()) Report.convertEnvisionLegacy();
};


Convert.convertTimeTo = function() {
    var div_tt = "TimeTo";
    divs = $("."+div_tt); 
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            var quantil = $(this).data('quantil');
            var type = $(this).data('type');
            div.id = ds+"-time-to-"+type+"-"+quantil;
            if (type === "fix")
                DS.displayTimeToFix(div.id, quantil);
            if (type === "attention")
                DS.displayTimeToAttention(div.id, quantil);
        });
    }
};

Convert.convertLastActivity = function() {
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
    var divs = $(".LastActivity");
    var period = null;
    var days = {"Week":7,"Month":30,"Quarter":90,"Year":365};
    if (divs.length > 0)
        $.each(divs, function(id, div) {
            period = $(div).data('period');
            activityInfo(div, days[period], period);
        });
};

Convert.convertTop = function() {
    var div_id_top = "Top";        
    var divs = $("." + div_id_top);
    var DS, ds;
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
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
    if (Report.getLegacy()) Report.convertTopLegacy();
};

Convert.convertPersonMetrics = function (upeople_id, upeople_identifier) {
    var config_metric = {};                
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    
    divs = $(".PersonMetrics");
    if (divs.length) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            var metrics = $(this).data('metrics');
            config_metric.show_legend = false;
            if ($(this).data('legend')) config_metric.show_legend = true;
            if ($(this).data('person_id')) upeople_id = $(this).data('person_id');
            if ($(this).data('person_name')) upeople_identifier = $(this).data('person_name');
            div.id = metrics.replace(/,/g,"-")+"-people-metrics";
            DS.displayMetricsPeople(upeople_id, upeople_identifier, metrics.split(","),
                    div.id, config_metric);
        });
    }
};

Convert.convertPersonSummary = function (upeople_id, upeople_identifier) {
    var divs = $(".PersonSummary");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if ($(this).data('person_id')) upeople_id = $(this).data('person_id');
            if ($(this).data('person_name')) upeople_identifier = $(this).data('person_name');
            div.id = ds+"-refcard-people";
            DS.displayPeopleSummary(div.id, upeople_id, upeople_identifier, DS);
        });
    }
};

Convert.convertPeople = function(upeople_id, upeople_identifier) {
    if (upeople_id === undefined)
        upeople_id = Report.getParameterByName("id");
    if (upeople_identifier === undefined)
        upeople_identifier = Report.getParameterByName("name");
    
    if (upeople_id === undefined) return;
    
    Convert.convertPersonSummary(upeople_id, upeople_identifier);
    Convert.convertPersonMetrics(upeople_id, upeople_identifier);
    
    if (Report.getLegacy()) Report.convertPeopleLegacy(upeople_id, upeople_identifier);
};

Convert.convertDemographics = function() {
    var divs = $(".Demographics");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            var file = $(this).data('file');
            // period in years
            var period = $(this).data('period');
            div.id = "Demographics"+"-"+file+"-"+period;
            DS.displayDemographics(div.id, file, period);
        });
    }
};

function filterItemsConfig() {
    var config_metric = {};
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    return config_metric;
}

Convert.convertFilterItemsSummary = function(filter) {
    var divlabel = "FilterItemsSummary";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            div.id = ds+"-"+divlabel;
            if (filter === "repos")
                DS.displayReposSummary(div.id, DS);
            if (filter === "countries")
                DS.displayCountriesSummary(div.id, DS);
            if (filter === "companies")
                DS.displayCompaniesSummary(div.id, DS);
        });
    }
};

Convert.convertFilterItemsGlobal = function(filter) {
    var config_metric = filterItemsConfig();
    var divlabel = "FilterItemsGlobal";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
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
            if (filter === "repos")
                DS.displayMetricReposStatic(metric,div.id,
                    config_metric, limit, order_by, show_others);
            if (filter === "countries")
                DS.displayMetricCountriesStatic(metric,div.id,
                    config_metric, limit, order_by, show_others);
            if (filter === "companies")
                DS.displayMetricCompaniesStatic(metric,div.id,
                    config_metric, limit, order_by, show_others);
        });
    }
};

Convert.convertFilterItemsNav = function(filter, page) {
    var divlabel = "FilterItemsNav";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            if ($(this).data('page')) page = $(this).data('page');
            var order_by = $(this).data('order-by');
            var scm_and_its = $(this).data('scm-and-its');
            div.id = ds+"-"+divlabel;
            if (filter === "repos")
                DS.displayReposNav(div.id, order_by, page, scm_and_its);
            if (filter === "countries")
                DS.displayCountriesNav(div.id, order_by, page, scm_and_its);
            if (filter === "companies")
                DS.displayCompaniesNav(div.id, order_by, page);
        });
    }
};

Convert.convertFilterItemsMetricsEvol = function(filter) {
    var config_metric = filterItemsConfig();
    
    var divlabel = "FilterItemsMetricsEvol";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            var metric = $(this).data('metric');
            var limit = $(this).data('limit');
            var order_by = $(this).data('order-by');
            var stacked = false;
            if ($(this).data('stacked')) stacked = true;
            config_metric.lines = {stacked : stacked};
            if ($('#'+$(this).data('legend-div')).length>0) {
                config_metric.legend = {
                container: $(this).data('legend-div')};
            } else config_metric.legend = {container: null};
            config_metric.show_legend = $(this).data('legend');
            div.id = metric+"-"+divlabel;
            if (filter === "companies")
                DS.displayMetricCompanies(metric,div.id,
                    config_metric, limit, order_by);
            if (filter === "repos")
                DS.displayMetricRepos(metric,div.id,
                    config_metric, limit, order_by);
        });
    }
};

Convert.convertFilterItemsMiniCharts = function(filter, page) {
    var config_metric = filterItemsConfig();
    
    var divlabel = "FilterItemsMiniCharts";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            if ($(this).data('page')) page = $(this).data('page');
            var metrics = $(this).data('metrics');
            var order_by = $(this).data('order-by');
            var scm_and_its = $(this).data('scm-and-its');
            var show_links = true;
            if ($(this).data('show_links') !== undefined)
                show_links = $(this).data('show_links');
            div.id = metrics.replace(/,/g,"-")+"-"+divlabel;
            if (filter === "repos")
                DS.displayReposList(metrics.split(","),div.id,
                    config_metric, order_by, page, scm_and_its, show_links);
            if (filter === "countries")
                DS.displayCountriesList(metrics.split(","),div.id,
                    config_metric, order_by, show_links);
            if (filter === "companies")
                DS.displayCompaniesList(metrics.split(","),div.id,
                    config_metric, order_by, show_links);
        });
    }
};

Convert.convertFilterItemSummary = function(filter, item) {
    // TODO: This repos logic should be adapted
    //if (repo !== null) repo_valid = Report.getValidRepo(repo, DS);
    //if (repo_valid === null) $("#"+DS.getName()+"-repo").hide();
    //else {
    
    var divlabel = "FilterItemSummary";
    divs = $("."+divlabel);
    if (item !== null && divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            if ($(this).data('item')) item = $(this).data('item');
            div.id = ds+"-"+divlabel;
            if (filter === "repos")
                DS.displayRepoSummary(div.id, item, DS);
            if (filter === "countries")
                DS.displayCountrySummary(div.id, item, DS);
            if (filter === "companies")
                DS.displayCompanySummary(div.id, item, DS);
        });
    }
};

Convert.convertFilterItemMetricsEvol = function(filter, item) {
    var config_metric = filterItemsConfig();
    
    var divlabel = "FilterItemMetricsEvol";
    divs = $("."+divlabel);
    if (item !== null && divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            if ($(this).data('item')) item = $(this).data('item');
            var metrics = $(this).data('metrics');                        
            config_metric.show_legend = false;
            config_metric.frame_time = false;
            if ($(this).data('legend')) 
                config_metric.show_legend = true;
            if ($(this).data('frame-time')) 
                config_metric.frame_time = true;
            div.id = metrics.replace(/,/g,"-")+"-"+divlabel;
            if (filter === "repos")
                DS.displayMetricsRepo(item, metrics.split(","),
                    div.id, config_metric);
            if (filter === "countries")
                DS.displayMetricsCountry(item, metrics.split(","),
                    div.id, config_metric);
            if (filter === "companies")
                DS.displayMetricsCompany(item, metrics.split(","),
                    div.id, config_metric);
        });
    }
};

Convert.convertFilterItemTop = function(filter, item) {
    var divlabel = "FilterItemTop";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (!filter) return;
            if ($(this).data('item')) item = $(this).data('item');
            var metric = $(this).data('metric');
            var period = $(this).data('period');
            var titles = $(this).data('titles');
            div.id = metric+"-"+period+"-"+divlabel;
            div.className = "";
            // Only for Company yet
            if (filter === "companies")
                DS.displayTopCompany(item,div.id,metric,period,titles);
        });
    }
};

//Needed for callback from Loader
Convert.convertRepos = function() {
    Convert.convertFilterStudy('repos');
};
Convert.convertCompanies = function() {
    Convert.convertFilterStudy('companies');
};

Convert.convertFilterStudy = function(filter) {
    var item = null;
    
    if (filter === "repos") item = Report.getParameterByName("repository");
    if (filter === "countries") item = Report.getParameterByName("country");
    if (filter === "companies") item = Report.getParameterByName("company");
    var page = Report.getParameterByName("page");
    
    // TODO: On demand loading only for repos and companies yet
    if (filter === "repos") {
        if (Loader.check_repos_page(page) === false) {
            $.each(Report.getDataSources(), function(index, DS) {
                Loader.data_load_repos_page(DS, page, Convert.convertRepos);
            });
            return;
        }
    }

    if (filter === "companies") {
        if (Loader.check_companies_page(page) === false) {
            $.each(Report.getDataSources(), function(index, DS) {
                Loader.data_load_companies_page(DS, page, Convert.convertCompanies);
            });
            return;
        }
    }

    Convert.convertFilterItemsSummary(filter);
    Convert.convertFilterItemsGlobal(filter);
    Convert.convertFilterItemsNav(filter, page);
    Convert.convertFilterItemsMetricsEvol(filter);
    Convert.convertFilterItemsMiniCharts(filter, page);
    
    Convert.convertFilterItemSummary(filter, item);
    Convert.convertFilterItemMetricsEvol(filter, item);
    Convert.convertFilterItemTop(filter, item);
    
    if (Report.getLegacy()) {
        if (filter === "repos") Report.convertReposLegacy();
        if (filter === "countries") Report.convertCountriesLegacy();
        if (filter === "companies") Report.convertCompaniesLegacy();
    }        
};


Convert.convertBasicDivs = function() {
    Convert.convertNavbar();
    Convert.convertFooter(); 
    Convert.convertRefcard();
    Convert.convertGlobalData();
    Convert.convertSummary();
};

Convert.convertBasicDivsMisc = function() {
    Convert.convertRadarActivity();
    Convert.convertRadarCommunity();
    Convert.convertTreemap();
    Convert.convertBubbles();
};

Convert.convertBasicMetrics = function(config) {
    Convert.convertMetricsEvol();
    Convert.convertTimeTo();
};

})();
 /* 
 * Copyright (C) 2013-2014 Bitergia
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
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */

var Convert = {};

(function() {

// TODO: share logic between three periods duration
Convert.convertMicrodashText = function () {
    /* composes the HTML for trends with number about diff and percentages*/
    var divs = $(".MicrodashText");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            var metric = $(this).data('metric');
            var show_name = $(this).data('name');
            var ds = Report.getMetricDS(metric)[0];
            if (ds === undefined) return;
            var total = ds.getGlobalData()[metric];
            var html = '<div class="row">';

            if(show_name){ //if name is shown we'll have four columns
                html += '<div class="col-md-3">';
                html += '<span class="dayschange">' + ds.basic_metrics[metric].name + '</span>';
                html += '</div>';
            }

            // $.each({7:'week',30:'month',365:'year'}, function(period, name) {
            $.each([365,30,7], function(index, period) {
                var column = ds.getMetrics()[metric].column;
                // value -> items for this period
                // netvalue -> change with previous period
                // percentagevalue -> % changed with previous
                var value = ds.getGlobalData()[metric+"_"+period];
                var netvalue = ds.getGlobalData()["diff_net"+column+"_"+period];
                var percentagevalue = ds.getGlobalData()["percentage_"+column+"_"+period];
                percentagevalue = Math.round(percentagevalue*10)/10;  // round "original" to 1 decimal
                if (value === undefined) return;
                var str_percentagevalue = '';

                // if % is 0 the output is 0, if not it depends on the netvalue
                if (percentagevalue === 0){
                    str_percentagevalue = Math.abs(percentagevalue);
                }else if (netvalue > 0){
                    str_percentagevalue = '+' + percentagevalue;
                }else if (netvalue < 0){
                    str_percentagevalue = '-' + Math.abs(percentagevalue);
                }

                if(show_name){
                    html += '<div class="col-md-3">';
                }else{
                    html += '<div class="col-md-4">';
                }

                html += '<span class="dayschange">Last '+period+' days:</span>';
                html += ' '+Report.formatValue(value) + '<br>';
                if (percentagevalue === 0) {
                    html += '<i class="fa fa-arrow-circle-right"></i> <span class="zeropercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                } else if (netvalue > 0) {
                    html += '<i class="fa fa-arrow-circle-up"></i> <span class="pospercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                } else if (netvalue < 0) {
                    html += '<i class="fa fa-arrow-circle-down"></i> <span class="negpercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                }
                html += '</div><!--col-md-4-->';
            });

            html += '</div><!--row-->';
            $(div).append(html);
        });
    }
};

Convert.convertMicrodash = function () {
    var divs = $(".Microdash");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            var metric = $(this).data('metric');
            // Microdash text or graphical
            var text = $(this).data('text');
            var ds = Report.getMetricDS(metric)[0];
            var total = ds.getGlobalData()[metric];
            var html = '<div>';
            html += '<div style="float:left">';
            html += '<span class="medium-fp-number">'+Report.formatValue(total);
            html += '</span> '+ds.getMetrics()[metric].name;
            html += '</div>';
            html += '<div id="Microdash" '+
                    'class="MetricsEvol" data-data-source="'+ds.getName()+'" data-metrics="'+
                    metric+'" data-min=true style="margin-left:10px; float:left;width:100px; height:25px;"></div>';
            html += '<div style="clear:both"></div><div>';
            // $.each({7:'week',30:'month',365:'year'}, function(period, name) {
            $.each([365,30,7], function(index, period) {
                var column = ds.getMetrics()[metric].column;
                var netvalue = ds.getGlobalData()["diff_net"+column+"_"+period];
                var percentagevalue = ds.getGlobalData()["percentage_"+column+"_"+period];
                var value = ds.getGlobalData()[metric+"_"+period];
                if (value === undefined) return;
                html += "<span class='dayschange'>"+period+" Days Change</span>:"+Report.formatValue(value)+"&nbsp;";
                if (netvalue === 0) {
                    html += '';
                }
                else if (netvalue > 0) {
                    html += '<i class="icon-circle-arrow-up"></i>';
                    html += '<small>(+'+percentagevalue+'%)</small>&nbsp;';
                } else if (netvalue < 0) {
                    html += '<i class="icon-circle-arrow-down"></i>';
                    html += '<small>(-'+Math.abs(percentagevalue)+'%)</small>&nbsp;';
                }
            });
            html += '</div>';
            html += '<div>';
            $(div).append(html);
        });
    }
};

function getProjectTitle(project_id, hierarchy){
    /**
       Gets the title of the project based on the hierarchy
    **/
    if (hierarchy.hasOwnProperty(project_id) && hierarchy[project_id].title){
        return hierarchy[project_id].title;
    }else{
        return undefined;
    }
}

function compareProjectTitles(a, b){
    if (a.project_id < b.project_id){
	return -1;
    }
    else if (a.project_id > b.project_id){
	return 1;
    }
    else{
	return 0;
    }
}

function getParentProjects(project_id, hierarchy){
    /** 
        Gets the parent project based on the hierarchy
    **/
    var parent = [];
    var iterate_p = project_id;
    var parent_id = '';
    var aux = {};
    
    while (hierarchy[iterate_p].hasOwnProperty('parent_project')){
        parent_id = hierarchy[iterate_p].parent_project;
        aux = hierarchy[parent_id];
        aux.project_id = parent_id;
        parent.push(aux);
        iterate_p = parent_id;
    }
    //parent.push(hierarchy[parent_id]);        
    return parent.reverse();
}

function getChildrenProjects(project_id, hierarchy){
    /**
       Gets the n children project name based on the hierarchy
    **/
    var children = [];
    var aux ={};
    $.each(hierarchy, function(id, p){
        if (hierarchy[id].parent_project === project_id){
            // we need the key so we keep it
            aux = hierarchy[id];
            aux.project_id = id;
            children.push(aux);
        }
    });
    children.sort(compareProjectTitles);
    return children;
}

function composePBreadcrumbsHTMLlast(project_id, children, hierarchy){   
    var html = '';
    var clen = children.length;
    if(clen > 0){
        html += '<li class="dropdown">';
        html += '<span data-toggle="tooltip" title="Project name"> ' + getProjectTitle(project_id, hierarchy) + '</span>';
        html += '&nbsp;<a class="dropdown-toggle" data-toggle="dropdown" href="#">';
        html += '<span data-toggle="tooltip" title="Select subproject" class="badge"> ' + clen + ' Subprojects </span></a>';
        html += '<ul class="dropdown-menu scrollable-menu">';
        $.each(children, function(id,value){
            gchildren = getChildrenProjects(value.project_id, hierarchy);            
            if (gchildren.length > 0){
                html += '<li><a href="project.html?project='+ value.project_id +'">'+ value.title +'&nbsp;&nbsp;<span data-toggle="tooltip" title="Number of suprojects" class="badge">'+gchildren.length +'&nbsp;<i class="fa fa-rocket"></i></span></a></li>';
            }else{
                html += '<li><a href="project.html?project='+ value.project_id +'">'+ value.title +'</a></li>';
            }
        });
        html += '<li class="divider"></li>';
        html += '<li><a href="./project_map.html"><i class="fa fa-icon fa-sitemap"></i> Projects treemap</a></li>';
        html += '</ul></li>';
    }
    else{
        html += '<li>' + getProjectTitle(project_id, hierarchy) + '</li>';
    }
    return html;
}

function composeProjectBreadcrumbs(project_id) {
    /** 
        compose the project navigation bar based on the hierarchy
    **/
    var html = '<ol class="breadcrumbtitle">';
    var hierarchy = Report.getProjectsHierarchy();
    if (hierarchy.length === 0){
        // we don't have information about subprojects
        return '';
    }
    
    if (project_id === undefined){
        project_id = 'root';
    }
    var children = getChildrenProjects(project_id, hierarchy);
    var parents = getParentProjects(project_id, hierarchy);
    // parents
    if (parents.length > 0){
        $.each(parents, function(id,value){
            if(value.parent_project){
                html += '<li><a href="project.html?project='+value.project_id+'">' + value.title + '</a></li>';
            }else{
                html += '<li><a href="./">' + value.title + '</a></li>';
            }
        });
    }
    html += composePBreadcrumbsHTMLlast(project_id, children, hierarchy);
    html += '</ol>';
    return html;
}

function escapeString(string){
    var aux = '';
    aux = string.replace(' ','_');
    aux = aux.toLowerCase();
    return aux;        
}

function composeHTMLNestedProjects(project_id, children, hierarchy){
    var html = '';
    var clen = children.length;
    var epid = escapeString(project_id);
    if(clen > 0){
	html += '<li>';
	html += '<a href="project.html?project='+epid+'">'+ getProjectTitle(project_id, hierarchy) + '</a>';
        html += '&nbsp;<a data-toggle="collapse" data-parent="#accordion" href="#collapse'+epid+'"><span class="badge">'+clen+'&nbsp;subprojects</span></a><div id="collapse'+epid+'" class="panel-collapse collapse"><ul>';

        $.each(children, function(id,value){
            gchildren = getChildrenProjects(value.project_id, hierarchy);
            html += composeHTMLNestedProjects(value.project_id, gchildren, hierarchy);
        });
        html += '</ul></li>';
    }
    else{
        html += '<li><a href="project.html?project='+project_id+'">' + getProjectTitle(project_id, hierarchy) + '</a></li>';
    }
    return html;
}

function composeProjectMap() {
    /** 
        compose the project navigation bar based on the hierarchy
    **/
    var html = '<ul>';
    var hierarchy = Report.getProjectsHierarchy();
    if (hierarchy.length === 0){
        // we don't have information about subprojects
        return '';
    }
    
    project_id = 'root';
    var children = getChildrenProjects(project_id, hierarchy);
    var parents = getParentProjects(project_id, hierarchy);
    $.each(children, function(id,value){
	grandchildren = getChildrenProjects(value.project_id, hierarchy);
	html += composeHTMLNestedProjects(value.project_id, grandchildren, hierarchy);
    });
    html += '</ul>';
    return html;
}



function getSectionName(){
    var result = [];
    var sections = {"mls":"MLS overview",
                    "irc":"IRC overview",
                    "its":"ITS overview",
                    "qaforums":"QA Forums overview",
                    "scr":"Code Review overview",
                    "scm":"SCM overview",
                    "wiki":"Wiki overview",
                    "people":"Contributor",
                    "company":"Company",
                    "country":"Country",
                    "repository":"Repository",
                    "data_sources":"Data sources",
                    "project_map":"Project map"};
    var filters = {"companies":"Activity by companies",
                   "contributors":"Activity by contributors",
                   "countries":"Activity by companies",
                   "domains":"Activity by domains",
                   "projects":"Activity by project",
                   "repos":"Activity by repositories",
                   "states":"Activity by states",
                   "tags":"Activity by tags"};

    var url_tokens = document.URL.split('/');
    var section = url_tokens[url_tokens.length-1].split('.')[0];
    if (section === 'project' || section === 'index' || section === ''){
        //no sections are support for subprojects so far
        return [];
    }else{
        //if it contains a - we return section + subsection
        //it could be scm or scm-repos

        var s_tokens = section.split('-');
        if (sections.hasOwnProperty(s_tokens[0])){
            result.push([s_tokens[0], sections[s_tokens[0]]]);

            if (s_tokens.length > 0){
                if (filters.hasOwnProperty(s_tokens[1])){
                result.push([s_tokens[0], filters[s_tokens[1]]]);
                }
            }
        }else{
            return [['#','Unavailable section name']];
        }
        return result;
    }
}

function composeSBSectionLinks(icon_text, title, ds_name, elements){
    // text = {'companies': '<i class="fa fa-building-o"></i> Companies',
    // 'companies-summary': '<i class="fa fa-building-o"></i> Companies summary',
    // 'contributors': '<i class="fa fa-users"></i> Contributors',
    // 'countries': '<i class="fa fa-flag"></i> Countries',
    // 'domains': '<i class="fa fa-envelope-square"></i> Domains',
    // 'projects': '<i class="fa fa-rocket"></i> Projects',
    // 'repos': '<i class="fa fa-code-fork"></i> Repositories',
    // 'states': '<i class="fa fa-code-fork"></i> States'};
    // html = '';
    // html += '<li><a href="' + ds_name + '.html"><i class="fa fa-tachometer"></i> Overview</a></li>';
    text = {'companies': 'Companies',
    'companies-summary': 'Companies summary',
    'contributors': 'Contributors',
    'countries': 'Countries',
    'domains': 'Domains',
    'projects': 'Projects',
    'repos': 'Repositories',
    'tags': 'Tags',
    'states': 'States'};
    html = '';
    html += '<li class="dropdown">';
    html += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">';
    html += '<i class="fa ' + icon_text + '"></i>&nbsp;' + title + ' <b class="caret"></b></a>';
    html += '<ul class="dropdown-menu navmenu-nav">';
    html += '<li><a href="' + ds_name + '.html">&nbsp;Overview</a></li>';
    $.each(elements, function(id,value){
	if (text.hasOwnProperty(value)){
            html += '<li><a href="'+ ds_name + '-' + value + '.html">&nbsp;' +text[value] + '</a></li>';
	}else{
            html += '<li><a href="'+ ds_name + '-' + value + '.html">&nbsp;' + value + '</a></li>';
	}
    });
    html += '</ul></li>';
    return html;
}

function composeSideBar(project_id){
    if (project_id === undefined){
        project_id = 'root';
    }
    var html='';
    html += '<ul class="nav navmenu-nav">';
    if (project_id === 'root'){
	
	var mele = Report.getMenuElements();

        html += '<li><a href="./"><i class="fa fa-home"></i> Home</a></li>';

	if (mele.hasOwnProperty('scm')){
            aux = mele.scm;
            aux_html = composeSBSectionLinks('fa-code','Source code management','scm', aux);
            html += aux_html;
	}
	if (mele.hasOwnProperty('scr')){
            aux = mele.scr;
            aux_html = composeSBSectionLinks('fa-check','Code review','scr', aux);
            html += aux_html;
	}
	if (mele.hasOwnProperty('its')){
            aux = mele.its;
            aux_html = composeSBSectionLinks('fa-ticket','Tickets','its', aux);
            html += aux_html;
	}
	if (mele.hasOwnProperty('mls')){
            aux = mele.mls;
            aux_html = composeSBSectionLinks('fa-envelope-o','Mailing lists','mls', aux);
            html += aux_html;
	}	
        if (mele.hasOwnProperty('qaforums')){
            aux = mele.qaforums;
            aux_html = composeSBSectionLinks('fa-question','Q&A Forums','qaforums', aux);
            html += aux_html;
        }
        if (mele.hasOwnProperty('irc')){
            aux = mele.irc;
            aux_html = composeSBSectionLinks('fa-comment-o','IRC','irc', aux);
            html += aux_html;
        }
        if (mele.hasOwnProperty('downloads')){
            aux = mele.downloads;
            aux_html = composeSBSectionLinks('fa-download','Downloads','downloads', aux);
            html += aux_html;
        }
        if (mele.hasOwnProperty('wiki')){
            aux = mele.wiki;
            aux_html = composeSBSectionLinks('fa-pencil-square-o','Wiki','wiki', aux);
            html += aux_html;
        }
        if (mele.hasOwnProperty('studies')){
            aux = mele.studies;
            html += '<li class="dropdown">';
            html += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">';
            html += '<i class="fa fa-lightbulb-o"></i>&nbsp;Studies <b class="caret"></b></a>';
            html += '<ul class="dropdown-menu navmenu-nav">';
            if (aux.indexOf('demographics') >= 0){
            html += '<li><a href="demographics.html">&nbsp;Demographics</a></li>';
            }
            html += '</ul></li>';
        }
    }else{
        html += '<li class="active"><a href="#">' + getSectionName() + '</a></li>';
    }
    html += '<li><a href="data_sources.html"><i class="fa fa-database"></i> Data sources</a></li>';
    html += '<li><a href="project_map.html"><i class="fa fa-icon fa-sitemap"></i> Project map</a></li>';
    html += '</ul>';
    return html;
}


Convert.convertSideBar = function(project_id){
    var divs = $(".SideNavBar");
    if (divs.length > 0){
        $.each(divs, function(id, div){
            $(this).empty();
            if (!div.id) div.id = "SideNavBar";// + getRandomId();
            //project_id will be empty for root project
            var label;
            if(project_id){
                label = Report.cleanLabel(project_id); 
            }
            var htmlaux = composeSideBar(label);
            $("#"+div.id).append(htmlaux);

            data = Report.getProjectData();
            //document.title = data.project_name + ' Report by Bitergia';
            //if (data.title) document.title = data.title;
            //$(".report_date").text(data.date);
            $(".report_name").text(data.project_name);
        });
    }    
};

Convert.convertProjectNavBar = function (project_id){
    var divs = $(".ProjectNavBar");
    if (divs.length > 0){
        $.each(divs, function(id, div){
            $(this).empty();
            if (!div.id) div.id = "ProjectNavBar";// + getRandomId();
            //project_id will be empty for root project
            var label;
            if(project_id){
                label = Report.cleanLabel(project_id); 
            }
            var htmlaux = composeProjectBreadcrumbs(label);
            $("#"+div.id).append(htmlaux);
        });
    }    
};

Convert.convertNavbar = function() {
    $.get(Report.getHtmlDir()+"navbar.html", function(navigation) {
        $("#Navbar").html(navigation);
        var project_id = Report.getParameterByName("project");
        Convert.convertProjectNavBar(project_id);
        Convert.convertSideBar(project_id);
        /**
         // Could this break the support of different JSON directories?         
           displayReportData();
        Report.displayActiveMenu();
        var addURL = Report.addDataDir(); 
        if (addURL) {
            var $links = $("#Navbar a");
            $.each($links, function(index, value){
                if (value.href.indexOf("data_dir")!==-1) return;
                value.href += "?"+addURL;
            });
        }**/
    });
};

function composeSectionBreadCrumb(project_id){
    var html = '<ol class="breadcrumb">';
    if (project_id === undefined){
        //main project enters here
        var subsects = getSectionName();
        if (subsects.length > 0){
            html += '<li><a href="./">Project Overview</a></li>';
            var cont = 1;
            $.each(subsects, function(id,value){
                if (subsects.length === cont){
                    html += '<li class="active">' + value[1] + '</li>';
                }else{
                    html += '<li><a href="'+ value[0] +'.html">' + value[1] + '</a></li>';
                }
                cont += 1;
            });
        }
        else{
            html += '<li class="active">Project Overview</li>';
        }

    }else{
        //subprojects have no sections yet
        html += '<li> ' + getSectionName() + '</li>';
    }
    html += '</ol>';
    return html;
}

Convert.convertSectionBreadcrumb = function (project_id){
    var divs = $(".SectionBreadcrumb");
    if (divs.length > 0){
        $.each(divs, function(id, div){
            $(this).empty();
            if (!div.id) div.id = "SectionBreadcrumb";// + getRandomId();
            //project_id will be empty for root project
            var label;
            if(project_id){
                label = Report.cleanLabel(project_id);
            }
            var htmlaux = composeSectionBreadCrumb(label);
            $("#"+div.id).append(htmlaux);
        });
    }
};

/* DEPRECATED
Convert.convertModalProjectMap = function(){
    $.get(Report.getHtmlDir() + "modal_projects", function(modal_html){
        $("#ModalProjectMap").html(modal_html);
    });
};*/

Convert.convertProjectMap = function (){
    var divs = $(".ProjectMap");
    if (divs.length >0){
        $.each(divs, function(id, div){
            $(this).empty();
            if (!div.id) div.id = "ProjectMap";// is this needed??;
            //project_id will be empty for root project
            var label;
            var htmlaux = composeProjectMap();//composeSectionBreadCrumb(label);
            $("#"+div.id).append(htmlaux);
        });
    }
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
            $(this).empty();
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            div.id = ds+'-Summary';
            DS.displayGlobalSummary(div.id);
        });
    }
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
    /* Deprecated function. See convertDSTable*/
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
            $(this).text(Report.formatValue(data[key], key));
        });
    }
};

Convert.convertProjectData = function (){
    var divs = $(".ProjectData");
    var p = Report.getParameterByName("project");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            var data = DS.getProjectsGlobalData()[p];
            var key = $(this).data('field');
            $(this).text(Report.formatValue(data[key], key));
        });
    }
};

Convert.convertRadarActivity = function() {
    var div_param = "RadarActivity";
    var divs = $("#" + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
        });
        //  TODO: In which div is displayed?
        Viz.displayRadarActivity(div_param);
    }
};

Convert.convertRadarCommunity = function() {
    var div_param = "RadarCommunity";
    var divs = $("#" + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
        });
        //  TODO: In which div is displayed?
        Viz.displayRadarCommunity('RadarCommunity');
    }
};

Convert.convertTreemap = function() {
    var div_param = "Treemap";
    var divs = $("#" + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
        });
        //  TODO: Just one treemap supported
        var file = $('#Treemap').data('file');
        $('#Treemap').empty();
        Viz.displayTreeMap('Treemap', file);
    }
};

Convert.convertBubbles = function() {
    div_param = "Bubbles";
    var divs = $("." + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
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


function loadHTMLEvolParameters(htmldiv, config_viz){
    /*var metrics = $(htmldiv).data('metrics');
    var ds = $(htmldiv).data('data-source');
    var DS = Report.getDataSourceByName(ds);
    if (DS === null) return;*/
    config_viz.help = true;
    var help = $(htmldiv).data('help');
    if (help !== undefined) config_viz.help = help;
    config_viz.show_legend = false;
    if ($(htmldiv).data('frame-time'))
        config_viz.frame_time = true;
    config_viz.graph = $(htmldiv).data('graph');
    if ($(htmldiv).data('min')) {
        config_viz.show_legend = false;
        config_viz.show_labels = true;
        config_viz.show_grid = true;
        // config_viz.show_mouse = false;
        config_viz.help = false;
    }
    if ($(htmldiv).data('legend'))
        config_viz.show_legend = true;
    config_viz.ligth_style = false;
    if ($(htmldiv).data('light-style')){
        config_viz.light_style = true;
    }
    if ($(htmldiv).data('custom-title')){
        config_viz.custom_title = $(htmldiv).data('custom-title');
    }
    if (config_viz.help && $(htmldiv).data('custom-help')){
        config_viz.custom_help = $(htmldiv).data('custom-help');
    } else {
        config_viz.custom_help = "";
    }
    // In unixtime
    var start = $(htmldiv).data('start');
    if (start) config_viz.start_time = start;
    var end = $(htmldiv).data('end');
    if (end) config_viz.end_time = end;
    
    var remove_last_point = $(htmldiv).data('remove-last-point');
    if (remove_last_point) config_viz.remove_last_point = true;    

    return config_viz;    
}

Convert.convertMetricsEvol = function() {
    // General config for metrics viz
    var config_metric = {};

    config_metric.show_desc = false;
    config_metric.show_title = true;
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
            $(this).empty();
            var metrics = $(this).data('metrics');
            var ds = $(this).data('data-source');
            var DS = Report.getDataSourceByName(ds);
            if (DS === null) return;

            config_viz = loadHTMLEvolParameters(div, config_viz);

            div.id = metrics.replace(/,/g,"-")+"-"+ds+"-metrics-evol-"+this.id;
            div.id = div.id.replace(/\n|\s/g, "");
            DS.displayMetricsEvol(metrics.split(","),div.id,
                    config_viz, $(this).data('convert'));
        });
    }
};

Convert.convertMetricsEvolSet = function() {
    div_param = "MetricsEvolSet";
    var divs = $("." + div_param);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
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
};


Convert.convertTimeTo = function() {
    var div_tt = "TimeTo";
    divs = $("."+div_tt); 
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
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

Convert.convertMarkovTable = function() {
    var div_id_mt = "MarkovTable";
    var divs = $("." + div_id_mt);
    var DS, ds;
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (DS.getData().length === 0) return;
            var title = $(this).data('title');
            div.id = ds + "-markov-table";
            DS.displayMarkovTable(div.id, title);
        });
    }
};


Convert.convertLastActivity = function() {
    var all_metrics = Report.getAllMetrics();
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
        var unique = 0;
        $.each(divs, function(id, div) {
            $(this).empty();
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
            var threads_links = $(this).data('threads_links');
            var period = $(this).data('period');
            var period_all = $(this).data('period_all');
            var repository = Report.getParameterByName("repository");
            div.id = ds + "-" + div_id_top + (unique++);
            if (graph){
                div.id += "-"+graph;
            }
            if (period === undefined && period_all === undefined){
                period_all = true;
            }
            if (limit === undefined){
                limit = 10;
            }
            DS.displayTop(div.id, show_all, top_metric, period, period_all,
                          graph, limit, people_links, threads_links, repository);
        });
    }
};

Convert.convertPersonMetrics = function (upeople_id, upeople_identifier) {
    var config_metric = {};
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;

    divs = $(".PersonMetrics");
    if (divs.length) {
        $.each(divs, function(id, div) {
            $(this).empty();
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

function getRandomId() {
    return Math.floor(Math.random()*1000+1);
}

Convert.convertPersonData = function (upeople_id, upeople_identifier) {
    var divs = $(".PersonData"), name, email;
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            if ($(this).data('person_id')) upeople_id = $(this).data('person_id');
            if (!div.id) div.id = "PersonData" + "-" + upeople_id + "-" + getRandomId();
            var data = Report.getPeopleIdentities()[upeople_id];
            if (data) {
                name = DataProcess.selectPersonName(data);
                email = DataProcess.selectPersonEmail(data);
                email = "("+DataProcess.hideEmail(email)+")";
            } else {
                if (upeople_identifier !== undefined)
                    name = upeople_identifier;
                else name = upeople_id;
                email = "";
            }
            $("#"+div.id).append("<h2>"+name + " "+ email + "</h2>");
        });
    }
};

Convert.convertPersonSummary = function (upeople_id, upeople_identifier) {
    var divs = $(".PersonSummary");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
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

    // Check we have all data
    if (Loader.check_people_item (upeople_id) === false) {
        $.each(Report.getDataSources(), function (index, DS)  {
            Loader.data_load_people_item (upeople_id, DS, Convert.convertPeople);
        });
        return;
    }

    Convert.convertPersonData(upeople_id, upeople_identifier);
    Convert.convertPersonSummary(upeople_id, upeople_identifier);
    Convert.convertPersonMetrics(upeople_id, upeople_identifier);

    Convert.activateHelp();
};

Convert.convertDemographics = function() {
    var divs = $(".Demographics");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            // period in years
            var period = $(this).data('period');
            div.id = "Demographics"+"-"+ds+"-"+"-"+period;
            DS.displayDemographics(div.id, period);
        });
    }
};

function filterItemsConfig() {
    var config_metric = {};
    config_metric.show_desc = false;
    config_metric.show_title = false;
    config_metric.show_labels = true;
    config_metric.show_legend = false;
    return config_metric;
}

// Use mapping between repos for locating real item names
Convert.getRealItem = function(ds, filter, item) {
    var map = Report.getReposMap();

    // If repos map is not available returm item if exists in ds
    if (map === undefined || map.length === 0) {
        if ($.inArray(item, ds.getReposData())>-1) return item;
        else return null;
    }

    var map_item = null;
    if (filter === "repos") {
        var rdata = ds.getReposMetricsData()[item];
        if (rdata === undefined) {
            $.each(map, function(id, repos) {
                $.each(Report.getDataSources(), function(index, DS) {
                    if (repos[DS.getName()] === item) {
                        map_item = repos[ds.getName()];
                        return false;
                    }
                });
                if (map_item !== null) return false;
            });
            // if (map_item === null) map_item = item;
        }
        else map_item = item;
    }
    else map_item = item;

    return map_item;
};

Convert.convertFilterItemsSummary = function(filter) {
    var divlabel = "FilterItemsSummary";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (filter !== $(this).data('filter')) return;            
            if (!filter) return;
            div.id = ds+"-"+divlabel;
            $(this).empty();
            if (filter === "repos")
                DS.displayReposSummary(div.id, DS);
            if (filter === "countries")
                DS.displayCountriesSummary(div.id, DS);
            if (filter === "companies")
                DS.displayCompaniesSummary(div.id, DS);
            if (filter === "domains")
                DS.displayDomainsSummary(div.id, DS);
            if (filter === "projects")
                DS.displayProjectsSummary(div.id, DS);
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
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            var metric = $(this).data('metric');
            var show_others = $(this).data('show-others');
            var order_by = $(this).data('order-by');
            config_metric.show_legend = $(this).data('legend');
            if ($('#'+$(this).data('legend-div')).length>0) {
                config_metric.legend = {
                container: $(this).data('legend-div')};
            } else config_metric.legend = {container: null};
            config_metric.graph = $(this).data('graph');
            div.id = metric+"-"+divlabel;
            $(this).empty();
            if (filter === "repos")
                DS.displayMetricReposStatic(metric,div.id,
                    config_metric, order_by, show_others);
            if (filter === "countries")
                DS.displayMetricCountriesStatic(metric,div.id,
                    config_metric, order_by, show_others);
            if (filter === "companies")
                DS.displayMetricCompaniesStatic(metric,div.id,
                    config_metric, order_by, show_others);
            if (filter === "domains")
                DS.displayMetricDomainsStatic(metric,div.id,
                    config_metric, order_by, show_others);
            if (filter === "projects")
                DS.displayMetricProjectsStatic(metric,div.id,
                        config_metric, order_by, show_others);

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
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            if ($(this).data('page')) page = $(this).data('page');
            order_by = $(this).data('order-by');
            div.id = ds+"-"+divlabel;
            $(this).empty();
            if (filter === "repos")
                DS.displayItemsNav(div.id, filter, page, order_by);
            else if (filter === "countries")
                DS.displayItemsNav(div.id, filter, page);
            else if (filter === "companies")
                DS.displayItemsNav(div.id, filter, page);
            else if (filter === "domains")
                DS.displayItemsNav(div.id, filter, page);
            else if (filter === "projects")
                DS.displayItemsNav(div.id, filter, page);
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
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            var metric = $(this).data('metric');
            var stacked = false;
            if ($(this).data('stacked')) stacked = true;
            if ($(this).data('min')) {
                config_viz.show_legend = false;
                config_viz.show_labels = true;
                config_viz.show_grid = true;
                // config_viz.show_mouse = false;
                config_viz.help = false;
            }
            // In unixtime
            var start = $(this).data('start');
            var end = $(this).data('end');
            config_metric.lines = {stacked : stacked};
            if ($('#'+$(this).data('legend-div')).length>0) {
                config_metric.legend = {
                container: $(this).data('legend-div')};
            } else config_metric.legend = {container: null};
            config_metric.show_legend = $(this).data('legend');
            config_metric.mouse_tracker = $(this).data('mouse_tracker');

            var remove_last_point = $(this).data('remove-last-point');
            if (remove_last_point) config_metric.remove_last_point = true;

            div.id = metric+"-"+divlabel;
            $(this).empty();
            if (filter === "companies")
                DS.displayMetricCompanies(metric,div.id,
                    config_metric, start, end);
            else if (filter === "repos")
                DS.displayMetricRepos(metric,div.id,
                            config_metric, start, end);
            else if (filter === "domains")
                DS.displayMetricDomains(metric,div.id,
                            config_metric, start, end);
            else if (filter === "projects")
                DS.displayMetricProjects(metric,div.id,
                            config_metric, start, end);
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
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            if ($(this).data('page')) page = $(this).data('page');
            var metrics = $(this).data('metrics');
            var order_by = $(this).data('order-by');
            var show_links = true;
            if ($(this).data('show_links') !== undefined)
                show_links = $(this).data('show_links');
            // In unixtime
            var start = $(this).data('start');
            var end = $(this).data('end');
            var convert = $(this).data('convert');

            var remove_last_point = $(this).data('remove-last-point');
            if (remove_last_point) config_metric.remove_last_point = true;

            div.id = metrics.replace(/,/g,"-")+"-"+filter+"-"+divlabel;
            $(this).empty();
            if (filter === "repos")
                DS.displayReposList(metrics.split(","),div.id,
                    config_metric, order_by, page, show_links, start, end, convert);
            else if (filter === "countries")
                DS.displayCountriesList(metrics.split(","),div.id,
                    config_metric, order_by, page, show_links, start, end, convert);
            else if (filter === "companies")
                DS.displayCompaniesList(metrics.split(","),div.id,
                    config_metric, order_by, page, show_links, start, end, convert);
            else if (filter === "domains")
                DS.displayDomainsList(metrics.split(","),div.id,
                    config_metric, order_by, page, show_links, start, end, convert);
            else if (filter === "projects")
                DS.displayProjectsList(metrics.split(","),div.id,
                    config_metric, order_by, page, show_links, start, end, convert);
        });
    }
};

Convert.convertFilterItemData = function (filter, item) {
    var divs = $(".FilterItemData");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            var label = Report.cleanLabel(item);
            if (!div.id) div.id = "FilterItemData" + getRandomId();
            $("#"+div.id).append("<h2>"+label + "</h2>");
        });
    }
};


Convert.convertFilterItemSummary = function(filter, item) {
    var divlabel = "FilterItemSummary";
    divs = $("."+divlabel);
    if (item !== null && divs.length > 0) {
        $.each(divs, function(id, div) {
            var real_item = item;
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            if ($(this).data('item')) real_item = $(this).data('item');
            div.id = ds+"-"+filter+"-"+divlabel;
            $(this).empty();
            if (filter === "repos") {
                real_item = Convert.getRealItem(DS, filter, real_item);
                if (real_item) DS.displayRepoSummary(div.id, real_item, DS);
            }
            else if (filter === "countries")
                DS.displayCountrySummary(div.id, real_item, DS);
            else if (filter === "companies")
                DS.displayCompanySummary(div.id, real_item, DS);
            else if (filter === "domains")
                DS.displayDomainSummary(div.id, real_item, DS);
            else if (filter === "projects")
                DS.displayProjectSummary(div.id, real_item, DS);
        });
    }
};

Convert.convertFilterItemMicrodashText = function (filter, item) {
    /* composes the HTML for trends with number about diff and percentages*/
    var divs = $(".FilterItemMicrodashText");
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            $(this).empty();
            var real_item = item; // project, repo, company, etc ..
            var metric = $(this).data('metric');
            var show_name = $(this).data('name');
            var ds = Report.getMetricDS(metric)[0];
            if (ds === undefined) return;
            if (filter === "projects")
                var global_data = ds.getProjectsGlobalData()[item];
            else
                return; //so far only project filter is supported
            var html = '<div class="row">';

            if(show_name){ //if name is shown we'll have four columns
                html += '<div class="col-md-3">';
                html += '<span class="dayschange">' + ds.basic_metrics[metric].name + '</span>';
                html += '</div>';
            }

            // $.each({7:'week',30:'month',365:'year'}, function(period, name) {
            $.each([365,30,7], function(index, period) {
                var column = ds.getMetrics()[metric].column;
                // value -> items for this period
                // netvalue -> change with previous period
                // percentagevalue -> % changed with previous
                var value = global_data[metric+"_"+period];
                var netvalue = global_data["diff_net"+column+"_"+period];
                var percentagevalue = global_data["percentage_"+column+"_"+period];
                percentagevalue = Math.round(percentagevalue*10)/10;  // round "original" to 1 decimal
                if (value === undefined) return;
                var str_percentagevalue = '';
                if (netvalue > 0) str_percentagevalue = '+' + percentagevalue;
                if (netvalue < 0) str_percentagevalue = '-' + Math.abs(percentagevalue);

                if(show_name){
                    html += '<div class="col-md-3">';
                }else{
                    html += '<div class="col-md-4">';
                }

                html += '<span class="dayschange">Last '+period+' days:</span>';
                html += ' '+Report.formatValue(value) + '<br>';
                if (netvalue === 0) {
                    html += '<i class="fa fa-arrow-circle-right"></i> <span class="zeropercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                } else if (netvalue > 0) {
                    html += '<i class="fa fa-arrow-circle-up"></i> <span class="pospercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                } else if (netvalue < 0) {
                    html += '<i class="fa fa-arrow-circle-down"></i> <span class="negpercent">&nbsp;'+str_percentagevalue+'%</span>&nbsp;';
                }
                html += '</div><!--col-md-4-->';
            });

            html += '</div><!--row-->';
            $(div).append(html);
        });
    }
};





Convert.convertFilterItemMetricsEvol = function(filter, item) {
    var config_metric = filterItemsConfig();
    var divlabel = "FilterItemMetricsEvol";
    divs = $("."+divlabel);
    if (item !== null && divs.length > 0) {
        $.each(divs, function(id, div) {
            var real_item = item;
            var metrics = $(this).data('metrics');
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            if ($(this).data('item')) real_item = $(this).data('item');
            config_metric = loadHTMLEvolParameters(div, config_metric);

            div.id = Report.cleanLabel(item).replace(/ /g,"_")+"-";
            div.id += metrics.replace(/,/g,"-")+"-"+ds+"-"+filter+"-"+divlabel;
            $(this).empty();
            if (filter === "repos") {
                real_item = Convert.getRealItem(DS, filter, real_item);
                if (real_item) {
                    DS.displayMetricsRepo(real_item, metrics.split(","),
                            div.id, config_metric);
                }
                else $(this).hide();
            }
            else if (filter === "countries") {
                DS.displayMetricsCountry(real_item, metrics.split(","),
                    div.id, config_metric);
            }
            else if (filter === "companies") {
                DS.displayMetricsCompany(real_item, metrics.split(","),
                    div.id, config_metric);
            }
            else if (filter === "domains") {
                DS.displayMetricsDomain(real_item, metrics.split(","),
                    div.id, config_metric);
            }
            else if (filter === "projects") {
                DS.displayMetricsProject(real_item, metrics.split(","),
                    div.id, config_metric);
            }
        });
    }
};

Convert.convertFilterItemTop = function(filter, item) {
    var divlabel = "FilterItemTop";
    divs = $("."+divlabel);
    if (divs.length > 0) {
        $.each(divs, function(id, div) {
            var real_item = item;
            $(this).empty();
            ds = $(this).data('data-source');
            DS = Report.getDataSourceByName(ds);
            if (DS === null) return;
            if (filter === undefined) filter = $(this).data('filter');
            if (filter !== $(this).data('filter')) return;
            if (!filter) return;
            if ($(this).data('item')) real_item = $(this).data('item');
            var metric = $(this).data('metric');
            var period = $(this).data('period');
            var titles = $(this).data('titles');
            div.id = metric+"-"+ds+"-"+filter+"-"+divlabel+"-"+getRandomId();
            $(this).empty();
            div.className = "";
            // Only for Company yet
            if (filter === "companies")
                DS.displayTopCompany(real_item,div.id,metric,period,titles);
        });
    }
};

Convert.convertFilterStudyItem = function (filter, item) {
    // Control convert is not called several times per filter
    var convertfn = Convert.convertFilterStudyItem;
    if (convertfn.done === undefined) {convertfn.done = {};}
    else if (convertfn.done[filter] === true) return;

    // repositories comes from Automator config
    if (filter === "repositories") filter = "repos";

    if (item === undefined) {
        if (filter === "repos") item = Report.getParameterByName("repository");
        if (filter === "countries") item = Report.getParameterByName("country");
        if (filter === "companies") item = Report.getParameterByName("company");
        if (filter === "domains") item = Report.getParameterByName("domain");
        if (filter === "projects") item = Report.getParameterByName("project");
    }

    if (!item) return;

    if (Loader.FilterItemCheck(item, filter) === false) return;

    Convert.convertFilterItemData(filter, item);
    Convert.convertFilterItemSummary(filter, item);
    Convert.convertFilterItemMetricsEvol(filter, item);
    Convert.convertFilterItemTop(filter, item);
    Convert.convertFilterItemMicrodashText(filter, item);
    Convert.convertProjectData();

    Convert.activateHelp();

    convertfn.done[filter] = true;
};

Convert.activateHelp = function() {
    // Popover help system
    $('.help').popover({
        html: true,
        trigger: 'manual'
    }).click(function(e) {
        $(this).popover('toggle');
        e.stopPropagation();
    });
};

Convert.convertFilterStudy = function(filter) {
    var page = Report.getCurrentPage();
    if (page === null) {
        page = Report.getParameterByName("page");
        if (page !== undefined) Report.setCurrentPage(page);
    }

    if (page === undefined) {
        // If there are items widgets config default page
        if ($("[class^='FilterItems']").length > 0) {
            page = 1;
            Report.setCurrentPage(page);
        }
        else return;
    }

    // repositories comes from Automator config
    if (filter === "repositories") filter = "repos";

    // If data is not available load them and cb this function
    if (Loader.check_filter_page (page, filter) === false) {
        $.each(Report.getDataSources(), function(index, DS) {
            Loader.data_load_items_page (DS, page, Convert.convertFilterStudy, filter);
        });
        return;
    }

    Convert.convertFilterItemsSummary(filter);
    Convert.convertFilterItemsGlobal(filter);
    Convert.convertFilterItemsNav(filter, page);
    Convert.convertFilterItemsMetricsEvol(filter);
    Convert.convertFilterItemsMiniCharts(filter, page);
};

Convert.convertDSTable = function() {
    // Converts the div DataSourceTable into a table
    var dst = "DataSourcesTable";
    var divs = $("." + dst);
    var DS, ds;
    if (divs.length > 0) {
        var unique = 0;
        $.each(divs, function(id, div) {
            $(this).empty();
            div.id = dst + (unique++);
            Viz.displayDataSourcesTable(div);
        });
    }
};

Convert.convertBasicDivs = function() {
    Convert.convertNavbar();
    //Convert.convertProjectNavBar();
    Convert.convertSectionBreadcrumb();
    Convert.convertProjectMap();
    //Convert.convertModalProjectMap();
    Convert.convertFooter(); 
    //Convert.convertRefcard(); //deprecated
    Convert.convertDSTable();
    Convert.convertGlobalData();
    //Convert.convertProjectData();
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
    Convert.convertMarkovTable();
};

Convert.convertFilterTop = function(filter){
    /**
     Display top tables.
     If item is provided through URL parameter it waits and display filtered 
     information, if not it displays total/global information.
     **/
    var item = Report.getParameterByName("repository");
    // If data is not available load them and cb this function
    if (Loader.filterTopCheck(item, filter) === false) return;
    Convert.convertTop();
};

})();

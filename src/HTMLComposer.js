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
 * This file is a part of the VizGrimoireJS package.
 * The aim of HTMLComposer is to provide functions where HTML is written in
 * order to maintain the rest of the code cleaner.
 *
 * Authors:
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 */


var HTMLComposer = {};

(function() {
    HTMLComposer.personDSBlock = personDSBlock;
    HTMLComposer.filterDSBlock = filterDSBlock;
    HTMLComposer.DSBlock = DSBlock;
    HTMLComposer.repositorySummaryTable = repositorySummaryTable;
    HTMLComposer.personSummaryTable = personSummaryTable;
    HTMLComposer.personName = personName;
    HTMLComposer.itemName = itemName;
    HTMLComposer.sideMenu4Release = sideMenu4Release;
    HTMLComposer.releaseSelector = releaseSelector;
    HTMLComposer.sideBarLinks = sideBarLinks;
    HTMLComposer.overallSummaryBlock = overallSummaryBlock;
    HTMLComposer.smartLinks = smartLinks;

    function personDSBlock(ds_name, metric_name){
        /* Display block with PersonSummary and PersonMetrics divs.
         This block is used in the people.html page
         */
        var html = '<div class="col-md-12">';
        html += '<div class="well well-small">';
        html += '<div class="row">';
	html += '<div class="col-md-12">';
	html += '<p>' + title4DS(ds_name) + '</p>';
	html += '</div>';
	html += '<div class="col-md-3">';
	html += '<div class="PersonSummary" data-data-source="'+ ds_name +'"></div>';
	html += '</div>';
	html += '<div class="col-md-9">';
	html += '<div class="PersonMetrics" data-data-source="'+ds_name+'"';
        html += 'data-metrics="'+metric_name+'" data-min="true"';
	//html += 'style="height: 140px;" data-frame-time="true"></div>';
        html += 'data-frame-time="true"></div>';
	html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;        
    }

/*    function repositoryDSBlock(ds_name, metric_names){
        return filterDSBlock(ds_name, 'repos', metric_names);
    }
    
    function companyDSBlock(ds_name, metric_names){
        return filterDSBlock(ds_name, 'companies', metric_names);
    }*/

    function filterDSBlock(ds_name, filter_name, metric_names){
        /* 
         Display block with FilterItemSummary and FilterItemMetricsEvol
         for a filter (repository, company, country), data source and 
         the metrics included in metric_names

         Used for div class RepositoryDSBlock
         */

        /*FilterItemTop was not included in this function. It is not working
         on the current dash so I disable it.*/
        
        var html = '<div class="col-md-12">';
        html += '<div class="row">';
        html += '<div class="col-md-3">';
        html += '<div class="well">';
        html += '<div class="FilterItemSummary" data-data-source="'+ ds_name +'" data-filter="'+ filter_name +'"></div>';
        html += '</div></div>';
        html += '<div class="col-md-9">';
        html += '<div class="well">';

        $.each(metric_names, function(id, metric){
            html += '<div class="row"><div class="col-md-12"></br></br></div></div>';
            html += '<div class="row">';
            html += '<div class="col-md-12">';
            html += '<div class="FilterItemMetricsEvol" data-data-source="'+ ds_name +'"';
            html += 'data-metrics="'+ metric +'" data-min="true"';
            html += 'data-filter="'+ filter_name +'" data-frame-time="true"></div>';
            html += '</div></div>';
        });

        html += '</div></div></div></div>';

        return html;
    }

    function repositorySummaryTable(ds, global_data, id_label){
        /*
         Compose the HTML shown in the repository.html for the table with
         total data for the repository
         
         Input:
         - global_data: object with global data for ds from static.json files
         - ds: data source object
         */
        /*var html = '<p class="subsection-title"">' + title4DS(ds.getName()) + '</p>';*/
        var html = "<table class='table-condensed table-hover'>";
        html += '<tr><td colspan="2"><p class="subsection-title">' + title4DS(ds.getName()) + '</p></td></tr>';
        var html_irow = '<tr><td>';
        var html_erow = '</td></tr>';
        $.each(global_data,function(id,value) {
            if (ds.getMetrics()[id]) {
                html += html_irow + ds.getMetrics()[id].name;
                if (id === 'first_date' || id === 'last_date'){
                    html += '</td><td class="numberInTD">' + value + html_erow;
                }
                else{
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow;
                }
            } else if (id_label[id]) { 
                html += html_irow + id_label[id]; 
                                if (id === 'first_date' || id === 'last_date'){
                    html += '</td><td class="numberInTD">' + value + html_erow;
                }
                else{
                    html += '</td><td class="numberInTD">' + Report.formatValue(value) + html_erow;
                }
            }
        });
        html += "</table>";
        return html;
    }

    function personSummaryTable(ds_name, history){
        /* Compose table with first activity, last activity and total units for
         a given data source.
         */        
        var html = "<table class='table-condensed table-hover'>";
        html += "<tr><td>";
        html += "First contribution: </br>";
        html += "&nbsp;&nbsp;" + history.first_date;
        html += "</td></tr><tr><td>";
        html += "Last contribution: </br>";
        html += "&nbsp;&nbsp;" + history.last_date;
        html += "</td></tr><tr><td>";
        if (ds_name == "scm") html += "Commits:</br>&nbsp;&nbsp;" + history.scm_commits;
        else if (ds_name == "its") html += "Closed:</br>&nbsp;&nbsp;" + history.its_closed;
        else if (ds_name == "mls") html += "Sent:</br>&nbsp;&nbsp;" + history.mls_sent;
        else if (ds_name == "irc") html += "Sent:</br>&nbsp;&nbsp;" + history.irc_sent;
        else if (ds_name == "scr") html += "Closed:</br>&nbsp;&nbsp;" + history.scr_closed;
        html += "</td></tr>";
        html += "</table>";

        return html;
    }

    function personName(name, email){
        var html = '<p class="section-title" style="margin-bottom:0px;"><i class="fa fa-user fa-lg"></i> &nbsp;&nbsp;';
        if (name.length > 0)
            html += name;
        else if (email.length > 0){
            /* we don't want to expose the mail address of people!*/
            if (email.indexOf('@') > 0)
                email = email.split('@')[0];
            html += email;
        }
        html += '</p>';

        return html;
    }

    function itemName(text, filter_name){
        /* Return html title name for filters like repository, company and domain */
        
        //FIXME: replace the public awful name for this
        var html = '<p class="section-title" style="margin-bottom:0px;">';
        if (filter_name === 'companies')
            html += '<i class="fa fa-building-o"></i> &nbsp;&nbsp;';
        html += text;
        html += '</p>';
        return html;
    }

    //
    // Below this point, private methods
    //

    function title4DS(ds_name){
        /* Returns title for section based on ds_name. It includes the
         correspondant font awesome icon for the data source
         */
        var title = '';
        if (ds_name === "scm")
            title = '<i class="fa fa-code"></i> Source Code Management';
        else if(ds_name === "scr")
            title = '<i class="fa fa-check"></i> Source Code Review';
        else if(ds_name === "its")
            title = '<i class="fa fa-ticket"></i> Issue tracking system';
        else if(ds_name === "mls")
            title = '<i class="fa fa-envelope-o"></i> Mailing Lists';
        else if(ds_name === "irc")
            title = '<i class="fa fa-comment-o"></i> IRC Channels';
        else if(ds_name === "mediawiki")
            title = '<i class="fa fa-pencil-square-o"></i> Wiki';
        else if(ds_name === "releases")
            title = '<i class="fa fa-umbrella"></i> Forge Releases';
        return title;
    }

    function sideMenu4Release(){
        /* Returns HTML for release side menu
         */
        html = '';
        params = '?data_dir='+ $.urlParam('data_dir') +'&release=' + $.urlParam('release'); 
        html += '<li><a href="./"><i class="fa fa-home"></i> Home</a></li>';
        //html += '<li><a href="./release.html'+ params +'"> ' +$.urlParam('release') +' release</a></li>';
        html += '<li><a href="./scm-companies.html'+ params +'"><i class="fa fa-code"></i> Source code repositories by companies</a></li>';
        html += '<li><a href="./mls-companies.html' + params + '"><i class="fa fa-envelope-o"></i> Mailing Lists by companies</a></li>';
        html += '<li><a href="./its-companies.html' + params + '"><i class="fa fa-ticket"></i> Tickets by companies</a></li>';
        
        return html;
    }

    function releaseSelector(current_release, release_names){
        /*
         Compose HTML for dropdown selector for releases
         
         current_release: value of GET variable release
         release_names: releases set up in config file
         */

        // if no releases, we don't print HTML
        if(release_names.length === 0) return '';

        // sections which don't support releases
        unsupported =  ['irc.html','qaforums.html','project.html'];

        ah_label = '&nbsp;All history&nbsp;';
        label = current_release;
        if (label === null) 
            label = ah_label;
        else{
            label = '&nbsp; ' + label[0].toUpperCase() + decodeURIComponent(label.substring(1)) + ' release &nbsp;';
            release_names.reverse().push(ah_label);
            release_names.reverse();
        }
        
        html = '<div class="input-group-btn">';
        html += '<button type="button" class="btn btn-default btn-lg btn-releaseselector dropdown-toggle"';
        html += 'data-toggle="dropdown">';
        html += label;
        html += '<span class="caret"></span>';
        html += '</button>';
        html += '<ul class="dropdown-menu pull-left">';        
        page_name = Utils.filenameInURL();
        if (unsupported.indexOf(page_name) < 0){
        $.each(release_names, function(id, value){
            var final_p = [];
            params = Utils.paramsInURL().split('&');

            //we filter the GET values
            for (i = 0; i < params.length; i++){
                sub_value = params[i];
                
                if (sub_value.length === 0) continue;
                //for All History we skip the release value
                if (sub_value.indexOf('release') === 0){
                    if (value != ah_label) final_p.push('release='+value);
                }else{
                    final_p.push(sub_value);
                }
            }
            
            //if release is not present we add it
            if ($.urlParam('release') === null){
                final_p.push('release=' + value);                
            }
            
            if (value === ah_label){
                html += '<li><a href="'+ page_name +'?'+ final_p.join('&') +'" data-value="'+value+'">  '+value+'</a></li>';
            }else{
                html += '<li><a href="'+ page_name +'?'+ final_p.join('&') +'" data-value="'+value+'">  '+ value[0].toUpperCase() + value.substring(1)+' release</a></li>';
            }
        });
        }else{
            html += '<li><i>No releases for this section</i></li>';
        }
        html += '</ul>';
        html += '</div>';

        return html;
    }

    function DSBlock(ds_name,box_labels,box_metrics,ts_metrics){
        /* Display block with functions DSSummaryBox and DSSummaryTimeSerie.
         
         Receives strings for box_labels,box_metrics,ts_metrics
         
         Note: This block is used in the index.html page
         */
        
        html = '';
        html += '<!-- irc -->';
        html += '<div class="row invisible-box">';

        //summary box here
        blabels = box_labels.split(',');
        bmetrics = box_metrics.split(',');
        html += DSSummaryBox(ds_name, blabels, bmetrics);

        html += '<div class="col-md-5">';
        tsm = ts_metrics.split(',');
        html += DSTimeSerie(ds_name, tsm[0]);
        html += '</div>';

        html += '<div class="col-md-5">';
        html += DSTimeSerie(ds_name, tsm[1]);
        html += '</div>';
        
        html += '</div>';
        html += '<!-- end irc -->';
        
        return html;


    }

    
    function summaryCell(width, label, ds_name, metric){
        /* Compose small cell used by the DS summary box*/
        html = '';
        html += '<div class="col-xs-'+ width+'">';
        html += '<div class="row thin-border">';
        html += '<div class="col-md-12">' + label + '</div>';
        html += '</div>';
        html += '<div class="row">';
        html += '<div class="col-md-12 medium-fp-number">';
        target_page = Utils.createLink(ds_name + '.html');
        html += '<a href="'+ target_page +'"> <span class="GlobalData"';
        html += 'data-data-source="' + ds_name + '" data-field="' + metric + '"></span>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
	html += '</div>';
        return html;        

    }
    function DSSummaryBox(ds_name, labels, metrics){
        /* Compose HTML for DS summary box.
         
         ds_name: string
         labels: array of strings
         metrics: array of strings
         */
        html = '';
        html += '<!-- summary box-->';
        html += '<div class="col-md-2">';
        html += '<div class="well well-small">';
        html += '<div class="row thin-border">';
        html += '<div class="col-md-12">' + labels[0] + '</div>';
        html += '</div>';
        html += '<div class="row grey-border">';
        html += '<div class="col-md-12 big-fp-number">';
        target_page = Utils.createLink(ds_name + '.html');
        /* we overwrite this for the forge */
        if (ds_name === 'releases') target_page = Utils.createLink('forge.html');
        html += '<a href="' + target_page +'"> <span class="GlobalData"';
        html += 'data-data-source="' + ds_name + '" data-field="' + metrics[0]+ '"></span>';
        html += '</a>';
        html += '</div>';
        html += '</div>';
        html += '<div class="row" style="padding: 5px 0px 0px 0px;">';

        if (labels.length === 2 && metrics.length === 2){
            html += summaryCell('12', labels[1], ds_name, metrics[1]);
        } else if (labels.length === 3 && metrics.length === 3){
            html += summaryCell('6', labels[1], ds_name, metrics[1]);
            html += summaryCell('6', labels[2], ds_name, metrics[2]);
        } else if (labels.length === 4 && metrics.length === 4){
            html += summaryCell('4', labels[1], ds_name, metrics[1]);
            html += summaryCell('4', labels[2], ds_name, metrics[2]);
            html += summaryCell('4', labels[3], ds_name, metrics[3]);            
        }

        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '<!-- end summary box -->';
        return html;

    }

    function DSTimeSerie(ds_name, metric){
        /*
         ds_name: string
         metric: string
         */
        html = '';
        html += '<div class="well well-small">';
        html += '<div class="MetricsEvol" data-data-source="'+ ds_name +'"';
        html += 'data-metrics="' + metric +'" data-min="true" style="height: 100px;"';
        html += 'data-light-style="true"></div>';
        html += '<a href="irc.html" style="color: black;">';
        html += ' <span class="MicrodashText" data-metric="' + metric+ '"></span>';
        html += '</a>';
        html += '</div>';
        return html;
    }

    function sideBarLinks(icon_text, title, ds_name, elements){
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
        var target_page = Utils.createLink(ds_name +'.html');
        html += '<li><a href="' + target_page + '">&nbsp;Overview</a></li>';
        $.each(elements, function(id,value){        
            target_page = Utils.createLink(ds_name + '-' + value + '.html');
            if (text.hasOwnProperty(value)){
                var label = text[value];
                if (value === 'repos'){
                    var DS = Report.getDataSourceByName(ds_name);
                    label = DS.getLabelForRepositories();
                    label = label.charAt(0).toUpperCase() + label.slice(1);
                }
                html += '<li><a href="'+ target_page + '">&nbsp;' + label + '</a></li>';
            }else{
                html += '<li><a href="'+ target_page + '">&nbsp;' + value + '</a></li>';
            }
        });
        html += '</ul></li>';
        return html;
    }

    function overallSummaryBlock(){
        html = '';
        html += '<!-- summary bar -->';
        html += '<div class="capped-box overall-summary ">';
        html += '<div class="stats-switcher-viewport js-stats-switcher-viewport">';
        html += '<ul class="numbers-summary">';
        html += '<li><a href="'+ Utils.createReleaseLink('scm.html') +'"><span class="GlobalData" ';
        html += 'data-data-source="scm" data-field="scm_commits"></span></a> commits</li>';
        html += '<li><a href="'+ Utils.createReleaseLink('scm.html') +'"><span class="GlobalData" ';
        html += 'data-data-source="scm" data-field="scm_authors"></span></a> developers ';
        html += '</li>';
        html += '<li><a href="'+ Utils.createReleaseLink('its.html') +'"><span class="GlobalData" ';
        html += 'data-data-source="its" data-field="its_opened"></span></a> tickets</li>';
        html += '<li><a href="'+ Utils.createReleaseLink('mls.html') +'"><span class="GlobalData" ';
        html += 'data-data-source="mls" data-field="mls_sent"></span></a> mail messages ';
        html += '</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';
        html += '<!-- end of summary bar -->';

        return html;
    }

    function smartLinks(target_page, label){
        /*
         Compose a link checking if the section is enabled and the release
         */
        html = '';
        link_exists = false;
        
        try {
            //scm-repos.html, scr-companies.html, ...
            fname = target_page.split('.')[0];
            section = fname.split('-')[0];
            subsection = fname.split('-')[1];
            
            var mele = Report.getMenuElements();
            if ( mele[section].indexOf(subsection) >= 0)
                link_exists = true; // section is enabled
            
            if(Utils.isReleasePage() && link_exists){            
                link_to = Utils.createReleaseLink(target_page);            
                html = '<a href="' + link_to + '">' + label + '</a>';
            }else if (link_exists){
                html = '<a href="' + target_page + '">' + label + '</a>';
            }else{
                html = label;
            }
        }catch(err){
            html = label;
        }        
        return html;
    }

})();

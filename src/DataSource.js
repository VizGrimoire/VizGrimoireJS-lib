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

// TODO: Use attributes for getters and setters

function DataSource(name, basic_metrics) {

    this.top_data_file = this.data_dir + '/'+this.name+'-top.json';
    this.getTopDataFile = function() {
        return this.top_data_file;
    };

    this.getMetrics = function() {return this.basic_metrics;};
    this.setMetrics = function(metrics) {this.basic_metrics = metrics;};

    this.setMetricsDefinition = function(metrics) {
        if (metrics === undefined) return;
        this.setMetrics(metrics);
    };

    this.data_file = this.data_dir + '/'+this.name+'-evolutionary.json';
    this.getDataFile = function() {
        return this.data_file;
    };
    this.setDataFile = function(file) {
        this.data_file = file;
    };

    this.data = null;
    this.getData = function() {
        return this.data;
    };

    function nameSpaceMetrics(plain_metrics, ds) {
        // If array, no data available
        if (plain_metrics instanceof Array) 
            return plain_metrics;
        var metrics = {};
        $.each(plain_metrics, function (name, value) {
            var basic_name = name;
            // commits_7, commits_30 ....
            var aux = name.split("_");
            if (isNaN(aux[aux.length-1]) === false)
                basic_name = aux.slice(0,aux.length-1).join("_"); 
            var ns_basic_name = ds.getName()+"_"+basic_name;
            var ns_name = ds.getName()+"_"+name;
            if (ds.getMetrics()[ns_basic_name] === undefined)
                metrics[name] = value;
            else metrics[ns_name] = value;
        });
        return metrics;
    }

    this.setData = function(load_data, self) {
        if (self === undefined) self = this;
        self.data = nameSpaceMetrics(load_data, self);
    };

    this.demographics_aging_file = this.data_dir + '/'+this.name+'-demographics-aging.json';
    this.demographics_birth_file = this.data_dir + '/'+this.name+'-demographics-birth.json';
    this.getDemographicsAgingFile = function() {
        return this.demographics_aging_file;
    };
    this.getDemographicsBirthFile = function() {
        return this.demographics_birth_file;
    };

    this.demographics_data = {};
    this.getDemographicsData = function() {
        return this.demographics_data;
    };
    this.setDemographicsAgingData = function(data, self) {
        if (self === undefined) self = this;
        self.demographics_data.aging = data;
    };

    this.setDemographicsBirthData = function(data, self) {
        if (self === undefined) self = this;
        self.demographics_data.birth = data;
    };

    this.data_dir = 'data/json';
    this.getDataDir = function() {
        return this.data_dir;
    };
    this.setDataDir = function(dataDir) {
        this.data_dir = dataDir;
        this.data_file = dataDir + '/'+this.name+'-evolutionary.json';
        this.demographics_aging_file = dataDir + '/'+this.name+'-demographics-aging.json';
        this.demographics_birth_file = dataDir + '/'+this.name+'-demographics-birth.json';
        this.global_data_file = dataDir + '/'+this.name+'-static.json';
        this.top_data_file = dataDir + '/'+this.name+'-top.json';
        this.companies_data_file = dataDir+'/'+ this.name +'-companies.json';
        this.repos_data_file = dataDir+'/'+ this.name +'-repos.json';
        this.countries_data_file = dataDir+'/'+ this.name +'-countries.json';
        this.domains_data_file = dataDir+'/'+ this.name +'-domains.json';
        this.time_to_fix_data_file = dataDir+'/'+ this.name +'-quantiles-month-time_to_fix_hour.json';
    };

    this.global_data_file = this.data_dir + '/'+this.name+'-static.json';
    this.getGlobalDataFile = function() {
        return this.global_data_file;
    };

    this.global_data = null;
    this.getGlobalData = function() {
        return this.global_data;
    };
    this.setGlobalData = function(data, self) {
        if (self === undefined) self = this;
        self.global_data = nameSpaceMetrics(data, self);
    };

    this.global_top_data = null;
    this.getGlobalTopData = function() {
        return this.global_top_data;
    };
    this.setGlobalTopData = function(data, self) {
        if (self === undefined) self = this;
        self.global_top_data = data;
    };
    this.name = name;    
    this.getName = function() {
        return this.name;
    };

    this.people_data_file = this.data_dir + '/'+this.name+'-people.json';
    this.getPeopleDataFile = function() {
        return this.people_data_file;
    };
    this.people = null;
    this.getPeopleData = function() {
        return this.people;
    };
    this.setPeopleData = function(people, self) {
        if (self === undefined) self = this;
        self.people = people;
    };

    this.time_to_fix_data_file = this.data_dir + '/'+this.name 
            + '-quantiles-month-time_to_fix_hour.json';
    this.getTimeToFixDataFile = function() {
        return this.time_to_fix_data_file;
    };
    this.time_to_fix_data = null;
    this.getTimeToFixData = function() {
        return this.time_to_fix_data;
    };
    this.setTimeToFixData = function(data, self) {
        if (self === undefined) self = this;
        self.time_to_fix_data = data;
    };

    this.time_to_attention_data_file = this.data_dir + '/'+this.name 
            + '-quantiles-month-time_to_attention_hour.json';
    this.getTimeToAttentionDataFile = function() {
        return this.time_to_attention_data_file;
    };
    this.time_to_attention_data = null;
    this.getTimeToAttentionData = function() {
        return this.time_to_attention_data;
    };
    this.setTimeToAttentionData = function(data, self) {
        if (self === undefined) self = this;
        self.time_to_attention_data = data;
    };

    this.project = null;
    this.getProject = function() {
        return this.project;
    };
    this.setProject = function(project) {
        this.project = project;
    };

    this.markov_table_data_file = this.data_dir + '/' + this.name + '-markov.json';
    this.getMarkovTableDataFile = function() {
        return this.markov_table_data_file;
    };
    this.markov_table_data = null;
    this.getMarkovTableData = function() {
        return this.markov_table_data;
    };
    this.setMarkovTableData = function(data, self) {
        if (self === undefined) self = this;
        self.markov_table_data = data;
    };

    // Companies data
    this.companies_data_file = this.data_dir+'/'+ this.name +'-companies.json';
    this.getCompaniesDataFile = function() {
        return this.companies_data_file;
    };

    this.companies = null;
    this.getCompaniesData = function() {
        return this.companies;
    };
    this.setCompaniesData = function(companies, self) {
        if (companies === null) companies = [];
        if (!(companies instanceof Array)) companies=[companies];
        if (self === undefined) self = this;
        self.companies = companies;
    };

    this.companies_metrics_data = {};
    this.addCompanyMetricsData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_metrics_data[company] = nameSpaceMetrics(data, self);
    };
    this.getCompaniesMetricsData = function() {
        return this.companies_metrics_data;
    };

    this.companies_global_data = {};
    this.addCompanyGlobalData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_global_data[company] = nameSpaceMetrics(data, self);
    };
    this.getCompaniesGlobalData = function() {
        return this.companies_global_data;
    };

    this.companies_top_data = {};
    this.addCompanyTopData = function(company, data, self) {
        if (self === undefined) self = this;
        if (self.companies_top_data[company] === undefined)
            self.companies_top_data[company] = {};
        self.companies_top_data[company] = data;
    };
    this.getCompaniesTopData = function() {
        return this.companies_top_data;
    };
    this.setCompaniesTopData = function(data, self) {
        if (self === undefined) self = this;
        self.companies_top_data = data;
    };

    // Repos data
    this.repos_data_file = 
        this.data_dir+'/'+ this.name +'-repos.json';
    this.getReposDataFile = function() {
        return this.repos_data_file;
    };

    this.repos = null;
    this.getReposDataFull = function() {
        return this.repos;
    };
    this.getReposData = function() {
        var items = this.repos;
        if (this.getName() === "scr") {
            if  (items instanceof Array === false)
                // New format with names and metrics
                items = this.repos.name;
        }
        return items;
    };
    this.setReposData = function(repos, self) {
        if (self === undefined) self = this;
        // if (!(repos instanceof Array)) repos=[repos];
        self.repos = repos;
    };

    this.repos_metrics_data = {};
    this.addRepoMetricsData = function(repo, data, self) {
        if (self === undefined) self = this;
        self.repos_metrics_data[repo] = nameSpaceMetrics(data, self);
    };
    this.getReposMetricsData = function() {
        return this.repos_metrics_data;
    };

    this.repos_global_data = {};
    this.addRepoGlobalData = function(repo, data, self) {
        if (self === undefined) self = this;
        self.repos_global_data[repo] =  nameSpaceMetrics(data, self);
    };
    this.getReposGlobalData = function() {
        return this.repos_global_data;
    };

    // Countries data
    this.countries_data_file = 
        this.data_dir+'/'+ this.name +'-countries.json';
    this.getCountriesDataFile = function() {
        return this.countries_data_file;
    };

    this.countries = null;
    this.getCountriesData = function() {
        return this.countries;
    };
    this.setCountriesData = function(countries, self) {
        if (self === undefined) self = this;
        self.countries = countries;
    };

    this.countries_metrics_data = {};
    this.addCountryMetricsData = function(country, data, self) {
        if (self === undefined) self = this;
        self.countries_metrics_data[country] = nameSpaceMetrics(data, self);
    };
    this.getCountriesMetricsData = function() {
        return this.countries_metrics_data;
    };

    this.countries_global_data = {};
    this.addCountryGlobalData = function(country, data, self) {
        if (self === undefined) self = this;
        self.countries_global_data[country] = nameSpaceMetrics(data, self);
    };
    this.getCountriesGlobalData = function() {
        return this.countries_global_data;
    };

    // Domains
    this.domains_data_file =
        this.data_dir+'/'+ this.name +'-domains.json';
    this.getDomainsDataFile = function() {
        return this.domains_data_file;
    };

    this.domains = null;
    this.getDomainsData = function() {
        return this.domains;
    };
    this.setDomainsData = function(domains, self) {
        if (domains === null) domains = [];
        if (!(domains instanceof Array)) domains=[domains];
        if (self === undefined) self = this;
        self.domains = domains;
    };

    this.domains_metrics_data = {};
    this.addDomainMetricsData = function(domain, data, self) {
        if (self === undefined) self = this;
        self.domains_metrics_data[domain] = nameSpaceMetrics(data, self);
    };
    this.getDomainsMetricsData = function() {
        return this.domains_metrics_data;
    };

    this.domains_global_data = {};
    this.addDomainGlobalData = function(domain, data, self) {
        if (self === undefined) self = this;
        self.domains_global_data[domain] =  nameSpaceMetrics(data, self);
    };
    this.getDomainsGlobalData = function() {
        return this.domains_global_data;
    };

    // people
    this.people_metrics_data = {};
    this.addPeopleMetricsData = function(id, data, self) {
        if (self === undefined) self = this;
        self.people_metrics_data[id] = nameSpaceMetrics(data, self);
    };
    this.getPeopleMetricsData = function() {
        return this.people_metrics_data;
    };

    this.people_global_data = {};
    this.addPeopleGlobalData = function(id, data, self) {
        if (self === undefined) self = this;
        self.people_global_data[id] = nameSpaceMetrics(data, self);
    };
    this.getPeopleGlobalData = function() {
        return this.people_global_data;
    };


    // TODO: Move this logic to Report
    this.getCompanyQuery = function () {
        var company = null;
        var querystr = window.location.search.substr(1);
        if (querystr  &&
                querystr.split("&")[0].split("=")[0] === "company")
            company = querystr.split("&")[0].split("=")[1];
        return company;
    };

    this.displayMetricCompanies = function(metric_id,
            div_target, config, start, end) {
        var companies_data = this.getCompaniesMetricsData();
        Viz.displayMetricCompanies(metric_id, companies_data,
                div_target, config, start, end);
    };

    this.displayMetricMyCompanies = function(companies, metric_id,
            div_target, config, start, end) {
        var companies_data = {};
        var self = this;
        $.each(companies, function(i,name) {
            companies_data[name] = self.getCompaniesMetricsData()[name];
        });
        Viz.displayMetricCompanies(metric_id, companies_data,
                div_target, config, start, end);
    };

    // TODO: mix with displayMetricCompanies
    this.displayMetricRepos = function(metric_id,
            div_target, config, start, end) {
        var repos_data = this.getReposMetricsData();
        Viz.displayMetricRepos(metric_id, repos_data,
                div_target, config, start, end);
    };

    // Includes repos mapping for actionable dashboard comparison
    this.displayBasicMetricMyRepos = function(repos, metric_id,
            div_target, config, start, end) {
        var repos_data = {};
        var reposMap = Report.getReposMap();
        var self = this;
        $.each(repos, function(i,name) {
            var metrics = self.getReposMetricsData()[name];
            if (!metrics) {
                if (reposMap[name] instanceof Object) {
                    // New format: name: {scm:name, its:name ...}
                    name = reposMap[name][self.getName()];
                } else {
                    //  Old format: scm:its
                    name = reposMap[name];
                }
                metrics = self.getReposMetricsData()[name];
            }
            repos_data[name] = metrics;
        });
        Viz.displayMetricRepos(metric_id, repos_data,
                div_target, config, start, end);
    };

    this.displayMetricDomains = function(metric_id,
            div_target, config, start, end) {
        var domains_data = this.getDomainsMetricsData();
        Viz.displayMetricDomains(metric_id, domains_data,
                div_target, config, start, end);
    };

    this.displayMetricCompaniesStatic = function (metric_id,
            div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic ("companies",metric_id,
                div_target, config, order_by, show_others);
    };

    this.displayMetricReposStatic = function (metric_id,
            div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic ("repos", metric_id,
                div_target, config, order_by, show_others);
    };

    this.displayMetricCountriesStatic = function (metric_id,
          div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic ("countries", metric_id,
            div_target, config, order_by, show_others);
    };

    this.displayMetricDomainsStatic = function (metric_id,
            div_target, config, order_by, show_others) {
        this.displayMetricSubReportStatic ("domains",metric_id,
                div_target, config, order_by, show_others);
    };

    this.displayMetricSubReportStatic = function (report, metric_id,
            div_target, config, order_by, show_others) {
        if (order_by === undefined) order_by = metric_id;
        var data = null;
        if (report=="companies")
            data = this.getCompaniesGlobalData();
        else if (report=="repos")
            data = this.getReposGlobalData();
        else if (report=="countries")
          data = this.getCountriesGlobalData();
        else if (report=="domains")
            data = this.getDomainsGlobalData();
        else return;

        if ($.isEmptyObject(data)) return;

        var order = null;
        if (report=="companies")
            order = DataProcess.sortCompanies(this, order_by);
        else if (report=="repos")
            order = DataProcess.sortRepos(this, order_by);
        else if (report=="countries")
          order = DataProcess.sortCountries(this, order_by);
        else if (report=="domains")
            order = DataProcess.sortDomains(this, order_by);
        order = DataProcess.paginate(order, Report.getCurrentPage());

        Viz.displayMetricSubReportStatic(metric_id, data, order,
            div_target, config);
    };

    this.displayMetricsCompany = function (
            company, metrics, div_id, config) {
        var data = this.getCompaniesMetricsData()[company];
        if (data === undefined) {
            $("#"+div_id).hide();
            return;
        }
        Viz.displayMetricsCompany(company, metrics, data, div_id, config);
    };

    this.displayMetricsRepo = function (repo, metrics, div_id, config) {
        var data = this.getReposMetricsData()[repo];
        if (data === undefined) {
            $("#"+div_id).hide();
            return;
        }
        Viz.displayMetricsRepo(repo, metrics, data, div_id, config);
    };

    this.displayMetricsCountry = function (country, metrics, div_id, config) {
        var data = this.getCountriesMetricsData()[country];
        if (data === undefined) {
            $("#"+div_id).hide();
            return;
        }
        Viz.displayMetricsCountry(country, metrics, data, div_id, config);
    };

    this.displayMetricsDomain = function (domain, metrics, div_id, config) {
        var data = this.getDomainsMetricsData()[domain];
        if (data === undefined) return;
        Viz.displayMetricsDomain(domain, metrics, data, div_id, config);
    };

    this.displayMetricsPeople = function (upeople_id, upeople_identifier, metrics, div_id, config) {
        var history = this.getPeopleMetricsData()[upeople_id];

        if (history === undefined || history instanceof Array) {
            $("#"+div_id).hide();
            return;
        }
        Viz.displayMetricsPeople(upeople_identifier, metrics, history, div_id, config);
    };

    // TODO: support multiproject
    this.displayMetricsEvol = function(metric_ids, div_target, config, convert) {
        var data = this.getData();
        if (convert) data = DataProcess.convert(data, convert, metric_ids);
        Viz.displayMetricsEvol(this, metric_ids, data, div_target, config);
    };

    this.isPageDisplayed = function (visited, linked, total, displayed) {
        // Returns true if link page should be displayed.
        // Receive: number of visited page,
        //   number of page to be displayed,
        //   total number of pages,
        //   number of pages to be displayed

        var window = Math.floor((displayed - 3)/2);
        var lowest_barrier = visited - window;
        var highest_barrier = (visited + window);


        if ((linked === 1) || (linked === total) || (linked == visited)){
            return true;
        }
        //else if ((linked >= (visited - window)) || (linked <= (visited + window))) {
        else if ((linked >= lowest_barrier) && (linked < visited)){
            return true;
        }
        else if ((linked <= highest_barrier) && (linked > visited)){
            return true;
        }
        else{
            return false;
        }
    };

    this.displayItemsNav = function (div_nav, type, page_str, order_by) {
        var page = parseInt(page_str, null);
        if (isNaN(page)) page = 1;
        var items = null;
        var title = "";
        var total = 0;
        var displayed_pages = 5; // page displayed in the paginator
        if (type === "companies") {
            items = this.getCompaniesData();
            title = "List of companies";
        } else if (type === "repos") {
            items = this.getReposData();
            if (order_by) 
                items = DataProcess.sortRepos(this, order_by);
        } else if (type === "countries") {
            items = this.getCountriesData();
        } else if (type === "domains") {
            items = this.getDomainsData();
        } else {
            return;
        }

        total = items.length;

        var nav = '';
        var psize = Report.getPageSize();
        if (page) {
            nav += "<div class='pagination'>";
            var number_pages = Math.ceil(total/psize);
            // number to compose the text message (from_item - to_item / total)
            var from_item = ((page-1) * psize) + 1;
            var to_item = page * psize;
            if (to_item > total){
                to_item = total;
            }

            // Bootstrap
            nav += "<ul class='pagination'>";
            if (page>1) {
                nav += "<li><a href='?page="+(page-1)+"'>&laquo;</a></li>";
            }
            else{
                nav += "<li class='disabled'><a href='?page="+(page)+"'>&laquo;</a></li>";
            }

            for (var j=0; j*Report.getPageSize()<total; j++) {
                if (this.isPageDisplayed(page, (j+1), number_pages, displayed_pages) === true){
                    if (page === (j+1)) {
                        nav += "<li class='active'><a href='?page="+(j+1)+"'>" + (j+1) + "</a></li>";
                    }
                    else {
                        nav += "<li><a href='?page="+(j+1)+"'>" + (j+1) + "</a></li>";
                    }
                }
                else {
                    // if it is next to the last page or the second and is not displayed, we add the '..'
                    if ( ((j+1+1) === number_pages) || ((j+1-1) === 1) ){
                        nav += "<li class='disabled'><a href='#'> .. </a></li>";
                    }
                }
            }
            if (page*Report.getPageSize()<items.length) {
                nav += "<li><a href='?page="+(parseInt(page,null)+1)+"'>";
                nav += "&raquo;</a></li>";
            }
            nav += "</ul>";
            nav += "<span class='pagination-text'> (" + from_item +" - "+ to_item + "/" + total+ ")</span>";
            nav += "</div>";
        }
        //nav += "<span id='nav'></span>";
        // Show only the items navbar when there are more than 10 items
        if (Report.getPageSize()>10)
            $.each(items, function(id, item) {
                var label = Report.cleanLabel(item);
                nav += "<a href='#"+item+"-nav'>"+label + "</a> ";
            });
        $("#"+div_nav).append(nav);
    };

    this.displayCompaniesLinks = function (div_links, limit, sort_metric) {
        var sorted_companies = DataProcess.sortCompanies(this, sort_metric);
        var links = "";
        var i = 0;
        $.each(sorted_companies, function(id, company) {
            links += '<a href="company.html?company='+company;
            if (Report.addDataDir())
                links += '&'+Report.addDataDir();
            links += '">'+company+'</a>| ';
            if (i++>=limit-1) return false;
        });
        $("#"+div_links).append(links);
    };

    this.displayCompaniesList = function (metrics,div_id, 
            config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("companies",metrics,div_id, 
                config_metric, sort_metric, page, show_links, start, end, convert);
    };

    this.displayReposList = function (metrics,div_id, 
            config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("repos",metrics,div_id, 
                config_metric, sort_metric, page, show_links, start, end, convert);
    };

    this.displayCountriesList = function (metrics,div_id, 
            config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("countries",metrics,div_id, 
                config_metric, sort_metric, page, show_links, start, end, convert);
    };

    this.displayDomainsList = function (metrics,div_id,
            config_metric, sort_metric, page, show_links, start, end, convert) {
        this.displaySubReportList("domains",metrics,div_id,
                config_metric, sort_metric, page, show_links, start, end, convert);
    };

    this.displaySubReportList = function (report, metrics,div_id, 
            config_metric, sort_metric, page_str, show_links, start, end, convert) {

        var page = parseInt(page_str, null);
        if (isNaN(page)) page = 1;
        var list = "";
        var cont = ( page - 1 ) * Report.getPageSize() + 1;
        var ds = this;
        var data = null, sorted = null;
        if (show_links === undefined) show_links = true;
        if (report === "companies") {
            data = this.getCompaniesMetricsData();
            sorted = DataProcess.sortCompanies(this, sort_metric);
        }
        else if (report === "repos") {
            data = this.getReposMetricsData();
            sorted = DataProcess.sortRepos(this, sort_metric);
        }
        else if (report === "countries") {
            data = this.getCountriesMetricsData();
            sorted = DataProcess.sortCountries(this, sort_metric);
        }
        else if (report === "domains") {
            data = this.getDomainsMetricsData();
            sorted = DataProcess.sortDomains(this, sort_metric);
        }
        else return;

        sorted = DataProcess.paginate(sorted, page);

        list += '<table class="table table-hover table-repositories">';
        list += '<tr><th></th>';
        $.each(metrics, function(id,metric){
            if (ds.getMetrics()[metric]){
                title = ds.getMetrics()[metric].name;
                list += '<th>' + title + '</th>';
            }
            else{
                list += '<th>' + metric + '</th>';
            }
        });
        list += '</tr>';
        $.each(sorted, function(id, item) {
            list += "<tr><td class='span2 repository-name'>";
            list += "#" + cont + "&nbsp;";
            cont++;
            var addURL = null;
            if (Report.addDataDir()) addURL = Report.addDataDir();
            if (show_links) {
                if (report === "companies") { 
                    list += "<a href='company.html?company="+item;
                    if (addURL) list += "&"+addURL;
                    list += "'>";
                }
                else if (report === "repos") {
                    list += "<a href='";
                    list += "repository.html";
                    list += "?repository=" + encodeURIComponent(item);
                    if (addURL) list += "&"+addURL;
                    list += "'>";
                }
                else if (report === "countries") {
                    list += "<a href='country.html?country="+item;
                    if (addURL) list += "&"+addURL;
                    list += "'>";
                }
                else if (report === "domains") {
                    list += "<a href='domain.html?domain="+item;
                    if (addURL) list += "&"+addURL;
                    list += "'>";
                }
            }
            list += "<strong>";
            list += Report.cleanLabel(item);
            list += "</strong>";
            if (show_links) list += "</a>";
            //list += "<br><a href='#nav'>^</a>";
            list += "</td>";
            $.each(metrics, function(id, metric) {
                list += "<td class='span5'>";
                list += "<div id='"+report+"-"+item+"-"+metric+"'";
                list +=" class='subreport-list-item'>";
            });
            list += "</td></tr>";
        });
        list += "</table>";
        $("#"+div_id).append(list);
        // Draw the graphs
        var start_items = null, end_items = null, convert_items = null;
        if (start) start_items = start.split(",");
        if (end) end_items = end.split(",");
        if (convert) convert_items = convert.split(",");
        $.each(sorted, function(id, item) {
            var i = 0;
            $.each(metrics, function(id, metric) {
                var mstart = null, mend = null, mconvert = null;
                if (start_items) mstart = start_items[i];
                if (end_items) mend = end_items[i];
                if (convert_items) mconvert = convert_items[i];
                if (item in data === false) return;
                var item_data = data[item];
                if (item_data[metric] === undefined) return;
                var div_id = report+"-"+item+"-"+metric;
                var items = {};
                items[item] = item_data;
                var title = '';
                Viz.displayMetricSubReportLines(div_id, metric, items, title, 
                        config_metric, mstart , mend, mconvert); 
                i++;
            });
        });
    };

    this.displayGlobalSummary = function(divid) {
        this.displaySummary(null, divid, null, this);
    };

    this.displayCompanySummary = function(divid, company, ds) {
        this.displaySummary("companies",divid, company, ds);
    };

    this.displayRepoSummary = function(divid, repo, ds) {
        this.displaySummary("repositories",divid, repo, ds);
    };

    this.displayCountrySummary = function(divid, repo, ds) {
        this.displaySummary("countries",divid, repo, ds);
    };

    this.displayDomainSummary = function(divid, domain, ds) {
        this.displaySummary("domains",divid, domain, ds);
    };

    this.displayPeopleSummary = function(divid, upeople_id, 
            upeople_identifier, ds) {
        var history = ds.getPeopleGlobalData()[upeople_id];

        if (history === undefined || history instanceof Array) return;

        html = "<h6>" + ds.getTitle() + "</h6>";

        html += "<table class='table-condensed table-hover'>";
        html += "<tr><td>";
        html += "Start</td><td>"+history.first_date;
        html += "</td></tr><tr><td>";
        html += "End</td><td>"+ history.last_date;
        html += "</td></tr><tr><td>";
        if (ds.getName() == "scm") html += "Commits</td><td>" + history.scm_commits;
        else if (ds.getName() == "its") html += "Closed</td><td>" + history.its_closed;
        else if (ds.getName() == "mls") html += "Sent</td><td>" + history.mls_sent;
        else if (ds.getName() == "irc") html += "Sent</td><td>" + history.irc_sent;
        else if (ds.getName() == "scr") html += "Closed</td><td>" + history.scr_closed;
        html += "</td></tr>";
        html += "</table>";

        $("#"+divid).append(html);
    };

    this.displayCompaniesSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();

        html += "Total companies: " + data.companies +"<br>";
        if (data.companies_2006)
            html += "Companies in 2006: " + data.companies_2006+"<br>";
        if (data.companies_2009)
            html += "Companies in 2009: " + data.companies_2009+"<br>";
        if (data.companies_2012)
            html += "Companies in 2012: " + data.companies_2012+"<br>";

        $("#"+divid).append(html);
    };

    // Return labels to be shown in the summary
    this.getSummaryLabels = function () {};

    this.displaySummary = function(report, divid, item, ds) {
        if (!item) item = "";
        var html = "<h6>" + ds.getTitle()+ "</h6>";
        var id_label = this.getSummaryLabels();
        var global_data = null;
        if (report === "companies")
            global_data = ds.getCompaniesGlobalData()[item];
        else if (report === "countries")
            global_data = ds.getCountriesGlobalData()[item];
        else if (report === "repositories")
            global_data = ds.getReposGlobalData()[item];
        else if (report === "domains")
            global_data = ds.getDomainsGlobalData()[item];
        else global_data = ds.getGlobalData();

        if (!global_data) return;

        var self = this;
        html += "<table class='table-condensed table-hover'>";
        $.each(global_data,function(id,value) {
            html += "<tr><td>";
            // if (id_label[id] === undefined) return;
            if (self.getMetrics()[id]) {
                html += self.getMetrics()[id].name + "</td><td>" + Report.formatValue(value);
            } else if (id_label[id]) { 
                html += id_label[id] + "</td><td>" + Report.formatValue(value);
            } else {
                if (report) html += id + "</td><td>" + Report.formatValue(value);
            }
            html += "</td></tr>";
        });
        html += "</table>";
        $("#"+divid).append(html);
    };

    this.displayReposSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total repositories: " + data[ds.getName()+"_repositories"] +"<br>";
        $("#"+divid).append(html);
    };

    this.displayCountriesSummary = function(divid, ds) {
      var html = "";
      var data = ds.getGlobalData();
      html += "Total countries: " + data.countries +"<br>";
      $("#"+divid).append(html);
    };

    this.displayDomainsSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total domains: " + data.domains +"<br>";
        $("#"+divid).append(html);
    };

    this.displayDemographics = function(divid, period) {
        var data = this.getDemographicsData();
        Viz.displayDemographicsChart(divid, this, data, period);
    };

    this.displayTimeToAttention = function(div_id, column, labels, title) {
        labels = true;
        title = "Time to Attention " + column;
        var data = this.getTimeToAttentionData();
        if (data instanceof Array) return;
        Viz.displayTimeToAttention(div_id, data, column, labels, title);
    };

    this.displayTimeToFix = function(div_id, column, labels, title) {
        labels = true;
        title = "Time to Fix " + column;
        var data = this.getTimeToFixData();
        if (data instanceof Array) return;
        Viz.displayTimeToFix(div_id, this.getTimeToFixData(), column, labels, title);
    };

    this.displayMarkovTable = function(div_id, title) {
        var data = this.getMarkovTableData();
        if (data === undefined) {
            Report.log ('No Markov data available');
            return;
        }
        Viz.displayMarkovTable(div_id, data, title);
    };

    this.displayTop = function(div, all, show_metric, period, graph, limit, people_links) {
        if (all === undefined) all = true;
        var titles = null;
        if ( (this.getName() == "mls") && (show_metric == "threads") ){
            Viz.displayTopThreads(div, this, all, show_metric, period, limit, people_links);
        }else{
            Viz.displayTop(div, this, all, show_metric, period, graph, titles, limit, people_links);
        }
    };

    this.displayTopCompany = function(company, div, metric_id, period, titles) {
        var data = this.getCompaniesTopData()[company];
        if (data === undefined) return;
        var metric = this.getMetrics()[metric_id];

        Viz.displayTopCompany(company, data, div, metric, period, titles);
    };

    this.displayTopGlobal = function(div, metric, period, titles) {
        Viz.displayTopGlobal(div, this, metric, period, titles);
    };

    this.envisionEvo = function(div_id, history, relative, legend_show, summary_graph) {
        config = Report.getVizConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this.getName(),
                Report.getVizConfig()[this.getName()+"_hide"], summary_graph);
        options.legend_show = legend_show;

        if (relative)
            DataProcess.addRelativeValues(options.data, this.getMainMetric());

        new envision.templates.Envision_Report(options, [ this ]);
    };

    this.displayEnvision = function(divid, relative, legend_show, summary_graph) {
        var projects_full_data = Report.getProjectsDataSources();

        this.envisionEvo(divid, projects_full_data, relative, legend_show, summary_graph);
    };
}

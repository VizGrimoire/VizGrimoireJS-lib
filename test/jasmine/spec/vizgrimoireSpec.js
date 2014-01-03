describe( "VizGrimoireJS library", function () {
    beforeEach(function() {
        // Logs make jasmine test exit to be error
        Report.setLog(false);
        waitsFor(function() {
            return Loader.check_data_loaded();
        }, "It took too long to load data", 100);
      });
    describe( "Report", function () {
        it("data files should be loaded", function () {
            waitsFor(function() {
                return Loader.check_data_loaded();
            }, "It took too long to load data", 100);
            runs(function() {
                expect(Loader.check_data_loaded()).toBeTruthy();
            });
        });

        var blocks = ["Navbar","Refcard","Footer"];
        it(blocks.join() + " should be loaded from file", function () {
            runs(function() {
                $.each(blocks, function(index, value) {buildNode(value);});
                $.each(blocks, function(index, value) {Convert["convert"+value]();});
            });
            waitsFor(function() {
                var loaded = document.getElementsByClassName('info-pill');
                return (loaded.length > 1);
            }, "It took too long to convert " + blocks.join(), 500);
            runs(function() {
                $.each(blocks, function(index, value) {
                    expect(document.getElementById(value).childNodes.length)
                    .toBeGreaterThan(0);});
            });
        });

        describe( "html report should be converted", function () {
            it("html MetricsEvolSet should be displayed", function () {
                runs(function() {
                    $.each(Report.getDataSources(), function(index, DS) {
                        buildNode(DS.getName()+"-MetricsEvolSet", 'MetricsEvolSet',
                            {
                                'data-data-source': DS.getName(),
                            });
                    });
                    Convert.convertMetricsEvolSet();
                    var envisionCreated = document.getElementsByClassName
                        ('envision-visualization');
                    expect(envisionCreated.length).toEqual
                        (Report.getDataSources().length);
                });        
            });
            it("html MetricsEvol should be displayed", function () {
                runs(function() {
                    $.each(Report.getDataSources(), function(index, DS) {
                        $.each(DS.getMetrics(), function(i, metric) {
                            buildNode(DS.getName()+"-MetricsEvol-"+metric.column, 'MetricsEvol',
                              {
                                  'data-data-source': DS.getName(),
                                  'data-metrics': DS.getName()+"_"+metric.column
                              });
                        });
                    });
                    Convert.convertMetricsEvol();
                    $.each(Report.getDataSources(), function(index, DS) {
                        var ds_metrics = DS.getData(); 
                        $.each(DS.getMetrics(), function(name, metric) {
                            if (ds_metrics[name] === undefined) return true;
                            var div_id = DS.getName()+"-MetricsEvol-"+metric.column;
                            div_id = name+"-"+DS.getName()+"-metrics-evol-"+div_id;
                            expect(document.getElementById(div_id)
                                    .childNodes.length).toBeGreaterThan(0);
                        });
                    });
                });
            });
            it("html top should be displayed", function () {
                runs(function() {
                    $.each(Report.getDataSources(), function(index, DS) {
                        if (DS.getName() === "scr") return;
                        buildNode(DS.getName()+"-Top", 'Top',
                            {
                                'data-data-source': DS.getName(),
                            });
                        buildNode(DS.getName()+"-Top-pie", 'Top',
                            {
                                'data-data-source': DS.getName(),
                                'data-graph':'pie'
                            });
                        buildNode(DS.getName()+"-Top-bars", 'Top',
                            {
                                'data-data-source': DS.getName(),
                                'data-graph':'bars'
                            });
                    });
                    Convert.convertTop();
                });
                runs(function() {
                    var unique = 0;
                    $.each(Report.getDataSources(), function(index, DS) {
                        if (DS.getName() === "scr") return;
                        expect(document.getElementById(DS.getName()+"-Top" + (unique++))
                                .childNodes.length).toBeGreaterThan(0);
                        expect(document.getElementById(DS.getName()+"-Top" + (unique++) + "-pie")
                                .childNodes.length).toBeGreaterThan(0);
                        expect(document.getElementById(DS.getName()+"-Top" + (unique++) +"-bars")
                                .childNodes.length).toBeGreaterThan(0);
                    });
                });
            });
            it("html bubbles should be displayed", function () {
                runs(function() {
                    $.each(Report.getDataSources(), function(index, DS) {
                        buildNode(DS.getName()+"-time-bubbles","Bubbles",
                                {
                                    'data-data-source': DS.getName()
                                });
                    });
                    var ncanvas = document.getElementsByClassName
                        ('flotr-canvas').length;
                    Convert.convertBubbles();
                    var new_ncanvas = document.getElementsByClassName
                        ('flotr-canvas').length;
                    // scr and irc and mediawiki does not support bubbles yet
                    var bubbles_ds = Report.getDataSources().length - 3;
                    expect(new_ncanvas-ncanvas).toEqual(bubbles_ds);
                });        
            });
            it("html demographics should be displayed", function () {
                function buildNodesDemographic(type) {
                    $.each(Report.getDataSources(), function(index, DS) {
                        if (DS.getName() !== "scr" && DS.getName() !== "irc" && DS.getName() !== "mediawiki")
                            buildNode(DS.getName()+"-demographics-"+type,
                                      'Demographics',
                                    {
                                        'data-period': '0.25',
                                        'data-data-source': DS.getName(),
                                        'data-type': type,
                                        'style':'position: relative'
                                    });
                    });
                }
                var ncanvas = 0;
                runs(function() {
                    buildNodesDemographic('aging');
                    buildNodesDemographic('birth');
                    ncanvas = document.getElementsByClassName
                        ('flotr-canvas').length;
                    Convert.convertDemographics();
                });
                waitsFor(function() {
                    return (document.getElementsByClassName("Demographics")[0]
                    .childNodes.length > 0);
                }, "It took too long to load data", 100);
                runs(function() {
                    var new_ncanvas = document.getElementsByClassName
                        ('flotr-titles').length;
                    expect(new_ncanvas-ncanvas).toEqual(6);
                });
            });
//            it("html selectors should be displayed", function () {
//                runs(function() {
//                    $.each(Report.getDataSources(), function(index, DS) {
//                        // TODO: SCM and ITS selectors not supported yet
//                        if (DS.getName() === "mls")
//                            buildNode(DS.getName()+"-selector");
//                            buildNode(DS.getName()+"-flotr2-lists", "mls-dyn-list");
//                            buildNode(DS.getName()+"-envision-lists");
//                    });
//                    Report.convertSelectors();
//                });
//                // TODO: Move JSON loading to global loading
//                waitsFor(function() {
//                        return (document.getElementById("form_mls_selector") != null);
//                    }, "It took too long to load data", 100);               
//                runs(function() {
//                    $.each(Report.getDataSources(), function(index, DS) {
//                        if (DS.getName() === "mls")
//                            expect(document.getElementById
//                                ("form_"+DS.getName()+"_selector")
//                                .childNodes.length).toBeGreaterThan(0);
//                    });
//                });
//            });
            it("html radar should be displayed", function () {
                runs(function() {
                    buildNode("RadarActivity","radar");
                    buildNode("RadarCommunity","radar");
                    var ncanvas = document.getElementsByClassName
                        ('flotr-canvas').length;
                    Convert.convertRadarActivity();
                    Convert.convertRadarCommunity();
                    var new_ncanvas = document.getElementsByClassName
                        ('flotr-canvas').length;
                    expect(new_ncanvas-ncanvas).toEqual(2);
                });
            });
//            it("html gridster should be displayed", function () {
//                runs(function() {
//                    buildNode("gridster","gridster");
//                    Report.getBasicDivs()["gridster"].convert(); 
//                    var grids = document.getElementsByClassName
//                        ('gs_w').length;
//                    expect(grids).toEqual(18);
//                });
//            });
            it("html Treemap should be displayed", function () {               
                runs(function() {
                    buildNode("Treemap","treemap",
                            {'data-file':'data/json/treemap.json'});
                    Convert.convertTreemap();
                });
                waitsFor(function() {
                    return (document.getElementsByClassName("treemap-node").length>0);
                }, "It took too long to load treemap data", 100);
                runs(function() {
                    var nodes = document.getElementsByClassName
                        ('treemap-node').length;
                    expect(nodes).toEqual(252);
                });
            });
        });
    });
    describe("VizGrimoireJS loaded", function() {
        it("should be present in the global namespace", function () {
            expect(Report).toBeDefined();
            expect(Viz).toBeDefined();
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, DS) {
                expect(DS).toBeDefined();
            });
        });
    });

    describe("Data checking", function() {
        it("Evol metrics should be present in the Global metrics", function () {
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, DS) {
                var global = DS.getGlobalData();
                var evol = DS.getData();
                for (field in evol) {
                    if (DS.getMetrics()[field]) {
                        expect(global[field]).toBeDefined();
                    }
                }
            });
        });
        it("Summable Evol metrics should sum Global metrics", function () {
            var data_sources = Report.getDataSources();
            // var summable_metrics= ['its_opened','its_closed','mls_sent','scm_commits','scr_sent'];
            var summable_metrics= ['its_opened','mls_sent','scm_commits','scr_sent'];
            $.each(data_sources, function(index, DS) {
                var global = DS.getGlobalData();
                var evol = DS.getData();
                for (field in evol) {
                    if (DS.getMetrics()[field]) {
                        if ($.inArray(field,summable_metrics)===-1) continue;
                        var metric_evol = evol[field];
                        var metric_total = 0;
                        for (var i=0; i<metric_evol.length;i++) {
                            metric_total += metric_evol[i];
                        }
                        expect(metric_total).toEqual(global[field]);
                    }
                }
            });
        });
    });

    function checkDataReport(report) {
        if ($.inArray(report,['repos','companies','countries', 'domains'])===-1)
            return;
        var data_sources = Report.getDataSources();
        var repos = 0, repos_global = {}, repos_metrics = {};
        $.each(data_sources, function(index, DS) {
            if (report === "repos") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            else if (report === "companies") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            else if (report === "countries") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            else if (report === "domains") {
                repos = DS.getDomainsData();
                repos_global = DS.getDomainsGlobalData();
                repos_metrics = DS.getDomainsMetricsData();
            }
            if (repos.length === 0) return;
            for (var i=0; i<repos.length; i++) {
                for (field in repos_metrics[repos[i]]) {
                    if (DS.getMetrics()[field]) {
                        expect(repos_global[repos[i]][field]).toBeDefined();
                    }
                }
            }
        });
    }

    function checkVizReport(report) {
        var ncanvas = 0, total_canvas = 0;
        runs(function() {
            if ($.inArray(report,['repos','companies','countries', 'domains'])===-1)
                return;
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, DS) {
                var ds_name = DS.getName();
                if (report === "repos")
                    total_repos = DS.getReposData().length;
                else if (report === "companies")
                    total_repos = DS.getCompaniesData().length;
                else if (report === "countries")
                    total_repos = DS.getCountriesData().length;
                else if (report === "domains")
                    total_repos = DS.getDomainsData().length;
                if (total_repos > Report.getPageSize())
                    total_repos = Report.getPageSize();
                total_canvas += 2*total_repos;
                var metrics = "";
                if (ds_name === "scm") metrics = "scm_commits,scm_authors";
                if (ds_name === "its") metrics = "its_closed,its_closers";
                if (ds_name === "mls") metrics = "mls_sent,mls_senders";
                if (ds_name === "irc") metrics = "irc_sent,irc_senders";
                if (ds_name === "scr") metrics = "scr_submitted,scr_merged";
                buildNode(ds_name+"-"+report+"-MiniCharts",
                        "FilterItemsMiniCharts",
                        {
                            'data-metrics': metrics,
                            'data-data-source': ds_name,
                            'data-filter': report
                });
            });
            // TODO: Hack!
            if (report === "companies" || report === "domains") {
                // gerrit sample company/domain does not have commits (merges are not counted)
                total_canvas = total_canvas-1;
            }

            ncanvas = document.getElementsByClassName('flotr-canvas').length;
            Report.setCurrentPage(1);
            Convert.convertFilterStudy(report);
        });
        waitsFor(function() {
            return (document.getElementsByClassName('flotr-canvas').length > ncanvas);
        }, "It took too long to load report items data", 200);
        runs(function() {
            var new_ncanvas = document.getElementsByClassName
                ('flotr-canvas').length;
            expect(new_ncanvas-ncanvas).toEqual(total_canvas);
        });
    }

    describe("Repositories checking", function() {
        it("All repositories should have Evol and Global metrics", function () {
            checkDataReport('repos');
        });
        it("Repositories basic viz should work", function() {
            checkVizReport("repos");
        });
    });
    describe("Companies checking", function() {
        it("All companies should have Evol and Global metrics", function () {
            checkDataReport('companies');
        });
        it("Companies basic viz should work", function() {
            checkVizReport("companies");
        });
    });
    describe("Countries checking", function() {
        it("All countries should have Evol and Global metrics", function () {
            checkDataReport('countries');
        });
        it("Countries basic viz should work", function() {
            checkVizReport("countries");
        });
    });
    describe("Domains checking", function() {
        it("All domains should have Evol and Global metrics", function () {
            checkDataReport('domains');
        });
        it("Domains basic viz should work", function() {
            checkVizReport("domains");
        });
    });

    function checkVizItem(item, report) {
        if ($.inArray(report,['repos','companies','countries', 'domains'])===-1)
            return;
        var ncanvas = 0, total_canvas = 0;

        runs(function() {
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, ds) {
                var ds_name = ds.getName();
                if (ds_name === "scm") metrics = "scm_commits,scm_authors";
                if (ds_name === "its") metrics = "its_closed,its_closers";
                if (ds_name === "mls") metrics = "mls_sent,mls_senders";
                if (ds_name === "irc") metrics = "irc_sent,irc_senders";
                if (ds_name === "scr") metrics = "scr_submitted,scr_merged";
                if (ds_name === "mediawiki") metrics = "mediawiki_reviews";
                buildNode(ds_name+"-"+report+"-FilterItemMetricsEvol",
                        "FilterItemMetricsEvol",
                        {
                            'data-metrics': metrics,
                            'data-data-source': ds_name,
                            'data-filter': report,
                            'data-item': item,
                            'data-legend': true,
                });
            });
            total_canvas = 1;
            ncanvas = document.getElementsByClassName('flotr-canvas').length;
            Convert.convertFilterStudyItem(report, item);
        });
        waitsFor(function() {
            // Hack until we found the problem with companies
            if ($.inArray(report,['companies'])>-1) {
                Convert.convertFilterStudyItem(report, item);
            }
            return (document.getElementsByClassName('flotr-canvas').length > ncanvas);
        }, "It took too long to load report items data", 200);
        runs(function() {
            var new_ncanvas = document.getElementsByClassName
                ('flotr-canvas').length;
            // expect(new_ncanvas-ncanvas).toEqual(total_canvas);
            expect(new_ncanvas-ncanvas).toBeGreaterThan(0);
        });
    }
    describe("First repository item checking", function() {
        it("First repository item viz should work", function() {
            var DS = Report.getDataSources()[0];
            item = DS.getReposData()[0];
            checkVizItem(item, 'repos', DS);
        });
    });
    describe("First company item checking", function() {
        it("First company item viz should work", function() {
            var DS = Report.getDataSources()[0];
            company = DS.getCompaniesData()[0];
            checkVizItem(company, "companies", DS);
        });
    });
    describe("First country item checking", function() {
        it("First country item viz should work", function() {
            var DS = Report.getDataSources()[0];
            country = DS.getCountriesData()[0];
            checkVizItem(country, 'countries', DS);
        });
    });
    describe("First domain item checking", function() {
        it("First domain item viz should work", function() {
            var DS = Report.getDataSources()[0];
            domain = DS.getDomainsData()[0];
            checkVizItem(domain, 'domains', DS);
        });
    });

    describe("People checking", function() {
        var people_id = null; 
        it("Top 1 SCM developer should have Evol and Global metrics", function () {
            var ncanvas = 0, nds = 0;
            runs(function() {
                var data_sources = Report.getDataSources();
                var max_people_index = 0;
                var metrics = null;
                // Find developer with ITS, MLS, SCM and SCR activity
                $.each(data_sources, function(index, DS) {
                    if (DS.getName() === 'irc' || DS.getName() === "mediawiki")
                        return;
                    var np = DS.getPeopleData().length;
                    if (np > max_people_index) max_people_index = np;
                    nds++;
                });
                for (var i=0; i<max_people_index; i++) {
                    var dev_found = true;
                    $.each(data_sources, function(index, DS) { 
                        if (DS.getName() === 'irc' || DS.getName() === "mediawiki")
                            return;
                        if ($.inArray(i,DS.getPeopleData())===-1) {
                            dev_found = false;
                            return false;
                        }
                    });
                    if (dev_found) {people_id = i; break;}
                }
                $.each(data_sources, function(index, DS) {
                    if (DS.getName() === 'irc' || DS.getName() === "mediawiki")
                        return;
                    if (DS.getName() === 'scm') metrics = 'scm_commits';
                    else if (DS.getName() === 'its') metrics = 'its_closed';
                    else if (DS.getName() === 'mls') metrics = 'mls_sent';
                    else if (DS.getName() === 'scr') metrics = 'scr_closed';
                    else if (DS.getName() === 'irc') metrics = 'irc_sent';
                    else if (DS.getName() === 'mediawiki') metrics = 'revisions';

                    buildNode(DS.getName()+"-people-metrics",
                            "PersonMetrics",
                          {
                              'data-metrics': metrics,
                              'data-data-source': DS.getName(),
                    });
                });
                ncanvas = document.getElementsByClassName
                    ('flotr-canvas').length;
                Convert.convertPeople(people_id,'');
            });
            waitsFor(function() {
                return (Loader.check_people_item (people_id));
            }, "It took too long to load data", 100);
            runs(function() {
                Convert.convertPeople(people_id,'');
                var new_ncanvas = document.getElementsByClassName
                    ('flotr-canvas').length;
                expect(new_ncanvas-ncanvas).toEqual(nds);
            });
        });
    });

    function buildNode (id, div_class, attr_map) {
        // returns div node object created with parameters
        if (document.getElementById(id)) return;
        var node = document.createElement('div');
        document.body.appendChild(node);
        if (div_class)
            node.className = div_class;
        node.id = id;
        if (attr_map)
            $('#'+id).attr(attr_map);
        return node;
      }

      function destroyNode (node) {
        document.body.removeChild(node);
      }
});

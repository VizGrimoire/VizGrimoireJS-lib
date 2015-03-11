/*
 * Copyright (C) 2012-2015 Bitergia
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
 * This file is a part of the VizGrimoireJS-lib package
 *
 * Authors:
 *   Luis Cañas-Díaz <lcanas@bitergia.com>
 *
 */

var Demographics = {};

(function() {

    var data_dg = {};

    Demographics.widget = function(){
        var divs = $(".DemographicsCompany"),
            ds_name,
            company_name,
            DS,
            period;

        if (divs.length > 0){
            $.each(divs, function(id, div) {
                ds_name = '';
                ds_name = $(this).data('data-source');
                /* this is a typical check, should be moved to a generic funct*/
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return; /* no data for data source*/
                period = $(this).data('period');
                company_name = Utils.getParameter('company');
                // had race condition errors when defining here the callback
                // function so I pass the parameters to loadDemographicsData
                loadDemographicsData(div, ds_name, company_name, period,
                                    displayDemographics);
            });
        }
    };

    function loadDemographicsData(div, ds_name, company_name, period, cb) {
        var suffix = ds_name.toLowerCase(),
            preffix,
            ag_file,
            b_file;

        preffix = "data/json/" + company_name + '-' + suffix + '-com-demographics-';
        ag_file = preffix + 'aging.json';
        b_file = preffix + 'birth.json';

        $.when($.getJSON(ag_file),$.getJSON(b_file)
                ).done(function(ag_data, b_data) {
                data_dg[company_name] = {};
                data_dg[company_name][ds_name] = {'aging':undefined,'birth':undefined};
                data_dg[company_name][ds_name].aging = ag_data[0];
                data_dg[company_name][ds_name].birth = b_data[0];
                cb(div, ds_name, company_name, period); //callback function
        }).fail(function() {
            console.log("Demographics Company widget disabled. Missing " +
                        ds_name + " files for company " + company_name);
        });
    }

    function displayDemographics(div, ds_name, company_name, period){
        if (!div.id) div.id = "Parsed" + getRandomId();
        if (data_dg[company_name] !== undefined &&
            data_dg[company_name][ds_name] !== undefined){
            Viz.displayDemographicsChart(div.id, data_dg[company_name][ds_name], period);
        }
    }

    function getRandomId() {
        return Math.floor(Math.random()*1000+1);
    }

})();

Loader.data_ready(function() {
    Demographics.widget();
});

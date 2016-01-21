
# Widgets

## CompaniesSummary
```
<div class="CompaniesSummary" data-data-source="scm" data-evol="false"
     data-file="scm-companies-commits-summary.json" data-graph="bars"
     data-legend="false" data-metric="scm_commits" data-show-others="true"
     style="height: 270px">
</div>
```

Output: Summary of the companies chart

## CompanyDSBlock
```
<div class="CompanyDSBlock" data-data-source="scm"
    data-metrics="scm_commits,scm_authors:scm_newauthors"
    data-top-metric="authors"></div>
```
Output: Row/Block with four cols for each data source & company. Summary + evolutionary data + top + demography chart

## DataSourcesTable
```

<div class="DataSourcesTable"></div>
```

Output: Table with information for each type of data with the first and the last update date

## Demographics
```

<div class="Demographics" data-data-source="scm" data-period="0.5">
```

Output: Demographics chart of scm data

## DSSummaryBlock
```
<div class="DSSummaryBlock" data-data-source="scm"
     data-box-labels="Code Developers,Core,Regular,Casual"
     data-box-metrics="scm_authors,core,regular,occasional"
     data-ts-metrics="scm_commits,scm_authors"></div>
```

Output: three cols with three boxes. Left box with summary numbers according to the box-labels and two more cols with evolutionary trends according to ts-metrics

## DSSummaryBlockProjectFiltered
```
<div class="DSSummaryBlockProjectFiltered" data-data-source="scm"
     data-box-labels="Code Developers,Commits"
     data-box-metrics="scm_authors,scm_commits"
     data-ts-metrics="scm_commits,scm_authors"></div>
```

Output:

## FilterDSBlock
```
<div class="FilterDSBlock" data-filter="companies" data-data-source="scm"
     data-metrics="scm_commits,scm_authors"></div>
```

Output: Two cols with summary data on the left and evolutionary charts on the right

## FilterItemMetricsEvol
```

<div class="FilterItemMetricsEvol" data-data-source="its"
     data-metrics="its_closed" data-filter="countries"
     data-legend="false" data-help="false"></div>
```

Output: Summary evolution chart

## FilterItemsGlobal
```
<div class="FilterItemsGlobal" data-data-source="its"
     data-metric="its_closed" data-filter="repos"
     data-legend-div="barchart_legend" data-limit="10"
     data-order-by="its_closed"
     data-title="Issues closed per tracker"></div>
```

Output: Chart with entries ordered from highest to lowest with legend

## FilterItemsMiniCharts
```

<div class="FilterItemsMiniCharts" data-data-source="its"
     data-metrics="its_closed,its_closers" data-filter="repos"
     data-order-by="its_closed"></div>
```

Output: Tree cols with name of the repository on the left, closed tickets chart on the center and ticket closers on the right

## FilterItemsNav
```

<div class="FilterItemsNav" data-data-source="its"
     data-order-by="its_closed" data-filter="repos"></div>
```

Output: Tab pages

## FilterItemSummary
```

<div class="FilterItemSummary" data-data-source="its"
     data-filter="countries"></div>
```

Output: Table with information about countries

## FilterItemTop

```
<div class="FilterItemTop" data-filter="companies" data-metric="authors"
     data-period="all" data-data-source="scm"
     data-people_links="true" data-height="340"></div>
```

Output: Top people for a company

## GlobalData
```
<span class="GlobalData" data-data-source="scm"                              
      data-field="scm_commits">
```

Output: The total number of scm commits

## List2Timeseries
```
<div class="List2Timeseries"></div>
```

Output:

## MarkovTable
```
<div class="MarkovTable" data-data-source="its" data-title="Transitions among statuses"></div>
```

Output: Table with information about the percentages of changes among states

## MetricsEvol
```

<div class="MetricsEvol" data-data-source="its"
     data-metrics="its_trackers" data-legend="false"
     data-title="Active trackers per month" data-help="false"
     data-light-style="true" style="height: 80px;"></div>
```

Output: Evolutionary chart

## MicrodashText
```

<div class="MicrodashText" data-metric="bmitickets"></div>
```

Output: Table with information percentage about last 365 days, 30 days and 7 days

## MostActiveChangesets
```
<div class="MostActiveChangesets" data-data-source="scr"
data-headers="Review number,Summary,Submitted on,Last update,Uploads"
data-columns="gerrit_issue_id,summary,first_upload,last_upload,number_of_patchsets"></div>
```

Output: Table with information about Gerrit backlog with links to changesets if gerrit_site variable is in config file

## OldestChangesets

```
<div class="OldestChangesets" data-data-source="scr"
    data-headers="tracker URL,Submitted by,changeset URL,Summary,Submitted on"
    data-columns="project_name,author_name,gerrit_issue_id,summary,first_upload"></div>
```

Output: Table with information about Gerrit backlog with links to changesets if gerrit_site variable is in config file.

## PersonData
```
<div class="PersonData"></div>
```

Output: Chart with information about personal data

## PersonSummaryBlock
```
<div class="PersonSummaryBlock" data-data-source="scm"
     data-metrics="scm_commits"></div>
```

Output:

## ProjectMap
```
<div class="ProjectMap"></div>
```

Output:

## ProjectNavBar
```
<div class="ProjectNavBar"></div></strong>
```

Output: Header menu

## SmartLinks
```
<div class="SmartLinks" data-target="its-organizations.html" data-label="organizations"></div>
```

Output: Hyperlink

## TimeZonesBlock
```
<div class="TimezonesBlock" data-data-source="scm"
     data-metric="authors"></div>
```

Output: Bar chart with information activity about time zones

## Top
```
<div class="Top" data-data-source="irc" data-period_all="true"
     data-metric="senders" data-limit="10" data-people_links="true">
</div>
```

Output: Table with information about top of senders in 365 days, 30 days and 7 days

## TopByPeriod
```
<div class="TopByPeriod" data-data-source="irc" data-metric="senders"
     data-limit="100">
</div>
```

Output: Table with information about top of senders in 365 days, 30 days and 7 days

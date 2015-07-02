
# Widgets

# CompanyDSBlock
```
<div class="CompanyDSBlock" data-data-source="scm"
    data-metrics="scm_commits,scm_authors:scm_newauthors"
    data-top-metric="authors"></div>
```
Output: Row/Block with four cols for each data source & company. Summary + evolutionary data + top + demography chart

# DSSummaryBlock
```
<div class="DSSummaryBlock" data-data-source="scm"
     data-box-labels="Code Developers,Core,Regular,Casual"
     data-box-metrics="scm_authors,core,regular,occasional"
     data-ts-metrics="scm_commits,scm_authors"></div>
```
Output: three cols with three boxes. Left box with summary numbers according to the box-labels and two more cols with evolutionary trends according to ts-metrics

## FilterDSBlock
```
<div class="FilterDSBlock" data-filter="companies" data-data-source="scm"
     data-metrics="scm_commits,scm_authors"></div>
```

Output: two cols with summary data on the left and evolutionary charts on the right

## FilterItemTop

```
<div class="FilterItemTop" data-filter="companies" data-metric="authors"
     data-period="all" data-data-source="scm"
     data-people_links="true" data-height="340"></div>
```

Output: Top people for a company

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


# Widgets

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

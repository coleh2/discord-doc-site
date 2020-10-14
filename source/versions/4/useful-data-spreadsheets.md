<meta name="description" content="Data from the movie night ratings" />

# Useful NHS-related Data Spreadsheets

* Table of Contents
{:toc}

## Movie Night Ratings

On every Friday and Sunday night, there is a movie night on Discord. We collect the ratings and put them in a spreadsheet, which can be found [here](https://clh.sh/moviesheet).

This spreadsheet has 7 public sub-sheets.

### Movie Metrics

Movie Metrics lists each movie by mean, median, Metacritic score, and [preference](#preferences).

### Ratings 

Ratings has everyone's ratings in a human-readable format. Each movie has a column, and each person has a row. Every cell is a rating.

This sheet also includes metadata for each movie, such as the runtime, who proposed it, the genre, etc.

### Chart

This is just a handy chart representation of the Mean and Median from Movie Metrics.

### Preferences

Preference is a rating system that takes into account the rater's other ratings in order to find how much they prefer that movie over others. Preference is calculated as follows:

```
(persons_rating - persons_average_rating)/persons_average_rating
```

This sheet has the Preference calculated for every rating.

### PerPersonStats

This sheet has stats for each person, such as their average rating, how many movies they rated, and the number of movies they suggested.

### Formatted for Nick

This is for Nick's pinned messages on Discord. If you're not Nick, you probably don't have to worry about it.

### RatingDataset

This has every single rating in a machine-readable format. If you want to pull the data into another tool (e.g. [Sanddance](https://sanddance.js.org/app)), this one is the one to use.

## Class Schedules

To coordinate class-period-based events (such as lunch, study, homework, etc), we have a spreadsheet of most peoples' class schedules. It can be found [here](https://docs.google.com/spreadsheets/d/1LF2TECVo_4g6iQvwdNHcYz_2MbYv_za6C6gkE87Y3uE/edit#gid=0). *Warning: Other sheets may take a while to update from the data because of the number and complexity of the formulas involved.*

### Schedules

The Schedules sub-sheet is the human-readable original data. Each class is color-coded.

### Lunches

The Lunches sub-sheet lists everyone's lunches. People are seperated by cohort.

### Rosters

Rosters holds the class lists that we know.

### MachineReadable

This has every class in a machine-readable format. If you use this data in another app, this sheet is the one to use.

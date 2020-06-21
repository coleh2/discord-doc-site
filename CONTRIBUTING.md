# Contributing

## Reporting Bugs

If you see anything that is broken, confusing, or that could be better, you should [open an issue](https://github.com/coleh2/discord-doc-site/issues/new/choose).
You don't have to have any information about how to reproduce the error, but anything you do have will definitely help!

## Writing Documentation - How

### What Goes Where?

Documentation that relates to the server should go on the site itself; files for this go in the `source` folder.
Documentation that tells how to edit the server's docs should be here-- it should go in one of the existing meta-documentation files, though.
Only rarely should a new file be made outside of the `source` or `build-scripts` directories.

### Using the GitHub Web Editor

If you don't want to go through the process of downloading the code, editing, and reuploading, you can edit any file in the repository online!
First, go to its page by navigating through the folder structure. Then, hit the pencil icon on the top bar.

![Image demonstrating where the edit icon is positioned](https://i.ibb.co/YZ1XYHF/image.png)

GitHub will prompt you to "fork" the reposititory in order to make edits, and then you will be able to make whatever changes you want.
When you're done, enter a description to explain your changes, and hit "Commit".

Next, start a pull request (PR) by following the instructions [in this GitHub help page](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).
It may take a little bit for your PR to be reviewed, but that's OK.

### Using your Computer

To do more complicated edits (e.g. adding features to the build), you should install the repository by following the instructions in [the Readme file](README.md).
After installing, making edits, and building, enter the following into your Terminal:

```
git checkout -b a-description-of-your-change 
```
This command makes a new "branch" to put your code on; this makes sure everything is nicely organized. Make sure that, if you use multiple words, you seperate them with a hyphen (-), not a space!

```
git add .
```
This command marks your changes to be added to the next commit-- a commit is like a batch of changes that you want to save.

```
git commit -m "enter a message here" 
```
This command commits your changes; make sure that everything's good before you do this!

```
git push -u origin the-same-description-you-gave-in-the-first-command
```
This command uploads your committed changes back to the original repository. Make sure the description you give is the same! 

Last, you can start a Pull Request by following the steps in [this GitHub Help page](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests). Thank you!

## Writing Documentation - What

### Guidelines

Anything that you want to contribute is welcome! Please make sure that your contributions:

* Have proper grammar (or are easy to read)-- you don't have to be in Ye Propere Englishe, but try not to be *too* incorrect
* Are appropriate-- In terms of language, try to stick to PG or so.
* Are placed correctly-- Any files you make should be named in a way that makes sense, and placed in the latest version's folder. Try to use kebab case for mult-word filenames (i.e. `words-seperated-by-hyphens`).
* Have good formatting-- Use headings, links, tables of contents, etc

### Non-Standard Markdown Things

***For all of the following, make sure that there is an empty line both above and below; even when they're at the end of a file!***

You can add an automatically generated table of contents by using the following syntax: 
```md
* Table of Contents
{:toc}
```

You can make railroad diagrams from [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) by using the following syntax:
```md
~~~
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
number = { digit };
# enter ebnf sequences in here
~~~
{: .language-ebnf .railroad-diagram}

```

You can use [Highcharts](https://www.highcharts.com/) to make diagrams with the following syntax; any configuration object that you would give to Highcharts can be used here:

(Note: this supports any type of diagram in standard Highcharts except for sunburst diagrams)

```
~~~
{

    title: {
        text: 'Solar Employment Growth by Sector, 2010-2016'
    },

    subtitle: {
        text: 'Source: thesolarfoundation.com'
    },

    yAxis: {
        title: {
            text: 'Number of Employees'
        }
    },

    xAxis: {
        accessibility: {
            rangeDescription: 'Range: 2010 to 2017'
        }
    },

    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },

    series: [{
        name: 'Installation',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: 'Manufacturing',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
        name: 'Sales & Distribution',
        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
        name: 'Project Development',
        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
        name: 'Other',
        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

}
~~~
{: .language-json .highchart-diagram}
```

(Yes, it's not actually JSON, but JSON will work as well-- this is being used because it's one of the examples from Highcharts)


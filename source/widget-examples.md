# Widget Examples

This page has examples of all 'widgets' that this site supports. Widgets are small extensions and expansions in order to make cool stuff!

Widgets on this site are mostly made through code blocks.

## Railroad Diagrams

Railroad diagrams are a type of syntax diagram. They are designed to be easy to understand, even if someone doesn't have a lot of experience with code. Here, they're made with [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) (which is a bit harder to understand), and marked as railroad diagrams with the `railroad-diagram` class.

<pre>
<code>
~~~
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
number = { digit };
letter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b"  | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" ;
symbol = "[" | "]" | "{" | "}" | "(" | ")" | "<" | ">" | "'" | '"' | "=" | "|" | "." | "," | ";";
character = symbol | digit | letter;
word = { letter };
phrase = { word | " " | symbol };
~~~
{&#58; .language-ebnf .railroad-diagram}
</code>
</pre>

The above Markdown code will compile to:

~~~
character = symbol | digit | letter;
word = { letter };
phrase = { word | " " | symbol };
~~~
{: .language-ebnf .railroad-diagram}

## Highcharts Diagrams

You can make whatever graph you want by using [Highcharts](https://www.highcharts.com/). Just put a Highcharts config object in a code block and give it the `highchart-diagram` class.
<pre>
<code>
~~~
{

    title: {text: 'Solar Employment Growth by Sector, 2010-2016'},
    subtitle: {text: 'Source: thesolarfoundation.com'},
    yAxis: {
        title: {text: 'Number of Employees'}
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
{&#58; .language-js .highchart-diagram}
</code>
</pre>

The above Markdown code will compile to: 

~~~
{

    title: {text: 'Solar Employment Growth by Sector, 2010-2016'},
    subtitle: {text: 'Source: thesolarfoundation.com'},
    yAxis: {
        title: {text: 'Number of Employees'}
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
{: .language-js .highchart-diagram}


## File Download Widget

You can display a download interface for a code file by giving it the `download-file-instead-of-display` class. The name of the file can optionally be set by giving it a `data-filename="filename.extension"` attribute.

<pre>
<code>
~~~
This is a file that I download!
~~~
{&#58; .download-file-instead-of-display data-filename="downloadtest.txt"}
</code>
</pre>

The above Markdown will compile to:

~~~
This is a file that I download!
~~~
{: .download-file-instead-of-display data-filename="downloadtest.txt"}

## Discord Message Display

You can display a Discord conversation in two ways: you can either use a simplified notation just by copying in from Discord, or enter an Discord API response to include all information.

When copying in, you *must* use Compact Mode; otherwise, Discord's text causes bugs on multi-line messages.

Simplified notation (for short snippets):

<pre>
<code>
~~~
[6:26 PM] nicksname: 10,098
[6:26 PM] coleh: 10099
[6:26 PM] nicksname: 10,100
[6:27 PM] Fleegler: 10101
[7:04 PM] coleh: 10102
~~~
{&#58; .discord-messages}
</code>
</pre>

or, Discord api (for developers):

<pre>
<code>
~~~
[{"id": "734048394632233052", "type": 0, "content": "valorant? this is the csgo channel, but idk", "channel_id": "408368027361476608", "author": {"id": "382326372401414154", "username": "Elsira", "avatar": "427b5b3417c1b59f55393ce3821bfa1d", "discriminator": "3189", "public_flags": 256}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-18T14:06:15.240000+00:00", "edited_timestamp": null, "flags": 0}, {"id": "734046191305621564", "type": 0, "content": "Wait- how easily can you chose your valorany  name", "channel_id": "408368027361476608", "author": {"id": "305503078889684993", "username": "superturtle5", "avatar": "2680613fc32a24151ede55b472f5ff3c", "discriminator": "9255", "public_flags": 0}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-18T13:57:29.926000+00:00", "edited_timestamp": null, "flags": 0}, {"id": "733774795317051425", "type": 0, "content": "gimme a sec", "channel_id": "408368027361476608", "author": {"id": "381726951406043137", "username": "Fleegler", "avatar": "1b9f8076b71e4f989ab358529d1d63f6", "discriminator": "8422", "public_flags": 0}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-17T19:59:04.080000+00:00", "edited_timestamp": null, "flags": 0}]
~~~
{&#58; .discord-messages}
</code>
</pre>

The above markdown code will compile to:

~~~
[6:26 PM] nicksname: 10,098
[6:26 PM] coleh: 10099
[6:26 PM] nicksname: 10,100
[6:27 PM] Fleegler: 10101
[7:04 PM] coleh: 10102
~~~
{: .discord-messages}

~~~
[{"id": "734048394632233052", "type": 0, "content": "valorant? this is the csgo channel, but idk", "channel_id": "408368027361476608", "author": {"id": "382326372401414154", "username": "Elsira", "avatar": "427b5b3417c1b59f55393ce3821bfa1d", "discriminator": "3189", "public_flags": 256}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-18T14:06:15.240000+00:00", "edited_timestamp": null, "flags": 0}, {"id": "734046191305621564", "type": 0, "content": "Wait- how easily can you chose your valorany  name", "channel_id": "408368027361476608", "author": {"id": "305503078889684993", "username": "superturtle5", "avatar": "2680613fc32a24151ede55b472f5ff3c", "discriminator": "9255", "public_flags": 0}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-18T13:57:29.926000+00:00", "edited_timestamp": null, "flags": 0}, {"id": "733774795317051425", "type": 0, "content": "gimme a sec", "channel_id": "408368027361476608", "author": {"id": "381726951406043137", "username": "Fleegler", "avatar": "1b9f8076b71e4f989ab358529d1d63f6", "discriminator": "8422", "public_flags": 0}, "attachments": [], "embeds": [], "mentions": [], "mention_roles": [], "pinned": false, "mention_everyone": false, "tts": false, "timestamp": "2020-07-17T19:59:04.080000+00:00", "edited_timestamp": null, "flags": 0}]
~~~
{: .discord-messages}

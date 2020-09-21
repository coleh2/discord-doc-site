# Channel Usage Guidelines

This document is an explanation of which channel you should use, when you should use them, and when you should move to other channels. This is not a rule, though; just guidelines! Don't feel pressured to move if you've started a conversation, unless people are telling you to, in which case it's polite to!

Every channel in this document has its own section, with subsections for each channel you can move to. To figure out if you should move, go to your current channel's section, and then read a channel's subsection. If it fits, you might want to move! Only commonly known pathways are documented here-- if someone tells you to go to a channel and you don't see it here, please let me know!

* Table of Contents
{: toc}

## Source Data

The recommendations on this page are generated based on a couple of made-up values for each channel: the openness and the magnetism.
Openness represents how un-strict the channel is; what is *allowed* to post in it. For example, #general has a high openness rating, and #minecraft 
has a low openness rating. This is only related to the subject-content link's openness, not the openness of the channel emotionally!

Magnetism is related to the relevancy of the channel; how specific is it? How often are people talking in it? This is used to determine the difference between moving an existing conversation and sending a new message, as well as making sure that more specific channels are rated above general channels for their rating.

The equation used to calculate whether people should move to a suggested channel is
`currentChannelMagnetism*min(conversationMessageCount, 10)/10 - otherChannelOpenness*otherChannelMagnetism > 0`.
If it is true, you may want to move. Obviously, this is only effective if the topic matches the channel you're going to!

To figure out what channel a conversation should be started in, compare all applicable channels and pick the highest score of `openness + magnetism * 2`. 
For example, if I want to share an article about big data and new A.I. research being used for government surveillance, I could either choose #paulitics or #tech. 
Since #paulitics has a higher score (at 2.1) than #tech (1.86), than I should probably put it in #paulitics.

| channel              | openness | magnetism |
|----------------------|----------|-----------|
| voting               | 0.1      | 0.7       |
| general              | 0.9      | 0.2       |
| images-and-videos    | 0.75     | 0.575     |
| memes                | 0.4      | 0.5       |
| server-discussion    | 0.6      | 0.5       |
| bot-poking           | 0.5      | 0.1       |
| counting             | 0.1      | 0.8       |
| paulitics            | 0.75     | 0.675     |
| tech                 | 0.6      | 0.63      |
| cooking              | 0.45     | 0.63      |
| cuteness-overload    | 0.1      | 0.75      |
| minecraft            | 0.25     | 0.62      |
| csgo                 | 0.25     | 0.66      |
| scp                  | 0.25     | 0.70      |
| among-us             | 0.25     | 0.64      |
| gaming-miscellaneous | 0.35     | 0.55      |
| nhs-discussion       | 0.375    | 0.5       |
| nhs-activities       | 0.35     | 0.6       |
| marvel-and-dc        | 0.35     | 0.56      |
| star-wars            | 0.35     | 0.6       |
| avatar               | 0.25     | 0.65      |
| hamilton             | 0.1      | 0.8       |
| pop-misc             | 0.45     | 0.5       |

~~~
{
    title: {
        text: "All Movements"
    },
    series: [{
        keys: ['to', 'from', 'weight'],
        data:[["voting","general",3.7104390625],["voting","images-and-videos",2.805625],["voting","memes",3.6337890625],["voting","server-discussion",3.2625390624999997],["voting","bot-poking",4.228164062499999],["voting","counting",4.105689062500001],["voting","paulitics",2.5600000000000005],["voting","tech",2.9868480624999996],["voting","cooking",3.3224175624999996],["voting","cuteness-overload",4.1259765625],["voting","minecraft",3.8073765624999996],["voting","csgo",3.768451562499999],["voting","scp",3.7297265625],["voting","among-us",3.7878890624999992],["voting","gaming-miscellaneous",3.6624390624999994],["voting","nhs-discussion",3.6816015625],["voting","nhs-activities",3.595764062499999],["voting","marvel-and-dc",3.6490550625],["voting","star-wars",3.595764062499999],["voting","avatar",3.7781640625],["voting","hamilton",4.105689062500001],["voting","pop-misc",3.5391015625000004],["memes","general",1.9775390625],["general","bot-poking",2.4219140624999995],["general","counting",2.3294390625000005],["tech","general",1.5085980625000002],["general","cuteness-overload",2.3447265625],["general","minecraft",2.1061265624999996],["general","csgo",2.0772015625],["general","scp",2.0484765625],["general","among-us",2.0916390625],["general","gaming-miscellaneous",1.9986890625000002],["general","nhs-discussion",2.0128515625],["general","marvel-and-dc",1.9888050625],["general","avatar",2.0844140625],["general","hamilton",2.3294390625000005],["images-and-videos","memes",3.1728515625],["images-and-videos","server-discussion",2.8266015624999996],["images-and-videos","bot-poking",3.7297265625],["images-and-videos","counting",3.6147515625000013],["images-and-videos","paulitics",2.175625],["images-and-videos","tech",2.5704105624999993],["images-and-videos","cooking",2.8823550624999994],["images-and-videos","cuteness-overload",3.6337890625],["images-and-videos","minecraft",3.3351890624999996],["images-and-videos","csgo",3.2987640624999988],["images-and-videos","scp",3.2625390624999997],["images-and-videos","among-us",3.3169515624999995],["images-and-videos","gaming-miscellaneous",3.1996265624999993],["images-and-videos","nhs-discussion",3.2175390624999998],["images-and-videos","nhs-activities",3.1373265624999993],["images-and-videos","marvel-and-dc",3.1871175625],["images-and-videos","star-wars",3.1373265624999993],["images-and-videos","avatar",3.3078515625000002],["images-and-videos","hamilton",3.6147515625000013],["images-and-videos","pop-misc",3.0844140625000005],["memes","server-discussion",2.5800390625],["memes","bot-poking",3.4456640624999997],["memes","counting",3.3351890624999996],["memes","tech",2.3355480625000005],["memes","cooking",2.6333175625],["memes","cuteness-overload",3.3534765625],["memes","minecraft",3.0668765625],["memes","csgo",3.0319515625000006],["memes","scp",2.9972265625],["memes","among-us",3.049389062500001],["memes","gaming-miscellaneous",2.936939062500001],["memes","nhs-discussion",2.9541015625],["memes","nhs-activities",2.877264062499999],["memes","marvel-and-dc",2.9249550624999996],["memes","star-wars",2.877264062499999],["memes","avatar",3.0406640625],["memes","hamilton",3.3351890624999996],["memes","pop-misc",2.8266015624999996],["server-discussion","bot-poking",3.4456640624999997],["server-discussion","counting",3.3351890624999996],["server-discussion","tech",2.3355480625000005],["server-discussion","cooking",2.6333175625],["server-discussion","cuteness-overload",3.3534765625],["server-discussion","minecraft",3.0668765625],["server-discussion","csgo",3.0319515625000006],["server-discussion","scp",2.9972265625],["server-discussion","among-us",3.049389062500001],["server-discussion","gaming-miscellaneous",2.936939062500001],["server-discussion","nhs-discussion",2.9541015625],["server-discussion","nhs-activities",2.877264062499999],["server-discussion","marvel-and-dc",2.9249550624999996],["server-discussion","star-wars",2.877264062499999],["server-discussion","avatar",3.0406640625],["server-discussion","hamilton",3.3351890624999996],["server-discussion","pop-misc",2.8266015624999996],["bot-poking","counting",2.0341890625],["tech","bot-poking",1.2729480625],["bot-poking","cuteness-overload",2.0484765625],["csgo","bot-poking",1.7989515625],["among-us","bot-poking",1.8123890624999999],["nhs-discussion","bot-poking",1.7391015625000001],["marvel-and-dc","bot-poking",1.7167550624999999],["avatar","bot-poking",1.8056640625],["bot-poking","hamilton",2.0341890625],["counting","paulitics",2.8899999999999997],["counting","tech",3.3424980625],["counting","cooking",3.6969675625],["counting","cuteness-overload",4.542226562500001],["counting","minecraft",4.2076265625],["counting","csgo",4.166701562499999],["counting","scp",4.1259765625],["counting","among-us",4.187139062500001],["counting","gaming-miscellaneous",4.055189062499999],["counting","nhs-discussion",4.075351562499999],["counting","nhs-activities",3.9850140625000012],["counting","marvel-and-dc",4.041105062500001],["counting","star-wars",3.9850140625000012],["counting","avatar",4.176914062500001],["counting","hamilton",4.520939062500001],["counting","pop-misc",3.9253515625],["paulitics","tech",2.9010605624999997],["paulitics","cooking",3.2319050624999996],["paulitics","cuteness-overload",4.0250390625],["paulitics","minecraft",3.7104390625],["paulitics","csgo",3.672014062500001],["paulitics","scp",3.6337890625],["paulitics","among-us",3.6912015624999994],["paulitics","gaming-miscellaneous",3.5673765625],["paulitics","nhs-discussion",3.5862890625],["paulitics","nhs-activities",3.5015765625000013],["paulitics","marvel-and-dc",3.5541675624999995],["paulitics","star-wars",3.5015765625000013],["paulitics","avatar",3.6816015625],["paulitics","hamilton",4.0050015625],["paulitics","pop-misc",3.4456640624999997],["tech","cooking",3.0721325625],["tech","cuteness-overload",3.8465015625000007],["tech","minecraft",3.5391015625000004],["tech","csgo",3.5015765625000013],["tech","scp",3.4642515625000003],["tech","among-us",3.5203140625],["tech","gaming-miscellaneous",3.3994140625],["tech","nhs-discussion",3.4178765624999987],["tech","nhs-activities",3.3351890624999996],["tech","marvel-and-dc",3.3865200625],["tech","star-wars",3.3351890624999996],["tech","avatar",3.5109390625000003],["tech","hamilton",3.8269140625],["tech","pop-misc",3.2806265625],["cooking","cuteness-overload",3.8465015625000007],["cooking","minecraft",3.5391015625000004],["cooking","csgo",3.5015765625000013],["cooking","scp",3.4642515625000003],["cooking","among-us",3.5203140625],["cooking","gaming-miscellaneous",3.3994140625],["cooking","nhs-discussion",3.4178765624999987],["cooking","nhs-activities",3.3351890624999996],["cooking","marvel-and-dc",3.3865200625],["cooking","star-wars",3.3351890624999996],["cooking","avatar",3.5109390625000003],["cooking","hamilton",3.8269140625],["cooking","pop-misc",3.2806265625],["cuteness-overload","minecraft",4.0050015625],["cuteness-overload","csgo",3.9650765625000006],["cuteness-overload","scp",3.9253515625],["cuteness-overload","among-us",3.9850140625000012],["cuteness-overload","gaming-miscellaneous",3.8563140625000014],["cuteness-overload","nhs-discussion",3.8759765625],["cuteness-overload","nhs-activities",3.7878890624999992],["cuteness-overload","marvel-and-dc",3.8425800624999993],["cuteness-overload","star-wars",3.7878890624999992],["cuteness-overload","avatar",3.9750390624999996],["cuteness-overload","hamilton",4.3108140624999995],["cuteness-overload","pop-misc",3.7297265625],["minecraft","csgo",3.4642515625000003],["minecraft","scp",3.4271265624999994],["minecraft","among-us",3.482889062500001],["minecraft","gaming-miscellaneous",3.362639062499999],["minecraft","nhs-discussion",3.381001562500001],["minecraft","nhs-activities",3.2987640624999988],["minecraft","marvel-and-dc",3.3498150625],["minecraft","star-wars",3.2987640624999988],["minecraft","avatar",3.4735640625],["minecraft","hamilton",3.7878890624999992],["minecraft","pop-misc",3.2445015625],["csgo","scp",3.5768265625000004],["csgo","among-us",3.6337890625],["csgo","gaming-miscellaneous",3.5109390625000003],["csgo","nhs-discussion",3.529701562499999],["csgo","nhs-activities",3.4456640624999997],["csgo","marvel-and-dc",3.4978350625],["csgo","star-wars",3.4456640624999997],["csgo","avatar",3.6242640625],["csgo","hamilton",3.9451890625000003],["csgo","pop-misc",3.3902015625],["scp","among-us",3.7878890624999992],["scp","gaming-miscellaneous",3.6624390624999994],["scp","nhs-discussion",3.6816015625],["scp","nhs-activities",3.595764062499999],["scp","marvel-and-dc",3.6490550625],["scp","star-wars",3.595764062499999],["scp","avatar",3.7781640625],["scp","hamilton",4.105689062500001],["scp","pop-misc",3.5391015625000004],["among-us","gaming-miscellaneous",3.436389062500001],["among-us","nhs-discussion",3.4549515625],["among-us","nhs-activities",3.3718140625000004],["among-us","marvel-and-dc",3.423425062499999],["among-us","star-wars",3.3718140625000004],["among-us","avatar",3.5485140624999993],["among-us","hamilton",3.8661390625000003],["among-us","pop-misc",3.3169515624999995],["gaming-miscellaneous","nhs-discussion",3.1284765625],["gaming-miscellaneous","nhs-activities",3.049389062500001],["gaming-miscellaneous","marvel-and-dc",3.0984800624999997],["gaming-miscellaneous","star-wars",3.049389062500001],["gaming-miscellaneous","avatar",3.2175390624999998],["gaming-miscellaneous","hamilton",3.5203140625],["gaming-miscellaneous","pop-misc",2.9972265625],["nhs-discussion","nhs-activities",2.877264062499999],["nhs-discussion","marvel-and-dc",2.9249550624999996],["nhs-discussion","star-wars",2.877264062499999],["nhs-discussion","avatar",3.0406640625],["nhs-discussion","hamilton",3.3351890624999996],["nhs-discussion","pop-misc",2.8266015624999996],["nhs-activities","marvel-and-dc",3.2770050625],["nhs-activities","star-wars",3.2265140624999997],["nhs-activities","avatar",3.3994140625],["nhs-activities","hamilton",3.7104390625],["nhs-activities","pop-misc",3.1728515625],["marvel-and-dc","star-wars",3.0844140625000005],["marvel-and-dc","avatar",3.2535140625000007],["marvel-and-dc","hamilton",3.5579390625],["marvel-and-dc","pop-misc",3.0319515625000006],["star-wars","avatar",3.3994140625],["star-wars","hamilton",3.7104390625],["star-wars","pop-misc",3.1728515625],["avatar","hamilton",3.9055640624999994],["avatar","pop-misc",3.3534765625],["hamilton","pop-misc",3.9253515625]],
        type: 'dependencywheel',
        name: 'Dependency wheel series',
    }]

}
~~~
{: .language-js .highchart-diagram }

The color of a line indicates which direction the change will be: a line colored the same as the channel indicates an outward connection, while
a different-colored line indicates an inward connection.

~~~
{
    title: {
        text: "Top 50 Strongest Recommended Movements"
    },
    series: [{
        keys: ['to', 'from', 'weight'],
        data:[["star-wars","hamilton",3.7104390625],["voting","scp",3.7297265625],["images-and-videos","bot-poking",3.7297265625],["cuteness-overload","pop-misc",3.7297265625],["voting","csgo",3.768451562499999],["voting","avatar",3.7781640625],["scp","avatar",3.7781640625],["voting","among-us",3.7878890624999992],["cuteness-overload","nhs-activities",3.7878890624999992],["cuteness-overload","star-wars",3.7878890624999992],["minecraft","hamilton",3.7878890624999992],["scp","among-us",3.7878890624999992],["voting","minecraft",3.8073765624999996],["tech","hamilton",3.8269140625],["cooking","hamilton",3.8269140625],["cuteness-overload","marvel-and-dc",3.8425800624999993],["tech","cuteness-overload",3.8465015625000007],["cooking","cuteness-overload",3.8465015625000007],["cuteness-overload","gaming-miscellaneous",3.8563140625000014],["among-us","hamilton",3.8661390625000003],["cuteness-overload","nhs-discussion",3.8759765625],["avatar","hamilton",3.9055640624999994],["counting","pop-misc",3.9253515625],["cuteness-overload","scp",3.9253515625],["hamilton","pop-misc",3.9253515625],["csgo","hamilton",3.9451890625000003],["cuteness-overload","csgo",3.9650765625000006],["cuteness-overload","avatar",3.9750390624999996],["counting","nhs-activities",3.9850140625000012],["counting","star-wars",3.9850140625000012],["cuteness-overload","among-us",3.9850140625000012],["paulitics","hamilton",4.0050015625],["cuteness-overload","minecraft",4.0050015625],["paulitics","cuteness-overload",4.0250390625],["counting","marvel-and-dc",4.041105062500001],["counting","gaming-miscellaneous",4.055189062499999],["counting","nhs-discussion",4.075351562499999],["voting","counting",4.105689062500001],["voting","hamilton",4.105689062500001],["scp","hamilton",4.105689062500001],["voting","cuteness-overload",4.1259765625],["counting","scp",4.1259765625],["counting","csgo",4.166701562499999],["counting","avatar",4.176914062500001],["counting","among-us",4.187139062500001],["counting","minecraft",4.2076265625],["voting","bot-poking",4.228164062499999],["cuteness-overload","hamilton",4.3108140624999995],["counting","hamilton",4.520939062500001],["counting","cuteness-overload",4.542226562500001]],
        type: 'dependencywheel',
        name: 'Dependency wheel series',
    }]

}
~~~
{: .language-js .highchart-diagram }

Strictly defined channels-- like #counting, #hamilton, or #cuteness-overload-- have a lot of strong connections. 

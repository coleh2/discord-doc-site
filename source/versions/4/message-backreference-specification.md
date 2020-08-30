# Message Backreference Specification

* Table of Contents
{:toc}

{::options toc_levels="1..3" /}

## Purpose

In order to clearly communicate, it's good to have an agreed-upon way to refer to to other messages. Currently, there's an unspecified syntax that serves this purpose, but it has several unclear parts, such as: 

* Scope (when quoting should be used instead)
* Subtypes and their intended usages (e.g. `^^^` vs `^3`)
* Extensions to the current unspoken standard (e.g.` ^name`)
* Meaning (agreement vs. simple reference)

This specification will attempt to be backwards-compatible with most of the current usages. This document should *not* be considered a new, mandatory specification to follow; it's just a clarification. "Incorrect" usage should not be seen as an offensive or negative action.

As such, this specification is established as a clear way to unambiguously reference a previous message on instant messaging platforms, whether for agreement, additional discussion, indication as context, or for other purposes.

## Required Technical Knowledge

This page should need little to no additional knowledge in order to understand. However, if you don't understand any part, feel free to ask; any questions are very helpful to improve the document.

The diagrams that describe the syntax are [railroad diagrams](https://en.wikipedia.org/wiki/Syntax_diagram), a visual representation of the syntax. Each diagram defines a part of the syntax, and then can be referred to and built on by other diagrams. 

## Definitions

backreference
: A string of text that indicates a previous message

current message
: The message that has the backreference in it.

youngest message
: *most* recently sent, not counting the current message

oldest message
: *least* recently sent, not counting the current message

## General Backreference Specification

### Backreference Usage

All backreferences must start with a caret character (`^`). All backreferences should be formatted as a seperate word, with spaces before and after. This avoids confusion with exponents.

A message with only a backreference should be seen as a general agreement. If there is any other text in the message, though, it override the implicit agreement. 

---

### Syntax

~~~
backreference = (singular backreference | plural backreference | filtered backreference);
~~~
{: .language-ebnf .railroad-diagram}

You can test out backreferences and see how they work in this interactive Syntax Explorer, which is pre-loaded with some messages to search.

<script src="/versions/4/asset/syntax-check-widget.js" defer></script>
<div class="syntax-checker-widget">
</div>
---

### I'm a Computer; How Do I Read These?

You can get an [EBNF](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) syntax for backreferences here:

~~~
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
number = { digit };
letter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" ;
symbol = "[" | "]" | "{" | "}" | "(" | ")" | "<" | ">" | "'" | '"' | "=" | "|" | "." | "," | ";";
character = symbol | digit | letter;
word = { letter };
phrase = { word | " " | symbol };
name = word;
subject = word;
message text = phrase;

singular backreference = caret count backreference | caret quantity backreference | quote;
caret count backreference = { "^" } ;
caret quantity backreference = "^", number ;
quote = "^" , "\"" , message text , "\"";
plural backreference = backreference range | backreference sequence;
backreference range = singular backreference , "-" , singular backreference
backreference sequence = backreference , { "," , backreference }
filtered backreference = { backreference filter } , (* treat as ^ *) | singular backreference | plural backreference;
backreference filter = author backreference filter | message subject filter;
author backreference filter = "^" , [ "@" ], name;
~~~
{: .language-ebnf .railroad-diagram-source-collection .download-file-instead-of-display data-filename="backreference.ebnf"}

---

### Future Backreference Usage

The caret is part of Markdown, the formatting language that Discord uses. It's used for ^superscript. Discord has superscript off right now, but if they turn it on, you can use a backslash (`\`) to ignore its special meaning and continue using backreferences normally. If that is considered too annoying, we'll revise it when we come to that point.


## Singular Backreferences

Singular backreferences are the simplest type of backreference. Each one references only a single message.

~~~
singular backreference = caret count backreference | caret quantity backreference | quote;
~~~
{: .language-ebnf .railroad-diagram}

### Caret Count Backreference

Caret count backreferences reference a message based on relative position. A single caret references the message directly before the current one, a double caret references the message two messages previous, etc. 

#### Syntax

~~~
caret count backreference = { "^" } ;
~~~
{: .language-ebnf .railroad-diagram}

#### Examples: 

~~~
^
~~~
{: .language-backreference}

This backreference refers to the youngest message.

~~~
^^
~~~
{: .language-backreference}

This backreference refers to the second youngest message.

#### Inconsistencies to Note

In some internet dialects, carets are only used to reference the directly previous message. More carets show a stronger agreement. That's not used here, but it can be carried over when images are posted. The normal number of carets in such usages is 3.

#### Scope

Caret count backreferences shouldn't be used when the message referenced is over five messages ago. To reference an older message, use [caret quantities](#caret-quantity-backreference). However, any number of carets is *technically* valid.

---

### Caret Quantity Backreference

Caret quantities also reference a message relatively. They are different from caret count backreferences in that they use just one caret, followed by a number; this lets them reference older messages without annoying people who have to count tons of carets. To be distinct from exponents in mathematical equations, they must be in their own word.

#### Syntax

~~~
caret quantity backreference = "^", number ;
~~~
{: .language-ebnf .railroad-diagram}

#### Examples

~~~
^2
~~~
{: .language-backreference}

This backreference refers to the second-youngest message.

~~~
^7
~~~
{: .language-backreference}

This backreference refers to the seventh-youngest message.

#### Scope

Caret quantities can be used to reference messages as recent as the second-youngest (i.e. `^2`). You *can*, but referring to the youngest message (with `^1`) is discouraged; you can do that easier with a single [caret count](#caret-count-backreference). Caret quantities should not be used to reference messages older than the 12th-youngest (e.g. `^12`)-- if you want to refer to an older message, use an [author backreference](#author-backreference-filter) or a [quote](#quote-backreference). However, any number is technically valid.

---

### Quote Backreference

Quotes refer to a message by its content. When they're alone, do quotes in the Discord/Markdown style (i.e. `> Quoted Text` or right-click > "Quote"). If combining with other backreferences, use a [quote filter](#quote-backreference-filter).

#### Scope

Quotes can refer to any message, but to prevent chat clogging, try to use shorter methods first ([caret count](#caret-count-backreference) or  [caret quantity](#caret-quantity-backreference)).

## Plural Backreferences

All backreferences above this entry are singular; they reference only one message. In some cases, you might want to refer to more than one message at once. To do this, plural backreferences combine two or more singular backreferences together.


~~~
plural backreference = backreference range | backreference sequence;
~~~
{: .language-ebnf .railroad-diagram}

### Backreference Ranges

Ranges refer from one message to another. To make a range, you can connect two singular backreferences together with a hyphen. The first backreference indicates the first message, and the second indicates the last message. Every message in-between should be considered as referred to. Ranges can oldest-youngest or youngest-oldest; it means the same thing. You can use any 2 singular backreferences.

#### Syntax

~~~
backreference range = singular backreference , "-" , singular backreference
~~~
{: .language-ebnf .railroad-diagram}

#### Examples

~~~
^3-^5
~~~
{: .language-backreference}

This range refers to all messages from the third-youngest to fifth-youngest messages.

~~~
^@sam-^@nick^4
~~~
{: .language-backreference}

This range refers to all messages from the youngest message by Sam through the fourth-youngest message by Nick.

#### Scope

Since they're a combination of other backreferences, ranges have no scope of their own. You should satisfy the recommendations of each component.

### Backreference Sequences

Backreference sequences are an alternate method of indicating multiple messages. It allows more fine-grained control than ranges, but is longer. To make a sequence, connect backreferences to each referenced message with a comma. *Any* backreference may be used in a sequence, including ranges and sequences themselves.

#### Syntax 

~~~
backreference sequence = backreference , { "," , backreference }
~~~
{: .language-ebnf .railroad-diagram}

#### Examples

~~~
^^,^^^^
~~~
{: .language-backreference}

This sequence refers to the second-youngest and fourth-youngest messages.

~~~
^,^^^,^5-^7
~~~
{: .language-backreference}

This sequence refers to the youngest message, the fourth-youngest message, and the fifth-youngest through seventh-youngest messages.

#### Scope

Since they're a combination of other backreferences, sequences have no scope of their own. You should satisfy the recommendations of each component.

## Backreference Filters

Backreference filters may be used on their own, or put in front of a [singular backreference](#singular-backreference); this is called a "filtered backreference". Multiple backreference filters can be stacked on a single base backreference, but there can only be one base. Any Filter used on its own should be treated as filtering on `^` (youngest message).

When counting messages for a filtered backreference, those that don't match (e.g. messages by other authors) should not be counted.

~~~
filtered backreference = { backreference filter } , (* treat as ^ *) | singular backreference;
backreference filter = author backreference filter | message quote filter;
~~~
{: .language-ebnf .railroad-diagram}

### Author Backreference Filter

Author backreferences reference a message by its author. The name doesn't need to be exactly their Discord or real-life name, but it should be unique in the conversation.

This filter matches on messages that are sent by the specified author.

#### Syntax

~~~
author backreference filter = "^" , "@" , [ "." ], name;
~~~
{: .language-ebnf .railroad-diagram}

#### Examples 

~~~
^@nick
~~~
{: .language-backreference}

This backreference refers to the youngest message by Nick.

~~~
^@.sam^3
~~~
{: .language-backreference}

This backreference refers to the third-youngest message by Sam, while not pinging.

#### Scope

Author backreferences shouldn't be used for messages that are over 75 messages (total) old, or 15 messages (of the author) old. Author backreferences should also not be used to reference messages that are younger than 5 messages old, except in fast-moving chats.

---

### Quote Backreference Filter

Quote filters refer to a message by its content. You can quote messages in the [Discord format](#quote-backreference) for usage alone, but this syntax is included for combination or for inline usage. 

This filter matches on messages that contain the `message text` phrase.

#### Syntax

~~~
quote = "^" , "\"" , message text , "\"";
~~~
{: .language-ebnf .railroad-diagram}

#### Scope

Quotes can refer to any message, but to prevent chat clogging, try to use shorter methods first ([caret count](#caret-count-backreference) or  [caret quantity](#caret-quantity-backreference)).

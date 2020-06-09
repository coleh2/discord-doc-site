# Message Backreference Specification

* Table of Contents
{:toc}

{::options toc_levels="1..3" /}

## Purpose

In the interest of clear communication and conversation, it is beneficial to have a unified syntax for referring to previously sent messages. Currently, there is an unspecified syntax that serves this purpose, but it has several unclear parts, such as: 

* Scope (when quoting should be used instead)
* Subtypes and their intended usages (e.g. `^^^` vs `^3`)
* Extensions to the current unspoken standard (e.g.` ^name`)
* Meaning (agreement vs. simple reference)

Despite these, this specification will attempt to be backwards-compatible with the majority of current usage. This document should be by no means considered to be a new, mandatory specification to follow, but rather a clarifying document for confusion and an formal explaination for the current syntax. "Incorrect" usage should not be construed as an offensive or negative action.

As such, this specification is established as a clear way to unambiguously reference a previous message on instant messaging platforms, whether for agreement, additional
discussion, indication as context, or for other purposes.

## Required Technical Knowledge

This document has been written to require little to no additional knowledge in order to understand properly. The diagrams that describe the syntax are [railroad diagrams](https://en.wikipedia.org/wiki/Syntax_diagram), a visual representation of syntax intended to be easy to understand. Each diagram defines a part of the syntax, and then may be referred to by other railroad diagrams. If you don't understand any part, feel free to ask; any questions are very helpful to improve the document.

## Definitions

backreference
: A string of text that indicates a previous message

current message
: The message that has the backreference in it.

youngest message
: most recently sent, not counting the current message

oldest message
: least recently sent, not counting the current message

## General Backreference Specification

### Backreference Usage

All backreferences must start with a caret character (`^`). All backreferences should be formatted as a seperate word to avoid ambiguity with other uses of the caret character, such as exponents. A message solely consisting of a backreference should be seen as a general agreement with the message it refers to. However, if there is any other text in the message, its meaning takes precedence over the implicit agreement. 

---

### Syntax

~~~
backreference = (singular backreference | plural backreference | filtered backreference);
~~~
{: .language-ebnf .railroad-diagram}

You can test out backreferences and see how they work in this interactive Syntax Explorer, which is pre-loaded with some messages to search.

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

# end manually written rules
# begin generated-from-railroad rules

~~~
{: .language-ebnf .railroad-diagram-source-collection .download-file-instead-of-display}

---

### Future Backreference Usage

The caret character is part of Markdown, the formatting language that Discord uses; it is used to convey superscript. Currently, superscript is disabled, but should Discord activate this functionality, an escape character (specifically the backslash, `\`) may be used in front of carets to continue using backreferences normally. If that is considered too annoying for a day-to-day basis at the time, a revision of the syntax will be made.


## Singular Backreferences

Singular backreferences are the building blocks that serve as a base to construct other backrefernces. Each one references only one single message. Backreferences are specified here in terms of relativity, with relative backreferences at the start and absolute backreferences at the end.

~~~
singular backreference = caret count backreference | caret quantity backreference | quote;
~~~
{: .language-ebnf .railroad-diagram}

### Caret Count Backreference

Caret count backreferences reference a message relative to the message that they are sent in. A single caret references the message directly before the current one, a double caret references the message two messages previous, etc. 

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

In some internet dialects, carets are used to reference in agreement the directly previous message, with more carets representing a stronger agreement. This is not the syntax used here, but it may be carried over when images are posted. The default number of carets in such usages is 3.

#### Scope

Caret count backreferences should not be used when the message referenced is over five messages ago. If an older reference is to be referenced, [caret quantities](#caret-quantity-backreference) should be used. However, any number of carets is technically valid.

---

### Caret Quantity Backreference

Caret quantities reference a message relative to the message that they are sent in. They are different from caret count backreferences in that they use a single caret, followed by a number; this allows them to reference older messages without causing annoyance by the necessity of counting the carets. In order to be distinct from exponents in mathematical equations, they must be in their own word.

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

Caret quantities may be used for reference to messages as recent as the second-youngest (i.e. `^2`). For brevity, referring to the youngest message (with `^1`) is discouraged, as this may be accomplished easier with a single [caret count](#caret-count-backreference) backreference. Caret quantities should not be used to reference messages older than the 12th-youngest (e.g. `^12`)-- if an older message should be referenced, an [author backreference](#author-backreference-filter) or a [quote](#quote) should be used. However, any number is technically valid.

### Quote

Quotes unambiguously and absolutely refer to a message. Quotes are done in a Discord-sanctioned format by right-clicking a message and hitting the "Quote" option. As such, there is no defined syntax for this backreference method when it is used alone. However, for combining with other backreferences, the following syntax should be used.

#### Syntax

~~~
quote = "^" , "\"" , message text , "\"";
~~~
{: .language-ebnf .railroad-diagram}

#### Scope

Quotes may be used to refer to any message, but in order to prevent the clogging of chat, if any relative backreference method ([caret count](#caret-count-backreference) or  [caret quantity](#caret-quantity-backreference)) is recommended for the message, that should be used instead.

## Plural Backreferences

All backreference types above this entry are singular; they reference only one message. In some cases, a user may wish to indicate more than one message at once. To do this, plural backreferences can be used, which combine multiple singular singular backreferences in order to reference more than one.


~~~
plural backreference = backreference range | backreference sequence;
~~~
{: .language-ebnf .railroad-diagram}

### Backreference Ranges

Ranges can be used to indicate more than one message at once. To make a range, join two backreferences with a hyphen. The first backreference indicates the first message that is referenced, and the second indicates the last message. Ranges may be defined chronologically (oldest-youngest) or anti-chronologically (youngest-oldest); they are the same. Any singular backreferences may be used.

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

This range refers to the all messages from the third-youngest to fifth-youngest messages.

~~~
^sam-^nick^4
~~~
{: .language-backreference}

This backreference refers to all messages from the youngest message by Sam through the fourth-youngest message by Nick.

#### Scope

As a combination of other backreferences, ranges have no defined scope of their own, but the recommendations of each endpoint should be satisfied.

### Backreference Sequences

Backreference sequences are an alternate method of indicating multiple messages. It allows more fine-grained control than ranges, but is longer. To make a sequence, join backreferences to each referenced message with a comma. *Any* backreference may be used in a sequence, including ranges and sequences themselves.

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

This range refers to the second-youngest and fourth-youngest messages.

~~~
^,^^^,^5-^7
~~~
{: .language-backreference}

This backreference refers to the youngest message, the fourth-youngest message, and the fifth-youngest through seventh-youngest messages.

#### Scope

As a combination of other backreferences, sequences have no defined scope of their own, but the recommendations of each endpoint should be satisfied.

## Backreference Filters

Backreference filters may be used on their own, or put in front of a backreference; this is called a "filtered backreference". Multiple backreference filters can be stacked on a single base backreference, but there can only be one base. Any Filter used on its own should be treated as filtering on `^` (youngest message). When counting the messages for a filtered backreference, messages that do not match (e.g. messages by other authors) should not be counted. If the backreference is a [plural backreference](#plural-backreference), then this is applied to each component.

~~~
filtered backreference = { backreference filter } , (* treat as ^ *) | singular backreference | plural backreference;
backreference filter = author backreference filter | message subject filter;
~~~
{: .language-ebnf .railroad-diagram}

### Author Backreference Filter

Author backreferences reference a message by its author. The syntax of an author backreference is a caret, followed by the name of the author (either as a ping, or just typed out-- if typed out, it should be one word). An author filter matches on messages that are sent by the specified author.

#### Syntax

~~~
author backreference filter = "^" , [ "@" ], name;
~~~
{: .language-ebnf .railroad-diagram}

#### Examples 

~~~
^@nick
~~~
{: .language-backreference}

This backreference refers to the youngest message by Nick.

~~~
^sam^3
~~~
{: .language-backreference}

This backreference refers to the third-youngest message by Sam.

#### Scope

Author backreferences should not be used for messages that are over 75 messages (total) old, or 15 messages (of the author) old. Author backreferences should also not be used to reference messages that are younger than 5 messages old, but this may be disregarded in fast-moving chats.

---

### Message Subject Backreference Filter

Message subject filters allow you to reference messages by their subject. Warning: This is subjective, and may be interperted differently by different people!

#### Syntax

~~~
author backreference filter = "^" , "re:", subject;
~~~
{: .language-ebnf .railroad-diagram}

#### Examples 

~~~
^@nick
~~~
{: .language-backreference}

This backreference refers to the youngest message by Nick.

~~~
^sam^3
~~~
{: .language-backreference}

This backreference refers to the third-youngest message by Sam.

#### Scope

Author backreferences should not be used for messages that are over 75 messages (total) old, or 15 messages (of the author) old. Author backreferences should also not be used to reference messages that are younger than 5 messages old, but this may be disregarded in fast-moving chats.

---
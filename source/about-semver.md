<meta name="description" content="A short guide to semantic versioning" />

# Semantic Versioning

## What is it?

Semantic versions, or "semver", is a way of formatting version numbers. A bunch of things use it-- "Minecraft 1.15.2" is an example; the first number (1) is the "major version", the second number (15) is the minor version, and the third number (2) is the patch version. More information can be found [here](https://semver.org/).

## How does this project use it?

When making an edit, you should increase the *major* version if:

* There is a major edit; a complete change of format

When making an edit, you should increase the *minor* version if:

* There is a smaller edit, like a rule addition or removal, that nevertheless changes the meaning of the document

When making an edit, you should increase the *patch* version if:

* You're only changing or clarifying something (e.g. a grammar fix)

Whenever you increase a number, you should reset all less-signifigant numbers to 0 (so a major increase will set both the minor and patch to 0).

Only major versions get preserved forever publically on this website, but *all* changes (including changes to files that don't belong to a version, such as this one) are accessible through GitHub in markdown format.

## What can I change? Are older versions unchangable?

Yeah, kind of. You can change the format (for example, they were transfered from HTML to Markdown in v4.0.0), but their content is unchangable.


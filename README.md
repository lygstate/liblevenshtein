# liblevenshtein

[![Join the chat at https://gitter.im/universal-automata/liblevenshtein](https://badges.gitter.im/universal-automata/liblevenshtein.svg)](https://gitter.im/universal-automata/liblevenshtein?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### A library for generating Finite State Transducers based on Levenshtein Automata.

|     Language |                     Build Status                  |                    Release                   |                 Repository                 |
|-------------:|:-------------------------------------------------:|:--------------------------------------------:|:------------------------------------------ |
|         Java | [![Build Status][java-build-status]][java-ci]     | [![Maven Central][java-release]][java-maven] | [liblevenshtein-java][java-repo]           |
| CoffeeScript | [![Build Status][coffee-build-status]][coffee-ci] | [![npm version][coffee-release]][coffee-npm] | [liblevenshtein-coffeescript][coffee-repo] |

Levenshtein transducers accept a query term and return all terms in a
dictionary that are within n spelling errors away from it. They constitute a
highly-efficient (space _and_ time) class of spelling correctors that work very
well when you do not require context while making suggestions.  Forget about
performing a linear scan over your dictionary to find all terms that are
sufficiently-close to the user's query, using a quadratic implementation of the
[Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance) or
[Damerau-Levenshtein
distance](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance),
these babies find _all_ the terms from your dictionary in linear time _on the
length of the query term_ (not on the size of the dictionary, on the length of
the query term).

If you need context, then take the candidates generated by the transducer as a
starting place, and plug them into whatever model you're using for context (such
as by selecting the sequence of terms that have the greatest probability of
appearing together).

For a quick demonstration, please visit the [Github Page, here][live-demo].
There's also a command-line interface, [liblevenshtein-java-cli][java-cli].
Please see its [README.md][java-cli-readme] for acquisition and usage information.

The library is currently written in Java, CoffeeScript, and JavaScript, but I
will be porting it to other languages, soon.  If you have a specific language
you would like to see it in, or package-management system you would like it
deployed to, let me know.

This library is based largely on the work of [Stoyan
Mihov](http://www.lml.bas.bg/~stoyan/), [Klaus
Schulz](http://www.cis.uni-muenchen.de/people/schulz.html), and Petar Nikolaev Mitankin: "[Fast
String Correction with
Levenshtein-Automata](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.16.652
"Klaus Schulz and Stoyan Mihov (2002)")".  For more details, please see the
[wiki](https://github.com/universal-automata/liblevenshtein/wiki).

[java-repo]: https://github.com/universal-automata/liblevenshtein-java
[java-build-status]: https://travis-ci.org/universal-automata/liblevenshtein-java.svg?branch=master
[java-ci]: https://travis-ci.org/universal-automata/liblevenshtein-java
[java-maven]: https://maven-badges.herokuapp.com/maven-central/com.github.dylon/liblevenshtein
[java-release]: https://maven-badges.herokuapp.com/maven-central/com.github.dylon/liblevenshtein/badge.svg

[coffee-repo]: https://github.com/universal-automata/liblevenshtein-coffeescript
[coffee-build-status]: https://travis-ci.org/universal-automata/liblevenshtein-coffeescript.svg?branch=master
[coffee-ci]: https://travis-ci.org/universal-automata/liblevenshtein-coffeescript
[coffee-npm]: https://www.npmjs.com/package/liblevenshtein
[coffee-release]: https://badge.fury.io/js/liblevenshtein.svg

[live-demo]: http://universal-automata.github.io/liblevenshtein/

[java-cli]: https://github.com/universal-automata/liblevenshtein-java-cli "liblevenshtein-java-cli"
[java-cli-readme]: https://github.com/universal-automata/liblevenshtein-java-cli/blob/master/README.md "liblevenshtein-java-cli, README.md"

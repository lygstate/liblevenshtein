/**
@license
The MIT License (MIT)

Copyright (c) 2014 Dylon Edwards

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
// Generated by CoffeeScript 1.7.1
(function() {
  var Dawg, DawgNode, global;

  DawgNode = (function() {
    DawgNode.next_id = 0;

    function DawgNode() {
      this.id = DawgNode.next_id;
      DawgNode.next_id += 1;
      this['is_final'] = false;
      this['edges'] = {};
    }

    DawgNode.prototype.bisect_left = function(edges, edge, lower, upper) {
      var i;
      while (lower < upper) {
        i = (lower + upper) >> 1;
        if (edges[i] < edge) {
          lower = i + 1;
        } else {
          upper = i;
        }
      }
      return lower;
    };

    DawgNode.prototype['toString'] = function() {
      var edge, edges, label, node, _ref;
      edges = [];
      _ref = this['edges'];
      for (label in _ref) {
        node = _ref[label];
        edge = label + node.id.toString();
        edges.splice(this.bisect_left(edges, edge, 0, edges.length), 0, edge);
      }
      return (+this['is_final']) + edges.join('');
    };

    return DawgNode;

  })();

  Dawg = (function() {
    function Dawg(dictionary) {
      var word, _i, _len;
      if (!(dictionary && typeof dictionary.length === 'number')) {
        throw new Error("Expected dictionary to be array-like");
      }
      this.previous_word = '';
      this['root'] = new DawgNode();
      this.unchecked_nodes = [];
      this.minimized_nodes = {};
      for (_i = 0, _len = dictionary.length; _i < _len; _i++) {
        word = dictionary[_i];
        this['insert'](word);
      }
      this.finish();
    }

    Dawg.prototype['insert'] = function(word) {
      var character, i, next_node, node, previous_word, unchecked_nodes, upper_bound;
      i = 0;
      previous_word = this.previous_word;
      upper_bound = word.length < previous_word.length ? word.length : previous_word.length;
      while (i < upper_bound && word[i] === previous_word[i]) {
        i += 1;
      }
      this.minimize(i);
      unchecked_nodes = this.unchecked_nodes;
      if (unchecked_nodes.length === 0) {
        node = this['root'];
      } else {
        node = unchecked_nodes[unchecked_nodes.length - 1][2];
      }
      while ((character = word[i]) !== undefined) {
        next_node = new DawgNode();
        node['edges'][character] = next_node;
        unchecked_nodes.push([node, character, next_node]);
        node = next_node;
        i += 1;
      }
      node['is_final'] = true;
      this.previous_word = word;
    };

    Dawg.prototype.finish = function() {
      this.minimize(0);
    };

    Dawg.prototype.minimize = function(lower_bound) {
      var character, child, child_key, j, minimized_nodes, parent, unchecked_nodes, _ref;
      minimized_nodes = this.minimized_nodes;
      unchecked_nodes = this.unchecked_nodes;
      j = unchecked_nodes.length;
      while (j > lower_bound) {
        _ref = unchecked_nodes.pop(), parent = _ref[0], character = _ref[1], child = _ref[2];
        child_key = child.toString();
        if (child_key in minimized_nodes) {
          parent['edges'][character] = minimized_nodes[child_key];
        } else {
          minimized_nodes[child_key] = child;
        }
        j -= 1;
      }
    };

    Dawg.prototype['accepts'] = function(word) {
      var edge, node, _i, _len;
      node = this['root'];
      for (_i = 0, _len = word.length; _i < _len; _i++) {
        edge = word[_i];
        node = node['edges'][edge];
        if (!node) {
          return false;
        }
      }
      return node['is_final'];
    };

    return Dawg;

  })();

  global = typeof exports === 'object' ? exports : typeof window === 'object' ? window : this;

  global['levenshtein'] || (global['levenshtein'] = {});

  global['levenshtein']['DawgNode'] = DawgNode;

  global['levenshtein']['Dawg'] = Dawg;

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  var MaxHeap, global;

  MaxHeap = (function() {
    MaxHeap.prototype._parent = function(i) {
      if (i > 0) {
        return ((i + 1) >> 1) - 1;
      } else {
        return 0;
      }
    };

    MaxHeap.prototype._left_child = function(i) {
      return (i << 1) + 1;
    };

    MaxHeap.prototype._right_child = function(i) {
      return (i << 1) + 2;
    };

    MaxHeap.prototype._heapify = function(i) {
      var heap, l, largest, r, tmp;
      l = this._left_child(i);
      r = this._right_child(i);
      heap = this['heap'];
      if (l < this['length'] && this.f(heap[l], heap[i]) > 0) {
        largest = l;
      } else {
        largest = i;
      }
      if (r < this['length'] && this.f(heap[r], heap[largest]) > 0) {
        largest = r;
      }
      if (largest !== i) {
        tmp = heap[i];
        heap[i] = heap[largest];
        heap[largest] = tmp;
        this._heapify(largest);
      }
      return null;
    };

    MaxHeap.prototype._build = function() {
      var i;
      i = this['length'] >> 1;
      while (i >= 0) {
        this._heapify(i);
        i -= 1;
      }
      return null;
    };

    MaxHeap.prototype['increase_key'] = function(i, key) {
      var f, heap, p, parent, tmp;
      f = this.f;
      heap = this['heap'];
      if (f(key, heap[i]) < 0) {
        throw new Error("Expected " + key + " to be at least heap[" + i + "] = " + heap[i]);
      }
      heap[i] = key;
      parent = this._parent;
      p = parent(i);
      while (i && f(heap[p], heap[i]) < 0) {
        tmp = heap[i];
        heap[i] = heap[p];
        heap[p] = tmp;
        i = p;
        p = parent(i);
      }
      return null;
    };

    MaxHeap.prototype['sort'] = function() {
      var heap, i, tmp;
      this._build();
      i = this['length'] - 1;
      heap = this['heap'];
      while (i >= 0) {
        tmp = heap[0];
        heap[0] = heap[i];
        heap[i] = tmp;
        this['length'] -= 1;
        this._heapify(0);
        i -= 1;
      }
      return null;
    };

    MaxHeap.prototype['peek'] = function() {
      if (this['length']) {
        return this['heap'][0];
      } else {
        return null;
      }
    };

    MaxHeap.prototype['pop'] = function() {
      var heap, max;
      if (this['length']) {
        heap = this['heap'];
        max = heap[0];
        heap[0] = heap[this['length'] - 1];
        this['length'] -= 1;
        this._heapify(0);
        return max;
      } else {
        return null;
      }
    };

    MaxHeap.prototype['push'] = function(key) {
      var f, heap, i, p, parent;
      i = this['length'];
      this['length'] += 1;
      parent = this._parent;
      p = parent(i);
      heap = this['heap'];
      f = this.f;
      while (i > 0 && f(heap[p], key) < 0) {
        heap[i] = heap[p];
        i = p;
        p = parent(i);
      }
      heap[i] = key;
      return null;
    };

    function MaxHeap(f, heap, length) {
      if (!heap) {
        heap = [];
      }
      if (typeof heap.length !== 'number') {
        throw new Error("heap must be array-like");
      }
      if (typeof length !== 'number') {
        length = heap ? heap.length : 0;
      }
      if (typeof f !== 'function') {
        throw new Error("f must be a function");
      }
      if (!((0 <= length && length <= heap.length))) {
        throw new Error("Expected 0 <= heap length = " + length + " <= " + heap.length + " = heap size");
      }
      this.f = f;
      this['heap'] = heap;
      this['length'] = length;
      this._build();
    }

    return MaxHeap;

  })();

  global = typeof exports === 'object' ? exports : typeof window === 'object' ? window : this;

  global['levenshtein'] || (global['levenshtein'] = {});

  global['levenshtein']['MaxHeap'] = MaxHeap;

}).call(this);

// Generated by CoffeeScript 1.7.1

/**
 * The algorithm for imitating Levenshtein automata was taken from the
 * following journal article:
 *
 * @ARTICLE{Schulz02faststring,
 *   author = {Klaus Schulz and Stoyan Mihov},
 *   title = {Fast String Correction with Levenshtein-Automata},
 *   journal = {INTERNATIONAL JOURNAL OF DOCUMENT ANALYSIS AND RECOGNITION},
 *   year = {2002},
 *   volume = {5},
 *   pages = {67--85}
 * }
 *
 * As well, this Master Thesis helped me understand its concepts:
 *
 *   www.fmi.uni-sofia.bg/fmi/logic/theses/mitankin-en.pdf
 *
 * The supervisor of the student who submitted the thesis was one of the
 * authors of the journal article, above.
 *
 * The algorithm for constructing a DAWG (Direct Acyclic Word Graph) from the
 * input dictionary of words (DAWGs are otherwise known as an MA-FSA, or
 * Minimal Acyclic Finite-State Automata), was taken and modified from the
 * following blog from Steve Hanov:
 *
 *   http://stevehanov.ca/blog/index.php?id=115
 *
 * The algorithm therein was taken from the following paper:
 *
 * @MISC{Daciuk00incrementalconstruction,
 *   author = {Jan Daciuk and Bruce W. Watson and Richard E. Watson and Stoyan Mihov},
 *   title = {Incremental Construction of Minimal Acyclic Finite-State Automata},
 *   year = {2000}
 * }
 */

(function() {
  var Transducer, global,
    __hasProp = {}.hasOwnProperty;

  Transducer = (function() {
    Transducer.prototype['minimum_distance'] = function(state, w) {
      throw new Error('minimum_distance not specified on construction');
    };

    Transducer.prototype['build_matches'] = function() {
      throw new Error('build_matches not specified on construction');
    };

    Transducer.prototype['initial_state'] = function() {
      throw new Error('initial_state not specified on construction');
    };

    Transducer.prototype['root'] = function() {
      throw new Error('root not specified on construction');
    };

    Transducer.prototype['edges'] = function(q_D) {
      throw new Error('edges not specified on construction');
    };

    Transducer.prototype['is_final'] = function(q_D) {
      throw new Error('is_final not specified on construction');
    };

    Transducer.prototype['transform'] = function(matches) {
      throw new Error('transform not specified on construction');
    };

    Transducer.prototype['transition_for_state'] = function(n) {
      throw new Error('transition_for_state not specified on construction');
    };

    Transducer.prototype['characteristic_vector'] = function(x, term, k, i) {
      throw new Error('characteristic_vector not specified on construction');
    };

    Transducer.prototype['push'] = function(matches, candidate) {
      throw new Error('push not specified on construction');
    };

    function Transducer(attributes) {
      var attribute;
      for (attribute in attributes) {
        if (!__hasProp.call(attributes, attribute)) continue;
        this[attribute] = attributes[attribute];
      }
    }

    Transducer.prototype['transduce'] = function(term, n) {
      var M, V, a, b, distance, i, k, matches, next_M, next_V, next_q_D, q_D, stack, transition, vector, w, x, _ref, _ref1;
      w = term.length;
      transition = this['transition_for_state'](n);
      matches = this['build_matches']();
      stack = [['', this['root'](), this['initial_state']()]];
      while (stack.length > 0) {
        _ref = stack['pop'](), V = _ref[0], q_D = _ref[1], M = _ref[2];
        i = M[0][0];
        a = 2 * n + 1;
        b = w - i;
        k = a < b ? a : b;
        _ref1 = this['edges'](q_D);
        for (x in _ref1) {
          next_q_D = _ref1[x];
          vector = this['characteristic_vector'](x, term, k, i);
          next_M = transition(M, vector);
          if (next_M) {
            next_V = V + x;
            stack.push([next_V, next_q_D, next_M]);
            if (this['is_final'](next_q_D)) {
              distance = this['minimum_distance'](next_M, w);
              if (distance <= n) {
                this['push'](matches, [next_V, distance]);
              }
            }
          }
        }
      }
      return this['transform'](matches);
    };

    return Transducer;

  })();

  global = typeof exports === 'object' ? exports : typeof window === 'object' ? window : this;

  global['levenshtein'] || (global['levenshtein'] = {});

  global['levenshtein']['Transducer'] = Transducer;

}).call(this);

// Generated by CoffeeScript 1.7.1
(function() {
  var Builder, Dawg, MaxHeap, Transducer, fields, global,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty;

  global = typeof exports === 'object' ? exports : typeof window === 'object' ? window : this;

  global['levenshtein'] || (global['levenshtein'] = {});

  if (typeof require === 'function') {
    MaxHeap = require('../collection/max-heap').levenshtein.MaxHeap;
    Transducer = require('./transducer').levenshtein.Transducer;
    Dawg = require('../collection/dawg').levenshtein.Dawg;
  } else {
    MaxHeap = global['levenshtein']['MaxHeap'];
    Transducer = global['levenshtein']['Transducer'];
    Dawg = global['levenshtein']['Dawg'];
  }

  fields = {
    '_dictionary': new Dawg([]),
    '_algorithm': 'standard',
    '_sort_candidates': true,
    '_case_insensitive_sort': true,
    '_include_distance': true,
    '_maximum_candidates': Infinity,
    '_custom_comparator': null,
    '_custom_transform': null
  };

  Builder = (function() {
    function Builder(source) {
      var field;
      if (source == null) {
        source = fields;
      }
      this._unsubsume = __bind(this._unsubsume, this);
      for (field in fields) {
        if (!__hasProp.call(fields, field)) continue;
        this[field] = source[field];
      }
    }

    Builder.prototype._build = function(attributes) {
      var attribute, builder, value;
      builder = new Builder(this);
      for (attribute in attributes) {
        if (!__hasProp.call(attributes, attribute)) continue;
        value = attributes[attribute];
        builder['_' + attribute] = value;
      }
      return builder;
    };

    Builder.prototype['dictionary'] = function(dictionary, sorted) {
      if (dictionary === undefined) {
        return this['_dictionary'];
      } else {
        if (!(dictionary instanceof Array || dictionary instanceof Dawg)) {
          throw new Error('dictionary must be either an Array or Dawg');
        }
        if (dictionary instanceof Array) {
          if (!sorted) {
            dictionary.sort();
          }
          dictionary = new Dawg(dictionary);
        }
        return this._build({
          'dictionary': dictionary
        });
      }
    };

    Builder.prototype['algorithm'] = function(algorithm) {
      if (algorithm === undefined) {
        return this['_algorithm'];
      } else {
        if (algorithm !== 'standard' && algorithm !== 'transposition' && algorithm !== 'merge_and_split') {
          throw new Error('algorithm must be standard, transposition, or merge_and_split');
        }
        return this._build({
          'algorithm': algorithm
        });
      }
    };

    Builder.prototype['sort_candidates'] = function(sort_candidates) {
      if (sort_candidates === undefined) {
        return this['_sort_candidates'];
      } else {
        if (typeof sort_candidates !== 'boolean') {
          throw new Error('sort_candidates must be a boolean');
        }
        return this._build({
          'sort_candidates': sort_candidates
        });
      }
    };

    Builder.prototype['case_insensitive_sort'] = function(case_insensitive_sort) {
      if (case_insensitive_sort === undefined) {
        return this['_case_insensitive_sort'];
      } else {
        if (typeof case_insensitive_sort !== 'boolean') {
          throw new Error('case_insensitive_sort must be a boolean');
        }
        return this._build({
          'case_insensitive_sort': case_insensitive_sort
        });
      }
    };

    Builder.prototype['include_distance'] = function(include_distance) {
      if (include_distance === undefined) {
        return this['_include_distance'];
      } else {
        if (typeof include_distance !== 'boolean') {
          throw new Error('include_distance must be a boolean');
        }
        return this._build({
          'include_distance': include_distance
        });
      }
    };

    Builder.prototype['maximum_candidates'] = function(maximum_candidates) {
      if (maximum_candidates === undefined) {
        return this['_maximum_candidates'];
      } else {
        if (maximum_candidates < 0) {
          throw new Error("maximum_candidates must be non-negative");
        }
        return this._build({
          'maximum_candidates': maximum_candidates
        });
      }
    };

    Builder.prototype['custom_comparator'] = function(custom_comparator) {
      if (custom_comparator === undefined) {
        return this['_custom_comparator'];
      } else {
        if (typeof custom_comparator !== 'function') {
          throw new Error('Expected custom_comparator to be a function');
        }
        return this._build({
          'custom_comparator': custom_comparator
        });
      }
    };

    Builder.prototype['custom_transform'] = function(custom_transform) {
      if (custom_transform === undefined) {
        return this['_custom_transform'];
      } else {
        if (typeof custom_transform !== 'function') {
          throw new Error('Expected custom_transform to be a function');
        }
        return this._build({
          'custom_transform': custom_transform
        });
      }
    };

    Builder.prototype._minimum_distance = function() {
      if (this['_algorithm'] === 'standard') {
        return function(state, w) {
          var distance, e, i, minimum, _i, _len, _ref;
          minimum = Infinity;
          for (_i = 0, _len = state.length; _i < _len; _i++) {
            _ref = state[_i], i = _ref[0], e = _ref[1];
            distance = w - i + e;
            if (distance < minimum) {
              minimum = distance;
            }
          }
          return minimum;
        };
      } else {
        return function(state, w) {
          var distance, e, i, minimum, x, _i, _len, _ref;
          minimum = Infinity;
          for (_i = 0, _len = state.length; _i < _len; _i++) {
            _ref = state[_i], i = _ref[0], e = _ref[1], x = _ref[2];
            distance = w - i + e;
            if (x !== 1 && distance < minimum) {
              minimum = distance;
            }
          }
          return minimum;
        };
      }
    };

    Builder.prototype._comparator = function() {
      var comparator;
      if (typeof this['_custom_comparator'] === 'function') {
        return this['_custom_comparator'];
      } else if (this['_sort_candidates']) {
        comparator = function(a, b) {
          return a[1] - b[1];
        };
        comparator = (function(comparator) {
          return function(a, b) {
            return comparator(a, b) || a[0].toLowerCase().localeCompare(b[0].toLowerCase());
          };
        })(comparator);
        if (!this['_case_insensitive_sort']) {
          comparator = (function(comparator) {
            return function(a, b) {
              return comparator(a, b) || a[0].localeCompare(b[0]);
            };
          })(comparator);
        }
        return comparator;
      } else {
        return function() {
          return 0;
        };
      }
    };

    Builder.prototype._transform = function(comparator) {
      var transform;
      transform = typeof this['_custom_transform'] === 'function' ? this['_custom_transform'] : this['_include_distance'] === false ? function(candidate) {
        return candidate[0];
      } : void 0;
      return (function(_this) {
        return function(matches) {
          var heap, i;
          if (isFinite(_this['_maximum_candidates'])) {
            matches['sort']();
            matches = matches['heap'];
          } else if (_this['_sort_candidates']) {
            heap = matches;
            matches = [];
            while (heap['peek']() !== null) {
              matches.push(heap['pop']());
            }
          }
          if (typeof transform === 'function') {
            i = -1;
            while ((++i) < matches.length) {
              matches[i] = transform(matches[i]);
            }
          }
          return matches;
        };
      })(this);
    };

    Builder.prototype._initial_state = function() {
      if (this['_algorithm'] === 'standard') {
        return [[0, 0]];
      } else {
        return [[0, 0, 0]];
      }
    };

    Builder.prototype._sort_for_transition = function() {
      var comparator, _ref;
      comparator = function(a, b) {
        return a[0] - b[0] || a[1] - b[1];
      };
      if ((_ref = this['_algorithm']) === 'transposition' || _ref === 'merge_and_split') {
        comparator = (function(comparator) {
          return function(a, b) {
            return comparator(a, b) || a[2] - b[2];
          };
        })(comparator);
      }
      return function(state) {
        return state.sort(comparator);
      };
    };

    Builder.prototype._index_of = function(vector, k, i) {
      var j;
      j = 0;
      while (j < k) {
        if (vector[i + j]) {
          return j;
        }
        j += 1;
      }
      return -1;
    };

    Builder.prototype._transition_for_position = function() {
      switch (this['_algorithm']) {
        case 'standard':
          return (function(_this) {
            return function(n) {
              return function(_arg, vector, offset) {
                var a, b, e, h, i, j, k, w;
                i = _arg[0], e = _arg[1];
                h = i - offset;
                w = vector.length;
                if (e < n) {
                  if (h <= w - 2) {
                    a = n - e + 1;
                    b = w - h;
                    k = a < b ? a : b;
                    j = _this._index_of(vector, k, h);
                    if (j === 0) {
                      return [[i + 1, e]];
                    } else if (j > 0) {
                      return [[i, e + 1], [i + 1, e + 1], [i + j + 1, e + j]];
                    } else {
                      return [[i, e + 1], [i + 1, e + 1]];
                    }
                  } else if (h === w - 1) {
                    if (vector[h]) {
                      return [[i + 1, e]];
                    } else {
                      return [[i, e + 1], [i + 1, e + 1]];
                    }
                  } else {
                    return [[i, e + 1]];
                  }
                } else if (e === n) {
                  if (h <= w - 1) {
                    if (vector[h]) {
                      return [[i + 1, n]];
                    } else {
                      return null;
                    }
                  } else {
                    return null;
                  }
                } else {
                  return null;
                }
              };
            };
          })(this);
        case 'transposition':
          return (function(_this) {
            return function(n) {
              return function(_arg, vector, offset) {
                var a, b, e, h, i, j, k, t, w;
                i = _arg[0], e = _arg[1], t = _arg[2];
                h = i - offset;
                w = vector.length;
                if ((e === 0 && 0 < n)) {
                  if (h <= w - 2) {
                    a = n - e + 1;
                    b = w - h;
                    k = a < b ? a : b;
                    j = _this._index_of(vector, k, h);
                    if (j === 0) {
                      return [[i + 1, 0, 0]];
                    } else if (j === 1) {
                      return [[i, 1, 0], [i, 1, 1], [i + 1, 1, 0], [i + 2, 1, 0]];
                    } else if (j > 1) {
                      return [[i, 1, 0], [i + 1, 1, 0], [i + j + 1, j, 0]];
                    } else {
                      return [[i, 1, 0], [i + 1, 1, 0]];
                    }
                  } else if (h === w - 1) {
                    if (vector[h]) {
                      return [[i + 1, 0, 0]];
                    } else {
                      return [[i, 1, 0], [i + 1, 1, 0]];
                    }
                  } else {
                    return [[i, 1, 0]];
                  }
                } else if ((1 <= e && e < n)) {
                  if (h <= w - 2) {
                    if (t === 0) {
                      a = n - e + 1;
                      b = w - h;
                      k = a < b ? a : b;
                      j = _this._index_of(vector, k, h);
                      if (j === 0) {
                        return [[i + 1, e, 0]];
                      } else if (j === 1) {
                        return [[i, e + 1, 0], [i, e + 1, 1], [i + 1, e + 1, 0], [i + 2, e + 1, 0]];
                      } else if (j > 1) {
                        return [[i, e + 1, 0], [i + 1, e + 1, 0], [i + j + 1, e + j, 0]];
                      } else {
                        return [[i, e + 1, 0], [i + 1, e + 1, 0]];
                      }
                    } else {
                      if (vector[h]) {
                        return [[i + 2, e, 0]];
                      } else {
                        return null;
                      }
                    }
                  } else if (h === w - 1) {
                    if (vector[h]) {
                      return [[i + 1, e, 0]];
                    } else {
                      return [[i, e + 1, 0], [i + 1, e + 1, 0]];
                    }
                  } else {
                    return [[i, e + 1, 0]];
                  }
                } else {
                  if (h <= w - 1 && t === 0) {
                    if (vector[h]) {
                      return [[i + 1, n, 0]];
                    } else {
                      return null;
                    }
                  } else if (h <= w - 2 && t === 1) {
                    if (vector[h]) {
                      return [[i + 2, n, 0]];
                    } else {
                      return null;
                    }
                  } else {
                    return null;
                  }
                }
              };
            };
          })(this);
        case 'merge_and_split':
          return (function(_this) {
            return function(n) {
              return function(_arg, vector, offset) {
                var e, h, i, s, w;
                i = _arg[0], e = _arg[1], s = _arg[2];
                h = i - offset;
                w = vector.length;
                if ((e === 0 && 0 < n)) {
                  if (h <= w - 2) {
                    if (vector[h]) {
                      return [[i + 1, e, 0]];
                    } else {
                      return [[i, e + 1, 0], [i, e + 1, 1], [i + 1, e + 1, 0], [i + 2, e + 1, 0]];
                    }
                  } else if (h === w - 1) {
                    if (vector[h]) {
                      return [[i + 1, e, 0]];
                    } else {
                      return [[i, e + 1, 0], [i, e + 1, 1], [i + 1, e + 1, 0]];
                    }
                  } else {
                    return [[i, e + 1, 0]];
                  }
                } else if (e < n) {
                  if (h <= w - 2) {
                    if (s === 0) {
                      if (vector[h]) {
                        return [[i + 1, e, 0]];
                      } else {
                        return [[i, e + 1, 0], [i, e + 1, 1], [i + 1, e + 1, 0], [i + 2, e + 1, 0]];
                      }
                    } else {
                      return [[i + 1, e, 0]];
                    }
                  } else if (h === w - 1) {
                    if (s === 0) {
                      if (vector[h]) {
                        return [[i + 1, e, 0]];
                      } else {
                        return [[i, e + 1, 0], [i, e + 1, 1], [i + 1, e + 1, 0]];
                      }
                    } else {
                      return [[i + 1, e, 0]];
                    }
                  } else {
                    return [[i, e + 1, 0]];
                  }
                } else {
                  if (h <= w - 1) {
                    if (s === 0) {
                      if (vector[h]) {
                        return [[i + 1, n, 0]];
                      } else {
                        return null;
                      }
                    } else {
                      return [[i + 1, e, 0]];
                    }
                  } else {
                    return null;
                  }
                }
              };
            };
          })(this);
      }
    };

    Builder.prototype._bisect_error_right = function(state, e, l) {
      var i, u;
      u = state.length;
      while (l < u) {
        i = (l + u) >> 1;
        if (e < state[i][1]) {
          u = i;
        } else {
          l = i + 1;
        }
      }
      return l;
    };

    Builder.prototype._unsubsume = function() {
      var bisect_error_right, subsumes;
      subsumes = this._subsumes();
      bisect_error_right = this._bisect_error_right;
      switch (this['_algorithm']) {
        case 'standard':
          return function(state) {
            var e, f, i, j, m, n, x, y;
            m = 0;
            while (x = state[m]) {
              i = x[0], e = x[1];
              n = bisect_error_right(state, e, m);
              while (y = state[n]) {
                j = y[0], f = y[1];
                if (subsumes(i, e, j, f)) {
                  state.splice(n, 1);
                } else {
                  n += 1;
                }
              }
              m += 1;
            }
          };
        case 'transposition':
          return function(state) {
            var e, f, i, j, m, n, s, t, x, y;
            m = 0;
            while (x = state[m]) {
              i = x[0], e = x[1], s = x[2];
              n = bisect_error_right(state, e, m);
              while (y = state[n]) {
                j = y[0], f = y[1], t = y[2];
                if (subsumes(i, e, s, j, f, t, n)) {
                  state.splice(n, 1);
                } else {
                  n += 1;
                }
              }
              m += 1;
            }
          };
        case 'merge_and_split':
          return function(state) {
            var e, f, i, j, m, n, s, t, x, y;
            m = 0;
            while (x = state[m]) {
              i = x[0], e = x[1], s = x[2];
              n = bisect_error_right(state, e, m);
              while (y = state[n]) {
                j = y[0], f = y[1], t = y[2];
                if (subsumes(i, e, s, j, f, t, n)) {
                  state.splice(n, 1);
                } else {
                  n += 1;
                }
              }
              m += 1;
            }
          };
      }
    };

    Builder.prototype._subsumes = function() {
      switch (this['_algorithm']) {
        case 'standard':
          return function(i, e, j, f) {
            return ((i < j) && (j - i) || (i - j)) <= (f - e);
          };
        case 'transposition':
          return function(i, e, s, j, f, t, n) {
            if (s === 1) {
              if (t === 1) {
                return i === j;
              } else {
                return (f === n) && (i === j);
              }
            } else {
              if (t === 1) {
                return ((i < j) && (j - i) || (i - j)) + 1 <= (f - e);
              } else {
                return ((i < j) && (j - i) || (i - j)) <= (f - e);
              }
            }
          };
        case 'merge_and_split':
          return function(i, e, s, j, f, t) {
            if (s === 1 && t === 0) {
              return false;
            } else {
              return ((i < j) && (j - i) || (i - j)) <= (f - e);
            }
          };
      }
    };

    Builder.prototype._bisect_left = function() {
      if (this['_algorithm']) {
        return function(state, position) {
          var e, i, k, l, p, u;
          i = position[0], e = position[1];
          l = 0;
          u = state.length;
          while (l < u) {
            k = (l + u) >> 1;
            p = state[k];
            if ((e - p[1] || i - p[0]) > 0) {
              l = k + 1;
            } else {
              u = k;
            }
          }
          return l;
        };
      } else {
        return function(state, position) {
          var e, i, k, l, p, u, x;
          i = position[0], e = position[1], x = position[2];
          l = 0;
          u = state.length;
          while (l < u) {
            k = (l + u) >> 1;
            p = state[k];
            if ((e - p[1] || i - p[0] || x - p[2]) > 0) {
              l = k + 1;
            } else {
              u = k;
            }
          }
          return l;
        };
      }
    };

    Builder.prototype._merge_for_subsumption = function() {
      var bisect_left;
      bisect_left = this._bisect_left();
      if (this['_algorithm'] === 'standard') {
        return function(state_prime, next_state) {
          var curr, i, position, _i, _len;
          for (_i = 0, _len = next_state.length; _i < _len; _i++) {
            position = next_state[_i];
            i = bisect_left(state_prime, position);
            if (curr = state_prime[i]) {
              if (curr[0] !== position[0] || curr[1] !== position[1]) {
                state_prime.splice(i, 0, position);
              }
            } else {
              state_prime.push(position);
            }
          }
        };
      } else {
        return function(state_prime, next_state) {
          var curr, i, position, _i, _len;
          for (_i = 0, _len = next_state.length; _i < _len; _i++) {
            position = next_state[_i];
            i = bisect_left(state_prime, position);
            if (curr = state_prime[i]) {
              if (curr[0] !== position[0] || curr[1] !== position[1] || curr[2] !== position[2]) {
                state_prime.splice(i, 0, position);
              }
            } else {
              state_prime.push(position);
            }
          }
        };
      }
    };

    Builder.prototype._transition_for_state = function() {
      var merge_for_subsumption, sort_for_transition, transition_for_position, unsubsume;
      merge_for_subsumption = this._merge_for_subsumption();
      unsubsume = this._unsubsume();
      transition_for_position = this._transition_for_position();
      sort_for_transition = this._sort_for_transition();
      return function(n) {
        var transition;
        transition = transition_for_position(n);
        return (function(_this) {
          return function(state, vector) {
            var next_state, offset, position, state_prime, _i, _len;
            offset = state[0][0];
            state_prime = [];
            for (_i = 0, _len = state.length; _i < _len; _i++) {
              position = state[_i];
              next_state = transition(position, vector, offset);
              if (!next_state) {
                continue;
              }
              merge_for_subsumption(state_prime, next_state);
            }
            unsubsume(state_prime);
            if (state_prime.length > 0) {
              sort_for_transition(state_prime);
              return state_prime;
            } else {
              return null;
            }
          };
        })(this);
      };
    };

    Builder.prototype._characteristic_vector = function() {
      return function(x, term, k, i) {
        var j, vector;
        vector = [];
        j = 0;
        while (j < k) {
          vector.push(x === term[i + j]);
          j += 1;
        }
        return vector;
      };
    };

    Builder.prototype._push = function(compare) {
      var maximum_candidates;
      maximum_candidates = this['_maximum_candidates'];
      if (isFinite(maximum_candidates)) {
        return function(candidates, candidate) {
          if (candidates.length === maximum_candidates) {
            if (compare(candidate, candidates['peek']()) < 0) {
              candidates['pop']();
              candidates.push(candidate);
            }
          } else {
            candidates.push(candidate);
          }
          return candidates;
        };
      } else {
        return function(candidates, candidate) {
          candidates.push(candidate);
          return candidates;
        };
      }
    };

    Builder.prototype['transducer'] = function() {
      var comparator;
      comparator = this._comparator();
      return new Transducer({
        'minimum_distance': this._minimum_distance(),
        'build_matches': (function(_this) {
          return function() {
            if (isFinite(_this['_maximum_candidates'])) {
              return function() {
                return new MaxHeap(comparator);
              };
            } else if (_this['_sort_candidates']) {
              return function() {
                return new MaxHeap(function(a, b) {
                  return -comparator(a, b);
                });
              };
            } else {
              return function() {
                return [];
              };
            }
          };
        })(this)(),
        'transition_for_state': this._transition_for_state(),
        'characteristic_vector': this._characteristic_vector(),
        'edges': function(dawg_node) {
          return dawg_node['edges'];
        },
        'is_final': function(dawg_node) {
          return dawg_node['is_final'];
        },
        'root': (function(dawg) {
          return function() {
            return dawg['root'];
          };
        })(this['_dictionary']),
        'initial_state': (function(initial_state) {
          return (function(_this) {
            return function() {
              return initial_state;
            };
          })(this);
        })(this._initial_state()),
        'push': this._push(comparator),
        'transform': this._transform(comparator)
      });
    };

    return Builder;

  })();

  global['levenshtein']['Builder'] = Builder;

}).call(this);


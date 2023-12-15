var createFFprobeCore = (function () {
  var _scriptDir =
    typeof document !== "undefined" && document.currentScript
      ? document.currentScript.src
      : undefined;
  if (typeof __filename !== "undefined") _scriptDir = _scriptDir || __filename;
  return function (createFFprobeCore) {
    createFFprobeCore = createFFprobeCore || {};

    var e;
    e ||
      (e = typeof createFFprobeCore !== "undefined" ? createFFprobeCore : {});
    var aa, ba;
    e.ready = new Promise(function (a, b) {
      aa = a;
      ba = b;
    });
    e.quit = function (a) {
      if (e.onExit) e.onExit(a);
      throw new ca(a);
    };
    e.exit = da;
    ea = k = function () {};
    var fa = {},
      ha;
    for (ha in e) e.hasOwnProperty(ha) && (fa[ha] = e[ha]);
    var ia = [],
      ja = "./this.program";
    function ka(a, b) {
      throw b;
    }
    var la = !1,
      ma = !1,
      na = !1,
      oa = !1;
    la = "object" === typeof window;
    ma = "function" === typeof importScripts;
    na =
      "object" === typeof process &&
      "object" === typeof process.versions &&
      "string" === typeof process.versions.node;
    oa = !la && !na && !ma;
    var l = "",
      pa,
      ra,
      sa,
      ta;
    if (na)
      (l = ma ? require("path").dirname(l) + "/" : __dirname + "/"),
        (pa = function (a, b) {
          sa || (sa = require("fs"));
          ta || (ta = require("path"));
          a = ta.normalize(a);
          return sa.readFileSync(a, b ? null : "utf8");
        }),
        (ra = function (a) {
          a = pa(a, !0);
          a.buffer || (a = new Uint8Array(a));
          assert(a.buffer);
          return a;
        }),
        1 < process.argv.length && (ja = process.argv[1].replace(/\\/g, "/")),
        (ia = process.argv.slice(2)),
        process.on("uncaughtException", function (a) {
          if (!(a instanceof ca)) throw a;
        }),
        process.on("unhandledRejection", n),
        (ka = function (a) {
          process.exit(a);
        }),
        (e.inspect = function () {
          return "[Emscripten Module object]";
        });
    else if (oa)
      "undefined" != typeof read &&
        (pa = function (a) {
          return read(a);
        }),
        (ra = function (a) {
          if ("function" === typeof readbuffer)
            return new Uint8Array(readbuffer(a));
          a = read(a, "binary");
          assert("object" === typeof a);
          return a;
        }),
        "undefined" != typeof scriptArgs
          ? (ia = scriptArgs)
          : "undefined" != typeof arguments && (ia = arguments),
        "function" === typeof quit &&
          (ka = function (a) {
            quit(a);
          }),
        "undefined" !== typeof print &&
          ("undefined" === typeof console && (console = {}),
          (console.log = print),
          (console.warn = console.error =
            "undefined" !== typeof printErr ? printErr : print));
    else if (la || ma)
      ma
        ? (l = self.location.href)
        : "undefined" !== typeof document &&
          document.currentScript &&
          (l = document.currentScript.src),
        _scriptDir && (l = _scriptDir),
        0 !== l.indexOf("blob:")
          ? (l = l.substr(0, l.lastIndexOf("/") + 1))
          : (l = ""),
        (pa = function (a) {
          var b = new XMLHttpRequest();
          b.open("GET", a, !1);
          b.send(null);
          return b.responseText;
        }),
        ma &&
          (ra = function (a) {
            var b = new XMLHttpRequest();
            b.open("GET", a, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          });
    var ea = e.print || console.log.bind(console),
      k = e.printErr || console.warn.bind(console);
    for (ha in fa) fa.hasOwnProperty(ha) && (e[ha] = fa[ha]);
    fa = null;
    e.arguments && (ia = e.arguments);
    e.thisProgram && (ja = e.thisProgram);
    e.quit && (ka = e.quit);
    var ua = 0,
      va;
    e.wasmBinary && (va = e.wasmBinary);
    var noExitRuntime;
    e.noExitRuntime && (noExitRuntime = e.noExitRuntime);
    "object" !== typeof WebAssembly && n("no native wasm support detected");
    var wa,
      xa = !1;
    function assert(a, b) {
      a || n("Assertion failed: " + b);
    }
    function ya(a) {
      var b = e["_" + a];
      assert(
        b,
        "Cannot call unknown function " + a + ", make sure it is exported",
      );
      return b;
    }
    function za(a, b, c, d) {
      var f = {
          string: function (q) {
            var t = 0;
            if (null !== q && void 0 !== q && 0 !== q) {
              var v = (q.length << 2) + 1;
              t = Aa(v);
              Ba(q, t, v);
            }
            return t;
          },
          array: function (q) {
            var t = Aa(q.length);
            x.set(q, t);
            return t;
          },
        },
        g = ya(a),
        h = [];
      a = 0;
      if (d)
        for (var m = 0; m < d.length; m++) {
          var r = f[c[m]];
          r ? (0 === a && (a = y()), (h[m] = r(d[m]))) : (h[m] = d[m]);
        }
      c = g.apply(null, h);
      c = (function (q) {
        return "string" === b ? z(q) : "boolean" === b ? !!q : q;
      })(c);
      0 !== a && A(a);
      return c;
    }
    var Ca =
      "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
    function Da(a, b, c) {
      var d = b + c;
      for (c = b; a[c] && !(c >= d); ) ++c;
      if (16 < c - b && a.subarray && Ca) return Ca.decode(a.subarray(b, c));
      for (d = ""; b < c; ) {
        var f = a[b++];
        if (f & 128) {
          var g = a[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | g);
          else {
            var h = a[b++] & 63;
            f =
              224 == (f & 240)
                ? ((f & 15) << 12) | (g << 6) | h
                : ((f & 7) << 18) | (g << 12) | (h << 6) | (a[b++] & 63);
            65536 > f
              ? (d += String.fromCharCode(f))
              : ((f -= 65536),
                (d += String.fromCharCode(
                  55296 | (f >> 10),
                  56320 | (f & 1023),
                )));
          }
        } else d += String.fromCharCode(f);
      }
      return d;
    }
    function z(a, b) {
      return a ? Da(B, a, b) : "";
    }
    function Ea(a, b, c, d) {
      if (!(0 < d)) return 0;
      var f = c;
      d = c + d - 1;
      for (var g = 0; g < a.length; ++g) {
        var h = a.charCodeAt(g);
        if (55296 <= h && 57343 >= h) {
          var m = a.charCodeAt(++g);
          h = (65536 + ((h & 1023) << 10)) | (m & 1023);
        }
        if (127 >= h) {
          if (c >= d) break;
          b[c++] = h;
        } else {
          if (2047 >= h) {
            if (c + 1 >= d) break;
            b[c++] = 192 | (h >> 6);
          } else {
            if (65535 >= h) {
              if (c + 2 >= d) break;
              b[c++] = 224 | (h >> 12);
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | (h >> 18);
              b[c++] = 128 | ((h >> 12) & 63);
            }
            b[c++] = 128 | ((h >> 6) & 63);
          }
          b[c++] = 128 | (h & 63);
        }
      }
      b[c] = 0;
      return c - f;
    }
    function Ba(a, b, c) {
      return Ea(a, B, b, c);
    }
    function Ga(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d &&
          57343 >= d &&
          (d = (65536 + ((d & 1023) << 10)) | (a.charCodeAt(++c) & 1023));
        127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
      }
      return b;
    }
    function Ha(a) {
      var b = Ga(a) + 1,
        c = Ia(b);
      c && Ea(a, x, c, b);
      return c;
    }
    function Ja(a) {
      var b = Ga(a) + 1,
        c = Aa(b);
      Ea(a, x, c, b);
      return c;
    }
    function Ka(a, b, c) {
      for (var d = 0; d < a.length; ++d) x[b++ >> 0] = a.charCodeAt(d);
      c || (x[b >> 0] = 0);
    }
    var La, x, B, Ma, Na, D, Oa, F, Pa;
    function Qa(a) {
      La = a;
      e.HEAP8 = x = new Int8Array(a);
      e.HEAP16 = Ma = new Int16Array(a);
      e.HEAP32 = D = new Int32Array(a);
      e.HEAPU8 = B = new Uint8Array(a);
      e.HEAPU16 = Na = new Uint16Array(a);
      e.HEAPU32 = Oa = new Uint32Array(a);
      e.HEAPF32 = F = new Float32Array(a);
      e.HEAPF64 = Pa = new Float64Array(a);
    }
    var Ra = e.INITIAL_MEMORY || 33554432;
    e.wasmMemory
      ? (wa = e.wasmMemory)
      : (wa = new WebAssembly.Memory({ initial: Ra / 65536, maximum: 16384 }));
    wa && (La = wa.buffer);
    Ra = La.byteLength;
    Qa(La);
    var G,
      Sa = [],
      Ta = [],
      Ua = [],
      Va = [],
      Wa = [];
    function Xa() {
      var a = e.preRun.shift();
      Sa.unshift(a);
    }
    var Za = 0,
      $a = null,
      ab = null;
    function bb() {
      Za++;
      e.monitorRunDependencies && e.monitorRunDependencies(Za);
    }
    function cb() {
      Za--;
      e.monitorRunDependencies && e.monitorRunDependencies(Za);
      if (0 == Za && (null !== $a && (clearInterval($a), ($a = null)), ab)) {
        var a = ab;
        ab = null;
        a();
      }
    }
    e.preloadedImages = {};
    e.preloadedAudios = {};
    function n(a) {
      if (e.onAbort) e.onAbort(a);
      k(a);
      xa = !0;
      a = new WebAssembly.RuntimeError(
        "abort(" + a + "). Build with -s ASSERTIONS=1 for more info.",
      );
      ba(a);
      throw a;
    }
    function db(a) {
      var b = eb;
      return String.prototype.startsWith ? b.startsWith(a) : 0 === b.indexOf(a);
    }
    function fb() {
      return db("data:application/octet-stream;base64,");
    }
    var eb = "ffprobe-core.wasm";
    if (!fb()) {
      var gb = eb;
      eb = e.locateFile ? e.locateFile(gb, l) : l + gb;
    }
    function hb() {
      try {
        if (va) return new Uint8Array(va);
        if (ra) return ra(eb);
        throw "both async and sync fetching of the wasm failed";
      } catch (a) {
        n(a);
      }
    }
    function ib() {
      return va || (!la && !ma) || "function" !== typeof fetch || db("file://")
        ? Promise.resolve().then(hb)
        : fetch(eb, { credentials: "same-origin" })
            .then(function (a) {
              if (!a.ok)
                throw "failed to load wasm binary file at '" + eb + "'";
              return a.arrayBuffer();
            })
            .catch(function () {
              return hb();
            });
    }
    var H, I;
    function jb(a) {
      for (; 0 < a.length; ) {
        var b = a.shift();
        if ("function" == typeof b) b(e);
        else {
          var c = b.Mf;
          "number" === typeof c
            ? void 0 === b.Oe
              ? G.get(c)()
              : G.get(c)(b.Oe)
            : c(void 0 === b.Oe ? null : b.Oe);
        }
      }
    }
    function kb(a) {
      return a.replace(/\b_Z[\w\d_]+/g, function (b) {
        return b === b ? b : b + " [" + b + "]";
      });
    }
    var lb;
    na
      ? (lb = function () {
          var a = process.hrtime();
          return 1e3 * a[0] + a[1] / 1e6;
        })
      : "undefined" !== typeof dateNow
        ? (lb = dateNow)
        : (lb = function () {
            return performance.now();
          });
    function mb(a) {
      return (D[nb() >> 2] = a);
    }
    function pb(a, b) {
      if (0 === a) a = Date.now();
      else if (1 === a || 4 === a) a = lb();
      else return mb(28), -1;
      D[b >> 2] = (a / 1e3) | 0;
      D[(b + 4) >> 2] = ((a % 1e3) * 1e6) | 0;
      return 0;
    }
    function qb() {
      function a(h) {
        return (h = h.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? h[1] : "GMT";
      }
      if (!rb) {
        rb = !0;
        var b = new Date().getFullYear(),
          c = new Date(b, 0, 1),
          d = new Date(b, 6, 1);
        b = c.getTimezoneOffset();
        var f = d.getTimezoneOffset(),
          g = Math.max(b, f);
        D[sb() >> 2] = 60 * g;
        D[tb() >> 2] = Number(b != f);
        c = a(c);
        d = a(d);
        c = Ha(c);
        d = Ha(d);
        f < b
          ? ((D[ub() >> 2] = c), (D[(ub() + 4) >> 2] = d))
          : ((D[ub() >> 2] = d), (D[(ub() + 4) >> 2] = c));
      }
    }
    var rb;
    function vb(a, b) {
      qb();
      a = new Date(1e3 * D[a >> 2]);
      D[b >> 2] = a.getSeconds();
      D[(b + 4) >> 2] = a.getMinutes();
      D[(b + 8) >> 2] = a.getHours();
      D[(b + 12) >> 2] = a.getDate();
      D[(b + 16) >> 2] = a.getMonth();
      D[(b + 20) >> 2] = a.getFullYear() - 1900;
      D[(b + 24) >> 2] = a.getDay();
      var c = new Date(a.getFullYear(), 0, 1);
      D[(b + 28) >> 2] = ((a.getTime() - c.getTime()) / 864e5) | 0;
      D[(b + 36) >> 2] = -(60 * a.getTimezoneOffset());
      var d = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
      c = c.getTimezoneOffset();
      a = (d != c && a.getTimezoneOffset() == Math.min(c, d)) | 0;
      D[(b + 32) >> 2] = a;
      a = D[(ub() + (a ? 4 : 0)) >> 2];
      D[(b + 40) >> 2] = a;
      return b;
    }
    function wb(a, b) {
      for (var c = 0, d = a.length - 1; 0 <= d; d--) {
        var f = a[d];
        "." === f
          ? a.splice(d, 1)
          : ".." === f
            ? (a.splice(d, 1), c++)
            : c && (a.splice(d, 1), c--);
      }
      if (b) for (; c; c--) a.unshift("..");
      return a;
    }
    function xb(a) {
      var b = "/" === a.charAt(0),
        c = "/" === a.substr(-1);
      (a = wb(
        a.split("/").filter(function (d) {
          return !!d;
        }),
        !b,
      ).join("/")) ||
        b ||
        (a = ".");
      a && c && (a += "/");
      return (b ? "/" : "") + a;
    }
    function yb(a) {
      var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
        .exec(a)
        .slice(1);
      a = b[0];
      b = b[1];
      if (!a && !b) return ".";
      b && (b = b.substr(0, b.length - 1));
      return a + b;
    }
    function zb(a) {
      if ("/" === a) return "/";
      a = xb(a);
      a = a.replace(/\/$/, "");
      var b = a.lastIndexOf("/");
      return -1 === b ? a : a.substr(b + 1);
    }
    function Ab(a, b) {
      return xb(a + "/" + b);
    }
    function Cb() {
      if (
        "object" === typeof crypto &&
        "function" === typeof crypto.getRandomValues
      ) {
        var a = new Uint8Array(1);
        return function () {
          crypto.getRandomValues(a);
          return a[0];
        };
      }
      if (na)
        try {
          var b = require("crypto");
          return function () {
            return b.randomBytes(1)[0];
          };
        } catch (c) {}
      return function () {
        n("randomDevice");
      };
    }
    function Db() {
      for (var a = "", b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
        b = 0 <= c ? arguments[c] : J.cwd();
        if ("string" !== typeof b)
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!b) return "";
        a = b + "/" + a;
        b = "/" === b.charAt(0);
      }
      a = wb(
        a.split("/").filter(function (d) {
          return !!d;
        }),
        !b,
      ).join("/");
      return (b ? "/" : "") + a || ".";
    }
    function Eb(a, b) {
      function c(h) {
        for (var m = 0; m < h.length && "" === h[m]; m++);
        for (var r = h.length - 1; 0 <= r && "" === h[r]; r--);
        return m > r ? [] : h.slice(m, r - m + 1);
      }
      a = Db(a).substr(1);
      b = Db(b).substr(1);
      a = c(a.split("/"));
      b = c(b.split("/"));
      for (var d = Math.min(a.length, b.length), f = d, g = 0; g < d; g++)
        if (a[g] !== b[g]) {
          f = g;
          break;
        }
      d = [];
      for (g = f; g < a.length; g++) d.push("..");
      d = d.concat(b.slice(f));
      return d.join("/");
    }
    var Fb = [];
    function Gb(a, b) {
      Fb[a] = { input: [], output: [], ze: b };
      J.wf(a, Hb);
    }
    var Hb = {
        open: function (a) {
          var b = Fb[a.node.rdev];
          if (!b) throw new J.Md(43);
          a.tty = b;
          a.seekable = !1;
        },
        close: function (a) {
          a.tty.ze.flush(a.tty);
        },
        flush: function (a) {
          a.tty.ze.flush(a.tty);
        },
        read: function (a, b, c, d) {
          if (!a.tty || !a.tty.ze.Of) throw new J.Md(60);
          for (var f = 0, g = 0; g < d; g++) {
            try {
              var h = a.tty.ze.Of(a.tty);
            } catch (m) {
              throw new J.Md(29);
            }
            if (void 0 === h && 0 === f) throw new J.Md(6);
            if (null === h || void 0 === h) break;
            f++;
            b[c + g] = h;
          }
          f && (a.node.timestamp = Date.now());
          return f;
        },
        write: function (a, b, c, d) {
          if (!a.tty || !a.tty.ze.sf) throw new J.Md(60);
          try {
            for (var f = 0; f < d; f++) a.tty.ze.sf(a.tty, b[c + f]);
          } catch (g) {
            throw new J.Md(29);
          }
          d && (a.node.timestamp = Date.now());
          return f;
        },
      },
      Jb = {
        Of: function (a) {
          if (!a.input.length) {
            var b = null;
            if (na) {
              var c = Buffer.ve ? Buffer.ve(256) : new Buffer(256),
                d = 0;
              try {
                d = sa.readSync(process.stdin.fd, c, 0, 256, null);
              } catch (f) {
                if (-1 != f.toString().indexOf("EOF")) d = 0;
                else throw f;
              }
              0 < d ? (b = c.slice(0, d).toString("utf-8")) : (b = null);
            } else
              "undefined" != typeof window && "function" == typeof window.prompt
                ? ((b = window.prompt("Input: ")), null !== b && (b += "\n"))
                : "function" == typeof readline &&
                  ((b = readline()), null !== b && (b += "\n"));
            if (!b) return null;
            a.input = Ib(b, !0);
          }
          return a.input.shift();
        },
        sf: function (a, b) {
          null === b || 10 === b
            ? (ea(Da(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (ea(Da(a.output, 0)), (a.output = []));
        },
      },
      Kb = {
        sf: function (a, b) {
          null === b || 10 === b
            ? (k(Da(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (k(Da(a.output, 0)), (a.output = []));
        },
      },
      K = {
        je: null,
        Ud: function () {
          return K.createNode(null, "/", 16895, 0);
        },
        createNode: function (a, b, c, d) {
          if (J.vg(c) || J.isFIFO(c)) throw new J.Md(63);
          K.je ||
            (K.je = {
              dir: {
                node: {
                  ge: K.Od.ge,
                  Yd: K.Od.Yd,
                  lookup: K.Od.lookup,
                  le: K.Od.le,
                  rename: K.Od.rename,
                  unlink: K.Od.unlink,
                  rmdir: K.Od.rmdir,
                  readdir: K.Od.readdir,
                  symlink: K.Od.symlink,
                },
                stream: { ce: K.Pd.ce },
              },
              file: {
                node: { ge: K.Od.ge, Yd: K.Od.Yd },
                stream: {
                  ce: K.Pd.ce,
                  read: K.Pd.read,
                  write: K.Pd.write,
                  Ee: K.Pd.Ee,
                  xe: K.Pd.xe,
                  ye: K.Pd.ye,
                },
              },
              link: {
                node: { ge: K.Od.ge, Yd: K.Od.Yd, readlink: K.Od.readlink },
                stream: {},
              },
              Df: { node: { ge: K.Od.ge, Yd: K.Od.Yd }, stream: J.ig },
            });
          c = J.createNode(a, b, c, d);
          J.Vd(c.mode)
            ? ((c.Od = K.je.dir.node), (c.Pd = K.je.dir.stream), (c.Nd = {}))
            : J.isFile(c.mode)
              ? ((c.Od = K.je.file.node),
                (c.Pd = K.je.file.stream),
                (c.Sd = 0),
                (c.Nd = null))
              : J.qe(c.mode)
                ? ((c.Od = K.je.link.node), (c.Pd = K.je.link.stream))
                : J.Ge(c.mode) &&
                  ((c.Od = K.je.Df.node), (c.Pd = K.je.Df.stream));
          c.timestamp = Date.now();
          a && (a.Nd[b] = c);
          return c;
        },
        Xg: function (a) {
          if (a.Nd && a.Nd.subarray) {
            for (var b = [], c = 0; c < a.Sd; ++c) b.push(a.Nd[c]);
            return b;
          }
          return a.Nd;
        },
        Yg: function (a) {
          return a.Nd
            ? a.Nd.subarray
              ? a.Nd.subarray(0, a.Sd)
              : new Uint8Array(a.Nd)
            : new Uint8Array(0);
        },
        Jf: function (a, b) {
          var c = a.Nd ? a.Nd.length : 0;
          c >= b ||
            ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
            0 != c && (b = Math.max(b, 256)),
            (c = a.Nd),
            (a.Nd = new Uint8Array(b)),
            0 < a.Sd && a.Nd.set(c.subarray(0, a.Sd), 0));
        },
        Ig: function (a, b) {
          if (a.Sd != b)
            if (0 == b) (a.Nd = null), (a.Sd = 0);
            else {
              if (!a.Nd || a.Nd.subarray) {
                var c = a.Nd;
                a.Nd = new Uint8Array(b);
                c && a.Nd.set(c.subarray(0, Math.min(b, a.Sd)));
              } else if ((a.Nd || (a.Nd = []), a.Nd.length > b))
                a.Nd.length = b;
              else for (; a.Nd.length < b; ) a.Nd.push(0);
              a.Sd = b;
            }
        },
        Od: {
          ge: function (a) {
            var b = {};
            b.dev = J.Ge(a.mode) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            J.Vd(a.mode)
              ? (b.size = 4096)
              : J.isFile(a.mode)
                ? (b.size = a.Sd)
                : J.qe(a.mode)
                  ? (b.size = a.link.length)
                  : (b.size = 0);
            b.atime = new Date(a.timestamp);
            b.mtime = new Date(a.timestamp);
            b.ctime = new Date(a.timestamp);
            b.gg = 4096;
            b.blocks = Math.ceil(b.size / b.gg);
            return b;
          },
          Yd: function (a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            void 0 !== b.size && K.Ig(a, b.size);
          },
          lookup: function () {
            throw J.hf[44];
          },
          le: function (a, b, c, d) {
            return K.createNode(a, b, c, d);
          },
          rename: function (a, b, c) {
            if (J.Vd(a.mode)) {
              try {
                var d = J.he(b, c);
              } catch (g) {}
              if (d) for (var f in d.Nd) throw new J.Md(55);
            }
            delete a.parent.Nd[a.name];
            a.name = c;
            b.Nd[c] = a;
            a.parent = b;
          },
          unlink: function (a, b) {
            delete a.Nd[b];
          },
          rmdir: function (a, b) {
            var c = J.he(a, b),
              d;
            for (d in c.Nd) throw new J.Md(55);
            delete a.Nd[b];
          },
          readdir: function (a) {
            var b = [".", ".."],
              c;
            for (c in a.Nd) a.Nd.hasOwnProperty(c) && b.push(c);
            return b;
          },
          symlink: function (a, b, c) {
            a = K.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink: function (a) {
            if (!J.qe(a.mode)) throw new J.Md(28);
            return a.link;
          },
        },
        Pd: {
          read: function (a, b, c, d, f) {
            var g = a.node.Nd;
            if (f >= a.node.Sd) return 0;
            a = Math.min(a.node.Sd - f, d);
            if (8 < a && g.subarray) b.set(g.subarray(f, f + a), c);
            else for (d = 0; d < a; d++) b[c + d] = g[f + d];
            return a;
          },
          write: function (a, b, c, d, f, g) {
            b.buffer === x.buffer && (g = !1);
            if (!d) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Nd || a.Nd.subarray)) {
              if (g) return (a.Nd = b.subarray(c, c + d)), (a.Sd = d);
              if (0 === a.Sd && 0 === f)
                return (a.Nd = b.slice(c, c + d)), (a.Sd = d);
              if (f + d <= a.Sd) return a.Nd.set(b.subarray(c, c + d), f), d;
            }
            K.Jf(a, f + d);
            if (a.Nd.subarray && b.subarray) a.Nd.set(b.subarray(c, c + d), f);
            else for (g = 0; g < d; g++) a.Nd[f + g] = b[c + g];
            a.Sd = Math.max(a.Sd, f + d);
            return d;
          },
          ce: function (a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && J.isFile(a.node.mode) && (b += a.node.Sd);
            if (0 > b) throw new J.Md(28);
            return b;
          },
          Ee: function (a, b, c) {
            K.Jf(a.node, b + c);
            a.node.Sd = Math.max(a.node.Sd, b + c);
          },
          xe: function (a, b, c, d, f, g) {
            assert(0 === b);
            if (!J.isFile(a.node.mode)) throw new J.Md(43);
            a = a.node.Nd;
            if (g & 2 || a.buffer !== La) {
              if (0 < d || d + c < a.length)
                a.subarray
                  ? (a = a.subarray(d, d + c))
                  : (a = Array.prototype.slice.call(a, d, d + c));
              d = !0;
              g = 16384 * Math.ceil(c / 16384);
              for (b = Ia(g); c < g; ) x[b + c++] = 0;
              c = b;
              if (!c) throw new J.Md(48);
              x.set(a, c);
            } else (d = !1), (c = a.byteOffset);
            return { Hg: c, df: d };
          },
          ye: function (a, b, c, d, f) {
            if (!J.isFile(a.node.mode)) throw new J.Md(43);
            if (f & 2) return 0;
            K.Pd.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      J = {
        root: null,
        Le: [],
        Hf: {},
        streams: [],
        Bg: 1,
        ie: null,
        Gf: "/",
        lf: !1,
        Sf: !0,
        Xd: {},
        Yf: { Vf: { cg: 1, dg: 2 } },
        Md: null,
        hf: {},
        qg: null,
        Ye: 0,
        $g: function (a) {
          if (!(a instanceof J.Md)) {
            a: {
              var b = Error();
              if (!b.stack) {
                try {
                  throw Error();
                } catch (c) {
                  b = c;
                }
                if (!b.stack) {
                  b = "(no stack trace available)";
                  break a;
                }
              }
              b = b.stack.toString();
            }
            e.extraStackTrace && (b += "\n" + e.extraStackTrace());
            b = kb(b);
            throw a + " : " + b;
          }
          return mb(a.Qd);
        },
        Rd: function (a, b) {
          a = Db(J.cwd(), a);
          b = b || {};
          if (!a) return { path: "", node: null };
          var c = { gf: !0, uf: 0 },
            d;
          for (d in c) void 0 === b[d] && (b[d] = c[d]);
          if (8 < b.uf) throw new J.Md(32);
          a = wb(
            a.split("/").filter(function (h) {
              return !!h;
            }),
            !1,
          );
          var f = J.root;
          c = "/";
          for (d = 0; d < a.length; d++) {
            var g = d === a.length - 1;
            if (g && b.parent) break;
            f = J.he(f, a[d]);
            c = Ab(c, a[d]);
            J.re(f) && (!g || (g && b.gf)) && (f = f.Ke.root);
            if (!g || b.ee)
              for (g = 0; J.qe(f.mode); )
                if (
                  ((f = J.readlink(c)),
                  (c = Db(yb(c), f)),
                  (f = J.Rd(c, { uf: b.uf }).node),
                  40 < g++)
                )
                  throw new J.Md(32);
          }
          return { path: c, node: f };
        },
        ne: function (a) {
          for (var b; ; ) {
            if (J.Se(a))
              return (
                (a = a.Ud.Uf),
                b ? ("/" !== a[a.length - 1] ? a + "/" + b : a + b) : a
              );
            b = b ? a.name + "/" + b : a.name;
            a = a.parent;
          }
        },
        kf: function (a, b) {
          for (var c = 0, d = 0; d < b.length; d++)
            c = ((c << 5) - c + b.charCodeAt(d)) | 0;
          return ((a + c) >>> 0) % J.ie.length;
        },
        Qf: function (a) {
          var b = J.kf(a.parent.id, a.name);
          a.te = J.ie[b];
          J.ie[b] = a;
        },
        Rf: function (a) {
          var b = J.kf(a.parent.id, a.name);
          if (J.ie[b] === a) J.ie[b] = a.te;
          else
            for (b = J.ie[b]; b; ) {
              if (b.te === a) {
                b.te = a.te;
                break;
              }
              b = b.te;
            }
        },
        he: function (a, b) {
          var c = J.zg(a);
          if (c) throw new J.Md(c, a);
          for (c = J.ie[J.kf(a.id, b)]; c; c = c.te) {
            var d = c.name;
            if (c.parent.id === a.id && d === b) return c;
          }
          return J.lookup(a, b);
        },
        createNode: function (a, b, c, d) {
          a = new J.$f(a, b, c, d);
          J.Qf(a);
          return a;
        },
        ff: function (a) {
          J.Rf(a);
        },
        Se: function (a) {
          return a === a.parent;
        },
        re: function (a) {
          return !!a.Ke;
        },
        isFile: function (a) {
          return 32768 === (a & 61440);
        },
        Vd: function (a) {
          return 16384 === (a & 61440);
        },
        qe: function (a) {
          return 40960 === (a & 61440);
        },
        Ge: function (a) {
          return 8192 === (a & 61440);
        },
        vg: function (a) {
          return 24576 === (a & 61440);
        },
        isFIFO: function (a) {
          return 4096 === (a & 61440);
        },
        isSocket: function (a) {
          return 49152 === (a & 49152);
        },
        rg: {
          r: 0,
          rs: 1052672,
          "r+": 2,
          w: 577,
          wx: 705,
          xw: 705,
          "w+": 578,
          "wx+": 706,
          "xw+": 706,
          a: 1089,
          ax: 1217,
          xa: 1217,
          "a+": 1090,
          "ax+": 1218,
          "xa+": 1218,
        },
        Tf: function (a) {
          var b = J.rg[a];
          if ("undefined" === typeof b)
            throw Error("Unknown file open mode: " + a);
          return b;
        },
        Kf: function (a) {
          var b = ["r", "w", "rw"][a & 3];
          a & 512 && (b += "w");
          return b;
        },
        oe: function (a, b) {
          if (J.Sf) return 0;
          if (-1 === b.indexOf("r") || a.mode & 292) {
            if (
              (-1 !== b.indexOf("w") && !(a.mode & 146)) ||
              (-1 !== b.indexOf("x") && !(a.mode & 73))
            )
              return 2;
          } else return 2;
          return 0;
        },
        zg: function (a) {
          var b = J.oe(a, "x");
          return b ? b : a.Od.lookup ? 0 : 2;
        },
        rf: function (a, b) {
          try {
            return J.he(a, b), 20;
          } catch (c) {}
          return J.oe(a, "wx");
        },
        Te: function (a, b, c) {
          try {
            var d = J.he(a, b);
          } catch (f) {
            return f.Qd;
          }
          if ((a = J.oe(a, "wx"))) return a;
          if (c) {
            if (!J.Vd(d.mode)) return 54;
            if (J.Se(d) || J.ne(d) === J.cwd()) return 10;
          } else if (J.Vd(d.mode)) return 31;
          return 0;
        },
        Ag: function (a, b) {
          return a
            ? J.qe(a.mode)
              ? 32
              : J.Vd(a.mode) && ("r" !== J.Kf(b) || b & 512)
                ? 31
                : J.oe(a, J.Kf(b))
            : 44;
        },
        ag: 4096,
        Cg: function (a, b) {
          b = b || J.ag;
          for (a = a || 0; a <= b; a++) if (!J.streams[a]) return a;
          throw new J.Md(33);
        },
        ke: function (a) {
          return J.streams[a];
        },
        Ff: function (a, b, c) {
          J.bf ||
            ((J.bf = function () {}),
            (J.bf.prototype = {
              object: {
                get: function () {
                  return this.node;
                },
                set: function (g) {
                  this.node = g;
                },
              },
            }));
          var d = new J.bf(),
            f;
          for (f in a) d[f] = a[f];
          a = d;
          b = J.Cg(b, c);
          a.fd = b;
          return (J.streams[b] = a);
        },
        jg: function (a) {
          J.streams[a] = null;
        },
        ig: {
          open: function (a) {
            a.Pd = J.sg(a.node.rdev).Pd;
            a.Pd.open && a.Pd.open(a);
          },
          ce: function () {
            throw new J.Md(70);
          },
        },
        pf: function (a) {
          return a >> 8;
        },
        bh: function (a) {
          return a & 255;
        },
        se: function (a, b) {
          return (a << 8) | b;
        },
        wf: function (a, b) {
          J.Hf[a] = { Pd: b };
        },
        sg: function (a) {
          return J.Hf[a];
        },
        Nf: function (a) {
          var b = [];
          for (a = [a]; a.length; ) {
            var c = a.pop();
            b.push(c);
            a.push.apply(a, c.Le);
          }
          return b;
        },
        Xf: function (a, b) {
          function c(h) {
            J.Ye--;
            return b(h);
          }
          function d(h) {
            if (h) {
              if (!d.pg) return (d.pg = !0), c(h);
            } else ++g >= f.length && c(null);
          }
          "function" === typeof a && ((b = a), (a = !1));
          J.Ye++;
          1 < J.Ye &&
            k(
              "warning: " +
                J.Ye +
                " FS.syncfs operations in flight at once, probably just doing extra work",
            );
          var f = J.Nf(J.root.Ud),
            g = 0;
          f.forEach(function (h) {
            if (!h.type.Xf) return d(null);
            h.type.Xf(h, a, d);
          });
        },
        Ud: function (a, b, c) {
          var d = "/" === c,
            f = !c;
          if (d && J.root) throw new J.Md(10);
          if (!d && !f) {
            var g = J.Rd(c, { gf: !1 });
            c = g.path;
            g = g.node;
            if (J.re(g)) throw new J.Md(10);
            if (!J.Vd(g.mode)) throw new J.Md(54);
          }
          b = { type: a, fh: b, Uf: c, Le: [] };
          a = a.Ud(b);
          a.Ud = b;
          b.root = a;
          d ? (J.root = a) : g && ((g.Ke = b), g.Ud && g.Ud.Le.push(b));
          return a;
        },
        ih: function (a) {
          a = J.Rd(a, { gf: !1 });
          if (!J.re(a.node)) throw new J.Md(28);
          a = a.node;
          var b = a.Ke,
            c = J.Nf(b);
          Object.keys(J.ie).forEach(function (d) {
            for (d = J.ie[d]; d; ) {
              var f = d.te;
              -1 !== c.indexOf(d.Ud) && J.ff(d);
              d = f;
            }
          });
          a.Ke = null;
          a.Ud.Le.splice(a.Ud.Le.indexOf(b), 1);
        },
        lookup: function (a, b) {
          return a.Od.lookup(a, b);
        },
        le: function (a, b, c) {
          var d = J.Rd(a, { parent: !0 }).node;
          a = zb(a);
          if (!a || "." === a || ".." === a) throw new J.Md(28);
          var f = J.rf(d, a);
          if (f) throw new J.Md(f);
          if (!d.Od.le) throw new J.Md(63);
          return d.Od.le(d, a, b, c);
        },
        create: function (a, b) {
          return J.le(a, ((void 0 !== b ? b : 438) & 4095) | 32768, 0);
        },
        mkdir: function (a, b) {
          return J.le(a, ((void 0 !== b ? b : 511) & 1023) | 16384, 0);
        },
        dh: function (a, b) {
          a = a.split("/");
          for (var c = "", d = 0; d < a.length; ++d)
            if (a[d]) {
              c += "/" + a[d];
              try {
                J.mkdir(c, b);
              } catch (f) {
                if (20 != f.Qd) throw f;
              }
            }
        },
        Ue: function (a, b, c) {
          "undefined" === typeof c && ((c = b), (b = 438));
          return J.le(a, b | 8192, c);
        },
        symlink: function (a, b) {
          if (!Db(a)) throw new J.Md(44);
          var c = J.Rd(b, { parent: !0 }).node;
          if (!c) throw new J.Md(44);
          b = zb(b);
          var d = J.rf(c, b);
          if (d) throw new J.Md(d);
          if (!c.Od.symlink) throw new J.Md(63);
          return c.Od.symlink(c, b, a);
        },
        rename: function (a, b) {
          var c = yb(a),
            d = yb(b),
            f = zb(a),
            g = zb(b);
          var h = J.Rd(a, { parent: !0 });
          var m = h.node;
          h = J.Rd(b, { parent: !0 });
          h = h.node;
          if (!m || !h) throw new J.Md(44);
          if (m.Ud !== h.Ud) throw new J.Md(75);
          var r = J.he(m, f);
          d = Eb(a, d);
          if ("." !== d.charAt(0)) throw new J.Md(28);
          d = Eb(b, c);
          if ("." !== d.charAt(0)) throw new J.Md(55);
          try {
            var q = J.he(h, g);
          } catch (t) {}
          if (r !== q) {
            c = J.Vd(r.mode);
            if ((f = J.Te(m, f, c))) throw new J.Md(f);
            if ((f = q ? J.Te(h, g, c) : J.rf(h, g))) throw new J.Md(f);
            if (!m.Od.rename) throw new J.Md(63);
            if (J.re(r) || (q && J.re(q))) throw new J.Md(10);
            if (h !== m && (f = J.oe(m, "w"))) throw new J.Md(f);
            try {
              J.Xd.willMovePath && J.Xd.willMovePath(a, b);
            } catch (t) {
              k(
                "FS.trackingDelegate['willMovePath']('" +
                  a +
                  "', '" +
                  b +
                  "') threw an exception: " +
                  t.message,
              );
            }
            J.Rf(r);
            try {
              m.Od.rename(r, h, g);
            } catch (t) {
              throw t;
            } finally {
              J.Qf(r);
            }
            try {
              if (J.Xd.onMovePath) J.Xd.onMovePath(a, b);
            } catch (t) {
              k(
                "FS.trackingDelegate['onMovePath']('" +
                  a +
                  "', '" +
                  b +
                  "') threw an exception: " +
                  t.message,
              );
            }
          }
        },
        rmdir: function (a) {
          var b = J.Rd(a, { parent: !0 }).node,
            c = zb(a),
            d = J.he(b, c),
            f = J.Te(b, c, !0);
          if (f) throw new J.Md(f);
          if (!b.Od.rmdir) throw new J.Md(63);
          if (J.re(d)) throw new J.Md(10);
          try {
            J.Xd.willDeletePath && J.Xd.willDeletePath(a);
          } catch (g) {
            k(
              "FS.trackingDelegate['willDeletePath']('" +
                a +
                "') threw an exception: " +
                g.message,
            );
          }
          b.Od.rmdir(b, c);
          J.ff(d);
          try {
            if (J.Xd.onDeletePath) J.Xd.onDeletePath(a);
          } catch (g) {
            k(
              "FS.trackingDelegate['onDeletePath']('" +
                a +
                "') threw an exception: " +
                g.message,
            );
          }
        },
        readdir: function (a) {
          a = J.Rd(a, { ee: !0 }).node;
          if (!a.Od.readdir) throw new J.Md(54);
          return a.Od.readdir(a);
        },
        unlink: function (a) {
          var b = J.Rd(a, { parent: !0 }).node,
            c = zb(a),
            d = J.he(b, c),
            f = J.Te(b, c, !1);
          if (f) throw new J.Md(f);
          if (!b.Od.unlink) throw new J.Md(63);
          if (J.re(d)) throw new J.Md(10);
          try {
            J.Xd.willDeletePath && J.Xd.willDeletePath(a);
          } catch (g) {
            k(
              "FS.trackingDelegate['willDeletePath']('" +
                a +
                "') threw an exception: " +
                g.message,
            );
          }
          b.Od.unlink(b, c);
          J.ff(d);
          try {
            if (J.Xd.onDeletePath) J.Xd.onDeletePath(a);
          } catch (g) {
            k(
              "FS.trackingDelegate['onDeletePath']('" +
                a +
                "') threw an exception: " +
                g.message,
            );
          }
        },
        readlink: function (a) {
          a = J.Rd(a).node;
          if (!a) throw new J.Md(44);
          if (!a.Od.readlink) throw new J.Md(28);
          return Db(J.ne(a.parent), a.Od.readlink(a));
        },
        stat: function (a, b) {
          a = J.Rd(a, { ee: !b }).node;
          if (!a) throw new J.Md(44);
          if (!a.Od.ge) throw new J.Md(63);
          return a.Od.ge(a);
        },
        lstat: function (a) {
          return J.stat(a, !0);
        },
        chmod: function (a, b, c) {
          var d;
          "string" === typeof a ? (d = J.Rd(a, { ee: !c }).node) : (d = a);
          if (!d.Od.Yd) throw new J.Md(63);
          d.Od.Yd(d, {
            mode: (b & 4095) | (d.mode & -4096),
            timestamp: Date.now(),
          });
        },
        lchmod: function (a, b) {
          J.chmod(a, b, !0);
        },
        fchmod: function (a, b) {
          a = J.ke(a);
          if (!a) throw new J.Md(8);
          J.chmod(a.node, b);
        },
        chown: function (a, b, c, d) {
          var f;
          "string" === typeof a ? (f = J.Rd(a, { ee: !d }).node) : (f = a);
          if (!f.Od.Yd) throw new J.Md(63);
          f.Od.Yd(f, { timestamp: Date.now() });
        },
        lchown: function (a, b, c) {
          J.chown(a, b, c, !0);
        },
        fchown: function (a, b, c) {
          a = J.ke(a);
          if (!a) throw new J.Md(8);
          J.chown(a.node, b, c);
        },
        truncate: function (a, b) {
          if (0 > b) throw new J.Md(28);
          var c;
          "string" === typeof a ? (c = J.Rd(a, { ee: !0 }).node) : (c = a);
          if (!c.Od.Yd) throw new J.Md(63);
          if (J.Vd(c.mode)) throw new J.Md(31);
          if (!J.isFile(c.mode)) throw new J.Md(28);
          if ((a = J.oe(c, "w"))) throw new J.Md(a);
          c.Od.Yd(c, { size: b, timestamp: Date.now() });
        },
        Wg: function (a, b) {
          a = J.ke(a);
          if (!a) throw new J.Md(8);
          if (0 === (a.flags & 2097155)) throw new J.Md(28);
          J.truncate(a.node, b);
        },
        jh: function (a, b, c) {
          a = J.Rd(a, { ee: !0 }).node;
          a.Od.Yd(a, { timestamp: Math.max(b, c) });
        },
        open: function (a, b, c, d, f) {
          if ("" === a) throw new J.Md(44);
          b = "string" === typeof b ? J.Tf(b) : b;
          c =
            b & 64 ? (("undefined" === typeof c ? 438 : c) & 4095) | 32768 : 0;
          if ("object" === typeof a) var g = a;
          else {
            a = xb(a);
            try {
              g = J.Rd(a, { ee: !(b & 131072) }).node;
            } catch (m) {}
          }
          var h = !1;
          if (b & 64)
            if (g) {
              if (b & 128) throw new J.Md(20);
            } else (g = J.le(a, c, 0)), (h = !0);
          if (!g) throw new J.Md(44);
          J.Ge(g.mode) && (b &= -513);
          if (b & 65536 && !J.Vd(g.mode)) throw new J.Md(54);
          if (!h && (c = J.Ag(g, b))) throw new J.Md(c);
          b & 512 && J.truncate(g, 0);
          b &= -131713;
          d = J.Ff(
            {
              node: g,
              path: J.ne(g),
              flags: b,
              seekable: !0,
              position: 0,
              Pd: g.Pd,
              Pg: [],
              error: !1,
            },
            d,
            f,
          );
          d.Pd.open && d.Pd.open(d);
          !e.logReadFiles ||
            b & 1 ||
            (J.tf || (J.tf = {}),
            a in J.tf ||
              ((J.tf[a] = 1),
              k("FS.trackingDelegate error on read file: " + a)));
          try {
            J.Xd.onOpenFile &&
              ((f = 0),
              1 !== (b & 2097155) && (f |= J.Yf.Vf.cg),
              0 !== (b & 2097155) && (f |= J.Yf.Vf.dg),
              J.Xd.onOpenFile(a, f));
          } catch (m) {
            k(
              "FS.trackingDelegate['onOpenFile']('" +
                a +
                "', flags) threw an exception: " +
                m.message,
            );
          }
          return d;
        },
        close: function (a) {
          if (J.He(a)) throw new J.Md(8);
          a.pe && (a.pe = null);
          try {
            a.Pd.close && a.Pd.close(a);
          } catch (b) {
            throw b;
          } finally {
            J.jg(a.fd);
          }
          a.fd = null;
        },
        He: function (a) {
          return null === a.fd;
        },
        ce: function (a, b, c) {
          if (J.He(a)) throw new J.Md(8);
          if (!a.seekable || !a.Pd.ce) throw new J.Md(70);
          if (0 != c && 1 != c && 2 != c) throw new J.Md(28);
          a.position = a.Pd.ce(a, b, c);
          a.Pg = [];
          return a.position;
        },
        read: function (a, b, c, d, f) {
          if (0 > d || 0 > f) throw new J.Md(28);
          if (J.He(a)) throw new J.Md(8);
          if (1 === (a.flags & 2097155)) throw new J.Md(8);
          if (J.Vd(a.node.mode)) throw new J.Md(31);
          if (!a.Pd.read) throw new J.Md(28);
          var g = "undefined" !== typeof f;
          if (!g) f = a.position;
          else if (!a.seekable) throw new J.Md(70);
          b = a.Pd.read(a, b, c, d, f);
          g || (a.position += b);
          return b;
        },
        write: function (a, b, c, d, f, g) {
          if (0 > d || 0 > f) throw new J.Md(28);
          if (J.He(a)) throw new J.Md(8);
          if (0 === (a.flags & 2097155)) throw new J.Md(8);
          if (J.Vd(a.node.mode)) throw new J.Md(31);
          if (!a.Pd.write) throw new J.Md(28);
          a.seekable && a.flags & 1024 && J.ce(a, 0, 2);
          var h = "undefined" !== typeof f;
          if (!h) f = a.position;
          else if (!a.seekable) throw new J.Md(70);
          b = a.Pd.write(a, b, c, d, f, g);
          h || (a.position += b);
          try {
            if (a.path && J.Xd.onWriteToFile) J.Xd.onWriteToFile(a.path);
          } catch (m) {
            k(
              "FS.trackingDelegate['onWriteToFile']('" +
                a.path +
                "') threw an exception: " +
                m.message,
            );
          }
          return b;
        },
        Ee: function (a, b, c) {
          if (J.He(a)) throw new J.Md(8);
          if (0 > b || 0 >= c) throw new J.Md(28);
          if (0 === (a.flags & 2097155)) throw new J.Md(8);
          if (!J.isFile(a.node.mode) && !J.Vd(a.node.mode)) throw new J.Md(43);
          if (!a.Pd.Ee) throw new J.Md(138);
          a.Pd.Ee(a, b, c);
        },
        xe: function (a, b, c, d, f, g) {
          if (0 !== (f & 2) && 0 === (g & 2) && 2 !== (a.flags & 2097155))
            throw new J.Md(2);
          if (1 === (a.flags & 2097155)) throw new J.Md(2);
          if (!a.Pd.xe) throw new J.Md(43);
          return a.Pd.xe(a, b, c, d, f, g);
        },
        ye: function (a, b, c, d, f) {
          return a && a.Pd.ye ? a.Pd.ye(a, b, c, d, f) : 0;
        },
        eh: function () {
          return 0;
        },
        we: function (a, b, c) {
          if (!a.Pd.we) throw new J.Md(59);
          return a.Pd.we(a, b, c);
        },
        readFile: function (a, b) {
          b = b || {};
          b.flags = b.flags || "r";
          b.encoding = b.encoding || "binary";
          if ("utf8" !== b.encoding && "binary" !== b.encoding)
            throw Error('Invalid encoding type "' + b.encoding + '"');
          var c,
            d = J.open(a, b.flags);
          a = J.stat(a).size;
          var f = new Uint8Array(a);
          J.read(d, f, 0, a, 0);
          "utf8" === b.encoding
            ? (c = Da(f, 0))
            : "binary" === b.encoding && (c = f);
          J.close(d);
          return c;
        },
        writeFile: function (a, b, c) {
          c = c || {};
          c.flags = c.flags || "w";
          a = J.open(a, c.flags, c.mode);
          if ("string" === typeof b) {
            var d = new Uint8Array(Ga(b) + 1);
            b = Ea(b, d, 0, d.length);
            J.write(a, d, 0, b, void 0, c.hg);
          } else if (ArrayBuffer.isView(b))
            J.write(a, b, 0, b.byteLength, void 0, c.hg);
          else throw Error("Unsupported data type");
          J.close(a);
        },
        cwd: function () {
          return J.Gf;
        },
        chdir: function (a) {
          a = J.Rd(a, { ee: !0 });
          if (null === a.node) throw new J.Md(44);
          if (!J.Vd(a.node.mode)) throw new J.Md(54);
          var b = J.oe(a.node, "x");
          if (b) throw new J.Md(b);
          J.Gf = a.path;
        },
        lg: function () {
          J.mkdir("/tmp");
          J.mkdir("/home");
          J.mkdir("/home/web_user");
        },
        kg: function () {
          J.mkdir("/dev");
          J.wf(J.se(1, 3), {
            read: function () {
              return 0;
            },
            write: function (b, c, d, f) {
              return f;
            },
          });
          J.Ue("/dev/null", J.se(1, 3));
          Gb(J.se(5, 0), Jb);
          Gb(J.se(6, 0), Kb);
          J.Ue("/dev/tty", J.se(5, 0));
          J.Ue("/dev/tty1", J.se(6, 0));
          var a = Cb();
          J.me("/dev", "random", a);
          J.me("/dev", "urandom", a);
          J.mkdir("/dev/shm");
          J.mkdir("/dev/shm/tmp");
        },
        ng: function () {
          J.mkdir("/proc");
          J.mkdir("/proc/self");
          J.mkdir("/proc/self/fd");
          J.Ud(
            {
              Ud: function () {
                var a = J.createNode("/proc/self", "fd", 16895, 73);
                a.Od = {
                  lookup: function (b, c) {
                    var d = J.ke(+c);
                    if (!d) throw new J.Md(8);
                    b = {
                      parent: null,
                      Ud: { Uf: "fake" },
                      Od: {
                        readlink: function () {
                          return d.path;
                        },
                      },
                    };
                    return (b.parent = b);
                  },
                };
                return a;
              },
            },
            {},
            "/proc/self/fd",
          );
        },
        og: function () {
          e.stdin
            ? J.me("/dev", "stdin", e.stdin)
            : J.symlink("/dev/tty", "/dev/stdin");
          e.stdout
            ? J.me("/dev", "stdout", null, e.stdout)
            : J.symlink("/dev/tty", "/dev/stdout");
          e.stderr
            ? J.me("/dev", "stderr", null, e.stderr)
            : J.symlink("/dev/tty1", "/dev/stderr");
          J.open("/dev/stdin", "r");
          J.open("/dev/stdout", "w");
          J.open("/dev/stderr", "w");
        },
        If: function () {
          J.Md ||
            ((J.Md = function (a, b) {
              this.node = b;
              this.Jg = function (c) {
                this.Qd = c;
              };
              this.Jg(a);
              this.message = "FS error";
            }),
            (J.Md.prototype = Error()),
            (J.Md.prototype.constructor = J.Md),
            [44].forEach(function (a) {
              J.hf[a] = new J.Md(a);
              J.hf[a].stack = "<generic error, no stack>";
            }));
        },
        Kg: function () {
          J.If();
          J.ie = Array(4096);
          J.Ud(K, {}, "/");
          J.lg();
          J.kg();
          J.ng();
          J.qg = { MEMFS: K };
        },
        Fe: function (a, b, c) {
          J.Fe.lf = !0;
          J.If();
          e.stdin = a || e.stdin;
          e.stdout = b || e.stdout;
          e.stderr = c || e.stderr;
          J.og();
        },
        quit: function () {
          J.Fe.lf = !1;
          var a = e._fflush;
          a && a(0);
          for (a = 0; a < J.streams.length; a++) {
            var b = J.streams[a];
            b && J.close(b);
          }
        },
        jf: function (a, b) {
          var c = 0;
          a && (c |= 365);
          b && (c |= 146);
          return c;
        },
        Vg: function (a, b) {
          a = J.ef(a, b);
          if (a.exists) return a.object;
          mb(a.error);
          return null;
        },
        ef: function (a, b) {
          try {
            var c = J.Rd(a, { ee: !b });
            a = c.path;
          } catch (f) {}
          var d = {
            Se: !1,
            exists: !1,
            error: 0,
            name: null,
            path: null,
            object: null,
            Dg: !1,
            Fg: null,
            Eg: null,
          };
          try {
            (c = J.Rd(a, { parent: !0 })),
              (d.Dg = !0),
              (d.Fg = c.path),
              (d.Eg = c.node),
              (d.name = zb(a)),
              (c = J.Rd(a, { ee: !b })),
              (d.exists = !0),
              (d.path = c.path),
              (d.object = c.node),
              (d.name = c.node.name),
              (d.Se = "/" === c.path);
          } catch (f) {
            d.error = f.Qd;
          }
          return d;
        },
        Tg: function (a, b) {
          a = "string" === typeof a ? a : J.ne(a);
          for (b = b.split("/").reverse(); b.length; ) {
            var c = b.pop();
            if (c) {
              var d = Ab(a, c);
              try {
                J.mkdir(d);
              } catch (f) {}
              a = d;
            }
          }
          return d;
        },
        mg: function (a, b, c, d, f) {
          a = Ab("string" === typeof a ? a : J.ne(a), b);
          return J.create(a, J.jf(d, f));
        },
        Ef: function (a, b, c, d, f, g) {
          a = b ? Ab("string" === typeof a ? a : J.ne(a), b) : a;
          d = J.jf(d, f);
          f = J.create(a, d);
          if (c) {
            if ("string" === typeof c) {
              a = Array(c.length);
              b = 0;
              for (var h = c.length; b < h; ++b) a[b] = c.charCodeAt(b);
              c = a;
            }
            J.chmod(f, d | 146);
            a = J.open(f, "w");
            J.write(a, c, 0, c.length, 0, g);
            J.close(a);
            J.chmod(f, d);
          }
          return f;
        },
        me: function (a, b, c, d) {
          a = Ab("string" === typeof a ? a : J.ne(a), b);
          b = J.jf(!!c, !!d);
          J.me.pf || (J.me.pf = 64);
          var f = J.se(J.me.pf++, 0);
          J.wf(f, {
            open: function (g) {
              g.seekable = !1;
            },
            close: function () {
              d && d.buffer && d.buffer.length && d(10);
            },
            read: function (g, h, m, r) {
              for (var q = 0, t = 0; t < r; t++) {
                try {
                  var v = c();
                } catch (C) {
                  throw new J.Md(29);
                }
                if (void 0 === v && 0 === q) throw new J.Md(6);
                if (null === v || void 0 === v) break;
                q++;
                h[m + t] = v;
              }
              q && (g.node.timestamp = Date.now());
              return q;
            },
            write: function (g, h, m, r) {
              for (var q = 0; q < r; q++)
                try {
                  d(h[m + q]);
                } catch (t) {
                  throw new J.Md(29);
                }
              r && (g.node.timestamp = Date.now());
              return q;
            },
          });
          return J.Ue(a, b, f);
        },
        Lf: function (a) {
          if (a.mf || a.wg || a.link || a.Nd) return !0;
          var b = !0;
          if ("undefined" !== typeof XMLHttpRequest)
            throw Error(
              "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
            );
          if (pa)
            try {
              (a.Nd = Ib(pa(a.url), !0)), (a.Sd = a.Nd.length);
            } catch (c) {
              b = !1;
            }
          else throw Error("Cannot load without read() or XMLHttpRequest.");
          b || mb(29);
          return b;
        },
        Sg: function (a, b, c, d, f) {
          function g() {
            this.nf = !1;
            this.ve = [];
          }
          g.prototype.get = function (q) {
            if (!(q > this.length - 1 || 0 > q)) {
              var t = q % this.chunkSize;
              return this.Pf((q / this.chunkSize) | 0)[t];
            }
          };
          g.prototype.bg = function (q) {
            this.Pf = q;
          };
          g.prototype.Cf = function () {
            var q = new XMLHttpRequest();
            q.open("HEAD", c, !1);
            q.send(null);
            if (!((200 <= q.status && 300 > q.status) || 304 === q.status))
              throw Error("Couldn't load " + c + ". Status: " + q.status);
            var t = Number(q.getResponseHeader("Content-length")),
              v,
              C = (v = q.getResponseHeader("Accept-Ranges")) && "bytes" === v;
            q = (v = q.getResponseHeader("Content-Encoding")) && "gzip" === v;
            var p = 1048576;
            C || (p = t);
            var u = this;
            u.bg(function (w) {
              var E = w * p,
                Q = (w + 1) * p - 1;
              Q = Math.min(Q, t - 1);
              if ("undefined" === typeof u.ve[w]) {
                var Bb = u.ve;
                if (E > Q)
                  throw Error(
                    "invalid range (" +
                      E +
                      ", " +
                      Q +
                      ") or no bytes requested!",
                  );
                if (Q > t - 1)
                  throw Error(
                    "only " + t + " bytes available! programmer error!",
                  );
                var S = new XMLHttpRequest();
                S.open("GET", c, !1);
                t !== p && S.setRequestHeader("Range", "bytes=" + E + "-" + Q);
                "undefined" != typeof Uint8Array &&
                  (S.responseType = "arraybuffer");
                S.overrideMimeType &&
                  S.overrideMimeType("text/plain; charset=x-user-defined");
                S.send(null);
                if (!((200 <= S.status && 300 > S.status) || 304 === S.status))
                  throw Error("Couldn't load " + c + ". Status: " + S.status);
                E =
                  void 0 !== S.response
                    ? new Uint8Array(S.response || [])
                    : Ib(S.responseText || "", !0);
                Bb[w] = E;
              }
              if ("undefined" === typeof u.ve[w]) throw Error("doXHR failed!");
              return u.ve[w];
            });
            if (q || !t)
              (p = t = 1),
                (p = t = this.Pf(0).length),
                ea(
                  "LazyFiles on gzip forces download of the whole file when length is accessed",
                );
            this.fg = t;
            this.eg = p;
            this.nf = !0;
          };
          if ("undefined" !== typeof XMLHttpRequest) {
            if (!ma)
              throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var h = new g();
            Object.defineProperties(h, {
              length: {
                get: function () {
                  this.nf || this.Cf();
                  return this.fg;
                },
              },
              chunkSize: {
                get: function () {
                  this.nf || this.Cf();
                  return this.eg;
                },
              },
            });
            h = { mf: !1, Nd: h };
          } else h = { mf: !1, url: c };
          var m = J.mg(a, b, h, d, f);
          h.Nd ? (m.Nd = h.Nd) : h.url && ((m.Nd = null), (m.url = h.url));
          Object.defineProperties(m, {
            Sd: {
              get: function () {
                return this.Nd.length;
              },
            },
          });
          var r = {};
          Object.keys(m.Pd).forEach(function (q) {
            var t = m.Pd[q];
            r[q] = function () {
              if (!J.Lf(m)) throw new J.Md(29);
              return t.apply(null, arguments);
            };
          });
          r.read = function (q, t, v, C, p) {
            if (!J.Lf(m)) throw new J.Md(29);
            q = q.node.Nd;
            if (p >= q.length) return 0;
            C = Math.min(q.length - p, C);
            if (q.slice) for (var u = 0; u < C; u++) t[v + u] = q[p + u];
            else for (u = 0; u < C; u++) t[v + u] = q.get(p + u);
            return C;
          };
          m.Pd = r;
          return m;
        },
        Ug: function (a, b, c, d, f, g, h, m, r, q) {
          function t(C) {
            function p(w) {
              q && q();
              m || J.Ef(a, b, w, d, f, r);
              g && g();
              cb();
            }
            var u = !1;
            e.preloadPlugins.forEach(function (w) {
              !u &&
                w.canHandle(v) &&
                (w.handle(C, v, p, function () {
                  h && h();
                  cb();
                }),
                (u = !0));
            });
            u || p(C);
          }
          Lb.Fe();
          var v = b ? Db(Ab(a, b)) : a;
          bb();
          "string" == typeof c
            ? Lb.Qg(
                c,
                function (C) {
                  t(C);
                },
                h,
              )
            : t(c);
        },
        indexedDB: function () {
          return (
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB
          );
        },
        yf: function () {
          return "EM_FS_" + window.location.pathname;
        },
        zf: 20,
        De: "FILE_DATA",
        gh: function (a, b, c) {
          b = b || function () {};
          c = c || function () {};
          var d = J.indexedDB();
          try {
            var f = d.open(J.yf(), J.zf);
          } catch (g) {
            return c(g);
          }
          f.onupgradeneeded = function () {
            ea("creating db");
            f.result.createObjectStore(J.De);
          };
          f.onsuccess = function () {
            var g = f.result.transaction([J.De], "readwrite"),
              h = g.objectStore(J.De),
              m = 0,
              r = 0,
              q = a.length;
            a.forEach(function (t) {
              t = h.put(J.ef(t).object.Nd, t);
              t.onsuccess = function () {
                m++;
                m + r == q && (0 == r ? b() : c());
              };
              t.onerror = function () {
                r++;
                m + r == q && (0 == r ? b() : c());
              };
            });
            g.onerror = c;
          };
          f.onerror = c;
        },
        ah: function (a, b, c) {
          b = b || function () {};
          c = c || function () {};
          var d = J.indexedDB();
          try {
            var f = d.open(J.yf(), J.zf);
          } catch (g) {
            return c(g);
          }
          f.onupgradeneeded = c;
          f.onsuccess = function () {
            var g = f.result;
            try {
              var h = g.transaction([J.De], "readonly");
            } catch (v) {
              c(v);
              return;
            }
            var m = h.objectStore(J.De),
              r = 0,
              q = 0,
              t = a.length;
            a.forEach(function (v) {
              var C = m.get(v);
              C.onsuccess = function () {
                J.ef(v).exists && J.unlink(v);
                J.Ef(yb(v), zb(v), C.result, !0, !0, !0);
                r++;
                r + q == t && (0 == q ? b() : c());
              };
              C.onerror = function () {
                q++;
                r + q == t && (0 == q ? b() : c());
              };
            });
            h.onerror = c;
          };
          f.onerror = c;
        },
      },
      Mb = {};
    function Nb(a, b, c) {
      try {
        var d = a(b);
      } catch (f) {
        if (f && f.node && xb(b) !== xb(J.ne(f.node))) return -54;
        throw f;
      }
      D[c >> 2] = d.dev;
      D[(c + 4) >> 2] = 0;
      D[(c + 8) >> 2] = d.ino;
      D[(c + 12) >> 2] = d.mode;
      D[(c + 16) >> 2] = d.nlink;
      D[(c + 20) >> 2] = d.uid;
      D[(c + 24) >> 2] = d.gid;
      D[(c + 28) >> 2] = d.rdev;
      D[(c + 32) >> 2] = 0;
      I = [
        d.size >>> 0,
        ((H = d.size),
        1 <= +Math.abs(H)
          ? 0 < H
            ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      D[(c + 40) >> 2] = I[0];
      D[(c + 44) >> 2] = I[1];
      D[(c + 48) >> 2] = 4096;
      D[(c + 52) >> 2] = d.blocks;
      D[(c + 56) >> 2] = (d.atime.getTime() / 1e3) | 0;
      D[(c + 60) >> 2] = 0;
      D[(c + 64) >> 2] = (d.mtime.getTime() / 1e3) | 0;
      D[(c + 68) >> 2] = 0;
      D[(c + 72) >> 2] = (d.ctime.getTime() / 1e3) | 0;
      D[(c + 76) >> 2] = 0;
      I = [
        d.ino >>> 0,
        ((H = d.ino),
        1 <= +Math.abs(H)
          ? 0 < H
            ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      D[(c + 80) >> 2] = I[0];
      D[(c + 84) >> 2] = I[1];
      return 0;
    }
    var Ob = void 0;
    function L() {
      Ob += 4;
      return D[(Ob - 4) >> 2];
    }
    function Pb(a) {
      a = J.ke(a);
      if (!a) throw new J.Md(8);
      return a;
    }
    var M = {
      Ud: function () {
        e.websocket =
          e.websocket && "object" === typeof e.websocket ? e.websocket : {};
        e.websocket.cf = {};
        e.websocket.on = function (a, b) {
          "function" === typeof b && (this.cf[a] = b);
          return this;
        };
        e.websocket.emit = function (a, b) {
          "function" === typeof this.cf[a] && this.cf[a].call(this, b);
        };
        return J.createNode(null, "/", 16895, 0);
      },
      createSocket: function (a, b, c) {
        b &= -526337;
        c && assert((1 == b) == (6 == c));
        a = {
          family: a,
          type: b,
          protocol: c,
          Wd: null,
          error: null,
          Me: {},
          pending: [],
          Ae: [],
          Zd: M.$d,
        };
        b = M.Ve();
        c = J.createNode(M.root, b, 49152, 0);
        c.Be = a;
        b = J.Ff({
          path: b,
          node: c,
          flags: J.Tf("r+"),
          seekable: !1,
          Pd: M.Pd,
        });
        a.stream = b;
        return a;
      },
      tg: function (a) {
        return (a = J.ke(a)) && J.isSocket(a.node.mode) ? a.node.Be : null;
      },
      Pd: {
        We: function (a) {
          a = a.node.Be;
          return a.Zd.We(a);
        },
        we: function (a, b, c) {
          a = a.node.Be;
          return a.Zd.we(a, b, c);
        },
        read: function (a, b, c, d) {
          a = a.node.Be;
          d = a.Zd.vf(a, d);
          if (!d) return 0;
          b.set(d.buffer, c);
          return d.buffer.length;
        },
        write: function (a, b, c, d) {
          a = a.node.Be;
          return a.Zd.xf(a, b, c, d);
        },
        close: function (a) {
          a = a.node.Be;
          a.Zd.close(a);
        },
      },
      Ve: function () {
        M.Ve.current || (M.Ve.current = 0);
        return "socket[" + M.Ve.current++ + "]";
      },
      $d: {
        Pe: function (a, b, c) {
          if ("object" === typeof b) {
            var d = b;
            c = b = null;
          }
          if (d)
            if (d._socket)
              (b = d._socket.remoteAddress), (c = d._socket.remotePort);
            else {
              c = /ws[s]?:\/\/([^:]+):(\d+)/.exec(d.url);
              if (!c)
                throw Error(
                  "WebSocket URL must be in the format ws(s)://address:port",
                );
              b = c[1];
              c = parseInt(c[2], 10);
            }
          else
            try {
              var f = e.websocket && "object" === typeof e.websocket,
                g = "ws:#".replace("#", "//");
              f && "string" === typeof e.websocket.url && (g = e.websocket.url);
              if ("ws://" === g || "wss://" === g) {
                var h = b.split("/");
                g = g + h[0] + ":" + c + "/" + h.slice(1).join("/");
              }
              h = "binary";
              f &&
                "string" === typeof e.websocket.subprotocol &&
                (h = e.websocket.subprotocol);
              var m = void 0;
              "null" !== h &&
                ((h = h.replace(/^ +| +$/g, "").split(/ *, */)),
                (m = na ? { protocol: h.toString() } : h));
              f && null === e.websocket.subprotocol && (m = void 0);
              d = new (na ? require("ws") : WebSocket)(g, m);
              d.binaryType = "arraybuffer";
            } catch (r) {
              throw new J.Md(23);
            }
          b = { Td: b, port: c, socket: d, Qe: [] };
          M.$d.Bf(a, b);
          M.$d.ug(a, b);
          2 === a.type &&
            "undefined" !== typeof a.ue &&
            b.Qe.push(
              new Uint8Array([
                255,
                255,
                255,
                255,
                112,
                111,
                114,
                116,
                (a.ue & 65280) >> 8,
                a.ue & 255,
              ]),
            );
          return b;
        },
        Re: function (a, b, c) {
          return a.Me[b + ":" + c];
        },
        Bf: function (a, b) {
          a.Me[b.Td + ":" + b.port] = b;
        },
        Wf: function (a, b) {
          delete a.Me[b.Td + ":" + b.port];
        },
        ug: function (a, b) {
          function c() {
            e.websocket.emit("open", a.stream.fd);
            try {
              for (var g = b.Qe.shift(); g; )
                b.socket.send(g), (g = b.Qe.shift());
            } catch (h) {
              b.socket.close();
            }
          }
          function d(g) {
            if ("string" === typeof g) g = new TextEncoder().encode(g);
            else {
              assert(void 0 !== g.byteLength);
              if (0 == g.byteLength) return;
              g = new Uint8Array(g);
            }
            var h = f;
            f = !1;
            h &&
            10 === g.length &&
            255 === g[0] &&
            255 === g[1] &&
            255 === g[2] &&
            255 === g[3] &&
            112 === g[4] &&
            111 === g[5] &&
            114 === g[6] &&
            116 === g[7]
              ? ((g = (g[8] << 8) | g[9]),
                M.$d.Wf(a, b),
                (b.port = g),
                M.$d.Bf(a, b))
              : (a.Ae.push({ Td: b.Td, port: b.port, data: g }),
                e.websocket.emit("message", a.stream.fd));
          }
          var f = !0;
          na
            ? (b.socket.on("open", c),
              b.socket.on("message", function (g, h) {
                h.Rg && d(new Uint8Array(g).buffer);
              }),
              b.socket.on("close", function () {
                e.websocket.emit("close", a.stream.fd);
              }),
              b.socket.on("error", function () {
                a.error = 14;
                e.websocket.emit("error", [
                  a.stream.fd,
                  a.error,
                  "ECONNREFUSED: Connection refused",
                ]);
              }))
            : ((b.socket.onopen = c),
              (b.socket.onclose = function () {
                e.websocket.emit("close", a.stream.fd);
              }),
              (b.socket.onmessage = function (g) {
                d(g.data);
              }),
              (b.socket.onerror = function () {
                a.error = 14;
                e.websocket.emit("error", [
                  a.stream.fd,
                  a.error,
                  "ECONNREFUSED: Connection refused",
                ]);
              }));
        },
        We: function (a) {
          if (1 === a.type && a.Wd) return a.pending.length ? 65 : 0;
          var b = 0,
            c = 1 === a.type ? M.$d.Re(a, a.be, a.de) : null;
          if (
            a.Ae.length ||
            !c ||
            (c && c.socket.readyState === c.socket.CLOSING) ||
            (c && c.socket.readyState === c.socket.CLOSED)
          )
            b |= 65;
          if (!c || (c && c.socket.readyState === c.socket.OPEN)) b |= 4;
          if (
            (c && c.socket.readyState === c.socket.CLOSING) ||
            (c && c.socket.readyState === c.socket.CLOSED)
          )
            b |= 16;
          return b;
        },
        we: function (a, b, c) {
          switch (b) {
            case 21531:
              return (
                (b = 0),
                a.Ae.length && (b = a.Ae[0].data.length),
                (D[c >> 2] = b),
                0
              );
            default:
              return 28;
          }
        },
        close: function (a) {
          if (a.Wd) {
            try {
              a.Wd.close();
            } catch (f) {}
            a.Wd = null;
          }
          for (var b = Object.keys(a.Me), c = 0; c < b.length; c++) {
            var d = a.Me[b[c]];
            try {
              d.socket.close();
            } catch (f) {}
            M.$d.Wf(a, d);
          }
          return 0;
        },
        bind: function (a, b, c) {
          if ("undefined" !== typeof a.Xe || "undefined" !== typeof a.ue)
            throw new J.Md(28);
          a.Xe = b;
          a.ue = c;
          if (2 === a.type) {
            a.Wd && (a.Wd.close(), (a.Wd = null));
            try {
              a.Zd.listen(a, 0);
            } catch (d) {
              if (!(d instanceof J.Md)) throw d;
              if (138 !== d.Qd) throw d;
            }
          }
        },
        connect: function (a, b, c) {
          if (a.Wd) throw new J.Md(138);
          if ("undefined" !== typeof a.be && "undefined" !== typeof a.de) {
            var d = M.$d.Re(a, a.be, a.de);
            if (d) {
              if (d.socket.readyState === d.socket.CONNECTING)
                throw new J.Md(7);
              throw new J.Md(30);
            }
          }
          b = M.$d.Pe(a, b, c);
          a.be = b.Td;
          a.de = b.port;
          throw new J.Md(26);
        },
        listen: function (a) {
          if (!na) throw new J.Md(138);
          if (a.Wd) throw new J.Md(28);
          var b = require("ws").Server;
          a.Wd = new b({ host: a.Xe, port: a.ue });
          e.websocket.emit("listen", a.stream.fd);
          a.Wd.on("connection", function (c) {
            if (1 === a.type) {
              var d = M.createSocket(a.family, a.type, a.protocol);
              c = M.$d.Pe(d, c);
              d.be = c.Td;
              d.de = c.port;
              a.pending.push(d);
              e.websocket.emit("connection", d.stream.fd);
            } else M.$d.Pe(a, c), e.websocket.emit("connection", a.stream.fd);
          });
          a.Wd.on("closed", function () {
            e.websocket.emit("close", a.stream.fd);
            a.Wd = null;
          });
          a.Wd.on("error", function () {
            a.error = 23;
            e.websocket.emit("error", [
              a.stream.fd,
              a.error,
              "EHOSTUNREACH: Host is unreachable",
            ]);
          });
        },
        accept: function (a) {
          if (!a.Wd) throw new J.Md(28);
          var b = a.pending.shift();
          b.stream.flags = a.stream.flags;
          return b;
        },
        Zg: function (a, b) {
          if (b) {
            if (void 0 === a.be || void 0 === a.de) throw new J.Md(53);
            b = a.be;
            a = a.de;
          } else (b = a.Xe || 0), (a = a.ue || 0);
          return { Td: b, port: a };
        },
        xf: function (a, b, c, d, f, g) {
          if (2 === a.type) {
            if (void 0 === f || void 0 === g) (f = a.be), (g = a.de);
            if (void 0 === f || void 0 === g) throw new J.Md(17);
          } else (f = a.be), (g = a.de);
          var h = M.$d.Re(a, f, g);
          if (1 === a.type) {
            if (
              !h ||
              h.socket.readyState === h.socket.CLOSING ||
              h.socket.readyState === h.socket.CLOSED
            )
              throw new J.Md(53);
            if (h.socket.readyState === h.socket.CONNECTING) throw new J.Md(6);
          }
          ArrayBuffer.isView(b) && ((c += b.byteOffset), (b = b.buffer));
          b = b.slice(c, c + d);
          if (2 === a.type && (!h || h.socket.readyState !== h.socket.OPEN))
            return (
              (h &&
                h.socket.readyState !== h.socket.CLOSING &&
                h.socket.readyState !== h.socket.CLOSED) ||
                (h = M.$d.Pe(a, f, g)),
              h.Qe.push(b),
              d
            );
          try {
            return h.socket.send(b), d;
          } catch (m) {
            throw new J.Md(28);
          }
        },
        vf: function (a, b) {
          if (1 === a.type && a.Wd) throw new J.Md(53);
          var c = a.Ae.shift();
          if (!c) {
            if (1 === a.type) {
              if ((a = M.$d.Re(a, a.be, a.de))) {
                if (
                  a.socket.readyState === a.socket.CLOSING ||
                  a.socket.readyState === a.socket.CLOSED
                )
                  return null;
                throw new J.Md(6);
              }
              throw new J.Md(53);
            }
            throw new J.Md(6);
          }
          var d = c.data.byteLength || c.data.length,
            f = c.data.byteOffset || 0,
            g = c.data.buffer || c.data;
          b = Math.min(b, d);
          var h = { buffer: new Uint8Array(g, f, b), Td: c.Td, port: c.port };
          1 === a.type &&
            b < d &&
            ((c.data = new Uint8Array(g, f + b, d - b)), a.Ae.unshift(c));
          return h;
        },
      },
    };
    function Qb(a) {
      a = a.split(".");
      for (var b = 0; 4 > b; b++) {
        var c = Number(a[b]);
        if (isNaN(c)) return null;
        a[b] = c;
      }
      return (a[0] | (a[1] << 8) | (a[2] << 16) | (a[3] << 24)) >>> 0;
    }
    function Ub(a) {
      var b,
        c,
        d = [];
      if (
        !/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i.test(
          a,
        )
      )
        return null;
      if ("::" === a) return [0, 0, 0, 0, 0, 0, 0, 0];
      a =
        0 === a.indexOf("::") ? a.replace("::", "Z:") : a.replace("::", ":Z:");
      0 < a.indexOf(".")
        ? ((a = a.replace(/[.]/g, ":")),
          (a = a.split(":")),
          (a[a.length - 4] =
            parseInt(a[a.length - 4]) + 256 * parseInt(a[a.length - 3])),
          (a[a.length - 3] =
            parseInt(a[a.length - 2]) + 256 * parseInt(a[a.length - 1])),
          (a = a.slice(0, a.length - 2)))
        : (a = a.split(":"));
      for (b = c = 0; b < a.length; b++)
        if ("string" === typeof a[b])
          if ("Z" === a[b]) {
            for (c = 0; c < 8 - a.length + 1; c++) d[b + c] = 0;
            --c;
          } else d[b + c] = Vb(parseInt(a[b], 16));
        else d[b + c] = a[b];
      return [
        (d[1] << 16) | d[0],
        (d[3] << 16) | d[2],
        (d[5] << 16) | d[4],
        (d[7] << 16) | d[6],
      ];
    }
    var Wb = 1,
      Xb = {},
      Yb = {};
    function Zb(a) {
      var b = Qb(a);
      if (null !== b) return a;
      b = Ub(a);
      if (null !== b) return a;
      Xb[a]
        ? (b = Xb[a])
        : ((b = Wb++),
          assert(65535 > b, "exceeded max address mappings of 65535"),
          (b = "172.29." + (b & 255) + "." + (b & 65280)),
          (Yb[b] = a),
          (Xb[a] = b));
      return b;
    }
    function $b(a) {
      return Yb[a] ? Yb[a] : null;
    }
    function ac(a) {
      return (
        (a & 255) +
        "." +
        ((a >> 8) & 255) +
        "." +
        ((a >> 16) & 255) +
        "." +
        ((a >> 24) & 255)
      );
    }
    function bc(a) {
      var b = "",
        c,
        d = 0,
        f = 0,
        g = 0,
        h = 0;
      a = [
        a[0] & 65535,
        a[0] >> 16,
        a[1] & 65535,
        a[1] >> 16,
        a[2] & 65535,
        a[2] >> 16,
        a[3] & 65535,
        a[3] >> 16,
      ];
      var m = !0;
      for (c = 0; 5 > c; c++)
        if (0 !== a[c]) {
          m = !1;
          break;
        }
      if (m) {
        c = ac(a[6] | (a[7] << 16));
        if (-1 === a[5]) return "::ffff:" + c;
        if (0 === a[5])
          return (
            "0.0.0.0" === c && (c = ""), "0.0.0.1" === c && (c = "1"), "::" + c
          );
      }
      for (c = 0; 8 > c; c++)
        0 === a[c] && (1 < c - f && (h = 0), (f = c), h++),
          h > d && ((d = h), (g = c - d + 1));
      for (c = 0; 8 > c; c++)
        1 < d && 0 === a[c] && c >= g && c < g + d
          ? c === g && ((b += ":"), 0 === g && (b += ":"))
          : ((b += Number(cc(a[c] & 65535)).toString(16)),
            (b += 7 > c ? ":" : ""));
      return b;
    }
    function dc(a, b) {
      var c = Ma[a >> 1],
        d = cc(Na[(a + 2) >> 1]);
      switch (c) {
        case 2:
          if (16 !== b) return { Qd: 28 };
          a = D[(a + 4) >> 2];
          a = ac(a);
          break;
        case 10:
          if (28 !== b) return { Qd: 28 };
          a = [
            D[(a + 8) >> 2],
            D[(a + 12) >> 2],
            D[(a + 16) >> 2],
            D[(a + 20) >> 2],
          ];
          a = bc(a);
          break;
        default:
          return { Qd: 5 };
      }
      return { family: c, Td: a, port: d };
    }
    function ec(a, b, c, d) {
      switch (b) {
        case 2:
          c = Qb(c);
          Ma[a >> 1] = b;
          D[(a + 4) >> 2] = c;
          Ma[(a + 2) >> 1] = Vb(d);
          break;
        case 10:
          c = Ub(c);
          D[a >> 2] = b;
          D[(a + 8) >> 2] = c[0];
          D[(a + 12) >> 2] = c[1];
          D[(a + 16) >> 2] = c[2];
          D[(a + 20) >> 2] = c[3];
          Ma[(a + 2) >> 1] = Vb(d);
          D[(a + 4) >> 2] = 0;
          D[(a + 24) >> 2] = 0;
          break;
        default:
          return { Qd: 5 };
      }
      return {};
    }
    function fc() {
      void 0 === fc.start && (fc.start = Date.now());
      return (1e3 * (Date.now() - fc.start)) | 0;
    }
    var hc = 1,
      ic = [],
      N = [],
      jc = [],
      kc = [],
      lc = [],
      P = [],
      R = [],
      mc = [],
      T = [],
      nc = {},
      oc = {},
      pc = 4;
    function V(a) {
      qc || (qc = a);
    }
    function rc(a) {
      for (var b = hc++, c = a.length; c < b; c++) a[c] = null;
      return b;
    }
    var qc,
      sc = [];
    function tc(a, b, c, d) {
      for (var f = 0; f < a; f++) {
        var g = W[c](),
          h = g && rc(d);
        g ? ((g.name = h), (d[h] = g)) : V(1282);
        D[(b + 4 * f) >> 2] = h;
      }
    }
    function uc(a, b, c, d, f, g, h, m) {
      b = N[b];
      if ((a = W[a](b, c)))
        (d = m && Ba(a.name, m, d)),
          f && (D[f >> 2] = d),
          g && (D[g >> 2] = a.size),
          h && (D[h >> 2] = a.type);
    }
    function vc(a, b) {
      Oa[a >> 2] = b;
      Oa[(a + 4) >> 2] = (b - Oa[a >> 2]) / 4294967296;
    }
    function wc(a, b, c) {
      if (b) {
        var d = void 0;
        switch (a) {
          case 36346:
            d = 1;
            break;
          case 36344:
            0 != c && 1 != c && V(1280);
            return;
          case 36345:
            d = 0;
            break;
          case 34466:
            var f = W.getParameter(34467);
            d = f ? f.length : 0;
        }
        if (void 0 === d)
          switch (((f = W.getParameter(a)), typeof f)) {
            case "number":
              d = f;
              break;
            case "boolean":
              d = f ? 1 : 0;
              break;
            case "string":
              V(1280);
              return;
            case "object":
              if (null === f)
                switch (a) {
                  case 34964:
                  case 35725:
                  case 34965:
                  case 36006:
                  case 36007:
                  case 32873:
                  case 34229:
                  case 34068:
                    d = 0;
                    break;
                  default:
                    V(1280);
                    return;
                }
              else {
                if (
                  f instanceof Float32Array ||
                  f instanceof Uint32Array ||
                  f instanceof Int32Array ||
                  f instanceof Array
                ) {
                  for (a = 0; a < f.length; ++a)
                    switch (c) {
                      case 0:
                        D[(b + 4 * a) >> 2] = f[a];
                        break;
                      case 2:
                        F[(b + 4 * a) >> 2] = f[a];
                        break;
                      case 4:
                        x[(b + a) >> 0] = f[a] ? 1 : 0;
                    }
                  return;
                }
                try {
                  d = f.name | 0;
                } catch (g) {
                  V(1280);
                  k(
                    "GL_INVALID_ENUM in glGet" +
                      c +
                      "v: Unknown object returned from WebGL getParameter(" +
                      a +
                      ")! (error: " +
                      g +
                      ")",
                  );
                  return;
                }
              }
              break;
            default:
              V(1280);
              k(
                "GL_INVALID_ENUM in glGet" +
                  c +
                  "v: Native code calling glGet" +
                  c +
                  "v(" +
                  a +
                  ") and it returns " +
                  f +
                  " of type " +
                  typeof f +
                  "!",
              );
              return;
          }
        switch (c) {
          case 1:
            vc(b, d);
            break;
          case 0:
            D[b >> 2] = d;
            break;
          case 2:
            F[b >> 2] = d;
            break;
          case 4:
            x[b >> 0] = d ? 1 : 0;
        }
      } else V(1281);
    }
    function xc(a) {
      var b = Ga(a) + 1,
        c = Ia(b);
      Ba(a, c, b);
      return c;
    }
    function yc(a, b, c, d) {
      if (c)
        if (
          ((a = W.getUniform(N[a], P[b])),
          "number" == typeof a || "boolean" == typeof a)
        )
          switch (d) {
            case 0:
              D[c >> 2] = a;
              break;
            case 2:
              F[c >> 2] = a;
          }
        else
          for (b = 0; b < a.length; b++)
            switch (d) {
              case 0:
                D[(c + 4 * b) >> 2] = a[b];
                break;
              case 2:
                F[(c + 4 * b) >> 2] = a[b];
            }
      else V(1281);
    }
    function zc(a, b, c, d) {
      if (c)
        if (((a = W.getVertexAttrib(a, b)), 34975 == b))
          D[c >> 2] = a && a.name;
        else if ("number" == typeof a || "boolean" == typeof a)
          switch (d) {
            case 0:
              D[c >> 2] = a;
              break;
            case 2:
              F[c >> 2] = a;
              break;
            case 5:
              D[c >> 2] = Math.fround(a);
          }
        else
          for (b = 0; b < a.length; b++)
            switch (d) {
              case 0:
                D[(c + 4 * b) >> 2] = a[b];
                break;
              case 2:
                F[(c + 4 * b) >> 2] = a[b];
                break;
              case 5:
                D[(c + 4 * b) >> 2] = Math.fround(a[b]);
            }
      else V(1281);
    }
    function Ac(a, b, c, d, f) {
      a -= 5120;
      a = 1 == a ? B : 4 == a ? D : 6 == a ? F : 5 == a || 28922 == a ? Oa : Na;
      var g = 31 - Math.clz32(a.BYTES_PER_ELEMENT),
        h = pc;
      return a.subarray(
        f >> g,
        (f +
          d *
            ((c *
              ({ 5: 3, 6: 4, 8: 2, 29502: 3, 29504: 4 }[b - 6402] || 1) *
              (1 << g) +
              h -
              1) &
              -h)) >>
          g,
      );
    }
    var Bc = [],
      Cc = [],
      Dc = {};
    function Ec() {
      if (!Fc) {
        var a = {
            USER: "web_user",
            LOGNAME: "web_user",
            PATH: "/",
            PWD: "/",
            HOME: "/home/web_user",
            LANG:
              (
                ("object" === typeof navigator &&
                  navigator.languages &&
                  navigator.languages[0]) ||
                "C"
              ).replace("-", "_") + ".UTF-8",
            _: ja || "./this.program",
          },
          b;
        for (b in Dc) a[b] = Dc[b];
        var c = [];
        for (b in a) c.push(b + "=" + a[b]);
        Fc = c;
      }
      return Fc;
    }
    var Fc,
      X = {};
    function Gc(a) {
      Gc.buffer ||
        ((Gc.buffer = Ia(256)),
        (X["0"] = "Success"),
        (X["-1"] = "Invalid value for 'ai_flags' field"),
        (X["-2"] = "NAME or SERVICE is unknown"),
        (X["-3"] = "Temporary failure in name resolution"),
        (X["-4"] = "Non-recoverable failure in name res"),
        (X["-6"] = "'ai_family' not supported"),
        (X["-7"] = "'ai_socktype' not supported"),
        (X["-8"] = "SERVICE not supported for 'ai_socktype'"),
        (X["-10"] = "Memory allocation failure"),
        (X["-11"] = "System error returned in 'errno'"),
        (X["-12"] = "Argument buffer overflow"));
      var b = "Unknown error";
      a in X && (255 < X[a].length ? (b = "Message too long") : (b = X[a]));
      Ka(b, Gc.buffer);
      return Gc.buffer;
    }
    function Hc(a, b) {
      a = new Date(1e3 * D[a >> 2]);
      D[b >> 2] = a.getUTCSeconds();
      D[(b + 4) >> 2] = a.getUTCMinutes();
      D[(b + 8) >> 2] = a.getUTCHours();
      D[(b + 12) >> 2] = a.getUTCDate();
      D[(b + 16) >> 2] = a.getUTCMonth();
      D[(b + 20) >> 2] = a.getUTCFullYear() - 1900;
      D[(b + 24) >> 2] = a.getUTCDay();
      D[(b + 36) >> 2] = 0;
      D[(b + 32) >> 2] = 0;
      D[(b + 28) >> 2] =
        ((a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) /
          864e5) |
        0;
      Hc.Af || (Hc.Af = Ha("GMT"));
      D[(b + 40) >> 2] = Hc.Af;
      return b;
    }
    function Ic(a) {
      for (var b = lb(); lb() - b < a / 1e3; );
    }
    function Jc(a) {
      return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400);
    }
    function Kc(a, b) {
      for (var c = 0, d = 0; d <= b; c += a[d++]);
      return c;
    }
    var Lc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      Mc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function Pc(a, b) {
      for (a = new Date(a.getTime()); 0 < b; ) {
        var c = a.getMonth(),
          d = (Jc(a.getFullYear()) ? Lc : Mc)[c];
        if (b > d - a.getDate())
          (b -= d - a.getDate() + 1),
            a.setDate(1),
            11 > c
              ? a.setMonth(c + 1)
              : (a.setMonth(0), a.setFullYear(a.getFullYear() + 1));
        else {
          a.setDate(a.getDate() + b);
          break;
        }
      }
      return a;
    }
    function Qc(a, b, c, d) {
      a || (a = this);
      this.parent = a;
      this.Ud = a.Ud;
      this.Ke = null;
      this.id = J.Bg++;
      this.name = b;
      this.mode = c;
      this.Od = {};
      this.Pd = {};
      this.rdev = d;
    }
    Object.defineProperties(Qc.prototype, {
      read: {
        get: function () {
          return 365 === (this.mode & 365);
        },
        set: function (a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        },
      },
      write: {
        get: function () {
          return 146 === (this.mode & 146);
        },
        set: function (a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        },
      },
      wg: {
        get: function () {
          return J.Vd(this.mode);
        },
      },
      mf: {
        get: function () {
          return J.Ge(this.mode);
        },
      },
    });
    J.$f = Qc;
    J.Kg();
    for (var Lb, W, Y = 0; 32 > Y; ++Y) sc.push(Array(Y));
    var Rc = new Float32Array(288);
    for (Y = 0; 288 > Y; ++Y) Bc[Y] = Rc.subarray(0, Y + 1);
    var Sc = new Int32Array(288);
    for (Y = 0; 288 > Y; ++Y) Cc[Y] = Sc.subarray(0, Y + 1);
    function Ib(a, b) {
      var c = Array(Ga(a) + 1);
      a = Ea(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    Ta.push({
      Mf: function () {
        Tc();
      },
    });
    var qd = {
      c: function (a, b, c, d) {
        n(
          "Assertion failed: " +
            z(a) +
            ", at: " +
            [b ? z(b) : "unknown filename", c, d ? z(d) : "unknown function"],
        );
      },
      Na: function (a, b) {
        return pb(a, b);
      },
      J: function (a, b) {
        Va.unshift({ Mf: a, Oe: b });
      },
      xa: function (a, b) {
        return vb(a, b);
      },
      Ia: function (a, b) {
        try {
          a = z(a);
          if (b & -8) var c = -28;
          else {
            var d;
            (d = J.Rd(a, { ee: !0 }).node)
              ? ((a = ""),
                b & 4 && (a += "r"),
                b & 2 && (a += "w"),
                b & 1 && (a += "x"),
                (c = a && J.oe(d, a) ? -2 : 0))
              : (c = -44);
          }
          return c;
        } catch (f) {
          return ("undefined" !== typeof J && f instanceof J.Md) || n(f), -f.Qd;
        }
      },
      n: function (a, b, c) {
        Ob = c;
        try {
          var d = Pb(a);
          switch (b) {
            case 0:
              var f = L();
              return 0 > f ? -28 : J.open(d.path, d.flags, 0, f).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return d.flags;
            case 4:
              return (f = L()), (d.flags |= f), 0;
            case 12:
              return (f = L()), (Ma[(f + 0) >> 1] = 2), 0;
            case 13:
            case 14:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              return mb(28), -1;
            default:
              return -28;
          }
        } catch (g) {
          return ("undefined" !== typeof J && g instanceof J.Md) || n(g), -g.Qd;
        }
      },
      Oa: function (a, b) {
        try {
          var c = Pb(a);
          return Nb(J.stat, c.path, b);
        } catch (d) {
          return ("undefined" !== typeof J && d instanceof J.Md) || n(d), -d.Qd;
        }
      },
      La: function (a, b, c) {
        try {
          var d = Pb(a);
          d.pe || (d.pe = J.readdir(d.path));
          a = 0;
          for (
            var f = J.ce(d, 0, 1), g = Math.floor(f / 280);
            g < d.pe.length && a + 280 <= c;

          ) {
            var h = d.pe[g];
            if ("." === h[0]) {
              var m = 1;
              var r = 4;
            } else {
              var q = J.he(d.node, h);
              m = q.id;
              r = J.Ge(q.mode) ? 2 : J.Vd(q.mode) ? 4 : J.qe(q.mode) ? 10 : 8;
            }
            I = [
              m >>> 0,
              ((H = m),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            D[(b + a) >> 2] = I[0];
            D[(b + a + 4) >> 2] = I[1];
            I = [
              (280 * (g + 1)) >>> 0,
              ((H = 280 * (g + 1)),
              1 <= +Math.abs(H)
                ? 0 < H
                  ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>>
                    0
                  : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
                : 0),
            ];
            D[(b + a + 8) >> 2] = I[0];
            D[(b + a + 12) >> 2] = I[1];
            Ma[(b + a + 16) >> 1] = 280;
            x[(b + a + 18) >> 0] = r;
            Ba(h, b + a + 19, 256);
            a += 280;
            g += 1;
          }
          J.ce(d, 280 * g, 0);
          return a;
        } catch (t) {
          return ("undefined" !== typeof J && t instanceof J.Md) || n(t), -t.Qd;
        }
      },
      Ba: function (a, b, c) {
        Ob = c;
        try {
          var d = Pb(a);
          switch (b) {
            case 21509:
            case 21505:
              return d.tty ? 0 : -59;
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
              return d.tty ? 0 : -59;
            case 21519:
              if (!d.tty) return -59;
              var f = L();
              return (D[f >> 2] = 0);
            case 21520:
              return d.tty ? -28 : -59;
            case 21531:
              return (f = L()), J.we(d, b, f);
            case 21523:
              return d.tty ? 0 : -59;
            case 21524:
              return d.tty ? 0 : -59;
            default:
              n("bad ioctl syscall " + b);
          }
        } catch (g) {
          return ("undefined" !== typeof J && g instanceof J.Md) || n(g), -g.Qd;
        }
      },
      Pa: function (a, b) {
        try {
          return (a = z(a)), Nb(J.lstat, a, b);
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), -c.Qd;
        }
      },
      Qa: function (a, b) {
        try {
          return (
            (a = z(a)),
            (a = xb(a)),
            "/" === a[a.length - 1] && (a = a.substr(0, a.length - 1)),
            J.mkdir(a, b, 0),
            0
          );
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), -c.Qd;
        }
      },
      Ca: function (a, b, c, d, f, g) {
        try {
          a: {
            g <<= 12;
            var h = !1;
            if (0 !== (d & 16) && 0 !== a % 16384) var m = -28;
            else {
              if (0 !== (d & 32)) {
                var r = Uc(16384, b);
                if (!r) {
                  m = -48;
                  break a;
                }
                Vc(r, 0, b);
                h = !0;
              } else {
                var q = J.ke(f);
                if (!q) {
                  m = -8;
                  break a;
                }
                var t = J.xe(q, a, b, g, c, d);
                r = t.Hg;
                h = t.df;
              }
              Mb[r] = {
                yg: r,
                xg: b,
                df: h,
                fd: f,
                Gg: c,
                flags: d,
                offset: g,
              };
              m = r;
            }
          }
          return m;
        } catch (v) {
          return ("undefined" !== typeof J && v instanceof J.Md) || n(v), -v.Qd;
        }
      },
      Da: function (a, b) {
        try {
          if (-1 === (a | 0) || 0 === b) var c = -28;
          else {
            var d = Mb[a];
            if (d && b === d.xg) {
              var f = J.ke(d.fd);
              if (d.Gg & 2) {
                var g = d.flags,
                  h = d.offset,
                  m = B.slice(a, a + b);
                J.ye(f, m, h, b, g);
              }
              Mb[a] = null;
              d.df && Wc(d.yg);
            }
            c = 0;
          }
          return c;
        } catch (r) {
          return ("undefined" !== typeof J && r instanceof J.Md) || n(r), -r.Qd;
        }
      },
      Ga: function () {
        return -63;
      },
      F: function (a, b, c) {
        Ob = c;
        try {
          var d = z(a),
            f = L();
          return J.open(d, b, f).fd;
        } catch (g) {
          return ("undefined" !== typeof J && g instanceof J.Md) || n(g), -g.Qd;
        }
      },
      Ma: function (a, b) {
        try {
          for (var c = 0, d = 0; d < b; d++) {
            var f = a + 8 * d,
              g = Ma[(f + 4) >> 1],
              h = 32,
              m = J.ke(D[f >> 2]);
            m && ((h = 5), m.Pd.We && (h = m.Pd.We(m)));
            (h &= g | 24) && c++;
            Ma[(f + 6) >> 1] = h;
          }
          return c;
        } catch (r) {
          return ("undefined" !== typeof J && r instanceof J.Md) || n(r), -r.Qd;
        }
      },
      Fa: function (a, b, c) {
        try {
          var d = Pb(a);
          return J.read(d, x, b, c);
        } catch (f) {
          return ("undefined" !== typeof J && f instanceof J.Md) || n(f), -f.Qd;
        }
      },
      za: function (a, b) {
        try {
          return (a = z(a)), (b = z(b)), J.rename(a, b), 0;
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), -c.Qd;
        }
      },
      Ka: function (a) {
        try {
          return (a = z(a)), J.rmdir(a), 0;
        } catch (b) {
          return ("undefined" !== typeof J && b instanceof J.Md) || n(b), -b.Qd;
        }
      },
      k: function (a, b) {
        try {
          Ob = b;
          b = function () {
            var U = M.tg(L());
            if (!U) throw new J.Md(8);
            return U;
          };
          var c = function (U) {
            var Nc = L(),
              dd = L();
            if (U && 0 === Nc) return null;
            U = dc(Nc, dd);
            if (U.Qd) throw new J.Md(U.Qd);
            U.Td = $b(U.Td) || U.Td;
            return U;
          };
          switch (a) {
            case 1:
              var d = L(),
                f = L(),
                g = L(),
                h = M.createSocket(d, f, g);
              return h.stream.fd;
            case 2:
              h = b();
              var m = c();
              h.Zd.bind(h, m.Td, m.port);
              return 0;
            case 3:
              return (h = b()), (m = c()), h.Zd.connect(h, m.Td, m.port), 0;
            case 4:
              h = b();
              var r = L();
              h.Zd.listen(h, r);
              return 0;
            case 5:
              h = b();
              var q = L();
              L();
              var t = h.Zd.accept(h);
              q && ec(q, t.family, Zb(t.be), t.de);
              return t.stream.fd;
            case 6:
              return (
                (h = b()),
                (q = L()),
                L(),
                ec(q, h.family, Zb(h.Xe || "0.0.0.0"), h.ue),
                0
              );
            case 7:
              h = b();
              q = L();
              L();
              if (!h.be) return -53;
              ec(q, h.family, Zb(h.be), h.de);
              return 0;
            case 11:
              h = b();
              var v = L(),
                C = L();
              L();
              var p = c(!0);
              return p
                ? h.Zd.xf(h, x, v, C, p.Td, p.port)
                : J.write(h.stream, x, v, C);
            case 12:
              h = b();
              var u = L(),
                w = L();
              L();
              q = L();
              L();
              var E = h.Zd.vf(h, w);
              if (!E) return 0;
              q && ec(q, h.family, Zb(E.Td), E.port);
              B.set(E.buffer, u);
              return E.buffer.byteLength;
            case 14:
              return -50;
            case 15:
              h = b();
              var Q = L(),
                Bb = L(),
                S = L(),
                ed = L();
              return 1 === Q && 4 === Bb
                ? ((D[S >> 2] = h.error), (D[ed >> 2] = 4), (h.error = null), 0)
                : -50;
            case 16:
              h = b();
              v = L();
              L();
              var qa = D[(v + 8) >> 2],
                Ya = D[(v + 12) >> 2],
                ob = D[v >> 2],
                fd = D[(v + 4) >> 2];
              if (ob) {
                m = dc(ob, fd);
                if (m.Qd) return -m.Qd;
                var gd = m.port;
                q = $b(m.Td) || m.Td;
              }
              for (var Fa = 0, O = 0; O < Ya; O++)
                Fa += D[(qa + (8 * O + 4)) >> 2];
              var Oc = new Uint8Array(Fa);
              for (O = C = 0; O < Ya; O++) {
                var Rb = D[(qa + 8 * O) >> 2],
                  Sb = D[(qa + (8 * O + 4)) >> 2];
                for (u = 0; u < Sb; u++) Oc[C++] = x[(Rb + u) >> 0];
              }
              return h.Zd.xf(h, Oc, 0, Fa, q, gd);
            case 17:
              h = b();
              v = L();
              L();
              qa = D[(v + 8) >> 2];
              Ya = D[(v + 12) >> 2];
              for (O = Fa = 0; O < Ya; O++) Fa += D[(qa + (8 * O + 4)) >> 2];
              E = h.Zd.vf(h, Fa);
              if (!E) return 0;
              (ob = D[v >> 2]) && ec(ob, h.family, Zb(E.Td), E.port);
              h = 0;
              var Tb = E.buffer.byteLength;
              for (O = 0; 0 < Tb && O < Ya; O++)
                if (
                  ((Rb = D[(qa + 8 * O) >> 2]),
                  (Sb = D[(qa + (8 * O + 4)) >> 2]))
                )
                  (C = Math.min(Sb, Tb)),
                    (u = E.buffer.subarray(h, h + C)),
                    B.set(u, Rb + h),
                    (h += C),
                    (Tb -= C);
              return h;
            default:
              return -52;
          }
        } catch (U) {
          return ("undefined" !== typeof J && U instanceof J.Md) || n(U), -U.Qd;
        }
      },
      E: function (a, b) {
        try {
          return (a = z(a)), Nb(J.stat, a, b);
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), -c.Qd;
        }
      },
      Ja: function (a) {
        try {
          if (!a) return -21;
          var b = {
            __size__: 390,
            sysname: 0,
            nodename: 65,
            release: 130,
            version: 195,
            machine: 260,
            domainname: 325,
          };
          Ka("Emscripten", a + b.sysname);
          Ka("emscripten", a + b.nodename);
          Ka("1.0", a + b.release);
          Ka("#1", a + b.version);
          Ka("x86-JS", a + b.machine);
          return 0;
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), -c.Qd;
        }
      },
      Ea: function (a) {
        try {
          return (a = z(a)), J.unlink(a), 0;
        } catch (b) {
          return ("undefined" !== typeof J && b instanceof J.Md) || n(b), -b.Qd;
        }
      },
      b: function () {
        n();
      },
      oa: fc,
      Ha: pb,
      I: function () {
        n(
          "To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking",
        );
      },
      Sa: function () {
        n(
          "To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking",
        );
      },
      _: function (a) {
        W.activeTexture(a);
      },
      Z: function (a, b) {
        W.attachShader(N[a], R[b]);
      },
      pa: function (a, b) {
        W.fe.beginQueryEXT(a, T[b]);
      },
      Y: function (a, b, c) {
        W.bindAttribLocation(N[a], b, z(c));
      },
      X: function (a, b) {
        W.bindBuffer(a, ic[b]);
      },
      W: function (a, b) {
        W.bindFramebuffer(a, jc[b]);
      },
      V: function (a, b) {
        W.bindRenderbuffer(a, kc[b]);
      },
      U: function (a, b) {
        W.bindTexture(a, lc[b]);
      },
      ga: function (a) {
        W.bindVertexArray(mc[a]);
      },
      T: function (a, b, c, d) {
        W.blendColor(a, b, c, d);
      },
      S: function (a) {
        W.blendEquation(a);
      },
      R: function (a, b) {
        W.blendEquationSeparate(a, b);
      },
      Q: function (a, b) {
        W.blendFunc(a, b);
      },
      P: function (a, b, c, d) {
        W.blendFuncSeparate(a, b, c, d);
      },
      O: function (a, b, c, d) {
        W.bufferData(a, c ? B.subarray(c, c + b) : b, d);
      },
      N: function (a, b, c, d) {
        W.bufferSubData(a, b, B.subarray(d, d + c));
      },
      M: function (a) {
        return W.checkFramebufferStatus(a);
      },
      pd: function (a) {
        W.clear(a);
      },
      od: function (a, b, c, d) {
        W.clearColor(a, b, c, d);
      },
      nd: function (a) {
        W.clearDepth(a);
      },
      md: function (a) {
        W.clearStencil(a);
      },
      ld: function (a, b, c, d) {
        W.colorMask(!!a, !!b, !!c, !!d);
      },
      kd: function (a) {
        W.compileShader(R[a]);
      },
      jd: function (a, b, c, d, f, g, h, m) {
        W.compressedTexImage2D(
          a,
          b,
          c,
          d,
          f,
          g,
          m ? B.subarray(m, m + h) : null,
        );
      },
      id: function (a, b, c, d, f, g, h, m, r) {
        W.compressedTexSubImage2D(
          a,
          b,
          c,
          d,
          f,
          g,
          h,
          r ? B.subarray(r, r + m) : null,
        );
      },
      hd: function (a, b, c, d, f, g, h, m) {
        W.copyTexImage2D(a, b, c, d, f, g, h, m);
      },
      gd: function (a, b, c, d, f, g, h, m) {
        W.copyTexSubImage2D(a, b, c, d, f, g, h, m);
      },
      fd: function () {
        var a = rc(N),
          b = W.createProgram();
        b.name = a;
        N[a] = b;
        return a;
      },
      ed: function (a) {
        var b = rc(R);
        R[b] = W.createShader(a);
        return b;
      },
      dd: function (a) {
        W.cullFace(a);
      },
      cd: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = D[(b + 4 * c) >> 2],
            f = ic[d];
          f && (W.deleteBuffer(f), (f.name = 0), (ic[d] = null));
        }
      },
      bd: function (a, b) {
        for (var c = 0; c < a; ++c) {
          var d = D[(b + 4 * c) >> 2],
            f = jc[d];
          f && (W.deleteFramebuffer(f), (f.name = 0), (jc[d] = null));
        }
      },
      ad: function (a) {
        if (a) {
          var b = N[a];
          b
            ? (W.deleteProgram(b), (b.name = 0), (N[a] = null), (nc[a] = null))
            : V(1281);
        }
      },
      ra: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = D[(b + 4 * c) >> 2],
            f = T[d];
          f && (W.fe.deleteQueryEXT(f), (T[d] = null));
        }
      },
      $c: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = D[(b + 4 * c) >> 2],
            f = kc[d];
          f && (W.deleteRenderbuffer(f), (f.name = 0), (kc[d] = null));
        }
      },
      _c: function (a) {
        if (a) {
          var b = R[a];
          b ? (W.deleteShader(b), (R[a] = null)) : V(1281);
        }
      },
      Zc: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = D[(b + 4 * c) >> 2],
            f = lc[d];
          f && (W.deleteTexture(f), (f.name = 0), (lc[d] = null));
        }
      },
      fa: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = D[(b + 4 * c) >> 2];
          W.deleteVertexArray(mc[d]);
          mc[d] = null;
        }
      },
      Yc: function (a) {
        W.depthFunc(a);
      },
      Xc: function (a) {
        W.depthMask(!!a);
      },
      Wc: function (a, b) {
        W.depthRange(a, b);
      },
      Vc: function (a, b) {
        W.detachShader(N[a], R[b]);
      },
      Uc: function (a) {
        W.disable(a);
      },
      Tc: function (a) {
        W.disableVertexAttribArray(a);
      },
      Sc: function (a, b, c) {
        W.drawArrays(a, b, c);
      },
      ba: function (a, b, c, d) {
        W.drawArraysInstanced(a, b, c, d);
      },
      ca: function (a, b) {
        for (var c = sc[a], d = 0; d < a; d++) c[d] = D[(b + 4 * d) >> 2];
        W.drawBuffers(c);
      },
      Rc: function (a, b, c, d) {
        W.drawElements(a, b, c, d);
      },
      aa: function (a, b, c, d, f) {
        W.drawElementsInstanced(a, b, c, d, f);
      },
      Qc: function (a) {
        W.enable(a);
      },
      Pc: function (a) {
        W.enableVertexAttribArray(a);
      },
      na: function (a) {
        W.fe.endQueryEXT(a);
      },
      Oc: function () {
        W.finish();
      },
      Nc: function () {
        W.flush();
      },
      Mc: function (a, b, c, d) {
        W.framebufferRenderbuffer(a, b, c, kc[d]);
      },
      Lc: function (a, b, c, d, f) {
        W.framebufferTexture2D(a, b, c, lc[d], f);
      },
      Kc: function (a) {
        W.frontFace(a);
      },
      Jc: function (a, b) {
        tc(a, b, "createBuffer", ic);
      },
      Hc: function (a, b) {
        tc(a, b, "createFramebuffer", jc);
      },
      sa: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = W.fe.createQueryEXT();
          if (!d) {
            for (V(1282); c < a; ) D[(b + 4 * c++) >> 2] = 0;
            break;
          }
          var f = rc(T);
          d.name = f;
          T[f] = d;
          D[(b + 4 * c) >> 2] = f;
        }
      },
      Gc: function (a, b) {
        tc(a, b, "createRenderbuffer", kc);
      },
      Fc: function (a, b) {
        tc(a, b, "createTexture", lc);
      },
      ea: function (a, b) {
        tc(a, b, "createVertexArray", mc);
      },
      Ic: function (a) {
        W.generateMipmap(a);
      },
      Ec: function (a, b, c, d, f, g, h) {
        uc("getActiveAttrib", a, b, c, d, f, g, h);
      },
      Dc: function (a, b, c, d, f, g, h) {
        uc("getActiveUniform", a, b, c, d, f, g, h);
      },
      Cc: function (a, b, c, d) {
        a = W.getAttachedShaders(N[a]);
        var f = a.length;
        f > b && (f = b);
        D[c >> 2] = f;
        for (b = 0; b < f; ++b) D[(d + 4 * b) >> 2] = R.indexOf(a[b]);
      },
      Bc: function (a, b) {
        return W.getAttribLocation(N[a], z(b));
      },
      Ac: function (a, b) {
        wc(a, b, 4);
      },
      zc: function (a, b, c) {
        c ? (D[c >> 2] = W.getBufferParameter(a, b)) : V(1281);
      },
      yc: function () {
        var a = W.getError() || qc;
        qc = 0;
        return a;
      },
      xc: function (a, b) {
        wc(a, b, 2);
      },
      wc: function (a, b, c, d) {
        a = W.getFramebufferAttachmentParameter(a, b, c);
        if (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture)
          a = a.name | 0;
        D[d >> 2] = a;
      },
      vc: function (a, b) {
        wc(a, b, 0);
      },
      tc: function (a, b, c, d) {
        a = W.getProgramInfoLog(N[a]);
        null === a && (a = "(unknown error)");
        b = 0 < b && d ? Ba(a, d, b) : 0;
        c && (D[c >> 2] = b);
      },
      uc: function (a, b, c) {
        if (c)
          if (a >= hc) V(1281);
          else {
            var d = nc[a];
            if (d)
              if (35716 == b)
                (a = W.getProgramInfoLog(N[a])),
                  null === a && (a = "(unknown error)"),
                  (D[c >> 2] = a.length + 1);
              else if (35719 == b) D[c >> 2] = d.qf;
              else if (35722 == b) {
                if (-1 == d.Ie) {
                  a = N[a];
                  var f = W.getProgramParameter(a, 35721);
                  for (b = d.Ie = 0; b < f; ++b)
                    d.Ie = Math.max(
                      d.Ie,
                      W.getActiveAttrib(a, b).name.length + 1,
                    );
                }
                D[c >> 2] = d.Ie;
              } else if (35381 == b) {
                if (-1 == d.Je)
                  for (
                    a = N[a], f = W.getProgramParameter(a, 35382), b = d.Je = 0;
                    b < f;
                    ++b
                  )
                    d.Je = Math.max(
                      d.Je,
                      W.getActiveUniformBlockName(a, b).length + 1,
                    );
                D[c >> 2] = d.Je;
              } else D[c >> 2] = W.getProgramParameter(N[a], b);
            else V(1282);
          }
        else V(1281);
      },
      ia: function (a, b, c) {
        if (c) {
          a = W.fe.getQueryObjectEXT(T[a], b);
          var d;
          "boolean" == typeof a ? (d = a ? 1 : 0) : (d = a);
          vc(c, d);
        } else V(1281);
      },
      ka: function (a, b, c) {
        if (c) {
          a = W.fe.getQueryObjectEXT(T[a], b);
          var d;
          "boolean" == typeof a ? (d = a ? 1 : 0) : (d = a);
          D[c >> 2] = d;
        } else V(1281);
      },
      ha: function (a, b, c) {
        if (c) {
          a = W.fe.getQueryObjectEXT(T[a], b);
          var d;
          "boolean" == typeof a ? (d = a ? 1 : 0) : (d = a);
          vc(c, d);
        } else V(1281);
      },
      ja: function (a, b, c) {
        if (c) {
          a = W.fe.getQueryObjectEXT(T[a], b);
          var d;
          "boolean" == typeof a ? (d = a ? 1 : 0) : (d = a);
          D[c >> 2] = d;
        } else V(1281);
      },
      la: function (a, b, c) {
        c ? (D[c >> 2] = W.fe.getQueryEXT(a, b)) : V(1281);
      },
      sc: function (a, b, c) {
        c ? (D[c >> 2] = W.getRenderbufferParameter(a, b)) : V(1281);
      },
      qc: function (a, b, c, d) {
        a = W.getShaderInfoLog(R[a]);
        null === a && (a = "(unknown error)");
        b = 0 < b && d ? Ba(a, d, b) : 0;
        c && (D[c >> 2] = b);
      },
      pc: function (a, b, c, d) {
        a = W.getShaderPrecisionFormat(a, b);
        D[c >> 2] = a.rangeMin;
        D[(c + 4) >> 2] = a.rangeMax;
        D[d >> 2] = a.precision;
      },
      oc: function (a, b, c, d) {
        if ((a = W.getShaderSource(R[a])))
          (b = 0 < b && d ? Ba(a, d, b) : 0), c && (D[c >> 2] = b);
      },
      rc: function (a, b, c) {
        c
          ? 35716 == b
            ? ((a = W.getShaderInfoLog(R[a])),
              null === a && (a = "(unknown error)"),
              (D[c >> 2] = a ? a.length + 1 : 0))
            : 35720 == b
              ? ((a = W.getShaderSource(R[a])),
                (D[c >> 2] = a ? a.length + 1 : 0))
              : (D[c >> 2] = W.getShaderParameter(R[a], b))
          : V(1281);
      },
      nc: function (a) {
        if (oc[a]) return oc[a];
        switch (a) {
          case 7939:
            var b = W.getSupportedExtensions() || [];
            b = b.concat(
              b.map(function (d) {
                return "GL_" + d;
              }),
            );
            b = xc(b.join(" "));
            break;
          case 7936:
          case 7937:
          case 37445:
          case 37446:
            (b = W.getParameter(a)) || V(1280);
            b = xc(b);
            break;
          case 7938:
            b = xc("OpenGL ES 2.0 (" + W.getParameter(7938) + ")");
            break;
          case 35724:
            b = W.getParameter(35724);
            var c = b.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
            null !== c &&
              (3 == c[1].length && (c[1] += "0"),
              (b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")"));
            b = xc(b);
            break;
          default:
            return V(1280), 0;
        }
        return (oc[a] = b);
      },
      mc: function (a, b, c) {
        c ? (F[c >> 2] = W.getTexParameter(a, b)) : V(1281);
      },
      lc: function (a, b, c) {
        c ? (D[c >> 2] = W.getTexParameter(a, b)) : V(1281);
      },
      ic: function (a, b) {
        b = z(b);
        var c = 0;
        if ("]" == b[b.length - 1]) {
          var d = b.lastIndexOf("[");
          c = "]" != b[d + 1] ? parseInt(b.slice(d + 1)) : 0;
          b = b.slice(0, d);
        }
        return (a = nc[a] && nc[a].Zf[b]) && 0 <= c && c < a[0] ? a[1] + c : -1;
      },
      kc: function (a, b, c) {
        yc(a, b, c, 2);
      },
      jc: function (a, b, c) {
        yc(a, b, c, 0);
      },
      fc: function (a, b, c) {
        c ? (D[c >> 2] = W.getVertexAttribOffset(a, b)) : V(1281);
      },
      hc: function (a, b, c) {
        zc(a, b, c, 2);
      },
      gc: function (a, b, c) {
        zc(a, b, c, 5);
      },
      ec: function (a, b) {
        W.hint(a, b);
      },
      dc: function (a) {
        return (a = ic[a]) ? W.isBuffer(a) : 0;
      },
      cc: function (a) {
        return W.isEnabled(a);
      },
      bc: function (a) {
        return (a = jc[a]) ? W.isFramebuffer(a) : 0;
      },
      ac: function (a) {
        return (a = N[a]) ? W.isProgram(a) : 0;
      },
      qa: function (a) {
        return (a = T[a]) ? W.fe.isQueryEXT(a) : 0;
      },
      $b: function (a) {
        return (a = kc[a]) ? W.isRenderbuffer(a) : 0;
      },
      _b: function (a) {
        return (a = R[a]) ? W.isShader(a) : 0;
      },
      Zb: function (a) {
        return (a = lc[a]) ? W.isTexture(a) : 0;
      },
      da: function (a) {
        return (a = mc[a]) ? W.isVertexArray(a) : 0;
      },
      Yb: function (a) {
        W.lineWidth(a);
      },
      Xb: function (a) {
        W.linkProgram(N[a]);
        var b = N[a];
        a = nc[a] = { Zf: {}, qf: 0, Ie: -1, Je: -1 };
        for (
          var c = a.Zf, d = W.getProgramParameter(b, 35718), f = 0;
          f < d;
          ++f
        ) {
          var g = W.getActiveUniform(b, f),
            h = g.name;
          a.qf = Math.max(a.qf, h.length + 1);
          "]" == h.slice(-1) && (h = h.slice(0, h.lastIndexOf("[")));
          var m = W.getUniformLocation(b, h);
          if (m) {
            var r = rc(P);
            c[h] = [g.size, r];
            P[r] = m;
            for (var q = 1; q < g.size; ++q)
              (m = W.getUniformLocation(b, h + "[" + q + "]")),
                (r = rc(P)),
                (P[r] = m);
          }
        }
      },
      Wb: function (a, b) {
        3317 == a && (pc = b);
        W.pixelStorei(a, b);
      },
      Vb: function (a, b) {
        W.polygonOffset(a, b);
      },
      ma: function (a, b) {
        W.fe.queryCounterEXT(T[a], b);
      },
      Ub: function (a, b, c, d, f, g, h) {
        (h = Ac(g, f, c, d, h)) ? W.readPixels(a, b, c, d, f, g, h) : V(1280);
      },
      Tb: function () {},
      Sb: function (a, b, c, d) {
        W.renderbufferStorage(a, b, c, d);
      },
      Rb: function (a, b) {
        W.sampleCoverage(a, !!b);
      },
      Qb: function (a, b, c, d) {
        W.scissor(a, b, c, d);
      },
      Pb: function () {
        V(1280);
      },
      Ob: function (a, b, c, d) {
        for (var f = "", g = 0; g < b; ++g) {
          var h = d ? D[(d + 4 * g) >> 2] : -1;
          f += z(D[(c + 4 * g) >> 2], 0 > h ? void 0 : h);
        }
        W.shaderSource(R[a], f);
      },
      Nb: function (a, b, c) {
        W.stencilFunc(a, b, c);
      },
      Mb: function (a, b, c, d) {
        W.stencilFuncSeparate(a, b, c, d);
      },
      Lb: function (a) {
        W.stencilMask(a);
      },
      Kb: function (a, b) {
        W.stencilMaskSeparate(a, b);
      },
      Jb: function (a, b, c) {
        W.stencilOp(a, b, c);
      },
      Ib: function (a, b, c, d) {
        W.stencilOpSeparate(a, b, c, d);
      },
      Hb: function (a, b, c, d, f, g, h, m, r) {
        W.texImage2D(a, b, c, d, f, g, h, m, r ? Ac(m, h, d, f, r) : null);
      },
      Gb: function (a, b, c) {
        W.texParameterf(a, b, c);
      },
      Fb: function (a, b, c) {
        W.texParameterf(a, b, F[c >> 2]);
      },
      Eb: function (a, b, c) {
        W.texParameteri(a, b, c);
      },
      Db: function (a, b, c) {
        W.texParameteri(a, b, D[c >> 2]);
      },
      Cb: function (a, b, c, d, f, g, h, m, r) {
        var q = null;
        r && (q = Ac(m, h, f, g, r));
        W.texSubImage2D(a, b, c, d, f, g, h, m, q);
      },
      Bb: function (a, b) {
        W.uniform1f(P[a], b);
      },
      Ab: function (a, b, c) {
        if (288 >= b)
          for (var d = Bc[b - 1], f = 0; f < b; ++f) d[f] = F[(c + 4 * f) >> 2];
        else d = F.subarray(c >> 2, (c + 4 * b) >> 2);
        W.uniform1fv(P[a], d);
      },
      zb: function (a, b) {
        W.uniform1i(P[a], b);
      },
      yb: function (a, b, c) {
        if (288 >= b)
          for (var d = Cc[b - 1], f = 0; f < b; ++f) d[f] = D[(c + 4 * f) >> 2];
        else d = D.subarray(c >> 2, (c + 4 * b) >> 2);
        W.uniform1iv(P[a], d);
      },
      xb: function (a, b, c) {
        W.uniform2f(P[a], b, c);
      },
      wb: function (a, b, c) {
        if (144 >= b)
          for (var d = Bc[2 * b - 1], f = 0; f < 2 * b; f += 2)
            (d[f] = F[(c + 4 * f) >> 2]),
              (d[f + 1] = F[(c + (4 * f + 4)) >> 2]);
        else d = F.subarray(c >> 2, (c + 8 * b) >> 2);
        W.uniform2fv(P[a], d);
      },
      vb: function (a, b, c) {
        W.uniform2i(P[a], b, c);
      },
      ub: function (a, b, c) {
        if (144 >= b)
          for (var d = Cc[2 * b - 1], f = 0; f < 2 * b; f += 2)
            (d[f] = D[(c + 4 * f) >> 2]),
              (d[f + 1] = D[(c + (4 * f + 4)) >> 2]);
        else d = D.subarray(c >> 2, (c + 8 * b) >> 2);
        W.uniform2iv(P[a], d);
      },
      tb: function (a, b, c, d) {
        W.uniform3f(P[a], b, c, d);
      },
      sb: function (a, b, c) {
        if (96 >= b)
          for (var d = Bc[3 * b - 1], f = 0; f < 3 * b; f += 3)
            (d[f] = F[(c + 4 * f) >> 2]),
              (d[f + 1] = F[(c + (4 * f + 4)) >> 2]),
              (d[f + 2] = F[(c + (4 * f + 8)) >> 2]);
        else d = F.subarray(c >> 2, (c + 12 * b) >> 2);
        W.uniform3fv(P[a], d);
      },
      rb: function (a, b, c, d) {
        W.uniform3i(P[a], b, c, d);
      },
      qb: function (a, b, c) {
        if (96 >= b)
          for (var d = Cc[3 * b - 1], f = 0; f < 3 * b; f += 3)
            (d[f] = D[(c + 4 * f) >> 2]),
              (d[f + 1] = D[(c + (4 * f + 4)) >> 2]),
              (d[f + 2] = D[(c + (4 * f + 8)) >> 2]);
        else d = D.subarray(c >> 2, (c + 12 * b) >> 2);
        W.uniform3iv(P[a], d);
      },
      pb: function (a, b, c, d, f) {
        W.uniform4f(P[a], b, c, d, f);
      },
      ob: function (a, b, c) {
        if (72 >= b) {
          var d = Bc[4 * b - 1],
            f = F;
          c >>= 2;
          for (var g = 0; g < 4 * b; g += 4) {
            var h = c + g;
            d[g] = f[h];
            d[g + 1] = f[h + 1];
            d[g + 2] = f[h + 2];
            d[g + 3] = f[h + 3];
          }
        } else d = F.subarray(c >> 2, (c + 16 * b) >> 2);
        W.uniform4fv(P[a], d);
      },
      nb: function (a, b, c, d, f) {
        W.uniform4i(P[a], b, c, d, f);
      },
      mb: function (a, b, c) {
        if (72 >= b)
          for (var d = Cc[4 * b - 1], f = 0; f < 4 * b; f += 4)
            (d[f] = D[(c + 4 * f) >> 2]),
              (d[f + 1] = D[(c + (4 * f + 4)) >> 2]),
              (d[f + 2] = D[(c + (4 * f + 8)) >> 2]),
              (d[f + 3] = D[(c + (4 * f + 12)) >> 2]);
        else d = D.subarray(c >> 2, (c + 16 * b) >> 2);
        W.uniform4iv(P[a], d);
      },
      lb: function (a, b, c, d) {
        if (72 >= b)
          for (var f = Bc[4 * b - 1], g = 0; g < 4 * b; g += 4)
            (f[g] = F[(d + 4 * g) >> 2]),
              (f[g + 1] = F[(d + (4 * g + 4)) >> 2]),
              (f[g + 2] = F[(d + (4 * g + 8)) >> 2]),
              (f[g + 3] = F[(d + (4 * g + 12)) >> 2]);
        else f = F.subarray(d >> 2, (d + 16 * b) >> 2);
        W.uniformMatrix2fv(P[a], !!c, f);
      },
      kb: function (a, b, c, d) {
        if (32 >= b)
          for (var f = Bc[9 * b - 1], g = 0; g < 9 * b; g += 9)
            (f[g] = F[(d + 4 * g) >> 2]),
              (f[g + 1] = F[(d + (4 * g + 4)) >> 2]),
              (f[g + 2] = F[(d + (4 * g + 8)) >> 2]),
              (f[g + 3] = F[(d + (4 * g + 12)) >> 2]),
              (f[g + 4] = F[(d + (4 * g + 16)) >> 2]),
              (f[g + 5] = F[(d + (4 * g + 20)) >> 2]),
              (f[g + 6] = F[(d + (4 * g + 24)) >> 2]),
              (f[g + 7] = F[(d + (4 * g + 28)) >> 2]),
              (f[g + 8] = F[(d + (4 * g + 32)) >> 2]);
        else f = F.subarray(d >> 2, (d + 36 * b) >> 2);
        W.uniformMatrix3fv(P[a], !!c, f);
      },
      jb: function (a, b, c, d) {
        if (18 >= b) {
          var f = Bc[16 * b - 1],
            g = F;
          d >>= 2;
          for (var h = 0; h < 16 * b; h += 16) {
            var m = d + h;
            f[h] = g[m];
            f[h + 1] = g[m + 1];
            f[h + 2] = g[m + 2];
            f[h + 3] = g[m + 3];
            f[h + 4] = g[m + 4];
            f[h + 5] = g[m + 5];
            f[h + 6] = g[m + 6];
            f[h + 7] = g[m + 7];
            f[h + 8] = g[m + 8];
            f[h + 9] = g[m + 9];
            f[h + 10] = g[m + 10];
            f[h + 11] = g[m + 11];
            f[h + 12] = g[m + 12];
            f[h + 13] = g[m + 13];
            f[h + 14] = g[m + 14];
            f[h + 15] = g[m + 15];
          }
        } else f = F.subarray(d >> 2, (d + 64 * b) >> 2);
        W.uniformMatrix4fv(P[a], !!c, f);
      },
      ib: function (a) {
        W.useProgram(N[a]);
      },
      hb: function (a) {
        W.validateProgram(N[a]);
      },
      gb: function (a, b) {
        W.vertexAttrib1f(a, b);
      },
      fb: function (a, b) {
        W.vertexAttrib1f(a, F[b >> 2]);
      },
      eb: function (a, b, c) {
        W.vertexAttrib2f(a, b, c);
      },
      cb: function (a, b) {
        W.vertexAttrib2f(a, F[b >> 2], F[(b + 4) >> 2]);
      },
      bb: function (a, b, c, d) {
        W.vertexAttrib3f(a, b, c, d);
      },
      ab: function (a, b) {
        W.vertexAttrib3f(a, F[b >> 2], F[(b + 4) >> 2], F[(b + 8) >> 2]);
      },
      $a: function (a, b, c, d, f) {
        W.vertexAttrib4f(a, b, c, d, f);
      },
      _a: function (a, b) {
        W.vertexAttrib4f(
          a,
          F[b >> 2],
          F[(b + 4) >> 2],
          F[(b + 8) >> 2],
          F[(b + 12) >> 2],
        );
      },
      $: function (a, b) {
        W.vertexAttribDivisor(a, b);
      },
      Za: function (a, b, c, d, f, g) {
        W.vertexAttribPointer(a, b, c, !!d, f, g);
      },
      Ya: function (a, b, c, d) {
        W.viewport(a, b, c, d);
      },
      f: function (a, b) {
        Z(a, b || 1);
        throw "longjmp";
      },
      ta: function (a, b, c) {
        B.copyWithin(a, b, b + c);
      },
      ua: function (a) {
        a >>>= 0;
        var b = B.length;
        if (1073741824 < a) return !1;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, a + 100663296);
          d = Math.max(16777216, a, d);
          0 < d % 65536 && (d += 65536 - (d % 65536));
          a: {
            try {
              wa.grow((Math.min(1073741824, d) - La.byteLength + 65535) >>> 16);
              Qa(wa.buffer);
              var f = 1;
              break a;
            } catch (g) {}
            f = void 0;
          }
          if (f) return !0;
        }
        return !1;
      },
      va: function (a, b) {
        var c = 0;
        Ec().forEach(function (d, f) {
          var g = b + c;
          D[(a + 4 * f) >> 2] = g;
          Ka(d, g);
          c += d.length + 1;
        });
        return 0;
      },
      wa: function (a, b) {
        var c = Ec();
        D[a >> 2] = c.length;
        var d = 0;
        c.forEach(function (f) {
          d += f.length + 1;
        });
        D[b >> 2] = d;
        return 0;
      },
      w: function (a) {
        da(a);
      },
      x: function (a) {
        try {
          var b = Pb(a);
          J.close(b);
          return 0;
        } catch (c) {
          return ("undefined" !== typeof J && c instanceof J.Md) || n(c), c.Qd;
        }
      },
      D: function (a, b) {
        try {
          var c = Pb(a);
          x[b >> 0] = c.tty ? 2 : J.Vd(c.mode) ? 3 : J.qe(c.mode) ? 7 : 4;
          return 0;
        } catch (d) {
          return ("undefined" !== typeof J && d instanceof J.Md) || n(d), d.Qd;
        }
      },
      Aa: function (a, b, c, d) {
        try {
          a: {
            for (var f = Pb(a), g = (a = 0); g < c; g++) {
              var h = D[(b + (8 * g + 4)) >> 2],
                m = J.read(f, x, D[(b + 8 * g) >> 2], h, void 0);
              if (0 > m) {
                var r = -1;
                break a;
              }
              a += m;
              if (m < h) break;
            }
            r = a;
          }
          D[d >> 2] = r;
          return 0;
        } catch (q) {
          return ("undefined" !== typeof J && q instanceof J.Md) || n(q), q.Qd;
        }
      },
      Ta: function (a, b, c, d, f) {
        try {
          var g = Pb(a);
          a = 4294967296 * c + (b >>> 0);
          if (-9007199254740992 >= a || 9007199254740992 <= a) return -61;
          J.ce(g, a, d);
          I = [
            g.position >>> 0,
            ((H = g.position),
            1 <= +Math.abs(H)
              ? 0 < H
                ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          D[f >> 2] = I[0];
          D[(f + 4) >> 2] = I[1];
          g.pe && 0 === a && 0 === d && (g.pe = null);
          return 0;
        } catch (h) {
          return ("undefined" !== typeof J && h instanceof J.Md) || n(h), h.Qd;
        }
      },
      z: function (a, b, c, d) {
        try {
          a: {
            for (var f = Pb(a), g = (a = 0); g < c; g++) {
              var h = J.write(
                f,
                x,
                D[(b + 8 * g) >> 2],
                D[(b + (8 * g + 4)) >> 2],
                void 0,
              );
              if (0 > h) {
                var m = -1;
                break a;
              }
              a += h;
            }
            m = a;
          }
          D[d >> 2] = m;
          return 0;
        } catch (r) {
          return ("undefined" !== typeof J && r instanceof J.Md) || n(r), r.Qd;
        }
      },
      t: Gc,
      d: function () {
        return ua | 0;
      },
      s: function (a, b, c, d) {
        function f(v, C, p, u, w, E) {
          var Q = 10 === v ? 28 : 16;
          w = 10 === v ? bc(w) : ac(w);
          Q = Ia(Q);
          w = ec(Q, v, w, E);
          assert(!w.Qd);
          w = Ia(32);
          D[(w + 4) >> 2] = v;
          D[(w + 8) >> 2] = C;
          D[(w + 12) >> 2] = p;
          D[(w + 24) >> 2] = u;
          D[(w + 20) >> 2] = Q;
          D[(w + 16) >> 2] = 10 === v ? 28 : 16;
          D[(w + 28) >> 2] = 0;
          return w;
        }
        var g = 0,
          h = 0,
          m = 0,
          r = 0,
          q = 0,
          t = 0;
        c &&
          ((m = D[c >> 2]),
          (r = D[(c + 4) >> 2]),
          (q = D[(c + 8) >> 2]),
          (t = D[(c + 12) >> 2]));
        q && !t && (t = 2 === q ? 17 : 6);
        !q && t && (q = 17 === t ? 2 : 1);
        0 === t && (t = 6);
        0 === q && (q = 1);
        if (!a && !b) return -2;
        if (m & -1088 || (0 !== c && D[c >> 2] & 2 && !a)) return -1;
        if (m & 32) return -2;
        if (0 !== q && 1 !== q && 2 !== q) return -7;
        if (0 !== r && 2 !== r && 10 !== r) return -6;
        if (b && ((b = z(b)), (h = parseInt(b, 10)), isNaN(h)))
          return m & 1024 ? -2 : -8;
        if (!a)
          return (
            0 === r && (r = 2),
            0 === (m & 1) &&
              (2 === r ? (g = Xc(2130706433)) : (g = [0, 0, 0, 1])),
            (a = f(r, q, t, null, g, h)),
            (D[d >> 2] = a),
            0
          );
        a = z(a);
        g = Qb(a);
        if (null !== g)
          if (0 === r || 2 === r) r = 2;
          else if (10 === r && m & 8) (g = [0, 0, Xc(65535), g]), (r = 10);
          else return -2;
        else if (((g = Ub(a)), null !== g))
          if (0 === r || 10 === r) r = 10;
          else return -2;
        if (null != g) return (a = f(r, q, t, a, g, h)), (D[d >> 2] = a), 0;
        if (m & 4) return -2;
        a = Zb(a);
        g = Qb(a);
        0 === r ? (r = 2) : 10 === r && (g = [0, 0, Xc(65535), g]);
        a = f(r, q, t, null, g, h);
        D[d >> 2] = a;
        return 0;
      },
      q: function (a, b, c, d, f, g, h) {
        b = dc(a, b);
        if (b.Qd) return -6;
        a = b.port;
        var m = b.Td;
        b = !1;
        if (c && d) {
          var r;
          if (h & 1 || !(r = $b(m))) {
            if (h & 8) return -2;
          } else m = r;
          c = Ba(m, c, d);
          c + 1 >= d && (b = !0);
        }
        f && g && ((c = Ba("" + a, f, g)), c + 1 >= g && (b = !0));
        return b ? -12 : 0;
      },
      i: function (a) {
        var b = Date.now();
        D[a >> 2] = (b / 1e3) | 0;
        D[(a + 4) >> 2] = ((b % 1e3) * 1e3) | 0;
        return 0;
      },
      l: Hc,
      db: Yc,
      Ua: Zc,
      g: $c,
      A: ad,
      L: bd,
      G: cd,
      B: hd,
      Wa: id,
      Va: jd,
      o: kd,
      v: ld,
      h: md,
      Ra: nd,
      H: od,
      Xa: pd,
      m: vb,
      a: wa,
      C: function (a) {
        qb();
        var b = new Date(
            D[(a + 20) >> 2] + 1900,
            D[(a + 16) >> 2],
            D[(a + 12) >> 2],
            D[(a + 8) >> 2],
            D[(a + 4) >> 2],
            D[a >> 2],
            0,
          ),
          c = D[(a + 32) >> 2],
          d = b.getTimezoneOffset(),
          f = new Date(b.getFullYear(), 0, 1),
          g = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(),
          h = f.getTimezoneOffset(),
          m = Math.min(h, g);
        0 > c
          ? (D[(a + 32) >> 2] = Number(g != h && m == d))
          : 0 < c != (m == d) &&
            ((g = Math.max(h, g)),
            b.setTime(b.getTime() + 6e4 * ((0 < c ? m : g) - d)));
        D[(a + 24) >> 2] = b.getDay();
        D[(a + 28) >> 2] = ((b.getTime() - f.getTime()) / 864e5) | 0;
        return (b.getTime() / 1e3) | 0;
      },
      ya: function (a, b) {
        if (0 === a) return mb(28), -1;
        var c = D[a >> 2];
        a = D[(a + 4) >> 2];
        if (0 > a || 999999999 < a || 0 > c) return mb(28), -1;
        0 !== b && ((D[b >> 2] = 0), (D[(b + 4) >> 2] = 0));
        return Ic(1e6 * c + a / 1e3);
      },
      y: function () {
        return 6;
      },
      K: function () {},
      e: function (a) {
        ua = a | 0;
      },
      j: function (a, b, c, d) {
        function f(p, u, w) {
          for (
            p = "number" === typeof p ? p.toString() : p || "";
            p.length < u;

          )
            p = w[0] + p;
          return p;
        }
        function g(p, u) {
          return f(p, u, "0");
        }
        function h(p, u) {
          function w(Q) {
            return 0 > Q ? -1 : 0 < Q ? 1 : 0;
          }
          var E;
          0 === (E = w(p.getFullYear() - u.getFullYear())) &&
            0 === (E = w(p.getMonth() - u.getMonth())) &&
            (E = w(p.getDate() - u.getDate()));
          return E;
        }
        function m(p) {
          switch (p.getDay()) {
            case 0:
              return new Date(p.getFullYear() - 1, 11, 29);
            case 1:
              return p;
            case 2:
              return new Date(p.getFullYear(), 0, 3);
            case 3:
              return new Date(p.getFullYear(), 0, 2);
            case 4:
              return new Date(p.getFullYear(), 0, 1);
            case 5:
              return new Date(p.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(p.getFullYear() - 1, 11, 30);
          }
        }
        function r(p) {
          p = Pc(new Date(p.ae + 1900, 0, 1), p.af);
          var u = new Date(p.getFullYear() + 1, 0, 4),
            w = m(new Date(p.getFullYear(), 0, 4));
          u = m(u);
          return 0 >= h(w, p)
            ? 0 >= h(u, p)
              ? p.getFullYear() + 1
              : p.getFullYear()
            : p.getFullYear() - 1;
        }
        var q = D[(d + 40) >> 2];
        d = {
          Ng: D[d >> 2],
          Mg: D[(d + 4) >> 2],
          Ze: D[(d + 8) >> 2],
          Ne: D[(d + 12) >> 2],
          Ce: D[(d + 16) >> 2],
          ae: D[(d + 20) >> 2],
          $e: D[(d + 24) >> 2],
          af: D[(d + 28) >> 2],
          hh: D[(d + 32) >> 2],
          Lg: D[(d + 36) >> 2],
          Og: q ? z(q) : "",
        };
        c = z(c);
        q = {
          "%c": "%a %b %d %H:%M:%S %Y",
          "%D": "%m/%d/%y",
          "%F": "%Y-%m-%d",
          "%h": "%b",
          "%r": "%I:%M:%S %p",
          "%R": "%H:%M",
          "%T": "%H:%M:%S",
          "%x": "%m/%d/%y",
          "%X": "%H:%M:%S",
          "%Ec": "%c",
          "%EC": "%C",
          "%Ex": "%m/%d/%y",
          "%EX": "%H:%M:%S",
          "%Ey": "%y",
          "%EY": "%Y",
          "%Od": "%d",
          "%Oe": "%e",
          "%OH": "%H",
          "%OI": "%I",
          "%Om": "%m",
          "%OM": "%M",
          "%OS": "%S",
          "%Ou": "%u",
          "%OU": "%U",
          "%OV": "%V",
          "%Ow": "%w",
          "%OW": "%W",
          "%Oy": "%y",
        };
        for (var t in q) c = c.replace(new RegExp(t, "g"), q[t]);
        var v =
            "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
              " ",
            ),
          C =
            "January February March April May June July August September October November December".split(
              " ",
            );
        q = {
          "%a": function (p) {
            return v[p.$e].substring(0, 3);
          },
          "%A": function (p) {
            return v[p.$e];
          },
          "%b": function (p) {
            return C[p.Ce].substring(0, 3);
          },
          "%B": function (p) {
            return C[p.Ce];
          },
          "%C": function (p) {
            return g(((p.ae + 1900) / 100) | 0, 2);
          },
          "%d": function (p) {
            return g(p.Ne, 2);
          },
          "%e": function (p) {
            return f(p.Ne, 2, " ");
          },
          "%g": function (p) {
            return r(p).toString().substring(2);
          },
          "%G": function (p) {
            return r(p);
          },
          "%H": function (p) {
            return g(p.Ze, 2);
          },
          "%I": function (p) {
            p = p.Ze;
            0 == p ? (p = 12) : 12 < p && (p -= 12);
            return g(p, 2);
          },
          "%j": function (p) {
            return g(p.Ne + Kc(Jc(p.ae + 1900) ? Lc : Mc, p.Ce - 1), 3);
          },
          "%m": function (p) {
            return g(p.Ce + 1, 2);
          },
          "%M": function (p) {
            return g(p.Mg, 2);
          },
          "%n": function () {
            return "\n";
          },
          "%p": function (p) {
            return 0 <= p.Ze && 12 > p.Ze ? "AM" : "PM";
          },
          "%S": function (p) {
            return g(p.Ng, 2);
          },
          "%t": function () {
            return "\t";
          },
          "%u": function (p) {
            return p.$e || 7;
          },
          "%U": function (p) {
            var u = new Date(p.ae + 1900, 0, 1),
              w = 0 === u.getDay() ? u : Pc(u, 7 - u.getDay());
            p = new Date(p.ae + 1900, p.Ce, p.Ne);
            return 0 > h(w, p)
              ? g(
                  Math.ceil(
                    (31 -
                      w.getDate() +
                      (Kc(Jc(p.getFullYear()) ? Lc : Mc, p.getMonth() - 1) -
                        31) +
                      p.getDate()) /
                      7,
                  ),
                  2,
                )
              : 0 === h(w, u)
                ? "01"
                : "00";
          },
          "%V": function (p) {
            var u = new Date(p.ae + 1901, 0, 4),
              w = m(new Date(p.ae + 1900, 0, 4));
            u = m(u);
            var E = Pc(new Date(p.ae + 1900, 0, 1), p.af);
            return 0 > h(E, w)
              ? "53"
              : 0 >= h(u, E)
                ? "01"
                : g(
                    Math.ceil(
                      (w.getFullYear() < p.ae + 1900
                        ? p.af + 32 - w.getDate()
                        : p.af + 1 - w.getDate()) / 7,
                    ),
                    2,
                  );
          },
          "%w": function (p) {
            return p.$e;
          },
          "%W": function (p) {
            var u = new Date(p.ae, 0, 1),
              w =
                1 === u.getDay()
                  ? u
                  : Pc(u, 0 === u.getDay() ? 1 : 7 - u.getDay() + 1);
            p = new Date(p.ae + 1900, p.Ce, p.Ne);
            return 0 > h(w, p)
              ? g(
                  Math.ceil(
                    (31 -
                      w.getDate() +
                      (Kc(Jc(p.getFullYear()) ? Lc : Mc, p.getMonth() - 1) -
                        31) +
                      p.getDate()) /
                      7,
                  ),
                  2,
                )
              : 0 === h(w, u)
                ? "01"
                : "00";
          },
          "%y": function (p) {
            return (p.ae + 1900).toString().substring(2);
          },
          "%Y": function (p) {
            return p.ae + 1900;
          },
          "%z": function (p) {
            p = p.Lg;
            var u = 0 <= p;
            p = Math.abs(p) / 60;
            return (
              (u ? "+" : "-") +
              String("0000" + ((p / 60) * 100 + (p % 60))).slice(-4)
            );
          },
          "%Z": function (p) {
            return p.Og;
          },
          "%%": function () {
            return "%";
          },
        };
        for (t in q)
          0 <= c.indexOf(t) && (c = c.replace(new RegExp(t, "g"), q[t](d)));
        t = Ib(c, !1);
        if (t.length > b) return 0;
        x.set(t, a);
        return t.length - 1;
      },
      r: function (a) {
        switch (a) {
          case 30:
            return 16384;
          case 85:
            return 65536;
          case 132:
          case 133:
          case 12:
          case 137:
          case 138:
          case 15:
          case 235:
          case 16:
          case 17:
          case 18:
          case 19:
          case 20:
          case 149:
          case 13:
          case 10:
          case 236:
          case 153:
          case 9:
          case 21:
          case 22:
          case 159:
          case 154:
          case 14:
          case 77:
          case 78:
          case 139:
          case 80:
          case 81:
          case 82:
          case 68:
          case 67:
          case 164:
          case 11:
          case 29:
          case 47:
          case 48:
          case 95:
          case 52:
          case 51:
          case 46:
          case 79:
            return 200809;
          case 27:
          case 246:
          case 127:
          case 128:
          case 23:
          case 24:
          case 160:
          case 161:
          case 181:
          case 182:
          case 242:
          case 183:
          case 184:
          case 243:
          case 244:
          case 245:
          case 165:
          case 178:
          case 179:
          case 49:
          case 50:
          case 168:
          case 169:
          case 175:
          case 170:
          case 171:
          case 172:
          case 97:
          case 76:
          case 32:
          case 173:
          case 35:
            return -1;
          case 176:
          case 177:
          case 7:
          case 155:
          case 8:
          case 157:
          case 125:
          case 126:
          case 92:
          case 93:
          case 129:
          case 130:
          case 131:
          case 94:
          case 91:
            return 1;
          case 74:
          case 60:
          case 69:
          case 70:
          case 4:
            return 1024;
          case 31:
          case 42:
          case 72:
            return 32;
          case 87:
          case 26:
          case 33:
            return 2147483647;
          case 34:
          case 1:
            return 47839;
          case 38:
          case 36:
            return 99;
          case 43:
          case 37:
            return 2048;
          case 0:
            return 2097152;
          case 3:
            return 65536;
          case 28:
            return 32768;
          case 44:
            return 32767;
          case 75:
            return 16384;
          case 39:
            return 1e3;
          case 89:
            return 700;
          case 71:
            return 256;
          case 40:
            return 255;
          case 2:
            return 100;
          case 180:
            return 64;
          case 25:
            return 20;
          case 5:
            return 16;
          case 6:
            return 6;
          case 73:
            return 4;
          case 84:
            return "object" === typeof navigator
              ? navigator.hardwareConcurrency || 1
              : 1;
        }
        mb(28);
        return -1;
      },
      p: function (a) {
        var b = (Date.now() / 1e3) | 0;
        a && (D[a >> 2] = b);
        return b;
      },
      u: Ic,
    };
    (function () {
      function a(f) {
        e.asm = f.exports;
        G = e.asm.qd;
        cb();
      }
      function b(f) {
        a(f.instance);
      }
      function c(f) {
        return ib()
          .then(function (g) {
            return WebAssembly.instantiate(g, d);
          })
          .then(f, function (g) {
            k("failed to asynchronously prepare wasm: " + g);
            n(g);
          });
      }
      var d = { a: qd };
      bb();
      if (e.instantiateWasm)
        try {
          return e.instantiateWasm(d, a);
        } catch (f) {
          return (
            k("Module.instantiateWasm callback failed with error: " + f), !1
          );
        }
      (function () {
        return va ||
          "function" !== typeof WebAssembly.instantiateStreaming ||
          fb() ||
          db("file://") ||
          "function" !== typeof fetch
          ? c(b)
          : fetch(eb, { credentials: "same-origin" }).then(function (f) {
              return WebAssembly.instantiateStreaming(f, d).then(
                b,
                function (g) {
                  k("wasm streaming compile failed: " + g);
                  k("falling back to ArrayBuffer instantiation");
                  return c(b);
                },
              );
            });
      })().catch(ba);
      return {};
    })();
    var Tc = (e.___wasm_call_ctors = function () {
        return (Tc = e.___wasm_call_ctors = e.asm.rd).apply(null, arguments);
      }),
      Wc = (e._free = function () {
        return (Wc = e._free = e.asm.sd).apply(null, arguments);
      }),
      Vc = (e._memset = function () {
        return (Vc = e._memset = e.asm.td).apply(null, arguments);
      }),
      Ia = (e._malloc = function () {
        return (Ia = e._malloc = e.asm.ud).apply(null, arguments);
      }),
      nb = (e.___errno_location = function () {
        return (nb = e.___errno_location = e.asm.vd).apply(null, arguments);
      });
    e._fflush = function () {
      return (e._fflush = e.asm.wd).apply(null, arguments);
    };
    var Uc = (e._memalign = function () {
        return (Uc = e._memalign = e.asm.xd).apply(null, arguments);
      }),
      cc = (e._ntohs = function () {
        return (cc = e._ntohs = e.asm.yd).apply(null, arguments);
      }),
      Vb = (e._htons = function () {
        return (Vb = e._htons = e.asm.zd).apply(null, arguments);
      });
    e._main = function () {
      return (e._main = e.asm.Ad).apply(null, arguments);
    };
    var Xc = (e._htonl = function () {
        return (Xc = e._htonl = e.asm.Bd).apply(null, arguments);
      }),
      ub = (e.__get_tzname = function () {
        return (ub = e.__get_tzname = e.asm.Cd).apply(null, arguments);
      }),
      tb = (e.__get_daylight = function () {
        return (tb = e.__get_daylight = e.asm.Dd).apply(null, arguments);
      }),
      sb = (e.__get_timezone = function () {
        return (sb = e.__get_timezone = e.asm.Ed).apply(null, arguments);
      }),
      y = (e.stackSave = function () {
        return (y = e.stackSave = e.asm.Fd).apply(null, arguments);
      }),
      A = (e.stackRestore = function () {
        return (A = e.stackRestore = e.asm.Gd).apply(null, arguments);
      }),
      Aa = (e.stackAlloc = function () {
        return (Aa = e.stackAlloc = e.asm.Hd).apply(null, arguments);
      }),
      Z = (e._setThrew = function () {
        return (Z = e._setThrew = e.asm.Id).apply(null, arguments);
      }),
      rd = (e.dynCall_vijjjid = function () {
        return (rd = e.dynCall_vijjjid = e.asm.Jd).apply(null, arguments);
      }),
      sd = (e.dynCall_iiiijj = function () {
        return (sd = e.dynCall_iiiijj = e.asm.Kd).apply(null, arguments);
      }),
      td = (e.dynCall_iij = function () {
        return (td = e.dynCall_iij = e.asm.Ld).apply(null, arguments);
      });
    e._ff_h264_cabac_tables = 2121190;
    function $c(a, b, c) {
      var d = y();
      try {
        return G.get(a)(b, c);
      } catch (f) {
        A(d);
        if (f !== f + 0 && "longjmp" !== f) throw f;
        Z(1, 0);
      }
    }
    function kd(a, b) {
      var c = y();
      try {
        G.get(a)(b);
      } catch (d) {
        A(c);
        if (d !== d + 0 && "longjmp" !== d) throw d;
        Z(1, 0);
      }
    }
    function md(a, b, c, d, f) {
      var g = y();
      try {
        G.get(a)(b, c, d, f);
      } catch (h) {
        A(g);
        if (h !== h + 0 && "longjmp" !== h) throw h;
        Z(1, 0);
      }
    }
    function ld(a, b, c) {
      var d = y();
      try {
        G.get(a)(b, c);
      } catch (f) {
        A(d);
        if (f !== f + 0 && "longjmp" !== f) throw f;
        Z(1, 0);
      }
    }
    function bd(a, b, c, d, f) {
      var g = y();
      try {
        return G.get(a)(b, c, d, f);
      } catch (h) {
        A(g);
        if (h !== h + 0 && "longjmp" !== h) throw h;
        Z(1, 0);
      }
    }
    function hd(a, b, c, d, f, g, h, m, r) {
      var q = y();
      try {
        return G.get(a)(b, c, d, f, g, h, m, r);
      } catch (t) {
        A(q);
        if (t !== t + 0 && "longjmp" !== t) throw t;
        Z(1, 0);
      }
    }
    function Yc(a) {
      var b = y();
      try {
        return G.get(a)();
      } catch (c) {
        A(b);
        if (c !== c + 0 && "longjmp" !== c) throw c;
        Z(1, 0);
      }
    }
    function Zc(a, b) {
      var c = y();
      try {
        return G.get(a)(b);
      } catch (d) {
        A(c);
        if (d !== d + 0 && "longjmp" !== d) throw d;
        Z(1, 0);
      }
    }
    function ad(a, b, c, d) {
      var f = y();
      try {
        return G.get(a)(b, c, d);
      } catch (g) {
        A(f);
        if (g !== g + 0 && "longjmp" !== g) throw g;
        Z(1, 0);
      }
    }
    function od(a, b, c, d, f, g, h, m, r) {
      var q = y();
      try {
        G.get(a)(b, c, d, f, g, h, m, r);
      } catch (t) {
        A(q);
        if (t !== t + 0 && "longjmp" !== t) throw t;
        Z(1, 0);
      }
    }
    function cd(a, b, c, d, f, g) {
      var h = y();
      try {
        return G.get(a)(b, c, d, f, g);
      } catch (m) {
        A(h);
        if (m !== m + 0 && "longjmp" !== m) throw m;
        Z(1, 0);
      }
    }
    function nd(a, b, c, d, f, g, h) {
      var m = y();
      try {
        G.get(a)(b, c, d, f, g, h);
      } catch (r) {
        A(m);
        if (r !== r + 0 && "longjmp" !== r) throw r;
        Z(1, 0);
      }
    }
    function pd(a, b, c, d, f, g, h, m, r, q) {
      var t = y();
      try {
        rd(a, b, c, d, f, g, h, m, r, q);
      } catch (v) {
        A(t);
        if (v !== v + 0 && "longjmp" !== v) throw v;
        Z(1, 0);
      }
    }
    function id(a, b, c, d, f, g, h, m) {
      var r = y();
      try {
        return sd(a, b, c, d, f, g, h, m);
      } catch (q) {
        A(r);
        if (q !== q + 0 && "longjmp" !== q) throw q;
        Z(1, 0);
      }
    }
    function jd(a, b, c, d) {
      var f = y();
      try {
        return td(a, b, c, d);
      } catch (g) {
        A(f);
        if (g !== g + 0 && "longjmp" !== g) throw g;
        Z(1, 0);
      }
    }
    e.ccall = za;
    e.cwrap = function (a, b, c, d) {
      c = c || [];
      var f = c.every(function (g) {
        return "number" === g;
      });
      return "string" !== b && f && !d
        ? ya(a)
        : function () {
            return za(a, b, c, arguments, d);
          };
    };
    e.setValue = function (a, b, c) {
      c = c || "i8";
      "*" === c.charAt(c.length - 1) && (c = "i32");
      switch (c) {
        case "i1":
          x[a >> 0] = b;
          break;
        case "i8":
          x[a >> 0] = b;
          break;
        case "i16":
          Ma[a >> 1] = b;
          break;
        case "i32":
          D[a >> 2] = b;
          break;
        case "i64":
          I = [
            b >>> 0,
            ((H = b),
            1 <= +Math.abs(H)
              ? 0 < H
                ? (Math.min(+Math.floor(H / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((H - +(~~H >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          D[a >> 2] = I[0];
          D[(a + 4) >> 2] = I[1];
          break;
        case "float":
          F[a >> 2] = b;
          break;
        case "double":
          Pa[a >> 3] = b;
          break;
        default:
          n("invalid type for setValue: " + c);
      }
    };
    e.UTF8ToString = z;
    e.stringToUTF8 = Ba;
    e.lengthBytesUTF8 = Ga;
    e.writeAsciiToMemory = Ka;
    e.FS = J;
    var ud;
    function ca(a) {
      this.name = "ExitStatus";
      this.message = "Program terminated with exit(" + a + ")";
      this.status = a;
    }
    ab = function vd() {
      ud || wd();
      ud || (ab = vd);
    };
    function wd(a) {
      function b() {
        if (!ud && ((ud = !0), (e.calledRun = !0), !xa)) {
          e.noFSInit || J.Fe.lf || J.Fe();
          M.root = J.Ud(M, {}, null);
          jb(Ta);
          J.Sf = !1;
          jb(Ua);
          aa(e);
          if (e.onRuntimeInitialized) e.onRuntimeInitialized();
          if (xd) {
            var c = a,
              d = e._main;
            c = c || [];
            var f = c.length + 1,
              g = Aa(4 * (f + 1));
            D[g >> 2] = Ja(ja);
            for (var h = 1; h < f; h++) D[(g >> 2) + h] = Ja(c[h - 1]);
            D[(g >> 2) + f] = 0;
            try {
              var m = d(f, g);
              da(m, !0);
            } catch (r) {
              r instanceof ca ||
                ("unwind" == r
                  ? (noExitRuntime = !0)
                  : ((c = r) &&
                      "object" === typeof r &&
                      r.stack &&
                      (c = [r, r.stack]),
                    k("exception thrown: " + c),
                    ka(1, r)));
            } finally {
            }
          }
          if (e.postRun)
            for (
              "function" == typeof e.postRun && (e.postRun = [e.postRun]);
              e.postRun.length;

            )
              (c = e.postRun.shift()), Wa.unshift(c);
          jb(Wa);
        }
      }
      a = a || ia;
      if (!(0 < Za)) {
        if (e.preRun)
          for (
            "function" == typeof e.preRun && (e.preRun = [e.preRun]);
            e.preRun.length;

          )
            Xa();
        jb(Sa);
        0 < Za ||
          (e.setStatus
            ? (e.setStatus("Running..."),
              setTimeout(function () {
                setTimeout(function () {
                  e.setStatus("");
                }, 1);
                b();
              }, 1))
            : b());
      }
    }
    e.run = wd;
    function da(a, b) {
      if (!b || !noExitRuntime || 0 !== a) {
        if (!noExitRuntime) {
          jb(Va);
          J.quit();
          if (e.onExit) e.onExit(a);
          xa = !0;
        }
        ka(a, new ca(a));
      }
    }
    if (e.preInit)
      for (
        "function" == typeof e.preInit && (e.preInit = [e.preInit]);
        0 < e.preInit.length;

      )
        e.preInit.pop()();
    var xd = !1;
    e.noInitialRun && (xd = !1);
    wd();

    return createFFprobeCore.ready;
  };
})();
if (typeof exports === "object" && typeof module === "object")
  module.exports = createFFprobeCore;
else if (typeof define === "function" && define["amd"])
  define([], function () {
    return createFFprobeCore;
  });
else if (typeof exports === "object")
  exports["createFFprobeCore"] = createFFprobeCore;

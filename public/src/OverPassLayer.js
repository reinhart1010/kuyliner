! function(t) {
    function e(n) {
        if (i[n]) return i[n].exports;
        var o = i[n] = {
            i: n,
            l: !1,
            exports: {}
        };
        return t[n].call(o.exports, o, o.exports, e), o.l = !0, o.exports
    }
    var i = {};
    e.m = t, e.c = i, e.d = function(t, i, n) {
        e.o(t, i) || Object.defineProperty(t, i, {
            configurable: !1,
            enumerable: !0,
            get: n
        })
    }, e.n = function(t) {
        var i = t && t.__esModule ? function() {
            return t.default
        } : function() {
            return t
        };
        return e.d(i, "a", i), i
    }, e.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }, e.p = "", e(e.s = 1)
}([function(t, e) {
    t.exports = L
}, function(t, e, i) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var o = i(0),
        r = n(o),
        s = i(2),
        l = n(s);
    i(3), i(4);
    var p = r.default.FeatureGroup.extend({
        options: {
            debug: !1,
            minZoom: 15,
            endPoint: "https://overpass-api.de/api/",
            query: "(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;",
            loadedBounds: [],
            markerIcon: null,
            timeout: 3e4,
            retryOnTimeout: !1,
            noInitialRequest: !1,
            beforeRequest: function() {},
            afterRequest: function() {},
            onSuccess: function(t) {
                for (var e = 0; e < t.elements.length; e++) {
                    var i = void 0,
                        n = void 0,
                        o = t.elements[e],
                        fillcolor = getColor(o.tags.name || o.tags["name:en"]);
                    if (!(o.id in this._ids)) {
                        addToNearby(o);
                        this._ids[o.id] = !0, i = "node" === o.type ? r.default.latLng(o.lat, o.lon) : r.default.latLng(o.center.lat, o.center.lon), n = this.options.markerIcon ? r.default.marker(i, {
                            icon: this.options.markerIcon
                        }) : r.default.circle(i, 5, {
                            stroke: !1,
                            fillColor: fillcolor,
                            fillOpacity: .9
                        });
                        var s = this._getPoiPopupHTML(o, fillcolor),
                            l = r.default.popup().setContent(s);
                        n.bindPopup(l), this._markers.addLayer(n);
                    }
                };
                getNearby();
            },
            onError: function() {},
            onTimeout: function() {},
            minZoomIndicatorEnabled: !0,
            minZoomIndicatorOptions: {
                minZoomMessageNoLayer: "No layer assigned",
                minZoomMessage: "Current zoom Level: CURRENTZOOM. Data are visible at Level: MINZOOMLEVEL."
            }
        },
        initialize: function(t) {
            r.default.Util.setOptions(this, t), this._ids = {}, this._loadedBounds = t.loadedBounds || [], this._requestInProgress = !1
        },
        _getPoiPopupHTML: function(t, c) {
          return parseOsmData(t, c);
        },
        _buildRequestBox: function(t) {
            return r.default.rectangle(t, {
                bounds: t,
                color: "#204a87",
                stroke: !1,
                fillOpacity: .0,
                clickable: !1
            })
        },
        _addRequestBox: function(t) {
            return this._requestBoxes.addLayer(t)
        },
        _getRequestBoxes: function() {
            return this._requestBoxes.getLayers()
        },
        _removeRequestBox: function(t) {
            this._requestBoxes.removeLayer(t)
        },
        _removeRequestBoxes: function() {
            return this._requestBoxes.clearLayers()
        },
        _addResponseBox: function(t) {
            return this._responseBoxes.addLayer(t)
        },
        _addResponseBoxes: function(t) {
            var e = this;
            this._removeRequestBoxes(), t.forEach(function(t) {
                t.setStyle({
                    color: "black",
                    weight: 2
                }), e._addResponseBox(t)
            })
        },
        _isFullyLoadedBounds: function(t, e) {
            if (0 === e.length) return !1;
            var i = this._buildClipsFromBounds([t]),
                n = this._buildClipsFromBounds(e),
                o = new l.default.Clipper,
                r = new l.default.PolyTree;
            return o.AddPaths(i, l.default.PolyType.ptSubject, !0), o.AddPaths(n, l.default.PolyType.ptClip, !0), o.Execute(l.default.ClipType.ctDifference, r, l.default.PolyFillType.pftNonZero, l.default.PolyFillType.pftNonZero), 0 === l.default.JS.PolyTreeToExPolygons(r).length
        },
        _getLoadedBounds: function() {
            return this._loadedBounds
        },
        _addLoadedBounds: function(t) {
            this._loadedBounds.push(t)
        },
        _buildClipsFromBounds: function(t) {
            return t.map(function(t) {
                return [{
                    X: 1e6 * t._southWest.lng,
                    Y: 1e6 * t._southWest.lat
                }, {
                    X: 1e6 * t._southWest.lng,
                    Y: 1e6 * t._northEast.lat
                }, {
                    X: 1e6 * t._northEast.lng,
                    Y: 1e6 * t._northEast.lat
                }, {
                    X: 1e6 * t._northEast.lng,
                    Y: 1e6 * t._southWest.lat
                }]
            })
        },
        _buildBoundsFromClips: function(t) {
            return t.map(function(t) {
                return r.default.latLngBounds(r.default.latLng(t[0].Y / 1e6, t[0].X / 1e6).wrap(), r.default.latLng(t[2].Y / 1e6, t[2].X / 1e6).wrap())
            })
        },
        _buildOverpassQueryFromQueryAndBounds: function(t, e) {
            var i = e._southWest,
                n = e._northEast,
                o = [i.lat, i.lng, n.lat, n.lng].join(",");
            return t = t.replace(/(\/\/.*)/g, ""), t = t.replace(/(\{\{bbox\}\})/g, o)
        },
        _buildOverpassUrlFromEndPointAndQuery: function(t, e) {
            return t + "interpreter?data=[out:json];" + e
        },
        _buildLargerBounds: function(t) {
            var e = Math.abs(t._northEast.lng - t._southWest.lng),
                i = Math.abs(t._northEast.lat - t._southWest.lat),
                n = e > i ? e : i;
            return t._southWest.lat -= n / 2, t._southWest.lng -= n / 2, t._northEast.lat += n / 2, t._northEast.lng += n / 2, r.default.latLngBounds(r.default.latLng(t._southWest.lat, t._southWest.lng).wrap(), r.default.latLng(t._northEast.lat, t._northEast.lng).wrap())
        },
        _setRequestInProgress: function(t) {
            this._requestInProgress = t
        },
        _isRequestInProgress: function() {
            return this._requestInProgress
        },
        _hasNextRequest: function() {
            return !!this._nextRequest
        },
        _getNextRequest: function() {
            return this._nextRequest
        },
        _setNextRequest: function(t) {
            this._nextRequest = t
        },
        _removeNextRequest: function() {
            this._nextRequest = null
        },
        _prepareRequest: function() {
            if (this._map.getZoom() < this.options.minZoom) return !1;
            var t = this._buildLargerBounds(this._map.getBounds()),
                e = this._sendRequest.bind(this, t);
            this._isRequestInProgress() ? this._setNextRequest(e) : (this._removeNextRequest(), e())
        },
        _sendRequest: function(t) {
            var e = this,
                i = this._getLoadedBounds();
            if (this._isFullyLoadedBounds(t, i)) return void this._setRequestInProgress(!1);
            var n = this._buildLargerBounds(t),
                o = this._buildOverpassUrlFromEndPointAndQuery(this.options.endPoint, this._buildOverpassQueryFromQueryAndBounds(this.options.query, n)),
                r = new XMLHttpRequest;
            if (!1 === this.options.beforeRequest.call(this)) return void this.options.afterRequest.call(this);
            this._setRequestInProgress(!0), this.options.debug && this._addRequestBox(this._buildRequestBox(n)), r.open("GET", o, !0), r.timeout = this.options.timeout, r.ontimeout = function() {
                return e._onRequestTimeout(r, o, n)
            }, r.onload = function() {
                return e._onRequestLoad(r, n)
            }, r.send()
        },
        _onRequestLoad: function(t, e) {
            t.status >= 200 && t.status < 400 ? (this.options.onSuccess.call(this, JSON.parse(t.response)), this._onRequestLoadCallback(e)) : (this._onRequestErrorCallback(e), this.options.onError.call(this, t)), this._onRequestCompleteCallback(e)
        },
        _onRequestTimeout: function(t, e, i) {
            this.options.onTimeout.call(this, t), this.options.retryOnTimeout ? this._sendRequest(e) : (this._onRequestErrorCallback(i), this._onRequestCompleteCallback(i))
        },
        _onRequestLoadCallback: function(t) {
            this._addLoadedBounds(t), this.options.debug && this._addResponseBoxes(this._getRequestBoxes())
        },
        _onRequestErrorCallback: function(t) {
            this.options.debug && this._removeRequestBox(this._buildRequestBox(t))
        },
        _onRequestCompleteCallback: function() {
            if (this.options.afterRequest.call(this), this._hasNextRequest()) {
                var t = this._getNextRequest();
                this._removeNextRequest(), t()
            } else this._setRequestInProgress(!1)
        },
        onAdd: function(t) {
            this._map = t, !0 === this.options.minZoomIndicatorEnabled && (this._map.zoomIndicator ? (this._zoomControl = this._map.zoomIndicator, this._zoomControl._addLayer(this)) : (this._zoomControl = new r.default.Control.MinZoomIndicator(this.options.minZoomIndicatorOptions), this._map.addControl(this._zoomControl), this._zoomControl._addLayer(this))), this.options.debug && (this._requestBoxes = r.default.featureGroup().addTo(this._map), this._responseBoxes = r.default.featureGroup().addTo(this._map)), this._markers = r.default.featureGroup().addTo(this._map), this.options.noInitialRequest || this._prepareRequest(), this._map.on("moveend", this._prepareRequest, this)
        },
        onRemove: function(t) {
            r.default.LayerGroup.prototype.onRemove.call(this, t), this._resetData(), t.off("moveend", this._prepareRequest, this), this._map = null
        },
        setQuery: function(t) {
            this.options.query = t, this._resetData(), this._prepareRequest()
        },
        _resetData: function() {
            this._ids = {}, this._loadedBounds = [], this._requestInProgress = !1, this._markers.clearLayers(), this.options.debug && (this._requestBoxes.clearLayers(), this._responseBoxes.clearLayers())
        },
        getData: function() {
            return this._data
        }
    });
    r.default.OverPassLayer = p, r.default.overpassLayer = function(t) {
        return new r.default.OverPassLayer(t)
    }, e.default = p
}, function(t, e, i) {
    "use strict";

    function n(t, e, i) {
        ee.biginteger_used = 1, null != t && ("number" == typeof t && void 0 === e ? this.fromInt(t) : "number" == typeof t ? this.fromNumber(t, e, i) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e))
    }

    function o() {
        return new n(null)
    }

    function r(t, e, i, n, o, r) {
        for (; --r >= 0;) {
            var s = e * this[t++] + i[n] + o;
            o = Math.floor(s / 67108864), i[n++] = 67108863 & s
        }
        return o
    }

    function s(t, e, i, n, o, r) {
        for (var s = 32767 & e, l = e >> 15; --r >= 0;) {
            var p = 32767 & this[t],
                u = this[t++] >> 15,
                a = l * p + u * s;
            p = s * p + ((32767 & a) << 15) + i[n] + (1073741823 & o), o = (p >>> 30) + (a >>> 15) + l * u + (o >>> 30), i[n++] = 1073741823 & p
        }
        return o
    }

    function l(t, e, i, n, o, r) {
        for (var s = 16383 & e, l = e >> 14; --r >= 0;) {
            var p = 16383 & this[t],
                u = this[t++] >> 14,
                a = l * p + u * s;
            p = s * p + ((16383 & a) << 14) + i[n] + o, o = (p >> 28) + (a >> 14) + l * u, i[n++] = 268435455 & p
        }
        return o
    }

    function p(t) {
        return ue.charAt(t)
    }

    function u(t, e) {
        var i = ae[t.charCodeAt(e)];
        return null == i ? -1 : i
    }

    function a(t) {
        for (var e = this.t - 1; e >= 0; --e) t[e] = this[e];
        t.t = this.t, t.s = this.s
    }

    function h(t) {
        this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + this.DV : this.t = 0
    }

    function d(t) {
        var e = o();
        return e.fromInt(t), e
    }

    function f(t, e) {
        var i;
        if (16 == e) i = 4;
        else if (8 == e) i = 3;
        else if (256 == e) i = 8;
        else if (2 == e) i = 1;
        else if (32 == e) i = 5;
        else {
            if (4 != e) return void this.fromRadix(t, e);
            i = 2
        }
        this.t = 0, this.s = 0;
        for (var o = t.length, r = !1, s = 0; --o >= 0;) {
            var l = 8 == i ? 255 & t[o] : u(t, o);
            l < 0 ? "-" == t.charAt(o) && (r = !0) : (r = !1, 0 == s ? this[this.t++] = l : s + i > this.DB ? (this[this.t - 1] |= (l & (1 << this.DB - s) - 1) << s, this[this.t++] = l >> this.DB - s) : this[this.t - 1] |= l << s, (s += i) >= this.DB && (s -= this.DB))
        }
        8 == i && 0 != (128 & t[0]) && (this.s = -1, s > 0 && (this[this.t - 1] |= (1 << this.DB - s) - 1 << s)), this.clamp(), r && n.ZERO.subTo(this, this)
    }

    function P() {
        for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;) --this.t
    }

    function m(t) {
        if (this.s < 0) return "-" + this.negate().toString(t);
        var e;
        if (16 == t) e = 4;
        else if (8 == t) e = 3;
        else if (2 == t) e = 1;
        else if (32 == t) e = 5;
        else {
            if (4 != t) return this.toRadix(t);
            e = 2
        }
        var i, n = (1 << e) - 1,
            o = !1,
            r = "",
            s = this.t,
            l = this.DB - s * this.DB % e;
        if (s-- > 0)
            for (l < this.DB && (i = this[s] >> l) > 0 && (o = !0, r = p(i)); s >= 0;) l < e ? (i = (this[s] & (1 << l) - 1) << e - l, i |= this[--s] >> (l += this.DB - e)) : (i = this[s] >> (l -= e) & n, l <= 0 && (l += this.DB, --s)), i > 0 && (o = !0), o && (r += p(i));
        return o ? r : "0"
    }

    function c() {
        var t = o();
        return n.ZERO.subTo(this, t), t
    }

    function y() {
        return this.s < 0 ? this.negate() : this
    }

    function v(t) {
        var e = this.s - t.s;
        if (0 != e) return e;
        var i = this.t;
        if (0 != (e = i - t.t)) return this.s < 0 ? -e : e;
        for (; --i >= 0;)
            if (0 != (e = this[i] - t[i])) return e;
        return 0
    }

    function _(t) {
        var e, i = 1;
        return 0 != (e = t >>> 16) && (t = e, i += 16), 0 != (e = t >> 8) && (t = e, i += 8), 0 != (e = t >> 4) && (t = e, i += 4), 0 != (e = t >> 2) && (t = e, i += 2), 0 != (e = t >> 1) && (t = e, i += 1), i
    }

    function C() {
        return this.t <= 0 ? 0 : this.DB * (this.t - 1) + _(this[this.t - 1] ^ this.s & this.DM)
    }

    function I(t, e) {
        var i;
        for (i = this.t - 1; i >= 0; --i) e[i + t] = this[i];
        for (i = t - 1; i >= 0; --i) e[i] = 0;
        e.t = this.t + t, e.s = this.s
    }

    function x(t, e) {
        for (var i = t; i < this.t; ++i) e[i - t] = this[i];
        e.t = Math.max(this.t - t, 0), e.s = this.s
    }

    function g(t, e) {
        var i, n = t % this.DB,
            o = this.DB - n,
            r = (1 << o) - 1,
            s = Math.floor(t / this.DB),
            l = this.s << n & this.DM;
        for (i = this.t - 1; i >= 0; --i) e[i + s + 1] = this[i] >> o | l, l = (this[i] & r) << n;
        for (i = s - 1; i >= 0; --i) e[i] = 0;
        e[s] = l, e.t = this.t + s + 1, e.s = this.s, e.clamp()
    }

    function L(t, e) {
        e.s = this.s;
        var i = Math.floor(t / this.DB);
        if (i >= this.t) return void(e.t = 0);
        var n = t % this.DB,
            o = this.DB - n,
            r = (1 << n) - 1;
        e[0] = this[i] >> n;
        for (var s = i + 1; s < this.t; ++s) e[s - i - 1] |= (this[s] & r) << o, e[s - i] = this[s] >> n;
        n > 0 && (e[this.t - i - 1] |= (this.s & r) << o), e.t = this.t - i, e.clamp()
    }

    function E(t, e) {
        for (var i = 0, n = 0, o = Math.min(t.t, this.t); i < o;) n += this[i] - t[i], e[i++] = n & this.DM, n >>= this.DB;
        if (t.t < this.t) {
            for (n -= t.s; i < this.t;) n += this[i], e[i++] = n & this.DM, n >>= this.DB;
            n += this.s
        } else {
            for (n += this.s; i < t.t;) n -= t[i], e[i++] = n & this.DM, n >>= this.DB;
            n -= t.s
        }
        e.s = n < 0 ? -1 : 0, n < -1 ? e[i++] = this.DV + n : n > 0 && (e[i++] = n), e.t = i, e.clamp()
    }

    function T(t, e) {
        var i = this.abs(),
            o = t.abs(),
            r = i.t;
        for (e.t = r + o.t; --r >= 0;) e[r] = 0;
        for (r = 0; r < o.t; ++r) e[r + i.t] = i.am(0, o[r], e, r, 0, i.t);
        e.s = 0, e.clamp(), this.s != t.s && n.ZERO.subTo(e, e)
    }

    function X(t) {
        for (var e = this.abs(), i = t.t = 2 * e.t; --i >= 0;) t[i] = 0;
        for (i = 0; i < e.t - 1; ++i) {
            var n = e.am(i, e[i], t, 2 * i, 0, 1);
            (t[i + e.t] += e.am(i + 1, 2 * e[i], t, 2 * i + 1, n, e.t - i - 1)) >= e.DV && (t[i + e.t] -= e.DV, t[i + e.t + 1] = 1)
        }
        t.t > 0 && (t[t.t - 1] += e.am(i, e[i], t, 2 * i, 0, 1)), t.s = 0, t.clamp()
    }

    function O(t, e, i) {
        var r = t.abs();
        if (!(r.t <= 0)) {
            var s = this.abs();
            if (s.t < r.t) return null != e && e.fromInt(0), void(null != i && this.copyTo(i));
            null == i && (i = o());
            var l = o(),
                p = this.s,
                u = t.s,
                a = this.DB - _(r[r.t - 1]);
            a > 0 ? (r.lShiftTo(a, l), s.lShiftTo(a, i)) : (r.copyTo(l), s.copyTo(i));
            var h = l.t,
                d = l[h - 1];
            if (0 != d) {
                var f = d * (1 << this.F1) + (h > 1 ? l[h - 2] >> this.F2 : 0),
                    P = this.FV / f,
                    m = (1 << this.F1) / f,
                    c = 1 << this.F2,
                    y = i.t,
                    v = y - h,
                    C = null == e ? o() : e;
                for (l.dlShiftTo(v, C), i.compareTo(C) >= 0 && (i[i.t++] = 1, i.subTo(C, i)), n.ONE.dlShiftTo(h, C), C.subTo(l, l); l.t < h;) l[l.t++] = 0;
                for (; --v >= 0;) {
                    var I = i[--y] == d ? this.DM : Math.floor(i[y] * P + (i[y - 1] + c) * m);
                    if ((i[y] += l.am(0, I, i, v, 0, h)) < I)
                        for (l.dlShiftTo(v, C), i.subTo(C, i); i[y] < --I;) i.subTo(C, i)
                }
                null != e && (i.drShiftTo(h, e), p != u && n.ZERO.subTo(e, e)), i.t = h, i.clamp(), a > 0 && i.rShiftTo(a, i), p < 0 && n.ZERO.subTo(i, i)
            }
        }
    }

    function N(t) {
        var e = o();
        return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(n.ZERO) > 0 && t.subTo(e, e), e
    }

    function Y(t) {
        this.m = t
    }

    function S(t) {
        return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t
    }

    function A(t) {
        return t
    }

    function B(t) {
        t.divRemTo(this.m, null, t)
    }

    function D(t, e, i) {
        t.multiplyTo(e, i), this.reduce(i)
    }

    function R(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function b() {
        if (this.t < 1) return 0;
        var t = this[0];
        if (0 == (1 & t)) return 0;
        var e = 3 & t;
        return e = e * (2 - (15 & t) * e) & 15, e = e * (2 - (255 & t) * e) & 255, e = e * (2 - ((65535 & t) * e & 65535)) & 65535, e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e
    }

    function M(t) {
        this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t
    }

    function w(t) {
        var e = o();
        return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(n.ZERO) > 0 && this.m.subTo(e, e), e
    }

    function F(t) {
        var e = o();
        return t.copyTo(e), this.reduce(e), e
    }

    function q(t) {
        for (; t.t <= this.mt2;) t[t.t++] = 0;
        for (var e = 0; e < this.m.t; ++e) {
            var i = 32767 & t[e],
                n = i * this.mpl + ((i * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
            for (i = e + this.m.t, t[i] += this.m.am(0, n, t, e, 0, this.m.t); t[i] >= t.DV;) t[i] -= t.DV, t[++i]++
        }
        t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t)
    }

    function W(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function k(t, e, i) {
        t.multiplyTo(e, i), this.reduce(i)
    }

    function H() {
        return 0 == (this.t > 0 ? 1 & this[0] : this.s)
    }

    function U(t, e) {
        if (t > 4294967295 || t < 1) return n.ONE;
        var i = o(),
            r = o(),
            s = e.convert(this),
            l = _(t) - 1;
        for (s.copyTo(i); --l >= 0;)
            if (e.sqrTo(i, r), (t & 1 << l) > 0) e.mulTo(r, s, i);
            else {
                var p = i;
                i = r, r = p
            } return e.revert(i)
    }

    function z(t, e) {
        var i;
        return i = t < 256 || e.isEven() ? new Y(e) : new M(e), this.exp(t, i)
    }

    function J() {
        var t = o();
        return this.copyTo(t), t
    }

    function j() {
        if (this.s < 0) {
            if (1 == this.t) return this[0] - this.DV;
            if (0 == this.t) return -1
        } else {
            if (1 == this.t) return this[0];
            if (0 == this.t) return 0
        }
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
    }

    function G() {
        return 0 == this.t ? this.s : this[0] << 24 >> 24
    }

    function Z() {
        return 0 == this.t ? this.s : this[0] << 16 >> 16
    }

    function V(t) {
        return Math.floor(Math.LN2 * this.DB / Math.log(t))
    }

    function Q() {
        return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1
    }

    function $(t) {
        if (null == t && (t = 10), 0 == this.signum() || t < 2 || t > 36) return "0";
        var e = this.chunkSize(t),
            i = Math.pow(t, e),
            n = d(i),
            r = o(),
            s = o(),
            l = "";
        for (this.divRemTo(n, r, s); r.signum() > 0;) l = (i + s.intValue()).toString(t).substr(1) + l, r.divRemTo(n, r, s);
        return s.intValue().toString(t) + l
    }

    function K(t, e) {
        this.fromInt(0), null == e && (e = 10);
        for (var i = this.chunkSize(e), o = Math.pow(e, i), r = !1, s = 0, l = 0, p = 0; p < t.length; ++p) {
            var a = u(t, p);
            a < 0 ? "-" == t.charAt(p) && 0 == this.signum() && (r = !0) : (l = e * l + a, ++s >= i && (this.dMultiply(o), this.dAddOffset(l, 0), s = 0, l = 0))
        }
        s > 0 && (this.dMultiply(Math.pow(e, s)), this.dAddOffset(l, 0)), r && n.ZERO.subTo(this, this)
    }

    function tt(t, e, i) {
        if ("number" == typeof e)
            if (t < 2) this.fromInt(1);
            else
                for (this.fromNumber(t, i), this.testBit(t - 1) || this.bitwiseTo(n.ONE.shiftLeft(t - 1), pt, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(e);) this.dAddOffset(2, 0), this.bitLength() > t && this.subTo(n.ONE.shiftLeft(t - 1), this);
        else {
            var o = new Array,
                r = 7 & t;
            o.length = 1 + (t >> 3), e.nextBytes(o), r > 0 ? o[0] &= (1 << r) - 1 : o[0] = 0, this.fromString(o, 256)
        }
    }

    function et() {
        var t = this.t,
            e = new Array;
        e[0] = this.s;
        var i, n = this.DB - t * this.DB % 8,
            o = 0;
        if (t-- > 0)
            for (n < this.DB && (i = this[t] >> n) != (this.s & this.DM) >> n && (e[o++] = i | this.s << this.DB - n); t >= 0;) n < 8 ? (i = (this[t] & (1 << n) - 1) << 8 - n, i |= this[--t] >> (n += this.DB - 8)) : (i = this[t] >> (n -= 8) & 255, n <= 0 && (n += this.DB, --t)), 0 != (128 & i) && (i |= -256), 0 == o && (128 & this.s) != (128 & i) && ++o, (o > 0 || i != this.s) && (e[o++] = i);
        return e
    }

    function it(t) {
        return 0 == this.compareTo(t)
    }

    function nt(t) {
        return this.compareTo(t) < 0 ? this : t
    }

    function ot(t) {
        return this.compareTo(t) > 0 ? this : t
    }

    function rt(t, e, i) {
        var n, o, r = Math.min(t.t, this.t);
        for (n = 0; n < r; ++n) i[n] = e(this[n], t[n]);
        if (t.t < this.t) {
            for (o = t.s & this.DM, n = r; n < this.t; ++n) i[n] = e(this[n], o);
            i.t = this.t
        } else {
            for (o = this.s & this.DM, n = r; n < t.t; ++n) i[n] = e(o, t[n]);
            i.t = t.t
        }
        i.s = e(this.s, t.s), i.clamp()
    }

    function st(t, e) {
        return t & e
    }

    function lt(t) {
        var e = o();
        return this.bitwiseTo(t, st, e), e
    }

    function pt(t, e) {
        return t | e
    }

    function ut(t) {
        var e = o();
        return this.bitwiseTo(t, pt, e), e
    }

    function at(t, e) {
        return t ^ e
    }

    function ht(t) {
        var e = o();
        return this.bitwiseTo(t, at, e), e
    }

    function dt(t, e) {
        return t & ~e
    }

    function ft(t) {
        var e = o();
        return this.bitwiseTo(t, dt, e), e
    }

    function Pt() {
        for (var t = o(), e = 0; e < this.t; ++e) t[e] = this.DM & ~this[e];
        return t.t = this.t, t.s = ~this.s, t
    }

    function mt(t) {
        var e = o();
        return t < 0 ? this.rShiftTo(-t, e) : this.lShiftTo(t, e), e
    }

    function ct(t) {
        var e = o();
        return t < 0 ? this.lShiftTo(-t, e) : this.rShiftTo(t, e), e
    }

    function yt(t) {
        if (0 == t) return -1;
        var e = 0;
        return 0 == (65535 & t) && (t >>= 16, e += 16), 0 == (255 & t) && (t >>= 8, e += 8), 0 == (15 & t) && (t >>= 4, e += 4), 0 == (3 & t) && (t >>= 2, e += 2), 0 == (1 & t) && ++e, e
    }

    function vt() {
        for (var t = 0; t < this.t; ++t)
            if (0 != this[t]) return t * this.DB + yt(this[t]);
        return this.s < 0 ? this.t * this.DB : -1
    }

    function _t(t) {
        for (var e = 0; 0 != t;) t &= t - 1, ++e;
        return e
    }

    function Ct() {
        for (var t = 0, e = this.s & this.DM, i = 0; i < this.t; ++i) t += _t(this[i] ^ e);
        return t
    }

    function It(t) {
        var e = Math.floor(t / this.DB);
        return e >= this.t ? 0 != this.s : 0 != (this[e] & 1 << t % this.DB)
    }

    function xt(t, e) {
        var i = n.ONE.shiftLeft(t);
        return this.bitwiseTo(i, e, i), i
    }

    function gt(t) {
        return this.changeBit(t, pt)
    }

    function Lt(t) {
        return this.changeBit(t, dt)
    }

    function Et(t) {
        return this.changeBit(t, at)
    }

    function Tt(t, e) {
        for (var i = 0, n = 0, o = Math.min(t.t, this.t); i < o;) n += this[i] + t[i], e[i++] = n & this.DM, n >>= this.DB;
        if (t.t < this.t) {
            for (n += t.s; i < this.t;) n += this[i], e[i++] = n & this.DM, n >>= this.DB;
            n += this.s
        } else {
            for (n += this.s; i < t.t;) n += t[i], e[i++] = n & this.DM, n >>= this.DB;
            n += t.s
        }
        e.s = n < 0 ? -1 : 0, n > 0 ? e[i++] = n : n < -1 && (e[i++] = this.DV + n), e.t = i, e.clamp()
    }

    function Xt(t) {
        var e = o();
        return this.addTo(t, e), e
    }

    function Ot(t) {
        var e = o();
        return this.subTo(t, e), e
    }

    function Nt(t) {
        var e = o();
        return this.multiplyTo(t, e), e
    }

    function Yt() {
        var t = o();
        return this.squareTo(t), t
    }

    function St(t) {
        var e = o();
        return this.divRemTo(t, e, null), e
    }

    function At(t) {
        var e = o();
        return this.divRemTo(t, null, e), e
    }

    function Bt(t) {
        var e = o(),
            i = o();
        return this.divRemTo(t, e, i), new Array(e, i)
    }

    function Dt(t) {
        this[this.t] = this.am(0, t - 1, this, 0, 0, this.t), ++this.t, this.clamp()
    }

    function Rt(t, e) {
        if (0 != t) {
            for (; this.t <= e;) this[this.t++] = 0;
            for (this[e] += t; this[e] >= this.DV;) this[e] -= this.DV, ++e >= this.t && (this[this.t++] = 0), ++this[e]
        }
    }

    function bt() {}

    function Mt(t) {
        return t
    }

    function wt(t, e, i) {
        t.multiplyTo(e, i)
    }

    function Ft(t, e) {
        t.squareTo(e)
    }

    function qt(t) {
        return this.exp(t, new bt)
    }

    function Wt(t, e, i) {
        var n = Math.min(this.t + t.t, e);
        for (i.s = 0, i.t = n; n > 0;) i[--n] = 0;
        var o;
        for (o = i.t - this.t; n < o; ++n) i[n + this.t] = this.am(0, t[n], i, n, 0, this.t);
        for (o = Math.min(t.t, e); n < o; ++n) this.am(0, t[n], i, n, 0, e - n);
        i.clamp()
    }

    function kt(t, e, i) {
        --e;
        var n = i.t = this.t + t.t - e;
        for (i.s = 0; --n >= 0;) i[n] = 0;
        for (n = Math.max(e - this.t, 0); n < t.t; ++n) i[this.t + n - e] = this.am(e - n, t[n], i, 0, 0, this.t + n - e);
        i.clamp(), i.drShiftTo(1, i)
    }

    function Ht(t) {
        this.r2 = o(), this.q3 = o(), n.ONE.dlShiftTo(2 * t.t, this.r2), this.mu = this.r2.divide(t), this.m = t
    }

    function Ut(t) {
        if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m);
        if (t.compareTo(this.m) < 0) return t;
        var e = o();
        return t.copyTo(e), this.reduce(e), e
    }

    function zt(t) {
        return t
    }

    function Jt(t) {
        for (t.drShiftTo(this.m.t - 1, this.r2), t.t > this.m.t + 1 && (t.t = this.m.t + 1, t.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); t.compareTo(this.r2) < 0;) t.dAddOffset(1, this.m.t + 1);
        for (t.subTo(this.r2, t); t.compareTo(this.m) >= 0;) t.subTo(this.m, t)
    }

    function jt(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function Gt(t, e, i) {
        t.multiplyTo(e, i), this.reduce(i)
    }

    function Zt(t, e) {
        var i, n, r = t.bitLength(),
            s = d(1);
        if (r <= 0) return s;
        i = r < 18 ? 1 : r < 48 ? 3 : r < 144 ? 4 : r < 768 ? 5 : 6, n = r < 8 ? new Y(e) : e.isEven() ? new Ht(e) : new M(e);
        var l = new Array,
            p = 3,
            u = i - 1,
            a = (1 << i) - 1;
        if (l[1] = n.convert(this), i > 1) {
            var h = o();
            for (n.sqrTo(l[1], h); p <= a;) l[p] = o(), n.mulTo(h, l[p - 2], l[p]), p += 2
        }
        var f, P, m = t.t - 1,
            c = !0,
            y = o();
        for (r = _(t[m]) - 1; m >= 0;) {
            for (r >= u ? f = t[m] >> r - u & a : (f = (t[m] & (1 << r + 1) - 1) << u - r, m > 0 && (f |= t[m - 1] >> this.DB + r - u)), p = i; 0 == (1 & f);) f >>= 1, --p;
            if ((r -= p) < 0 && (r += this.DB, --m), c) l[f].copyTo(s), c = !1;
            else {
                for (; p > 1;) n.sqrTo(s, y), n.sqrTo(y, s), p -= 2;
                p > 0 ? n.sqrTo(s, y) : (P = s, s = y, y = P), n.mulTo(y, l[f], s)
            }
            for (; m >= 0 && 0 == (t[m] & 1 << r);) n.sqrTo(s, y), P = s, s = y, y = P, --r < 0 && (r = this.DB - 1, --m)
        }
        return n.revert(s)
    }

    function Vt(t) {
        var e = this.s < 0 ? this.negate() : this.clone(),
            i = t.s < 0 ? t.negate() : t.clone();
        if (e.compareTo(i) < 0) {
            var n = e;
            e = i, i = n
        }
        var o = e.getLowestSetBit(),
            r = i.getLowestSetBit();
        if (r < 0) return e;
        for (o < r && (r = o), r > 0 && (e.rShiftTo(r, e), i.rShiftTo(r, i)); e.signum() > 0;)(o = e.getLowestSetBit()) > 0 && e.rShiftTo(o, e), (o = i.getLowestSetBit()) > 0 && i.rShiftTo(o, i), e.compareTo(i) >= 0 ? (e.subTo(i, e), e.rShiftTo(1, e)) : (i.subTo(e, i), i.rShiftTo(1, i));
        return r > 0 && i.lShiftTo(r, i), i
    }

    function Qt(t) {
        if (t <= 0) return 0;
        var e = this.DV % t,
            i = this.s < 0 ? t - 1 : 0;
        if (this.t > 0)
            if (0 == e) i = this[0] % t;
            else
                for (var n = this.t - 1; n >= 0; --n) i = (e * i + this[n]) % t;
        return i
    }

    function $t(t) {
        var e = t.isEven();
        if (this.isEven() && e || 0 == t.signum()) return n.ZERO;
        for (var i = t.clone(), o = this.clone(), r = d(1), s = d(0), l = d(0), p = d(1); 0 != i.signum();) {
            for (; i.isEven();) i.rShiftTo(1, i), e ? (r.isEven() && s.isEven() || (r.addTo(this, r), s.subTo(t, s)), r.rShiftTo(1, r)) : s.isEven() || s.subTo(t, s), s.rShiftTo(1, s);
            for (; o.isEven();) o.rShiftTo(1, o), e ? (l.isEven() && p.isEven() || (l.addTo(this, l), p.subTo(t, p)), l.rShiftTo(1, l)) : p.isEven() || p.subTo(t, p), p.rShiftTo(1, p);
            i.compareTo(o) >= 0 ? (i.subTo(o, i), e && r.subTo(l, r), s.subTo(p, s)) : (o.subTo(i, o), e && l.subTo(r, l), p.subTo(s, p))
        }
        return 0 != o.compareTo(n.ONE) ? n.ZERO : p.compareTo(t) >= 0 ? p.subtract(t) : p.signum() < 0 ? (p.addTo(t, p), p.signum() < 0 ? p.add(t) : p) : p
    }

    function Kt(t) {
        var e, i = this.abs();
        if (1 == i.t && i[0] <= he[he.length - 1]) {
            for (e = 0; e < he.length; ++e)
                if (i[0] == he[e]) return !0;
            return !1
        }
        if (i.isEven()) return !1;
        for (e = 1; e < he.length;) {
            for (var n = he[e], o = e + 1; o < he.length && n < de;) n *= he[o++];
            for (n = i.modInt(n); e < o;)
                if (n % he[e++] == 0) return !1
        }
        return i.millerRabin(t)
    }

    function te(t) {
        var e = this.subtract(n.ONE),
            i = e.getLowestSetBit();
        if (i <= 0) return !1;
        var r = e.shiftRight(i);
        (t = t + 1 >> 1) > he.length && (t = he.length);
        for (var s = o(), l = 0; l < t; ++l) {
            s.fromInt(he[Math.floor(Math.random() * he.length)]);
            var p = s.modPow(r, this);
            if (0 != p.compareTo(n.ONE) && 0 != p.compareTo(e)) {
                for (var u = 1; u++ < i && 0 != p.compareTo(e);)
                    if (p = p.modPowInt(2, this), 0 == p.compareTo(n.ONE)) return !1;
                if (0 != p.compareTo(e)) return !1
            }
        }
        return !0
    }
    var ee = {},
        ie = !1;
    void 0 !== t && t.exports ? (t.exports = ee, ie = !0) : "undefined" != typeof document ? window.ClipperLib = ee : self.ClipperLib = ee;
    var ne;
    if (ie) {
        var oe = "chrome";
        ne = "Netscape"
    } else {
        var oe = navigator.userAgent.toString().toLowerCase();
        ne = navigator.appName
    }
    var re = {}; - 1 != oe.indexOf("chrome") && -1 == oe.indexOf("chromium") ? re.chrome = 1 : re.chrome = 0, -1 != oe.indexOf("chromium") ? re.chromium = 1 : re.chromium = 0, -1 != oe.indexOf("safari") && -1 == oe.indexOf("chrome") && -1 == oe.indexOf("chromium") ? re.safari = 1 : re.safari = 0, -1 != oe.indexOf("firefox") ? re.firefox = 1 : re.firefox = 0, -1 != oe.indexOf("firefox/17") ? re.firefox17 = 1 : re.firefox17 = 0, -1 != oe.indexOf("firefox/15") ? re.firefox15 = 1 : re.firefox15 = 0, -1 != oe.indexOf("firefox/3") ? re.firefox3 = 1 : re.firefox3 = 0, -1 != oe.indexOf("opera") ? re.opera = 1 : re.opera = 0, -1 != oe.indexOf("msie 10") ? re.msie10 = 1 : re.msie10 = 0, -1 != oe.indexOf("msie 9") ? re.msie9 = 1 : re.msie9 = 0, -1 != oe.indexOf("msie 8") ? re.msie8 = 1 : re.msie8 = 0, -1 != oe.indexOf("msie 7") ? re.msie7 = 1 : re.msie7 = 0, -1 != oe.indexOf("msie ") ? re.msie = 1 : re.msie = 0, ee.biginteger_used = null;
    var se;
    "Microsoft Internet Explorer" == ne ? (n.prototype.am = s, se = 30) : "Netscape" != ne ? (n.prototype.am = r, se = 26) : (n.prototype.am = l, se = 28), n.prototype.DB = se, n.prototype.DM = (1 << se) - 1, n.prototype.DV = 1 << se;
    n.prototype.FV = Math.pow(2, 52), n.prototype.F1 = 52 - se, n.prototype.F2 = 2 * se - 52;
    var le, pe, ue = "0123456789abcdefghijklmnopqrstuvwxyz",
        ae = new Array;
    for (le = "0".charCodeAt(0), pe = 0; pe <= 9; ++pe) ae[le++] = pe;
    for (le = "a".charCodeAt(0), pe = 10; pe < 36; ++pe) ae[le++] = pe;
    for (le = "A".charCodeAt(0), pe = 10; pe < 36; ++pe) ae[le++] = pe;
    Y.prototype.convert = S, Y.prototype.revert = A, Y.prototype.reduce = B, Y.prototype.mulTo = D, Y.prototype.sqrTo = R, M.prototype.convert = w, M.prototype.revert = F, M.prototype.reduce = q, M.prototype.mulTo = k, M.prototype.sqrTo = W, n.prototype.copyTo = a, n.prototype.fromInt = h, n.prototype.fromString = f, n.prototype.clamp = P, n.prototype.dlShiftTo = I, n.prototype.drShiftTo = x, n.prototype.lShiftTo = g, n.prototype.rShiftTo = L, n.prototype.subTo = E, n.prototype.multiplyTo = T, n.prototype.squareTo = X, n.prototype.divRemTo = O, n.prototype.invDigit = b, n.prototype.isEven = H, n.prototype.exp = U, n.prototype.toString = m, n.prototype.negate = c, n.prototype.abs = y, n.prototype.compareTo = v, n.prototype.bitLength = C, n.prototype.mod = N, n.prototype.modPowInt = z, n.ZERO = d(0), n.ONE = d(1), bt.prototype.convert = Mt, bt.prototype.revert = Mt, bt.prototype.mulTo = wt, bt.prototype.sqrTo = Ft, Ht.prototype.convert = Ut, Ht.prototype.revert = zt, Ht.prototype.reduce = Jt, Ht.prototype.mulTo = Gt, Ht.prototype.sqrTo = jt;
    var he = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997],
        de = (1 << 26) / he[he.length - 1];
    n.prototype.chunkSize = V, n.prototype.toRadix = $, n.prototype.fromRadix = K, n.prototype.fromNumber = tt, n.prototype.bitwiseTo = rt, n.prototype.changeBit = xt, n.prototype.addTo = Tt, n.prototype.dMultiply = Dt, n.prototype.dAddOffset = Rt, n.prototype.multiplyLowerTo = Wt, n.prototype.multiplyUpperTo = kt, n.prototype.modInt = Qt, n.prototype.millerRabin = te, n.prototype.clone = J, n.prototype.intValue = j, n.prototype.byteValue = G, n.prototype.shortValue = Z, n.prototype.signum = Q, n.prototype.toByteArray = et, n.prototype.equals = it, n.prototype.min = nt, n.prototype.max = ot, n.prototype.and = lt, n.prototype.or = ut, n.prototype.xor = ht, n.prototype.andNot = ft, n.prototype.not = Pt, n.prototype.shiftLeft = mt, n.prototype.shiftRight = ct, n.prototype.getLowestSetBit = vt, n.prototype.bitCount = Ct, n.prototype.testBit = It, n.prototype.setBit = gt, n.prototype.clearBit = Lt, n.prototype.flipBit = Et, n.prototype.add = Xt, n.prototype.subtract = Ot, n.prototype.multiply = Nt, n.prototype.divide = St, n.prototype.remainder = At, n.prototype.divideAndRemainder = Bt, n.prototype.modPow = Zt, n.prototype.modInverse = $t, n.prototype.pow = qt, n.prototype.gcd = Vt, n.prototype.isProbablePrime = Kt, n.prototype.square = Yt;
    var fe = n;
    if (fe.prototype.IsNegative = function() {
            return -1 == this.compareTo(fe.ZERO)
        }, fe.op_Equality = function(t, e) {
            return 0 == t.compareTo(e)
        }, fe.op_Inequality = function(t, e) {
            return 0 != t.compareTo(e)
        }, fe.op_GreaterThan = function(t, e) {
            return t.compareTo(e) > 0
        }, fe.op_LessThan = function(t, e) {
            return t.compareTo(e) < 0
        }, fe.op_Addition = function(t, e) {
            return new fe(t).add(new fe(e))
        }, fe.op_Subtraction = function(t, e) {
            return new fe(t).subtract(new fe(e))
        }, fe.Int128Mul = function(t, e) {
            return new fe(t).multiply(new fe(e))
        }, fe.op_Division = function(t, e) {
            return t.divide(e)
        }, fe.prototype.ToDouble = function() {
            return parseFloat(this.toString())
        }, void 0 === Pe) var Pe = function(t, e) {
        var i;
        if (void 0 === Object.getOwnPropertyNames) {
            for (i in e.prototype) void 0 !== t.prototype[i] && t.prototype[i] != Object.prototype[i] || (t.prototype[i] = e.prototype[i]);
            for (i in e) void 0 === t[i] && (t[i] = e[i]);
            t.$baseCtor = e
        } else {
            for (var n = Object.getOwnPropertyNames(e.prototype), o = 0; o < n.length; o++) void 0 === Object.getOwnPropertyDescriptor(t.prototype, n[o]) && Object.defineProperty(t.prototype, n[o], Object.getOwnPropertyDescriptor(e.prototype, n[o]));
            for (i in e) void 0 === t[i] && (t[i] = e[i]);
            t.$baseCtor = e
        }
    };
    ee.Path = function() {
        return []
    }, ee.Paths = function() {
        return []
    }, ee.DoublePoint = function() {
        var t = arguments;
        this.X = 0, this.Y = 0, 1 == t.length ? (this.X = t[0].X, this.Y = t[0].Y) : 2 == t.length && (this.X = t[0], this.Y = t[1])
    }, ee.DoublePoint0 = function() {
        this.X = 0, this.Y = 0
    }, ee.DoublePoint1 = function(t) {
        this.X = t.X, this.Y = t.Y
    }, ee.DoublePoint2 = function(t, e) {
        this.X = t, this.Y = e
    }, ee.PolyNode = function() {
        this.m_Parent = null, this.m_polygon = new ee.Path, this.m_Index = 0, this.m_jointype = 0, this.m_endtype = 0, this.m_Childs = [], this.IsOpen = !1
    }, ee.PolyNode.prototype.IsHoleNode = function() {
        for (var t = !0, e = this.m_Parent; null !== e;) t = !t, e = e.m_Parent;
        return t
    }, ee.PolyNode.prototype.ChildCount = function() {
        return this.m_Childs.length
    }, ee.PolyNode.prototype.Contour = function() {
        return this.m_polygon
    }, ee.PolyNode.prototype.AddChild = function(t) {
        var e = this.m_Childs.length;
        this.m_Childs.push(t), t.m_Parent = this, t.m_Index = e
    }, ee.PolyNode.prototype.GetNext = function() {
        return this.m_Childs.length > 0 ? this.m_Childs[0] : this.GetNextSiblingUp()
    }, ee.PolyNode.prototype.GetNextSiblingUp = function() {
        return null === this.m_Parent ? null : this.m_Index == this.m_Parent.m_Childs.length - 1 ? this.m_Parent.GetNextSiblingUp() : this.m_Parent.m_Childs[this.m_Index + 1]
    }, ee.PolyNode.prototype.Childs = function() {
        return this.m_Childs
    }, ee.PolyNode.prototype.Parent = function() {
        return this.m_Parent
    }, ee.PolyNode.prototype.IsHole = function() {
        return this.IsHoleNode()
    }, ee.PolyTree = function() {
        this.m_AllPolys = [], ee.PolyNode.call(this)
    }, ee.PolyTree.prototype.Clear = function() {
        for (var t = 0, e = this.m_AllPolys.length; t < e; t++) this.m_AllPolys[t] = null;
        this.m_AllPolys.length = 0, this.m_Childs.length = 0
    }, ee.PolyTree.prototype.GetFirst = function() {
        return this.m_Childs.length > 0 ? this.m_Childs[0] : null
    }, ee.PolyTree.prototype.Total = function() {
        return this.m_AllPolys.length
    }, Pe(ee.PolyTree, ee.PolyNode), ee.Math_Abs_Int64 = ee.Math_Abs_Int32 = ee.Math_Abs_Double = function(t) {
        return Math.abs(t)
    }, ee.Math_Max_Int32_Int32 = function(t, e) {
        return Math.max(t, e)
    }, re.msie || re.opera || re.safari ? ee.Cast_Int32 = function(t) {
        return 0 | t
    } : ee.Cast_Int32 = function(t) {
        return ~~t
    }, re.chrome ? ee.Cast_Int64 = function(t) {
        return t < -2147483648 || t > 2147483647 ? t < 0 ? Math.ceil(t) : Math.floor(t) : ~~t
    } : re.firefox && "function" == typeof Number.toInteger ? ee.Cast_Int64 = function(t) {
        return Number.toInteger(t)
    } : re.msie7 || re.msie8 ? ee.Cast_Int64 = function(t) {
        return parseInt(t, 10)
    } : re.msie ? ee.Cast_Int64 = function(t) {
        return t < -2147483648 || t > 2147483647 ? t < 0 ? Math.ceil(t) : Math.floor(t) : 0 | t
    } : ee.Cast_Int64 = function(t) {
        return t < 0 ? Math.ceil(t) : Math.floor(t)
    }, ee.Clear = function(t) {
        t.length = 0
    }, ee.PI = 3.141592653589793, ee.PI2 = 6.283185307179586, ee.IntPoint = function() {
        var t = arguments,
            e = t.length;
        this.X = 0, this.Y = 0;
        var i, n;
        if (2 == e) this.X = t[0], this.Y = t[1];
        else if (1 == e)
            if (t[0] instanceof ee.DoublePoint) {
                var i = t[0];
                this.X = ee.Clipper.Round(i.X), this.Y = ee.Clipper.Round(i.Y)
            } else {
                var n = t[0];
                this.X = n.X, this.Y = n.Y
            }
        else this.X = 0, this.Y = 0
    }, ee.IntPoint.op_Equality = function(t, e) {
        return t.X == e.X && t.Y == e.Y
    }, ee.IntPoint.op_Inequality = function(t, e) {
        return t.X != e.X || t.Y != e.Y
    }, ee.IntPoint0 = function() {
        this.X = 0, this.Y = 0
    }, ee.IntPoint1 = function(t) {
        this.X = t.X, this.Y = t.Y
    }, ee.IntPoint1dp = function(t) {
        this.X = ee.Clipper.Round(t.X), this.Y = ee.Clipper.Round(t.Y)
    }, ee.IntPoint2 = function(t, e) {
        this.X = t, this.Y = e
    }, ee.IntRect = function() {
        var t = arguments,
            e = t.length;
        4 == e ? (this.left = t[0], this.top = t[1], this.right = t[2], this.bottom = t[3]) : 1 == e ? (this.left = ir.left, this.top = ir.top, this.right = ir.right, this.bottom = ir.bottom) : (this.left = 0, this.top = 0, this.right = 0, this.bottom = 0)
    }, ee.IntRect0 = function() {
        this.left = 0, this.top = 0, this.right = 0, this.bottom = 0
    }, ee.IntRect1 = function(t) {
        this.left = t.left, this.top = t.top, this.right = t.right, this.bottom = t.bottom
    }, ee.IntRect4 = function(t, e, i, n) {
        this.left = t, this.top = e, this.right = i, this.bottom = n
    }, ee.ClipType = {
        ctIntersection: 0,
        ctUnion: 1,
        ctDifference: 2,
        ctXor: 3
    }, ee.PolyType = {
        ptSubject: 0,
        ptClip: 1
    }, ee.PolyFillType = {
        pftEvenOdd: 0,
        pftNonZero: 1,
        pftPositive: 2,
        pftNegative: 3
    }, ee.JoinType = {
        jtSquare: 0,
        jtRound: 1,
        jtMiter: 2
    }, ee.EndType = {
        etOpenSquare: 0,
        etOpenRound: 1,
        etOpenButt: 2,
        etClosedLine: 3,
        etClosedPolygon: 4
    }, ee.EdgeSide = {
        esLeft: 0,
        esRight: 1
    }, ee.Direction = {
        dRightToLeft: 0,
        dLeftToRight: 1
    }, ee.TEdge = function() {
        this.Bot = new ee.IntPoint, this.Curr = new ee.IntPoint, this.Top = new ee.IntPoint, this.Delta = new ee.IntPoint, this.Dx = 0, this.PolyTyp = ee.PolyType.ptSubject, this.Side = ee.EdgeSide.esLeft, this.WindDelta = 0, this.WindCnt = 0, this.WindCnt2 = 0, this.OutIdx = 0, this.Next = null, this.Prev = null, this.NextInLML = null, this.NextInAEL = null, this.PrevInAEL = null, this.NextInSEL = null, this.PrevInSEL = null
    }, ee.IntersectNode = function() {
        this.Edge1 = null, this.Edge2 = null, this.Pt = new ee.IntPoint
    }, ee.MyIntersectNodeSort = function() {}, ee.MyIntersectNodeSort.Compare = function(t, e) {
        return e.Pt.Y - t.Pt.Y
    }, ee.LocalMinima = function() {
        this.Y = 0, this.LeftBound = null, this.RightBound = null, this.Next = null
    }, ee.Scanbeam = function() {
        this.Y = 0, this.Next = null
    }, ee.OutRec = function() {
        this.Idx = 0, this.IsHole = !1, this.IsOpen = !1, this.FirstLeft = null, this.Pts = null, this.BottomPt = null, this.PolyNode = null
    }, ee.OutPt = function() {
        this.Idx = 0, this.Pt = new ee.IntPoint, this.Next = null, this.Prev = null
    }, ee.Join = function() {
        this.OutPt1 = null, this.OutPt2 = null, this.OffPt = new ee.IntPoint
    }, ee.ClipperBase = function() {
        this.m_MinimaList = null, this.m_CurrentLM = null, this.m_edges = new Array, this.m_UseFullRange = !1, this.m_HasOpenPaths = !1, this.PreserveCollinear = !1, this.m_MinimaList = null, this.m_CurrentLM = null, this.m_UseFullRange = !1, this.m_HasOpenPaths = !1
    }, ee.ClipperBase.horizontal = -9007199254740992, ee.ClipperBase.Skip = -2, ee.ClipperBase.Unassigned = -1, ee.ClipperBase.tolerance = 1e-20, ee.ClipperBase.loRange = 47453132, ee.ClipperBase.hiRange = 0xfffffffffffff, ee.ClipperBase.near_zero = function(t) {
        return t > -ee.ClipperBase.tolerance && t < ee.ClipperBase.tolerance
    }, ee.ClipperBase.IsHorizontal = function(t) {
        return 0 === t.Delta.Y
    }, ee.ClipperBase.prototype.PointIsVertex = function(t, e) {
        var i = e;
        do {
            if (ee.IntPoint.op_Equality(i.Pt, t)) return !0;
            i = i.Next
        } while (i != e);
        return !1
    }, ee.ClipperBase.prototype.PointOnLineSegment = function(t, e, i, n) {
        return n ? t.X == e.X && t.Y == e.Y || t.X == i.X && t.Y == i.Y || t.X > e.X == t.X < i.X && t.Y > e.Y == t.Y < i.Y && fe.op_Equality(fe.Int128Mul(t.X - e.X, i.Y - e.Y), fe.Int128Mul(i.X - e.X, t.Y - e.Y)) : t.X == e.X && t.Y == e.Y || t.X == i.X && t.Y == i.Y || t.X > e.X == t.X < i.X && t.Y > e.Y == t.Y < i.Y && (t.X - e.X) * (i.Y - e.Y) == (i.X - e.X) * (t.Y - e.Y)
    }, ee.ClipperBase.prototype.PointOnPolygon = function(t, e, i) {
        for (var n = e;;) {
            if (this.PointOnLineSegment(t, n.Pt, n.Next.Pt, i)) return !0;
            if ((n = n.Next) == e) break
        }
        return !1
    }, ee.ClipperBase.prototype.SlopesEqual = ee.ClipperBase.SlopesEqual = function() {
        var t, e, i, n, o, r, s, l = arguments,
            p = l.length;
        return 3 == p ? (t = l[0], e = l[1], s = l[2], s ? fe.op_Equality(fe.Int128Mul(t.Delta.Y, e.Delta.X), fe.Int128Mul(t.Delta.X, e.Delta.Y)) : ee.Cast_Int64(t.Delta.Y * e.Delta.X) == ee.Cast_Int64(t.Delta.X * e.Delta.Y)) : 4 == p ? (i = l[0], n = l[1], o = l[2], s = l[3], s ? fe.op_Equality(fe.Int128Mul(i.Y - n.Y, n.X - o.X), fe.Int128Mul(i.X - n.X, n.Y - o.Y)) : ee.Cast_Int64((i.Y - n.Y) * (n.X - o.X)) - ee.Cast_Int64((i.X - n.X) * (n.Y - o.Y)) == 0) : (i = l[0], n = l[1], o = l[2], r = l[3], s = l[4], s ? fe.op_Equality(fe.Int128Mul(i.Y - n.Y, o.X - r.X), fe.Int128Mul(i.X - n.X, o.Y - r.Y)) : ee.Cast_Int64((i.Y - n.Y) * (o.X - r.X)) - ee.Cast_Int64((i.X - n.X) * (o.Y - r.Y)) == 0)
    }, ee.ClipperBase.SlopesEqual3 = function(t, e, i) {
        return i ? fe.op_Equality(fe.Int128Mul(t.Delta.Y, e.Delta.X), fe.Int128Mul(t.Delta.X, e.Delta.Y)) : ee.Cast_Int64(t.Delta.Y * e.Delta.X) == ee.Cast_Int64(t.Delta.X * e.Delta.Y)
    }, ee.ClipperBase.SlopesEqual4 = function(t, e, i, n) {
        return n ? fe.op_Equality(fe.Int128Mul(t.Y - e.Y, e.X - i.X), fe.Int128Mul(t.X - e.X, e.Y - i.Y)) : ee.Cast_Int64((t.Y - e.Y) * (e.X - i.X)) - ee.Cast_Int64((t.X - e.X) * (e.Y - i.Y)) == 0
    }, ee.ClipperBase.SlopesEqual5 = function(t, e, i, n, o) {
        return o ? fe.op_Equality(fe.Int128Mul(t.Y - e.Y, i.X - n.X), fe.Int128Mul(t.X - e.X, i.Y - n.Y)) : ee.Cast_Int64((t.Y - e.Y) * (i.X - n.X)) - ee.Cast_Int64((t.X - e.X) * (i.Y - n.Y)) == 0
    }, ee.ClipperBase.prototype.Clear = function() {
        this.DisposeLocalMinimaList();
        for (var t = 0, e = this.m_edges.length; t < e; ++t) {
            for (var i = 0, n = this.m_edges[t].length; i < n; ++i) this.m_edges[t][i] = null;
            ee.Clear(this.m_edges[t])
        }
        ee.Clear(this.m_edges), this.m_UseFullRange = !1, this.m_HasOpenPaths = !1
    }, ee.ClipperBase.prototype.DisposeLocalMinimaList = function() {
        for (; null !== this.m_MinimaList;) {
            var t = this.m_MinimaList.Next;
            this.m_MinimaList = null, this.m_MinimaList = t
        }
        this.m_CurrentLM = null
    }, ee.ClipperBase.prototype.RangeTest = function(t, e) {
        e.Value ? (t.X > ee.ClipperBase.hiRange || t.Y > ee.ClipperBase.hiRange || -t.X > ee.ClipperBase.hiRange || -t.Y > ee.ClipperBase.hiRange) && ee.Error("Coordinate outside allowed range in RangeTest().") : (t.X > ee.ClipperBase.loRange || t.Y > ee.ClipperBase.loRange || -t.X > ee.ClipperBase.loRange || -t.Y > ee.ClipperBase.loRange) && (e.Value = !0, this.RangeTest(t, e))
    }, ee.ClipperBase.prototype.InitEdge = function(t, e, i, n) {
        t.Next = e, t.Prev = i, t.Curr.X = n.X, t.Curr.Y = n.Y, t.OutIdx = -1
    }, ee.ClipperBase.prototype.InitEdge2 = function(t, e) {
        t.Curr.Y >= t.Next.Curr.Y ? (t.Bot.X = t.Curr.X, t.Bot.Y = t.Curr.Y, t.Top.X = t.Next.Curr.X, t.Top.Y = t.Next.Curr.Y) : (t.Top.X = t.Curr.X, t.Top.Y = t.Curr.Y, t.Bot.X = t.Next.Curr.X, t.Bot.Y = t.Next.Curr.Y), this.SetDx(t), t.PolyTyp = e
    }, ee.ClipperBase.prototype.FindNextLocMin = function(t) {
        for (var e;;) {
            for (; ee.IntPoint.op_Inequality(t.Bot, t.Prev.Bot) || ee.IntPoint.op_Equality(t.Curr, t.Top);) t = t.Next;
            if (t.Dx != ee.ClipperBase.horizontal && t.Prev.Dx != ee.ClipperBase.horizontal) break;
            for (; t.Prev.Dx == ee.ClipperBase.horizontal;) t = t.Prev;
            for (e = t; t.Dx == ee.ClipperBase.horizontal;) t = t.Next;
            if (t.Top.Y != t.Prev.Bot.Y) {
                e.Prev.Bot.X < t.Bot.X && (t = e);
                break
            }
        }
        return t
    }, ee.ClipperBase.prototype.ProcessBound = function(t, e) {
        var i, n, o = t,
            r = t;
        if (t.Dx == ee.ClipperBase.horizontal && (n = e ? t.Prev.Bot.X : t.Next.Bot.X, t.Bot.X != n && this.ReverseHorizontal(t)), r.OutIdx != ee.ClipperBase.Skip)
            if (e) {
                for (; r.Top.Y == r.Next.Bot.Y && r.Next.OutIdx != ee.ClipperBase.Skip;) r = r.Next;
                if (r.Dx == ee.ClipperBase.horizontal && r.Next.OutIdx != ee.ClipperBase.Skip) {
                    for (i = r; i.Prev.Dx == ee.ClipperBase.horizontal;) i = i.Prev;
                    i.Prev.Top.X == r.Next.Top.X ? e || (r = i.Prev) : i.Prev.Top.X > r.Next.Top.X && (r = i.Prev)
                }
                for (; t != r;) t.NextInLML = t.Next, t.Dx == ee.ClipperBase.horizontal && t != o && t.Bot.X != t.Prev.Top.X && this.ReverseHorizontal(t), t = t.Next;
                t.Dx == ee.ClipperBase.horizontal && t != o && t.Bot.X != t.Prev.Top.X && this.ReverseHorizontal(t), r = r.Next
            } else {
                for (; r.Top.Y == r.Prev.Bot.Y && r.Prev.OutIdx != ee.ClipperBase.Skip;) r = r.Prev;
                if (r.Dx == ee.ClipperBase.horizontal && r.Prev.OutIdx != ee.ClipperBase.Skip) {
                    for (i = r; i.Next.Dx == ee.ClipperBase.horizontal;) i = i.Next;
                    i.Next.Top.X == r.Prev.Top.X ? e || (r = i.Next) : i.Next.Top.X > r.Prev.Top.X && (r = i.Next)
                }
                for (; t != r;) t.NextInLML = t.Prev, t.Dx == ee.ClipperBase.horizontal && t != o && t.Bot.X != t.Next.Top.X && this.ReverseHorizontal(t), t = t.Prev;
                t.Dx == ee.ClipperBase.horizontal && t != o && t.Bot.X != t.Next.Top.X && this.ReverseHorizontal(t), r = r.Prev
            } if (r.OutIdx == ee.ClipperBase.Skip) {
            if (t = r, e) {
                for (; t.Top.Y == t.Next.Bot.Y;) t = t.Next;
                for (; t != r && t.Dx == ee.ClipperBase.horizontal;) t = t.Prev
            } else {
                for (; t.Top.Y == t.Prev.Bot.Y;) t = t.Prev;
                for (; t != r && t.Dx == ee.ClipperBase.horizontal;) t = t.Next
            }
            if (t == r) r = e ? t.Next : t.Prev;
            else {
                t = e ? r.Next : r.Prev;
                var s = new ee.LocalMinima;
                s.Next = null, s.Y = t.Bot.Y, s.LeftBound = null, s.RightBound = t, s.RightBound.WindDelta = 0, r = this.ProcessBound(s.RightBound, e), this.InsertLocalMinima(s)
            }
        }
        return r
    }, ee.ClipperBase.prototype.AddPath = function(t, e, i) {
        i || e != ee.PolyType.ptClip || ee.Error("AddPath: Open paths must be subject.");
        var n = t.length - 1;
        if (i)
            for (; n > 0 && ee.IntPoint.op_Equality(t[n], t[0]);) --n;
        for (; n > 0 && ee.IntPoint.op_Equality(t[n], t[n - 1]);) --n;
        if (i && n < 2 || !i && n < 1) return !1;
        for (var o = new Array, r = 0; r <= n; r++) o.push(new ee.TEdge);
        var s = !0;
        o[1].Curr.X = t[1].X, o[1].Curr.Y = t[1].Y;
        var l = {
            Value: this.m_UseFullRange
        };
        this.RangeTest(t[0], l), this.m_UseFullRange = l.Value, l.Value = this.m_UseFullRange, this.RangeTest(t[n], l), this.m_UseFullRange = l.Value, this.InitEdge(o[0], o[1], o[n], t[0]), this.InitEdge(o[n], o[0], o[n - 1], t[n]);
        for (var r = n - 1; r >= 1; --r) l.Value = this.m_UseFullRange, this.RangeTest(t[r], l), this.m_UseFullRange = l.Value, this.InitEdge(o[r], o[r + 1], o[r - 1], t[r]);
        for (var p = o[0], u = p, a = p;;)
            if (ee.IntPoint.op_Equality(u.Curr, u.Next.Curr)) {
                if (u == u.Next) break;
                u == p && (p = u.Next), u = this.RemoveEdge(u), a = u
            } else {
                if (u.Prev == u.Next) break;
                if (!i || !ee.ClipperBase.SlopesEqual(u.Prev.Curr, u.Curr, u.Next.Curr, this.m_UseFullRange) || this.PreserveCollinear && this.Pt2IsBetweenPt1AndPt3(u.Prev.Curr, u.Curr, u.Next.Curr)) {
                    if ((u = u.Next) == a) break
                } else u == p && (p = u.Next), u = this.RemoveEdge(u), u = u.Prev, a = u
            } if (!i && u == u.Next || i && u.Prev == u.Next) return !1;
        i || (this.m_HasOpenPaths = !0, p.Prev.OutIdx = ee.ClipperBase.Skip);
        u = p;
        do {
            this.InitEdge2(u, e), u = u.Next, s && u.Curr.Y != p.Curr.Y && (s = !1)
        } while (u != p);
        if (s) {
            if (i) return !1;
            u.Prev.OutIdx = ee.ClipperBase.Skip, u.Prev.Bot.X < u.Prev.Top.X && this.ReverseHorizontal(u.Prev);
            var h = new ee.LocalMinima;
            for (h.Next = null, h.Y = u.Bot.Y, h.LeftBound = null, h.RightBound = u, h.RightBound.Side = ee.EdgeSide.esRight, h.RightBound.WindDelta = 0; u.Next.OutIdx != ee.ClipperBase.Skip;) u.NextInLML = u.Next, u.Bot.X != u.Prev.Top.X && this.ReverseHorizontal(u), u = u.Next;
            return this.InsertLocalMinima(h), this.m_edges.push(o), !0
        }
        this.m_edges.push(o);
        for (var d, f = null;
            (u = this.FindNextLocMin(u)) != f;) {
            null == f && (f = u);
            var h = new ee.LocalMinima;
            h.Next = null, h.Y = u.Bot.Y, u.Dx < u.Prev.Dx ? (h.LeftBound = u.Prev, h.RightBound = u, d = !1) : (h.LeftBound = u, h.RightBound = u.Prev, d = !0), h.LeftBound.Side = ee.EdgeSide.esLeft, h.RightBound.Side = ee.EdgeSide.esRight, i ? h.LeftBound.Next == h.RightBound ? h.LeftBound.WindDelta = -1 : h.LeftBound.WindDelta = 1 : h.LeftBound.WindDelta = 0, h.RightBound.WindDelta = -h.LeftBound.WindDelta, u = this.ProcessBound(h.LeftBound, d);
            var P = this.ProcessBound(h.RightBound, !d);
            h.LeftBound.OutIdx == ee.ClipperBase.Skip ? h.LeftBound = null : h.RightBound.OutIdx == ee.ClipperBase.Skip && (h.RightBound = null), this.InsertLocalMinima(h), d || (u = P)
        }
        return !0
    }, ee.ClipperBase.prototype.AddPaths = function(t, e, i) {
        for (var n = !1, o = 0, r = t.length; o < r; ++o) this.AddPath(t[o], e, i) && (n = !0);
        return n
    }, ee.ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function(t, e, i) {
        return !(ee.IntPoint.op_Equality(t, i) || ee.IntPoint.op_Equality(t, e) || ee.IntPoint.op_Equality(i, e)) && (t.X != i.X ? e.X > t.X == e.X < i.X : e.Y > t.Y == e.Y < i.Y)
    }, ee.ClipperBase.prototype.RemoveEdge = function(t) {
        t.Prev.Next = t.Next, t.Next.Prev = t.Prev;
        var e = t.Next;
        return t.Prev = null, e
    }, ee.ClipperBase.prototype.SetDx = function(t) {
        t.Delta.X = t.Top.X - t.Bot.X, t.Delta.Y = t.Top.Y - t.Bot.Y, 0 === t.Delta.Y ? t.Dx = ee.ClipperBase.horizontal : t.Dx = t.Delta.X / t.Delta.Y
    }, ee.ClipperBase.prototype.InsertLocalMinima = function(t) {
        if (null === this.m_MinimaList) this.m_MinimaList = t;
        else if (t.Y >= this.m_MinimaList.Y) t.Next = this.m_MinimaList, this.m_MinimaList = t;
        else {
            for (var e = this.m_MinimaList; null !== e.Next && t.Y < e.Next.Y;) e = e.Next;
            t.Next = e.Next, e.Next = t
        }
    }, ee.ClipperBase.prototype.PopLocalMinima = function() {
        null !== this.m_CurrentLM && (this.m_CurrentLM = this.m_CurrentLM.Next)
    }, ee.ClipperBase.prototype.ReverseHorizontal = function(t) {
        var e = t.Top.X;
        t.Top.X = t.Bot.X, t.Bot.X = e
    }, ee.ClipperBase.prototype.Reset = function() {
        if (this.m_CurrentLM = this.m_MinimaList, null != this.m_CurrentLM)
            for (var t = this.m_MinimaList; null != t;) {
                var e = t.LeftBound;
                null != e && (e.Curr.X = e.Bot.X, e.Curr.Y = e.Bot.Y, e.Side = ee.EdgeSide.esLeft, e.OutIdx = ee.ClipperBase.Unassigned), e = t.RightBound, null != e && (e.Curr.X = e.Bot.X, e.Curr.Y = e.Bot.Y, e.Side = ee.EdgeSide.esRight, e.OutIdx = ee.ClipperBase.Unassigned), t = t.Next
            }
    }, ee.Clipper = function(t) {
        void 0 === t && (t = 0), this.m_PolyOuts = null, this.m_ClipType = ee.ClipType.ctIntersection, this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null, this.m_IntersectList = null, this.m_IntersectNodeComparer = null, this.m_ExecuteLocked = !1, this.m_ClipFillType = ee.PolyFillType.pftEvenOdd, this.m_SubjFillType = ee.PolyFillType.pftEvenOdd, this.m_Joins = null, this.m_GhostJoins = null, this.m_UsingPolyTree = !1, this.ReverseSolution = !1, this.StrictlySimple = !1, ee.ClipperBase.call(this), this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null, this.m_IntersectList = new Array, this.m_IntersectNodeComparer = ee.MyIntersectNodeSort.Compare, this.m_ExecuteLocked = !1, this.m_UsingPolyTree = !1, this.m_PolyOuts = new Array, this.m_Joins = new Array, this.m_GhostJoins = new Array, this.ReverseSolution = 0 != (1 & t), this.StrictlySimple = 0 != (2 & t), this.PreserveCollinear = 0 != (4 & t)
    }, ee.Clipper.ioReverseSolution = 1, ee.Clipper.ioStrictlySimple = 2, ee.Clipper.ioPreserveCollinear = 4, ee.Clipper.prototype.Clear = function() {
        0 !== this.m_edges.length && (this.DisposeAllPolyPts(), ee.ClipperBase.prototype.Clear.call(this))
    }, ee.Clipper.prototype.DisposeScanbeamList = function() {
        for (; null !== this.m_Scanbeam;) {
            var t = this.m_Scanbeam.Next;
            this.m_Scanbeam = null, this.m_Scanbeam = t
        }
    }, ee.Clipper.prototype.Reset = function() {
        ee.ClipperBase.prototype.Reset.call(this), this.m_Scanbeam = null, this.m_ActiveEdges = null, this.m_SortedEdges = null;
        for (var t = this.m_MinimaList; null !== t;) this.InsertScanbeam(t.Y), t = t.Next
    }, ee.Clipper.prototype.InsertScanbeam = function(t) {
        if (null === this.m_Scanbeam) this.m_Scanbeam = new ee.Scanbeam, this.m_Scanbeam.Next = null, this.m_Scanbeam.Y = t;
        else if (t > this.m_Scanbeam.Y) {
            var e = new ee.Scanbeam;
            e.Y = t, e.Next = this.m_Scanbeam, this.m_Scanbeam = e
        } else {
            for (var i = this.m_Scanbeam; null !== i.Next && t <= i.Next.Y;) i = i.Next;
            if (t == i.Y) return;
            var e = new ee.Scanbeam;
            e.Y = t, e.Next = i.Next, i.Next = e
        }
    }, ee.Clipper.prototype.Execute = function() {
        var t = arguments,
            e = t.length,
            i = t[1] instanceof ee.PolyTree;
        if (4 == e && !i) {
            var n = t[0],
                o = t[1],
                r = t[2],
                s = t[3];
            if (this.m_ExecuteLocked) return !1;
            this.m_HasOpenPaths && ee.Error("Error: PolyTree struct is need for open path clipping."), this.m_ExecuteLocked = !0, ee.Clear(o), this.m_SubjFillType = r, this.m_ClipFillType = s, this.m_ClipType = n, this.m_UsingPolyTree = !1;
            try {
                var l = this.ExecuteInternal();
                l && this.BuildResult(o)
            } finally {
                this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1
            }
            return l
        }
        if (4 == e && i) {
            var n = t[0],
                p = t[1],
                r = t[2],
                s = t[3];
            if (this.m_ExecuteLocked) return !1;
            this.m_ExecuteLocked = !0, this.m_SubjFillType = r, this.m_ClipFillType = s, this.m_ClipType = n, this.m_UsingPolyTree = !0;
            try {
                var l = this.ExecuteInternal();
                l && this.BuildResult2(p)
            } finally {
                this.DisposeAllPolyPts(), this.m_ExecuteLocked = !1
            }
            return l
        }
        if (2 == e && !i) {
            var n = t[0],
                o = t[1];
            return this.Execute(n, o, ee.PolyFillType.pftEvenOdd, ee.PolyFillType.pftEvenOdd)
        }
        if (2 == e && i) {
            var n = t[0],
                p = t[1];
            return this.Execute(n, p, ee.PolyFillType.pftEvenOdd, ee.PolyFillType.pftEvenOdd)
        }
    }, ee.Clipper.prototype.FixHoleLinkage = function(t) {
        if (null !== t.FirstLeft && (t.IsHole == t.FirstLeft.IsHole || null === t.FirstLeft.Pts)) {
            for (var e = t.FirstLeft; null !== e && (e.IsHole == t.IsHole || null === e.Pts);) e = e.FirstLeft;
            t.FirstLeft = e
        }
    }, ee.Clipper.prototype.ExecuteInternal = function() {
        try {
            if (this.Reset(), null === this.m_CurrentLM) return !1;
            var t = this.PopScanbeam();
            do {
                if (this.InsertLocalMinimaIntoAEL(t), ee.Clear(this.m_GhostJoins), this.ProcessHorizontals(!1), null === this.m_Scanbeam) break;
                var e = this.PopScanbeam();
                if (!this.ProcessIntersections(t, e)) return !1;
                this.ProcessEdgesAtTopOfScanbeam(e), t = e
            } while (null !== this.m_Scanbeam || null !== this.m_CurrentLM);
            for (var i = 0, n = this.m_PolyOuts.length; i < n; i++) {
                var o = this.m_PolyOuts[i];
                null === o.Pts || o.IsOpen || (o.IsHole ^ this.ReverseSolution) == this.Area(o) > 0 && this.ReversePolyPtLinks(o.Pts)
            }
            this.JoinCommonEdges();
            for (var i = 0, n = this.m_PolyOuts.length; i < n; i++) {
                var o = this.m_PolyOuts[i];
                null === o.Pts || o.IsOpen || this.FixupOutPolygon(o)
            }
            return this.StrictlySimple && this.DoSimplePolygons(), !0
        } finally {
            ee.Clear(this.m_Joins), ee.Clear(this.m_GhostJoins)
        }
    }, ee.Clipper.prototype.PopScanbeam = function() {
        var t = this.m_Scanbeam.Y;
        this.m_Scanbeam;
        return this.m_Scanbeam = this.m_Scanbeam.Next, null, t
    }, ee.Clipper.prototype.DisposeAllPolyPts = function() {
        for (var t = 0, e = this.m_PolyOuts.length; t < e; ++t) this.DisposeOutRec(t);
        ee.Clear(this.m_PolyOuts)
    }, ee.Clipper.prototype.DisposeOutRec = function(t) {
        var e = this.m_PolyOuts[t];
        null !== e.Pts && this.DisposeOutPts(e.Pts), e = null, this.m_PolyOuts[t] = null
    }, ee.Clipper.prototype.DisposeOutPts = function(t) {
        if (null !== t) {
            for (t.Prev.Next = null; null !== t;) t, t = t.Next, null
        }
    }, ee.Clipper.prototype.AddJoin = function(t, e, i) {
        var n = new ee.Join;
        n.OutPt1 = t, n.OutPt2 = e, n.OffPt.X = i.X, n.OffPt.Y = i.Y, this.m_Joins.push(n)
    }, ee.Clipper.prototype.AddGhostJoin = function(t, e) {
        var i = new ee.Join;
        i.OutPt1 = t, i.OffPt.X = e.X, i.OffPt.Y = e.Y, this.m_GhostJoins.push(i)
    }, ee.Clipper.prototype.InsertLocalMinimaIntoAEL = function(t) {
        for (; null !== this.m_CurrentLM && this.m_CurrentLM.Y == t;) {
            var e = this.m_CurrentLM.LeftBound,
                i = this.m_CurrentLM.RightBound;
            this.PopLocalMinima();
            var n = null;
            if (null === e ? (this.InsertEdgeIntoAEL(i, null), this.SetWindingCount(i), this.IsContributing(i) && (n = this.AddOutPt(i, i.Bot))) : null == i ? (this.InsertEdgeIntoAEL(e, null), this.SetWindingCount(e), this.IsContributing(e) && (n = this.AddOutPt(e, e.Bot)), this.InsertScanbeam(e.Top.Y)) : (this.InsertEdgeIntoAEL(e, null), this.InsertEdgeIntoAEL(i, e), this.SetWindingCount(e), i.WindCnt = e.WindCnt, i.WindCnt2 = e.WindCnt2, this.IsContributing(e) && (n = this.AddLocalMinPoly(e, i, e.Bot)), this.InsertScanbeam(e.Top.Y)), null != i && (ee.ClipperBase.IsHorizontal(i) ? this.AddEdgeToSEL(i) : this.InsertScanbeam(i.Top.Y)), null != e && null != i) {
                if (null !== n && ee.ClipperBase.IsHorizontal(i) && this.m_GhostJoins.length > 0 && 0 !== i.WindDelta)
                    for (var o = 0, r = this.m_GhostJoins.length; o < r; o++) {
                        var s = this.m_GhostJoins[o];
                        this.HorzSegmentsOverlap(s.OutPt1.Pt, s.OffPt, i.Bot, i.Top) && this.AddJoin(s.OutPt1, n, s.OffPt)
                    }
                if (e.OutIdx >= 0 && null !== e.PrevInAEL && e.PrevInAEL.Curr.X == e.Bot.X && e.PrevInAEL.OutIdx >= 0 && ee.ClipperBase.SlopesEqual(e.PrevInAEL, e, this.m_UseFullRange) && 0 !== e.WindDelta && 0 !== e.PrevInAEL.WindDelta) {
                    var l = this.AddOutPt(e.PrevInAEL, e.Bot);
                    this.AddJoin(n, l, e.Top)
                }
                if (e.NextInAEL != i) {
                    if (i.OutIdx >= 0 && i.PrevInAEL.OutIdx >= 0 && ee.ClipperBase.SlopesEqual(i.PrevInAEL, i, this.m_UseFullRange) && 0 !== i.WindDelta && 0 !== i.PrevInAEL.WindDelta) {
                        var l = this.AddOutPt(i.PrevInAEL, i.Bot);
                        this.AddJoin(n, l, i.Top)
                    }
                    var p = e.NextInAEL;
                    if (null !== p)
                        for (; p != i;) this.IntersectEdges(i, p, e.Curr, !1), p = p.NextInAEL
                }
            }
        }
    }, ee.Clipper.prototype.InsertEdgeIntoAEL = function(t, e) {
        if (null === this.m_ActiveEdges) t.PrevInAEL = null, t.NextInAEL = null, this.m_ActiveEdges = t;
        else if (null === e && this.E2InsertsBeforeE1(this.m_ActiveEdges, t)) t.PrevInAEL = null, t.NextInAEL = this.m_ActiveEdges, this.m_ActiveEdges.PrevInAEL = t, this.m_ActiveEdges = t;
        else {
            for (null === e && (e = this.m_ActiveEdges); null !== e.NextInAEL && !this.E2InsertsBeforeE1(e.NextInAEL, t);) e = e.NextInAEL;
            t.NextInAEL = e.NextInAEL, null !== e.NextInAEL && (e.NextInAEL.PrevInAEL = t), t.PrevInAEL = e, e.NextInAEL = t
        }
    }, ee.Clipper.prototype.E2InsertsBeforeE1 = function(t, e) {
        return e.Curr.X == t.Curr.X ? e.Top.Y > t.Top.Y ? e.Top.X < ee.Clipper.TopX(t, e.Top.Y) : t.Top.X > ee.Clipper.TopX(e, t.Top.Y) : e.Curr.X < t.Curr.X
    }, ee.Clipper.prototype.IsEvenOddFillType = function(t) {
        return t.PolyTyp == ee.PolyType.ptSubject ? this.m_SubjFillType == ee.PolyFillType.pftEvenOdd : this.m_ClipFillType == ee.PolyFillType.pftEvenOdd
    }, ee.Clipper.prototype.IsEvenOddAltFillType = function(t) {
        return t.PolyTyp == ee.PolyType.ptSubject ? this.m_ClipFillType == ee.PolyFillType.pftEvenOdd : this.m_SubjFillType == ee.PolyFillType.pftEvenOdd
    }, ee.Clipper.prototype.IsContributing = function(t) {
        var e, i;
        switch (t.PolyTyp == ee.PolyType.ptSubject ? (e = this.m_SubjFillType, i = this.m_ClipFillType) : (e = this.m_ClipFillType, i = this.m_SubjFillType), e) {
            case ee.PolyFillType.pftEvenOdd:
                if (0 === t.WindDelta && 1 != t.WindCnt) return !1;
                break;
            case ee.PolyFillType.pftNonZero:
                if (1 != Math.abs(t.WindCnt)) return !1;
                break;
            case ee.PolyFillType.pftPositive:
                if (1 != t.WindCnt) return !1;
                break;
            default:
                if (-1 != t.WindCnt) return !1
        }
        switch (this.m_ClipType) {
            case ee.ClipType.ctIntersection:
                switch (i) {
                    case ee.PolyFillType.pftEvenOdd:
                    case ee.PolyFillType.pftNonZero:
                        return 0 !== t.WindCnt2;
                    case ee.PolyFillType.pftPositive:
                        return t.WindCnt2 > 0;
                    default:
                        return t.WindCnt2 < 0
                }
                case ee.ClipType.ctUnion:
                    switch (i) {
                        case ee.PolyFillType.pftEvenOdd:
                        case ee.PolyFillType.pftNonZero:
                            return 0 === t.WindCnt2;
                        case ee.PolyFillType.pftPositive:
                            return t.WindCnt2 <= 0;
                        default:
                            return t.WindCnt2 >= 0
                    }
                    case ee.ClipType.ctDifference:
                        if (t.PolyTyp == ee.PolyType.ptSubject) switch (i) {
                            case ee.PolyFillType.pftEvenOdd:
                            case ee.PolyFillType.pftNonZero:
                                return 0 === t.WindCnt2;
                            case ee.PolyFillType.pftPositive:
                                return t.WindCnt2 <= 0;
                            default:
                                return t.WindCnt2 >= 0
                        } else switch (i) {
                            case ee.PolyFillType.pftEvenOdd:
                            case ee.PolyFillType.pftNonZero:
                                return 0 !== t.WindCnt2;
                            case ee.PolyFillType.pftPositive:
                                return t.WindCnt2 > 0;
                            default:
                                return t.WindCnt2 < 0
                        }
                        case ee.ClipType.ctXor: if (0 !== t.WindDelta) return !0;
                        switch (i) {
                            case ee.PolyFillType.pftEvenOdd:
                            case ee.PolyFillType.pftNonZero:
                                return 0 === t.WindCnt2;
                            case ee.PolyFillType.pftPositive:
                                return t.WindCnt2 <= 0;
                            default:
                                return t.WindCnt2 >= 0
                        }
        }
        return !0
    }, ee.Clipper.prototype.SetWindingCount = function(t) {
        for (var e = t.PrevInAEL; null !== e && (e.PolyTyp != t.PolyTyp || 0 === e.WindDelta);) e = e.PrevInAEL;
        if (null === e) t.WindCnt = 0 === t.WindDelta ? 1 : t.WindDelta, t.WindCnt2 = 0, e = this.m_ActiveEdges;
        else if (0 === t.WindDelta && this.m_ClipType != ee.ClipType.ctUnion) t.WindCnt = 1, t.WindCnt2 = e.WindCnt2, e = e.NextInAEL;
        else if (this.IsEvenOddFillType(t)) {
            if (0 === t.WindDelta) {
                for (var i = !0, n = e.PrevInAEL; null !== n;) n.PolyTyp == e.PolyTyp && 0 !== n.WindDelta && (i = !i), n = n.PrevInAEL;
                t.WindCnt = i ? 0 : 1
            } else t.WindCnt = t.WindDelta;
            t.WindCnt2 = e.WindCnt2, e = e.NextInAEL
        } else e.WindCnt * e.WindDelta < 0 ? Math.abs(e.WindCnt) > 1 ? e.WindDelta * t.WindDelta < 0 ? t.WindCnt = e.WindCnt : t.WindCnt = e.WindCnt + t.WindDelta : t.WindCnt = 0 === t.WindDelta ? 1 : t.WindDelta : 0 === t.WindDelta ? t.WindCnt = e.WindCnt < 0 ? e.WindCnt - 1 : e.WindCnt + 1 : e.WindDelta * t.WindDelta < 0 ? t.WindCnt = e.WindCnt : t.WindCnt = e.WindCnt + t.WindDelta, t.WindCnt2 = e.WindCnt2, e = e.NextInAEL;
        if (this.IsEvenOddAltFillType(t))
            for (; e != t;) 0 !== e.WindDelta && (t.WindCnt2 = 0 === t.WindCnt2 ? 1 : 0), e = e.NextInAEL;
        else
            for (; e != t;) t.WindCnt2 += e.WindDelta, e = e.NextInAEL
    }, ee.Clipper.prototype.AddEdgeToSEL = function(t) {
        null === this.m_SortedEdges ? (this.m_SortedEdges = t, t.PrevInSEL = null, t.NextInSEL = null) : (t.NextInSEL = this.m_SortedEdges, t.PrevInSEL = null, this.m_SortedEdges.PrevInSEL = t, this.m_SortedEdges = t)
    }, ee.Clipper.prototype.CopyAELToSEL = function() {
        var t = this.m_ActiveEdges;
        for (this.m_SortedEdges = t; null !== t;) t.PrevInSEL = t.PrevInAEL, t.NextInSEL = t.NextInAEL, t = t.NextInAEL
    }, ee.Clipper.prototype.SwapPositionsInAEL = function(t, e) {
        if (t.NextInAEL != t.PrevInAEL && e.NextInAEL != e.PrevInAEL) {
            if (t.NextInAEL == e) {
                var i = e.NextInAEL;
                null !== i && (i.PrevInAEL = t);
                var n = t.PrevInAEL;
                null !== n && (n.NextInAEL = e), e.PrevInAEL = n, e.NextInAEL = t, t.PrevInAEL = e, t.NextInAEL = i
            } else if (e.NextInAEL == t) {
                var i = t.NextInAEL;
                null !== i && (i.PrevInAEL = e);
                var n = e.PrevInAEL;
                null !== n && (n.NextInAEL = t), t.PrevInAEL = n, t.NextInAEL = e, e.PrevInAEL = t, e.NextInAEL = i
            } else {
                var i = t.NextInAEL,
                    n = t.PrevInAEL;
                t.NextInAEL = e.NextInAEL, null !== t.NextInAEL && (t.NextInAEL.PrevInAEL = t), t.PrevInAEL = e.PrevInAEL, null !== t.PrevInAEL && (t.PrevInAEL.NextInAEL = t), e.NextInAEL = i, null !== e.NextInAEL && (e.NextInAEL.PrevInAEL = e), e.PrevInAEL = n, null !== e.PrevInAEL && (e.PrevInAEL.NextInAEL = e)
            }
            null === t.PrevInAEL ? this.m_ActiveEdges = t : null === e.PrevInAEL && (this.m_ActiveEdges = e)
        }
    }, ee.Clipper.prototype.SwapPositionsInSEL = function(t, e) {
        if (!(null === t.NextInSEL && null === t.PrevInSEL || null === e.NextInSEL && null === e.PrevInSEL)) {
            if (t.NextInSEL == e) {
                var i = e.NextInSEL;
                null !== i && (i.PrevInSEL = t);
                var n = t.PrevInSEL;
                null !== n && (n.NextInSEL = e), e.PrevInSEL = n, e.NextInSEL = t, t.PrevInSEL = e, t.NextInSEL = i
            } else if (e.NextInSEL == t) {
                var i = t.NextInSEL;
                null !== i && (i.PrevInSEL = e);
                var n = e.PrevInSEL;
                null !== n && (n.NextInSEL = t), t.PrevInSEL = n, t.NextInSEL = e, e.PrevInSEL = t, e.NextInSEL = i
            } else {
                var i = t.NextInSEL,
                    n = t.PrevInSEL;
                t.NextInSEL = e.NextInSEL, null !== t.NextInSEL && (t.NextInSEL.PrevInSEL = t), t.PrevInSEL = e.PrevInSEL, null !== t.PrevInSEL && (t.PrevInSEL.NextInSEL = t), e.NextInSEL = i, null !== e.NextInSEL && (e.NextInSEL.PrevInSEL = e), e.PrevInSEL = n, null !== e.PrevInSEL && (e.PrevInSEL.NextInSEL = e)
            }
            null === t.PrevInSEL ? this.m_SortedEdges = t : null === e.PrevInSEL && (this.m_SortedEdges = e)
        }
    }, ee.Clipper.prototype.AddLocalMaxPoly = function(t, e, i) {
        this.AddOutPt(t, i), 0 == e.WindDelta && this.AddOutPt(e, i), t.OutIdx == e.OutIdx ? (t.OutIdx = -1, e.OutIdx = -1) : t.OutIdx < e.OutIdx ? this.AppendPolygon(t, e) : this.AppendPolygon(e, t)
    }, ee.Clipper.prototype.AddLocalMinPoly = function(t, e, i) {
        var n, o, r;
        if (ee.ClipperBase.IsHorizontal(e) || t.Dx > e.Dx ? (n = this.AddOutPt(t, i), e.OutIdx = t.OutIdx, t.Side = ee.EdgeSide.esLeft, e.Side = ee.EdgeSide.esRight, o = t, r = o.PrevInAEL == e ? e.PrevInAEL : o.PrevInAEL) : (n = this.AddOutPt(e, i), t.OutIdx = e.OutIdx, t.Side = ee.EdgeSide.esRight, e.Side = ee.EdgeSide.esLeft, o = e, r = o.PrevInAEL == t ? t.PrevInAEL : o.PrevInAEL), null !== r && r.OutIdx >= 0 && ee.Clipper.TopX(r, i.Y) == ee.Clipper.TopX(o, i.Y) && ee.ClipperBase.SlopesEqual(o, r, this.m_UseFullRange) && 0 !== o.WindDelta && 0 !== r.WindDelta) {
            var s = this.AddOutPt(r, i);
            this.AddJoin(n, s, o.Top)
        }
        return n
    }, ee.Clipper.prototype.CreateOutRec = function() {
        var t = new ee.OutRec;
        return t.Idx = -1, t.IsHole = !1, t.IsOpen = !1, t.FirstLeft = null, t.Pts = null, t.BottomPt = null, t.PolyNode = null, this.m_PolyOuts.push(t), t.Idx = this.m_PolyOuts.length - 1, t
    }, ee.Clipper.prototype.AddOutPt = function(t, e) {
        var i = t.Side == ee.EdgeSide.esLeft;
        if (t.OutIdx < 0) {
            var n = this.CreateOutRec();
            n.IsOpen = 0 === t.WindDelta;
            var o = new ee.OutPt;
            return n.Pts = o, o.Idx = n.Idx, o.Pt.X = e.X, o.Pt.Y = e.Y, o.Next = o, o.Prev = o, n.IsOpen || this.SetHoleState(t, n), t.OutIdx = n.Idx, o
        }
        var n = this.m_PolyOuts[t.OutIdx],
            r = n.Pts;
        if (i && ee.IntPoint.op_Equality(e, r.Pt)) return r;
        if (!i && ee.IntPoint.op_Equality(e, r.Prev.Pt)) return r.Prev;
        var o = new ee.OutPt;
        return o.Idx = n.Idx, o.Pt.X = e.X, o.Pt.Y = e.Y, o.Next = r, o.Prev = r.Prev, o.Prev.Next = o, r.Prev = o, i && (n.Pts = o), o
    }, ee.Clipper.prototype.SwapPoints = function(t, e) {
        var i = new ee.IntPoint(t.Value);
        t.Value.X = e.Value.X, t.Value.Y = e.Value.Y, e.Value.X = i.X, e.Value.Y = i.Y
    }, ee.Clipper.prototype.HorzSegmentsOverlap = function(t, e, i, n) {
        return t.X > i.X == t.X < n.X || (e.X > i.X == e.X < n.X || (i.X > t.X == i.X < e.X || (n.X > t.X == n.X < e.X || (t.X == i.X && e.X == n.X || t.X == n.X && e.X == i.X))))
    }, ee.Clipper.prototype.InsertPolyPtBetween = function(t, e, i) {
        var n = new ee.OutPt;
        return n.Pt.X = i.X, n.Pt.Y = i.Y, e == t.Next ? (t.Next = n, e.Prev = n, n.Next = e, n.Prev = t) : (e.Next = n, t.Prev = n, n.Next = t, n.Prev = e), n
    }, ee.Clipper.prototype.SetHoleState = function(t, e) {
        for (var i = !1, n = t.PrevInAEL; null !== n;) n.OutIdx >= 0 && 0 != n.WindDelta && (i = !i, null === e.FirstLeft && (e.FirstLeft = this.m_PolyOuts[n.OutIdx])), n = n.PrevInAEL;
        i && (e.IsHole = !0)
    }, ee.Clipper.prototype.GetDx = function(t, e) {
        return t.Y == e.Y ? ee.ClipperBase.horizontal : (e.X - t.X) / (e.Y - t.Y)
    }, ee.Clipper.prototype.FirstIsBottomPt = function(t, e) {
        for (var i = t.Prev; ee.IntPoint.op_Equality(i.Pt, t.Pt) && i != t;) i = i.Prev;
        var n = Math.abs(this.GetDx(t.Pt, i.Pt));
        for (i = t.Next; ee.IntPoint.op_Equality(i.Pt, t.Pt) && i != t;) i = i.Next;
        var o = Math.abs(this.GetDx(t.Pt, i.Pt));
        for (i = e.Prev; ee.IntPoint.op_Equality(i.Pt, e.Pt) && i != e;) i = i.Prev;
        var r = Math.abs(this.GetDx(e.Pt, i.Pt));
        for (i = e.Next; ee.IntPoint.op_Equality(i.Pt, e.Pt) && i != e;) i = i.Next;
        var s = Math.abs(this.GetDx(e.Pt, i.Pt));
        return n >= r && n >= s || o >= r && o >= s
    }, ee.Clipper.prototype.GetBottomPt = function(t) {
        for (var e = null, i = t.Next; i != t;) i.Pt.Y > t.Pt.Y ? (t = i, e = null) : i.Pt.Y == t.Pt.Y && i.Pt.X <= t.Pt.X && (i.Pt.X < t.Pt.X ? (e = null, t = i) : i.Next != t && i.Prev != t && (e = i)), i = i.Next;
        if (null !== e)
            for (; e != i;)
                for (this.FirstIsBottomPt(i, e) || (t = e), e = e.Next; ee.IntPoint.op_Inequality(e.Pt, t.Pt);) e = e.Next;
        return t
    }, ee.Clipper.prototype.GetLowermostRec = function(t, e) {
        null === t.BottomPt && (t.BottomPt = this.GetBottomPt(t.Pts)), null === e.BottomPt && (e.BottomPt = this.GetBottomPt(e.Pts));
        var i = t.BottomPt,
            n = e.BottomPt;
        return i.Pt.Y > n.Pt.Y ? t : i.Pt.Y < n.Pt.Y ? e : i.Pt.X < n.Pt.X ? t : i.Pt.X > n.Pt.X ? e : i.Next == i ? e : n.Next == n ? t : this.FirstIsBottomPt(i, n) ? t : e
    }, ee.Clipper.prototype.Param1RightOfParam2 = function(t, e) {
        do {
            if ((t = t.FirstLeft) == e) return !0
        } while (null !== t);
        return !1
    }, ee.Clipper.prototype.GetOutRec = function(t) {
        for (var e = this.m_PolyOuts[t]; e != this.m_PolyOuts[e.Idx];) e = this.m_PolyOuts[e.Idx];
        return e
    }, ee.Clipper.prototype.AppendPolygon = function(t, e) {
        var i, n = this.m_PolyOuts[t.OutIdx],
            o = this.m_PolyOuts[e.OutIdx];
        i = this.Param1RightOfParam2(n, o) ? o : this.Param1RightOfParam2(o, n) ? n : this.GetLowermostRec(n, o);
        var r, s = n.Pts,
            l = s.Prev,
            p = o.Pts,
            u = p.Prev;
        t.Side == ee.EdgeSide.esLeft ? (e.Side == ee.EdgeSide.esLeft ? (this.ReversePolyPtLinks(p), p.Next = s, s.Prev = p, l.Next = u, u.Prev = l, n.Pts = u) : (u.Next = s, s.Prev = u, p.Prev = l, l.Next = p, n.Pts = p), r = ee.EdgeSide.esLeft) : (e.Side == ee.EdgeSide.esRight ? (this.ReversePolyPtLinks(p), l.Next = u, u.Prev = l, p.Next = s, s.Prev = p) : (l.Next = p, p.Prev = l, s.Prev = u, u.Next = s), r = ee.EdgeSide.esRight), n.BottomPt = null, i == o && (o.FirstLeft != n && (n.FirstLeft = o.FirstLeft), n.IsHole = o.IsHole), o.Pts = null, o.BottomPt = null, o.FirstLeft = n;
        var a = t.OutIdx,
            h = e.OutIdx;
        t.OutIdx = -1, e.OutIdx = -1;
        for (var d = this.m_ActiveEdges; null !== d;) {
            if (d.OutIdx == h) {
                d.OutIdx = a, d.Side = r;
                break
            }
            d = d.NextInAEL
        }
        o.Idx = n.Idx
    }, ee.Clipper.prototype.ReversePolyPtLinks = function(t) {
        if (null !== t) {
            var e, i;
            e = t;
            do {
                i = e.Next, e.Next = e.Prev, e.Prev = i, e = i
            } while (e != t)
        }
    }, ee.Clipper.SwapSides = function(t, e) {
        var i = t.Side;
        t.Side = e.Side, e.Side = i
    }, ee.Clipper.SwapPolyIndexes = function(t, e) {
        var i = t.OutIdx;
        t.OutIdx = e.OutIdx, e.OutIdx = i
    }, ee.Clipper.prototype.IntersectEdges = function(t, e, i, n) {
        var o = !n && null === t.NextInLML && t.Top.X == i.X && t.Top.Y == i.Y,
            r = !n && null === e.NextInLML && e.Top.X == i.X && e.Top.Y == i.Y,
            s = t.OutIdx >= 0,
            l = e.OutIdx >= 0;
        if (0 === t.WindDelta || 0 === e.WindDelta) return 0 === t.WindDelta && 0 === e.WindDelta ? (o || r) && s && l && this.AddLocalMaxPoly(t, e, i) : t.PolyTyp == e.PolyTyp && t.WindDelta != e.WindDelta && this.m_ClipType == ee.ClipType.ctUnion ? 0 === t.WindDelta ? l && (this.AddOutPt(t, i), s && (t.OutIdx = -1)) : s && (this.AddOutPt(e, i), l && (e.OutIdx = -1)) : t.PolyTyp != e.PolyTyp && (0 !== t.WindDelta || 1 != Math.abs(e.WindCnt) || this.m_ClipType == ee.ClipType.ctUnion && 0 !== e.WindCnt2 ? 0 !== e.WindDelta || 1 != Math.abs(t.WindCnt) || this.m_ClipType == ee.ClipType.ctUnion && 0 !== t.WindCnt2 || (this.AddOutPt(e, i), l && (e.OutIdx = -1)) : (this.AddOutPt(t, i), s && (t.OutIdx = -1))), o && (t.OutIdx < 0 ? this.DeleteFromAEL(t) : ee.Error("Error intersecting polylines")), void(r && (e.OutIdx < 0 ? this.DeleteFromAEL(e) : ee.Error("Error intersecting polylines")));
        if (t.PolyTyp == e.PolyTyp)
            if (this.IsEvenOddFillType(t)) {
                var p = t.WindCnt;
                t.WindCnt = e.WindCnt, e.WindCnt = p
            } else t.WindCnt + e.WindDelta === 0 ? t.WindCnt = -t.WindCnt : t.WindCnt += e.WindDelta, e.WindCnt - t.WindDelta == 0 ? e.WindCnt = -e.WindCnt : e.WindCnt -= t.WindDelta;
        else this.IsEvenOddFillType(e) ? t.WindCnt2 = 0 === t.WindCnt2 ? 1 : 0 : t.WindCnt2 += e.WindDelta, this.IsEvenOddFillType(t) ? e.WindCnt2 = 0 === e.WindCnt2 ? 1 : 0 : e.WindCnt2 -= t.WindDelta;
        var u, a, h, d;
        t.PolyTyp == ee.PolyType.ptSubject ? (u = this.m_SubjFillType, h = this.m_ClipFillType) : (u = this.m_ClipFillType, h = this.m_SubjFillType), e.PolyTyp == ee.PolyType.ptSubject ? (a = this.m_SubjFillType, d = this.m_ClipFillType) : (a = this.m_ClipFillType, d = this.m_SubjFillType);
        var f, P;
        switch (u) {
            case ee.PolyFillType.pftPositive:
                f = t.WindCnt;
                break;
            case ee.PolyFillType.pftNegative:
                f = -t.WindCnt;
                break;
            default:
                f = Math.abs(t.WindCnt)
        }
        switch (a) {
            case ee.PolyFillType.pftPositive:
                P = e.WindCnt;
                break;
            case ee.PolyFillType.pftNegative:
                P = -e.WindCnt;
                break;
            default:
                P = Math.abs(e.WindCnt)
        }
        if (s && l) o || r || 0 !== f && 1 != f || 0 !== P && 1 != P || t.PolyTyp != e.PolyTyp && this.m_ClipType != ee.ClipType.ctXor ? this.AddLocalMaxPoly(t, e, i) : (this.AddOutPt(t, i), this.AddOutPt(e, i), ee.Clipper.SwapSides(t, e), ee.Clipper.SwapPolyIndexes(t, e));
        else if (s) 0 !== P && 1 != P || (this.AddOutPt(t, i), ee.Clipper.SwapSides(t, e), ee.Clipper.SwapPolyIndexes(t, e));
        else if (l) 0 !== f && 1 != f || (this.AddOutPt(e, i), ee.Clipper.SwapSides(t, e), ee.Clipper.SwapPolyIndexes(t, e));
        else if (!(0 !== f && 1 != f || 0 !== P && 1 != P || o || r)) {
            var m, c;
            switch (h) {
                case ee.PolyFillType.pftPositive:
                    m = t.WindCnt2;
                    break;
                case ee.PolyFillType.pftNegative:
                    m = -t.WindCnt2;
                    break;
                default:
                    m = Math.abs(t.WindCnt2)
            }
            switch (d) {
                case ee.PolyFillType.pftPositive:
                    c = e.WindCnt2;
                    break;
                case ee.PolyFillType.pftNegative:
                    c = -e.WindCnt2;
                    break;
                default:
                    c = Math.abs(e.WindCnt2)
            }
            if (t.PolyTyp != e.PolyTyp) this.AddLocalMinPoly(t, e, i);
            else if (1 == f && 1 == P) switch (this.m_ClipType) {
                case ee.ClipType.ctIntersection:
                    m > 0 && c > 0 && this.AddLocalMinPoly(t, e, i);
                    break;
                case ee.ClipType.ctUnion:
                    m <= 0 && c <= 0 && this.AddLocalMinPoly(t, e, i);
                    break;
                case ee.ClipType.ctDifference:
                    (t.PolyTyp == ee.PolyType.ptClip && m > 0 && c > 0 || t.PolyTyp == ee.PolyType.ptSubject && m <= 0 && c <= 0) && this.AddLocalMinPoly(t, e, i);
                    break;
                case ee.ClipType.ctXor:
                    this.AddLocalMinPoly(t, e, i)
            } else ee.Clipper.SwapSides(t, e)
        }
        o != r && (o && t.OutIdx >= 0 || r && e.OutIdx >= 0) && (ee.Clipper.SwapSides(t, e), ee.Clipper.SwapPolyIndexes(t, e)), o && this.DeleteFromAEL(t), r && this.DeleteFromAEL(e)
    }, ee.Clipper.prototype.DeleteFromAEL = function(t) {
        var e = t.PrevInAEL,
            i = t.NextInAEL;
        null === e && null === i && t != this.m_ActiveEdges || (null !== e ? e.NextInAEL = i : this.m_ActiveEdges = i, null !== i && (i.PrevInAEL = e), t.NextInAEL = null, t.PrevInAEL = null)
    }, ee.Clipper.prototype.DeleteFromSEL = function(t) {
        var e = t.PrevInSEL,
            i = t.NextInSEL;
        null === e && null === i && t != this.m_SortedEdges || (null !== e ? e.NextInSEL = i : this.m_SortedEdges = i, null !== i && (i.PrevInSEL = e), t.NextInSEL = null, t.PrevInSEL = null)
    }, ee.Clipper.prototype.UpdateEdgeIntoAEL = function(t) {
        null === t.NextInLML && ee.Error("UpdateEdgeIntoAEL: invalid call");
        var e = t.PrevInAEL,
            i = t.NextInAEL;
        return t.NextInLML.OutIdx = t.OutIdx, null !== e ? e.NextInAEL = t.NextInLML : this.m_ActiveEdges = t.NextInLML, null !== i && (i.PrevInAEL = t.NextInLML), t.NextInLML.Side = t.Side, t.NextInLML.WindDelta = t.WindDelta, t.NextInLML.WindCnt = t.WindCnt, t.NextInLML.WindCnt2 = t.WindCnt2, t = t.NextInLML, t.Curr.X = t.Bot.X, t.Curr.Y = t.Bot.Y, t.PrevInAEL = e, t.NextInAEL = i, ee.ClipperBase.IsHorizontal(t) || this.InsertScanbeam(t.Top.Y), t
    }, ee.Clipper.prototype.ProcessHorizontals = function(t) {
        for (var e = this.m_SortedEdges; null !== e;) this.DeleteFromSEL(e), this.ProcessHorizontal(e, t), e = this.m_SortedEdges
    }, ee.Clipper.prototype.GetHorzDirection = function(t, e) {
        t.Bot.X < t.Top.X ? (e.Left = t.Bot.X, e.Right = t.Top.X, e.Dir = ee.Direction.dLeftToRight) : (e.Left = t.Top.X, e.Right = t.Bot.X, e.Dir = ee.Direction.dRightToLeft)
    }, ee.Clipper.prototype.PrepareHorzJoins = function(t, e) {
        var i = this.m_PolyOuts[t.OutIdx].Pts;
        t.Side != ee.EdgeSide.esLeft && (i = i.Prev), e && (ee.IntPoint.op_Equality(i.Pt, t.Top) ? this.AddGhostJoin(i, t.Bot) : this.AddGhostJoin(i, t.Top))
    }, ee.Clipper.prototype.ProcessHorizontal = function(t, e) {
        var i = {
            Dir: null,
            Left: null,
            Right: null
        };
        this.GetHorzDirection(t, i);
        for (var n = i.Dir, o = i.Left, r = i.Right, s = t, l = null; null !== s.NextInLML && ee.ClipperBase.IsHorizontal(s.NextInLML);) s = s.NextInLML;
        for (null === s.NextInLML && (l = this.GetMaximaPair(s));;) {
            for (var p = t == s, u = this.GetNextInAEL(t, n); null !== u && !(u.Curr.X == t.Top.X && null !== t.NextInLML && u.Dx < t.NextInLML.Dx);) {
                var a = this.GetNextInAEL(u, n);
                if (n == ee.Direction.dLeftToRight && u.Curr.X <= r || n == ee.Direction.dRightToLeft && u.Curr.X >= o) {
                    if (t.OutIdx >= 0 && 0 != t.WindDelta && this.PrepareHorzJoins(t, e), u == l && p) return n == ee.Direction.dLeftToRight ? this.IntersectEdges(t, u, u.Top, !1) : this.IntersectEdges(u, t, u.Top, !1), void(l.OutIdx >= 0 && ee.Error("ProcessHorizontal error"));
                    if (n == ee.Direction.dLeftToRight) {
                        var h = new ee.IntPoint(u.Curr.X, t.Curr.Y);
                        this.IntersectEdges(t, u, h, !0)
                    } else {
                        var h = new ee.IntPoint(u.Curr.X, t.Curr.Y);
                        this.IntersectEdges(u, t, h, !0)
                    }
                    this.SwapPositionsInAEL(t, u)
                } else if (n == ee.Direction.dLeftToRight && u.Curr.X >= r || n == ee.Direction.dRightToLeft && u.Curr.X <= o) break;
                u = a
            }
            if (t.OutIdx >= 0 && 0 !== t.WindDelta && this.PrepareHorzJoins(t, e), null === t.NextInLML || !ee.ClipperBase.IsHorizontal(t.NextInLML)) break;
            t = this.UpdateEdgeIntoAEL(t), t.OutIdx >= 0 && this.AddOutPt(t, t.Bot);
            var i = {
                Dir: n,
                Left: o,
                Right: r
            };
            this.GetHorzDirection(t, i), n = i.Dir, o = i.Left, r = i.Right
        }
        if (null !== t.NextInLML)
            if (t.OutIdx >= 0) {
                var d = this.AddOutPt(t, t.Top);
                if (t = this.UpdateEdgeIntoAEL(t), 0 === t.WindDelta) return;
                var f = t.PrevInAEL,
                    a = t.NextInAEL;
                if (null !== f && f.Curr.X == t.Bot.X && f.Curr.Y == t.Bot.Y && 0 !== f.WindDelta && f.OutIdx >= 0 && f.Curr.Y > f.Top.Y && ee.ClipperBase.SlopesEqual(t, f, this.m_UseFullRange)) {
                    var P = this.AddOutPt(f, t.Bot);
                    this.AddJoin(d, P, t.Top)
                } else if (null !== a && a.Curr.X == t.Bot.X && a.Curr.Y == t.Bot.Y && 0 !== a.WindDelta && a.OutIdx >= 0 && a.Curr.Y > a.Top.Y && ee.ClipperBase.SlopesEqual(t, a, this.m_UseFullRange)) {
                    var P = this.AddOutPt(a, t.Bot);
                    this.AddJoin(d, P, t.Top)
                }
            } else t = this.UpdateEdgeIntoAEL(t);
        else null !== l ? l.OutIdx >= 0 ? (n == ee.Direction.dLeftToRight ? this.IntersectEdges(t, l, t.Top, !1) : this.IntersectEdges(l, t, t.Top, !1), l.OutIdx >= 0 && ee.Error("ProcessHorizontal error")) : (this.DeleteFromAEL(t), this.DeleteFromAEL(l)) : (t.OutIdx >= 0 && this.AddOutPt(t, t.Top), this.DeleteFromAEL(t))
    }, ee.Clipper.prototype.GetNextInAEL = function(t, e) {
        return e == ee.Direction.dLeftToRight ? t.NextInAEL : t.PrevInAEL
    }, ee.Clipper.prototype.IsMinima = function(t) {
        return null !== t && t.Prev.NextInLML != t && t.Next.NextInLML != t
    }, ee.Clipper.prototype.IsMaxima = function(t, e) {
        return null !== t && t.Top.Y == e && null === t.NextInLML
    }, ee.Clipper.prototype.IsIntermediate = function(t, e) {
        return t.Top.Y == e && null !== t.NextInLML
    }, ee.Clipper.prototype.GetMaximaPair = function(t) {
        var e = null;
        return ee.IntPoint.op_Equality(t.Next.Top, t.Top) && null === t.Next.NextInLML ? e = t.Next : ee.IntPoint.op_Equality(t.Prev.Top, t.Top) && null === t.Prev.NextInLML && (e = t.Prev), null === e || -2 != e.OutIdx && (e.NextInAEL != e.PrevInAEL || ee.ClipperBase.IsHorizontal(e)) ? e : null
    }, ee.Clipper.prototype.ProcessIntersections = function(t, e) {
        if (null == this.m_ActiveEdges) return !0;
        try {
            if (this.BuildIntersectList(t, e), 0 == this.m_IntersectList.length) return !0;
            if (1 != this.m_IntersectList.length && !this.FixupIntersectionOrder()) return !1;
            this.ProcessIntersectList()
        } catch (t) {
            this.m_SortedEdges = null, this.m_IntersectList.length = 0, ee.Error("ProcessIntersections error")
        }
        return this.m_SortedEdges = null, !0
    }, ee.Clipper.prototype.BuildIntersectList = function(t, e) {
        if (null !== this.m_ActiveEdges) {
            var i = this.m_ActiveEdges;
            for (this.m_SortedEdges = i; null !== i;) i.PrevInSEL = i.PrevInAEL, i.NextInSEL = i.NextInAEL, i.Curr.X = ee.Clipper.TopX(i, e), i = i.NextInAEL;
            for (var n = !0; n && null !== this.m_SortedEdges;) {
                for (n = !1, i = this.m_SortedEdges; null !== i.NextInSEL;) {
                    var o = i.NextInSEL,
                        r = new ee.IntPoint;
                    if (i.Curr.X > o.Curr.X) {
                        !this.IntersectPoint(i, o, r) && i.Curr.X > o.Curr.X + 1 && ee.Error("Intersection error"), r.Y > t && (r.Y = t, Math.abs(i.Dx) > Math.abs(o.Dx) ? r.X = ee.Clipper.TopX(o, t) : r.X = ee.Clipper.TopX(i, t));
                        var s = new ee.IntersectNode;
                        s.Edge1 = i, s.Edge2 = o, s.Pt.X = r.X, s.Pt.Y = r.Y, this.m_IntersectList.push(s), this.SwapPositionsInSEL(i, o), n = !0
                    } else i = o
                }
                if (null === i.PrevInSEL) break;
                i.PrevInSEL.NextInSEL = null
            }
            this.m_SortedEdges = null
        }
    }, ee.Clipper.prototype.EdgesAdjacent = function(t) {
        return t.Edge1.NextInSEL == t.Edge2 || t.Edge1.PrevInSEL == t.Edge2
    }, ee.Clipper.IntersectNodeSort = function(t, e) {
        return e.Pt.Y - t.Pt.Y
    }, ee.Clipper.prototype.FixupIntersectionOrder = function() {
        this.m_IntersectList.sort(this.m_IntersectNodeComparer), this.CopyAELToSEL();
        for (var t = this.m_IntersectList.length, e = 0; e < t; e++) {
            if (!this.EdgesAdjacent(this.m_IntersectList[e])) {
                for (var i = e + 1; i < t && !this.EdgesAdjacent(this.m_IntersectList[i]);) i++;
                if (i == t) return !1;
                var n = this.m_IntersectList[e];
                this.m_IntersectList[e] = this.m_IntersectList[i], this.m_IntersectList[i] = n
            }
            this.SwapPositionsInSEL(this.m_IntersectList[e].Edge1, this.m_IntersectList[e].Edge2)
        }
        return !0
    }, ee.Clipper.prototype.ProcessIntersectList = function() {
        for (var t = 0, e = this.m_IntersectList.length; t < e; t++) {
            var i = this.m_IntersectList[t];
            this.IntersectEdges(i.Edge1, i.Edge2, i.Pt, !0), this.SwapPositionsInAEL(i.Edge1, i.Edge2)
        }
        this.m_IntersectList.length = 0
    };
    var me = function(t) {
            return t < 0 ? Math.ceil(t - .5) : Math.round(t)
        },
        ce = function(t) {
            return t < 0 ? Math.ceil(t - .5) : Math.floor(t + .5)
        },
        ye = function(t) {
            return t < 0 ? -Math.round(Math.abs(t)) : Math.round(t)
        },
        ve = function(t) {
            return t < 0 ? (t -= .5, t < -2147483648 ? Math.ceil(t) : 0 | t) : (t += .5, t > 2147483647 ? Math.floor(t) : 0 | t)
        };
    re.msie ? ee.Clipper.Round = me : re.chromium ? ee.Clipper.Round = ye : re.safari ? ee.Clipper.Round = ve : ee.Clipper.Round = ce, ee.Clipper.TopX = function(t, e) {
        return e == t.Top.Y ? t.Top.X : t.Bot.X + ee.Clipper.Round(t.Dx * (e - t.Bot.Y))
    }, ee.Clipper.prototype.IntersectPoint = function(t, e, i) {
        i.X = 0, i.Y = 0;
        var n, o;
        if (ee.ClipperBase.SlopesEqual(t, e, this.m_UseFullRange) || t.Dx == e.Dx) return e.Bot.Y > t.Bot.Y ? (i.X = e.Bot.X, i.Y = e.Bot.Y) : (i.X = t.Bot.X, i.Y = t.Bot.Y), !1;
        if (0 === t.Delta.X) i.X = t.Bot.X, ee.ClipperBase.IsHorizontal(e) ? i.Y = e.Bot.Y : (o = e.Bot.Y - e.Bot.X / e.Dx, i.Y = ee.Clipper.Round(i.X / e.Dx + o));
        else if (0 === e.Delta.X) i.X = e.Bot.X, ee.ClipperBase.IsHorizontal(t) ? i.Y = t.Bot.Y : (n = t.Bot.Y - t.Bot.X / t.Dx, i.Y = ee.Clipper.Round(i.X / t.Dx + n));
        else {
            n = t.Bot.X - t.Bot.Y * t.Dx, o = e.Bot.X - e.Bot.Y * e.Dx;
            var r = (o - n) / (t.Dx - e.Dx);
            i.Y = ee.Clipper.Round(r), Math.abs(t.Dx) < Math.abs(e.Dx) ? i.X = ee.Clipper.Round(t.Dx * r + n) : i.X = ee.Clipper.Round(e.Dx * r + o)
        }
        if (i.Y < t.Top.Y || i.Y < e.Top.Y) {
            if (t.Top.Y > e.Top.Y) return i.Y = t.Top.Y, i.X = ee.Clipper.TopX(e, t.Top.Y), i.X < t.Top.X;
            i.Y = e.Top.Y, Math.abs(t.Dx) < Math.abs(e.Dx) ? i.X = ee.Clipper.TopX(t, i.Y) : i.X = ee.Clipper.TopX(e, i.Y)
        }
        return !0
    }, ee.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function(t) {
        for (var e = this.m_ActiveEdges; null !== e;) {
            var i = this.IsMaxima(e, t);
            if (i) {
                var n = this.GetMaximaPair(e);
                i = null === n || !ee.ClipperBase.IsHorizontal(n)
            }
            if (i) {
                var o = e.PrevInAEL;
                this.DoMaxima(e), e = null === o ? this.m_ActiveEdges : o.NextInAEL
            } else {
                if (this.IsIntermediate(e, t) && ee.ClipperBase.IsHorizontal(e.NextInLML) ? (e = this.UpdateEdgeIntoAEL(e), e.OutIdx >= 0 && this.AddOutPt(e, e.Bot), this.AddEdgeToSEL(e)) : (e.Curr.X = ee.Clipper.TopX(e, t), e.Curr.Y = t), this.StrictlySimple) {
                    var o = e.PrevInAEL;
                    if (e.OutIdx >= 0 && 0 !== e.WindDelta && null !== o && o.OutIdx >= 0 && o.Curr.X == e.Curr.X && 0 !== o.WindDelta) {
                        var r = this.AddOutPt(o, e.Curr),
                            s = this.AddOutPt(e, e.Curr);
                        this.AddJoin(r, s, e.Curr)
                    }
                }
                e = e.NextInAEL
            }
        }
        for (this.ProcessHorizontals(!0), e = this.m_ActiveEdges; null !== e;) {
            if (this.IsIntermediate(e, t)) {
                var r = null;
                e.OutIdx >= 0 && (r = this.AddOutPt(e, e.Top)), e = this.UpdateEdgeIntoAEL(e);
                var o = e.PrevInAEL,
                    l = e.NextInAEL;
                if (null !== o && o.Curr.X == e.Bot.X && o.Curr.Y == e.Bot.Y && null !== r && o.OutIdx >= 0 && o.Curr.Y > o.Top.Y && ee.ClipperBase.SlopesEqual(e, o, this.m_UseFullRange) && 0 !== e.WindDelta && 0 !== o.WindDelta) {
                    var s = this.AddOutPt(o, e.Bot);
                    this.AddJoin(r, s, e.Top)
                } else if (null !== l && l.Curr.X == e.Bot.X && l.Curr.Y == e.Bot.Y && null !== r && l.OutIdx >= 0 && l.Curr.Y > l.Top.Y && ee.ClipperBase.SlopesEqual(e, l, this.m_UseFullRange) && 0 !== e.WindDelta && 0 !== l.WindDelta) {
                    var s = this.AddOutPt(l, e.Bot);
                    this.AddJoin(r, s, e.Top)
                }
            }
            e = e.NextInAEL
        }
    }, ee.Clipper.prototype.DoMaxima = function(t) {
        var e = this.GetMaximaPair(t);
        if (null === e) return t.OutIdx >= 0 && this.AddOutPt(t, t.Top), void this.DeleteFromAEL(t);
        for (var i = t.NextInAEL; null !== i && i != e;) this.IntersectEdges(t, i, t.Top, !0), this.SwapPositionsInAEL(t, i), i = t.NextInAEL; - 1 == t.OutIdx && -1 == e.OutIdx ? (this.DeleteFromAEL(t), this.DeleteFromAEL(e)) : t.OutIdx >= 0 && e.OutIdx >= 0 ? this.IntersectEdges(t, e, t.Top, !1) : 0 === t.WindDelta ? (t.OutIdx >= 0 && (this.AddOutPt(t, t.Top), t.OutIdx = -1), this.DeleteFromAEL(t), e.OutIdx >= 0 && (this.AddOutPt(e, t.Top), e.OutIdx = -1), this.DeleteFromAEL(e)) : ee.Error("DoMaxima error")
    }, ee.Clipper.ReversePaths = function(t) {
        for (var e = 0, i = t.length; e < i; e++) t[e].reverse()
    }, ee.Clipper.Orientation = function(t) {
        return ee.Clipper.Area(t) >= 0
    }, ee.Clipper.prototype.PointCount = function(t) {
        if (null === t) return 0;
        var e = 0,
            i = t;
        do {
            e++, i = i.Next
        } while (i != t);
        return e
    }, ee.Clipper.prototype.BuildResult = function(t) {
        ee.Clear(t);
        for (var e = 0, i = this.m_PolyOuts.length; e < i; e++) {
            var n = this.m_PolyOuts[e];
            if (null !== n.Pts) {
                var o = n.Pts.Prev,
                    r = this.PointCount(o);
                if (!(r < 2)) {
                    for (var s = new Array(r), l = 0; l < r; l++) s[l] = o.Pt, o = o.Prev;
                    t.push(s)
                }
            }
        }
    }, ee.Clipper.prototype.BuildResult2 = function(t) {
        t.Clear();
        for (var e = 0, i = this.m_PolyOuts.length; e < i; e++) {
            var n = this.m_PolyOuts[e],
                o = this.PointCount(n.Pts);
            if (!(n.IsOpen && o < 2 || !n.IsOpen && o < 3)) {
                this.FixHoleLinkage(n);
                var r = new ee.PolyNode;
                t.m_AllPolys.push(r), n.PolyNode = r, r.m_polygon.length = o;
                for (var s = n.Pts.Prev, l = 0; l < o; l++) r.m_polygon[l] = s.Pt, s = s.Prev
            }
        }
        for (var e = 0, i = this.m_PolyOuts.length; e < i; e++) {
            var n = this.m_PolyOuts[e];
            null !== n.PolyNode && (n.IsOpen ? (n.PolyNode.IsOpen = !0, t.AddChild(n.PolyNode)) : null !== n.FirstLeft && null != n.FirstLeft.PolyNode ? n.FirstLeft.PolyNode.AddChild(n.PolyNode) : t.AddChild(n.PolyNode))
        }
    }, ee.Clipper.prototype.FixupOutPolygon = function(t) {
        var e = null;
        t.BottomPt = null;
        for (var i = t.Pts;;) {
            if (i.Prev == i || i.Prev == i.Next) return this.DisposeOutPts(i), void(t.Pts = null);
            if (ee.IntPoint.op_Equality(i.Pt, i.Next.Pt) || ee.IntPoint.op_Equality(i.Pt, i.Prev.Pt) || ee.ClipperBase.SlopesEqual(i.Prev.Pt, i.Pt, i.Next.Pt, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(i.Prev.Pt, i.Pt, i.Next.Pt))) {
                e = null;
                i.Prev.Next = i.Next, i.Next.Prev = i.Prev, i = i.Prev, null
            } else {
                if (i == e) break;
                null === e && (e = i), i = i.Next
            }
        }
        t.Pts = i
    }, ee.Clipper.prototype.DupOutPt = function(t, e) {
        var i = new ee.OutPt;
        return i.Pt.X = t.Pt.X, i.Pt.Y = t.Pt.Y, i.Idx = t.Idx, e ? (i.Next = t.Next, i.Prev = t, t.Next.Prev = i, t.Next = i) : (i.Prev = t.Prev, i.Next = t, t.Prev.Next = i, t.Prev = i), i
    }, ee.Clipper.prototype.GetOverlap = function(t, e, i, n, o) {
        return t < e ? i < n ? (o.Left = Math.max(t, i), o.Right = Math.min(e, n)) : (o.Left = Math.max(t, n), o.Right = Math.min(e, i)) : i < n ? (o.Left = Math.max(e, i), o.Right = Math.min(t, n)) : (o.Left = Math.max(e, n), o.Right = Math.min(t, i)), o.Left < o.Right
    }, ee.Clipper.prototype.JoinHorz = function(t, e, i, n, o, r) {
        var s = t.Pt.X > e.Pt.X ? ee.Direction.dRightToLeft : ee.Direction.dLeftToRight,
            l = i.Pt.X > n.Pt.X ? ee.Direction.dRightToLeft : ee.Direction.dLeftToRight;
        if (s == l) return !1;
        if (s == ee.Direction.dLeftToRight) {
            for (; t.Next.Pt.X <= o.X && t.Next.Pt.X >= t.Pt.X && t.Next.Pt.Y == o.Y;) t = t.Next;
            r && t.Pt.X != o.X && (t = t.Next), e = this.DupOutPt(t, !r), ee.IntPoint.op_Inequality(e.Pt, o) && (t = e, t.Pt.X = o.X, t.Pt.Y = o.Y, e = this.DupOutPt(t, !r))
        } else {
            for (; t.Next.Pt.X >= o.X && t.Next.Pt.X <= t.Pt.X && t.Next.Pt.Y == o.Y;) t = t.Next;
            r || t.Pt.X == o.X || (t = t.Next), e = this.DupOutPt(t, r), ee.IntPoint.op_Inequality(e.Pt, o) && (t = e, t.Pt.X = o.X, t.Pt.Y = o.Y, e = this.DupOutPt(t, r))
        }
        if (l == ee.Direction.dLeftToRight) {
            for (; i.Next.Pt.X <= o.X && i.Next.Pt.X >= i.Pt.X && i.Next.Pt.Y == o.Y;) i = i.Next;
            r && i.Pt.X != o.X && (i = i.Next), n = this.DupOutPt(i, !r), ee.IntPoint.op_Inequality(n.Pt, o) && (i = n, i.Pt.X = o.X, i.Pt.Y = o.Y, n = this.DupOutPt(i, !r))
        } else {
            for (; i.Next.Pt.X >= o.X && i.Next.Pt.X <= i.Pt.X && i.Next.Pt.Y == o.Y;) i = i.Next;
            r || i.Pt.X == o.X || (i = i.Next), n = this.DupOutPt(i, r), ee.IntPoint.op_Inequality(n.Pt, o) && (i = n, i.Pt.X = o.X, i.Pt.Y = o.Y, n = this.DupOutPt(i, r))
        }
        return s == ee.Direction.dLeftToRight == r ? (t.Prev = i, i.Next = t, e.Next = n, n.Prev = e) : (t.Next = i, i.Prev = t, e.Prev = n, n.Next = e), !0
    }, ee.Clipper.prototype.JoinPoints = function(t, e, i) {
        var n = t.OutPt1,
            o = new ee.OutPt,
            r = t.OutPt2,
            s = new ee.OutPt,
            l = t.OutPt1.Pt.Y == t.OffPt.Y;
        if (l && ee.IntPoint.op_Equality(t.OffPt, t.OutPt1.Pt) && ee.IntPoint.op_Equality(t.OffPt, t.OutPt2.Pt)) {
            for (o = t.OutPt1.Next; o != n && ee.IntPoint.op_Equality(o.Pt, t.OffPt);) o = o.Next;
            var p = o.Pt.Y > t.OffPt.Y;
            for (s = t.OutPt2.Next; s != r && ee.IntPoint.op_Equality(s.Pt, t.OffPt);) s = s.Next;
            return p != s.Pt.Y > t.OffPt.Y && (p ? (o = this.DupOutPt(n, !1), s = this.DupOutPt(r, !0), n.Prev = r, r.Next = n, o.Next = s, s.Prev = o, t.OutPt1 = n, t.OutPt2 = o, !0) : (o = this.DupOutPt(n, !0), s = this.DupOutPt(r, !1), n.Next = r, r.Prev = n, o.Prev = s, s.Next = o, t.OutPt1 = n, t.OutPt2 = o, !0))
        }
        if (l) {
            for (o = n; n.Prev.Pt.Y == n.Pt.Y && n.Prev != o && n.Prev != r;) n = n.Prev;
            for (; o.Next.Pt.Y == o.Pt.Y && o.Next != n && o.Next != r;) o = o.Next;
            if (o.Next == n || o.Next == r) return !1;
            for (s = r; r.Prev.Pt.Y == r.Pt.Y && r.Prev != s && r.Prev != o;) r = r.Prev;
            for (; s.Next.Pt.Y == s.Pt.Y && s.Next != r && s.Next != n;) s = s.Next;
            if (s.Next == r || s.Next == n) return !1;
            var u = {
                Left: null,
                Right: null
            };
            if (!this.GetOverlap(n.Pt.X, o.Pt.X, r.Pt.X, s.Pt.X, u)) return !1;
            var a, h = u.Left,
                d = u.Right,
                f = new ee.IntPoint;
            return n.Pt.X >= h && n.Pt.X <= d ? (f.X = n.Pt.X, f.Y = n.Pt.Y, a = n.Pt.X > o.Pt.X) : r.Pt.X >= h && r.Pt.X <= d ? (f.X = r.Pt.X, f.Y = r.Pt.Y, a = r.Pt.X > s.Pt.X) : o.Pt.X >= h && o.Pt.X <= d ? (f.X = o.Pt.X, f.Y = o.Pt.Y, a = o.Pt.X > n.Pt.X) : (f.X = s.Pt.X, f.Y = s.Pt.Y, a = s.Pt.X > r.Pt.X), t.OutPt1 = n, t.OutPt2 = r, this.JoinHorz(n, o, r, s, f, a)
        }
        for (o = n.Next; ee.IntPoint.op_Equality(o.Pt, n.Pt) && o != n;) o = o.Next;
        var P = o.Pt.Y > n.Pt.Y || !ee.ClipperBase.SlopesEqual(n.Pt, o.Pt, t.OffPt, this.m_UseFullRange);
        if (P) {
            for (o = n.Prev; ee.IntPoint.op_Equality(o.Pt, n.Pt) && o != n;) o = o.Prev;
            if (o.Pt.Y > n.Pt.Y || !ee.ClipperBase.SlopesEqual(n.Pt, o.Pt, t.OffPt, this.m_UseFullRange)) return !1
        }
        for (s = r.Next; ee.IntPoint.op_Equality(s.Pt, r.Pt) && s != r;) s = s.Next;
        var m = s.Pt.Y > r.Pt.Y || !ee.ClipperBase.SlopesEqual(r.Pt, s.Pt, t.OffPt, this.m_UseFullRange);
        if (m) {
            for (s = r.Prev; ee.IntPoint.op_Equality(s.Pt, r.Pt) && s != r;) s = s.Prev;
            if (s.Pt.Y > r.Pt.Y || !ee.ClipperBase.SlopesEqual(r.Pt, s.Pt, t.OffPt, this.m_UseFullRange)) return !1
        }
        return o != n && s != r && o != s && (e != i || P != m) && (P ? (o = this.DupOutPt(n, !1), s = this.DupOutPt(r, !0), n.Prev = r, r.Next = n, o.Next = s, s.Prev = o, t.OutPt1 = n, t.OutPt2 = o, !0) : (o = this.DupOutPt(n, !0), s = this.DupOutPt(r, !1), n.Next = r, r.Prev = n, o.Prev = s, s.Next = o, t.OutPt1 = n, t.OutPt2 = o, !0))
    }, ee.Clipper.GetBounds = function(t) {
        for (var e = 0, i = t.length; e < i && 0 == t[e].length;) e++;
        if (e == i) return new ee.IntRect(0, 0, 0, 0);
        var n = new ee.IntRect;
        for (n.left = t[e][0].X, n.right = n.left, n.top = t[e][0].Y, n.bottom = n.top; e < i; e++)
            for (var o = 0, r = t[e].length; o < r; o++) t[e][o].X < n.left ? n.left = t[e][o].X : t[e][o].X > n.right && (n.right = t[e][o].X), t[e][o].Y < n.top ? n.top = t[e][o].Y : t[e][o].Y > n.bottom && (n.bottom = t[e][o].Y);
        return n
    }, ee.Clipper.prototype.GetBounds2 = function(t) {
        var e = t,
            i = new ee.IntRect;
        for (i.left = t.Pt.X, i.right = t.Pt.X, i.top = t.Pt.Y, i.bottom = t.Pt.Y, t = t.Next; t != e;) t.Pt.X < i.left && (i.left = t.Pt.X), t.Pt.X > i.right && (i.right = t.Pt.X), t.Pt.Y < i.top && (i.top = t.Pt.Y), t.Pt.Y > i.bottom && (i.bottom = t.Pt.Y), t = t.Next;
        return i
    }, ee.Clipper.PointInPolygon = function(t, e) {
        var i = 0,
            n = e.length;
        if (n < 3) return 0;
        for (var o = e[0], r = 1; r <= n; ++r) {
            var s = r == n ? e[0] : e[r];
            if (s.Y == t.Y && (s.X == t.X || o.Y == t.Y && s.X > t.X == o.X < t.X)) return -1;
            if (o.Y < t.Y != s.Y < t.Y)
                if (o.X >= t.X)
                    if (s.X > t.X) i = 1 - i;
                    else {
                        var l = (o.X - t.X) * (s.Y - t.Y) - (s.X - t.X) * (o.Y - t.Y);
                        if (0 == l) return -1;
                        l > 0 == s.Y > o.Y && (i = 1 - i)
                    }
            else if (s.X > t.X) {
                var l = (o.X - t.X) * (s.Y - t.Y) - (s.X - t.X) * (o.Y - t.Y);
                if (0 == l) return -1;
                l > 0 == s.Y > o.Y && (i = 1 - i)
            }
            o = s
        }
        return i
    }, ee.Clipper.prototype.PointInPolygon = function(t, e) {
        for (var i = 0, n = e;;) {
            var o = e.Pt.X,
                r = e.Pt.Y,
                s = e.Next.Pt.X,
                l = e.Next.Pt.Y;
            if (l == t.Y && (s == t.X || r == t.Y && s > t.X == o < t.X)) return -1;
            if (r < t.Y != l < t.Y)
                if (o >= t.X)
                    if (s > t.X) i = 1 - i;
                    else {
                        var p = (o - t.X) * (l - t.Y) - (s - t.X) * (r - t.Y);
                        if (0 == p) return -1;
                        p > 0 == l > r && (i = 1 - i)
                    }
            else if (s > t.X) {
                var p = (o - t.X) * (l - t.Y) - (s - t.X) * (r - t.Y);
                if (0 == p) return -1;
                p > 0 == l > r && (i = 1 - i)
            }
            if (e = e.Next, n == e) break
        }
        return i
    }, ee.Clipper.prototype.Poly2ContainsPoly1 = function(t, e) {
        var i = t;
        do {
            var n = this.PointInPolygon(i.Pt, e);
            if (n >= 0) return 0 != n;
            i = i.Next
        } while (i != t);
        return !0
    }, ee.Clipper.prototype.FixupFirstLefts1 = function(t, e) {
        for (var i = 0, n = this.m_PolyOuts.length; i < n; i++) {
            var o = this.m_PolyOuts[i];
            null !== o.Pts && o.FirstLeft == t && this.Poly2ContainsPoly1(o.Pts, e.Pts) && (o.FirstLeft = e)
        }
    }, ee.Clipper.prototype.FixupFirstLefts2 = function(t, e) {
        for (var i = 0, n = this.m_PolyOuts, o = n.length, r = n[i]; i < o; i++, r = n[i]) r.FirstLeft == t && (r.FirstLeft = e)
    }, ee.Clipper.ParseFirstLeft = function(t) {
        for (; null != t && null == t.Pts;) t = t.FirstLeft;
        return t
    }, ee.Clipper.prototype.JoinCommonEdges = function() {
        for (var t = 0, e = this.m_Joins.length; t < e; t++) {
            var i = this.m_Joins[t],
                n = this.GetOutRec(i.OutPt1.Idx),
                o = this.GetOutRec(i.OutPt2.Idx);
            if (null != n.Pts && null != o.Pts) {
                var r;
                if (r = n == o ? n : this.Param1RightOfParam2(n, o) ? o : this.Param1RightOfParam2(o, n) ? n : this.GetLowermostRec(n, o), this.JoinPoints(i, n, o))
                    if (n == o) {
                        if (n.Pts = i.OutPt1, n.BottomPt = null, o = this.CreateOutRec(), o.Pts = i.OutPt2, this.UpdateOutPtIdxs(o), this.m_UsingPolyTree)
                            for (var s = 0, l = this.m_PolyOuts.length; s < l - 1; s++) {
                                var p = this.m_PolyOuts[s];
                                null != p.Pts && ee.Clipper.ParseFirstLeft(p.FirstLeft) == n && p.IsHole != n.IsHole && (this.Poly2ContainsPoly1(p.Pts, i.OutPt2) && (p.FirstLeft = o))
                            }
                        this.Poly2ContainsPoly1(o.Pts, n.Pts) ? (o.IsHole = !n.IsHole, o.FirstLeft = n, this.m_UsingPolyTree && this.FixupFirstLefts2(o, n), (o.IsHole ^ this.ReverseSolution) == this.Area(o) > 0 && this.ReversePolyPtLinks(o.Pts)) : this.Poly2ContainsPoly1(n.Pts, o.Pts) ? (o.IsHole = n.IsHole, n.IsHole = !o.IsHole, o.FirstLeft = n.FirstLeft, n.FirstLeft = o, this.m_UsingPolyTree && this.FixupFirstLefts2(n, o), (n.IsHole ^ this.ReverseSolution) == this.Area(n) > 0 && this.ReversePolyPtLinks(n.Pts)) : (o.IsHole = n.IsHole, o.FirstLeft = n.FirstLeft, this.m_UsingPolyTree && this.FixupFirstLefts1(n, o))
                    } else o.Pts = null, o.BottomPt = null, o.Idx = n.Idx, n.IsHole = r.IsHole, r == o && (n.FirstLeft = o.FirstLeft), o.FirstLeft = n, this.m_UsingPolyTree && this.FixupFirstLefts2(o, n)
            }
        }
    }, ee.Clipper.prototype.UpdateOutPtIdxs = function(t) {
        var e = t.Pts;
        do {
            e.Idx = t.Idx, e = e.Prev
        } while (e != t.Pts)
    }, ee.Clipper.prototype.DoSimplePolygons = function() {
        for (var t = 0; t < this.m_PolyOuts.length;) {
            var e = this.m_PolyOuts[t++],
                i = e.Pts;
            if (null !== i)
                do {
                    for (var n = i.Next; n != e.Pts;) {
                        if (ee.IntPoint.op_Equality(i.Pt, n.Pt) && n.Next != i && n.Prev != i) {
                            var o = i.Prev,
                                r = n.Prev;
                            i.Prev = r, r.Next = i, n.Prev = o, o.Next = n, e.Pts = i;
                            var s = this.CreateOutRec();
                            s.Pts = n, this.UpdateOutPtIdxs(s), this.Poly2ContainsPoly1(s.Pts, e.Pts) ? (s.IsHole = !e.IsHole, s.FirstLeft = e) : this.Poly2ContainsPoly1(e.Pts, s.Pts) ? (s.IsHole = e.IsHole, e.IsHole = !s.IsHole, s.FirstLeft = e.FirstLeft, e.FirstLeft = s) : (s.IsHole = e.IsHole, s.FirstLeft = e.FirstLeft), n = i
                        }
                        n = n.Next
                    }
                    i = i.Next
                } while (i != e.Pts)
        }
    }, ee.Clipper.Area = function(t) {
        var e = t.length;
        if (e < 3) return 0;
        for (var i = 0, n = 0, o = e - 1; n < e; ++n) i += (t[o].X + t[n].X) * (t[o].Y - t[n].Y), o = n;
        return .5 * -i
    }, ee.Clipper.prototype.Area = function(t) {
        var e = t.Pts;
        if (null == e) return 0;
        var i = 0;
        do {
            i += (e.Prev.Pt.X + e.Pt.X) * (e.Prev.Pt.Y - e.Pt.Y), e = e.Next
        } while (e != t.Pts);
        return .5 * i
    }, ee.Clipper.SimplifyPolygon = function(t, e) {
        var i = new Array,
            n = new ee.Clipper(0);
        return n.StrictlySimple = !0, n.AddPath(t, ee.PolyType.ptSubject, !0), n.Execute(ee.ClipType.ctUnion, i, e, e), i
    }, ee.Clipper.SimplifyPolygons = function(t, e) {
        void 0 === e && (e = ee.PolyFillType.pftEvenOdd);
        var i = new Array,
            n = new ee.Clipper(0);
        return n.StrictlySimple = !0, n.AddPaths(t, ee.PolyType.ptSubject, !0), n.Execute(ee.ClipType.ctUnion, i, e, e), i
    }, ee.Clipper.DistanceSqrd = function(t, e) {
        var i = t.X - e.X,
            n = t.Y - e.Y;
        return i * i + n * n
    }, ee.Clipper.DistanceFromLineSqrd = function(t, e, i) {
        var n = e.Y - i.Y,
            o = i.X - e.X,
            r = n * e.X + o * e.Y;
        return (r = n * t.X + o * t.Y - r) * r / (n * n + o * o)
    }, ee.Clipper.SlopesNearCollinear = function(t, e, i, n) {
        return ee.Clipper.DistanceFromLineSqrd(e, t, i) < n
    }, ee.Clipper.PointsAreClose = function(t, e, i) {
        var n = t.X - e.X,
            o = t.Y - e.Y;
        return n * n + o * o <= i
    }, ee.Clipper.ExcludeOp = function(t) {
        var e = t.Prev;
        return e.Next = t.Next, t.Next.Prev = e, e.Idx = 0, e
    }, ee.Clipper.CleanPolygon = function(t, e) {
        void 0 === e && (e = 1.415);
        var i = t.length;
        if (0 == i) return new Array;
        for (var n = new Array(i), o = 0; o < i; ++o) n[o] = new ee.OutPt;
        for (var o = 0; o < i; ++o) n[o].Pt = t[o], n[o].Next = n[(o + 1) % i], n[o].Next.Prev = n[o], n[o].Idx = 0;
        for (var r = e * e, s = n[0]; 0 == s.Idx && s.Next != s.Prev;) ee.Clipper.PointsAreClose(s.Pt, s.Prev.Pt, r) ? (s = ee.Clipper.ExcludeOp(s), i--) : ee.Clipper.PointsAreClose(s.Prev.Pt, s.Next.Pt, r) ? (ee.Clipper.ExcludeOp(s.Next), s = ee.Clipper.ExcludeOp(s), i -= 2) : ee.Clipper.SlopesNearCollinear(s.Prev.Pt, s.Pt, s.Next.Pt, r) ? (s = ee.Clipper.ExcludeOp(s), i--) : (s.Idx = 1, s = s.Next);
        i < 3 && (i = 0);
        for (var l = new Array(i), o = 0; o < i; ++o) l[o] = new ee.IntPoint(s.Pt), s = s.Next;
        return n = null, l
    }, ee.Clipper.CleanPolygons = function(t, e) {
        for (var i = new Array(t.length), n = 0, o = t.length; n < o; n++) i[n] = ee.Clipper.CleanPolygon(t[n], e);
        return i
    }, ee.Clipper.Minkowski = function(t, e, i, n) {
        var o = n ? 1 : 0,
            r = t.length,
            s = e.length,
            l = new Array;
        if (i)
            for (var p = 0; p < s; p++) {
                for (var u = new Array(r), a = 0, h = t.length, d = t[a]; a < h; a++, d = t[a]) u[a] = new ee.IntPoint(e[p].X + d.X, e[p].Y + d.Y);
                l.push(u)
            } else
                for (var p = 0; p < s; p++) {
                    for (var u = new Array(r), a = 0, h = t.length, d = t[a]; a < h; a++, d = t[a]) u[a] = new ee.IntPoint(e[p].X - d.X, e[p].Y - d.Y);
                    l.push(u)
                }
        for (var f = new Array, p = 0; p < s - 1 + o; p++)
            for (var a = 0; a < r; a++) {
                var P = new Array;
                P.push(l[p % s][a % r]), P.push(l[(p + 1) % s][a % r]), P.push(l[(p + 1) % s][(a + 1) % r]), P.push(l[p % s][(a + 1) % r]), ee.Clipper.Orientation(P) || P.reverse(), f.push(P)
            }
        var m = new ee.Clipper(0);
        return m.AddPaths(f, ee.PolyType.ptSubject, !0), m.Execute(ee.ClipType.ctUnion, l, ee.PolyFillType.pftNonZero, ee.PolyFillType.pftNonZero), l
    }, ee.Clipper.MinkowskiSum = function() {
        var t = arguments,
            e = t.length;
        if (3 == e) {
            var i = t[0],
                n = t[1],
                o = t[2];
            return ee.Clipper.Minkowski(i, n, !0, o)
        }
        if (4 == e) {
            for (var r, i = t[0], s = t[1], l = t[2], o = t[3], p = new ee.Clipper, u = 0, a = s.length; u < a; ++u) {
                var r = ee.Clipper.Minkowski(i, s[u], !0, o);
                p.AddPaths(r, ee.PolyType.ptSubject, !0)
            }
            o && p.AddPaths(s, ee.PolyType.ptClip, !0);
            var h = new ee.Paths;
            return p.Execute(ee.ClipType.ctUnion, h, l, l), h
        }
    }, ee.Clipper.MinkowskiDiff = function(t, e, i) {
        return ee.Clipper.Minkowski(t, e, !1, i)
    }, ee.Clipper.PolyTreeToPaths = function(t) {
        var e = new Array;
        return ee.Clipper.AddPolyNodeToPaths(t, ee.Clipper.NodeType.ntAny, e), e
    }, ee.Clipper.AddPolyNodeToPaths = function(t, e, i) {
        var n = !0;
        switch (e) {
            case ee.Clipper.NodeType.ntOpen:
                return;
            case ee.Clipper.NodeType.ntClosed:
                n = !t.IsOpen
        }
        t.m_polygon.length > 0 && n && i.push(t.m_polygon);
        for (var o = 0, r = t.Childs(), s = r.length, l = r[o]; o < s; o++, l = r[o]) ee.Clipper.AddPolyNodeToPaths(l, e, i)
    }, ee.Clipper.OpenPathsFromPolyTree = function(t) {
        for (var e = new ee.Paths, i = 0, n = t.ChildCount(); i < n; i++) t.Childs()[i].IsOpen && e.push(t.Childs()[i].m_polygon);
        return e
    }, ee.Clipper.ClosedPathsFromPolyTree = function(t) {
        var e = new ee.Paths;
        return ee.Clipper.AddPolyNodeToPaths(t, ee.Clipper.NodeType.ntClosed, e), e
    }, Pe(ee.Clipper, ee.ClipperBase), ee.Clipper.NodeType = {
        ntAny: 0,
        ntOpen: 1,
        ntClosed: 2
    }, ee.ClipperOffset = function(t, e) {
        void 0 === t && (t = 2), void 0 === e && (e = ee.ClipperOffset.def_arc_tolerance), this.m_destPolys = new ee.Paths, this.m_srcPoly = new ee.Path, this.m_destPoly = new ee.Path, this.m_normals = new Array, this.m_delta = 0, this.m_sinA = 0, this.m_sin = 0, this.m_cos = 0, this.m_miterLim = 0, this.m_StepsPerRad = 0, this.m_lowest = new ee.IntPoint, this.m_polyNodes = new ee.PolyNode, this.MiterLimit = t, this.ArcTolerance = e, this.m_lowest.X = -1
    }, ee.ClipperOffset.two_pi = 6.28318530717959, ee.ClipperOffset.def_arc_tolerance = .25, ee.ClipperOffset.prototype.Clear = function() {
        ee.Clear(this.m_polyNodes.Childs()), this.m_lowest.X = -1
    }, ee.ClipperOffset.Round = ee.Clipper.Round, ee.ClipperOffset.prototype.AddPath = function(t, e, i) {
        var n = t.length - 1;
        if (!(n < 0)) {
            var o = new ee.PolyNode;
            if (o.m_jointype = e, o.m_endtype = i, i == ee.EndType.etClosedLine || i == ee.EndType.etClosedPolygon)
                for (; n > 0 && ee.IntPoint.op_Equality(t[0], t[n]);) n--;
            o.m_polygon.push(t[0]);
            for (var r = 0, s = 0, l = 1; l <= n; l++) ee.IntPoint.op_Inequality(o.m_polygon[r], t[l]) && (r++, o.m_polygon.push(t[l]), (t[l].Y > o.m_polygon[s].Y || t[l].Y == o.m_polygon[s].Y && t[l].X < o.m_polygon[s].X) && (s = r));
            if (!(i == ee.EndType.etClosedPolygon && r < 2 || i != ee.EndType.etClosedPolygon && r < 0) && (this.m_polyNodes.AddChild(o), i == ee.EndType.etClosedPolygon))
                if (this.m_lowest.X < 0) this.m_lowest = new ee.IntPoint(0, s);
                else {
                    var p = this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon[this.m_lowest.Y];
                    (o.m_polygon[s].Y > p.Y || o.m_polygon[s].Y == p.Y && o.m_polygon[s].X < p.X) && (this.m_lowest = new ee.IntPoint(this.m_polyNodes.ChildCount() - 1, s))
                }
        }
    }, ee.ClipperOffset.prototype.AddPaths = function(t, e, i) {
        for (var n = 0, o = t.length; n < o; n++) this.AddPath(t[n], e, i)
    }, ee.ClipperOffset.prototype.FixOrientations = function() {
        if (this.m_lowest.X >= 0 && !ee.Clipper.Orientation(this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon))
            for (var t = 0; t < this.m_polyNodes.ChildCount(); t++) {
                var e = this.m_polyNodes.Childs()[t];
                (e.m_endtype == ee.EndType.etClosedPolygon || e.m_endtype == ee.EndType.etClosedLine && ee.Clipper.Orientation(e.m_polygon)) && e.m_polygon.reverse()
            } else
                for (var t = 0; t < this.m_polyNodes.ChildCount(); t++) {
                    var e = this.m_polyNodes.Childs()[t];
                    e.m_endtype != ee.EndType.etClosedLine || ee.Clipper.Orientation(e.m_polygon) || e.m_polygon.reverse()
                }
    }, ee.ClipperOffset.GetUnitNormal = function(t, e) {
        var i = e.X - t.X,
            n = e.Y - t.Y;
        if (0 == i && 0 == n) return new ee.DoublePoint(0, 0);
        var o = 1 / Math.sqrt(i * i + n * n);
        return i *= o, n *= o, new ee.DoublePoint(n, -i)
    }, ee.ClipperOffset.prototype.DoOffset = function(t) {
        if (this.m_destPolys = new Array, this.m_delta = t, ee.ClipperBase.near_zero(t))
            for (var e = 0; e < this.m_polyNodes.ChildCount(); e++) {
                var i = this.m_polyNodes.Childs()[e];
                i.m_endtype == ee.EndType.etClosedPolygon && this.m_destPolys.push(i.m_polygon)
            } else {
                this.MiterLimit > 2 ? this.m_miterLim = 2 / (this.MiterLimit * this.MiterLimit) : this.m_miterLim = .5;
                var n;
                n = this.ArcTolerance <= 0 ? ee.ClipperOffset.def_arc_tolerance : this.ArcTolerance > Math.abs(t) * ee.ClipperOffset.def_arc_tolerance ? Math.abs(t) * ee.ClipperOffset.def_arc_tolerance : this.ArcTolerance;
                var o = 3.14159265358979 / Math.acos(1 - n / Math.abs(t));
                this.m_sin = Math.sin(ee.ClipperOffset.two_pi / o), this.m_cos = Math.cos(ee.ClipperOffset.two_pi / o), this.m_StepsPerRad = o / ee.ClipperOffset.two_pi, t < 0 && (this.m_sin = -this.m_sin);
                for (var e = 0; e < this.m_polyNodes.ChildCount(); e++) {
                    var i = this.m_polyNodes.Childs()[e];
                    this.m_srcPoly = i.m_polygon;
                    var r = this.m_srcPoly.length;
                    if (!(0 == r || t <= 0 && (r < 3 || i.m_endtype != ee.EndType.etClosedPolygon)))
                        if (this.m_destPoly = new Array, 1 != r) {
                            this.m_normals.length = 0;
                            for (var s = 0; s < r - 1; s++) this.m_normals.push(ee.ClipperOffset.GetUnitNormal(this.m_srcPoly[s], this.m_srcPoly[s + 1]));
                            if (i.m_endtype == ee.EndType.etClosedLine || i.m_endtype == ee.EndType.etClosedPolygon ? this.m_normals.push(ee.ClipperOffset.GetUnitNormal(this.m_srcPoly[r - 1], this.m_srcPoly[0])) : this.m_normals.push(new ee.DoublePoint(this.m_normals[r - 2])), i.m_endtype == ee.EndType.etClosedPolygon) {
                                for (var l = r - 1, s = 0; s < r; s++) l = this.OffsetPoint(s, l, i.m_jointype);
                                this.m_destPolys.push(this.m_destPoly)
                            } else if (i.m_endtype == ee.EndType.etClosedLine) {
                                for (var l = r - 1, s = 0; s < r; s++) l = this.OffsetPoint(s, l, i.m_jointype);
                                this.m_destPolys.push(this.m_destPoly), this.m_destPoly = new Array;
                                for (var p = this.m_normals[r - 1], s = r - 1; s > 0; s--) this.m_normals[s] = new ee.DoublePoint(-this.m_normals[s - 1].X, -this.m_normals[s - 1].Y);
                                this.m_normals[0] = new ee.DoublePoint(-p.X, -p.Y), l = 0;
                                for (var s = r - 1; s >= 0; s--) l = this.OffsetPoint(s, l, i.m_jointype);
                                this.m_destPolys.push(this.m_destPoly)
                            } else {
                                for (var l = 0, s = 1; s < r - 1; ++s) l = this.OffsetPoint(s, l, i.m_jointype);
                                var u;
                                if (i.m_endtype == ee.EndType.etOpenButt) {
                                    var s = r - 1;
                                    u = new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[s].X + this.m_normals[s].X * t), ee.ClipperOffset.Round(this.m_srcPoly[s].Y + this.m_normals[s].Y * t)), this.m_destPoly.push(u), u = new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[s].X - this.m_normals[s].X * t), ee.ClipperOffset.Round(this.m_srcPoly[s].Y - this.m_normals[s].Y * t)), this.m_destPoly.push(u)
                                } else {
                                    var s = r - 1;
                                    l = r - 2, this.m_sinA = 0, this.m_normals[s] = new ee.DoublePoint(-this.m_normals[s].X, -this.m_normals[s].Y), i.m_endtype == ee.EndType.etOpenSquare ? this.DoSquare(s, l) : this.DoRound(s, l)
                                }
                                for (var s = r - 1; s > 0; s--) this.m_normals[s] = new ee.DoublePoint(-this.m_normals[s - 1].X, -this.m_normals[s - 1].Y);
                                this.m_normals[0] = new ee.DoublePoint(-this.m_normals[1].X, -this.m_normals[1].Y), l = r - 1;
                                for (var s = l - 1; s > 0; --s) l = this.OffsetPoint(s, l, i.m_jointype);
                                i.m_endtype == ee.EndType.etOpenButt ? (u = new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[0].X - this.m_normals[0].X * t), ee.ClipperOffset.Round(this.m_srcPoly[0].Y - this.m_normals[0].Y * t)), this.m_destPoly.push(u), u = new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[0].X + this.m_normals[0].X * t), ee.ClipperOffset.Round(this.m_srcPoly[0].Y + this.m_normals[0].Y * t)), this.m_destPoly.push(u)) : (l = 1, this.m_sinA = 0, i.m_endtype == ee.EndType.etOpenSquare ? this.DoSquare(0, 1) : this.DoRound(0, 1)), this.m_destPolys.push(this.m_destPoly)
                            }
                        } else {
                            if (i.m_jointype == ee.JoinType.jtRound)
                                for (var a = 1, h = 0, s = 1; s <= o; s++) {
                                    this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[0].X + a * t), ee.ClipperOffset.Round(this.m_srcPoly[0].Y + h * t)));
                                    var d = a;
                                    a = a * this.m_cos - this.m_sin * h, h = d * this.m_sin + h * this.m_cos
                                } else
                                    for (var a = -1, h = -1, s = 0; s < 4; ++s) this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[0].X + a * t), ee.ClipperOffset.Round(this.m_srcPoly[0].Y + h * t))), a < 0 ? a = 1 : h < 0 ? h = 1 : a = -1;
                            this.m_destPolys.push(this.m_destPoly)
                        }
                }
            }
    }, ee.ClipperOffset.prototype.Execute = function() {
        var t = arguments;
        if (t[0] instanceof ee.PolyTree) {
            var e = t[0],
                i = t[1];
            e.Clear(), this.FixOrientations(), this.DoOffset(i);
            var n = new ee.Clipper(0);
            if (n.AddPaths(this.m_destPolys, ee.PolyType.ptSubject, !0), i > 0) n.Execute(ee.ClipType.ctUnion, e, ee.PolyFillType.pftPositive, ee.PolyFillType.pftPositive);
            else {
                var o = ee.Clipper.GetBounds(this.m_destPolys),
                    r = new ee.Path;
                if (r.push(new ee.IntPoint(o.left - 10, o.bottom + 10)), r.push(new ee.IntPoint(o.right + 10, o.bottom + 10)), r.push(new ee.IntPoint(o.right + 10, o.top - 10)), r.push(new ee.IntPoint(o.left - 10, o.top - 10)), n.AddPath(r, ee.PolyType.ptSubject, !0), n.ReverseSolution = !0, n.Execute(ee.ClipType.ctUnion, e, ee.PolyFillType.pftNegative, ee.PolyFillType.pftNegative), 1 == e.ChildCount() && e.Childs()[0].ChildCount() > 0) {
                    var s = e.Childs()[0];
                    e.Childs()[0] = s.Childs()[0];
                    for (var l = 1; l < s.ChildCount(); l++) e.AddChild(s.Childs()[l])
                } else e.Clear()
            }
        } else {
            var e = t[0],
                i = t[1];
            ee.Clear(e), this.FixOrientations(), this.DoOffset(i);
            var n = new ee.Clipper(0);
            if (n.AddPaths(this.m_destPolys, ee.PolyType.ptSubject, !0), i > 0) n.Execute(ee.ClipType.ctUnion, e, ee.PolyFillType.pftPositive, ee.PolyFillType.pftPositive);
            else {
                var o = ee.Clipper.GetBounds(this.m_destPolys),
                    r = new ee.Path;
                r.push(new ee.IntPoint(o.left - 10, o.bottom + 10)), r.push(new ee.IntPoint(o.right + 10, o.bottom + 10)), r.push(new ee.IntPoint(o.right + 10, o.top - 10)), r.push(new ee.IntPoint(o.left - 10, o.top - 10)), n.AddPath(r, ee.PolyType.ptSubject, !0), n.ReverseSolution = !0, n.Execute(ee.ClipType.ctUnion, e, ee.PolyFillType.pftNegative, ee.PolyFillType.pftNegative), e.length > 0 && e.splice(0, 1)
            }
        }
    }, ee.ClipperOffset.prototype.OffsetPoint = function(t, e, i) {
        if (this.m_sinA = this.m_normals[e].X * this.m_normals[t].Y - this.m_normals[t].X * this.m_normals[e].Y, this.m_sinA < 5e-5 && this.m_sinA > -5e-5) return e;
        if (this.m_sinA > 1 ? this.m_sinA = 1 : this.m_sinA < -1 && (this.m_sinA = -1), this.m_sinA * this.m_delta < 0) this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[e].X * this.m_delta), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[e].Y * this.m_delta))), this.m_destPoly.push(new ee.IntPoint(this.m_srcPoly[t])), this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[t].X * this.m_delta), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[t].Y * this.m_delta)));
        else switch (i) {
            case ee.JoinType.jtMiter:
                var n = this.m_normals[t].X * this.m_normals[e].X + this.m_normals[t].Y * this.m_normals[e].Y + 1;
                n >= this.m_miterLim ? this.DoMiter(t, e, n) : this.DoSquare(t, e);
                break;
            case ee.JoinType.jtSquare:
                this.DoSquare(t, e);
                break;
            case ee.JoinType.jtRound:
                this.DoRound(t, e)
        }
        return e = t
    }, ee.ClipperOffset.prototype.DoSquare = function(t, e) {
        var i = Math.tan(Math.atan2(this.m_sinA, this.m_normals[e].X * this.m_normals[t].X + this.m_normals[e].Y * this.m_normals[t].Y) / 4);
        this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_delta * (this.m_normals[e].X - this.m_normals[e].Y * i)), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_delta * (this.m_normals[e].Y + this.m_normals[e].X * i)))), this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_delta * (this.m_normals[t].X + this.m_normals[t].Y * i)), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_delta * (this.m_normals[t].Y - this.m_normals[t].X * i))))
    }, ee.ClipperOffset.prototype.DoMiter = function(t, e, i) {
        var n = this.m_delta / i;
        this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + (this.m_normals[e].X + this.m_normals[t].X) * n), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + (this.m_normals[e].Y + this.m_normals[t].Y) * n)))
    }, ee.ClipperOffset.prototype.DoRound = function(t, e) {
        for (var i, n = Math.atan2(this.m_sinA, this.m_normals[e].X * this.m_normals[t].X + this.m_normals[e].Y * this.m_normals[t].Y), o = ee.Cast_Int32(ee.ClipperOffset.Round(this.m_StepsPerRad * Math.abs(n))), r = this.m_normals[e].X, s = this.m_normals[e].Y, l = 0; l < o; ++l) this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + r * this.m_delta), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + s * this.m_delta))), i = r, r = r * this.m_cos - this.m_sin * s, s = i * this.m_sin + s * this.m_cos;
        this.m_destPoly.push(new ee.IntPoint(ee.ClipperOffset.Round(this.m_srcPoly[t].X + this.m_normals[t].X * this.m_delta), ee.ClipperOffset.Round(this.m_srcPoly[t].Y + this.m_normals[t].Y * this.m_delta)))
    }, ee.Error = function(t) {
        try {
            throw new Error(t)
        } catch (t) {
            alert(t.message)
        }
    }, ee.JS = {}, ee.JS.AreaOfPolygon = function(t, e) {
        return e || (e = 1), ee.Clipper.Area(t) / (e * e)
    }, ee.JS.AreaOfPolygons = function(t, e) {
        e || (e = 1);
        for (var i = 0, n = 0; n < t.length; n++) i += ee.Clipper.Area(t[n]);
        return i / (e * e)
    }, ee.JS.BoundsOfPath = function(t, e) {
        return ee.JS.BoundsOfPaths([t], e)
    }, ee.JS.BoundsOfPaths = function(t, e) {
        e || (e = 1);
        var i = ee.Clipper.GetBounds(t);
        return i.left /= e, i.bottom /= e, i.right /= e, i.top /= e, i
    }, ee.JS.Clean = function(t, e) {
        if (!(t instanceof Array)) return [];
        var i = t[0] instanceof Array,
            t = ee.JS.Clone(t);
        if ("number" != typeof e || null === e) return ee.Error("Delta is not a number in Clean()."), t;
        if (0 === t.length || 1 == t.length && 0 === t[0].length || e < 0) return t;
        i || (t = [t]);
        for (var n, o, r, s, l, p, u, a = t.length, h = [], d = 0; d < a; d++)
            if (o = t[d], 0 !== (n = o.length))
                if (n < 3) r = o, h.push(r);
                else {
                    for (r = o, s = e * e, l = o[0], p = 1, u = 1; u < n; u++)(o[u].X - l.X) * (o[u].X - l.X) + (o[u].Y - l.Y) * (o[u].Y - l.Y) <= s || (r[p] = o[u], l = o[u], p++);
                    l = o[p - 1], (o[0].X - l.X) * (o[0].X - l.X) + (o[0].Y - l.Y) * (o[0].Y - l.Y) <= s && p--, p < n && r.splice(p, n - p), r.length && h.push(r)
                } return !i && h.length ? h = h[0] : i || 0 !== h.length ? i && 0 === h.length && (h = [
            []
        ]) : h = [], h
    }, ee.JS.Clone = function(t) {
        if (!(t instanceof Array)) return [];
        if (0 === t.length) return [];
        if (1 == t.length && 0 === t[0].length) return [
            []
        ];
        var e = t[0] instanceof Array;
        e || (t = [t]);
        var i, n, o, r, s = t.length,
            l = new Array(s);
        for (n = 0; n < s; n++) {
            for (i = t[n].length, r = new Array(i), o = 0; o < i; o++) r[o] = {
                X: t[n][o].X,
                Y: t[n][o].Y
            };
            l[n] = r
        }
        return e || (l = l[0]), l
    }, ee.JS.Lighten = function(t, e) {
        if (!(t instanceof Array)) return [];
        if ("number" != typeof e || null === e) return ee.Error("Tolerance is not a number in Lighten()."), ee.JS.Clone(t);
        if (0 === t.length || 1 == t.length && 0 === t[0].length || e < 0) return ee.JS.Clone(t);
        t[0] instanceof Array || (t = [t]);
        var i, n, o, r, s, l, p, u, a, h, d, f, P, m, c, y, v = t.length,
            _ = e * e,
            C = [];
        for (i = 0; i < v; i++)
            if (o = t[i], 0 != (l = o.length)) {
                for (r = 0; r < 1e6; r++) {
                    for (s = [], l = o.length, o[l - 1].X != o[0].X || o[l - 1].Y != o[0].Y ? (d = 1, o.push({
                            X: o[0].X,
                            Y: o[0].Y
                        }), l = o.length) : d = 0, h = [], n = 0; n < l - 2; n++) p = o[n], a = o[n + 1], u = o[n + 2], c = p.X, y = p.Y, f = u.X - c, P = u.Y - y, 0 === f && 0 === P || (m = ((a.X - c) * f + (a.Y - y) * P) / (f * f + P * P), m > 1 ? (c = u.X, y = u.Y) : m > 0 && (c += f * m, y += P * m)), f = a.X - c, P = a.Y - y, f * f + P * P <= _ && (h[n + 1] = 1, n++);
                    for (s.push({
                            X: o[0].X,
                            Y: o[0].Y
                        }), n = 1; n < l - 1; n++) h[n] || s.push({
                        X: o[n].X,
                        Y: o[n].Y
                    });
                    if (s.push({
                            X: o[l - 1].X,
                            Y: o[l - 1].Y
                        }), d && o.pop(), !h.length) break;
                    o = s
                }
                l = s.length, s[l - 1].X == s[0].X && s[l - 1].Y == s[0].Y && s.pop(), s.length > 2 && C.push(s)
            } return !t[0] instanceof Array && (C = C[0]), void 0 === C && (C = [
            []
        ]), C
    }, ee.JS.PerimeterOfPath = function(t, e, i) {
        if (void 0 === t) return 0;
        var n, o, r = Math.sqrt,
            s = 0,
            l = 0,
            p = 0,
            u = 0,
            a = 0,
            h = t.length;
        if (h < 2) return 0;
        for (e && (t[h] = t[0], h++); --h;) n = t[h], l = n.X, p = n.Y, o = t[h - 1], u = o.X, a = o.Y, s += r((l - u) * (l - u) + (p - a) * (p - a));
        return e && t.pop(), s / i
    }, ee.JS.PerimeterOfPaths = function(t, e, i) {
        i || (i = 1);
        for (var n = 0, o = 0; o < t.length; o++) n += ee.JS.PerimeterOfPath(t[o], e, i);
        return n
    }, ee.JS.ScaleDownPath = function(t, e) {
        var i, n;
        for (e || (e = 1), i = t.length; i--;) n = t[i], n.X = n.X / e, n.Y = n.Y / e
    }, ee.JS.ScaleDownPaths = function(t, e) {
        var i, n, o;
        Math.round;
        for (e || (e = 1), i = t.length; i--;)
            for (n = t[i].length; n--;) o = t[i][n], o.X = o.X / e, o.Y = o.Y / e
    }, ee.JS.ScaleUpPath = function(t, e) {
        var i, n, o = Math.round;
        for (e || (e = 1), i = t.length; i--;) n = t[i], n.X = o(n.X * e), n.Y = o(n.Y * e)
    }, ee.JS.ScaleUpPaths = function(t, e) {
        var i, n, o, r = Math.round;
        for (e || (e = 1), i = t.length; i--;)
            for (n = t[i].length; n--;) o = t[i][n], o.X = r(o.X * e), o.Y = r(o.Y * e)
    }, ee.ExPolygons = function() {
        return []
    }, ee.ExPolygon = function() {
        this.outer = null, this.holes = null
    }, ee.JS.AddOuterPolyNodeToExPolygons = function(t, e) {
        var i = new ee.ExPolygon;
        i.outer = t.Contour();
        var n = t.Childs(),
            o = n.length;
        i.holes = new Array(o);
        var r, s, l, p, u, a;
        for (l = 0; l < o; l++)
            for (r = n[l], i.holes[l] = r.Contour(), p = 0, u = r.Childs(), a = u.length; p < a; p++) s = u[p], ee.JS.AddOuterPolyNodeToExPolygons(s, e);
        e.push(i)
    }, ee.JS.ExPolygonsToPaths = function(t) {
        var e, i, n, o, r = new ee.Paths;
        for (e = 0, n = t.length; e < n; e++)
            for (r.push(t[e].outer), i = 0, o = t[e].holes.length; i < o; i++) r.push(t[e].holes[i]);
        return r
    }, ee.JS.PolyTreeToExPolygons = function(t) {
        var e, i, n, o, r = new ee.ExPolygons;
        for (i = 0, n = t.Childs(), o = n.length; i < o; i++) e = n[i], ee.JS.AddOuterPolyNodeToExPolygons(e, r);
        return r
    }, t.exports = ee
}, function(t, e) {}, function(t, e, i) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var n = i(0),
        o = function(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }(n),
        r = o.default.Control.extend({
            options: {},
            _layers: {},
            initialize: function(t) {
                o.default.Util.setOptions(this, t), this._layers = {}
            },
            _addLayer: function(t) {
                var e = 15;
                t.options.minZoom && (e = t.options.minZoom), this._layers[t._leaflet_id] = e, this._updateBox(null)
            },
            _removeLayer: function(t) {
                this._layers[t._leaflet_id] = null, this._updateBox(null)
            },
            _getMinZoomLevel: function() {
                var t = -1;
                for (var e in this._layers) null !== this._layers[e] && this._layers[e] > t && (t = this._layers[e]);
                return t
            },
            _updateBox: function(t) {
                var e = this._getMinZoomLevel();
                null !== t && o.default.DomEvent.preventDefault(t), this._container.innerHTML = -1 == e ? this.options.minZoomMessageNoLayer : this.options.minZoomMessage.replace(/CURRENTZOOM/, this._map.getZoom()).replace(/MINZOOMLEVEL/, e), this._map.getZoom() >= e ? this._container.style.display = "none" : this._container.style.display = "block"
            },
            onAdd: function(t) {
                return this._map = t, this._map.zoomIndicator = this, this._container = o.default.DomUtil.create("div", "leaflet-control-minZoomIndicator"), this._map.on("moveend", this._updateBox, this), this._updateBox(null), this._container
            },
            onRemove: function(t) {
                o.default.Control.prototype.onRemove.call(this, t), t.off({
                    moveend: this._updateBox
                }, this), this._map = null
            }
        });
    o.default.Control.MinZoomIndicator = r, e.default = r;
}]);

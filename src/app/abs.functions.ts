// ===================================================================
// Author: Matt Kruse <matt@mattkruse.com>
// WWW: http://www.mattkruse.com/
//
// NOTICE: You may use this code for any purpose, commercial or
// private, without any further permission from the author. You may
// remove this notice from your final code if you wish, however it is
// appreciated by the author if at least my web site address is kept.
//
// You may *NOT* re-distribute this code in any way except through its
// use. That means, you can include it in your product, or your web
// site, or any other form where the code is actually being used. You
// may not put the plain javascript up on your site for download or
// include it in your javascript libraries for download. 
// If you wish to share this code with others, please just point them
// to the URL instead.
// Please DO NOT link directly to my .js files from your site. Copy
// the files to your server and use them there. Thank you.
// ===================================================================

// HISTORY
// ------------------------------------------------------------------
// May 17, 2003: Fixed bug in parseDate() for dates <1970
// March 11, 2003: Added parseDate() function
// March 11, 2003: Added "NNN" formatting option. Doesn't match up
//                 perfectly with SimpleDateFormat formats, but 
//                 backwards-compatability was required.

// ------------------------------------------------------------------
// These functions use the same 'format' strings as the 
// java.text.SimpleDateFormat class, with minor exceptions.
// The format string consists of the following abbreviations:
// 
// Field        | Full Form          | Short Form
// -------------+--------------------+-----------------------
// Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
// Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
//              | NNN (abbr.)        |
// Day of Month | dd (2 digits)      | d (1 or 2 digits)
// Day of Week  | EE (name)          | E (abbr)
// Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
// Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
// Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
// Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
// Minute       | mm (2 digits)      | m (1 or 2 digits)
// Second       | ss (2 digits)      | s (1 or 2 digits)
// AM/PM        | a                  |
//
// NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
// Examples:
//  "MMM d, y" matches: January 01, 2000
//                      Dec 1, 1900
//                      Nov 20, 00
//  "M/d/yy"   matches: 01/20/00
//                      9/2/00
//  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
// ------------------------------------------------------------------

import { Injectable } from '@angular/core';
import { Response, Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs';
import { Observable } from 'rxjs/Observable';
import { HttpClientService } from './http-client';

import * as authGlobals from './auth.globals';
import * as FileSaver from 'file-saver';
import * as d3 from 'd3';
import { ABSDataURI } from './abs.dataUri';

@Injectable()
export class ABSFunctions {

    constructor(private http: HttpClientService, private dataUri: ABSDataURI) {

    }
    private MONTH_NAMES = new Array(
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    private DAY_NAMES = new Array(
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');

    LZ(x) {
        return (x < 0 || x > 9 ? '' : '0') + x;
    }

    isEven(n) {
        return n % 2 == 0;
    }

    isOdd(n) {
        return Math.abs(n % 2) == 1;
    }

    // ------------------------------------------------------------------
    // isDate ( date_string, format_string )
    // Returns true if date string matches format of format string and
    // is a valid date. Else returns false.
    // It is recommended that you trim whitespace around the value before
    // passing it to this function, as whitespace is NOT ignored!
    // ------------------------------------------------------------------

    exportToPng(opts): Promise<any> {

        return new Promise((resolve, reject) => {
            // this is a shitty hack that should probably be embedded in the
            // svg_crowbar function
            const svgEl = d3.select('svg')
                .attr('version', 1.1)
                .attr('xmlns', 'http://www.w3.org/2000/svg');

            // this is the main thing that does the work
            this.svgCrowbar(d3.select(opts.selector).node().children[0], {
                filename: opts.fileName,
                width: $(opts.selector).width(),
                height: $(opts.selector).height(),
                crowbar_el: d3.select('#crowbar-workspace').node(),
                bgColor: '#F0F3F4',
                header: false,
                legendData: opts.legendData,
            }).then(function (result) {
                resolve(result);
            });
        });

    }

    svgCrowbar(svgElm, options) {
        return new Promise((resolve, reject) => {
            // TODO: should probably do some checking to make sure that svgElm is
            // actually a <svg> and throw a friendly error otherwise

            const html = svgElm.outerHTML;
            const filename = options.filename || 'download.png';
            const width = options.width; // TODO: add fallback value based on svg attributes
            const height = options.height; // TODO: add fallback value based on svg attributes
            const crowbar_el = options.crowbar_el; // TODO: element for preparing the canvas element
            const backgroundColor = options.bgColor;
            const addWatermark = false;
            const exportHeader = options.header;
            const headerHeight = (exportHeader) ? 102 : 0;
            const nyaLogo = this.dataUri.uriImages().nyaLogoTrans;
            const chartImage = `data:image/svg+xml;base64, ${btoa(html)}`;

            applyStylesheets(svgElm);

            crowbar_el.innerHTML = (
                '<canvas width="' + (width + 80) + '" height="' + (height + 102) + '"></canvas>'
            );
            const canvas = crowbar_el.querySelector('canvas');
            const context = canvas.getContext('2d');
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, headerHeight, width + 80, (height + 102));


            context.fillStyle = '#F0F3F4';
            context.fillRect(0, 0, (width + 80), 102);

            context.beginPath();
            context.lineWidth = '1';
            context.strokeStyle = '#757575';
            context.rect(0, 0, (width + 80) - 1, 102);
            context.stroke();

            const sources = {
                nyaLogo,
                chartImage,
            };

            let i = 0;

            if (options.legendData) {
                for (const pv of options.legendData) {
                    context.beginPath();
                    const keyX = (width - 50);
                    const keyY = 142 + (i * 15);

                    context.fillStyle = pv['keyColor'];
                    if (pv['type'] === 'S') {
                        context.fillRect(keyX, keyY, 10, 10);
                    } else {
                        context.arc(keyX + 5, keyY + 5, 5, 0, 2 * Math.PI, false);
                        context.fill();
                    }
                    context.fillStyle = '#000000';
                    context.textBaseline = 'top';
                    context.fillText(pv['legendText'], (keyX + 20), keyY);
                    i += 1;
                }
            }


            this.loadImages(sources).then(function (images) {
                context.drawImage(images.nyaLogo, 5, 5, 221, 92);
                context.drawImage(images.chartImage, 0, 102);

                context.beginPath();
                context.lineWidth = '1';
                context.strokeStyle = '#757575';
                context.rect(0, 102, (width + 80) - 1, height);
                context.stroke();


                const canvasdata = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.download = filename;
                a.href = canvasdata;
                a.click();
                $('#crowbar-workspace').empty();
                resolve('Export Complete');
            });

            function applyStylesheets(svgEl) {
                const emptySvg = window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                window.document.body.appendChild(emptySvg);
                const emptySvgDeclarationComputed = getComputedStyle(emptySvg);
                emptySvg.parentNode.removeChild(emptySvg);
                const allElements = traverse(svgEl);
                let i = allElements.length;
                while (i--) {
                    explicitlySetStyle(allElements[i], emptySvgDeclarationComputed);
                }
            }

            function explicitlySetStyle(element, emptySvgDeclarationComputed) {
                const cSSStyleDeclarationComputed = getComputedStyle(element);
                let i, len, key, value;
                let computedStyleStr = '';
                for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
                    key = cSSStyleDeclarationComputed[i];
                    value = cSSStyleDeclarationComputed.getPropertyValue(key);
                    if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
                        computedStyleStr += key + ':' + value + ';';
                    }
                }
                element.setAttribute('style', computedStyleStr);
            }

            function traverse(obj) {
                const tree = [];
                const ignoreElements = {
                    'script': undefined,
                    'defs': undefined,
                };
                tree.push(obj);
                visit(obj);
                function visit(node) {
                    if (node && node.hasChildNodes() && !(node.nodeName.toLowerCase() in ignoreElements)) {
                        let child = node.firstChild;
                        while (child) {
                            if (child.nodeType === 1) {
                                tree.push(child);
                                visit(child);
                            }
                            child = child.nextSibling;
                        }
                    }
                }
                return tree;
            }
        });
    }

    loadImages(sources): Promise<any> {
        const images = {};
        let loadedImages = 0;
        let numImages = 0;
        // get num of sources
        for (const src in sources) {
            numImages++;
        }
        return new Promise((resolve, reject) => {
            for (const src in sources) {
                images[src] = new Image();
                images[src].onload = function () {
                    if (++loadedImages >= numImages) {
                        resolve(images);
                    }
                };
                images[src].src = sources[src];
            }
        });
    }

    isDate(val, format) {
        const date = this.getDateFromFormat(val, format);
        if (date == 0) { return false; } return true;
    }

    // -------------------------------------------------------------------
    // compareDates(date1,date1format,date2,date2format)
    //   Compare two date strings to see which is greater.
    //   Returns:
    //   1 if date1 is greater than date2
    //   0 if date2 is greater than date1 of if they are the same
    //  -1 if either of the dates is in an invalid format
    // -------------------------------------------------------------------

    compareDates(date1, dateformat1, date2, dateformat2) {
        const d1 = this.getDateFromFormat(date1, dateformat1);
        const d2 = this.getDateFromFormat(date2, dateformat2);
        if (d1 == 0 || d2 == 0) {
            return -1;
        } else if (d1 > d2) {
            return 1;
        }
        return 0;
    }

    // ------------------------------------------------------------------
    // formatDate (date_object, format)
    // Returns a date in the output format specified.
    // The format string uses the same abbreviations as in getDateFromFormat()
    // ------------------------------------------------------------------

    formatDate(date: any, format: string) {
        //  console.log(date);
        date = new Date(date);
        // date = Date.parse(date);
        //  console.log(date);
        format = format + '';
        let result = '';
        let i_format = 0;
        let c = '';
        let token = '';
        let y = date.getFullYear() + '';
        const M = date.getMonth() + 1;
        const d = date.getDate();
        const E = date.getDay();
        const H = date.getHours();
        const m = date.getMinutes();
        const s = date.getSeconds();
        let yyyy, yy, MMM, MM, dd, hh, h, mm, ss, ampm, HH, KK, K, kk, k;
        const value = new Object();
        if (y.length < 4) {
            y = '' + (parseInt(y) - 0 + 1900);
        }
        value['y'] = '' + y;
        value['yyyy'] = y;
        value['yy'] = y.substring(2, 4);
        value['M'] = M;
        value['MM'] = this.LZ(M);
        value['MMM'] = this.MONTH_NAMES[M - 1];
        value['NNN'] = this.MONTH_NAMES[M + 11];
        value['d'] = d;
        value['dd'] = this.LZ(d);
        value['E'] = this.DAY_NAMES[E + 7];
        value['EE'] = this.DAY_NAMES[E];
        value['H'] = H;
        value['HH'] = this.LZ(H);
        if (H == 0) {
            value['h'] = 12;
        } else if (H > 12) {
            value['h'] = H - 12;
        } else {
            value['h'] = H;
        }
        value['hh'] = this.LZ(value['h']);
        if (H > 11) {
            value['K'] = H - 12;
        } else {
            value['K'] = H;
        }
        value['k'] = H + 1;
        value['KK'] = this.LZ(value['K']);
        value['kk'] = this.LZ(value['k']);
        if (H > 11) {
            value['a'] = 'PM';
        } else {
            value['a'] = 'AM';
        }
        value['m'] = m;
        value['mm'] = this.LZ(m);
        value['s'] = s;
        value['ss'] = this.LZ(s);
        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = '';
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            if (value[token] != null) {
                result = result + value[token];
            } else {
                result = result + token;
            }
        }
        return result;
    }

    // ------------------------------------------------------------------
    // Utility functions for parsing in getDateFromFormat()
    // ------------------------------------------------------------------
    _isInteger(val) {
        const digits = '1234567890';
        for (let i = 0; i < val.length; i++) {
            if (digits.indexOf(val.charAt(i)) == -1) {
                return false;
            }
        }
        return true;
    }

    _getInt(str, i, minlength, maxlength) {
        for (let x = maxlength; x >= minlength; x--) {
            const token = str.substring(i, i + x);
            if (token.length < minlength) {
                return null;
            }
            if (this._isInteger(token)) {
                return token;
            }
        }
        return null;
    }

    // ------------------------------------------------------------------
    // getDateFromFormat( date_string , format_string )
    //
    // This function takes a date string and a format string. It matches
    // If the date string matches the format string, it returns the 
    // getTime() of the date. If it does not match, it returns 0.
    // ------------------------------------------------------------------

    getDateFromFormat(val, format) {
        val = val + '';
        format = format + '';
        let i_val = 0;
        let i_format = 0;
        let c = ''; let token = '';
        const token2 = '';
        let x, y;
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let date = 1;
        let hh = now.getHours();
        let mm = now.getMinutes();
        let ss = now.getSeconds();
        let ampm = '';
        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = '';
            while ((format.charAt(i_format) == c) && (i_format < format.length)) {
                token += format.charAt(i_format++);
            }
            if (token == 'yyyy' || token == 'yy' || token == 'y') {
                if (token == 'yyyy') {
                    x = 4; y = 4;
                }
                if (token == 'yy') {
                    x = 2; y = 2;
                } if (token == 'y') {
                    x = 2; y = 4;
                }
                year = this._getInt(val, i_val, x, y);
                if (year == null) {
                    return 0;
                }
                i_val += year.toString().length;
                if (year.toString().length == 2) {
                    if (year > 70) {
                        year = 1900 + (year - 0);
                    } else {
                        year = 2000 + (year - 0);
                    }
                }
            } else if (token == 'MMM' || token == 'NNN') {
                month = 0;
                for (let i = 0; i < this.MONTH_NAMES.length; i++) {
                    const month_name = this.MONTH_NAMES[i];
                    if (val.substring(i_val, i_val + month_name.length).toLowerCase() == month_name.toLowerCase()) {
                        if (token == 'MMM' || (token == 'NNN' && i > 11)) {
                            month = i + 1; if (month > 12) {
                                month -= 12;
                            }
                            i_val += month_name.length; break;
                        }
                    }
                }
                if ((month < 1) || (month > 12)) {
                    return 0;
                }
            } else if (token == 'EE' || token == 'E') {
                for (let i = 0; i < this.DAY_NAMES.length; i++) {
                    const day_name = this.DAY_NAMES[i];
                    if (val.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                        i_val += day_name.length;
                        break;
                    }
                }
            } else if (token == 'MM' || token == 'M') {
                month = this._getInt(val, i_val, token.length, 2);
                if (month == null || (month < 1) || (month > 12)) {
                    return 0;
                }
                i_val += month.toString().length;
            } else if (token == 'dd' || token == 'd') {
                date = this._getInt(val, i_val, token.length, 2);
                if (date == null || (date < 1) || (date > 31)) {
                    return 0;
                }
                i_val += date.toString().length;
            } else if (token == 'hh' || token == 'h') {
                hh = this._getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 12)) {
                    return 0;
                }
                i_val += hh.toString().length;
            } else if (token == 'HH' || token == 'H') {
                hh = this._getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 23)) {
                    return 0;
                }
                i_val += hh.toString().length;
            } else if (token == 'KK' || token == 'K') {
                hh = this._getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 0) || (hh > 11)) {
                    return 0;
                }
                i_val += hh.toString().length;
            } else if (token == 'kk' || token == 'k') {
                hh = this._getInt(val, i_val, token.length, 2);
                if (hh == null || (hh < 1) || (hh > 24)) {
                    return 0;
                }
                i_val += hh.toString().length;
                hh--;
            } else if (token == 'mm' || token == 'm') {
                mm = this._getInt(val, i_val, token.length, 2);
                if (mm == null || (mm < 0) || (mm > 59)) {
                    return 0;
                }
                i_val += mm.toString().length;
            } else if (token == 'ss' || token == 's') {
                ss = this._getInt(val, i_val, token.length, 2);
                if (ss == null || (ss < 0) || (ss > 59)) {
                    return 0;
                }
                i_val += ss.toString().length;
            } else if (token == 'a') {
                if (val.substring(i_val, i_val + 2).toLowerCase() == 'am') {
                    ampm = 'AM';
                } else if (val.substring(i_val, i_val + 2).toLowerCase() == 'pm') {
                    ampm = 'PM';
                } else {
                    return 0;
                }
                i_val += 2;
            } else {
                if (val.substring(i_val, i_val + token.length) != token) {
                    return 0;
                } else {
                    i_val += token.length;
                }
            }
        }
        if (i_val != val.length) {
            return 0;
        }
        if (month == 2) {
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
                if (date > 29) {
                    return 0;
                }
            } else {
                if (date > 28) {
                    return 0;
                }
            }
        }
        if ((month == 4) || (month == 6) || (month == 9) || (month == 11)) {
            if (date > 30) {
                return 0;
            }
        }
        if (hh < 12 && ampm == 'PM') {
            hh = hh - 0 + 12;
        } else if (hh > 11 && ampm == 'AM') {
            hh -= 12;
        }
        const newdate = new Date(year, month - 1, date, hh, mm, ss);
        return newdate.getTime();
    }

    // ------------------------------------------------------------------
    // parseDate( date_string [, prefer_euro_format] )
    //
    // This function takes a date string and tries to match it to a
    // number of possible date formats to get the value. It will try to
    // match against the following international formats, in this order:
    // y-M-d   MMM d, y   MMM d,y   y-MMM-d   d-MMM-y  MMM d
    // M/d/y   M-d-y      M.d.y     MMM-d     M/d      M-d
    // d/M/y   d-M-y      d.M.y     d-MMM     d/M      d-M
    // A second argument may be passed to instruct the method to search
    // for formats like d/M/y (european format) before M/d/y (American).
    // Returns a Date object or null if no patterns match.
    // ------------------------------------------------------------------

    parseDate(val) {
        const preferEuro = (arguments.length == 2) ? arguments[1] : false;
        const generalFormats = new Array('y-M-d', 'MMM d, y', 'MMM d,y', 'y-MMM-d', 'd-MMM-y', 'MMM d');
        const monthFirst = new Array('M/d/y', 'M-d-y', 'M.d.y', 'MMM-d', 'M/d', 'M-d');
        const dateFirst = new Array('d/M/y', 'd-M-y', 'd.M.y', 'd-MMM', 'd/M', 'd-M');
        const checkList = new Array('generalFormats', preferEuro ? 'dateFirst' : 'monthFirst', preferEuro ? 'monthFirst' : 'dateFirst');
        let d = null;
        for (let i = 0; i < checkList.length; i++) {
            const l = window[checkList[i]];
            for (let j = 0; j < l.length; j++) {
                d = this.getDateFromFormat(val, l[j]);
                if (d != 0) {
                    return new Date(d);
                }
            }
        } return null;
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    viewDocument(documentRequest): Promise<any> {
        const api = `${authGlobals.apiBase}api/ABS/ViewDocument`;
        const contentType = documentRequest.contentType || 'application/pdf';
        const dr = documentRequest;
        return new Promise((resolve, reject) => {
            this.http.postForBlob(api, dr).subscribe(
                (response) => { // download file
                    const blob = new Blob([response.blob()], { type: contentType });
                    const fn = `${documentRequest.codeValue}.pdf`;
                    FileSaver.saveAs(blob, fn);
                    resolve(fn);
                });
        });
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server Error');
    }

}

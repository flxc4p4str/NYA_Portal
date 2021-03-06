import { ElementOverlayDirective } from './../../elementOverlay.directive';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../data.service';
import { GlobalState } from '../../global.state';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { ABSFunctions } from '../../abs.functions';
import { ABSDataURI } from './../../abs.dataUri';

import { BaThemePreloader, BaThemeSpinner } from '../../theme/services';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

@Component({
  selector: 'nga-ports',
  styleUrls: ['./ports.scss'],
  templateUrl: './ports.html',
})
export class PortsComponent implements OnInit {

  @ViewChild('chartContainer')
  chartContainer: ElementRef;

  @ViewChild('portListContainer')
  portListContainer: ElementRef;

  private xAxis: any;
  private yAxis: any;
  private radius: any;
  private color: any;
  private margin: any;
  private width: any;
  private height: any;
  private svg: any;
  private innerSvg: any;
  private xScale: any;
  private yScale: any;
  private data;
  private zoom: any;
  private legend;
  private gX: any;
  private gY: any;
  private selectedItem;
  private view: any;
  private g: any;
  private group: any;
  private portVendors: any[];

  chartData: any[];
  chartDataFilter: any[];
  errorMessage: any;

showGridLines: boolean = true;

  constructor(private absFunctions: ABSFunctions, private _dataService: DataService
  , private _spinner: BaThemeSpinner, private _state: GlobalState
  , private dataUri: ABSDataURI, private _msg: ToastyService) {
    
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      // console.log('Menu Collapsed',isCollapsed);
      this.resizeChart(isCollapsed);
    });
  }
  ngOnInit() {
    this._spinner.show();

    BaThemePreloader.registerLoader(this._loadData());

  }
  private _loadData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._dataService.getOpenPOsByPort()
        .subscribe(
        x => {
          if (x) {
            this.chartData = x.chartData; 
            this.chartDataFilter = _.orderBy(x.chartDataFilter, ['portCodeOrig', 'whseCode']);
            if (this.chartDataFilter.length) {
              this.selectedItem = this.chartDataFilter[0];
              this.drawChart();
            } else {
              this.selectedItem = null;
            }
          } else {
            this.data = null;
          }
        },
        error => this.errorMessage = <any>error);
    });
  }

  download_png() {
    const that = this;
    this.absFunctions.exportToPng({
      selector: '#chart',
      legendData: this.selectedItem.portVendors,
      fileName: 'Ports.png',
    }).then(function (result) {
      that.downloadComplete(result);
    });
  }
  downloadComplete(msg) {
    this._msg.success(msg);
  }

  drawChart() {

    this.data = this.chartData.filter(d =>
      d.portCodeOrig === this.selectedItem.portCodeOrig
      && d.whseCode === this.selectedItem.whseCode);
    const that = this; 
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetheight;
    const windowAR = window.screen.height / window.screen.width;
    this.margin = { top: 30, right: 60, bottom: 60, left: 70 };
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = (this.width * windowAR) - this.margin.top - this.margin.bottom;
    const cHeight = this.height + this.margin.top + this.margin.bottom;
    const cWidth = this.width + this.margin.left + this.margin.right;
    const dateNow = Date.now() - 0 * 24 * 60 * 60 * 1000; // 0 days ago
    const minX = dateNow;
    const dateNow2 = Date.now() + 180 * 24 * 60 * 60 * 1000; // 6 months ahead
    const maxX = dateNow2; 

    d3.select('#OuterSVG').remove();

    const zoomed = function () {
      that.g.attr('transform', d3.event.transform);
      that.gX.call(that.xAxis.scale(d3.event.transform.rescaleX(that.xScale)));
      that.gY.call(that.yAxis.scale(d3.event.transform.rescaleY(that.yScale)));
      that.applyGridStyles(that.showGridLines);
    };

    this.zoom = d3.zoom()
      .scaleExtent([1 / 2, 10])
      .translateExtent([[-100, -100], [this.width + 90, this.height + 100]])
      .on('zoom', zoomed);

    this.svg = d3.select('#chart')
      .append('svg')
      .attr('id', 'OuterSVG')
      .attr('width', '100%')
      .attr('height', cHeight)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${cWidth} ${cHeight}`)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain([minX, maxX]).nice()
      .clamp(true);

    this.yScale = d3.scaleLog()
      .range([this.height, 0]);

    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickSize(this.height)
      .tickPadding(10);

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .ticks(4, ',d')
      .tickSize(-this.width)
      .tickPadding(5);

    this.view = this.svg.append('rect')
      .attr('class', 'view')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(d3.zoom()
        .scaleExtent([1 / 2, 10])
        .on('zoom', zoomed));

    this.gX = this.svg.append('g')
      .attr('class', 'axis axis--x')
      .call(this.xAxis);

    this.gY = this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(this.yAxis);

    this.radius = d3.scaleSqrt()
      .range([3, 10]);

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip d3-tooltip')
      .style('opacity', 0);


    let vendCodes = {}, i, j;
    const output = [];
    const l = this.data.length;
    j = 0;
    for (i = 0; i < l; i++) {
      const vendCode = this.data[i].vendCode;
      if (!vendCodes[vendCode]) {
        j += 1;
        vendCodes[vendCode] = j;
        if (this.data[i]) {
          output.push({
            'vendCode': vendCode,
            'poCtnsOpn': 0,
            'portCodeOrig': this.data[i].portCodeOrig,
            'whseCode': this.data[i].whseCode,
          });
        }
      } else {
        j = vendCodes[vendCode];
      }
      output[j - 1].poCtnsOpn += this.data[i].poCtnsOpn;
    }

    output.sort(function (a, b) { return b.poCtnsOpn - a.poCtnsOpn; });

    this.displayVendors(output, this.color);

    vendCodes = {};
    for (i = 0; i < output.length; i++) {
      const vendCode = output[i].vendCode;
      vendCodes[vendCode] = true;
    }

    // data pre-processing
    this.data.forEach(function (d: any) {
      d.y = +Number(d['poCtnsOpn']);
      d.r = +Number(d['poQtyOpn']);
      d.x = Date.parse(d.poDateEta);
      d.xa = 0;
      d.ya = 0;
      d.xaa = 0;
      d.yaa = 0;
      d.vendCode2 = vendCodes[d.vendCode] ? d.vendCode : 'OTHER';
    });


    this.data.sort(function (a: any, b: any) { return b.r - a.r; });

    this.yScale.domain(d3.extent(this.data, function (d: any) {
      return d.y;
    })).nice();

    this.radius.domain(d3.extent(this.data, function (d: any) {
      return d.r;
    })).nice();

    this.innerSvg = this.svg.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'inner-svg')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.g = this.innerSvg.append('g');

    this.group = this.g.selectAll('g.bubble') 
      .data(this.data)
      .enter().append('g')
      .attr('class', 'bubble')
      .attr('transform', function (d) {
        const tX = that.xScale(d.x) || 0;
        const tY = that.yScale(d.y) || 0;
        return `translate(${tX},${tY})`;
      });
      this.group.append('circle')
      .attr('r', function (d) { return that.radius(d.r); })
      .style('fill', function (d) {
        return that.color(d['vendCode2']);
      })
      .attr('stroke', 'black');

      this.group.call(
        d3.drag().on('start', function (d: any) {
          d3.select(this).raise().classed('drag-active', true);
          d.xm0 = d3.event.x;
          d.ym0 = d3.event.y;
          d.xm1 = d3.event.x;
          d.ym1 = d3.event.y;
        }) 
        .on('drag', function (d: any) {
          d.xm1 = d3.event.x;
          d.ym1 = d3.event.y;
          d.xa = d.xm1 - d.xm0;
          d.ya = d.ym1 - d.ym0;
        d3.selectAll('.drag-active')
          .attr('transform', function (z: any, k) {
            const tX = that.xScale(z.x) + z.xaa + z.xa;
            const tY = that.yScale(z.y) + z.yaa + z.ya;
            return `translate(${tX},${tY})`;
          });
        }) 
        .on('end', function (d: any) {
          d.xaa = d.xaa + d.xa;
          d.yaa = d.yaa + d.ya;
          d3.select(this).classed('drag-active', false);
        }), 
    );

      this.group
      .on('mouseover', function (d) {
        const pX = d3.event.pageX + 10;
        const pY = d3.event.pageY - 28;
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(that.poTooltip(d))
          .style('left', `${pX}px`)
          .style('top', `${pY}px`);
      })
      .on('mouseout', function (d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });  

    // this.group
    //   .append('text')
    //   .attr('x', function (d) { return that.radius(d.r); })
    //   .attr('alignment-baseline', 'middle')
    //   .text(function (d) {
    //     return d['poOrderNo'];
    //   });

   this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (this.height / 2))
      .attr('y', -35)
      .style('text-anchor', 'middle')
      .attr('class', 'label')
      .text('Cartons');

    this.svg.append('text')
      .attr('x', this.height + 35)
      .attr('y', (this.width / 2))
      .attr('transform', 'translate(0,20)')
      .style('text-anchor', 'middle')
      .attr('class', 'label')
      .text('ETD');

    that.reset();
    this._spinner.hide();
  }
reset() {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
    this.applyGridStyles(this.showGridLines);
  }
   toggleGridLines() {
    this.showGridLines = !this.showGridLines;
    this.applyGridStyles(this.showGridLines);
  }
  applyGridStyles(showLines) {
    setTimeout(function () {
      if (showLines) {
        $('.axis.axis--x g.tick line').show();
        $('.axis.axis--y g.tick line').show();
      } else {
        $('.axis.axis--x g.tick line').hide();
        $('.axis.axis--y g.tick line').hide();
      }
    });
  }
 poTooltip(d) {
    const custCode = d.custCode ? ` ${d.custCode}` : ' (Stock)';
    const tooltipHeader = `<div class="tooltip-header">PO: ${d.poOrderNo} ${custCode}</div>`;

    const tooltipRows = [];

    let tooltipBody = '<div class="tooltip-body">';

    let tooltipRow = `<div class="tooltip-row"><div>Supplier:</div><div class="tooltip-data">${d.vendCode}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>Cartons:</div><div class="tooltip-data">${d.poCtnsOpn}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row">
                  <div>ETA:</div><div class="tooltip-data">
                  ${this.absFunctions.formatDate(d.poDateShipBy, 'MM/dd/yyyy')}</div>
                  </div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>Units:</div><div class="tooltip-data">${d.poQtyOpn}</div></div>`;
    tooltipRows.push(tooltipRow);

    for (const tt of tooltipRows) {
      tooltipBody += tt;
    }
    tooltipBody += `</div>`;
    return `<div class="tooltip-content">${tooltipHeader}${tooltipBody}</div>`;
  }  
  listClick(event, newValue) {
    if (this.selectedItem !== newValue) {
      this.selectedItem = newValue;
      this.drawChart();
    }
  }
  resizeChart(menuCollapsed) {
    const svg = d3.select('#OuterSVG');
    if (svg) {
      const deltaW = (menuCollapsed) ? 250 : -250;
      const chartWidth = $('#OuterSVG').width();
      const chartHeight = $('#OuterSVG').height();
      const newH = ((chartWidth + deltaW) * chartHeight) / chartWidth;
      svg.transition()
        .duration(500)
        .attr('height', newH);
    }
  }
  displayVendors(vendors, vColors) {
    for (const V of vendors) {
      V.keyColor = vColors(V.vendCode);
      V.toolTip = `Cartons: ${V.poCtnsOpn}`;
      V.legendText = V.vendCode;
for (const PW of this.chartDataFilter) {
        if (PW.portCodeOrig === V.portCodeOrig && PW.whseCode === V.whseCode) {
          PW.portVendors = vendors;
          const vc = vendors.length;
          let slideoutHeight = (((this.absFunctions.isEven(vc) ? vc : vc + 1) / 2) * 25) + 10;
          if (slideoutHeight < 40) {
            slideoutHeight = 40;
          }
          PW.slideoutHeight = `${slideoutHeight}px`;
        } else {
          PW.slideoutHeight = '0px';
        }
      }
    }
    const vlHeight = $(window).height() - (100 + $('.page-top').outerHeight()
      + $('.port-list-panel .card-header').outerHeight()
      + $('.li-hr').outerHeight());
    d3.selectAll('.list-scroller')
      .style('max-height', `${vlHeight}px`)
      .style('overflow-y', 'auto')
      .style('overflow-x', 'hidden');
  }

  vlMouseOver(pv) {
    const sel = `.li-vendor.li-vendor-${this.selectedItem.portCodeOrig}-${this.selectedItem.whseCode}-${pv.vendCode}`;
    d3.selectAll('.li-vendor')
      .style('opacity', 0.3);
    d3.select($(sel)[0])
      .style('opacity', 1);

    d3.selectAll('.bubble')
      .style('opacity', 0.3)
      .filter(function (d) { return d['vendCode2'] === pv.vendCode; })
      .style('opacity', 1);
  }
  vlMouseOut(pv) {
    d3.selectAll('.li-vendor')
      .style('opacity', 1);
    d3.selectAll('.bubble')
      .style('opacity', 1);
  }

}
